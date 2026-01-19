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
export function edgeKey(a, b) {
  return a < b ? `${a}-${b}` : `${b}-${a}`
}

/**
 * Build edge-to-triangle adjacency map
 * Returns Map: edgeKey -> [{ triIndex, orderedKey }]
 */
export function buildEdgeMap(triangles) {
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
export function harmonizeNormals(triangles) {
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
export function detectNonManifolds(triangles) {
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
export function removeNonManifolds(_vertices, triangles) {
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
export function findBoundaryEdges(triangles) {
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
export function groupBoundaryEdgesIntoLoops(boundaryEdges) {
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
export function cross(a, b, c, vertices) {
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
export function pointInTriangle2D(px, py, ax, ay, bx, by, cx, cy) {
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
export function isEar(vertices, polygon, prevIdx, currIdx, nextIdx) {
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
export function triangulateHole(vertices, holeVertices) {
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
export function fillHoles(vertices, triangles, maxHoleSize = 1000) {
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
