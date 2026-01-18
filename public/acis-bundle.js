/**
 * ACIS Parser Bundle
 * Auto-generated from acis-js modules
 * For use with Web Workers via importScripts()
 */

;(function(global) {
  'use strict'

  // ============================================================================
  // constants.js
  // ============================================================================

/**
 * ACIS Constants
 * Binary format tags and enum mappings
 * Ported from Acis.py lines 26-104
 */

// ============================================================================
// Binary Format Tags (Primitives for Binary File Format .sab)
// ============================================================================

const TAG_CHAR = 0x02          // character (unsigned 8 bit)
const TAG_SHORT = 0x03         // 16Bit signed value
const TAG_LONG = 0x04          // 32/64Bit signed value
const TAG_FLOAT = 0x05         // 32Bit IEEE Float value
const TAG_DOUBLE = 0x06        // 64Bit IEEE Float value
const TAG_UTF8_U8 = 0x07       // 8Bit length + UTF8-Char
const TAG_UTF8_U16 = 0x08      // 16Bit length + UTF8-Char
const TAG_UTF8_U32_A = 0x09    // 32Bit length + UTF8-Char
const TAG_TRUE = 0x0A          // Logical true value
const TAG_FALSE = 0x0B         // Logical false value
const TAG_ENTITY_REF = 0x0C    // Entity reference
const TAG_IDENT = 0x0D         // Sub-Class-Name
const TAG_SUBIDENT = 0x0E      // Base-Class-Name
const TAG_SUBTYPE_OPEN = 0x0F  // Opening block tag
const TAG_SUBTYPE_CLOSE = 0x10 // Closing block tag
const TAG_TERMINATOR = 0x11    // '#' sign
const TAG_UTF8_U32_B = 0x12    // 32Bit length + UTF8-Char
const TAG_POSITION = 0x13      // 3D-Vector scaled
const TAG_VECTOR_3D = 0x14     // 3D-Vector normalized
const TAG_ENUM_VALUE = 0x15    // value of an enumeration
const TAG_VECTOR_2D = 0x16     // U-V-Vector
const TAG_INT64 = 0x17         // used by AutoCAD ASM int64 attributes

// Convenience object for all tags
const ACIS_TAGS = {
  TAG_CHAR,
  TAG_SHORT,
  TAG_LONG,
  TAG_FLOAT,
  TAG_DOUBLE,
  TAG_UTF8_U8,
  TAG_UTF8_U16,
  TAG_UTF8_U32_A,
  TAG_TRUE,
  TAG_FALSE,
  TAG_ENTITY_REF,
  TAG_IDENT,
  TAG_SUBIDENT,
  TAG_SUBTYPE_OPEN,
  TAG_SUBTYPE_CLOSE,
  TAG_TERMINATOR,
  TAG_UTF8_U32_B,
  TAG_POSITION,
  TAG_VECTOR_3D,
  TAG_ENUM_VALUE,
  TAG_VECTOR_2D,
  TAG_INT64
}

// ============================================================================
// Boolean Enum Builder
// ============================================================================

function buildBoolEnum(falseValue, trueValue, trueKey = 'T') {
  return {
    [TAG_TRUE]: trueValue,
    [trueKey]: trueValue,
    1: trueValue,
    [TAG_FALSE]: falseValue,
    'F': falseValue,
    0: falseValue
  }
}

// ============================================================================
// TAG_FALSE, TAG_TRUE value mappings
// ============================================================================

const RANGE = buildBoolEnum('I', 'F', 'I')
const REFLECTION = buildBoolEnum('no_reflect', 'reflect')
const SURF_RIGID = buildBoolEnum('non_rigid', 'rigid')
const SURF_AXIS_SWEEP = buildBoolEnum('non_axis_sweep', 'axis_sweep')
const ROTATION = buildBoolEnum('no_rotate', 'rotate')
const SHEAR = buildBoolEnum('no_shear', 'shear')
const SENSE = buildBoolEnum('forward', 'reversed')
const SENSEV = buildBoolEnum('forward_v', 'reverse_v')
const SIDES = buildBoolEnum('single', 'double')
const SIDE = buildBoolEnum('out', 'in')
const SURF_BOOL = buildBoolEnum('FALSE', 'TRUE')
const SURF_NORM = buildBoolEnum('ISO', 'UNKNOWN')
const SURF_DIR = buildBoolEnum('SKIN', 'PERPENDICULAR')
const SURF_SWEEP = buildBoolEnum('angled', 'normal')
const CIRC_TYP = buildBoolEnum('non_cross', 'cross')
const CIRC_SMTH = buildBoolEnum('non_smooth', 'smooth')
const CALIBRATED = buildBoolEnum('uncalibrated', 'calibrated')
const CHAMFER_TYPE = buildBoolEnum('const', 'radius')
const CONVEXITY = buildBoolEnum('concave', 'convex')
const RENDER_BLEND = buildBoolEnum('rb_snapshot', 'rb_envelope')
const BOOLEAN = buildBoolEnum('F', 'T')

// ============================================================================
// TAG_ENUM value mappings
// ============================================================================

const RAD_FORM_ENTS = ['unknown', 'two_ends', 'functional', 'fixed_width']

const VAR_RADIUS = { 0: 'single_radius', 1: 'two_radii' }
const VAR_CHAMFER = { 3: 'rounded_chamfer' }
const CLOSURE = {
  0: 'open',
  1: 'closed',
  2: 'periodic',
  [TAG_FALSE]: 'open',
  [TAG_TRUE]: 'periodic'
}
const SINGULARITY = {
  0: 'full',
  1: 'v',
  2: 'none',
  [TAG_FALSE]: 'none',
  [TAG_TRUE]: 'full'
}
const VBL_CIRCLE = {
  0: 'circle',
  1: 'ellipse',
  3: 'unknown',
  'cylinder': 'circle'
}
const CURV_DIR = { 0: 'left', 2: 'right' }

// ============================================================================
// Token Translations (for text format parsing)
// ============================================================================

const TOKEN_TRANSLATIONS = {
  '0x0a': TAG_TRUE,
  '0x0A': TAG_TRUE,
  '0x0b': TAG_FALSE,
  '0x0B': TAG_FALSE,
  '{': TAG_SUBTYPE_OPEN,
  '}': TAG_SUBTYPE_CLOSE,
  '#': TAG_TERMINATOR
}

// ============================================================================
// Default Constants
// ============================================================================

const MIN_0 = 0.0
const MIN_PI = -Math.PI
const MIN_PI2 = -Math.PI / 2
const MIN_INF = -Infinity
const MAX_2PI = 2 * Math.PI
const MAX_PI = Math.PI
const MAX_PI2 = Math.PI / 2
const MAX_INF = Infinity
const MAX_LEN = 1e10

// Default vectors
const CENTER = { x: 0, y: 0, z: 0 }
const DIR_X = { x: 1, y: 0, z: 0 }
const DIR_Y = { x: 0, y: 1, z: 0 }
const DIR_Z = { x: 0, y: 0, z: 1 }

// ============================================================================
// All Enums Object (for convenience)
// ============================================================================

const ENUMS = {
  RANGE,
  REFLECTION,
  SURF_RIGID,
  SURF_AXIS_SWEEP,
  ROTATION,
  SHEAR,
  SENSE,
  SENSEV,
  SIDES,
  SIDE,
  SURF_BOOL,
  SURF_NORM,
  SURF_DIR,
  SURF_SWEEP,
  CIRC_TYP,
  CIRC_SMTH,
  CALIBRATED,
  CHAMFER_TYPE,
  CONVEXITY,
  RENDER_BLEND,
  BOOLEAN,
  VAR_RADIUS,
  VAR_CHAMFER,
  CLOSURE,
  SINGULARITY,
  VBL_CIRCLE,
  CURV_DIR
}


  // ============================================================================
  // math.js
  // ============================================================================

/**
 * ACIS Math Functions
 * Math wrapper functions and Law evaluation
 * Ported from Acis.py lines 201-280
 */

// ============================================================================
// Trigonometric Functions (uppercase for Law evaluation)
// ============================================================================

const COS = (x) => Math.cos(x)
const COSH = (x) => Math.cosh(x)
const COT = (x) => Math.cos(x) / Math.sin(x)
const COTH = (x) => Math.cosh(x) / Math.sinh(x)
const CSC = (x) => 1 / Math.sin(x)
const CSCH = (x) => 1 / Math.sinh(x)
const SEC = (x) => 1 / Math.cos(x)
const SECH = (x) => 1 / Math.cosh(x)
const SIN = (x) => Math.sin(x)
const SINH = (x) => Math.sinh(x)
const TAN = (x) => Math.tan(x)
const TANH = (x) => Math.tanh(x)

const ARCCOS = (x) => Math.acos(x)
const ARCCOSH = (x) => Math.acosh(x)
const ARCOT = (x) => Math.PI / 2 - Math.atan(x)
const ARCOTH = (x) => 0.5 * Math.log((x + 1) / (x - 1))
const ARCCSC = (x) => Math.asin(1 / x)
const ARCCSCH = (x) => Math.log((1 + Math.sqrt(1 + x * x)) / x)
const ARCSEC = (x) => Math.acos(1 / x)
const ARCSECH = (x) => Math.log((1 + Math.sqrt(1 - x * x)) / x)
const ARCSIN = (x) => Math.asin(x)
const ARCSINH = (x) => Math.asinh(x)
const ARCTAN = (x) => Math.atan(x)
const ARCTANH = (x) => Math.atanh(x)

// ============================================================================
// General Math Functions
// ============================================================================

const ABS = (x) => Math.abs(x)
const EXP = (x) => Math.exp(x)
const LN = (x) => Math.log(x)
const LOG = (x) => Math.log10(x)
const SQRT = (x) => Math.sqrt(x)
const MIN = (...args) => Math.min(...args)
const MAX = (...args) => Math.max(...args)

// ============================================================================
// Vector Functions
// ============================================================================

/**
 * Create a 3D vector
 */
function VEC(x, y, z) {
  return { x, y, z }
}

/**
 * Normalize a vector
 */
function NORM(v) {
  const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
  if (len < 1e-10) return { x: 0, y: 0, z: 0 }
  return { x: v.x / len, y: v.y / len, z: v.z / len }
}

/**
 * Cross product of two vectors
 */
function CROSS(v1, v2) {
  return {
    x: v1.y * v2.z - v1.z * v2.y,
    y: v1.z * v2.x - v1.x * v2.z,
    z: v1.x * v2.y - v1.y * v2.x
  }
}

/**
 * Dot product of two vectors
 */
function DOT(v1, v2) {
  return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z
}

/**
 * Vector length/magnitude
 */
function SIZE(v) {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
}

/**
 * Get element from vector by index (0=x, 1=y, 2=z)
 */
function TERM(v, n) {
  if (n === 0) return v.x
  if (n === 1) return v.y
  if (n === 2) return v.z
  return 0
}

/**
 * Sign function: returns 1 for positive, -1 for negative, 0 for zero
 */
function SET(x) {
  if (x > 0.0) return 1
  if (x < 0.0) return -1
  return 0
}

const SIGN = SET

/**
 * Scale a vector
 */
function scaleVec(v, s) {
  return { x: v.x * s, y: v.y * s, z: v.z * s }
}

/**
 * Add two vectors
 */
function addVec(v1, v2) {
  return { x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z }
}

/**
 * Subtract two vectors
 */
function subVec(v1, v2) {
  return { x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z }
}

/**
 * Calculate angle between two vectors (in radians)
 */
function angleBetween(v1, v2) {
  const d = DOT(v1, v2)
  const len1 = SIZE(v1)
  const len2 = SIZE(v2)
  if (len1 < 1e-10 || len2 < 1e-10) return 0
  return Math.acos(Math.max(-1, Math.min(1, d / (len1 * len2))))
}

/**
 * Convert radians to degrees
 */
function degrees(rad) {
  return rad * 180 / Math.PI
}

/**
 * Convert degrees to radians
 */
function radians(deg) {
  return deg * Math.PI / 180
}

// ============================================================================
// Comparison Utilities
// ============================================================================

const EPSILON = 1e-10

/**
 * Check if two floats are approximately equal
 */
function isEqual1D(a, b, tol = EPSILON) {
  return Math.abs(a - b) < tol
}

/**
 * Check if two vectors are approximately equal
 */
function isEqual(v1, v2, tol = EPSILON) {
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
function identityMatrix() {
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
function transformPoint(matrix, point) {
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
function transformDirection(matrix, dir) {
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
class Law {
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

function vec2sat(v) {
  return `${v.x} ${v.y} ${v.z}`
}

// ============================================================================
// 2D Vector class
// ============================================================================

class V2D {
  constructor(u, v) {
    this.u = u
    this.v = v
  }
}


  // ============================================================================
  // data-classes.js
  // ============================================================================

/**
 * ACIS Data Classes
 * Core data structures for B-Splines, Helix, Range, Interval, etc.
 * Ported from Acis.py lines 1172-1450
 */



// ============================================================================
// Range Class
// ============================================================================

/**
 * Represents a range value that can be either infinite ('I') or finite ('F')
 */
class Range {
  constructor(type, limit, scale = 1.0) {
    this.type = type    // 'I' for infinite, 'F' for finite
    this.limit = limit
    this.scale = scale
  }

  toString() {
    return this.type === 'I' ? 'I' : `F ${this.getLimit()}`
  }

  getLimit() {
    return this.type === 'I' ? this.limit : this.limit * this.scale
  }

  equals(other) {
    if (other instanceof Range) {
      return this.getLimit() === other.getLimit()
    }
    return this.getLimit() === other
  }

  subtract(other) {
    if (other instanceof Range) {
      return this.getLimit() - other.getLimit()
    }
    return this.getLimit() - other
  }

  add(other) {
    if (other instanceof Range) {
      return this.getLimit() + other.getLimit()
    }
    return this.getLimit() + other
  }
}

// ============================================================================
// Interval Class
// ============================================================================

/**
 * Represents an interval with lower and upper Range bounds
 */
class Interval {
  constructor(lower, upper) {
    this.lower = lower
    this.upper = upper
  }

  toString() {
    return `${this.lower} ${this.upper}`
  }

  getLowerType() { return this.lower.type }
  getLowerLimit() { return this.lower.getLimit() }
  getUpperType() { return this.upper.type }
  getUpperLimit() { return this.upper.getLimit() }
  getLimit() { return this.getUpperLimit() - this.getLowerLimit() }
}

// ============================================================================
// B-Spline Curve Class
// ============================================================================

/**
 * B-Spline curve data structure
 */
class BS_Curve {
  /**
   * @param {boolean} rational - True for NURBS, False for NUBS
   * @param {boolean} periodic - True for closed curves
   * @param {number} degree - Curve degree
   */
  constructor(rational, periodic, degree) {
    this.poles = []           // Array of {x, y, z} points
    this.uMults = []          // Knot multiplicities
    this.uKnots = []          // Knot values
    this.uPeriodic = periodic
    this.uDegree = degree
    this.weights = []         // Weights (same length as poles for rational)
    this.rational = rational
  }
}

// ============================================================================
// B-Spline Surface Class
// ============================================================================

/**
 * B-Spline surface data structure
 */
class BS_Surface extends BS_Curve {
  /**
   * @param {boolean} rational - True for NURBS
   * @param {boolean} uPeriodic - Periodic in U direction
   * @param {boolean} vPeriodic - Periodic in V direction
   * @param {number} uDegree - Degree in U direction
   * @param {number} vDegree - Degree in V direction
   */
  constructor(rational, uPeriodic, vPeriodic, uDegree, vDegree) {
    super(rational, uPeriodic, uDegree)
    this.poles = [[]]         // 2D array of points
    this.weights = [[]]       // 2D array of weights
    this.vMults = []
    this.vKnots = []
    this.vPeriodic = vPeriodic
    this.vDegree = vDegree
  }
}

// ============================================================================
// Helix Class
// ============================================================================

/**
 * Helix curve data structure
 */
class Helix {
  constructor() {
    this.radAngles = new Interval(new Range('I', 1.0), new Range('I', 1.0))
    this.posCenter = { ...CENTER }
    this.dirMajor = { ...DIR_X }
    this.dirMinor = { ...DIR_Y }
    this.dirPitch = { ...DIR_Z }
    this.facApex = MIN_0
    this.vecAxis = { ...DIR_Z }
  }

  toString() {
    return `${this.radAngles} ${JSON.stringify(this.posCenter)} ${JSON.stringify(this.dirMajor)} ` +
           `${JSON.stringify(this.dirMinor)} ${JSON.stringify(this.dirPitch)} ${this.facApex} ` +
           `${JSON.stringify(this.vecAxis)}`
  }

  getPitch() {
    return SIZE(this.dirPitch)
  }

  getHeight() {
    const angle = this.radAngles.getLimit()
    const pitch = this.getPitch()
    return pitch * angle / 2.0 / Math.PI
  }

  getRadius() {
    const majLen = SIZE(this.dirMajor)
    const minLen = SIZE(this.dirMinor)
    if (!isEqual1D(majLen, minLen)) {
      console.warn('Helix: elliptical helix not fully supported')
    }
    return majLen
  }

  getApexAngle() {
    const radApexAngle = Math.atan2(this.facApex * this.getRadius(), this.getPitch())
    return degrees(radApexAngle)
  }

  isLeftHanded() {
    const cross = CROSS(this.vecAxis, this.dirMajor)
    const angle = Math.acos(Math.max(-1, Math.min(1,
      (cross.x * this.dirMinor.x + cross.y * this.dirMinor.y + cross.z * this.dirMinor.z) /
      (SIZE(cross) * SIZE(this.dirMinor))
    )))
    return angle < 0.1
  }

  /**
   * Calculate parameter steps for helix interpolation
   */
  static calcSteps(a, b, numSegments = 6) {
    const startSegment = 0.05 // ~1 degree to smooth start
    const steps = [a, a + startSegment]

    const d = b - a
    const step = d / Math.ceil(numSegments * d / 2 / Math.PI)
    let c = a
    while (c < (b - startSegment)) {
      c += step
      steps.push(c)
    }

    steps.splice(steps.length - 1, 0, b - startSegment)
    return steps
  }

  /**
   * Calculate point on helix at parameter u
   */
  static calcPoint(u, minU, a, rMaj, rMin, handed, pitch) {
    const deltaU = (u - minU) / 2 / Math.PI
    const fac = 1 + a * deltaU
    const x = rMaj * fac * Math.cos(u)
    const y = rMin * fac * Math.sin(u) * handed
    const z = pitch * deltaU
    return { x, y, z }
  }

  /**
   * Build helix curve points for interpolation
   * @returns {Array<{x,y,z}>} Array of points
   */
  buildPoints() {
    const minU = this.radAngles.getLowerLimit()
    const maxU = this.radAngles.getUpperLimit()
    const rMaj = SIZE(this.dirMajor)
    const rMin = SIZE(this.dirMinor)
    const pitch = SIZE(this.dirPitch)
    const stepsU = Helix.calcSteps(minU, maxU)
    const handed = this.isLeftHanded() ? 1 : -1
    const points = []

    for (const u of stepsU) {
      const c = Helix.calcPoint(u, minU, this.facApex, rMaj, rMin, handed, pitch)
      points.push(c)
    }

    return points
  }
}

// ============================================================================
// Loft Data Classes
// ============================================================================

class LoftData {
  constructor() {
    this.surface = null
    this.bs2cur = null
    this.e1 = false
    this.type = 213
    this.n = 1
    this.m = 1
    this.v = []
    this.e2 = false
    this.dir = null
  }
}

class Skin {
  constructor() {
    this.a1 = [-1, -1, -1, -1]
    this.f1 = MIN_0
    this.loft = []
    this.a2 = [0.0, 0.0, 0.0]
    this.surf = null
    this.n = 0
    this.law = 'null_law'
    this.pcur = null
    this.cur = null
    this.cur2 = null
    this.vec = null
    this.f2 = 0
  }
}

// ============================================================================
// Boundary Geometry Classes
// ============================================================================

/**
 * Base class for boundary geometry
 */
class BDY_GEOM {
  constructor(svId) {
    this.svId = svId
    this.shape = null
    this._readyToBuild = true
  }

  build() {
    if (this._readyToBuild) {
      this._readyToBuild = false
      this.buildCurve()
    }
    return this.shape
  }

  buildCurve() {
    // Override in subclasses
  }
}

class BDY_GEOM_CIRCLE extends BDY_GEOM {
  constructor() {
    super('circle')
    this.curve = null
    this.twist = [null, null]
    this.parameters = [MIN_0, MAX_2PI]
    this.sense = 'forward'
    this.type = 'non_cross'
    this.magic = { ...CENTER }
    this.uSmoothing = 'non_smooth'
    this.vSmoothing = 'non_smooth'
    this.fullness = 0
  }

  buildCurve() {
    if (this.curve !== null) {
      const u = this.parameters[0]
      const v = this.parameters[1]
      this.shape = this.curve.build(u, v)
    }
  }
}

class BDY_GEOM_DEG extends BDY_GEOM {
  constructor() {
    super('deg')
    this.location = { ...CENTER }
    this.normal1 = { ...DIR_X }
    this.normal2 = { ...DIR_Y }
    this.type = 'non_cross'
    this.magic = { ...CENTER }
    this.uSmoothing = 'non_smooth'
    this.vSmoothing = 'non_smooth'
    this.fullness = 0
  }

  buildCurve() {
    // Creates a point shape
    this.shape = { type: 'point', location: this.location }
  }
}

class BDY_GEOM_PCURVE extends BDY_GEOM {
  constructor() {
    super('pcurve')
    this.surface = null
    this.pcurve = null
    this.sense = 'forward'
    this.fittolerance = 0.0
    this.type = 'non_cross'
    this.magic = { ...CENTER }
    this.uSmoothing = 'non_smooth'
    this.vSmoothing = 'non_smooth'
    this.fullness = 0
  }

  buildCurve() {
    // Build curve from pcurve on surface
    // This requires the OpenCascade geometry builder
  }
}

class BDY_GEOM_PLANE extends BDY_GEOM {
  constructor() {
    super('plane')
    this.normal = { ...DIR_Z }
    this.parameters = [MIN_0, 1.0]
    this.curve = null
    this.type = 'non_cross'
    this.magic = { ...CENTER }
    this.uSmoothing = 'non_smooth'
    this.vSmoothing = 'non_smooth'
    this.fullness = 0
  }

  buildCurve() {
    if (this.curve !== null) {
      const u = this.parameters[0]
      const v = this.parameters[1]
      this.shape = this.curve.build(u, v)
    }
  }
}

// ============================================================================
// Index Mappings (for DC attributes)
// ============================================================================

class IndexMappings {
  constructor() {
    this.attributes = []
  }

  append(attr) {
    this.attributes.push(attr)
  }

  _getTypedOwners(ownerType) {
    const result = new Map()
    for (const a of this.attributes) {
      const owner = a.getOwner()
      if (owner && owner.getType() === ownerType) {
        if (!result.has(owner.index)) {
          result.set(owner.index, owner)
        }
      }
    }
    return Array.from(result.values())
  }

  getEdges() {
    return this._getTypedOwners('edge')
  }

  getFaces() {
    return this._getTypedOwners('face')
  }
}

// ============================================================================
// VBL Classes Map
// ============================================================================

const VBL_CLASSES = {
  'circle': BDY_GEOM_CIRCLE,
  'deg': BDY_GEOM_DEG,
  'pcurve': BDY_GEOM_PCURVE,
  'plane': BDY_GEOM_PLANE
}


  // ============================================================================
  // utils.js
  // ============================================================================

/**
 * ACIS Utility Functions
 * Helper functions for reading values from chunks
 * Ported from Acis.py lines 132-700
 */




// ============================================================================
// Reader State (module-level)
// ============================================================================

let _reader = null
let _scale = 1.0
let _version = 7.0

function getReader() {
  return _reader
}

function setReader(reader) {
  _reader = reader
}

function getScale() {
  return _reader ? _reader.scale : _scale
}

function setScale(s) {
  _scale = s
}

function getVersion() {
  return _reader ? _reader.version : _version
}

function setVersion(v) {
  _version = v
}

function isASM() {
  if (_reader && _reader.header) {
    return _reader.header.asm !== undefined
  }
  return false
}

function getAsmMajor() {
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
function getValue(chunks, index) {
  const chunk = chunks[index]
  return [chunk.val !== undefined ? chunk.val : chunk.value, index + 1]
}

/**
 * Get entity reference from chunk
 * In ASM 64-bit format, there may be extra integer fields - skip them
 */
function getRefNode(record, index, expectedName = null) {
  // Skip non-reference chunks (extra integer fields in ASM format)
  while (index < record.chunks.length) {
    const chunk = record.chunks[index]
    if (chunk.tag === TAG_ENTITY_REF || chunk.type === 'entity_ref') {
      const ref = chunk.record || chunk
      if (expectedName !== null && ref !== null && ref.name && !ref.name.endsWith(expectedName)) {
        // Type mismatch - but don't throw, just warn
        // console.warn(`Expected ${expectedName} but found ${ref.name}`)
      }
      return [ref, index + 1]
    }
    // Skip TAG_LONG, TAG_DOUBLE, etc. (extra fields in ASM format)
    if (chunk.tag === TAG_LONG || chunk.tag === TAG_DOUBLE || chunk.tag === TAG_SHORT ||
        chunk.tag === TAG_FLOAT || chunk.tag === TAG_CHAR) {
      index++
      continue
    }
    // Stop at terminator or other non-numeric tags
    break
  }
  // Return null reference if we couldn't find one
  return [null, index]
}

/**
 * Get boolean value from chunk
 */
function getBoolean(chunks, index) {
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
function getInteger(chunks, index) {
  const [val, i] = getValue(chunks, index)
  return [parseInt(val, 10), i]
}

/**
 * Get multiple integer values
 */
function getIntegers(chunks, index, count) {
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
function getLong(chunks, index) {
  const [val, i] = getValue(chunks, index)
  return [parseInt(val, 10), i]
}

/**
 * Get float value from chunk
 */
function getFloat(chunks, index) {
  const [val, i] = getValue(chunks, index)
  return [parseFloat(val), i]
}

/**
 * Get multiple float values
 */
function getFloats(chunks, index, count) {
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
function getFloatsScaled(chunks, index, count) {
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
function getFloatArray(chunks, index) {
  const [n, i1] = getInteger(chunks, index)
  const [arr, i2] = getFloats(chunks, i1, n)
  return [arr, i2]
}

/**
 * Get length value (scaled)
 */
function getLength(chunks, index) {
  const [l, i] = getFloat(chunks, index)
  return [l * getScale(), i]
}

/**
 * Get text value
 */
function getText(chunks, index) {
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
function getEnumByTag(chunks, index, values) {
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
function getEnumByValue(chunks, index, values) {
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
function getSides(chunks, index) {
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
function getSingularity(chunks, index) {
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
function getPoint(chunks, index) {
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
function getVector(chunks, index) {
  return getPoint(chunks, index)
}

/**
 * Get location (scaled point)
 */
function getLocation(chunks, index) {
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
function getRange(chunks, index, defaultVal, scale) {
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
function getInterval(chunks, index, defMin, defMax, scale) {
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
function getDimensionCurve(chunks, index) {
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
function getDimensionSurface(chunks, index) {
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
function getClosureCurve(chunks, index) {
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
function getClosureSurface(chunks, index) {
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
function getUnknownFT(chunks, index) {
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
function readKnotsMults(count, chunks, index) {
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
function adjustMultsKnots(knots, mults, degree) {
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
function readPoints2DList(spline, count, chunks, index) {
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
function readPoints3DList(spline, count, chunks, index) {
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
function readPoints3DSurface(spline, countU, countV, chunks, index) {
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
function isString(val) {
  return typeof val === 'string'
}

/**
 * Reshape flat array into 2D array
 */
function reshape(arr, cols) {
  const result = []
  for (let i = 0; i < arr.length; i += cols) {
    result.push(arr.slice(i, i + cols))
  }
  return result
}


  // ============================================================================
  // chunks.js
  // ============================================================================

/**
 * ACIS Chunk Classes
 * Binary chunk readers for ACIS format
 * Ported from Acis.py lines 4700-4900
 */



// ============================================================================
// Binary Reading Helpers
// ============================================================================

function getUInt8(data, offset) {
  return [data[offset], offset + 1]
}

function getSInt8(data, offset) {
  const val = data[offset]
  return [val > 127 ? val - 256 : val, offset + 1]
}

function getUInt16(data, offset) {
  return [data[offset] | (data[offset + 1] << 8), offset + 2]
}

function getSInt16(data, offset) {
  const val = data[offset] | (data[offset + 1] << 8)
  return [val > 32767 ? val - 65536 : val, offset + 2]
}

function getUInt32(data, offset) {
  // Need parentheses to apply >>> 0 to the whole expression, not just the last term
  return [
    (data[offset] | (data[offset + 1] << 8) | (data[offset + 2] << 16) | (data[offset + 3] << 24)) >>> 0,
    offset + 4
  ]
}

function getSInt32(data, offset) {
  const val = data[offset] | (data[offset + 1] << 8) | (data[offset + 2] << 16) | (data[offset + 3] << 24)
  return [val, offset + 4]
}

function getUInt64(data, offset) {
  const lo = getUInt32(data, offset)[0]
  const hi = getUInt32(data, offset + 4)[0]
  // Return as Number (may lose precision for very large values)
  return [hi * 0x100000000 + lo, offset + 8]
}

function getSInt64(data, offset) {
  const lo = getUInt32(data, offset)[0]
  const hi = getSInt32(data, offset + 4)[0]
  // Check for -1 (0xffffffffffffffff)
  if (lo === 0xffffffff && hi === -1) return [-1, offset + 8]
  return [hi * 0x100000000 + lo, offset + 8]
}

function getFloat32(data, offset) {
  const view = new DataView(data.buffer, data.byteOffset + offset, 4)
  return [view.getFloat32(0, true), offset + 4]
}

function getFloat64(data, offset) {
  const view = new DataView(data.buffer, data.byteOffset + offset, 8)
  return [view.getFloat64(0, true), offset + 8]
}

// ============================================================================
// Base Chunk Class
// ============================================================================

class AcisChunk {
  constructor(tag, val) {
    this.tag = tag
    this.val = val
    this.value = val // alias for compatibility
  }

  read(data, offset) {
    return offset
  }

  toString() {
    return String(this.val)
  }
}

// ============================================================================
// Numeric Chunks
// ============================================================================

class AcisChunkChar extends AcisChunk {
  constructor(val) {
    super(TAG_CHAR, val)
  }

  read(data, offset) {
    [this.val, offset] = getUInt8(data, offset)
    this.value = this.val
    return offset
  }
}

class AcisChunkShort extends AcisChunk {
  constructor(val) {
    super(TAG_SHORT, val)
  }

  read(data, offset) {
    [this.val, offset] = getSInt16(data, offset)
    this.value = this.val
    return offset
  }
}

class AcisChunkLong extends AcisChunk {
  constructor(val) {
    super(TAG_LONG, val)
  }

  read(data, offset) {
    // Uses _getSLong which can be 32 or 64 bit
    [this.val, offset] = getSInt32(data, offset)
    this.value = this.val
    return offset
  }
}

class AcisChunkInt64 extends AcisChunk {
  constructor(val) {
    super(TAG_INT64, val)
  }

  read(data, offset) {
    [this.val, offset] = getSInt64(data, offset)
    this.value = this.val
    return offset
  }
}

class AcisChunkFloat extends AcisChunk {
  constructor(val) {
    super(TAG_FLOAT, val)
  }

  read(data, offset) {
    [this.val, offset] = getFloat32(data, offset)
    this.value = this.val
    return offset
  }
}

class AcisChunkDouble extends AcisChunk {
  constructor(val) {
    super(TAG_DOUBLE, val)
  }

  read(data, offset) {
    [this.val, offset] = getFloat64(data, offset)
    this.value = this.val
    return offset
  }
}

// ============================================================================
// String Chunks
// ============================================================================

class AcisChunkUtf8U8 extends AcisChunk {
  constructor(val) {
    super(TAG_UTF8_U8, val)
  }

  read(data, offset) {
    const [len, o1] = getUInt8(data, offset)
    const bytes = data.slice(o1, o1 + len)
    this.val = new TextDecoder().decode(bytes)
    this.value = this.val
    return o1 + len
  }
}

class AcisChunkUtf8U16 extends AcisChunk {
  constructor(val) {
    super(TAG_UTF8_U16, val)
  }

  read(data, offset) {
    const [len, o1] = getUInt16(data, offset)
    const bytes = data.slice(o1, o1 + len)
    this.val = new TextDecoder().decode(bytes)
    this.value = this.val
    return o1 + len
  }
}

class AcisChunkUtf8U32A extends AcisChunk {
  constructor(val) {
    super(TAG_UTF8_U32_A, val)
  }

  read(data, offset) {
    const [len, o1] = getUInt32(data, offset)
    const bytes = data.slice(o1, o1 + len)
    this.val = new TextDecoder().decode(bytes)
    this.value = this.val
    return o1 + len
  }
}

class AcisChunkUtf8U32B extends AcisChunk {
  constructor(val) {
    super(TAG_UTF8_U32_B, val)
  }

  read(data, offset) {
    const [len, o1] = getUInt32(data, offset)
    const bytes = data.slice(o1, o1 + len)
    this.val = new TextDecoder().decode(bytes)
    this.value = this.val
    return o1 + len
  }
}

// ============================================================================
// Identifier Chunks
// ============================================================================

class AcisChunkIdent extends AcisChunkUtf8U8 {
  constructor(val) {
    super(val)
    this.tag = TAG_IDENT
  }
}

class AcisChunkSubIdent extends AcisChunkUtf8U8 {
  constructor(val) {
    super(val)
    this.tag = TAG_SUBIDENT
  }
}

// ============================================================================
// Reference Chunk
// ============================================================================

class AcisChunkEntityRef extends AcisChunk {
  constructor(val) {
    super(TAG_ENTITY_REF, val)
    this.record = null
    this.entity = null
    this.type = 'entity_ref'
    this.id = val
  }

  toString() {
    return `$${this.val}`
  }
}

// ============================================================================
// Enum Chunk
// ============================================================================

class AcisChunkEnumValue extends AcisChunk {
  constructor(tag, val, values) {
    super(tag, val)
    this.values = values
    this.type = 'enum'
  }

  read(data, offset) {
    const [idx, o1] = getUInt8(data, offset)
    this.val = this.values[idx]
    this.value = this.val
    return o1
  }

  toString() {
    return this.val
  }
}

// ============================================================================
// Geometric Chunks
// ============================================================================

class AcisChunkPosition extends AcisChunk {
  constructor(scale = 1.0) {
    super(TAG_POSITION, null)
    this.scale = scale
    this.type = 'position'
  }

  read(data, offset) {
    const [x, o1] = getFloat64(data, offset)
    const [y, o2] = getFloat64(data, o1)
    const [z, o3] = getFloat64(data, o2)
    this.val = { x: x * this.scale, y: y * this.scale, z: z * this.scale }
    this.value = this.val
    return o3
  }

  toString() {
    return `(${this.val.x} ${this.val.y} ${this.val.z})`
  }
}

class AcisChunkVector3D extends AcisChunk {
  constructor() {
    super(TAG_VECTOR_3D, null)
    this.type = 'vector3d'
  }

  read(data, offset) {
    const [x, o1] = getFloat64(data, offset)
    const [y, o2] = getFloat64(data, o1)
    const [z, o3] = getFloat64(data, o2)
    this.val = { x, y, z }
    this.value = this.val
    return o3
  }

  toString() {
    return `(${this.val.x} ${this.val.y} ${this.val.z})`
  }
}

class AcisChunkVector2D extends AcisChunk {
  constructor() {
    super(TAG_VECTOR_2D, null)
    this.type = 'vector2d'
  }

  read(data, offset) {
    const [u, o1] = getFloat64(data, offset)
    const [v, o2] = getFloat64(data, o1)
    this.val = { u, v }
    this.value = this.val
    return o2
  }

  toString() {
    return `(${this.val.u} ${this.val.v})`
  }
}

// ============================================================================
// Block Chunks
// ============================================================================

class AcisChunkSubtypeOpen extends AcisChunk {
  constructor() {
    super(TAG_SUBTYPE_OPEN, '{')
  }

  toString() {
    return '{'
  }
}

class AcisChunkSubtypeClose extends AcisChunk {
  constructor() {
    super(TAG_SUBTYPE_CLOSE, '}')
  }

  toString() {
    return '}'
  }
}

class AcisChunkTerminator extends AcisChunk {
  constructor() {
    super(TAG_TERMINATOR, '#')
  }

  toString() {
    return '#'
  }
}

// ============================================================================
// None Reference (for $-1)
// ============================================================================

const ACIS_REF_NONE = new AcisChunkEntityRef(-1)
ACIS_REF_NONE.record = null

// ============================================================================
// Tag to Chunk Class Mapping
// ============================================================================

const ACIS_VALUE_CHUNKS = {
  [TAG_CHAR]: AcisChunkChar,
  [TAG_SHORT]: AcisChunkShort,
  [TAG_LONG]: AcisChunkLong,
  [TAG_FLOAT]: AcisChunkFloat,
  [TAG_DOUBLE]: AcisChunkDouble,
  [TAG_UTF8_U8]: AcisChunkUtf8U8,
  [TAG_UTF8_U16]: AcisChunkUtf8U16,
  [TAG_UTF8_U32_A]: AcisChunkUtf8U32A,
  [TAG_UTF8_U32_B]: AcisChunkUtf8U32B,
  [TAG_IDENT]: AcisChunkIdent,
  [TAG_SUBIDENT]: AcisChunkSubIdent,
  [TAG_SUBTYPE_OPEN]: AcisChunkSubtypeOpen,
  [TAG_SUBTYPE_CLOSE]: AcisChunkSubtypeClose,
  [TAG_TERMINATOR]: AcisChunkTerminator,
  [TAG_POSITION]: AcisChunkPosition,
  [TAG_VECTOR_3D]: AcisChunkVector3D,
  [TAG_VECTOR_2D]: AcisChunkVector2D,
  [TAG_INT64]: AcisChunkInt64
}

// ============================================================================
// Factory function to create chunk from tag
// ============================================================================

function createChunk(tag, data, offset, scale = 1.0) {
  // Get the reader to check for 64-bit mode
  const reader = getReader()
  const getSLong = reader ? reader._getSLong : getSInt32

  if (tag === TAG_TRUE) {
    return [new AcisChunkEnumValue(TAG_TRUE, true, BOOLEAN), offset]
  }
  if (tag === TAG_FALSE) {
    return [new AcisChunkEnumValue(TAG_FALSE, false, BOOLEAN), offset]
  }
  if (tag === TAG_ENTITY_REF) {
    // Entity refs use the current long size (32 or 64 bit)
    const [val, o1] = getSLong(data, offset)
    const chunk = new AcisChunkEntityRef(val)
    return [chunk, o1]
  }
  if (tag === TAG_ENUM_VALUE) {
    // In 64-bit mode, enum values are stored as 64-bit integers
    // Otherwise as UTF8 strings
    const reader = getReader()
    if (reader && reader._getSLong === getSInt64) {
      // 64-bit mode: read as integer
      const [val, o1] = getSLong(data, offset)
      const chunk = new AcisChunkLong(val)
      chunk.tag = TAG_ENUM_VALUE
      chunk.type = 'enum'
      return [chunk, o1]
    } else {
      // 32-bit mode: read as string
      const chunk = new AcisChunkUtf8U8()
      const o1 = chunk.read(data, offset)
      chunk.tag = TAG_ENUM_VALUE
      chunk.type = 'enum'
      return [chunk, o1]
    }
  }
  if (tag === TAG_POSITION) {
    const chunk = new AcisChunkPosition(scale)
    const o1 = chunk.read(data, offset)
    return [chunk, o1]
  }
  // TAG_LONG uses the current long size (32 or 64 bit based on file format)
  if (tag === TAG_LONG) {
    const [val, o1] = getSLong(data, offset)
    const chunk = new AcisChunkLong(val)
    return [chunk, o1]
  }

  const ChunkClass = ACIS_VALUE_CHUNKS[tag]
  if (ChunkClass) {
    const chunk = new ChunkClass()
    const o1 = chunk.read(data, offset)
    return [chunk, o1]
  }

  throw new Error(`Unknown ACIS tag: 0x${tag.toString(16)}`)
}


  // ============================================================================
  // entity.js
  // ============================================================================

/**
 * ACIS Entity Classes
 * Base entity class and simple entity types
 * Ported from Acis.py lines 1527-1628
 */



// ============================================================================
// Base Entity Class
// ============================================================================

/**
 * Base class for all ACIS entities
 */
class Entity {
  constructor() {
    this.record = null
    this.index = -1
    this._attrib = null
    this._readyToBuild = true
    this.shape = null
  }

  /**
   * Get the entity type name
   */
  getType() {
    if (this.record) {
      return this.record.name
    }
    return this.constructor.name
  }

  /**
   * Get SAT text representation
   */
  getSatText() {
    if (this.record) {
      return this.record.chunks.map(c => c.toString()).join(' ')
    }
    return ''
  }

  /**
   * Get referenced entity
   */
  getRef(chunk) {
    if (chunk && chunk.record && chunk.record.entity) {
      return chunk.record.entity
    }
    return null
  }

  /**
   * Set entity data from record
   */
  set(record) {
    let i = 0

    // Handle attrib reference
    if (record.chunks.length > 0) {
      const firstChunk = record.chunks[0]
      if (firstChunk.tag === TAG_ENTITY_REF || firstChunk.type === 'entity_ref') {
        [this._attrib, i] = getRefNode(record, 0, 'attrib')
      }
    }

    return i
  }

  /**
   * Get attribute entity
   */
  getAttrib() {
    return this._attrib ? this._attrib.entity : null
  }

  /**
   * Build the shape (override in subclasses)
   */
  build() {
    return this.shape
  }

  toString() {
    return `${this.getType()} [${this.index}]`
  }
}

// ============================================================================
// Transform Entity
// ============================================================================

/**
 * Transformation matrix entity
 */
class Transform extends Entity {
  constructor() {
    super()
    // 4x4 transformation matrix (row-major)
    this.matrix = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ]
    this.reflect = false
    this.rotation = false
    this.shear = false
    this.scale = 1.0
  }

  set(record) {
    let i = super.set(record)

    // Read 3x3 rotation matrix
    const [row1, i1] = getFloats(record.chunks, i, 3)
    const [row2, i2] = getFloats(record.chunks, i1, 3)
    const [row3, i3] = getFloats(record.chunks, i2, 3)

    this.matrix[0][0] = row1[0]; this.matrix[0][1] = row1[1]; this.matrix[0][2] = row1[2]
    this.matrix[1][0] = row2[0]; this.matrix[1][1] = row2[1]; this.matrix[1][2] = row2[2]
    this.matrix[2][0] = row3[0]; this.matrix[2][1] = row3[1]; this.matrix[2][2] = row3[2]

    // Read translation vector (scaled)
    const [translation, i4] = getLocation(record.chunks, i3)
    this.matrix[0][3] = translation.x
    this.matrix[1][3] = translation.y
    this.matrix[2][3] = translation.z

    // Read scale
    let i5 = i4
    ;[this.scale, i5] = getFloat(record.chunks, i5)

    // Read flags
    ;[this.reflect, i5] = getBoolean(record.chunks, i5)
    ;[this.rotation, i5] = getBoolean(record.chunks, i5)
    ;[this.shear, i5] = getBoolean(record.chunks, i5)

    return i5
  }

  /**
   * Transform a point
   */
  transformPoint(point) {
    const x = this.matrix[0][0] * point.x + this.matrix[0][1] * point.y +
              this.matrix[0][2] * point.z + this.matrix[0][3]
    const y = this.matrix[1][0] * point.x + this.matrix[1][1] * point.y +
              this.matrix[1][2] * point.z + this.matrix[1][3]
    const z = this.matrix[2][0] * point.x + this.matrix[2][1] * point.y +
              this.matrix[2][2] * point.z + this.matrix[2][3]
    return { x, y, z }
  }

  /**
   * Transform a direction (no translation)
   */
  transformDirection(dir) {
    const x = this.matrix[0][0] * dir.x + this.matrix[0][1] * dir.y + this.matrix[0][2] * dir.z
    const y = this.matrix[1][0] * dir.x + this.matrix[1][1] * dir.y + this.matrix[1][2] * dir.z
    const z = this.matrix[2][0] * dir.x + this.matrix[2][1] * dir.y + this.matrix[2][2] * dir.z
    return { x, y, z }
  }
}

// ============================================================================
// World Coordinate System Entity
// ============================================================================

/**
 * WCS (World Coordinate System) entity
 */
class Wcs extends Entity {
  constructor() {
    super()
    this._transform = null
  }

  set(record) {
    let i = super.set(record)
    ;[this._transform, i] = getRefNode(record, i, 'transform')
    return i
  }

  getTransform() {
    return this._transform ? this._transform.entity : null
  }
}

// ============================================================================
// T Entity (Terminator)
// ============================================================================

/**
 * T entity - terminator/marker
 */
class T extends Entity {
  constructor() {
    super()
  }

  set(record) {
    // T entity has no data
    return 0
  }
}

// ============================================================================
// Eye Refinement Entity
// ============================================================================

/**
 * Eye refinement entity
 */
class EyeRefinement extends Entity {
  constructor() {
    super()
  }

  set(record) {
    let i = super.set(record)
    // Eye refinement data depends on version
    return i
  }
}

// ============================================================================
// Vertex Template Entity
// ============================================================================

/**
 * Vertex template entity
 */
class VertexTemplate extends Entity {
  constructor() {
    super()
    this.position = { x: 0, y: 0, z: 0 }
  }

  set(record) {
    let i = super.set(record)
    ;[this.position, i] = getLocation(record.chunks, i)
    return i
  }
}

// ============================================================================
// Annotation Entities
// ============================================================================

class Annotation extends Entity {
  constructor() {
    super()
  }

  set(record) {
    let i = super.set(record)
    return i
  }
}

class AnnotationPrimitive extends Annotation {
  constructor() {
    super()
  }
}

class AnnotationSplit extends Annotation {
  constructor() {
    super()
  }
}

class AnnotationTol extends Annotation {
  constructor() {
    super()
  }
}

class AnnotationTolCreate extends AnnotationTol {
  constructor() {
    super()
  }
}

class AnnotationTolRevert extends AnnotationTol {
  constructor() {
    super()
  }
}

// ============================================================================
// Point Entity
// ============================================================================

/**
 * Point geometry entity
 */
class Point extends Entity {
  constructor() {
    super()
    this.position = { x: 0, y: 0, z: 0 }
    this.count = -1
  }

  set(record) {
    let i = super.set(record)

    // Skip version-specific data
    if (getVersion() > 10.0 && !isASM()) {
      i += 1
    }
    if (getVersion() > 6.0) {
      const [anyRef, i2] = getRefNode(record, i, null)
      i = i2
    }

    ;[this.position, i] = getLocation(record.chunks, i)
    return i
  }

  getPosition() {
    return this.position
  }
}

// ============================================================================
// Refinement Entity
// ============================================================================

class Refinement extends Entity {
  constructor() {
    super()
  }

  set(record) {
    let i = super.set(record)
    return i
  }
}

// ============================================================================
// RH Entity (Render Hint)
// ============================================================================

class RhEntity extends Entity {
  constructor() {
    super()
  }
}

class RhEntityRhMaterial extends RhEntity {
  constructor() {
    super()
  }

  set(record) {
    let i = super.set(record)
    // Parse material data (color, phong, etc.)
    return i
  }
}

// ============================================================================
// ASM Header Entity
// ============================================================================

class AsmHeader extends Entity {
  static getVersion = (str) => {
    const match = str.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/)
    return match ? [match[1], match[2], match[3], match[4]].map(Number) : null
  }

  constructor() {
    super()
    this.version = '7.0'
    this.major = 7
    this.minor = 0
    this.revision = 0
    this.build = 0
  }

  set(record) {
    let i = super.set(record)
    const [version, i2] = getText(record.chunks, i)
    const v = AsmHeader.getVersion(version)
    if (v) {
      this.major = v[0]
      this.minor = v[1]
      this.revision = v[2]
      this.build = v[3]
    }
    return i2
  }
}


  // ============================================================================
  // topology.js
  // ============================================================================

/**
 * ACIS Topology Classes
 * Topology entities: Body, Lump, Shell, Face, Loop, Wire, CoEdge, Edge, Vertex
 * Ported from Acis.py lines 1628-2060
 */




// ============================================================================
// Base Topology Class
// ============================================================================

/**
 * Base class for topology entities
 */
class Topology extends Entity {
  constructor() {
    super()
  }

  set(record) {
    let i = super.set(record)
    return i
  }
}

// ============================================================================
// Body Entity
// ============================================================================

/**
 * Body entity - top-level container for lumps
 */
class Body extends Topology {
  constructor() {
    super()
    this._lump = null       // First lump
    this._wire = null       // First wire
    this._transform = null  // Transform reference
  }

  set(record) {
    let i = super.set(record)
    ;[this._lump, i] = getRefNode(record, i, 'lump')
    ;[this._wire, i] = getRefNode(record, i, 'wire')
    ;[this._transform, i] = getRefNode(record, i, 'transform')
    return i
  }

  getLump() {
    return this._lump ? this._lump.entity : null
  }

  getWire() {
    return this._wire ? this._wire.entity : null
  }

  getTransform() {
    return this._transform ? this._transform.entity : null
  }

  /**
   * Get all lumps in this body
   */
  getLumps() {
    const lumps = []
    let lump = this.getLump()
    while (lump) {
      lumps.push(lump)
      lump = lump.getNext()
    }
    return lumps
  }

  /**
   * Get all wires in this body
   */
  getWires() {
    const wires = []
    let wire = this.getWire()
    while (wire) {
      wires.push(wire)
      wire = wire.getNext()
    }
    return wires
  }

  build() {
    if (this._readyToBuild) {
      this._readyToBuild = false
      // Build logic would go here with OpenCascade
    }
    return this.shape
  }
}

// ============================================================================
// Lump Entity
// ============================================================================

/**
 * Lump entity - container for shells
 */
class Lump extends Topology {
  constructor() {
    super()
    this._next = null   // Next lump in body
    this._shell = null  // First shell
    this._owner = null  // Owning body
  }

  set(record) {
    let i = super.set(record)
    ;[this._next, i] = getRefNode(record, i, 'lump')
    ;[this._shell, i] = getRefNode(record, i, 'shell')
    ;[this._owner, i] = getRefNode(record, i, 'body')
    return i
  }

  getNext() {
    return this._next ? this._next.entity : null
  }

  getShell() {
    return this._shell ? this._shell.entity : null
  }

  getParent() {
    return this._owner ? this._owner.entity : null
  }

  /**
   * Get all shells in this lump
   */
  getShells() {
    const shells = []
    let shell = this.getShell()
    while (shell) {
      shells.push(shell)
      shell = shell.getNext()
    }
    return shells
  }

  build() {
    if (this._readyToBuild) {
      this._readyToBuild = false
      // Build logic
    }
    return this.shape
  }
}

// ============================================================================
// Shell Entity
// ============================================================================

/**
 * Shell entity - container for faces
 */
class Shell extends Topology {
  constructor() {
    super()
    this._next = null     // Next shell in lump
    this._subshell = null // First subshell
    this._face = null     // First face
    this._wire = null     // First wire
    this._owner = null    // Owning lump
  }

  set(record) {
    let i = super.set(record)
    ;[this._next, i] = getRefNode(record, i, 'shell')
    ;[this._subshell, i] = getRefNode(record, i, 'subshell')
    ;[this._face, i] = getRefNode(record, i, 'face')
    ;[this._wire, i] = getRefNode(record, i, 'wire')
    ;[this._owner, i] = getRefNode(record, i, 'lump')
    return i
  }

  getNext() {
    return this._next ? this._next.entity : null
  }

  getFace() {
    return this._face ? this._face.entity : null
  }

  getParent() {
    return this._owner ? this._owner.entity : null
  }

  /**
   * Get all faces in this shell
   */
  getFaces() {
    const faces = []
    let face = this.getFace()
    const visited = new Set()
    while (face && !visited.has(face.index)) {
      visited.add(face.index)
      faces.push(face)
      face = face.getNext()
    }
    return faces
  }

  build() {
    if (this._readyToBuild) {
      this._readyToBuild = false
      // Build logic
    }
    return this.shape
  }
}

// ============================================================================
// SubShell Entity
// ============================================================================

/**
 * SubShell entity
 */
class SubShell extends Topology {
  constructor() {
    super()
    this._next = null
    this._child = null
    this._face = null
    this._wire = null
    this._owner = null
  }

  set(record) {
    let i = super.set(record)
    ;[this._next, i] = getRefNode(record, i, 'subshell')
    ;[this._child, i] = getRefNode(record, i, 'subshell')
    ;[this._face, i] = getRefNode(record, i, 'face')
    ;[this._wire, i] = getRefNode(record, i, 'wire')
    ;[this._owner, i] = getRefNode(record, i, null)
    return i
  }
}

// ============================================================================
// Face Entity
// ============================================================================

/**
 * Face entity - container for loops with a surface
 */
class Face extends Topology {
  constructor() {
    super()
    this._next = null     // Next face in shell
    this._loop = null     // First loop
    this._shell = null    // Owning shell
    this._subshell = null // Owning subshell
    this._surface = null  // Surface geometry
    this.sense = 'forward'
    this.sides = 'single'
    this.side = null
    this.containment = null
  }

  set(record) {
    let i = super.set(record)
    ;[this._next, i] = getRefNode(record, i, 'face')
    ;[this._loop, i] = getRefNode(record, i, 'loop')
    ;[this._shell, i] = getRefNode(record, i, 'shell')
    ;[this._subshell, i] = getRefNode(record, i, 'subshell')
    ;[this._surface, i] = getRefNode(record, i, 'surface')
    ;[this.sense, i] = getEnumByTag(record.chunks, i, SENSE)

    // Handle sides
    const [sides, i2] = getEnumByTag(record.chunks, i, SIDES)
    this.sides = sides
    i = i2
    if (sides === 'double') {
      ;[this.side, i] = getEnumByTag(record.chunks, i, SIDE)
    }

    // Version-specific containment
    if (getVersion() > 5.0) {
      ;[this.containment, i] = getEnumByTag(record.chunks, i, { 0: 'unset', 1: 'set' })
    }

    return i
  }

  getNext() {
    return this._next ? this._next.entity : null
  }

  getLoop() {
    return this._loop ? this._loop.entity : null
  }

  getSurface() {
    return this._surface ? this._surface.entity : null
  }

  getParent() {
    return this._shell ? this._shell.entity : null
  }

  /**
   * Get all loops in this face
   */
  getLoops() {
    const loops = []
    let loop = this.getLoop()
    const visited = new Set()
    while (loop && !visited.has(loop.index)) {
      visited.add(loop.index)
      loops.push(loop)
      loop = loop.getNext()
    }
    return loops
  }

  build() {
    if (this._readyToBuild) {
      this._readyToBuild = false
      // Build logic
    }
    return this.shape
  }
}

// ============================================================================
// Loop Entity
// ============================================================================

/**
 * Loop entity - container for coedges
 */
class Loop extends Topology {
  constructor() {
    super()
    this._next = null    // Next loop in face
    this._coedge = null  // First coedge
    this._face = null    // Owning face
  }

  set(record) {
    let i = super.set(record)
    ;[this._next, i] = getRefNode(record, i, 'loop')
    ;[this._coedge, i] = getRefNode(record, i, 'coedge')
    ;[this._face, i] = getRefNode(record, i, 'face')
    return i
  }

  getNext() {
    return this._next ? this._next.entity : null
  }

  getCoedge() {
    return this._coedge ? this._coedge.entity : null
  }

  getParent() {
    return this._face ? this._face.entity : null
  }

  /**
   * Get all coedges in this loop
   */
  getCoedges() {
    const coedges = []
    let coedge = this.getCoedge()
    const visited = new Set()
    while (coedge && !visited.has(coedge.index)) {
      visited.add(coedge.index)
      coedges.push(coedge)
      coedge = coedge.getNext()
    }
    return coedges
  }

  build() {
    if (this._readyToBuild) {
      this._readyToBuild = false
      // Build logic
    }
    return this.shape
  }
}

// ============================================================================
// Wire Entity
// ============================================================================

/**
 * Wire entity - standalone edge container
 */
class Wire extends Topology {
  constructor() {
    super()
    this._next = null
    this._coedge = null
    this._owner = null  // Shell or body
  }

  set(record) {
    let i = super.set(record)
    ;[this._next, i] = getRefNode(record, i, 'wire')
    ;[this._coedge, i] = getRefNode(record, i, 'coedge')
    ;[this._owner, i] = getRefNode(record, i, null)
    return i
  }

  getNext() {
    return this._next ? this._next.entity : null
  }

  getCoedge() {
    return this._coedge ? this._coedge.entity : null
  }

  getParent() {
    return this._owner ? this._owner.entity : null
  }
}

// ============================================================================
// CoEdge Entity
// ============================================================================

/**
 * CoEdge entity - edge with direction/sense in a loop
 */
class CoEdge extends Topology {
  constructor() {
    super()
    this._next = null      // Next coedge in loop
    this._previous = null  // Previous coedge in loop
    this._partner = null   // Partner coedge (shared edge)
    this._edge = null      // Edge geometry
    this._owner = null     // Owning loop or wire
    this._pcurve = null    // Parameter curve on surface
    this.sense = 'forward'
  }

  set(record) {
    let i = super.set(record)
    ;[this._next, i] = getRefNode(record, i, 'coedge')
    ;[this._previous, i] = getRefNode(record, i, 'coedge')
    ;[this._partner, i] = getRefNode(record, i, 'coedge')
    ;[this._edge, i] = getRefNode(record, i, 'edge')
    ;[this.sense, i] = getEnumByTag(record.chunks, i, SENSE)
    ;[this._owner, i] = getRefNode(record, i, null) // loop or wire

    // Optional pcurve
    if (i < record.chunks.length && record.chunks[i].tag === TAG_ENTITY_REF) {
      ;[this._pcurve, i] = getRefNode(record, i, 'pcurve')
    }

    return i
  }

  getNext() {
    return this._next ? this._next.entity : null
  }

  getPrevious() {
    return this._previous ? this._previous.entity : null
  }

  getPartner() {
    return this._partner ? this._partner.entity : null
  }

  getEdge() {
    return this._edge ? this._edge.entity : null
  }

  getParent() {
    return this._owner ? this._owner.entity : null
  }

  getPcurve() {
    return this._pcurve ? this._pcurve.entity : null
  }

  build() {
    if (this._readyToBuild) {
      this._readyToBuild = false
      const edge = this.getEdge()
      if (edge) {
        this.shape = edge.build()
        if (this.shape && this.sense === 'reversed') {
          // Reverse the shape
        }
      }
    }
    return this.shape
  }
}

/**
 * Tolerant CoEdge
 */
class CoEdgeTolerance extends CoEdge {
  constructor() {
    super()
    this.tolerance = 0.0
  }

  set(record) {
    let i = super.set(record)
    ;[this.tolerance, i] = getFloat(record.chunks, i)
    return i
  }
}

// ============================================================================
// Edge Entity
// ============================================================================

/**
 * Edge entity - curve between two vertices
 */
class Edge extends Topology {
  constructor() {
    super()
    this._start = null   // Start vertex
    this._end = null     // End vertex
    this._owner = null   // Owning coedge
    this._curve = null   // Curve geometry
    this.sense = 'forward'
  }

  set(record) {
    let i = super.set(record)
    ;[this._start, i] = getRefNode(record, i, 'vertex')

    // Version-specific handling
    if (getAsmMajor() > 217) {
      i += 1 // skip
    }

    ;[this._end, i] = getRefNode(record, i, 'vertex')
    ;[this._owner, i] = getRefNode(record, i, 'coedge')
    ;[this._curve, i] = getRefNode(record, i, 'curve')
    ;[this.sense, i] = getEnumByTag(record.chunks, i, SENSE)

    return i
  }

  getStart() {
    const v = this._start ? this._start.entity : null
    return v ? v.getPosition() : null
  }

  getEnd() {
    const v = this._end ? this._end.entity : null
    return v ? v.getPosition() : null
  }

  getCurve() {
    return this._curve ? this._curve.entity : null
  }

  getParent() {
    return this._owner ? this._owner.entity : null
  }

  getPoints() {
    const points = []
    const ptStart = this._start ? this._start.entity : null
    if (ptStart) points.push(ptStart.getPosition())
    const ptEnd = this._end ? this._end.entity : null
    if (ptEnd && ptEnd.index !== (ptStart ? ptStart.index : -1)) {
      points.push(ptEnd.getPosition())
    }
    return points
  }

  build() {
    if (this._readyToBuild) {
      this._readyToBuild = false
      const curve = this.getCurve()
      if (curve) {
        const p1 = this.getStart()
        const p2 = this.getEnd()
        this.shape = curve.build(p1, p2)
        if (this.shape && this.sense === 'reversed') {
          // Reverse the shape
        }
      }
    }
    return this.shape
  }
}

/**
 * Tolerant Edge
 */
class EdgeTolerance extends Edge {
  constructor() {
    super()
    this.tolerance = 0.0
  }

  set(record) {
    let i = super.set(record)
    // Tolerance is read in parent class for some versions
    return i
  }
}

// ============================================================================
// Vertex Entity
// ============================================================================

/**
 * Vertex entity - point in topology
 */
class Vertex extends Topology {
  constructor() {
    super()
    this._owner = null  // Owning edge
    this._point = null  // Point geometry
    this.count = -1     // Number of edges using this vertex
  }

  set(record) {
    let i = super.set(record)
    ;[this._owner, i] = getRefNode(record, i, 'edge')

    if (getAsmMajor() > 217) {
      i += 1 // skip
    }

    // Inventor workaround
    if (record.chunks[i] && record.chunks[i].tag !== TAG_ENTITY_REF) {
      i += 1 // skip count
    }

    ;[this._point, i] = getRefNode(record, i, 'point')

    return i
  }

  getParent() {
    return this._owner ? this._owner.entity : null
  }

  getPoint() {
    return this._point ? this._point.entity : null
  }

  getPosition() {
    const p = this.getPoint()
    return p ? p.position : null
  }
}

/**
 * Tolerant Vertex
 */
class VertexTolerance extends Vertex {
  constructor() {
    super()
    this.tolerance = 0.0
  }

  set(record) {
    let i = super.set(record)
    ;[this.tolerance, i] = getFloat(record.chunks, i)

    if (getAsmMajor() > 217) {
      i += 2 // skip floats
    }

    return i
  }
}

// ============================================================================
// Cell Entities (for cellular topology)
// ============================================================================

class Cell extends Topology {
  constructor() {
    super()
  }
}

class Cell3d extends Cell {
  constructor() {
    super()
  }
}

class CFace extends Topology {
  constructor() {
    super()
  }
}

class CShell extends Topology {
  constructor() {
    super()
  }
}


  // ============================================================================
  // curves.js
  // ============================================================================

/**
 * ACIS Curve Classes
 * Curve geometry classes: Straight, Ellipse, IntCurve, etc.
 * Ported from Acis.py lines 2063-2700
 */






// ============================================================================
// Base Geometry Class
// ============================================================================

/**
 * Base class for geometry entities (curves, surfaces, points)
 */
class Geometry extends Entity {
  constructor(name) {
    super()
    this.__name__ = name
  }

  set(record) {
    let i = super.set(record)

    // Version-specific skip
    if (getVersion() > 10.0 && !isASM()) {
      i += 1
    }
    if (getVersion() > 6.0) {
      const [anyRef, i2] = getRefNode(record, i, null)
      i = i2
    }

    return i
  }

  getSatTextGeometry(index) {
    return this.record.chunks.slice(index).map(c => c.toString()).join(' ')
  }

  toString() {
    if (!this.record) {
      if (this.ref !== undefined) {
        return `${this.__name__} { ref ${this.ref} }`
      }
      if (this.subtype) {
        return `${this.__name__} { ${this.subtype} ... }`
      }
      return `${this.__name__} { ... }`
    }
    return super.toString()
  }
}

// ============================================================================
// Base Curve Class
// ============================================================================

/**
 * Base class for curves
 */
class Curve extends Geometry {
  constructor(name) {
    super(name)
    this.shape = null
  }

  setSubtype(chunks, index) {
    return index
  }

  set(record) {
    let i = super.set(record)
    i = this.setSubtype(record.chunks, i)
    return i
  }

  /**
   * Build curve shape between start and end points
   * Default: creates a line segment (fallback)
   */
  build(start, end) {
    console.warn(`Curve '${this.constructor.name}' not yet supported - forced to straight-curve`)
    if (this._readyToBuild) {
      this._readyToBuild = false
      // Force everything to straight line as fallback
      if (start && end) {
        this.shape = { type: 'line', start, end }
      }
    }
    return this.shape
  }
}

// ============================================================================
// Straight Curve
// ============================================================================

/**
 * Straight line curve
 */
class CurveStraight extends Curve {
  constructor() {
    super('straight')
    this.origin = { ...CENTER }
    this.direction = { ...DIR_X }
    this.range = new Interval(new Range('I', MIN_INF), new Range('I', MAX_INF))
  }

  setSubtype(chunks, index) {
    let i = index
    ;[this.origin, i] = getLocation(chunks, i)
    ;[this.direction, i] = getVector(chunks, i)
    ;[this.range, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())
    return i
  }

  build(start, end) {
    if (this._readyToBuild) {
      this._readyToBuild = false
      const p1 = start || this.origin
      const p2 = end || {
        x: this.origin.x + this.direction.x,
        y: this.origin.y + this.direction.y,
        z: this.origin.z + this.direction.z
      }
      this.shape = { type: 'line', origin: this.origin, direction: this.direction, start: p1, end: p2 }
    }
    return this.shape
  }
}

// ============================================================================
// Ellipse Curve
// ============================================================================

/**
 * Ellipse/Circle curve
 */
class CurveEllipse extends Curve {
  constructor() {
    super('ellipse')
    this.center = { ...CENTER }
    this.axis = { ...DIR_Z }
    this.major = { ...DIR_X }
    this.ratio = MIN_0
    this.range = new Interval(new Range('I', MIN_0), new Range('I', MAX_2PI))
  }

  setSubtype(chunks, index) {
    let i = index
    ;[this.center, i] = getLocation(chunks, i)
    ;[this.axis, i] = getVector(chunks, i)
    ;[this.major, i] = getLocation(chunks, i)
    ;[this.ratio, i] = getFloat(chunks, i)
    ;[this.range, i] = getInterval(chunks, i, MIN_0, MAX_2PI, 1.0)
    return i
  }

  isCircle() {
    return Math.abs(this.ratio - 1.0) < 1e-6
  }

  getMajorRadius() {
    return Math.sqrt(this.major.x ** 2 + this.major.y ** 2 + this.major.z ** 2)
  }

  getMinorRadius() {
    return this.getMajorRadius() * this.ratio
  }

  build(start, end) {
    if (this._readyToBuild) {
      this._readyToBuild = false
      this.shape = {
        type: this.isCircle() ? 'circle' : 'ellipse',
        center: this.center,
        axis: this.axis,
        major: this.major,
        majorRadius: this.getMajorRadius(),
        minorRadius: this.getMinorRadius(),
        ratio: this.ratio,
        range: this.range,
        start, end
      }
    }
    return this.shape
  }
}

// ============================================================================
// Degenerate Curve
// ============================================================================

/**
 * Degenerate curve (single point)
 */
class CurveDegenerate extends Curve {
  constructor() {
    super('degenerate')
    this.start = { ...CENTER }
    this.range = new Interval(new Range('I', MIN_INF), new Range('I', MAX_INF))
  }

  setSubtype(chunks, index) {
    let i = index
    ;[this.start, i] = getLocation(chunks, i)
    ;[this.range, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
    return i
  }

  build(start, end) {
    this.shape = { type: 'point', position: this.start }
    return this.shape
  }
}

// ============================================================================
// Compound Curve
// ============================================================================

/**
 * Compound curve (multiple segments)
 */
class CurveComp extends Curve {
  constructor() {
    super('compcurv')
    this.curves = []
  }

  setSubtype(chunks, index) {
    // Compound curve parsing - depends on version
    return index
  }
}

// ============================================================================
// IntCurve (Interpolated/Spline Curve)
// ============================================================================

/**
 * Interpolated curve (B-spline, etc.)
 */
class CurveInt extends Curve {
  constructor(name = '', subtype = 'cur_int') {
    super(name + 'intcurve')
    this.sense = 'forward'
    this.range = new Interval(new Range('I', MIN_INF), new Range('I', MAX_INF))
    this.subtype = subtype
    this.spline = null
    this.curve = null
    this.tolerance = 0.0
    this.singularity = 'full'
  }

  toString() {
    const senseStr = SENSE[this.sense] || this.sense
    return `${this.__name__} ${senseStr} {${this.subtype} ...}`
  }

  getSurface() {
    return this.surface || null
  }

  setProjectionSurface(surface, curve) {
    if (surface !== null) {
      this.surface = surface
      if (curve !== null) {
        this.surfaceProjection = { surface, curve }
        return true
      }
    }
    return false
  }

  setSubtype(chunks, index) {
    if (index >= chunks.length) return index

    const chunk = chunks[index]
    const val = chunk.val || chunk.value

    // Check for subtype open bracket or subtype name
    if (chunk.tag === TAG_UTF8_U8 || chunk.tag === TAG_IDENT || chunk.tag === TAG_SUBIDENT) {
      // Parse based on subtype
      return this._parseSubtype(chunks, index, val)
    }

    return index
  }

  _parseSubtype(chunks, index, subtype) {
    let i = index + 1 // Skip the subtype identifier

    // Route to specific handler
    switch (subtype) {
      case 'cur_int':
      case 'int_cur':
        return this.setCurve(chunks, i)
      case 'helix_int_cur':
        return this.setHelix(chunks, i)
      case 'law_int_cur':
        return this.setLaw(chunks, i)
      case 'off_int_cur':
        return this.setOff(chunks, i)
      case 'offset_int_cur':
        return this.setOffset(chunks, i)
      case 'proj_int_cur':
        return this.setProject(chunks, i)
      case 'exact_int_cur':
        return this.setExact(chunks, i)
      default:
        this.subtype = subtype
        return this.setCurve(chunks, i)
    }
  }

  setCurve(chunks, index) {
    let i = index
    ;[this.singularity, i] = getSingularity(chunks, i)

    if (this.singularity === 'full') {
      // Read B-spline curve data
      // This would call readBS3Curve from spline.js
      ;[this.tolerance, i] = getLength(chunks, i)
    } else if (this.singularity === 'none') {
      ;[this.range, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())
      const [val, i2] = chunks[i] ? [chunks[i].val, i + 1] : [null, i]
      if (typeof val === 'number') {
        this.tolerance = val
        i = i2
      }
    } else if (this.singularity === 'summary') {
      if (getVersion() >= 16.0 && !isASM()) {
        i += 1
      }
      ;[this.arr, i] = getFloatArray(chunks, i)
      ;[this.fac, i] = getFloat(chunks, i)
      ;[this.closure, i] = getEnumByValue(chunks, i, CLOSURE)
    } else if (this.singularity === 'v') {
      this.spline = new BS_Curve(false, false, 3)
      ;[this.spline.uKnots, i] = getFloatArray(chunks, i)
      this.spline.uMults = new Array(this.spline.uKnots.length).fill(3)
      ;[this.tolerance, i] = getLength(chunks, i)
      ;[this.f2, i] = getFloat(chunks, i)
    }

    return i
  }

  setHelix(chunks, index) {
    this.helix = new Helix()
    let i = index
    ;[this.helix.radAngles, i] = getInterval(chunks, i, MIN_0, MAX_2PI, 1.0)
    ;[this.helix.posCenter, i] = getLocation(chunks, i)
    ;[this.helix.dirMajor, i] = getLocation(chunks, i)
    ;[this.helix.dirMinor, i] = getLocation(chunks, i)
    ;[this.helix.dirPitch, i] = getLocation(chunks, i)
    ;[this.helix.facApex, i] = getFloat(chunks, i)
    ;[this.helix.vecAxis, i] = getVector(chunks, i)

    // Read surfaces and pcurves (usually null)
    // s1, p1, s2, p2
    // ...

    this.shape = { type: 'helix', helix: this.helix }
    this._readyToBuild = false

    return i
  }

  setLaw(chunks, index) {
    this.subtype = 'law_int_cur'
    let i = this.setCurve(chunks, index)
    // Read law formula
    return i
  }

  setOff(chunks, index) {
    this.subtype = 'off_int_cur'
    let i = this.setCurve(chunks, index)
    ;[this.left, i] = getLength(chunks, i)
    ;[this.right, i] = getLength(chunks, i)
    return i
  }

  setOffset(chunks, index) {
    this.subtype = 'offset_int_cur'
    let i = this.setCurve(chunks, index)
    // Read offset data
    return i
  }

  setProject(chunks, index) {
    this.subtype = 'proj_int_cur'
    let i = this.setCurve(chunks, index)
    return i
  }

  setExact(chunks, index) {
    this.subtype = 'exact_int_cur'
    let i = this.setCurve(chunks, index)
    return i
  }

  build(start, end) {
    if (this._readyToBuild) {
      this._readyToBuild = false

      if (this.helix) {
        this.shape = { type: 'helix', helix: this.helix, start, end }
      } else if (this.spline) {
        this.shape = {
          type: 'bspline_curve',
          spline: this.spline,
          start, end
        }
      } else {
        // Fallback to line
        if (start && end) {
          this.shape = { type: 'line', start, end }
        }
      }
    }
    return this.shape
  }
}

// ============================================================================
// IntCurveInt (Nested interpolated curve)
// ============================================================================

class CurveIntInt extends CurveInt {
  constructor() {
    super('intcurve-')
  }
}

// ============================================================================
// PCurve (Parameter curve on surface)
// ============================================================================

class CurveP extends Geometry {
  constructor() {
    super('pcurve')
    this._surface = null
    this._curve = null
    this.range = new Interval(new Range('I', MIN_INF), new Range('I', MAX_INF))
  }

  set(record) {
    let i = super.set(record)

    // Read surface and 2D curve references
    ;[this._surface, i] = getRefNode(record, i, 'surface')

    // PCurve data parsing depends on version
    return i
  }

  getSurface() {
    return this._surface ? this._surface.entity : null
  }

  getCurve() {
    return this._curve ? this._curve.entity : null
  }
}

// ============================================================================
// Export CURVE_TYPES for type mapping
// ============================================================================

const CURVE_TYPES = {
  // Basic subtypes
  'cur_int': ['setCurve', 0, false],
  'int_cur': ['setSurfaceCurve', 1, true],

  // Specific subtypes
  'blend_int_cur': ['setBlendSpring', 1, true],
  'comp_int_cur': ['setComp', 1, true],
  'defm_int_cur': ['setDefm', 1, true],
  'exact_int_cur': ['setExact', 1, true],
  'helix_int_cur': ['setHelix', 1, true],
  'int_int_cur': ['setInt', 1, true],
  'law_int_cur': ['setLaw', 1, true],
  'off_int_cur': ['setOff', 1, true],
  'offset_int_cur': ['setOffset', 1, true],
  'off_surf_int_cur': ['setOffsetSurface', 1, true],
  'ortho_int_cur': ['setOrtho', 1, true],
  'para_int_cur': ['setParameter', 1, true],
  'proj_int_cur': ['setProject', 1, true],
  'spring_int_cur': ['setBlendSpring', 1, true],
  'sss_int_cur': ['setSSS', 1, true],
  'surf_int_cur': ['setSurfaceCurve', 1, true]
}


  // ============================================================================
  // surfaces.js
  // ============================================================================

/**
 * ACIS Surface Classes
 * Surface geometry classes: Plane, Cone, Sphere, Torus, Spline, etc.
 * Ported from Acis.py lines 2700-4086
 */






// ============================================================================
// Base Surface Class
// ============================================================================

/**
 * Base class for surfaces
 */
class Surface extends Geometry {
  constructor(name) {
    super(name)
    this.shape = null
  }

  setSubtype(chunks, index) {
    return index
  }

  set(record) {
    let i = super.set(record)
    i = this.setSubtype(record.chunks, i)
    return i
  }

  build(face = null) {
    console.warn(`Surface '${this.constructor.name}' build() not implemented`)
    return this.shape
  }
}

// ============================================================================
// Plane Surface
// ============================================================================

/**
 * Plane surface
 */
class SurfacePlane extends Surface {
  constructor() {
    super('plane')
    this.origin = { ...CENTER }
    this.normal = { ...DIR_Z }
    this.uDir = { ...DIR_X }
    this.sensev = 'forward_v'
    this.uRange = new Interval(new Range('I', MIN_INF), new Range('I', MAX_INF))
    this.vRange = new Interval(new Range('I', MIN_INF), new Range('I', MAX_INF))
  }

  setSubtype(chunks, index) {
    let i = index
    ;[this.origin, i] = getLocation(chunks, i)
    ;[this.normal, i] = getVector(chunks, i)
    ;[this.uDir, i] = getLocation(chunks, i)
    ;[this.sensev, i] = getEnumByTag(chunks, i, SENSEV)
    ;[this.uRange, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())
    ;[this.vRange, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())
    return i
  }

  build(face = null) {
    if (this._readyToBuild) {
      this._readyToBuild = false
      this.shape = {
        type: 'plane',
        origin: this.origin,
        normal: this.normal,
        uDir: this.uDir
      }
    }
    return this.shape
  }
}

// ============================================================================
// Cone Surface
// ============================================================================

/**
 * Cone surface
 */
class SurfaceCone extends Surface {
  constructor() {
    super('cone')
    this.center = { ...CENTER }
    this.axis = { ...DIR_Z }
    this.majorRadius = 1.0
    this.minorRadius = 1.0
    this.ratio = 1.0
    this.semiAngle = Math.PI / 4
    this.uvOrigin = { ...DIR_X }
    this.sensev = 'forward_v'
    this.uRange = new Interval(new Range('I', MIN_0), new Range('I', MAX_2PI))
    this.vRange = new Interval(new Range('I', MIN_INF), new Range('I', MAX_INF))
  }

  setSubtype(chunks, index) {
    let i = index
    ;[this.center, i] = getLocation(chunks, i)
    ;[this.axis, i] = getVector(chunks, i)
    ;[this.majorRadius, i] = getLength(chunks, i)
    ;[this.ratio, i] = getFloat(chunks, i)
    ;[this.uvOrigin, i] = getLocation(chunks, i)
    ;[this.semiAngle, i] = getFloat(chunks, i)
    ;[this.sensev, i] = getEnumByTag(chunks, i, SENSEV)
    ;[this.uRange, i] = getInterval(chunks, i, MIN_0, MAX_2PI, 1.0)
    ;[this.vRange, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())
    return i
  }

  getMinorRadius() {
    return this.majorRadius * this.ratio
  }

  isCircular() {
    return Math.abs(this.ratio - 1.0) < 1e-6
  }

  build(face = null) {
    if (this._readyToBuild) {
      this._readyToBuild = false
      this.shape = {
        type: 'cone',
        center: this.center,
        axis: this.axis,
        majorRadius: this.majorRadius,
        minorRadius: this.getMinorRadius(),
        semiAngle: this.semiAngle,
        uvOrigin: this.uvOrigin
      }
    }
    return this.shape
  }
}

// ============================================================================
// Sphere Surface
// ============================================================================

/**
 * Sphere surface
 */
class SurfaceSphere extends Surface {
  constructor() {
    super('sphere')
    this.center = { ...CENTER }
    this.radius = 1.0
    this.uvOrigin = { ...DIR_Z }
    this.pole = { ...DIR_X }
    this.sensev = 'forward_v'
    this.uRange = new Interval(new Range('I', MIN_0), new Range('I', MAX_2PI))
    this.vRange = new Interval(new Range('I', -Math.PI / 2), new Range('I', Math.PI / 2))
  }

  setSubtype(chunks, index) {
    let i = index
    ;[this.center, i] = getLocation(chunks, i)
    ;[this.radius, i] = getLength(chunks, i)
    ;[this.uvOrigin, i] = getLocation(chunks, i)
    ;[this.pole, i] = getLocation(chunks, i)
    ;[this.sensev, i] = getEnumByTag(chunks, i, SENSEV)
    ;[this.uRange, i] = getInterval(chunks, i, MIN_0, MAX_2PI, 1.0)
    ;[this.vRange, i] = getInterval(chunks, i, -Math.PI / 2, Math.PI / 2, 1.0)
    return i
  }

  build(face = null) {
    if (this._readyToBuild) {
      this._readyToBuild = false
      this.shape = {
        type: 'sphere',
        center: this.center,
        radius: this.radius
      }
    }
    return this.shape
  }
}

// ============================================================================
// Torus Surface
// ============================================================================

/**
 * Torus surface
 */
class SurfaceTorus extends Surface {
  constructor() {
    super('torus')
    this.center = { ...CENTER }
    this.axis = { ...DIR_Z }
    this.major = 1.0
    this.minor = 0.1
    this.uvOrigin = { ...CENTER }
    this.sensev = 'forward_v'
    this.uRange = new Interval(new Range('I', MIN_0), new Range('I', MAX_2PI))
    this.vRange = new Interval(new Range('I', MIN_0), new Range('I', MAX_2PI))
  }

  setSubtype(chunks, index) {
    let i = index
    ;[this.center, i] = getLocation(chunks, i)
    ;[this.axis, i] = getVector(chunks, i)
    ;[this.major, i] = getLength(chunks, i)
    ;[this.minor, i] = getLength(chunks, i)
    ;[this.uvOrigin, i] = getLocation(chunks, i)
    ;[this.sensev, i] = getEnumByTag(chunks, i, SENSEV)
    ;[this.uRange, i] = getInterval(chunks, i, MIN_0, MAX_2PI, 1.0)
    ;[this.vRange, i] = getInterval(chunks, i, MIN_0, MAX_2PI, 1.0)
    return i
  }

  build(face = null) {
    if (this._readyToBuild) {
      this._readyToBuild = false
      this.shape = {
        type: 'torus',
        center: this.center,
        axis: this.axis,
        majorRadius: Math.abs(this.major),
        minorRadius: Math.abs(this.minor)
      }
    }
    return this.shape
  }
}

// ============================================================================
// Mesh Surface
// ============================================================================

/**
 * Mesh/Faceted surface
 */
class SurfaceMesh extends Surface {
  constructor() {
    super('meshsurf')
    this.vertices = []
    this.faces = []
  }

  setSubtype(chunks, index) {
    // Parse mesh data
    return index
  }

  build(face = null) {
    if (this._readyToBuild) {
      this._readyToBuild = false
      this.shape = {
        type: 'mesh',
        vertices: this.vertices,
        faces: this.faces
      }
    }
    return this.shape
  }
}

// ============================================================================
// Spline Surface
// ============================================================================

/**
 * Spline (B-spline) surface - handles many subtypes
 */
class SurfaceSpline extends Surface {
  constructor() {
    super('spline')
    this.surface = null
    this.spline = null
    this.tolerance = 0.0
    this.sense = 'forward'
    this.subtype = 'spl_sur'
  }

  toString() {
    const senseStr = SENSE[this.sense] || this.sense
    return `${this.__name__} ${senseStr} {${this.subtype} ...}`
  }

  setSubtype(chunks, index) {
    if (index >= chunks.length) return index

    const chunk = chunks[index]
    const val = chunk.val || chunk.value

    // Check for sense first
    if (val === 'forward' || val === 'reversed') {
      this.sense = val
      return this._parseSubtype(chunks, index + 1)
    }

    return this._parseSubtype(chunks, index)
  }

  _parseSubtype(chunks, index) {
    if (index >= chunks.length) return index

    const chunk = chunks[index]
    const val = chunk.val || chunk.value

    if (typeof val !== 'string') return index

    // Route based on subtype
    const handler = SURFACE_TYPES[val]
    if (handler) {
      const [method, version, inventor] = handler
      this.subtype = val
      if (typeof this[method] === 'function') {
        return this[method](chunks, index + 1, inventor)
      }
    }

    // Default: try to read as spline surface
    return this.setSurfaceShape(chunks, index, false)
  }

  setSurfaceShape(chunks, index, inventor, subtype = 'spl_sur') {
    this.subtype = subtype
    let i = index
    // Would read spline surface data via readSplineSurface
    // For now just mark index
    return i
  }

  setRotation(chunks, index, inventor) {
    this.subtype = 'rot_spl_sur'
    let i = this.setSurfaceShape(chunks, index, inventor, 'rot_spl_sur')
    // Read rotation profile
    return i
  }

  setSweep(chunks, index, inventor) {
    this.subtype = 'sweep_spl_sur'
    let i = this.setSurfaceShape(chunks, index, inventor, 'sweep_spl_sur')
    // Read sweep data
    return i
  }

  setLoft(chunks, index, inventor) {
    this.subtype = 'loft_spl_sur'
    let i = this.setSurfaceShape(chunks, index, inventor, 'loft_spl_sur')
    // Read loft data
    return i
  }

  setRule(chunks, index, inventor) {
    this.subtype = 'rule_sur'
    let i = this.setSurfaceShape(chunks, index, inventor, 'rule_sur')
    // Read ruled surface data
    return i
  }

  setOffset(chunks, index, inventor) {
    this.subtype = 'off_spl_sur'
    let i = this.setSurfaceShape(chunks, index, inventor, 'off_spl_sur')
    // Read offset data
    return i
  }

  setCylinder(chunks, index, inventor) {
    this.subtype = 'cyl_spl_sur'
    let i = this.setSurfaceShape(chunks, index, inventor, 'cyl_spl_sur')
    return i
  }

  setExact(chunks, index, inventor) {
    this.subtype = 'exact_spl_sur'
    let i = this.setSurfaceShape(chunks, index, inventor, 'exact_spl_sur')
    return i
  }

  setNet(chunks, index, inventor) {
    this.subtype = 'net_spl_sur'
    let i = this.setSurfaceShape(chunks, index, inventor, 'net_spl_sur')
    return i
  }

  setOrtho(chunks, index, inventor) {
    this.subtype = 'ortho_spl_sur'
    let i = this.setSurfaceShape(chunks, index, inventor, 'ortho_spl_sur')
    return i
  }

  setRbBlend(chunks, index, inventor) {
    this.subtype = 'rb_blend_spl_sur'
    let i = this.setSurfaceShape(chunks, index, inventor, 'rb_blend_spl_sur')
    return i
  }

  setG2Blend(chunks, index, inventor) {
    this.subtype = 'g2_blend_spl_sur'
    let i = this.setSurfaceShape(chunks, index, inventor, 'g2_blend_spl_sur')
    return i
  }

  setSkin(chunks, index, inventor) {
    this.subtype = 'skin_spl_sur'
    let i = this.setSurfaceShape(chunks, index, inventor, 'skin_spl_sur')
    return i
  }

  setSum(chunks, index, inventor) {
    this.subtype = 'sum_spl_sur'
    let i = this.setSurfaceShape(chunks, index, inventor, 'sum_spl_sur')
    return i
  }

  setVertexBlend(chunks, index, inventor) {
    this.subtype = 'VBL_SURF'
    let i = this.setSurfaceShape(chunks, index, inventor, 'VBL_SURF')
    return i
  }

  setDefm(chunks, index, inventor) {
    this.subtype = 'defm_spl_sur'
    let i = this.setSurfaceShape(chunks, index, inventor, 'defm_spl_sur')
    return i
  }

  getSurface() {
    let sNext = this
    let ref = null
    while (sNext && sNext.subtype === 'ref') {
      if (ref === null) {
        ref = sNext.ref
      } else if (ref >= sNext.ref) {
        sNext = null
        break
      }
      sNext = sNext.surface
      if (sNext === null) break
    }
    return sNext
  }

  build(face = null) {
    if (this._readyToBuild) {
      this._readyToBuild = false

      if (this.spline) {
        this.shape = {
          type: 'bspline_surface',
          spline: this.spline
        }
      } else if (this.surface && typeof this.surface.build === 'function') {
        this.shape = this.surface.build()
      } else {
        this.shape = {
          type: 'spline_surface',
          subtype: this.subtype
        }
      }
    }
    return this.shape
  }
}

// ============================================================================
// Surface Type Handlers
// ============================================================================

const SURFACE_TYPES = {
  'cylsur': ['setCylinder', 0, false],
  'cyl_spl_sur': ['setCylinder', 1, true],
  'defmsur': ['setDefm', 0, false],
  'defm_spl_sur': ['setDefm', 1, true],
  'exactsur': ['setExact', 0, false],
  'exact_spl_sur': ['setExact', 1, true],
  'g2blnsur': ['setG2Blend', 0, false],
  'g2_blend_spl_sur': ['setG2Blend', 1, true],
  'loftsur': ['setLoft', 0, false],
  'loft_spl_sur': ['setLoft', 1, true],
  'netsur': ['setNet', 0, false],
  'net_spl_sur': ['setNet', 1, true],
  'offsur': ['setOffset', 0, false],
  'off_spl_sur': ['setOffset', 1, true],
  'orthosur': ['setOrtho', 0, false],
  'ortho_spl_sur': ['setOrtho', 1, true],
  'rbblnsur': ['setRbBlend', 0, false],
  'rb_blend_spl_sur': ['setRbBlend', 1, true],
  'rotsur': ['setRotation', 0, false],
  'rot_spl_sur': ['setRotation', 1, true],
  'rulesur': ['setRule', 0, false],
  'rule_sur': ['setRule', 1, true],
  'skinsur': ['setSkin', 0, false],
  'skin_spl_sur': ['setSkin', 1, true],
  'sweepsur': ['setSweep', 0, false],
  'sweep_spl_sur': ['setSweep', 1, true],
  'sweep_sur': ['setSweep', 1, true],
  'sumsur': ['setSum', 0, false],
  'sum_spl_sur': ['setSum', 1, true],
  'vertexblendsur': ['setVertexBlend', 0, false],
  'VBL_SURF': ['setVertexBlend', 1, true],
  // ASM Extensions
  'cl_loft_spl_sur': ['setClLoft', 1, true],
  'comp_spl_sur': ['setCompound', 1, true],
  'helix_spl_circ': ['setHelixCircle', 1, true],
  'helix_spl_line': ['setHelixLine', 1, true],
  't_spl_sur': ['setTSpline', 1, true]
}


  // ============================================================================
  // attributes.js
  // ============================================================================

/**
 * ACIS Attribute Classes
 * Attribute entities for colors, names, and metadata
 * Ported from Acis.py lines 4133-4700
 */



// ============================================================================
// Base Attributes Class
// ============================================================================

/**
 * Base class for attribute entities
 */
class Attributes extends Entity {
  constructor() {
    super()
    this._next = null
    this._previous = null
    this._owner = null
  }

  set(record) {
    let i = super.set(record)
    ;[this._next, i] = getRefNode(record, i, 'attrib')
    ;[this._previous, i] = getRefNode(record, i, 'attrib')
    ;[this._owner, i] = getRefNode(record, i, null)
    return i
  }

  getNext() {
    return this._next ? this._next.entity : null
  }

  getPrevious() {
    return this._previous ? this._previous.entity : null
  }

  getOwner() {
    return this._owner ? this._owner.entity : null
  }
}

// ============================================================================
// Attrib Base
// ============================================================================

class Attrib extends Attributes {
  constructor() {
    super()
  }
}

// ============================================================================
// ADesk (AutoDesk) Attributes
// ============================================================================

class AttribADesk extends Attrib {
  constructor() {
    super()
  }
}

class AttribADeskColor extends AttribADesk {
  constructor() {
    super()
    this.colorIndex = 0
  }

  set(record) {
    let i = super.set(record)
    ;[this.colorIndex, i] = getInteger(record.chunks, i)
    return i
  }
}

class AttribADeskMaterial extends AttribADesk {
  constructor() {
    super()
    this.val1 = 0
    this.val2 = 0
  }

  set(record) {
    let i = super.set(record)
    ;[this.val1, i] = getInteger(record.chunks, i)
    ;[this.val2, i] = getInteger(record.chunks, i)
    return i
  }
}

class AttribADeskTrueColor extends AttribADesk {
  constructor() {
    super()
    this.alpha = 0.0
    this.red = 0.749
    this.green = 0.749
    this.blue = 0.749
  }

  set(record) {
    let i = super.set(record)
    const [rgba, i2] = getInteger(record.chunks, i)
    this.alpha = ((rgba >> 24) & 0xFF) / 255.0
    this.red = ((rgba >> 16) & 0xFF) / 255.0
    this.green = ((rgba >> 8) & 0xFF) / 255.0
    this.blue = (rgba & 0xFF) / 255.0
    return i2
  }

  getColor() {
    return { r: this.red, g: this.green, b: this.blue, a: this.alpha }
  }
}

// ============================================================================
// Ansoft Attributes
// ============================================================================

class AttribAnsoft extends Attrib {
  constructor() {
    super()
  }
}

class AttribAnsoftId extends AttribAnsoft {
  constructor() {
    super()
  }
}

class AttribAnsoftProperties extends AttribAnsoft {
  constructor() {
    super()
  }
}

// ============================================================================
// BT Attributes
// ============================================================================

class AttribBt extends Attrib {
  constructor() {
    super()
  }
}

class AttribBtEntityColor extends AttribBt {
  constructor() {
    super()
  }
}

// ============================================================================
// Gen (Generic) Attributes
// ============================================================================

class AttribGen extends Attrib {
  constructor() {
    super()
  }
}

class AttribGenName extends AttribGen {
  constructor() {
    super()
    this.text = ''
  }

  set(record) {
    let i = super.set(record)
    const vers = getVersion()
    if (vers > 1.7) {
      if (vers < 16.0 || isASM()) {
        i += 4 // Skip [(keep|copy), (keep_keep), (ignore), (copy)]
      }
      ;[this.text, i] = getText(record.chunks, i)
    }
    return i
  }

  getName() {
    return this.text
  }
}

class AttribGenNameInt32 extends AttribGenName {
  constructor() {
    super()
    this.value = 0
  }

  set(record) {
    let i = super.set(record)
    ;[this.value, i] = getInteger(record.chunks, i)
    return i
  }
}

class AttribGenNameInt64 extends AttribGenName {
  constructor() {
    super()
    this.value = 0
  }

  set(record) {
    let i = super.set(record)
    ;[this.value, i] = getInteger(record.chunks, i)
    return i
  }
}

class AttribGenNameString extends AttribGenName {
  constructor() {
    super()
    this.value = ''
  }

  set(record) {
    let i = super.set(record)
    ;[this.value, i] = getText(record.chunks, i)
    return i
  }
}

class AttribGenNameReal extends AttribGenName {
  constructor() {
    super()
    this.value = 0.0
  }

  set(record) {
    let i = super.set(record)
    ;[this.value, i] = getFloat(record.chunks, i)
    return i
  }
}

class AttribGenNameVector extends AttribGenName {
  constructor() {
    super()
    this.value = { x: 0, y: 0, z: 0 }
  }

  set(record) {
    let i = super.set(record)
    const [x, i2] = getFloat(record.chunks, i)
    const [y, i3] = getFloat(record.chunks, i2)
    const [z, i4] = getFloat(record.chunks, i3)
    this.value = { x, y, z }
    return i4
  }
}

// ============================================================================
// ST (Standard) Attributes
// ============================================================================

class AttribSt extends Attrib {
  constructor() {
    super()
  }
}

class AttribStNoMerge extends AttribSt {
  constructor() {
    super()
  }
}

class AttribStNoCombine extends AttribSt {
  constructor() {
    super()
  }
}

class AttribStRgbColor extends AttribSt {
  constructor() {
    super()
    this.red = 0.749
    this.green = 0.749
    this.blue = 0.749
  }

  set(record) {
    let i = super.set(record)
    ;[this.red, i] = getFloat(record.chunks, i)
    ;[this.green, i] = getFloat(record.chunks, i)
    ;[this.blue, i] = getFloat(record.chunks, i)
    return i
  }

  getColor() {
    return { r: this.red, g: this.green, b: this.blue }
  }
}

class AttribStDisplay extends AttribSt {
  constructor() {
    super()
  }
}

class AttribStId extends AttribSt {
  constructor() {
    super()
  }
}

// ============================================================================
// Sys (System) Attributes
// ============================================================================

class AttribSys extends Attrib {
  constructor() {
    super()
  }
}

class AttribSysConvexity extends AttribSys {
  constructor() {
    super()
  }
}

class AttribSysAnnotationAttrib extends AttribSys {
  constructor() {
    super()
  }
}

class AttribSysStichHint extends AttribSys {
  constructor() {
    super()
  }
}

class AttribSysTag extends AttribSys {
  constructor() {
    super()
  }
}

class AttribSysVertedge extends AttribSys {
  constructor() {
    super()
  }
}

// ============================================================================
// TSL Attributes
// ============================================================================

class AttribTsl extends Attrib {
  constructor() {
    super()
  }
}

class AttribTslId extends AttribTsl {
  constructor() {
    super()
  }
}

class AttribTslColour extends AttribTsl {
  constructor() {
    super()
    this.red = 0.749
    this.green = 0.749
    this.blue = 0.749
  }

  set(record) {
    let i = super.set(record)
    ;[this.red, i] = getFloat(record.chunks, i)
    ;[this.green, i] = getFloat(record.chunks, i)
    ;[this.blue, i] = getFloat(record.chunks, i)
    return i
  }

  getColor() {
    return { r: this.red, g: this.green, b: this.blue }
  }
}

// ============================================================================
// Other Attribute Types (stub classes)
// ============================================================================

class AttribAtUfld extends Attrib { constructor() { super() } }
class AttribAtUfldDefmData extends AttribAtUfld { constructor() { super() } }
class AttribAtUfldDevPair extends AttribAtUfld { constructor() { super() } }
class AttribAtUfldFlatBend extends AttribAtUfld { constructor() { super() } }
class AttribAtUfldFfldPosTransf extends AttribAtUfld { constructor() { super() } }
class AttribAtUfldFfldPosTransfMixUfContourRollTrack extends AttribAtUfldFfldPosTransf { constructor() { super() } }
class AttribAtUfldFfldPosTransfMixUfTransformTrack extends AttribAtUfldFfldPosTransf { constructor() { super() } }
class AttribAtUfldNonMergeBend extends AttribAtUfld { constructor() { super() } }
class AttribAtUfldPosTrack extends AttribAtUfld { constructor() { super() } }
class AttribAtUfldPosTrackMixUfRobustPositionTrack extends AttribAtUfldPosTrack { constructor() { super() } }
class AttribAtUfldPosTrackSurfSimp extends AttribAtUfldPosTrack { constructor() { super() } }
class AttribAcadSolidHistoryPersubent extends Attrib { constructor() { super() } }
class AttribCwkBase extends Attrib { constructor() { super() } }
class AttribCwkBaseCswDbid extends AttribCwkBase { constructor() { super() } }
class AttribCustom extends Attrib { constructor() { super() } }
class AttribDesigner extends Attrib { constructor() { super() } }
class AttribDesignerHistory extends AttribDesigner { constructor() { super() } }
class AttribDesignerSurfaceId extends AttribDesigner { constructor() { super() } }
class AttribDesignerOwnerTag extends AttribDesigner { constructor() { super() } }
class AttribDxid extends Attrib { constructor() { super() } }
class AttribEye extends Attrib { constructor() { super() } }
class AttribEyeFMesh extends AttribEye { constructor() { super() } }
class AttribEyePtList extends AttribEye { constructor() { super() } }
class AttribEyeRefVt extends AttribEye { constructor() { super() } }
class AttribFdi extends Attrib { constructor() { super() } }
class AttribFdiLabel extends AttribFdi { constructor() { super() } }
class AttribKcId extends Attrib { constructor() { super() } }
class AttribLwd extends Attrib { constructor() { super() } }
class AttribLwdFMesh extends AttribLwd { constructor() { super() } }
class AttribLwdPtList extends AttribLwd { constructor() { super() } }
class AttribLwdRefVT extends AttribLwd { constructor() { super() } }
class AttribMixOrganization extends Attrib { constructor() { super() } }
class AttribMixOrganizationBendCenterEdge extends AttribMixOrganization { constructor() { super() } }
class AttribMixOrganizationBendExtendedEdge extends AttribMixOrganization { constructor() { super() } }
class AttribMixOrganizationBendExtendedEdgeProgenitorTagIds extends AttribMixOrganization { constructor() { super() } }
class AttribMixOrganizationBendExtendPlane extends AttribMixOrganization { constructor() { super() } }
class AttribMixOrganizationCornerEdge extends AttribMixOrganization { constructor() { super() } }
class AttribMixOrganizationCreEntityQuality extends AttribMixOrganization { constructor() { super() } }
class AttribMixOrganizationDecalEntity extends AttribMixOrganization { constructor() { super() } }
class AttribMixOrganizationDetailEdgeInfo extends AttribMixOrganization { constructor() { super() } }
class AttribMixOrganizationEntityQuality extends AttribMixOrganization { constructor() { super() } }
class AttribMixOrganizationFlangeTrimEdge extends AttribMixOrganization { constructor() { super() } }
class AttribMixOrganizationFlatPatternVis extends AttribMixOrganization { constructor() { super() } }
class AttribMixOrganizationJacobiCornerEdge extends AttribMixOrganization { constructor() { super() } }
class AttribMixOrganizationLimitTrackingFraceFrom extends AttribMixOrganization { constructor() { super() } }
class AttribMixOrganizationLoftedFlangeNotch extends AttribMixOrganization { constructor() { super() } }
class AttribMixOrganizationNoBendRelief extends AttribMixOrganization { constructor() { super() } }
class AttribMixOrganizationNoCenterline extends AttribMixOrganization { constructor() { super() } }
class AttribMixOrganizationRefoldInfo extends AttribMixOrganization { constructor() { super() } }
class AttribMixOrganizationRolExtents extends AttribMixOrganization { constructor() { super() } }
class AttribMixOrganizationSmoothBendEdge extends AttribMixOrganization { constructor() { super() } }
class AttribMixOrganizationTraceFace extends AttribMixOrganization { constructor() { super() } }
class AttribMixOrganizationUfContourRollExtentTrack extends AttribMixOrganization { constructor() { super() } }
class AttribMixOrganizationUfFaceType extends AttribMixOrganization { constructor() { super() } }
class AttribMixOrganizationUfUnrollTrack extends AttribMixOrganization { constructor() { super() } }
class AttribMixOrganizationUnfoldInfo extends AttribMixOrganization { constructor() { super() } }
class AttribNamingMatching extends Attrib { constructor() { super() } }
class AttribNamingMatchingNMxBrepTag extends AttribNamingMatching { constructor() { super() } }
class AttribNamingMatchingNMxBrepTagFeature extends AttribNamingMatchingNMxBrepTag { constructor() { super() } }
class AttribNamingMatchingNMxBrepTagName extends AttribNamingMatchingNMxBrepTag { constructor() { super() } }
// ... many more naming matching subtypes
class AttribRBase extends Attrib { constructor() { super() } }
class AttribRBaseRender extends AttribRBase { constructor() { super() } }
class AttribRfBase extends Attrib { constructor() { super() } }
class AttribRfBaseFaceTracker extends AttribRfBase { constructor() { super() } }
class AttribSg extends Attrib { constructor() { super() } }
class AttribSgPidName extends AttribSg { constructor() { super() } }
class AttribSnl extends Attrib { constructor() { super() } }
class AttribSnlCubitOwner extends AttribSnl { constructor() { super() } }
class AttribCt extends Attrib { constructor() { super() } }
class AttribCtCellPtr extends AttribCt { constructor() { super() } }
class AttribCtCFace extends AttribCt { constructor() { super() } }

// ============================================================================
// Utility: Extract color from entity's attribute chain
// ============================================================================

/**
 * Walk attribute chain and find color
 */
function extractColor(entity) {
  if (!entity || !entity._attrib) return null

  let attr = entity._attrib.entity
  const visited = new Set()

  while (attr && !visited.has(attr.index)) {
    visited.add(attr.index)

    if (attr instanceof AttribStRgbColor ||
        attr instanceof AttribTslColour ||
        attr instanceof AttribADeskTrueColor) {
      return attr.getColor()
    }

    attr = attr.getNext()
  }

  return null
}

/**
 * Walk attribute chain and find name
 */
function extractName(entity) {
  if (!entity || !entity._attrib) return null

  let attr = entity._attrib.entity
  const visited = new Set()

  while (attr && !visited.has(attr.index)) {
    visited.add(attr.index)

    if (attr instanceof AttribGenName) {
      return attr.getName()
    }

    attr = attr.getNext()
  }

  return null
}


  // ============================================================================
  // spline.js
  // ============================================================================

/**
 * ACIS Spline Functions
 * B-Spline reading and parsing functions
 * Ported from Acis.py lines 584-1000
 */




// ============================================================================
// B-Spline Curve Readers
// ============================================================================

/**
 * Read 2D B-spline curve (parameter space curve)
 */
function readBS2Curve(chunks, index) {
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
function readBS3Curve(chunks, index) {
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
function readBS3Surface(chunks, index) {
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
function readSplineSurface(chunks, index, toleranceAtEnd) {
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
function readCurve(chunks, index) {
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
function readSurface(chunks, index) {
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
function readFormula(chunks, index) {
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
function readBlend(chunks, index) {
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
function readLofSubdata(chunks, index) {
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
function getDiscontinuityInfo(chunks, index, inventor) {
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


  // ============================================================================
  // reader.js
  // ============================================================================

/**
 * ACIS Reader
 * Main parser for text (.sat) and binary (.sab) ACIS files
 * Ported from Acis.py lines 5000-5350
 */




// ============================================================================
// Header Class
// ============================================================================

/**
 * ACIS file header information
 */
class Header {
  constructor() {
    this.version = 7.0
    this.records = 0
    this.bodies = 0
    this.flags = 0
    this.prodId = ''
    this.prodVer = ''
    this.date = ''
    this.scale = 1.0
    this.resabs = 1e-6
    this.resnor = 1e-10
    this.format = ''
    this.asm = undefined // ASM version tuple if present
  }
}

// ============================================================================
// Record Class
// ============================================================================

/**
 * ACIS entity record
 */
class Record {
  constructor(name) {
    this.name = name
    this.index = -1
    this.chunks = []
    this.entity = null
  }

  toString() {
    const chunkStr = this.chunks.map(c => c.toString()).join(' ')
    return `-${this.index} ${this.name} ${chunkStr}`
  }
}

// ============================================================================
// History Classes
// ============================================================================

class Bulletin {
  constructor() {
    this.entity = null
  }
}

class BulletinBoard {
  constructor() {
    this.bulletins = []
  }
}

class DeltaState {
  constructor(history, record) {
    this.history = history
    this.record = record
    this.bulletinBoard = null
  }
}

class History {
  constructor(record) {
    this.record = record
    this.index = -1
    this.deltaStates = []
  }
}

class BeginOfAcisHistoryData {
  constructor() {
    this.record = null
  }
}

class EndOfAcisHistorySection {
  constructor() {
    this.record = null
  }
}

class EndOfAcisData {
  constructor() {
    this.record = null
  }
}

// ============================================================================
// Version Conversion
// ============================================================================

/**
 * Convert integer version to float (e.g., 700 -> 7.0)
 */
function int2version(intVersion) {
  return intVersion / 100.0
}

// ============================================================================
// ACIS Reader Class
// ============================================================================

/**
 * Main ACIS file reader
 */
class AcisReader {
  constructor(stream) {
    this._stream = stream
    this._data = null
    this._pos = 0
    this._length = 0
    this._refChunks = new Map([[-1, ACIS_REF_NONE]])
    this.header = new Header()
    this._records = []
    this.history = null
    this.resolved = false
    this.bodies = []
    this._subtypes = []

    // Long integer reading functions (32 or 64 bit)
    this._getSLong = getSInt32
    this._getULong = getUInt32
  }

  get version() {
    return this.header.version
  }

  get scale() {
    return this.header.scale
  }

  addSubtypeEntity(entity) {
    this._subtypes.push(entity)
  }

  getSubtypeEntity(ref) {
    return this._subtypes[ref]
  }

  _hasNext() {
    return this._pos < this._length
  }

  // ============================================================================
  // Text Format Parsing
  // ============================================================================

  _skipWhiteSpace() {
    while (this._hasNext()) {
      const ch = this._data[this._pos]
      if (ch !== ' ' && ch !== '\t' && ch !== '\n' && ch !== '\r') {
        break
      }
      this._pos++
    }
  }

  _isSingleChar() {
    if (this._hasNext()) {
      return '#(){}$'.includes(this._data[this._pos])
    }
    return false
  }

  _findEnd() {
    while (this._hasNext()) {
      const ch = this._data[this._pos]
      if (' \t\n\r#(){}$'.includes(ch)) {
        break
      }
      this._pos++
    }
  }

  _readChunkText() {
    this._skipWhiteSpace()
    if (!this._hasNext()) return null

    if (this._isSingleChar()) {
      const token = this._data[this._pos]
      this._pos++
      return token
    }

    const start = this._pos
    this._findEnd()
    if (start < this._pos) {
      return this._data.substring(start, this._pos)
    }
    return null
  }

  _translateChunk(token) {
    // Handle @ strings (counted string)
    if (token.startsWith('@')) {
      const count = parseInt(token.substring(1), 10)
      this._skipWhiteSpace()
      const text = this._data.substring(this._pos, this._pos + count)
      this._pos += count + 1
      return { tag: 0x08, val: text, value: text }
    }

    // Handle $ references
    if (token.startsWith('$')) {
      const ref = parseInt(token.substring(1), 10)
      let chunk = this._refChunks.get(ref)
      if (!chunk) {
        chunk = new AcisChunkEntityRef(ref)
        this._refChunks.set(ref, chunk)
      }
      return chunk
    }

    // Handle parentheses (vectors)
    if (token === '(') {
      const tokX = this._readChunkText()
      const tokY = this._readChunkText()
      const tokZ = this._readChunkText()
      if (tokZ === ')') {
        return { tag: 0x16, val: { u: parseFloat(tokX), v: parseFloat(tokY) }, type: 'vector2d' }
      }
      const dummy = this._readChunkText()
      return { tag: 0x14, val: { x: parseFloat(tokX), y: parseFloat(tokY), z: parseFloat(tokZ) }, type: 'vector3d' }
    }

    // Handle known tokens
    const tag = TOKEN_TRANSLATIONS[token]
    if (tag !== undefined) {
      if (tag === TAG_TRUE) {
        return new AcisChunkEnumValue(TAG_TRUE, true, BOOLEAN)
      }
      if (tag === TAG_FALSE) {
        return new AcisChunkEnumValue(TAG_FALSE, false, BOOLEAN)
      }
      return { tag, val: token, value: token }
    }

    // Try to parse as number
    const num = parseFloat(token)
    if (!isNaN(num)) {
      return { tag: 0x06, val: num, value: num }
    }

    // String identifier
    return { tag: 0x07, val: token, value: token }
  }

  _readHeaderText() {
    this._pos = 0
    const lines = this._data.split('\n')
    let lineIndex = 0

    // First line: version records bodies flags
    const tokens = lines[lineIndex++].trim().split(/\s+/)
    this.header.version = int2version(parseInt(tokens[0], 10))
    this.header.records = parseInt(tokens[1], 10)
    this.header.bodies = parseInt(tokens[2], 10)
    this.header.flags = parseInt(tokens[3], 10)

    if (this.version >= 2.0) {
      // Second line: product info
      const line2 = lines[lineIndex++]
      // Parse @-prefixed strings
      let pos = 0
      const readAtString = () => {
        while (pos < line2.length && line2[pos] === ' ') pos++
        if (line2[pos] !== '@') return ''
        pos++
        let numStr = ''
        while (pos < line2.length && /\d/.test(line2[pos])) {
          numStr += line2[pos++]
        }
        const len = parseInt(numStr, 10)
        pos++ // skip space
        const str = line2.substring(pos, pos + len)
        pos += len
        return str
      }
      this.header.prodId = readAtString()
      this.header.prodVer = readAtString()
      this.header.date = readAtString()

      // Third line: scale values
      const tokens3 = lines[lineIndex++].trim().split(/\s+/)
      this.header.scale = Math.abs(parseFloat(tokens3[0]))
      this.header.resabs = parseFloat(tokens3[1])
      this.header.resnor = parseFloat(tokens3[2])
    }

    // Calculate position after header
    let headerLen = 0
    for (let i = 0; i < lineIndex; i++) {
      headerLen += lines[i].length + 1 // +1 for newline
    }
    this._pos = headerLen
  }

  _readRecordText(index) {
    let id = index
    let name = this._readChunkText()

    if (name === null) {
      return [null, id]
    }

    // Handle explicit index
    if (name.startsWith('-')) {
      id = parseInt(name.substring(1), 10)
      name = this._readChunkText()
    }

    const record = new Record(name)
    record.index = id

    while (this._hasNext()) {
      const token = this._readChunkText()
      if (token) {
        const chunk = this._translateChunk(token)
        record.chunks.push(chunk)
        if (chunk.tag === TAG_TERMINATOR) {
          break
        }
      }
    }

    return [record, id + 1]
  }

  // ============================================================================
  // Binary Format Parsing
  // ============================================================================

  _readChunkBinary() {
    const [tag, pos1] = getUInt8(this._data, this._pos)
    this._pos = pos1

    if (tag === TAG_ENTITY_REF) {
      const [refIdx, pos2] = this._getSLong(this._data, this._pos)
      this._pos = pos2
      let chunk = this._refChunks.get(refIdx)
      if (!chunk) {
        chunk = new AcisChunkEntityRef(refIdx)
        this._refChunks.set(refIdx, chunk)
      }
      return chunk
    }

    if (tag === TAG_TRUE || tag === TAG_FALSE) {
      return new AcisChunkEnumValue(tag, tag === TAG_TRUE, BOOLEAN)
    }

    const [chunk, pos2] = createChunk(tag, this._data, this._pos, this.header.scale)
    this._pos = pos2
    return chunk
  }

  _readHeaderBinary() {
    this._pos = 0

    // Read format identifier (15 bytes)
    const formatBytes = this._data.slice(0, 15)
    this.header.format = new TextDecoder().decode(formatBytes)

    if (this.header.format.startsWith('ACIS BinaryFile') ||
        this.header.format.startsWith('ASM BinaryFile')) {
      // Check for 64-bit mode (format ends with '8')
      if (this.header.format.endsWith('8')) {
        this._getSLong = getSInt64
        this._getULong = getUInt64
      }

      // Find the first TAG_IDENT (0x0d) which marks the start of ACIS records
      // This is more reliable than parsing header fields which vary by format
      for (let i = 16; i < Math.min(512, this._length - 10); i++) {
        if (this._data[i] === TAG_IDENT) {
          // Check if next bytes look like a valid identifier (length + ASCII letters)
          const len = this._data[i + 1]
          if (len > 0 && len < 64 && i + 2 + len <= this._length) {
            let valid = true
            for (let j = 0; j < len; j++) {
              const c = this._data[i + 2 + j]
              // Allow letters (A-Z, a-z), digits (0-9), underscore, hyphen
              if (!((c >= 65 && c <= 90) || (c >= 97 && c <= 122) ||
                    c === 95 || (c >= 48 && c <= 57) || c === 45)) {
                valid = false
                break
              }
            }
            if (valid) {
              this._pos = i
              // Try to read header fields from the asmheader record
              this._readHeaderFromRecord()
              return true
            }
          }
        }
      }
      // Fallback: couldn't find record start
      return false
    }

    return false
  }

  /**
   * Read header info from the asmheader record
   */
  _readHeaderFromRecord() {
    const startPos = this._pos
    try {
      const [record, _] = this._readRecordBinary(0)
      if (record.name === 'asmheader' || record.name === 'ACIS-asmheader') {
        // Extract version string from chunks
        for (const chunk of record.chunks) {
          if (chunk.tag === TAG_UTF8_U8 && typeof chunk.val === 'string') {
            const match = chunk.val.match(/^(\d+)\.(\d+)\.(\d+)/)
            if (match) {
              this.header.version = parseFloat(match[1] + '.' + match[2])
              this.header.asm = [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])]
            }
          }
        }
      }
    } catch (e) {
      console.warn('Failed to parse asmheader:', e.message)
    }
    // Reset position to record start so readBinary can parse all records
    this._pos = startPos
  }

  _readRecordBinary(index) {
    const names = []
    let id = index

    let chunk = this._readChunkBinary()
    if (chunk.tag !== TAG_IDENT && chunk.tag !== TAG_SUBIDENT) {
      id = chunk.val
      chunk = this._readChunkBinary()
    }

    names.push(chunk.val)
    while (chunk.tag !== TAG_IDENT) {
      chunk = this._readChunkBinary()
      if (chunk.val === 'ASM') chunk.val = 'ACIS'
      names.push(chunk.val)
    }

    const record = new Record(names.join('-'))
    record.index = id

    if (!record.name.startsWith('End-of-')) {
      while (this._hasNext()) {
        chunk = this._readChunkBinary()
        record.chunks.push(chunk)
        if (chunk.tag === TAG_TERMINATOR) {
          break
        }
      }
    }

    return [record, id + 1]
  }

  // ============================================================================
  // Reference Resolution
  // ============================================================================

  _resolveChunkReferences() {
    for (const ref of this._refChunks.values()) {
      if (ref.val >= 0 && ref.val < this._records.length) {
        ref.record = this._records[ref.val]
      }
    }
    const noneRef = this._refChunks.get(-1)
    if (noneRef) {
      noneRef.record = null
    }
  }

  // ============================================================================
  // Public Interface
  // ============================================================================

  getRecord(index) {
    return this._records[index]
  }

  getRecords() {
    return this._records
  }

  /**
   * Read text format ACIS file
   */
  readText(data) {
    setReader(this)
    this._data = typeof data === 'string' ? data : new TextDecoder().decode(data)
    this._length = this._data.length

    this._readHeaderText()

    let historySec = false
    let index = 0
    let recordIdx = 0

    let record, newIndex
    ;[record, index] = this._readRecordText(index)

    // Handle asmheader if present
    if (record && record.name === 'asmheader') {
      // Parse ASM header version
      ;[record, index] = this._readRecordText(index)
    }

    if (record && record.name !== 'T') {
      this._ensureRecordSlot(record.index)
      this._records[record.index] = record
    }

    while (this._hasNext()) {
      ;[record, index] = this._readRecordText(index)

      if (record) {
        if (record.name === 'Begin-of-ACIS-History-Data') {
          historySec = true
          recordIdx = record.index
          this.history = new History(record)
          this.history.index = recordIdx
          index = 0
        } else if (record.name === 'End-of-ACIS-History-Section') {
          historySec = false
          record.index = -1
          index = recordIdx
        } else if (record.name === 'End-of-ACIS-data') {
          record.index = -1
          this._records.push(record)
        } else {
          if (historySec) {
            const ds = new DeltaState(this.history, record)
            this.history.deltaStates.push(ds)
          } else {
            this._ensureRecordSlot(record.index)
            this._records[record.index] = record
          }
        }
      }
    }

    this._resolveChunkReferences()
    return true
  }

  /**
   * Read binary format ACIS file
   */
  readBinary(data) {
    setReader(this)
    this._data = data instanceof Uint8Array ? data : new Uint8Array(data)
    this._length = this._data.length
    this._pos = 0

    if (!this._readHeaderBinary()) {
      return false
    }

    let historySec = false
    let index = 0
    let recordIdx = 0

    while (this._hasNext()) {
      const [record, newIndex] = this._readRecordBinary(index)
      index = newIndex

      if (record.name === 'Begin-of-ACIS-History-Data') {
        historySec = true
        recordIdx = record.index
        this.history = new History(record)
        this.history.index = recordIdx
        index = 0
        this._records.push(record)
      } else if (record.name === 'End-of-ACIS-History-Section') {
        historySec = false
        record.index = -1
        index = recordIdx
        this._records.push(record)
      } else if (record.name === 'End-of-ACIS-data') {
        record.index = -1
        this._records.push(record)
      } else {
        if (historySec) {
          const ds = new DeltaState(this.history, record)
          this.history.deltaStates.push(ds)
        } else {
          this._ensureRecordSlot(record.index)
          this._records[record.index] = record
        }
      }
    }

    this._resolveChunkReferences()
    return true
  }

  _ensureRecordSlot(index) {
    while (this._records.length <= index) {
      this._records.push(null)
    }
  }

  /**
   * Resolve entity references and create entity objects
   */
  resolveEntities(entityMap) {
    if (this.resolved) return

    for (const record of this._records) {
      if (!record) continue

      const EntityClass = entityMap[record.name]
      if (EntityClass) {
        const entity = new EntityClass()
        entity.record = record
        entity.index = record.index
        record.entity = entity
      }
    }

    // Second pass: call set() on each entity
    for (const record of this._records) {
      if (record && record.entity) {
        try {
          record.entity.set(record)
        } catch (e) {
          console.warn(`Failed to parse entity ${record.name}[${record.index}]:`, e.message)
        }
      }
    }

    // Collect bodies
    for (const record of this._records) {
      if (record && record.name === 'body' && record.entity) {
        this.bodies.push(record.entity)
      }
    }

    this.resolved = true
  }
}


  // ============================================================================
  // type-mappings.js
  // ============================================================================

/**
 * ACIS Type Mappings
 * Maps record names to entity classes
 * Ported from Acis.py lines 5488-5710
 */

// Import all entity classes






// ============================================================================
// Record Name to Entity Class Mapping
// ============================================================================

const RECORD_2_ENTITY = {
  // Annotations
  'annotation': Annotation,
  'primitive_annotation-annotation': AnnotationPrimitive,
  'split_annotation-annotation': AnnotationSplit,
  'tol_annotation-annotation': AnnotationTol,
  'create_tol_anno-tol_annotation-annotation': AnnotationTolCreate,
  'revert_tol_anno-tol_annotation-annotation': AnnotationTolRevert,

  // ASM Header
  'asmheader': AsmHeader,

  // Attributes - base
  'attrib': Attrib,

  // Attributes - ADesk
  'adesk-attrib': AttribADesk,
  'color-adesk-attrib': AttribADeskColor,
  'material-adesk-attrib': AttribADeskMaterial,
  'truecolor-adesk-attrib': AttribADeskTrueColor,

  // Attributes - Ansoft
  'ansoft-attrib': AttribAnsoft,
  'id-ansoft-attrib': AttribAnsoftId,
  'properties-ansoft-attrib': AttribAnsoftProperties,

  // Attributes - At Ufld
  'at_ufld-attrib': AttribAtUfld,
  'ufld_defm_data_attrib-at_ufld-attrib': AttribAtUfldDefmData,
  'ufld_dev_pair_attrib-at_ufld-attrib': AttribAtUfldDevPair,
  'ufld_flat_bend_attrib-at_ufld-attrib': AttribAtUfldFlatBend,
  'ufld_pos_transf_attrib-at_ufld-attrib': AttribAtUfldFfldPosTransf,
  'mix_UF_ContourRoll_Track-ufld_pos_transf_attrib-at_ufld-attrib': AttribAtUfldFfldPosTransfMixUfContourRollTrack,
  'mix_UF_Transform_Track-ufld_pos_transf_attrib-at_ufld-attrib': AttribAtUfldFfldPosTransfMixUfTransformTrack,
  'ufld_non_merge_bend_attrib-at_ufld-attrib': AttribAtUfldNonMergeBend,
  'ufld_pos_track_attrib-at_ufld-attrib': AttribAtUfldPosTrack,
  'mix_UF_RobustPositionTrack-ufld_pos_track_attrib-at_ufld-attrib': AttribAtUfldPosTrackMixUfRobustPositionTrack,
  'ufld_surf_simp_attrib-ufld_pos_track_attrib-at_ufld-attrib': AttribAtUfldPosTrackSurfSimp,
  'persubent-acadSolidHistory-attrib': AttribAcadSolidHistoryPersubent,

  // Attributes - BT
  'bt-attrib': AttribBt,
  'entatt_color-bt-attrib': AttribBtEntityColor,

  // Attributes - CWK
  'cwkbase-attrib': AttribCwkBase,
  'cwkdbid-cwkbase-attrib': AttribCwkBaseCswDbid,

  // Attributes - Custom/Designer
  'ATTRIB_CUSTOM-attrib': AttribCustom,
  'Designer-attrib': AttribDesigner,
  'history-Designer-attrib': AttribDesignerHistory,
  'SURFACE_ID-Designer-attrib': AttribDesignerSurfaceId,
  'OWNER_TAG-Designer-attrib': AttribDesignerOwnerTag,
  'DXID-attrib': AttribDxid,

  // Attributes - Eye
  'eye-attrib': AttribEye,
  'fmesh-eye-attrib': AttribEyeFMesh,
  'ptlist-eye-attrib': AttribEyePtList,
  'ref_vt-eye-attrib': AttribEyeRefVt,

  // Attributes - FDI
  'fdi-attrib': AttribFdi,
  'label-fdi-attrib': AttribFdiLabel,

  // Attributes - Gen
  'gen-attrib': AttribGen,
  'name_attrib-gen-attrib': AttribGenName,
  'integer_attrib-name_attrib-gen-attrib': AttribGenNameInt32,
  'int64_attrib-name_attrib-gen-attrib': AttribGenNameInt64,
  'string_attrib-name_attrib-gen-attrib': AttribGenNameString,
  'real_attrib-name_attrib-gen-attrib': AttribGenNameReal,
  'vector_attrib-name_attrib-gen-attrib': AttribGenNameVector,

  // Attributes - KC
  'kc_id-attrib': AttribKcId,

  // Attributes - LWD
  'lwd-attrib': AttribLwd,
  'fmesh-lwd-attrib': AttribLwdFMesh,
  'ptlist-lwd-attrib': AttribLwdPtList,
  'ref_vt-lwd-attrib': AttribLwdRefVT,

  // Attributes - Mix Organization
  'mix_Organizaion-attrib': AttribMixOrganization,

  // Attributes - Naming/Matching
  'NamingMatching-attrib': AttribNamingMatching,
  'NMx_Brep_tag-NamingMatching-attrib': AttribNamingMatchingNMxBrepTag,
  'NMx_Brep_Feature_tag-NMx_Brep_tag-NamingMatching-attrib': AttribNamingMatchingNMxBrepTagFeature,
  'NMx_Brep_Name_tag-NMx_Brep_tag-NamingMatching-attrib': AttribNamingMatchingNMxBrepTagName,

  // Attributes - RBase
  'render-rbase-attrib': AttribRBaseRender,
  'RFbase-attrib': AttribRfBase,
  'RFFaceTracker-RFbase-attrib': AttribRfBaseFaceTracker,

  // Attributes - SG
  'sg-attrib': AttribSg,
  'pid_name-sg-attrib': AttribSgPidName,

  // Attributes - SNL
  'snl-attrib': AttribSnl,
  'cubit_owner-snl-attrib': AttribSnlCubitOwner,

  // Attributes - ST
  'st-attrib': AttribSt,
  'no_merge_attribute-st-attrib': AttribStNoMerge,
  'no_combine_attribute-st-attrib': AttribStNoCombine,
  'rgb_color-st-attrib': AttribStRgbColor,
  'display_attribute-st-attrib': AttribStDisplay,
  'id_attribute-st-attrib': AttribStId,

  // Attributes - Sys
  'sys-attrib': AttribSys,
  'convexity-sys-attrib': AttribSysConvexity,
  'attrib_annotation-sys-attrib': AttribSysAnnotationAttrib,
  'stitch_hint-sys-attrib': AttribSysStichHint,
  'tag-sys-attrib': AttribSysTag,
  'vertedge-sys-attrib': AttribSysVertedge,

  // Attributes - TSL
  'tsl-attrib': AttribTsl,
  'id-tsl-attrib': AttribTslId,
  'colour-tsl-attrib': AttribTslColour,

  // Attributes - CT (cellular)
  'ct-attrib': AttribCt,
  'cell_ptr-ct-attrib': AttribCtCellPtr,
  'cface_ptr-ct-attrib': AttribCtCFace,

  // History
  'Begin-of-ACIS-History-Data': BeginOfAcisHistoryData,
  'delta_state': DeltaState,
  'End-of-ACIS-data': EndOfAcisData,
  'End-of-ACIS-History-Section': EndOfAcisHistorySection,

  // Topology
  'body': Body,
  'lump': Lump,
  'shell': Shell,
  'subshell': SubShell,
  'face': Face,
  'loop': Loop,
  'wire': Wire,
  'coedge': CoEdge,
  'tcoedge-coedge': CoEdgeTolerance,
  'edge': Edge,
  'tedge-edge': EdgeTolerance,
  'vertex': Vertex,
  'tvertex-vertex': VertexTolerance,

  // Curves
  'curve': Curve,
  'straight-curve': CurveStraight,
  'ellipse-curve': CurveEllipse,
  'degenerate_curve-curve': CurveDegenerate,
  'compcurv-curve': CurveComp,
  'intcurve-curve': CurveInt,
  'intcurve-intcurve-curve': CurveIntInt,
  'pcurve': CurveP,

  // Surfaces
  'surface': Surface,
  'plane-surface': SurfacePlane,
  'cone-surface': SurfaceCone,
  'sphere-surface': SurfaceSphere,
  'torus-surface': SurfaceTorus,
  'meshsurf-surface': SurfaceMesh,
  'spline-surface': SurfaceSpline,

  // Geometry
  'point': Point,

  // Other
  'T': T,
  'transform': Transform,
  'wcs': Wcs,
  'vertex_template': VertexTemplate,
  'eye_refinement': EyeRefinement,
  'refinement': Refinement,
  'rh_material-rh_entity': RhEntityRhMaterial,

  // Cellular
  'cell': Cell,
  'cell3d-cell': Cell3d,
  'cface': CFace,
  'cshell': CShell
}

// ============================================================================
// Curve and Surface Type Handlers (re-export from curves.js and surfaces.js)
// ============================================================================




  // ============================================================================
  // index.js
  // ============================================================================

/**
 * ACIS Parser - JavaScript Module
 *
 * A modular JavaScript port of the ACIS parser from Python.
 * Designed to replace FreeCAD dependencies with OpenCascade.js.
 *
 * Usage:
 *   import { AcisReader, RECORD_2_ENTITY } from './acis-js/index.js'
 *
 *   const reader = new AcisReader(data)
 *   reader.readBinary(buffer) // or reader.readText(string)
 *   reader.resolveEntities(RECORD_2_ENTITY)
 *   const bodies = reader.bodies
 */

// ============================================================================
// Core Exports
// ============================================================================

// Constants

// Math utilities

// Data classes

// Utility functions

// Binary chunk readers

// Entity base classes

// Topology entities

// Curve geometry

// Surface geometry

// Attributes

// B-Spline functions

// Main reader

// Type mappings

// ============================================================================
// Convenience Functions
// ============================================================================




/**
 * Parse ACIS binary data and return bodies
 * @param {ArrayBuffer|Uint8Array} data - Binary ACIS data
 * @returns {Array} Array of Body entities
 */
function parseAcisBinary(data) {
  const reader = new AcisReader()
  if (!reader.readBinary(data)) {
    throw new Error('Failed to parse ACIS binary data')
  }
  reader.resolveEntities(RECORD_2_ENTITY)
  return reader.bodies
}

/**
 * Parse ACIS text data and return bodies
 * @param {string|ArrayBuffer} data - Text ACIS data (.sat format)
 * @returns {Array} Array of Body entities
 */
function parseAcisText(data) {
  const reader = new AcisReader()
  if (!reader.readText(data)) {
    throw new Error('Failed to parse ACIS text data')
  }
  reader.resolveEntities(RECORD_2_ENTITY)
  return reader.bodies
}

/**
 * Detect ACIS format and parse accordingly
 * @param {ArrayBuffer|Uint8Array|string} data - ACIS data
 * @returns {Array} Array of Body entities
 */
function parseAcis(data) {
  // Check if binary format
  if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data)
    const header = new TextDecoder().decode(bytes.slice(0, 15))

    if (header.startsWith('ACIS BinaryFile') || header.startsWith('ASM BinaryFile')) {
      return parseAcisBinary(data)
    }
    // Might be text in binary format
    return parseAcisText(data)
  }

  // String data - text format
  return parseAcisText(data)
}

/**
 * Get all faces from bodies
 * @param {Array} bodies - Array of Body entities
 * @returns {Array} Array of Face entities
 */
function getAllFaces(bodies) {
  const faces = []
  for (const body of bodies) {
    for (const lump of body.getLumps()) {
      for (const shell of lump.getShells()) {
        faces.push(...shell.getFaces())
      }
    }
  }
  return faces
}

/**
 * Get all edges from bodies
 * @param {Array} bodies - Array of Body entities
 * @returns {Array} Array of Edge entities
 */
function getAllEdges(bodies) {
  const edges = []
  const seen = new Set()

  for (const body of bodies) {
    for (const lump of body.getLumps()) {
      for (const shell of lump.getShells()) {
        for (const face of shell.getFaces()) {
          for (const loop of face.getLoops()) {
            for (const coedge of loop.getCoedges()) {
              const edge = coedge.getEdge()
              if (edge && !seen.has(edge.index)) {
                seen.add(edge.index)
                edges.push(edge)
              }
            }
          }
        }
      }
    }
  }
  return edges
}

/**
 * Extract color from entity attribute chain
 */

// ============================================================================
// Default Export
// ============================================================================

{
  AcisReader,
  RECORD_2_ENTITY,
  parseAcis,
  parseAcisBinary,
  parseAcisText,
  getAllFaces,
  getAllEdges,
  extractColor,
  extractName
}



  // ============================================================================
  // F3D Parser
  // ============================================================================

  /**
   * Find where the actual ACIS data starts in a buffer.
   * SMB/SMBH files have a header before the actual ACIS records.
   */
  function findACISDataStart(buffer) {
    const view = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
    const headerText = new TextDecoder().decode(view.slice(0, Math.min(512, view.length)))

    if (headerText.startsWith('ASM BinaryFile') ||
        headerText.startsWith('ASM ') ||
        headerText.startsWith('ACIS BinaryFile')) {
      for (let i = 0; i < Math.min(512, view.length - 10); i++) {
        if (view[i] === 0x0d) {
          const len = view[i + 1]
          if (len > 0 && len < 64 && i + 2 + len <= view.length) {
            const possibleStr = new TextDecoder().decode(view.slice(i + 2, i + 2 + len))
            if (/^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(possibleStr)) {
              return i
            }
          }
        }
      }
    }
    if (view[0] === 0x0d) return 0
    return 0
  }

  async function parseF3D(arrayBuffer, loadJSZip) {
    const JSZip = await loadJSZip()
    const zip = await JSZip.loadAsync(arrayBuffer)
    const files = Object.keys(zip.files)

    const smbFiles = files.filter(f =>
      f.toLowerCase().endsWith('.smb') || f.toLowerCase().endsWith('.smbh')
    )

    if (smbFiles.length === 0) {
      throw new Error('No ACIS binary data (.smb/.smbh) found in F3D file')
    }

    const allBodies = []

    for (const smbFile of smbFiles) {
      try {
        const smbData = await zip.file(smbFile).async('arraybuffer')
        console.log('Parsing ' + smbFile + ': ' + smbData.byteLength + ' bytes')

        const bodies = parseAcisBinary(new Uint8Array(smbData))
        console.log('  Found ' + bodies.length + ' bodies')
        allBodies.push(...bodies)
      } catch (e) {
        console.warn('Failed to parse ' + smbFile + ':', e.message)
        console.warn(e.stack)
      }
    }

    if (allBodies.length === 0) {
      throw new Error('No geometry bodies found in F3D file')
    }

    return allBodies
  }

  // ============================================================================
  // Export to global
  // ============================================================================

  global.ACIS = {
    // Reader
    AcisReader,
    Header,
    Record,
    RECORD_2_ENTITY,

    // Parsing functions
    parseAcis,
    parseAcisBinary,
    parseAcisText,
    parseF3D,

    // Utility functions
    getAllFaces,
    getAllEdges,
    extractColor,
    extractName,
    findACISDataStart,

    // Classes (for instanceof checks)
    Entity, Body, Lump, Shell, Face, Loop, CoEdge, Edge, Vertex,
    Curve, CurveStraight, CurveEllipse, CurveInt,
    Surface, SurfacePlane, SurfaceCone, SurfaceSphere, SurfaceTorus, SurfaceSpline,
    Point, Transform,

    // Data structures
    Range, Interval, BS_Curve, BS_Surface, Helix,

    // Math functions
    VEC, NORM, CROSS, DOT, SIZE
  }

  // Also expose as ACISParser for backwards compatibility
  global.ACISParser = {
    parseF3D: parseF3D
  }

})(typeof self !== 'undefined' ? self : this)
