#!/usr/bin/env node
/**
 * Build script to bundle acis-js modules into a single file for Web Workers
 * Web Workers use importScripts() which doesn't support ES6 modules
 */

const fs = require('fs')
const path = require('path')

const srcDir = __dirname
const outFile = path.join(srcDir, '..', 'acis-bundle.js')

// Order matters - dependencies first
const modules = [
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
  'index.js'
]

// Read all module contents
const moduleContents = {}
for (const mod of modules) {
  const filePath = path.join(srcDir, mod)
  if (fs.existsSync(filePath)) {
    moduleContents[mod] = fs.readFileSync(filePath, 'utf8')
  } else {
    console.warn(`Warning: Module ${mod} not found`)
  }
}

// Process imports and exports
function processModule(name, content) {
  // Remove import statements (we'll inline everything)
  content = content.replace(/^import\s+\{[^}]+\}\s+from\s+['"][^'"]+['"]\s*;?\s*$/gm, '')
  content = content.replace(/^import\s+['"][^'"]+['"]\s*;?\s*$/gm, '')

  // Remove export keywords
  content = content.replace(/^export\s+(const|let|var|function|class)\s+/gm, '$1 ')
  // Remove export { X } from './module'
  content = content.replace(/^export\s+\{[^}]+\}\s+from\s+['"][^'"]+['"]\s*;?\s*$/gm, '')
  // Remove export { X }
  content = content.replace(/^export\s+\{[^}]+\}\s*;?\s*$/gm, '')
  // Remove export * from './module'
  content = content.replace(/^export\s+\*\s+from\s+['"][^'"]+['"]\s*;?\s*$/gm, '')
  // Remove export default
  content = content.replace(/^export\s+default\s+/gm, '')

  return content
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
  if (moduleContents[mod]) {
    bundle += `  // ============================================================================\n`
    bundle += `  // ${mod}\n`
    bundle += `  // ============================================================================\n\n`
    bundle += processModule(mod, moduleContents[mod])
    bundle += '\n\n'
  }
}

// Add F3D parser function
bundle += `
  // ============================================================================
  // F3D Parser
  // ============================================================================

  /**
   * Find where the actual ACIS data starts in a buffer.
   * SMB/SMBH files have a header before the actual ACIS records.
   */
  function findACISDataStart(buffer) {
    const view = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
    const headerText = new TextDecoder().decode(view.slice(0, Math.min(512, view.length)))

    if (headerText.startsWith('ASM BinaryFile') ||
        headerText.startsWith('ASM ') ||
        headerText.startsWith('ACIS BinaryFile')) {
      for (let i = 0; i < Math.min(512, view.length - 10); i++) {
        if (view[i] === 0x0d) {
          const len = view[i + 1]
          if (len > 0 && len < 64 && i + 2 + len <= view.length) {
            const possibleStr = new TextDecoder().decode(view.slice(i + 2, i + 2 + len))
            if (/^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(possibleStr)) {
              return i
            }
          }
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
console.log('Bundle written to:', outFile)
console.log('Size:', (fs.statSync(outFile).size / 1024).toFixed(1), 'KB')
