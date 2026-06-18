import { readFileSync, writeFileSync, unlinkSync } from 'fs'
import { fileURLToPath } from 'url'; import { dirname, join } from 'path'
import { createRequire } from 'module'; import { runInThisContext } from 'vm'; import JSZip from 'jszip'
const __dirname = dirname(fileURLToPath(import.meta.url)); const ROOT = join(__dirname, '..')
const require = createRequire(import.meta.url); const OC_DIR = join(ROOT, 'public/opencascade')
async function loadOC(){ let s=readFileSync(join(OC_DIR,'opencascade.full.js'),'utf-8').replace(/export\s+default\s+Module\s*;?\s*$/m,''); const tmp=join(__dirname,'.oco.cjs'); writeFileSync(tmp,`const fs=require('fs'),path=require('path');const OC_DIR=${JSON.stringify(OC_DIR)};const wasmBinary=fs.readFileSync(path.join(OC_DIR,'opencascade.full.wasm'));${s}\nmodule.exports=Module({wasmBinary,locateFile:p=>path.join(OC_DIR,p)});`); try{return await require(tmp)}finally{try{unlinkSync(tmp)}catch{}} }
globalThis.self=globalThis; runInThisContext(readFileSync(join(ROOT,'public/acis-bundle.js'),'utf-8'))
const G=globalThis.ACISGeometry, { parseF3D }=globalThis.ACISParser
const oc=await loadOC()
function count(shape, type){ let n=0; const e=new oc.TopExp_Explorer_2(shape, type, oc.TopAbs_ShapeEnum.TopAbs_SHAPE); while(e.More()){n++;e.Next()} return n }
const d=readFileSync(process.argv[2]); const ab=d.buffer.slice(d.byteOffset,d.byteOffset+d.byteLength)
const bodies=await parseF3D(ab, async()=>JSZip)
const shape = G.convertACISBodiesToShape(oc, bodies)
const she = new oc.TopExp_Explorer_2(shape, oc.TopAbs_ShapeEnum.TopAbs_SHELL, oc.TopAbs_ShapeEnum.TopAbs_SHAPE)
let openIdx=0
while(she.More()){
  const shell = oc.TopoDS.Shell_1(she.Current())
  let closed=false; try{closed=shell.Closed_1?shell.Closed_1():false}catch{}
  if(!closed){
    const nFaces = count(shell, oc.TopAbs_ShapeEnum.TopAbs_FACE)
    let nFree = 0
    try { const sas=new oc.ShapeAnalysis_Shell(); sas.LoadShells(shell); sas.CheckOrientedShells(shell, true, false); if(sas.HasFreeEdges()) nFree = count(sas.FreeEdges(), oc.TopAbs_ShapeEnum.TopAbs_EDGE) } catch(e){ nFree='err:'+e.message }
    console.log(`OPEN shell #${++openIdx}: ${nFaces} faces, ${nFree} free edges`)
  }
  she.Next()
}
console.log(`solids=${count(shape, oc.TopAbs_ShapeEnum.TopAbs_SOLID)}`)
