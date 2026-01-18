/**
 * ACIS to OpenCascade.js Geometry Converter
 * Converts parsed ACIS entities (from acis-bundle.js) to OC.js B-rep geometry
 */

// ============================================================================
// Helper Functions
// ============================================================================

function makePoint(oc, pos) {
  if (!pos) return new oc.gp_Pnt_3(0, 0, 0)
  return new oc.gp_Pnt_3(pos.x || 0, pos.y || 0, pos.z || 0)
}

function makeDirection(oc, vec) {
  if (!vec) return new oc.gp_Dir_4(0, 0, 1)
  const len = Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z)
  if (len < 1e-10) return new oc.gp_Dir_4(0, 0, 1)
  return new oc.gp_Dir_4(vec.x / len, vec.y / len, vec.z / len)
}

function makeAx2(oc, origin, zDir, xDir) {
  const pnt = makePoint(oc, origin)
  const z = makeDirection(oc, zDir)
  if (xDir) {
    const x = makeDirection(oc, xDir)
    return new oc.gp_Ax2_2(pnt, z, x)
  }
  return new oc.gp_Ax2_3(pnt, z)
}

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
// Surface Converters - Work with ACIS entity classes
// ============================================================================

function convertACISSurface(oc, surfaceEntity) {
  if (!surfaceEntity) return null

  try {
    // Get the surface entity type
    const typeName = surfaceEntity.getType ? surfaceEntity.getType() : ''

    if (typeName.includes('plane')) {
      return convertPlaneSurface(oc, surfaceEntity)
    } else if (typeName.includes('cone')) {
      return convertConeSurface(oc, surfaceEntity)
    } else if (typeName.includes('sphere')) {
      return convertSphereSurface(oc, surfaceEntity)
    } else if (typeName.includes('torus')) {
      return convertTorusSurface(oc, surfaceEntity)
    } else if (typeName.includes('spline')) {
      return convertSplineSurface(oc, surfaceEntity)
    }

    console.warn(`Unsupported surface type: ${typeName}`)
    return null
  } catch (e) {
    console.warn(`Failed to convert surface:`, e.message)
    return null
  }
}

function convertPlaneSurface(oc, surface) {
  const origin = makePoint(oc, surface.origin)
  const normal = makeDirection(oc, surface.normal)
  return new oc.Geom_Plane_2(origin, normal)
}

function convertConeSurface(oc, surface) {
  const ax3 = makeAx3(oc, surface.center, surface.axis, surface.uvOrigin)
  const radius = surface.majorRadius || 1.0
  const semiAngle = Math.abs(surface.semiAngle) || Math.PI / 4

  // Check if it's actually a cylinder (semiAngle close to 0)
  if (Math.abs(semiAngle) < 1e-6) {
    return new oc.Geom_CylindricalSurface_1(ax3, radius)
  }

  return new oc.Geom_ConicalSurface_1(ax3, semiAngle, radius)
}

function convertSphereSurface(oc, surface) {
  const ax3 = makeAx3(oc, surface.center, { x: 0, y: 0, z: 1 })
  const radius = surface.radius || 1.0
  return new oc.Geom_SphericalSurface_1(ax3, radius)
}

function convertTorusSurface(oc, surface) {
  const ax3 = makeAx3(oc, surface.center, surface.axis)
  const majorRadius = Math.abs(surface.major) || 2.0
  const minorRadius = Math.abs(surface.minor) || 0.5
  return new oc.Geom_ToroidalSurface_1(ax3, majorRadius, minorRadius)
}

function convertSplineSurface(oc, surface) {
  // B-spline surface - for now return null (complex to implement)
  console.warn('B-spline surface conversion not yet fully implemented')
  return null
}

// ============================================================================
// Curve Converters - Work with ACIS entity classes
// ============================================================================

function convertACISCurve(oc, curveEntity, startPt, endPt) {
  if (!curveEntity) return null

  try {
    const typeName = curveEntity.getType ? curveEntity.getType() : ''

    if (typeName.includes('straight')) {
      return convertStraightCurve(oc, curveEntity)
    } else if (typeName.includes('ellipse')) {
      return convertEllipseCurve(oc, curveEntity)
    } else if (typeName.includes('intcurve') || typeName.includes('spline')) {
      return convertSplineCurve(oc, curveEntity)
    }

    // Fallback: create line between start and end points
    if (startPt && endPt) {
      const p1 = makePoint(oc, startPt)
      const p2 = makePoint(oc, endPt)
      const dir = makeDirection(oc, {
        x: endPt.x - startPt.x,
        y: endPt.y - startPt.y,
        z: endPt.z - startPt.z
      })
      return new oc.Geom_Line_2(p1, dir)
    }

    console.warn(`Unsupported curve type: ${typeName}`)
    return null
  } catch (e) {
    console.warn(`Failed to convert curve:`, e.message)
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
  const normal = makeDirection(oc, curve.axis)
  const majorVec = curve.major || { x: 1, y: 0, z: 0 }
  const majorAxis = makeDirection(oc, majorVec)
  const majorRadius = Math.sqrt(majorVec.x ** 2 + majorVec.y ** 2 + majorVec.z ** 2) || 1.0
  const ratio = curve.ratio || 1.0
  const minorRadius = majorRadius * ratio

  const ax2 = new oc.gp_Ax2_2(center, normal, majorAxis)

  if (Math.abs(ratio - 1.0) < 1e-6) {
    return new oc.Geom_Circle_2(ax2, majorRadius)
  } else {
    return new oc.Geom_Ellipse_1(ax2, majorRadius, minorRadius)
  }
}

function convertSplineCurve(oc, curve) {
  // For spline curves, check if there's helix data
  if (curve.helix) {
    // Helix is complex - fallback to line for now
    console.warn('Helix curve conversion not yet fully implemented')
    return null
  }

  // B-spline curve - for now return null (complex to implement)
  console.warn('B-spline curve conversion not yet fully implemented')
  return null
}

// ============================================================================
// Topology Builders - Work with ACIS entity classes
// ============================================================================

function convertACISEdge(oc, edgeEntity) {
  if (!edgeEntity) return null

  try {
    const curveEntity = edgeEntity.getCurve ? edgeEntity.getCurve() : null
    const startPt = edgeEntity.getStart ? edgeEntity.getStart() : null
    const endPt = edgeEntity.getEnd ? edgeEntity.getEnd() : null

    // If we have start and end points, create edge between them
    if (startPt && endPt) {
      const p1 = makePoint(oc, startPt)
      const p2 = makePoint(oc, endPt)

      // Check distance
      const dx = endPt.x - startPt.x
      const dy = endPt.y - startPt.y
      const dz = endPt.z - startPt.z
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

      if (dist < 1e-6) {
        // Degenerate edge - skip
        return null
      }

      // Try to use the curve if available
      const curve = convertACISCurve(oc, curveEntity, startPt, endPt)

      if (curve) {
        try {
          const handleCurve = new oc.Handle_Geom_Curve_2(curve)

          // For lines, use distance-based parameters
          if (curveEntity && curveEntity.getType && curveEntity.getType().includes('straight')) {
            const builder = new oc.BRepBuilderAPI_MakeEdge_24(handleCurve, 0, dist)
            if (builder.IsDone()) {
              return builder.Edge()
            }
          }

          // For other curves, try with default parameters
          const builder = new oc.BRepBuilderAPI_MakeEdge_20(handleCurve)
          if (builder.IsDone()) {
            return builder.Edge()
          }
        } catch (e) {
          // Fall through to point-based edge
        }
      }

      // Fallback: create simple edge between points
      const builder = new oc.BRepBuilderAPI_MakeEdge_3(p1, p2)
      if (builder.IsDone()) {
        return builder.Edge()
      }
    }
  } catch (e) {
    console.warn('Failed to create edge:', e.message)
  }
  return null
}

function convertACISLoop(oc, loopEntity) {
  if (!loopEntity) return null

  try {
    const coedges = loopEntity.getCoedges ? loopEntity.getCoedges() : []

    if (coedges.length === 0) return null

    const wireBuilder = new oc.BRepBuilderAPI_MakeWire_1()
    let edgeCount = 0

    for (const coedge of coedges) {
      const edgeEntity = coedge.getEdge ? coedge.getEdge() : null
      if (!edgeEntity) continue

      const edge = convertACISEdge(oc, edgeEntity)
      if (edge) {
        // Handle edge sense
        if (coedge.sense === 'reversed') {
          edge.Reverse()
        }
        try {
          wireBuilder.Add_1(edge)
          edgeCount++
        } catch (e) {
          // Edge might not connect properly, continue
        }
      }
    }

    if (edgeCount > 0 && wireBuilder.IsDone()) {
      return wireBuilder.Wire()
    }
  } catch (e) {
    console.warn('Failed to create wire:', e.message)
  }
  return null
}

function convertACISFace(oc, faceEntity) {
  if (!faceEntity) return null

  try {
    const surfaceEntity = faceEntity.getSurface ? faceEntity.getSurface() : null
    const surface = convertACISSurface(oc, surfaceEntity)

    if (!surface) {
      console.warn('No surface for face, skipping')
      return null
    }

    const handleSurface = new oc.Handle_Geom_Surface_2(surface)
    const loops = faceEntity.getLoops ? faceEntity.getLoops() : []

    // Try to create face with wire from first loop
    if (loops.length > 0) {
      const outerLoop = loops[0]
      const outerWire = convertACISLoop(oc, outerLoop)

      if (outerWire) {
        try {
          const faceBuilder = new oc.BRepBuilderAPI_MakeFace_15(
            handleSurface,
            outerWire,
            true // check wire planarity
          )

          // Add inner loops (holes)
          for (let i = 1; i < loops.length; i++) {
            const innerWire = convertACISLoop(oc, loops[i])
            if (innerWire) {
              innerWire.Reverse()
              faceBuilder.Add(innerWire)
            }
          }

          if (faceBuilder.IsDone()) {
            const result = faceBuilder.Face()
            if (faceEntity.sense === 'reversed') {
              result.Reverse()
            }
            return result
          }
        } catch (e) {
          // Fall through to unbounded face
        }
      }
    }

    // Fallback: create unbounded face from surface
    try {
      const faceBuilder = new oc.BRepBuilderAPI_MakeFace_8(handleSurface, 1e-6)
      if (faceBuilder.IsDone()) {
        const result = faceBuilder.Face()
        if (faceEntity.sense === 'reversed') {
          result.Reverse()
        }
        return result
      }
    } catch (e) {
      console.warn('Failed to create unbounded face:', e.message)
    }
  } catch (e) {
    console.warn('Failed to create face:', e.message)
  }
  return null
}

function convertACISShell(oc, shellEntity) {
  if (!shellEntity) return null

  try {
    const faces = shellEntity.getFaces ? shellEntity.getFaces() : []

    if (faces.length === 0) return null

    const builder = new oc.BRep_Builder()
    const ocShell = new oc.TopoDS_Shell()
    builder.MakeShell(ocShell)

    let faceCount = 0
    for (const faceEntity of faces) {
      const ocFace = convertACISFace(oc, faceEntity)
      if (ocFace) {
        builder.Add(ocShell, ocFace)
        faceCount++
      }
    }

    if (faceCount > 0) {
      console.log(`  Created shell with ${faceCount} faces`)
      return ocShell
    }
  } catch (e) {
    console.warn('Failed to create shell:', e.message)
  }
  return null
}

function convertACISBody(oc, bodyEntity) {
  if (!bodyEntity) return null

  const shapes = []

  try {
    // Support both old parser (direct .lumps) and new entity classes (getLumps())
    const lumps = bodyEntity.lumps || (bodyEntity.getLumps ? bodyEntity.getLumps() : [])

    for (const lump of lumps) {
      const shells = lump.shells || (lump.getShells ? lump.getShells() : [])

      for (const shell of shells) {
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

function convertACISBodiesToShape(oc, bodies) {
  if (!bodies || bodies.length === 0) return null

  console.log(`Converting ${bodies.length} ACIS bodies to OpenCascade shapes...`)

  const shapes = []
  let totalFaces = 0

  for (let i = 0; i < bodies.length; i++) {
    const body = bodies[i]
    console.log(`  Processing body ${i + 1}/${bodies.length}...`)

    // Count faces for logging
    const lumps = body.getLumps ? body.getLumps() : []
    for (const lump of lumps) {
      const shells = lump.getShells ? lump.getShells() : []
      for (const shell of shells) {
        const faces = shell.getFaces ? shell.getFaces() : []
        totalFaces += faces.length
      }
    }

    const shape = convertACISBody(oc, body)
    if (shape) {
      shapes.push(shape)
    }
  }

  console.log(`  Total faces to process: ${totalFaces}`)

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

  console.log(`  Combined ${shapes.length} shapes into compound`)
  return compound
}

function tessellateACISBodies(oc, bodies, linearDeflection = 0.1) {
  const shape = convertACISBodiesToShape(oc, bodies)
  if (!shape) return null

  try {
    new oc.BRepMesh_IncrementalMesh_2(
      shape,
      linearDeflection,
      false,
      0.5,
      false
    )

    const vertices = []
    const normals = []

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

          const p1 = tri.Node(n1.current).Transformed(transform)
          const p2 = tri.Node(n2.current).Transformed(transform)
          const p3 = tri.Node(n3.current).Transformed(transform)

          vertices.push(p1.X(), p1.Y(), p1.Z())
          vertices.push(p2.X(), p2.Y(), p2.Z())
          vertices.push(p3.X(), p3.Y(), p3.Z())

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
    convertACISSurface,
    convertACISCurve,
    convertACISEdge,
    convertACISFace,
    convertACISShell
  }
}
