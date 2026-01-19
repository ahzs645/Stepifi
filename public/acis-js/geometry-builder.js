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
      const ax3 = makeAx3(oc, surfaceEntity.center, surfaceEntity.axis, surfaceEntity.uvOrigin)
      const radius = surfaceEntity.majorRadius || 1.0
      const semiAngle = Math.abs(surfaceEntity.semiAngle) || Math.PI / 4
      if (Math.abs(semiAngle) < 1e-6) {
        return new oc.Geom_CylindricalSurface_1(ax3, radius)
      }
      return new oc.Geom_ConicalSurface_1(ax3, semiAngle, radius)
    } else if (typeName.includes('sphere')) {
      return createSphericalSurface(oc, surfaceEntity.center, surfaceEntity.radius || 1.0)
    } else if (typeName.includes('torus')) {
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

/**
 * Convert ACIS edge to OpenCascade edge
 */
export function convertACISEdge(oc, edgeEntity) {
  if (!edgeEntity) return null

  try {
    const curveEntity = edgeEntity.getCurve ? edgeEntity.getCurve() : null
    const startPt = edgeEntity.getStart ? edgeEntity.getStart() : null
    const endPt = edgeEntity.getEnd ? edgeEntity.getEnd() : null

    // Get start/end points from vertices (getStart/getEnd return point coords directly)
    const startVertex = startPt && startPt.point ? startPt.point : startPt
    const endVertex = endPt && endPt.point ? endPt.point : endPt

    // For straight lines with valid endpoints, use simple point-to-point edge
    if (startVertex && endVertex) {
      const p1 = makePoint(oc, startVertex)
      const p2 = makePoint(oc, endVertex)

      // Check for degenerate edge
      const dx = (endVertex.x || 0) - (startVertex.x || 0)
      const dy = (endVertex.y || 0) - (startVertex.y || 0)
      const dz = (endVertex.z || 0) - (startVertex.z || 0)
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
      if (dist < 1e-6) return null

      // Try curve-based edge first for non-straight curves
      const typeName = curveEntity && curveEntity.getType ? curveEntity.getType() : ''

      if (typeName && !typeName.includes('straight')) {
        // For splines/ellipses, try to use the curve
        const curve = convertACISCurve(oc, curveEntity, startVertex, endVertex)
        if (curve) {
          try {
            const handleCurve = new oc.Handle_Geom_Curve_2(curve)
            // BRepBuilderAPI_MakeEdge_20 takes just the curve handle
            const builder = new oc.BRepBuilderAPI_MakeEdge_20(handleCurve)
            if (builder.IsDone()) {
              const edge = builder.Edge()
              if (edgeEntity.sense === 'reversed') edge.Reverse()
              return edge
            }
          } catch (e) {
            // Fall through to point-based edge
          }
        }
      }

      // For straight lines or fallback: use BRepBuilderAPI_MakeEdge_3(gp_Pnt, gp_Pnt)
      try {
        const builder = new oc.BRepBuilderAPI_MakeEdge_3(p1, p2)
        if (builder.IsDone()) {
          const edge = builder.Edge()
          if (edgeEntity.sense === 'reversed') edge.Reverse()
          return edge
        }
      } catch (e) {
        console.warn('Point-based edge failed:', e.message)
      }
    }

    // No valid endpoints - try curve only
    const curve = convertACISCurve(oc, curveEntity, startVertex, endVertex)
    if (curve) {
      try {
        const handleCurve = new oc.Handle_Geom_Curve_2(curve)
        const builder = new oc.BRepBuilderAPI_MakeEdge_20(handleCurve)
        if (builder.IsDone()) {
          const edge = builder.Edge()
          if (edgeEntity.sense === 'reversed') edge.Reverse()
          return edge
        }
      } catch (e) {
        console.warn('Curve-based edge failed:', e.message)
      }
    }
  } catch (e) {
    console.warn('Failed to convert edge:', e.message)
  }
  return null
}

/**
 * Convert ACIS loop to OpenCascade wire
 */
export function convertACISLoop(oc, loopEntity) {
  if (!loopEntity) return null

  try {
    const coedges = loopEntity.getCoedges ? loopEntity.getCoedges() : []
    if (coedges.length === 0) return null

    const wireBuilder = new oc.BRepBuilderAPI_MakeWire_1()
    let edgesAdded = 0

    for (const coedge of coedges) {
      const edgeEntity = coedge.getEdge ? coedge.getEdge() : null
      const edge = convertACISEdge(oc, edgeEntity)

      if (edge) {
        // Apply coedge sense
        if (coedge.sense === 'reversed') {
          edge.Reverse()
        }
        try {
          wireBuilder.Add_1(edge)
          edgesAdded++
        } catch (e) {
          // Edge might not connect - continue with other edges
        }
      }
    }

    // Wire needs at least one edge
    if (edgesAdded === 0) return null

    if (wireBuilder.IsDone()) {
      return wireBuilder.Wire()
    } else {
      // Try to get partial wire
      try {
        const wire = wireBuilder.Wire()
        if (wire && !wire.IsNull()) {
          return wire
        }
      } catch (e) {
        // Ignore
      }
    }
  } catch (e) {
    console.warn('Failed to convert loop:', e.message)
  }
  return null
}

/**
 * Convert ACIS face to OpenCascade face
 */
export function convertACISFace(oc, faceEntity) {
  if (!faceEntity) return null

  try {
    const surfaceEntity = faceEntity.getSurface ? faceEntity.getSurface() : null
    const surface = convertACISSurface(oc, surfaceEntity)

    if (!surface) {
      return null
    }

    const handleSurface = new oc.Handle_Geom_Surface_2(surface)
    const loops = faceEntity.getLoops ? faceEntity.getLoops() : []

    if (loops.length > 0) {
      const outerLoop = loops[0]
      const outerWire = convertACISLoop(oc, outerLoop)

      if (outerWire) {
        try {
          // First create face from surface with tolerance
          // BRepBuilderAPI_MakeFace_8 takes (Handle_Geom_Surface, tolerance)
          const faceBuilder = new oc.BRepBuilderAPI_MakeFace_8(handleSurface, 1e-6)

          // Then add the outer wire
          faceBuilder.Add(outerWire)

          // Add inner wires (holes)
          for (let i = 1; i < loops.length; i++) {
            const innerWire = convertACISLoop(oc, loops[i])
            if (innerWire) {
              innerWire.Reverse()
              faceBuilder.Add(innerWire)
            }
          }

          if (faceBuilder.IsDone()) {
            const result = faceBuilder.Face()
            if (faceEntity.sense === 'reversed') result.Reverse()
            return result
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
        const faceBuilder = new oc.BRepBuilderAPI_MakeFace_9(handleSurface, uMin, uMax, vMin, vMax, 1e-6)
        if (faceBuilder.IsDone()) {
          const result = faceBuilder.Face()
          if (faceEntity.sense === 'reversed') result.Reverse()
          return result
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
      const face = convertACISFace(oc, faceEntity)
      if (face) {
        // Validate face bounding box before adding
        try {
          const bndBox = new oc.Bnd_Box_1()
          oc.BRepBndLib.Add(face, bndBox, false)

          if (!bndBox.IsVoid()) {
            const xMin = { current: 0 }, yMin = { current: 0 }, zMin = { current: 0 }
            const xMax = { current: 0 }, yMax = { current: 0 }, zMax = { current: 0 }
            bndBox.Get(xMin, yMin, zMin, xMax, yMax, zMax)

            const MAX_EXTENT = 1e10
            if (Math.abs(xMin.current) < MAX_EXTENT && Math.abs(xMax.current) < MAX_EXTENT &&
                Math.abs(yMin.current) < MAX_EXTENT && Math.abs(yMax.current) < MAX_EXTENT &&
                Math.abs(zMin.current) < MAX_EXTENT && Math.abs(zMax.current) < MAX_EXTENT) {
              shellBuilder.Add(shell, face)
              faceCount++
            } else {
              skippedFaces++
            }
          } else {
            skippedFaces++
          }
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
 * Convert ACIS body to OpenCascade solid
 */
export function convertACISBody(oc, bodyEntity) {
  if (!bodyEntity) return null

  try {
    const lumps = bodyEntity.getLumps ? bodyEntity.getLumps() : []
    const shells = []

    for (const lump of lumps) {
      const lumpShells = lump.getShells ? lump.getShells() : []
      for (const shellEntity of lumpShells) {
        const shell = convertACISShell(oc, shellEntity)
        if (shell) {
          shells.push(shell)
        }
      }
    }

    if (shells.length === 0) return null

    // Try to create solid from shells
    if (shells.length === 1) {
      try {
        const solidBuilder = new oc.BRepBuilderAPI_MakeSolid_2(shells[0])
        if (solidBuilder.IsDone()) {
          return solidBuilder.Solid()
        }
      } catch (e) {
        // Fall back to returning shell
        return shells[0]
      }
    }

    // Multiple shells - create compound
    const builder = new oc.BRep_Builder()
    const compound = new oc.TopoDS_Compound()
    builder.MakeCompound(compound)

    for (const shell of shells) {
      builder.Add(compound, shell)
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

  if (shapes.length === 1) {
    return shapes[0]
  }

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
