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
export function computeOptimalCellSize(vertices, triangles) {
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
export function getTriangleCells(vertices, tri, cellSize) {
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
export function trianglesShareVertex(t1, t2) {
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
export function rayTriangleIntersect(p0, p1, v0, v1, v2) {
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
export function trianglesIntersect(vertices, t1, t2) {
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
export function detectSelfIntersections(vertices, triangles, skipLarge = true) {
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
