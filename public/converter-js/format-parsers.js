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
export async function loadJSZip() {
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
export async function parse3MF(arrayBuffer) {
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
export function meshToStl(mesh) {
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
export function parseStlBinary(fileData) {
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
