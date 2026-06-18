#!/usr/bin/env node
// Pinpoint where cone faces are lost: surface-creation stage vs face-building stage.
import { readFileSync, writeFileSync, unlinkSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createRequire } from 'module'
import { runInThisContext } from 'vm'
import JSZip from 'jszip'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const require = createRequire(import.meta.url)
const OC_DIR = join(ROOT, 'public/opencascade')
const INPUT = process.argv[2] || join(ROOT, 'slzb-06-wall-mount.f3d')

async function loadOpenCascade() {
  let s = readFileSync(join(OC_DIR, 'opencascade.full.js'), 'utf-8').replace(/export\s+default\s+Module\s*;?\s*$/m, '')
  const tmp = join(__dirname, '.oc-loader-diag.cjs')
  writeFileSync(tmp, `const fs=require('fs'),path=require('path');const OC_DIR=${JSON.stringify(OC_DIR)};const wasmBinary=fs.readFileSync(path.join(OC_DIR,'opencascade.full.wasm'));${s}\nmodule.exports=Module({wasmBinary,locateFile:p=>path.join(OC_DIR,p)});`)
  try { return await require(tmp) } finally { try { unlinkSync(tmp) } catch {} }
}

globalThis.self = globalThis
runInThisContext(readFileSync(join(ROOT, 'public/acis-bundle.js'), 'utf-8'))
const { parseF3D } = globalThis.ACISParser
const G = globalThis.ACISGeometry

const oc = await loadOpenCascade()
const fileData = readFileSync(INPUT)
const ab = fileData.buffer.slice(fileData.byteOffset, fileData.byteOffset + fileData.byteLength)
const bodies = await parseF3D(ab, async () => JSZip)

const tally = {}
function bump(type, stage) {
  tally[type] = tally[type] || { total: 0, surfaceOk: 0, faceOk: 0 }
  tally[type][stage]++
}

for (const body of bodies) {
  for (const lump of (body.getLumps ? body.getLumps() : [])) {
    for (const shell of (lump.getShells ? lump.getShells() : [])) {
      for (const face of (shell.getFaces ? shell.getFaces() : [])) {
        const surfEnt = face.getSurface ? face.getSurface() : null
        const type = surfEnt && surfEnt.getType ? surfEnt.getType() : 'none'
        bump(type, 'total')
        let surf = null
        try { surf = G.convertACISSurface(oc, surfEnt) } catch {}
        if (surf && !surf.IsNull?.()) bump(type, 'surfaceOk')
        let f = null
        try { f = G.convertACISFace(oc, face) } catch {}
        if (f && !f.IsNull?.()) bump(type, 'faceOk')
      }
    }
  }
}

console.log('Per-surface-type conversion success:')
console.table(tally)
