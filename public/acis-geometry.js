/**
 * ACIS to OpenCascade.js Geometry Converter
 * Converts parsed ACIS entities to OC.js B-rep geometry
 */

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create gp_Pnt from position object
 */
function makePoint(oc, pos) {
  if (!pos) return new oc.gp_Pnt_3(0, 0, 0)
  return new oc.gp_Pnt_3(pos.x || 0, pos.y || 0, pos.z || 0)
}

/**
 * Create gp_Dir from vector object (normalized)
 */
function makeDirection(oc, vec) {
  if (!vec) return new oc.gp_Dir_4(0, 0, 1)
  const len = Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z)
  if (len < 1e-10) return new oc.gp_Dir_4(0, 0, 1)
  return new oc.gp_Dir_4(vec.x / len, vec.y / len, vec.z / len)
}

/**
 * Create gp_Vec from vector object
 */
function makeVector(oc, vec) {
  if (!vec) return new oc.gp_Vec_4(0, 0, 1)
  return new oc.gp_Vec_4(vec.x || 0, vec.y || 0, vec.z || 0)
}

/**
 * Create gp_Ax2 (coordinate system) from origin, z-dir, and optional x-dir
 */
function makeAx2(oc, origin, zDir, xDir) {
  const pnt = makePoint(oc, origin)
  const z = makeDirection(oc, zDir)

  if (xDir) {
    const x = makeDirection(oc, xDir)
    return new oc.gp_Ax2_2(pnt, z, x)
  }
  return new oc.gp_Ax2_3(pnt, z)
}

/**
 * Create gp_Ax3 (right-handed coordinate system) from origin and axis
 */
function makeAx3(oc, origin, axis, refDir) {
  const pnt = makePoint(oc, origin)
  const z = makeDirection(oc, axis)

  if (refDir) {
    const x = makeDirection(oc, refDir)
    return new oc.gp_Ax3_3(pnt, z, x)
  }
  return new oc.gp_Ax3_4(pnt, z)
}

// ============================================================================
// Surface Converters
// ============================================================================

/**
 * Convert ACIS surface to OpenCascade Geom_Surface
 */
function convertACISSurface(oc, surface) {
  if (!surface) return null

  // Normalize surface type (handle both "plane" and "plane-surface")
  const surfaceType = surface.type
  const normalizedType = surfaceType.endsWith('-surface') ? surfaceType : surfaceType + '-surface'

  try {
    switch (normalizedType) {
      case 'plane-surface':
        return convertPlaneSurface(oc, surface)

      case 'cylinder-surface':
        return convertCylinderSurface(oc, surface)

      case 'cone-surface':
        return convertConeSurface(oc, surface)

      case 'sphere-surface':
        return convertSphereSurface(oc, surface)

      case 'torus-surface':
        return convertTorusSurface(oc, surface)

      case 'spline-surface':
        return convertSplineSurface(oc, surface)

      default:
        console.warn(`Unsupported surface type: ${surface.type}`)
        return null
    }
  } catch (e) {
    console.warn(`Failed to convert surface ${surface.type}:`, e.message)
    return null
  }
}

function convertPlaneSurface(oc, surface) {
  const origin = makePoint(oc, surface.origin)
  const normal = makeDirection(oc, surface.normal)
  return new oc.Geom_Plane_2(origin, normal)
}

function convertCylinderSurface(oc, surface) {
  const ax3 = makeAx3(oc, surface.origin, surface.axis, surface.refDirection)
  const radius = surface.radius || 1.0
  return new oc.Geom_CylindricalSurface_1(ax3, radius)
}

function convertConeSurface(oc, surface) {
  const ax3 = makeAx3(oc, surface.origin, surface.axis, surface.refDirection)
  const semiAngle = surface.semiAngle || Math.PI / 4
  const refRadius = surface.refRadius || 1.0
  return new oc.Geom_ConicalSurface_1(ax3, semiAngle, refRadius)
}

function convertSphereSurface(oc, surface) {
  const ax3 = makeAx3(oc, surface.origin, { x: 0, y: 0, z: 1 })
  const radius = surface.radius || 1.0
  return new oc.Geom_SphericalSurface_1(ax3, radius)
}

function convertTorusSurface(oc, surface) {
  const ax3 = makeAx3(oc, surface.origin, surface.axis)
  const majorRadius = surface.majorRadius || 2.0
  const minorRadius = surface.minorRadius || 0.5
  return new oc.Geom_ToroidalSurface_1(ax3, majorRadius, minorRadius)
}

function convertSplineSurface(oc, surface) {
  // B-spline surface conversion
  const uDegree = surface.uDegree || 3
  const vDegree = surface.vDegree || 3
  const poles = surface.poles || []
  const nU = surface.nU || Math.ceil(Math.sqrt(poles.length))
  const nV = surface.nV || Math.ceil(poles.length / nU)

  if (poles.length < (uDegree + 1) * (vDegree + 1)) {
    console.warn('Not enough poles for B-spline surface')
    return null
  }

  try {
    // Create poles array
    const polesArray = new oc.TColgp_Array2OfPnt_2(1, nU, 1, nV)
    let poleIdx = 0
    for (let i = 1; i <= nU && poleIdx < poles.length; i++) {
      for (let j = 1; j <= nV && poleIdx < poles.length; j++) {
        const p = poles[poleIdx++]
        polesArray.SetValue(i, j, makePoint(oc, p))
      }
    }

    // Create uniform knot vectors
    const uKnotsCount = nU - uDegree + 1
    const vKnotsCount = nV - vDegree + 1

    const uKnots = new oc.TColStd_Array1OfReal_2(1, uKnotsCount)
    const vKnots = new oc.TColStd_Array1OfReal_2(1, vKnotsCount)
    const uMults = new oc.TColStd_Array1OfInteger_2(1, uKnotsCount)
    const vMults = new oc.TColStd_Array1OfInteger_2(1, vKnotsCount)

    for (let i = 1; i <= uKnotsCount; i++) {
      uKnots.SetValue(i, (i - 1) / (uKnotsCount - 1))
      uMults.SetValue(i, i === 1 || i === uKnotsCount ? uDegree + 1 : 1)
    }
    for (let i = 1; i <= vKnotsCount; i++) {
      vKnots.SetValue(i, (i - 1) / (vKnotsCount - 1))
      vMults.SetValue(i, i === 1 || i === vKnotsCount ? vDegree + 1 : 1)
    }

    return new oc.Geom_BSplineSurface_2(
      polesArray, uKnots, vKnots, uMults, vMults, uDegree, vDegree, false, false
    )
  } catch (e) {
    console.warn('Failed to create B-spline surface:', e.message)
    return null
  }
}

// ============================================================================
// Curve Converters
// ============================================================================

/**
 * Convert ACIS curve to OpenCascade Geom_Curve
 */
function convertACISCurve(oc, curve) {
  if (!curve) return null

  // Normalize curve type (handle both "straight" and "straight-curve")
  const curveType = curve.type
  const normalizedType = curveType.endsWith('-curve') ? curveType : curveType + '-curve'

  try {
    switch (normalizedType) {
      case 'straight-curve':
        return convertStraightCurve(oc, curve)

      case 'ellipse-curve':
        return convertEllipseCurve(oc, curve)

      case 'intcurve-curve':
      case 'spline-curve':
        return convertSplineCurve(oc, curve)

      default:
        console.warn(`Unsupported curve type: ${curve.type}`)
        return null
    }
  } catch (e) {
    console.warn(`Failed to convert curve ${curve.type}:`, e.message)
    return null
  }
}

function convertStraightCurve(oc, curve) {
  const origin = makePoint(oc, curve.origin)
  const direction = makeDirection(oc, curve.direction)
  return new oc.Geom_Line_2(origin, direction)
}

function convertEllipseCurve(oc, curve) {
  const center = makePoint(oc, curve.center)
  const normal = makeDirection(oc, curve.normal)
  const majorAxis = curve.majorAxis
    ? makeDirection(oc, curve.majorAxis)
    : new oc.gp_Dir_4(1, 0, 0)

  const majorRadius = curve.majorRadius || 1.0
  const ratio = curve.ratio || 1.0
  const minorRadius = majorRadius * ratio

  const ax2 = new oc.gp_Ax2_2(center, normal, majorAxis)

  if (Math.abs(ratio - 1.0) < 1e-6) {
    // Circle
    return new oc.Geom_Circle_2(ax2, majorRadius)
  } else {
    // Ellipse
    return new oc.Geom_Ellipse_1(ax2, majorRadius, minorRadius)
  }
}

function convertSplineCurve(oc, curve) {
  const degree = curve.degree || 3
  const poles = curve.poles || []
  const knots = curve.knots || []
  const weights = curve.weights || []

  if (poles.length < degree + 1) {
    console.warn('Not enough poles for B-spline curve')
    return null
  }

  try {
    // Create poles array
    const polesArray = new oc.TColgp_Array1OfPnt_2(1, poles.length)
    for (let i = 0; i < poles.length; i++) {
      polesArray.SetValue(i + 1, makePoint(oc, poles[i]))
    }

    // Create or generate knots
    const numKnots = poles.length - degree + 1
    const knotsArray = new oc.TColStd_Array1OfReal_2(1, numKnots)
    const multsArray = new oc.TColStd_Array1OfInteger_2(1, numKnots)

    if (knots.length >= numKnots) {
      // Use provided knots
      for (let i = 0; i < numKnots; i++) {
        knotsArray.SetValue(i + 1, knots[i])
        multsArray.SetValue(i + 1, i === 0 || i === numKnots - 1 ? degree + 1 : 1)
      }
    } else {
      // Generate uniform knots
      for (let i = 0; i < numKnots; i++) {
        knotsArray.SetValue(i + 1, i / (numKnots - 1))
        multsArray.SetValue(i + 1, i === 0 || i === numKnots - 1 ? degree + 1 : 1)
      }
    }

    if (weights.length === poles.length) {
      // Rational B-spline
      const weightsArray = new oc.TColStd_Array1OfReal_2(1, weights.length)
      for (let i = 0; i < weights.length; i++) {
        weightsArray.SetValue(i + 1, weights[i])
      }
      return new oc.Geom_BSplineCurve_2(
        polesArray, weightsArray, knotsArray, multsArray, degree, false
      )
    } else {
      // Non-rational B-spline
      return new oc.Geom_BSplineCurve_1(
        polesArray, knotsArray, multsArray, degree, false
      )
    }
  } catch (e) {
    console.warn('Failed to create B-spline curve:', e.message)
    return null
  }
}

// ============================================================================
// Topology Builders
// ============================================================================

/**
 * Convert ACIS vertex to OpenCascade TopoDS_Vertex
 */
function convertACISVertex(oc, vertex) {
  if (!vertex || !vertex.point) return null

  try {
    const pnt = makePoint(oc, vertex.point)
    const builder = new oc.BRepBuilderAPI_MakeVertex(pnt)
    if (builder.IsDone()) {
      return builder.Vertex()
    }
  } catch (e) {
    console.warn('Failed to create vertex:', e.message)
  }
  return null
}

/**
 * Convert ACIS edge to OpenCascade TopoDS_Edge
 */
function convertACISEdge(oc, edge) {
  if (!edge) return null

  try {
    const curve = convertACISCurve(oc, edge.curve)
    if (!curve) {
      // Fallback: create line between vertices
      if (edge.startVertex?.point && edge.endVertex?.point) {
        const p1 = makePoint(oc, edge.startVertex.point)
        const p2 = makePoint(oc, edge.endVertex.point)
        const builder = new oc.BRepBuilderAPI_MakeEdge_3(p1, p2)
        if (builder.IsDone()) {
          return builder.Edge()
        }
      }
      return null
    }

    const handleCurve = new oc.Handle_Geom_Curve_2(curve)

    // Create edge with parameter bounds
    const builder = new oc.BRepBuilderAPI_MakeEdge_24(
      handleCurve,
      edge.startParam || 0,
      edge.endParam || 1
    )

    if (builder.IsDone()) {
      return builder.Edge()
    }
  } catch (e) {
    console.warn('Failed to create edge:', e.message)
  }
  return null
}

/**
 * Convert ACIS loop to OpenCascade TopoDS_Wire
 */
function convertACISLoop(oc, loop) {
  if (!loop || !loop.coedges || loop.coedges.length === 0) return null

  try {
    const wireBuilder = new oc.BRepBuilderAPI_MakeWire_1()

    for (const coedge of loop.coedges) {
      if (!coedge.edge) continue

      const edge = convertACISEdge(oc, coedge.edge)
      if (edge) {
        // Handle edge sense (forward/reversed)
        if (!coedge.sense) {
          edge.Reverse()
        }
        wireBuilder.Add_1(edge)
      }
    }

    if (wireBuilder.IsDone()) {
      return wireBuilder.Wire()
    }
  } catch (e) {
    console.warn('Failed to create wire:', e.message)
  }
  return null
}

/**
 * Convert ACIS face to OpenCascade TopoDS_Face
 */
function convertACISFace(oc, face) {
  if (!face) return null

  try {
    const surface = convertACISSurface(oc, face.surface)

    if (!surface) {
      console.warn('No surface for face, skipping')
      return null
    }

    const handleSurface = new oc.Handle_Geom_Surface_2(surface)

    // If we have loops, create face with wires
    if (face.loops && face.loops.length > 0) {
      // First loop is outer boundary
      const outerLoop = face.loops[0]
      const outerWire = convertACISLoop(oc, outerLoop)

      if (outerWire) {
        const faceBuilder = new oc.BRepBuilderAPI_MakeFace_15(
          handleSurface,
          outerWire,
          true // check wire planarity
        )

        // Add inner loops (holes)
        for (let i = 1; i < face.loops.length; i++) {
          const innerWire = convertACISLoop(oc, face.loops[i])
          if (innerWire) {
            innerWire.Reverse() // Inner wires should be reversed
            faceBuilder.Add(innerWire)
          }
        }

        if (faceBuilder.IsDone()) {
          const result = faceBuilder.Face()
          if (!face.sense) {
            result.Reverse()
          }
          return result
        }
      }
    }

    // Fallback: create unbounded face from surface
    const faceBuilder = new oc.BRepBuilderAPI_MakeFace_8(handleSurface, 1e-6)
    if (faceBuilder.IsDone()) {
      const result = faceBuilder.Face()
      if (!face.sense) {
        result.Reverse()
      }
      return result
    }
  } catch (e) {
    console.warn('Failed to create face:', e.message)
  }
  return null
}

/**
 * Convert ACIS shell to OpenCascade TopoDS_Shell
 */
function convertACISShell(oc, shell) {
  if (!shell || !shell.faces || shell.faces.length === 0) return null

  try {
    const builder = new oc.BRep_Builder()
    const ocShell = new oc.TopoDS_Shell()
    builder.MakeShell(ocShell)

    let faceCount = 0
    for (const face of shell.faces) {
      const ocFace = convertACISFace(oc, face)
      if (ocFace) {
        builder.Add(ocShell, ocFace)
        faceCount++
      }
    }

    if (faceCount > 0) {
      return ocShell
    }
  } catch (e) {
    console.warn('Failed to create shell:', e.message)
  }
  return null
}

/**
 * Convert ACIS body to OpenCascade TopoDS_Shape
 */
function convertACISBody(oc, body) {
  if (!body) return null

  const shapes = []

  try {
    for (const lump of body.lumps || []) {
      for (const shell of lump.shells || []) {
        const ocShell = convertACISShell(oc, shell)
        if (ocShell) {
          // Try to create solid from shell
          try {
            const solidBuilder = new oc.BRepBuilderAPI_MakeSolid_2(ocShell)
            if (solidBuilder.IsDone()) {
              shapes.push(solidBuilder.Solid())
            } else {
              shapes.push(ocShell)
            }
          } catch (e) {
            // Use shell if solid creation fails
            shapes.push(ocShell)
          }
        }
      }
    }

    if (shapes.length === 0) {
      return null
    }

    if (shapes.length === 1) {
      return shapes[0]
    }

    // Combine multiple shapes into compound
    const builder = new oc.BRep_Builder()
    const compound = new oc.TopoDS_Compound()
    builder.MakeCompound(compound)

    for (const shape of shapes) {
      builder.Add(compound, shape)
    }

    return compound
  } catch (e) {
    console.warn('Failed to convert body:', e.message)
  }
  return null
}

/**
 * Convert multiple ACIS bodies to a single OpenCascade shape
 */
function convertACISBodiesToShape(oc, bodies) {
  if (!bodies || bodies.length === 0) return null

  const shapes = []

  for (const body of bodies) {
    const shape = convertACISBody(oc, body)
    if (shape) {
      shapes.push(shape)
    }
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

/**
 * Tessellate ACIS bodies for preview (returns vertices/normals arrays)
 */
function tessellateACISBodies(oc, bodies, linearDeflection = 0.1) {
  const shape = convertACISBodiesToShape(oc, bodies)
  if (!shape) return null

  try {
    // Tessellate the shape
    new oc.BRepMesh_IncrementalMesh_2(
      shape,
      linearDeflection,
      false,
      0.5,
      false
    )

    const vertices = []
    const normals = []

    // Extract triangles from faces
    const faceExplorer = new oc.TopExp_Explorer_2(
      shape,
      oc.TopAbs_ShapeEnum.TopAbs_FACE,
      oc.TopAbs_ShapeEnum.TopAbs_SHAPE
    )

    while (faceExplorer.More()) {
      const face = oc.TopoDS.Face_1(faceExplorer.Current())
      const location = new oc.TopLoc_Location_1()
      const triangulation = oc.BRep_Tool.Triangulation(face, location)

      if (!triangulation.IsNull()) {
        const tri = triangulation.get()
        const transform = location.Transformation()
        const numTriangles = tri.NbTriangles()

        for (let i = 1; i <= numTriangles; i++) {
          const triangle = tri.Triangle(i)
          const n1 = { current: 0 }, n2 = { current: 0 }, n3 = { current: 0 }
          triangle.Get(n1, n2, n3)

          // Get vertices
          const p1 = tri.Node(n1.current).Transformed(transform)
          const p2 = tri.Node(n2.current).Transformed(transform)
          const p3 = tri.Node(n3.current).Transformed(transform)

          vertices.push(p1.X(), p1.Y(), p1.Z())
          vertices.push(p2.X(), p2.Y(), p2.Z())
          vertices.push(p3.X(), p3.Y(), p3.Z())

          // Calculate normal
          const ux = p2.X() - p1.X(), uy = p2.Y() - p1.Y(), uz = p2.Z() - p1.Z()
          const vx = p3.X() - p1.X(), vy = p3.Y() - p1.Y(), vz = p3.Z() - p1.Z()
          let nx = uy * vz - uz * vy
          let ny = uz * vx - ux * vz
          let nz = ux * vy - uy * vx
          const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1
          nx /= len; ny /= len; nz /= len

          normals.push(nx, ny, nz)
          normals.push(nx, ny, nz)
          normals.push(nx, ny, nz)
        }
      }

      faceExplorer.Next()
    }

    return {
      vertices: new Float32Array(vertices),
      normals: new Float32Array(normals)
    }
  } catch (e) {
    console.warn('Failed to tessellate:', e.message)
    return null
  }
}

// Export for use in worker
if (typeof self !== 'undefined') {
  self.ACISGeometry = {
    convertACISBody,
    convertACISBodiesToShape,
    tessellateACISBodies,
    // Expose individual converters for debugging
    convertACISSurface,
    convertACISCurve,
    convertACISEdge,
    convertACISFace,
    convertACISShell
  }
}
