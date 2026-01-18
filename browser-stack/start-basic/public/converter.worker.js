/**
 * Web Worker for OpenCascade.js v2 STL/3MF to STEP/STL conversion
 * Features: mesh repair, face merging, multi-mesh support, tolerance control
 */

let ocInstance = null

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

  // Also check for external object files (BambuStudio format)
  const objectFiles = files.filter(f =>
    f.toLowerCase().endsWith('.stl') || f.match(/Metadata\/.*\.stl/i)
  )

  for (const objFile of objectFiles) {
    const stlData = await zip.file(objFile).async('arraybuffer')
    meshes.push({ stlData: new Uint8Array(stlData), isStl: true })
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
function analyzeMesh(oc, shape) {
  const stats = {
    triangleCount: 0,
    vertexCount: 0,
    boundingBox: null,
    volume: 0,
    surfaceArea: 0
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

    // Count faces and get surface area
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

    // Try to get volume and surface area using GProp
    try {
      const props = new oc.GProp_GProps_1()
      oc.BRepGProp.SurfaceProperties_1(shape, props, false, false)
      stats.surfaceArea = props.Mass()

      const volProps = new oc.GProp_GProps_1()
      oc.BRepGProp.VolumeProperties_1(shape, volProps, false, false)
      stats.volume = volProps.Mass()
    } catch (e) {
      // Properties calculation failed
    }
  } catch (e) {
    console.error('Mesh analysis error:', e)
  }

  return stats
}

/**
 * Perform mesh repair operations
 */
function repairMesh(oc, shape, options = {}) {
  const {
    removeDuplicates = true,
    fixSelfIntersections = true,
    fillHoles = true,
    harmonizeNormals = true
  } = options

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
 * Merge coplanar faces using ShapeUpgrade_UnifySameDomain
 */
function mergeFaces(oc, shape, tolerance = 0.1) {
  try {
    self.postMessage({ type: 'progress', message: 'Merging coplanar faces...' })

    // Try ShapeUpgrade_UnifySameDomain
    const unify = new oc.ShapeUpgrade_UnifySameDomain_2(shape, true, true, false)
    unify.SetAngularTolerance(0.01) // Angular tolerance in radians
    unify.SetLinearTolerance(tolerance)
    unify.Build()

    const result = unify.Shape()
    if (result && !result.IsNull()) {
      return result
    }
  } catch (e) {
    console.log('Face merging failed:', e.message)
  }

  return shape
}

/**
 * Process a single mesh/shape and create solid
 */
function processShape(oc, shape, options = {}) {
  const { tolerance = 0.1, repair = true, mergeFacesOpt = true } = options

  let processedShape = shape

  // Sewing
  self.postMessage({ type: 'progress', message: 'Sewing faces...' })
  try {
    const sewing = new oc.BRepBuilderAPI_Sewing(tolerance, true, true, true, false)
    sewing.Add(processedShape)
    sewing.Perform(new oc.Message_ProgressRange_1())
    processedShape = sewing.SewedShape()
  } catch (e) {
    console.log('Sewing failed:', e.message)
  }

  // Repair
  if (repair) {
    const repairResult = repairMesh(oc, processedShape, options)
    processedShape = repairResult.shape
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
        self.postMessage({ type: 'progress', message: 'Solid created successfully' })
      }
    }
  } catch (e) {
    console.log('Solid creation failed, using shell:', e.message)
  }

  // Merge faces
  if (mergeFacesOpt) {
    solidShape = mergeFaces(oc, solidShape, tolerance)
  }

  return solidShape
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
          const mesh = meshes[i]
          self.postMessage({ type: 'progress', message: `Processing mesh ${i + 1}/${meshes.length}...` })

          let stlData
          if (mesh.isStl) {
            stlData = mesh.stlData
          } else {
            stlData = meshToStl(mesh)
          }

          const inputPath = `/input_${i}.stl`
          oc.FS.writeFile(inputPath, stlData)

          const shape = readStl(oc, inputPath)

          // Get before stats from first mesh for 3MF
          if (i === 0 && !beforeStats) {
            beforeStats = analyzeMesh(oc, shape)
            // For 3MF, estimate total faces from all meshes
            if (meshes.length > 1) {
              beforeStats.faceCount = totalTriangles
              beforeStats.note = `Combined from ${meshes.length} meshes`
            }
            self.postMessage({ type: 'beforeStats', data: beforeStats })
          }

          const processedShape = processShape(oc, shape, { tolerance, repair, mergeFacesOpt })
          shapes.push(processedShape)

          oc.FS.unlink(inputPath)
        }
      } else {
        // STL file
        self.postMessage({ type: 'progress', message: 'Writing STL to filesystem...' })
        const stlArray = new Uint8Array(fileData)
        oc.FS.writeFile('/input.stl', stlArray)

        self.postMessage({ type: 'progress', message: 'Reading STL file...' })
        const shape = readStl(oc, '/input.stl')

        // Analyze mesh BEFORE processing
        self.postMessage({ type: 'progress', message: 'Analyzing input mesh...' })
        beforeStats = analyzeMesh(oc, shape)
        self.postMessage({ type: 'beforeStats', data: beforeStats })

        const processedShape = processShape(oc, shape, { tolerance, repair, mergeFacesOpt })
        shapes.push(processedShape)

        oc.FS.unlink('/input.stl')
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
      const afterStats = analyzeMesh(oc, finalShape)
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
        afterStats
      })
    } catch (error) {
      self.postMessage({
        type: 'error',
        message: error instanceof Error ? error.message : String(error)
      })
    }
  }
}
