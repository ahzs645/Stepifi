#!/usr/bin/env node
/**
 * Test script for chili-wasm - tests tessellation and F3D conversion
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const wasmPath = join(__dirname, 'public/chili-wasm/chili-wasm.js')

const initModule = (await import(wasmPath)).default

console.log('Initializing chili-wasm...')
const wasm = await initModule({
  locateFile: (file) => join(__dirname, 'public/chili-wasm', file)
})
console.log('chili-wasm loaded successfully\n')

function makeBox(wasm, x, y, z, dx, dy, dz) {
  const pln = { location: { x, y, z }, direction: { x: 0, y: 0, z: 1 }, xDirection: { x: 1, y: 0, z: 0 } }
  return wasm.ShapeFactory.box(pln, dx, dy, dz)
}

// Test tessellation on a box
console.log('=== Test: Tessellate box ===')
const box = makeBox(wasm, 0, 0, 0, 10, 10, 10)
const shape = wasm.Shape.clone(box.shape)
box.delete()

try {
  const mesher = new wasm.Mesher(shape, 0.5)
  const meshData = mesher.mesh()
  const faceMesh = meshData.faceMeshData
  console.log('  positions length:', faceMesh.position.length)
  console.log('  normals length:', faceMesh.normal.length)
  console.log('  indices length:', faceMesh.index.length)
  console.log('  triangles:', faceMesh.index.length / 3)

  // Verify data is copyable
  const positions = new Float32Array(faceMesh.position)
  const normals = new Float32Array(faceMesh.normal)
  const indices = new Uint32Array(faceMesh.index)
  console.log('  Copied positions:', positions.length)
  console.log('  Copied normals:', normals.length)
  console.log('  Copied indices:', indices.length)

  meshData.delete()
  mesher.delete()
  console.log('  PASSED')
} catch (e) {
  console.error('  FAILED:', e.message)
}

shape.delete()

// Test F3D conversion + tessellation
console.log('\n=== Test: F3D → tessellate ===')
try {
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
  console.log('  Bodies:', bodies.length)

  const { convertACISBodiesToShape } = await import(join(__dirname, 'public/converter-js/chili-geometry-bridge.js'))
  const f3dShape = convertACISBodiesToShape(wasm, bodies)

  // Tessellate for preview
  const mesher = new wasm.Mesher(f3dShape, 1.0)
  const meshData = mesher.mesh()
  const faceMesh = meshData.faceMeshData
  console.log('  Tessellation: positions=%d, indices=%d, triangles=%d',
    faceMesh.position.length, faceMesh.index.length, faceMesh.index.length / 3)

  meshData.delete()
  mesher.delete()

  // STEP export
  const step = wasm.Converter.convertToStep([f3dShape])
  console.log('  STEP export:', step.length, 'bytes')

  f3dShape.delete()
  console.log('  PASSED')
} catch (e) {
  console.error('  FAILED:', e.message)
}

console.log('\n=== Done ===')
