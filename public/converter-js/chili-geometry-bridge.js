/**
 * Chili-WASM Geometry Bridge
 * Converts ACIS parsed entities to OpenCascade shapes using chili-wasm API
 * Adapted from acis-js/geometry-builder.js for chili-wasm's embind API
 *
 * Key API differences from opencascade.js:
 * - No numbered constructor suffixes (gp_Pnt vs gp_Pnt_3)
 * - camelCase methods (isDone vs IsDone, edge vs Edge)
 * - BRep_Builder uses return-value pattern (makeShell() returns shell)
 * - Bnd_Box.get() returns {xmin,ymin,zmin,xmax,ymax,zmax} object
 */

// ============================================================================
// Basic Geometry Helpers
// ============================================================================

const MAX_COORD = 1e10

function clampCoord(val) {
  const v = val || 0
  if (!isFinite(v) || Math.abs(v) > MAX_COORD) return 0
  return v
}

function makePoint(wasm, p) {
  if (!p) return new wasm.gp_Pnt(0, 0, 0)
  return new wasm.gp_Pnt(clampCoord(p.x), clampCoord(p.y), clampCoord(p.z))
}

function makeDirection(wasm, vec) {
  if (!vec) return new wasm.gp_Dir(0, 0, 1)
  const len = Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z)
  if (len < 1e-10) return new wasm.gp_Dir(0, 0, 1)
  return new wasm.gp_Dir(vec.x / len, vec.y / len, vec.z / len)
}

function makeAx1(wasm, origin, direction) {
  return new wasm.gp_Ax1(makePoint(wasm, origin), makeDirection(wasm, direction))
}

function makeAx2(wasm, origin, zDir, xDir) {
  const pnt = makePoint(wasm, origin)
  const z = makeDirection(wasm, zDir)
  if (xDir) {
    const x = makeDirection(wasm, xDir)
    return new wasm.gp_Ax2(pnt, z, x)
  }
  return new wasm.gp_Ax2(pnt, z)
}

function makeAx3(wasm, origin, axis, refDir) {
  const pnt = makePoint(wasm, origin)
  const z = makeDirection(wasm, axis)
  if (refDir) {
    const x = makeDirection(wasm, refDir)
    return new wasm.gp_Ax3(pnt, z, x)
  }
  return new wasm.gp_Ax3(pnt, z)
}

// ============================================================================
// Array Helpers
// ============================================================================

function polesToArray1OfPnt(wasm, poles) {
  const arr = new wasm.TColgp_Array1OfPnt(1, poles.length)
  for (let i = 0; i < poles.length; i++) {
    const p = poles[i]
    arr.setValue(i + 1, new wasm.gp_Pnt(clampCoord(p.x), clampCoord(p.y), clampCoord(p.z)))
  }
  return arr
}

function polesToArray1OfPnt2d(wasm, poles) {
  const arr = new wasm.TColgp_Array1OfPnt2d(1, poles.length)
  for (let i = 0; i < poles.length; i++) {
    const p = poles[i]
    const u = p.x !== undefined ? p.x : (p.u !== undefined ? p.u : 0)
    const v = p.y !== undefined ? p.y : (p.v !== undefined ? p.v : 0)
    arr.setValue(i + 1, new wasm.gp_Pnt2d(clampCoord(u), clampCoord(v)))
  }
  return arr
}

function polesToArray2OfPnt(wasm, poles) {
  const uSize = poles.length
  const vSize = poles[0].length
  const arr = new wasm.TColgp_Array2OfPnt(1, uSize, 1, vSize)
  for (let u = 0; u < uSize; u++) {
    for (let v = 0; v < vSize; v++) {
      const p = poles[u][v]
      arr.setValue(u + 1, v + 1, new wasm.gp_Pnt(clampCoord(p.x), clampCoord(p.y), clampCoord(p.z)))
    }
  }
  return arr
}

function knotsToArray1OfReal(wasm, knots) {
  const arr = new wasm.TColStd_Array1OfReal(1, knots.length)
  for (let i = 0; i < knots.length; i++) {
    arr.setValue(i + 1, knots[i])
  }
  return arr
}

function multsToArray1OfInteger(wasm, mults) {
  const arr = new wasm.TColStd_Array1OfInteger(1, mults.length)
  for (let i = 0; i < mults.length; i++) {
    arr.setValue(i + 1, mults[i])
  }
  return arr
}

function weightsToArray1OfReal(wasm, weights) {
  const arr = new wasm.TColStd_Array1OfReal(1, weights.length)
  for (let i = 0; i < weights.length; i++) {
    arr.setValue(i + 1, weights[i])
  }
  return arr
}

function weightsToArray2OfReal(wasm, weights) {
  const uSize = weights.length
  const vSize = weights[0].length
  const arr = new wasm.TColStd_Array2OfReal(1, uSize, 1, vSize)
  for (let u = 0; u < uSize; u++) {
    for (let v = 0; v < vSize; v++) {
      arr.setValue(u + 1, v + 1, weights[u][v])
    }
  }
  return arr
}

// ============================================================================
// Basic Curve Builders
// ============================================================================

function createLine(wasm, start, end) {
  if (!start || !end) return null
  try {
    const dx = end.x - start.x, dy = end.y - start.y, dz = end.z - start.z
    if (Math.sqrt(dx * dx + dy * dy + dz * dz) < 1e-10) return null
    const p1 = makePoint(wasm, start)
    const p2 = makePoint(wasm, end)
    const builder = new wasm.BRepBuilderAPI_MakeEdge(p1, p2)
    if (builder.isDone()) return builder.edge()
  } catch (e) {
    console.warn('createLine failed:', e.message)
  }
  return null
}

// ============================================================================
// B-Spline Curve Builder
// ============================================================================

function createBSplineCurve(wasm, nubs, sense = 'forward') {
  if (!nubs || !nubs.poles || nubs.poles.length === 0) return null
  if (!nubs.uKnots || nubs.uKnots.length === 0 || !nubs.uMults || nubs.uMults.length === 0) return null
  if (!nubs.uDegree || nubs.uDegree < 1) return null
  if (nubs.poles.length === 2) return createLine(wasm, nubs.poles[0], nubs.poles[1])

  try {
    const poles = polesToArray1OfPnt(wasm, nubs.poles)
    const knots = knotsToArray1OfReal(wasm, nubs.uKnots)
    const mults = multsToArray1OfInteger(wasm, nubs.uMults)
    const degree = nubs.uDegree

    // ACIS may mark curves as periodic that have clamped end knots (mult=degree+1).
    // OCC rejects periodic curves with non-periodic knot structure. Detect and fix.
    let periodic = nubs.uPeriodic || false
    if (periodic && nubs.uMults.length >= 2) {
      const firstMult = nubs.uMults[0]
      const lastMult = nubs.uMults[nubs.uMults.length - 1]
      if (firstMult === degree + 1 || lastMult === degree + 1) {
        periodic = false  // clamped end knots → non-periodic
      }
    }

    let curve
    if (nubs.rational && nubs.weights && nubs.weights.length > 0) {
      const weights = weightsToArray1OfReal(wasm, nubs.weights)
      curve = new wasm.Geom_BSplineCurve(poles, weights, knots, mults, degree, periodic)
    } else {
      curve = new wasm.Geom_BSplineCurve(poles, knots, mults, degree, periodic)
    }

    if (sense === 'reversed') curve.reverse()
    return curve
  } catch (e) {
    if (nubs.poles.length >= 2) {
      return createLine(wasm, nubs.poles[0], nubs.poles[nubs.poles.length - 1])
    }
  }
  return null
}

function createBSplineCurve2d(wasm, nubs) {
  if (!nubs || !nubs.poles || nubs.poles.length === 0) return null
  try {
    const poles = polesToArray1OfPnt2d(wasm, nubs.poles)
    const knots = knotsToArray1OfReal(wasm, nubs.uKnots)
    const mults = multsToArray1OfInteger(wasm, nubs.uMults)
    const degree = nubs.uDegree
    const periodic = nubs.uPeriodic || false

    if (nubs.rational && nubs.weights && nubs.weights.length > 0) {
      const weights = weightsToArray1OfReal(wasm, nubs.weights)
      return new wasm.Geom2d_BSplineCurve(poles, weights, knots, mults, degree, periodic)
    }
    return new wasm.Geom2d_BSplineCurve(poles, knots, mults, degree, periodic)
  } catch (e) {
    console.warn('createBSplineCurve2d failed:', e.message)
  }
  return null
}

// ============================================================================
// B-Spline Surface Builder
// ============================================================================

function createBSplineSurface(wasm, nubs) {
  if (!nubs || !nubs.poles || nubs.poles.length === 0) return null
  if (!Array.isArray(nubs.poles[0])) return null

  try {
    const poles = polesToArray2OfPnt(wasm, nubs.poles)
    const uKnots = knotsToArray1OfReal(wasm, nubs.uKnots)
    const vKnots = knotsToArray1OfReal(wasm, nubs.vKnots)
    const uMults = multsToArray1OfInteger(wasm, nubs.uMults)
    const vMults = multsToArray1OfInteger(wasm, nubs.vMults)
    const uDeg = nubs.uDegree, vDeg = nubs.vDegree
    const uPer = nubs.uPeriodic || false, vPer = nubs.vPeriodic || false

    if (nubs.rational && nubs.weights && nubs.weights.length > 0) {
      const weights = weightsToArray2OfReal(wasm, nubs.weights)
      return new wasm.Geom_BSplineSurface(poles, weights, uKnots, vKnots, uMults, vMults, uDeg, vDeg, uPer, vPer)
    }
    return new wasm.Geom_BSplineSurface(poles, uKnots, vKnots, uMults, vMults, uDeg, vDeg, uPer, vPer)
  } catch (e) {
    console.warn('createBSplineSurface failed:', e.message)
    try {
      const poles = polesToArray2OfPnt(wasm, nubs.poles)
      const uKnots = knotsToArray1OfReal(wasm, nubs.uKnots)
      const vKnots = knotsToArray1OfReal(wasm, nubs.vKnots)
      const uMults = multsToArray1OfInteger(wasm, nubs.uMults)
      const vMults = multsToArray1OfInteger(wasm, nubs.vMults)
      return new wasm.Geom_BSplineSurface(poles, uKnots, vKnots, uMults, vMults, nubs.uDegree, nubs.vDegree, false, false)
    } catch (e2) {}
  }
  return null
}

// ============================================================================
// PCurve Builder
// ============================================================================

function createBSplinePCurve(wasm, pcurve, surface, sense = 'forward') {
  if (!pcurve || !surface) return null
  try {
    const curve2d = createBSplineCurve2d(wasm, pcurve)
    if (!curve2d) return null
    const handleCurve2d = new wasm.Handle_Geom2d_Curve(curve2d)
    const handleSurface = new wasm.Handle_Geom_Surface(surface)
    const edge = wasm.BRepBuilderAPI_MakeEdge.fromPCurve(handleCurve2d, handleSurface)
    if (!edge.isNull()) {
      if (sense === 'reversed') edge.reverse()
      return edge
    }
  } catch (e) {
    console.warn('createBSplinePCurve failed:', e.message)
  }
  return null
}

// ============================================================================
// Helix Builder
// ============================================================================

function createHelixCurve(wasm, helix) {
  if (!helix) return null
  try {
    const points = helix.buildPoints ? helix.buildPoints() : []
    if (points.length < 2) return null

    const hArr = new wasm.TColgp_HArray1OfPnt(1, points.length)
    for (let i = 0; i < points.length; i++) {
      hArr.setValue(i + 1, new wasm.gp_Pnt(points[i].x, points[i].y, points[i].z))
    }

    const interp = new wasm.GeomAPI_Interpolate(
      new wasm.Handle_TColgp_HArray1OfPnt(hArr), false, 1e-6
    )
    interp.perform()

    if (interp.isDone()) {
      const curve = interp.curve()
      const handleCurve = new wasm.Handle_Geom_Curve(curve.get())
      const builder = new wasm.BRepBuilderAPI_MakeEdge(handleCurve)
      if (builder.isDone()) return builder.edge()
    }
  } catch (e) {
    console.warn('createHelixCurve failed:', e.message)
  }
  return null
}

// ============================================================================
// Surface Builders
// ============================================================================

function createPlaneSurface(wasm, origin, normal) {
  if (!origin || !normal) return null
  try {
    const pnt = makePoint(wasm, origin)
    const dir = makeDirection(wasm, normal)
    const gpPln = new wasm.gp_Pln(pnt, dir)
    return new wasm.Geom_Plane(gpPln)
  } catch (e) {
    console.warn('createPlaneSurface failed:', e.message)
  }
  return null
}

function createCylindricalSurface(wasm, center, axis, radius) {
  if (!center || !axis || radius <= 0) return null
  try {
    return new wasm.Geom_CylindricalSurface(makeAx3(wasm, center, axis), radius)
  } catch (e) {
    console.warn('createCylindricalSurface failed:', e.message)
  }
  return null
}

function createConicalSurface(wasm, center, axis, radius, semiAngle) {
  if (!center || !axis || radius <= 0) return null
  try {
    const ax3 = makeAx3(wasm, center, axis)
    if (Math.abs(semiAngle) < 1e-6) return new wasm.Geom_CylindricalSurface(ax3, radius)
    return new wasm.Geom_ConicalSurface(ax3, semiAngle, radius)
  } catch (e) {
    console.warn('createConicalSurface failed:', e.message)
  }
  return null
}

function createSphericalSurface(wasm, center, radius) {
  if (!center || radius <= 0) return null
  try {
    return new wasm.Geom_SphericalSurface(makeAx3(wasm, center, { x: 0, y: 0, z: 1 }), radius)
  } catch (e) {
    console.warn('createSphericalSurface failed:', e.message)
  }
  return null
}

function createToroidalSurface(wasm, center, axis, majorRadius, minorRadius) {
  if (!center || !axis || majorRadius <= 0 || minorRadius <= 0) return null
  try {
    return new wasm.Geom_ToroidalSurface(makeAx3(wasm, center, axis), majorRadius, minorRadius)
  } catch (e) {
    console.warn('createToroidalSurface failed:', e.message)
  }
  return null
}

function createSurfaceOfRevolution(wasm, profile, location, direction) {
  if (!profile || !location || !direction) return null
  try {
    const axis = makeAx1(wasm, location, direction)
    const handleCurve = new wasm.Handle_Geom_Curve(profile)
    return new wasm.Geom_SurfaceOfRevolution(handleCurve, axis)
  } catch (e) {
    console.warn('createSurfaceOfRevolution failed:', e.message)
  }
  return null
}

function createRuledSurface(wasm, curve1, curve2) {
  if (!curve1 || !curve2) return null
  try {
    const hc1 = new wasm.Handle_Geom_Curve(curve1)
    const hc2 = new wasm.Handle_Geom_Curve(curve2)
    const b1 = new wasm.BRepBuilderAPI_MakeEdge(hc1)
    const b2 = new wasm.BRepBuilderAPI_MakeEdge(hc2)
    if (!b1.isDone() || !b2.isDone()) return null
    const w1 = new wasm.BRepBuilderAPI_MakeWire(b1.edge())
    const w2 = new wasm.BRepBuilderAPI_MakeWire(b2.edge())
    const loft = new wasm.BRepOffsetAPI_ThruSections(false, true)
    loft.addWire(w1.wire())
    loft.addWire(w2.wire())
    loft.build()
    if (loft.isDone()) return loft.shape()
  } catch (e) {
    console.warn('createRuledSurface failed:', e.message)
  }
  return null
}

function createOffsetSurface(wasm, baseSurface, offset) {
  if (!baseSurface) return null
  try {
    const h = new wasm.Handle_Geom_Surface(baseSurface)
    return new wasm.Geom_OffsetSurface(h, offset, true)
  } catch (e) {
    console.warn('createOffsetSurface failed:', e.message)
  }
  return null
}

// ============================================================================
// Face/Edge Builders
// ============================================================================

function createFaceFromSurface(wasm, surface, tolerance = 1e-6) {
  if (!surface) return null
  try {
    const h = new wasm.Handle_Geom_Surface(surface)
    const builder = new wasm.BRepBuilderAPI_MakeFace(h, tolerance)
    if (builder.isDone()) return builder.face()
  } catch (e) {
    console.warn('createFaceFromSurface failed:', e.message)
  }
  return null
}

function createEdgeFromCurve(wasm, curve, u1, u2) {
  if (!curve) return null
  try {
    const h = new wasm.Handle_Geom_Curve(curve)
    let builder
    if (u1 !== undefined && u2 !== undefined) {
      builder = new wasm.BRepBuilderAPI_MakeEdge(h, u1, u2)
    } else {
      builder = new wasm.BRepBuilderAPI_MakeEdge(h)
    }
    if (builder.isDone()) return builder.edge()
  } catch (e) {
    console.warn('createEdgeFromCurve failed:', e.message)
  }
  return null
}

// ============================================================================
// ACIS Entity Converters
// ============================================================================

function convertACISSurface(wasm, surfaceEntity) {
  if (!surfaceEntity) return null
  try {
    const typeName = surfaceEntity.getType ? surfaceEntity.getType() : ''

    if (typeName.includes('plane')) {
      return createPlaneSurface(wasm, surfaceEntity.origin, surfaceEntity.normal)
    } else if (typeName.includes('cone')) {
      const sine = surfaceEntity.sine || 0
      const cosine = surfaceEntity.cosine || 1
      const semiAngle = Math.abs(Math.asin(Math.max(-1, Math.min(1, sine))))
      const major = surfaceEntity.major || { x: 1, y: 0, z: 0 }
      const radius = Math.sqrt(major.x * major.x + major.y * major.y + major.z * major.z) || 1.0

      // Match Python Acis2Step: negate axis when cosine * sine < 0
      let axisDir = surfaceEntity.axis
      if (cosine * sine < 0) {
        axisDir = { x: -axisDir.x, y: -axisDir.y, z: -axisDir.z }
      }
      const ax3 = makeAx3(wasm, surfaceEntity.center, axisDir, major)
      if (Math.abs(sine) < 1e-6) return new wasm.Geom_CylindricalSurface(ax3, radius)
      return new wasm.Geom_ConicalSurface(ax3, semiAngle, radius)
    } else if (typeName.includes('sphere')) {
      // Use pole direction from ACIS entity as sphere axis (matching Python Acis2Step)
      const pole = surfaceEntity.pole || { x: 0, y: 0, z: 1 }
      const radius = surfaceEntity.radius || 1.0
      try {
        return new wasm.Geom_SphericalSurface(makeAx3(wasm, surfaceEntity.center, pole), radius)
      } catch (e) {
        return createSphericalSurface(wasm, surfaceEntity.center, radius)
      }
    } else if (typeName.includes('torus')) {
      const majorRadius = Math.abs(surfaceEntity.major) || 2.0
      const minorRadius = Math.abs(surfaceEntity.minor) || 0.5
      return createToroidalSurface(wasm, surfaceEntity.center, surfaceEntity.axis, majorRadius, minorRadius)
    } else if (typeName.includes('spline')) {
      // Production ACIS bundle uses .spline, not .nubs
      const splineData = surfaceEntity.spline || surfaceEntity.nubs
      if (splineData) return createBSplineSurface(wasm, splineData)
      // Spline surface may reference another surface type
      if (surfaceEntity.surface) {
        return convertACISSurface(wasm, surfaceEntity.surface)
      }
    }
    console.warn('Unsupported surface type: ' + typeName)
  } catch (e) {
    console.warn('Failed to convert surface:', e.message)
  }
  return null
}

function convertACISCurve(wasm, curveEntity, startPt, endPt) {
  if (!curveEntity) return null
  try {
    const typeName = curveEntity.getType ? curveEntity.getType() : ''

    if (typeName.includes('straight')) {
      const origin = makePoint(wasm, curveEntity.origin)
      const direction = makeDirection(wasm, curveEntity.direction)
      const ax1 = new wasm.gp_Ax1(origin, direction)
      // Use Geom_Line(gp_Ax1) directly - chili-wasm doesn't need gp_Lin intermediate
      return new wasm.Geom_Line(ax1)
    } else if (typeName.includes('ellipse')) {
      const center = makePoint(wasm, curveEntity.center)
      const normal = makeDirection(wasm, curveEntity.axis)
      const majorVec = curveEntity.major || { x: 1, y: 0, z: 0 }
      const majorAxis = makeDirection(wasm, majorVec)
      const majorRadius = Math.sqrt(majorVec.x ** 2 + majorVec.y ** 2 + majorVec.z ** 2) || 1.0
      const ratio = curveEntity.ratio || 1.0
      const minorRadius = majorRadius * ratio

      const ax2 = new wasm.gp_Ax2(center, normal, majorAxis)

      if (Math.abs(ratio - 1.0) < 1e-6) {
        const gpCirc = new wasm.gp_Circ(ax2, majorRadius)
        return new wasm.Geom_Circle(gpCirc)
      } else {
        const gpElips = new wasm.gp_Elips(ax2, majorRadius, minorRadius)
        return new wasm.Geom_Ellipse(gpElips)
      }
    } else if (typeName.includes('intcurve') || typeName.includes('spline')) {
      const splineData = curveEntity.spline || curveEntity.nubs
      if (splineData) return createBSplineCurve(wasm, splineData, 'forward')
    }

    // Fallback: line between endpoints
    if (startPt && endPt) {
      const p1 = makePoint(wasm, startPt)
      const dir = makeDirection(wasm, {
        x: endPt.x - startPt.x, y: endPt.y - startPt.y, z: endPt.z - startPt.z
      })
      const ax1 = new wasm.gp_Ax1(p1, dir)
      return new wasm.Geom_Line(ax1)
    }
    console.warn('Unsupported curve type: ' + typeName)
  } catch (e) {
    console.warn('Failed to convert curve:', e.message)
  }
  return null
}

function convertACISEdge(wasm, edgeEntity) {
  if (!edgeEntity) return null
  try {
    const curveEntity = edgeEntity.getCurve ? edgeEntity.getCurve() : null
    const startPt = edgeEntity.getStart ? edgeEntity.getStart() : null
    const endPt = edgeEntity.getEnd ? edgeEntity.getEnd() : null
    const startVertex = startPt && startPt.point ? startPt.point : startPt
    const endVertex = endPt && endPt.point ? endPt.point : endPt

    if (startVertex && endVertex) {
      const p1 = makePoint(wasm, startVertex)
      const p2 = makePoint(wasm, endVertex)
      const dx = (endVertex.x || 0) - (startVertex.x || 0)
      const dy = (endVertex.y || 0) - (startVertex.y || 0)
      const dz = (endVertex.z || 0) - (startVertex.z || 0)
      if (Math.sqrt(dx * dx + dy * dy + dz * dz) < 1e-6) return null

      const typeName = curveEntity && curveEntity.getType ? curveEntity.getType() : ''
      if (typeName && !typeName.includes('straight')) {
        const curve = convertACISCurve(wasm, curveEntity, startVertex, endVertex)
        if (curve) {
          const h = new wasm.Handle_Geom_Curve(curve)
          // Use parameter-based trimming (ACIS edge has parameter1/parameter2)
          // chili-wasm binding: BRepBuilderAPI_MakeEdge(Handle_Geom_Curve, double, double)
          const param1 = edgeEntity.parameter1
          const param2 = edgeEntity.parameter2
          if (param1 !== undefined && param2 !== undefined && Math.abs(param2 - param1) > 1e-12) {
            try {
              const builder = new wasm.BRepBuilderAPI_MakeEdge(h, param1, param2)
              if (builder.isDone()) {
                const edge = builder.edge()
                if (edgeEntity.sense === 'reversed') edge.reverse()
                return edge
              }
            } catch (e) { /* parameter-based trim failed */ }
          }
          // Fallback: full curve edge
          try {
            const builder = new wasm.BRepBuilderAPI_MakeEdge(h)
            if (builder.isDone()) {
              const edge = builder.edge()
              if (edgeEntity.sense === 'reversed') edge.reverse()
              return edge
            }
          } catch (e) { /* full curve edge also failed */ }
        }
      }

      // Straight line or fallback
      try {
        const builder = new wasm.BRepBuilderAPI_MakeEdge(p1, p2)
        if (builder.isDone()) {
          const edge = builder.edge()
          if (edgeEntity.sense === 'reversed') edge.reverse()
          return edge
        }
      } catch (e) {}
    }

    // No valid endpoints - try curve only
    const curve = convertACISCurve(wasm, curveEntity, startVertex, endVertex)
    if (curve) {
      try {
        const h = new wasm.Handle_Geom_Curve(curve)
        const builder = new wasm.BRepBuilderAPI_MakeEdge(h)
        if (builder.isDone()) {
          const edge = builder.edge()
          if (edgeEntity.sense === 'reversed') edge.reverse()
          return edge
        }
      } catch (e) {}
    }
  } catch (e) {
    console.warn('Failed to convert edge:', e.message)
  }
  return null
}

function convertACISLoop(wasm, loopEntity) {
  if (!loopEntity) return null
  try {
    const coedges = loopEntity.getCoedges ? loopEntity.getCoedges() : []
    if (coedges.length === 0) return null

    const wireBuilder = new wasm.BRepBuilderAPI_MakeWire()
    let edgesAdded = 0

    for (const coedge of coedges) {
      const edgeEntity = coedge.getEdge ? coedge.getEdge() : null
      const edge = convertACISEdge(wasm, edgeEntity)
      if (edge) {
        if (coedge.sense === 'reversed') edge.reverse()
        try {
          wireBuilder.add(edge)
          edgesAdded++
        } catch (e) { /* edge might not connect */ }
      }
    }

    if (edgesAdded === 0) return null
    if (wireBuilder.isDone()) return wireBuilder.wire()
    try {
      const wire = wireBuilder.wire()
      if (wire && !wire.isNull()) return wire
    } catch (e) {}
  } catch (e) {
    console.warn('Failed to convert loop:', e.message)
  }
  return null
}

/**
 * Collect all edge endpoint coordinates from a face's loops
 */
function collectFaceEndpoints(faceEntity) {
  const points = []
  const loops = faceEntity.getLoops ? faceEntity.getLoops() : []
  for (const loop of loops) {
    const coedges = loop.getCoedges ? loop.getCoedges() : []
    for (const coedge of coedges) {
      const edge = coedge.getEdge ? coedge.getEdge() : null
      if (!edge) continue
      const sp = edge.getStart ? edge.getStart() : null
      const ep = edge.getEnd ? edge.getEnd() : null
      const sv = sp && sp.point ? sp.point : sp
      const ev = ep && ep.point ? ep.point : ep
      if (sv && isFinite(sv.x) && isFinite(sv.y) && isFinite(sv.z)) points.push(sv)
      if (ev && isFinite(ev.x) && isFinite(ev.y) && isFinite(ev.z)) points.push(ev)
    }
  }
  return points
}

/**
 * Compute UV bounds for a cylinder/cone surface from edge endpoints.
 * Projects 3D points into the surface's parametric (u,v) space.
 *
 * OCC cylinder S(u,v) = Center + R*cos(u)*XDir + R*sin(u)*YDir + v*Axis
 * OCC cone    S(u,v) = Center + (R + v*sin(α))*(cos(u)*XDir + sin(u)*YDir) + v*cos(α)*Axis
 */
function computeCylinderConeUVBounds(surfaceEntity, points) {
  if (points.length < 2) return null

  const center = surfaceEntity.center
  const axisRaw = surfaceEntity.axis
  if (!center || !axisRaw) return null

  // Normalize axis
  const aLen = Math.sqrt(axisRaw.x ** 2 + axisRaw.y ** 2 + axisRaw.z ** 2)
  if (aLen < 1e-10) return null
  const axis = { x: axisRaw.x / aLen, y: axisRaw.y / aLen, z: axisRaw.z / aLen }

  // Compute XDir from the major vector (reference direction of gp_Ax3)
  const majorRaw = surfaceEntity.major || { x: 1, y: 0, z: 0 }
  let xDir
  if (typeof majorRaw === 'object' && majorRaw.x !== undefined) {
    const mLen = Math.sqrt(majorRaw.x ** 2 + majorRaw.y ** 2 + majorRaw.z ** 2)
    if (mLen < 1e-10) return null
    // Project major onto plane perpendicular to axis (gp_Ax3 does this internally)
    const dot = (majorRaw.x * axis.x + majorRaw.y * axis.y + majorRaw.z * axis.z) / mLen
    let xRaw = { x: majorRaw.x / mLen - dot * axis.x, y: majorRaw.y / mLen - dot * axis.y, z: majorRaw.z / mLen - dot * axis.z }
    const xLen = Math.sqrt(xRaw.x ** 2 + xRaw.y ** 2 + xRaw.z ** 2)
    if (xLen < 1e-10) return null
    xDir = { x: xRaw.x / xLen, y: xRaw.y / xLen, z: xRaw.z / xLen }
  } else {
    return null
  }

  // YDir = Axis × XDir
  const yDir = {
    x: axis.y * xDir.z - axis.z * xDir.y,
    y: axis.z * xDir.x - axis.x * xDir.z,
    z: axis.x * xDir.y - axis.y * xDir.x
  }

  const sine = surfaceEntity.sine || 0
  const cosine = surfaceEntity.cosine || 1
  const semiAngle = Math.atan2(Math.abs(sine), Math.abs(cosine))
  const isCylinder = Math.abs(sine) < 1e-6

  // Project each point
  const angles = []
  const vParams = []

  for (const p of points) {
    const dx = p.x - center.x
    const dy = p.y - center.y
    const dz = p.z - center.z

    // Height along axis
    const vAxis = dx * axis.x + dy * axis.y + dz * axis.z

    // v parameter: for cylinder v = vAxis, for cone v = vAxis / cos(α)
    const v = isCylinder ? vAxis : (Math.abs(Math.cos(semiAngle)) > 1e-10 ? vAxis / Math.cos(semiAngle) : vAxis)
    vParams.push(v)

    // Projection onto base plane
    const px = dx * xDir.x + dy * xDir.y + dz * xDir.z
    const py = dx * yDir.x + dy * yDir.y + dz * yDir.z
    const u = Math.atan2(py, px)
    angles.push(u)
  }

  if (angles.length === 0) return null

  // Compute V bounds (simple min/max)
  const vMin = Math.min(...vParams)
  const vMax = Math.max(...vParams)
  if (vMax - vMin < 1e-10) return null

  // Compute U bounds — handle angular wrap-around
  // Sort angles, find the largest gap, set range to exclude that gap
  const sorted = [...angles].sort((a, b) => a - b)
  let maxGap = 0
  let gapStart = 0
  for (let i = 0; i < sorted.length - 1; i++) {
    const gap = sorted[i + 1] - sorted[i]
    if (gap > maxGap) { maxGap = gap; gapStart = i }
  }
  // Also check wrap-around gap
  const wrapGap = (2 * Math.PI) - (sorted[sorted.length - 1] - sorted[0])
  let uMin, uMax
  if (wrapGap > maxGap) {
    // Largest gap is the wrap-around → range is [sorted[0], sorted[last]]
    uMin = sorted[0]
    uMax = sorted[sorted.length - 1]
  } else {
    // Largest gap is in the middle → range wraps around
    uMin = sorted[gapStart + 1]
    uMax = sorted[gapStart] + 2 * Math.PI
  }

  // Add small padding
  const uPad = (uMax - uMin) * 0.01 || 0.01
  const vPad = (vMax - vMin) * 0.01 || 0.01

  return {
    uMin: uMin - uPad,
    uMax: uMax + uPad,
    vMin: vMin - vPad,
    vMax: vMax + vPad
  }
}

function isFaceBboxValid(wasm, face) {
  try {
    const bb = new wasm.Bnd_Box()
    wasm.BRepBndLib.add(face, bb)
    if (bb.isVoid()) return false
    const b = bb.get()
    const MAX = 1e10
    return Math.abs(b.xmin) < MAX && Math.abs(b.xmax) < MAX &&
           Math.abs(b.ymin) < MAX && Math.abs(b.ymax) < MAX &&
           Math.abs(b.zmin) < MAX && Math.abs(b.zmax) < MAX
  } catch (e) { return false }
}

/**
 * Compute UV bounds from the best available source:
 * 1. Edge endpoint projection (for cylinder/cone)
 * 2. Spline knot ranges
 * 3. Surface explicit range data
 */
function computeUVBounds(surfaceEntity, faceEntity, typeName) {
  // Source 1: Edge endpoint projection (cylinder/cone)
  if (typeName.includes('cone')) {
    const pts = collectFaceEndpoints(faceEntity)
    const bounds = computeCylinderConeUVBounds(surfaceEntity, pts)
    if (bounds) return bounds
  }

  // Source 2: Spline knot ranges
  const nubs = surfaceEntity && (surfaceEntity.spline || surfaceEntity.nubs)
  if (nubs) {
    let uMin, uMax, vMin, vMax
    if (nubs.uKnots && nubs.uKnots.length >= 2) {
      uMin = nubs.uKnots[0]; uMax = nubs.uKnots[nubs.uKnots.length - 1]
    }
    if (nubs.vKnots && nubs.vKnots.length >= 2) {
      vMin = nubs.vKnots[0]; vMax = nubs.vKnots[nubs.vKnots.length - 1]
    }
    if (uMin !== undefined && vMin !== undefined && uMax > uMin && vMax > vMin) {
      return { uMin, uMax, vMin, vMax }
    }
  }

  // Source 3: Explicit range from surface entity
  if (surfaceEntity && surfaceEntity.range) {
    const range = surfaceEntity.range
    let uMin, uMax, vMin, vMax
    if (range.uRange) { uMin = range.uRange.lower; uMax = range.uRange.upper }
    if (range.vRange) { vMin = range.vRange.lower; vMax = range.vRange.upper }
    if (uMin !== undefined && vMin !== undefined && uMax > uMin && vMax > vMin) {
      return { uMin, uMax, vMin, vMax }
    }
  }

  return null
}

function convertACISFace(wasm, faceEntity) {
  if (!faceEntity) return null
  try {
    const surfaceEntity = faceEntity.getSurface ? faceEntity.getSurface() : null
    const surface = convertACISSurface(wasm, surfaceEntity)
    if (!surface) return null

    const handleSurface = new wasm.Handle_Geom_Surface(surface)
    const loops = faceEntity.getLoops ? faceEntity.getLoops() : []

    // Compute effective sense (matches Python Acis2Step behavior):
    // - Cone: flip when cosine < 0
    // - Torus: flip when minor radius < 0
    const typeName = surfaceEntity && surfaceEntity.getType ? surfaceEntity.getType() : ''
    let shouldReverse = (faceEntity.sense === 'reversed')
    if (typeName.includes('cone') && surfaceEntity.cosine < 0) {
      shouldReverse = !shouldReverse
    } else if (typeName.includes('torus') && surfaceEntity.minor < 0) {
      shouldReverse = !shouldReverse
    }

    function applyAndReturn(result) {
      if (shouldReverse) result.reverse()
      return result
    }

    // PRIMARY: Wire-based face with full curve reconstruction
    if (loops.length > 0) {
      const outerWire = convertACISLoop(wasm, loops[0])
      if (outerWire) {
        try {
          const faceBuilder = new wasm.BRepBuilderAPI_MakeFace(handleSurface, 1e-6)
          faceBuilder.add(outerWire)
          for (let i = 1; i < loops.length; i++) {
            const innerWire = convertACISLoop(wasm, loops[i])
            if (innerWire) {
              innerWire.reverse()
              faceBuilder.add(innerWire)
            }
          }
          if (faceBuilder.isDone()) {
            const result = faceBuilder.face()
            if (isFaceBboxValid(wasm, result)) return applyAndReturn(result)
          }
        } catch (e) { /* wire-based face failed */ }
      }
    }

    // FALLBACK: UV-bounded face from best available bounds source
    const bounds = computeUVBounds(surfaceEntity, faceEntity, typeName)
    if (bounds) {
      try {
        const freshSurface = convertACISSurface(wasm, surfaceEntity)
        const freshHandle = freshSurface ? new wasm.Handle_Geom_Surface(freshSurface) : handleSurface
        const faceBuilder = new wasm.BRepBuilderAPI_MakeFace(
          freshHandle, bounds.uMin, bounds.uMax, bounds.vMin, bounds.vMax, 1e-6
        )
        if (faceBuilder.isDone()) {
          const result = faceBuilder.face()
          if (isFaceBboxValid(wasm, result)) return applyAndReturn(result)
        }
      } catch (e) { /* UV bounds face failed */ }
    }

    // LAST RESORT: Untrimmed face from surface natural bounds (skip planes)
    if (!typeName.includes('plane')) {
      try {
        const faceBuilder = new wasm.BRepBuilderAPI_MakeFace(handleSurface, 1e-6)
        if (faceBuilder.isDone()) {
          const result = faceBuilder.face()
          if (isFaceBboxValid(wasm, result)) return applyAndReturn(result)
        }
      } catch (e) {}
    }

  } catch (e) {}

  return null
}

function convertACISShell(wasm, shellEntity) {
  if (!shellEntity) return null
  try {
    const faces = shellEntity.getFaces ? shellEntity.getFaces() : []
    if (faces.length === 0) return null

    const builder = new wasm.BRep_Builder()
    const shell = builder.makeShell()

    let faceCount = 0
    for (const faceEntity of faces) {
      const face = convertACISFace(wasm, faceEntity)
      if (face) {
        try {
          const bndBox = new wasm.Bnd_Box()
          wasm.BRepBndLib.add(face, bndBox)
          if (!bndBox.isVoid()) {
            const bounds = bndBox.get()
            const MAX_EXTENT = 1e10
            if (Math.abs(bounds.xmin) < MAX_EXTENT && Math.abs(bounds.xmax) < MAX_EXTENT &&
                Math.abs(bounds.ymin) < MAX_EXTENT && Math.abs(bounds.ymax) < MAX_EXTENT &&
                Math.abs(bounds.zmin) < MAX_EXTENT && Math.abs(bounds.zmax) < MAX_EXTENT) {
              builder.add(shell, face)
              faceCount++
            }
          }
        } catch (e) { /* face add failed */ }
      }
    }
    if (faceCount > 0) return shell
  } catch (e) {
    console.warn('Failed to convert shell:', e.message)
  }
  return null
}

/**
 * Compute adaptive sewing tolerance based on shape bounding box.
 * Uses a relative tolerance of 1e-4 of the bounding box diagonal,
 * floored at baseTol (from ACIS header resabs or default 1e-6).
 */
function computeSewingTolerance(wasm, shell, options = {}) {
  let baseTol = 1e-6

  // Use ACIS header resabs if available
  const headers = options.acisHeaders || []
  if (headers.length > 0) {
    for (const h of headers) {
      if (h.resabs && h.resabs > baseTol) baseTol = h.resabs
    }
  }

  // Scale by bounding box diagonal for larger models
  try {
    const bb = new wasm.Bnd_Box()
    wasm.BRepBndLib.add(shell, bb)
    if (!bb.isVoid()) {
      const b = bb.get()
      const diag = Math.sqrt(
        (b.xmax - b.xmin) ** 2 + (b.ymax - b.ymin) ** 2 + (b.zmax - b.zmin) ** 2
      )
      // Relative tolerance: ~1e-4 of diagonal, floor at baseTol
      const scaledTol = diag * 1e-4
      baseTol = Math.max(baseTol, scaledTol)
    }
  } catch (e) { /* fallback to baseTol */ }

  // Cap at 0.1 to avoid overly aggressive sewing
  return Math.min(baseTol, 0.1)
}

/**
 * Try sewing at a given tolerance and extract solids from the result.
 * Returns { shape, hasSolids, isClosed } or null on failure.
 */
function sewAtTolerance(wasm, shell, tolerance) {
  try {
    const sewing = new wasm.BRepBuilderAPI_Sewing(tolerance, true, true, true, false)
    sewing.add(shell)
    sewing.perform(new wasm.Message_ProgressRange())
    const sewedShape = sewing.sewedShape()

    // Collect solids from sewing result
    const solids = []
    const solidExplorer = new wasm.TopExp_Explorer(
      sewedShape,
      wasm.TopAbs_ShapeEnum.TopAbs_SOLID,
      wasm.TopAbs_ShapeEnum.TopAbs_SHAPE
    )
    while (solidExplorer.more()) {
      solids.push(wasm.TopoDS.solid(solidExplorer.current()))
      solidExplorer.next()
    }

    let resultShape
    if (solids.length === 1) {
      resultShape = solids[0]
    } else if (solids.length > 1) {
      const builder = new wasm.BRep_Builder()
      const compound = builder.makeCompound()
      for (const s of solids) builder.add(compound, s)
      resultShape = compound
    } else {
      resultShape = sewedShape
    }

    // Check closure
    let isClosed = false
    try { isClosed = wasm.Shape.isClosed(resultShape) } catch (e) {}

    return { shape: resultShape, hasSolids: solids.length > 0, isClosed }
  } catch (e) {}
  return null
}

function tryMakeSolid(wasm, shell, options = {}) {
  const baseTol = computeSewingTolerance(wasm, shell, options)

  // Try sewing at computed tolerance
  let result = sewAtTolerance(wasm, shell, baseTol)

  // If not closed, retry with progressively larger tolerances
  if (result && !result.isClosed) {
    const retryTols = [baseTol * 10, baseTol * 100]
    for (const tol of retryTols) {
      if (tol > 0.1) break // cap
      const retry = sewAtTolerance(wasm, shell, tol)
      if (retry && retry.isClosed) {
        result = retry
        break
      }
      // Use retry if it found solids even if not closed
      if (retry && retry.hasSolids && !result.hasSolids) {
        result = retry
      }
    }
  }

  if (result) return result.shape

  // Fallback: direct MakeSolid
  try {
    const solidBuilder = new wasm.BRepBuilderAPI_MakeSolid(shell)
    if (solidBuilder.isDone()) return solidBuilder.solid()
  } catch (e) {}

  return shell
}

function convertACISBody(wasm, bodyEntity, options = {}) {
  if (!bodyEntity) return null
  try {
    const lumps = bodyEntity.getLumps ? bodyEntity.getLumps() : []
    const solidsAndShells = []

    for (const lump of lumps) {
      const lumpShells = lump.getShells ? lump.getShells() : []
      for (const shellEntity of lumpShells) {
        const shell = convertACISShell(wasm, shellEntity)
        if (shell) {
          solidsAndShells.push(tryMakeSolid(wasm, shell, options))
        }
      }
    }

    if (solidsAndShells.length === 0) return null
    if (solidsAndShells.length === 1) return solidsAndShells[0]

    const builder = new wasm.BRep_Builder()
    const compound = builder.makeCompound()
    for (const shape of solidsAndShells) {
      builder.add(compound, shape)
    }
    return compound
  } catch (e) {
    console.warn('Failed to convert body:', e.message)
  }
  return null
}

function hasValidBoundingBox(wasm, shape) {
  try {
    const bndBox = new wasm.Bnd_Box()
    wasm.BRepBndLib.add(shape, bndBox)
    if (bndBox.isVoid()) return false
    const b = bndBox.get()
    const MAX_EXTENT = 1e10
    return Math.abs(b.xmin) < MAX_EXTENT && Math.abs(b.xmax) < MAX_EXTENT &&
           Math.abs(b.ymin) < MAX_EXTENT && Math.abs(b.ymax) < MAX_EXTENT &&
           Math.abs(b.zmin) < MAX_EXTENT && Math.abs(b.zmax) < MAX_EXTENT
  } catch (e) {
    return false
  }
}

export function convertACISBodiesToShape(wasm, bodies, options = {}) {
  if (!bodies || bodies.length === 0) return null

  const shapes = []
  let skippedBodies = 0

  for (let i = 0; i < bodies.length; i++) {
    const body = bodies[i]
    const shape = convertACISBody(wasm, body, options)
    if (shape) {
      if (hasValidBoundingBox(wasm, shape)) {
        shapes.push(shape)
      } else {
        skippedBodies++
      }
    } else {
      skippedBodies++
    }
  }

  if (shapes.length === 0) throw new Error('Failed to convert any ACIS bodies to geometry')
  if (shapes.length === 1) return shapes[0]

  const builder = new wasm.BRep_Builder()
  const compound = builder.makeCompound()
  for (const shape of shapes) {
    builder.add(compound, shape)
  }
  return compound
}
