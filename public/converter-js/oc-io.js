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
 * Lightweight structural validation that a file OCC just wrote is genuine STEP
 * (ISO-10303-21 header + footer + at least one geometry entity). This is the
 * in-pipeline gate that stops a malformed or non-STEP payload from being
 * accepted as STEP. step-parser provides the authoritative gate at the app
 * boundary; this keeps the worker self-contained with no extra wasm.
 */
function validateStepText(oc, filePath) {
  try {
    const bytes = oc.FS.readFile(filePath) // Uint8Array
    if (!bytes || bytes.length === 0) return { valid: false, reason: 'empty file' }

    const decoder = new TextDecoder()
    const head = decoder.decode(bytes.subarray(0, Math.min(bytes.length, 256)))
    if (!head.startsWith('ISO-10303-21')) {
      return { valid: false, reason: 'missing ISO-10303-21 header' }
    }

    const tail = decoder.decode(bytes.subarray(Math.max(0, bytes.length - 128)))
    if (!tail.includes('END-ISO-10303-21')) {
      return { valid: false, reason: 'missing END-ISO-10303-21 footer' }
    }

    const text = decoder.decode(bytes)
    const hasBrep = /MANIFOLD_SOLID_BREP|CLOSED_SHELL|OPEN_SHELL|SHELL_BASED_SURFACE_MODEL|ADVANCED_FACE/.test(text)
    const hasCurveSet = /GEOMETRIC_CURVE_SET|GEOMETRIC_SET/.test(text)
    if (!hasBrep && !hasCurveSet) {
      return { valid: false, reason: 'no B-rep or curve-set geometry entities' }
    }
    return { valid: true, wireframe: !hasBrep && hasCurveSet, bytes: bytes.length }
  } catch (e) {
    return { valid: false, reason: 'read/parse error: ' + e.message }
  }
}

/**
 * Write output file.
 *
 * Returns { format, path, approach?, wireframe? } describing what was ACTUALLY
 * written. Fallbacks NEVER masquerade as STEP: if true B-rep STEP cannot be
 * produced, the BREP/IGES fallbacks are written to correctly-named sibling
 * paths and the real format is reported, so the caller can name the download
 * honestly (e.g. ".brep") instead of handing the user a ".step" that isn't one.
 *
 * @param {'step'|'stl'|'brep'} format - requested output format
 * @returns {{format:string, path:string, approach?:string, wireframe?:boolean}}
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
    const ok = oc.StlAPI.Write(shape, filePath, false)
    if (!ok) {
      throw new Error('Failed to write STL file')
    }
    return { format: 'stl', path: filePath }
  }

  if (format === 'brep') {
    // Native OpenCascade B-rep, written directly (no STEP translation).
    const ok = oc.BRepTools.Write_3(shape, filePath, new oc.Message_ProgressRange_1())
    if (!ok) {
      throw new Error('Failed to write BREP file')
    }
    return { format: 'brep', path: filePath }
  }

  // STEP format - try multiple approaches, validating each before accepting it.
  let result = null

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

  // Helper: STEPControl_Writer transfer in `modeKey`, accepted only if the file
  // it produced passes structural STEP validation (never accept blind success).
  const tryStepMode = (label, modeKey) => {
    try {
      console.log('STEP ' + label + '...')
      const writer = new oc.STEPControl_Writer_1()
      writer.Transfer(cleanShape, oc.STEPControl_StepModelType[modeKey], true, new oc.Message_ProgressRange_1())
      const writeStatus = writer.Write(filePath)
      if (writeStatus === oc.IFSelect_ReturnStatus.IFSelect_RetDone) {
        const v = validateStepText(oc, filePath)
        if (v.valid) {
          console.log('  -> valid STEP, ' + v.bytes + ' bytes' + (v.wireframe ? ' (wireframe only)' : ''))
          return { format: 'step', path: filePath, approach: label, wireframe: !!v.wireframe }
        }
        console.warn('  -> wrote a file but it failed STEP validation: ' + v.reason)
      }
    } catch (e) {
      console.warn('STEP ' + label + ' failed:', e.message)
    }
    return null
  }

  result = tryStepMode('Approach 1: STEPControl_Writer (AsIs)', 'STEPControl_AsIs')
  if (!result) result = tryStepMode('Approach 2: ManifoldSolidBrep', 'STEPControl_ManifoldSolidBrep')
  if (!result) result = tryStepMode('Approach 3: ShellBasedSurfaceModel', 'STEPControl_ShellBasedSurfaceModel')

  // Approach 4: BREP round-trip (export to BREP, re-import, then STEP)
  if (!result) {
    try {
      console.log('STEP Approach 4: BREP round-trip...')
      const brepPath = '/temp_export.brep'
      let brepSuccess = false
      if (oc.BRepTools.Write_3) {
        try {
          brepSuccess = oc.BRepTools.Write_3(cleanShape, brepPath, new oc.Message_ProgressRange_1())
        } catch (e) {
          console.log('  BRepTools.Write_3 failed:', e.message)
        }
      }
      if (brepSuccess) {
        const reimportedShape = new oc.TopoDS_Shape()
        const brepBuilder = new oc.BRep_Builder()
        const readSuccess = oc.BRepTools.Read_2(reimportedShape, brepPath, brepBuilder, new oc.Message_ProgressRange_1())
        if (readSuccess && !reimportedShape.IsNull()) {
          const writer = new oc.STEPControl_Writer_1()
          writer.Transfer(reimportedShape, oc.STEPControl_StepModelType.STEPControl_AsIs, true, new oc.Message_ProgressRange_1())
          const writeStatus = writer.Write(filePath)
          if (writeStatus === oc.IFSelect_ReturnStatus.IFSelect_RetDone) {
            const v = validateStepText(oc, filePath)
            if (v.valid) {
              result = { format: 'step', path: filePath, approach: 'Approach 4: BREP round-trip', wireframe: !!v.wireframe }
            } else {
              console.warn('STEP Approach 4 file failed validation: ' + v.reason)
            }
          }
        }
        try { oc.FS.unlink(brepPath) } catch (e) {}
      }
    } catch (e) {
      console.warn('STEP Approach 4 failed:', e.message)
    }
  }

  // Approach 5 (last STEP resort): GeometricCurveSet — valid STEP, wireframe only.
  if (!result) result = tryStepMode('Approach 5: GeometricCurveSet (wireframe)', 'STEPControl_GeometricCurveSet')

  // Honest fallbacks: if true STEP is impossible, write a real neutral B-rep file
  // with its CORRECT extension and report the real format. Never write BREP/IGES
  // bytes into a .step-named file (which would hand the user a mislabeled file).
  if (!result) {
    try {
      console.log('STEP unavailable; writing native BREP (.brep) fallback...')
      const brepPath = filePath.replace(/\.step$/i, '.brep')
      let ok = false
      if (oc.BRepTools.Write_3) {
        try {
          ok = oc.BRepTools.Write_3(cleanShape, brepPath, new oc.Message_ProgressRange_1())
        } catch (e) {
          console.log('  BRepTools.Write_3 failed:', e.message)
        }
      }
      if (ok) {
        console.log('Wrote native BREP fallback (file is BREP format, not STEP)')
        result = { format: 'brep', path: brepPath, approach: 'fallback: native BREP' }
      }
    } catch (e) {
      console.warn('BREP fallback failed:', e.message)
    }
  }

  if (!result && oc.IGESControl_Writer_1) {
    try {
      console.log('STEP unavailable; writing IGES (.iges) fallback...')
      const igesPath = filePath.replace(/\.step$/i, '.iges')
      oc.IGESControl_Controller.Init()
      const igesWriter = new oc.IGESControl_Writer_1()
      igesWriter.AddShape(cleanShape, new oc.Message_ProgressRange_1())
      igesWriter.ComputeModel()
      const igesStatus = igesWriter.Write_2(igesPath, new oc.Message_ProgressRange_1())
      if (igesStatus) {
        console.log('Wrote IGES fallback (file is IGES format, not STEP)')
        result = { format: 'iges', path: igesPath, approach: 'fallback: IGES' }
      }
    } catch (e) {
      console.warn('IGES fallback failed:', e.message)
    }
  }

  if (!result) {
    console.error('All STEP export approaches failed')
    throw new Error('STEP_EXPORT_FAILED')
  }

  return result
}
