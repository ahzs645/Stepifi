#!/usr/bin/env node
/**
 * Deep diagnostic: Why do cone face wires fail?
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

// Helper functions
function clampCoord(val) {
  const v = val || 0
  if (!isFinite(v) || Math.abs(v) > 1e10) return 0
  return v
}
function makePoint(p) {
  if (!p) return new wasm.gp_Pnt(0, 0, 0)
  return new wasm.gp_Pnt(clampCoord(p.x), clampCoord(p.y), clampCoord(p.z))
}
function makeDirection(vec) {
  if (!vec) return new wasm.gp_Dir(0, 0, 1)
  const len = Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z)
  if (len < 1e-10) return new wasm.gp_Dir(0, 0, 1)
  return new wasm.gp_Dir(vec.x / len, vec.y / len, vec.z / len)
}

// Find first cone face and examine its edges in detail
let coneFace = null
let coneFaceIdx = 0
for (const body of bodies) {
  const lumps = body.getLumps()
  for (const lump of lumps) {
    for (const shell of lump.getShells()) {
      const faces = shell.getFaces()
      for (let fi = 0; fi < faces.length; fi++) {
        const face = faces[fi]
        const surf = face.getSurface ? face.getSurface() : null
        const type = surf && surf.getType ? surf.getType() : ''
        if (type.includes('cone')) {
          coneFace = face
          coneFaceIdx = fi
          break
        }
      }
      if (coneFace) break
    }
    if (coneFace) break
  }
  if (coneFace) break
}

if (!coneFace) { console.log('No cone face found'); process.exit(1) }

console.log(`=== Cone Face ${coneFaceIdx} ===`)
const surf = coneFace.getSurface()
console.log('Surface type:', surf.getType())
console.log('center:', surf.center)
console.log('axis:', surf.axis)
console.log('sine:', surf.sine, 'cosine:', surf.cosine)
console.log('major:', surf.major)
console.log('sense:', coneFace.sense)

const loops = coneFace.getLoops()
console.log('Loops:', loops.length)

for (let li = 0; li < loops.length; li++) {
  const loop = loops[li]
  const coedges = loop.getCoedges()
  console.log(`\nLoop ${li}: ${coedges.length} coedges`)

  for (let ci = 0; ci < coedges.length; ci++) {
    const coedge = coedges[ci]
    const edge = coedge.getEdge()
    if (!edge) { console.log(`  Coedge ${ci}: no edge`); continue }

    const startPt = edge.getStart()
    const endPt = edge.getEnd()
    const sv = startPt && startPt.point ? startPt.point : startPt
    const ev = endPt && endPt.point ? endPt.point : endPt
    const curve = edge.getCurve()
    const curveType = curve && curve.getType ? curve.getType() : 'none'

    console.log(`  Coedge ${ci}: curve=${curveType}, sense=${coedge.sense}, edgeSense=${edge.sense}`)
    console.log(`    start: ${sv ? `(${sv.x?.toFixed(4)}, ${sv.y?.toFixed(4)}, ${sv.z?.toFixed(4)})` : 'null'}`)
    console.log(`    end:   ${ev ? `(${ev.x?.toFixed(4)}, ${ev.y?.toFixed(4)}, ${ev.z?.toFixed(4)})` : 'null'}`)
    console.log(`    param1: ${edge.parameter1}, param2: ${edge.parameter2}`)

    // Try creating the edge
    if (sv && ev) {
      const dx = (ev.x||0)-(sv.x||0), dy = (ev.y||0)-(sv.y||0), dz = (ev.z||0)-(sv.z||0)
      const dist = Math.sqrt(dx*dx+dy*dy+dz*dz)
      console.log(`    vertex distance: ${dist.toFixed(6)}`)

      if (dist < 1e-6) {
        console.log('    SKIP: degenerate (start==end)')
        continue
      }

      if (curveType !== 'none' && !curveType.includes('straight')) {
        // Build the curve
        let occCurve = null
        if (curveType.includes('ellipse')) {
          const center = makePoint(curve.center)
          const normal = makeDirection(curve.axis)
          const majorVec = curve.major || { x: 1, y: 0, z: 0 }
          const majorAxis = makeDirection(majorVec)
          const majorRadius = Math.sqrt(majorVec.x ** 2 + majorVec.y ** 2 + majorVec.z ** 2) || 1.0
          const ratio = curve.ratio || 1.0
          const minorRadius = majorRadius * ratio
          const ax2 = new wasm.gp_Ax2(center, normal, majorAxis)
          if (Math.abs(ratio - 1.0) < 1e-6) {
            const gpCirc = new wasm.gp_Circ(ax2, majorRadius)
            occCurve = new wasm.Geom_Circle(gpCirc)
            console.log(`    Circle: R=${majorRadius.toFixed(4)}`)
          } else {
            const gpElips = new wasm.gp_Elips(ax2, majorRadius, minorRadius)
            occCurve = new wasm.Geom_Ellipse(gpElips)
            console.log(`    Ellipse: R1=${majorRadius.toFixed(4)}, R2=${minorRadius.toFixed(4)}`)
          }
        } else if (curveType.includes('intcurve') || curveType.includes('spline')) {
          console.log(`    Spline curve - skipping detailed check`)
          continue
        }

        if (occCurve) {
          const h = new wasm.Handle_Geom_Curve(occCurve)
          const p1 = edge.parameter1
          const p2 = edge.parameter2

          // Try parameter-based trim
          if (p1 !== undefined && p2 !== undefined && Math.abs(p2 - p1) > 1e-12) {
            try {
              const builder = new wasm.BRepBuilderAPI_MakeEdge(h, p1, p2)
              console.log(`    Param trim (${p1.toFixed(6)}, ${p2.toFixed(6)}): isDone=${builder.isDone()}`)
              if (builder.isDone()) {
                const edge = builder.edge()
                console.log(`    SUCCESS: parameter-based edge created`)
              }
            } catch (e) {
              console.log(`    Param trim FAILED: ${e.message}`)
            }
          } else {
            console.log(`    No valid parameters: p1=${p1}, p2=${p2}`)
          }

          // Try full curve
          try {
            const builder = new wasm.BRepBuilderAPI_MakeEdge(h)
            console.log(`    Full curve: isDone=${builder.isDone()}`)
          } catch (e) {
            console.log(`    Full curve FAILED: ${e.message}`)
          }
        }
      } else {
        console.log(`    Straight line edge`)
      }
    }
  }

  // Now try building the wire
  console.log(`\n  Wire construction test:`)
  const wireBuilder = new wasm.BRepBuilderAPI_MakeWire()
  let edgesAdded = 0

  for (const coedge of coedges) {
    const edge = coedge.getEdge()
    if (!edge) continue
    const sp = edge.getStart()
    const ep = edge.getEnd()
    const sv = sp && sp.point ? sp.point : sp
    const ev = ep && ep.point ? ep.point : ep
    if (!sv || !ev) continue
    const dx = (ev.x||0)-(sv.x||0), dy = (ev.y||0)-(sv.y||0), dz = (ev.z||0)-(sv.z||0)
    if (Math.sqrt(dx*dx+dy*dy+dz*dz) < 1e-6) continue

    const curve = edge.getCurve()
    const curveType = curve && curve.getType ? curve.getType() : 'none'

    let occEdge = null
    if (curveType !== 'none' && !curveType.includes('straight')) {
      let occCurve = null
      if (curveType.includes('ellipse')) {
        const center = makePoint(curve.center)
        const normal = makeDirection(curve.axis)
        const majorVec = curve.major || { x: 1, y: 0, z: 0 }
        const majorAxis = makeDirection(majorVec)
        const majorRadius = Math.sqrt(majorVec.x**2 + majorVec.y**2 + majorVec.z**2) || 1.0
        const ratio = curve.ratio || 1.0
        const minorRadius = majorRadius * ratio
        const ax2 = new wasm.gp_Ax2(center, normal, majorAxis)
        if (Math.abs(ratio - 1.0) < 1e-6) {
          occCurve = new wasm.Geom_Circle(new wasm.gp_Circ(ax2, majorRadius))
        } else {
          occCurve = new wasm.Geom_Ellipse(new wasm.gp_Elips(ax2, majorRadius, minorRadius))
        }
      } else if (curveType.includes('straight')) {
        const origin = makePoint(curve.origin)
        const dir = makeDirection(curve.direction)
        occCurve = new wasm.Geom_Line(new wasm.gp_Ax1(origin, dir))
      } else if (curveType.includes('intcurve') || curveType.includes('spline')) {
        // Skip for now
      }

      if (occCurve) {
        const h = new wasm.Handle_Geom_Curve(occCurve)
        const p1 = edge.parameter1
        const p2 = edge.parameter2
        if (p1 !== undefined && p2 !== undefined && Math.abs(p2 - p1) > 1e-12) {
          try {
            const b = new wasm.BRepBuilderAPI_MakeEdge(h, p1, p2)
            if (b.isDone()) occEdge = b.edge()
          } catch (e) {}
        }
        if (!occEdge) {
          try {
            const b = new wasm.BRepBuilderAPI_MakeEdge(h)
            if (b.isDone()) occEdge = b.edge()
          } catch (e) {}
        }
      }
    }

    if (!occEdge) {
      // Straight line fallback
      try {
        const b = new wasm.BRepBuilderAPI_MakeEdge(makePoint(sv), makePoint(ev))
        if (b.isDone()) occEdge = b.edge()
      } catch (e) {}
    }

    if (occEdge) {
      if (coedge.sense === 'reversed') occEdge.reverse()
      try {
        wireBuilder.add(occEdge)
        edgesAdded++
      } catch (e) {
        console.log(`    Wire add failed: ${e.message}`)
      }
    }
  }

  console.log(`  Edges added: ${edgesAdded}/${coedges.length}`)
  console.log(`  Wire isDone: ${wireBuilder.isDone()}`)
  try {
    const wire = wireBuilder.wire()
    console.log(`  Wire created: ${wire ? 'yes' : 'no'}`)
  } catch (e) {
    console.log(`  Wire creation failed: ${e.message}`)
  }
}
