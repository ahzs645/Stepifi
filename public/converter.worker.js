/**
 * Web Worker for chili-wasm OCCT 7.9.1 STL/3MF to STEP/STL conversion
 * Auto-generated from converter-js modules
 * Generated: 2026-03-11T04:53:01.962Z
 * Backend: chili
 *
 * Features: mesh repair, face merging, multi-mesh support, tolerance control,
 *           large mesh optimization, JavaScript mesh repairs
 */

// Auto-detect base path from worker's own URL (works on GitHub Pages, subdomains, etc.)
const WORKER_BASE_PATH = (() => {
  const url = self.location.href
  // Remove the worker filename to get the base directory
  return url.substring(0, url.lastIndexOf('/') + 1)
})()

// Load ACIS parser bundle (includes parser + geometry conversion)
try {
  importScripts(WORKER_BASE_PATH + 'acis-bundle.js')
} catch (e) {
  // ACIS module is optional - F3D support will be disabled
  console.log('ACIS module not loaded (F3D support disabled):', e.message)
}

let wasmInstance = null


// ============================================================================
// config.js
// ============================================================================

/**
 * Converter Configuration
 * Constants and thresholds for mesh processing
 */

// Thresholds for large mesh optimization
const LARGE_MESH_THRESHOLD = 50000      // Skip expensive operations above this
const VERY_LARGE_MESH_THRESHOLD = 100000 // Skip face merging above this

// ============================================================================
// mesh-utils.js
// ============================================================================

/**
 * Mesh Utility Functions
 * Edge utilities, triangulation, normal harmonization, hole filling
 */

// ============================================================================
// Edge Utilities
// ============================================================================

/**
 * Create canonical edge key (order-independent)
 */
function edgeKey(a, b) {
  return a < b ? `${a}-${b}` : `${b}-${a}`
}

/**
 * Build edge-to-triangle adjacency map
 * Returns Map: edgeKey -> [{ triIndex, orderedKey }]
 */
function buildEdgeMap(triangles) {
  const edgeMap = new Map()

  for (let i = 0; i < triangles.length; i++) {
    const tri = triangles[i]
    const edges = [
      [tri.v1, tri.v2],
      [tri.v2, tri.v3],
      [tri.v3, tri.v1]
    ]

    for (const [a, b] of edges) {
      const key = edgeKey(a, b)
      const ordered = `${a}-${b}` // preserves winding direction
      if (!edgeMap.has(key)) {
        edgeMap.set(key, [])
      }
      edgeMap.get(key).push({ triIndex: i, a, b, ordered })
    }
  }

  return edgeMap
}

// ============================================================================
// Normal Harmonization
// ============================================================================

/**
 * Harmonize normals using BFS flood-fill algorithm
 * Starts from triangle 0 (assumed correct) and propagates consistent winding
 *
 * Two adjacent triangles sharing edge (A,B) should have opposite winding:
 * - Triangle 1: A -> B (edge goes A to B)
 * - Triangle 2: B -> A (edge goes B to A)
 * If both have A -> B, one needs flipping.
 */
function harmonizeNormals(triangles) {
  if (triangles.length === 0) return { flipped: 0, triangles }

  // Build adjacency: triangle -> [neighbor triangle indices via shared edges]
  const edgeMap = buildEdgeMap(triangles)
  const triAdjacency = new Map() // triIndex -> [{ neighbor, sharedEdge, myWinding, neighborWinding }]

  for (const [, tris] of edgeMap) {
    if (tris.length === 2) {
      const [t1, t2] = tris

      // Add adjacency for both triangles
      if (!triAdjacency.has(t1.triIndex)) triAdjacency.set(t1.triIndex, [])
      if (!triAdjacency.has(t2.triIndex)) triAdjacency.set(t2.triIndex, [])

      triAdjacency.get(t1.triIndex).push({
        neighbor: t2.triIndex,
        myOrdered: t1.ordered,
        neighborOrdered: t2.ordered
      })
      triAdjacency.get(t2.triIndex).push({
        neighbor: t1.triIndex,
        myOrdered: t2.ordered,
        neighborOrdered: t1.ordered
      })
    }
  }

  // BFS from triangle 0
  const visited = new Set()
  const toFlip = new Set()
  const queue = [{ triIdx: 0, shouldFlip: false }]
  visited.add(0)

  while (queue.length > 0) {
    const { triIdx, shouldFlip } = queue.shift()

    if (shouldFlip) {
      toFlip.add(triIdx)
    }

    const neighbors = triAdjacency.get(triIdx) || []

    for (const { neighbor, myOrdered, neighborOrdered } of neighbors) {
      if (visited.has(neighbor)) continue
      visited.add(neighbor)

      // Check if windings are consistent
      // For proper manifold: if my edge goes A->B, neighbor should have B->A
      // Same winding (both A->B or both B->A) means one needs flipping relative to the other
      const currentFlipped = toFlip.has(triIdx)
      let sameWinding = (myOrdered === neighborOrdered)

      // If current triangle is flipped, its effective winding is reversed
      if (currentFlipped) {
        sameWinding = !sameWinding
      }

      // If same effective winding, neighbor needs to flip (relative to the reference)
      queue.push({ triIdx: neighbor, shouldFlip: sameWinding })
    }
  }

  // Flip marked triangles (swap v1 and v2)
  for (const idx of toFlip) {
    const t = triangles[idx]
    const temp = t.v1
    t.v1 = t.v2
    t.v2 = temp
  }

  return { flipped: toFlip.size, triangles }
}

// ============================================================================
// Non-manifold Detection and Removal
// ============================================================================

/**
 * Detect non-manifold edges (edges shared by more than 2 triangles)
 */
function detectNonManifolds(triangles) {
  const edgeCount = new Map()

  for (const tri of triangles) {
    const edges = [
      edgeKey(tri.v1, tri.v2),
      edgeKey(tri.v2, tri.v3),
      edgeKey(tri.v3, tri.v1)
    ]
    for (const edge of edges) {
      edgeCount.set(edge, (edgeCount.get(edge) || 0) + 1)
    }
  }

  const nonManifoldEdges = []
  for (const [edge, count] of edgeCount) {
    if (count > 2) {
      nonManifoldEdges.push({ edge, count })
    }
  }

  return {
    hasNonManifolds: nonManifoldEdges.length > 0,
    edges: nonManifoldEdges,
    count: nonManifoldEdges.length
  }
}

/**
 * Remove non-manifold triangles (conservative: remove extra triangles sharing bad edges)
 */
function removeNonManifolds(_vertices, triangles) {
  const detection = detectNonManifolds(triangles)
  if (!detection.hasNonManifolds) {
    return { triangles, removed: 0, edges: [] }
  }

  const badEdgeSet = new Set(detection.edges.map(e => e.edge))
  const edgeTriangles = new Map() // edge -> [triIndex]
  const toRemove = new Set()

  for (let i = 0; i < triangles.length; i++) {
    const tri = triangles[i]
    const edges = [
      edgeKey(tri.v1, tri.v2),
      edgeKey(tri.v2, tri.v3),
      edgeKey(tri.v3, tri.v1)
    ]

    for (const edge of edges) {
      if (badEdgeSet.has(edge)) {
        if (!edgeTriangles.has(edge)) edgeTriangles.set(edge, [])
        edgeTriangles.get(edge).push(i)

        // Keep first 2 triangles per edge, mark extras for removal
        if (edgeTriangles.get(edge).length > 2) {
          toRemove.add(i)
        }
      }
    }
  }

  const newTriangles = triangles.filter((_, i) => !toRemove.has(i))
  return {
    triangles: newTriangles,
    removed: toRemove.size,
    edges: detection.edges
  }
}

// ============================================================================
// Boundary Edge and Hole Detection
// ============================================================================

/**
 * Find boundary edges (edges with only 1 adjacent triangle)
 */
function findBoundaryEdges(triangles) {
  const edgeMap = buildEdgeMap(triangles)
  const boundaryEdges = []

  for (const [edge, tris] of edgeMap) {
    if (tris.length === 1) {
      // Parse edge key to get vertex indices
      const [a, b] = edge.split('-').map(Number)
      boundaryEdges.push({ a, b, triIndex: tris[0].triIndex })
    }
  }

  return boundaryEdges
}

/**
 * Group boundary edges into closed loops (holes)
 */
function groupBoundaryEdgesIntoLoops(boundaryEdges) {
  if (boundaryEdges.length === 0) return []

  // Build vertex adjacency for boundary edges
  const vertexAdj = new Map() // vertex -> [connected vertices]
  for (const { a, b } of boundaryEdges) {
    if (!vertexAdj.has(a)) vertexAdj.set(a, [])
    if (!vertexAdj.has(b)) vertexAdj.set(b, [])
    vertexAdj.get(a).push(b)
    vertexAdj.get(b).push(a)
  }

  const visited = new Set()
  const loops = []

  for (const startVertex of vertexAdj.keys()) {
    if (visited.has(startVertex)) continue

    // Trace the loop
    const loop = []
    let current = startVertex
    let prev = null

    while (true) {
      if (visited.has(current) && loop.length > 2) {
        // Closed the loop
        break
      }

      if (visited.has(current)) {
        // Hit a visited vertex but not a closed loop - complex topology
        break
      }

      visited.add(current)
      loop.push(current)

      const neighbors = vertexAdj.get(current) || []
      // Find next vertex (not the one we came from)
      let next = null
      for (const n of neighbors) {
        if (n !== prev) {
          next = n
          break
        }
      }

      if (next === null) break
      if (next === startVertex && loop.length >= 3) {
        // Successfully closed the loop
        break
      }

      prev = current
      current = next
    }

    if (loop.length >= 3) {
      loops.push(loop)
    }
  }

  return loops
}

// ============================================================================
// Geometry Utilities for Triangulation
// ============================================================================

/**
 * Calculate cross product of vectors (b-a) and (c-a)
 */
function cross(a, b, c, vertices) {
  const v1 = vertices[a]
  const v2 = vertices[b]
  const v3 = vertices[c]

  const ux = v2.x - v1.x, uy = v2.y - v1.y, uz = v2.z - v1.z
  const vx = v3.x - v1.x, vy = v3.y - v1.y, vz = v3.z - v1.z

  return {
    x: uy * vz - uz * vy,
    y: uz * vx - ux * vz,
    z: ux * vy - uy * vx
  }
}

/**
 * Check if point p is inside triangle (a,b,c) using barycentric coordinates
 * Works in 2D - project to dominant axis
 */
function pointInTriangle2D(px, py, ax, ay, bx, by, cx, cy) {
  const denom = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy)
  if (Math.abs(denom) < 1e-10) return false

  const u = ((by - cy) * (px - cx) + (cx - bx) * (py - cy)) / denom
  const v = ((cy - ay) * (px - cx) + (ax - cx) * (py - cy)) / denom
  const w = 1 - u - v

  return u >= 0 && v >= 0 && w >= 0
}

/**
 * Check if vertex at index 'ear' forms a valid ear (convex and no other vertices inside)
 */
function isEar(vertices, polygon, prevIdx, currIdx, nextIdx) {
  const prev = polygon[prevIdx]
  const curr = polygon[currIdx]
  const next = polygon[nextIdx]

  const vPrev = vertices[prev]
  const vCurr = vertices[curr]
  const vNext = vertices[next]

  // Check convexity (cross product should be positive for CCW polygon)
  const crossZ = (vCurr.x - vPrev.x) * (vNext.y - vPrev.y) -
                 (vCurr.y - vPrev.y) * (vNext.x - vPrev.x)

  if (crossZ <= 0) return false // Reflex vertex, not an ear

  // Check that no other polygon vertices are inside this triangle
  for (let i = 0; i < polygon.length; i++) {
    if (i === prevIdx || i === currIdx || i === nextIdx) continue

    const p = vertices[polygon[i]]
    if (pointInTriangle2D(p.x, p.y, vPrev.x, vPrev.y, vCurr.x, vCurr.y, vNext.x, vNext.y)) {
      return false
    }
  }

  return true
}

// ============================================================================
// Hole Triangulation and Filling
// ============================================================================

/**
 * Triangulate a hole using ear clipping algorithm
 * Returns array of new triangles
 */
function triangulateHole(vertices, holeVertices) {
  if (holeVertices.length < 3) return []
  if (holeVertices.length === 3) {
    return [{ v1: holeVertices[0], v2: holeVertices[1], v3: holeVertices[2] }]
  }

  const tris = []
  const remaining = [...holeVertices]
  let maxIterations = remaining.length * 2 // Prevent infinite loops

  while (remaining.length > 3 && maxIterations > 0) {
    maxIterations--
    let earFound = false

    for (let i = 0; i < remaining.length; i++) {
      const prevIdx = (i - 1 + remaining.length) % remaining.length
      const nextIdx = (i + 1) % remaining.length

      if (isEar(vertices, remaining, prevIdx, i, nextIdx)) {
        tris.push({
          v1: remaining[prevIdx],
          v2: remaining[i],
          v3: remaining[nextIdx]
        })
        remaining.splice(i, 1)
        earFound = true
        break
      }
    }

    if (!earFound) {
      // No ear found - polygon may be degenerate or self-intersecting
      // Try to salvage by creating a triangle anyway
      if (remaining.length >= 3) {
        tris.push({
          v1: remaining[0],
          v2: remaining[1],
          v3: remaining[2]
        })
        remaining.splice(1, 1)
      }
    }
  }

  // Final triangle
  if (remaining.length === 3) {
    tris.push({ v1: remaining[0], v2: remaining[1], v3: remaining[2] })
  }

  return tris
}

/**
 * Fill holes in mesh by finding boundary edges and triangulating
 */
function fillHoles(vertices, triangles, maxHoleSize = 1000) {
  const boundaryEdges = findBoundaryEdges(triangles)

  if (boundaryEdges.length === 0) {
    return { triangles, filled: 0, holeCount: 0 }
  }

  const holes = groupBoundaryEdgesIntoLoops(boundaryEdges)
  let filledCount = 0
  const newTriangles = [...triangles]

  for (const hole of holes) {
    if (hole.length > maxHoleSize) {
      // Skip large holes
      continue
    }

    const holeTris = triangulateHole(vertices, hole)
    newTriangles.push(...holeTris)
    filledCount++
  }

  return {
    triangles: newTriangles,
    filled: filledCount,
    holeCount: holes.length,
    skippedLargeHoles: holes.filter(h => h.length > maxHoleSize).length
  }
}

// ============================================================================
// mesh-analysis.js
// ============================================================================

/**
 * Mesh Analysis Functions
 * Spatial hashing, self-intersection detection
 */

// ============================================================================
// Spatial Hashing
// ============================================================================

/**
 * Compute optimal cell size for spatial hashing based on average triangle size
 */
function computeOptimalCellSize(vertices, triangles) {
  if (triangles.length === 0 || vertices.length === 0) return 1.0

  let totalSize = 0
  const sampleSize = Math.min(100, triangles.length)

  for (let i = 0; i < sampleSize; i++) {
    const idx = Math.floor(i * triangles.length / sampleSize)
    const tri = triangles[idx]
    const v1 = vertices[tri.v1]
    const v2 = vertices[tri.v2]
    const v3 = vertices[tri.v3]

    // Approximate triangle size as max edge length
    const d1 = Math.sqrt((v2.x-v1.x)**2 + (v2.y-v1.y)**2 + (v2.z-v1.z)**2)
    const d2 = Math.sqrt((v3.x-v2.x)**2 + (v3.y-v2.y)**2 + (v3.z-v2.z)**2)
    const d3 = Math.sqrt((v1.x-v3.x)**2 + (v1.y-v3.y)**2 + (v1.z-v3.z)**2)
    totalSize += Math.max(d1, d2, d3)
  }

  return (totalSize / sampleSize) * 2 // Cell size = 2x average edge length
}

/**
 * Get grid cells that a triangle occupies
 */
function getTriangleCells(vertices, tri, cellSize) {
  const v1 = vertices[tri.v1]
  const v2 = vertices[tri.v2]
  const v3 = vertices[tri.v3]

  const minX = Math.floor(Math.min(v1.x, v2.x, v3.x) / cellSize)
  const maxX = Math.floor(Math.max(v1.x, v2.x, v3.x) / cellSize)
  const minY = Math.floor(Math.min(v1.y, v2.y, v3.y) / cellSize)
  const maxY = Math.floor(Math.max(v1.y, v2.y, v3.y) / cellSize)
  const minZ = Math.floor(Math.min(v1.z, v2.z, v3.z) / cellSize)
  const maxZ = Math.floor(Math.max(v1.z, v2.z, v3.z) / cellSize)

  const cells = []
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      for (let z = minZ; z <= maxZ; z++) {
        cells.push(`${x},${y},${z}`)
      }
    }
  }
  return cells
}

// ============================================================================
// Triangle Intersection Detection
// ============================================================================

/**
 * Check if two triangles share a vertex
 */
function trianglesShareVertex(t1, t2) {
  const v1 = [t1.v1, t1.v2, t1.v3]
  const v2 = [t2.v1, t2.v2, t2.v3]
  for (const a of v1) {
    for (const b of v2) {
      if (a === b) return true
    }
  }
  return false
}

/**
 * Ray-triangle intersection using Moller-Trumbore algorithm
 */
function rayTriangleIntersect(p0, p1, v0, v1, v2) {
  const EPSILON = 1e-10

  // Ray direction
  const dx = p1.x - p0.x
  const dy = p1.y - p0.y
  const dz = p1.z - p0.z

  // Edge vectors
  const e1x = v1.x - v0.x, e1y = v1.y - v0.y, e1z = v1.z - v0.z
  const e2x = v2.x - v0.x, e2y = v2.y - v0.y, e2z = v2.z - v0.z

  // Cross product d x e2
  const hx = dy * e2z - dz * e2y
  const hy = dz * e2x - dx * e2z
  const hz = dx * e2y - dy * e2x

  const a = e1x * hx + e1y * hy + e1z * hz
  if (a > -EPSILON && a < EPSILON) return false // Ray parallel to triangle

  const f = 1.0 / a
  const sx = p0.x - v0.x, sy = p0.y - v0.y, sz = p0.z - v0.z
  const u = f * (sx * hx + sy * hy + sz * hz)
  if (u < 0.0 || u > 1.0) return false

  // Cross product s x e1
  const qx = sy * e1z - sz * e1y
  const qy = sz * e1x - sx * e1z
  const qz = sx * e1y - sy * e1x

  const v = f * (dx * qx + dy * qy + dz * qz)
  if (v < 0.0 || u + v > 1.0) return false

  const t = f * (e2x * qx + e2y * qy + e2z * qz)

  // Check if intersection is within the edge segment [0, 1]
  return t > EPSILON && t < 1.0 - EPSILON
}

/**
 * Moller-Trumbore triangle-triangle intersection test
 * Returns true if triangles intersect (excluding shared edges/vertices)
 */
function trianglesIntersect(vertices, t1, t2) {
  // Get triangle vertices
  const a1 = vertices[t1.v1], b1 = vertices[t1.v2], c1 = vertices[t1.v3]
  const a2 = vertices[t2.v1], b2 = vertices[t2.v2], c2 = vertices[t2.v3]

  // Test all edges of t1 against t2
  const edges1 = [[a1, b1], [b1, c1], [c1, a1]]
  for (const [p0, p1] of edges1) {
    if (rayTriangleIntersect(p0, p1, a2, b2, c2)) return true
  }

  // Test all edges of t2 against t1
  const edges2 = [[a2, b2], [b2, c2], [c2, a2]]
  for (const [p0, p1] of edges2) {
    if (rayTriangleIntersect(p0, p1, a1, b1, c1)) return true
  }

  return false
}

// ============================================================================
// Self-Intersection Detection
// ============================================================================

/**
 * Detect self-intersections using spatial hashing
 */
function detectSelfIntersections(vertices, triangles, skipLarge = true) {
  const LARGE_THRESHOLD = 50000

  if (skipLarge && triangles.length > LARGE_THRESHOLD) {
    return {
      hasIntersections: false,
      count: 0,
      skipped: true,
      reason: `Skipped (${triangles.length.toLocaleString()} triangles > ${LARGE_THRESHOLD.toLocaleString()})`
    }
  }

  // Build spatial hash grid
  const cellSize = computeOptimalCellSize(vertices, triangles)
  const grid = new Map() // cell -> [triangleIndices]

  for (let i = 0; i < triangles.length; i++) {
    const cells = getTriangleCells(vertices, triangles[i], cellSize)
    for (const cell of cells) {
      if (!grid.has(cell)) grid.set(cell, [])
      grid.get(cell).push(i)
    }
  }

  // Check potential intersections
  const checked = new Set()
  let intersectionCount = 0

  for (const [, triIndices] of grid) {
    for (let i = 0; i < triIndices.length; i++) {
      for (let j = i + 1; j < triIndices.length; j++) {
        const a = triIndices[i], b = triIndices[j]
        const key = a < b ? `${a}-${b}` : `${b}-${a}`

        if (checked.has(key)) continue
        checked.add(key)

        // Skip adjacent triangles
        if (trianglesShareVertex(triangles[a], triangles[b])) continue

        if (trianglesIntersect(vertices, triangles[a], triangles[b])) {
          intersectionCount++
        }
      }
    }
  }

  return {
    hasIntersections: intersectionCount > 0,
    count: intersectionCount,
    skipped: false
  }
}

// ============================================================================
// mesh-repair.js
// ============================================================================

/**
 * JavaScript-level Mesh Repair
 * Works on raw triangle data before OpenCascade processing
 */


/**
 * JavaScript-level mesh repairs on raw triangle data
 * Works on mesh data before OpenCascade processing
 */
function repairMeshData(vertices, triangles, tolerance = 0.001) {
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

// ============================================================================
// format-parsers.js
// ============================================================================

/**
 * File Format Parsers
 * 3MF parsing and mesh-to-STL conversion
 */

// ============================================================================
// JSZip Loading
// ============================================================================

/**
 * Load JSZip library dynamically
 */
async function loadJSZip() {
  if (typeof JSZip !== 'undefined') return JSZip

  const response = await fetch('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js')
  const script = await response.text()
  eval(script)
  return JSZip
}

// ============================================================================
// 3MF Parsing
// ============================================================================

/**
 * Parse 3MF file (ZIP-based format)
 * Uses regex-based XML parsing since DOMParser is not available in workers
 */
async function parse3MF(arrayBuffer) {
  // 3MF is a ZIP file containing XML and mesh data
  const JSZip = await loadJSZip()
  const zip = await JSZip.loadAsync(arrayBuffer)

  // Look for the 3D model file
  const files = Object.keys(zip.files)
  let modelPath = files.find(f => f.toLowerCase() === '3d/3dmodel.model')
  if (!modelPath) {
    modelPath = files.find(f => f.toLowerCase().endsWith('.model'))
  }

  const meshes = []

  if (modelPath) {
    const modelXml = await zip.file(modelPath).async('text')

    // Parse meshes using regex (works in web workers)
    // Find all <mesh>...</mesh> blocks
    const meshRegex = /<mesh[^>]*>([\s\S]*?)<\/mesh>/gi
    let meshMatch

    while ((meshMatch = meshRegex.exec(modelXml)) !== null) {
      const meshContent = meshMatch[1]
      const vertices = []
      const triangles = []

      // Parse vertices: <vertex x="1.0" y="2.0" z="3.0" />
      const vertexRegex = /<vertex\s+x=["']([^"']+)["']\s+y=["']([^"']+)["']\s+z=["']([^"']+)["']/gi
      let vertexMatch
      while ((vertexMatch = vertexRegex.exec(meshContent)) !== null) {
        vertices.push({
          x: parseFloat(vertexMatch[1]),
          y: parseFloat(vertexMatch[2]),
          z: parseFloat(vertexMatch[3])
        })
      }

      // Parse triangles: <triangle v1="0" v2="1" v3="2" />
      const triangleRegex = /<triangle\s+v1=["'](\d+)["']\s+v2=["'](\d+)["']\s+v3=["'](\d+)["']/gi
      let triangleMatch
      while ((triangleMatch = triangleRegex.exec(meshContent)) !== null) {
        triangles.push({
          v1: parseInt(triangleMatch[1]),
          v2: parseInt(triangleMatch[2]),
          v3: parseInt(triangleMatch[3])
        })
      }

      if (vertices.length > 0 && triangles.length > 0) {
        meshes.push({ vertices, triangles })
      }
    }
  }

  // Check for embedded STL files in multiple locations (BambuStudio/PrusaSlicer compatibility)
  const stlPatterns = [
    /\.stl$/i,                    // Any .stl file
    /Metadata\/.*\.stl$/i,        // Metadata folder (some slicers)
    /3D\/Objects\/.*\.stl$/i,     // 3D/Objects folder (PrusaSlicer)
    /3D\/.*\.stl$/i               // Any STL in 3D folder
  ]

  const objectFiles = files.filter(f => {
    // Skip already processed model files
    if (f.toLowerCase().endsWith('.model')) return false
    // Check if matches any STL pattern
    return stlPatterns.some(pattern => pattern.test(f))
  })

  for (const objFile of objectFiles) {
    try {
      const fileContent = zip.file(objFile)
      if (fileContent) {
        const stlData = await fileContent.async('arraybuffer')
        meshes.push({ stlData: new Uint8Array(stlData), isStl: true, source: objFile })
      }
    } catch (e) {
      console.log(`Failed to read embedded STL: ${objFile}`, e.message)
    }
  }

  // Check for component references in model XML
  if (modelPath) {
    const modelXml = await zip.file(modelPath).async('text')

    // Look for component references like <component objectid="2" ... />
    const componentRegex = /<component\s+[^>]*objectid=["'](\d+)["'][^>]*>/gi
    let componentMatch
    const referencedObjects = new Set()

    while ((componentMatch = componentRegex.exec(modelXml)) !== null) {
      referencedObjects.add(componentMatch[1])
    }

    // Find and parse referenced object definitions
    for (const objId of referencedObjects) {
      const objRegex = new RegExp(`<object\\s+id=["']${objId}["'][^>]*>([\\s\\S]*?)<\\/object>`, 'gi')
      let objMatch = objRegex.exec(modelXml)

      if (objMatch) {
        const objContent = objMatch[1]
        // Check if this object has a mesh (already parsed above)
        if (!objContent.includes('<mesh')) {
          // Check if it references an external file via path attribute
          const pathMatch = objContent.match(/path=["']([^"']+)["']/i)
          if (pathMatch) {
            const refPath = pathMatch[1]
            const fullPath = files.find(f => f.endsWith(refPath) || f.includes(refPath))
            if (fullPath && !objectFiles.includes(fullPath)) {
              try {
                const stlData = await zip.file(fullPath).async('arraybuffer')
                meshes.push({ stlData: new Uint8Array(stlData), isStl: true, source: fullPath })
              } catch (e) {
                console.log(`Failed to read referenced file: ${fullPath}`, e.message)
              }
            }
          }
        }
      }
    }
  }

  if (meshes.length === 0) {
    throw new Error('No mesh data found in 3MF file')
  }

  return meshes
}

// ============================================================================
// Mesh to STL Conversion
// ============================================================================

/**
 * Convert 3MF mesh data to binary STL format
 */
function meshToStl(mesh) {
  const { vertices, triangles } = mesh

  // Binary STL format: 80 byte header + 4 byte triangle count + 50 bytes per triangle
  const buffer = new ArrayBuffer(84 + triangles.length * 50)
  const view = new DataView(buffer)

  // Header (80 bytes, can be anything)
  // Triangle count
  view.setUint32(80, triangles.length, true)

  let offset = 84
  for (const tri of triangles) {
    const v1 = vertices[tri.v1]
    const v2 = vertices[tri.v2]
    const v3 = vertices[tri.v3]

    // Calculate normal
    const ux = v2.x - v1.x, uy = v2.y - v1.y, uz = v2.z - v1.z
    const vx = v3.x - v1.x, vy = v3.y - v1.y, vz = v3.z - v1.z
    const nx = uy * vz - uz * vy
    const ny = uz * vx - ux * vz
    const nz = ux * vy - uy * vx
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1

    // Normal
    view.setFloat32(offset, nx / len, true); offset += 4
    view.setFloat32(offset, ny / len, true); offset += 4
    view.setFloat32(offset, nz / len, true); offset += 4

    // Vertices
    view.setFloat32(offset, v1.x, true); offset += 4
    view.setFloat32(offset, v1.y, true); offset += 4
    view.setFloat32(offset, v1.z, true); offset += 4
    view.setFloat32(offset, v2.x, true); offset += 4
    view.setFloat32(offset, v2.y, true); offset += 4
    view.setFloat32(offset, v2.z, true); offset += 4
    view.setFloat32(offset, v3.x, true); offset += 4
    view.setFloat32(offset, v3.y, true); offset += 4
    view.setFloat32(offset, v3.z, true); offset += 4

    // Attribute byte count
    view.setUint16(offset, 0, true); offset += 2
  }

  return new Uint8Array(buffer)
}

/**
 * Parse binary STL data into vertices and triangles
 */
function parseStlBinary(fileData) {
  const vertices = []
  const triangles = []

  if (fileData.byteLength > 84) {
    const view = new DataView(fileData)
    const numTris = view.getUint32(80, true)
    let offset = 84

    for (let i = 0; i < numTris && offset + 50 <= fileData.byteLength; i++) {
      // Skip normal (12 bytes)
      offset += 12

      // Read 3 vertices
      const v1Idx = vertices.length
      for (let j = 0; j < 3; j++) {
        vertices.push({
          x: view.getFloat32(offset, true),
          y: view.getFloat32(offset + 4, true),
          z: view.getFloat32(offset + 8, true)
        })
        offset += 12
      }

      triangles.push({
        v1: v1Idx,
        v2: v1Idx + 1,
        v3: v1Idx + 2
      })

      // Skip attribute byte count
      offset += 2
    }
  }

  return { vertices, triangles }
}

// ============================================================================
// chili-init.js
// ============================================================================

/**
 * Chili-WASM Initialization
 * Handles loading and initializing chili3d's OpenCascade WASM module (OCCT 7.9.1)
 * in a web worker context
 */

/**
 * Initialize chili-wasm module
 * @param {string} basePath - Base path for loading WASM files
 * @param {function} postMessage - Worker's postMessage function for progress updates
 * @returns {Promise<Object>} Initialized chili-wasm module instance
 */
async function initChiliWasm(basePath, postMessage) {
  const cacheVersion = 'v1'

  postMessage({ type: 'progress', message: 'Fetching chili-wasm.js...' })

  const response = await fetch(basePath + `chili-wasm/chili-wasm.js?${cacheVersion}`)
  let scriptText = await response.text()

  // Replace import.meta.url with a known URL so locateFile can resolve the WASM path
  const wasmBaseUrl = basePath + 'chili-wasm/'
  scriptText = scriptText.replace(
    /import\.meta\.url/g,
    JSON.stringify(wasmBaseUrl + 'chili-wasm.js')
  )

  // Remove ES module export statements
  scriptText = scriptText.replace(/export\s*\{[^}]*\}\s*;?\s*$/m, '')
  scriptText = scriptText.replace(/export\s+default\s+\w+\s*;?\s*$/m, '')

  postMessage({ type: 'progress', message: 'Parsing chili-wasm.js...' })

  eval(scriptText)

  postMessage({ type: 'progress', message: 'Initializing WASM (~15MB)...' })

  return await Module({
    locateFile: (file) => wasmBaseUrl + file + '?' + cacheVersion
  })
}

// ============================================================================
// chili-io.js
// ============================================================================

/**
 * Chili-WASM I/O Functions
 * STL/STEP/IGES reading, writing, and mesh analysis using chili3d's Converter API
 */


// ============================================================================
// Mesh Analysis
// ============================================================================

/**
 * Analyze mesh and return statistics using chili-wasm APIs
 */
function analyzeMesh(wasm, shape, originalTriangleCount = 0) {
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
    // Count faces
    const faces = wasm.Shape.findSubShapes(shape, wasm.TopAbs_ShapeEnum.TopAbs_FACE)
    stats.faceCount = faces.length

    // Count edges
    const edges = wasm.Shape.findSubShapes(shape, wasm.TopAbs_ShapeEnum.TopAbs_EDGE)
    stats.edgeCount = edges.length

    // Count vertices
    const vertices = wasm.Shape.findSubShapes(shape, wasm.TopAbs_ShapeEnum.TopAbs_VERTEX)
    stats.vertexCount = vertices.length

    // Check if shape contains a solid
    const solids = wasm.Shape.findSubShapes(shape, wasm.TopAbs_ShapeEnum.TopAbs_SOLID)
    stats.isSolid = solids.length > 0

    // Check if closed (watertight)
    try {
      stats.isWatertight = wasm.Shape.isClosed(shape)
    } catch (e) {
      // isClosed may fail on some shapes
    }

    // Calculate volume from solids
    if (solids.length > 0) {
      try {
        for (let i = 0; i < solids.length; i++) {
          const solid = wasm.TopoDS.solid(solids[i])
          stats.volume += Math.abs(wasm.Solid.volume(solid))
        }
      } catch (e) {
        // Volume calculation may fail
      }
    }

    // Calculate surface area from faces
    try {
      for (let i = 0; i < faces.length; i++) {
        const face = wasm.TopoDS.face(faces[i])
        stats.surfaceArea += wasm.Face.area(face)
      }
    } catch (e) {
      // Area calculation may fail
    }

    // Add quality warnings
    if (!stats.isSolid && stats.faceCount > 0) {
      stats.qualityIssues.push('Not a solid (may have gaps/holes)')
    }
    if (!stats.isWatertight) {
      stats.qualityIssues.push('Shape is not closed/watertight')
    }
    if (stats.faceCount > LARGE_MESH_THRESHOLD) {
      stats.qualityIssues.push(`Large mesh (${stats.faceCount.toLocaleString()} faces)`)
    }

    // findSubShapes returns plain JS arrays, no cleanup needed
  } catch (e) {
    console.error('Mesh analysis error:', e)
  }

  return stats
}

// ============================================================================
// Shape Tessellation (for 3D preview)
// ============================================================================

/**
 * Tessellate a shape and return mesh data for 3D rendering
 * @returns {{ positions: Float32Array, normals: Float32Array, indices: Uint32Array } | null}
 */
function tessellateShape(wasm, shape, deflection = 0.5) {
  try {
    const mesher = new wasm.Mesher(shape, deflection)
    const meshData = mesher.mesh()
    const faceMesh = meshData.faceMeshData

    // Copy to standalone typed arrays (they'll be transferred)
    const positions = new Float32Array(faceMesh.position)
    const normals = new Float32Array(faceMesh.normal)
    const indices = new Uint32Array(faceMesh.index)

    meshData.delete()
    mesher.delete()

    if (positions.length === 0) return null
    return { positions, normals, indices }
  } catch (e) {
    console.warn('Tessellation failed:', e.message)
    return null
  }
}

// ============================================================================
// STL Reading
// ============================================================================

/**
 * Read STL file and return shape using chili-wasm Converter
 * @param {Object} wasm - chili-wasm module instance
 * @param {Uint8Array} stlData - STL file data
 * @returns {Object} TopoDS_Shape
 */
function readStl(wasm, stlData) {
  const node = wasm.Converter.convertFromStl(stlData)
  if (!node || !node.shape) {
    throw new Error('Failed to read STL file')
  }
  const shape = wasm.Shape.clone(node.shape)
  node.delete()
  return shape
}

// ============================================================================
// Output Writing
// ============================================================================

/**
 * Write output file (STEP or STL)
 * Returns Uint8Array of the output data
 */
function writeOutput(wasm, shape, format) {
  if (!shape) {
    throw new Error('No shape to export')
  }

  try {
    if (shape.isNull()) {
      throw new Error('Shape is null/empty')
    }
  } catch (e) {
    // isNull check may not be available on all shapes
  }

  if (format === 'step') {
    // Use Converter.convertToStep which returns a string
    const shapes = [shape]
    const stepString = wasm.Converter.convertToStep(shapes)

    if (!stepString || stepString.length === 0) {
      throw new Error('STEP export produced empty output')
    }

    // Convert string to Uint8Array
    const encoder = new TextEncoder()
    return encoder.encode(stepString)
  } else if (format === 'iges') {
    const shapes = [shape]
    const igesString = wasm.Converter.convertToIges(shapes)

    if (!igesString || igesString.length === 0) {
      throw new Error('IGES export produced empty output')
    }

    const encoder = new TextEncoder()
    return encoder.encode(igesString)
  } else {
    // STL format - use Mesher to tessellate, then build binary STL
    const mesher = new wasm.Mesher(shape, 0.1) // deflection angle
    const meshData = mesher.mesh()
    const faceMesh = meshData.faceMeshData

    const positions = faceMesh.position
    const normals = faceMesh.normal
    const indices = faceMesh.index

    // Build binary STL from mesh data
    const numTriangles = indices.length / 3
    const buffer = new ArrayBuffer(84 + numTriangles * 50)
    const view = new DataView(buffer)

    // Header (80 bytes) + triangle count
    view.setUint32(80, numTriangles, true)

    let offset = 84
    for (let i = 0; i < indices.length; i += 3) {
      const i0 = indices[i], i1 = indices[i + 1], i2 = indices[i + 2]

      // Normal (average of vertex normals)
      const nx = (normals[i0 * 3] + normals[i1 * 3] + normals[i2 * 3]) / 3
      const ny = (normals[i0 * 3 + 1] + normals[i1 * 3 + 1] + normals[i2 * 3 + 1]) / 3
      const nz = (normals[i0 * 3 + 2] + normals[i1 * 3 + 2] + normals[i2 * 3 + 2]) / 3
      view.setFloat32(offset, nx, true); offset += 4
      view.setFloat32(offset, ny, true); offset += 4
      view.setFloat32(offset, nz, true); offset += 4

      // Vertex 1
      view.setFloat32(offset, positions[i0 * 3], true); offset += 4
      view.setFloat32(offset, positions[i0 * 3 + 1], true); offset += 4
      view.setFloat32(offset, positions[i0 * 3 + 2], true); offset += 4
      // Vertex 2
      view.setFloat32(offset, positions[i1 * 3], true); offset += 4
      view.setFloat32(offset, positions[i1 * 3 + 1], true); offset += 4
      view.setFloat32(offset, positions[i1 * 3 + 2], true); offset += 4
      // Vertex 3
      view.setFloat32(offset, positions[i2 * 3], true); offset += 4
      view.setFloat32(offset, positions[i2 * 3 + 1], true); offset += 4
      view.setFloat32(offset, positions[i2 * 3 + 2], true); offset += 4

      // Attribute byte count
      view.setUint16(offset, 0, true); offset += 2
    }

    // Cleanup embind objects
    meshData.delete()
    mesher.delete()

    return new Uint8Array(buffer)
  }
}

// ============================================================================
// Format Import
// ============================================================================

/**
 * Read STEP file and return shape
 */
function readStep(wasm, stepData) {
  const node = wasm.Converter.convertFromStep(stepData)
  if (!node || !node.shape) {
    throw new Error('Failed to read STEP file')
  }
  const shape = wasm.Shape.clone(node.shape)
  node.delete()
  return shape
}

/**
 * Read IGES file and return shape
 */
function readIges(wasm, igesData) {
  const node = wasm.Converter.convertFromIges(igesData)
  if (!node || !node.shape) {
    throw new Error('Failed to read IGES file')
  }
  const shape = wasm.Shape.clone(node.shape)
  node.delete()
  return shape
}

// ============================================================================
// chili-repair.js
// ============================================================================

/**
 * Chili-WASM Repair Functions
 * Shape repair and processing using chili3d's higher-level APIs
 */


/**
 * Process a shape: try to create solid and optionally simplify
 *
 * Uses chili-wasm's available operations:
 * - Shape.findSubShapes: find shells in the shape
 * - ShapeFactory.solid: create solid from shells
 * - ShapeFactory.simplifyShape: simplify/unify the shape
 * - Shape.sewing: sew shapes together
 */
function processShape(wasm, shape, options = {}, postMessage) {
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

// ============================================================================
// chili-geometry-bridge.js
// ============================================================================

/**
 * Chili-WASM Geometry Bridge
 * Converts ACIS parsed entities to OpenCascade shapes using chili-wasm API
 * Adapted from acis-js/geometry-builder.js for chili-wasm's embind API
 *
 * Key API differences from opencascade.js:
 * - No numbered constructor suffixes (gp_Pnt vs gp_Pnt_3)
 * - camelCase methods (isDone vs IsDone, edge vs Edge)
 * - BRep_Builder uses return-value pattern (makeShell() returns shell)
 * - Bnd_Box.get() returns {xmin,ymin,zmin,xmax,ymax,zmax} object
 */

// ============================================================================
// Basic Geometry Helpers
// ============================================================================

const MAX_COORD = 1e10

function clampCoord(val) {
  const v = val || 0
  if (!isFinite(v) || Math.abs(v) > MAX_COORD) return 0
  return v
}

function makePoint(wasm, p) {
  if (!p) return new wasm.gp_Pnt(0, 0, 0)
  return new wasm.gp_Pnt(clampCoord(p.x), clampCoord(p.y), clampCoord(p.z))
}

function makeDirection(wasm, vec) {
  if (!vec) return new wasm.gp_Dir(0, 0, 1)
  const len = Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z)
  if (len < 1e-10) return new wasm.gp_Dir(0, 0, 1)
  return new wasm.gp_Dir(vec.x / len, vec.y / len, vec.z / len)
}

function makeAx1(wasm, origin, direction) {
  return new wasm.gp_Ax1(makePoint(wasm, origin), makeDirection(wasm, direction))
}

function makeAx2(wasm, origin, zDir, xDir) {
  const pnt = makePoint(wasm, origin)
  const z = makeDirection(wasm, zDir)
  if (xDir) {
    const x = makeDirection(wasm, xDir)
    return new wasm.gp_Ax2(pnt, z, x)
  }
  return new wasm.gp_Ax2(pnt, z)
}

function makeAx3(wasm, origin, axis, refDir) {
  const pnt = makePoint(wasm, origin)
  const z = makeDirection(wasm, axis)
  if (refDir) {
    const x = makeDirection(wasm, refDir)
    return new wasm.gp_Ax3(pnt, z, x)
  }
  return new wasm.gp_Ax3(pnt, z)
}

// ============================================================================
// Array Helpers
// ============================================================================

function polesToArray1OfPnt(wasm, poles) {
  const arr = new wasm.TColgp_Array1OfPnt(1, poles.length)
  for (let i = 0; i < poles.length; i++) {
    const p = poles[i]
    arr.setValue(i + 1, new wasm.gp_Pnt(clampCoord(p.x), clampCoord(p.y), clampCoord(p.z)))
  }
  return arr
}

function polesToArray1OfPnt2d(wasm, poles) {
  const arr = new wasm.TColgp_Array1OfPnt2d(1, poles.length)
  for (let i = 0; i < poles.length; i++) {
    const p = poles[i]
    const u = p.x !== undefined ? p.x : (p.u !== undefined ? p.u : 0)
    const v = p.y !== undefined ? p.y : (p.v !== undefined ? p.v : 0)
    arr.setValue(i + 1, new wasm.gp_Pnt2d(clampCoord(u), clampCoord(v)))
  }
  return arr
}

function polesToArray2OfPnt(wasm, poles) {
  const uSize = poles.length
  const vSize = poles[0].length
  const arr = new wasm.TColgp_Array2OfPnt(1, uSize, 1, vSize)
  for (let u = 0; u < uSize; u++) {
    for (let v = 0; v < vSize; v++) {
      const p = poles[u][v]
      arr.setValue(u + 1, v + 1, new wasm.gp_Pnt(clampCoord(p.x), clampCoord(p.y), clampCoord(p.z)))
    }
  }
  return arr
}

function knotsToArray1OfReal(wasm, knots) {
  const arr = new wasm.TColStd_Array1OfReal(1, knots.length)
  for (let i = 0; i < knots.length; i++) {
    arr.setValue(i + 1, knots[i])
  }
  return arr
}

function multsToArray1OfInteger(wasm, mults) {
  const arr = new wasm.TColStd_Array1OfInteger(1, mults.length)
  for (let i = 0; i < mults.length; i++) {
    arr.setValue(i + 1, mults[i])
  }
  return arr
}

function weightsToArray1OfReal(wasm, weights) {
  const arr = new wasm.TColStd_Array1OfReal(1, weights.length)
  for (let i = 0; i < weights.length; i++) {
    arr.setValue(i + 1, weights[i])
  }
  return arr
}

function weightsToArray2OfReal(wasm, weights) {
  const uSize = weights.length
  const vSize = weights[0].length
  const arr = new wasm.TColStd_Array2OfReal(1, uSize, 1, vSize)
  for (let u = 0; u < uSize; u++) {
    for (let v = 0; v < vSize; v++) {
      arr.setValue(u + 1, v + 1, weights[u][v])
    }
  }
  return arr
}

// ============================================================================
// Basic Curve Builders
// ============================================================================

function createLine(wasm, start, end) {
  if (!start || !end) return null
  try {
    const dx = end.x - start.x, dy = end.y - start.y, dz = end.z - start.z
    if (Math.sqrt(dx * dx + dy * dy + dz * dz) < 1e-10) return null
    const p1 = makePoint(wasm, start)
    const p2 = makePoint(wasm, end)
    const builder = new wasm.BRepBuilderAPI_MakeEdge(p1, p2)
    if (builder.isDone()) return builder.edge()
  } catch (e) {
    console.warn('createLine failed:', e.message)
  }
  return null
}

// ============================================================================
// B-Spline Curve Builder
// ============================================================================

function createBSplineCurve(wasm, nubs, sense = 'forward') {
  if (!nubs || !nubs.poles || nubs.poles.length === 0) return null
  if (!nubs.uKnots || nubs.uKnots.length === 0 || !nubs.uMults || nubs.uMults.length === 0) return null
  if (!nubs.uDegree || nubs.uDegree < 1) return null
  if (nubs.poles.length === 2) return createLine(wasm, nubs.poles[0], nubs.poles[1])

  try {
    const poles = polesToArray1OfPnt(wasm, nubs.poles)
    const knots = knotsToArray1OfReal(wasm, nubs.uKnots)
    const mults = multsToArray1OfInteger(wasm, nubs.uMults)
    const degree = nubs.uDegree

    // ACIS may mark curves as periodic that have clamped end knots (mult=degree+1).
    // OCC rejects periodic curves with non-periodic knot structure. Detect and fix.
    let periodic = nubs.uPeriodic || false
    if (periodic && nubs.uMults.length >= 2) {
      const firstMult = nubs.uMults[0]
      const lastMult = nubs.uMults[nubs.uMults.length - 1]
      if (firstMult === degree + 1 || lastMult === degree + 1) {
        periodic = false  // clamped end knots → non-periodic
      }
    }

    let curve
    if (nubs.rational && nubs.weights && nubs.weights.length > 0) {
      const weights = weightsToArray1OfReal(wasm, nubs.weights)
      curve = new wasm.Geom_BSplineCurve(poles, weights, knots, mults, degree, periodic)
    } else {
      curve = new wasm.Geom_BSplineCurve(poles, knots, mults, degree, periodic)
    }

    if (sense === 'reversed') curve.reverse()
    return curve
  } catch (e) {
    if (nubs.poles.length >= 2) {
      return createLine(wasm, nubs.poles[0], nubs.poles[nubs.poles.length - 1])
    }
  }
  return null
}

function createBSplineCurve2d(wasm, nubs) {
  if (!nubs || !nubs.poles || nubs.poles.length === 0) return null
  try {
    const poles = polesToArray1OfPnt2d(wasm, nubs.poles)
    const knots = knotsToArray1OfReal(wasm, nubs.uKnots)
    const mults = multsToArray1OfInteger(wasm, nubs.uMults)
    const degree = nubs.uDegree
    const periodic = nubs.uPeriodic || false

    if (nubs.rational && nubs.weights && nubs.weights.length > 0) {
      const weights = weightsToArray1OfReal(wasm, nubs.weights)
      return new wasm.Geom2d_BSplineCurve(poles, weights, knots, mults, degree, periodic)
    }
    return new wasm.Geom2d_BSplineCurve(poles, knots, mults, degree, periodic)
  } catch (e) {
    console.warn('createBSplineCurve2d failed:', e.message)
  }
  return null
}

// ============================================================================
// B-Spline Surface Builder
// ============================================================================

function createBSplineSurface(wasm, nubs) {
  if (!nubs || !nubs.poles || nubs.poles.length === 0) return null
  if (!Array.isArray(nubs.poles[0])) return null

  try {
    const poles = polesToArray2OfPnt(wasm, nubs.poles)
    const uKnots = knotsToArray1OfReal(wasm, nubs.uKnots)
    const vKnots = knotsToArray1OfReal(wasm, nubs.vKnots)
    const uMults = multsToArray1OfInteger(wasm, nubs.uMults)
    const vMults = multsToArray1OfInteger(wasm, nubs.vMults)
    const uDeg = nubs.uDegree, vDeg = nubs.vDegree
    const uPer = nubs.uPeriodic || false, vPer = nubs.vPeriodic || false

    if (nubs.rational && nubs.weights && nubs.weights.length > 0) {
      const weights = weightsToArray2OfReal(wasm, nubs.weights)
      return new wasm.Geom_BSplineSurface(poles, weights, uKnots, vKnots, uMults, vMults, uDeg, vDeg, uPer, vPer)
    }
    return new wasm.Geom_BSplineSurface(poles, uKnots, vKnots, uMults, vMults, uDeg, vDeg, uPer, vPer)
  } catch (e) {
    console.warn('createBSplineSurface failed:', e.message)
    try {
      const poles = polesToArray2OfPnt(wasm, nubs.poles)
      const uKnots = knotsToArray1OfReal(wasm, nubs.uKnots)
      const vKnots = knotsToArray1OfReal(wasm, nubs.vKnots)
      const uMults = multsToArray1OfInteger(wasm, nubs.uMults)
      const vMults = multsToArray1OfInteger(wasm, nubs.vMults)
      return new wasm.Geom_BSplineSurface(poles, uKnots, vKnots, uMults, vMults, nubs.uDegree, nubs.vDegree, false, false)
    } catch (e2) {}
  }
  return null
}

// ============================================================================
// PCurve Builder
// ============================================================================

function createBSplinePCurve(wasm, pcurve, surface, sense = 'forward') {
  if (!pcurve || !surface) return null
  try {
    const curve2d = createBSplineCurve2d(wasm, pcurve)
    if (!curve2d) return null
    const handleCurve2d = new wasm.Handle_Geom2d_Curve(curve2d)
    const handleSurface = new wasm.Handle_Geom_Surface(surface)
    const edge = wasm.BRepBuilderAPI_MakeEdge.fromPCurve(handleCurve2d, handleSurface)
    if (!edge.isNull()) {
      if (sense === 'reversed') edge.reverse()
      return edge
    }
  } catch (e) {
    console.warn('createBSplinePCurve failed:', e.message)
  }
  return null
}

// ============================================================================
// Helix Builder
// ============================================================================

function createHelixCurve(wasm, helix) {
  if (!helix) return null
  try {
    const points = helix.buildPoints ? helix.buildPoints() : []
    if (points.length < 2) return null

    const hArr = new wasm.TColgp_HArray1OfPnt(1, points.length)
    for (let i = 0; i < points.length; i++) {
      hArr.setValue(i + 1, new wasm.gp_Pnt(points[i].x, points[i].y, points[i].z))
    }

    const interp = new wasm.GeomAPI_Interpolate(
      new wasm.Handle_TColgp_HArray1OfPnt(hArr), false, 1e-6
    )
    interp.perform()

    if (interp.isDone()) {
      const curve = interp.curve()
      const handleCurve = new wasm.Handle_Geom_Curve(curve.get())
      const builder = new wasm.BRepBuilderAPI_MakeEdge(handleCurve)
      if (builder.isDone()) return builder.edge()
    }
  } catch (e) {
    console.warn('createHelixCurve failed:', e.message)
  }
  return null
}

// ============================================================================
// Surface Builders
// ============================================================================

function createPlaneSurface(wasm, origin, normal) {
  if (!origin || !normal) return null
  try {
    const pnt = makePoint(wasm, origin)
    const dir = makeDirection(wasm, normal)
    const gpPln = new wasm.gp_Pln(pnt, dir)
    return new wasm.Geom_Plane(gpPln)
  } catch (e) {
    console.warn('createPlaneSurface failed:', e.message)
  }
  return null
}

function createCylindricalSurface(wasm, center, axis, radius) {
  if (!center || !axis || radius <= 0) return null
  try {
    return new wasm.Geom_CylindricalSurface(makeAx3(wasm, center, axis), radius)
  } catch (e) {
    console.warn('createCylindricalSurface failed:', e.message)
  }
  return null
}

function createConicalSurface(wasm, center, axis, radius, semiAngle) {
  if (!center || !axis || radius <= 0) return null
  try {
    const ax3 = makeAx3(wasm, center, axis)
    if (Math.abs(semiAngle) < 1e-6) return new wasm.Geom_CylindricalSurface(ax3, radius)
    return new wasm.Geom_ConicalSurface(ax3, semiAngle, radius)
  } catch (e) {
    console.warn('createConicalSurface failed:', e.message)
  }
  return null
}

function createSphericalSurface(wasm, center, radius) {
  if (!center || radius <= 0) return null
  try {
    return new wasm.Geom_SphericalSurface(makeAx3(wasm, center, { x: 0, y: 0, z: 1 }), radius)
  } catch (e) {
    console.warn('createSphericalSurface failed:', e.message)
  }
  return null
}

function createToroidalSurface(wasm, center, axis, majorRadius, minorRadius) {
  if (!center || !axis || majorRadius <= 0 || minorRadius <= 0) return null
  try {
    return new wasm.Geom_ToroidalSurface(makeAx3(wasm, center, axis), majorRadius, minorRadius)
  } catch (e) {
    console.warn('createToroidalSurface failed:', e.message)
  }
  return null
}

function createSurfaceOfRevolution(wasm, profile, location, direction) {
  if (!profile || !location || !direction) return null
  try {
    const axis = makeAx1(wasm, location, direction)
    const handleCurve = new wasm.Handle_Geom_Curve(profile)
    return new wasm.Geom_SurfaceOfRevolution(handleCurve, axis)
  } catch (e) {
    console.warn('createSurfaceOfRevolution failed:', e.message)
  }
  return null
}

function createRuledSurface(wasm, curve1, curve2) {
  if (!curve1 || !curve2) return null
  try {
    const hc1 = new wasm.Handle_Geom_Curve(curve1)
    const hc2 = new wasm.Handle_Geom_Curve(curve2)
    const b1 = new wasm.BRepBuilderAPI_MakeEdge(hc1)
    const b2 = new wasm.BRepBuilderAPI_MakeEdge(hc2)
    if (!b1.isDone() || !b2.isDone()) return null
    const w1 = new wasm.BRepBuilderAPI_MakeWire(b1.edge())
    const w2 = new wasm.BRepBuilderAPI_MakeWire(b2.edge())
    const loft = new wasm.BRepOffsetAPI_ThruSections(false, true)
    loft.addWire(w1.wire())
    loft.addWire(w2.wire())
    loft.build()
    if (loft.isDone()) return loft.shape()
  } catch (e) {
    console.warn('createRuledSurface failed:', e.message)
  }
  return null
}

function createOffsetSurface(wasm, baseSurface, offset) {
  if (!baseSurface) return null
  try {
    const h = new wasm.Handle_Geom_Surface(baseSurface)
    return new wasm.Geom_OffsetSurface(h, offset, true)
  } catch (e) {
    console.warn('createOffsetSurface failed:', e.message)
  }
  return null
}

// ============================================================================
// Face/Edge Builders
// ============================================================================

function createFaceFromSurface(wasm, surface, tolerance = 1e-6) {
  if (!surface) return null
  try {
    const h = new wasm.Handle_Geom_Surface(surface)
    const builder = new wasm.BRepBuilderAPI_MakeFace(h, tolerance)
    if (builder.isDone()) return builder.face()
  } catch (e) {
    console.warn('createFaceFromSurface failed:', e.message)
  }
  return null
}

function createEdgeFromCurve(wasm, curve, u1, u2) {
  if (!curve) return null
  try {
    const h = new wasm.Handle_Geom_Curve(curve)
    let builder
    if (u1 !== undefined && u2 !== undefined) {
      builder = new wasm.BRepBuilderAPI_MakeEdge(h, u1, u2)
    } else {
      builder = new wasm.BRepBuilderAPI_MakeEdge(h)
    }
    if (builder.isDone()) return builder.edge()
  } catch (e) {
    console.warn('createEdgeFromCurve failed:', e.message)
  }
  return null
}

// ============================================================================
// ACIS Entity Converters
// ============================================================================

function convertACISSurface(wasm, surfaceEntity) {
  if (!surfaceEntity) return null
  try {
    const typeName = surfaceEntity.getType ? surfaceEntity.getType() : ''

    if (typeName.includes('plane')) {
      return createPlaneSurface(wasm, surfaceEntity.origin, surfaceEntity.normal)
    } else if (typeName.includes('cone')) {
      const sine = surfaceEntity.sine || 0
      const cosine = surfaceEntity.cosine || 1
      const semiAngle = Math.abs(Math.asin(Math.max(-1, Math.min(1, sine))))
      const major = surfaceEntity.major || { x: 1, y: 0, z: 0 }
      const radius = Math.sqrt(major.x * major.x + major.y * major.y + major.z * major.z) || 1.0

      // Match Python Acis2Step: negate axis when cosine * sine < 0
      let axisDir = surfaceEntity.axis
      if (cosine * sine < 0) {
        axisDir = { x: -axisDir.x, y: -axisDir.y, z: -axisDir.z }
      }
      const ax3 = makeAx3(wasm, surfaceEntity.center, axisDir, major)
      if (Math.abs(sine) < 1e-6) return new wasm.Geom_CylindricalSurface(ax3, radius)
      return new wasm.Geom_ConicalSurface(ax3, semiAngle, radius)
    } else if (typeName.includes('sphere')) {
      // Use pole direction from ACIS entity as sphere axis (matching Python Acis2Step)
      const pole = surfaceEntity.pole || { x: 0, y: 0, z: 1 }
      const radius = surfaceEntity.radius || 1.0
      try {
        return new wasm.Geom_SphericalSurface(makeAx3(wasm, surfaceEntity.center, pole), radius)
      } catch (e) {
        return createSphericalSurface(wasm, surfaceEntity.center, radius)
      }
    } else if (typeName.includes('torus')) {
      const majorRadius = Math.abs(surfaceEntity.major) || 2.0
      const minorRadius = Math.abs(surfaceEntity.minor) || 0.5
      return createToroidalSurface(wasm, surfaceEntity.center, surfaceEntity.axis, majorRadius, minorRadius)
    } else if (typeName.includes('spline')) {
      // Production ACIS bundle uses .spline, not .nubs
      const splineData = surfaceEntity.spline || surfaceEntity.nubs
      if (splineData) return createBSplineSurface(wasm, splineData)
      // Spline surface may reference another surface type
      if (surfaceEntity.surface) {
        return convertACISSurface(wasm, surfaceEntity.surface)
      }
    }
    console.warn('Unsupported surface type: ' + typeName)
  } catch (e) {
    console.warn('Failed to convert surface:', e.message)
  }
  return null
}

function convertACISCurve(wasm, curveEntity, startPt, endPt) {
  if (!curveEntity) return null
  try {
    const typeName = curveEntity.getType ? curveEntity.getType() : ''

    if (typeName.includes('straight')) {
      const origin = makePoint(wasm, curveEntity.origin)
      const direction = makeDirection(wasm, curveEntity.direction)
      const ax1 = new wasm.gp_Ax1(origin, direction)
      // Use Geom_Line(gp_Ax1) directly - chili-wasm doesn't need gp_Lin intermediate
      return new wasm.Geom_Line(ax1)
    } else if (typeName.includes('ellipse')) {
      const center = makePoint(wasm, curveEntity.center)
      const normal = makeDirection(wasm, curveEntity.axis)
      const majorVec = curveEntity.major || { x: 1, y: 0, z: 0 }
      const majorAxis = makeDirection(wasm, majorVec)
      const majorRadius = Math.sqrt(majorVec.x ** 2 + majorVec.y ** 2 + majorVec.z ** 2) || 1.0
      const ratio = curveEntity.ratio || 1.0
      const minorRadius = majorRadius * ratio

      const ax2 = new wasm.gp_Ax2(center, normal, majorAxis)

      if (Math.abs(ratio - 1.0) < 1e-6) {
        const gpCirc = new wasm.gp_Circ(ax2, majorRadius)
        return new wasm.Geom_Circle(gpCirc)
      } else {
        const gpElips = new wasm.gp_Elips(ax2, majorRadius, minorRadius)
        return new wasm.Geom_Ellipse(gpElips)
      }
    } else if (typeName.includes('intcurve') || typeName.includes('spline')) {
      const splineData = curveEntity.spline || curveEntity.nubs
      if (splineData) return createBSplineCurve(wasm, splineData, 'forward')
    }

    // Fallback: line between endpoints
    if (startPt && endPt) {
      const p1 = makePoint(wasm, startPt)
      const dir = makeDirection(wasm, {
        x: endPt.x - startPt.x, y: endPt.y - startPt.y, z: endPt.z - startPt.z
      })
      const ax1 = new wasm.gp_Ax1(p1, dir)
      return new wasm.Geom_Line(ax1)
    }
    console.warn('Unsupported curve type: ' + typeName)
  } catch (e) {
    console.warn('Failed to convert curve:', e.message)
  }
  return null
}

function convertACISEdge(wasm, edgeEntity) {
  if (!edgeEntity) return null
  try {
    const curveEntity = edgeEntity.getCurve ? edgeEntity.getCurve() : null
    const startPt = edgeEntity.getStart ? edgeEntity.getStart() : null
    const endPt = edgeEntity.getEnd ? edgeEntity.getEnd() : null
    const startVertex = startPt && startPt.point ? startPt.point : startPt
    const endVertex = endPt && endPt.point ? endPt.point : endPt

    if (startVertex && endVertex) {
      const p1 = makePoint(wasm, startVertex)
      const p2 = makePoint(wasm, endVertex)
      const dx = (endVertex.x || 0) - (startVertex.x || 0)
      const dy = (endVertex.y || 0) - (startVertex.y || 0)
      const dz = (endVertex.z || 0) - (startVertex.z || 0)
      if (Math.sqrt(dx * dx + dy * dy + dz * dz) < 1e-6) return null

      const typeName = curveEntity && curveEntity.getType ? curveEntity.getType() : ''
      if (typeName && !typeName.includes('straight')) {
        const curve = convertACISCurve(wasm, curveEntity, startVertex, endVertex)
        if (curve) {
          const h = new wasm.Handle_Geom_Curve(curve)
          // Use parameter-based trimming (ACIS edge has parameter1/parameter2)
          // chili-wasm binding: BRepBuilderAPI_MakeEdge(Handle_Geom_Curve, double, double)
          const param1 = edgeEntity.parameter1
          const param2 = edgeEntity.parameter2
          if (param1 !== undefined && param2 !== undefined && Math.abs(param2 - param1) > 1e-12) {
            try {
              const builder = new wasm.BRepBuilderAPI_MakeEdge(h, param1, param2)
              if (builder.isDone()) {
                const edge = builder.edge()
                if (edgeEntity.sense === 'reversed') edge.reverse()
                return edge
              }
            } catch (e) { /* parameter-based trim failed */ }
          }
          // Fallback: full curve edge
          try {
            const builder = new wasm.BRepBuilderAPI_MakeEdge(h)
            if (builder.isDone()) {
              const edge = builder.edge()
              if (edgeEntity.sense === 'reversed') edge.reverse()
              return edge
            }
          } catch (e) { /* full curve edge also failed */ }
        }
      }

      // Straight line or fallback
      try {
        const builder = new wasm.BRepBuilderAPI_MakeEdge(p1, p2)
        if (builder.isDone()) {
          const edge = builder.edge()
          if (edgeEntity.sense === 'reversed') edge.reverse()
          return edge
        }
      } catch (e) {}
    }

    // No valid endpoints - try curve only
    const curve = convertACISCurve(wasm, curveEntity, startVertex, endVertex)
    if (curve) {
      try {
        const h = new wasm.Handle_Geom_Curve(curve)
        const builder = new wasm.BRepBuilderAPI_MakeEdge(h)
        if (builder.isDone()) {
          const edge = builder.edge()
          if (edgeEntity.sense === 'reversed') edge.reverse()
          return edge
        }
      } catch (e) {}
    }
  } catch (e) {
    console.warn('Failed to convert edge:', e.message)
  }
  return null
}

function convertACISLoop(wasm, loopEntity) {
  if (!loopEntity) return null
  try {
    const coedges = loopEntity.getCoedges ? loopEntity.getCoedges() : []
    if (coedges.length === 0) return null

    const wireBuilder = new wasm.BRepBuilderAPI_MakeWire()
    let edgesAdded = 0

    for (const coedge of coedges) {
      const edgeEntity = coedge.getEdge ? coedge.getEdge() : null
      const edge = convertACISEdge(wasm, edgeEntity)
      if (edge) {
        if (coedge.sense === 'reversed') edge.reverse()
        try {
          wireBuilder.add(edge)
          edgesAdded++
        } catch (e) { /* edge might not connect */ }
      }
    }

    if (edgesAdded === 0) return null
    if (wireBuilder.isDone()) return wireBuilder.wire()
    try {
      const wire = wireBuilder.wire()
      if (wire && !wire.isNull()) return wire
    } catch (e) {}
  } catch (e) {
    console.warn('Failed to convert loop:', e.message)
  }
  return null
}

/**
 * Collect all edge endpoint coordinates from a face's loops
 */
function collectFaceEndpoints(faceEntity) {
  const points = []
  const loops = faceEntity.getLoops ? faceEntity.getLoops() : []
  for (const loop of loops) {
    const coedges = loop.getCoedges ? loop.getCoedges() : []
    for (const coedge of coedges) {
      const edge = coedge.getEdge ? coedge.getEdge() : null
      if (!edge) continue
      const sp = edge.getStart ? edge.getStart() : null
      const ep = edge.getEnd ? edge.getEnd() : null
      const sv = sp && sp.point ? sp.point : sp
      const ev = ep && ep.point ? ep.point : ep
      if (sv && isFinite(sv.x) && isFinite(sv.y) && isFinite(sv.z)) points.push(sv)
      if (ev && isFinite(ev.x) && isFinite(ev.y) && isFinite(ev.z)) points.push(ev)
    }
  }
  return points
}

/**
 * Compute UV bounds for a cylinder/cone surface from edge endpoints.
 * Projects 3D points into the surface's parametric (u,v) space.
 *
 * OCC cylinder S(u,v) = Center + R*cos(u)*XDir + R*sin(u)*YDir + v*Axis
 * OCC cone    S(u,v) = Center + (R + v*sin(α))*(cos(u)*XDir + sin(u)*YDir) + v*cos(α)*Axis
 */
function computeCylinderConeUVBounds(surfaceEntity, points) {
  if (points.length < 2) return null

  const center = surfaceEntity.center
  const axisRaw = surfaceEntity.axis
  if (!center || !axisRaw) return null

  // Normalize axis
  const aLen = Math.sqrt(axisRaw.x ** 2 + axisRaw.y ** 2 + axisRaw.z ** 2)
  if (aLen < 1e-10) return null
  const axis = { x: axisRaw.x / aLen, y: axisRaw.y / aLen, z: axisRaw.z / aLen }

  // Compute XDir from the major vector (reference direction of gp_Ax3)
  const majorRaw = surfaceEntity.major || { x: 1, y: 0, z: 0 }
  let xDir
  if (typeof majorRaw === 'object' && majorRaw.x !== undefined) {
    const mLen = Math.sqrt(majorRaw.x ** 2 + majorRaw.y ** 2 + majorRaw.z ** 2)
    if (mLen < 1e-10) return null
    // Project major onto plane perpendicular to axis (gp_Ax3 does this internally)
    const dot = (majorRaw.x * axis.x + majorRaw.y * axis.y + majorRaw.z * axis.z) / mLen
    let xRaw = { x: majorRaw.x / mLen - dot * axis.x, y: majorRaw.y / mLen - dot * axis.y, z: majorRaw.z / mLen - dot * axis.z }
    const xLen = Math.sqrt(xRaw.x ** 2 + xRaw.y ** 2 + xRaw.z ** 2)
    if (xLen < 1e-10) return null
    xDir = { x: xRaw.x / xLen, y: xRaw.y / xLen, z: xRaw.z / xLen }
  } else {
    return null
  }

  // YDir = Axis × XDir
  const yDir = {
    x: axis.y * xDir.z - axis.z * xDir.y,
    y: axis.z * xDir.x - axis.x * xDir.z,
    z: axis.x * xDir.y - axis.y * xDir.x
  }

  const sine = surfaceEntity.sine || 0
  const cosine = surfaceEntity.cosine || 1
  const semiAngle = Math.atan2(Math.abs(sine), Math.abs(cosine))
  const isCylinder = Math.abs(sine) < 1e-6

  // Project each point
  const angles = []
  const vParams = []

  for (const p of points) {
    const dx = p.x - center.x
    const dy = p.y - center.y
    const dz = p.z - center.z

    // Height along axis
    const vAxis = dx * axis.x + dy * axis.y + dz * axis.z

    // v parameter: for cylinder v = vAxis, for cone v = vAxis / cos(α)
    const v = isCylinder ? vAxis : (Math.abs(Math.cos(semiAngle)) > 1e-10 ? vAxis / Math.cos(semiAngle) : vAxis)
    vParams.push(v)

    // Projection onto base plane
    const px = dx * xDir.x + dy * xDir.y + dz * xDir.z
    const py = dx * yDir.x + dy * yDir.y + dz * yDir.z
    const u = Math.atan2(py, px)
    angles.push(u)
  }

  if (angles.length === 0) return null

  // Compute V bounds (simple min/max)
  const vMin = Math.min(...vParams)
  const vMax = Math.max(...vParams)
  if (vMax - vMin < 1e-10) return null

  // Compute U bounds — handle angular wrap-around
  // Sort angles, find the largest gap, set range to exclude that gap
  const sorted = [...angles].sort((a, b) => a - b)
  let maxGap = 0
  let gapStart = 0
  for (let i = 0; i < sorted.length - 1; i++) {
    const gap = sorted[i + 1] - sorted[i]
    if (gap > maxGap) { maxGap = gap; gapStart = i }
  }
  // Also check wrap-around gap
  const wrapGap = (2 * Math.PI) - (sorted[sorted.length - 1] - sorted[0])
  let uMin, uMax
  if (wrapGap > maxGap) {
    // Largest gap is the wrap-around → range is [sorted[0], sorted[last]]
    uMin = sorted[0]
    uMax = sorted[sorted.length - 1]
  } else {
    // Largest gap is in the middle → range wraps around
    uMin = sorted[gapStart + 1]
    uMax = sorted[gapStart] + 2 * Math.PI
  }

  // Add small padding
  const uPad = (uMax - uMin) * 0.01 || 0.01
  const vPad = (vMax - vMin) * 0.01 || 0.01

  return {
    uMin: uMin - uPad,
    uMax: uMax + uPad,
    vMin: vMin - vPad,
    vMax: vMax + vPad
  }
}

function isFaceBboxValid(wasm, face) {
  try {
    const bb = new wasm.Bnd_Box()
    wasm.BRepBndLib.add(face, bb)
    if (bb.isVoid()) return false
    const b = bb.get()
    const MAX = 1e10
    return Math.abs(b.xmin) < MAX && Math.abs(b.xmax) < MAX &&
           Math.abs(b.ymin) < MAX && Math.abs(b.ymax) < MAX &&
           Math.abs(b.zmin) < MAX && Math.abs(b.zmax) < MAX
  } catch (e) { return false }
}

/**
 * Compute UV bounds from the best available source:
 * 1. Edge endpoint projection (for cylinder/cone)
 * 2. Spline knot ranges
 * 3. Surface explicit range data
 */
function computeUVBounds(surfaceEntity, faceEntity, typeName) {
  // Source 1: Edge endpoint projection (cylinder/cone)
  if (typeName.includes('cone')) {
    const pts = collectFaceEndpoints(faceEntity)
    const bounds = computeCylinderConeUVBounds(surfaceEntity, pts)
    if (bounds) return bounds
  }

  // Source 2: Spline knot ranges
  const nubs = surfaceEntity && (surfaceEntity.spline || surfaceEntity.nubs)
  if (nubs) {
    let uMin, uMax, vMin, vMax
    if (nubs.uKnots && nubs.uKnots.length >= 2) {
      uMin = nubs.uKnots[0]; uMax = nubs.uKnots[nubs.uKnots.length - 1]
    }
    if (nubs.vKnots && nubs.vKnots.length >= 2) {
      vMin = nubs.vKnots[0]; vMax = nubs.vKnots[nubs.vKnots.length - 1]
    }
    if (uMin !== undefined && vMin !== undefined && uMax > uMin && vMax > vMin) {
      return { uMin, uMax, vMin, vMax }
    }
  }

  // Source 3: Explicit range from surface entity
  if (surfaceEntity && surfaceEntity.range) {
    const range = surfaceEntity.range
    let uMin, uMax, vMin, vMax
    if (range.uRange) { uMin = range.uRange.lower; uMax = range.uRange.upper }
    if (range.vRange) { vMin = range.vRange.lower; vMax = range.vRange.upper }
    if (uMin !== undefined && vMin !== undefined && uMax > uMin && vMax > vMin) {
      return { uMin, uMax, vMin, vMax }
    }
  }

  return null
}

function convertACISFace(wasm, faceEntity) {
  if (!faceEntity) return null
  try {
    const surfaceEntity = faceEntity.getSurface ? faceEntity.getSurface() : null
    const surface = convertACISSurface(wasm, surfaceEntity)
    if (!surface) return null

    const handleSurface = new wasm.Handle_Geom_Surface(surface)
    const loops = faceEntity.getLoops ? faceEntity.getLoops() : []

    // Compute effective sense (matches Python Acis2Step behavior):
    // - Cone: flip when cosine < 0
    // - Torus: flip when minor radius < 0
    const typeName = surfaceEntity && surfaceEntity.getType ? surfaceEntity.getType() : ''
    let shouldReverse = (faceEntity.sense === 'reversed')
    if (typeName.includes('cone') && surfaceEntity.cosine < 0) {
      shouldReverse = !shouldReverse
    } else if (typeName.includes('torus') && surfaceEntity.minor < 0) {
      shouldReverse = !shouldReverse
    }

    function applyAndReturn(result) {
      if (shouldReverse) result.reverse()
      return result
    }

    // PRIMARY: Wire-based face with full curve reconstruction
    if (loops.length > 0) {
      const outerWire = convertACISLoop(wasm, loops[0])
      if (outerWire) {
        try {
          const faceBuilder = new wasm.BRepBuilderAPI_MakeFace(handleSurface, 1e-6)
          faceBuilder.add(outerWire)
          for (let i = 1; i < loops.length; i++) {
            const innerWire = convertACISLoop(wasm, loops[i])
            if (innerWire) {
              innerWire.reverse()
              faceBuilder.add(innerWire)
            }
          }
          if (faceBuilder.isDone()) {
            const result = faceBuilder.face()
            if (isFaceBboxValid(wasm, result)) return applyAndReturn(result)
          }
        } catch (e) { /* wire-based face failed */ }
      }
    }

    // FALLBACK: UV-bounded face from best available bounds source
    const bounds = computeUVBounds(surfaceEntity, faceEntity, typeName)
    if (bounds) {
      try {
        const freshSurface = convertACISSurface(wasm, surfaceEntity)
        const freshHandle = freshSurface ? new wasm.Handle_Geom_Surface(freshSurface) : handleSurface
        const faceBuilder = new wasm.BRepBuilderAPI_MakeFace(
          freshHandle, bounds.uMin, bounds.uMax, bounds.vMin, bounds.vMax, 1e-6
        )
        if (faceBuilder.isDone()) {
          const result = faceBuilder.face()
          if (isFaceBboxValid(wasm, result)) return applyAndReturn(result)
        }
      } catch (e) { /* UV bounds face failed */ }
    }

    // LAST RESORT: Untrimmed face from surface natural bounds (skip planes)
    if (!typeName.includes('plane')) {
      try {
        const faceBuilder = new wasm.BRepBuilderAPI_MakeFace(handleSurface, 1e-6)
        if (faceBuilder.isDone()) {
          const result = faceBuilder.face()
          if (isFaceBboxValid(wasm, result)) return applyAndReturn(result)
        }
      } catch (e) {}
    }

  } catch (e) {}

  return null
}

function convertACISShell(wasm, shellEntity) {
  if (!shellEntity) return null
  try {
    const faces = shellEntity.getFaces ? shellEntity.getFaces() : []
    if (faces.length === 0) return null

    const builder = new wasm.BRep_Builder()
    const shell = builder.makeShell()

    let faceCount = 0
    for (const faceEntity of faces) {
      const face = convertACISFace(wasm, faceEntity)
      if (face) {
        try {
          const bndBox = new wasm.Bnd_Box()
          wasm.BRepBndLib.add(face, bndBox)
          if (!bndBox.isVoid()) {
            const bounds = bndBox.get()
            const MAX_EXTENT = 1e10
            if (Math.abs(bounds.xmin) < MAX_EXTENT && Math.abs(bounds.xmax) < MAX_EXTENT &&
                Math.abs(bounds.ymin) < MAX_EXTENT && Math.abs(bounds.ymax) < MAX_EXTENT &&
                Math.abs(bounds.zmin) < MAX_EXTENT && Math.abs(bounds.zmax) < MAX_EXTENT) {
              builder.add(shell, face)
              faceCount++
            }
          }
        } catch (e) { /* face add failed */ }
      }
    }
    if (faceCount > 0) return shell
  } catch (e) {
    console.warn('Failed to convert shell:', e.message)
  }
  return null
}

/**
 * Compute adaptive sewing tolerance based on shape bounding box.
 * Uses a relative tolerance of 1e-4 of the bounding box diagonal,
 * floored at baseTol (from ACIS header resabs or default 1e-6).
 */
function computeSewingTolerance(wasm, shell, options = {}) {
  let baseTol = 1e-6

  // Use ACIS header resabs if available
  const headers = options.acisHeaders || []
  if (headers.length > 0) {
    for (const h of headers) {
      if (h.resabs && h.resabs > baseTol) baseTol = h.resabs
    }
  }

  // Scale by bounding box diagonal for larger models
  try {
    const bb = new wasm.Bnd_Box()
    wasm.BRepBndLib.add(shell, bb)
    if (!bb.isVoid()) {
      const b = bb.get()
      const diag = Math.sqrt(
        (b.xmax - b.xmin) ** 2 + (b.ymax - b.ymin) ** 2 + (b.zmax - b.zmin) ** 2
      )
      // Relative tolerance: ~1e-4 of diagonal, floor at baseTol
      const scaledTol = diag * 1e-4
      baseTol = Math.max(baseTol, scaledTol)
    }
  } catch (e) { /* fallback to baseTol */ }

  // Cap at 0.1 to avoid overly aggressive sewing
  return Math.min(baseTol, 0.1)
}

/**
 * Try sewing at a given tolerance and extract solids from the result.
 * Returns { shape, hasSolids, isClosed } or null on failure.
 */
function sewAtTolerance(wasm, shell, tolerance) {
  try {
    const sewing = new wasm.BRepBuilderAPI_Sewing(tolerance, true, true, true, false)
    sewing.add(shell)
    sewing.perform(new wasm.Message_ProgressRange())
    const sewedShape = sewing.sewedShape()

    // Collect solids from sewing result
    const solids = []
    const solidExplorer = new wasm.TopExp_Explorer(
      sewedShape,
      wasm.TopAbs_ShapeEnum.TopAbs_SOLID,
      wasm.TopAbs_ShapeEnum.TopAbs_SHAPE
    )
    while (solidExplorer.more()) {
      solids.push(wasm.TopoDS.solid(solidExplorer.current()))
      solidExplorer.next()
    }

    let resultShape
    if (solids.length === 1) {
      resultShape = solids[0]
    } else if (solids.length > 1) {
      const builder = new wasm.BRep_Builder()
      const compound = builder.makeCompound()
      for (const s of solids) builder.add(compound, s)
      resultShape = compound
    } else {
      resultShape = sewedShape
    }

    // Check closure
    let isClosed = false
    try { isClosed = wasm.Shape.isClosed(resultShape) } catch (e) {}

    return { shape: resultShape, hasSolids: solids.length > 0, isClosed }
  } catch (e) {}
  return null
}

function tryMakeSolid(wasm, shell, options = {}) {
  const baseTol = computeSewingTolerance(wasm, shell, options)

  // Try sewing at computed tolerance
  let result = sewAtTolerance(wasm, shell, baseTol)

  // If not closed, retry with progressively larger tolerances
  if (result && !result.isClosed) {
    const retryTols = [baseTol * 10, baseTol * 100]
    for (const tol of retryTols) {
      if (tol > 0.1) break // cap
      const retry = sewAtTolerance(wasm, shell, tol)
      if (retry && retry.isClosed) {
        result = retry
        break
      }
      // Use retry if it found solids even if not closed
      if (retry && retry.hasSolids && !result.hasSolids) {
        result = retry
      }
    }
  }

  if (result) return result.shape

  // Fallback: direct MakeSolid
  try {
    const solidBuilder = new wasm.BRepBuilderAPI_MakeSolid(shell)
    if (solidBuilder.isDone()) return solidBuilder.solid()
  } catch (e) {}

  return shell
}

function convertACISBody(wasm, bodyEntity, options = {}) {
  if (!bodyEntity) return null
  try {
    const lumps = bodyEntity.getLumps ? bodyEntity.getLumps() : []
    const solidsAndShells = []

    for (const lump of lumps) {
      const lumpShells = lump.getShells ? lump.getShells() : []
      for (const shellEntity of lumpShells) {
        const shell = convertACISShell(wasm, shellEntity)
        if (shell) {
          solidsAndShells.push(tryMakeSolid(wasm, shell, options))
        }
      }
    }

    if (solidsAndShells.length === 0) return null
    if (solidsAndShells.length === 1) return solidsAndShells[0]

    const builder = new wasm.BRep_Builder()
    const compound = builder.makeCompound()
    for (const shape of solidsAndShells) {
      builder.add(compound, shape)
    }
    return compound
  } catch (e) {
    console.warn('Failed to convert body:', e.message)
  }
  return null
}

function hasValidBoundingBox(wasm, shape) {
  try {
    const bndBox = new wasm.Bnd_Box()
    wasm.BRepBndLib.add(shape, bndBox)
    if (bndBox.isVoid()) return false
    const b = bndBox.get()
    const MAX_EXTENT = 1e10
    return Math.abs(b.xmin) < MAX_EXTENT && Math.abs(b.xmax) < MAX_EXTENT &&
           Math.abs(b.ymin) < MAX_EXTENT && Math.abs(b.ymax) < MAX_EXTENT &&
           Math.abs(b.zmin) < MAX_EXTENT && Math.abs(b.zmax) < MAX_EXTENT
  } catch (e) {
    return false
  }
}

function convertACISBodiesToShape(wasm, bodies, options = {}) {
  if (!bodies || bodies.length === 0) return null

  const shapes = []
  let skippedBodies = 0

  for (let i = 0; i < bodies.length; i++) {
    const body = bodies[i]
    const shape = convertACISBody(wasm, body, options)
    if (shape) {
      if (hasValidBoundingBox(wasm, shape)) {
        shapes.push(shape)
      } else {
        skippedBodies++
      }
    } else {
      skippedBodies++
    }
  }

  if (shapes.length === 0) throw new Error('Failed to convert any ACIS bodies to geometry')
  if (shapes.length === 1) return shapes[0]

  const builder = new wasm.BRep_Builder()
  const compound = builder.makeCompound()
  for (const shape of shapes) {
    builder.add(compound, shape)
  }
  return compound
}

// ============================================================================
// chili-worker.js
// ============================================================================

/**
 * Web Worker Message Handler (chili-wasm backend)
 * Handles analyze and convert messages for STL/3MF/F3D to STEP/STL conversion
 * Uses chili3d's OCCT 7.9.1 WASM build
 */









/**
 * Helper to post progress messages
 */
function postProgress(message) {
  self.postMessage({ type: 'progress', message })
}

/**
 * Handle analyze message
 */
async function handleAnalyze(data) {
  const { fileData, fileName = 'input.stl' } = data

  if (!wasmInstance) {
    wasmInstance = await initChiliWasm(WORKER_BASE_PATH, self.postMessage.bind(self))
  }
  const wasm = wasmInstance

  const is3MF = fileName.toLowerCase().endsWith('.3mf')
  const isF3D = fileName.toLowerCase().endsWith('.f3d')
  let vertices = []
  let triangles = []
  let totalTriangles = 0
  let shape = null

  if (isF3D) {
    // F3D analysis - requires ACIS module
    postProgress('Parsing F3D file for analysis...')
    if (!self.ACISParser) {
      throw new Error('F3D support requires ACIS module (not loaded)')
    }

    const parseResult = await self.ACISParser.parseF3D(fileData, loadJSZip)
    // Support both old (array) and new (object) return format
    const bodies = parseResult.bodies || parseResult
    const acisHeaders = parseResult.headers || []
    postProgress(`Found ${bodies.length} ACIS bodies, converting...`)
    shape = convertACISBodiesToShape(wasm, bodies, { acisHeaders })

    // Count faces from ACIS data
    for (const body of bodies) {
      const lumps = body.getLumps ? body.getLumps() : []
      for (const lump of lumps) {
        const shells = lump.getShells ? lump.getShells() : []
        for (const shell of shells) {
          totalTriangles += (shell.getFaces ? shell.getFaces() : []).length
        }
      }
    }
  } else if (is3MF) {
    postProgress('Parsing 3MF file for analysis...')
    const meshes = await parse3MF(fileData)

    // Combine all meshes for analysis
    let vertexOffset = 0
    for (const mesh of meshes) {
      if (mesh.isStl) continue
      if (mesh.vertices && mesh.triangles) {
        for (const v of mesh.vertices) {
          vertices.push(v)
        }
        for (const tri of mesh.triangles) {
          triangles.push({
            v1: tri.v1 + vertexOffset,
            v2: tri.v2 + vertexOffset,
            v3: tri.v3 + vertexOffset
          })
        }
        vertexOffset += mesh.vertices.length
      }
    }
    totalTriangles = triangles.length

    // Convert first mesh to STL for chili-wasm analysis
    if (meshes.length > 0) {
      const firstMesh = meshes[0]
      let stlData
      if (firstMesh.isStl) {
        stlData = firstMesh.stlData
      } else {
        stlData = meshToStl(firstMesh)
      }
      shape = readStl(wasm, stlData)
    }
  } else {
    postProgress('Analyzing STL file...')
    const stlArray = new Uint8Array(fileData)
    shape = readStl(wasm, stlArray)

    // Get triangle count from binary STL header
    if (fileData.byteLength > 84) {
      const view = new DataView(fileData)
      totalTriangles = view.getUint32(80, true)
    }

    // Parse STL data for JS analysis
    const parsed = parseStlBinary(fileData)
    vertices = parsed.vertices
    triangles = parsed.triangles
  }

  // Get chili-wasm stats
  const stats = shape ? analyzeMesh(wasm, shape, totalTriangles) : {
    triangleCount: totalTriangles,
    qualityIssues: []
  }

  // Add JS-level quality checks
  if (triangles.length > 0) {
    postProgress('Running quality checks...')

    // Check for holes (boundary edges)
    const boundaryEdges = findBoundaryEdges(triangles)
    const holes = groupBoundaryEdgesIntoLoops(boundaryEdges)
    stats.holeCount = holes.length
    if (holes.length > 0) {
      stats.qualityIssues.push(`Found ${holes.length} hole(s) in mesh`)
    }

    // Check for non-manifold edges
    const nonManifoldResult = detectNonManifolds(triangles)
    stats.nonManifoldEdgeCount = nonManifoldResult.count
    if (nonManifoldResult.hasNonManifolds) {
      stats.qualityIssues.push(`Found ${nonManifoldResult.count} non-manifold edge(s)`)
    }

    // Check for self-intersections (only on smaller meshes)
    const selfIntersectResult = detectSelfIntersections(vertices, triangles, true)
    if (selfIntersectResult.skipped) {
      stats.selfIntersections = 'skipped (large mesh)'
    } else {
      stats.selfIntersectionCount = selfIntersectResult.count
      if (selfIntersectResult.hasIntersections) {
        stats.qualityIssues.push(`Found ${selfIntersectResult.count} self-intersecting triangle pair(s)`)
      }
    }

    stats.jsAnalyzed = true
    stats.analyzedTriangles = triangles.length
    stats.analyzedVertices = vertices.length
  }

  // Clean up shape
  if (shape) {
    try { shape.delete() } catch (e) {}
  }

  self.postMessage({ type: 'analysis', data: stats })
}

/**
 * Handle convert message
 */
async function handleConvert(data) {
  const {
    fileData,
    fileName,
    outputFormat = 'step',
    tolerance = 0.1,
    repair = true,
    mergeFaces: mergeFacesOpt = true,
    skipMerge = false
  } = data

  if (!wasmInstance) {
    wasmInstance = await initChiliWasm(WORKER_BASE_PATH, self.postMessage.bind(self))
  }
  const wasm = wasmInstance

  const is3MF = fileName.toLowerCase().endsWith('.3mf')
  const isF3D = fileName.toLowerCase().endsWith('.f3d')
  let shapes = []
  let beforeStats = null
  let totalTriangles = 0
  let allRepairs = []

  if (isF3D) {
    // F3D conversion - parse ACIS bodies and convert to OCC shapes
    postProgress('Parsing F3D file...')
    if (!self.ACISParser) {
      throw new Error('F3D support requires ACIS module (not loaded)')
    }

    const parseResult = await self.ACISParser.parseF3D(fileData, loadJSZip)
    // Support both old (array) and new (object) return format
    const bodies = parseResult.bodies || parseResult
    const acisHeaders = parseResult.headers || []
    postProgress(`Found ${bodies.length} ACIS bodies, converting geometry...`)

    // Count total ACIS faces
    for (const body of bodies) {
      const lumps = body.getLumps ? body.getLumps() : []
      for (const lump of lumps) {
        const shells = lump.getShells ? lump.getShells() : []
        for (const shell of shells) {
          totalTriangles += (shell.getFaces ? shell.getFaces() : []).length
        }
      }
    }

    const shape = convertACISBodiesToShape(wasm, bodies, { acisHeaders })
    if (!shape) throw new Error('Failed to convert ACIS geometry')

    // Analyze BEFORE processing
    postProgress('Analyzing input geometry...')
    beforeStats = analyzeMesh(wasm, shape, totalTriangles)
    self.postMessage({ type: 'beforeStats', data: beforeStats })

    // F3D shapes are already B-rep with per-shell solids from tryMakeSolid.
    // Skip both global solid re-creation (destroys per-body topology) and
    // simplifyShape (merges co-planar faces, destroys detail).
    const processResult = processShape(wasm, shape, {
      tolerance,
      repair,
      mergeFacesOpt,
      skipMerge: true,
      skipSolidCreation: true,
      faceCount: beforeStats.faceCount || totalTriangles
    }, self.postMessage.bind(self))
    shapes.push(processResult.shape)
    allRepairs.push(...processResult.repairs)
  } else if (is3MF) {
    // Parse 3MF file
    postProgress('Parsing 3MF file...')
    const meshes = await parse3MF(fileData)
    postProgress(`Found ${meshes.length} mesh(es) in 3MF`)

    // Calculate total triangles
    for (const mesh of meshes) {
      if (mesh.triangles) {
        totalTriangles += mesh.triangles.length
      }
    }

    for (let i = 0; i < meshes.length; i++) {
      let mesh = meshes[i]
      postProgress(`Processing mesh ${i + 1}/${meshes.length}...`)

      let stlData
      if (mesh.isStl) {
        stlData = mesh.stlData
      } else {
        // Apply JavaScript-level mesh repairs before converting to STL
        if (repair && mesh.vertices && mesh.triangles) {
          postProgress(`Repairing mesh data ${i + 1}/${meshes.length}...`)
          const repaired = repairMeshData(mesh.vertices, mesh.triangles, tolerance)
          mesh = { vertices: repaired.vertices, triangles: repaired.triangles }
          allRepairs.push(...repaired.repairs.map(r => `Mesh ${i + 1}: ${r}`))
        }
        stlData = meshToStl(mesh)
      }

      const shape = readStl(wasm, stlData)

      // Get before stats from first mesh
      if (i === 0 && !beforeStats) {
        beforeStats = analyzeMesh(wasm, shape, totalTriangles)
        if (meshes.length > 1) {
          beforeStats.triangleCount = totalTriangles
          beforeStats.note = `Combined from ${meshes.length} meshes`
        }
        self.postMessage({ type: 'beforeStats', data: beforeStats })
      }

      const faceCount = mesh.triangles ? mesh.triangles.length : totalTriangles
      const processResult = processShape(wasm, shape, {
        tolerance,
        repair,
        mergeFacesOpt,
        skipMerge,
        faceCount
      }, self.postMessage.bind(self))
      shapes.push(processResult.shape)
      allRepairs.push(...processResult.repairs.map(r => meshes.length > 1 ? `Mesh ${i + 1}: ${r}` : r))
    }
  } else {
    // STL file
    postProgress('Reading STL file...')
    const stlArray = new Uint8Array(fileData)

    // Get triangle count from binary STL header
    if (fileData.byteLength > 84) {
      const view = new DataView(fileData)
      totalTriangles = view.getUint32(80, true)
    }

    const shape = readStl(wasm, stlArray)

    // Analyze mesh BEFORE processing
    postProgress('Analyzing input mesh...')
    beforeStats = analyzeMesh(wasm, shape, totalTriangles)
    self.postMessage({ type: 'beforeStats', data: beforeStats })

    const processResult = processShape(wasm, shape, {
      tolerance,
      repair,
      mergeFacesOpt,
      skipMerge,
      faceCount: beforeStats.faceCount || totalTriangles
    }, self.postMessage.bind(self))
    shapes.push(processResult.shape)
    allRepairs.push(...processResult.repairs)
  }

  // Send repair log
  if (allRepairs.length > 0) {
    self.postMessage({ type: 'repairLog', data: allRepairs })
  }

  // Combine multiple shapes if needed
  let finalShape
  if (shapes.length === 1) {
    finalShape = shapes[0]
  } else {
    postProgress('Combining meshes...')
    const combined = wasm.ShapeFactory.combine(shapes)
    if (combined.isOk) {
      finalShape = wasm.Shape.clone(combined.shape)
    } else {
      // Fallback: just use first shape
      console.warn('Shape combination failed:', combined.error)
      finalShape = shapes[0]
    }
    combined.delete()
  }

  // Analyze mesh AFTER processing
  postProgress('Analyzing output mesh...')
  const afterStats = analyzeMesh(wasm, finalShape, totalTriangles)
  self.postMessage({ type: 'afterStats', data: afterStats })

  // Tessellate for 3D preview
  postProgress('Generating 3D preview...')
  const meshData = tessellateShape(wasm, finalShape)
  if (meshData) {
    self.postMessage(
      { type: 'outputMesh', data: meshData },
      [meshData.positions.buffer, meshData.normals.buffer, meshData.indices.buffer]
    )
  }

  // Write output
  let actualFormat = outputFormat
  postProgress(`Writing ${actualFormat.toUpperCase()} file...`)

  let outputData
  try {
    outputData = writeOutput(wasm, finalShape, actualFormat)
  } catch (writeError) {
    console.warn('Primary export failed:', writeError.message)

    // If STEP export failed, try IGES as fallback
    if (actualFormat === 'step') {
      try {
        postProgress('STEP export failed, trying IGES...')
        actualFormat = 'iges'
        outputData = writeOutput(wasm, finalShape, 'iges')
        allRepairs.push('STEP export failed, exported as IGES instead')
      } catch (igesError) {
        console.warn('IGES fallback also failed:', igesError.message)
        throw writeError
      }
    } else {
      throw writeError
    }
  }

  console.log('Sending complete message with', outputData.length, 'bytes')
  self.postMessage({
    type: 'complete',
    data: outputData,
    format: actualFormat,
    beforeStats,
    afterStats,
    repairs: allRepairs
  })
}

/**
 * Main message handler
 */
self.onmessage = async function(e) {
  const { type, data } = e.data

  try {
    if (type === 'analyze') {
      await handleAnalyze(data)
    } else if (type === 'convert') {
      await handleConvert(data)
    }
  } catch (error) {
    console.error(`${type} error:`, error)
    self.postMessage({
      type: 'error',
      message: error instanceof Error ? error.message : String(error)
    })
  }
}
