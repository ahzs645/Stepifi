import { readFileSync } from 'fs'; import { runInThisContext } from 'vm'; import JSZip from 'jszip'
import { fileURLToPath } from 'url'; import { dirname, join } from 'path'
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
globalThis.self = globalThis
runInThisContext(readFileSync(join(ROOT,'public/acis-bundle.js'),'utf-8'))
const { parseF3D } = globalThis.ACISParser
const f = process.argv[2]
const d = readFileSync(f); const ab = d.buffer.slice(d.byteOffset, d.byteOffset+d.byteLength)
const bodies = await parseF3D(ab, async()=>JSZip)
let mn=[1e18,1e18,1e18], mx=[-1e18,-1e18,-1e18], n=0
const add=(p)=>{ if(!p)return; const c=p.point?p.point:p; if(c.x==null)return; mn=[Math.min(mn[0],c.x),Math.min(mn[1],c.y),Math.min(mn[2],c.z)]; mx=[Math.max(mx[0],c.x),Math.max(mx[1],c.y),Math.max(mx[2],c.z)]; n++ }
for(const b of bodies) for(const l of (b.getLumps?b.getLumps():[])) for(const s of (l.getShells?l.getShells():[])) for(const fa of (s.getFaces?s.getFaces():[])) for(const lo of (fa.getLoops?fa.getLoops():[])) for(const ce of (lo.getCoedges?lo.getCoedges():[])){ const e=ce.getEdge?ce.getEdge():null; if(e){ add(e.getStart?e.getStart():null); add(e.getEnd?e.getEnd():null) } }
console.log('vertex samples:', n)
console.log('extent:', [mx[0]-mn[0], mx[1]-mn[1], mx[2]-mn[2]].map(v=>v.toFixed(2)).join(' x '), '(diag', Math.hypot(mx[0]-mn[0],mx[1]-mn[1],mx[2]-mn[2]).toFixed(1)+')')
