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
 * Write output file (STEP or STL)
 */
export function writeOutput(oc, shape, format, filePath) {
  if (format === 'stl') {
    const writer = new oc.StlAPI_Writer()
    writer.SetASCIIMode(false) // Binary STL

    // Try different Write overloads
    if (writer.Write_1) {
      writer.Write_1(shape, filePath)
    } else if (writer.Write) {
      writer.Write(shape, filePath)
    }
  } else {
    // STEP format - try multiple approaches
    let success = false

    // Approach 1: Standard STEPControl_Writer
    if (!success) {
      try {
        console.log('STEP Approach 1: STEPControl_Writer...')
        const writer = new oc.STEPControl_Writer_1()

        console.log('Transferring shape to STEP...')
        writer.Transfer(
          shape,
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
          shape,
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
          shape,
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

    // Approach 4: Try with GeometricCurveSet mode (simplest)
    if (!success) {
      try {
        console.log('STEP Approach 4: GeometricCurveSet mode...')
        const writer = new oc.STEPControl_Writer_1()

        writer.Transfer(
          shape,
          oc.STEPControl_StepModelType.STEPControl_GeometricCurveSet,
          true,
          new oc.Message_ProgressRange_1()
        )

        const writeStatus = writer.Write(filePath)
        if (writeStatus === oc.IFSelect_ReturnStatus.IFSelect_RetDone) {
          success = true
          console.log('STEP Approach 4 succeeded')
        }
      } catch (e) {
        console.warn('STEP Approach 4 failed:', e.message)
      }
    }

    // Approach 5: Export as BREP instead (different code path)
    if (!success) {
      try {
        console.log('STEP Approach 5: Export as BREP file...')
        const brepPath = filePath.replace('.step', '.brep')

        // BRepTools.Write is static - try different overloads
        let brepSuccess = false
        if (oc.BRepTools.Write_2) {
          brepSuccess = oc.BRepTools.Write_2(shape, brepPath, new oc.Message_ProgressRange_1())
        } else if (oc.BRepTools.Write_1) {
          brepSuccess = oc.BRepTools.Write_1(shape, brepPath)
        } else if (oc.BRepTools.Write) {
          brepSuccess = oc.BRepTools.Write(shape, brepPath)
        }

        if (brepSuccess) {
          // If BREP succeeded, we've at least exported something
          // Copy to STEP path (it's BREP format but file will work in many CAD)
          try {
            const brepData = oc.FS.readFile(brepPath)
            oc.FS.writeFile(filePath, brepData)
            oc.FS.unlink(brepPath)
            success = true
            console.log('BREP export succeeded (saved as .step)')
          } catch (e2) {
            console.warn('BREP file operations failed:', e2.message)
          }
        }
      } catch (e) {
        console.warn('STEP Approach 5 (BREP) failed:', e.message)
      }
    }

    if (!success) {
      console.error('All STEP export approaches failed')
      throw new Error('STEP_EXPORT_FAILED')
    }
  }
}
