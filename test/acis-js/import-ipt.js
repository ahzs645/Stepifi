/**
 * Inventor Loader IPT/IAM Import Entry Point
 * Main entry point for importing Autodesk Inventor files
 * Ported from Import_IPT.py
 */

import { readOLE, isOLEFile, decompressAsync } from './importer-ole.js'
import { readF3D, isZipFile } from './importer-f3d.js'
import {
  setFileVersion,
  getUInt8,
  getUInt16,
  getUInt16A,
  getUInt32,
  getUInt32A,
  getFloat64,
  getUUID,
  getDateTime,
  getLen32Text8,
  getLen32Text16,
  UID
} from './importer-utils.js'

import {
  createNewModel,
  getModel,
  releaseModel,
  VersionInfo,
  RSeDatabase,
  RSeSegment,
  RSeStorageBlockSize,
  RSeStorageSection2,
  RSeStorageSection3,
  RSeStorageBlockType,
  RSeStorageSection4Data,
  RSeStorageSection7,
  RSeDbRevisionInfo,
  Segment
} from './importer-classes.js'

import { SegmentReader } from './importer-segment.js'
import {
  createGroup,
  addToGroup,
  generateMesh,
  exportSTEP
} from './importer-opencascade.js'

// ============================================================================
// Stream Name Constants
// ============================================================================

const STREAM_RSEDB = 'RSeDb'
const STREAM_RSE_SEGMENT_INFO = 'RSeSegmentInfo'
const STREAM_RSE_META = 'RSeMetaStream'
const STREAM_RSE_BINARY = 'RSeBinaryData'
const STREAM_RSE_DB_REV = 'RSeDbRevisionInfo'

// ============================================================================
// Version Detection
// ============================================================================

/**
 * Read version info from data
 * @param {Uint8Array} data - Binary data
 * @param {number} offset - Byte offset
 * @returns {[VersionInfo, number]} [version, newOffset]
 */
function readVersionInfo(data, offset) {
  const version = new VersionInfo()
  let i = offset

  const [d, newI] = getUInt16A(data, i, 5)
  i = newI

  version.revision = d[0] & 0xFF
  version.minor = (d[0] >> 8) & 0xFF
  version.major = d[1] & 0xFF
  version.data = d

  return [version, i]
}

// ============================================================================
// RSeDb Parsing
// ============================================================================

/**
 * Parse RSeDb stream
 * @param {Uint8Array} data - Stream data
 * @returns {RSeDatabase} Parsed database info
 */
function parseRSeDb(data) {
  const db = new RSeDatabase()
  let i = 0

  // Read version
  const [vers1, newI] = readVersionInfo(data, i)
  i = newI
  db.vers1 = vers1

  // Set file version for other parsers
  const version = vers1.major > 11 ? vers1.major + 1996 : vers1.major
  setFileVersion(version)

  // Read UID
  const [uid, newI2] = getUUID(data, i)
  i = newI2
  db.uid = uid

  // Read schema
  const [schema, newI3] = getUInt32(data, i)
  i = newI3
  db.schema = schema

  // Read date
  const [dat1, newI4] = getDateTime(data, i)
  i = newI4
  db.dat1 = dat1

  // Read additional data based on version
  if (version > 2010) {
    const [arr2, newI5] = getUInt32A(data, i, 2)
    i = newI5
    db.arr2 = arr2
  }

  // Read version 2
  const [vers2, newI6] = readVersionInfo(data, i)
  i = newI6
  db.vers2 = vers2

  // Read date 2
  const [dat2, newI7] = getDateTime(data, i)
  i = newI7
  db.dat2 = dat2

  // Read text
  const [txt, newI8] = getLen32Text16(data, i)
  i = newI8
  db.txt = txt

  return db
}

// ============================================================================
// Segment Information Parsing
// ============================================================================

/**
 * Parse RSeSegmentInfo stream
 * @param {Uint8Array} data - Stream data
 * @param {object} model - Model object
 */
function parseRSeSegmentInfo(data, model) {
  let i = 0

  // Read text
  const [text, newI] = getLen32Text16(data, i)
  i = newI
  model.RSeDb.segInfo.text = text

  // Read version array
  const [versCount, newI2] = getUInt32(data, i)
  i = newI2
  for (let j = 0; j < versCount; j++) {
    const [vers, newI3] = readVersionInfo(data, i)
    i = newI3
    model.RSeDb.segInfo.vers.push(vers)
  }

  // Read date
  const [date, newI4] = getDateTime(data, i)
  i = newI4
  model.RSeDb.segInfo.date = date

  // Read UID
  const [uid, newI5] = getUUID(data, i)
  i = newI5
  model.RSeDb.segInfo.uid = uid

  // Read segments count
  const [segCount, newI6] = getUInt32(data, i)
  i = newI6

  // Read segment entries
  for (let j = 0; j < segCount; j++) {
    const segment = new RSeSegment()

    // Read name
    const [name, newI7] = getLen32Text16(data, i)
    i = newI7
    segment.name = name

    // Read ID
    const [id, newI8] = getUUID(data, i)
    i = newI8
    segment.ID = id

    // Read type
    const [type, newI9] = getLen32Text16(data, i)
    i = newI9
    segment.type = type

    // Read version
    const [version, newI10] = readVersionInfo(data, i)
    i = newI10
    segment.version = version

    model.RSeDb.segInfo.segments[segment.name] = segment
  }
}

// ============================================================================
// Meta Stream Parsing
// ============================================================================

/**
 * Parse section 1 (block sizes)
 * @param {Uint8Array} data - Stream data
 * @param {number} offset - Byte offset
 * @param {object} segment - Target segment
 * @returns {number} New offset
 */
function parseSection1(data, offset, segment) {
  let i = offset
  const [cnt, newI] = getUInt32(data, i)
  i = newI

  for (let j = 0; j < cnt; j++) {
    const [val, newI2] = getUInt32(data, i)
    i = newI2
    segment.sec1.push(new RSeStorageBlockSize(segment, val))
  }

  return i
}

/**
 * Parse section 4 (block types)
 * @param {Uint8Array} data - Stream data
 * @param {number} offset - Byte offset
 * @param {object} segment - Target segment
 * @returns {number} New offset
 */
function parseSection4(data, offset, segment) {
  let i = offset
  const [cnt, newI] = getUInt32(data, i)
  i = newI

  for (let j = 0; j < cnt; j++) {
    const [uid, newI2] = getUUID(data, i)
    i = newI2

    const blockType = new RSeStorageBlockType(segment)
    blockType.uid = uid

    // Read two RSeStorageSection4Data entries
    for (let k = 0; k < 2; k++) {
      const d = new RSeStorageSection4Data()
      const [num, newI3] = getUInt16(data, i)
      i = newI3
      d.num = num
      const [val, newI4] = getUInt32(data, i)
      i = newI4
      d.val = val
      blockType.arr.push(d)
    }

    segment.secBlkTyps[j] = blockType
  }

  return i
}

/**
 * Parse meta stream for a segment
 * @param {Uint8Array} data - Stream data
 * @param {object} segment - Target segment
 */
function parseMetaStream(data, segment) {
  let i = 0

  // Parse section 1 (block sizes)
  i = parseSection1(data, i, segment)

  // Skip to section 4 (block types) - simplified
  // In full implementation, would parse sections 2, 3
  const [sec2Cnt, newI] = getUInt32(data, i)
  i = newI
  i += sec2Cnt * 16 // Skip section 2

  const [sec3Cnt, newI2] = getUInt32(data, i)
  i = newI2
  i += sec3Cnt * 28 // Skip section 3

  // Parse section 4
  i = parseSection4(data, i, segment)
}

// ============================================================================
// Main Import Functions
// ============================================================================

/**
 * Read IPT/IAM file from OLE container
 * @param {Uint8Array|ArrayBuffer} fileData - File data
 * @param {object} [options] - Options
 * @returns {Promise<object>} Parsed model data
 */
export async function readIPT(fileData, options = {}) {
  const data = fileData instanceof Uint8Array ? fileData : new Uint8Array(fileData)

  // Check file type
  if (isZipFile(data)) {
    // F3D file
    return readF3D(data, options)
  }

  if (!isOLEFile(data)) {
    throw new Error('Not a valid IPT/IAM or F3D file')
  }

  // Parse OLE container
  const ole = readOLE(data, options)

  // Create model
  const model = createNewModel()

  // Read RSeDb
  const rseDbData = ole.getStream(STREAM_RSEDB)
  if (rseDbData) {
    const db = parseRSeDb(rseDbData)
    model.RSeDb = db
  }

  // Read RSeSegmentInfo
  const segInfoData = ole.getStream(STREAM_RSE_SEGMENT_INFO)
  if (segInfoData) {
    parseRSeSegmentInfo(segInfoData, model)
  }

  // Read revision info
  const revInfoData = ole.getStream(STREAM_RSE_DB_REV)
  if (revInfoData) {
    // Parse revision info - simplified
    let i = 0
    while (i < revInfoData.length - 16) {
      const rev = new RSeDbRevisionInfo()
      const [id, newI] = getUUID(revInfoData, i)
      i = newI
      rev.ID = id

      const [flags, newI2] = getUInt32(revInfoData, i)
      i = newI2
      rev.flags = flags

      const [type, newI3] = getUInt16(revInfoData, i)
      i = newI3
      rev.type = type

      const [b, newI4] = getUInt8(revInfoData, i)
      i = newI4
      rev.b = b

      model.RSeRevisions.infos.push(rev)
      model.RSeRevisions.mapping.set(id.toString(), rev)
    }
  }

  // Read each segment
  for (const [segName, rseSegment] of Object.entries(model.RSeDb.segInfo.segments)) {
    const segment = new Segment()
    segment.name = segName
    segment.segment = rseSegment

    // Read meta stream for this segment
    const metaStreamName = `${segName}/${STREAM_RSE_META}`
    const metaData = ole.getStreamByPath(metaStreamName) || ole.getStream(`M${segName.slice(1)}`)

    if (metaData) {
      try {
        // Decompress if needed
        let decompressed = metaData
        if (metaData[0] === 0x78) {
          // zlib compressed
          decompressed = await decompressAsync(metaData)
        }
        parseMetaStream(decompressed, segment)
      } catch (e) {
        console.warn(`Failed to parse meta stream for ${segName}:`, e.message)
      }
    }

    // Read binary data
    const binaryStreamName = `${segName}/${STREAM_RSE_BINARY}`
    const binaryData = ole.getStreamByPath(binaryStreamName) || ole.getStream(`B${segName.slice(1)}`)

    if (binaryData && segment.sec1.length > 0) {
      try {
        // Decompress if needed
        let decompressed = binaryData
        if (binaryData[0] === 0x78) {
          decompressed = await decompressAsync(binaryData)
        }

        // Read segment data
        const reader = new SegmentReader(segment)
        reader.ReadSegmentData(decompressed)
      } catch (e) {
        console.warn(`Failed to parse binary data for ${segName}:`, e.message)
      }
    }

    model.RSeMetaData[segName] = segment
  }

  return {
    model,
    version: model.RSeDb.vers1,
    segments: model.RSeDb.segInfo.segments,
    metaData: model.RSeMetaData
  }
}

/**
 * Import IPT/IAM file and build geometry with OpenCascade.js
 * @param {Uint8Array|ArrayBuffer} fileData - File data
 * @param {object} oc - OpenCascade.js instance
 * @param {object} [options] - Options
 * @returns {Promise<object>} Import results
 */
export async function importIPT(fileData, oc, options = {}) {
  // Read file
  const parsed = await readIPT(fileData, options)

  const results = {
    ...parsed,
    shapes: [],
    errors: [],
    mesh: null
  }

  // Check for ACIS data in BRep segment
  const brepSegment = parsed.model.getBRep()
  if (brepSegment && brepSegment.AcisList) {
    // Import ACIS reader and geometry builder
    let buildBody
    try {
      const geoModule = await import('./geometry-builder.js')
      buildBody = geoModule.buildBody
    } catch (e) {
      console.warn('Geometry builder not available')
    }

    if (buildBody && oc) {
      // Create root group
      const root = createGroup(oc, 'Root')

      for (const acisNode of brepSegment.AcisList) {
        if (acisNode.SAT) {
          // Build geometry from ACIS data
          try {
            const bodies = acisNode.SAT.bodies || {}
            for (const [name, body] of Object.entries(bodies)) {
              const shape = buildBody(oc, body)
              if (shape) {
                addToGroup(oc, root, shape)
                results.shapes.push({
                  name,
                  shape
                })
              }
            }
          } catch (e) {
            results.errors.push({
              node: acisNode.index,
              error: e.message
            })
          }
        }
      }

      // Generate combined mesh
      if (results.shapes.length > 0) {
        try {
          results.mesh = generateMesh(oc, root)
        } catch (e) {
          console.warn('Mesh generation failed:', e.message)
        }
      }
    }
  }

  return results
}

/**
 * Convert IPT/IAM to STEP format
 * @param {Uint8Array|ArrayBuffer} fileData - File data
 * @param {object} oc - OpenCascade.js instance
 * @param {object} [options] - Options
 * @returns {Promise<string>} STEP file content
 */
export async function convertIPTToSTEP(fileData, oc, options = {}) {
  const imported = await importIPT(fileData, oc, options)

  if (imported.shapes.length === 0) {
    throw new Error('No geometry found in file')
  }

  // Create compound of all shapes
  const root = createGroup(oc, 'Root')
  for (const { shape } of imported.shapes) {
    addToGroup(oc, root, shape)
  }

  return exportSTEP(oc, root)
}

// ============================================================================
// File Type Detection
// ============================================================================

/**
 * Detect file type from data
 * @param {Uint8Array|ArrayBuffer} data - File data
 * @returns {string} File type: 'ipt', 'f3d', or 'unknown'
 */
export function detectFileType(data) {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data)

  if (isZipFile(bytes)) {
    return 'f3d'
  }

  if (isOLEFile(bytes)) {
    return 'ipt'
  }

  return 'unknown'
}

// ============================================================================
// Default Export
// ============================================================================

export default {
  readIPT,
  importIPT,
  convertIPTToSTEP,
  detectFileType
}
