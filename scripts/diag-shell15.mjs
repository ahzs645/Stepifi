// Examine the largest OPEN shell: its faces (surface types) and free edges.
// For each free edge report bbox center + curve, then cluster free edges by
// center to see if they're unmerged coincident pairs (fixable) or true boundaries.
import { readFileSync, writeFileSync, unlinkSync } from 'fs'
import { fileURLToPath } from 'url'; import { dirname, join } from 'path'
import { createRequire } from 'module'; import { runInThisContext } from 'vm'; import JSZip from 'jszip'
const __dirname = dirname(fileURLToPath(import.meta.url)); const ROOT = join(__dirname, '..')
const require = createRequire(import.meta.url); const OC_DIR = join(ROOT, 'public/opencascade')
async function loadOC(){ let s=readFileSync(join(OC_DIR,'opencascade.full.js'),'utf-8').replace(/export\s+default\s+Module\s*;?\s*$/m,''); const tmp=join(__dirname,'.ocsh.cjs'); writeFileSync(tmp,`const fs=require('fs'),path=require('path');const OC_DIR=${JSON.stringify(OC_DIR)};const wasmBinary=fs.readFileSync(path.join(OC_DIR,'opencascade.full.wasm'));${s}\nmodule.exports=Module({wasmBinary,locateFile:p=>path.join(OC_DIR,p)});`); try{return await require(tmp)}finally{try{unlinkSync(tmp)}catch{}} }
globalThis.self=globalThis; runInThisContext(readFileSync(join(ROOT,'public/acis-bundle.js'),'utf-8'))
const G=globalThis.ACISGeometry, { parseF3D }=globalThis.ACISParser
const oc=await loadOC()
function count(shape,type){let n=0;const e=new oc.TopExp_Explorer_2(shape,type,oc.TopAbs_ShapeEnum.TopAbs_SHAPE);while(e.More()){n++;e.Next()}return n}
function box(s){const bb=new oc.Bnd_Box_1();oc.BRepBndLib.Add(s,bb,false);if(bb.IsVoid())return null;const a={current:0},b={current:0},c={current:0},d={current:0},e={current:0},f={current:0};bb.Get(a,b,c,d,e,f);return{c:[(a.current+d.current)/2,(b.current+e.current)/2,(c.current+f.current)/2],sz:Math.hypot(d.current-a.current,e.current-b.current,f.current-c.current)}}
function surfType(face){ try{ const s=oc.BRep_Tool.Surface_2(face); const dt=s.get().DynamicType().get().Name(); return dt.replace('Geom_','') }catch(e){return '?'} }
const d=readFileSync(process.argv[2]); const ab=d.buffer.slice(d.byteOffset,d.byteOffset+d.byteLength)
const bodies=await parseF3D(ab, async()=>JSZip)
const shape=G.convertACISBodiesToShape(oc,bodies)
// find open shells, pick the one with most faces
let best=null,bestN=0
const she=new oc.TopExp_Explorer_2(shape,oc.TopAbs_ShapeEnum.TopAbs_SHELL,oc.TopAbs_ShapeEnum.TopAbs_SHAPE)
while(she.More()){ const sh=oc.TopoDS.Shell_1(she.Current()); let closed=false; try{closed=sh.Closed_1?sh.Closed_1():false}catch{}; if(!closed){ const n=count(sh,oc.TopAbs_ShapeEnum.TopAbs_FACE); if(n>bestN){bestN=n;best=sh} } she.Next() }
if(!best){ console.log('no open shell'); process.exit(0) }
console.log(`largest open shell: ${bestN} faces`)
const types={}; const fe=new oc.TopExp_Explorer_2(best,oc.TopAbs_ShapeEnum.TopAbs_FACE,oc.TopAbs_ShapeEnum.TopAbs_SHAPE); while(fe.More()){ const t=surfType(oc.TopoDS.Face_1(fe.Current())); types[t]=(types[t]||0)+1; fe.Next() }
console.log('face surface types:', JSON.stringify(types))
// Collect free edges across ALL open shells (so we can detect a body that got
// SPLIT across two open shells — its partner edge would be in a different shell).
const allFree=[]
const she2=new oc.TopExp_Explorer_2(shape,oc.TopAbs_ShapeEnum.TopAbs_SHELL,oc.TopAbs_ShapeEnum.TopAbs_SHAPE)
while(she2.More()){ const sh=oc.TopoDS.Shell_1(she2.Current()); let closed=false; try{closed=sh.Closed_1?sh.Closed_1():false}catch{}; if(!closed){ const sa=new oc.ShapeAnalysis_Shell(); sa.LoadShells(sh); sa.CheckOrientedShells(sh,true,false); if(sa.HasFreeEdges()){ const fc=sa.FreeEdges(); const ee=new oc.TopExp_Explorer_2(fc,oc.TopAbs_ShapeEnum.TopAbs_EDGE,oc.TopAbs_ShapeEnum.TopAbs_SHAPE); while(ee.More()){ const b=box(ee.Current()); if(b)allFree.push(b); ee.Next() } } } she2.Next() }
console.log(`\ntotal free edges across all ${count(shape,oc.TopAbs_ShapeEnum.TopAbs_SHELL)} shells: ${allFree.length}`)
const used=new Array(allFree.length).fill(false); let pairs=0,singles=0; const pairDists=[]
for(let i=0;i<allFree.length;i++){ if(used[i])continue; let partner=-1,best2=1e9; for(let j=i+1;j<allFree.length;j++){ if(used[j])continue; const dd=Math.hypot(allFree[i].c[0]-allFree[j].c[0],allFree[i].c[1]-allFree[j].c[1],allFree[i].c[2]-allFree[j].c[2])+Math.abs(allFree[i].sz-allFree[j].sz); if(dd<best2){best2=dd;partner=j} } if(partner>=0 && best2<1.0){ used[i]=used[partner]=true; pairs++; pairDists.push(best2) } else { singles++ } }
console.log(`global clustering: ${pairs} coincident pairs (unmerged - FIXABLE), ${singles} singletons (true boundaries - source-open)`)
if(pairDists.length) console.log('pair gap+sizediff:', pairDists.map(x=>x.toFixed(3)).join(', '))
