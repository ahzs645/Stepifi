/**
 * ACIS Bundle - Combined library for Web Worker usage
 * Bundled from acis-js ES6 modules for importScripts() compatibility
 *
 * Usage:
 *   importScripts('acis-bundle.js')
 *   const bodies = await self.ACIS.parseF3D(arrayBuffer, loadJSZip)
 */

;(function(global) {
  'use strict'

  // ============================================================================
  // Math Functions (from math.js)
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
  const ARCSIN = (x) => Math.asin(x)
  const ARCSINH = (x) => Math.asinh(x)
  const ARCTAN = (x) => Math.atan(x)
  const ARCTANH = (x) => Math.atanh(x)

  const ABS = (x) => Math.abs(x)
  const EXP = (x) => Math.exp(x)
  const LN = (x) => Math.log(x)
  const LOG = (x) => Math.log10(x)
  const SQRT = (x) => Math.sqrt(x)
  const MIN = (...args) => Math.min(...args)
  const MAX = (...args) => Math.max(...args)

  function VEC(x, y, z) { return { x, y, z } }
  function NORM(v) {
    const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
    if (len < 1e-10) return { x: 0, y: 0, z: 0 }
    return { x: v.x / len, y: v.y / len, z: v.z / len }
  }
  function CROSS(v1, v2) {
    return {
      x: v1.y * v2.z - v1.z * v2.y,
      y: v1.z * v2.x - v1.x * v2.z,
      z: v1.x * v2.y - v1.y * v2.x
    }
  }
  function DOT(v1, v2) { return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z }
  function SIZE(v) { return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z) }
  function TERM(v, n) { return n === 0 ? v.x : n === 1 ? v.y : n === 2 ? v.z : 0 }
  function SET(x) { return x > 0 ? 1 : x < 0 ? -1 : 0 }
  const SIGN = SET
  function scaleVec(v, s) { return { x: v.x * s, y: v.y * s, z: v.z * s } }
  function addVec(v1, v2) { return { x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z } }
  function subVec(v1, v2) { return { x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z } }
  function degrees(rad) { return rad * 180 / Math.PI }
  function radians(deg) { return deg * Math.PI / 180 }
  function isEqual1D(a, b, tol = 1e-10) { return Math.abs(a - b) < tol }
  function isEqual(v1, v2, tol = 1e-10) {
    return isEqual1D(v1.x, v2.x, tol) && isEqual1D(v1.y, v2.y, tol) && isEqual1D(v1.z, v2.z, tol)
  }
  function vec2sat(v) { return `${v.x} ${v.y} ${v.z}` }

  class V2D {
    constructor(u, v) { this.u = u; this.v = v }
  }

  // ============================================================================
  // Constants (from constants.js)
  // ============================================================================

  const TAG_CHAR = 0x02
  const TAG_SHORT = 0x03
  const TAG_LONG = 0x04
  const TAG_FLOAT = 0x05
  const TAG_DOUBLE = 0x06
  const TAG_UTF8_U8 = 0x07
  const TAG_UTF8_U16 = 0x08
  const TAG_UTF8_U32_A = 0x09
  const TAG_TRUE = 0x0A
  const TAG_FALSE = 0x0B
  const TAG_ENTITY_REF = 0x0C
  const TAG_IDENT = 0x0D
  const TAG_SUBIDENT = 0x0E
  const TAG_SUBTYPE_OPEN = 0x0F
  const TAG_SUBTYPE_CLOSE = 0x10
  const TAG_TERMINATOR = 0x11
  const TAG_UTF8_U32_B = 0x12
  const TAG_POSITION = 0x13
  const TAG_VECTOR_3D = 0x14
  const TAG_ENUM_VALUE = 0x15
  const TAG_VECTOR_2D = 0x16
  const TAG_INT64 = 0x17

  function buildBoolEnum(falseValue, trueValue, trueKey = 'T') {
    return {
      [TAG_TRUE]: trueValue, [trueKey]: trueValue, 1: trueValue,
      [TAG_FALSE]: falseValue, 'F': falseValue, 0: falseValue
    }
  }

  const RANGE = buildBoolEnum('I', 'F', 'I')
  const REFLECTION = buildBoolEnum('no_reflect', 'reflect')
  const ROTATION = buildBoolEnum('no_rotate', 'rotate')
  const SHEAR = buildBoolEnum('no_shear', 'shear')
  const SENSE = buildBoolEnum('forward', 'reversed')
  const SENSEV = buildBoolEnum('forward_v', 'reverse_v')
  const SIDES = buildBoolEnum('single', 'double')
  const SIDE = buildBoolEnum('out', 'in')
  const BOOLEAN = buildBoolEnum('F', 'T')
  const CLOSURE = { 0: 'open', 1: 'closed', 2: 'periodic', [TAG_FALSE]: 'open', [TAG_TRUE]: 'periodic' }
  const SINGULARITY = { 0: 'full', 1: 'v', 2: 'none', [TAG_FALSE]: 'none', [TAG_TRUE]: 'full' }

  const TOKEN_TRANSLATIONS = {
    '0x0a': TAG_TRUE, '0x0A': TAG_TRUE, '0x0b': TAG_FALSE, '0x0B': TAG_FALSE,
    '{': TAG_SUBTYPE_OPEN, '}': TAG_SUBTYPE_CLOSE, '#': TAG_TERMINATOR
  }

  const MIN_0 = 0.0
  const MIN_INF = -Infinity
  const MAX_2PI = 2 * Math.PI
  const MAX_INF = Infinity
  const CENTER = { x: 0, y: 0, z: 0 }
  const DIR_X = { x: 1, y: 0, z: 0 }
  const DIR_Y = { x: 0, y: 1, z: 0 }
  const DIR_Z = { x: 0, y: 0, z: 1 }

  // ============================================================================
  // Data Classes (from data-classes.js)
  // ============================================================================

  class Range {
    constructor(type, limit, scale = 1.0) {
      this.type = type
      this.limit = limit
      this.scale = scale
    }
    getLimit() { return this.type === 'I' ? this.limit : this.limit * this.scale }
    toString() { return this.type === 'I' ? 'I' : `F ${this.getLimit()}` }
  }

  class Interval {
    constructor(lower, upper) { this.lower = lower; this.upper = upper }
    getLowerLimit() { return this.lower.getLimit() }
    getUpperLimit() { return this.upper.getLimit() }
    getLimit() { return this.getUpperLimit() - this.getLowerLimit() }
    toString() { return `${this.lower} ${this.upper}` }
  }

  class BS_Curve {
    constructor(rational, periodic, degree) {
      this.poles = []
      this.uMults = []
      this.uKnots = []
      this.uPeriodic = periodic
      this.uDegree = degree
      this.weights = []
      this.rational = rational
    }
  }

  class BS_Surface extends BS_Curve {
    constructor(rational, uPeriodic, vPeriodic, uDegree, vDegree) {
      super(rational, uPeriodic, uDegree)
      this.poles = [[]]
      this.weights = [[]]
      this.vMults = []
      this.vKnots = []
      this.vPeriodic = vPeriodic
      this.vDegree = vDegree
    }
  }

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
    getPitch() { return SIZE(this.dirPitch) }
    getRadius() { return SIZE(this.dirMajor) }
    isLeftHanded() {
      const cross = CROSS(this.vecAxis, this.dirMajor)
      const angle = Math.acos(Math.max(-1, Math.min(1,
        DOT(cross, this.dirMinor) / (SIZE(cross) * SIZE(this.dirMinor))
      )))
      return angle < 0.1
    }
  }

  // ============================================================================
  // Binary Reading Helpers (from chunks.js)
  // ============================================================================

  function getUInt8(data, offset) { return [data[offset], offset + 1] }
  function getSInt16(data, offset) {
    const val = data[offset] | (data[offset + 1] << 8)
    return [val > 32767 ? val - 65536 : val, offset + 2]
  }
  function getUInt32(data, offset) {
    return [(data[offset] | (data[offset + 1] << 8) | (data[offset + 2] << 16) | (data[offset + 3] << 24)) >>> 0, offset + 4]
  }
  function getSInt32(data, offset) {
    return [data[offset] | (data[offset + 1] << 8) | (data[offset + 2] << 16) | (data[offset + 3] << 24), offset + 4]
  }
  function getUInt64(data, offset) {
    const lo = getUInt32(data, offset)[0]
    const hi = getUInt32(data, offset + 4)[0]
    return [hi * 0x100000000 + lo, offset + 8]
  }
  function getSInt64(data, offset) {
    const lo = getUInt32(data, offset)[0]
    const hi = getSInt32(data, offset + 4)[0]
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
  // Chunk Classes (from chunks.js)
  // ============================================================================

  class AcisChunk {
    constructor(tag, val) { this.tag = tag; this.val = val; this.value = val }
    read(data, offset) { return offset }
    toString() { return String(this.val) }
  }

  class AcisChunkChar extends AcisChunk {
    constructor(val) { super(TAG_CHAR, val) }
    read(data, offset) { [this.val, offset] = getUInt8(data, offset); this.value = this.val; return offset }
  }
  class AcisChunkShort extends AcisChunk {
    constructor(val) { super(TAG_SHORT, val) }
    read(data, offset) { [this.val, offset] = getSInt16(data, offset); this.value = this.val; return offset }
  }
  class AcisChunkLong extends AcisChunk {
    constructor(val) { super(TAG_LONG, val) }
    read(data, offset) { [this.val, offset] = getSInt32(data, offset); this.value = this.val; return offset }
  }
  class AcisChunkInt64 extends AcisChunk {
    constructor(val) { super(TAG_INT64, val) }
    read(data, offset) { [this.val, offset] = getSInt64(data, offset); this.value = this.val; return offset }
  }
  class AcisChunkFloat extends AcisChunk {
    constructor(val) { super(TAG_FLOAT, val) }
    read(data, offset) { [this.val, offset] = getFloat32(data, offset); this.value = this.val; return offset }
  }
  class AcisChunkDouble extends AcisChunk {
    constructor(val) { super(TAG_DOUBLE, val) }
    read(data, offset) { [this.val, offset] = getFloat64(data, offset); this.value = this.val; return offset }
  }
  class AcisChunkUtf8U8 extends AcisChunk {
    constructor(val) { super(TAG_UTF8_U8, val) }
    read(data, offset) {
      const [len, o1] = getUInt8(data, offset)
      const bytes = data.slice(o1, o1 + len)
      this.val = new TextDecoder().decode(bytes)
      this.value = this.val
      return o1 + len
    }
  }
  class AcisChunkUtf8U16 extends AcisChunk {
    constructor(val) { super(TAG_UTF8_U16, val) }
    read(data, offset) {
      const [len, o1] = getSInt16(data, offset)
      const bytes = data.slice(o1, o1 + Math.abs(len))
      this.val = new TextDecoder().decode(bytes)
      this.value = this.val
      return o1 + Math.abs(len)
    }
  }
  class AcisChunkUtf8U32A extends AcisChunk {
    constructor(val) { super(TAG_UTF8_U32_A, val) }
    read(data, offset) {
      const [len, o1] = getUInt32(data, offset)
      const bytes = data.slice(o1, o1 + len)
      this.val = new TextDecoder().decode(bytes)
      this.value = this.val
      return o1 + len
    }
  }
  class AcisChunkUtf8U32B extends AcisChunkUtf8U32A {
    constructor(val) { super(val); this.tag = TAG_UTF8_U32_B }
  }
  class AcisChunkIdent extends AcisChunkUtf8U8 {
    constructor(val) { super(val); this.tag = TAG_IDENT }
  }
  class AcisChunkSubIdent extends AcisChunkUtf8U8 {
    constructor(val) { super(val); this.tag = TAG_SUBIDENT }
  }
  class AcisChunkEntityRef extends AcisChunk {
    constructor(val) {
      super(TAG_ENTITY_REF, val)
      this.record = null
      this.entity = null
      this.type = 'entity_ref'
      this.id = val
    }
    toString() { return `$${this.val}` }
  }
  class AcisChunkEnumValue extends AcisChunk {
    constructor(tag, val, values) { super(tag, val); this.values = values; this.type = 'enum' }
    read(data, offset) {
      const [idx, o1] = getUInt8(data, offset)
      this.val = this.values[idx]
      this.value = this.val
      return o1
    }
    toString() { return this.val }
  }
  class AcisChunkPosition extends AcisChunk {
    constructor(scale = 1.0) { super(TAG_POSITION, null); this.scale = scale; this.type = 'position' }
    read(data, offset) {
      const [x, o1] = getFloat64(data, offset)
      const [y, o2] = getFloat64(data, o1)
      const [z, o3] = getFloat64(data, o2)
      this.val = { x: x * this.scale, y: y * this.scale, z: z * this.scale }
      this.value = this.val
      return o3
    }
    toString() { return `(${this.val.x} ${this.val.y} ${this.val.z})` }
  }
  class AcisChunkVector3D extends AcisChunk {
    constructor() { super(TAG_VECTOR_3D, null); this.type = 'vector3d' }
    read(data, offset) {
      const [x, o1] = getFloat64(data, offset)
      const [y, o2] = getFloat64(data, o1)
      const [z, o3] = getFloat64(data, o2)
      this.val = { x, y, z }
      this.value = this.val
      return o3
    }
    toString() { return `(${this.val.x} ${this.val.y} ${this.val.z})` }
  }
  class AcisChunkVector2D extends AcisChunk {
    constructor() { super(TAG_VECTOR_2D, null); this.type = 'vector2d' }
    read(data, offset) {
      const [u, o1] = getFloat64(data, offset)
      const [v, o2] = getFloat64(data, o1)
      this.val = { u, v }
      this.value = this.val
      return o2
    }
  }
  class AcisChunkSubtypeOpen extends AcisChunk {
    constructor() { super(TAG_SUBTYPE_OPEN, '{') }
    toString() { return '{' }
  }
  class AcisChunkSubtypeClose extends AcisChunk {
    constructor() { super(TAG_SUBTYPE_CLOSE, '}') }
    toString() { return '}' }
  }
  class AcisChunkTerminator extends AcisChunk {
    constructor() { super(TAG_TERMINATOR, '#') }
    toString() { return '#' }
  }

  const ACIS_REF_NONE = new AcisChunkEntityRef(-1)
  ACIS_REF_NONE.record = null

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

  function createChunk(tag, data, offset, scale = 1.0) {
    if (tag === TAG_TRUE) return [new AcisChunkEnumValue(TAG_TRUE, true, BOOLEAN), offset]
    if (tag === TAG_FALSE) return [new AcisChunkEnumValue(TAG_FALSE, false, BOOLEAN), offset]
    if (tag === TAG_ENTITY_REF) {
      const [val, o1] = getSInt64(data, offset)
      return [new AcisChunkEntityRef(val), o1]
    }
    if (tag === TAG_ENUM_VALUE) {
      const chunk = new AcisChunkUtf8U8()
      const o1 = chunk.read(data, offset)
      chunk.tag = TAG_ENUM_VALUE
      chunk.type = 'enum'
      return [chunk, o1]
    }
    if (tag === TAG_POSITION) {
      const chunk = new AcisChunkPosition(scale)
      return [chunk, chunk.read(data, offset)]
    }
    const ChunkClass = ACIS_VALUE_CHUNKS[tag]
    if (ChunkClass) {
      const chunk = new ChunkClass()
      return [chunk, chunk.read(data, offset)]
    }
    throw new Error(`Unknown ACIS tag: 0x${tag.toString(16)}`)
  }

  // ============================================================================
  // Utils (from utils.js)
  // ============================================================================

  let _reader = null
  function setReader(r) { _reader = r }
  function getReader() { return _reader }
  function getScale() { return _reader ? _reader.scale : 1.0 }
  function getVersion() { return _reader ? _reader.version : 7.0 }
  function isASM() { return _reader && _reader.header && _reader.header.asm !== undefined }
  function getAsmMajor() { return _reader && _reader.header && _reader.header.asm ? _reader.header.asm[0] : 0 }

  function getValue(chunks, index) {
    const chunk = chunks[index]
    return [chunk.val !== undefined ? chunk.val : chunk.value, index + 1]
  }
  function getRefNode(record, index, expectedName = null) {
    const chunk = record.chunks[index]
    if (chunk.tag === TAG_ENTITY_REF || chunk.type === 'entity_ref') {
      return [chunk.record || chunk, index + 1]
    }
    throw new Error(`Chunk at index=${index} is not a reference`)
  }
  function getBoolean(chunks, index) {
    const chunk = chunks[index]
    if (chunk.tag === TAG_UTF8_U8 || chunk.type === 'string') return [chunk.val === 'T', index + 1]
    if (chunk.tag === TAG_TRUE || chunk.value === true) return [true, index + 1]
    if (chunk.tag === TAG_FALSE || chunk.value === false) return [false, index + 1]
    return [!!chunk.val, index + 1]
  }
  function getInteger(chunks, index) {
    const [val, i] = getValue(chunks, index)
    return [parseInt(val, 10), i]
  }
  function getFloat(chunks, index) {
    const [val, i] = getValue(chunks, index)
    return [parseFloat(val), i]
  }
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
        if (v.x !== undefined) { arr.push(v.x, v.y, v.z); n += 3 }
        else if (Array.isArray(v)) { arr.push(...v); n += v.length }
      } else {
        arr.push(parseFloat(chunk.val !== undefined ? chunk.val : chunk.value))
        n++
      }
    }
    return [arr, i]
  }
  function getFloatArray(chunks, index) {
    const [n, i1] = getInteger(chunks, index)
    const [arr, i2] = getFloats(chunks, i1, n)
    return [arr, i2]
  }
  function getLength(chunks, index) {
    const [l, i] = getFloat(chunks, index)
    return [l * getScale(), i]
  }
  function getText(chunks, index) {
    const chunk = chunks[index]
    if (chunk.tag === TAG_DOUBLE) return getValue(chunks, index + 1)
    return getValue(chunks, index)
  }
  function getEnumByTag(chunks, index, values) {
    const chunk = chunks[index]
    let val = chunk.val !== undefined ? chunk.val : chunk.value
    if (chunk.tag === TAG_UTF8_U8 || chunk.type === 'string') {
      for (const key of Object.keys(values)) {
        if (values[key] === val) return [val, index + 1]
      }
      return [val, index + 1]
    }
    if (chunk.tag === TAG_TRUE || chunk.value === true) return [values[TAG_TRUE] || values['T'] || values[1], index + 1]
    if (chunk.tag === TAG_FALSE || chunk.value === false) return [values[TAG_FALSE] || values['F'] || values[0], index + 1]
    if (values[val] !== undefined) return [values[val], index + 1]
    return [val, index + 1]
  }
  function getEnumByValue(chunks, index, values) {
    const chunk = chunks[index]
    const val = chunk.val !== undefined ? chunk.val : chunk.value
    if (values[val] !== undefined) return [values[val], index + 1]
    return [val, index + 1]
  }
  function getSingularity(chunks, index) {
    if (getVersion() > 4.0) return getEnumByValue(chunks, index, SINGULARITY)
    return ['full', index]
  }
  function getPoint(chunks, index) {
    const chunk = chunks[index]
    if (chunk.tag === TAG_POSITION || chunk.tag === TAG_VECTOR_3D ||
        chunk.type === 'position' || chunk.type === 'vector3d') {
      const v = chunk.val || chunk.value
      if (v.x !== undefined) return [{ x: v.x, y: v.y, z: v.z }, index + 1]
      return [{ x: v[0], y: v[1], z: v[2] }, index + 1]
    }
    const [x, i1] = getFloat(chunks, index)
    const [y, i2] = getFloat(chunks, i1)
    const [z, i3] = getFloat(chunks, i2)
    return [{ x, y, z }, i3]
  }
  function getVector(chunks, index) { return getPoint(chunks, index) }
  function getLocation(chunks, index) {
    const [p, i] = getPoint(chunks, index)
    const s = getScale()
    return [{ x: p.x * s, y: p.y * s, z: p.z * s }, i]
  }
  function getRange(chunks, index, defaultVal, scale) {
    const [type, i] = getEnumByTag(chunks, index, RANGE)
    if (type === 'F' || type === TAG_FALSE) {
      const [v, i2] = getFloat(chunks, i)
      return [new Range(type, v, scale), i2]
    } else if (type === 'T') {
      const [arr, i2] = getFloats(chunks, i, 7)
      return [new Range(type, arr[0], scale), i2]
    }
    return [new Range(type, defaultVal, scale), i]
  }
  function getInterval(chunks, index, defMin, defMax, scale) {
    const [lower, i1] = getRange(chunks, index, defMin, scale)
    const [upper, i2] = getRange(chunks, i1, defMax, scale)
    return [new Interval(lower, upper), i2]
  }

  // ============================================================================
  // Entity Base Class (from entity.js)
  // ============================================================================

  class Entity {
    constructor() {
      this.record = null
      this.index = -1
      this._attrib = null
      this._readyToBuild = true
      this.shape = null
    }
    getType() { return this.record ? this.record.name : this.constructor.name }
    getSatText() { return this.record ? this.record.chunks.map(c => c.toString()).join(' ') : '' }
    getRef(chunk) { return chunk && chunk.record && chunk.record.entity ? chunk.record.entity : null }
    set(record) {
      let i = 0
      if (record.chunks.length > 0) {
        const firstChunk = record.chunks[0]
        if (firstChunk.tag === TAG_ENTITY_REF || firstChunk.type === 'entity_ref') {
          [this._attrib, i] = getRefNode(record, 0, 'attrib')
        }
      }
      return i
    }
    getAttrib() { return this._attrib ? this._attrib.entity : null }
    build() { return this.shape }
    toString() { return `${this.getType()} [${this.index}]` }
  }

  class Transform extends Entity {
    constructor() {
      super()
      this.matrix = [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]
      this.reflect = false
      this.rotation = false
      this.shear = false
      this.scale = 1.0
    }
    set(record) {
      let i = super.set(record)
      const [row1, i1] = getFloats(record.chunks, i, 3)
      const [row2, i2] = getFloats(record.chunks, i1, 3)
      const [row3, i3] = getFloats(record.chunks, i2, 3)
      this.matrix[0][0] = row1[0]; this.matrix[0][1] = row1[1]; this.matrix[0][2] = row1[2]
      this.matrix[1][0] = row2[0]; this.matrix[1][1] = row2[1]; this.matrix[1][2] = row2[2]
      this.matrix[2][0] = row3[0]; this.matrix[2][1] = row3[1]; this.matrix[2][2] = row3[2]
      const [translation, i4] = getLocation(record.chunks, i3)
      this.matrix[0][3] = translation.x
      this.matrix[1][3] = translation.y
      this.matrix[2][3] = translation.z
      let i5 = i4
      ;[this.scale, i5] = getFloat(record.chunks, i5)
      ;[this.reflect, i5] = getBoolean(record.chunks, i5)
      ;[this.rotation, i5] = getBoolean(record.chunks, i5)
      ;[this.shear, i5] = getBoolean(record.chunks, i5)
      return i5
    }
    transformPoint(point) {
      const x = this.matrix[0][0]*point.x + this.matrix[0][1]*point.y + this.matrix[0][2]*point.z + this.matrix[0][3]
      const y = this.matrix[1][0]*point.x + this.matrix[1][1]*point.y + this.matrix[1][2]*point.z + this.matrix[1][3]
      const z = this.matrix[2][0]*point.x + this.matrix[2][1]*point.y + this.matrix[2][2]*point.z + this.matrix[2][3]
      return { x, y, z }
    }
  }

  class Wcs extends Entity {
    constructor() { super(); this._transform = null }
    set(record) { let i = super.set(record); [this._transform, i] = getRefNode(record, i, 'transform'); return i }
    getTransform() { return this._transform ? this._transform.entity : null }
  }

  class T extends Entity {
    constructor() { super() }
    set(record) { return 0 }
  }

  class EyeRefinement extends Entity {}
  class VertexTemplate extends Entity {
    constructor() { super(); this.position = { x: 0, y: 0, z: 0 } }
    set(record) { let i = super.set(record); [this.position, i] = getLocation(record.chunks, i); return i }
  }
  class Annotation extends Entity {}
  class AnnotationPrimitive extends Annotation {}
  class AnnotationSplit extends Annotation {}
  class AnnotationTol extends Annotation {}
  class AnnotationTolCreate extends AnnotationTol {}
  class AnnotationTolRevert extends AnnotationTol {}

  class Point extends Entity {
    constructor() { super(); this.position = { x: 0, y: 0, z: 0 } }
    set(record) {
      let i = super.set(record)
      if (getVersion() > 10.0 && !isASM()) i += 1
      if (getVersion() > 6.0) { const [anyRef, i2] = getRefNode(record, i, null); i = i2 }
      ;[this.position, i] = getLocation(record.chunks, i)
      return i
    }
    getPosition() { return this.position }
  }

  class Refinement extends Entity {}
  class RhEntity extends Entity {}
  class RhEntityRhMaterial extends RhEntity {}

  class AsmHeader extends Entity {
    static getVersion = (str) => {
      const match = str.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/)
      return match ? [match[1], match[2], match[3], match[4]].map(Number) : null
    }
    constructor() { super(); this.version = '7.0'; this.major = 7; this.minor = 0; this.revision = 0; this.build = 0 }
    set(record) {
      let i = super.set(record)
      const [version, i2] = getText(record.chunks, i)
      const v = AsmHeader.getVersion(version)
      if (v) { this.major = v[0]; this.minor = v[1]; this.revision = v[2]; this.build = v[3] }
      return i2
    }
  }

  // ============================================================================
  // Topology Classes (from topology.js)
  // ============================================================================

  class Topology extends Entity {}

  class Body extends Topology {
    constructor() { super(); this._lump = null; this._wire = null; this._transform = null }
    set(record) {
      let i = super.set(record)
      ;[this._lump, i] = getRefNode(record, i, 'lump')
      ;[this._wire, i] = getRefNode(record, i, 'wire')
      ;[this._transform, i] = getRefNode(record, i, 'transform')
      return i
    }
    getLump() { return this._lump ? this._lump.entity : null }
    getWire() { return this._wire ? this._wire.entity : null }
    getTransform() { return this._transform ? this._transform.entity : null }
    getLumps() {
      const lumps = []
      let lump = this.getLump()
      while (lump) { lumps.push(lump); lump = lump.getNext() }
      return lumps
    }
    build() { if (this._readyToBuild) { this._readyToBuild = false } return this.shape }
  }

  class Lump extends Topology {
    constructor() { super(); this._next = null; this._shell = null; this._owner = null }
    set(record) {
      let i = super.set(record)
      ;[this._next, i] = getRefNode(record, i, 'lump')
      ;[this._shell, i] = getRefNode(record, i, 'shell')
      ;[this._owner, i] = getRefNode(record, i, 'body')
      return i
    }
    getNext() { return this._next ? this._next.entity : null }
    getShell() { return this._shell ? this._shell.entity : null }
    getParent() { return this._owner ? this._owner.entity : null }
    getShells() {
      const shells = []
      let shell = this.getShell()
      while (shell) { shells.push(shell); shell = shell.getNext() }
      return shells
    }
    build() { if (this._readyToBuild) { this._readyToBuild = false } return this.shape }
  }

  class Shell extends Topology {
    constructor() { super(); this._next = null; this._subshell = null; this._face = null; this._wire = null; this._owner = null }
    set(record) {
      let i = super.set(record)
      ;[this._next, i] = getRefNode(record, i, 'shell')
      ;[this._subshell, i] = getRefNode(record, i, 'subshell')
      ;[this._face, i] = getRefNode(record, i, 'face')
      ;[this._wire, i] = getRefNode(record, i, 'wire')
      ;[this._owner, i] = getRefNode(record, i, 'lump')
      return i
    }
    getNext() { return this._next ? this._next.entity : null }
    getFace() { return this._face ? this._face.entity : null }
    getParent() { return this._owner ? this._owner.entity : null }
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
    build() { if (this._readyToBuild) { this._readyToBuild = false } return this.shape }
  }

  class SubShell extends Topology {
    constructor() { super(); this._next = null; this._child = null; this._face = null; this._wire = null; this._owner = null }
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

  class Face extends Topology {
    constructor() {
      super()
      this._next = null; this._loop = null; this._shell = null; this._subshell = null; this._surface = null
      this.sense = 'forward'; this.sides = 'single'; this.side = null; this.containment = null
    }
    set(record) {
      let i = super.set(record)
      ;[this._next, i] = getRefNode(record, i, 'face')
      ;[this._loop, i] = getRefNode(record, i, 'loop')
      ;[this._shell, i] = getRefNode(record, i, 'shell')
      ;[this._subshell, i] = getRefNode(record, i, 'subshell')
      ;[this._surface, i] = getRefNode(record, i, 'surface')
      ;[this.sense, i] = getEnumByTag(record.chunks, i, SENSE)
      const [sides, i2] = getEnumByTag(record.chunks, i, SIDES)
      this.sides = sides; i = i2
      if (sides === 'double') { [this.side, i] = getEnumByTag(record.chunks, i, SIDE) }
      if (getVersion() > 5.0) { [this.containment, i] = getEnumByTag(record.chunks, i, { 0: 'unset', 1: 'set' }) }
      return i
    }
    getNext() { return this._next ? this._next.entity : null }
    getLoop() { return this._loop ? this._loop.entity : null }
    getSurface() { return this._surface ? this._surface.entity : null }
    getParent() { return this._shell ? this._shell.entity : null }
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
    build() { if (this._readyToBuild) { this._readyToBuild = false } return this.shape }
  }

  class Loop extends Topology {
    constructor() { super(); this._next = null; this._coedge = null; this._face = null }
    set(record) {
      let i = super.set(record)
      ;[this._next, i] = getRefNode(record, i, 'loop')
      ;[this._coedge, i] = getRefNode(record, i, 'coedge')
      ;[this._face, i] = getRefNode(record, i, 'face')
      return i
    }
    getNext() { return this._next ? this._next.entity : null }
    getCoedge() { return this._coedge ? this._coedge.entity : null }
    getParent() { return this._face ? this._face.entity : null }
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
    build() { if (this._readyToBuild) { this._readyToBuild = false } return this.shape }
  }

  class Wire extends Topology {
    constructor() { super(); this._next = null; this._coedge = null; this._owner = null }
    set(record) {
      let i = super.set(record)
      ;[this._next, i] = getRefNode(record, i, 'wire')
      ;[this._coedge, i] = getRefNode(record, i, 'coedge')
      ;[this._owner, i] = getRefNode(record, i, null)
      return i
    }
    getNext() { return this._next ? this._next.entity : null }
    getCoedge() { return this._coedge ? this._coedge.entity : null }
  }

  class CoEdge extends Topology {
    constructor() {
      super()
      this._next = null; this._previous = null; this._partner = null
      this._edge = null; this._owner = null; this._pcurve = null
      this.sense = 'forward'
    }
    set(record) {
      let i = super.set(record)
      ;[this._next, i] = getRefNode(record, i, 'coedge')
      ;[this._previous, i] = getRefNode(record, i, 'coedge')
      ;[this._partner, i] = getRefNode(record, i, 'coedge')
      ;[this._edge, i] = getRefNode(record, i, 'edge')
      ;[this.sense, i] = getEnumByTag(record.chunks, i, SENSE)
      ;[this._owner, i] = getRefNode(record, i, null)
      if (i < record.chunks.length && record.chunks[i].tag === TAG_ENTITY_REF) {
        [this._pcurve, i] = getRefNode(record, i, 'pcurve')
      }
      return i
    }
    getNext() { return this._next ? this._next.entity : null }
    getPrevious() { return this._previous ? this._previous.entity : null }
    getPartner() { return this._partner ? this._partner.entity : null }
    getEdge() { return this._edge ? this._edge.entity : null }
    getParent() { return this._owner ? this._owner.entity : null }
    build() {
      if (this._readyToBuild) {
        this._readyToBuild = false
        const edge = this.getEdge()
        if (edge) { this.shape = edge.build() }
      }
      return this.shape
    }
  }

  class CoEdgeTolerance extends CoEdge {
    constructor() { super(); this.tolerance = 0.0 }
    set(record) { let i = super.set(record); [this.tolerance, i] = getFloat(record.chunks, i); return i }
  }

  class Edge extends Topology {
    constructor() {
      super()
      this._start = null; this._end = null; this._owner = null; this._curve = null
      this.sense = 'forward'
    }
    set(record) {
      let i = super.set(record)
      ;[this._start, i] = getRefNode(record, i, 'vertex')
      if (getAsmMajor() > 217) i += 1
      ;[this._end, i] = getRefNode(record, i, 'vertex')
      ;[this._owner, i] = getRefNode(record, i, 'coedge')
      ;[this._curve, i] = getRefNode(record, i, 'curve')
      ;[this.sense, i] = getEnumByTag(record.chunks, i, SENSE)
      return i
    }
    getStart() { const v = this._start ? this._start.entity : null; return v ? v.getPosition() : null }
    getEnd() { const v = this._end ? this._end.entity : null; return v ? v.getPosition() : null }
    getCurve() { return this._curve ? this._curve.entity : null }
    getPoints() {
      const points = []
      const ptStart = this._start ? this._start.entity : null
      if (ptStart) points.push(ptStart.getPosition())
      const ptEnd = this._end ? this._end.entity : null
      if (ptEnd && ptEnd.index !== (ptStart ? ptStart.index : -1)) points.push(ptEnd.getPosition())
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
        }
      }
      return this.shape
    }
  }

  class EdgeTolerance extends Edge {
    constructor() { super(); this.tolerance = 0.0 }
  }

  class Vertex extends Topology {
    constructor() { super(); this._owner = null; this._point = null; this.count = -1 }
    set(record) {
      let i = super.set(record)
      ;[this._owner, i] = getRefNode(record, i, 'edge')
      if (getAsmMajor() > 217) i += 1
      if (record.chunks[i] && record.chunks[i].tag !== TAG_ENTITY_REF) i += 1
      ;[this._point, i] = getRefNode(record, i, 'point')
      return i
    }
    getParent() { return this._owner ? this._owner.entity : null }
    getPoint() { return this._point ? this._point.entity : null }
    getPosition() { const p = this.getPoint(); return p ? p.position : null }
  }

  class VertexTolerance extends Vertex {
    constructor() { super(); this.tolerance = 0.0 }
    set(record) {
      let i = super.set(record)
      ;[this.tolerance, i] = getFloat(record.chunks, i)
      if (getAsmMajor() > 217) i += 2
      return i
    }
  }

  class Cell extends Topology {}
  class Cell3d extends Cell {}
  class CFace extends Topology {}
  class CShell extends Topology {}

  // ============================================================================
  // Curve Classes (from curves.js)
  // ============================================================================

  class Geometry extends Entity {
    constructor(name) { super(); this.__name__ = name }
    set(record) {
      let i = super.set(record)
      if (getVersion() > 10.0 && !isASM()) i += 1
      if (getVersion() > 6.0) { const [anyRef, i2] = getRefNode(record, i, null); i = i2 }
      return i
    }
  }

  class Curve extends Geometry {
    constructor(name) { super(name); this.shape = null }
    setSubtype(chunks, index) { return index }
    set(record) { let i = super.set(record); i = this.setSubtype(record.chunks, i); return i }
    build(start, end) {
      if (this._readyToBuild) {
        this._readyToBuild = false
        if (start && end) { this.shape = { type: 'line', start, end } }
      }
      return this.shape
    }
  }

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
        const p2 = end || { x: this.origin.x + this.direction.x, y: this.origin.y + this.direction.y, z: this.origin.z + this.direction.z }
        this.shape = { type: 'line', origin: this.origin, direction: this.direction, start: p1, end: p2 }
      }
      return this.shape
    }
  }

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
    isCircle() { return Math.abs(this.ratio - 1.0) < 1e-6 }
    getMajorRadius() { return Math.sqrt(this.major.x ** 2 + this.major.y ** 2 + this.major.z ** 2) }
    getMinorRadius() { return this.getMajorRadius() * this.ratio }
    build(start, end) {
      if (this._readyToBuild) {
        this._readyToBuild = false
        this.shape = {
          type: this.isCircle() ? 'circle' : 'ellipse',
          center: this.center, axis: this.axis, major: this.major,
          majorRadius: this.getMajorRadius(), minorRadius: this.getMinorRadius(),
          ratio: this.ratio, range: this.range, start, end
        }
      }
      return this.shape
    }
  }

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
    build(start, end) { this.shape = { type: 'point', position: this.start }; return this.shape }
  }

  class CurveComp extends Curve {
    constructor() { super('compcurv'); this.curves = [] }
  }

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
      this.helix = null
    }
    setSubtype(chunks, index) {
      if (index >= chunks.length) return index
      const chunk = chunks[index]
      const val = chunk.val || chunk.value
      if (chunk.tag === TAG_UTF8_U8 || chunk.tag === TAG_IDENT || chunk.tag === TAG_SUBIDENT) {
        return this._parseSubtype(chunks, index, val)
      }
      return index
    }
    _parseSubtype(chunks, index, subtype) {
      let i = index + 1
      this.subtype = subtype
      if (subtype === 'helix_int_cur') return this.setHelix(chunks, i)
      return this.setCurve(chunks, i)
    }
    setCurve(chunks, index) {
      let i = index
      ;[this.singularity, i] = getSingularity(chunks, i)
      if (this.singularity === 'full') {
        [this.tolerance, i] = getLength(chunks, i)
      } else if (this.singularity === 'none') {
        [this.range, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())
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
      this.shape = { type: 'helix', helix: this.helix }
      this._readyToBuild = false
      return i
    }
    build(start, end) {
      if (this._readyToBuild) {
        this._readyToBuild = false
        if (this.helix) { this.shape = { type: 'helix', helix: this.helix, start, end } }
        else if (this.spline) { this.shape = { type: 'bspline_curve', spline: this.spline, start, end } }
        else if (start && end) { this.shape = { type: 'line', start, end } }
      }
      return this.shape
    }
  }

  class CurveIntInt extends CurveInt {
    constructor() { super('intcurve-') }
  }

  class CurveP extends Geometry {
    constructor() {
      super('pcurve')
      this._surface = null
      this._curve = null
      this.range = new Interval(new Range('I', MIN_INF), new Range('I', MAX_INF))
    }
    set(record) {
      let i = super.set(record)
      ;[this._surface, i] = getRefNode(record, i, 'surface')
      return i
    }
    getSurface() { return this._surface ? this._surface.entity : null }
  }

  // ============================================================================
  // Surface Classes (from surfaces.js)
  // ============================================================================

  class Surface extends Geometry {
    constructor(name) { super(name); this.shape = null }
    setSubtype(chunks, index) { return index }
    set(record) { let i = super.set(record); i = this.setSubtype(record.chunks, i); return i }
    build(face = null) { console.warn(`Surface '${this.constructor.name}' build() not implemented`); return this.shape }
  }

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
        this.shape = { type: 'plane', origin: this.origin, normal: this.normal, uDir: this.uDir }
      }
      return this.shape
    }
  }

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
    getMinorRadius() { return this.majorRadius * this.ratio }
    isCircular() { return Math.abs(this.ratio - 1.0) < 1e-6 }
    build(face = null) {
      if (this._readyToBuild) {
        this._readyToBuild = false
        this.shape = {
          type: 'cone', center: this.center, axis: this.axis,
          majorRadius: this.majorRadius, minorRadius: this.getMinorRadius(),
          semiAngle: this.semiAngle, uvOrigin: this.uvOrigin
        }
      }
      return this.shape
    }
  }

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
        this.shape = { type: 'sphere', center: this.center, radius: this.radius }
      }
      return this.shape
    }
  }

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
          type: 'torus', center: this.center, axis: this.axis,
          majorRadius: Math.abs(this.major), minorRadius: Math.abs(this.minor)
        }
      }
      return this.shape
    }
  }

  class SurfaceMesh extends Surface {
    constructor() { super('meshsurf'); this.vertices = []; this.faces = [] }
    build(face = null) {
      if (this._readyToBuild) {
        this._readyToBuild = false
        this.shape = { type: 'mesh', vertices: this.vertices, faces: this.faces }
      }
      return this.shape
    }
  }

  class SurfaceSpline extends Surface {
    constructor() {
      super('spline')
      this.surface = null
      this.spline = null
      this.tolerance = 0.0
      this.sense = 'forward'
      this.subtype = 'spl_sur'
    }
    setSubtype(chunks, index) {
      if (index >= chunks.length) return index
      const chunk = chunks[index]
      const val = chunk.val || chunk.value
      if (val === 'forward' || val === 'reversed') {
        this.sense = val
        return index + 1
      }
      return index
    }
    build(face = null) {
      if (this._readyToBuild) {
        this._readyToBuild = false
        if (this.spline) { this.shape = { type: 'bspline_surface', spline: this.spline } }
        else if (this.surface && typeof this.surface.build === 'function') { this.shape = this.surface.build() }
        else { this.shape = { type: 'spline_surface', subtype: this.subtype } }
      }
      return this.shape
    }
  }

  // ============================================================================
  // Attributes (simplified from attributes.js)
  // ============================================================================

  class Attrib extends Entity {
    constructor() { super(); this._next = null; this._owner = null }
    set(record) {
      let i = super.set(record)
      ;[this._next, i] = getRefNode(record, i, 'attrib')
      ;[this._owner, i] = getRefNode(record, i, null)
      return i
    }
    getOwner() { return this._owner ? this._owner.entity : null }
    getNext() { return this._next ? this._next.entity : null }
  }

  // Simplified attribute classes (stubs)
  class Attributes extends Attrib {}
  class AttribADesk extends Attrib {}
  class AttribADeskColor extends AttribADesk {}
  class AttribADeskMaterial extends AttribADesk {}
  class AttribADeskTrueColor extends AttribADesk {}
  class AttribAnsoft extends Attrib {}
  class AttribAnsoftId extends AttribAnsoft {}
  class AttribAnsoftProperties extends AttribAnsoft {}
  class AttribBt extends Attrib {}
  class AttribBtEntityColor extends AttribBt {}
  class AttribGen extends Attrib {}
  class AttribGenName extends AttribGen {}
  class AttribGenNameInt32 extends AttribGenName {}
  class AttribGenNameInt64 extends AttribGenName {}
  class AttribGenNameString extends AttribGenName {}
  class AttribGenNameReal extends AttribGenName {}
  class AttribGenNameVector extends AttribGenName {}
  class AttribSt extends Attrib {}
  class AttribStNoMerge extends AttribSt {}
  class AttribStNoCombine extends AttribSt {}
  class AttribStRgbColor extends AttribSt {
    constructor() { super(); this.color = { r: 0.5, g: 0.5, b: 0.5 } }
    set(record) {
      let i = super.set(record)
      try {
        const [r, i2] = getFloat(record.chunks, i)
        const [g, i3] = getFloat(record.chunks, i2)
        const [b, i4] = getFloat(record.chunks, i3)
        this.color = { r, g, b }
        i = i4
      } catch (e) {}
      return i
    }
  }
  class AttribStDisplay extends AttribSt {}
  class AttribStId extends AttribSt {}
  class AttribSys extends Attrib {}
  class AttribSysConvexity extends AttribSys {}
  class AttribSysAnnotationAttrib extends AttribSys {}
  class AttribSysStichHint extends AttribSys {}
  class AttribSysTag extends AttribSys {}
  class AttribSysVertedge extends AttribSys {}
  class AttribTsl extends Attrib {}
  class AttribTslId extends AttribTsl {}
  class AttribTslColour extends AttribTsl {}
  class AttribAtUfld extends Attrib {}
  class AttribAtUfldDefmData extends AttribAtUfld {}
  class AttribAtUfldDevPair extends AttribAtUfld {}
  class AttribAtUfldFlatBend extends AttribAtUfld {}
  class AttribAtUfldFfldPosTransf extends AttribAtUfld {}
  class AttribAtUfldFfldPosTransfMixUfContourRollTrack extends AttribAtUfldFfldPosTransf {}
  class AttribAtUfldFfldPosTransfMixUfTransformTrack extends AttribAtUfldFfldPosTransf {}
  class AttribAtUfldNonMergeBend extends AttribAtUfld {}
  class AttribAtUfldPosTrack extends AttribAtUfld {}
  class AttribAtUfldPosTrackMixUfRobustPositionTrack extends AttribAtUfldPosTrack {}
  class AttribAtUfldPosTrackSurfSimp extends AttribAtUfldPosTrack {}
  class AttribAcadSolidHistoryPersubent extends Attrib {}
  class AttribCwkBase extends Attrib {}
  class AttribCwkBaseCswDbid extends AttribCwkBase {}
  class AttribCustom extends Attrib {}
  class AttribDesigner extends Attrib {}
  class AttribDesignerHistory extends AttribDesigner {}
  class AttribDesignerSurfaceId extends AttribDesigner {}
  class AttribDesignerOwnerTag extends AttribDesigner {}
  class AttribDxid extends Attrib {}
  class AttribEye extends Attrib {}
  class AttribEyeFMesh extends AttribEye {}
  class AttribEyePtList extends AttribEye {}
  class AttribEyeRefVt extends AttribEye {}
  class AttribFdi extends Attrib {}
  class AttribFdiLabel extends AttribFdi {}
  class AttribKcId extends Attrib {}
  class AttribLwd extends Attrib {}
  class AttribLwdFMesh extends AttribLwd {}
  class AttribLwdPtList extends AttribLwd {}
  class AttribLwdRefVT extends AttribLwd {}
  class AttribMixOrganization extends Attrib {}
  class AttribNamingMatching extends Attrib {}
  class AttribNamingMatchingNMxBrepTag extends AttribNamingMatching {}
  class AttribNamingMatchingNMxBrepTagFeature extends AttribNamingMatchingNMxBrepTag {}
  class AttribNamingMatchingNMxBrepTagName extends AttribNamingMatchingNMxBrepTag {}
  class AttribRBase extends Attrib {}
  class AttribRBaseRender extends AttribRBase {}
  class AttribRfBase extends Attrib {}
  class AttribRfBaseFaceTracker extends AttribRfBase {}
  class AttribSg extends Attrib {}
  class AttribSgPidName extends AttribSg {}
  class AttribSnl extends Attrib {}
  class AttribSnlCubitOwner extends AttribSnl {}
  class AttribCt extends Attrib {}
  class AttribCtCellPtr extends AttribCt {}
  class AttribCtCFace extends AttribCt {}

  function extractColor(entity) {
    let attrib = entity.getAttrib ? entity.getAttrib() : null
    while (attrib) {
      if (attrib instanceof AttribStRgbColor) return attrib.color
      if (attrib instanceof AttribADeskColor || attrib instanceof AttribTslColour) {
        return attrib.color || { r: 0.5, g: 0.5, b: 0.5 }
      }
      attrib = attrib.getNext ? attrib.getNext() : null
    }
    return null
  }

  function extractName(entity) {
    let attrib = entity.getAttrib ? entity.getAttrib() : null
    while (attrib) {
      if (attrib instanceof AttribGenNameString) return attrib.name || ''
      attrib = attrib.getNext ? attrib.getNext() : null
    }
    return null
  }

  // ============================================================================
  // Reader Classes (from reader.js)
  // ============================================================================

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
      this.asm = undefined
    }
  }

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

  class BeginOfAcisHistoryData { constructor() { this.record = null } }
  class EndOfAcisHistorySection { constructor() { this.record = null } }
  class EndOfAcisData { constructor() { this.record = null } }

  function int2version(intVersion) { return intVersion / 100.0 }

  class AcisReader {
    constructor() {
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
      this._getSLong = getSInt32
      this._getULong = getUInt32
    }
    get version() { return this.header.version }
    get scale() { return this.header.scale }
    addSubtypeEntity(entity) { this._subtypes.push(entity) }
    getSubtypeEntity(ref) { return this._subtypes[ref] }
    _hasNext() { return this._pos < this._length }

    // Text format parsing
    _skipWhiteSpace() {
      while (this._hasNext()) {
        const ch = this._data[this._pos]
        if (ch !== ' ' && ch !== '\t' && ch !== '\n' && ch !== '\r') break
        this._pos++
      }
    }
    _isSingleChar() {
      if (this._hasNext()) return '#(){}$'.includes(this._data[this._pos])
      return false
    }
    _findEnd() {
      while (this._hasNext()) {
        const ch = this._data[this._pos]
        if (' \t\n\r#(){}$'.includes(ch)) break
        this._pos++
      }
    }
    _readChunkText() {
      this._skipWhiteSpace()
      if (!this._hasNext()) return null
      if (this._isSingleChar()) { const token = this._data[this._pos]; this._pos++; return token }
      const start = this._pos
      this._findEnd()
      if (start < this._pos) return this._data.substring(start, this._pos)
      return null
    }
    _translateChunk(token) {
      if (token.startsWith('@')) {
        const count = parseInt(token.substring(1), 10)
        this._skipWhiteSpace()
        const text = this._data.substring(this._pos, this._pos + count)
        this._pos += count + 1
        return { tag: 0x08, val: text, value: text }
      }
      if (token.startsWith('$')) {
        const ref = parseInt(token.substring(1), 10)
        let chunk = this._refChunks.get(ref)
        if (!chunk) { chunk = new AcisChunkEntityRef(ref); this._refChunks.set(ref, chunk) }
        return chunk
      }
      if (token === '(') {
        const tokX = this._readChunkText()
        const tokY = this._readChunkText()
        const tokZ = this._readChunkText()
        if (tokZ === ')') return { tag: 0x16, val: { u: parseFloat(tokX), v: parseFloat(tokY) }, type: 'vector2d' }
        this._readChunkText()
        return { tag: 0x14, val: { x: parseFloat(tokX), y: parseFloat(tokY), z: parseFloat(tokZ) }, type: 'vector3d' }
      }
      const tag = TOKEN_TRANSLATIONS[token]
      if (tag !== undefined) {
        if (tag === TAG_TRUE) return new AcisChunkEnumValue(TAG_TRUE, true, BOOLEAN)
        if (tag === TAG_FALSE) return new AcisChunkEnumValue(TAG_FALSE, false, BOOLEAN)
        return { tag, val: token, value: token }
      }
      const num = parseFloat(token)
      if (!isNaN(num)) return { tag: 0x06, val: num, value: num }
      return { tag: 0x07, val: token, value: token }
    }
    _readHeaderText() {
      this._pos = 0
      const lines = this._data.split('\n')
      let lineIndex = 0
      const tokens = lines[lineIndex++].trim().split(/\s+/)
      this.header.version = int2version(parseInt(tokens[0], 10))
      this.header.records = parseInt(tokens[1], 10)
      this.header.bodies = parseInt(tokens[2], 10)
      this.header.flags = parseInt(tokens[3], 10)
      if (this.version >= 2.0) {
        const line2 = lines[lineIndex++]
        let pos = 0
        const readAtString = () => {
          while (pos < line2.length && line2[pos] === ' ') pos++
          if (line2[pos] !== '@') return ''
          pos++
          let numStr = ''
          while (pos < line2.length && /\d/.test(line2[pos])) numStr += line2[pos++]
          const len = parseInt(numStr, 10)
          pos++
          const str = line2.substring(pos, pos + len)
          pos += len
          return str
        }
        this.header.prodId = readAtString()
        this.header.prodVer = readAtString()
        this.header.date = readAtString()
        const tokens3 = lines[lineIndex++].trim().split(/\s+/)
        this.header.scale = Math.abs(parseFloat(tokens3[0]))
        this.header.resabs = parseFloat(tokens3[1])
        this.header.resnor = parseFloat(tokens3[2])
      }
      let headerLen = 0
      for (let i = 0; i < lineIndex; i++) headerLen += lines[i].length + 1
      this._pos = headerLen
    }
    _readRecordText(index) {
      let id = index
      let name = this._readChunkText()
      if (name === null) return [null, id]
      if (name.startsWith('-')) { id = parseInt(name.substring(1), 10); name = this._readChunkText() }
      const record = new Record(name)
      record.index = id
      while (this._hasNext()) {
        const token = this._readChunkText()
        if (token) {
          const chunk = this._translateChunk(token)
          record.chunks.push(chunk)
          if (chunk.tag === TAG_TERMINATOR) break
        }
      }
      return [record, id + 1]
    }

    // Binary format parsing
    _readChunkBinary() {
      const [tag, pos1] = getUInt8(this._data, this._pos)
      this._pos = pos1
      if (tag === TAG_ENTITY_REF) {
        const [refIdx, pos2] = this._getSLong(this._data, this._pos)
        this._pos = pos2
        let chunk = this._refChunks.get(refIdx)
        if (!chunk) { chunk = new AcisChunkEntityRef(refIdx); this._refChunks.set(refIdx, chunk) }
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
      const formatBytes = this._data.slice(0, 15)
      this.header.format = new TextDecoder().decode(formatBytes)
      if (this.header.format.startsWith('ACIS BinaryFile') || this.header.format.startsWith('ASM BinaryFile')) {
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
          if (chunk.tag === TAG_TERMINATOR) break
        }
      }
      return [record, id + 1]
    }

    _resolveChunkReferences() {
      for (const ref of this._refChunks.values()) {
        if (ref.val >= 0 && ref.val < this._records.length) ref.record = this._records[ref.val]
      }
      const noneRef = this._refChunks.get(-1)
      if (noneRef) noneRef.record = null
    }
    _ensureRecordSlot(index) { while (this._records.length <= index) this._records.push(null) }
    getRecord(index) { return this._records[index] }
    getRecords() { return this._records }

    readText(data) {
      setReader(this)
      this._data = typeof data === 'string' ? data : new TextDecoder().decode(data)
      this._length = this._data.length
      this._readHeaderText()
      let historySec = false
      let index = 0
      let recordIdx = 0
      let record
      ;[record, index] = this._readRecordText(index)
      if (record && record.name === 'asmheader') {
        [record, index] = this._readRecordText(index)
      }
      if (record && record.name !== 'T') {
        this._ensureRecordSlot(record.index)
        this._records[record.index] = record
      }
      while (this._hasNext()) {
        ;[record, index] = this._readRecordText(index)
        if (record) {
          if (record.name === 'Begin-of-ACIS-History-Data') {
            historySec = true; recordIdx = record.index
            this.history = new History(record); this.history.index = recordIdx
            index = 0
          } else if (record.name === 'End-of-ACIS-History-Section') {
            historySec = false; record.index = -1; index = recordIdx
          } else if (record.name === 'End-of-ACIS-data') {
            record.index = -1; this._records.push(record)
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

    readBinary(data) {
      setReader(this)
      this._data = data instanceof Uint8Array ? data : new Uint8Array(data)
      this._length = this._data.length
      this._pos = 0
      if (!this._readHeaderBinary()) return false
      let historySec = false
      let index = 0
      let recordIdx = 0
      while (this._hasNext()) {
        const [record, newIndex] = this._readRecordBinary(index)
        index = newIndex
        if (record.name === 'Begin-of-ACIS-History-Data') {
          historySec = true; recordIdx = record.index
          this.history = new History(record); this.history.index = recordIdx
          index = 0; this._records.push(record)
        } else if (record.name === 'End-of-ACIS-History-Section') {
          historySec = false; record.index = -1; index = recordIdx
          this._records.push(record)
        } else if (record.name === 'End-of-ACIS-data') {
          record.index = -1; this._records.push(record)
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
      for (const record of this._records) {
        if (record && record.entity) {
          try { record.entity.set(record) }
          catch (e) { console.warn(`Failed to parse entity ${record.name}[${record.index}]:`, e.message) }
        }
      }
      for (const record of this._records) {
        if (record && record.name === 'body' && record.entity) this.bodies.push(record.entity)
      }
      this.resolved = true
    }
  }

  // ============================================================================
  // Type Mappings (from type-mappings.js)
  // ============================================================================

  const RECORD_2_ENTITY = {
    'annotation': Annotation,
    'primitive_annotation-annotation': AnnotationPrimitive,
    'split_annotation-annotation': AnnotationSplit,
    'tol_annotation-annotation': AnnotationTol,
    'create_tol_anno-tol_annotation-annotation': AnnotationTolCreate,
    'revert_tol_anno-tol_annotation-annotation': AnnotationTolRevert,
    'asmheader': AsmHeader,
    'attrib': Attrib,
    'adesk-attrib': AttribADesk,
    'color-adesk-attrib': AttribADeskColor,
    'material-adesk-attrib': AttribADeskMaterial,
    'truecolor-adesk-attrib': AttribADeskTrueColor,
    'st-attrib': AttribSt,
    'no_merge_attribute-st-attrib': AttribStNoMerge,
    'no_combine_attribute-st-attrib': AttribStNoCombine,
    'rgb_color-st-attrib': AttribStRgbColor,
    'display_attribute-st-attrib': AttribStDisplay,
    'id_attribute-st-attrib': AttribStId,
    'sys-attrib': AttribSys,
    'convexity-sys-attrib': AttribSysConvexity,
    'gen-attrib': AttribGen,
    'name_attrib-gen-attrib': AttribGenName,
    'integer_attrib-name_attrib-gen-attrib': AttribGenNameInt32,
    'string_attrib-name_attrib-gen-attrib': AttribGenNameString,
    'Begin-of-ACIS-History-Data': BeginOfAcisHistoryData,
    'delta_state': DeltaState,
    'End-of-ACIS-data': EndOfAcisData,
    'End-of-ACIS-History-Section': EndOfAcisHistorySection,
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
    'curve': Curve,
    'straight-curve': CurveStraight,
    'ellipse-curve': CurveEllipse,
    'degenerate_curve-curve': CurveDegenerate,
    'compcurv-curve': CurveComp,
    'intcurve-curve': CurveInt,
    'intcurve-intcurve-curve': CurveIntInt,
    'pcurve': CurveP,
    'surface': Surface,
    'plane-surface': SurfacePlane,
    'cone-surface': SurfaceCone,
    'sphere-surface': SurfaceSphere,
    'torus-surface': SurfaceTorus,
    'meshsurf-surface': SurfaceMesh,
    'spline-surface': SurfaceSpline,
    'point': Point,
    'T': T,
    'transform': Transform,
    'wcs': Wcs,
    'vertex_template': VertexTemplate,
    'eye_refinement': EyeRefinement,
    'refinement': Refinement,
    'cell': Cell,
    'cell3d-cell': Cell3d,
    'cface': CFace,
    'cshell': CShell
  }

  // ============================================================================
  // Convenience Functions (from index.js)
  // ============================================================================

  function parseAcisBinary(data) {
    const reader = new AcisReader()
    if (!reader.readBinary(data)) throw new Error('Failed to parse ACIS binary data')
    reader.resolveEntities(RECORD_2_ENTITY)
    return reader.bodies
  }

  function parseAcisText(data) {
    const reader = new AcisReader()
    if (!reader.readText(data)) throw new Error('Failed to parse ACIS text data')
    reader.resolveEntities(RECORD_2_ENTITY)
    return reader.bodies
  }

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

  // ============================================================================
  // F3D Parser
  // ============================================================================

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
        const bodies = parseAcis(new Uint8Array(smbData))
        allBodies.push(...bodies)
      } catch (e) {
        console.warn(`Failed to parse ${smbFile}:`, e.message)
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

  // Also expose as ACISParser for backwards compatibility with old worker
  global.ACISParser = {
    parseF3D: parseF3D
  }

})(typeof self !== 'undefined' ? self : this)
