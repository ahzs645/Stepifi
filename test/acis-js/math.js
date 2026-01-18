/**
 * ACIS Math Functions
 * Math wrapper functions and Law evaluation
 * Ported from Acis.py lines 201-280
 */

// ============================================================================
// Trigonometric Functions (uppercase for Law evaluation)
// ============================================================================

export const COS = (x) => Math.cos(x)
export const COSH = (x) => Math.cosh(x)
export const COT = (x) => Math.cos(x) / Math.sin(x)
export const COTH = (x) => Math.cosh(x) / Math.sinh(x)
export const CSC = (x) => 1 / Math.sin(x)
export const CSCH = (x) => 1 / Math.sinh(x)
export const SEC = (x) => 1 / Math.cos(x)
export const SECH = (x) => 1 / Math.cosh(x)
export const SIN = (x) => Math.sin(x)
export const SINH = (x) => Math.sinh(x)
export const TAN = (x) => Math.tan(x)
export const TANH = (x) => Math.tanh(x)

export const ARCCOS = (x) => Math.acos(x)
export const ARCCOSH = (x) => Math.acosh(x)
export const ARCOT = (x) => Math.PI / 2 - Math.atan(x)
export const ARCOTH = (x) => 0.5 * Math.log((x + 1) / (x - 1))
export const ARCCSC = (x) => Math.asin(1 / x)
export const ARCCSCH = (x) => Math.log((1 + Math.sqrt(1 + x * x)) / x)
export const ARCSEC = (x) => Math.acos(1 / x)
export const ARCSECH = (x) => Math.log((1 + Math.sqrt(1 - x * x)) / x)
export const ARCSIN = (x) => Math.asin(x)
export const ARCSINH = (x) => Math.asinh(x)
export const ARCTAN = (x) => Math.atan(x)
export const ARCTANH = (x) => Math.atanh(x)

// ============================================================================
// General Math Functions
// ============================================================================

export const ABS = (x) => Math.abs(x)
export const EXP = (x) => Math.exp(x)
export const LN = (x) => Math.log(x)
export const LOG = (x) => Math.log10(x)
export const SQRT = (x) => Math.sqrt(x)
export const MIN = (...args) => Math.min(...args)
export const MAX = (...args) => Math.max(...args)

// ============================================================================
// Vector Functions
// ============================================================================

/**
 * Create a 3D vector
 */
export function VEC(x, y, z) {
  return { x, y, z }
}

/**
 * Normalize a vector
 */
export function NORM(v) {
  const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
  if (len < 1e-10) return { x: 0, y: 0, z: 0 }
  return { x: v.x / len, y: v.y / len, z: v.z / len }
}

/**
 * Cross product of two vectors
 */
export function CROSS(v1, v2) {
  return {
    x: v1.y * v2.z - v1.z * v2.y,
    y: v1.z * v2.x - v1.x * v2.z,
    z: v1.x * v2.y - v1.y * v2.x
  }
}

/**
 * Dot product of two vectors
 */
export function DOT(v1, v2) {
  return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z
}

/**
 * Vector length/magnitude
 */
export function SIZE(v) {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
}

/**
 * Get element from vector by index (0=x, 1=y, 2=z)
 */
export function TERM(v, n) {
  if (n === 0) return v.x
  if (n === 1) return v.y
  if (n === 2) return v.z
  return 0
}

/**
 * Sign function: returns 1 for positive, -1 for negative, 0 for zero
 */
export function SET(x) {
  if (x > 0.0) return 1
  if (x < 0.0) return -1
  return 0
}

export const SIGN = SET

/**
 * Scale a vector
 */
export function scaleVec(v, s) {
  return { x: v.x * s, y: v.y * s, z: v.z * s }
}

/**
 * Add two vectors
 */
export function addVec(v1, v2) {
  return { x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z }
}

/**
 * Subtract two vectors
 */
export function subVec(v1, v2) {
  return { x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z }
}

/**
 * Calculate angle between two vectors (in radians)
 */
export function angleBetween(v1, v2) {
  const d = DOT(v1, v2)
  const len1 = SIZE(v1)
  const len2 = SIZE(v2)
  if (len1 < 1e-10 || len2 < 1e-10) return 0
  return Math.acos(Math.max(-1, Math.min(1, d / (len1 * len2))))
}

/**
 * Convert radians to degrees
 */
export function degrees(rad) {
  return rad * 180 / Math.PI
}

/**
 * Convert degrees to radians
 */
export function radians(deg) {
  return deg * Math.PI / 180
}

// ============================================================================
// Comparison Utilities
// ============================================================================

const EPSILON = 1e-10

/**
 * Check if two floats are approximately equal
 */
export function isEqual1D(a, b, tol = EPSILON) {
  return Math.abs(a - b) < tol
}

/**
 * Check if two vectors are approximately equal
 */
export function isEqual(v1, v2, tol = EPSILON) {
  return isEqual1D(v1.x, v2.x, tol) &&
         isEqual1D(v1.y, v2.y, tol) &&
         isEqual1D(v1.z, v2.z, tol)
}

// ============================================================================
// Matrix Operations (4x4 transformation matrix)
// ============================================================================

/**
 * Create identity 4x4 matrix
 */
export function identityMatrix() {
  return [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ]
}

/**
 * Multiply 4x4 matrix by point (returns transformed point)
 */
export function transformPoint(matrix, point) {
  const x = matrix[0][0] * point.x + matrix[0][1] * point.y + matrix[0][2] * point.z + matrix[0][3]
  const y = matrix[1][0] * point.x + matrix[1][1] * point.y + matrix[1][2] * point.z + matrix[1][3]
  const z = matrix[2][0] * point.x + matrix[2][1] * point.y + matrix[2][2] * point.z + matrix[2][3]
  const w = matrix[3][0] * point.x + matrix[3][1] * point.y + matrix[3][2] * point.z + matrix[3][3]
  if (Math.abs(w) > 1e-10 && Math.abs(w - 1) > 1e-10) {
    return { x: x / w, y: y / w, z: z / w }
  }
  return { x, y, z }
}

/**
 * Multiply 4x4 matrix by direction (ignores translation)
 */
export function transformDirection(matrix, dir) {
  return {
    x: matrix[0][0] * dir.x + matrix[0][1] * dir.y + matrix[0][2] * dir.z,
    y: matrix[1][0] * dir.x + matrix[1][1] * dir.y + matrix[1][2] * dir.z,
    z: matrix[2][0] * dir.x + matrix[2][1] * dir.y + matrix[2][2] * dir.z
  }
}

// ============================================================================
// Law Class (for evaluating ACIS law expressions)
// ============================================================================

/**
 * Law class for evaluating mathematical expressions
 * Laws can include trigonometric functions, vector operations, etc.
 */
export class Law {
  constructor(eq) {
    // Convert ^ into ** for JavaScript evaluation
    this.eq = eq.replace(/\^/g, '**')
  }

  /**
   * Evaluate the law with given variable X
   * @param {object|number} X - The variable to substitute
   * @returns {*} The evaluated result
   */
  evaluate(X) {
    try {
      // Create evaluation context with all math functions
      const context = {
        X,
        e: Math.E,
        pi: Math.PI,
        COS, COSH, COT, COTH, CSC, CSCH, SEC, SECH, SIN, SINH, TAN, TANH,
        ARCCOS, ARCCOSH, ARCOT, ARCOTH, ARCCSC, ARCCSCH, ARCSEC, ARCSECH,
        ARCSIN, ARCSINH, ARCTAN, ARCTANH,
        ABS, EXP, LN, LOG, SQRT, MIN, MAX,
        VEC, NORM, CROSS, DOT, SIZE, TERM, SET, SIGN
      }

      // Build function with context
      const fn = new Function(...Object.keys(context), `return ${this.eq}`)
      return fn(...Object.values(context))
    } catch (e) {
      console.warn(`Can't evaluate law '${this.eq}':`, e.message)
      return null
    }
  }
}

// ============================================================================
// Vector to SAT text format
// ============================================================================

export function vec2sat(v) {
  return `${v.x} ${v.y} ${v.z}`
}

// ============================================================================
// 2D Vector class
// ============================================================================

export class V2D {
  constructor(u, v) {
    this.u = u
    this.v = v
  }
}
