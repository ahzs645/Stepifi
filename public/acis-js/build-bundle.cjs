#!/usr/bin/env node
/**
 * Build script for ACIS bundle
 * Combines all acis-js modules into a single IIFE for Web Worker compatibility
 */

const fs = require('fs')
const path = require('path')

const srcDir = __dirname
const outFile = path.join(srcDir, '..', 'acis-bundle.js')

// Order matters - dependencies first
const modules = [
  'constants.js',
  'chunks.js',
  'math.js',
  'spline.js',
  'data-classes.js',
  'entity.js',
  'attributes.js',
  'curves.js',
  'surfaces.js',
  'topology.js',
  'reader.js',
  'utils.js',
  'type-mappings.js',
  'geometry-builder.js',
  'importer-utils.js'
  // Note: importer-constants.js excluded due to duplicate MIN_0/MIN_PI constants
  // CONSTRAINT_TYPE is added directly in the F3D section below
]

function removeExports(code) {
  // Remove re-export statements: export { ... } from '...'
  code = code.replace(/^export\s+\{[^}]*\}\s+from\s+['"][^'"]+['"][;\s]*$/gm, '')
  // Remove export default statements
  code = code.replace(/^export\s+(default\s+)?\{[^}]*\}[;\s]*$/gm, '')
  code = code.replace(/^export\s+default\s+\w+[;\s]*$/gm, '')
  // Convert exported declarations to regular declarations
  code = code.replace(/^export\s+(const|let|var|function|class|async function)/gm, '$1')
  return code
}

function removeImports(code) {
  // Remove multi-line import statements like: import { x, y, z } from '...'
  code = code.replace(/^import\s+\{[\s\S]*?\}\s+from\s+['"][^'"]+['"][;\s]*/gm, '')
  // Remove single-line import statements
  code = code.replace(/^import\s+.*?from\s+['"][^'"]+['"][;\s]*$/gm, '')
  code = code.replace(/^import\s+['"][^'"]+['"][;\s]*$/gm, '')
  return code
}

function processModule(filename) {
  const filepath = path.join(srcDir, filename)
  let code = fs.readFileSync(filepath, 'utf8')
  code = removeImports(code)
  code = removeExports(code)

  // Remove forward declarations that conflict in bundled context
  if (filename === 'surfaces.js') {
    // Remove let readCurve, readSurface, readLaw - they're already defined in spline.js
    code = code.replace(/^\/\/ Forward declarations for circular dependency resolution\nlet readCurve, readSurface, readLaw\n/m, '')
    // Remove the setter functions - not needed in bundled context
    code = code.replace(/^\/\*\*\n \* Set curve reader function.*?\n \*\/\nfunction setCurveReader\(fn\) \{\n  readCurve = fn\n\}\n/m, '')
    code = code.replace(/^\/\*\*\n \* Set surface reader function.*?\n \*\/\nfunction setSurfaceReader\(fn\) \{\n  readSurface = fn\n\}\n/m, '')
    code = code.replace(/^\/\*\*\n \* Set law reader function.*?\n \*\/\nfunction setLawReader\(fn\) \{\n  readLaw = fn\n\}\n/m, '')
  }

  return `  // ============================================================================
  // ${filename}
  // ============================================================================

${code}
`
}

// Build the bundle
let bundle = `/**
 * ACIS Parser Bundle
 * Auto-generated from acis-js modules
 * For use with Web Workers via importScripts()
 */

;(function(global) {
  'use strict'

`

for (const mod of modules) {
  console.log(`Adding ${mod}...`)
  bundle += processModule(mod)
}

// Add class mappings initialization (from index.js)
bundle += `
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

`

// Add the parseF3D function and exports
bundle += `
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

// Note: CONSTRAINT_TYPE is now defined in constants.js

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
`

fs.writeFileSync(outFile, bundle)
console.log(`\nBundle written to ${outFile}`)
console.log(`Size: ${(fs.statSync(outFile).size / 1024).toFixed(1)} KB`)
