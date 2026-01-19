/**
 * JavaScript-level Mesh Repair
 * Works on raw triangle data before OpenCascade processing
 */

import {
  harmonizeNormals,
  removeNonManifolds,
  fillHoles
} from './mesh-utils.js'
import { detectSelfIntersections } from './mesh-analysis.js'

/**
 * JavaScript-level mesh repairs on raw triangle data
 * Works on mesh data before OpenCascade processing
 */
export function repairMeshData(vertices, triangles, tolerance = 0.001) {
  const repairs = []

  // 1. Remove duplicate vertices (hash-based deduplication)
  const vertexMap = new Map()
  const vertexRemap = new Array(vertices.length)
  const newVertices = []
  let duplicateVertices = 0

  const hashVertex = (v) => {
    // Round to tolerance for comparison
    const x = Math.round(v.x / tolerance) * tolerance
    const y = Math.round(v.y / tolerance) * tolerance
    const z = Math.round(v.z / tolerance) * tolerance
    return `${x.toFixed(6)},${y.toFixed(6)},${z.toFixed(6)}`
  }

  for (let i = 0; i < vertices.length; i++) {
    const hash = hashVertex(vertices[i])
    if (vertexMap.has(hash)) {
      vertexRemap[i] = vertexMap.get(hash)
      duplicateVertices++
    } else {
      const newIndex = newVertices.length
      vertexMap.set(hash, newIndex)
      vertexRemap[i] = newIndex
      newVertices.push(vertices[i])
    }
  }

  if (duplicateVertices > 0) {
    repairs.push(`Merged ${duplicateVertices} duplicate vertices`)
  }

  // 2. Remap triangle indices and remove degenerate triangles
  const newTriangles = []
  let degenerateTriangles = 0

  for (const tri of triangles) {
    const v1 = vertexRemap[tri.v1]
    const v2 = vertexRemap[tri.v2]
    const v3 = vertexRemap[tri.v3]

    // Skip degenerate triangles (same vertex used twice)
    if (v1 === v2 || v2 === v3 || v1 === v3) {
      degenerateTriangles++
      continue
    }

    newTriangles.push({ v1, v2, v3 })
  }

  if (degenerateTriangles > 0) {
    repairs.push(`Removed ${degenerateTriangles} degenerate triangles`)
  }

  // 3. Remove duplicate triangles (hash by sorted indices)
  const triangleSet = new Set()
  const uniqueTriangles = []
  let duplicateTriangles = 0

  for (const tri of newTriangles) {
    const sorted = [tri.v1, tri.v2, tri.v3].sort((a, b) => a - b)
    const hash = sorted.join(',')

    if (triangleSet.has(hash)) {
      duplicateTriangles++
    } else {
      triangleSet.add(hash)
      uniqueTriangles.push(tri)
    }
  }

  if (duplicateTriangles > 0) {
    repairs.push(`Removed ${duplicateTriangles} duplicate triangles`)
  }

  // 4. Harmonize normals using BFS flood-fill
  const harmonizeResult = harmonizeNormals(uniqueTriangles)
  if (harmonizeResult.flipped > 0) {
    repairs.push(`Harmonized normals: flipped ${harmonizeResult.flipped} triangles`)
  }

  // 5. Detect and remove non-manifold edges
  const nonManifoldResult = removeNonManifolds(newVertices, harmonizeResult.triangles)
  if (nonManifoldResult.removed > 0) {
    repairs.push(`Removed ${nonManifoldResult.removed} non-manifold triangles (${nonManifoldResult.edges.length} bad edges)`)
  }

  // 6. Fill small holes
  const fillResult = fillHoles(newVertices, nonManifoldResult.triangles, 100) // Max 100 vertices per hole
  if (fillResult.filled > 0) {
    repairs.push(`Filled ${fillResult.filled} of ${fillResult.holeCount} holes`)
  }
  if (fillResult.skippedLargeHoles > 0) {
    repairs.push(`Skipped ${fillResult.skippedLargeHoles} large holes (>100 vertices)`)
  }

  // 7. Detect self-intersections (detection only, no fix)
  const selfIntersectResult = detectSelfIntersections(newVertices, fillResult.triangles, true)
  if (selfIntersectResult.skipped) {
    repairs.push(`Self-intersection check: ${selfIntersectResult.reason}`)
  } else if (selfIntersectResult.hasIntersections) {
    repairs.push(`Warning: ${selfIntersectResult.count} self-intersecting triangle pairs detected`)
  }

  return {
    vertices: newVertices,
    triangles: fillResult.triangles,
    repairs
  }
}
