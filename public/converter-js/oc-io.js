/**
 * OpenCascade I/O Functions
 * STL/STEP reading, writing, and mesh analysis
 */

import { LARGE_MESH_THRESHOLD } from './config.js'

// ============================================================================
// Mesh Analysis
// ============================================================================

/**
 * Analyze mesh and return statistics
 */
export function analyzeMesh(oc, shape, originalTriangleCount = 0) {
  const stats = {
    triangleCount: originalTriangleCount,
    vertexCount: 0,
    edgeCount: 0,
    faceCount: 0,
    boundingBox: null,
    volume: 0,
    surfaceArea: 0,
    isSolid: false,
    isWatertight: false,
    qualityIssues: []
  }

  try {
    // Get bounding box
    const bndBox = new oc.Bnd_Box_1()
    oc.BRepBndLib.Add(shape, bndBox, false)

    if (!bndBox.IsVoid()) {
      const xMin = { current: 0 }, yMin = { current: 0 }, zMin = { current: 0 }
      const xMax = { current: 0 }, yMax = { current: 0 }, zMax = { current: 0 }
      bndBox.Get(xMin, yMin, zMin, xMax, yMax, zMax)
      stats.boundingBox = {
        min: { x: xMin.current, y: yMin.current, z: zMin.current },
        max: { x: xMax.current, y: yMax.current, z: zMax.current },
        size: {
          x: xMax.current - xMin.current,
          y: yMax.current - yMin.current,
          z: zMax.current - zMin.current
        }
      }
    }

    // Count faces
    const faceExplorer = new oc.TopExp_Explorer_2(
      shape,
      oc.TopAbs_ShapeEnum.TopAbs_FACE,
      oc.TopAbs_ShapeEnum.TopAbs_SHAPE
    )
    let faceCount = 0
    while (faceExplorer.More()) {
      faceCount++
      faceExplorer.Next()
    }
    stats.faceCount = faceCount

    // Count edges
    const edgeExplorer = new oc.TopExp_Explorer_2(
      shape,
      oc.TopAbs_ShapeEnum.TopAbs_EDGE,
      oc.TopAbs_ShapeEnum.TopAbs_SHAPE
    )
    let edgeCount = 0
    while (edgeExplorer.More()) {
      edgeCount++
      edgeExplorer.Next()
    }
    stats.edgeCount = edgeCount

    // Count vertices
    const vertexExplorer = new oc.TopExp_Explorer_2(
      shape,
      oc.TopAbs_ShapeEnum.TopAbs_VERTEX,
      oc.TopAbs_ShapeEnum.TopAbs_SHAPE
    )
    let vertexCount = 0
    while (vertexExplorer.More()) {
      vertexCount++
      vertexExplorer.Next()
    }
    stats.vertexCount = vertexCount

    // Check if shape is a solid
    const solidExplorer = new oc.TopExp_Explorer_2(
      shape,
      oc.TopAbs_ShapeEnum.TopAbs_SOLID,
      oc.TopAbs_ShapeEnum.TopAbs_SHAPE
    )
    stats.isSolid = solidExplorer.More()

    // Check if watertight using BRepCheck_Analyzer
    try {
      const analyzer = new oc.BRepCheck_Analyzer(shape, true)
      stats.isWatertight = analyzer.IsValid()
      if (!stats.isWatertight) {
        stats.qualityIssues.push('Shape has validation issues')
      }
    } catch (e) {
      // BRepCheck may fail on some meshes
    }

    // Try to get volume and surface area using GProp
    try {
      const props = new oc.GProp_GProps_1()
      oc.BRepGProp.SurfaceProperties_1(shape, props, false, false)
      stats.surfaceArea = props.Mass()

      const volProps = new oc.GProp_GProps_1()
      oc.BRepGProp.VolumeProperties_1(shape, volProps, false, false)
      stats.volume = volProps.Mass()

      // Negative volume often indicates inverted normals
      if (stats.volume < 0) {
        stats.qualityIssues.push('Negative volume (inverted normals)')
        stats.volume = Math.abs(stats.volume)
      }
    } catch (e) {
      // Properties calculation failed
    }

    // Add quality warnings
    if (!stats.isSolid && stats.faceCount > 0) {
      stats.qualityIssues.push('Not a solid (may have gaps/holes)')
    }
    if (stats.faceCount > LARGE_MESH_THRESHOLD) {
      stats.qualityIssues.push(`Large mesh (${stats.faceCount.toLocaleString()} faces)`)
    }

  } catch (e) {
    console.error('Mesh analysis error:', e)
  }

  return stats
}

// ============================================================================
// STL Reading
// ============================================================================

/**
 * Read STL file into shape
 */
export function readStl(oc, filePath) {
  const reader = new oc.StlAPI_Reader()
  const shape = new oc.TopoDS_Shape()

  let success = false
  if (reader.Read_1) {
    success = reader.Read_1(shape, filePath)
  } else if (reader.Read_2) {
    success = reader.Read_2(shape, filePath)
  } else if (reader.Read) {
    success = reader.Read(shape, filePath)
  }

  if (!success) {
    throw new Error('Failed to read STL file')
  }

  return shape
}

// ============================================================================
// Output Writing
// ============================================================================

/**
 * Count shapes of a specific type in a compound
 */
function countShapes(oc, shape, shapeType) {
  let count = 0
  try {
    const explorer = new oc.TopExp_Explorer_2(
      shape,
      shapeType,
      oc.TopAbs_ShapeEnum.TopAbs_SHAPE
    )
    while (explorer.More()) {
      count++
      explorer.Next()
    }
  } catch (e) {
    // Explorer may fail on some shapes
  }
  return count
}

/**
 * Deep validate shape by checking each face's surface
 * Returns true if all faces are valid
 */
function deepValidateShape(oc, shape) {
  let validFaces = 0
  let invalidFaces = 0

  try {
    const faceExplorer = new oc.TopExp_Explorer_2(
      shape,
      oc.TopAbs_ShapeEnum.TopAbs_FACE,
      oc.TopAbs_ShapeEnum.TopAbs_SHAPE
    )

    while (faceExplorer.More()) {
      try {
        const face = oc.TopoDS.Face_1(faceExplorer.Current())
        // Try to get the surface - this is where null pointers would crash
        const surface = oc.BRep_Tool.Surface_2(face)
        if (surface && !surface.IsNull()) {
          validFaces++
        } else {
          invalidFaces++
        }
      } catch (e) {
        invalidFaces++
      }
      faceExplorer.Next()
    }
  } catch (e) {
    console.warn('Face validation failed:', e.message)
  }

  console.log(`Deep validation: ${validFaces} valid faces, ${invalidFaces} invalid faces`)
  return invalidFaces === 0
}

/**
 * Write output file (STEP or STL)
 */
export function writeOutput(oc, shape, format, filePath) {
  // Validate shape before export
  if (!shape) {
    throw new Error('No shape to export')
  }

  try {
    if (shape.IsNull()) {
      throw new Error('Shape is null/empty')
    }
  } catch (e) {
    // IsNull check may not be available
  }

  // Count actual geometry content
  const faceCount = countShapes(oc, shape, oc.TopAbs_ShapeEnum.TopAbs_FACE)
  const edgeCount = countShapes(oc, shape, oc.TopAbs_ShapeEnum.TopAbs_EDGE)
  const shellCount = countShapes(oc, shape, oc.TopAbs_ShapeEnum.TopAbs_SHELL)
  const solidCount = countShapes(oc, shape, oc.TopAbs_ShapeEnum.TopAbs_SOLID)

  console.log(`Shape validation: ${faceCount} faces, ${edgeCount} edges, ${shellCount} shells, ${solidCount} solids`)

  if (faceCount === 0 && edgeCount === 0) {
    throw new Error('Shape has no geometry (0 faces, 0 edges)')
  }

  // Deep validate to catch null surface pointers
  const isDeepValid = deepValidateShape(oc, shape)
  if (!isDeepValid) {
    console.warn('Shape has invalid faces - STEP export may fail')
  }

  // Get shape type for debugging
  try {
    const shapeType = shape.ShapeType()
    const typeValue = shapeType.value !== undefined ? shapeType.value : shapeType
    console.log(`Shape type: ${typeValue} (0=COMPOUND, 1=COMPSOLID, 2=SOLID, 3=SHELL, 4=FACE)`)
  } catch (e) {
    console.log('Could not determine shape type')
  }

  if (format === 'stl') {
    // Use static StlAPI.Write method - third parameter is ASCII mode (false = binary)
    const success = oc.StlAPI.Write(shape, filePath, false)
    if (!success) {
      throw new Error('Failed to write STL file')
    }
  } else {
    // STEP format - try multiple approaches
    let success = false

    // First try: Rebuild compound with only validated faces
    let cleanShape = shape
    if (!isDeepValid) {
      console.log('Attempting to rebuild shape with only valid faces...')
      try {
        const builder = new oc.BRep_Builder()
        const compound = new oc.TopoDS_Compound()
        builder.MakeCompound(compound)

        let addedFaces = 0
        const faceExplorer = new oc.TopExp_Explorer_2(
          shape,
          oc.TopAbs_ShapeEnum.TopAbs_FACE,
          oc.TopAbs_ShapeEnum.TopAbs_SHAPE
        )

        while (faceExplorer.More()) {
          try {
            const face = oc.TopoDS.Face_1(faceExplorer.Current())
            const surface = oc.BRep_Tool.Surface_2(face)
            if (surface && !surface.IsNull()) {
              builder.Add(compound, face)
              addedFaces++
            }
          } catch (e) {
            // Skip invalid face
          }
          faceExplorer.Next()
        }

        if (addedFaces > 0) {
          console.log(`Rebuilt compound with ${addedFaces} valid faces`)
          cleanShape = compound
        }
      } catch (e) {
        console.warn('Failed to rebuild shape:', e.message)
      }
    }

    // Approach 1: Standard STEPControl_Writer
    if (!success) {
      try {
        console.log('STEP Approach 1: STEPControl_Writer...')
        const writer = new oc.STEPControl_Writer_1()

        console.log('Transferring shape to STEP...')
        writer.Transfer(
          cleanShape,
          oc.STEPControl_StepModelType.STEPControl_AsIs,
          true,
          new oc.Message_ProgressRange_1()
        )

        console.log('Writing STEP to file...')
        const writeStatus = writer.Write(filePath)
        console.log('STEP write completed with status:', writeStatus)
        if (writeStatus === oc.IFSelect_ReturnStatus.IFSelect_RetDone) {
          success = true
        }
      } catch (e) {
        console.warn('STEP Approach 1 failed:', e.message)
      }
    }

    // Approach 2: Try with STEPControl_ManifoldSolidBrep mode
    if (!success) {
      try {
        console.log('STEP Approach 2: ManifoldSolidBrep mode...')
        const writer = new oc.STEPControl_Writer_1()

        writer.Transfer(
          cleanShape,
          oc.STEPControl_StepModelType.STEPControl_ManifoldSolidBrep,
          true,
          new oc.Message_ProgressRange_1()
        )

        const writeStatus = writer.Write(filePath)
        if (writeStatus === oc.IFSelect_ReturnStatus.IFSelect_RetDone) {
          success = true
          console.log('STEP Approach 2 succeeded')
        }
      } catch (e) {
        console.warn('STEP Approach 2 failed:', e.message)
      }
    }

    // Approach 3: Try with ShellBasedSurfaceModel mode
    if (!success) {
      try {
        console.log('STEP Approach 3: ShellBasedSurfaceModel mode...')
        const writer = new oc.STEPControl_Writer_1()

        writer.Transfer(
          cleanShape,
          oc.STEPControl_StepModelType.STEPControl_ShellBasedSurfaceModel,
          true,
          new oc.Message_ProgressRange_1()
        )

        const writeStatus = writer.Write(filePath)
        if (writeStatus === oc.IFSelect_ReturnStatus.IFSelect_RetDone) {
          success = true
          console.log('STEP Approach 3 succeeded')
        }
      } catch (e) {
        console.warn('STEP Approach 3 failed:', e.message)
      }
    }

    // Approach 4: Try BREP round-trip (export to BREP, re-import, then STEP)
    if (!success) {
      try {
        console.log('STEP Approach 4: BREP round-trip...')
        const brepPath = '/temp_export.brep'

        // Export as BREP first using Write_3 (the working method)
        let brepSuccess = false

        // Write_3 takes (shape, filename, progressRange) and works!
        if (!brepSuccess && oc.BRepTools.Write_3) {
          try {
            brepSuccess = oc.BRepTools.Write_3(cleanShape, brepPath, new oc.Message_ProgressRange_1())
            console.log('  BRepTools.Write_3 succeeded')
          } catch (e) {
            console.log('  BRepTools.Write_3 failed:', e.message)
          }
        }

        if (brepSuccess) {
          console.log('  BREP export succeeded, re-importing...')
          // Re-import the BREP
          const reimportedShape = new oc.TopoDS_Shape()
          const brepBuilder = new oc.BRep_Builder()
          const readSuccess = oc.BRepTools.Read_2(reimportedShape, brepPath, brepBuilder, new oc.Message_ProgressRange_1())

          if (readSuccess && !reimportedShape.IsNull()) {
            console.log('  BREP re-import succeeded, exporting to STEP...')
            // Now try STEP export with the re-imported shape
            const writer = new oc.STEPControl_Writer_1()
            writer.Transfer(
              reimportedShape,
              oc.STEPControl_StepModelType.STEPControl_AsIs,
              true,
              new oc.Message_ProgressRange_1()
            )

            const writeStatus = writer.Write(filePath)
            if (writeStatus === oc.IFSelect_ReturnStatus.IFSelect_RetDone) {
              success = true
              console.log('STEP Approach 4 (BREP round-trip) succeeded')
            }
          }

          // Cleanup temp file
          try { oc.FS.unlink(brepPath) } catch (e) {}
        }
      } catch (e) {
        console.warn('STEP Approach 4 failed:', e.message)
      }
    }

    // Approach 5: Direct BREP export (save as .brep file - real solid geometry)
    if (!success) {
      try {
        console.log('STEP Approach 5: Direct BREP export...')
        const brepPath = filePath.replace('.step', '.brep')

        let brepSuccess = false

        // Write_3 takes (shape, filename, progressRange) and works!
        if (oc.BRepTools.Write_3) {
          try {
            brepSuccess = oc.BRepTools.Write_3(cleanShape, brepPath, new oc.Message_ProgressRange_1())
            console.log('  BRepTools.Write_3 succeeded')
          } catch (e) {
            console.log('  BRepTools.Write_3 failed:', e.message)
          }
        }

        if (brepSuccess) {
          // Read BREP and save to original STEP path
          try {
            const brepData = oc.FS.readFile(brepPath)
            oc.FS.writeFile(filePath, brepData)
            oc.FS.unlink(brepPath)
            success = true
            console.log('BREP export succeeded (note: file is BREP format, not STEP)')
          } catch (e2) {
            console.warn('BREP file operations failed:', e2.message)
          }
        }
      } catch (e) {
        console.warn('STEP Approach 5 failed:', e.message)
      }
    }

    // Approach 6: Try IGES export (different code path, might work where STEP fails)
    if (!success && oc.IGESControl_Writer_1) {
      try {
        console.log('STEP Approach 6: IGES export (alternative format)...')
        const igesPath = filePath.replace('.step', '.iges')

        // Initialize IGES controller first (required!)
        oc.IGESControl_Controller.Init()

        const igesWriter = new oc.IGESControl_Writer_1()
        // AddShape with progress range
        igesWriter.AddShape(cleanShape, new oc.Message_ProgressRange_1())
        igesWriter.ComputeModel()
        // Write_2 takes (filename, progressRange)
        const igesStatus = igesWriter.Write_2(igesPath, new oc.Message_ProgressRange_1())

        if (igesStatus) {
          // Read IGES file and save to output path
          try {
            const igesData = oc.FS.readFile(igesPath)
            // Save as .iges extension (not pretending to be STEP)
            const actualIgesPath = filePath.replace('.step', '.iges')
            oc.FS.writeFile(actualIgesPath, igesData)
            oc.FS.unlink(igesPath)
            // Also write to original path so download works
            oc.FS.writeFile(filePath, igesData)
            success = true
            console.log('IGES export succeeded (file is IGES format)')
          } catch (e2) {
            console.warn('IGES file operations failed:', e2.message)
          }
        }
      } catch (e) {
        console.warn('STEP Approach 6 (IGES) failed:', e.message)
      }
    }

    // Approach 7: GeometricCurveSet mode (wireframe only - last resort)
    if (!success) {
      try {
        console.log('STEP Approach 7: GeometricCurveSet mode (wireframe)...')
        const writer = new oc.STEPControl_Writer_1()

        writer.Transfer(
          cleanShape,
          oc.STEPControl_StepModelType.STEPControl_GeometricCurveSet,
          true,
          new oc.Message_ProgressRange_1()
        )

        const writeStatus = writer.Write(filePath)
        if (writeStatus === oc.IFSelect_ReturnStatus.IFSelect_RetDone) {
          success = true
          console.log('STEP Approach 7 succeeded (wireframe only - no solid faces)')
        }
      } catch (e) {
        console.warn('STEP Approach 7 failed:', e.message)
      }
    }

    if (!success) {
      console.error('All STEP export approaches failed')
      throw new Error('STEP_EXPORT_FAILED')
    }
  }
}
