/**
 * ACIS Utility Functions
 * Helper functions for reading values from chunks
 * Ported from Acis.py lines 132-700
 */

import {
  TAG_TRUE, TAG_FALSE, TAG_UTF8_U8, TAG_DOUBLE, TAG_ENTITY_REF,
  TAG_POSITION, TAG_VECTOR_3D, TAG_ENUM_VALUE, TAG_LONG, TAG_FLOAT,
  TAG_TERMINATOR, TAG_IDENT, TAG_SUBIDENT,
  RANGE, SENSE, SENSEV, SIDES, SIDE, BOOLEAN, CLOSURE, SINGULARITY,
  MIN_INF, MAX_INF, MIN_0, MAX_2PI
} from './constants.js'
import { Range, Interval, BS_Curve, BS_Surface } from './data-classes.js'
import { VEC, V2D } from './math.js'

// ============================================================================
// Reader State (module-level)
// ============================================================================

let _reader = null
let _scale = 1.0
let _version = 7.0

export function getReader() {
  return _reader
}

export function setReader(reader) {
  _reader = reader
}

export function getScale() {
  return _reader ? _reader.scale : _scale
}

export function setScale(s) {
  _scale = s
}

export function getVersion() {
  return _reader ? _reader.version : _version
}

export function setVersion(v) {
  _version = v
}

export function isASM() {
  if (_reader && _reader.header) {
    return _reader.header.asm !== undefined
  }
  return false
}

export function getAsmMajor() {
  if (_reader && _reader.header && _reader.header.asm) {
    return _reader.header.asm[0]
  }
  return 0
}

// ============================================================================
// Basic Value Getters
// ============================================================================

/**
 * Get raw value from chunk at index
 */
export function getValue(chunks, index) {
  const chunk = chunks[index]
  return [chunk.val !== undefined ? chunk.val : chunk.value, index + 1]
}

/**
 * Get entity reference from chunk
 */
export function getRefNode(record, index, expectedName = null) {
  const chunk = record.chunks[index]
  if (chunk.tag === TAG_ENTITY_REF || chunk.type === 'entity_ref') {
    const ref = chunk.record || chunk
    if (expectedName !== null && ref !== null && ref.name && !ref.name.endsWith(expectedName)) {
      // Type mismatch - but don't throw, just warn
      // console.warn(`Expected ${expectedName} but found ${ref.name}`)
    }
    return [ref, index + 1]
  }
  throw new Error(`Chunk at index=${index} is not a reference`)
}

/**
 * Get boolean value from chunk
 */
export function getBoolean(chunks, index) {
  const chunk = chunks[index]
  if (chunk.tag === TAG_UTF8_U8 || chunk.type === 'string') {
    const val = chunk.val || chunk.value
    return [val === 'T', index + 1]
  }
  if (chunk.tag === TAG_TRUE || chunk.value === true) {
    return [true, index + 1]
  }
  if (chunk.tag === TAG_FALSE || chunk.value === false) {
    return [false, index + 1]
  }
  return [!!chunk.val, index + 1]
}

/**
 * Get integer value from chunk
 */
export function getInteger(chunks, index) {
  const [val, i] = getValue(chunks, index)
  return [parseInt(val, 10), i]
}

/**
 * Get multiple integer values
 */
export function getIntegers(chunks, index, count) {
  let i = index
  const arr = []
  for (let n = 0; n < count; n++) {
    const [val, ni] = getInteger(chunks, i)
    arr.push(val)
    i = ni
  }
  return [arr, i]
}

/**
 * Get long integer value
 */
export function getLong(chunks, index) {
  const [val, i] = getValue(chunks, index)
  return [parseInt(val, 10), i]
}

/**
 * Get float value from chunk
 */
export function getFloat(chunks, index) {
  const [val, i] = getValue(chunks, index)
  return [parseFloat(val), i]
}

/**
 * Get multiple float values
 */
export function getFloats(chunks, index, count) {
  let i = index
  const arr = []
  let n = 0
  while (n < count) {
    const chunk = chunks[i]
    i++
    if (chunk.tag === TAG_POSITION || chunk.tag === TAG_VECTOR_3D ||
        chunk.type === 'position' || chunk.type === 'vector3d') {
      const v = chunk.val || chunk.value
      if (v.x !== undefined) {
        arr.push(v.x, v.y, v.z)
        n += 3
      } else if (Array.isArray(v)) {
        arr.push(...v)
        n += v.length
      }
    } else {
      arr.push(parseFloat(chunk.val !== undefined ? chunk.val : chunk.value))
      n++
    }
  }
  return [arr, i]
}

/**
 * Get scaled float values
 */
export function getFloatsScaled(chunks, index, count) {
  const s = getScale()
  let i = index
  const arr = []
  for (let n = 0; n < count; n++) {
    const [f, ni] = getFloat(chunks, i)
    arr.push(f * s)
    i = ni
  }
  return [arr, i]
}

/**
 * Get float array (count followed by floats)
 */
export function getFloatArray(chunks, index) {
  const [n, i1] = getInteger(chunks, index)
  const [arr, i2] = getFloats(chunks, i1, n)
  return [arr, i2]
}

/**
 * Get length value (scaled)
 */
export function getLength(chunks, index) {
  const [l, i] = getFloat(chunks, index)
  return [l * getScale(), i]
}

/**
 * Get text value
 */
export function getText(chunks, index) {
  const chunk = chunks[index]
  if (chunk.tag === TAG_DOUBLE) {
    return getValue(chunks, index + 1)
  }
  return getValue(chunks, index)
}

// ============================================================================
// Enum Getters
// ============================================================================

/**
 * Get enum value by tag
 */
export function getEnumByTag(chunks, index, values) {
  const chunk = chunks[index]
  let val = chunk.val !== undefined ? chunk.val : chunk.value

  if (chunk.tag === TAG_UTF8_U8 || chunk.type === 'string') {
    // Text value - look up in values
    for (const key of Object.keys(values)) {
      if (values[key] === val) {
        return [val, index + 1]
      }
    }
    // Return raw value if not found
    return [val, index + 1]
  }

  if (chunk.tag === TAG_TRUE || chunk.value === true) {
    return [values[TAG_TRUE] || values['T'] || values[1], index + 1]
  }
  if (chunk.tag === TAG_FALSE || chunk.value === false) {
    return [values[TAG_FALSE] || values['F'] || values[0], index + 1]
  }

  // Numeric enum
  if (values[val] !== undefined) {
    return [values[val], index + 1]
  }

  return [val, index + 1]
}

/**
 * Get enum value by value lookup
 */
export function getEnumByValue(chunks, index, values) {
  const chunk = chunks[index]
  const val = chunk.val !== undefined ? chunk.val : chunk.value

  if (values[val] !== undefined) {
    return [values[val], index + 1]
  }
  return [val, index + 1]
}

/**
 * Get sides enum (single/double with optional side)
 */
export function getSides(chunks, index) {
  const [sides, i] = getEnumByTag(chunks, index, SIDES)
  if (sides === 'double') {
    const [side, i2] = getEnumByTag(chunks, i, SIDE)
    return [sides, side, i2]
  }
  return [sides, null, i]
}

/**
 * Get singularity enum
 */
export function getSingularity(chunks, index) {
  if (getVersion() > 4.0) {
    return getEnumByValue(chunks, index, SINGULARITY)
  }
  return ['full', index]
}

// ============================================================================
// Vector/Point Getters
// ============================================================================

/**
 * Get point (3 floats or position chunk)
 */
export function getPoint(chunks, index) {
  const chunk = chunks[index]
  if (chunk.tag === TAG_POSITION || chunk.tag === TAG_VECTOR_3D ||
      chunk.type === 'position' || chunk.type === 'vector3d') {
    const v = chunk.val || chunk.value
    if (v.x !== undefined) {
      return [{ x: v.x, y: v.y, z: v.z }, index + 1]
    }
    return [{ x: v[0], y: v[1], z: v[2] }, index + 1]
  }
  const [x, i1] = getFloat(chunks, index)
  const [y, i2] = getFloat(chunks, i1)
  const [z, i3] = getFloat(chunks, i2)
  return [{ x, y, z }, i3]
}

/**
 * Get vector (point normalized)
 */
export function getVector(chunks, index) {
  return getPoint(chunks, index)
}

/**
 * Get location (scaled point)
 */
export function getLocation(chunks, index) {
  const [p, i] = getPoint(chunks, index)
  const s = getScale()
  return [{ x: p.x * s, y: p.y * s, z: p.z * s }, i]
}

// ============================================================================
// Range/Interval Getters
// ============================================================================

/**
 * Get range value
 */
export function getRange(chunks, index, defaultVal, scale) {
  const [type, i] = getEnumByTag(chunks, index, RANGE)
  let val = defaultVal

  if (type === 'F' || type === TAG_FALSE) {
    const [v, i2] = getFloat(chunks, i)
    return [new Range(type, v, scale), i2]
  } else if (type === 'T') {
    const [arr, i2] = getFloats(chunks, i, 7)
    val = arr[0]
    return [new Range(type, val, scale), i2]
  }

  return [new Range(type, val, scale), i]
}

/**
 * Get interval (lower and upper range)
 */
export function getInterval(chunks, index, defMin, defMax, scale) {
  const [lower, i1] = getRange(chunks, index, defMin, scale)
  const [upper, i2] = getRange(chunks, i1, defMax, scale)
  return [new Interval(lower, upper), i2]
}

// ============================================================================
// Dimension Getters (for curves/surfaces)
// ============================================================================

/**
 * Get curve dimension (nullbs|nurbs|nubs)
 */
export function getDimensionCurve(chunks, index) {
  const [val, i] = getValue(chunks, index)
  if (val === 'nullbs') {
    return [val, 0, i]
  }
  if (val === 'nurbs' || val === 'nubs') {
    const [degrees, i2] = getInteger(chunks, i)
    return [val, degrees, i2]
  }
  throw new Error(`Unknown DIMENSION '${val}'`)
}

/**
 * Get surface dimension (nullbs|nurbs|nubs|summary)
 */
export function getDimensionSurface(chunks, index) {
  const [val, i] = getValue(chunks, index)
  if (val === 'nullbs') {
    return [val, null, null, i]
  }
  if (val === 'nurbs' || val === 'nubs' || val === 'summary') {
    const [degreesU, i2] = getInteger(chunks, i)
    const [degreesV, i3] = getInteger(chunks, i2)
    return [val, degreesU, degreesV, i3]
  }
  throw new Error(`Unknown DIMENSION '${val}'`)
}

// ============================================================================
// Closure Getters
// ============================================================================

/**
 * Get curve closure
 */
export function getClosureCurve(chunks, index) {
  const [closure, i] = getEnumByValue(chunks, index, CLOSURE)
  if (closure === 'open' || closure === 'closed' || closure === 'periodic') {
    const [knots, i2] = getInteger(chunks, i)
    return [closure, knots, i2]
  }
  throw new Error(`Unknown closure '${closure}'`)
}

/**
 * Get surface closure
 */
export function getClosureSurface(chunks, index) {
  let [closureU, i] = getEnumByValue(chunks, index, CLOSURE)

  // Handle optional prefix
  if (closureU === 'both' || closureU === 'u' || closureU === 'v') {
    [closureU, i] = getEnumByValue(chunks, i, CLOSURE)
  }

  if (closureU === 'open' || closureU === 'closed' || closureU === 'periodic') {
    const [closureV, i2] = getEnumByValue(chunks, i, CLOSURE)
    const [singularityU, i3] = getEnumByValue(chunks, i2, SINGULARITY)
    const [singularityV, i4] = getEnumByValue(chunks, i3, SINGULARITY)
    const [countU, i5] = getInteger(chunks, i4)
    const [countV, i6] = getInteger(chunks, i5)
    return [closureU, closureV, singularityU, singularityV, countU, countV, i6]
  }

  throw new Error(`Unknown closure '${closureU}'`)
}

// ============================================================================
// Unknown/Version-specific Getters
// ============================================================================

/**
 * Get unknown FT values (version-specific)
 */
export function getUnknownFT(chunks, index) {
  let i = index
  let val = 'F'
  let arr = []
  let val2 = 'F'

  if (getVersion() > 7.0 && !isASM()) {
    [val, i] = getValue(chunks, i)
    if (val === 'T') {
      [arr, i] = getFloats(chunks, i, 6)
      [val2, i] = getValue(chunks, i)
    }
  }

  return [[val, arr, val2], i]
}

// ============================================================================
// Knot/Mult Readers
// ============================================================================

/**
 * Read knots and multiplicities
 */
export function readKnotsMults(count, chunks, index) {
  const knots = []
  const mults = []
  let i = index

  for (let j = 0; j < count; j++) {
    const [knot, i2] = getFloat(chunks, i)
    const [mult, i3] = getInteger(chunks, i2)
    knots.push(knot)
    mults.push(mult)
    i = i3
  }

  return [knots, mults, i]
}

/**
 * Adjust multiplicities for clamped B-spline
 */
export function adjustMultsKnots(knots, mults, degree) {
  const newMults = [...mults]
  newMults[0] = degree + 1
  newMults[newMults.length - 1] = degree + 1
  return [knots, newMults]
}

// ============================================================================
// Points List Readers
// ============================================================================

/**
 * Read 2D points list for curve
 */
export function readPoints2DList(spline, count, chunks, index) {
  let i
  [spline.uKnots, spline.uMults, i] = readKnotsMults(count, chunks, index)

  const us = spline.uMults.reduce((a, b) => a + b, 0) - (spline.uDegree - 1)
  spline.poles = new Array(us).fill(null)
  spline.weights = spline.rational ? new Array(us).fill(1) : null

  for (let k = 0; k < us; k++) {
    const [u, i2] = getLength(chunks, i)
    const [v, i3] = getLength(chunks, i2)
    spline.poles[k] = new V2D(u, v)
    i = i3
    if (spline.rational) {
      [spline.weights[k], i] = getFloat(chunks, i)
    }
  }

  [spline.uKnots, spline.uMults] = adjustMultsKnots(spline.uKnots, spline.uMults, spline.uDegree)

  return [spline, i]
}

/**
 * Read 3D points list for curve
 */
export function readPoints3DList(spline, count, chunks, index) {
  let i
  [spline.uKnots, spline.uMults, i] = readKnotsMults(count, chunks, index)

  const us = spline.uMults.reduce((a, b) => a + b, 0) - (spline.uDegree - 1)
  spline.poles = new Array(us).fill(null)
  spline.weights = spline.rational ? new Array(us).fill(1) : null

  for (let u = 0; u < us; u++) {
    [spline.poles[u], i] = getLocation(chunks, i)
    if (spline.rational) {
      [spline.weights[u], i] = getFloat(chunks, i)
    }
  }

  [spline.uKnots, spline.uMults] = adjustMultsKnots(spline.uKnots, spline.uMults, spline.uDegree)

  return [spline, i]
}

/**
 * Read 3D points for surface
 */
export function readPoints3DSurface(spline, countU, countV, chunks, index) {
  let i
  [spline.uKnots, spline.uMults, i] = readKnotsMults(countU, chunks, index);
  [spline.vKnots, spline.vMults, i] = readKnotsMults(countV, chunks, i)

  const us = spline.uMults.reduce((a, b) => a + b, 0) - (spline.uDegree - 1)
  const vs = spline.vMults.reduce((a, b) => a + b, 0) - (spline.vDegree - 1)

  spline.poles = Array.from({ length: us }, () => new Array(vs).fill(null))
  spline.weights = spline.rational
    ? Array.from({ length: us }, () => new Array(vs).fill(1))
    : null

  for (let v = 0; v < vs; v++) {
    for (let u = 0; u < us; u++) {
      [spline.poles[u][v], i] = getLocation(chunks, i)
      if (spline.rational) {
        [spline.weights[u][v], i] = getFloat(chunks, i)
      }
    }
  }

  [spline.uKnots, spline.uMults] = adjustMultsKnots(spline.uKnots, spline.uMults, spline.uDegree);
  [spline.vKnots, spline.vMults] = adjustMultsKnots(spline.vKnots, spline.vMults, spline.vDegree)

  return [spline, i]
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if value is a string
 */
export function isString(val) {
  return typeof val === 'string'
}

/**
 * Reshape flat array into 2D array
 */
export function reshape(arr, cols) {
  const result = []
  for (let i = 0; i < arr.length; i += cols) {
    result.push(arr.slice(i, i + cols))
  }
  return result
}
