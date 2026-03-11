/**
 * Chili-WASM Repair Functions
 * Shape repair and processing using chili3d's higher-level APIs
 */

import { LARGE_MESH_THRESHOLD, VERY_LARGE_MESH_THRESHOLD } from './config.js'

/**
 * Process a shape: try to create solid and optionally simplify
 *
 * Uses chili-wasm's available operations:
 * - Shape.findSubShapes: find shells in the shape
 * - ShapeFactory.solid: create solid from shells
 * - ShapeFactory.simplifyShape: simplify/unify the shape
 * - Shape.sewing: sew shapes together
 */
export function processShape(wasm, shape, options = {}, postMessage) {
  const {
    tolerance = 0.1,
    repair = true,
    mergeFacesOpt = true,
    skipMerge: forceSkipMerge = false,
    skipSolidCreation = false,
    faceCount = 0
  } = options

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

  // Try to create solid from shells
  // Skip for F3D — tryMakeSolid in geometry bridge already creates solids per-shell.
  // Re-running ShapeFactory.solid on all shells destroys per-body topology.
  if (repair && !skipSolidCreation) {
    postMessage({ type: 'progress', message: 'Creating solid...' })
    try {
      const shells = wasm.Shape.findSubShapes(processedShape, wasm.TopAbs_ShapeEnum.TopAbs_SHELL)

      if (shells.length > 0) {
        // Convert to proper shell types
        const shellArray = []
        for (let i = 0; i < shells.length; i++) {
          shellArray.push(wasm.TopoDS.shell(shells[i]))
        }

        const solidResult = wasm.ShapeFactory.solid(shellArray)
        if (solidResult.isOk) {
          processedShape = wasm.Shape.clone(solidResult.shape)
          repairs.push('Created solid from shell(s)')
          postMessage({ type: 'progress', message: 'Solid created successfully' })
        } else {
          console.log('Solid creation returned error:', solidResult.error)
          repairs.push('Solid creation skipped (' + solidResult.error + ')')
        }
        solidResult.delete()
      } else {
        repairs.push('No shells found to create solid')
      }

      // findSubShapes returns plain JS arrays, no cleanup needed
    } catch (e) {
      console.log('Solid creation failed:', e.message)
      repairs.push('Solid creation skipped (failed)')
    }
  }

  // Simplify shape (replaces face merging / UnifySameDomain)
  if (mergeFacesOpt && !skipMerge && !skipExpensive) {
    postMessage({ type: 'progress', message: 'Simplifying shape...' })
    try {
      const simplified = wasm.ShapeFactory.simplifyShape(processedShape, true, true)
      if (simplified.isOk) {
        processedShape = wasm.Shape.clone(simplified.shape)
        repairs.push('Simplified/unified shape domains')
      } else {
        console.log('Simplification returned error:', simplified.error)
      }
      simplified.delete()
    } catch (e) {
      console.log('Shape simplification failed:', e.message)
      repairs.push('Shape simplification skipped')
    }
  } else if (forceSkipMerge) {
    repairs.push('Face merging skipped (user option)')
  } else if (skipMerge) {
    postMessage({
      type: 'progress',
      message: `Skipping simplification (>${VERY_LARGE_MESH_THRESHOLD.toLocaleString()} faces)`
    })
    repairs.push(`Simplification skipped (>${VERY_LARGE_MESH_THRESHOLD.toLocaleString()} faces)`)
  }

  return { shape: processedShape, repairs }
}
