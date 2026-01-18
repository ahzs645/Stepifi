/**
 * OLE Compound Document Reader
 * Reads OLE/CFB (Compound File Binary) format used by IPT/IAM files
 * This is a minimal implementation or wrapper around the 'cfb' npm package
 */

import {
  getUInt16,
  getUInt32,
  getUInt32A,
  getSInt32,
  getUInt8A
} from './importer-utils.js'

// Try to import cfb package - may need to be provided externally
let CFB = null
try {
  CFB = (await import('cfb')).default
} catch (e) {
  // cfb not available as ES module, will need to be injected or use native implementation
}

// Try to import pako for zlib decompression
let pako = null
try {
  pako = (await import('pako')).default
} catch (e) {
  // pako not available
}

// ============================================================================
// OLE Constants
// ============================================================================

const OLE_SIGNATURE = [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]
const MINI_STREAM_CUTOFF = 0x1000 // 4096 bytes
const SECTOR_SIZE_512 = 512
const SECTOR_SIZE_4096 = 4096

const ENTRY_TYPE = {
  EMPTY: 0,
  STORAGE: 1,
  STREAM: 2,
  ROOT: 5
}

// ============================================================================
// OLE Directory Entry
// ============================================================================

class DirectoryEntry {
  constructor() {
    this.name = ''
    this.type = ENTRY_TYPE.EMPTY
    this.colorFlag = 0
    this.leftSibling = -1
    this.rightSibling = -1
    this.childId = -1
    this.clsid = null
    this.stateBits = 0
    this.creationTime = null
    this.modificationTime = null
    this.startSector = 0
    this.size = 0n // BigInt for 64-bit size
    this.data = null
  }

  isStream() {
    return this.type === ENTRY_TYPE.STREAM
  }

  isStorage() {
    return this.type === ENTRY_TYPE.STORAGE || this.type === ENTRY_TYPE.ROOT
  }

  isRoot() {
    return this.type === ENTRY_TYPE.ROOT
  }
}

// ============================================================================
// OLE File Reader
// ============================================================================

export class OLEFile {
  constructor(data) {
    this.data = data instanceof Uint8Array ? data : new Uint8Array(data)
    this.dataView = new DataView(this.data.buffer, this.data.byteOffset, this.data.byteLength)

    this.sectorSize = SECTOR_SIZE_512
    this.miniSectorSize = 64
    this.fatSectors = []
    this.miniFatSectors = []
    this.fat = []
    this.miniFat = []
    this.directoryEntries = []
    this.miniStream = null

    this.valid = false
    this._parsed = false
  }

  /**
   * Check if data is a valid OLE file
   */
  isOLEFile() {
    if (this.data.length < 8) return false
    for (let i = 0; i < 8; i++) {
      if (this.data[i] !== OLE_SIGNATURE[i]) return false
    }
    return true
  }

  /**
   * Parse the OLE file header
   */
  _parseHeader() {
    if (!this.isOLEFile()) {
      throw new Error('Not a valid OLE file')
    }

    // Minor version at offset 0x18
    const [minorVersion] = getUInt16(this.data, 0x18)

    // Major version at offset 0x1A
    const [majorVersion] = getUInt16(this.data, 0x1A)

    // Byte order at offset 0x1C (should be 0xFFFE for little-endian)
    const [byteOrder] = getUInt16(this.data, 0x1C)
    if (byteOrder !== 0xFFFE) {
      throw new Error('Unsupported byte order (big-endian not supported)')
    }

    // Sector size power at offset 0x1E
    const [sectorSizePower] = getUInt16(this.data, 0x1E)
    this.sectorSize = 1 << sectorSizePower

    // Mini sector size power at offset 0x20
    const [miniSectorSizePower] = getUInt16(this.data, 0x20)
    this.miniSectorSize = 1 << miniSectorSizePower

    // Total sectors in FAT at offset 0x2C
    const [totalFatSectors] = getUInt32(this.data, 0x2C)

    // First directory sector at offset 0x30
    const [firstDirSector] = getSInt32(this.data, 0x30)
    this.firstDirectorySector = firstDirSector

    // Transaction signature at offset 0x34
    const [transactionSig] = getUInt32(this.data, 0x34)

    // Mini stream cutoff size at offset 0x38
    const [miniStreamCutoff] = getUInt32(this.data, 0x38)

    // First mini FAT sector at offset 0x3C
    const [firstMiniFatSector] = getSInt32(this.data, 0x3C)
    this.firstMiniFatSector = firstMiniFatSector

    // Total mini FAT sectors at offset 0x40
    const [totalMiniFatSectors] = getUInt32(this.data, 0x40)

    // First DIFAT sector at offset 0x44
    const [firstDifatSector] = getSInt32(this.data, 0x44)
    this.firstDifatSector = firstDifatSector

    // Total DIFAT sectors at offset 0x48
    const [totalDifatSectors] = getUInt32(this.data, 0x48)

    // Read DIFAT array (first 109 entries at offset 0x4C)
    const [difatArray] = getUInt32A(this.data, 0x4C, 109)

    // Build full DIFAT
    this.fatSectors = difatArray.filter(v => v !== 0xFFFFFFFF && v !== 0xFFFFFFFE)

    // If there are more DIFAT sectors, read them
    let difatSector = firstDifatSector
    while (difatSector >= 0 && difatSector !== 0xFFFFFFFE && difatSector !== 0xFFFFFFFF) {
      const sectorData = this._readSector(difatSector)
      const entriesPerSector = (this.sectorSize / 4) - 1

      for (let i = 0; i < entriesPerSector; i++) {
        const [val] = getUInt32(sectorData, i * 4)
        if (val !== 0xFFFFFFFF && val !== 0xFFFFFFFE) {
          this.fatSectors.push(val)
        }
      }

      // Next DIFAT sector
      ;[difatSector] = getSInt32(sectorData, this.sectorSize - 4)
    }
  }

  /**
   * Read a sector by index
   */
  _readSector(sectorIndex) {
    const offset = (sectorIndex + 1) * this.sectorSize
    return this.data.slice(offset, offset + this.sectorSize)
  }

  /**
   * Parse the FAT (File Allocation Table)
   */
  _parseFAT() {
    this.fat = []
    const entriesPerSector = this.sectorSize / 4

    for (const sectorIndex of this.fatSectors) {
      const sectorData = this._readSector(sectorIndex)
      for (let i = 0; i < entriesPerSector; i++) {
        const [val] = getUInt32(sectorData, i * 4)
        this.fat.push(val)
      }
    }
  }

  /**
   * Read a chain of sectors
   */
  _readChain(startSector, size = -1) {
    const sectors = []
    let sector = startSector

    while (sector >= 0 && sector !== 0xFFFFFFFE && sector !== 0xFFFFFFFF) {
      sectors.push(this._readSector(sector))
      sector = this.fat[sector]
    }

    // Concatenate all sectors
    const totalSize = sectors.length * this.sectorSize
    const result = new Uint8Array(totalSize)
    let offset = 0

    for (const sectorData of sectors) {
      result.set(sectorData, offset)
      offset += this.sectorSize
    }

    // Trim to actual size if specified
    if (size >= 0 && size < totalSize) {
      return result.slice(0, size)
    }

    return result
  }

  /**
   * Parse directory entries
   */
  _parseDirectory() {
    const dirData = this._readChain(this.firstDirectorySector)
    const entrySize = 128
    const numEntries = Math.floor(dirData.length / entrySize)

    this.directoryEntries = []

    for (let i = 0; i < numEntries; i++) {
      const offset = i * entrySize
      const entry = new DirectoryEntry()

      // Name (64 bytes, UTF-16LE)
      const nameLength = dirData[offset + 64] | (dirData[offset + 65] << 8)
      if (nameLength > 0) {
        const nameBytes = dirData.slice(offset, offset + Math.min(nameLength, 64))
        const decoder = new TextDecoder('utf-16le')
        entry.name = decoder.decode(nameBytes).replace(/\0/g, '')
      }

      // Entry type
      entry.type = dirData[offset + 66]

      // Color flag
      entry.colorFlag = dirData[offset + 67]

      // Sibling and child IDs
      ;[entry.leftSibling] = getSInt32(dirData, offset + 68)
      ;[entry.rightSibling] = getSInt32(dirData, offset + 72)
      ;[entry.childId] = getSInt32(dirData, offset + 76)

      // Start sector
      ;[entry.startSector] = getSInt32(dirData, offset + 116)

      // Size (64-bit)
      const [sizeLow] = getUInt32(dirData, offset + 120)
      const [sizeHigh] = getUInt32(dirData, offset + 124)
      entry.size = BigInt(sizeLow) | (BigInt(sizeHigh) << 32n)

      if (entry.type !== ENTRY_TYPE.EMPTY) {
        this.directoryEntries.push(entry)
      }
    }
  }

  /**
   * Parse the mini FAT
   */
  _parseMiniFAT() {
    if (this.firstMiniFatSector < 0) return

    this.miniFat = []
    let sector = this.firstMiniFatSector
    const entriesPerSector = this.sectorSize / 4

    while (sector >= 0 && sector !== 0xFFFFFFFE && sector !== 0xFFFFFFFF) {
      const sectorData = this._readSector(sector)
      for (let i = 0; i < entriesPerSector; i++) {
        const [val] = getUInt32(sectorData, i * 4)
        this.miniFat.push(val)
      }
      sector = this.fat[sector]
    }

    // Read mini stream from root entry
    const rootEntry = this.directoryEntries.find(e => e.isRoot())
    if (rootEntry && rootEntry.startSector >= 0) {
      this.miniStream = this._readChain(rootEntry.startSector, Number(rootEntry.size))
    }
  }

  /**
   * Read mini stream chain
   */
  _readMiniChain(startSector, size) {
    if (!this.miniStream) return new Uint8Array(0)

    const sectors = []
    let sector = startSector

    while (sector >= 0 && sector !== 0xFFFFFFFE && sector !== 0xFFFFFFFF) {
      const offset = sector * this.miniSectorSize
      sectors.push(this.miniStream.slice(offset, offset + this.miniSectorSize))
      sector = this.miniFat[sector]
    }

    // Concatenate
    const totalSize = sectors.length * this.miniSectorSize
    const result = new Uint8Array(totalSize)
    let offset = 0

    for (const sectorData of sectors) {
      result.set(sectorData, offset)
      offset += this.miniSectorSize
    }

    if (size >= 0 && size < totalSize) {
      return result.slice(0, size)
    }

    return result
  }

  /**
   * Parse the OLE file
   */
  parse() {
    if (this._parsed) return this.valid

    try {
      this._parseHeader()
      this._parseFAT()
      this._parseDirectory()
      this._parseMiniFAT()

      // Read stream data for each entry
      for (const entry of this.directoryEntries) {
        if (entry.isStream() && entry.startSector >= 0) {
          const size = Number(entry.size)
          if (size < MINI_STREAM_CUTOFF) {
            entry.data = this._readMiniChain(entry.startSector, size)
          } else {
            entry.data = this._readChain(entry.startSector, size)
          }
        }
      }

      this.valid = true
    } catch (e) {
      console.error('OLE parse error:', e)
      this.valid = false
    }

    this._parsed = true
    return this.valid
  }

  /**
   * List all streams in the file
   */
  listStreams() {
    if (!this._parsed) this.parse()

    return this.directoryEntries
      .filter(e => e.isStream())
      .map(e => e.name)
  }

  /**
   * Get stream data by name
   */
  getStream(name) {
    if (!this._parsed) this.parse()

    const entry = this.directoryEntries.find(e => e.name === name)
    if (entry && entry.data) {
      return entry.data
    }
    return null
  }

  /**
   * Get stream data by path
   */
  getStreamByPath(path) {
    // For simple cases, just use name
    const parts = path.split('/')
    const name = parts[parts.length - 1]
    return this.getStream(name)
  }

  /**
   * Check if stream exists
   */
  hasStream(name) {
    if (!this._parsed) this.parse()
    return this.directoryEntries.some(e => e.name === name && e.isStream())
  }
}

// ============================================================================
// High-Level API
// ============================================================================

/**
 * Read OLE file using cfb package if available, otherwise use native implementation
 * @param {Uint8Array|ArrayBuffer} data - File data
 * @param {object} [options] - Options
 * @param {object} [options.cfb] - cfb package instance
 * @returns {object} Parsed OLE file
 */
export function readOLE(data, options = {}) {
  const cfbLib = options.cfb || CFB

  if (cfbLib) {
    // Use cfb package
    const buffer = data instanceof ArrayBuffer ? data : data.buffer
    const cfb = cfbLib.read(new Uint8Array(buffer), { type: 'array' })

    return {
      listStreams: () => cfbLib.utils.cfb_paths(cfb),
      getStream: name => {
        const entry = cfbLib.find(cfb, name)
        return entry ? entry.content : null
      },
      getStreamByPath: path => {
        const entry = cfbLib.find(cfb, path)
        return entry ? entry.content : null
      },
      hasStream: name => cfbLib.find(cfb, name) !== null,
      cfb
    }
  } else {
    // Use native implementation
    const ole = new OLEFile(data)
    ole.parse()
    return ole
  }
}

/**
 * Check if data is an OLE file
 */
export function isOLEFile(data) {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data)
  if (bytes.length < 8) return false
  for (let i = 0; i < 8; i++) {
    if (bytes[i] !== OLE_SIGNATURE[i]) return false
  }
  return true
}

/**
 * Decompress zlib-compressed data
 * @param {Uint8Array} data - Compressed data
 * @param {object} [options] - Options
 * @param {object} [options.pako] - pako instance
 * @returns {Uint8Array} Decompressed data
 */
export function decompress(data, options = {}) {
  const pakoLib = options.pako || pako

  if (pakoLib) {
    return pakoLib.inflate(data)
  } else {
    // Try native DecompressionStream if available
    if (typeof DecompressionStream !== 'undefined') {
      throw new Error('Async decompression required - use decompressAsync instead')
    }
    throw new Error('pako is required for decompression. Please provide it via options.pako')
  }
}

/**
 * Async decompress using native streams (if available)
 * @param {Uint8Array} data - Compressed data
 * @returns {Promise<Uint8Array>} Decompressed data
 */
export async function decompressAsync(data) {
  if (pako) {
    return pako.inflate(data)
  }

  if (typeof DecompressionStream !== 'undefined') {
    const ds = new DecompressionStream('deflate')
    const writer = ds.writable.getWriter()
    writer.write(data)
    writer.close()

    const reader = ds.readable.getReader()
    const chunks = []

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }

    // Concatenate chunks
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
    const result = new Uint8Array(totalLength)
    let offset = 0
    for (const chunk of chunks) {
      result.set(chunk, offset)
      offset += chunk.length
    }
    return result
  }

  throw new Error('No decompression method available')
}

// ============================================================================
// Default Export
// ============================================================================

export default {
  OLEFile,
  readOLE,
  isOLEFile,
  decompress,
  decompressAsync,
  ENTRY_TYPE
}
