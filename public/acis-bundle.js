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
  // Wrap in parentheses so >>> 0 applies to entire expression (not just last term)
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

function createChunk(tag, data, offset, scale = 1.0, is64bit = false) {
  if (tag === TAG_TRUE) {
    return [new AcisChunkEnumValue(TAG_TRUE, true, BOOLEAN), offset]
  }
  if (tag === TAG_FALSE) {
    return [new AcisChunkEnumValue(TAG_FALSE, false, BOOLEAN), offset]
  }
  if (tag === TAG_ENTITY_REF) {
    const [val, o1] = getSInt64(data, offset)
    const chunk = new AcisChunkEntityRef(val)
    return [chunk, o1]
  }
  if (tag === TAG_ENUM_VALUE) {
    // In 64-bit mode, enum value is stored as 64-bit integer, not UTF8 string
    if (is64bit) {
      const [val, o1] = getSInt64(data, offset)
      const chunk = new AcisChunk(TAG_ENUM_VALUE, val)
      chunk.type = 'enum'
      return [chunk, o1]
    }
    const chunk = new AcisChunkUtf8U8()
    const o1 = chunk.read(data, offset)
    chunk.tag = TAG_ENUM_VALUE
    chunk.type = 'enum'
    return [chunk, o1]
  }
  if (tag === TAG_LONG) {
    // In 64-bit mode, TAG_LONG is 8 bytes, otherwise 4 bytes
    if (is64bit) {
      const [val, o1] = getSInt64(data, offset)
      const chunk = new AcisChunkLong(val)
      chunk.val = val
      chunk.value = val
      return [chunk, o1]
    }
    const chunk = new AcisChunkLong()
    const o1 = chunk.read(data, offset)
    return [chunk, o1]
  }
  if (tag === TAG_POSITION) {
    const chunk = new AcisChunkPosition(scale)
    const o1 = chunk.read(data, offset)
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
  // spline.js
  // ============================================================================

/**
 * ACIS Spline Functions
 * B-Spline reading and parsing functions
 * Ported from Acis.py lines 584-1000
 */

// ============================================================================
// Curve and Surface Class Mappings (set via setters to avoid circular deps)
// ============================================================================

let CURVES = null
let SURFACES = null

/**
 * Set the curve classes mapping (called from index.js after all modules loaded)
 */
function setCurveClasses(mapping) {
  CURVES = mapping
}

/**
 * Set the surface classes mapping (called from index.js after all modules loaded)
 */
function setSurfaceClasses(mapping) {
  SURFACES = mapping
}

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
// Curve Factory (Python readCurve lines 684-693)
// ============================================================================

/**
 * Read embedded curve definition
 * Creates a curve instance and parses its subtype data
 */
function readCurve(chunks, index) {
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
function readSurface(chunks, index) {
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
function setTransformClass(cls) {
  TransformClass = cls
}

/**
 * Read law (readLaw in Python lines 659-677)
 * Handles special cases: TRANS, EDGE, SPLINE_LAW, plus formula expressions
 */
function readLaw(chunks, index) {
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
function readFormula(chunks, index) {
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
function readBlend(chunks, index) {
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
// Discontinuity Info Reader (Python lines 717-728)
// ============================================================================

/**
 * Read discontinuity info - 6 float arrays + optional boolean
 */
function getDiscontinuityInfo(chunks, index, inventor) {
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
   * Based on Acis.py Entity.set() lines 1535-1546
   */
  set(record) {
    let i = 0

    // Handle attrib reference - use null for expected name to accept any ref
    ;[this._attrib, i] = getRefNode(record, i, null)

    // Read history integer if version > 6.0
    if (getVersion() > 6.0 && i < record.chunks.length) {
      ;[this.history, i] = getInteger(record.chunks, i)
    } else {
      this.history = -1
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
   * Set bulk from chunks (used by readLaw for TRANS type)
   * Python Acis.py lines 1613-1620
   */
  setBulk(chunks, index) {
    const scale = getScale()
    const [a, i] = getFloats(chunks, index, 13)

    // Build 4x4 matrix from 13 floats (Python line 1616)
    // Format: rotation(3x3) + translation(3) + scale(1)
    this.matrix[0][0] = a[0]; this.matrix[0][1] = a[3]; this.matrix[0][2] = a[6]; this.matrix[0][3] = a[9] * scale
    this.matrix[1][0] = a[1]; this.matrix[1][1] = a[4]; this.matrix[1][2] = a[7]; this.matrix[1][3] = a[10] * scale
    this.matrix[2][0] = a[2]; this.matrix[2][1] = a[5]; this.matrix[2][2] = a[8]; this.matrix[2][3] = a[11] * scale
    this.matrix[3][3] = a[12] // scale factor

    // Read enum flags
    let i2 = i
    ;[this.rotation, i2] = getEnumByTag(chunks, i2, ROTATION)
    ;[this.reflect, i2] = getEnumByTag(chunks, i2, REFLECTION)
    ;[this.shear, i2] = getEnumByTag(chunks, i2, SHEAR)

    return i2
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
    let i = index
    const [count, i2] = getInteger(chunks, i)
    i = i2

    this.curves = []
    for (let k = 0; k < count; k++) {
      const [curve, i3] = readCurve(chunks, i)
      this.curves.push(curve)
      i = i3
    }

    return i
  }

  build(start, end) {
    if (this._readyToBuild) {
      this._readyToBuild = false

      if (this.curves.length > 0) {
        const shapes = []
        for (const curve of this.curves) {
          if (curve && typeof curve.build === 'function') {
            const shape = curve.build(start, end)
            if (shape) shapes.push(shape)
          }
        }
        if (shapes.length > 0) {
          this.shape = { type: 'compound_curve', curves: shapes }
        }
      }
    }
    return this.shape
  }
}

// ============================================================================
// CURVE_SET_DATA - Maps subtype names to setter methods
// ============================================================================

const CURVE_SET_DATA = {
  // Basic subtypes
  'cur_int': ['setCurve', 0, false],
  'int_cur': ['setSurfaceCurve', 1, true],

  // Specific subtypes
  'blend_int_cur': ['setBlend', 1, true],
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
  'surf_int_cur': ['setSurface', 1, true],

  // Silhouette subtypes
  'silh_int_cur': ['setSilhouette', 1, true],
  'para_silh_int_cur': ['setSilhouetteParameter', 1, true],
  'taper_silh_int_cur': ['setSilhouetteTaper', 1, true]
}

// ============================================================================
// IntCurve (Interpolated/Spline Curve)
// ============================================================================

/**
 * Interpolated curve (B-spline, etc.)
 * Complete implementation matching Python Acis.py lines 2063-2640
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
    if (this.surface) return this.surface
    if (this.surface1) return this.surface1
    return null
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

  // Base curve data reader (Python lines 2159-2202)
  setCurve(chunks, index) {
    let i = index
    ;[this.singularity, i] = getSingularity(chunks, i)

    if (this.singularity === 'full') {
      // Read B-spline curve data
      ;[this.spline, i] = readBS3Curve(chunks, i)
      ;[this.tolerance, i] = getLength(chunks, i)
    } else if (this.singularity === 'none') {
      ;[this.range, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())
      if (chunks[i] && typeof chunks[i].val === 'number') {
        ;[this.tolerance, i] = getFloat(chunks, i)
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

  // Surface curve reader (Python lines 2204-2221)
  setSurfaceCurve(chunks, index, inventor, subtype = 'int_cur') {
    this.subtype = subtype
    const vrs = getVersion()
    let i = this.setCurve(chunks, index)

    ;[this.surface1, i] = readSurface(chunks, i)
    ;[this.surface2, i] = readSurface(chunks, i)
    ;[this.pcurve1, i] = readBS2Curve(chunks, i)
    ;[this.pcurve2, i] = readBS2Curve(chunks, i)

    if ((vrs > 11.0) && !isASM()) {
      i += 2 // '0xb 0xb' ?!?
    }

    ;[this.range2, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())

    if (vrs > 2.1) {
      // Discontinuity-Info
      ;[this.di1, i] = getFloatArray(chunks, i)
      ;[this.di2, i] = getFloatArray(chunks, i)
      ;[this.di3, i] = getFloatArray(chunks, i)
    }

    if (!this.setProjectionSurface(this.surface1, this.pcurve1)) {
      this.setProjectionSurface(this.surface2, this.pcurve2)
    }

    return i
  }

  // Blend/Spring curve (Python lines 2222-2251)
  setBlendSpring(chunks, index, inventor) {
    this.subtype = 'spring_int_cur'
    let i = this.setCurve(chunks, index)

    ;[this.surface1, i] = readSurface(chunks, i)
    if (this.surface1 === null) {
      ;[this.ruS1, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
      ;[this.rvS1, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
    }

    ;[this.surface2, i] = readSurface(chunks, i)
    if (this.surface2 === null) {
      ;[this.ruS2, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
      ;[this.rvS2, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
    }

    ;[this.pcurve1, i] = readBS2Curve(chunks, i)
    if (this.pcurve1 === null) {
      ;[this.ruP1, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
    }

    ;[this.pcurve2, i] = readBS2Curve(chunks, i)
    ;[this.range2, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)

    if (getVersion() >= 2.0) {
      // Discontinuity-Info
      ;[this.di1, i] = getFloatArray(chunks, i)
      ;[this.di2, i] = getFloatArray(chunks, i)
      ;[this.di3, i] = getFloatArray(chunks, i)
    }

    if (!this.setProjectionSurface(this.surface1, this.pcurve1)) {
      this.setProjectionSurface(this.surface2, this.pcurve2)
    }

    if (inventor) {
      i += 1 // ???
      ;[this.direction, i] = getEnumByValue(chunks, i, CURV_DIR)
    } else {
      ;[this.direction, i] = getText(chunks, i)
    }

    return i
  }

  // Comp curve (Python lines 2253-2263)
  setComp(chunks, index, inventor) {
    let i = this.setSurfaceCurve(chunks, index, inventor)
    ;[this.a4, i] = getFloatArray(chunks, i)
    ;[this.count, i] = getInteger(chunks, i)
    ;[this.a5, i] = getFloats(chunks, i, this.count)

    if (inventor) i += 1 // Boolean

    this.curves = []
    for (let k = 0; k < this.count; k++) {
      const [c, i2] = readCurve(chunks, i)
      this.curves.push(c)
      i = i2
    }

    return i
  }

  // Defm curve (Python lines 2264-2384)
  setDefm(chunks, index, inventor) {
    let i = this.setSurfaceCurve(chunks, index, inventor)

    if (inventor) {
      ;[this.lng1, i] = getInteger(chunks, i) // 0
    }

    ;[this.bend, i] = readCurve(chunks, i)
    ;[this.d1, i] = getInteger(chunks, i) // 8

    if (this.d1 === 8) {
      ;[this.d2, i] = getVector(chunks, i)
      ;[this.d3, i] = getVector(chunks, i)
      ;[this.d4, i] = getVector(chunks, i)
      ;[this.d5, i] = getVector(chunks, i)
      ;[this.n1, i] = getInteger(chunks, i) // 0
      if (this.n1 > 0) {
        ;[this.a1, i] = getFloats(chunks, i, 2 * this.n1)
        this.a1 = reshape(this.a1, 2)
      } else {
        this.a1 = []
      }
    } else if (this.d1 === 5) {
      this.d15 = new CurveInt()
      ;[this.d10, i] = readSurface(chunks, i)
      ;[this.d11, i] = getValue(chunks, i)
      ;[this.d12, i] = getFloat(chunks, i)
      ;[this.d13, i] = getInteger(chunks, i)
      if ((getVersion() > 225) && isASM()) {
        ;[this.d16, i] = getLong(chunks, i)
      }
      ;[this.d14, i] = getFloat(chunks, i)
      i = this.d15.setSubtype(chunks, i)
      ;[this.d2, i] = getVector(chunks, i)
      ;[this.d3, i] = getVector(chunks, i)
      ;[this.d4, i] = getVector(chunks, i)
      ;[this.d5, i] = getVector(chunks, i)
      ;[this.d6, i] = getFloat(chunks, i)
      ;[this.d7, i] = getValue(chunks, i)
      ;[this.d8, i] = getValue(chunks, i)
      ;[this.d9, i] = getValue(chunks, i)
      ;[this.n1, i] = getInteger(chunks, i) // 0
      if (this.n1 > 0) {
        ;[this.a1, i] = getFloats(chunks, i, 2 * this.n1)
        this.a1 = reshape(this.a1, 2)
      } else {
        this.a1 = []
      }
    } else if (this.d1 === 6) {
      ;[this.d2, i] = getVector(chunks, i)
      ;[this.d3, i] = getVector(chunks, i)
      ;[this.d4, i] = getVector(chunks, i)
      ;[this.d5, i] = getVector(chunks, i)
      ;[this.d6, i] = getFloat(chunks, i)
      ;[this.d7, i] = getBoolean(chunks, i)
      ;[this.d8, i] = getBoolean(chunks, i)
      ;[this.d9, i] = getBoolean(chunks, i)
      ;[this.d10, i] = getInteger(chunks, i)
      ;[this.d11, i] = readSurface(chunks, i)
      ;[this.d12, i] = getLong(chunks, i)
      ;[this.d13, i] = getBoolean(chunks, i)
      ;[this.d14, i] = getFloat(chunks, i)
      if ((getVersion() > 225) && isASM()) {
        ;[this.d15, i] = getLong(chunks, i)
      }
      ;[this.d16, i] = getFloat(chunks, i)
      this.d17 = new CurveInt()
      i = this.d17.setSubtype(chunks, i)
      ;[this.d18, i] = getVector(chunks, i)
      ;[this.d19, i] = getVector(chunks, i)
      ;[this.d20, i] = getVector(chunks, i)
      ;[this.d21, i] = getVector(chunks, i)
      ;[this.d22, i] = getFloat(chunks, i)
      ;[this.d23, i] = getBoolean(chunks, i)
      ;[this.d24, i] = getBoolean(chunks, i)
      ;[this.d25, i] = getBoolean(chunks, i)
      ;[this.d26, i] = getVector(chunks, i)
      ;[this.d27, i] = getVector(chunks, i)
      ;[this.d28, i] = getVector(chunks, i)
      ;[this.d29, i] = getVector(chunks, i)
      ;[this.d30, i] = getFloat(chunks, i)
      ;[this.d31, i] = getBoolean(chunks, i)
      ;[this.d32, i] = getBoolean(chunks, i)
      ;[this.d33, i] = getBoolean(chunks, i)
      ;[this.d34, i] = getLong(chunks, i)
    } else { // d1 == 3 or d1 == 1 or d1 == 4
      ;[this.d2, i] = getVector(chunks, i)
      ;[this.d3, i] = getVector(chunks, i)
      ;[this.d4, i] = getVector(chunks, i)
      ;[this.d5, i] = getVector(chunks, i)
      ;[this.d6, i] = getFloat(chunks, i)
      ;[this.d7, i] = getValue(chunks, i)
      ;[this.d8, i] = getValue(chunks, i)
      ;[this.d9, i] = getValue(chunks, i)
      ;[this.d10, i] = getLocation(chunks, i)
      ;[this.d11, i] = getVector(chunks, i)
      ;[this.d12, i] = getVector(chunks, i)
      ;[this.d13, i] = getFloat(chunks, i)
      ;[this.d14, i] = getValue(chunks, i)
      ;[this.d15, i] = getValue(chunks, i)
      ;[this.d16, i] = getFloat(chunks, i)
      ;[this.d17, i] = getFloat(chunks, i)
      ;[this.d18, i] = getFloat(chunks, i)
      ;[this.d19, i] = getValue(chunks, i)
      ;[this.d20, i] = getValue(chunks, i)
      ;[this.d21, i] = getValue(chunks, i)
      ;[this.d22, i] = getValue(chunks, i)
      ;[this.d23, i] = getValue(chunks, i)

      if (this.d1 === 1) {
        ;[this.d25, i] = getInteger(chunks, i)
        ;[this.d26, i] = getFloat(chunks, i)
        ;[this.d27, i] = getFloat(chunks, i)
      } else if (this.d1 === 3) {
        ;[this.d24, i] = getFloat(chunks, i)
        ;[this.n1, i] = getInteger(chunks, i)
        if (this.n1 > 0) {
          ;[this.a1, i] = getFloats(chunks, i, 2 * this.n1)
          this.a1 = reshape(this.a1, 2)
        } else {
          this.a1 = []
        }
      } else if (this.d1 === 4) {
        ;[this.b1, i] = getBoolean(chunks, i)
        ;[this.d26, i] = getFloat(chunks, i)
        ;[this.n1, i] = getInteger(chunks, i)
        ;[this.d27, i] = getFloat(chunks, i)
        ;[this.d28, i] = getFloat(chunks, i)
      }
    }

    return i
  }

  // Exact curve (Python lines 2385-2399)
  setExact(chunks, index, inventor) {
    const vrs = getVersion()
    let i = this.setSurfaceCurve(chunks, index, inventor, 'exact_int_cur')

    if (vrs >= 2.0) {
      if (inventor) {
        ;[this.x, i] = getFloat(chunks, i)
      }
      if ((vrs > 11.0) && !isASM()) {
        ;[this.s, i] = getSingularity(chunks, i)
        if ((vrs > 12.0) && !isASM()) {
          ;[this.b, i] = getBoolean(chunks, i)
        }
      }
      ;[this.unknown, i] = getUnknownFT(chunks, i)
      ;[this.range2x, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())
    }

    if (inventor) {
      i += 2 // skip 2x Enum-Values
    }

    return i
  }

  // Helix curve (Python lines 2400-2417)
  setHelix(chunks, index, inventor) {
    this.helix = new Helix()
    let i = index
    ;[this.helix.radAngles, i] = getInterval(chunks, i, MIN_0, MAX_2PI, 1.0)
    ;[this.helix.posCenter, i] = getLocation(chunks, i)
    ;[this.helix.dirMajor, i] = getLocation(chunks, i)
    ;[this.helix.dirMinor, i] = getLocation(chunks, i)
    ;[this.helix.dirPitch, i] = getLocation(chunks, i)
    ;[this.helix.facApex, i] = getFloat(chunks, i)
    ;[this.helix.vecAxis, i] = getVector(chunks, i)

    ;[this.s1, i] = readSurface(chunks, i)
    ;[this.s2, i] = readSurface(chunks, i)
    ;[this.p1, i] = readBS2Curve(chunks, i)
    ;[this.p2, i] = readBS2Curve(chunks, i)

    this.shape = { type: 'helix', helix: this.helix }
    if (!this.setProjectionSurface(this.s1, this.p1)) {
      this.setProjectionSurface(this.s2, this.p2)
    }
    this._readyToBuild = (this.shape === null)

    return i
  }

  // Int curve (Python lines 2418-2430)
  setInt(chunks, index, inventor) {
    let i = this.setSurfaceCurve(chunks, index, inventor, 'int_int_cur')

    if ((getVersion() > 10.0) && !isASM()) {
      ;[this.x, i] = getFloat(chunks, i)
      ;[this.s, i] = getSingularity(chunks, i)
      ;[this.b, i] = getBoolean(chunks, i)
      if (this.s === 'summary') {
        ;[this.n, i] = getInteger(chunks, i)
        ;[this.a, i] = getFloatArray(chunks, i)
      }
    } else {
      if (inventor) {
        ;[this.val, i] = getBoolean(chunks, i)
      }
    }

    return i
  }

  // Law curve (Python lines 2431-2447)
  setLaw(chunks, index, inventor) {
    let i = this.setSurfaceCurve(chunks, index, inventor, 'law_int_cur')

    if (inventor) {
      ;[this.n, i] = getInteger(chunks, i) // 0
    } else {
      if ((getVersion() > 15.0) && !isASM()) {
        ;[this.x, i] = getFloat(chunks, i)
        ;[this.s, i] = getSingularity(chunks, i)
        ;[this.b, i] = getBoolean(chunks, i)
      }
    }

    ;[this.l, i] = readFormula(chunks, i)
    this.laws = [this.l]
    const subLaws = this.l[1]
    ;[this.lawCount, i] = getInteger(chunks, i)

    for (let cnt = 0; cnt < this.lawCount; cnt++) {
      const [l, i2] = readFormula(chunks, i)
      subLaws.push(l)
      i = i2
    }

    return i
  }

  // Off curve (Python lines 2448-2455)
  setOff(chunks, index, inventor) {
    let i = this.setSurfaceCurve(chunks, index, inventor, 'off_int_cur')

    if (inventor) i += 1
    if ((getVersion() > 22.0) && !isASM()) i += 3

    ;[this.left, i] = getLength(chunks, i)
    ;[this.right, i] = getLength(chunks, i)

    return i
  }

  // Offset curve (Python lines 2456-2468)
  setOffset(chunks, index, inventor) {
    let i = this.setSurfaceCurve(chunks, index, inventor, 'offset_int_cur')

    if (inventor) i += 1

    ;[this.curve, i] = readCurve(chunks, i)
    ;[this.start, i] = getFloat(chunks, i)
    ;[this.end, i] = getFloat(chunks, i)
    ;[this.offset, i] = getVector(chunks, i)
    ;[this.oTxt1, i] = getValue(chunks, i)
    ;[this.oI, i] = getInteger(chunks, i)
    ;[this.oTxt2, i] = getValue(chunks, i)
    ;[this.oJ, i] = getInteger(chunks, i)

    return i
  }

  // Offset surface curve (Python lines 2469-2480)
  setOffsetSurface(chunks, index, inventor) {
    let i = this.setSurfaceCurve(chunks, index, inventor, 'off_surf_int_cur')

    if (inventor) i += 1

    ;[this.base_U, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
    ;[this.base_V, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
    ;[this.base, i] = readCurve(chunks, i)
    ;[this.base_rng, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
    ;[this.dist, i] = getFloat(chunks, i)
    ;[this.shift, i] = getFloat(chunks, i)
    ;[this.curveScale, i] = getFloat(chunks, i)

    return i
  }

  // Project curve (Python lines 2481-2492)
  setProject(chunks, index, inventor) {
    let i = this.setSurfaceCurve(chunks, index, inventor, 'proj_int_cur')

    if (inventor) i += 1

    ;[this.c, i] = readCurve(chunks, i)

    if (inventor) {
      ;[this.projB, i] = getBoolean(chunks, i)
      if (chunks[i] && chunks[i].tag === TAG_SUBTYPE_CLOSE) {
        return i
      }
    }

    ;[this.r, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())
    ;[this.t, i] = getText(chunks, i)

    return i
  }

  // SSS curve (Python lines 2493-2500)
  setSSS(chunks, index, inventor) {
    this.subtype = 'sss_int_cur'
    let i = this.setSurfaceCurve(chunks, index, inventor)

    ;[this.sssN, i] = getInteger(chunks, i)
    ;[this.sssS, i] = readSurface(chunks, i)
    ;[this.sssP, i] = readBS2Curve(chunks, i)

    this.setProjectionSurface(this.sssS, this.sssP)

    return i
  }

  // Silhouette curve (Python lines 2501-2506)
  setSilhouette(chunks, index, inventor, subtype = 'silh_int_cur') {
    let i = this.setSurfaceCurve(chunks, index, inventor, subtype)

    if (inventor) {
      ;[this.silhV, i] = getInteger(chunks, i)
    }

    ;[this.direction, i] = getVector(chunks, i)

    return i
  }

  // Silhouette parameter curve (Python lines 2507-2514)
  setSilhouetteParameter(chunks, index, inventor) {
    let i = this.setSilhouette(chunks, index, inventor, 'para_silh_int_cur')

    ;[this.parameter, i] = getFloat(chunks, i)

    if ((getVersion() > 225.0) && isASM()) {
      ;[this.silhR, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())
      ;[this.silhVec, i] = getVector(chunks, i)
      ;[this.silhD, i] = getFloat(chunks, i)
    }

    return i
  }

  // Silhouette taper curve (Python lines 2515-2518)
  setSilhouetteTaper(chunks, index, inventor) {
    let i = this.setSilhouette(chunks, index, inventor, 'taper_silh_int_cur')
    ;[this.taperangle, i] = getFloat(chunks, i)
    return i
  }

  // Blend curve (Python lines 2519-2535)
  setBlend(chunks, index, inventor) {
    const vrs = getVersion()
    let i = this.setSurfaceCurve(chunks, index, inventor, 'blend_int_cur')

    if (!isASM()) {
      if (vrs > 10.0) {
        if (vrs > 15.0) {
          ;[this.blendX, i] = getFloat(chunks, i)
        }
        ;[this.blendS, i] = getSingularity(chunks, i)
        ;[this.blendB, i] = getBoolean(chunks, i)
        if (this.blendB) {
          ;[this.blendN, i] = getInteger(chunks, i)
          ;[this.blendA, i] = getFloatArray(chunks, i)
        }
      }
      ;[this.blendT, i] = getText(chunks, i)
    }

    if (inventor) {
      ;[this.blendS2, i] = getSingularity(chunks, i)
      ;[this.blendB2, i] = getBoolean(chunks, i)
    }

    return i
  }

  // Parameter curve (Python lines 2536-2554)
  setParameter(chunks, index, inventor) {
    const vrs = getVersion()
    let i = this.setSurfaceCurve(chunks, index, inventor, 'par_int_cur')

    if ((vrs > 15.0) && !isASM()) {
      i += 1 // float
    }

    if (!inventor) {
      if (vrs > 10.0) {
        ;[this.paramSing, i] = getSingularity(chunks, i)
        ;[this.paramB1, i] = getBoolean(chunks, i)
        if (this.paramB1) {
          ;[this.paramN, i] = getInteger(chunks, i)
          ;[this.paramF, i] = getFloatArray(chunks, i)
        }
      }
      ;[this.paramT, i] = getText(chunks, i)
    } else {
      i += 1 // skip Number
      i += 1 // skip Boolean
      if (chunks[i] && chunks[i].tag !== TAG_SUBTYPE_CLOSE) {
        ;[this.paramB2, i] = getBoolean(chunks, i)
      }
    }

    return i
  }

  // Surface curve (Python lines 2555-2569)
  setSurface(chunks, index, inventor) {
    let i = this.setSurfaceCurve(chunks, index, inventor, 'surf_int_cur')

    if ((getVersion() > 15) && !isASM()) {
      ;[this.surfN, i] = getInteger(chunks, i)
      ;[this.surfO, i] = getValue(chunks, i)
      ;[this.surfB1, i] = getBoolean(chunks, i)
      ;[this.surfT, i] = getText(chunks, i)
      ;[this.surfB2, i] = getBoolean(chunks, i)
    } else {
      if (inventor) {
        ;[this.surfN, i] = getInteger(chunks, i)
        ;[this.surfB, i] = getBoolean(chunks, i)
      } else {
        ;[this.surfT, i] = getText(chunks, i)
      }
    }

    return i
  }

  // Ortho curve
  setOrtho(chunks, index, inventor) {
    let i = this.setSurfaceCurve(chunks, index, inventor, 'ortho_int_cur')
    ;[this.orthoB, i] = getBoolean(chunks, i)
    return i
  }

  // Ref curve (Python lines 2570-2577)
  setRef(chunks, index) {
    this.subtype = 'ref'
    ;[this.ref, ] = getInteger(chunks, index)
    const reader = getReader()
    if (reader) {
      this.curve = reader.getSubtypeEntity(this.ref)
    }

    if (this.curve && !(this.curve instanceof Curve)) {
      console.error(`Expected CURVE for 'ref ${this.ref}' but found ${this.curve?.constructor?.name}`)
      this.curve = null
    }

    return index + 1
  }

  // Bulk router (Python lines 2578-2593)
  setBulk(chunks, index) {
    let i = index

    // Skip TAG_SUBTYPE_OPEN marker if present
    if (chunks[i] && chunks[i].tag === TAG_SUBTYPE_OPEN) {
      i += 1
    }

    ;[this.subtype, ] = getValue(chunks, i)
    i += 1

    if (this.subtype === 'ref') {
      return this.setRef(chunks, i)
    }

    try {
      if (getVersion() >= 25.0) {
        ;[this.id, i] = getInteger(chunks, i)
      }
      const reader = getReader()
      if (reader) {
        reader.addSubtypeEntity(this)
      }

      const prm = CURVE_SET_DATA[this.subtype]
      if (!prm) {
        throw new Error(`No implementation for intcurve '${this.subtype}'`)
      }

      const fkt = this[prm[0]]
      if (typeof fkt !== 'function') {
        throw new Error(`Method ${prm[0]} not found for intcurve '${this.subtype}'`)
      }

      return fkt.call(this, chunks, i, prm[2])
    } catch (e) {
      console.error(`Error parsing intcurve '${this.subtype}':`, e.message)
      return i
    }
  }

  // Main setSubtype (Python lines 2591-2596)
  setSubtype(chunks, index) {
    ;[this.sense, ] = getEnumByTag(chunks, index, SENSE)
    let i = index + 1

    i = this.setBulk(chunks, i)

    // Verify closing bracket
    if (chunks[i] && chunks[i].tag === TAG_SUBTYPE_CLOSE) {
      i += 1
    }

    ;[this.range, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())

    return i
  }

  build(start, end) {
    if (this._readyToBuild) {
      this._readyToBuild = false

      // Build based on subtype
      if (this.subtype === 'ref') {
        let cur = this.curve
        if (cur && !(cur instanceof Curve)) {
          cur = cur.getCurve ? cur.getCurve() : null
        }
        if (cur) {
          this.shape = cur.build(start, end)
        }
      } else if (this.helix) {
        this.shape = { type: 'helix', helix: this.helix, start, end }
      } else if (this.spline) {
        this.shape = {
          type: 'bspline_curve',
          spline: this.spline,
          sense: this.sense,
          start, end
        }
      } else if (this.surfaceProjection) {
        const { surface, curve } = this.surfaceProjection
        this.shape = {
          type: 'pcurve',
          surface, curve,
          sense: this.sense,
          start, end
        }
      } else if (this.curves && this.curves.length > 0) {
        const shapes = []
        for (const c of this.curves) {
          if (c && typeof c.build === 'function') {
            const shp = c.build(start, end)
            if (shp) shapes.push(shp)
          }
        }
        if (shapes.length > 0) {
          this.shape = { type: 'compound_curve', curves: shapes }
        }
      } else if (start && end) {
        this.shape = { type: 'line', start, end }
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

  setBulk(chunks, index) {
    let i = index

    // Skip TAG_SUBTYPE_OPEN marker if present
    if (chunks[i] && chunks[i].tag === TAG_SUBTYPE_OPEN) {
      i += 1
    }

    ;[this.subtype, ] = getValue(chunks, i)
    i += 1

    if (this.subtype === 'ref') {
      return this.setRef(chunks, i)
    }

    if ((getVersion() >= 25.0) && !isASM()) {
      ;[this.id, i] = getInteger(chunks, i)
    }

    const reader = getReader()
    if (reader) {
      reader.addSubtypeEntity(this)
    }

    if (this.subtype === 'lawintcur') {
      return this.setLaw(chunks, i, false)
    }
    if (this.subtype === 'law_int_cur') {
      return this.setLaw(chunks, i + 1, true)
    }

    throw new Error(`No implementation for intcurve-intcurve '${this.subtype}'`)
  }
}

// ============================================================================
// PCURVE_SET_DATA - Maps pcurve subtype names to setter methods
// ============================================================================

const PCURVE_SET_DATA = {
  'exppc': 'setExpPar',
  'exp_par_cur': 'setExpPar',
  'imppc': 'setImpPar',
  'imp_par_cur': 'setImpPar'
}

// ============================================================================
// PCurve (Parameter curve on surface)
// ============================================================================

class CurveP extends Curve {
  constructor() {
    super('pcurve')
    this.subtype = -1
    this.sense = 'forward'
    this.pcurve = null
    this.type = 0
  }

  getSurface() {
    if (this.surface) return this.surface
    if (this.pcurve && this.pcurve.getSurface) {
      return this.pcurve.getSurface()
    }
    return null
  }

  // Explicit parametric curve (Python lines 2667-2674)
  setExpPar(chunks, index) {
    this.subtype = 'exp_par_cur'
    const vrs = getVersion()
    let i = index

    ;[this.pcurve, i] = readBS2Curve(chunks, i)
    ;[this.tolerance, i] = getFloat(chunks, i)

    if ((vrs > 11.0) && !isASM()) {
      i += 1
    }

    ;[this.surface, i] = readSurface(chunks, i)

    return i
  }

  // Implicit parametric curve (Python lines 2675-2682)
  setImpPar(chunks, index) {
    this.subtype = 'imp_par_cur'
    let i = index

    ;[this.sense, i] = getEnumByTag(chunks, i, SENSE)

    this.curve = new CurveInt()
    i = this.curve.setBulk(chunks, i + 1)

    // Verify closing bracket
    if (chunks[i] && chunks[i].tag === TAG_SUBTYPE_CLOSE) {
      // Don't advance, will be handled by caller
    }

    this.surface = this.curve.getSurface()

    return i
  }

  // Ref pcurve (Python lines 2683-2690)
  setRef(chunks, index) {
    this.subtype = 'ref'
    ;[this.ref, ] = getInteger(chunks, index)

    const reader = getReader()
    if (reader) {
      this.pcurve = reader.getSubtypeEntity(this.ref)
    }

    if (this.pcurve && !(this.pcurve instanceof CurveP)) {
      console.error(`Expected PCURVE for 'ref ${this.ref}' but found ${this.pcurve?.constructor?.name}`)
      this.pcurve = null
    }

    return index + 1
  }

  // Bulk router (Python lines 2691-2703)
  setBulk(chunks, index) {
    let i = index

    // Skip TAG_SUBTYPE_OPEN marker if present
    if (chunks[i] && chunks[i].tag === TAG_SUBTYPE_OPEN) {
      i += 1
    }

    ;[this.subtype, ] = getValue(chunks, i)
    i += 1

    if (this.subtype === 'ref') {
      return this.setRef(chunks, i)
    }

    try {
      if (getVersion() >= 25.0) {
        ;[this.id, i] = getInteger(chunks, i)
      }

      const reader = getReader()
      if (reader) {
        reader.addSubtypeEntity(this)
      }

      const prm = PCURVE_SET_DATA[this.subtype]
      if (!prm) {
        throw new Error(`No implementation for pcurve '${this.subtype}'`)
      }

      const fkt = this[prm]
      if (typeof fkt !== 'function') {
        throw new Error(`Method ${prm} not found for pcurve '${this.subtype}'`)
      }

      return fkt.call(this, chunks, i)
    } catch (e) {
      console.error(`Error parsing pcurve '${this.subtype}':`, e.message)
      return i
    }
  }

  // Main setSubtype (Python lines 2704-2710)
  setSubtypeInternal(chunks, index) {
    ;[this.sense, ] = getEnumByTag(chunks, index, SENSE)
    let i = index + 1

    i = this.setBulk(chunks, i)

    // Verify closing bracket
    if (chunks[i] && chunks[i].tag === TAG_SUBTYPE_CLOSE) {
      i += 1
    }

    ;[this.u, i] = getFloat(chunks, i)
    ;[this.v, i] = getFloat(chunks, i)

    return i
  }

  // Main set (Python lines 2711-2721)
  set(record) {
    let i = super.set(record)

    ;[this.type, i] = getInteger(record.chunks, i)

    if (this.type === 0) {
      i = this.setSubtypeInternal(record.chunks, i)
    } else {
      ;[this.pcurve, i] = getRefNode(record, i, 'curve')
      ;[this.u, i] = getFloat(record.chunks, i)
      ;[this.v, i] = getFloat(record.chunks, i)
      this.subtype = 'ref'
    }

    return i
  }

  // Build (Python lines 2722-2731)
  build(start, end) {
    if (this._readyToBuild) {
      this._readyToBuild = false

      if (this.subtype === 'ref') {
        if (this.pcurve && typeof this.pcurve.build === 'function') {
          this.shape = this.pcurve.build(start, end)
        }
      } else if (this.subtype === 'exp_par_cur') {
        this.shape = {
          type: 'pcurve',
          pcurve: this.pcurve,
          surface: this.surface,
          sense: this.sense,
          start, end
        }
      } else if (this.subtype === 'imp_par_cur') {
        if (this.curve && typeof this.curve.build === 'function') {
          this.shape = this.curve.build(start, end)
        }
      }
    }
    return this.shape
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
  'blend_int_cur': ['setBlend', 1, true],
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
  'surf_int_cur': ['setSurface', 1, true],

  // Silhouette subtypes
  'silh_int_cur': ['setSilhouette', 1, true],
  'para_silh_int_cur': ['setSilhouetteParameter', 1, true],
  'taper_silh_int_cur': ['setSilhouetteTaper', 1, true]
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
    this.major = { ...DIR_X }  // Major direction vector (not radius)
    this.ratio = 1.0
    this.range = new Interval(new Range('I', MIN_INF), new Range('I', MAX_INF))
    this.sine = 0.0
    this.cosine = 0.0
    this.scale = 1.0
    this.sense = 'forward'
    this.uRange = new Interval(new Range('I', MIN_0), new Range('I', MAX_2PI))
    this.vRange = new Interval(new Range('I', MIN_INF), new Range('I', MAX_INF))
  }

  setSubtype(chunks, index) {
    let i = index
    // Python format: center axis major ratio range sine cosine scale sense urange vrange
    ;[this.center, i] = getLocation(chunks, i)
    ;[this.axis, i] = getVector(chunks, i)
    ;[this.major, i] = getVector(chunks, i)  // Direction vector, not scalar
    ;[this.ratio, i] = getFloat(chunks, i)
    ;[this.range, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())
    ;[this.sine, i] = getFloat(chunks, i)
    ;[this.cosine, i] = getFloat(chunks, i)
    ;[this.scale, i] = getFloat(chunks, i)
    ;[this.sense, i] = getEnumByTag(chunks, i, SENSE)
    ;[this.uRange, i] = getInterval(chunks, i, MIN_0, MAX_2PI, 1.0)
    ;[this.vRange, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())
    return i
  }

  // Compute semi-angle from sine/cosine
  getSemiAngle() {
    return Math.atan2(this.sine, this.cosine)
  }

  // Compute radius at v=0
  getMajorRadius() {
    return SIZE(this.major)
  }

  getMinorRadius() {
    return this.getMajorRadius() * this.ratio
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
        majorRadius: this.getMajorRadius(),
        minorRadius: this.getMinorRadius(),
        semiAngle: this.getSemiAngle(),
        major: this.major
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
    ;[this.uvOrigin, i] = getVector(chunks, i)  // Direction vector
    ;[this.pole, i] = getVector(chunks, i)       // Direction vector
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
    // Parse mesh data: vertex count, vertices, face count, faces
    let i = index
    let n
    ;[n, i] = getInteger(chunks, i)

    // Read vertices
    this.vertices = []
    for (let k = 0; k < n; k++) {
      let pt
      ;[pt, i] = getLocation(chunks, i)
      this.vertices.push(pt)
    }

    // Read faces
    ;[n, i] = getInteger(chunks, i)
    this.faces = []
    for (let k = 0; k < n; k++) {
      const [idx, i2] = getIntegers(chunks, i, 3)
      this.faces.push(idx)
      i = i2
    }

    return i
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
    this.record = null
    this.index = -1
    this.rangeU = null
    this.rangeV = null
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

  // ==========================================================================
  // Helper Methods for Reading Complex Data
  // ==========================================================================

  _readLoftProfile(chunks, index, inventor) {
    // Read loft profile curve data
    let i = index
    let curve
    ;[curve, i] = readCurve ? readCurve(chunks, i) : [null, i]
    return [curve, i]
  }

  _readLoftPath(chunks, index) {
    // Read loft path curve data
    let i = index
    let curve
    ;[curve, i] = readCurve ? readCurve(chunks, i) : [null, i]
    return [curve, i]
  }

  _readLofSection(chunks, index, inventor) {
    let n, i
    ;[n, i] = getInteger(chunks, index)
    const loft = []

    for (let k = 0; k < n; k++) {
      let fk, profile, path
      ;[fk, i] = getFloat(chunks, i)
      ;[profile, i] = this._readLoftProfile(chunks, i, inventor)
      if (inventor) {
        ;[path, i] = this._readLoftPath(chunks, i)
      } else {
        path = null
      }
      loft.push([fk, profile, path])
    }
    return [loft, i]
  }

  _readLoftData(chunks, index) {
    const data = new LoftData()
    let i = index

    ;[data.surface, i] = readSurface ? readSurface(chunks, i) : [null, i]
    ;[data.bs2cur, i] = readBS2Curve(chunks, i)
    ;[data.e1, i] = getBoolean(chunks, i)
    ;[data.type, i] = getInteger(chunks, i)
    ;[data.n, i] = getInteger(chunks, i)
    ;[data.m, i] = getInteger(chunks, i)

    data.v = []
    for (let k = 0; k < data.m; k++) {
      let val
      ;[val, i] = getFloat(chunks, i)
      data.v.push(val)
    }

    return [data, i]
  }

  _readRbBlendSurface1(chunks, index, inventor) {
    let i = index
    let name, surface, curve, bs, v

    ;[name, i] = getText(chunks, i)
    ;[surface, i] = readSurface ? readSurface(chunks, i) : [null, i]
    ;[curve, i] = readCurve ? readCurve(chunks, i) : [null, i]
    ;[bs, i] = readBS2Curve(chunks, i)
    ;[v, i] = getLocation(chunks, i)

    if (inventor) {
      let bs1, spline, tol
      ;[bs1, i] = readBS2Curve(chunks, i)
      ;[spline, tol, i] = readSplineSurface(chunks, i, false)
      return [[name, surface, curve, bs, v, [bs1, spline, tol]], i]
    }
    return [[name, surface, curve, bs, v, null], i]
  }

  _readRbBlendSurface2(chunks, index, inventor) {
    let i = index
    let name, surface, curve, bs, v

    ;[name, i] = getText(chunks, i)
    ;[surface, i] = readSurface ? readSurface(chunks, i) : [null, i]
    ;[curve, i] = readCurve ? readCurve(chunks, i) : [null, i]
    ;[bs, i] = readBS2Curve(chunks, i)
    ;[v, i] = getLocation(chunks, i)

    if (inventor) {
      let bs1, f, bs2
      ;[bs1, i] = readBS2Curve(chunks, i)
      ;[f, i] = getFloat(chunks, i)
      ;[bs2, i] = readBS2Curve(chunks, i)
    }
    return [[name, surface, curve, bs, v], i]
  }

  _readRbBlendCurve(chunks, index, inventor) {
    let i = index
    let txt, srf, cur, bs2, vec

    ;[txt, i] = getText(chunks, i)
    ;[srf, i] = readSurface ? readSurface(chunks, i) : [null, i]
    ;[cur, i] = readCurve ? readCurve(chunks, i) : [null, i]
    ;[bs2, i] = readBS2Curve(chunks, i)
    ;[vec, i] = getVector(chunks, i)

    if (inventor) {
      let bs3, num, bs4
      ;[bs3, i] = readBS2Curve(chunks, i)
      ;[num, i] = getInteger(chunks, i)
      ;[bs4, i] = readBS2Curve(chunks, i)
      i += 1 // skip "False"
      return [[txt, srf, cur, bs2, vec, [bs3, num, bs4]], i]
    }
    return [[txt, srf, cur, bs2, vec, null], i]
  }

  _readScaleClLoft(chunks, index) {
    const chunk = chunks[index]
    if (chunk.tag === TAG_TRUE || chunk.tag === TAG_FALSE) {
      return [null, index]
    }

    let n, i
    ;[n, i] = getInteger(chunks, index)
    const lofts = []

    for (let k = 0; k < n; k++) {
      let nk, ck, lk
      ;[nk, i] = getInteger(chunks, i)
      ;[ck, i] = readCurve ? readCurve(chunks, i) : [null, i]
      ;[lk, i] = this._readLoftData(chunks, i)
      lofts.push([nk, ck, lk])
    }

    const nextChunk = chunks[i]
    if (nextChunk && ![TAG_UTF8_U8, TAG_IDENT, TAG_SUBIDENT].includes(nextChunk.tag)) {
      return [null, index]
    }

    let cur, bs3, arr
    ;[cur, i] = readCurve ? readCurve(chunks, i) : [null, i]
    ;[n, i] = getInteger(chunks, i)

    bs3 = []
    for (let k = 0; k < n; k++) {
      let bs3c
      ;[bs3c, i] = readBS3Curve(chunks, i)
      bs3.push(bs3c)
    }

    ;[arr, i] = getIntegers(chunks, i, 2)
    return [[lofts, cur, bs3, arr], i]
  }

  _readSkin(chunks, index, inventor) {
    const skin = new Skin()
    let i = index

    ;[skin.a1, i] = getIntegers(chunks, i, 4)
    ;[skin.f1, i] = getFloat(chunks, i)

    if (inventor) {
      let n
      ;[n, i] = getInteger(chunks, i)
      const nextChunk = chunks[i]

      if (nextChunk && ![TAG_UTF8_U8, TAG_IDENT, TAG_SUBIDENT].includes(nextChunk.tag)) {
        for (let k = 0; k < n; k++) {
          i += 1
          let curve, loftdata
          ;[curve, i] = readCurve ? readCurve(chunks, i) : [null, i]
          ;[loftdata, i] = this._readLoftData(chunks, i)
          skin.loft.push([curve, loftdata])
        }
        ;[skin.cur2, i] = readCurve ? readCurve(chunks, i) : [null, i]
        i += 2 // 0, -1
      } else {
        ;[skin.cur, i] = readCurve ? readCurve(chunks, i) : [null, i]
        ;[skin.loft, i] = readLofSubdata(chunks, i)
        i += 1
        ;[skin.cur2, i] = readCurve ? readCurve(chunks, i) : [null, i]
        i += 1
      }
      ;[skin.vec, i] = getVector(chunks, i)
    } else {
      ;[skin.cur, i] = readCurve ? readCurve(chunks, i) : [null, i]
      ;[skin.vec, i] = getVector(chunks, i)
      ;[skin.surf, i] = readSurface ? readSurface(chunks, i) : [null, i]
    }

    ;[skin.f2, i] = getFloat(chunks, i)
    ;[skin.law, i] = readFormula(chunks, i)
    ;[skin.pcur, i] = readCurve ? readCurve(chunks, i) : [null, i]

    return [skin, i]
  }

  _readBoundaryGeometry(chunks, index, inventor) {
    let i = index
    let svId
    ;[svId, i] = getText(chunks, i)

    const VblClass = VBL_CLASSES[svId]
    if (!VblClass) {
      console.warn(`Unknown VBL type: ${svId}`)
      return [null, i]
    }

    const vbl = new VblClass()
    ;[vbl.type, i] = getEnumByTag(chunks, i, CIRC_TYP)
    ;[vbl.magic, i] = getLocation(chunks, i)
    ;[vbl.uSmoothing, i] = getEnumByTag(chunks, i, CIRC_SMTH)
    ;[vbl.vSmoothing, i] = getEnumByTag(chunks, i, CIRC_SMTH)
    ;[vbl.fullness, i] = getFloat(chunks, i)

    if (svId === 'circle') {
      ;[vbl.curve, i] = readCurve ? readCurve(chunks, i) : [null, i]
      let subType
      ;[subType, i] = getEnumByValue(chunks, i, VBL_CIRCLE)

      if (subType === 'circle') {
        vbl.twist = [null, null]
      } else if (subType === 'ellipse') {
        let v1
        ;[v1, i] = getLocation(chunks, i)
        vbl.twist = [v1, null]
      } else if (subType === 'unknown') {
        let v1, v2
        ;[v1, i] = getLocation(chunks, i)
        ;[v2, i] = getLocation(chunks, i)
        vbl.twist = [v1, v2]
      }

      ;[vbl.parameters, i] = getFloats(chunks, i, 2)
      ;[vbl.sense, i] = getEnumByTag(chunks, i, SENSE)
    } else if (svId === 'deg') {
      ;[vbl.location, i] = getLocation(chunks, i)
      ;[vbl.normal1, i] = getVector(chunks, i)
      ;[vbl.normal2, i] = getVector(chunks, i)
    } else if (svId === 'pcurve') {
      ;[vbl.surface, i] = readSurface ? readSurface(chunks, i) : [null, i]
      ;[vbl.pcurve, i] = readBS2Curve(chunks, i)
      ;[vbl.sense, i] = getEnumByTag(chunks, i, SENSE)
      ;[vbl.fittolerance, i] = getFloats(chunks, i, 1)
    } else if (svId === 'plane') {
      ;[vbl.normal, i] = getVector(chunks, i)
      ;[vbl.parameters, i] = getFloats(chunks, i, 2)
      ;[vbl.curve, i] = readCurve ? readCurve(chunks, i) : [null, i]
    }

    return [vbl, i]
  }

  _getBlendValues(chunks, index) {
    // Read blend values (radius definitions)
    let i = index
    let n
    ;[n, i] = getInteger(chunks, i)

    const values = []
    for (let k = 0; k < n; k++) {
      let f
      ;[f, i] = getFloat(chunks, i)
      values.push(f)
    }

    return [values, i]
  }

  // ==========================================================================
  // Surface Shape Base Method
  // ==========================================================================

  setSurfaceShape(chunks, index, inventor, subtype = 'spl_sur') {
    this.subtype = subtype
    let i = index

    ;[this.spline, this.tolerance, i] = readSplineSurface(chunks, i, true)

    if (getVersion() >= 2.0) {
      let arr
      ;[arr, i] = getDiscontinuityInfo(chunks, i, inventor)
    }

    return i
  }

  // ==========================================================================
  // Surface Setters - Simple
  // ==========================================================================

  setRotation(chunks, index, inventor) {
    let i = index
    ;[this.profile, i] = readCurve ? readCurve(chunks, i) : [null, i]
    ;[this.loc, i] = getLocation(chunks, i)
    ;[this.dir, i] = getVector(chunks, i)
    i = this.setSurfaceShape(chunks, i, inventor, 'rot_spl_sur')
    return i
  }

  setRule(chunks, index, inventor) {
    let i = index
    ;[this.profile1, i] = readCurve ? readCurve(chunks, i) : [null, i]
    ;[this.profile2, i] = readCurve ? readCurve(chunks, i) : [null, i]
    i = this.setSurfaceShape(chunks, i, inventor, 'rule_sur')
    return i
  }

  setCylinder(chunks, index, inventor) {
    let i = index
    ;[this.profile, i] = readCurve ? readCurve(chunks, i) : [null, i]
    ;[this.axis, i] = getVector(chunks, i)
    ;[this.center, i] = getLocation(chunks, i)
    i = this.setSurfaceShape(chunks, i, inventor, 'cyl_spl_sur')
    return i
  }

  setExact(chunks, index, inventor) {
    let i = this.setSurfaceShape(chunks, index, inventor, 'exact_spl_sur')

    if (getVersion() > 2.0) {
      let rU, rV
      ;[rU, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())
      ;[rV, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())
      if (inventor) {
        let ft
        ;[ft, i] = getInteger(chunks, i)
      }
    }
    return i
  }

  setSum(chunks, index, inventor) {
    let i = index
    ;[this.curve1, i] = readCurve ? readCurve(chunks, i) : [null, i]
    ;[this.curve2, i] = readCurve ? readCurve(chunks, i) : [null, i]
    ;[this.origin, i] = getLocation(chunks, i)
    i = this.setSurfaceShape(chunks, i, inventor, 'sum_spl_sur')
    return i
  }

  setOrtho(chunks, index, inventor) {
    let i = this.setTaper(chunks, index, inventor, 'ortho_spl_sur')
    ;[this.senseBool, i] = getBoolean(chunks, i)
    return i
  }

  // ==========================================================================
  // Surface Setters - Medium Complexity
  // ==========================================================================

  setOffset(chunks, index, inventor) {
    let i = index
    ;[this.surface, i] = readSurface ? readSurface(chunks, i) : [null, i]
    ;[this.offset, i] = getFloat(chunks, i)
    ;[this.senseU, i] = getEnumByTag(chunks, i, SENSE)
    ;[this.senseV, i] = getEnumByTag(chunks, i, SENSE)

    if (inventor) {
      let e3
      ;[e3, i] = getBoolean(chunks, i)
      if (e3) {
        let e4
        ;[e4, i] = getBoolean(chunks, i)
      }
      const chunk = chunks[i]
      if (chunk && (chunk.tag === TAG_TRUE || chunk.tag === TAG_FALSE)) {
        let e5
        ;[e5, i] = getBoolean(chunks, i)
      }
    }

    i = this.setSurfaceShape(chunks, i, inventor, 'off_spl_sur')
    return i
  }

  setSkin(chunks, index, inventor) {
    let i = index
    const skins = []

    let bool, norm, dir, n
    ;[bool, i] = getEnumByTag(chunks, i, SURF_BOOL)
    ;[norm, i] = getEnumByTag(chunks, i, SURF_NORM)
    ;[dir, i] = getEnumByTag(chunks, i, SURF_DIR)
    ;[n, i] = getInteger(chunks, i)

    for (let k = 0; k < n; k++) {
      let skin
      ;[skin, i] = this._readSkin(chunks, i, inventor)
      skins.push(skin)
    }

    this.skins = skins
    ;[n, i] = getInteger(chunks, i)
    i = this.setSurfaceShape(chunks, i, inventor, 'skin_spl_sur')
    return i
  }

  setVertexBlend(chunks, index, inventor) {
    let i = index
    let n
    ;[n, i] = getInteger(chunks, i)

    this.boundaries = []
    for (let j = 0; j < n; j++) {
      let vbl
      ;[vbl, i] = this._readBoundaryGeometry(chunks, i, inventor)
      this.boundaries.push(vbl)
    }

    let grid, tolerance
    ;[grid, i] = getInteger(chunks, i)
    ;[tolerance, i] = getFloat(chunks, i)

    this.subtype = 'VBL_SURF'
    return i
  }

  setHelixCircle(chunks, index, inventor) {
    this.subtype = 'helix_spl_circ'
    let i = index

    ;[this.angle, i] = getInterval(chunks, i, MIN_PI, MAX_PI, 1.0)
    ;[this.dime1, i] = getInterval(chunks, i, -MAX_LEN, MAX_LEN, getScale())
    ;[this.length, i] = getLength(chunks, i)

    this.path = new CurveInt('helix_int_cur')
    i = this.path.setHelix(chunks, i, inventor)

    ;[this.radius, i] = getLength(chunks, i)
    return i
  }

  setHelixLine(chunks, index, inventor) {
    this.subtype = 'helix_spl_line'
    let i = index

    ;[this.angle, i] = getInterval(chunks, i, MIN_PI, MAX_PI, 1.0)
    ;[this.dime1, i] = getInterval(chunks, i, -MAX_LEN, MAX_LEN, 1.0)

    this.path = new CurveInt('helix_int_cur')
    i = this.path.setHelix(chunks, i, inventor)

    ;[this.origin, i] = getLocation(chunks, i)
    return i
  }

  setCompound(chunks, index, inventor) {
    let i = this.setSurfaceShape(chunks, index, inventor, 'comp_spl_sur')
    let d
    ;[d, i] = getFloatArray(chunks, i)

    this.compounds = []
    for (let k = 0; k < d.length; k++) {
      let f
      ;[f, i] = readSurface ? readSurface(chunks, i) : [null, i]
      this.compounds.push(f)
    }
    return i
  }

  setClLoft(chunks, index, inventor) {
    let i = this.setSurfaceShape(chunks, index, inventor, 'cl_loft_spl_sur')

    let scl1, scl2, scl3, scl4, scl5
    ;[scl1, i] = this._readScaleClLoft(chunks, i)
    ;[scl2, i] = this._readScaleClLoft(chunks, i)
    ;[scl3, i] = this._readScaleClLoft(chunks, i)
    ;[scl4, i] = this._readScaleClLoft(chunks, i)

    const chunk = chunks[i]
    if (chunk && chunk.tag === TAG_LONG) {
      ;[scl5, i] = this._readScaleClLoft(chunks, i)
    }

    let e1, e2, n1
    ;[e1, i] = getBoolean(chunks, i)
    ;[e2, i] = getBoolean(chunks, i)
    ;[n1, i] = getInteger(chunks, i)

    if (n1 === 6) {
      let e3, e4, n2, v1, r1, bsc1
      ;[e3, i] = getBoolean(chunks, i)
      ;[e4, i] = getBoolean(chunks, i)
      ;[scl5, i] = this._readScaleClLoft(chunks, i)
      ;[n2, i] = getInteger(chunks, i)
      ;[v1, i] = getVector(chunks, i)
      ;[r1, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
      ;[bsc1, i] = readBS3Curve(chunks, i)
    } else if (n1 === 7) {
      let e3, e4, scl6, n2, v1, e5, e6
      ;[e3, i] = getBoolean(chunks, i)
      ;[scl5, i] = this._readScaleClLoft(chunks, i)
      ;[e4, i] = getBoolean(chunks, i)
      ;[scl6, i] = this._readScaleClLoft(chunks, i)
      ;[n2, i] = getInteger(chunks, i)
      ;[v1, i] = getVector(chunks, i)
      ;[e5, i] = getBoolean(chunks, i)
      ;[e6, i] = getBoolean(chunks, i)
    } else {
      let e3, e4, n2, c3, e5, e6
      ;[e3, i] = getBoolean(chunks, i)
      ;[e4, i] = getBoolean(chunks, i)
      ;[n2, i] = getInteger(chunks, i)
      if (n2 === 0) {
        ;[c3, i] = getVector(chunks, i)
      } else {
        ;[c3, i] = readBS3Curve(chunks, i)
      }
      ;[e5, i] = getBoolean(chunks, i)
      ;[e6, i] = getBoolean(chunks, i)
    }

    return i
  }

  // ==========================================================================
  // Surface Setters - High Complexity
  // ==========================================================================

  setLoft(chunks, index, inventor) {
    let i = index

    ;[this.ls1, i] = this._readLofSection(chunks, i, inventor)
    ;[this.ls2, i] = this._readLofSection(chunks, i, inventor)
    ;[this.r1, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
    ;[this.r2, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
    ;[this.clsr1, i] = getEnumByValue(chunks, i, CLOSURE)
    ;[this.clsr2, i] = getEnumByValue(chunks, i, CLOSURE)
    ;[this.sng1, i] = getSingularity(chunks, i)
    ;[this.sng2, i] = getSingularity(chunks, i)

    let b
    ;[b, i] = getInteger(chunks, i)

    // Skip until we find the spline surface
    while (i < chunks.length - 1) {
      const nextChunk = chunks[i + 1]
      if (nextChunk && [TAG_UTF8_U8, TAG_IDENT, TAG_SUBIDENT].includes(nextChunk.tag)) {
        break
      }
      i++
    }

    i = this.setSurfaceShape(chunks, i, inventor, 'loft_spl_sur')
    return i
  }

  setNet(chunks, index, inventor) {
    let i = index

    ;[this.ls1, i] = this._readLofSection(chunks, i, inventor)
    ;[this.ls2, i] = this._readLofSection(chunks, i, inventor)

    if (inventor) {
      let a1, a2, v1, v2, v3, v4
      ;[a1, i] = getFloats(chunks, i, 12)
      ;[a2, i] = getInteger(chunks, i)
      ;[v1, i] = getVector(chunks, i)
      ;[v2, i] = getVector(chunks, i)
      ;[v3, i] = getVector(chunks, i)
      ;[v4, i] = getVector(chunks, i)
    } else {
      const st = []
      const n_u = this.ls1.length
      for (let j = 0; j < this.ls2.length; j++) {
        let a2
        ;[a2, i] = getFloats(chunks, i, 2 * n_u)
        st.push(reshape(a2, 2))
      }
    }

    ;[this.frml1, i] = readFormula(chunks, i)
    ;[this.frml2, i] = readFormula(chunks, i)
    ;[this.frml3, i] = readFormula(chunks, i)
    ;[this.frml4, i] = readFormula(chunks, i)

    i = this.setSurfaceShape(chunks, i, inventor, 'net_spl_sur')
    return i
  }

  setRbBlend(chunks, index, inventor, subtype = 'rb_blend_spl_sur') {
    this.subtype = subtype
    let i = index
    const vrs = getVersion()

    ;[this.blend1, i] = this._readRbBlendSurface1(chunks, i, inventor)
    ;[this.blend2, i] = this._readRbBlendSurface1(chunks, i, inventor)

    if (vrs > 22.0 && !isASM()) {
      i += 2 // 43, 1e-10
    }

    ;[this.slice, i] = readCurve ? readCurve(chunks, i) : [null, i]

    if (vrs > 22.0 && !isASM()) {
      ;[this.cT1, i] = readCurve ? readCurve(chunks, i) : [null, i]
      ;[this.cT2, i] = readCurve ? readCurve(chunks, i) : [null, i]
      ;[this.cT3, i] = readCurve ? readCurve(chunks, i) : [null, i]
      ;[this.cT4, i] = readCurve ? readCurve(chunks, i) : [null, i]
    }

    ;[this.offset_left, i] = getLength(chunks, i)
    ;[this.offset_right, i] = getLength(chunks, i)

    let f1
    ;[f1, i] = getValue(chunks, i)

    let rU
    ;[rU, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)

    if (vrs <= 3.0) {
      let r1, r2
      ;[r1, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
      ;[r2, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
      i += 2
    }

    let rV, a2
    ;[rV, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
    ;[a2, i] = getFloats(chunks, i, 3)

    if (vrs > 22.0 && !isASM()) {
      i += 1 // T
    }

    i += 1 // skip long

    if (vrs > 3.0) {
      i = this.setSurfaceShape(chunks, i, inventor, subtype)
    }

    if (inventor) {
      // Discontinuity-Info
      let di1, di2, di3
      ;[di1, i] = getFloatArray(chunks, i)
      ;[di2, i] = getFloatArray(chunks, i)
      ;[di3, i] = getFloatArray(chunks, i)
    }

    return i
  }

  setG2Blend(chunks, index, inventor) {
    let i = index

    let t11
    ;[t11, i] = getValue(chunks, i)
    while (!isString(t11)) {
      ;[t11, i] = getValue(chunks, i)
    }

    let s11, c11, p11, v11, p12
    ;[s11, i] = readSurface ? readSurface(chunks, i) : [null, i]
    ;[c11, i] = readCurve ? readCurve(chunks, i) : [null, i]
    ;[p11, i] = readBS2Curve(chunks, i)
    ;[v11, i] = getVector(chunks, i)
    ;[p12, i] = readBS2Curve(chunks, i)

    let singularity
    ;[singularity, i] = getSingularity(chunks, i)

    if (singularity === 'full') {
      let s12
      ;[s12, i] = readBS3Surface(chunks, i)
      if (s12) {
        let tol11
        ;[tol11, i] = getLength(chunks, i)
      }
    } else if (singularity === 'none') {
      let s12, tol11, p13
      ;[s12, i] = getFloats(chunks, i, 9)
      ;[tol11, i] = getLength(chunks, i)

      const chunk = chunks[i]
      if (chunk && ![TAG_UTF8_U8, TAG_IDENT, TAG_SUBIDENT].includes(chunk.tag)) {
        i += 1 // newer Inventor versions (>2017)
      }
      ;[p13, i] = readBS2Curve(chunks, i)
    }

    let t21, s21, c21, p21, v21, p22, s22, tol21
    ;[t21, i] = getValue(chunks, i)
    ;[s21, i] = readSurface ? readSurface(chunks, i) : [null, i]
    ;[c21, i] = readCurve ? readCurve(chunks, i) : [null, i]
    ;[p21, i] = readBS2Curve(chunks, i)
    ;[v21, i] = getVector(chunks, i)
    ;[p22, i] = readBS2Curve(chunks, i)
    ;[s22, tol21, i] = readSplineSurface(chunks, i, true)

    let c1, a1, l1, rU, rV
    ;[c1, i] = readCurve ? readCurve(chunks, i) : [null, i]
    ;[a1, i] = getFloats(chunks, i, 2)
    ;[l1, i] = getLong(chunks, i)
    ;[rU, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
    ;[rV, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
    ;[a1, i] = getFloats(chunks, i, 4)

    i = this.setSurfaceShape(chunks, i, inventor, 'g2_blend_spl_sur')

    if (inventor) {
      // Discontinuity-Info
      let di1, di2, di3
      ;[di1, i] = getFloatArray(chunks, i)
      ;[di2, i] = getFloatArray(chunks, i)
      ;[di3, i] = getFloatArray(chunks, i)
    }

    return i
  }

  setDefm(chunks, index, inventor) {
    let i = index

    ;[this.surface, i] = readSurface ? readSurface(chunks, i) : [null, i]

    let t1
    ;[t1, i] = getInteger(chunks, i)

    if (t1 === 1) {
      let v11, v12, v13, v14, f15
      ;[v11, i] = getVector(chunks, i)
      ;[v12, i] = getVector(chunks, i)
      ;[v13, i] = getVector(chunks, i)
      ;[v14, i] = getVector(chunks, i)
      ;[f15, i] = getFloat(chunks, i)

      let e21, e22, e23
      ;[e21, i] = getBoolean(chunks, i)
      ;[e22, i] = getBoolean(chunks, i)
      ;[e23, i] = getBoolean(chunks, i)

      let v21, v22, v23, f21
      ;[v21, i] = getVector(chunks, i)
      ;[v22, i] = getVector(chunks, i)
      ;[v23, i] = getVector(chunks, i)
      ;[f21, i] = getFloat(chunks, i)

      let e24, e25, v24, e26, e27, e28, e29, e2A
      ;[e24, i] = getBoolean(chunks, i)
      ;[e25, i] = getBoolean(chunks, i)
      ;[v24, i] = getPoint(chunks, i)
      ;[e26, i] = getBoolean(chunks, i)
      ;[e27, i] = getBoolean(chunks, i)
      ;[e28, i] = getBoolean(chunks, i)
      ;[e29, i] = getBoolean(chunks, i)
      ;[e2A, i] = getBoolean(chunks, i)

      let t2
      ;[t2, i] = getInteger(chunks, i)
      if (t2 > 0) {
        let a1
        ;[a1, i] = getFloats(chunks, i, 3 * t2)
      }
    } else if (t1 === 3) {
      let v11, v12, v13, v14, f15
      ;[v11, i] = getVector(chunks, i)
      ;[v12, i] = getVector(chunks, i)
      ;[v13, i] = getVector(chunks, i)
      ;[v14, i] = getVector(chunks, i)
      ;[f15, i] = getFloat(chunks, i)

      let e21, e22, e23
      ;[e21, i] = getBoolean(chunks, i)
      ;[e22, i] = getBoolean(chunks, i)
      ;[e23, i] = getBoolean(chunks, i)

      let v21, v22, v23, f21
      ;[v21, i] = getVector(chunks, i)
      ;[v22, i] = getVector(chunks, i)
      ;[v23, i] = getVector(chunks, i)
      ;[f21, i] = getFloat(chunks, i)

      let e24, e25, v24, e26, e27, e28, e29, e2A
      ;[e24, i] = getBoolean(chunks, i)
      ;[e25, i] = getBoolean(chunks, i)
      ;[v24, i] = getPoint(chunks, i)
      ;[e26, i] = getBoolean(chunks, i)
      ;[e27, i] = getBoolean(chunks, i)
      ;[e28, i] = getBoolean(chunks, i)
      ;[e29, i] = getBoolean(chunks, i)
      ;[e2A, i] = getBoolean(chunks, i)

      let t3, v31
      ;[t3, i] = getInteger(chunks, i)
      ;[v31, i] = getFloat(chunks, i)
    } else if (t1 === 5) {
      ;[this.surface, i] = readSurface ? readSurface(chunks, i) : [null, i]

      let i32, e31, f32, i33, f34
      ;[i32, i] = getLong(chunks, i)
      ;[e31, i] = getBoolean(chunks, i)
      ;[f32, i] = getFloat(chunks, i)
      ;[i33, i] = getInteger(chunks, i)
      ;[f34, i] = getFloat(chunks, i)

      this.curve = new CurveInt()
      i = this.curve.setSubtype(chunks, i)

      let v11, v12, v13, v14, f15
      ;[v11, i] = getVector(chunks, i)
      ;[v12, i] = getVector(chunks, i)
      ;[v13, i] = getVector(chunks, i)
      ;[v14, i] = getVector(chunks, i)
      ;[f15, i] = getFloat(chunks, i)

      let e21, e22, e23, t2
      ;[e21, i] = getBoolean(chunks, i)
      ;[e22, i] = getBoolean(chunks, i)
      ;[e23, i] = getBoolean(chunks, i)
      ;[t2, i] = getInteger(chunks, i)

      if (t2 > 0) {
        let a1
        ;[a1, i] = getFloats(chunks, i, 3 * t2)
      }
    } else if (t1 === 6) {
      let v11, v12, v13, v14, t2, b1, b2, b3
      ;[v11, i] = getVector(chunks, i)
      ;[v12, i] = getVector(chunks, i)
      ;[v13, i] = getVector(chunks, i)
      ;[v14, i] = getVector(chunks, i)
      ;[t2, i] = getFloat(chunks, i)
      ;[b1, i] = getBoolean(chunks, i)
      ;[b2, i] = getBoolean(chunks, i)
      ;[b3, i] = getBoolean(chunks, i)
      ;[t2, i] = getInteger(chunks, i)

      let srf, v15, b4
      ;[srf, i] = readSurface ? readSurface(chunks, i) : [null, i]
      ;[v15, i] = getLong(chunks, i)
      ;[b4, i] = getBoolean(chunks, i)

      let v16
      ;[v16, i] = getFloat(chunks, i)

      if (getVersion() > 225 && isASM()) {
        let v17
        ;[v17, i] = getLong(chunks, i)
      }

      let v18
      ;[v18, i] = getFloat(chunks, i)

      const d17 = new CurveInt()
      i = d17.setSubtype(chunks, i)

      let d18, d19, d20, d21, d22, d23, d24, d25
      ;[d18, i] = getVector(chunks, i)
      ;[d19, i] = getVector(chunks, i)
      ;[d20, i] = getVector(chunks, i)
      ;[d21, i] = getVector(chunks, i)
      ;[d22, i] = getFloat(chunks, i)
      ;[d23, i] = getBoolean(chunks, i)
      ;[d24, i] = getBoolean(chunks, i)
      ;[d25, i] = getBoolean(chunks, i)

      let d26, d27, d28, d29, d30, d31, d32, d33, d34
      ;[d26, i] = getVector(chunks, i)
      ;[d27, i] = getVector(chunks, i)
      ;[d28, i] = getVector(chunks, i)
      ;[d29, i] = getVector(chunks, i)
      ;[d30, i] = getFloat(chunks, i)
      ;[d31, i] = getBoolean(chunks, i)
      ;[d32, i] = getBoolean(chunks, i)
      ;[d33, i] = getBoolean(chunks, i)
      ;[d34, i] = getLong(chunks, i)
    } else if (t1 === 8) {
      let v11, v12, v13, v14, t2
      ;[v11, i] = getVector(chunks, i)
      ;[v12, i] = getVector(chunks, i)
      ;[v13, i] = getVector(chunks, i)
      ;[v14, i] = getVector(chunks, i)
      ;[t2, i] = getInteger(chunks, i)
    } else {
      throw new TypeError(`Unknown defm_sur_spl type ${t1}`)
    }

    i = this.setSurfaceShape(chunks, i, inventor, 'defm_spl_sur')
    return i
  }

  setSweep(chunks, index, inventor) {
    let i = index
    const vrs = getVersion()

    if (vrs > 11.0 && !isASM()) {
      let r11
      ;[r11, i] = getText(chunks, i)
    }

    ;[this.s1, i] = getEnumByTag(chunks, i, SURF_SWEEP)

    const chunk = chunks[i]
    if (chunk && [TAG_LONG, TAG_FLOAT, TAG_DOUBLE].includes(chunk.tag)) {
      let n
      ;[n, i] = getInteger(chunks, i)
      ;[this.profile, i] = readCurve ? readCurve(chunks, i) : [null, i]
      ;[this.prof_rng, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)

      let b1
      ;[b1, i] = getBoolean(chunks, i)
      if (b1) {
        ;[this.v1, i] = getLocation(chunks, i)
        ;[this.v2, i] = getVector(chunks, i)
      } else {
        this.v1 = { ...CENTER }
        this.v2 = { ...DIR_Z }
      }

      ;[this.v3, i] = getLocation(chunks, i)
      ;[this.v4, i] = getVector(chunks, i)
      ;[this.v5, i] = getVector(chunks, i)
      ;[this.v6, i] = getVector(chunks, i)

      const nextChunk = chunks[i]
      if (nextChunk && [TAG_LONG, TAG_FLOAT, TAG_DOUBLE].includes(nextChunk.tag)) {
        let n2, bln2
        ;[n2, i] = getInteger(chunks, i)
        ;[bln2, i] = getBoolean(chunks, i)
        ;[this.path, i] = readCurve ? readCurve(chunks, i) : [null, i]

        let rng2, flt2
        ;[rng2, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())
        ;[flt2, i] = getFloat(chunks, i)

        if (n2 === 1) {
          let bln3, frm1, bln4
          ;[bln3, i] = getBoolean(chunks, i)
          ;[frm1, i] = readFormula(chunks, i)
          ;[bln4, i] = getBoolean(chunks, i)
        } else if (n2 === 2) {
          let bln3, bln4, c1, rng3, num3, num4, flt3, bln5, bln6, bln7
          ;[bln3, i] = getBoolean(chunks, i)
          ;[bln4, i] = getBoolean(chunks, i)
          ;[c1, i] = readCurve ? readCurve(chunks, i) : [null, i]
          ;[rng3, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
          ;[num3, i] = getInteger(chunks, i)
          ;[num4, i] = getInteger(chunks, i)
          ;[flt3, i] = getFloats(chunks, i, 6)
          ;[bln5, i] = getBoolean(chunks, i)
          ;[bln6, i] = getBoolean(chunks, i)
          ;[bln7, i] = getBoolean(chunks, i)
        } else if (n2 === 3) {
          let sng1, srf1, bln4, crv1, bln6, bln7
          ;[sng1, i] = getSingularity(chunks, i)
          ;[srf1, i] = readSurface ? readSurface(chunks, i) : [null, i]
          ;[bln4, i] = getBoolean(chunks, i)
          if (bln4) {
            ;[crv1, i] = readCurve ? readCurve(chunks, i) : [null, i]
          }
          ;[bln6, i] = getBoolean(chunks, i)
          if (getAsmMajor() < 219) {
            ;[bln7, i] = getBoolean(chunks, i)
          }
        }
      } else {
        let l1, n1, r1, v1, n2, b1, c1, r2, x1, b2, l2, n3, f1, b3
        ;[l1, i] = readLaw ? readLaw(chunks, i) : [null, i]
        ;[n1, i] = getInteger(chunks, i)
        ;[r1, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
        ;[v1, i] = getVector(chunks, i)
        ;[n2, i] = getInteger(chunks, i)
        ;[b1, i] = getBoolean(chunks, i)
        ;[c1, i] = readCurve ? readCurve(chunks, i) : [null, i]
        ;[r2, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
        ;[x1, i] = getFloat(chunks, i)
        ;[b2, i] = getBoolean(chunks, i)
        ;[l2, i] = readLaw ? readLaw(chunks, i) : [null, i]
        ;[n3, i] = getInteger(chunks, i)
        ;[f1, i] = readFormula(chunks, i)
        ;[b3, i] = getBoolean(chunks, i)
      }
    } else {
      ;[this.profile, i] = readCurve ? readCurve(chunks, i) : [null, i]
      ;[this.path, i] = readCurve ? readCurve(chunks, i) : [null, i]
      ;[this.s2, i] = getEnumByTag(chunks, i, SURF_SWEEP)
      ;[this.v1, i] = getVector(chunks, i)

      if (!isASM()) {
        if (vrs > 16.0) {
          let r
          ;[r, i] = getEnumByValue(chunks, i, SURF_RIGID)
          if (vrs > 24.0) {
            let s
            ;[s, i] = getEnumByValue(chunks, i, SURF_AXIS_SWEEP)
          }
        }
      }

      ;[this.v2, i] = getVector(chunks, i)
      ;[this.v3, i] = getVector(chunks, i)
      ;[this.v4, i] = getVector(chunks, i)
      ;[this.v5, i] = getVector(chunks, i)
      ;[this.v6, i] = getLocation(chunks, i)

      if (inventor) {
        ;[this.a1, i] = getFloats(chunks, i, 4)
      } else {
        ;[this.a1, i] = getFloats(chunks, i, 1)
      }

      ;[this.frml, i] = readFormula(chunks, i)
      ;[this.frm2, i] = readFormula(chunks, i)
      ;[this.frm3, i] = readFormula(chunks, i)
    }

    i = this.setSurfaceShape(chunks, i, inventor, 'sweep_spl_sur')
    return i
  }

  // ==========================================================================
  // Additional Surface Setters
  // ==========================================================================

  setTaper(chunks, index, inventor, subtype = 'taper_spl_sur') {
    let i = index
    ;[this.surface, i] = readSurface ? readSurface(chunks, i) : [null, i]
    ;[this.curve, i] = readCurve ? readCurve(chunks, i) : [null, i]
    ;[this.pcurve, i] = readBS2Curve(chunks, i)

    let f1
    ;[f1, i] = getFloat(chunks, i)

    i = this.setSurfaceShape(chunks, i, inventor, subtype)
    return i
  }

  setEdgeTaper(chunks, index, inventor, subtype = 'edge_tpr_spl_sur') {
    let i = this.setTaper(chunks, index, inventor, subtype)
    ;[this.draft, i] = getVector(chunks, i)
    return i
  }

  setShadowTaper(chunks, index, inventor) {
    let i = this.setEdgeTaper(chunks, index, inventor, 'shadow_tpr_spl_sur')
    ;[this.sine, i] = getFloat(chunks, i)
    ;[this.cosine, i] = getFloat(chunks, i)
    return i
  }

  setRuledTaper(chunks, index, inventor) {
    let i = this.setEdgeTaper(chunks, index, inventor, 'ruled_tpr_spl_sur')
    ;[this.sine, i] = getFloat(chunks, i)
    ;[this.cosine, i] = getFloat(chunks, i)
    ;[this.fac, i] = getFloat(chunks, i)
    return i
  }

  setSweptTaper(chunks, index, inventor) {
    let i = this.setEdgeTaper(chunks, index, inventor, 'swept_tpr_spl_sur')
    ;[this.sine, i] = getFloat(chunks, i)
    ;[this.cosine, i] = getFloat(chunks, i)
    return i
  }

  setVarBlend(chunks, index, inventor, subtype = 'var_blend_spl_sur') {
    this.subtype = subtype
    let i = index
    const vrs = getVersion()

    let bs1, bs2
    ;[bs1, i] = this._readRbBlendSurface2(chunks, i, inventor)
    ;[bs2, i] = this._readRbBlendSurface2(chunks, i, inventor)

    if (vrs > 22.0 && !isASM()) {
      i += 2 // 122, -1
    }

    let cur1
    ;[cur1, i] = readCurve ? readCurve(chunks, i) : [null, i]

    if (vrs > 22.0 && !isASM()) {
      let curT1, curT2, curT3, curT4
      ;[curT1, i] = readCurve ? readCurve(chunks, i) : [null, i]
      ;[curT2, i] = readCurve ? readCurve(chunks, i) : [null, i]
      ;[curT3, i] = readCurve ? readCurve(chunks, i) : [null, i]
      ;[curT4, i] = readCurve ? readCurve(chunks, i) : [null, i]
    }

    let off
    ;[off, i] = getFloats(chunks, i, 2)

    let r1, bv1
    ;[r1, i] = getEnumByValue(chunks, i, VAR_RADIUS)
    ;[bv1, i] = this._getBlendValues(chunks, i)

    if (r1 === 'two_radii') {
      let bv2, vc, ct, bv3
      ;[bv2, i] = this._getBlendValues(chunks, i)
      const chunk = chunks[i]
      if (chunk && (chunk.val === 3 || chunk.val === 'rounded_chamfer')) {
        ;[vc, i] = getEnumByValue(chunks, i, VAR_CHAMFER)
        ;[ct, i] = getEnumByTag(chunks, i, CHAMFER_TYPE)
        ;[bv3, i] = this._getBlendValues(chunks, i)
      }
    } else if (r1 === 'single_radius') {
      const chunk = chunks[i]
      if (chunk && (chunk.val === 1 || chunk.val === 7)) {
        let ut1, uv1
        ;[ut1, i] = getValue(chunks, i)
        ;[uv1, i] = getFloats(chunks, i, 2)
      }
    }

    let rU
    ;[rU, i] = getInterval(chunks, i, 0, 1, 1.0)

    if (vrs > 7.0 && vrs < 23) {
      let r1Val, r2
      ;[r1Val, i] = getInterval(chunks, i, 0, 1, 1.0)
      ;[r2, i] = getInterval(chunks, i, 0, 1, 1.0)
      i += 2 // skip 0, 2
    }

    let rV
    ;[rV, i] = getInterval(chunks, i, 0, 1, 1.0)

    if (vrs > 3.0) {
      let j, f, s
      ;[j, i] = getInteger(chunks, i)
      ;[f, i] = getFloat(chunks, i)
      ;[s, i] = getLength(chunks, i)

      if (vrs > 22.0 && !isASM()) {
        let b
        ;[b, i] = getBoolean(chunks, i)
      }

      let k
      ;[k, i] = getInteger(chunks, i)
      i = this.setSurfaceShape(chunks, i, inventor, subtype)

      if (inventor) {
        let a
        ;[a, i] = getIntegers(chunks, i, 3)
      }
    } else {
      let r1Val, a1, v1, k
      ;[r1Val, i] = getInterval(chunks, i, 0, 1, 1.0)
      ;[a1, i] = getFloats(chunks, i, 2)
      ;[r1Val, i] = getInterval(chunks, i, 0, 1, 1.0)
      ;[v1, i] = getLocation(chunks, i)
      ;[k, i] = getInteger(chunks, i)
    }

    let cur2, c, rb
    ;[cur2, i] = readCurve ? readCurve(chunks, i) : [null, i]
    ;[c, i] = getEnumByTag(chunks, i, CONVEXITY)

    if (vrs > 3.0) {
      ;[rb, i] = getEnumByTag(chunks, i, RENDER_BLEND)
    }

    if (inventor) {
      let r, bc1, bc2
      ;[r, i] = getInterval(chunks, i, 0.0, 1.0, 1.0)
      ;[bc1, i] = readBS3Curve(chunks, i)
      ;[bc2, i] = readBS2Curve(chunks, i)
    }

    return i
  }

  setSssBlend(chunks, index, inventor) {
    let i = this.setRbBlend(chunks, index, inventor, 'sss_blend_spl_sur')
    let rb3
    ;[rb3, i] = this._readRbBlendCurve(chunks, i, inventor)
    return i
  }

  setSrfSrvVBlend(chunks, index, inventor) {
    return this.setVarBlend(chunks, index, inventor, 'srf_srf_v_bl_spl_sur')
  }

  setTSpline(chunks, index, inventor) {
    let i = this.setSurfaceShape(chunks, index, inventor, 't_spl_sur')

    let rU, rV, typ
    ;[rU, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())
    ;[rV, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())
    ;[typ, i] = getInteger(chunks, i)

    const chunk = chunks[i]
    if (chunk && chunk.tag === TAG_SUBTYPE_OPEN) {
      i += 1

      const nextChunk = chunks[i]
      if (nextChunk && nextChunk.val === 't_spl_subtrans_object') {
        let data
        ;[data, i] = getValue(chunks, i + 1)
        if (chunks[i].tag !== 0x08) i += 1
        let values
        ;[values, i] = getValue(chunks, i)
        // t_spline handling - would add to reader
      } else if (nextChunk && nextChunk.val === 'ref') {
        ;[this.tRef, i] = getInteger(chunks, i + 1)
      }

      const closeChunk = chunks[i]
      if (closeChunk && closeChunk.tag === TAG_SUBTYPE_CLOSE) {
        let num
        ;[num, i] = getInteger(chunks, i + 1)
      }
    }

    return i
  }

  setScaleClft(chunks, index, inventor) {
    this.subtype = 'scaled_cloft_spl_sur'
    let i = index

    let singularity
    ;[singularity, i] = getSingularity(chunks, i)

    if (singularity === 'full') {
      let spline, tol
      ;[spline, i] = readBS3Surface(chunks, i)
      if (spline) {
        this.spline = spline
      }
      ;[tol, i] = getLength(chunks, i)
    } else if (singularity === 'none') {
      let r1, r2, a11, a12
      ;[r1, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())
      ;[r2, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())
      ;[a11, i] = getFloatArray(chunks, i)
      ;[a12, i] = getFloatArray(chunks, i)
    }

    let arr
    ;[arr, i] = getDiscontinuityInfo(chunks, i, inventor)

    let l1, l2, l3
    ;[l1, i] = this._readScaleClLoft(chunks, i)
    ;[l2, i] = this._readScaleClLoft(chunks, i)
    ;[l3, i] = this._readScaleClLoft(chunks, i)

    let e1, e2, i1
    ;[e1, i] = getBoolean(chunks, i)
    ;[e2, i] = getBoolean(chunks, i)
    ;[i1, i] = getInteger(chunks, i)

    let e4
    ;[e4, i] = getBoolean(chunks, i)

    if (e4) {
      let l5, e5
      ;[l5, i] = this._readScaleClLoft(chunks, i)
      ;[e5, i] = getBoolean(chunks, i)
      if (e5) {
        let l6, i6, p6
        ;[l6, i] = this._readScaleClLoft(chunks, i)
        ;[i6, i] = getInteger(chunks, i)
        ;[p6, i] = getVector(chunks, i)
      } else {
        let e6, i6, c6
        ;[e6, i] = getBoolean(chunks, i)
        ;[i6, i] = getSingularity(chunks, i)
        ;[c6, i] = readBS3Curve(chunks, i)
      }
    } else {
      let e5, i5, l5
      ;[e5, i] = getBoolean(chunks, i)
      ;[i5, i] = getInteger(chunks, i)
      if (i5 === 0) {
        ;[l5, i] = getVector(chunks, i)
      } else {
        ;[l5, i] = readBS3Curve(chunks, i)
      }
    }

    let e5New, e6, i3, v1, v2, i4, p3
    ;[e5New, i] = getBoolean(chunks, i)
    ;[e6, i] = getBoolean(chunks, i)
    ;[i3, i] = getInteger(chunks, i)
    ;[v1, i] = getVector(chunks, i)
    ;[v2, i] = getVector(chunks, i)
    ;[i4, i] = getSingularity(chunks, i)
    ;[p3, i] = readBS3Curve(chunks, i)

    return i
  }

  // ==========================================================================
  // Reference and Bulk Setters
  // ==========================================================================

  setRef(chunks, index) {
    this.subtype = 'ref'
    ;[this.ref, ] = getInteger(chunks, index)
    const reader = getReader()
    if (reader && reader.getSubtypeEntity) {
      this.surface = reader.getSubtypeEntity(this.ref)
    }
    return index + 1
  }

  setBulk(chunks, index) {
    let i = index
    ;[this.subtype, i] = getValue(chunks, i)

    if (this.subtype === 'ref') {
      return this.setRef(chunks, i)
    }

    try {
      if (getVersion() >= 25.0 && !isASM()) {
        let id
        ;[id, i] = getInteger(chunks, i)
      }

      const reader = getReader()
      if (reader && reader.addSubtypeEntity) {
        reader.addSubtypeEntity(this)
      }

      const prm = SURFACE_TYPES[this.subtype]
      if (!prm) {
        throw new Error(`No implementation available for spline '${this.subtype}'`)
      }

      const method = this[prm[0]]
      if (typeof method !== 'function') {
        throw new Error(`Method ${prm[0]} not found for spline '${this.subtype}'`)
      }

      return method.call(this, chunks, i + prm[1], prm[2])
    } catch (e) {
      console.error(`SurfaceSpline.setBulk failed for ${this.subtype}:`, e.message)
      throw e
    }
  }

  setSubtypeBulk(chunks, index) {
    ;[this.sense, ] = getEnumByTag(chunks, index, SENSE)

    if (this.record === null) {
      this.record = { name: 'spline', index: this.index, entity: this }
    }

    let i = this.setBulk(chunks, index + 2)

    const chunk = chunks[i]
    if (!chunk || chunk.tag !== TAG_SUBTYPE_CLOSE) {
      console.warn(`SurfaceSpline: expected close tag at ${i}, found ${chunk?.tag}`)
    }

    ;[this.rangeU, i] = getInterval(chunks, i + 1, MIN_INF, MAX_INF, getScale())
    ;[this.rangeV, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())

    return i
  }

  // ==========================================================================
  // Surface Resolution
  // ==========================================================================

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

  // ==========================================================================
  // Build Method
  // ==========================================================================

  build(face = null) {
    if (this._readyToBuild) {
      this._readyToBuild = false

      if (this.subtype === 'ref') {
        const surface = this.getSurface()
        if (surface && typeof surface.build === 'function') {
          this.shape = surface.build(face)
        }
      } else if (this.spline) {
        this.shape = {
          type: 'bspline_surface',
          spline: this.spline,
          subtype: this.subtype
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
  // Cylinder
  'cylsur': ['setCylinder', 0, false],
  'cyl_spl_sur': ['setCylinder', 1, true],

  // Defm (deformation)
  'defmsur': ['setDefm', 0, false],
  'defm_spl_sur': ['setDefm', 1, true],

  // Exact
  'exactsur': ['setExact', 0, false],
  'exact_spl_sur': ['setExact', 1, true],

  // G2 Blend
  'g2blnsur': ['setG2Blend', 0, false],
  'g2_blend_spl_sur': ['setG2Blend', 1, true],

  // Loft
  'loftsur': ['setLoft', 0, false],
  'loft_spl_sur': ['setLoft', 1, true],

  // Net
  'netsur': ['setNet', 0, false],
  'net_spl_sur': ['setNet', 1, true],

  // Offset
  'offsur': ['setOffset', 0, false],
  'off_spl_sur': ['setOffset', 1, true],

  // Ortho
  'orthosur': ['setOrtho', 0, false],
  'ortho_spl_sur': ['setOrtho', 1, true],

  // Rolling Ball Blend
  'rbblnsur': ['setRbBlend', 0, false],
  'rb_blend_spl_sur': ['setRbBlend', 1, true],

  // Rotation
  'rotsur': ['setRotation', 0, false],
  'rot_spl_sur': ['setRotation', 1, true],

  // Ruled
  'rulesur': ['setRule', 0, false],
  'rule_sur': ['setRule', 1, true],

  // Skin
  'skinsur': ['setSkin', 0, false],
  'skin_spl_sur': ['setSkin', 1, true],

  // Sweep
  'sweepsur': ['setSweep', 0, false],
  'sweep_spl_sur': ['setSweep', 1, true],
  'sweep_sur': ['setSweep', 1, true],

  // Sum
  'sumsur': ['setSum', 0, false],
  'sum_spl_sur': ['setSum', 1, true],

  // Vertex Blend
  'vertexblendsur': ['setVertexBlend', 0, false],
  'VBL_SURF': ['setVertexBlend', 1, true],

  // ASM Extensions
  'cl_loft_spl_sur': ['setClLoft', 1, true],
  'comp_spl_sur': ['setCompound', 1, true],
  'helix_spl_circ': ['setHelixCircle', 1, true],
  'helix_spl_line': ['setHelixLine', 1, true],
  't_spl_sur': ['setTSpline', 1, true],
  'scaled_cloft_spl_sur': ['setScaleClft', 1, true],

  // Variable Blend
  'var_blend_spl_sur': ['setVarBlend', 1, true],
  'sss_blend_spl_sur': ['setSssBlend', 1, true],
  'srf_srf_v_bl_spl_sur': ['setSrfSrvVBlend', 1, true],

  // Taper variants
  'taper_spl_sur': ['setTaper', 1, true],
  'edge_tpr_spl_sur': ['setEdgeTaper', 1, true],
  'shadow_tpr_spl_sur': ['setShadowTaper', 1, true],
  'ruled_tpr_spl_sur': ['setRuledTaper', 1, true],
  'swept_tpr_spl_sur': ['setSweptTaper', 1, true]
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
 * Based on Acis.py Topology class and _handle_topology_DEFAULT function
 */
class Topology extends Entity {
  constructor() {
    super()
  }

  set(record) {
    let i = super.set(record)

    // _handle_topology_DEFAULT logic from Acis.py lines 187-192
    const vrs = getVersion()
    // Skip extra field for non-ASM format when version > 10.0
    if (vrs > 10.0 && !isASM()) {
      i++
    }
    // Skip another field for version > 6.0
    if (vrs > 6.0) {
      i++
    }

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

    // Read start parameter (float after start vertex)
    if (i < record.chunks.length && record.chunks[i] &&
        (record.chunks[i].tag === 0x06 || record.chunks[i].tag === 0x05)) {
      ;[this.parameter1, i] = getFloat(record.chunks, i)
    }

    ;[this._end, i] = getRefNode(record, i, 'vertex')

    // Read end parameter (float after end vertex)
    if (i < record.chunks.length && record.chunks[i] &&
        (record.chunks[i].tag === 0x06 || record.chunks[i].tag === 0x05)) {
      ;[this.parameter2, i] = getFloat(record.chunks, i)
    }

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
  set(record) {
    // No data to parse
  }
}

class EndOfAcisData {
  constructor() {
    this.record = null
  }
  set(record) {
    // No data to parse
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

    const is64bit = this._getSLong === getSInt64
    const [chunk, pos2] = createChunk(tag, this._data, this._pos, this.header.scale, is64bit)
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
      // Check for ASM format
      if (this.header.format.startsWith('ASM BinaryFile')) {
        // Set asm to indicate ASM format (version tuple will be read from asmheader record later)
        this.header.asm = [0, 0, 0, 0] // Placeholder, will be updated when asmheader is parsed
      }

      // Check for 64-bit mode
      if (this.header.format.endsWith('8')) {
        this._getSLong = getSInt64
        this._getULong = getUInt64
      }

      const [version, p1] = this._getULong(this._data, 15)
      const [records, p2] = this._getULong(this._data, p1)
      const [bodies, p3] = this._getULong(this._data, p2)
      const [flags, p4] = this._getULong(this._data, p3)

      this.header.version = int2version(version)
      this.header.records = records
      this.header.bodies = bodies
      this.header.flags = flags

      this._pos = p4

      // Read product info
      this.header.prodId = this._readChunkBinary().val
      this.header.prodVer = this._readChunkBinary().val
      this.header.date = this._readChunkBinary().val
      this.header.scale = this._readChunkBinary().val
      this.header.resabs = this._readChunkBinary().val
      this.header.resnor = this._readChunkBinary().val

      return true
    }

    return false
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
 * Matches Python Acis.py getRefNode() function behavior
 */
function getRefNode(record, index, expectedName = null) {
  if (index >= record.chunks.length) {
    return [null, index]
  }

  const chunk = record.chunks[index]

  if (chunk.tag === TAG_ENTITY_REF || chunk.type === 'entity_ref') {
    const ref = chunk.record || chunk

    // If null ref (-1), return null
    if (chunk.val === -1 || ref === null || !ref.name) {
      return [null, index + 1]
    }

    // If expectedName provided, check if ref matches
    if (expectedName !== null && !ref.name.endsWith(expectedName)) {
      // Python raises exception here, but we'll be lenient and just warn
      // console.warn(`Expected ${expectedName} but found ${ref.name} at index ${index}`)
    }

    return [ref, index + 1]
  }

  // Not an entity ref - return null (Python would raise exception)
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
// Utility Functions for Type Resolution
// ============================================================================

/**
 * Get entity class for a record name
 * @param {string} name - Record name
 * @returns {Function|null} Entity class constructor or null
 */
function getEntityClass(name) {
  return RECORD_2_ENTITY[name] || null
}

/**
 * Check if a record name is known
 * @param {string} name - Record name
 * @returns {boolean}
 */
function isKnownRecordType(name) {
  return name in RECORD_2_ENTITY
}

  // ============================================================================
  // geometry-builder.js
  // ============================================================================

/**
 * ACIS Geometry Builder for OpenCascade.js
 * Creates OC.js geometry from parsed ACIS B-spline data
 * Replaces FreeCAD geometry building with OpenCascade.js
 */

// ============================================================================
// Basic Geometry Helpers
// ============================================================================

/**
 * Create OC.js gp_Pnt from point object
 * Validates coordinates to prevent extreme/invalid values
 */
function makePoint(oc, p) {
  if (!p) return new oc.gp_Pnt_3(0, 0, 0)
  let x = p.x || 0
  let y = p.y || 0
  let z = p.z || 0
  // Clamp extreme values to prevent 2e+100 type issues
  const MAX_COORD = 1e10
  if (!isFinite(x) || Math.abs(x) > MAX_COORD) x = 0
  if (!isFinite(y) || Math.abs(y) > MAX_COORD) y = 0
  if (!isFinite(z) || Math.abs(z) > MAX_COORD) z = 0
  return new oc.gp_Pnt_3(x, y, z)
}

/**
 * Create OC.js gp_Pnt2d from 2D point object
 */
function makePoint2d(oc, p) {
  if (!p) return new oc.gp_Pnt2d_3(0, 0)
  if (p.x !== undefined) return new oc.gp_Pnt2d_3(p.x, p.y)
  if (p.u !== undefined) return new oc.gp_Pnt2d_3(p.u, p.v)
  return new oc.gp_Pnt2d_3(0, 0)
}

/**
 * Create OC.js gp_Dir from direction vector
 */
function makeDirection(oc, vec) {
  if (!vec) return new oc.gp_Dir_4(0, 0, 1)
  const len = Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z)
  if (len < 1e-10) return new oc.gp_Dir_4(0, 0, 1)
  return new oc.gp_Dir_4(vec.x / len, vec.y / len, vec.z / len)
}

/**
 * Create OC.js gp_Vec from vector object
 */
function makeVec(oc, vec) {
  if (!vec) return new oc.gp_Vec_4(0, 0, 1)
  return new oc.gp_Vec_4(vec.x || 0, vec.y || 0, vec.z || 0)
}

/**
 * Create OC.js gp_Ax1 (axis with point and direction)
 */
function makeAx1(oc, origin, direction) {
  const pnt = makePoint(oc, origin)
  const dir = makeDirection(oc, direction)
  return new oc.gp_Ax1_2(pnt, dir)
}

/**
 * Create OC.js gp_Ax2 (coordinate system)
 */
function makeAx2(oc, origin, zDir, xDir) {
  const pnt = makePoint(oc, origin)
  const z = makeDirection(oc, zDir)
  if (xDir) {
    const x = makeDirection(oc, xDir)
    return new oc.gp_Ax2_2(pnt, z, x)
  }
  return new oc.gp_Ax2_3(pnt, z)
}

/**
 * Create OC.js gp_Ax3 (right-handed coordinate system)
 */
function makeAx3(oc, origin, axis, refDir) {
  const pnt = makePoint(oc, origin)
  const z = makeDirection(oc, axis)
  if (refDir) {
    const x = makeDirection(oc, refDir)
    return new oc.gp_Ax3_3(pnt, z, x)
  }
  return new oc.gp_Ax3_4(pnt, z)
}

// ============================================================================
// Basic Curve Builders
// ============================================================================

/**
 * Create a line edge between two points
 */
function createLine(oc, start, end) {
  if (!start || !end) return null

  try {
    const p1 = makePoint(oc, start)
    const p2 = makePoint(oc, end)

    // Check for degenerate line
    const dx = end.x - start.x
    const dy = end.y - start.y
    const dz = end.z - start.z
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

    if (dist < 1e-10) return null

    const builder = new oc.BRepBuilderAPI_MakeEdge_3(p1, p2)
    if (builder.IsDone()) {
      return builder.Edge()
    }
  } catch (e) {
    console.warn('createLine failed:', e.message)
  }
  return null
}

/**
 * Create a circle curve
 */
function createCircle(oc, center, axis, radius) {
  if (!center || !axis || radius <= 0) return null

  try {
    const ax2 = makeAx2(oc, center, axis)
    // gp_Circ_2(ax2, radius) -> Geom_Circle_1(gp_Circ)
    const gpCirc = new oc.gp_Circ_2(ax2, radius)
    return new oc.Geom_Circle_1(gpCirc)
  } catch (e) {
    console.warn('createCircle failed:', e.message)
  }
  return null
}

/**
 * Create an ellipse curve
 */
function createEllipse(oc, center, axis, majorRadius, minorRadius, majorDir) {
  if (!center || !axis || majorRadius <= 0 || minorRadius <= 0) return null

  try {
    const ax2 = makeAx2(oc, center, axis, majorDir)
    // gp_Elips_2(ax2, majorRadius, minorRadius) -> Geom_Ellipse_1(gp_Elips)
    const gpElips = new oc.gp_Elips_2(ax2, majorRadius, minorRadius)
    return new oc.Geom_Ellipse_1(gpElips)
  } catch (e) {
    console.warn('createEllipse failed:', e.message)
  }
  return null
}

// ============================================================================
// B-Spline Curve Builder
// ============================================================================

/**
 * Validate and clamp coordinate value
 */
function clampCoord(val) {
  const MAX_COORD = 1e10
  const v = val || 0
  if (!isFinite(v) || Math.abs(v) > MAX_COORD) return 0
  return v
}

/**
 * Convert poles array to TColgp_Array1OfPnt
 */
function polesToArray1OfPnt(oc, poles) {
  const arr = new oc.TColgp_Array1OfPnt_2(1, poles.length)
  for (let i = 0; i < poles.length; i++) {
    const p = poles[i]
    arr.SetValue(i + 1, new oc.gp_Pnt_3(clampCoord(p.x), clampCoord(p.y), clampCoord(p.z)))
  }
  return arr
}

/**
 * Convert poles array to TColgp_Array1OfPnt2d
 */
function polesToArray1OfPnt2d(oc, poles) {
  const arr = new oc.TColgp_Array1OfPnt2d_2(1, poles.length)
  for (let i = 0; i < poles.length; i++) {
    const p = poles[i]
    // Handle both {x,y} and {u,v} formats
    const u = p.x !== undefined ? p.x : (p.u !== undefined ? p.u : 0)
    const v = p.y !== undefined ? p.y : (p.v !== undefined ? p.v : 0)
    arr.SetValue(i + 1, new oc.gp_Pnt2d_3(clampCoord(u), clampCoord(v)))
  }
  return arr
}

/**
 * Convert knots array to TColStd_Array1OfReal
 */
function knotsToArray1OfReal(oc, knots) {
  const arr = new oc.TColStd_Array1OfReal_2(1, knots.length)
  for (let i = 0; i < knots.length; i++) {
    arr.SetValue(i + 1, knots[i])
  }
  return arr
}

/**
 * Convert multiplicities array to TColStd_Array1OfInteger
 */
function multsToArray1OfInteger(oc, mults) {
  const arr = new oc.TColStd_Array1OfInteger_2(1, mults.length)
  for (let i = 0; i < mults.length; i++) {
    arr.SetValue(i + 1, mults[i])
  }
  return arr
}

/**
 * Convert weights array to TColStd_Array1OfReal
 */
function weightsToArray1OfReal(oc, weights) {
  const arr = new oc.TColStd_Array1OfReal_2(1, weights.length)
  for (let i = 0; i < weights.length; i++) {
    arr.SetValue(i + 1, weights[i])
  }
  return arr
}

/**
 * Create B-spline curve from parsed NUBS/NURBS data
 * @param {Object} oc - OpenCascade.js instance
 * @param {Object} nubs - BS_Curve object with poles, knots, mults, weights
 * @param {string} sense - 'forward' or 'reversed'
 * @param {string} subtype - curve subtype name
 * @returns {Object|null} Geom_BSplineCurve or edge shape
 */
function createBSplineCurve(oc, nubs, sense = 'forward', subtype = '') {
  if (!nubs || !nubs.poles || nubs.poles.length === 0) {
    return null
  }

  // Handle 2-pole case as simple line
  if (nubs.poles.length === 2) {
    const p1 = nubs.poles[0]
    const p2 = nubs.poles[1]
    return createLine(oc, p1, p2)
  }

  try {
    const poles = polesToArray1OfPnt(oc, nubs.poles)
    const knots = knotsToArray1OfReal(oc, nubs.uKnots)
    const mults = multsToArray1OfInteger(oc, nubs.uMults)
    const degree = nubs.uDegree
    const periodic = nubs.uPeriodic || false

    let curve
    if (nubs.rational && nubs.weights && nubs.weights.length > 0) {
      // NURBS curve with weights
      const weights = weightsToArray1OfReal(oc, nubs.weights)
      curve = new oc.Geom_BSplineCurve_2(
        poles, weights, knots, mults, degree, periodic
      )
    } else {
      // NUBS curve without weights
      curve = new oc.Geom_BSplineCurve_1(
        poles, knots, mults, degree, periodic
      )
    }

    // Apply sense (reverse if needed)
    if (sense === 'reversed') {
      curve.Reverse()
    }

    return curve
  } catch (e) {
    console.warn(`createBSplineCurve failed for ${subtype}:`, e.message)

    // Try fallback: create a line through first and last poles
    if (nubs.poles.length >= 2) {
      const p1 = nubs.poles[0]
      const p2 = nubs.poles[nubs.poles.length - 1]
      return createLine(oc, p1, p2)
    }
  }

  return null
}

/**
 * Create 2D B-spline curve for parameter space
 * @param {Object} oc - OpenCascade.js instance
 * @param {Object} nubs - BS_Curve object with 2D poles
 * @returns {Object|null} Geom2d_BSplineCurve
 */
function createBSplineCurve2d(oc, nubs) {
  if (!nubs || !nubs.poles || nubs.poles.length === 0) {
    return null
  }

  try {
    const poles = polesToArray1OfPnt2d(oc, nubs.poles)
    const knots = knotsToArray1OfReal(oc, nubs.uKnots)
    const mults = multsToArray1OfInteger(oc, nubs.uMults)
    const degree = nubs.uDegree
    const periodic = nubs.uPeriodic || false

    let curve
    if (nubs.rational && nubs.weights && nubs.weights.length > 0) {
      const weights = weightsToArray1OfReal(oc, nubs.weights)
      curve = new oc.Geom2d_BSplineCurve_2(
        poles, weights, knots, mults, degree, periodic
      )
    } else {
      curve = new oc.Geom2d_BSplineCurve_1(
        poles, knots, mults, degree, periodic
      )
    }

    return curve
  } catch (e) {
    console.warn('createBSplineCurve2d failed:', e.message)
  }

  return null
}

// ============================================================================
// B-Spline Surface Builder
// ============================================================================

/**
 * Convert 2D poles array to TColgp_Array2OfPnt
 */
function polesToArray2OfPnt(oc, poles) {
  const uSize = poles.length
  const vSize = poles[0].length
  const arr = new oc.TColgp_Array2OfPnt_2(1, uSize, 1, vSize)

  for (let u = 0; u < uSize; u++) {
    for (let v = 0; v < vSize; v++) {
      const p = poles[u][v]
      arr.SetValue(u + 1, v + 1, new oc.gp_Pnt_3(clampCoord(p.x), clampCoord(p.y), clampCoord(p.z)))
    }
  }
  return arr
}

/**
 * Convert 2D weights array to TColStd_Array2OfReal
 */
function weightsToArray2OfReal(oc, weights) {
  const uSize = weights.length
  const vSize = weights[0].length
  const arr = new oc.TColStd_Array2OfReal_2(1, uSize, 1, vSize)

  for (let u = 0; u < uSize; u++) {
    for (let v = 0; v < vSize; v++) {
      arr.SetValue(u + 1, v + 1, weights[u][v])
    }
  }
  return arr
}

/**
 * Create B-spline surface from parsed NUBS/NURBS data
 * @param {Object} oc - OpenCascade.js instance
 * @param {Object} nubs - BS_Surface object with poles, knots, mults, weights
 * @returns {Object|null} Geom_BSplineSurface
 */
function createBSplineSurface(oc, nubs) {
  if (!nubs || !nubs.poles || nubs.poles.length === 0) {
    return null
  }

  // Validate poles structure
  if (!Array.isArray(nubs.poles[0])) {
    console.warn('createBSplineSurface: poles must be 2D array')
    return null
  }

  try {
    const poles = polesToArray2OfPnt(oc, nubs.poles)
    const uKnots = knotsToArray1OfReal(oc, nubs.uKnots)
    const vKnots = knotsToArray1OfReal(oc, nubs.vKnots)
    const uMults = multsToArray1OfInteger(oc, nubs.uMults)
    const vMults = multsToArray1OfInteger(oc, nubs.vMults)
    const uDegree = nubs.uDegree
    const vDegree = nubs.vDegree
    const uPeriodic = nubs.uPeriodic || false
    const vPeriodic = nubs.vPeriodic || false

    let surface
    if (nubs.rational && nubs.weights && nubs.weights.length > 0) {
      // NURBS surface with weights
      const weights = weightsToArray2OfReal(oc, nubs.weights)
      surface = new oc.Geom_BSplineSurface_2(
        poles, weights, uKnots, vKnots, uMults, vMults,
        uDegree, vDegree, uPeriodic, vPeriodic
      )
    } else {
      // NUBS surface without weights
      surface = new oc.Geom_BSplineSurface_1(
        poles, uKnots, vKnots, uMults, vMults,
        uDegree, vDegree, uPeriodic, vPeriodic
      )
    }

    return surface
  } catch (e) {
    console.warn('createBSplineSurface failed:', e.message)

    // Try with periodic fallback
    try {
      const poles = polesToArray2OfPnt(oc, nubs.poles)
      const uKnots = knotsToArray1OfReal(oc, nubs.uKnots)
      const vKnots = knotsToArray1OfReal(oc, nubs.vKnots)
      const uMults = multsToArray1OfInteger(oc, nubs.uMults)
      const vMults = multsToArray1OfInteger(oc, nubs.vMults)
      const uDegree = nubs.uDegree
      const vDegree = nubs.vDegree

      // Try non-periodic
      const surface = new oc.Geom_BSplineSurface_1(
        poles, uKnots, vKnots, uMults, vMults,
        uDegree, vDegree, false, false
      )
      return surface
    } catch (e2) {
      console.warn('createBSplineSurface fallback failed:', e2.message)
    }
  }

  return null
}

// ============================================================================
// PCurve Builder (Curve on Surface)
// ============================================================================

/**
 * Create edge from 2D parameter curve on surface
 * @param {Object} oc - OpenCascade.js instance
 * @param {Object} pcurve - 2D BS_Curve for parameter space
 * @param {Object} surface - Geom_Surface to project onto
 * @param {string} sense - 'forward' or 'reversed'
 * @returns {Object|null} Edge shape
 */
function createBSplinePCurve(oc, pcurve, surface, sense = 'forward') {
  if (!pcurve || !surface) {
    return null
  }

  try {
    // Create 2D B-spline curve
    const curve2d = createBSplineCurve2d(oc, pcurve)
    if (!curve2d) {
      console.warn('createBSplinePCurve: failed to create 2D curve')
      return null
    }

    // Get handles
    const handleCurve2d = new oc.Handle_Geom2d_Curve_2(curve2d)
    const handleSurface = new oc.Handle_Geom_Surface_2(surface)

    // Create edge on surface using BRepBuilderAPI_MakeEdge_30
    // This variant takes a 2D curve and a surface
    const builder = new oc.BRepBuilderAPI_MakeEdge_30(handleCurve2d, handleSurface)

    if (builder.IsDone()) {
      const edge = builder.Edge()
      if (sense === 'reversed') {
        edge.Reverse()
      }
      return edge
    }

    console.warn('createBSplinePCurve: edge builder failed')
  } catch (e) {
    console.warn('createBSplinePCurve failed:', e.message)
  }

  return null
}

// ============================================================================
// Helix Builder
// ============================================================================

/**
 * Create helix curve from Helix data
 * @param {Object} oc - OpenCascade.js instance
 * @param {Object} helix - Helix data object
 * @returns {Object|null} Edge shape
 */
function createHelixCurve(oc, helix) {
  if (!helix) return null

  try {
    // Build interpolation points
    const points = helix.buildPoints ? helix.buildPoints() : []

    if (points.length < 2) {
      console.warn('createHelixCurve: not enough points')
      return null
    }

    // Create array of points
    const hArr = new oc.TColgp_HArray1OfPnt_2(1, points.length)
    for (let i = 0; i < points.length; i++) {
      hArr.SetValue(i + 1, new oc.gp_Pnt_3(points[i].x, points[i].y, points[i].z))
    }

    // Use GeomAPI_Interpolate to create smooth curve
    const interp = new oc.GeomAPI_Interpolate_1(
      new oc.Handle_TColgp_HArray1OfPnt_2(hArr),
      false, // not periodic
      1e-6   // tolerance
    )

    interp.Perform()

    if (interp.IsDone()) {
      const curve = interp.Curve()
      const handleCurve = new oc.Handle_Geom_Curve_2(curve.get())
      const builder = new oc.BRepBuilderAPI_MakeEdge_20(handleCurve)
      if (builder.IsDone()) {
        return builder.Edge()
      }
    }
  } catch (e) {
    console.warn('createHelixCurve failed:', e.message)
  }

  return null
}

// ============================================================================
// Surface of Revolution Builder
// ============================================================================

/**
 * Create surface of revolution from profile curve
 * @param {Object} oc - OpenCascade.js instance
 * @param {Object} profile - Profile curve (Geom_Curve)
 * @param {Object} location - Axis location point
 * @param {Object} direction - Axis direction
 * @returns {Object|null} Geom_SurfaceOfRevolution
 */
function createSurfaceOfRevolution(oc, profile, location, direction) {
  if (!profile || !location || !direction) return null

  try {
    const axis = makeAx1(oc, location, direction)
    const handleCurve = new oc.Handle_Geom_Curve_2(profile)
    return new oc.Geom_SurfaceOfRevolution(handleCurve, axis)
  } catch (e) {
    console.warn('createSurfaceOfRevolution failed:', e.message)
  }
  return null
}

// ============================================================================
// Ruled Surface Builder
// ============================================================================

/**
 * Create ruled surface between two curves
 * @param {Object} oc - OpenCascade.js instance
 * @param {Object} curve1 - First profile curve
 * @param {Object} curve2 - Second profile curve
 * @returns {Object|null} Face shape
 */
function createRuledSurface(oc, curve1, curve2) {
  if (!curve1 || !curve2) return null

  try {
    // Create edges from curves
    const handleCurve1 = new oc.Handle_Geom_Curve_2(curve1)
    const handleCurve2 = new oc.Handle_Geom_Curve_2(curve2)

    const builder1 = new oc.BRepBuilderAPI_MakeEdge_20(handleCurve1)
    const builder2 = new oc.BRepBuilderAPI_MakeEdge_20(handleCurve2)

    if (!builder1.IsDone() || !builder2.IsDone()) return null

    // Create wires
    const wire1 = new oc.BRepBuilderAPI_MakeWire_2(builder1.Edge()).Wire()
    const wire2 = new oc.BRepBuilderAPI_MakeWire_2(builder2.Edge()).Wire()

    // Create ruled loft
    const loft = new oc.BRepOffsetAPI_ThruSections(false, true) // not solid, ruled
    loft.AddWire(wire1)
    loft.AddWire(wire2)
    loft.Build()

    if (loft.IsDone()) {
      return loft.Shape()
    }
  } catch (e) {
    console.warn('createRuledSurface failed:', e.message)
  }
  return null
}

// ============================================================================
// Offset Surface Builder
// ============================================================================

/**
 * Create offset surface
 * @param {Object} oc - OpenCascade.js instance
 * @param {Object} baseSurface - Base Geom_Surface
 * @param {number} offset - Offset distance
 * @returns {Object|null} Geom_OffsetSurface
 */
function createOffsetSurface(oc, baseSurface, offset) {
  if (!baseSurface) return null

  try {
    const handleSurface = new oc.Handle_Geom_Surface_2(baseSurface)
    return new oc.Geom_OffsetSurface(handleSurface, offset, true)
  } catch (e) {
    console.warn('createOffsetSurface failed:', e.message)
  }
  return null
}

// ============================================================================
// Cylinder Surface Builder
// ============================================================================

/**
 * Create cylindrical surface
 * @param {Object} oc - OpenCascade.js instance
 * @param {Object} center - Center point
 * @param {Object} axis - Axis direction
 * @param {number} radius - Cylinder radius
 * @returns {Object|null} Geom_CylindricalSurface
 */
function createCylindricalSurface(oc, center, axis, radius) {
  if (!center || !axis || radius <= 0) return null

  try {
    const ax3 = makeAx3(oc, center, axis)
    return new oc.Geom_CylindricalSurface_1(ax3, radius)
  } catch (e) {
    console.warn('createCylindricalSurface failed:', e.message)
  }
  return null
}

// ============================================================================
// Cone Surface Builder
// ============================================================================

/**
 * Create conical surface
 * @param {Object} oc - OpenCascade.js instance
 * @param {Object} center - Center point
 * @param {Object} axis - Axis direction
 * @param {number} radius - Base radius
 * @param {number} semiAngle - Semi-angle in radians
 * @returns {Object|null} Geom_ConicalSurface
 */
function createConicalSurface(oc, center, axis, radius, semiAngle) {
  if (!center || !axis || radius <= 0) return null

  try {
    const ax3 = makeAx3(oc, center, axis)

    // If semi-angle is very small, create cylinder instead
    if (Math.abs(semiAngle) < 1e-6) {
      return new oc.Geom_CylindricalSurface_1(ax3, radius)
    }

    return new oc.Geom_ConicalSurface_1(ax3, semiAngle, radius)
  } catch (e) {
    console.warn('createConicalSurface failed:', e.message)
  }
  return null
}

// ============================================================================
// Plane Surface Builder
// ============================================================================

/**
 * Create plane surface
 * @param {Object} oc - OpenCascade.js instance
 * @param {Object} origin - Origin point
 * @param {Object} normal - Normal direction
 * @returns {Object|null} Geom_Plane
 */
function createPlaneSurface(oc, origin, normal) {
  if (!origin || !normal) return null

  try {
    const pnt = makePoint(oc, origin)
    const dir = makeDirection(oc, normal)
    // Create gp_Pln from point and normal (gp_Pln_3 takes gp_Pnt, gp_Dir)
    const gpPln = new oc.gp_Pln_3(pnt, dir)
    // Geom_Plane_2 takes gp_Pln
    return new oc.Geom_Plane_2(gpPln)
  } catch (e) {
    console.warn('createPlaneSurface failed:', e.message)
  }
  return null
}

// ============================================================================
// Sphere Surface Builder
// ============================================================================

/**
 * Create spherical surface
 * @param {Object} oc - OpenCascade.js instance
 * @param {Object} center - Center point
 * @param {number} radius - Sphere radius
 * @returns {Object|null} Geom_SphericalSurface
 */
function createSphericalSurface(oc, center, radius) {
  if (!center || radius <= 0) return null

  try {
    const ax3 = makeAx3(oc, center, { x: 0, y: 0, z: 1 })
    return new oc.Geom_SphericalSurface_1(ax3, radius)
  } catch (e) {
    console.warn('createSphericalSurface failed:', e.message)
  }
  return null
}

// ============================================================================
// Torus Surface Builder
// ============================================================================

/**
 * Create toroidal surface
 * @param {Object} oc - OpenCascade.js instance
 * @param {Object} center - Center point
 * @param {Object} axis - Axis direction
 * @param {number} majorRadius - Major radius
 * @param {number} minorRadius - Minor radius
 * @returns {Object|null} Geom_ToroidalSurface
 */
function createToroidalSurface(oc, center, axis, majorRadius, minorRadius) {
  if (!center || !axis || majorRadius <= 0 || minorRadius <= 0) return null

  try {
    const ax3 = makeAx3(oc, center, axis)
    return new oc.Geom_ToroidalSurface_1(ax3, majorRadius, minorRadius)
  } catch (e) {
    console.warn('createToroidalSurface failed:', e.message)
  }
  return null
}

// ============================================================================
// Face Builder from Surface
// ============================================================================

/**
 * Create face from surface
 * @param {Object} oc - OpenCascade.js instance
 * @param {Object} surface - Geom_Surface
 * @param {number} tolerance - Optional tolerance
 * @returns {Object|null} Face shape
 */
function createFaceFromSurface(oc, surface, tolerance = 1e-6) {
  if (!surface) return null

  try {
    const handleSurface = new oc.Handle_Geom_Surface_2(surface)
    const builder = new oc.BRepBuilderAPI_MakeFace_8(handleSurface, tolerance)

    if (builder.IsDone()) {
      return builder.Face()
    }
  } catch (e) {
    console.warn('createFaceFromSurface failed:', e.message)
  }
  return null
}

// ============================================================================
// Edge Builder from Curve
// ============================================================================

/**
 * Create edge from curve with optional parameters
 * @param {Object} oc - OpenCascade.js instance
 * @param {Object} curve - Geom_Curve
 * @param {number} u1 - Optional start parameter
 * @param {number} u2 - Optional end parameter
 * @returns {Object|null} Edge shape
 */
function createEdgeFromCurve(oc, curve, u1, u2) {
  if (!curve) return null

  try {
    const handleCurve = new oc.Handle_Geom_Curve_2(curve)

    let builder
    if (u1 !== undefined && u2 !== undefined) {
      builder = new oc.BRepBuilderAPI_MakeEdge_24(handleCurve, u1, u2)
    } else {
      builder = new oc.BRepBuilderAPI_MakeEdge_20(handleCurve)
    }

    if (builder.IsDone()) {
      return builder.Edge()
    }
  } catch (e) {
    console.warn('createEdgeFromCurve failed:', e.message)
  }
  return null
}

// ============================================================================
// Convenience Function for Building Geometry
// ============================================================================

/**
 * Build geometry with OpenCascade.js from parsed ACIS bodies
 * @param {Object} oc - OpenCascade.js instance
 * @param {Array} bodies - Array of parsed Body entities
 * @returns {Object|null} Compound shape
 */
function buildWithOpenCascade(oc, bodies) {
  if (!bodies || bodies.length === 0) return null

  const shapes = []

  for (const body of bodies) {
    try {
      const lumps = body.getLumps ? body.getLumps() : []

      for (const lump of lumps) {
        const shells = lump.getShells ? lump.getShells() : []

        for (const shell of shells) {
          const faces = shell.getFaces ? shell.getFaces() : []

          if (faces.length > 0) {
            const builder = new oc.BRep_Builder()
            const ocShell = new oc.TopoDS_Shell()
            builder.MakeShell(ocShell)

            for (const face of faces) {
              // Build face shape from surface
              const surface = face.getSurface ? face.getSurface() : null
              if (surface && surface.build) {
                const shape = surface.build(face)
                if (shape) {
                  // The shape is already a shape descriptor, need to convert
                  // This is handled by the converter
                }
              }
            }

            shapes.push(ocShell)
          }
        }
      }
    } catch (e) {
      console.warn('buildWithOpenCascade: body failed:', e.message)
    }
  }

  if (shapes.length === 0) return null
  if (shapes.length === 1) return shapes[0]

  // Combine into compound
  const builder = new oc.BRep_Builder()
  const compound = new oc.TopoDS_Compound()
  builder.MakeCompound(compound)

  for (const shape of shapes) {
    builder.Add(compound, shape)
  }

  return compound
}

// ============================================================================
// ACIS Entity Converters
// ============================================================================

/**
 * Convert ACIS surface entity to OpenCascade surface
 */
function convertACISSurface(oc, surfaceEntity) {
  if (!surfaceEntity) return null

  try {
    const typeName = surfaceEntity.getType ? surfaceEntity.getType() : ''

    if (typeName.includes('plane')) {
      return createPlaneSurface(oc, surfaceEntity.origin, surfaceEntity.normal)
    } else if (typeName.includes('cone')) {
      // Get semi-angle from sine/cosine (ACIS stores these instead of angle)
      const sine = surfaceEntity.sine || 0
      const cosine = surfaceEntity.cosine || 1
      const semiAngle = Math.atan2(Math.abs(sine), Math.abs(cosine))

      // Get radius from major vector length
      const major = surfaceEntity.major || { x: 1, y: 0, z: 0 }
      const radius = Math.sqrt(major.x * major.x + major.y * major.y + major.z * major.z) || 1.0

      // Create axis system - use major as reference direction
      const ax3 = makeAx3(oc, surfaceEntity.center, surfaceEntity.axis, major)

      // If semi-angle is very small (sine ≈ 0), it's a cylinder
      if (Math.abs(sine) < 1e-6) {
        return new oc.Geom_CylindricalSurface_1(ax3, radius)
      }
      return new oc.Geom_ConicalSurface_1(ax3, semiAngle, radius)
    } else if (typeName.includes('sphere')) {
      return createSphericalSurface(oc, surfaceEntity.center, surfaceEntity.radius || 1.0)
    } else if (typeName.includes('torus')) {
      // Torus stores major/minor as scalar radius values
      const majorRadius = Math.abs(surfaceEntity.major) || 2.0
      const minorRadius = Math.abs(surfaceEntity.minor) || 0.5
      return createToroidalSurface(oc, surfaceEntity.center, surfaceEntity.axis, majorRadius, minorRadius)
    } else if (typeName.includes('spline') && surfaceEntity.nubs) {
      return createBSplineSurface(oc, surfaceEntity.nubs)
    }

    console.warn('Unsupported surface type: ' + typeName)
    return null
  } catch (e) {
    console.warn('Failed to convert surface:', e.message)
    return null
  }
}

/**
 * Convert ACIS curve entity to OpenCascade curve
 */
function convertACISCurve(oc, curveEntity, startPt, endPt) {
  if (!curveEntity) return null

  try {
    const typeName = curveEntity.getType ? curveEntity.getType() : ''

    if (typeName.includes('straight')) {
      const origin = makePoint(oc, curveEntity.origin)
      const direction = makeDirection(oc, curveEntity.direction)
      // gp_Ax1 -> gp_Lin -> Geom_Line
      const ax1 = new oc.gp_Ax1_2(origin, direction)
      const lin = new oc.gp_Lin_2(ax1)
      return new oc.Geom_Line_2(lin)
    } else if (typeName.includes('ellipse')) {
      const center = makePoint(oc, curveEntity.center)
      const normal = makeDirection(oc, curveEntity.axis)
      const majorVec = curveEntity.major || { x: 1, y: 0, z: 0 }
      const majorAxis = makeDirection(oc, majorVec)
      const majorRadius = Math.sqrt(majorVec.x ** 2 + majorVec.y ** 2 + majorVec.z ** 2) || 1.0
      const ratio = curveEntity.ratio || 1.0
      const minorRadius = majorRadius * ratio

      const ax2 = new oc.gp_Ax2_2(center, normal, majorAxis)

      if (Math.abs(ratio - 1.0) < 1e-6) {
        // gp_Circ_2(ax2, radius) -> Geom_Circle_1(gp_Circ)
        const gpCirc = new oc.gp_Circ_2(ax2, majorRadius)
        return new oc.Geom_Circle_1(gpCirc)
      } else {
        // gp_Elips_2(ax2, majorRadius, minorRadius) -> Geom_Ellipse_1(gp_Elips)
        const gpElips = new oc.gp_Elips_2(ax2, majorRadius, minorRadius)
        return new oc.Geom_Ellipse_1(gpElips)
      }
    } else if ((typeName.includes('intcurve') || typeName.includes('spline')) && curveEntity.nubs) {
      return createBSplineCurve(oc, curveEntity.nubs, 'forward', typeName)
    }

    // Fallback: create line between start and end points
    if (startPt && endPt) {
      const p1 = makePoint(oc, startPt)
      const dir = makeDirection(oc, {
        x: endPt.x - startPt.x,
        y: endPt.y - startPt.y,
        z: endPt.z - startPt.z
      })
      const ax1 = new oc.gp_Ax1_2(p1, dir)
      const lin = new oc.gp_Lin_2(ax1)
      return new oc.Geom_Line_2(lin)
    }

    console.warn('Unsupported curve type: ' + typeName)
    return null
  } catch (e) {
    console.warn('Failed to convert curve:', e.message)
    return null
  }
}

/**
 * Convert ACIS edge to OpenCascade edge
 */
function convertACISEdge(oc, edgeEntity) {
  if (!edgeEntity) return null

  try {
    const curveEntity = edgeEntity.getCurve ? edgeEntity.getCurve() : null
    const startPt = edgeEntity.getStart ? edgeEntity.getStart() : null
    const endPt = edgeEntity.getEnd ? edgeEntity.getEnd() : null

    // Get start/end points from vertices (getStart/getEnd return point coords directly)
    const startVertex = startPt && startPt.point ? startPt.point : startPt
    const endVertex = endPt && endPt.point ? endPt.point : endPt

    // For straight lines with valid endpoints, use simple point-to-point edge
    if (startVertex && endVertex) {
      const p1 = makePoint(oc, startVertex)
      const p2 = makePoint(oc, endVertex)

      // Check for degenerate edge
      const dx = (endVertex.x || 0) - (startVertex.x || 0)
      const dy = (endVertex.y || 0) - (startVertex.y || 0)
      const dz = (endVertex.z || 0) - (startVertex.z || 0)
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
      if (dist < 1e-6) return null

      // Try curve-based edge first for non-straight curves
      const typeName = curveEntity && curveEntity.getType ? curveEntity.getType() : ''

      if (typeName && !typeName.includes('straight')) {
        // For splines/ellipses, try to use the curve
        const curve = convertACISCurve(oc, curveEntity, startVertex, endVertex)
        if (curve) {
          try {
            const handleCurve = new oc.Handle_Geom_Curve_2(curve)
            // BRepBuilderAPI_MakeEdge_20 takes just the curve handle
            const builder = new oc.BRepBuilderAPI_MakeEdge_20(handleCurve)
            if (builder.IsDone()) {
              const edge = builder.Edge()
              if (edgeEntity.sense === 'reversed') edge.Reverse()
              return edge
            }
          } catch (e) {
            // Fall through to point-based edge
          }
        }
      }

      // For straight lines or fallback: use BRepBuilderAPI_MakeEdge_3(gp_Pnt, gp_Pnt)
      try {
        const builder = new oc.BRepBuilderAPI_MakeEdge_3(p1, p2)
        if (builder.IsDone()) {
          const edge = builder.Edge()
          if (edgeEntity.sense === 'reversed') edge.Reverse()
          return edge
        }
      } catch (e) {
        console.warn('Point-based edge failed:', e.message)
      }
    }

    // No valid endpoints - try curve only
    const curve = convertACISCurve(oc, curveEntity, startVertex, endVertex)
    if (curve) {
      try {
        const handleCurve = new oc.Handle_Geom_Curve_2(curve)
        const builder = new oc.BRepBuilderAPI_MakeEdge_20(handleCurve)
        if (builder.IsDone()) {
          const edge = builder.Edge()
          if (edgeEntity.sense === 'reversed') edge.Reverse()
          return edge
        }
      } catch (e) {
        console.warn('Curve-based edge failed:', e.message)
      }
    }
  } catch (e) {
    console.warn('Failed to convert edge:', e.message)
  }
  return null
}

/**
 * Convert ACIS loop to OpenCascade wire
 */
function convertACISLoop(oc, loopEntity) {
  if (!loopEntity) return null

  try {
    const coedges = loopEntity.getCoedges ? loopEntity.getCoedges() : []
    if (coedges.length === 0) return null

    const wireBuilder = new oc.BRepBuilderAPI_MakeWire_1()
    let edgesAdded = 0

    for (const coedge of coedges) {
      const edgeEntity = coedge.getEdge ? coedge.getEdge() : null
      const edge = convertACISEdge(oc, edgeEntity)

      if (edge) {
        // Apply coedge sense
        if (coedge.sense === 'reversed') {
          edge.Reverse()
        }
        try {
          wireBuilder.Add_1(edge)
          edgesAdded++
        } catch (e) {
          // Edge might not connect - continue with other edges
        }
      }
    }

    // Wire needs at least one edge
    if (edgesAdded === 0) return null

    if (wireBuilder.IsDone()) {
      return wireBuilder.Wire()
    } else {
      // Try to get partial wire
      try {
        const wire = wireBuilder.Wire()
        if (wire && !wire.IsNull()) {
          return wire
        }
      } catch (e) {
        // Ignore
      }
    }
  } catch (e) {
    console.warn('Failed to convert loop:', e.message)
  }
  return null
}

/**
 * Convert ACIS face to OpenCascade face
 */
function convertACISFace(oc, faceEntity) {
  if (!faceEntity) return null

  try {
    const surfaceEntity = faceEntity.getSurface ? faceEntity.getSurface() : null
    const surface = convertACISSurface(oc, surfaceEntity)

    if (!surface) {
      return null
    }

    const handleSurface = new oc.Handle_Geom_Surface_2(surface)
    const loops = faceEntity.getLoops ? faceEntity.getLoops() : []

    if (loops.length > 0) {
      const outerLoop = loops[0]
      const outerWire = convertACISLoop(oc, outerLoop)

      if (outerWire) {
        try {
          // First create face from surface with tolerance
          // BRepBuilderAPI_MakeFace_8 takes (Handle_Geom_Surface, tolerance)
          const faceBuilder = new oc.BRepBuilderAPI_MakeFace_8(handleSurface, 1e-6)

          // Then add the outer wire
          faceBuilder.Add(outerWire)

          // Add inner wires (holes)
          for (let i = 1; i < loops.length; i++) {
            const innerWire = convertACISLoop(oc, loops[i])
            if (innerWire) {
              innerWire.Reverse()
              faceBuilder.Add(innerWire)
            }
          }

          if (faceBuilder.IsDone()) {
            const result = faceBuilder.Face()
            if (faceEntity.sense === 'reversed') result.Reverse()
            return result
          }
        } catch (e) {
          // Wire-based face failed, try UV bounds approach
        }
      }
    }

    // Try to create bounded face using UV parameters from surface
    // This works for surfaces that have natural bounds (like B-splines with finite domains)
    try {
      // Get UV bounds from surface
      let uMin = -1e6, uMax = 1e6, vMin = -1e6, vMax = 1e6

      // For B-spline surfaces, use knot ranges
      if (surfaceEntity && surfaceEntity.nubs) {
        const nubs = surfaceEntity.nubs
        if (nubs.uKnots && nubs.uKnots.length >= 2) {
          uMin = nubs.uKnots[0]
          uMax = nubs.uKnots[nubs.uKnots.length - 1]
        }
        if (nubs.vKnots && nubs.vKnots.length >= 2) {
          vMin = nubs.vKnots[0]
          vMax = nubs.vKnots[nubs.vKnots.length - 1]
        }
      }

      // For other parametric surfaces, check if they have ranges
      if (surfaceEntity && surfaceEntity.range) {
        const range = surfaceEntity.range
        if (range.uRange) {
          uMin = range.uRange.lower
          uMax = range.uRange.upper
        }
        if (range.vRange) {
          vMin = range.vRange.lower
          vMax = range.vRange.upper
        }
      }

      // Only create bounded face if we have reasonable bounds
      const MAX_PARAM = 1e5
      if (Math.abs(uMin) < MAX_PARAM && Math.abs(uMax) < MAX_PARAM &&
          Math.abs(vMin) < MAX_PARAM && Math.abs(vMax) < MAX_PARAM &&
          uMax > uMin && vMax > vMin) {
        // BRepBuilderAPI_MakeFace_9 takes (Handle_Geom_Surface, umin, umax, vmin, vmax, tolerance)
        const faceBuilder = new oc.BRepBuilderAPI_MakeFace_9(handleSurface, uMin, uMax, vMin, vMax, 1e-6)
        if (faceBuilder.IsDone()) {
          const result = faceBuilder.Face()
          if (faceEntity.sense === 'reversed') result.Reverse()
          return result
        }
      }
    } catch (e) {
      // UV bounds approach also failed
    }

    // Skip faces without valid bounds
  } catch (e) {
    // Face creation failed entirely
  }
  return null
}

/**
 * Convert ACIS shell to OpenCascade shell
 */
function convertACISShell(oc, shellEntity) {
  if (!shellEntity) return null

  try {
    const faces = shellEntity.getFaces ? shellEntity.getFaces() : []
    if (faces.length === 0) return null

    const shellBuilder = new oc.BRep_Builder()
    const shell = new oc.TopoDS_Shell()
    shellBuilder.MakeShell(shell)

    let faceCount = 0
    let skippedFaces = 0
    for (const faceEntity of faces) {
      const face = convertACISFace(oc, faceEntity)
      if (face) {
        // Validate face bounding box before adding
        try {
          const bndBox = new oc.Bnd_Box_1()
          oc.BRepBndLib.Add(face, bndBox, false)

          if (!bndBox.IsVoid()) {
            const xMin = { current: 0 }, yMin = { current: 0 }, zMin = { current: 0 }
            const xMax = { current: 0 }, yMax = { current: 0 }, zMax = { current: 0 }
            bndBox.Get(xMin, yMin, zMin, xMax, yMax, zMax)

            const MAX_EXTENT = 1e10
            if (Math.abs(xMin.current) < MAX_EXTENT && Math.abs(xMax.current) < MAX_EXTENT &&
                Math.abs(yMin.current) < MAX_EXTENT && Math.abs(yMax.current) < MAX_EXTENT &&
                Math.abs(zMin.current) < MAX_EXTENT && Math.abs(zMax.current) < MAX_EXTENT) {
              shellBuilder.Add(shell, face)
              faceCount++
            } else {
              skippedFaces++
            }
          } else {
            skippedFaces++
          }
        } catch (e) {
          skippedFaces++
        }
      }
    }

    if (faceCount > 0) {
      return shell
    }
  } catch (e) {
    console.warn('Failed to convert shell:', e.message)
  }
  return null
}

/**
 * Convert ACIS body to OpenCascade solid
 */
function convertACISBody(oc, bodyEntity) {
  if (!bodyEntity) return null

  try {
    const lumps = bodyEntity.getLumps ? bodyEntity.getLumps() : []
    const shells = []

    for (const lump of lumps) {
      const lumpShells = lump.getShells ? lump.getShells() : []
      for (const shellEntity of lumpShells) {
        const shell = convertACISShell(oc, shellEntity)
        if (shell) {
          shells.push(shell)
        }
      }
    }

    if (shells.length === 0) return null

    // Try to create solid from shells
    if (shells.length === 1) {
      try {
        const solidBuilder = new oc.BRepBuilderAPI_MakeSolid_2(shells[0])
        if (solidBuilder.IsDone()) {
          return solidBuilder.Solid()
        }
      } catch (e) {
        // Fall back to returning shell
        return shells[0]
      }
    }

    // Multiple shells - create compound
    const builder = new oc.BRep_Builder()
    const compound = new oc.TopoDS_Compound()
    builder.MakeCompound(compound)

    for (const shell of shells) {
      builder.Add(compound, shell)
    }

    return compound
  } catch (e) {
    console.warn('Failed to convert body:', e.message)
  }
  return null
}

/**
 * Check if a shape has valid (non-extreme) bounding box
 */
function hasValidBoundingBox(oc, shape) {
  try {
    const bndBox = new oc.Bnd_Box_1()
    oc.BRepBndLib.Add(shape, bndBox, false)

    if (bndBox.IsVoid()) return false

    const xMin = { current: 0 }, yMin = { current: 0 }, zMin = { current: 0 }
    const xMax = { current: 0 }, yMax = { current: 0 }, zMax = { current: 0 }
    bndBox.Get(xMin, yMin, zMin, xMax, yMax, zMax)

    const MAX_EXTENT = 1e10
    if (Math.abs(xMin.current) > MAX_EXTENT || Math.abs(xMax.current) > MAX_EXTENT ||
        Math.abs(yMin.current) > MAX_EXTENT || Math.abs(yMax.current) > MAX_EXTENT ||
        Math.abs(zMin.current) > MAX_EXTENT || Math.abs(zMax.current) > MAX_EXTENT) {
      return false
    }

    return true
  } catch (e) {
    return false
  }
}

/**
 * Convert array of ACIS bodies to single OpenCascade shape
 */
function convertACISBodiesToShape(oc, bodies) {
  if (!bodies || bodies.length === 0) return null

  console.log(`  Converting ${bodies.length} ACIS bodies to OpenCascade shapes...`)

  const shapes = []
  let totalFaces = 0
  let skippedBodies = 0

  for (let i = 0; i < bodies.length; i++) {
    const body = bodies[i]
    console.log(`  Processing body ${i + 1}/${bodies.length}...`)

    const shape = convertACISBody(oc, body)
    if (shape) {
      // Validate bounding box before adding
      if (hasValidBoundingBox(oc, shape)) {
        shapes.push(shape)

        // Count faces
        const lumps = body.getLumps ? body.getLumps() : []
        for (const lump of lumps) {
          const shells = lump.getShells ? lump.getShells() : []
          for (const shell of shells) {
            const faces = shell.getFaces ? shell.getFaces() : []
            totalFaces += faces.length
          }
        }
      } else {
        skippedBodies++
        console.warn(`  Skipped body ${i + 1} (invalid bounding box)`)
      }
    }
  }

  console.log(`  Total faces to process: ${totalFaces}`)
  if (skippedBodies > 0) {
    console.log(`  Skipped ${skippedBodies} bodies with invalid geometry`)
  }

  if (shapes.length === 0) {
    throw new Error('Failed to convert any ACIS bodies to geometry')
  }

  if (shapes.length === 1) {
    return shapes[0]
  }

  // Combine into compound
  const builder = new oc.BRep_Builder()
  const compound = new oc.TopoDS_Compound()
  builder.MakeCompound(compound)

  for (const shape of shapes) {
    builder.Add(compound, shape)
  }

  return compound
}

// ============================================================================
// Exports
// ============================================================================


  // ============================================================================
  // importer-utils.js
  // ============================================================================

/**
 * Inventor Loader Utility Functions
 * Binary reading functions for parsing Inventor IPT/IAM/F3D files
 * Ported from importerUtils.py
 */

// ============================================================================
// UUID Name Mappings
// ============================================================================

const UUID_NAMES = {
  '3c7f67aa4dd7848a040c58894ab06552': '_BodiesFolder',
  '328fc2ea44d13ec5f05abeb87d4aabca': '_ViewDirectionCollection',
  '8da49a2311d60c3210005aab87ae3483': 'AGxInstanceNode',
  'b91e695f11d52794100011ab87ae3483': 'AGxMultiBodyNode',
  '21e870bb11d0d2d000d8ccbc0663dc09': 'BRxEntry',
  'cb0adcaf11d50e7860009ba6c588fbb0': 'EExCollector',
  '6759d86f11d27838600094b70b02ecb0': 'FWxRenderingStyle',
  'a3ebe1984b705d656174d7969e5ae726': 'MBxBodyNode',
  'a03874b011d41238600018aa9dccefb0': 'MBxContourFlangeFeature',
  'c4c14b9011d328ff60004da99dccefb0': 'MBxFaceFeature',
  'c3dddc0811d397d06000a7a99dccefb0': 'MBxFlangeFeature',
  '10d6c06b46086923c73c0faca268550f': 'MBxSheetMetalRuleStyle',
  'c098d3cf11d5345310003697ab9f0ab5': 'MBRDxPunchToolFeature',
  '6045231311d30d7a6000ecb21d6eefb0': 'MBxUserSettingsAttribute',
  'cadd6468467ce6ee8e1494884110a2da': 'MIxBrepComponent',
  'f645595c11d51333100060a6bba647b5': 'MIxTransactablePartition',
  'd81cde4711d265f760005dbead9287b0': 'NBxEntry',
  '74e3441311d25aeb60005bbead9287b0': 'NBxFolder',
  'd8705bc711d15553000825a5b17adc09': 'NBxGraphicsArea',
  'dbbad87b11d228b0600052bead9287b0': 'NBxItem',
  '4c41596411d12e13000824a5fd7adc09': 'NBxNote',
  '3c95b7ce11d13388000820a5b17adc09': 'NBxNotebook',
  '9215a16211d19776600055bd861c3cb0': 'NBxNoteGlyphGroup',
  'fb96d24a11d18877600046bd861c3cb0': 'NBxNoteGlyphNode',
  'cc253bb711d15553000825a5b17adc09': 'NBxTextArea',
  'ccc5085a11d1aa4c0008c8ba32a3dc09': 'NMxFaceMergeData',
  'cce9204211d171c50008a7ba32a3dc09': 'NMxNameTable',
  'dd4c4d3a4fbbf55e16b785853b52d4dc': 'PMxASMFlatPatternPartRepresentation',
  '9a676a5011d45da66000e3b81269f1b0': 'PMxBodyNode',
  'af48560f11d48dc71000d58dc04a0ab5': 'PMxColorStylePrimAttr',
  '7dfc244811d461a01000c895bba647b5': 'PMxCompositeFeatureOutline',
  'b251bfc011d24761a0001580d694c7c9': 'PMxEntryManager',
  'c0014c894bd6a537fa9444be54ebc63d': 'PMxImage2D',
  '022ac1b511d20d356000f99ac5361ab0': 'PMxPartDrawAttr',
  'ca7163a311d0d3b20008bfbb21eddc09': 'PMxPartNode',
  '5e382456497725cff44fdeafccace65e': 'PMxPartRepresentation',
  'a94779e111d438066000b1b7b035f1b0': 'PMxPatternOutline',
  'a94779e011d438066000b1b7b035f1b0': 'PMxSingleFeatureOutline',
  'f7676ab011d23618a0001280d694c7c9': 'PMxSketchEntry',
  '590d0a1011d1e6ca80006fb1e13554c7': 'RDxAngle2',
  'bf3b5c8411d2e92a60004bb38932edb0': 'RDxAngle3Points2',
  '6d8a4ac711d4490f6000e6ab3a39fbb0': 'RDxAngleInterfaceDef',
  'ce52df3b11d0d2d00008ccbc0663dc09': 'RDxArc2',
  'bee90c4111d43c8280005a9a88fdf9c6': 'RDxAtomicInterfaceDef',
  'de818cc011d452d9c000ba967a14684f': 'RDxBendConstraint',
  '90874d4711d0d1f80008cabc0663dc09': 'RDxBody',
  '90874d4811d0d1f80008cabc0663dc09': 'RDxBodySet',
  '2b24130911d272cc60007bb79b49ebb0': 'RDxBrowserFolder',
  '9e43716a11d20fa5600084b7b035c3b0': 'RDxCircle3',
  '4ef32ef04cf83c27f0b185a66f245b22': 'RDxClientFeature',
  '90874d9411d0d1f80008cabc0663dc09': 'RDxCoincident2',
  '90874d5911d0d1f80008cabc0663dc09': 'RDxComponent',
  '81afc10f11d514051000569772d147b5': 'RDxCompositeInterfaceDef',
  '778752c64a5426253aab58b51014c910': 'RDxCurveToSurfaceProjection',
  '7f936baa4aef3859f4b80e8c548a4a11': 'RDxDecalFeature',
  '27ecb60f11d430c3c0001985e89c6b4f': 'RDxDerivedAssembly',
  'cd7c1c534dd0d3096a46e89e3ba9d923': 'RDxDerivedOccDataCollector',
  'bfb5eb9311d443e8c0001c85e89c6b4f': 'RDxDerivedOccFeature',
  '255d7ed711d3b5f2c0000385e89c6b4f': 'RDxDerivedPart',
  '26287e9611d490bd1000e2962dba09b5': 'RDxDeselTableNode',
  '89b87c6f11d2e0d26000f1b26c74fcb0': 'RDxDiagProfileInvalidLoop',
  '3683ce3311d2fcf16000fab26c74fcb0': 'RDxDiagSketchDimRefGeomFailed',
  '74df96e011d1e069800066b1e13554c7': 'RDxDiameter2',
  '1105855811d295e360000cb38932edb0': 'RDxDistanceDimension2',
  '10b6adef45f57b24911db28d8c498f80': 'RDxDistanceDimension3',
  '90874d5311d0d1f80008cabc0663dc09': 'RDxEdgeId',
  '9e43716b11d20fa5600084b7b035c3b0': 'RDxEllipse3',
  '4507d46011d1e6be80006fb1e13554c7': 'RDxEllipticArc2',
  '748fbd6411d1c41f6000b3b801f31bb0': 'RDxFaceSurfaceId',
  '90874d9111d0d1f80008cabc0663dc09': 'RDxFeature',
  'fd1f3f2111d449d88000679a88fdf9c6': 'RDxFlushInterfaceDef',
  'b71cbec94d8922eaa66f24ad3b81c470': 'RDxHelixConstraint3',
  '00acc00011d1e05f800066b1e13554c7': 'RDxHorizontalDistance2',
  '1b16984a11d28fce6000bdb72508ebb0': 'RDxHospital',
  '6d8a4ac911d4490f6000e6ab3a39fbb0': 'RDxInsertInterfaceDef',
  'dfb2586a11d60a0a10002fbd891e89b5': 'RDxIntersectionCurve',
  'ce52df3a11d0d2d00008ccbc0663dc09': 'RDxLine2',
  '8ef06c8911d1043c60007cb801f31bb0': 'RDxLine3',
  'a327786911d19690000826bd0663dc09': 'RDxLoop',
  'a789eeb011d1e6c080006fb1e13554c7': 'RDxMajorRadius2',
  '375c698211d16b510008a1ba32a3dc09': 'RDxMatchedEdge',
  'b382a87c45f4ffb9fe4a7486104813a4': 'RDxMatchedLoop',
  '5523121311d4490d6000e6ab3a39fbb0': 'RDxMateInterfaceDef',
  'b4964e9011d1e6c080006fb1e13554c7': 'RDxMinorRadius2',
  'fad9a9b511d2330560002cab01f31bb0': 'RDxMirrorPattern',
  '452121b611d514d6100061a6bba647b5': 'RDxModelerTxnMgr',
  '3e55d947407dffd912db059ae9d0ed1f': 'RDxOffsetCurve2',
  '90874d1611d0d1f80008cabc0663dc09': 'RDxPart',
  '90874d1111d0d1f80008cabc0663dc09': 'RDxPlanarSketch',
  'ce52df4211d0d2d00008ccbc0663dc09': 'RDxPlane',
  'ce52df3511d0d2d00008ccbc0663dc09': 'RDxPoint2',
  'ce52df3e11d0d2d00008ccbc0663dc09': 'RDxPoint3',
  '0697713111d2323260002cab01f31bb0': 'RDxPolarPattern',
  'f9884c4311d1983d000826bd0663dc09': 'RDxProfile',
  '2d06cad349986fa71ead34b67e52cd7b': 'RDxProjectCutEdges',
  '671bb70011d1e068800066b1e13554c7': 'RDxRadius2',
  '90874d2611d0d1f80008cabc0663dc09': 'RDxReal',
  '2067324411d21dc560002aab01f31bb0': 'RDxRectangularPattern',
  '2d86fc2642dfe34030c08ab05ef9bfc5': 'RDxReferenceEdgeLoopId',
  '317b734611d37a7c60001cb3d1c1fbb0': 'RDxRefSpline',
  '0b86ad43421c4a69e0e0deaab16e7154': 'RDxRefSpline3',
  '3ae9d8da11d42c3ac000ad967a14684f': 'RDxSketch3d',
  'ffd270b811d52d1410000897994909b5': 'RDxSketchFragment',
  'f9372fd411d1d315000847b00524dc09': 'RDxSpline2',
  '7c44abde11d2257a60008cb7b035c3b0': 'RDxSpline3',
  '8f41fd2411d26eac00082aab32a3dc09': 'RDxStopNode',
  '1fbb3c0111d2684da0009e9a3c3aa076': 'RDxString',
  '9a94e34711d36b7fc000d49545df724f': 'RDxToolBodyCacheAttribute',
  'ce52df4011d0d2d00008ccbc0663dc09': 'RDxVector3',
  '3683ff4011d1e05f800066b1e13554c7': 'RDxVerticalDistance2',
  'ea7da98811d447a26000d0b81269f1b0': 'RSeAcisEntityContainer',
  'cc0f752111d18027e38619962259017a': 'RSeAcisEntityWrapper',
  '60fd184511d0d79d0008bfbb21eddc09': 'SCxSketchNode',
  'da58aa0e11d43cb1c000ae967a14684f': 'S3xSketch3dNode',
  'fd1e899d11d635491000568ec04a0ab5': 'SMxAnalysisSetup',
  'a529d1e211d0d0900008bcbb21eddc09': 'SMxGroupNode',
  '022ac1b111d20d356000f99ac5361ab0': 'SMxPersistentScenePath',
  '716b5cd148299bd2474ec788e5ab0c74': 'UCxATEntry',
  'd48240694eb51a34aec9d789df4f97a4': 'UCxClientFeatureNode',
  'dbe41d9111d4414c8000609a88fdf9c6': 'UCxCompInterfaceNode',
  'ca7163a111d0d3b20008bfbb21eddc09': 'UCxComponentNode',
  'd1071d574d61a7c4f2e352bf50116935': 'UCxConstraint3DimensionItem',
  '7dfcc81711d6419710006eab87ae3483': 'UCxConstructionFolderEntry',
  '475e786111d296dba0004a803603c8c9': 'UCxFeatureDimensionStateAttr',
  '2c7020f611d1b3c06000b1b801f31bb0': 'UCxWorkaxisNode',
  '14533d8211d1087100085ba406e5dc09': 'UCxWorkplaneNode',
  '2c7020f811d1b3c06000b1b801f31bb0': 'UCxWorkpointNode',
  'd31891c248bf14c3aa42ea872a846b2a': 'UFRxRef'
}

// ============================================================================
// Global State
// ============================================================================

let _fileVersion = 0
let _fileBeta = -1
let _blockSize = 0

function getFileVersion() {
  return _fileVersion
}

function setFileVersion(version) {
  _fileVersion = version
  _blockSize = version > 2010 ? 0 : 4
}

function getFileBeta() {
  return _fileBeta
}

function setFileBeta(beta) {
  _fileBeta = beta
}

function getBlockSize() {
  return _blockSize
}

// ============================================================================
// Binary Reading Functions
// ============================================================================

/**
 * Get boolean value (0 or 1)
 * @param {Uint8Array|DataView} data - Binary data
 * @param {number} offset - Byte offset
 * @returns {[boolean, number]} [value, newOffset]
 */
function getBoolean(data, offset) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  const val = view.getUint8(offset)
  if (val === 1) return [true, offset + 1]
  if (val === 0) return [false, offset + 1]
  throw new Error(`Expected either 0 or 1 but found ${val.toString(16)}`)
}

/**
 * Get signed 8-bit integer
 */
function getSInt8(data, offset) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  return [view.getInt8(offset), offset + 1]
}

/**
 * Get unsigned 8-bit integer
 */
function getUInt8(data, offset) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  return [view.getUint8(offset), offset + 1]
}

/**
 * Get array of unsigned 8-bit integers
 */
function getUInt8A(data, offset, size) {
  const end = offset + size
  const arr = new Uint8Array(data.buffer || data, data.byteOffset ? data.byteOffset + offset : offset, size)
  return [Array.from(arr), end]
}

/**
 * Get unsigned 16-bit integer (little-endian)
 */
function getUInt16(data, offset) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  return [view.getUint16(offset, true), offset + 2]
}

/**
 * Get array of unsigned 16-bit integers
 */
function getUInt16A(data, offset, size) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  const arr = []
  let i = offset
  for (let j = 0; j < size; j++) {
    arr.push(view.getUint16(i, true))
    i += 2
  }
  return [arr, i]
}

/**
 * Get signed 16-bit integer
 */
function getSInt16(data, offset) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  return [view.getInt16(offset, true), offset + 2]
}

/**
 * Get array of signed 16-bit integers
 */
function getSInt16A(data, offset, size) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  const arr = []
  let i = offset
  for (let j = 0; j < size; j++) {
    arr.push(view.getInt16(i, true))
    i += 2
  }
  return [arr, i]
}

/**
 * Get unsigned 32-bit integer
 */
function getUInt32(data, offset) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  return [view.getUint32(offset, true), offset + 4]
}

/**
 * Get array of unsigned 32-bit integers
 */
function getUInt32A(data, offset, size) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  const arr = []
  let i = offset
  for (let j = 0; j < size; j++) {
    arr.push(view.getUint32(i, true))
    i += 4
  }
  return [arr, i]
}

/**
 * Get signed 32-bit integer
 */
function getSInt32(data, offset) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  return [view.getInt32(offset, true), offset + 4]
}

/**
 * Get array of signed 32-bit integers
 */
function getSInt32A(data, offset, size) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  const arr = []
  let i = offset
  for (let j = 0; j < size; j++) {
    arr.push(view.getInt32(i, true))
    i += 4
  }
  return [arr, i]
}

/**
 * Get unsigned 64-bit integer (as BigInt)
 */
function getUInt64(data, offset) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  return [view.getBigUint64(offset, true), offset + 8]
}

/**
 * Get array of unsigned 64-bit integers
 */
function getUInt64A(data, offset, size) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  const arr = []
  let i = offset
  for (let j = 0; j < size; j++) {
    arr.push(view.getBigUint64(i, true))
    i += 8
  }
  return [arr, i]
}

/**
 * Get signed 64-bit integer (as BigInt)
 */
function getSInt64(data, offset) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  return [view.getBigInt64(offset, true), offset + 8]
}

/**
 * Get array of signed 64-bit integers
 */
function getSInt64A(data, offset, size) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  const arr = []
  let i = offset
  for (let j = 0; j < size; j++) {
    arr.push(view.getBigInt64(i, true))
    i += 8
  }
  return [arr, i]
}

/**
 * Get 32-bit float
 */
function getFloat32(data, offset) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  return [view.getFloat32(offset, true), offset + 4]
}

/**
 * Get array of 32-bit floats
 */
function getFloat32A(data, offset, size) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  const arr = []
  let i = offset
  for (let j = 0; j < size; j++) {
    arr.push(view.getFloat32(i, true))
    i += 4
  }
  return [arr, i]
}

/**
 * Get 2D point from 32-bit floats
 */
function getFloat32_2D(data, offset) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  return [
    { x: view.getFloat32(offset, true), y: view.getFloat32(offset + 4, true) },
    offset + 8
  ]
}

/**
 * Get 3D point from 32-bit floats
 */
function getFloat32_3D(data, offset) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  return [
    {
      x: view.getFloat32(offset, true),
      y: view.getFloat32(offset + 4, true),
      z: view.getFloat32(offset + 8, true)
    },
    offset + 12
  ]
}

/**
 * Get 64-bit float (double)
 */
function getFloat64(data, offset) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  return [view.getFloat64(offset, true), offset + 8]
}

/**
 * Get array of 64-bit floats
 */
function getFloat64A(data, offset, size) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  const arr = []
  let i = offset
  for (let j = 0; j < size; j++) {
    arr.push(view.getFloat64(i, true))
    i += 8
  }
  return [arr, i]
}

/**
 * Get 2D vector from 64-bit floats (with z=0)
 */
function getFloat64_2D(data, offset) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  return [
    {
      x: view.getFloat64(offset, true),
      y: view.getFloat64(offset + 8, true),
      z: 0
    },
    offset + 16
  ]
}

/**
 * Get 3D vector from 64-bit floats
 */
function getFloat64_3D(data, offset) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  return [
    {
      x: view.getFloat64(offset, true),
      y: view.getFloat64(offset + 8, true),
      z: view.getFloat64(offset + 16, true)
    },
    offset + 24
  ]
}

// ============================================================================
// Color Class
// ============================================================================

class Color {
  constructor(red, green, blue, alpha = 1.0) {
    this.red = red
    this.green = green
    this.blue = blue
    this.alpha = alpha
  }

  getRGB() {
    return [this.red, this.green, this.blue]
  }

  getRGBA() {
    return [this.red, this.green, this.blue, this.alpha]
  }

  toString() {
    const r = Math.round(this.red * 255)
    const g = Math.round(this.green * 255)
    const b = Math.round(this.blue * 255)
    const a = Math.round(this.alpha * 255)
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}${a.toString(16).padStart(2, '0')}`
  }
}

/**
 * Get RGBA color from 4 floats
 */
function getColorRGBA(data, offset) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  const r = view.getFloat32(offset, true)
  const g = view.getFloat32(offset + 4, true)
  const b = view.getFloat32(offset + 8, true)
  const a = view.getFloat32(offset + 12, true)
  return [new Color(r, g, b, a), offset + 16]
}

// ============================================================================
// UID Class
// ============================================================================

class UID {
  constructor(options = {}) {
    if (options.bytes_le) {
      const b = options.bytes_le
      this.timeLow = (b[3] << 24) | (b[2] << 16) | (b[1] << 8) | b[0]
      this.val1 = (b[5] << 8) | b[4]
      this.val2 = (b[7] << 8) | b[6]
      this.val3 = (b[8] << 8) | b[9]
      // val4 is 6 bytes (48 bits)
      this.val4 = BigInt(b[10]) << 40n |
                  BigInt(b[11]) << 32n |
                  BigInt(b[12]) << 24n |
                  BigInt(b[13]) << 16n |
                  BigInt(b[14]) << 8n |
                  BigInt(b[15])
    } else if (options.str) {
      const vals = options.str.split('-')
      this.timeLow = parseInt(vals[0], 16)
      this.val1 = parseInt(vals[1], 16)
      this.val2 = parseInt(vals[2], 16)
      this.val3 = parseInt(vals[3], 16)
      this.val4 = BigInt('0x' + vals[4])
    } else {
      this.timeLow = 0
      this.val1 = 0
      this.val2 = 0
      this.val3 = 0
      this.val4 = 0n
    }
  }

  get hex() {
    return `${this.timeLow.toString(16).padStart(8, '0')}${this.val1.toString(16).padStart(4, '0')}${this.val2.toString(16).padStart(4, '0')}${this.val3.toString(16).padStart(4, '0')}${this.val4.toString(16).padStart(12, '0')}`
  }

  toString() {
    return `${this.timeLow.toString(16).toUpperCase().padStart(8, '0')}-${this.val1.toString(16).toUpperCase().padStart(4, '0')}-${this.val2.toString(16).toUpperCase().padStart(4, '0')}-${this.val3.toString(16).toUpperCase().padStart(4, '0')}-${this.val4.toString(16).toUpperCase().padStart(12, '0')}`
  }

  equals(other) {
    if (other instanceof UID) {
      return this.timeLow === other.timeLow &&
             this.val1 === other.val1 &&
             this.val2 === other.val2 &&
             this.val3 === other.val3 &&
             this.val4 === other.val4
    }
    return false
  }
}

/**
 * Get UUID from binary data
 */
function getUUID(data, offset) {
  const bytes = data instanceof Uint8Array
    ? data.slice(offset, offset + 16)
    : new Uint8Array(data.buffer || data, offset, 16)
  return [new UID({ bytes_le: bytes }), offset + 16]
}

/**
 * Get DateTime from binary data (Windows FILETIME)
 */
function getDateTime(data, offset) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  const val = view.getBigUint64(offset, true)
  if (val !== 0n) {
    // Convert from Windows FILETIME (100-nanosecond intervals since 1601-01-01)
    // to JavaScript Date
    const milliseconds = Number(val / 10000n) - 11644473600000
    return [new Date(milliseconds), offset + 8]
  }
  return [null, offset + 8]
}

// ============================================================================
// Text Reading Functions
// ============================================================================

const ENCODING_FS = 'utf-8'

/**
 * Get text string with specified length
 */
function getText8(data, offset, length) {
  const bytes = data instanceof Uint8Array
    ? data.slice(offset, offset + length)
    : new Uint8Array(data.buffer || data, offset, length)

  const decoder = new TextDecoder(ENCODING_FS)
  let txt = decoder.decode(bytes)

  // Remove trailing null or newline
  if (txt.endsWith('\0')) txt = txt.slice(0, -1)
  if (txt.endsWith('\n')) txt = txt.slice(0, -1)

  return [txt, offset + length]
}

/**
 * Get 8-bit length prefixed text
 */
function getLen8Text8(data, offset) {
  const [length, i] = getUInt8(data, offset)
  return getText8(data, i, length)
}

/**
 * Get 32-bit length prefixed 8-bit text
 */
function getLen32Text8(data, offset) {
  const [length, i] = getUInt32(data, offset)
  return getText8(data, i, length)
}

/**
 * Get 32-bit length prefixed 16-bit (UTF-16LE) text
 */
function getLen32Text16(data, offset) {
  const [length, i] = getUInt32(data, offset)
  const end = i + 2 * length
  const bytes = data instanceof Uint8Array
    ? data.slice(i, end)
    : new Uint8Array(data.buffer || data, i, 2 * length)

  const decoder = new TextDecoder('utf-16le')
  let txt = decoder.decode(bytes)

  // Remove trailing null or newline
  if (txt.endsWith('\0')) txt = txt.slice(0, -1)
  if (txt.endsWith('\n')) txt = txt.slice(0, -1)

  return [txt, end]
}

/**
 * Get UID text name from UUID_NAMES mapping
 */
function getUidText(uid) {
  const hex = uid.hex
  return UUID_NAMES[hex] || uid.toString()
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert float array to string
 */
function floatArr2Str(arr) {
  return arr.map(f => f.toPrecision(6)).join(', ')
}

/**
 * Convert int array to hex string
 */
function intArr2Str(arr, width = 2) {
  return arr.map(h => h.toString(16).toUpperCase().padStart(width, '0')).join(',')
}

/**
 * Convert 2D int array to string
 */
function int2DArr2Str(arr, width = 2) {
  return arr.map(a => '[' + a.map(h => h.toString(16).toUpperCase().padStart(width, '0')).join(',') + ']').join(',')
}

/**
 * Check if value is a string
 */
function isString(value) {
  return typeof value === 'string'
}

/**
 * Check if two vectors are approximately equal
 */
function isEqual(a, b, epsilon = 0.0001) {
  if (a === null || a === undefined) return isEqual({ x: 0, y: 0, z: 0 }, b, epsilon)
  if (b === null || b === undefined) return isEqual(a, { x: 0, y: 0, z: 0 }, epsilon)
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = a.z - b.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz) < epsilon
}

/**
 * Check if two numbers are approximately equal
 */
function isEqual1D(a, b, epsilon = 0.0001) {
  if (a === null || a === undefined) return isEqual1D(0, b, epsilon)
  if (b === null || b === undefined) return isEqual1D(a, 0, epsilon)
  return Math.abs(a - b) < epsilon
}

/**
 * Check if stream name indicates embeddings
 */
function isEmbeddings(names) {
  return names.includes('RSeEmbeddings')
}

/**
 * Reshape flat array into 2D array
 */
function reshape(nums, size) {
  if (size === 1) return nums
  const result = []
  for (let i = 0; i < nums.length; i += size) {
    result.push(nums.slice(i, i + size))
  }
  return result
}

// ============================================================================
// Default Export
// ============================================================================


  // ============================================================================
  // importer-constants.js
  // ============================================================================

/**
 * Inventor Loader Constants
 * Ported from importerConstants.py
 */

// ============================================================================
// Reference Types
// ============================================================================

const REF_CROSS = 1
const REF_CHILD = 2
const REF_PARENT = 3

// ============================================================================
// Value Types
// ============================================================================

const VAL_GUESS = 0
const VAL_UINT8 = 1
const VAL_UINT16 = 2
const VAL_UINT32 = 3
const VAL_UINT64 = 4
const VAL_REF = 5
const VAL_STR8 = 6
const VAL_STR16 = 7
const VAL_DATETIME = 8
const VAL_ENUM = 9

// ============================================================================
// Value Format Strings
// ============================================================================

const VAL_FORMAT = {
  [VAL_GUESS]: '%s',
  [VAL_UINT8]: '%02X',
  [VAL_UINT16]: '%03X',
  [VAL_UINT32]: '%04X',
  [VAL_UINT64]: '%05X',
  [VAL_STR8]: "'%s'",
  [VAL_STR16]: '"%s"',
  [VAL_DATETIME]: '#%s#',
  [VAL_ENUM]: '%s'
}

// ============================================================================
// Angle Constants
// ============================================================================

const MIN_0 = 0.0
const MIN_PI = -Math.PI
const MIN_PI2 = -Math.PI / 2
const MIN_INF = -Infinity

const MAX_2PI = 2 * Math.PI
const MAX_PI = Math.PI
const MAX_PI2 = Math.PI / 2
const MAX_INF = Infinity
const MAX_LEN = 2e100

// ============================================================================
// Direction Constants
// ============================================================================

const CENTER = { x: 0, y: 0, z: 0 }
const DIR_X = { x: 1, y: 0, z: 0 }
const DIR_Y = { x: 0, y: 1, z: 0 }
const DIR_Z = { x: 0, y: 0, z: 1 }

// ============================================================================
// File Encoding
// ============================================================================

const ENCODING_FS = 'utf-8'

// ============================================================================
// Epsilon for floating point comparisons
// ============================================================================

const EPS = 1.0e-6

// ============================================================================
// Segment Type IDs
// ============================================================================

const SEG_APP = 'AppSegmentType'
const SEG_APP_AM = 'AmAppSegmentType'
const SEG_APP_PM = 'PmAppSegmentType'
const SEG_BREP_AM = 'AmBREPSegmentType'
const SEG_BREP_MB = 'MbBrepSegmentType'
const SEG_BREP_PM = 'PmBrepSegmentType'
const SEG_BROWSER_AM = 'AmBRxSegmentType'
const SEG_BROWSER_DL = 'DlBRxSegmentType'
const SEG_BROWSER_DX = 'DxBRxSegmentType'
const SEG_BROWSER_PM = 'PmBRxSegmentType'
const SEG_BROWSER_PM_OLD = 'PmBrowserSegment'
const SEG_DC_AM = 'AmDcSegmentType'
const SEG_DC_DL = 'DlDocDcSegmentType'
const SEG_DC_DX = 'DxDcSegmentType'
const SEG_DC_PM = 'PmDcSegmentType'
const SEG_DESIGN_VIEW = 'FWxDesignViewType'
const SEG_DESIGN_VIEW_MGR = 'FWxDesignViewManagerType'
const SEG_DIRECTORY_DL = 'DlDirectorySegmentType'
const SEG_EE_DATA = 'EeDataSegmentType'
const SEG_EE_SCENE = 'EeSceneSegmentType'
const SEG_FB_ATTRIBUTE = 'FBAttributeSegment'
const SEG_GRAPHICS_AM = 'AmGRxSegmentType'
const SEG_GRAPHICS_MB = 'MbGRxSegmentType'
const SEG_GRAPHICS_PM = 'PmGRxSegmentType'
const SEG_NOTEBOOK = 'NotebookSegmentType'
const SEG_RESULT_AM = 'AmRxSegmentType'
const SEG_RESULT_PM = 'PmResultSegmentType'
const SEG_SHEET_DC_DL = 'DlSheetDcSegmentType'
const SEG_SHEET_DL_DL = 'DlSheetDlSegmentType'
const SEG_SHEET_SM_DL = 'DlSheetSmSegmentType'

// ============================================================================
// Segment Type Collections
// ============================================================================

const SEGMENTS_APP = [SEG_APP, SEG_APP_AM, SEG_APP_PM]
const SEGMENTS_BRP = [SEG_BREP_AM, SEG_BREP_MB, SEG_BREP_PM]
const SEGMENTS_BRX = [SEG_BROWSER_AM, SEG_BROWSER_DL, SEG_BROWSER_DX, SEG_BROWSER_PM]
const SEGMENTS_DOC = [SEG_DC_AM, SEG_DC_DL, SEG_DC_DX, SEG_DC_PM]
const SEGMENTS_DVW = [SEG_DESIGN_VIEW, SEG_DESIGN_VIEW_MGR]
const SEGMENTS_DIR = [SEG_DIRECTORY_DL]
const SEGMENTS_EED = [SEG_EE_DATA]
const SEGMENTS_EES = [SEG_EE_SCENE]
const SEGMENTS_FBA = [SEG_FB_ATTRIBUTE]
const SEGMENTS_GRX = [SEG_GRAPHICS_AM, SEG_GRAPHICS_MB, SEG_GRAPHICS_PM]
const SEGMENTS_NTB = [SEG_NOTEBOOK]
const SEGMENTS_RSX = [SEG_RESULT_AM, SEG_RESULT_PM]
const SEGMENTS_SHT = [SEG_SHEET_DC_DL, SEG_SHEET_DL_DL, SEG_SHEET_SM_DL]

// ============================================================================
// Constraint Types (F3D)
// ============================================================================

const CONSTRAINT_TYPE = {
  0x00000000001: 'Coincident',
  0x00000000002: 'Colinear',
  0x00000000004: 'Concentric',
  0x00000000010: 'Parallel',
  0x00000000020: 'Perpendicular',
  0x00000000040: 'Horizontal',
  0x00000000080: 'Vertical',
  0x00000000100: 'Tangential',
  0x00000000200: 'Curvature',
  0x00000000400: 'Symmetry',
  0x00000000800: 'Equal',
  0x00000001000: 'Midpoint',
  0x00000002000: 'Polygon',
  0x00010000000: 'Pattern_Circular',
  0x00020000000: 'Pattern_Rect',
  0x10000000000: 'Text_Frame',
  0x20000000000: 'Text_Path'
}

// ============================================================================
// Mathematical Functions
// ============================================================================

const Functions = [
  '',
  'cos',
  'sin',
  'tan',
  'acos',
  'asin',
  'atan',
  'cosh',
  'sinh',
  'tanh',
  'sqrt',
  'exp',
  'pow',
  'log',
  'log10',
  'floor',
  'ceil',
  'round',
  'abs',
  'sign',
  'max',
  'min',
  'random',
  'acosh',
  'asinh',
  'atanh',
  'isolate'
]

const FunctionsNotSupported = ['sign', 'random', 'acosh', 'asinh', 'atanh', 'isolate']

// ============================================================================
// Tolerances
// ============================================================================

const Tolerances = {
  NOMINAL: 0,
  LOWER: 1,
  UPPER: 2,
  MEDIAN: 3
}

// ============================================================================
// DbInterface Type Mapping
// ============================================================================

const DB_INTERFACE_TYPE_MAPPING = {
  0x01: 'BOOL',
  0x04: 'SINT',
  0x10: 'UUID',
  0x30: 'FLOAT[]',
  0x54: 'MAP'
}

// ============================================================================
// Default Export
// ============================================================================



  // ============================================================================
  // Class Mappings Initialization (from index.js)
  // ============================================================================

  // Initialize spline.js with class mappings
  setCurveClasses({
    'degenerate': CurveDegenerate,
    'ellipse': CurveEllipse,
    'intcurve': CurveInt,
    'pcurve': CurveP,
    'straight': CurveStraight,
    'compcurv': CurveComp,
    'intcurve-intcurve': CurveIntInt,
    'null_curve': null,
    'null_pcurve': null
  })

  setSurfaceClasses({
    'cone': SurfaceCone,
    'mesh': SurfaceMesh,
    'plane': SurfacePlane,
    'sphere': SurfaceSphere,
    'spline': SurfaceSpline,
    'torus': SurfaceTorus,
    'null_surface': null
  })

  setTransformClass(Transform)


  // ============================================================================
  // High-level API
  // ============================================================================

  /**
   * Parse ACIS binary data and return bodies
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
 */
function parseAcis(data) {
  if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data)
    const header = new TextDecoder().decode(bytes.slice(0, 15))

    if (header.startsWith('ACIS BinaryFile') || header.startsWith('ASM BinaryFile')) {
      return parseAcisBinary(data)
    }
    return parseAcisText(data)
  }
  return parseAcisText(data)
}

/**
 * Get all faces from bodies
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

// ============================================================================
// F3D Importer Functions (from importer-f3d.js)
// ============================================================================

// F3D state
let f3dSmbFiles = []
let f3dBulkData = null
let f3dMetaData = null

/**
 * Find the start of ACIS data in SMB/SMBH files
 */
function findACISDataStart(data) {
  const view = data instanceof Uint8Array ? data : new Uint8Array(data)
  for (let i = 0; i < Math.min(1024, view.length - 1); i++) {
    if (view[i] === 0x0d) {
      if (i + 1 < view.length && view[i + 1] < 64 && view[i + 1] > 0) {
        return i
      }
    }
  }
  if (view[0] === 0x0d) return 0
  return 0
}

/**
 * Find ACIS header in data
 */
function findACISHeader(data) {
  const view = data instanceof Uint8Array ? data : new Uint8Array(data)
  for (let i = 0; i < Math.min(4096, view.length - 15); i++) {
    const chunk = new TextDecoder().decode(view.slice(i, i + 15))
    if (chunk.startsWith('ACIS BinaryFile') || chunk.startsWith('ASM BinaryFile')) {
      return i
    }
  }
  return -1
}

/**
 * Check if data is a valid ZIP file
 */
function isZipFile(data) {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data)
  return bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x03 && bytes[3] === 0x04
}

/**
 * Parse manifest item
 */
function getF3DManifestItem(data, offset) {
  let i = offset
  let t1, t2, t3, t4
  ;[t1, i] = getLen32Text16(data, i)
  ;[t2, i] = getLen32Text16(data, i)
  ;[t3, i] = getLen32Text16(data, i)
  ;[t4, i] = getLen32Text16(data, i)
  let [a1, newI] = getUInt32A(data, i, 4)
  i = newI
  let [cnt] = getUInt32(data, i)
  i += 4
  const a2 = {}
  for (let j = 0; j < cnt; j++) {
    let k, v
    ;[k, i] = getLen32Text16(data, i)
    ;[v, i] = getLen32Text16(data, i)
    a2[k] = v
  }
  return [{ t1, t2, t3, t4, a1, a2 }, i]
}

/**
 * Parse manifest items array
 */
function getF3DManifestItems(data, offset) {
  const a = []
  let i = offset
  let [n1] = getUInt8(data, i)
  i += 1
  if (n1) {
    let [cnt] = getUInt32(data, i)
    i += 4
    for (let j = 0; j < cnt; j++) {
      let mi
      ;[mi, i] = getF3DManifestItem(data, i)
      a.push(mi)
    }
  }
  return [a, i]
}

/**
 * Read and parse manifest.dat from F3D archive
 */
async function readF3DManifest(f3d, path) {
  const name = path.split('/').pop()
  if (!name) return ''
  const file = f3d.file(path)
  if (!file) {
    throw new Error('Manifest not found at ' + path)
  }
  const buffer = await file.async('arraybuffer')
  const data = new Uint8Array(buffer)
  let i = 0
  let t1, t2, t3, t4, t5, t6, t7, t8
  ;[t1, i] = getLen32Text8(data, i)
  ;[t2, i] = getLen32Text8(data, i)
  ;[t3, i] = getLen32Text16(data, i)
  ;[t4, i] = getLen32Text16(data, i)
  ;[t5, i] = getLen32Text16(data, i)
  ;[t6, i] = getLen32Text16(data, i)
  ;[t7, i] = getLen32Text16(data, i)
  let [a1] = getUInt32A(data, i, 2)
  i += 8
  let [cnt] = getUInt32(data, i)
  i += 4
  const l1 = []
  for (let j = 0; j < cnt; j++) {
    let t
    ;[t, i] = getLen32Text8(data, i)
    let [v] = getUInt32(data, i)
    i += 4
    l1.push([t, v])
  }
  ;[cnt] = getUInt32(data, i)
  i += 4
  const l2 = []
  for (let j = 0; j < cnt; j++) {
    let t
    ;[t, i] = getLen32Text16(data, i)
    l2.push(t)
  }
  let l3
  ;[l3, i] = getF3DManifestItems(data, i)
  ;[t8, i] = getLen32Text16(data, i)
  let [n1] = getUInt32(data, i)
  i += 4
  let folder
  ;[folder, i] = getLen32Text16(data, i)
  return folder
}

/**
 * Process SMB file from F3D archive
 */
async function processF3DSMB(f3d, path) {
  const name = path.split('/').pop()
  if (!name) return false
  const file = f3d.file(path)
  if (!file) {
    console.warn('SMB file not found: ' + path)
    return false
  }
  const buffer = await file.async('arraybuffer')
  const data = new Uint8Array(buffer)
  f3dSmbFiles.push({ name, data, isRaw: true })
  return true
}

/**
 * Read F3D file and extract structure
 */
async function readF3D(fileData, JSZip) {
  f3dSmbFiles = []
  f3dBulkData = null
  f3dMetaData = null

  const data = fileData instanceof Uint8Array ? fileData : new Uint8Array(fileData)
  if (!isZipFile(data)) {
    throw new Error('Not a valid F3D/ZIP file')
  }

  const f3d = await JSZip.loadAsync(data)
  const folder = await readF3DManifest(f3d, 'Manifest.dat')

  const folderPreview = folder + '[Active]/Previews/'
  const folderBreps = folder + '[Active]/Breps.BlobParts/'
  const fileBulk = folder + '[Active]/Design1/BulkStream.dat'
  const fileMeta = folder + '[Active]/Design1/MetaStream.dat'

  const result = {
    folder: folder,
    thumbnail: null,
    smbFiles: [],
    bulkData: null,
    metaData: null
  }

  const fileNames = Object.keys(f3d.files)
  for (const name of fileNames) {
    if (name.startsWith(folderPreview)) {
      const thumbFile = f3d.file(name)
      if (thumbFile) {
        const buf = await thumbFile.async('arraybuffer')
        result.thumbnail = new Uint8Array(buf)
      }
    } else if (name.startsWith(folderBreps)) {
      await processF3DSMB(f3d, name)
    }
  }

  try {
    const bulkFile = f3d.file(fileBulk)
    if (bulkFile) {
      const buffer = await bulkFile.async('arraybuffer')
      f3dBulkData = new Uint8Array(buffer)
      result.bulkData = f3dBulkData
    }
  } catch (e) {}

  try {
    const metaFile = f3d.file(fileMeta)
    if (metaFile) {
      const buffer = await metaFile.async('arraybuffer')
      f3dMetaData = new Uint8Array(buffer)
      result.metaData = f3dMetaData
    }
  } catch (e) {}

  result.smbFiles = f3dSmbFiles
  return result
}

/**
 * Parse F3D file (main entry point)
 */
async function parseF3D(arrayBuffer, loadJSZip) {
  const JSZip = await loadJSZip()
  const f3dData = await readF3D(arrayBuffer, JSZip)

  const allBodies = []

  for (const smb of f3dData.smbFiles) {
    try {
      console.log('Parsing ' + smb.name + ': ' + smb.data.byteLength + ' bytes')

      // Check if this is direct ACIS format or has a wrapper
      const headerStr = new TextDecoder().decode(smb.data.slice(0, 15))
      let dataToparse = smb.data

      if (!headerStr.startsWith('ACIS BinaryFile') && !headerStr.startsWith('ASM BinaryFile')) {
        // Try to find ACIS data start
        const acisStart = findACISDataStart(smb.data)
        if (acisStart > 0) {
          console.log('  Found ACIS data at offset ' + acisStart)
          dataToparse = smb.data.slice(acisStart)
        } else {
          // Try to find ACIS header marker
          const foundOffset = findACISHeader(smb.data)
          if (foundOffset >= 0) {
            console.log('  Found ACIS header at offset ' + foundOffset)
            dataToparse = smb.data.slice(foundOffset)
          }
        }
      }

      const bodies = parseAcisBinary(dataToparse)
      console.log('  Found ' + bodies.length + ' bodies')
      allBodies.push(...bodies)
    } catch (e) {
      console.warn('Failed to parse ' + smb.name + ':', e.message)
      console.warn(e.stack)
    }
  }

  if (allBodies.length === 0) {
    throw new Error('No geometry bodies found in F3D file')
  }

  return allBodies
}

/**
 * Import F3D file and build geometry using OpenCascade.js
 */
async function importF3D(fileData, oc, loadJSZip, options) {
  options = options || {}
  const JSZip = await loadJSZip()
  const f3dData = await readF3D(fileData, JSZip)

  const results = {
    folder: f3dData.folder,
    thumbnail: f3dData.thumbnail,
    shapes: [],
    errors: []
  }

  for (const smb of f3dData.smbFiles) {
    try {
      console.log('Processing ' + smb.name + ': ' + smb.data.byteLength + ' bytes')

      // Find ACIS data
      const headerStr = new TextDecoder().decode(smb.data.slice(0, 15))
      let dataToparse = smb.data

      if (!headerStr.startsWith('ACIS BinaryFile') && !headerStr.startsWith('ASM BinaryFile')) {
        const acisStart = findACISDataStart(smb.data)
        if (acisStart > 0) {
          dataToparse = smb.data.slice(acisStart)
        } else {
          const foundOffset = findACISHeader(smb.data)
          if (foundOffset >= 0) {
            dataToparse = smb.data.slice(foundOffset)
          }
        }
      }

      // Parse and resolve ACIS data
      const reader = new AcisReader()
      if (reader.readBinary(dataToparse)) {
        reader.resolveEntities(RECORD_2_ENTITY)

        for (const body of reader.bodies || []) {
          try {
            const shape = convertACISBody(oc, body)
            if (shape) {
              results.shapes.push({ name: smb.name, shape: shape })
            }
          } catch (e) {
            results.errors.push({ name: smb.name, error: e.message })
          }
        }
      }
    } catch (e) {
      results.errors.push({ name: smb.name, error: e.message })
    }
  }

  return results
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
  importF3D,
  readF3D,
  isZipFile,

  // Utility functions
  getAllFaces,
  getAllEdges,
  extractColor,
  extractName,
  findACISDataStart,
  findACISHeader,

  // Classes (for instanceof checks)
  Entity, Body, Lump, Shell, Face, Loop, CoEdge, Edge, Vertex,
  Curve, CurveStraight, CurveEllipse, CurveInt,
  Surface, SurfacePlane, SurfaceCone, SurfaceSphere, SurfaceTorus, SurfaceSpline,
  Point, Transform,

  // Data structures
  Range, Interval, BS_Curve, BS_Surface, Helix,

  // Math functions
  VEC, NORM, CROSS, DOT, SIZE,

  // Geometry builder functions
  makePoint,
  makeDirection,
  makeVec,
  makeAx1,
  makeAx2,
  makeAx3,
  createLine,
  createCircle,
  createEllipse,
  createBSplineCurve,
  createBSplineSurface,
  createPlaneSurface,
  createCylindricalSurface,
  createConicalSurface,
  createSphericalSurface,
  createToroidalSurface,
  createFaceFromSurface,
  createEdgeFromCurve,
  convertACISSurface,
  convertACISCurve,
  convertACISEdge,
  convertACISLoop,
  convertACISFace,
  convertACISShell,
  convertACISBody,
  convertACISBodiesToShape
}

// Also expose as ACISParser for backwards compatibility
global.ACISParser = {
  parseF3D: parseF3D,
  importF3D: importF3D
}

// ACISGeometry for OpenCascade.js conversion
global.ACISGeometry = {
  convertACISBody: convertACISBody,
  convertACISBodiesToShape: convertACISBodiesToShape,
  convertACISSurface: convertACISSurface,
  convertACISCurve: convertACISCurve,
  convertACISEdge: convertACISEdge,
  convertACISFace: convertACISFace,
  convertACISShell: convertACISShell
}

})(typeof self !== 'undefined' ? self : this)
