/**
 * ACIS Spline Functions
 * B-Spline reading and parsing functions
 * Ported from Acis.py lines 584-1000
 */

import { CLOSURE } from './constants.js'
import { BS_Curve, BS_Surface } from './data-classes.js'
import {
  getValue, getBoolean, getInteger, getFloat, getFloats, getFloatArray,
  getLength, getText, getEnumByValue,
  getDimensionCurve, getDimensionSurface, getClosureCurve, getClosureSurface,
  readKnotsMults, adjustMultsKnots,
  readPoints2DList, readPoints3DList, readPoints3DSurface,
  getVersion, isASM, getScale
} from './utils.js'

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
// Curve Factory
// ============================================================================

/**
 * Read embedded curve definition
 */
export function readCurve(chunks, index) {
  const chunk = chunks[index]
  const val = chunk.val || chunk.value

  if (val === 'null_curve' || val === 'nullbs') {
    return [null, index + 1]
  }

  // Handle different curve types
  // This would return curve data structure
  return [{ type: val, index }, index + 1]
}

// ============================================================================
// Surface Factory
// ============================================================================

/**
 * Read embedded surface definition
 */
export function readSurface(chunks, index) {
  const chunk = chunks[index]
  const val = chunk.val || chunk.value

  if (val === 'null_surface' || val === 'nullbs') {
    return [null, index + 1]
  }

  // Handle different surface types
  return [{ type: val, index }, index + 1]
}

// ============================================================================
// Law/Formula Reader
// ============================================================================

/**
 * Read law formula
 */
export function readFormula(chunks, index) {
  const [name, i1] = getText(chunks, index)

  if (name === 'null_law') {
    return [[name, []], i1]
  }

  // Read sub-laws based on type
  const subLaws = []
  let i = i1

  // Different law types have different data
  switch (name) {
    case 'vec':
    case 'vector': {
      // Vector law: 3 sub-laws for x, y, z
      for (let k = 0; k < 3; k++) {
        const [subLaw, i2] = readFormula(chunks, i)
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
      const [law1, i2] = readFormula(chunks, i)
      const [law2, i3] = readFormula(chunks, i2)
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
      const [subLaw, i2] = readFormula(chunks, i)
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
      // Unknown law type - try to continue
      console.warn(`Unknown law type: ${name}`)
  }

  return [[name, subLaws], i]
}

// ============================================================================
// Blend Reader
// ============================================================================

/**
 * Read blend data
 */
export function readBlend(chunks, index) {
  const [type, i1] = getText(chunks, index)
  let i = i1

  const blend = { type }

  // Read blend-specific data based on type
  switch (type) {
    case 'rb_blend':
    case 'rolling_ball': {
      ;[blend.radius, i] = getLength(chunks, i)
      break
    }

    case 'var_blend':
    case 'variable': {
      ;[blend.startRadius, i] = getLength(chunks, i)
      ;[blend.endRadius, i] = getLength(chunks, i)
      break
    }

    case 'chamfer': {
      ;[blend.distance, i] = getLength(chunks, i)
      break
    }
  }

  return [blend, i]
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
// Discontinuity Info Reader
// ============================================================================

/**
 * Read discontinuity info (version-specific)
 */
export function getDiscontinuityInfo(chunks, index, inventor) {
  let i = index
  const info = []

  if (getVersion() >= 2.0) {
    // Read 3 float arrays for discontinuity info
    for (let k = 0; k < 3; k++) {
      const [arr, i2] = getFloatArray(chunks, i)
      info.push(arr)
      i = i2
    }
  }

  return [info, i]
}
