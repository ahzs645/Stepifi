#!/usr/bin/env node
/**
 * Check: where are the actual endpoints of circle edges vs straight edges?
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
  if (!p) return new wasm.gp_Pnt(0, 0, 0)
  return new wasm.gp_Pnt(p.x || 0, p.y || 0, p.z || 0)
}
function makeDirection(vec) {
  if (!vec) return new wasm.gp_Dir(0, 0, 1)
  const len = Math.sqrt(vec.x**2 + vec.y**2 + vec.z**2)
  if (len < 1e-10) return new wasm.gp_Dir(0, 0, 1)
  return new wasm.gp_Dir(vec.x/len, vec.y/len, vec.z/len)
}

// Find first 3 cone faces from body 0
const body = bodies[0]
const lumps = body.getLumps()
let coneCount = 0
for (const lump of lumps) {
  for (const shell of lump.getShells()) {
    for (const face of shell.getFaces()) {
      const surf = face.getSurface()
      const type = surf && surf.getType ? surf.getType() : ''
      if (!type.includes('cone')) continue
      if (coneCount >= 3) continue
      coneCount++

      console.log(`\n=== Cone Face ${coneCount} ===`)
      console.log(`Surface: center=(${surf.center.x.toFixed(2)}, ${surf.center.y.toFixed(2)}, ${surf.center.z.toFixed(2)})`)
      console.log(`  axis=(${surf.axis.x}, ${surf.axis.y}, ${surf.axis.z})`)
      console.log(`  major=(${surf.major.x.toFixed(6)}, ${surf.major.y.toFixed(6)}, ${surf.major.z.toFixed(6)}) |major|=${Math.sqrt(surf.major.x**2+surf.major.y**2+surf.major.z**2).toFixed(6)}`)
      console.log(`  sine=${surf.sine} cosine=${surf.cosine}`)
      if (surf.scale !== undefined) console.log(`  scale=${surf.scale}`)
      if (surf.ratio !== undefined) console.log(`  ratio=${surf.ratio}`)

      const loops = face.getLoops()
      for (const loop of loops) {
        const coedges = loop.getCoedges()
        console.log(`  Loop: ${coedges.length} coedges`)
        for (let ci = 0; ci < coedges.length; ci++) {
          const ce = coedges[ci]
          const edge = ce.getEdge()
          if (!edge) continue
          const sp = edge.getStart()
          const ep = edge.getEnd()
          const sv = sp && sp.point ? sp.point : sp
          const ev = ep && ep.point ? ep.point : ep
          const curve = edge.getCurve()
          const ct = curve && curve.getType ? curve.getType() : 'none'

          console.log(`  Edge ${ci}: ${ct}, coedge.sense=${ce.sense}, edge.sense=${edge.sense}`)
          if (sv) console.log(`    vertex.start=(${sv.x?.toFixed(4)}, ${sv.y?.toFixed(4)}, ${sv.z?.toFixed(4)})`)
          if (ev) console.log(`    vertex.end  =(${ev.x?.toFixed(4)}, ${ev.y?.toFixed(4)}, ${ev.z?.toFixed(4)})`)
          console.log(`    params=(${edge.parameter1}, ${edge.parameter2})`)

          if (ct.includes('ellipse') && curve) {
            console.log(`    curve.center=(${curve.center?.x?.toFixed(4)}, ${curve.center?.y?.toFixed(4)}, ${curve.center?.z?.toFixed(4)})`)
            console.log(`    curve.axis=(${curve.axis?.x}, ${curve.axis?.y}, ${curve.axis?.z})`)
            const mvec = curve.major || {x:1,y:0,z:0}
            const mr = Math.sqrt(mvec.x**2+mvec.y**2+mvec.z**2)
            console.log(`    curve.major=(${mvec.x?.toFixed(6)}, ${mvec.y?.toFixed(6)}, ${mvec.z?.toFixed(6)}) R=${mr.toFixed(4)}`)
            console.log(`    curve.ratio=${curve.ratio}`)

            // Evaluate the circle at parameter1 and parameter2
            const center = makePoint(curve.center)
            const normal = makeDirection(curve.axis)
            const majorDir = makeDirection(mvec)
            const ax2 = new wasm.gp_Ax2(center, normal, majorDir)
            const ratio = curve.ratio || 1.0
            const minR = mr * ratio

            let geomCurve
            if (Math.abs(ratio - 1.0) < 1e-6) {
              geomCurve = new wasm.Geom_Circle(new wasm.gp_Circ(ax2, mr))
            } else {
              geomCurve = new wasm.Geom_Ellipse(new wasm.gp_Elips(ax2, mr, minR))
            }

            // Evaluate at parameters
            const h = new wasm.Handle_Geom_Curve(geomCurve)
            try {
              const builder = new wasm.BRepBuilderAPI_MakeEdge(h, edge.parameter1, edge.parameter2)
              if (builder.isDone()) {
                const occEdge = builder.edge()
                // Get the actual 3D endpoints of this edge
                const bb = new wasm.Bnd_Box()
                wasm.BRepBndLib.add(occEdge, bb)
                const bounds = bb.get()
                console.log(`    Edge bbox: (${bounds.xmin.toFixed(4)},${bounds.ymin.toFixed(4)},${bounds.zmin.toFixed(4)}) → (${bounds.xmax.toFixed(4)},${bounds.ymax.toFixed(4)},${bounds.zmax.toFixed(4)})`)
              }
            } catch (e) {
              console.log(`    Edge creation failed: ${e.message}`)
            }
          }
        }
      }
    }
  }
}

// Also: check what the cone face looks like with approach 3 (UV bounds)
// Print surface uRange/vRange from the ACIS data
console.log('\n=== Checking cone surface ranges ===')
coneCount = 0
for (const lump of body.getLumps()) {
  for (const shell of lump.getShells()) {
    for (const face of shell.getFaces()) {
      const surf = face.getSurface()
      const type = surf && surf.getType ? surf.getType() : ''
      if (!type.includes('cone')) continue
      if (coneCount >= 3) continue
      coneCount++
      if (surf.uRange) console.log(`Cone ${coneCount} uRange:`, surf.uRange)
      if (surf.vRange) console.log(`Cone ${coneCount} vRange:`, surf.vRange)
      if (surf.range) console.log(`Cone ${coneCount} range:`, JSON.stringify(surf.range))
    }
  }
}
