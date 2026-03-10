#!/usr/bin/env node
/**
 * Test: skip sewing - just use raw shells with increased tolerance
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
  let c = 0
  const e = new wasm.TopExp_Explorer(shape, wasm.TopAbs_ShapeEnum.TopAbs_FACE, wasm.TopAbs_ShapeEnum.TopAbs_SHAPE)
  while (e.more()) { c++; e.next() }
  return c
}

// Normal conversion
const shape = bridge.convertACISBodiesToShape(wasm, bodies)
console.log('Normal: faces =', countFaces(shape))

// Now try with various sewing tolerances on the full compound
for (const tol of [0.01, 0.1, 1.0, 5.0, 10.0, 50.0]) {
  try {
    const sewing = new wasm.BRepBuilderAPI_Sewing(tol, true, true, true, false)
    sewing.add(shape)
    sewing.perform(new wasm.Message_ProgressRange())
    const sewedShape = sewing.sewedShape()
    const faces = countFaces(sewedShape)

    let solids = 0
    const se = new wasm.TopExp_Explorer(sewedShape, wasm.TopAbs_ShapeEnum.TopAbs_SOLID, wasm.TopAbs_ShapeEnum.TopAbs_SHAPE)
    while (se.more()) { solids++; se.next() }

    console.log(`Sew tol=${tol}: faces=${faces}, solids=${solids}`)
  } catch (e) {
    console.log(`Sew tol=${tol}: ERROR - ${e.message}`)
  }
}

// Export STEP
const step = wasm.Converter.convertToStep([shape])
console.log(`\nSTEP: ${step.length} bytes (${(step.length/1024/1024).toFixed(2)} MB)`)

// Try: what if we increase sewing tolerance INSIDE tryMakeSolid?
// We can test by modifying the tolerance for each body individually
console.log('\n=== Testing per-body sewing at different tolerances ===')
for (const tol of [0.1, 1.0, 10.0]) {
  let totalFaces = 0
  for (const body of bodies) {
    const lumps = body.getLumps()
    for (const lump of lumps) {
      for (const shellEntity of lump.getShells()) {
        // Use bridge to convert the shell but sew at higher tolerance
        try {
          const singleShape = bridge.convertACISBodiesToShape(wasm, [body])
          if (singleShape) {
            const sewing = new wasm.BRepBuilderAPI_Sewing(tol, true, true, true, false)
            sewing.add(singleShape)
            sewing.perform(new wasm.Message_ProgressRange())
            totalFaces += countFaces(sewing.sewedShape())
          }
        } catch (e) {}
        break
      }
      break
    }
  }
  console.log(`Per-body sew tol=${tol}: total faces=${totalFaces}`)
}
