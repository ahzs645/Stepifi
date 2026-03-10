#!/usr/bin/env node
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

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

// Check first body, first shell, first few faces
const body = bodies[0]
const lumps = body.getLumps()
const shells = lumps[0].getShells()
const faces = shells[0].getFaces()

for (let i = 0; i < Math.min(5, faces.length); i++) {
  const face = faces[i]
  const surface = face.getSurface ? face.getSurface() : null
  console.log(`\nFace ${i}:`)
  console.log('  __name__:', surface?.__name__)
  console.log('  type:', surface?.type)
  console.log('  getType exists:', typeof surface?.getType)
  if (surface?.getType) {
    try { console.log('  getType():', surface.getType()) } catch(e) { console.log('  getType() error:', e.message) }
  }
  console.log('  constructor:', surface?.constructor?.name)
}

// Check single-face body (sphere)
const singleBody = bodies[1]
const sLumps = singleBody.getLumps()
const sShells = sLumps[0].getShells()
const sFaces = sShells[0].getFaces()
const sSurf = sFaces[0].getSurface()
console.log('\n--- Single face body (sphere) ---')
console.log('  __name__:', sSurf?.__name__)
console.log('  getType exists:', typeof sSurf?.getType)
if (sSurf?.getType) {
  try { console.log('  getType():', sSurf.getType()) } catch(e) { console.log('  getType() error:', e.message) }
}
console.log('  center:', sSurf?.center)
console.log('  radius:', sSurf?.radius)
