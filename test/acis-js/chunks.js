/**
 * ACIS Chunk Classes
 * Binary chunk readers for ACIS format
 * Ported from Acis.py lines 4700-4900
 */

import {
  TAG_CHAR, TAG_SHORT, TAG_LONG, TAG_FLOAT, TAG_DOUBLE,
  TAG_UTF8_U8, TAG_UTF8_U16, TAG_UTF8_U32_A, TAG_UTF8_U32_B,
  TAG_TRUE, TAG_FALSE, TAG_ENTITY_REF, TAG_IDENT, TAG_SUBIDENT,
  TAG_SUBTYPE_OPEN, TAG_SUBTYPE_CLOSE, TAG_TERMINATOR,
  TAG_POSITION, TAG_VECTOR_3D, TAG_ENUM_VALUE, TAG_VECTOR_2D,
  TAG_INT64, BOOLEAN
} from './constants.js'

// ============================================================================
// Binary Reading Helpers
// ============================================================================

export function getUInt8(data, offset) {
  return [data[offset], offset + 1]
}

export function getSInt8(data, offset) {
  const val = data[offset]
  return [val > 127 ? val - 256 : val, offset + 1]
}

export function getUInt16(data, offset) {
  return [data[offset] | (data[offset + 1] << 8), offset + 2]
}

export function getSInt16(data, offset) {
  const val = data[offset] | (data[offset + 1] << 8)
  return [val > 32767 ? val - 65536 : val, offset + 2]
}

export function getUInt32(data, offset) {
  return [
    data[offset] | (data[offset + 1] << 8) | (data[offset + 2] << 16) | (data[offset + 3] << 24) >>> 0,
    offset + 4
  ]
}

export function getSInt32(data, offset) {
  const val = data[offset] | (data[offset + 1] << 8) | (data[offset + 2] << 16) | (data[offset + 3] << 24)
  return [val, offset + 4]
}

export function getUInt64(data, offset) {
  const lo = getUInt32(data, offset)[0]
  const hi = getUInt32(data, offset + 4)[0]
  // Return as Number (may lose precision for very large values)
  return [hi * 0x100000000 + lo, offset + 8]
}

export function getSInt64(data, offset) {
  const lo = getUInt32(data, offset)[0]
  const hi = getSInt32(data, offset + 4)[0]
  // Check for -1 (0xffffffffffffffff)
  if (lo === 0xffffffff && hi === -1) return [-1, offset + 8]
  return [hi * 0x100000000 + lo, offset + 8]
}

export function getFloat32(data, offset) {
  const view = new DataView(data.buffer, data.byteOffset + offset, 4)
  return [view.getFloat32(0, true), offset + 4]
}

export function getFloat64(data, offset) {
  const view = new DataView(data.buffer, data.byteOffset + offset, 8)
  return [view.getFloat64(0, true), offset + 8]
}

// ============================================================================
// Base Chunk Class
// ============================================================================

export class AcisChunk {
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

export class AcisChunkChar extends AcisChunk {
  constructor(val) {
    super(TAG_CHAR, val)
  }

  read(data, offset) {
    [this.val, offset] = getUInt8(data, offset)
    this.value = this.val
    return offset
  }
}

export class AcisChunkShort extends AcisChunk {
  constructor(val) {
    super(TAG_SHORT, val)
  }

  read(data, offset) {
    [this.val, offset] = getSInt16(data, offset)
    this.value = this.val
    return offset
  }
}

export class AcisChunkLong extends AcisChunk {
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

export class AcisChunkInt64 extends AcisChunk {
  constructor(val) {
    super(TAG_INT64, val)
  }

  read(data, offset) {
    [this.val, offset] = getSInt64(data, offset)
    this.value = this.val
    return offset
  }
}

export class AcisChunkFloat extends AcisChunk {
  constructor(val) {
    super(TAG_FLOAT, val)
  }

  read(data, offset) {
    [this.val, offset] = getFloat32(data, offset)
    this.value = this.val
    return offset
  }
}

export class AcisChunkDouble extends AcisChunk {
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

export class AcisChunkUtf8U8 extends AcisChunk {
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

export class AcisChunkUtf8U16 extends AcisChunk {
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

export class AcisChunkUtf8U32A extends AcisChunk {
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

export class AcisChunkUtf8U32B extends AcisChunk {
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

export class AcisChunkIdent extends AcisChunkUtf8U8 {
  constructor(val) {
    super(val)
    this.tag = TAG_IDENT
  }
}

export class AcisChunkSubIdent extends AcisChunkUtf8U8 {
  constructor(val) {
    super(val)
    this.tag = TAG_SUBIDENT
  }
}

// ============================================================================
// Reference Chunk
// ============================================================================

export class AcisChunkEntityRef extends AcisChunk {
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

export class AcisChunkEnumValue extends AcisChunk {
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

export class AcisChunkPosition extends AcisChunk {
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

export class AcisChunkVector3D extends AcisChunk {
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

export class AcisChunkVector2D extends AcisChunk {
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

export class AcisChunkSubtypeOpen extends AcisChunk {
  constructor() {
    super(TAG_SUBTYPE_OPEN, '{')
  }

  toString() {
    return '{'
  }
}

export class AcisChunkSubtypeClose extends AcisChunk {
  constructor() {
    super(TAG_SUBTYPE_CLOSE, '}')
  }

  toString() {
    return '}'
  }
}

export class AcisChunkTerminator extends AcisChunk {
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

export const ACIS_REF_NONE = new AcisChunkEntityRef(-1)
ACIS_REF_NONE.record = null

// ============================================================================
// Tag to Chunk Class Mapping
// ============================================================================

export const ACIS_VALUE_CHUNKS = {
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

export function createChunk(tag, data, offset, scale = 1.0) {
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
    const chunk = new AcisChunkUtf8U8()
    const o1 = chunk.read(data, offset)
    chunk.tag = TAG_ENUM_VALUE
    chunk.type = 'enum'
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
