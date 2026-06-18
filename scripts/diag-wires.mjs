#!/usr/bin/env node
// Wire/edge connectivity diagnostic per surface type: where in the
// edge->loop->wire->face chain do cone faces die?
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
  const tmp = join(__dirname, '.oc-loader-w.cjs')
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
function row(t) { return (tally[t] = tally[t] || { faces: 0, outerCoedges: 0, edgesOk: 0, wireOk: 0, wireClosed: 0 }) }

for (const body of bodies) {
  for (const lump of (body.getLumps ? body.getLumps() : [])) {
    for (const shell of (lump.getShells ? lump.getShells() : [])) {
      for (const face of (shell.getFaces ? shell.getFaces() : [])) {
        const surfEnt = face.getSurface ? face.getSurface() : null
        const t = surfEnt && surfEnt.getType ? surfEnt.getType() : 'none'
        const r = row(t)
        r.faces++
        const loops = face.getLoops ? face.getLoops() : []
        if (!loops.length) continue
        const coedges = loops[0].getCoedges ? loops[0].getCoedges() : []
        r.outerCoedges += coedges.length
        let edgesOk = 0
        const wb = new oc.BRepBuilderAPI_MakeWire_1()
        for (const ce of coedges) {
          const ee = ce.getEdge ? ce.getEdge() : null
          let edge = null
          try { edge = G.convertACISEdge(oc, ee) } catch {}
          if (edge && !edge.IsNull?.()) {
            edgesOk++
            try { wb.Add_1(edge) } catch {}
          }
        }
        r.edgesOk += edgesOk
        let wire = null
        try { if (wb.IsDone()) wire = wb.Wire() } catch {}
        if (wire && !wire.IsNull?.()) {
          r.wireOk++
          try { if (wire.Closed_1 ? wire.Closed_1() : wire.Closed?.()) r.wireClosed++ } catch {}
        }
      }
    }
  }
}

console.log('Edge/wire connectivity per surface type (outer loop only):')
console.table(tally)
