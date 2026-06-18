#!/usr/bin/env node
/**
 * End-to-end F3D -> STEP conversion harness (Node), mirroring the production
 * worker path: acis-bundle.parseF3D -> ACISGeometry.convertACISBodiesToShape ->
 * BRepBuilderAPI_Sewing -> oc-io.writeOutput. Then validates the produced STEP
 * with step-parser and diffs entity counts against a reference STEP.
 *
 * Usage: node scripts/convert-f3d-node.mjs [input.f3d] [reference.step]
 */
import { readFileSync, writeFileSync, unlinkSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createRequire } from 'module'
import { runInThisContext } from 'vm'
import JSZip from 'jszip'

import { writeOutput, analyzeMesh } from '../public/converter-js/oc-io.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const require = createRequire(import.meta.url)

const INPUT = process.argv[2] || join(ROOT, 'slzb-06-wall-mount.f3d')
const REFERENCE = process.argv[3] || null
const OC_DIR = join(ROOT, 'public/opencascade')

// ---------------------------------------------------------------------------
// 1. Load OpenCascade.js in Node via a temp CommonJS wrapper so that
//    __filename/require exist and Emscripten loads the wasm from disk.
// ---------------------------------------------------------------------------
async function loadOpenCascade() {
  console.log('Loading OpenCascade.js (~50MB wasm)...')
  let ocScript = readFileSync(join(OC_DIR, 'opencascade.full.js'), 'utf-8')
  ocScript = ocScript.replace(/export\s+default\s+Module\s*;?\s*$/m, '')

  const tmp = join(__dirname, '.oc-loader.cjs')
  const wrapper = `
    const fs = require('fs');
    const path = require('path');
    const OC_DIR = ${JSON.stringify(OC_DIR)};
    const wasmBinary = fs.readFileSync(path.join(OC_DIR, 'opencascade.full.wasm'));
    ${ocScript}
    module.exports = Module({ wasmBinary, locateFile: (p) => path.join(OC_DIR, p) });
  `
  writeFileSync(tmp, wrapper)
  try {
    return await require(tmp)
  } finally {
    try { unlinkSync(tmp) } catch {}
  }
}

// ---------------------------------------------------------------------------
// 2. Load the production acis-bundle.js (sets ACISParser / ACISGeometry on the
//    global). The bundle's IIFE picks `self` when defined.
// ---------------------------------------------------------------------------
function loadAcisBundle() {
  globalThis.self = globalThis
  const code = readFileSync(join(ROOT, 'public/acis-bundle.js'), 'utf-8')
  runInThisContext(code)
  if (!globalThis.ACISParser || !globalThis.ACISGeometry) {
    throw new Error('acis-bundle did not register ACISParser/ACISGeometry')
  }
  return { ACISParser: globalThis.ACISParser, ACISGeometry: globalThis.ACISGeometry }
}

const STEP_ENTITY_TYPES = [
  'MANIFOLD_SOLID_BREP', 'CLOSED_SHELL', 'OPEN_SHELL', 'SHELL_BASED_SURFACE_MODEL',
  'ADVANCED_FACE', 'PLANE', 'CYLINDRICAL_SURFACE', 'CONICAL_SURFACE',
  'SPHERICAL_SURFACE', 'TOROIDAL_SURFACE', 'B_SPLINE_SURFACE', 'B_SPLINE_SURFACE_WITH_KNOTS',
  'EDGE_CURVE', 'LINE', 'CIRCLE', 'ELLIPSE', 'B_SPLINE_CURVE', 'B_SPLINE_CURVE_WITH_KNOTS',
  'VERTEX_POINT', 'GEOMETRIC_CURVE_SET'
]

// Count entity *definitions* (#id=TYPE(...)), not references.
function countStepEntities(text) {
  const counts = {}
  for (const type of STEP_ENTITY_TYPES) {
    const re = new RegExp('=\\s*' + type + '\\s*\\(', 'g')
    const m = text.match(re)
    if (m && m.length) counts[type] = m.length
  }
  return counts
}

async function validateWithStepParser(bytes) {
  try {
    const mod = await import('step-parser')
    // In Node, step-parser's default locateFile yields a file:// URL that fetch()
    // rejects — pass the wasm bytes directly so Emscripten skips the fetch.
    const wasmBinary = readFileSync(join(ROOT, 'node_modules/step-parser/step_parser.wasm'))
    await mod.initStepParser({ wasmBinary })
    const result = mod.parseStep(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes))
    return { ok: true, result }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

async function main() {
  console.log('=== F3D -> STEP end-to-end harness ===')
  console.log('Input:', INPUT)

  const { ACISParser, ACISGeometry } = loadAcisBundle()
  const oc = await loadOpenCascade()
  console.log('OpenCascade ready.\n')

  // Parse F3D (production parseF3D, now .smb-preferring)
  const fileData = readFileSync(INPUT)
  const arrayBuffer = fileData.buffer.slice(fileData.byteOffset, fileData.byteOffset + fileData.byteLength)
  const bodies = await ACISParser.parseF3D(arrayBuffer, async () => JSZip)
  console.log(`\nParsed ${bodies.length} ACIS body/bodies`)

  // Convert to OCC shape (production geometry-builder)
  const shape = ACISGeometry.convertACISBodiesToShape(oc, bodies)
  if (!shape) throw new Error('convertACISBodiesToShape returned null')

  const before = analyzeMesh(oc, shape, 0)
  console.log('Before sewing:', JSON.stringify({
    faces: before.faceCount, edges: before.edgeCount, solids: before.isSolid,
    bbox: before.boundingBox && before.boundingBox.size
  }))

  // convertACISBodiesToShape already sews + solidifies; use the shape directly.
  const finalShape = shape

  // Write STEP via production writeOutput
  const outPath = '/output.step'
  console.log('\n--- writeOutput(step) ---')
  const writeResult = writeOutput(oc, finalShape, 'step', outPath)
  const actualFormat = writeResult && writeResult.format ? writeResult.format : 'step'
  const actualPath = writeResult && writeResult.path ? writeResult.path : outPath
  console.log('writeOutput result:', JSON.stringify(writeResult || { format: 'step (legacy)', path: outPath }))

  const outBytes = oc.FS.readFile(actualPath)
  const localOut = join(ROOT, 'out' + (actualPath.slice(actualPath.lastIndexOf('.'))))
  writeFileSync(localOut, outBytes)
  console.log(`Wrote ${outBytes.length} bytes -> ${localOut} (format=${actualFormat})`)

  const outText = Buffer.from(outBytes).toString('utf-8')
  const isStepText = outText.startsWith('ISO-10303-21')
  console.log('Output begins with ISO-10303-21:', isStepText)

  // Validate with step-parser
  console.log('\n--- step-parser validation ---')
  const val = await validateWithStepParser(outBytes)
  if (val.ok) {
    const r = val.result || {}
    console.log('step-parser OK. keys:', Object.keys(r).join(', '))
    if (r.entities) console.log('  entities:', Array.isArray(r.entities) ? r.entities.length : typeof r.entities)
    if (r.header) console.log('  header schema:', JSON.stringify(r.header).slice(0, 160))
  } else {
    console.log('step-parser FAILED:', val.error)
  }

  // Entity-count diff vs reference
  if (actualFormat === 'step' && isStepText) {
    const outCounts = countStepEntities(outText)
    console.log('\n--- output entity counts ---')
    console.table(outCounts)

    if (REFERENCE) {
      const refText = readFileSync(REFERENCE, 'utf-8')
      const refCounts = countStepEntities(refText)
      console.log('--- reference entity counts ---')
      console.table(refCounts)

      const allTypes = [...new Set([...Object.keys(outCounts), ...Object.keys(refCounts)])].sort()
      console.log('\n--- DIFF (output vs reference) ---')
      const diff = {}
      for (const t of allTypes) diff[t] = { out: outCounts[t] || 0, ref: refCounts[t] || 0 }
      console.table(diff)
    }
  }

  // Gap 4: prove native .brep export works on the same shape (free bonus output)
  console.log('\n--- writeOutput(brep) ---')
  const brepRes = writeOutput(oc, finalShape, 'brep', '/output.brep')
  const brepBytes = oc.FS.readFile(brepRes.path)
  writeFileSync(join(ROOT, 'out.brep'), brepBytes)
  const brepHeader = Buffer.from(brepBytes.subarray(0, 40)).toString('utf-8').split('\n')[0]
  console.log('BREP export:', JSON.stringify(brepRes), '->', brepBytes.length, 'bytes; header:', brepHeader)

  console.log('\n=== done ===')
}

main().catch(e => { console.error('FATAL:', e.message); console.error(e.stack); process.exit(1) })
