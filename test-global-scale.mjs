#!/usr/bin/env node
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const acisCode = readFileSync(join(__dirname, 'public/acis-bundle.js'), 'utf-8')

// Patch getScale to log its value
const patched = acisCode.replace(
  'function getScale() {',
  'function getScale() { if (!getScale._logged && _reader) { getScale._logged = true; console.log("GLOBAL SCALE:", _reader.scale || _scale); }'
)

const self = { ACISParser: null }
new Function('self', patched)(self)

const jszipCode = readFileSync(join(__dirname, 'node_modules/jszip/dist/jszip.min.js'), 'utf-8')
const loadJSZip = async () => {
  const module = { exports: {} }
  new Function('module', 'exports', jszipCode)(module, module.exports)
  return module.exports
}

const f3dData = readFileSync(join(__dirname, 'slzb-06-wall-mount.f3d')).buffer
const bodies = await self.ACISParser.parseF3D(f3dData, loadJSZip)
console.log('Bodies:', bodies.length)

// Also check: what does the ellipse curve parser do?
// Check CurveEllipse class
const body = bodies[0]
for (const lump of body.getLumps()) {
  for (const shell of lump.getShells()) {
    for (const face of shell.getFaces()) {
      for (const loop of face.getLoops()) {
        for (const ce of loop.getCoedges()) {
          const edge = ce.getEdge()
          if (!edge) continue
          const curve = edge.getCurve()
          if (!curve) continue
          const ct = curve.getType ? curve.getType() : ''
          if (ct.includes('ellipse')) {
            console.log('\nEllipse curve raw data:')
            // Print all non-private properties
            for (const key of Object.keys(curve)) {
              if (!key.startsWith('_') && typeof curve[key] !== 'function') {
                console.log(`  ${key}:`, curve[key])
              }
            }
            process.exit(0)
          }
        }
      }
    }
  }
}
