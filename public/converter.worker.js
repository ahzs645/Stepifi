/**
 * Web Worker for OpenCascade.js v2 STL/3MF/F3D to STEP/STL conversion
 * Features: mesh repair, face merging, multi-mesh support, tolerance control,
 *           large mesh optimization, JavaScript mesh repairs, fallback strategies,
 *           F3D (Fusion 360) ACIS binary support
 */

// Auto-detect base path from worker's own URL (works on GitHub Pages, subdomains, etc.)
const WORKER_BASE_PATH = (() => {
  const url = self.location.href
  // Remove the worker filename to get the base directory
  return url.substring(0, url.lastIndexOf('/') + 1)
})()

// Load F3D/ACIS support modules (new bundle + geometry)
try {
  importScripts(WORKER_BASE_PATH + 'acis-bundle.js', WORKER_BASE_PATH + 'acis-geometry.js')
} catch (e) {
  // ACIS modules are optional - F3D support will be disabled
  console.log('ACIS modules not loaded (F3D support disabled):', e.message)
}

let ocInstance = null

// Thresholds for large mesh optimization
const LARGE_MESH_THRESHOLD = 50000      // Skip expensive operations above this
const VERY_LARGE_MESH_THRESHOLD = 100000 // Skip face merging above this

async function initOpenCascade() {
  self.postMessage({ type: 'progress', message: 'Fetching OpenCascade.js...' })

  const response = await fetch(WORKER_BASE_PATH + 'opencascade/opencascade.full.js')
  let scriptText = await response.text()

  // Remove ES module export statements
  scriptText = scriptText.replace(/export\s*\{[^}]*\}\s*;?\s*$/m, '')
  scriptText = scriptText.replace(/export\s+default\s+\w+\s*;?\s*$/m, '')

  self.postMessage({ type: 'progress', message: 'Parsing OpenCascade.js...' })

  eval(scriptText)

  self.postMessage({ type: 'progress', message: 'Initializing WASM (~50MB)...' })

  return await Module({
    locateFile: (file) => WORKER_BASE_PATH + 'opencascade/' + file
  })
}

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
 * Analyze mesh and return statistics
 */
function analyzeMesh(oc, shape, originalTriangleCount = 0) {
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

/**
 * Harmonize normals using BFS flood-fill algorithm
 * Starts from triangle 0 (assumed correct) and propagates consistent winding
 *
 * Two adjacent triangles sharing edge (A,B) should have opposite winding:
 * - Triangle 1: A → B (edge goes A to B)
 * - Triangle 2: B → A (edge goes B to A)
 * If both have A → B, one needs flipping.
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
      // For proper manifold: if my edge goes A→B, neighbor should have B→A
      // Same winding (both A→B or both B→A) means one needs flipping relative to the other
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
 * Möller–Trumbore triangle-triangle intersection test
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

/**
 * Ray-triangle intersection using Möller–Trumbore algorithm
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

  // Cross product d × e2
  const hx = dy * e2z - dz * e2y
  const hy = dz * e2x - dx * e2z
  const hz = dx * e2y - dy * e2x

  const a = e1x * hx + e1y * hy + e1z * hz
  if (a > -EPSILON && a < EPSILON) return false // Ray parallel to triangle

  const f = 1.0 / a
  const sx = p0.x - v0.x, sy = p0.y - v0.y, sz = p0.z - v0.z
  const u = f * (sx * hx + sy * hy + sz * hz)
  if (u < 0.0 || u > 1.0) return false

  // Cross product s × e1
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

/**
 * Perform mesh repair operations using OpenCascade ShapeFix
 * Note: OpenCascade.js doesn't expose low-level mesh operations like
 * removeDuplicates, fixSelfIntersections, fillHoles - these are handled
 * by ShapeFix_Shape or at the JavaScript level via repairMeshData()
 */
function repairMesh(oc, shape, options = {}) {
  const { harmonizeNormals = true } = options

  let repairedShape = shape
  const repairs = []

  try {
    // Use ShapeFix_Shape for general repairs
    self.postMessage({ type: 'progress', message: 'Repairing mesh...' })

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
function mergeFacesWithFallback(oc, shape, tolerance = 0.1, repairs = []) {
  // Strategy 1: Full unification with edge unification
  try {
    self.postMessage({ type: 'progress', message: 'Merging faces (strategy 1: full)...' })
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
    self.postMessage({ type: 'progress', message: 'Merging faces (strategy 2: faces only)...' })
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
    self.postMessage({ type: 'progress', message: 'Merging faces (strategy 3: relaxed)...' })
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
function mergeFaces(oc, shape, tolerance = 0.1) {
  const result = mergeFacesWithFallback(oc, shape, tolerance, [])
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
function processShape(oc, shape, options = {}) {
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
    self.postMessage({
      type: 'progress',
      message: `Large mesh detected (${faceCount.toLocaleString()} faces), optimizing operations...`
    })
    repairs.push(`Large mesh optimization enabled (>${LARGE_MESH_THRESHOLD.toLocaleString()} faces)`)
  }

  // Sewing
  self.postMessage({ type: 'progress', message: 'Sewing faces...' })
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
    const repairResult = repairMesh(oc, processedShape, options)
    processedShape = repairResult.shape
    repairs.push(...repairResult.repairs)
  } else if (repair && skipExpensive) {
    // Simplified repair for large meshes
    self.postMessage({ type: 'progress', message: 'Applying basic repairs (large mesh mode)...' })
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
  self.postMessage({ type: 'progress', message: 'Creating solid...' })
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
        self.postMessage({ type: 'progress', message: 'Solid created successfully' })
      }
    }
  } catch (e) {
    console.log('Solid creation failed, using shell:', e.message)
    repairs.push('Solid creation skipped (using shell)')
  }

  // Merge faces (skip for very large meshes or if explicitly skipped)
  if (mergeFacesOpt && !skipMerge) {
    const mergeResult = mergeFacesWithFallback(oc, solidShape, mergeTolerance, repairs)
    solidShape = mergeResult.shape
  } else if (forceSkipMerge) {
    repairs.push('Face merging skipped (user option)')
  } else if (mergeFacesOpt && skipMerge) {
    self.postMessage({
      type: 'progress',
      message: `Skipping face merge (>${VERY_LARGE_MESH_THRESHOLD.toLocaleString()} faces)`
    })
    repairs.push(`Face merging skipped (>${VERY_LARGE_MESH_THRESHOLD.toLocaleString()} faces)`)
  }

  return { shape: solidShape, repairs }
}

/**
 * Read STL file into shape
 */
function readStl(oc, filePath) {
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

/**
 * Write output file (STEP or STL)
 */
function writeOutput(oc, shape, format, filePath) {
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
    // STEP format
    const writer = new oc.STEPControl_Writer_1()

    writer.Transfer(
      shape,
      oc.STEPControl_StepModelType.STEPControl_AsIs,
      true,
      new oc.Message_ProgressRange_1()
    )

    const writeStatus = writer.Write(filePath)
    if (writeStatus !== oc.IFSelect_ReturnStatus.IFSelect_RetDone) {
      throw new Error('Failed to write STEP file')
    }
  }
}

self.onmessage = async function(e) {
  const { type, data } = e.data

  if (type === 'analyze') {
    // Enhanced mesh analysis with JS-level quality checks
    try {
      const { fileData, fileName = 'input.stl' } = data

      if (!ocInstance) {
        ocInstance = await initOpenCascade()
      }
      const oc = ocInstance

      const is3MF = fileName.toLowerCase().endsWith('.3mf')
      const isF3D = fileName.toLowerCase().endsWith('.f3d')
      let vertices = []
      let triangles = []
      let totalTriangles = 0
      let shape = null

      if (isF3D) {
        // Analyze F3D file
        self.postMessage({ type: 'progress', message: 'Parsing F3D file for analysis...' })

        const bodies = await self.ACISParser.parseF3D(fileData, loadJSZip)
        self.postMessage({ type: 'progress', message: 'Converting F3D geometry...' })

        shape = self.ACISGeometry.convertACISBodiesToShape(oc, bodies)

        if (!shape) {
          throw new Error('Failed to convert F3D geometry for analysis')
        }
      } else if (is3MF) {
        self.postMessage({ type: 'progress', message: 'Parsing 3MF file for analysis...' })
        const meshes = await parse3MF(fileData)

        // Combine all meshes for analysis
        let vertexOffset = 0
        for (const mesh of meshes) {
          if (mesh.isStl) {
            // For embedded STL, we'd need to parse it - for now skip JS analysis
            continue
          }
          if (mesh.vertices && mesh.triangles) {
            // Add vertices
            for (const v of mesh.vertices) {
              vertices.push(v)
            }
            // Add triangles with offset indices
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

        // Convert first mesh to STL for OC analysis
        if (meshes.length > 0) {
          const firstMesh = meshes[0]
          let stlData
          if (firstMesh.isStl) {
            stlData = firstMesh.stlData
          } else {
            stlData = meshToStl(firstMesh)
          }
          oc.FS.writeFile('/input.stl', stlData)
          shape = readStl(oc, '/input.stl')
        }
      } else {
        self.postMessage({ type: 'progress', message: 'Analyzing STL file...' })
        const stlArray = new Uint8Array(fileData)
        oc.FS.writeFile('/input.stl', stlArray)
        shape = readStl(oc, '/input.stl')

        // Get triangle count from binary STL header
        if (fileData.byteLength > 84) {
          const view = new DataView(fileData)
          totalTriangles = view.getUint32(80, true)
        }

        // Parse STL data to get vertices and triangles for JS analysis
        // Binary STL format
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
      }

      // Get OpenCascade stats
      const stats = shape ? analyzeMesh(oc, shape, totalTriangles) : {
        triangleCount: totalTriangles,
        qualityIssues: []
      }

      // Add JS-level quality checks
      if (triangles.length > 0) {
        self.postMessage({ type: 'progress', message: 'Running quality checks...' })

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

        // Add mesh complexity info
        stats.jsAnalyzed = true
        stats.analyzedTriangles = triangles.length
        stats.analyzedVertices = vertices.length
      }

      // Cleanup
      try {
        oc.FS.unlink('/input.stl')
      } catch (e) {
        // File may not exist
      }

      self.postMessage({ type: 'analysis', data: stats })
    } catch (error) {
      self.postMessage({
        type: 'error',
        message: error instanceof Error ? error.message : String(error)
      })
    }
  }

  if (type === 'convert') {
    try {
      const {
        fileData,
        fileName,
        outputFormat = 'step',
        tolerance = 0.1,
        repair = true,
        mergeFaces: mergeFacesOpt = true,
        skipMerge = false
      } = data

      if (!ocInstance) {
        ocInstance = await initOpenCascade()
      }
      const oc = ocInstance

      const is3MF = fileName.toLowerCase().endsWith('.3mf')
      const isF3D = fileName.toLowerCase().endsWith('.f3d')
      let shapes = []
      let beforeStats = null
      let totalTriangles = 0
      let allRepairs = []

      if (isF3D) {
        // Parse F3D file (Fusion 360 ACIS format)
        self.postMessage({ type: 'progress', message: 'Parsing F3D file...' })

        // Use ACISParser from imported module
        const bodies = await self.ACISParser.parseF3D(fileData, loadJSZip)

        self.postMessage({ type: 'progress', message: `Found ${bodies.length} body/bodies in F3D` })

        // Convert ACIS bodies to OpenCascade shapes
        self.postMessage({ type: 'progress', message: 'Converting ACIS geometry to OpenCascade...' })

        const shape = self.ACISGeometry.convertACISBodiesToShape(oc, bodies)

        if (!shape) {
          throw new Error('Failed to convert F3D geometry')
        }

        // Get before stats
        beforeStats = analyzeMesh(oc, shape, 0)
        beforeStats.note = 'F3D B-rep geometry'
        self.postMessage({ type: 'beforeStats', data: beforeStats })

        // Process the shape (sewing, repair, merge faces)
        const processResult = processShape(oc, shape, {
          tolerance,
          repair,
          mergeFacesOpt,
          skipMerge,
          faceCount: beforeStats.faceCount || 0
        })
        shapes.push(processResult.shape)
        allRepairs.push(...processResult.repairs)

      } else if (is3MF) {
        // Parse 3MF file
        self.postMessage({ type: 'progress', message: 'Parsing 3MF file...' })
        const meshes = await parse3MF(fileData)

        self.postMessage({ type: 'progress', message: `Found ${meshes.length} mesh(es) in 3MF` })

        // Calculate total triangles for 3MF before stats
        for (const mesh of meshes) {
          if (mesh.triangles) {
            totalTriangles += mesh.triangles.length
          }
        }

        for (let i = 0; i < meshes.length; i++) {
          let mesh = meshes[i]
          self.postMessage({ type: 'progress', message: `Processing mesh ${i + 1}/${meshes.length}...` })

          let stlData
          if (mesh.isStl) {
            stlData = mesh.stlData
          } else {
            // Apply JavaScript-level mesh repairs before converting to STL
            if (repair && mesh.vertices && mesh.triangles) {
              self.postMessage({ type: 'progress', message: `Repairing mesh data ${i + 1}/${meshes.length}...` })
              const repaired = repairMeshData(mesh.vertices, mesh.triangles, tolerance)
              mesh = { vertices: repaired.vertices, triangles: repaired.triangles }
              allRepairs.push(...repaired.repairs.map(r => `Mesh ${i + 1}: ${r}`))
            }
            stlData = meshToStl(mesh)
          }

          const inputPath = `/input_${i}.stl`
          oc.FS.writeFile(inputPath, stlData)

          const shape = readStl(oc, inputPath)

          // Get before stats from first mesh for 3MF
          if (i === 0 && !beforeStats) {
            beforeStats = analyzeMesh(oc, shape, totalTriangles)
            // For 3MF, estimate total faces from all meshes
            if (meshes.length > 1) {
              beforeStats.triangleCount = totalTriangles
              beforeStats.note = `Combined from ${meshes.length} meshes`
            }
            self.postMessage({ type: 'beforeStats', data: beforeStats })
          }

          const faceCount = mesh.triangles ? mesh.triangles.length : totalTriangles
          const processResult = processShape(oc, shape, {
            tolerance,
            repair,
            mergeFacesOpt,
            skipMerge,
            faceCount
          })
          shapes.push(processResult.shape)
          allRepairs.push(...processResult.repairs.map(r => meshes.length > 1 ? `Mesh ${i + 1}: ${r}` : r))

          oc.FS.unlink(inputPath)
        }
      } else {
        // STL file - get triangle count from binary header
        self.postMessage({ type: 'progress', message: 'Writing STL to filesystem...' })
        const stlArray = new Uint8Array(fileData)

        // Try to get triangle count from binary STL header
        if (fileData.byteLength > 84) {
          const view = new DataView(fileData)
          totalTriangles = view.getUint32(80, true)
        }

        oc.FS.writeFile('/input.stl', stlArray)

        self.postMessage({ type: 'progress', message: 'Reading STL file...' })
        const shape = readStl(oc, '/input.stl')

        // Analyze mesh BEFORE processing
        self.postMessage({ type: 'progress', message: 'Analyzing input mesh...' })
        beforeStats = analyzeMesh(oc, shape, totalTriangles)
        self.postMessage({ type: 'beforeStats', data: beforeStats })

        const processResult = processShape(oc, shape, {
          tolerance,
          repair,
          mergeFacesOpt,
          skipMerge,
          faceCount: beforeStats.faceCount || totalTriangles
        })
        shapes.push(processResult.shape)
        allRepairs.push(...processResult.repairs)

        oc.FS.unlink('/input.stl')
      }

      // Send repair log
      if (allRepairs.length > 0) {
        self.postMessage({ type: 'repairLog', data: allRepairs })
      }

      // Combine multiple shapes into compound if needed
      let finalShape
      if (shapes.length === 1) {
        finalShape = shapes[0]
      } else {
        self.postMessage({ type: 'progress', message: 'Combining meshes...' })
        const builder = new oc.BRep_Builder()
        const compound = new oc.TopoDS_Compound()
        builder.MakeCompound(compound)

        for (const shape of shapes) {
          builder.Add(compound, shape)
        }

        finalShape = compound
      }

      // Analyze mesh AFTER processing
      self.postMessage({ type: 'progress', message: 'Analyzing output mesh...' })
      const afterStats = analyzeMesh(oc, finalShape, totalTriangles)
      self.postMessage({ type: 'afterStats', data: afterStats })

      // Write output
      const ext = outputFormat === 'stl' ? 'stl' : 'step'
      const outputPath = `/output.${ext}`

      self.postMessage({ type: 'progress', message: `Writing ${outputFormat.toUpperCase()} file...` })
      writeOutput(oc, finalShape, outputFormat, outputPath)

      self.postMessage({ type: 'progress', message: 'Reading output...' })
      const outputData = oc.FS.readFile(outputPath)

      oc.FS.unlink(outputPath)

      self.postMessage({
        type: 'complete',
        data: outputData,
        format: outputFormat,
        beforeStats,
        afterStats,
        repairs: allRepairs
      })
    } catch (error) {
      self.postMessage({
        type: 'error',
        message: error instanceof Error ? error.message : String(error)
      })
    }
  }
}
