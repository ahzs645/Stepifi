/**
 * ACIS Reader
 * Main parser for text (.sat) and binary (.sab) ACIS files
 * Ported from Acis.py lines 5000-5350
 */

import {
  TAG_TRUE, TAG_FALSE, TAG_ENTITY_REF, TAG_IDENT, TAG_SUBIDENT, TAG_TERMINATOR,
  TOKEN_TRANSLATIONS, BOOLEAN
} from './constants.js'
import {
  ACIS_VALUE_CHUNKS, AcisChunkEntityRef, AcisChunkEnumValue,
  ACIS_REF_NONE, createChunk,
  getUInt8, getUInt32, getSInt32, getSInt64, getUInt64
} from './chunks.js'
import { setReader, setScale, setVersion } from './utils.js'

// ============================================================================
// Header Class
// ============================================================================

/**
 * ACIS file header information
 */
export class Header {
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
export class Record {
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

export class Bulletin {
  constructor() {
    this.entity = null
  }
}

export class BulletinBoard {
  constructor() {
    this.bulletins = []
  }
}

export class DeltaState {
  constructor(history, record) {
    this.history = history
    this.record = record
    this.bulletinBoard = null
  }
}

export class History {
  constructor(record) {
    this.record = record
    this.index = -1
    this.deltaStates = []
  }
}

export class BeginOfAcisHistoryData {
  constructor() {
    this.record = null
  }
}

export class EndOfAcisHistorySection {
  constructor() {
    this.record = null
  }
  set(record) {
    // No data to parse
  }
}

export class EndOfAcisData {
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
export function int2version(intVersion) {
  return intVersion / 100.0
}

// ============================================================================
// ACIS Reader Class
// ============================================================================

/**
 * Main ACIS file reader
 */
export class AcisReader {
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
