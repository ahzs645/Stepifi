/**
 * Inventor Loader F3D (Fusion 360) File Handler
 * Parses Fusion 360 .f3d files which are ZIP archives containing ACIS SMB files
 * Ported from importerF3D.py
 */

import {
  getUInt8,
  getUInt32,
  getUInt32A,
  getLen32Text8,
  getLen32Text16
} from './importer-utils.js'

import { CONSTRAINT_TYPE } from './importer-constants.js'

// Try to import JSZip - may need to be provided externally
let JSZip = null
try {
  JSZip = (await import('jszip')).default
} catch (e) {
  // JSZip not available as ES module, will need to be injected
}

// ============================================================================
// State
// ============================================================================

let smbFiles = []
let bulkData = null
let metaData = null
let sketches = []
let refs = []

// ============================================================================
// Manifest Parsing
// ============================================================================

/**
 * Parse a single manifest item
 * @param {Uint8Array} data - Binary data
 * @param {number} offset - Byte offset
 * @returns {[object, number]} [manifestItem, newOffset]
 */
function getManifestItem(data, offset) {
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
 * @param {Uint8Array} data - Binary data
 * @param {number} offset - Byte offset
 * @returns {[object[], number]} [items, newOffset]
 */
function getManifestItems(data, offset) {
  const a = []
  let i = offset

  let [n1] = getUInt8(data, i)
  i += 1

  if (n1) {
    let [cnt] = getUInt32(data, i)
    i += 4

    for (let j = 0; j < cnt; j++) {
      let mi
      ;[mi, i] = getManifestItem(data, i)
      a.push(mi)
    }
  }
  return [a, i]
}

/**
 * Read and parse manifest.dat from F3D archive
 * @param {JSZip} f3d - JSZip instance
 * @param {string} path - Path to manifest
 * @returns {Promise<string>} Folder name for active design
 */
async function readManifest(f3d, path) {
  const name = path.split('/').pop()
  if (!name) return ''

  const file = f3d.file(path)
  if (!file) {
    throw new Error(`Manifest not found at ${path}`)
  }

  const buffer = await file.async('arraybuffer')
  const data = new Uint8Array(buffer)

  let i = 0
  let t1, t2, t3, t4, t5, t6, t7, t8

  ;[t1, i] = getLen32Text8(data, i)
  ;[t2, i] = getLen32Text8(data, i) // fusion doc type
  ;[t3, i] = getLen32Text16(data, i) // .f3d
  ;[t4, i] = getLen32Text16(data, i) // Fusion Document
  ;[t5, i] = getLen32Text16(data, i) // A Fusion Document
  ;[t6, i] = getLen32Text16(data, i) // UID
  ;[t7, i] = getLen32Text16(data, i) // UID

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
  ;[l3, i] = getManifestItems(data, i)

  ;[t8, i] = getLen32Text16(data, i) // UID

  let [n1] = getUInt32(data, i)
  i += 4

  let folder
  ;[folder, i] = getLen32Text16(data, i) // -> folder name

  return folder
}

// ============================================================================
// SMB File Processing
// ============================================================================

/**
 * Process SMB (ACIS binary) file from F3D archive
 * @param {JSZip} f3d - JSZip instance
 * @param {string} path - Path to SMB file
 * @param {Function} [acisReader] - Optional ACIS reader function
 * @returns {Promise<boolean>} Success status
 */
async function processSMB(f3d, path, acisReader = null) {
  const name = path.split('/').pop()
  if (!name) return false

  const file = f3d.file(path)
  if (!file) {
    console.warn(`SMB file not found: ${path}`)
    return false
  }

  const buffer = await file.async('arraybuffer')
  const data = new Uint8Array(buffer)

  // If we have an ACIS reader, parse the file
  if (acisReader) {
    try {
      const reader = acisReader(data)
      reader.name = name

      if (reader.readBinary()) {
        // Store parsed reader for geometry building
        smbFiles.push(reader)
        return true
      }
    } catch (e) {
      console.error(`Error reading SMB file ${name}:`, e)
    }
  } else {
    // Store raw data if no reader provided
    smbFiles.push({
      name,
      data,
      isRaw: true
    })
    return true
  }

  return false
}

/**
 * Process thumbnail from F3D archive
 * @param {JSZip} f3d - JSZip instance
 * @param {string} path - Path to thumbnail
 * @returns {Promise<Uint8Array|null>} Thumbnail data or null
 */
async function processThumbnail(f3d, path) {
  const name = path.split('/').pop()
  if (!name) return null

  const file = f3d.file(path)
  if (!file) return null

  const buffer = await file.async('arraybuffer')
  return new Uint8Array(buffer)
}

// ============================================================================
// F3D File Reading
// ============================================================================

/**
 * Check if data is a valid ZIP file
 * @param {Uint8Array|ArrayBuffer} data - File data
 * @returns {boolean} True if ZIP signature found
 */
export function isZipFile(data) {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data)
  // Check for ZIP signature (PK\x03\x04)
  return bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x03 && bytes[3] === 0x04
}

/**
 * Read F3D file and extract ACIS geometry
 * @param {Uint8Array|ArrayBuffer} fileData - F3D file data
 * @param {object} [options] - Options
 * @param {Function} [options.acisReader] - ACIS reader factory function
 * @param {object} [options.jszip] - JSZip instance (if not available globally)
 * @returns {Promise<object>} Parsed F3D data
 */
export async function readF3D(fileData, options = {}) {
  // Reset state
  smbFiles = []
  sketches = []
  refs = []
  bulkData = null
  metaData = null

  const data = fileData instanceof Uint8Array ? fileData : new Uint8Array(fileData)

  if (!isZipFile(data)) {
    throw new Error('Not a valid F3D/ZIP file')
  }

  // Get JSZip instance
  const zip = options.jszip || JSZip
  if (!zip) {
    throw new Error('JSZip is required but not available. Please provide it via options.jszip')
  }

  const f3d = await zip.loadAsync(data)

  // Read manifest to get folder structure
  const folder = await readManifest(f3d, 'Manifest.dat')

  const folderPreview = `${folder}[Active]/Previews/`
  const folderBreps = `${folder}[Active]/Breps.BlobParts/`
  const fileBulk = `${folder}[Active]/Design1/BulkStream.dat`
  const fileMeta = `${folder}[Active]/Design1/MetaStream.dat`

  const result = {
    folder,
    thumbnail: null,
    smbFiles: [],
    bulkData: null,
    metaData: null
  }

  // Process all files in archive
  const fileNames = Object.keys(f3d.files)

  for (const name of fileNames) {
    if (name.startsWith(folderPreview)) {
      // Extract thumbnail
      const thumbData = await processThumbnail(f3d, name)
      if (thumbData) {
        result.thumbnail = thumbData
      }
    } else if (name.startsWith(folderBreps)) {
      // Process BREP (SMB/SAB) files
      await processSMB(f3d, name, options.acisReader)
    }
  }

  // Try to read bulk and meta streams
  try {
    const bulkFile = f3d.file(fileBulk)
    if (bulkFile) {
      const buffer = await bulkFile.async('arraybuffer')
      bulkData = new Uint8Array(buffer)
      result.bulkData = bulkData
    }
  } catch (e) {
    // Bulk stream may not exist
  }

  try {
    const metaFile = f3d.file(fileMeta)
    if (metaFile) {
      const buffer = await metaFile.async('arraybuffer')
      metaData = new Uint8Array(buffer)
      result.metaData = metaData
    }
  } catch (e) {
    // Meta stream may not exist
  }

  result.smbFiles = smbFiles

  return result
}

/**
 * Import F3D file and build geometry using OpenCascade.js
 * @param {Uint8Array|ArrayBuffer} fileData - F3D file data
 * @param {object} oc - OpenCascade.js instance
 * @param {object} [options] - Options
 * @returns {Promise<object>} Geometry results
 */
export async function importF3D(fileData, oc, options = {}) {
  // Import the ACIS reader from the existing codebase
  let AcisReader
  try {
    const acisModule = await import('./reader.js')
    AcisReader = acisModule.AcisReader
  } catch (e) {
    console.warn('ACIS reader not available:', e)
  }

  // Create ACIS reader factory
  const acisReaderFactory = AcisReader
    ? data => new AcisReader(data)
    : null

  // Read F3D file
  const f3dData = await readF3D(fileData, {
    ...options,
    acisReader: acisReaderFactory
  })

  // Import geometry builder
  let convertACISBody, convertACISBodiesToShape
  try {
    const geoModule = await import('./geometry-builder.js')
    convertACISBody = geoModule.convertACISBody
    convertACISBodiesToShape = geoModule.convertACISBodiesToShape
  } catch (e) {
    console.warn('Geometry builder not available:', e)
  }

  // Import type mappings for entity resolution
  let RECORD_2_ENTITY
  try {
    const typeMappings = await import('./type-mappings.js')
    RECORD_2_ENTITY = typeMappings.RECORD_2_ENTITY
  } catch (e) {
    console.warn('Type mappings not available:', e)
  }

  const results = {
    ...f3dData,
    shapes: [],
    errors: []
  }

  // Build geometry from SMB files
  if (convertACISBody && oc && RECORD_2_ENTITY) {
    for (const smb of f3dData.smbFiles) {
      if (smb.isRaw) {
        // Raw data, need to parse first
        if (AcisReader) {
          try {
            const reader = new AcisReader(smb.data)
            if (reader.readBinary()) {
              // CRITICAL: Resolve entity references before accessing bodies
              reader.resolveEntities(RECORD_2_ENTITY)

              // reader.bodies is an array of resolved body entities
              for (const body of reader.bodies || []) {
                try {
                  const shape = convertACISBody(oc, body)
                  if (shape) {
                    results.shapes.push({
                      name: smb.name,
                      shape
                    })
                  }
                } catch (e) {
                  results.errors.push({
                    name: smb.name,
                    error: e.message
                  })
                }
              }
            }
          } catch (e) {
            results.errors.push({
              name: smb.name,
              error: e.message
            })
          }
        }
      } else {
        // Already parsed ACIS data - resolve entities if not done
        if (!smb.resolved && RECORD_2_ENTITY) {
          smb.resolveEntities(RECORD_2_ENTITY)
        }

        // smb.bodies is an array of resolved body entities
        for (const body of smb.bodies || []) {
          try {
            const shape = convertACISBody(oc, body)
            if (shape) {
              results.shapes.push({
                name: smb.name,
                shape
              })
            }
          } catch (e) {
            results.errors.push({
              name: smb.name,
              error: e.message
            })
          }
        }
      }
    }
  }

  return results
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get constraint type name from constraint flag
 * @param {number} flag - Constraint type flag
 * @returns {string} Constraint name
 */
export function getConstraintTypeName(flag) {
  return CONSTRAINT_TYPE[flag] || `Unknown_${flag.toString(16)}`
}

/**
 * Get parsed SMB files
 * @returns {object[]} Array of SMB file data
 */
export function getSMBFiles() {
  return smbFiles
}

/**
 * Clear cached data
 */
export function clearCache() {
  smbFiles = []
  sketches = []
  refs = []
  bulkData = null
  metaData = null
}

// ============================================================================
// Default Export
// ============================================================================

export default {
  isZipFile,
  readF3D,
  importF3D,
  getConstraintTypeName,
  getSMBFiles,
  clearCache
}
