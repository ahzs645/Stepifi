/**
 * Web Worker Message Handler (chili-wasm backend)
 * Handles analyze and convert messages for STL/3MF/F3D to STEP/STL conversion
 * Uses chili3d's OCCT 7.9.1 WASM build
 */

import { initChiliWasm } from './chili-init.js'
import { parse3MF, meshToStl, parseStlBinary, loadJSZip } from './format-parsers.js'
import { repairMeshData } from './mesh-repair.js'
import { findBoundaryEdges, groupBoundaryEdgesIntoLoops } from './mesh-utils.js'
import { detectNonManifolds, detectSelfIntersections } from './mesh-analysis.js'
import { analyzeMesh, readStl, writeOutput, tessellateShape } from './chili-io.js'
import { processShape } from './chili-repair.js'
import { convertACISBodiesToShape } from './chili-geometry-bridge.js'

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

let wasmInstance = null

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

    const bodies = await self.ACISParser.parseF3D(fileData, loadJSZip)
    postProgress(`Found ${bodies.length} ACIS bodies, converting...`)
    shape = convertACISBodiesToShape(wasm, bodies)

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

    const bodies = await self.ACISParser.parseF3D(fileData, loadJSZip)
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

    const shape = convertACISBodiesToShape(wasm, bodies)
    if (!shape) throw new Error('Failed to convert ACIS geometry')

    // Analyze BEFORE processing
    postProgress('Analyzing input geometry...')
    beforeStats = analyzeMesh(wasm, shape, totalTriangles)
    self.postMessage({ type: 'beforeStats', data: beforeStats })

    // F3D shapes are already B-rep, minimal repair needed
    const processResult = processShape(wasm, shape, {
      tolerance,
      repair,
      mergeFacesOpt,
      skipMerge: true, // F3D shapes are already clean B-rep
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
