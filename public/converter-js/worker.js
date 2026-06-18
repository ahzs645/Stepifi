/**
 * Web Worker Message Handler
 * Handles analyze and convert messages for STL/3MF/F3D to STEP/STL conversion
 */

import { initOpenCascade } from './oc-init.js'
import { parse3MF, meshToStl, parseStlBinary, loadJSZip } from './format-parsers.js'
import { repairMeshData } from './mesh-repair.js'
import { findBoundaryEdges, groupBoundaryEdgesIntoLoops } from './mesh-utils.js'
import { detectNonManifolds, detectSelfIntersections } from './mesh-analysis.js'
import { analyzeMesh, readStl, writeOutput } from './oc-io.js'
import { processShape } from './oc-repair.js'

// Worker base path detection
const WORKER_BASE_PATH = (() => {
  const url = self.location.href
  return url.substring(0, url.lastIndexOf('/') + 1)
})()

// Load ACIS parser bundle (includes parser + geometry conversion)
try {
  importScripts(WORKER_BASE_PATH + 'acis-bundle.js')
} catch (e) {
  // ACIS module is optional - F3D support will be disabled
  console.log('ACIS module not loaded (F3D support disabled):', e.message)
}

let ocInstance = null

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

  if (!ocInstance) {
    ocInstance = await initOpenCascade(WORKER_BASE_PATH, self.postMessage.bind(self))
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
    postProgress('Parsing F3D file for analysis...')

    const bodies = await self.ACISParser.parseF3D(fileData, loadJSZip)
    postProgress('Converting F3D geometry...')

    shape = self.ACISGeometry.convertACISBodiesToShape(oc, bodies)

    if (!shape) {
      throw new Error('Failed to convert F3D geometry for analysis')
    }
  } else if (is3MF) {
    postProgress('Parsing 3MF file for analysis...')
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
    postProgress('Analyzing STL file...')
    const stlArray = new Uint8Array(fileData)
    oc.FS.writeFile('/input.stl', stlArray)
    shape = readStl(oc, '/input.stl')

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

  // Get OpenCascade stats
  const stats = shape ? analyzeMesh(oc, shape, totalTriangles) : {
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

  if (!ocInstance) {
    ocInstance = await initOpenCascade(WORKER_BASE_PATH, self.postMessage.bind(self))
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
    postProgress('Parsing F3D file...')

    // Use ACISParser from imported module
    const bodies = await self.ACISParser.parseF3D(fileData, loadJSZip)

    postProgress(`Found ${bodies.length} body/bodies in F3D`)

    // Convert ACIS bodies to OpenCascade shapes
    postProgress('Converting ACIS geometry to OpenCascade...')

    const shape = self.ACISGeometry.convertACISBodiesToShape(oc, bodies)

    if (!shape) {
      throw new Error('Failed to convert F3D geometry')
    }

    // Get before stats
    beforeStats = analyzeMesh(oc, shape, 0)
    beforeStats.note = 'F3D B-rep geometry (direct conversion)'
    self.postMessage({ type: 'beforeStats', data: beforeStats })

    // For F3D files, skip heavy processing since ACIS geometry is already valid B-rep
    // Only do light sewing to ensure watertight topology
    postProgress('Sewing F3D geometry...')
    try {
      const sewing = new oc.BRepBuilderAPI_Sewing(tolerance * 5, true, true, true, false)
      sewing.Add(shape)
      sewing.Perform(new oc.Message_ProgressRange_1())
      const sewedShape = sewing.SewedShape()
      shapes.push(sewedShape)
      allRepairs.push('Sewed F3D geometry')
    } catch (sewErr) {
      console.warn('F3D sewing failed, using original shape:', sewErr.message)
      shapes.push(shape)
      allRepairs.push('Using original F3D geometry (sewing skipped)')
    }

  } else if (is3MF) {
    // Parse 3MF file
    postProgress('Parsing 3MF file...')
    const meshes = await parse3MF(fileData)

    postProgress(`Found ${meshes.length} mesh(es) in 3MF`)

    // Calculate total triangles for 3MF before stats
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
      }, self.postMessage.bind(self))
      shapes.push(processResult.shape)
      allRepairs.push(...processResult.repairs.map(r => meshes.length > 1 ? `Mesh ${i + 1}: ${r}` : r))

      oc.FS.unlink(inputPath)
    }
  } else {
    // STL file - get triangle count from binary header
    postProgress('Writing STL to filesystem...')
    const stlArray = new Uint8Array(fileData)

    // Try to get triangle count from binary STL header
    if (fileData.byteLength > 84) {
      const view = new DataView(fileData)
      totalTriangles = view.getUint32(80, true)
    }

    oc.FS.writeFile('/input.stl', stlArray)

    postProgress('Reading STL file...')
    const shape = readStl(oc, '/input.stl')

    // Analyze mesh BEFORE processing
    postProgress('Analyzing input mesh...')
    beforeStats = analyzeMesh(oc, shape, totalTriangles)
    self.postMessage({ type: 'beforeStats', data: beforeStats })

    const processResult = processShape(oc, shape, {
      tolerance,
      repair,
      mergeFacesOpt,
      skipMerge,
      faceCount: beforeStats.faceCount || totalTriangles
    }, self.postMessage.bind(self))
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
    postProgress('Combining meshes...')
    const builder = new oc.BRep_Builder()
    const compound = new oc.TopoDS_Compound()
    builder.MakeCompound(compound)

    for (const shape of shapes) {
      builder.Add(compound, shape)
    }

    finalShape = compound
  }

  // Analyze mesh AFTER processing
  postProgress('Analyzing output mesh...')
  const afterStats = analyzeMesh(oc, finalShape, totalTriangles)
  self.postMessage({ type: 'afterStats', data: afterStats })

  // Write output
  let actualFormat = outputFormat
  let ext = outputFormat === 'stl' ? 'stl' : (outputFormat === 'brep' ? 'brep' : 'step')
  let outputPath = `/output.${ext}`
  let outputData

  postProgress(`Writing ${actualFormat.toUpperCase()} file...`)

  // STL export requires the shape to be meshed/triangulated first
  if (actualFormat === 'stl') {
    postProgress('Meshing geometry for STL export...')
    try {
      const meshParams = new oc.BRepMesh_IncrementalMesh_2(
        finalShape,
        tolerance, // linear deflection
        false, // relative
        0.5, // angular deflection
        false // parallel
      )
      meshParams.Perform(new oc.Message_ProgressRange_1())
    } catch (meshErr) {
      console.warn('Meshing step warning:', meshErr.message)
    }
  }

  let readPath = outputPath
  try {
    const writeResult = writeOutput(oc, finalShape, actualFormat, outputPath)
    actualFormat = writeResult.format
    readPath = writeResult.path

    // Surface honest fallbacks to the user (e.g. requested STEP, got .brep).
    if (writeResult.format !== outputFormat) {
      allRepairs.push(`Requested ${outputFormat.toUpperCase()} but exported ${writeResult.format.toUpperCase()} (${writeResult.approach || 'fallback'})`)
    } else if (writeResult.wireframe) {
      allRepairs.push('STEP exported as wireframe only (no solid faces)')
    }

    // Read the output file
    const stat = oc.FS.stat(readPath)
    console.log('Output file size:', stat.size, 'bytes (format ' + actualFormat + ')')
    outputData = oc.FS.readFile(readPath)
    console.log('Read', outputData.length, 'bytes from output file')
  } catch (writeError) {
    console.warn('Primary export failed:', writeError.message)

    // If STEP export failed entirely, fall back to STL
    if ((actualFormat === 'step' || outputFormat === 'step') && writeError.message === 'STEP_EXPORT_FAILED') {
      console.log('Falling back to STL export...')
      postProgress('STEP export failed, falling back to STL...')

      ext = 'stl'
      readPath = `/output.${ext}`

      // For STL, we need to mesh the geometry first
      postProgress('Meshing geometry for STL export...')
      try {
        const meshParams = new oc.BRepMesh_IncrementalMesh_2(
          finalShape,
          0.1, // linear deflection
          false, // relative
          0.5, // angular deflection
          false // parallel
        )
        meshParams.Perform(new oc.Message_ProgressRange_1())
      } catch (meshErr) {
        console.warn('Meshing failed:', meshErr.message)
      }

      const writeResult = writeOutput(oc, finalShape, 'stl', readPath)
      actualFormat = writeResult.format
      readPath = writeResult.path

      const stat = oc.FS.stat(readPath)
      console.log('STL fallback output file size:', stat.size, 'bytes')
      outputData = oc.FS.readFile(readPath)

      allRepairs.push('STEP export failed, exported as STL instead')
    } else {
      throw writeError
    }
  }

  // Cleanup
  try {
    oc.FS.unlink(readPath)
  } catch (unlinkError) {
    console.warn('Failed to cleanup output file:', unlinkError.message)
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
