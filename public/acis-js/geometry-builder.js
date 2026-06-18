/**
 * ACIS Geometry Builder for OpenCascade.js
 * Creates OC.js geometry from parsed ACIS B-spline data
 * Replaces FreeCAD geometry building with OpenCascade.js
 */

// ============================================================================
// Basic Geometry Helpers
// ============================================================================

/**
 * Create OC.js gp_Pnt from point object
 * Validates coordinates to prevent extreme/invalid values
 */
export function makePoint(oc, p) {
  if (!p) return new oc.gp_Pnt_3(0, 0, 0)
  let x = p.x || 0
  let y = p.y || 0
  let z = p.z || 0
  // Clamp extreme values to prevent 2e+100 type issues
  const MAX_COORD = 1e10
  if (!isFinite(x) || Math.abs(x) > MAX_COORD) x = 0
  if (!isFinite(y) || Math.abs(y) > MAX_COORD) y = 0
  if (!isFinite(z) || Math.abs(z) > MAX_COORD) z = 0
  return new oc.gp_Pnt_3(x, y, z)
}

/**
 * Create OC.js gp_Pnt2d from 2D point object
 */
export function makePoint2d(oc, p) {
  if (!p) return new oc.gp_Pnt2d_3(0, 0)
  if (p.x !== undefined) return new oc.gp_Pnt2d_3(p.x, p.y)
  if (p.u !== undefined) return new oc.gp_Pnt2d_3(p.u, p.v)
  return new oc.gp_Pnt2d_3(0, 0)
}

/**
 * Create OC.js gp_Dir from direction vector
 */
export function makeDirection(oc, vec) {
  if (!vec) return new oc.gp_Dir_4(0, 0, 1)
  const len = Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z)
  if (len < 1e-10) return new oc.gp_Dir_4(0, 0, 1)
  return new oc.gp_Dir_4(vec.x / len, vec.y / len, vec.z / len)
}

/**
 * Create OC.js gp_Vec from vector object
 */
export function makeVec(oc, vec) {
  if (!vec) return new oc.gp_Vec_4(0, 0, 1)
  return new oc.gp_Vec_4(vec.x || 0, vec.y || 0, vec.z || 0)
}

/**
 * Create OC.js gp_Ax1 (axis with point and direction)
 */
export function makeAx1(oc, origin, direction) {
  const pnt = makePoint(oc, origin)
  const dir = makeDirection(oc, direction)
  return new oc.gp_Ax1_2(pnt, dir)
}

/**
 * Create OC.js gp_Ax2 (coordinate system)
 */
export function makeAx2(oc, origin, zDir, xDir) {
  const pnt = makePoint(oc, origin)
  const z = makeDirection(oc, zDir)
  if (xDir) {
    const x = makeDirection(oc, xDir)
    return new oc.gp_Ax2_2(pnt, z, x)
  }
  return new oc.gp_Ax2_3(pnt, z)
}

/**
 * Create OC.js gp_Ax3 (right-handed coordinate system)
 */
export function makeAx3(oc, origin, axis, refDir) {
  const pnt = makePoint(oc, origin)
  const z = makeDirection(oc, axis)
  if (refDir) {
    const x = makeDirection(oc, refDir)
    return new oc.gp_Ax3_3(pnt, z, x)
  }
  return new oc.gp_Ax3_4(pnt, z)
}

// ============================================================================
// Basic Curve Builders
// ============================================================================

/**
 * Create a line edge between two points
 */
export function createLine(oc, start, end) {
  if (!start || !end) return null

  try {
    const p1 = makePoint(oc, start)
    const p2 = makePoint(oc, end)

    // Check for degenerate line
    const dx = end.x - start.x
    const dy = end.y - start.y
    const dz = end.z - start.z
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

    if (dist < 1e-10) return null

    const builder = new oc.BRepBuilderAPI_MakeEdge_3(p1, p2)
    if (builder.IsDone()) {
      return builder.Edge()
    }
  } catch (e) {
    console.warn('createLine failed:', e.message)
  }
  return null
}

/**
 * Create a circle curve
 */
export function createCircle(oc, center, axis, radius) {
  if (!center || !axis || radius <= 0) return null

  try {
    const ax2 = makeAx2(oc, center, axis)
    // gp_Circ_2(ax2, radius) -> Geom_Circle_1(gp_Circ)
    const gpCirc = new oc.gp_Circ_2(ax2, radius)
    return new oc.Geom_Circle_1(gpCirc)
  } catch (e) {
    console.warn('createCircle failed:', e.message)
  }
  return null
}

/**
 * Create an ellipse curve
 */
export function createEllipse(oc, center, axis, majorRadius, minorRadius, majorDir) {
  if (!center || !axis || majorRadius <= 0 || minorRadius <= 0) return null

  try {
    const ax2 = makeAx2(oc, center, axis, majorDir)
    // gp_Elips_2(ax2, majorRadius, minorRadius) -> Geom_Ellipse_1(gp_Elips)
    const gpElips = new oc.gp_Elips_2(ax2, majorRadius, minorRadius)
    return new oc.Geom_Ellipse_1(gpElips)
  } catch (e) {
    console.warn('createEllipse failed:', e.message)
  }
  return null
}

// ============================================================================
// B-Spline Curve Builder
// ============================================================================

/**
 * Validate and clamp coordinate value
 */
function clampCoord(val) {
  const MAX_COORD = 1e10
  const v = val || 0
  if (!isFinite(v) || Math.abs(v) > MAX_COORD) return 0
  return v
}

/**
 * Convert poles array to TColgp_Array1OfPnt
 */
function polesToArray1OfPnt(oc, poles) {
  const arr = new oc.TColgp_Array1OfPnt_2(1, poles.length)
  for (let i = 0; i < poles.length; i++) {
    const p = poles[i]
    arr.SetValue(i + 1, new oc.gp_Pnt_3(clampCoord(p.x), clampCoord(p.y), clampCoord(p.z)))
  }
  return arr
}

/**
 * Convert poles array to TColgp_Array1OfPnt2d
 */
function polesToArray1OfPnt2d(oc, poles) {
  const arr = new oc.TColgp_Array1OfPnt2d_2(1, poles.length)
  for (let i = 0; i < poles.length; i++) {
    const p = poles[i]
    // Handle both {x,y} and {u,v} formats
    const u = p.x !== undefined ? p.x : (p.u !== undefined ? p.u : 0)
    const v = p.y !== undefined ? p.y : (p.v !== undefined ? p.v : 0)
    arr.SetValue(i + 1, new oc.gp_Pnt2d_3(clampCoord(u), clampCoord(v)))
  }
  return arr
}

/**
 * Convert knots array to TColStd_Array1OfReal
 */
function knotsToArray1OfReal(oc, knots) {
  const arr = new oc.TColStd_Array1OfReal_2(1, knots.length)
  for (let i = 0; i < knots.length; i++) {
    arr.SetValue(i + 1, knots[i])
  }
  return arr
}

/**
 * Convert multiplicities array to TColStd_Array1OfInteger
 */
function multsToArray1OfInteger(oc, mults) {
  const arr = new oc.TColStd_Array1OfInteger_2(1, mults.length)
  for (let i = 0; i < mults.length; i++) {
    arr.SetValue(i + 1, mults[i])
  }
  return arr
}

/**
 * Convert weights array to TColStd_Array1OfReal
 */
function weightsToArray1OfReal(oc, weights) {
  const arr = new oc.TColStd_Array1OfReal_2(1, weights.length)
  for (let i = 0; i < weights.length; i++) {
    arr.SetValue(i + 1, weights[i])
  }
  return arr
}

/**
 * Create B-spline curve from parsed NUBS/NURBS data
 * @param {Object} oc - OpenCascade.js instance
 * @param {Object} nubs - BS_Curve object with poles, knots, mults, weights
 * @param {string} sense - 'forward' or 'reversed'
 * @param {string} subtype - curve subtype name
 * @returns {Object|null} Geom_BSplineCurve or edge shape
 */
export function createBSplineCurve(oc, nubs, sense = 'forward', subtype = '') {
  if (!nubs || !nubs.poles || nubs.poles.length === 0) {
    return null
  }

  // Handle 2-pole case as simple line
  if (nubs.poles.length === 2) {
    const p1 = nubs.poles[0]
    const p2 = nubs.poles[1]
    return createLine(oc, p1, p2)
  }

  try {
    const poles = polesToArray1OfPnt(oc, nubs.poles)
    const knots = knotsToArray1OfReal(oc, nubs.uKnots)
    const mults = multsToArray1OfInteger(oc, nubs.uMults)
    const degree = nubs.uDegree
    const periodic = nubs.uPeriodic || false

    let curve
    if (nubs.rational && nubs.weights && nubs.weights.length > 0) {
      // NURBS curve with weights
      const weights = weightsToArray1OfReal(oc, nubs.weights)
      curve = new oc.Geom_BSplineCurve_2(
        poles, weights, knots, mults, degree, periodic
      )
    } else {
      // NUBS curve without weights
      curve = new oc.Geom_BSplineCurve_1(
        poles, knots, mults, degree, periodic
      )
    }

    // Apply sense (reverse if needed)
    if (sense === 'reversed') {
      curve.Reverse()
    }

    return curve
  } catch (e) {
    console.warn(`createBSplineCurve failed for ${subtype}:`, e.message)

    // Try fallback: create a line through first and last poles
    if (nubs.poles.length >= 2) {
      const p1 = nubs.poles[0]
      const p2 = nubs.poles[nubs.poles.length - 1]
      return createLine(oc, p1, p2)
    }
  }

  return null
}

/**
 * Create 2D B-spline curve for parameter space
 * @param {Object} oc - OpenCascade.js instance
 * @param {Object} nubs - BS_Curve object with 2D poles
 * @returns {Object|null} Geom2d_BSplineCurve
 */
export function createBSplineCurve2d(oc, nubs) {
  if (!nubs || !nubs.poles || nubs.poles.length === 0) {
    return null
  }

  try {
    const poles = polesToArray1OfPnt2d(oc, nubs.poles)
    const knots = knotsToArray1OfReal(oc, nubs.uKnots)
    const mults = multsToArray1OfInteger(oc, nubs.uMults)
    const degree = nubs.uDegree
    const periodic = nubs.uPeriodic || false

    let curve
    if (nubs.rational && nubs.weights && nubs.weights.length > 0) {
      const weights = weightsToArray1OfReal(oc, nubs.weights)
      curve = new oc.Geom2d_BSplineCurve_2(
        poles, weights, knots, mults, degree, periodic
      )
    } else {
      curve = new oc.Geom2d_BSplineCurve_1(
        poles, knots, mults, degree, periodic
      )
    }

    return curve
  } catch (e) {
    console.warn('createBSplineCurve2d failed:', e.message)
  }

  return null
}

// ============================================================================
// B-Spline Surface Builder
// ============================================================================

/**
 * Convert 2D poles array to TColgp_Array2OfPnt
 */
function polesToArray2OfPnt(oc, poles) {
  const uSize = poles.length
  const vSize = poles[0].length
  const arr = new oc.TColgp_Array2OfPnt_2(1, uSize, 1, vSize)

  for (let u = 0; u < uSize; u++) {
    for (let v = 0; v < vSize; v++) {
      const p = poles[u][v]
      arr.SetValue(u + 1, v + 1, new oc.gp_Pnt_3(clampCoord(p.x), clampCoord(p.y), clampCoord(p.z)))
    }
  }
  return arr
}

/**
 * Convert 2D weights array to TColStd_Array2OfReal
 */
function weightsToArray2OfReal(oc, weights) {
  const uSize = weights.length
  const vSize = weights[0].length
  const arr = new oc.TColStd_Array2OfReal_2(1, uSize, 1, vSize)

  for (let u = 0; u < uSize; u++) {
    for (let v = 0; v < vSize; v++) {
      arr.SetValue(u + 1, v + 1, weights[u][v])
    }
  }
  return arr
}

/**
 * Create B-spline surface from parsed NUBS/NURBS data
 * @param {Object} oc - OpenCascade.js instance
 * @param {Object} nubs - BS_Surface object with poles, knots, mults, weights
 * @returns {Object|null} Geom_BSplineSurface
 */
export function createBSplineSurface(oc, nubs) {
  if (!nubs || !nubs.poles || nubs.poles.length === 0) {
    return null
  }

  // Validate poles structure
  if (!Array.isArray(nubs.poles[0])) {
    console.warn('createBSplineSurface: poles must be 2D array')
    return null
  }

  try {
    const poles = polesToArray2OfPnt(oc, nubs.poles)
    const uKnots = knotsToArray1OfReal(oc, nubs.uKnots)
    const vKnots = knotsToArray1OfReal(oc, nubs.vKnots)
    const uMults = multsToArray1OfInteger(oc, nubs.uMults)
    const vMults = multsToArray1OfInteger(oc, nubs.vMults)
    const uDegree = nubs.uDegree
    const vDegree = nubs.vDegree
    const uPeriodic = nubs.uPeriodic || false
    const vPeriodic = nubs.vPeriodic || false

    let surface
    if (nubs.rational && nubs.weights && nubs.weights.length > 0) {
      // NURBS surface with weights
      const weights = weightsToArray2OfReal(oc, nubs.weights)
      surface = new oc.Geom_BSplineSurface_2(
        poles, weights, uKnots, vKnots, uMults, vMults,
        uDegree, vDegree, uPeriodic, vPeriodic
      )
    } else {
      // NUBS surface without weights
      surface = new oc.Geom_BSplineSurface_1(
        poles, uKnots, vKnots, uMults, vMults,
        uDegree, vDegree, uPeriodic, vPeriodic
      )
    }

    return surface
  } catch (e) {
    console.warn('createBSplineSurface failed:', e.message)

    // Try with periodic fallback
    try {
      const poles = polesToArray2OfPnt(oc, nubs.poles)
      const uKnots = knotsToArray1OfReal(oc, nubs.uKnots)
      const vKnots = knotsToArray1OfReal(oc, nubs.vKnots)
      const uMults = multsToArray1OfInteger(oc, nubs.uMults)
      const vMults = multsToArray1OfInteger(oc, nubs.vMults)
      const uDegree = nubs.uDegree
      const vDegree = nubs.vDegree

      // Try non-periodic
      const surface = new oc.Geom_BSplineSurface_1(
        poles, uKnots, vKnots, uMults, vMults,
        uDegree, vDegree, false, false
      )
      return surface
    } catch (e2) {
      console.warn('createBSplineSurface fallback failed:', e2.message)
    }
  }

  return null
}

// ============================================================================
// PCurve Builder (Curve on Surface)
// ============================================================================

/**
 * Create edge from 2D parameter curve on surface
 * @param {Object} oc - OpenCascade.js instance
 * @param {Object} pcurve - 2D BS_Curve for parameter space
 * @param {Object} surface - Geom_Surface to project onto
 * @param {string} sense - 'forward' or 'reversed'
 * @returns {Object|null} Edge shape
 */
export function createBSplinePCurve(oc, pcurve, surface, sense = 'forward') {
  if (!pcurve || !surface) {
    return null
  }

  try {
    // Create 2D B-spline curve
    const curve2d = createBSplineCurve2d(oc, pcurve)
    if (!curve2d) {
      console.warn('createBSplinePCurve: failed to create 2D curve')
      return null
    }

    // Get handles
    const handleCurve2d = new oc.Handle_Geom2d_Curve_2(curve2d)
    const handleSurface = new oc.Handle_Geom_Surface_2(surface)

    // Create edge on surface using BRepBuilderAPI_MakeEdge_30
    // This variant takes a 2D curve and a surface
    const builder = new oc.BRepBuilderAPI_MakeEdge_30(handleCurve2d, handleSurface)

    if (builder.IsDone()) {
      const edge = builder.Edge()
      if (sense === 'reversed') {
        edge.Reverse()
      }
      return edge
    }

    console.warn('createBSplinePCurve: edge builder failed')
  } catch (e) {
    console.warn('createBSplinePCurve failed:', e.message)
  }

  return null
}

// ============================================================================
// Helix Builder
// ============================================================================

/**
 * Create helix curve from Helix data
 * @param {Object} oc - OpenCascade.js instance
 * @param {Object} helix - Helix data object
 * @returns {Object|null} Edge shape
 */
export function createHelixCurve(oc, helix) {
  if (!helix) return null

  try {
    // Build interpolation points
    const points = helix.buildPoints ? helix.buildPoints() : []

    if (points.length < 2) {
      console.warn('createHelixCurve: not enough points')
      return null
    }

    // Create array of points
    const hArr = new oc.TColgp_HArray1OfPnt_2(1, points.length)
    for (let i = 0; i < points.length; i++) {
      hArr.SetValue(i + 1, new oc.gp_Pnt_3(points[i].x, points[i].y, points[i].z))
    }

    // Use GeomAPI_Interpolate to create smooth curve
    const interp = new oc.GeomAPI_Interpolate_1(
      new oc.Handle_TColgp_HArray1OfPnt_2(hArr),
      false, // not periodic
      1e-6   // tolerance
    )

    interp.Perform()

    if (interp.IsDone()) {
      const curve = interp.Curve()
      const handleCurve = new oc.Handle_Geom_Curve_2(curve.get())
      const builder = new oc.BRepBuilderAPI_MakeEdge_20(handleCurve)
      if (builder.IsDone()) {
        return builder.Edge()
      }
    }
  } catch (e) {
    console.warn('createHelixCurve failed:', e.message)
  }

  return null
}

// ============================================================================
// Surface of Revolution Builder
// ============================================================================

/**
 * Create surface of revolution from profile curve
 * @param {Object} oc - OpenCascade.js instance
 * @param {Object} profile - Profile curve (Geom_Curve)
 * @param {Object} location - Axis location point
 * @param {Object} direction - Axis direction
 * @returns {Object|null} Geom_SurfaceOfRevolution
 */
export function createSurfaceOfRevolution(oc, profile, location, direction) {
  if (!profile || !location || !direction) return null

  try {
    const axis = makeAx1(oc, location, direction)
    const handleCurve = new oc.Handle_Geom_Curve_2(profile)
    return new oc.Geom_SurfaceOfRevolution(handleCurve, axis)
  } catch (e) {
    console.warn('createSurfaceOfRevolution failed:', e.message)
  }
  return null
}

// ============================================================================
// Ruled Surface Builder
// ============================================================================

/**
 * Create ruled surface between two curves
 * @param {Object} oc - OpenCascade.js instance
 * @param {Object} curve1 - First profile curve
 * @param {Object} curve2 - Second profile curve
 * @returns {Object|null} Face shape
 */
export function createRuledSurface(oc, curve1, curve2) {
  if (!curve1 || !curve2) return null

  try {
    // Create edges from curves
    const handleCurve1 = new oc.Handle_Geom_Curve_2(curve1)
    const handleCurve2 = new oc.Handle_Geom_Curve_2(curve2)

    const builder1 = new oc.BRepBuilderAPI_MakeEdge_20(handleCurve1)
    const builder2 = new oc.BRepBuilderAPI_MakeEdge_20(handleCurve2)

    if (!builder1.IsDone() || !builder2.IsDone()) return null

    // Create wires
    const wire1 = new oc.BRepBuilderAPI_MakeWire_2(builder1.Edge()).Wire()
    const wire2 = new oc.BRepBuilderAPI_MakeWire_2(builder2.Edge()).Wire()

    // Create ruled loft
    const loft = new oc.BRepOffsetAPI_ThruSections(false, true) // not solid, ruled
    loft.AddWire(wire1)
    loft.AddWire(wire2)
    loft.Build()

    if (loft.IsDone()) {
      return loft.Shape()
    }
  } catch (e) {
    console.warn('createRuledSurface failed:', e.message)
  }
  return null
}

// ============================================================================
// Offset Surface Builder
// ============================================================================

/**
 * Create offset surface
 * @param {Object} oc - OpenCascade.js instance
 * @param {Object} baseSurface - Base Geom_Surface
 * @param {number} offset - Offset distance
 * @returns {Object|null} Geom_OffsetSurface
 */
export function createOffsetSurface(oc, baseSurface, offset) {
  if (!baseSurface) return null

  try {
    const handleSurface = new oc.Handle_Geom_Surface_2(baseSurface)
    return new oc.Geom_OffsetSurface(handleSurface, offset, true)
  } catch (e) {
    console.warn('createOffsetSurface failed:', e.message)
  }
  return null
}

// ============================================================================
// Cylinder Surface Builder
// ============================================================================

/**
 * Create cylindrical surface
 * @param {Object} oc - OpenCascade.js instance
 * @param {Object} center - Center point
 * @param {Object} axis - Axis direction
 * @param {number} radius - Cylinder radius
 * @returns {Object|null} Geom_CylindricalSurface
 */
export function createCylindricalSurface(oc, center, axis, radius) {
  if (!center || !axis || radius <= 0) return null

  try {
    const ax3 = makeAx3(oc, center, axis)
    return new oc.Geom_CylindricalSurface_1(ax3, radius)
  } catch (e) {
    console.warn('createCylindricalSurface failed:', e.message)
  }
  return null
}

// ============================================================================
// Cone Surface Builder
// ============================================================================

/**
 * Create conical surface
 * @param {Object} oc - OpenCascade.js instance
 * @param {Object} center - Center point
 * @param {Object} axis - Axis direction
 * @param {number} radius - Base radius
 * @param {number} semiAngle - Semi-angle in radians
 * @returns {Object|null} Geom_ConicalSurface
 */
export function createConicalSurface(oc, center, axis, radius, semiAngle) {
  if (!center || !axis || radius <= 0) return null

  try {
    const ax3 = makeAx3(oc, center, axis)

    // If semi-angle is very small, create cylinder instead
    if (Math.abs(semiAngle) < 1e-6) {
      return new oc.Geom_CylindricalSurface_1(ax3, radius)
    }

    return new oc.Geom_ConicalSurface_1(ax3, semiAngle, radius)
  } catch (e) {
    console.warn('createConicalSurface failed:', e.message)
  }
  return null
}

// ============================================================================
// Plane Surface Builder
// ============================================================================

/**
 * Create plane surface
 * @param {Object} oc - OpenCascade.js instance
 * @param {Object} origin - Origin point
 * @param {Object} normal - Normal direction
 * @returns {Object|null} Geom_Plane
 */
export function createPlaneSurface(oc, origin, normal) {
  if (!origin || !normal) return null

  try {
    const pnt = makePoint(oc, origin)
    const dir = makeDirection(oc, normal)
    // Create gp_Pln from point and normal (gp_Pln_3 takes gp_Pnt, gp_Dir)
    const gpPln = new oc.gp_Pln_3(pnt, dir)
    // Geom_Plane_2 takes gp_Pln
    return new oc.Geom_Plane_2(gpPln)
  } catch (e) {
    console.warn('createPlaneSurface failed:', e.message)
  }
  return null
}

// ============================================================================
// Sphere Surface Builder
// ============================================================================

/**
 * Create spherical surface
 * @param {Object} oc - OpenCascade.js instance
 * @param {Object} center - Center point
 * @param {number} radius - Sphere radius
 * @returns {Object|null} Geom_SphericalSurface
 */
export function createSphericalSurface(oc, center, radius) {
  if (!center || radius <= 0) return null

  try {
    const ax3 = makeAx3(oc, center, { x: 0, y: 0, z: 1 })
    return new oc.Geom_SphericalSurface_1(ax3, radius)
  } catch (e) {
    console.warn('createSphericalSurface failed:', e.message)
  }
  return null
}

// ============================================================================
// Torus Surface Builder
// ============================================================================

/**
 * Create toroidal surface
 * @param {Object} oc - OpenCascade.js instance
 * @param {Object} center - Center point
 * @param {Object} axis - Axis direction
 * @param {number} majorRadius - Major radius
 * @param {number} minorRadius - Minor radius
 * @returns {Object|null} Geom_ToroidalSurface
 */
export function createToroidalSurface(oc, center, axis, majorRadius, minorRadius) {
  if (!center || !axis || majorRadius <= 0 || minorRadius <= 0) return null

  try {
    const ax3 = makeAx3(oc, center, axis)
    return new oc.Geom_ToroidalSurface_1(ax3, majorRadius, minorRadius)
  } catch (e) {
    console.warn('createToroidalSurface failed:', e.message)
  }
  return null
}

// ============================================================================
// Face Builder from Surface
// ============================================================================

/**
 * Create face from surface
 * @param {Object} oc - OpenCascade.js instance
 * @param {Object} surface - Geom_Surface
 * @param {number} tolerance - Optional tolerance
 * @returns {Object|null} Face shape
 */
export function createFaceFromSurface(oc, surface, tolerance = 1e-6) {
  if (!surface) return null

  try {
    const handleSurface = new oc.Handle_Geom_Surface_2(surface)
    const builder = new oc.BRepBuilderAPI_MakeFace_8(handleSurface, tolerance)

    if (builder.IsDone()) {
      return builder.Face()
    }
  } catch (e) {
    console.warn('createFaceFromSurface failed:', e.message)
  }
  return null
}

// ============================================================================
// Edge Builder from Curve
// ============================================================================

/**
 * Create edge from curve with optional parameters
 * @param {Object} oc - OpenCascade.js instance
 * @param {Object} curve - Geom_Curve
 * @param {number} u1 - Optional start parameter
 * @param {number} u2 - Optional end parameter
 * @returns {Object|null} Edge shape
 */
export function createEdgeFromCurve(oc, curve, u1, u2) {
  if (!curve) return null

  try {
    const handleCurve = new oc.Handle_Geom_Curve_2(curve)

    let builder
    if (u1 !== undefined && u2 !== undefined) {
      builder = new oc.BRepBuilderAPI_MakeEdge_24(handleCurve, u1, u2)
    } else {
      builder = new oc.BRepBuilderAPI_MakeEdge_20(handleCurve)
    }

    if (builder.IsDone()) {
      return builder.Edge()
    }
  } catch (e) {
    console.warn('createEdgeFromCurve failed:', e.message)
  }
  return null
}

// ============================================================================
// Convenience Function for Building Geometry
// ============================================================================

/**
 * Build geometry with OpenCascade.js from parsed ACIS bodies
 * @param {Object} oc - OpenCascade.js instance
 * @param {Array} bodies - Array of parsed Body entities
 * @returns {Object|null} Compound shape
 */
export function buildWithOpenCascade(oc, bodies) {
  if (!bodies || bodies.length === 0) return null

  const shapes = []

  for (const body of bodies) {
    try {
      const lumps = body.getLumps ? body.getLumps() : []

      for (const lump of lumps) {
        const shells = lump.getShells ? lump.getShells() : []

        for (const shell of shells) {
          const faces = shell.getFaces ? shell.getFaces() : []

          if (faces.length > 0) {
            const builder = new oc.BRep_Builder()
            const ocShell = new oc.TopoDS_Shell()
            builder.MakeShell(ocShell)

            for (const face of faces) {
              // Build face shape from surface
              const surface = face.getSurface ? face.getSurface() : null
              if (surface && surface.build) {
                const shape = surface.build(face)
                if (shape) {
                  // The shape is already a shape descriptor, need to convert
                  // This is handled by the converter
                }
              }
            }

            shapes.push(ocShell)
          }
        }
      }
    } catch (e) {
      console.warn('buildWithOpenCascade: body failed:', e.message)
    }
  }

  if (shapes.length === 0) return null
  if (shapes.length === 1) return shapes[0]

  // Combine into compound
  const builder = new oc.BRep_Builder()
  const compound = new oc.TopoDS_Compound()
  builder.MakeCompound(compound)

  for (const shape of shapes) {
    builder.Add(compound, shape)
  }

  return compound
}

// ============================================================================
// ACIS Entity Converters
// ============================================================================

/**
 * Convert ACIS surface entity to OpenCascade surface
 */
export function convertACISSurface(oc, surfaceEntity) {
  if (!surfaceEntity) return null

  try {
    const typeName = surfaceEntity.getType ? surfaceEntity.getType() : ''

    if (typeName.includes('plane')) {
      return createPlaneSurface(oc, surfaceEntity.origin, surfaceEntity.normal)
    } else if (typeName.includes('cone')) {
      // Get semi-angle from sine/cosine (ACIS stores these instead of angle).
      // OpenCascade needs a semi-angle in (0, pi/2); the SIGN of the cosine tells
      // which way the cone opens. A negative cosine means the radius grows toward
      // -axis, so flip the axis and keep the angle positive.
      const sine = surfaceEntity.sine || 0
      const cosine = surfaceEntity.cosine || 1
      const semiAngle = Math.atan2(Math.abs(sine), Math.abs(cosine))

      // Get radius from major vector length (now correctly length-scaled)
      const major = surfaceEntity.major || { x: 1, y: 0, z: 0 }
      const radius = Math.sqrt(major.x * major.x + major.y * major.y + major.z * major.z) || 1.0

      // Flip the axis direction when the cone opens toward -axis (cosine < 0).
      const rawAxis = surfaceEntity.axis || { x: 0, y: 0, z: 1 }
      const axis = cosine < 0 ? { x: -rawAxis.x, y: -rawAxis.y, z: -rawAxis.z } : rawAxis

      // Create axis system - use major as reference direction
      const ax3 = makeAx3(oc, surfaceEntity.center, axis, major)

      // If semi-angle is very small (sine ≈ 0), it's a cylinder
      if (Math.abs(sine) < 1e-6) {
        return new oc.Geom_CylindricalSurface_1(ax3, radius)
      }
      return new oc.Geom_ConicalSurface_1(ax3, semiAngle, radius)
    } else if (typeName.includes('sphere')) {
      return createSphericalSurface(oc, surfaceEntity.center, surfaceEntity.radius || 1.0)
    } else if (typeName.includes('torus')) {
      // Torus stores major/minor as scalar radius values
      const majorRadius = Math.abs(surfaceEntity.major) || 2.0
      const minorRadius = Math.abs(surfaceEntity.minor) || 0.5
      return createToroidalSurface(oc, surfaceEntity.center, surfaceEntity.axis, majorRadius, minorRadius)
    } else if (typeName.includes('spline') && surfaceEntity.nubs) {
      return createBSplineSurface(oc, surfaceEntity.nubs)
    }

    console.warn('Unsupported surface type: ' + typeName)
    return null
  } catch (e) {
    console.warn('Failed to convert surface:', e.message)
    return null
  }
}

/**
 * Convert ACIS curve entity to OpenCascade curve
 */
export function convertACISCurve(oc, curveEntity, startPt, endPt) {
  if (!curveEntity) return null

  try {
    const typeName = curveEntity.getType ? curveEntity.getType() : ''

    if (typeName.includes('straight')) {
      const origin = makePoint(oc, curveEntity.origin)
      const direction = makeDirection(oc, curveEntity.direction)
      // gp_Ax1 -> gp_Lin -> Geom_Line
      const ax1 = new oc.gp_Ax1_2(origin, direction)
      const lin = new oc.gp_Lin_2(ax1)
      return new oc.Geom_Line_2(lin)
    } else if (typeName.includes('ellipse')) {
      const center = makePoint(oc, curveEntity.center)
      const normal = makeDirection(oc, curveEntity.axis)
      const majorVec = curveEntity.major || { x: 1, y: 0, z: 0 }
      const majorAxis = makeDirection(oc, majorVec)
      const majorRadius = Math.sqrt(majorVec.x ** 2 + majorVec.y ** 2 + majorVec.z ** 2) || 1.0
      const ratio = curveEntity.ratio || 1.0
      const minorRadius = majorRadius * ratio

      const ax2 = new oc.gp_Ax2_2(center, normal, majorAxis)

      if (Math.abs(ratio - 1.0) < 1e-6) {
        // gp_Circ_2(ax2, radius) -> Geom_Circle_1(gp_Circ)
        const gpCirc = new oc.gp_Circ_2(ax2, majorRadius)
        return new oc.Geom_Circle_1(gpCirc)
      } else {
        // gp_Elips_2(ax2, majorRadius, minorRadius) -> Geom_Ellipse_1(gp_Elips)
        const gpElips = new oc.gp_Elips_2(ax2, majorRadius, minorRadius)
        return new oc.Geom_Ellipse_1(gpElips)
      }
    } else if ((typeName.includes('intcurve') || typeName.includes('spline')) && curveEntity.nubs) {
      return createBSplineCurve(oc, curveEntity.nubs, 'forward', typeName)
    }

    // Fallback: create line between start and end points
    if (startPt && endPt) {
      const p1 = makePoint(oc, startPt)
      const dir = makeDirection(oc, {
        x: endPt.x - startPt.x,
        y: endPt.y - startPt.y,
        z: endPt.z - startPt.z
      })
      const ax1 = new oc.gp_Ax1_2(p1, dir)
      const lin = new oc.gp_Lin_2(ax1)
      return new oc.Geom_Line_2(lin)
    }

    console.warn('Unsupported curve type: ' + typeName)
    return null
  } catch (e) {
    console.warn('Failed to convert curve:', e.message)
    return null
  }
}

// ============================================================================
// Conversion context: shared vertices + shared edges
// ----------------------------------------------------------------------------
// ACIS stores topology with shared vertex/edge records (two adjacent faces
// reference the SAME edge, which references the SAME end vertices). The old
// converter rebuilt every edge from fresh gp_Pnt points, destroying that
// sharing — so BRepBuilderAPI_MakeWire could not stitch a face's edges into a
// closed loop, and faces of a body never sewed into a solid.
//
// A ConvCtx fixes this for the span of one body:
//   - vertices: quantized-coordinate -> shared TopoDS_Vertex (coincident edge
//     endpoints resolve to the SAME vertex, so wires close).
//   - edges:    ACIS edge record index -> shared forward TopoDS_Edge (both
//     coedges of adjacent faces reuse one edge, so sewing yields a solid).
// ============================================================================

/** Vertex coincidence tolerance (mm). ACIS shares vertex records, so coincident
 *  endpoints carry identical coordinates and quantize to the same key. */
const VERTEX_TOL = 1e-6

function createConvCtx() {
  return { vertices: new Map(), edges: new Map(), vtol: VERTEX_TOL, modelBox: null }
}

/**
 * Per-axis bbox {min:[x,y,z], max:[x,y,z]} of all vertex coordinates referenced
 * by a shell's edges — the TRUE per-axis extent of the shell's topology. Used to
 * reject malformed faces: a correctly-trimmed face cannot extend past the
 * vertices that bound it on ANY axis. (A diagonal test is blind here — a face
 * escaping 50% on one axis barely changes the diagonal.)
 */
function shellVertexBox(shellEntity) {
  const min = [Infinity, Infinity, Infinity]
  const max = [-Infinity, -Infinity, -Infinity]
  let n = 0
  const add = (p) => {
    if (!p) return
    const c = p.point ? p.point : p
    if (c.x == null) return
    const v = [c.x, c.y, c.z]
    for (let i = 0; i < 3; i++) {
      if (v[i] < min[i]) min[i] = v[i]
      if (v[i] > max[i]) max[i] = v[i]
    }
    n++
  }
  try {
    const faces = shellEntity.getFaces ? shellEntity.getFaces() : []
    for (const fa of faces) {
      for (const lo of (fa.getLoops ? fa.getLoops() : [])) {
        for (const ce of (lo.getCoedges ? lo.getCoedges() : [])) {
          const e = ce.getEdge ? ce.getEdge() : null
          if (e) {
            add(e.getStart ? e.getStart() : null)
            add(e.getEnd ? e.getEnd() : null)
          }
        }
      }
    }
  } catch (e) { /* fall through */ }
  return n > 0 ? { min, max } : null
}

/**
 * Per-axis bbox {min, max} of an OCC shape, or null.
 */
function shapeBox(oc, shape) {
  try {
    const bb = new oc.Bnd_Box_1()
    oc.BRepBndLib.Add(shape, bb, false)
    if (bb.IsVoid()) return null
    const a = { current: 0 }, b = { current: 0 }, c = { current: 0 }
    const d = { current: 0 }, e = { current: 0 }, f = { current: 0 }
    bb.Get(a, b, c, d, e, f)
    return { min: [a.current, b.current, c.current], max: [d.current, e.current, f.current] }
  } catch (e) {
    return null
  }
}

/**
 * Is a face geometrically valid (BRepCheck)? This is the authoritative accept
 * test for a reconstructed face — it checks pcurves, wire closure/orientation,
 * surface/curve consistency, etc.
 */
function isFaceValid(oc, face) {
  if (!face) return false
  try {
    if (face.IsNull && face.IsNull()) return false
  } catch (e) { /* ignore */ }
  try {
    const analyzer = new oc.BRepCheck_Analyzer(face, true)
    return analyzer.IsValid()
  } catch (e) {
    return false
  }
}

/**
 * Gross-escape backstop: reject a face whose per-axis bbox blows far past the
 * shell's true vertex extent. With correct geometry this rarely triggers; it
 * only guards against a wildly untrimmed parametric patch slipping through.
 * Uses generous slack (50%) so valid analytic faces are never rejected.
 */
function faceWithinModelBox(oc, face, ctx) {
  if (!face) return false
  const mb = ctx && ctx.modelBox
  if (!mb) return true
  const fb = shapeBox(oc, face)
  if (!fb) return false
  const maxExt = Math.max(mb.max[0] - mb.min[0], mb.max[1] - mb.min[1], mb.max[2] - mb.min[2])
  const axisTol = Math.max(1e-3, maxExt * 0.5)
  for (let i = 0; i < 3; i++) {
    if (fb.min[i] < mb.min[i] - axisTol || fb.max[i] > mb.max[i] + axisTol) return false
  }
  return true
}

function vertexKey(coord, vtol) {
  const s = 1 / vtol
  return Math.round((coord.x || 0) * s) + '|' +
         Math.round((coord.y || 0) * s) + '|' +
         Math.round((coord.z || 0) * s)
}

function getSharedVertex(ctx, oc, coord) {
  const key = vertexKey(coord, ctx.vtol)
  const existing = ctx.vertices.get(key)
  if (existing) return existing
  const v = new oc.BRepBuilderAPI_MakeVertex(makePoint(oc, coord)).Vertex()
  ctx.vertices.set(key, v)
  return v
}

function coordDist(a, b) {
  const dx = (a.x || 0) - (b.x || 0)
  const dy = (a.y || 0) - (b.y || 0)
  const dz = (a.z || 0) - (b.z || 0)
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

/**
 * Build a single forward TopoDS_Edge (start -> end along its curve) using shared
 * vertices. Orientation for loop traversal is applied later by the coedge.
 */
function buildEdgeForward(oc, edgeEntity, ctx) {
  const curveEntity = edgeEntity.getCurve ? edgeEntity.getCurve() : null
  let startCoord = edgeEntity.getStart ? edgeEntity.getStart() : null
  let endCoord = edgeEntity.getEnd ? edgeEntity.getEnd() : null
  // getStart/getEnd may return a {x,y,z} coord or a vertex-like with .point
  if (startCoord && startCoord.point) startCoord = startCoord.point
  if (endCoord && endCoord.point) endCoord = endCoord.point
  const typeName = curveEntity && curveEntity.getType ? curveEntity.getType() : ''
  const isStraight = !typeName || typeName.includes('straight')
  const haveEnds = !!(startCoord && endCoord)

  const v1 = haveEnds ? getSharedVertex(ctx, oc, startCoord) : null
  const v2 = haveEnds ? getSharedVertex(ctx, oc, endCoord) : null
  const closed = haveEnds && coordDist(startCoord, endCoord) < ctx.vtol

  // Straight edge between shared vertices
  if (isStraight && haveEnds) {
    if (closed) return null // degenerate
    try {
      const b = new oc.BRepBuilderAPI_MakeEdge_2(v1, v2)
      if (b.IsDone()) return b.Edge()
    } catch (e) { /* fall through */ }
    return null
  }

  // Curved edge (circle/ellipse/spline): build the geom curve, then trim it to
  // the shared end vertices using the edge's stored parameter range when present.
  const curve = convertACISCurve(oc, curveEntity, startCoord, endCoord)
  if (curve) {
    const handleCurve = new oc.Handle_Geom_Curve_2(curve)
    const p1 = typeof edgeEntity.parameter1 === 'number' && isFinite(edgeEntity.parameter1) ? edgeEntity.parameter1 : null
    const p2 = typeof edgeEntity.parameter2 === 'number' && isFinite(edgeEntity.parameter2) ? edgeEntity.parameter2 : null
    const haveParams = p1 !== null && p2 !== null && Math.abs(p2 - p1) > 1e-9
    try {
      if (haveEnds && !closed) {
        // Open arc trimmed to its two distinct vertices.
        if (haveParams) {
          const b = new oc.BRepBuilderAPI_MakeEdge_29(handleCurve, v1, v2, p1, p2)
          if (b.IsDone()) return b.Edge()
        }
        const b2 = new oc.BRepBuilderAPI_MakeEdge_27(handleCurve, v1, v2)
        if (b2.IsDone()) return b2.Edge()
      } else if (haveParams) {
        // Closed / full circle with a known [p1,p2] (~2π) span.
        if (haveEnds) {
          const b = new oc.BRepBuilderAPI_MakeEdge_29(handleCurve, v1, v2, p1, p2)
          if (b.IsDone()) return b.Edge()
        }
        const b2 = new oc.BRepBuilderAPI_MakeEdge_25(handleCurve, p1, p2)
        if (b2.IsDone()) return b2.Edge()
      } else {
        // Whole closed curve (full period).
        const b = new oc.BRepBuilderAPI_MakeEdge_24(handleCurve)
        if (b.IsDone()) return b.Edge()
      }
    } catch (e) { /* fall through to straight fallback */ }
  }

  // Last resort: straight segment between the shared endpoints.
  if (haveEnds && !closed) {
    try {
      const b = new oc.BRepBuilderAPI_MakeEdge_2(v1, v2)
      if (b.IsDone()) return b.Edge()
    } catch (e) { /* give up */ }
  }
  return null
}

/**
 * Convert ACIS edge to OpenCascade edge, reusing one shared forward edge per
 * ACIS edge record so adjacent faces share topology (required for sewing).
 * Returns the FORWARD edge; callers apply coedge orientation via .Reversed().
 */
export function convertACISEdge(oc, edgeEntity, ctx) {
  if (!edgeEntity) return null
  if (!ctx) ctx = createConvCtx()

  try {
    const idx = edgeEntity.index
    if (idx != null && ctx.edges.has(idx)) return ctx.edges.get(idx)
    const edge = buildEdgeForward(oc, edgeEntity, ctx)
    if (idx != null) ctx.edges.set(idx, edge)
    return edge
  } catch (e) {
    console.warn('Failed to convert edge:', e.message)
    return null
  }
}

/**
 * Convert ACIS loop to OpenCascade wire
 */
export function convertACISLoop(oc, loopEntity, ctx) {
  if (!loopEntity) return null
  if (!ctx) ctx = createConvCtx()

  try {
    const coedges = loopEntity.getCoedges ? loopEntity.getCoedges() : []
    if (coedges.length === 0) return null

    // Add edges in coedge (loop) order. ACIS stores coedges already ordered
    // around the loop, so sequential MakeWire.Add_1 follows the true topology;
    // because endpoints now resolve to SHARED vertices, consecutive edges
    // connect. (List-based assembly was tried but mis-connects at vertices where
    // 3+ edges meet, producing zig-zag wires that span the whole body.)
    const wireBuilder = new oc.BRepBuilderAPI_MakeWire_1()
    let edgesAdded = 0

    for (const coedge of coedges) {
      const edgeEntity = coedge.getEdge ? coedge.getEdge() : null
      const baseEdge = convertACISEdge(oc, edgeEntity, ctx)
      if (!baseEdge) continue

      // Apply coedge sense on a COPY (never mutate the shared cached edge).
      let oriented = baseEdge
      if (coedge.sense === 'reversed') {
        try {
          oriented = oc.TopoDS.Edge_1(baseEdge.Reversed())
        } catch (e) {
          oriented = baseEdge
        }
      }
      try {
        wireBuilder.Add_1(oriented)
        edgesAdded++
      } catch (e) {
        // Edge didn't connect to the growing wire — skip it.
      }
    }

    if (edgesAdded === 0) return null

    if (wireBuilder.IsDone()) {
      return wireBuilder.Wire()
    }

    // Partial wire (some edges may not have connected) — still usable for trim.
    try {
      const wire = wireBuilder.Wire()
      if (wire && !wire.IsNull()) return wire
    } catch (e) {
      // Ignore
    }
  } catch (e) {
    console.warn('Failed to convert loop:', e.message)
  }
  return null
}

/**
 * Is a wire topologically closed? MakeWire sets the Closed flag when its edges
 * form a closed loop. A face must be bounded by a closed wire; building one from
 * an open/partial wire is the failure mode that produces spanning, malformed
 * faces (MakeFace_21 is permissive enough to accept them, unlike MakeFace_8).
 */
function isWireClosed(oc, wire) {
  try {
    if (wire.Closed_1 && wire.Closed_1()) return true
  } catch (e) { /* fall through */ }
  try {
    if (wire.Closed && wire.Closed()) return true
  } catch (e) { /* fall through */ }
  return false
}

/**
 * Bounding-box diagonal of a shape (Infinity if void/failed).
 */
function bboxDiag(oc, shape) {
  try {
    const bb = new oc.Bnd_Box_1()
    oc.BRepBndLib.Add(shape, bb, false)
    if (bb.IsVoid()) return Infinity
    const xMin = { current: 0 }, yMin = { current: 0 }, zMin = { current: 0 }
    const xMax = { current: 0 }, yMax = { current: 0 }, zMax = { current: 0 }
    bb.Get(xMin, yMin, zMin, xMax, yMax, zMax)
    const dx = xMax.current - xMin.current, dy = yMax.current - yMin.current, dz = zMax.current - zMin.current
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  } catch (e) {
    return Infinity
  }
}

/**
 * Repair a freshly-built face: add missing pcurves, fix the seam on periodic
 * surfaces (cones/cylinders are periodic in U), and correct wire orientation.
 * Returns the repaired face, or the original if ShapeFix is unavailable/fails.
 */
function fixFacePCurves(oc, face) {
  if (!face) return face
  try {
    const fixer = new oc.ShapeFix_Face_2(face)
    fixer.SetPrecision(1e-6)
    fixer.SetMaxTolerance(1e-3)
    fixer.Perform()
    const fixed = fixer.Face()
    if (fixed && !fixed.IsNull()) return fixed
  } catch (e) {
    // ShapeFix unavailable or failed — keep the original face
  }
  return face
}

/**
 * Build a periodic cone/cylinder "band" face (a frustum/tube bounded by full
 * circles at each end) from explicit UV bounds, so OpenCascade adds the seam
 * natively. These faces (ACIS: a cone-surface with each loop a single full
 * circle) CANNOT be built by wire-trimming a single circle — the surface
 * escapes past the rim. We map each bounding circle to a surface V parameter by
 * projecting a point of it onto the surface, then take the full U period.
 * Returns the face, or null if this isn't a clean band case.
 */
function tryPeriodicBandFace(oc, surfaceEntity, handleSurface, faceEntity) {
  const tname = surfaceEntity && surfaceEntity.getType ? surfaceEntity.getType() : ''
  // ACIS 'cone-surface' covers both cones and cylinders (sine≈0).
  if (!tname.includes('cone')) return null

  const loops = faceEntity.getLoops ? faceEntity.getLoops() : []
  if (loops.length < 2) return null // need two circular ends to bound a band

  let sas
  try {
    sas = new oc.ShapeAnalysis_Surface(handleSurface)
  } catch (e) {
    return null
  }

  // Map each bounding circle to a surface V parameter by projecting a point of it.
  const vs = []
  for (const loop of loops) {
    const coedges = loop.getCoedges ? loop.getCoedges() : []
    if (coedges.length !== 1) return null // each end must be a single closed circle
    const edge = coedges[0].getEdge ? coedges[0].getEdge() : null
    const curve = edge && edge.getCurve ? edge.getCurve() : null
    const ct = curve && curve.getType ? curve.getType() : ''
    if (!ct.includes('ellipse')) return null
    let sp = edge.getStart ? edge.getStart() : null
    if (sp && sp.point) sp = sp.point
    if (!sp) return null
    try {
      const uv = sas.ValueOfUV(makePoint(oc, sp), 1e-6)
      vs.push(uv.Y())
    } catch (e) {
      return null
    }
  }
  if (vs.length < 2) return null

  const vMin = Math.min(...vs)
  const vMax = Math.max(...vs)
  if (!(vMax - vMin > 1e-6)) return null

  try {
    // Full U period + the V range between the two circles → the closed band.
    // MakeFace_14 = (Handle_Geom_Surface, uMin, uMax, vMin, vMax, tolDegen).
    const fb = new oc.BRepBuilderAPI_MakeFace_14(handleSurface, 0, 2 * Math.PI, vMin, vMax, 1e-6)
    if (!fb.IsDone()) return null
    const face = fixFacePCurves(oc, fb.Face())
    if (face && !face.IsNull()) {
      if (faceEntity.sense === 'reversed') face.Reverse()
      return face
    }
  } catch (e) {
    // fall through
  }
  return null
}

/**
 * Convert ACIS face to OpenCascade face
 */
export function convertACISFace(oc, faceEntity, ctx) {
  if (!faceEntity) return null
  if (!ctx) ctx = createConvCtx()

  try {
    const surfaceEntity = faceEntity.getSurface ? faceEntity.getSurface() : null
    const surface = convertACISSurface(oc, surfaceEntity)

    if (!surface) {
      return null
    }

    const handleSurface = new oc.Handle_Geom_Surface_2(surface)
    const loops = faceEntity.getLoops ? faceEntity.getLoops() : []

    // Periodic cone/cylinder band (frustum/tube with circular ends): build from
    // UV bounds with a native seam, never by wire-trimming a single circle.
    // These are constructed directly from the (correct) bounding-circle V params,
    // so they're trusted as-is — a bbox guard would wrongly reject them because
    // BRepBndLib over-reports an analytic cone's extent toward its apex.
    const band = tryPeriodicBandFace(oc, surfaceEntity, handleSurface, faceEntity)
    if (band) {
      return band
    }

    if (loops.length > 0) {
      const outerWire = convertACISLoop(oc, loops[0], ctx)

      // Only build a face from a CLOSED boundary wire. Open/partial wires yield
      // spanning, malformed faces (and never sew into a solid anyway).
      if (outerWire && isWireClosed(oc, outerWire)) {
        // Accept a built face when it does not grossly escape the shell's vertex
        // extent. (The malformation that earlier needed tight bbox guards is now
        // fixed at the parser level; per-face BRepCheck is too strict for
        // reconstructed analytic faces and is left to the sewing stage.)
        const accept = (face) => faceWithinModelBox(oc, face, ctx)

        // Preferred: trim the surface with the wire. MakeFace_21 projects the
        // wire's 3D edges onto the surface to build the pcurves that analytic
        // curved faces (cone/cylinder/sphere/torus) need; ShapeFix then repairs
        // any missing pcurve/seam. Only viable now that wires actually close.
        try {
          const faceBuilder = new oc.BRepBuilderAPI_MakeFace_21(handleSurface, outerWire, false)
          for (let i = 1; i < loops.length; i++) {
            const innerWire = convertACISLoop(oc, loops[i], ctx)
            if (innerWire) {
              innerWire.Reverse()
              faceBuilder.Add(innerWire)
            }
          }
          if (faceBuilder.IsDone()) {
            const result = fixFacePCurves(oc, faceBuilder.Face())
            if (accept(result)) {
              if (faceEntity.sense === 'reversed') result.Reverse()
              return result
            }
          }
        } catch (e) {
          // Fall through to the legacy surface-only trim
        }

        // Fallback: infinite face from surface, trimmed by adding the wire.
        try {
          // BRepBuilderAPI_MakeFace_8 takes (Handle_Geom_Surface, tolerance)
          const faceBuilder = new oc.BRepBuilderAPI_MakeFace_8(handleSurface, 1e-6)
          faceBuilder.Add(outerWire)

          // Add inner wires (holes)
          for (let i = 1; i < loops.length; i++) {
            const innerWire = convertACISLoop(oc, loops[i], ctx)
            if (innerWire) {
              innerWire.Reverse()
              faceBuilder.Add(innerWire)
            }
          }

          if (faceBuilder.IsDone()) {
            const result = fixFacePCurves(oc, faceBuilder.Face())
            if (accept(result)) {
              if (faceEntity.sense === 'reversed') result.Reverse()
              return result
            }
          }
        } catch (e) {
          // Wire-based face failed, try UV bounds approach
        }
      }
    }

    // Try to create bounded face using UV parameters from surface
    // This works for surfaces that have natural bounds (like B-splines with finite domains)
    try {
      // Get UV bounds from surface
      let uMin = -1e6, uMax = 1e6, vMin = -1e6, vMax = 1e6

      // For B-spline surfaces, use knot ranges
      if (surfaceEntity && surfaceEntity.nubs) {
        const nubs = surfaceEntity.nubs
        if (nubs.uKnots && nubs.uKnots.length >= 2) {
          uMin = nubs.uKnots[0]
          uMax = nubs.uKnots[nubs.uKnots.length - 1]
        }
        if (nubs.vKnots && nubs.vKnots.length >= 2) {
          vMin = nubs.vKnots[0]
          vMax = nubs.vKnots[nubs.vKnots.length - 1]
        }
      }

      // For other parametric surfaces, check if they have ranges
      if (surfaceEntity && surfaceEntity.range) {
        const range = surfaceEntity.range
        if (range.uRange) {
          uMin = range.uRange.lower
          uMax = range.uRange.upper
        }
        if (range.vRange) {
          vMin = range.vRange.lower
          vMax = range.vRange.upper
        }
      }

      // Only create bounded face if we have reasonable bounds
      const MAX_PARAM = 1e5
      if (Math.abs(uMin) < MAX_PARAM && Math.abs(uMax) < MAX_PARAM &&
          Math.abs(vMin) < MAX_PARAM && Math.abs(vMax) < MAX_PARAM &&
          uMax > uMin && vMax > vMin) {
        // BRepBuilderAPI_MakeFace_9 takes (Handle_Geom_Surface, umin, umax, vmin, vmax, tolerance)
        const faceBuilder = new oc.BRepBuilderAPI_MakeFace_14(handleSurface, uMin, uMax, vMin, vMax, 1e-6)
        if (faceBuilder.IsDone()) {
          const result = faceBuilder.Face()
          // This builds an untrimmed UV patch — accept only if it stays bounded.
          if (faceWithinModelBox(oc, result, ctx)) {
            if (faceEntity.sense === 'reversed') result.Reverse()
            return result
          }
        }
      }
    } catch (e) {
      // UV bounds approach also failed
    }

    // Skip faces without valid bounds
  } catch (e) {
    // Face creation failed entirely
  }
  return null
}

/**
 * Convert ACIS shell to OpenCascade shell
 */
export function convertACISShell(oc, shellEntity) {
  if (!shellEntity) return null

  try {
    const faces = shellEntity.getFaces ? shellEntity.getFaces() : []
    if (faces.length === 0) return null

    const shellBuilder = new oc.BRep_Builder()
    const shell = new oc.TopoDS_Shell()
    shellBuilder.MakeShell(shell)

    let faceCount = 0
    let skippedFaces = 0
    for (const faceEntity of faces) {
      // Build each face with its OWN context (shared vertices/edges within the
      // face only). Sharing across the whole shell accumulates vertex tolerance
      // at high-valence corners and drops ~20% of faces; building faces
      // independently and letting the sewing stage merge coincident edges keeps
      // them all. convertACISFace already validates and bounds each face.
      const face = convertACISFace(oc, faceEntity)
      if (face) {
        try {
          shellBuilder.Add(shell, face)
          faceCount++
        } catch (e) {
          skippedFaces++
        }
      }
    }

    if (faceCount > 0) {
      return shell
    }
  } catch (e) {
    console.warn('Failed to convert shell:', e.message)
  }
  return null
}

/**
 * Try to create a solid from a shell
 */
function tryMakeSolid(oc, shell) {
  let working = shell

  // Sew with a tolerance scaled to the part. Faces from different builders
  // (a cone band's rim circle vs an adjacent plane's arc) are geometrically
  // coincident but not the same edge object, so they only merge if the sewing
  // tolerance is comfortably above their floating-point gap.
  try {
    const diag = bboxDiag(oc, shell)
    const tol = (isFinite(diag) && diag > 0) ? Math.max(1e-4, diag * 1e-3) : 1e-3
    const sewing = new oc.BRepBuilderAPI_Sewing(tol, true, true, true, false)
    sewing.Add(shell)
    sewing.Perform(new oc.Message_ProgressRange_1())
    working = sewing.SewedShape()
  } catch (e) {
    // keep the unsewn shell
  }

  // Already a solid?
  try {
    const se = new oc.TopExp_Explorer_2(working, oc.TopAbs_ShapeEnum.TopAbs_SOLID, oc.TopAbs_ShapeEnum.TopAbs_SHAPE)
    if (se.More()) return oc.TopoDS.Solid_1(se.Current())
  } catch (e) { /* ignore */ }

  // Promote a (closed) shell to a solid. ShapeFix_Solid orients shells/voids
  // correctly; fall back to MakeSolid, then to returning the shell as-is.
  try {
    const she = new oc.TopExp_Explorer_2(working, oc.TopAbs_ShapeEnum.TopAbs_SHELL, oc.TopAbs_ShapeEnum.TopAbs_SHAPE)
    if (she.More()) {
      const sewedShell = oc.TopoDS.Shell_1(she.Current())
      try {
        const fixer = new oc.ShapeFix_Solid_1()
        const solid = fixer.SolidFromShell(sewedShell)
        if (solid && !solid.IsNull()) {
          // Confirm it really became a solid (closed); else keep the shell.
          const chk = new oc.TopExp_Explorer_2(solid, oc.TopAbs_ShapeEnum.TopAbs_SOLID, oc.TopAbs_ShapeEnum.TopAbs_SHAPE)
          if (chk.More()) return solid
        }
      } catch (e) { /* ignore */ }
      try {
        const sb = new oc.BRepBuilderAPI_MakeSolid_2(sewedShell)
        if (sb.IsDone()) return sb.Solid()
      } catch (e) { /* ignore */ }
      return sewedShell
    }
  } catch (e) { /* ignore */ }

  return working
}

/**
 * Convert ACIS body to OpenCascade solid
 */
export function convertACISBody(oc, bodyEntity) {
  if (!bodyEntity) return null

  try {
    const lumps = bodyEntity.getLumps ? bodyEntity.getLumps() : []
    const solidsAndShells = []

    for (const lump of lumps) {
      const lumpShells = lump.getShells ? lump.getShells() : []
      for (const shellEntity of lumpShells) {
        const shell = convertACISShell(oc, shellEntity)
        if (shell) {
          // Try to convert shell to solid
          const solidOrShell = tryMakeSolid(oc, shell)
          solidsAndShells.push(solidOrShell)
        }
      }
    }

    if (solidsAndShells.length === 0) return null

    if (solidsAndShells.length === 1) {
      return solidsAndShells[0]
    }

    // Multiple shapes - create compound
    const builder = new oc.BRep_Builder()
    const compound = new oc.TopoDS_Compound()
    builder.MakeCompound(compound)

    for (const shape of solidsAndShells) {
      builder.Add(compound, shape)
    }

    return compound
  } catch (e) {
    console.warn('Failed to convert body:', e.message)
  }
  return null
}

/**
 * Check if a shape has valid (non-extreme) bounding box
 */
function hasValidBoundingBox(oc, shape) {
  try {
    const bndBox = new oc.Bnd_Box_1()
    oc.BRepBndLib.Add(shape, bndBox, false)

    if (bndBox.IsVoid()) return false

    const xMin = { current: 0 }, yMin = { current: 0 }, zMin = { current: 0 }
    const xMax = { current: 0 }, yMax = { current: 0 }, zMax = { current: 0 }
    bndBox.Get(xMin, yMin, zMin, xMax, yMax, zMax)

    const MAX_EXTENT = 1e10
    if (Math.abs(xMin.current) > MAX_EXTENT || Math.abs(xMax.current) > MAX_EXTENT ||
        Math.abs(yMin.current) > MAX_EXTENT || Math.abs(yMax.current) > MAX_EXTENT ||
        Math.abs(zMin.current) > MAX_EXTENT || Math.abs(zMax.current) > MAX_EXTENT) {
      return false
    }

    return true
  } catch (e) {
    return false
  }
}

/**
 * Convert array of ACIS bodies to single OpenCascade shape
 */
export function convertACISBodiesToShape(oc, bodies) {
  if (!bodies || bodies.length === 0) return null

  console.log(`  Converting ${bodies.length} ACIS bodies to OpenCascade shapes...`)

  const shapes = []
  let totalFaces = 0
  let skippedBodies = 0

  for (let i = 0; i < bodies.length; i++) {
    const body = bodies[i]
    console.log(`  Processing body ${i + 1}/${bodies.length}...`)

    const shape = convertACISBody(oc, body)
    if (shape) {
      // Validate bounding box before adding
      if (hasValidBoundingBox(oc, shape)) {
        shapes.push(shape)

        // Count faces
        const lumps = body.getLumps ? body.getLumps() : []
        for (const lump of lumps) {
          const shells = lump.getShells ? lump.getShells() : []
          for (const shell of shells) {
            const faces = shell.getFaces ? shell.getFaces() : []
            totalFaces += faces.length
          }
        }
      } else {
        skippedBodies++
        console.warn(`  Skipped body ${i + 1} (invalid bounding box)`)
      }
    }
  }

  console.log(`  Total faces to process: ${totalFaces}`)
  if (skippedBodies > 0) {
    console.log(`  Skipped ${skippedBodies} bodies with invalid geometry`)
  }

  if (shapes.length === 0) {
    throw new Error('Failed to convert any ACIS bodies to geometry')
  }

  // Combine all per-body face groups, then sew coincident edges and promote the
  // resulting closed shells to true B-rep solids.
  const builder = new oc.BRep_Builder()
  const compound = new oc.TopoDS_Compound()
  builder.MakeCompound(compound)
  for (const shape of shapes) {
    builder.Add(compound, shape)
  }

  return sewAndSolidify(oc, compound)
}

/**
 * Sew a face/shell soup so geometrically-coincident edges from independently
 * built faces merge, then promote each closed shell to a TopoDS_Solid. Open
 * shells are kept as shells. Returns a compound of solids + remaining shells.
 */
function sewAndSolidify(oc, shape) {
  let sewn = shape
  try {
    // The ASM parse fragments one solid into many small "bodies"; their faces
    // only share edges geometrically, so sew with a small absolute tolerance.
    const sewing = new oc.BRepBuilderAPI_Sewing(1e-3, true, true, true, false)
    sewing.Add(shape)
    sewing.Perform(new oc.Message_ProgressRange_1())
    sewn = sewing.SewedShape()
  } catch (e) {
    // keep the unsewn soup
  }

  const builder = new oc.BRep_Builder()
  const out = new oc.TopoDS_Compound()
  builder.MakeCompound(out)
  let nSolids = 0, nShells = 0

  try {
    const she = new oc.TopExp_Explorer_2(sewn, oc.TopAbs_ShapeEnum.TopAbs_SHELL, oc.TopAbs_ShapeEnum.TopAbs_SHAPE)
    while (she.More()) {
      const shell = oc.TopoDS.Shell_1(she.Current())
      let solidified = false
      let closed = false
      try { closed = shell.Closed_1 ? shell.Closed_1() : false } catch (e) { closed = false }
      if (closed) {
        try {
          const fixer = new oc.ShapeFix_Solid_1()
          const solid = fixer.SolidFromShell(shell)
          if (solid && !solid.IsNull()) {
            builder.Add(out, solid)
            nSolids++
            solidified = true
          }
        } catch (e) { /* fall back to shell */ }
      }
      if (!solidified) {
        builder.Add(out, shell)
        nShells++
      }
      she.Next()
    }
  } catch (e) {
    return sewn
  }

  console.log(`  Assembled ${nSolids} solid(s) + ${nShells} open shell(s)`)
  if (nSolids === 0 && nShells === 0) return sewn
  return out
}

// ============================================================================
// Exports
// ============================================================================

export default {
  // Helpers
  makePoint,
  makePoint2d,
  makeDirection,
  makeVec,
  makeAx1,
  makeAx2,
  makeAx3,

  // Basic curves
  createLine,
  createCircle,
  createEllipse,

  // B-spline curves
  createBSplineCurve,
  createBSplineCurve2d,
  createBSplinePCurve,
  createHelixCurve,

  // Surfaces
  createBSplineSurface,
  createSurfaceOfRevolution,
  createRuledSurface,
  createOffsetSurface,
  createCylindricalSurface,
  createConicalSurface,
  createPlaneSurface,
  createSphericalSurface,
  createToroidalSurface,

  // Shape builders
  createFaceFromSurface,
  createEdgeFromCurve,
  buildWithOpenCascade,

  // ACIS converters
  convertACISSurface,
  convertACISCurve,
  convertACISEdge,
  convertACISLoop,
  convertACISFace,
  convertACISShell,
  convertACISBody,
  convertACISBodiesToShape
}
