/**
 * Web Worker for OpenCascade.js v2 STL/3MF to STEP/STL conversion
 * Features: mesh repair, face merging, multi-mesh support, tolerance control,
 *           large mesh optimization, JavaScript mesh repairs, fallback strategies
 */

let ocInstance = null

// Thresholds for large mesh optimization
const LARGE_MESH_THRESHOLD = 50000      // Skip expensive operations above this
const VERY_LARGE_MESH_THRESHOLD = 100000 // Skip face merging above this

async function initOpenCascade() {
  self.postMessage({ type: 'progress', message: 'Fetching OpenCascade.js...' })

  const response = await fetch('/opencascade/opencascade.full.js')
  let scriptText = await response.text()

  // Remove ES module export statements
  scriptText = scriptText.replace(/export\s*\{[^}]*\}\s*;?\s*$/m, '')
  scriptText = scriptText.replace(/export\s+default\s+\w+\s*;?\s*$/m, '')

  self.postMessage({ type: 'progress', message: 'Parsing OpenCascade.js...' })

  eval(scriptText)

  self.postMessage({ type: 'progress', message: 'Initializing WASM (~50MB)...' })

  return await Module({
    locateFile: (file) => `/opencascade/${file}`
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

  // 4. Harmonize normals using edge consistency
  // Build edge-to-triangle adjacency to detect inconsistent winding
  const edgeMap = new Map()

  const edgeKey = (a, b) => a < b ? `${a}-${b}` : `${b}-${a}`
  const orderedEdgeKey = (a, b) => `${a}-${b}` // preserves winding

  for (let i = 0; i < uniqueTriangles.length; i++) {
    const tri = uniqueTriangles[i]
    const edges = [
      [tri.v1, tri.v2],
      [tri.v2, tri.v3],
      [tri.v3, tri.v1]
    ]

    for (const [a, b] of edges) {
      const key = edgeKey(a, b)
      if (!edgeMap.has(key)) {
        edgeMap.set(key, [])
      }
      edgeMap.get(key).push({ triIndex: i, orderedKey: orderedEdgeKey(a, b) })
    }
  }

  // Check edge consistency - adjacent triangles should have opposite winding
  let inconsistentEdges = 0
  for (const [, tris] of edgeMap) {
    if (tris.length === 2) {
      // If both triangles have same ordered edge, one needs flipping
      if (tris[0].orderedKey === tris[1].orderedKey) {
        inconsistentEdges++
      }
    }
  }

  if (inconsistentEdges > 0) {
    repairs.push(`Found ${inconsistentEdges} inconsistent edges (may indicate flipped normals)`)
  }

  return {
    vertices: newVertices,
    triangles: uniqueTriangles,
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
 */
function processShape(oc, shape, options = {}) {
  const {
    tolerance = 0.1,
    repair = true,
    mergeFacesOpt = true,
    faceCount = 0
  } = options

  const repairs = []
  let processedShape = shape

  // Check for large mesh optimizations
  const skipExpensive = faceCount > LARGE_MESH_THRESHOLD
  const skipMerge = faceCount > VERY_LARGE_MESH_THRESHOLD

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
    const sewingTolerance = skipExpensive ? tolerance * 2 : tolerance
    const sewing = new oc.BRepBuilderAPI_Sewing(sewingTolerance, true, true, true, false)
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

  // Merge faces (skip for very large meshes)
  if (mergeFacesOpt && !skipMerge) {
    const mergeResult = mergeFacesWithFallback(oc, solidShape, tolerance, repairs)
    solidShape = mergeResult.shape
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
    // Mesh analysis only
    try {
      if (!ocInstance) {
        ocInstance = await initOpenCascade()
      }
      const oc = ocInstance

      const stlArray = new Uint8Array(data.fileData)
      oc.FS.writeFile('/input.stl', stlArray)

      const shape = readStl(oc, '/input.stl')
      const stats = analyzeMesh(oc, shape)

      oc.FS.unlink('/input.stl')

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
        mergeFaces: mergeFacesOpt = true
      } = data

      if (!ocInstance) {
        ocInstance = await initOpenCascade()
      }
      const oc = ocInstance

      const is3MF = fileName.toLowerCase().endsWith('.3mf')
      let shapes = []
      let beforeStats = null
      let totalTriangles = 0
      let allRepairs = []

      if (is3MF) {
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
