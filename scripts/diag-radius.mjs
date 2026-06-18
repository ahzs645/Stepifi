import { readFileSync } from 'fs'; import { runInThisContext } from 'vm'; import JSZip from 'jszip'
import { fileURLToPath } from 'url'; import { dirname, join } from 'path'
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
globalThis.self = globalThis
runInThisContext(readFileSync(join(ROOT,'public/acis-bundle.js'),'utf-8'))
const { parseF3D } = globalThis.ACISParser
const d = readFileSync(process.argv[2]); const ab=d.buffer.slice(d.byteOffset,d.byteOffset+d.byteLength)
const bodies = await parseF3D(ab, async()=>JSZip)
const dist=(a,b)=>Math.hypot((a.x||0)-(b.x||0),(a.y||0)-(b.y||0),(a.z||0)-(b.z||0))
const len=(p)=>p?Math.hypot(p.x||0,p.y||0,p.z||0):0
let n=0, mismatch=0
const ratios=[]
for(const b of bodies) for(const l of (b.getLumps?b.getLumps():[])) for(const s of (l.getShells?l.getShells():[])) for(const fa of (s.getFaces?s.getFaces():[])) for(const lo of (fa.getLoops?fa.getLoops():[])) for(const ce of (lo.getCoedges?lo.getCoedges():[])){
  const e=ce.getEdge?ce.getEdge():null; if(!e)continue
  const cv=e.getCurve?e.getCurve():null; if(!cv||!(cv.getType&&cv.getType().includes('ellipse')))continue
  let sp=e.getStart?e.getStart():null; if(sp&&sp.point)sp=sp.point; if(!sp||!cv.center)continue
  const rFromVertex=dist(cv.center,sp), rFromMajor=len(cv.major)
  n++
  if(rFromMajor>1e-9){ const ratio=rFromVertex/rFromMajor; ratios.push(ratio); if(Math.abs(ratio-1)>0.05) mismatch++ }
}
ratios.sort((a,b)=>a-b)
console.log('ellipse edges:', n, ' mismatched(>5%):', mismatch)
console.log('ratio (dist(center,vertex) / len(major)) distribution:')
console.log('  min', ratios[0]?.toFixed(3), 'median', ratios[Math.floor(ratios.length/2)]?.toFixed(3), 'max', ratios[ratios.length-1]?.toFixed(3))
const buckets={}; for(const r of ratios){ const k=r<0.5?'<0.5':r<1.5?'~1':r<5?'1.5-5':r<15?'5-15':'>15'; buckets[k]=(buckets[k]||0)+1 }
console.log('  buckets', JSON.stringify(buckets))
