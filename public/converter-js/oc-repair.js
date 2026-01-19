/**
 * OpenCascade Repair Functions
 * Mesh repair, face merging, and shape processing using OpenCascade.js
 */

import { LARGE_MESH_THRESHOLD, VERY_LARGE_MESH_THRESHOLD } from './config.js'

/**
 * Perform mesh repair operations using OpenCascade ShapeFix
 */
export function repairMesh(oc, shape, options = {}, postMessage) {
  const { harmonizeNormals = true } = options

  let repairedShape = shape
  const repairs = []

  try {
    // Use ShapeFix_Shape for general repairs
    postMessage({ type: 'progress', message: 'Repairing mesh...' })

    const fixer = new oc.ShapeFix_Shape_1()
    fixer.Init(repairedShape)
    fixer.SetPrecision(0.01)
    fixer.SetMaxTolerance(1.0)
    fixer.SetMinTolerance(0.001)

    // Perform fixes
    if (fixer.Perform(new oc.Message_ProgressRange_1())) {
      repairedShape = fixer.Shape()
      repairs.push('Applied ShapeFix repairs')
    }
  } catch (e) {
    console.log('ShapeFix failed, continuing:', e.message)
  }

  try {
    // Fix shell orientation
    const shellFix = new oc.ShapeFix_Shell_1()

    const shellExplorer = new oc.TopExp_Explorer_2(
      repairedShape,
      oc.TopAbs_ShapeEnum.TopAbs_SHELL,
      oc.TopAbs_ShapeEnum.TopAbs_SHAPE
    )

    if (shellExplorer.More()) {
      const shell = oc.TopoDS.Shell_1(shellExplorer.Current())
      shellFix.Init(shell)

      if (harmonizeNormals) {
        shellFix.FixFaceOrientation(shell, true, false)
        repairs.push('Harmonized face orientations')
      }
    }
  } catch (e) {
    console.log('Shell fix failed:', e.message)
  }

  return { shape: repairedShape, repairs }
}

/**
 * Merge coplanar faces using ShapeUpgrade_UnifySameDomain with 3-tier fallback
 */
export function mergeFacesWithFallback(oc, shape, tolerance = 0.1, repairs = [], postMessage) {
  // Strategy 1: Full unification with edge unification
  try {
    postMessage({ type: 'progress', message: 'Merging faces (strategy 1: full)...' })
    const unify = new oc.ShapeUpgrade_UnifySameDomain_2(shape, true, true, false)
    unify.SetAngularTolerance(0.01) // Angular tolerance in radians
    unify.SetLinearTolerance(tolerance * 10) // More aggressive tolerance
    unify.Build()

    const result = unify.Shape()
    if (result && !result.IsNull()) {
      repairs.push('Merged faces using full unification')
      return { shape: result, success: true }
    }
  } catch (e) {
    console.log('Strategy 1 failed:', e.message)
  }

  // Strategy 2: Face unification only (no edge unification)
  try {
    postMessage({ type: 'progress', message: 'Merging faces (strategy 2: faces only)...' })
    const unify = new oc.ShapeUpgrade_UnifySameDomain_2(shape, true, false, false)
    unify.SetAngularTolerance(0.01)
    unify.SetLinearTolerance(tolerance)
    unify.Build()

    const result = unify.Shape()
    if (result && !result.IsNull()) {
      repairs.push('Merged faces (without edge unification)')
      return { shape: result, success: true }
    }
  } catch (e) {
    console.log('Strategy 2 failed:', e.message)
  }

  // Strategy 3: Relaxed tolerance
  try {
    postMessage({ type: 'progress', message: 'Merging faces (strategy 3: relaxed)...' })
    const unify = new oc.ShapeUpgrade_UnifySameDomain_2(shape, true, true, false)
    unify.SetAngularTolerance(0.1) // More permissive angular tolerance
    unify.SetLinearTolerance(tolerance * 100) // Much larger linear tolerance
    unify.Build()

    const result = unify.Shape()
    if (result && !result.IsNull()) {
      repairs.push('Merged faces with relaxed tolerance')
      return { shape: result, success: true }
    }
  } catch (e) {
    console.log('Strategy 3 failed:', e.message)
  }

  // All strategies failed
  repairs.push('Face merging skipped (all strategies failed)')
  return { shape, success: false }
}

/**
 * Legacy wrapper for backward compatibility
 */
export function mergeFaces(oc, shape, tolerance = 0.1, postMessage) {
  const result = mergeFacesWithFallback(oc, shape, tolerance, [], postMessage)
  return result.shape
}

/**
 * Process a single mesh/shape and create solid
 * Includes large mesh optimization and repair tracking
 *
 * Tolerance scaling (like FreeCAD):
 * - Base tolerance: user-specified tolerance
 * - Sewing tolerance: base * 5
 * - Merge tolerance: base * 10
 */
export function processShape(oc, shape, options = {}, postMessage) {
  const {
    tolerance = 0.1,
    repair = true,
    mergeFacesOpt = true,
    skipMerge: forceSkipMerge = false,
    faceCount = 0
  } = options

  // Apply tolerance scaling like FreeCAD
  const sewingTolerance = tolerance * 5   // 5x for sewing operations
  const mergeTolerance = tolerance * 10   // 10x for face merging

  const repairs = []
  let processedShape = shape

  // Check for large mesh optimizations
  const skipExpensive = faceCount > LARGE_MESH_THRESHOLD
  const skipMerge = forceSkipMerge || faceCount > VERY_LARGE_MESH_THRESHOLD

  if (skipExpensive) {
    postMessage({
      type: 'progress',
      message: `Large mesh detected (${faceCount.toLocaleString()} faces), optimizing operations...`
    })
    repairs.push(`Large mesh optimization enabled (>${LARGE_MESH_THRESHOLD.toLocaleString()} faces)`)
  }

  // Sewing
  postMessage({ type: 'progress', message: 'Sewing faces...' })
  try {
    const actualSewingTolerance = skipExpensive ? sewingTolerance * 2 : sewingTolerance
    const sewing = new oc.BRepBuilderAPI_Sewing(actualSewingTolerance, true, true, true, false)
    sewing.Add(processedShape)
    sewing.Perform(new oc.Message_ProgressRange_1())
    processedShape = sewing.SewedShape()
    repairs.push('Sewed mesh faces')
  } catch (e) {
    console.log('Sewing failed:', e.message)
    repairs.push('Sewing skipped (failed)')
  }

  // Repair (skip expensive checks for large meshes)
  if (repair && !skipExpensive) {
    const repairResult = repairMesh(oc, processedShape, options, postMessage)
    processedShape = repairResult.shape
    repairs.push(...repairResult.repairs)
  } else if (repair && skipExpensive) {
    // Simplified repair for large meshes
    postMessage({ type: 'progress', message: 'Applying basic repairs (large mesh mode)...' })
    try {
      const fixer = new oc.ShapeFix_Shape_1()
      fixer.Init(processedShape)
      fixer.SetPrecision(0.1) // Coarser precision for speed
      fixer.SetMaxTolerance(1.0)
      if (fixer.Perform(new oc.Message_ProgressRange_1())) {
        processedShape = fixer.Shape()
        repairs.push('Applied basic ShapeFix repairs (large mesh mode)')
      }
    } catch (e) {
      console.log('Basic repair failed:', e.message)
    }
  }

  // Create solid
  postMessage({ type: 'progress', message: 'Creating solid...' })
  let solidShape = processedShape

  try {
    const shellExplorer = new oc.TopExp_Explorer_2(
      processedShape,
      oc.TopAbs_ShapeEnum.TopAbs_SHELL,
      oc.TopAbs_ShapeEnum.TopAbs_SHAPE
    )

    if (shellExplorer.More()) {
      const shell = oc.TopoDS.Shell_1(shellExplorer.Current())
      const solidMaker = new oc.BRepBuilderAPI_MakeSolid_2(shell)

      if (solidMaker.IsDone()) {
        solidShape = solidMaker.Solid()
        repairs.push('Created solid from shell')
        postMessage({ type: 'progress', message: 'Solid created successfully' })
      }
    }
  } catch (e) {
    console.log('Solid creation failed, using shell:', e.message)
    repairs.push('Solid creation skipped (using shell)')
  }

  // Merge faces (skip for very large meshes or if explicitly skipped)
  if (mergeFacesOpt && !skipMerge) {
    const mergeResult = mergeFacesWithFallback(oc, solidShape, mergeTolerance, repairs, postMessage)
    solidShape = mergeResult.shape
  } else if (forceSkipMerge) {
    repairs.push('Face merging skipped (user option)')
  } else if (mergeFacesOpt && skipMerge) {
    postMessage({
      type: 'progress',
      message: `Skipping face merge (>${VERY_LARGE_MESH_THRESHOLD.toLocaleString()} faces)`
    })
    repairs.push(`Face merging skipped (>${VERY_LARGE_MESH_THRESHOLD.toLocaleString()} faces)`)
  }

  return { shape: solidShape, repairs }
}
