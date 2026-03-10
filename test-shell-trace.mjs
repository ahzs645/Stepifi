#!/usr/bin/env node
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const wasmPath = join(__dirname, 'public/chili-wasm/chili-wasm.js')
const initModule = (await import(wasmPath)).default
const wasm = await initModule({ locateFile: (f) => join(__dirname, 'public/chili-wasm', f) })

const acisCode = readFileSync(join(__dirname, 'public/acis-bundle.js'), 'utf-8')
const self = { ACISParser: null }
new Function('self', acisCode)(self)

const jszipCode = readFileSync(join(__dirname, 'node_modules/jszip/dist/jszip.min.js'), 'utf-8')
const loadJSZip = async () => { const m={exports:{}}; new Function('module','exports',jszipCode)(m,m.exports); return m.exports }

const f3dData = readFileSync(join(__dirname, 'slzb-06-wall-mount.f3d')).buffer
const bodies = await self.ACISParser.parseF3D(f3dData, loadJSZip)

const bridge = await import(join(__dirname, 'public/converter-js/chili-geometry-bridge.js'))
const shape = bridge.convertACISBodiesToShape(wasm, [bodies[0]])

let fc = 0
const e = new wasm.TopExp_Explorer(shape, wasm.TopAbs_ShapeEnum.TopAbs_FACE, wasm.TopAbs_ShapeEnum.TopAbs_SHAPE)
while (e.more()) { fc++; e.next() }
console.log('Final faces:', fc)
