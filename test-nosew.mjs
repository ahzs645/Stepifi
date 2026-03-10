#!/usr/bin/env node
/**
 * Test: what's the face count BEFORE vs AFTER sewing?
 */
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const wasmPath = join(__dirname, 'public/chili-wasm/chili-wasm.js')
const initModule = (await import(wasmPath)).default
const wasm = await initModule({
  locateFile: (file) => join(__dirname, 'public/chili-wasm', file)
})

const acisCode = readFileSync(join(__dirname, 'public/acis-bundle.js'), 'utf-8')
const self = { ACISParser: null }
new Function('self', acisCode)(self)

const jszipCode = readFileSync(join(__dirname, 'node_modules/jszip/dist/jszip.min.js'), 'utf-8')
const loadJSZip = async () => {
  const module = { exports: {} }
  new Function('module', 'exports', jszipCode)(module, module.exports)
  return module.exports
}

const f3dData = readFileSync(join(__dirname, 'slzb-06-wall-mount.f3d')).buffer
const bodies = await self.ACISParser.parseF3D(f3dData, loadJSZip)

const bridge = await import(join(__dirname, 'public/converter-js/chili-geometry-bridge.js'))

function countFaces(shape) {
  let count = 0
  const exp = new wasm.TopExp_Explorer(shape, wasm.TopAbs_ShapeEnum.TopAbs_FACE, wasm.TopAbs_ShapeEnum.TopAbs_SHAPE)
  while (exp.more()) { count++; exp.next() }
  return count
}

// Use the normal conversion
const shape = bridge.convertACISBodiesToShape(wasm, bodies)
const normalFaces = countFaces(shape)
console.log(`Normal conversion: ${normalFaces} faces`)

// Now test: export with and without the shape
const step = wasm.Converter.convertToStep([shape])
console.log(`STEP: ${step.length} bytes`)

// Let's also check face distribution per body
// Re-convert each body separately and track pre/post sewing
console.log('\n=== Per-body face counts ===')
let totalPreSew = 0
let totalPostSew = 0

for (let bi = 0; bi < bodies.length; bi++) {
  const body = bodies[bi]
  const lumps = body.getLumps ? body.getLumps() : []

  for (const lump of lumps) {
    const lumpShells = lump.getShells ? lump.getShells() : []
    for (const shellEntity of lumpShells) {
      const faces = shellEntity.getFaces ? shellEntity.getFaces() : []
      const acisFaceCount = faces.length

      // Convert body via bridge
      // We can't easily split pre/post sew from the module,
      // so let's just count ACIS faces per body
      if (acisFaceCount > 30) {
        console.log(`Body ${bi}: ${acisFaceCount} ACIS faces (large body)`)
      }
      totalPreSew += acisFaceCount
    }
  }
}

// Let's try a different approach: convert bodies individually
console.log('\n=== Individual body conversion ===')
let totalIndividual = 0
for (let bi = 0; bi < bodies.length; bi++) {
  try {
    const singleShape = bridge.convertACISBodiesToShape(wasm, [bodies[bi]])
    if (singleShape) {
      const fc = countFaces(singleShape)
      totalIndividual += fc
      const lumps = bodies[bi].getLumps()
      let acisFaces = 0
      for (const lump of lumps) {
        for (const shell of lump.getShells()) {
          acisFaces += shell.getFaces().length
        }
      }
      if (acisFaces !== fc) {
        console.log(`Body ${bi}: ${acisFaces} ACIS → ${fc} OCC faces (lost ${acisFaces - fc})`)
      }
    }
  } catch (e) {
    console.log(`Body ${bi}: ERROR ${e.message}`)
  }
}
console.log(`\nTotal individual: ${totalIndividual} faces`)
console.log(`Combined: ${normalFaces} faces`)
console.log(`Difference: ${totalIndividual - normalFaces} (lost when combining)`)
