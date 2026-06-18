// Are the source ASM bodies topologically closed? Count coedges without a
// partner (= free/boundary edges in the source). 0 free ⇒ closed manifold.
import { readFileSync } from 'fs'; import { runInThisContext } from 'vm'; import JSZip from 'jszip'
import { fileURLToPath } from 'url'; import { dirname, join } from 'path'
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
globalThis.self = globalThis
runInThisContext(readFileSync(join(ROOT, 'public/acis-bundle.js'), 'utf-8'))
const { parseF3D } = globalThis.ACISParser
const d = readFileSync(process.argv[2]); const ab = d.buffer.slice(d.byteOffset, d.byteOffset + d.byteLength)
const bodies = await parseF3D(ab, async () => JSZip)

let totalCoedges = 0, freeCoedges = 0, totalFaces = 0
const perBody = []
for (const b of bodies) {
  let bc = 0, bf = 0, bff = 0
  for (const l of (b.getLumps ? b.getLumps() : []))
    for (const s of (l.getShells ? l.getShells() : []))
      for (const fa of (s.getFaces ? s.getFaces() : [])) {
        bf++; totalFaces++
        for (const lo of (fa.getLoops ? fa.getLoops() : []))
          for (const ce of (lo.getCoedges ? lo.getCoedges() : [])) {
            bc++; totalCoedges++
            const partner = ce.getPartner ? ce.getPartner() : null
            if (!partner) { bff++; freeCoedges++ }
          }
      }
  perBody.push({ faces: bf, coedges: bc, free: bff })
}
console.log(`bodies=${bodies.length} faces=${totalFaces} coedges=${totalCoedges} freeCoedges(no partner)=${freeCoedges}`)
console.log('bodies with free coedges:', perBody.filter(b => b.free > 0).length)

// Global edge incidence: how many coedges reference each edge (by edge index)
// across ALL bodies. 1 = true boundary; 2 = manifold (shared); >2 = non-manifold.
const edgeCount = new Map()
for (const b of bodies)
  for (const l of (b.getLumps ? b.getLumps() : []))
    for (const s of (l.getShells ? l.getShells() : []))
      for (const fa of (s.getFaces ? s.getFaces() : []))
        for (const lo of (fa.getLoops ? fa.getLoops() : []))
          for (const ce of (lo.getCoedges ? lo.getCoedges() : [])) {
            const e = ce.getEdge ? ce.getEdge() : null
            if (e && e.index != null) edgeCount.set(e.index, (edgeCount.get(e.index) || 0) + 1)
          }
const hist = {}
for (const n of edgeCount.values()) hist[n] = (hist[n] || 0) + 1
console.log('edge incidence histogram (coedges-per-edge):', JSON.stringify(hist))
console.log('=> edges referenced by exactly 1 coedge are TRUE boundaries (open in source)')
