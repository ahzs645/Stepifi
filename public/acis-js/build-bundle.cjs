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
  'type-mappings.js'
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

/**
 * Find the start of ACIS data in SMB/SMBH files
 * SMB files have a header before the actual ACIS data
 */
function findACISDataStart(data) {
  const view = data instanceof Uint8Array ? data : new Uint8Array(data)
  // Look for first TAG_IDENT (0x0d) which marks start of ACIS records
  for (let i = 0; i < Math.min(1024, view.length - 1); i++) {
    if (view[i] === 0x0d) {
      // Found potential start - verify it's followed by valid identifier
      // Check next byte is reasonable string length (< 64)
      if (i + 1 < view.length && view[i + 1] < 64 && view[i + 1] > 0) {
        return i
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
`

fs.writeFileSync(outFile, bundle)
console.log(`\nBundle written to ${outFile}`)
console.log(`Size: ${(fs.statSync(outFile).size / 1024).toFixed(1)} KB`)
