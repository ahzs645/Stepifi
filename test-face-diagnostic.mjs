#!/usr/bin/env node
/**
 * Diagnostic: Which ACIS faces fail conversion, and why?
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
console.log(`Bodies: ${bodies.length}`)

const bridge = await import(join(__dirname, 'public/converter-js/chili-geometry-bridge.js'))

// Convert
const shape = bridge.convertACISBodiesToShape(wasm, bodies)

// Get face stats
const stats = bridge.getFaceStats()
console.log('\n=== Face Conversion Stats ===')
console.log('Total faces attempted:', stats.total)
console.log('Surface creation failed:', stats.surfaceFail)
console.log('Approach 1 (wire+curve):', stats.approach1)
console.log('Approach 2 (straight wire):', stats.approach2)
console.log('Approach 3 (UV bounds):', stats.approach3)
console.log('Approach 4 (untrimmed):', stats.approach4)
console.log('Approach 5 (spline UV):', stats.approach5)
console.log('Total null (all approaches failed):', stats.totalNull)
console.log('Sum:', stats.approach1 + stats.approach2 + stats.approach3 + stats.approach4 + stats.approach5 + stats.surfaceFail + stats.totalNull)

console.log('\nBbox failures by approach+type:')
for (const [key, count] of Object.entries(stats.bboxFail).sort((a,b) => b[1]-a[1])) {
  console.log(`  ${key}: ${count}`)
}

console.log('\nDetailed by type:')
for (const [key, count] of Object.entries(stats.byType).sort((a,b) => b[1]-a[1])) {
  console.log(`  ${key}: ${count}`)
}

// Count final faces
function countFaces(shape) {
  let count = 0
  const explorer = new wasm.TopExp_Explorer(shape, wasm.TopAbs_ShapeEnum.TopAbs_FACE, wasm.TopAbs_ShapeEnum.TopAbs_SHAPE)
  while (explorer.more()) { count++; explorer.next() }
  return count
}
console.log('\nFinal faces in shape:', countFaces(shape))
