/**
 * ACIS Spline Functions
 * B-Spline reading and parsing functions
 * Ported from Acis.py lines 584-1000
 */

import {
  TAG_ENTITY_REF, TAG_UTF8_U8, TAG_IDENT, TAG_SUBIDENT,
  TAG_DOUBLE, TAG_POSITION, TAG_VECTOR_3D, SENSE, CLOSURE
} from './constants.js'
import { BS_Curve, BS_Surface } from './data-classes.js'
import {
  getValue, getBoolean, getInteger, getFloat, getFloats, getFloatArray,
  getLength, getText, getEnumByValue, getEnumByTag, getPoint,
  getDimensionCurve, getDimensionSurface, getClosureCurve, getClosureSurface,
  readKnotsMults, adjustMultsKnots,
  readPoints2DList, readPoints3DList, readPoints3DSurface,
  getVersion, isASM, getScale
} from './utils.js'

// ============================================================================
// Curve and Surface Class Mappings (set via setters to avoid circular deps)
// ============================================================================

let CURVES = null
let SURFACES = null

/**
 * Set the curve classes mapping (called from index.js after all modules loaded)
 */
export function setCurveClasses(mapping) {
  CURVES = mapping
}

/**
 * Set the surface classes mapping (called from index.js after all modules loaded)
 */
export function setSurfaceClasses(mapping) {
  SURFACES = mapping
}

// ============================================================================
// B-Spline Curve Readers
// ============================================================================

/**
 * Read 2D B-spline curve (parameter space curve)
 */
export function readBS2Curve(chunks, index) {
  const [dimension, degree, i1] = getDimensionCurve(chunks, index)

  if (dimension === 'nullbs') {
    return [null, i1]
  }

  const rational = dimension === 'nurbs'
  const spline = new BS_Curve(rational, false, degree)

  const [closure, count, i2] = getClosureCurve(chunks, i1)
  spline.uPeriodic = closure === 'periodic'

  const [resultSpline, i3] = readPoints2DList(spline, count, chunks, i2)

  return [resultSpline, i3]
}

/**
 * Read 3D B-spline curve
 */
export function readBS3Curve(chunks, index) {
  const [dimension, degree, i1] = getDimensionCurve(chunks, index)

  if (dimension === 'nullbs') {
    return [null, i1]
  }

  const rational = dimension === 'nurbs'
  const spline = new BS_Curve(rational, false, degree)

  const [closure, count, i2] = getClosureCurve(chunks, i1)
  spline.uPeriodic = closure === 'periodic'

  const [resultSpline, i3] = readPoints3DList(spline, count, chunks, i2)

  return [resultSpline, i3]
}

/**
 * Read B-spline surface
 */
export function readBS3Surface(chunks, index) {
  const [dimension, degreeU, degreeV, i1] = getDimensionSurface(chunks, index)

  if (dimension === 'nullbs') {
    return [null, i1]
  }

  const rational = dimension === 'nurbs'
  const spline = new BS_Surface(rational, false, false, degreeU, degreeV)

  const [closureU, closureV, singU, singV, countU, countV, i2] = getClosureSurface(chunks, i1)
  spline.uPeriodic = closureU === 'periodic'
  spline.vPeriodic = closureV === 'periodic'

  const [resultSpline, i3] = readPoints3DSurface(spline, countU, countV, chunks, i2)

  return [resultSpline, i3]
}

// ============================================================================
// Spline Surface Reader (with tolerance)
// ============================================================================

/**
 * Read spline surface with tolerance
 */
export function readSplineSurface(chunks, index, toleranceAtEnd) {
  let tolerance = 0.0
  let i = index

  if (!toleranceAtEnd) {
    ;[tolerance, i] = getLength(chunks, i)
  }

  const [spline, i2] = readBS3Surface(chunks, i)

  if (toleranceAtEnd && spline !== null) {
    ;[tolerance, i] = getLength(chunks, i2)
    return [spline, tolerance, i]
  }

  return [spline, tolerance, i2]
}

// ============================================================================
// Curve Factory (Python readCurve lines 684-693)
// ============================================================================

/**
 * Read embedded curve definition
 * Creates a curve instance and parses its subtype data
 */
export function readCurve(chunks, index) {
  const [val, i] = getValue(chunks, index)

  // Null curve check
  if (val === 'null_curve' || val === 'nullbs' || val === 'null_pcurve') {
    return [null, i]
  }

  // If we don't have the curve mappings yet (before initialization), return stub
  if (!CURVES) {
    console.warn(`readCurve: CURVES mapping not initialized, returning stub for '${val}'`)
    return [{ type: val, index: i }, i]
  }

  // Get the curve class
  const CurveClass = CURVES[val]
  if (CurveClass === undefined) {
    console.warn(`readCurve: Unknown curve type '${val}'`)
    return [{ type: val, index: i }, i]
  }

  // Null mapping means null curve
  if (CurveClass === null) {
    return [null, i]
  }

  try {
    // Create instance and parse subtype
    const curve = new CurveClass()
    curve.subtype = val
    const newIndex = curve.setSubtype(chunks, i)
    return [curve, newIndex]
  } catch (e) {
    console.error(`readCurve: Error parsing curve type '${val}':`, e)
    throw new Error(`Unknown curve-type '${val}'!`)
  }
}

// ============================================================================
// Surface Factory (Python readSurface lines 695-715)
// ============================================================================

/**
 * Read embedded surface definition
 * Creates a surface instance and parses its subtype data
 */
export function readSurface(chunks, index) {
  const chunk = chunks[index]
  let i = index + 1
  const subtype = chunk.val || chunk.value

  // Check tag type for valid surface
  if (chunk.tag === TAG_UTF8_U8 || chunk.tag === TAG_IDENT || chunk.tag === TAG_SUBIDENT) {
    // Null surface check
    if (subtype === 'null_surface' || subtype === 'nullbs') {
      return [null, i]
    }

    // If we don't have the surface mappings yet (before initialization), return stub
    if (!SURFACES) {
      console.warn(`readSurface: SURFACES mapping not initialized, returning stub for '${subtype}'`)
      return [{ type: subtype, index: i }, i]
    }

    // Get the surface class
    const SurfaceClass = SURFACES[subtype]
    if (SurfaceClass === undefined) {
      console.warn(`readSurface: Unknown surface type '${subtype}'`)
      return [{ type: subtype, index: i }, i]
    }

    // Null mapping means null surface
    if (SurfaceClass === null) {
      return [null, i]
    }

    try {
      // Create instance and parse subtype
      const surface = new SurfaceClass()
      surface.subtype = subtype
      const newIndex = surface.setSubtype(chunks, i)
      return [surface, newIndex]
    } catch (e) {
      console.error(`readSurface: Error parsing surface type '${subtype}':`, e)
      throw new Error(`Unknown surface-type '${subtype}'!`)
    }
  }

  // FIXME: this is a dirty hack from Python (lines 709-715)
  if (chunk.tag === TAG_DOUBLE) {
    const [a, i2] = getFloats(chunks, index, 5)
    return [null, i2]
  }
  if (chunk.tag === TAG_POSITION || chunk.tag === TAG_VECTOR_3D) {
    const [a, i2] = getFloats(chunks, i, 2)
    return [null, i2]
  }

  return [null, i]
}

// ============================================================================
// Law Reader (Python readLaw lines 659-677)
// ============================================================================

// Transform class reference (set via setter to avoid circular deps)
let TransformClass = null

/**
 * Set the Transform class (called from index.js after all modules loaded)
 */
export function setTransformClass(cls) {
  TransformClass = cls
}

/**
 * Read law (readLaw in Python lines 659-677)
 * Handles special cases: TRANS, EDGE, SPLINE_LAW, plus formula expressions
 */
export function readLaw(chunks, index) {
  const [name, i1] = getText(chunks, index)

  // Null law
  if (name === 'null_law') {
    return [[name, null], i1]
  }

  // Special law types (Python lines 661-676)
  if (name === 'TRANS') {
    // Transform law: parse a Transform inline
    if (!TransformClass) {
      console.warn('readLaw: TransformClass not initialized for TRANS type')
      return [[name, null], i1]
    }
    const transform = new TransformClass()
    const i2 = transform.setBulk(chunks, i1)
    return [[name, transform], i2]
  }

  if (name === 'EDGE') {
    // Edge law: curve + 2 floats (parameter range)
    const [curve, i2] = readCurve(chunks, i1)
    const [floats, i3] = getFloats(chunks, i2, 2)
    return [[name, curve, floats], i3]
  }

  if (name === 'SPLINE_LAW') {
    // Spline law: integer + 2 float arrays + point
    const [a, i2] = getInteger(chunks, i1)
    const [b, i3] = getFloatArray(chunks, i2)
    const [c, i4] = getFloatArray(chunks, i3)
    const [d, i5] = getPoint(chunks, i4)
    return [[name, a, b, c, d], i5]
  }

  // Read sub-laws based on type (formula expressions)
  const subLaws = []
  let i = i1

  // Different law types have different data
  switch (name) {
    case 'vec':
    case 'vector': {
      // Vector law: 3 sub-laws for x, y, z
      for (let k = 0; k < 3; k++) {
        const [subLaw, i2] = readLaw(chunks, i)
        subLaws.push(subLaw)
        i = i2
      }
      break
    }

    case 'add':
    case 'sub':
    case 'mult':
    case 'div':
    case 'cross':
    case 'dot': {
      // Binary operators: 2 sub-laws
      const [law1, i2] = readLaw(chunks, i)
      const [law2, i3] = readLaw(chunks, i2)
      subLaws.push(law1, law2)
      i = i3
      break
    }

    case 'neg':
    case 'norm':
    case 'size':
    case 'cos':
    case 'sin':
    case 'tan':
    case 'exp':
    case 'ln':
    case 'sqrt': {
      // Unary operators: 1 sub-law
      const [subLaw, i2] = readLaw(chunks, i)
      subLaws.push(subLaw)
      i = i2
      break
    }

    case 'const':
    case 'constant': {
      // Constant value
      const [val, i2] = getFloat(chunks, i)
      subLaws.push(val)
      i = i2
      break
    }

    case 'identity':
    case 'X': {
      // Identity/variable - no sub-laws
      break
    }

    default:
      // Unknown law type - return as Law object (Python line 677)
      // Just return the name, caller can handle unknown types
      console.warn(`Unknown law type: ${name}`)
  }

  return [[name, subLaws], i]
}

// ============================================================================
// Formula Reader (Python readFormula lines 1063-1072)
// ============================================================================

/**
 * Read formula (Python lines 1063-1072)
 * Reads formula name + count + array of laws
 */
export function readFormula(chunks, index) {
  const [frml, i1] = getValue(chunks, index)

  // Null law
  if (frml === 'null_law') {
    return [[null, []], i1]
  }

  // Read count of sub-laws
  const [n, i2] = getInteger(chunks, i1)

  // Read n laws
  const vars = []
  let i = i2
  for (let k = 0; k < n; k++) {
    const [v, i3] = readLaw(chunks, i)
    vars.push(v)
    i = i3
  }

  return [[frml, vars], i]
}

// ============================================================================
// Blend Reader (Python lines 651-657)
// ============================================================================

/**
 * Read blend data - B-spline curve with sense and factor
 */
export function readBlend(chunks, index) {
  const [nubs, i] = readBS2Curve(chunks, index)
  if (nubs !== null) {
    let i2 = i
    ;[nubs.sense, i2] = getEnumByTag(chunks, i2, SENSE)
    ;[nubs.factor, i2] = getFloat(chunks, i2)
    return [nubs, i2]
  }
  return [null, index]
}

// ============================================================================
// Loft Subdata Reader
// ============================================================================

/**
 * Read loft section subdata
 */
export function readLofSubdata(chunks, index) {
  let i = index
  const [type, i1] = getInteger(chunks, i)
  i = i1

  const [n, i2] = getInteger(chunks, i)
  i = i2

  const [m, i3] = getInteger(chunks, i)
  i = i3

  const v = []
  for (let k = 0; k < m; k++) {
    const [val, i4] = getFloat(chunks, i)
    v.push(val)
    i = i4
  }

  return [[type, n, m, v], i]
}

// ============================================================================
// Discontinuity Info Reader (Python lines 717-728)
// ============================================================================

/**
 * Read discontinuity info - 6 float arrays + optional boolean
 */
export function getDiscontinuityInfo(chunks, index, inventor) {
  let i = index

  // Read 6 float arrays
  const [a1, i1] = getFloatArray(chunks, i)
  const [a2, i2] = getFloatArray(chunks, i1)
  const [a3, i3] = getFloatArray(chunks, i2)
  const [a4, i4] = getFloatArray(chunks, i3)
  const [a5, i5] = getFloatArray(chunks, i4)
  const [a6, i6] = getFloatArray(chunks, i5)

  let e = false
  let finalIndex = i6

  if (inventor) {
    ;[e, finalIndex] = getBoolean(chunks, i6)
  }

  return [[a1, a2, a3, a4, a5, a6, e], finalIndex]
}
