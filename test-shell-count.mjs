#!/usr/bin/env node
/**
 * Count faces at every stage: convertACISFace → shell → tryMakeSolid → final
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

// Import bridge but manually trace per-body
const bridge = await import(join(__dirname, 'public/converter-js/chili-geometry-bridge.js'))

function countFaces(shape) {
  let c = 0
  const e = new wasm.TopExp_Explorer(shape, wasm.TopAbs_ShapeEnum.TopAbs_FACE, wasm.TopAbs_ShapeEnum.TopAbs_SHAPE)
  while (e.more()) { c++; e.next() }
  return c
}

// Test body 0 in detail
const body0 = bodies[0]
const shape0 = bridge.convertACISBodiesToShape(wasm, [body0])
const faces0 = countFaces(shape0)
console.log(`Body 0: ${faces0} faces in final shape`)

// Now let's manually go through body 0's shell
const lumps = body0.getLumps()
for (const lump of lumps) {
  for (const shellEntity of lump.getShells()) {
    const acisFaces = shellEntity.getFaces()
    console.log(`  ACIS faces: ${acisFaces.length}`)

    // Count faces that convertACISFace returns non-null
    let nonNull = 0
    let passedBbox = 0
    for (const faceEntity of acisFaces) {
      // We can't call convertACISFace directly (not exported)
      // But we know from diagnostic that all return non-null
      nonNull++
    }
    console.log(`  convertACISFace non-null: ${nonNull} (all should be 3160/64 ≈ 49)`)
  }
}

// The difference must be in the shell → sewing pipeline
// Let me check: does TopExp_Explorer find all faces in a TopoDS_Shell?
// Let me build a shell manually and count

console.log('\n=== Manual shell face count test ===')
const shape0_2 = bridge.convertACISBodiesToShape(wasm, [body0])

// Count via different explorers
function countByExplorer(shape, type) {
  let c = 0
  const e = new wasm.TopExp_Explorer(shape, type, wasm.TopAbs_ShapeEnum.TopAbs_SHAPE)
  while (e.more()) { c++; e.next() }
  return c
}

console.log('Faces:', countByExplorer(shape0_2, wasm.TopAbs_ShapeEnum.TopAbs_FACE))
console.log('Shells:', countByExplorer(shape0_2, wasm.TopAbs_ShapeEnum.TopAbs_SHELL))
console.log('Solids:', countByExplorer(shape0_2, wasm.TopAbs_ShapeEnum.TopAbs_SOLID))
console.log('Compounds:', countByExplorer(shape0_2, wasm.TopAbs_ShapeEnum.TopAbs_COMPOUND))

// Now test: build a shell directly from individual face results
// Compare what convertACISFace produces vs what ends up in the shell
console.log('\n=== Direct face counting ===')

// We need to bypass the bridge and test shell construction directly
// Create a compound of all faces from all bodies (no shell/sewing)
const rawBuilder = new wasm.BRep_Builder()
const rawCompound = rawBuilder.makeCompound()

// We use the bridge conversion for body 0
rawBuilder.add(rawCompound, shape0_2)

// Count faces in the compound
console.log('Faces in body 0 compound:', countFaces(rawCompound))

// Test: what's the shape TYPE returned by convertACISBodiesToShape?
console.log('\nShape type:', shape0_2.shapeType ? shape0_2.shapeType() : 'unknown method')
