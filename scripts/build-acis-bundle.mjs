#!/usr/bin/env node
/**
 * Build script for acis-bundle.js
 * Bundles all acis-js modules into a single IIFE for web worker use
 */

import { readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ACIS_JS_DIR = join(__dirname, '../public/acis-js')
const OUTPUT_FILE = join(__dirname, '../public/acis-bundle.js')

// Files to bundle in dependency order
const FILES = [
  'constants.js',
  'math.js',
  'data-classes.js',
  'utils.js',
  'chunks.js',
  'entity.js',
  'topology.js',
  'curves.js',
  'surfaces.js',
  'attributes.js',
  'spline.js',
  'reader.js',
  'type-mappings.js',
  'geometry-builder.js'
]

function stripImports(code) {
  // Remove import statements
  return code.replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, '')
             .replace(/^import\s+\{[\s\S]*?\}\s+from\s+['"].*?['"];?\s*$/gm, '')
             .replace(/^import\s+\*\s+as\s+\w+\s+from\s+['"].*?['"];?\s*$/gm, '')
}

function stripExports(code) {
  // Convert "export async function" to just "async function"
  code = code.replace(/^export\s+async\s+function\s+/gm, 'async function ')
  // Convert "export function" to just "function"
  code = code.replace(/^export\s+function\s+/gm, 'function ')
  // Convert "export class" to just "class"
  code = code.replace(/^export\s+class\s+/gm, 'class ')
  // Convert "export const" to just "const"
  code = code.replace(/^export\s+const\s+/gm, 'const ')
  // Convert "export let" to just "let"
  code = code.replace(/^export\s+let\s+/gm, 'let ')
  // Remove "export { ... }" statements (single or multi-line)
  code = code.replace(/^export\s+\{[\s\S]*?\}\s*;?\s*$/gm, '')
  // Remove "export default { ... }" multi-line objects
  code = code.replace(/^export\s+default\s+\{[\s\S]*?\n\}\s*$/gm, '')
  // Remove "export default" single line statements
  code = code.replace(/^export\s+default\s+[^{].*$/gm, '')
  // Remove standalone "export *" statements
  code = code.replace(/^export\s+\*\s+from\s+['"].*?['"];?\s*$/gm, '')
  return code
}

function fixCircularDependencies(code, filename) {
  // In surfaces.js, the placeholder variables conflict with the actual functions in spline.js
  // Rename the placeholders to avoid conflicts
  if (filename === 'surfaces.js') {
    code = code.replace(/let readCurve, readSurface, readLaw/g, 'let _readCurveFn, _readSurfaceFn, _readLawFn')
    code = code.replace(/readCurve = fn/g, '_readCurveFn = fn')
    code = code.replace(/readSurface = fn/g, '_readSurfaceFn = fn')
    code = code.replace(/readLaw = fn/g, '_readLawFn = fn')
    // Replace usages (but not the function definitions which come from spline.js)
    code = code.replace(/readCurve \? readCurve\(/g, '_readCurveFn ? _readCurveFn(')
    code = code.replace(/readSurface \? readSurface\(/g, '_readSurfaceFn ? _readSurfaceFn(')
    code = code.replace(/readLaw \? readLaw\(/g, '_readLawFn ? _readLawFn(')
  }
  return code
}

function processFile(filename) {
  const filepath = join(ACIS_JS_DIR, filename)
  let code = readFileSync(filepath, 'utf-8')

  // Strip imports and exports
  code = stripImports(code)
  code = stripExports(code)

  // Fix circular dependency naming conflicts
  code = fixCircularDependencies(code, filename)

  // Add section header
  const header = `\n// ============================================================================\n// ${filename}\n// ============================================================================\n\n`

  return header + code
}

function buildBundle() {
  console.log('Building acis-bundle.js from acis-js/ modules...')

  let bundle = `/**
 * ACIS Parser Bundle
 * Auto-generated from acis-js modules
 * Generated: ${new Date().toISOString()}
 *
 * For use with Web Workers via importScripts()
 */

;(function(global) {
  'use strict'

`

  // Process each file
  for (const file of FILES) {
    console.log(`  Processing ${file}...`)
    bundle += processFile(file)
  }

  // Add initialization code for circular dependencies
  bundle += `
// ============================================================================
// Circular Dependency Resolution
// ============================================================================

// Wire up the circular dependencies
// surfaces.js uses _readCurveFn, _readSurfaceFn, _readLawFn as placeholders
// spline.js defines the actual readCurve, readSurface, readLaw functions
setCurveReader(readCurve)
setSurfaceReader(readSurface)
setLawReader(readLaw)

// Initialize curve and surface class mappings (from index.js)
const _CURVES = {
  'compcurv': CurveComp,
  'degenerate_curve': CurveDegenerate,
  'ellipse': CurveEllipse,
  'intcurve': CurveInt,
  'intcurve-intcurve': CurveIntInt,
  'pcurve': CurveP,
  'straight': CurveStraight,
  'null_curve': null,
  'null_pcurve': null
}

const _SURFACES = {
  'cone': SurfaceCone,
  'mesh': SurfaceMesh,
  'plane': SurfacePlane,
  'sphere': SurfaceSphere,
  'spline': SurfaceSpline,
  'torus': SurfaceTorus,
  'null_surface': null
}

setCurveClasses(_CURVES)
setSurfaceClasses(_SURFACES)
setTransformClass(Transform)

// ============================================================================
// High-level API Functions
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
 * Parse ACIS binary data and return bodies + header metadata
 */
function parseAcisBinaryWithHeader(data) {
  const reader = new AcisReader()
  if (!reader.readBinary(data)) {
    throw new Error('Failed to parse ACIS binary data')
  }
  reader.resolveEntities(RECORD_2_ENTITY)
  return { bodies: reader.bodies, header: reader.header }
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
    const lumps = body.getLumps ? body.getLumps() : []
    for (const lump of lumps) {
      const shells = lump.getShells ? lump.getShells() : []
      for (const shell of shells) {
        const shellFaces = shell.getFaces ? shell.getFaces() : []
        faces.push(...shellFaces)
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
    const lumps = body.getLumps ? body.getLumps() : []
    for (const lump of lumps) {
      const shells = lump.getShells ? lump.getShells() : []
      for (const shell of shells) {
        const faces = shell.getFaces ? shell.getFaces() : []
        for (const face of faces) {
          const loops = face.getLoops ? face.getLoops() : []
          for (const loop of loops) {
            const coedges = loop.getCoedges ? loop.getCoedges() : []
            for (const coedge of coedges) {
              const edge = coedge.getEdge ? coedge.getEdge() : null
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
 * Parse F3D file (Fusion 360 ZIP format)
 * Returns { bodies: Body[], headers: Header[] } with ACIS header metadata
 */
async function parseF3D(arrayBuffer, loadJSZip) {
  const JSZip = await loadJSZip()
  const zip = await JSZip.loadAsync(arrayBuffer)
  const files = Object.keys(zip.files)

  // Process both .smbh and .smb files — both contain ACIS binary (SAB) data
  const brepFiles = files.filter(f => {
    const lower = f.toLowerCase()
    return lower.endsWith('.smbh') || lower.endsWith('.smb')
  })

  if (brepFiles.length === 0) {
    throw new Error('No ACIS binary data (.smb/.smbh) found in F3D file')
  }

  const allBodies = []
  const allHeaders = []

  for (const brepFile of brepFiles) {
    try {
      const brepData = await zip.file(brepFile).async('arraybuffer')
      const brepBytes = new Uint8Array(brepData)
      console.log('Parsing ' + brepFile + ': ' + brepData.byteLength + ' bytes')

      // Check if this is direct ACIS format or has a wrapper
      const headerStr = new TextDecoder().decode(brepBytes.slice(0, 15))
      let dataToparse = brepBytes

      if (!headerStr.startsWith('ACIS BinaryFile') && !headerStr.startsWith('ASM BinaryFile')) {
        // SMB/SMBH files may have a wrapper header — find ACIS data start
        const acisStart = findACISDataStart(brepBytes)
        if (acisStart > 0) {
          console.log('  Found ACIS data at offset ' + acisStart)
          dataToparse = brepBytes.slice(acisStart)
        } else {
          // Scan for 'ACIS' or 'ASM ' marker in first 4KB
          let foundOffset = -1
          for (let i = 0; i < Math.min(4096, brepBytes.length - 15); i++) {
            const chunk = new TextDecoder().decode(brepBytes.slice(i, i + 15))
            if (chunk.startsWith('ACIS BinaryFile') || chunk.startsWith('ASM BinaryFile')) {
              foundOffset = i
              break
            }
          }
          if (foundOffset >= 0) {
            console.log('  Found ACIS header at offset ' + foundOffset)
            dataToparse = brepBytes.slice(foundOffset)
          }
        }
      }

      const result = parseAcisBinaryWithHeader(dataToparse)
      console.log('  Found ' + result.bodies.length + ' bodies')
      allBodies.push(...result.bodies)
      if (result.header) allHeaders.push(result.header)
    } catch (e) {
      console.warn('Failed to parse ' + brepFile + ':', e.message)
      console.warn(e.stack)
    }
  }

  if (allBodies.length === 0) {
    throw new Error('No geometry bodies found in F3D file')
  }

  return { bodies: allBodies, headers: allHeaders }
}

// Note: Geometry conversion functions (convertACISSurface, convertACISCurve, etc.)
// are now defined in geometry-builder.js which is included in the bundle above.

// ============================================================================
// Export to global
// ============================================================================

global.ACIS = {
  // Reader
  AcisReader,
  RECORD_2_ENTITY,

  // Parsing functions
  parseAcis,
  parseAcisBinary,
  parseAcisBinaryWithHeader,
  parseAcisText,
  parseF3D,

  // Entity traversal
  getAllFaces,
  getAllEdges,
  extractColor,
  extractName,
  findACISDataStart,

  // Classes
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
  makePoint2d,
  makeDirection,
  makeVec,
  makeAx1,
  makeAx2,
  makeAx3,
  createLine,
  createCircle,
  createEllipse,
  createBSplineCurve,
  createBSplineCurve2d,
  createBSplineSurface,
  createPlaneSurface,
  createCylindricalSurface,
  createConicalSurface,
  createSphericalSurface,
  createToroidalSurface,
  createFaceFromSurface,
  createEdgeFromCurve
}

// ACISParser for backwards compatibility
global.ACISParser = {
  parseF3D: parseF3D
}

// ACISGeometry for OpenCascade.js conversion
global.ACISGeometry = {
  convertACISBody,
  convertACISBodiesToShape,
  convertACISSurface,
  convertACISCurve,
  convertACISEdge,
  convertACISFace,
  convertACISShell
}

})(typeof self !== 'undefined' ? self : this)
`

  // Write the bundle
  writeFileSync(OUTPUT_FILE, bundle)
  console.log(`\nBundle written to ${OUTPUT_FILE}`)
  console.log(`Size: ${(bundle.length / 1024).toFixed(1)} KB`)
}

buildBundle()
