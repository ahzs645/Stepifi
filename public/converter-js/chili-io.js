/**
 * Chili-WASM I/O Functions
 * STL/STEP/IGES reading, writing, and mesh analysis using chili3d's Converter API
 */

import { LARGE_MESH_THRESHOLD } from './config.js'

// ============================================================================
// Mesh Analysis
// ============================================================================

/**
 * Analyze mesh and return statistics using chili-wasm APIs
 */
export function analyzeMesh(wasm, shape, originalTriangleCount = 0) {
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
export function tessellateShape(wasm, shape, deflection = 0.5) {
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
export function readStl(wasm, stlData) {
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
export function writeOutput(wasm, shape, format) {
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
export function readStep(wasm, stepData) {
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
export function readIges(wasm, igesData) {
  const node = wasm.Converter.convertFromIges(igesData)
  if (!node || !node.shape) {
    throw new Error('Failed to read IGES file')
  }
  const shape = wasm.Shape.clone(node.shape)
  node.delete()
  return shape
}
