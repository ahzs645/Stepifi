#!/usr/bin/env node
/**
 * Check straight edge curve data and test parameter-based creation
 */
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const wasmPath = join(__dirname, 'public/chili-wasm/chili-wasm.js')
const initModule = (await import(wasmPath)).default
const wasm = await initModule({
  locateFile: (file) => join(__dirname, 'public/chili-wasm', file)
})

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

function makePoint(p) {
  return new wasm.gp_Pnt(p.x || 0, p.y || 0, p.z || 0)
}
function makeDirection(vec) {
  const len = Math.sqrt(vec.x**2 + vec.y**2 + vec.z**2)
  if (len < 1e-10) return new wasm.gp_Dir(0, 0, 1)
  return new wasm.gp_Dir(vec.x/len, vec.y/len, vec.z/len)
}

// Find first cone face and check its straight edges in detail
const body = bodies[0]
for (const lump of body.getLumps()) {
  for (const shell of lump.getShells()) {
    for (const face of shell.getFaces()) {
      const surf = face.getSurface()
      const type = surf && surf.getType ? surf.getType() : ''
      if (!type.includes('cone')) continue

      console.log('=== Cone face straight edges ===')
      for (const loop of face.getLoops()) {
        for (const ce of loop.getCoedges()) {
          const edge = ce.getEdge()
          if (!edge) continue
          const curve = edge.getCurve()
          const ct = curve && curve.getType ? curve.getType() : ''
          if (!ct.includes('straight')) continue

          console.log(`\nStraight edge:`)
          console.log('  curve.origin:', curve.origin)
          console.log('  curve.direction:', curve.direction)
          console.log('  edge.parameter1:', edge.parameter1)
          console.log('  edge.parameter2:', edge.parameter2)
          console.log('  edge.sense:', edge.sense)
          console.log('  coedge.sense:', ce.sense)

          // Compute actual endpoints from curve params
          const origin = curve.origin
          const dir = curve.direction
          const dirLen = Math.sqrt(dir.x**2 + dir.y**2 + dir.z**2)
          const p1x = origin.x + dir.x * edge.parameter1
          const p1y = origin.y + dir.y * edge.parameter1
          const p1z = origin.z + dir.z * edge.parameter1
          const p2x = origin.x + dir.x * edge.parameter2
          const p2y = origin.y + dir.y * edge.parameter2
          const p2z = origin.z + dir.z * edge.parameter2
          console.log(`  curve point at param1: (${p1x.toFixed(4)}, ${p1y.toFixed(4)}, ${p1z.toFixed(4)})`)
          console.log(`  curve point at param2: (${p2x.toFixed(4)}, ${p2y.toFixed(4)}, ${p2z.toFixed(4)})`)

          // Vertex positions
          const sp = edge.getStart()
          const ep = edge.getEnd()
          const sv = sp && sp.point ? sp.point : sp
          const ev = ep && ep.point ? ep.point : ep
          console.log(`  vertex start: (${sv?.x?.toFixed(4)}, ${sv?.y?.toFixed(4)}, ${sv?.z?.toFixed(4)})`)
          console.log(`  vertex end:   (${ev?.x?.toFixed(4)}, ${ev?.y?.toFixed(4)}, ${ev?.z?.toFixed(4)})`)

          // Create edge from curve + params
          const occOrigin = makePoint(origin)
          const occDir = makeDirection(dir)
          const ax1 = new wasm.gp_Ax1(occOrigin, occDir)
          const geomLine = new wasm.Geom_Line(ax1)
          const h = new wasm.Handle_Geom_Curve(geomLine)

          try {
            const builder = new wasm.BRepBuilderAPI_MakeEdge(h, edge.parameter1, edge.parameter2)
            if (builder.isDone()) {
              const occEdge = builder.edge()
              const bb = new wasm.Bnd_Box()
              wasm.BRepBndLib.add(occEdge, bb)
              const b = bb.get()
              console.log(`  Param edge bbox: (${b.xmin.toFixed(4)},${b.ymin.toFixed(4)},${b.zmin.toFixed(4)}) → (${b.xmax.toFixed(4)},${b.ymax.toFixed(4)},${b.zmax.toFixed(4)})`)
            } else {
              console.log('  Param edge: NOT DONE')
            }
          } catch (e) {
            console.log(`  Param edge ERROR: ${e.message}`)
          }

          // Also check the raw record chunks
          console.log('  Raw curve chunks:')
          const chunks = curve.record?.chunks || []
          for (let ci = 0; ci < chunks.length; ci++) {
            const c = chunks[ci]
            console.log(`    [${ci}] tag=${c.tag} type=${c.type||'?'} val=${JSON.stringify(c.val)?.slice(0,100)}`)
          }
        }
      }
      process.exit(0)
    }
  }
}
