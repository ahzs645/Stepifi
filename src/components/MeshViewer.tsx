import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Center, Environment } from '@react-three/drei'
import * as THREE from 'three'
import JSZip from 'jszip'

interface MeshViewerProps {
  fileData: ArrayBuffer
  fileName: string
}

function MeshObject({ geometry }: { geometry: THREE.BufferGeometry }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2
    }
  })

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial
        color="#8b7cf7"
        metalness={0.3}
        roughness={0.4}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

function AutoFitCamera({ geometry }: { geometry: THREE.BufferGeometry }) {
  const { camera } = useThree()

  useEffect(() => {
    geometry.computeBoundingBox()
    const box = geometry.boundingBox
    if (!box) return

    const size = new THREE.Vector3()
    box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z)
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180)
    const distance = (maxDim / (2 * Math.tan(fov / 2))) * 1.5

    camera.position.set(distance * 0.7, distance * 0.5, distance * 0.7)
    camera.lookAt(0, 0, 0)
  }, [geometry, camera])

  return null
}

function parseStl(buffer: ArrayBuffer): THREE.BufferGeometry {
  const dataView = new DataView(buffer)
  const decoder = new TextDecoder('ascii')
  const header = decoder.decode(buffer.slice(0, 80))

  const isBinary =
    !header.startsWith('solid') ||
    (buffer.byteLength > 84 &&
      buffer.byteLength === 84 + dataView.getUint32(80, true) * 50)

  if (isBinary) {
    return parseBinaryStl(buffer)
  } else {
    return parseAsciiStl(buffer)
  }
}

function parseBinaryStl(buffer: ArrayBuffer): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry()
  const dataView = new DataView(buffer)

  const triangleCount = dataView.getUint32(80, true)
  const vertices = new Float32Array(triangleCount * 9)
  const normals = new Float32Array(triangleCount * 9)

  let offset = 84

  for (let i = 0; i < triangleCount; i++) {
    const nx = dataView.getFloat32(offset, true)
    const ny = dataView.getFloat32(offset + 4, true)
    const nz = dataView.getFloat32(offset + 8, true)
    offset += 12

    for (let j = 0; j < 3; j++) {
      const vertexIndex = i * 9 + j * 3
      vertices[vertexIndex] = dataView.getFloat32(offset, true)
      vertices[vertexIndex + 1] = dataView.getFloat32(offset + 4, true)
      vertices[vertexIndex + 2] = dataView.getFloat32(offset + 8, true)
      normals[vertexIndex] = nx
      normals[vertexIndex + 1] = ny
      normals[vertexIndex + 2] = nz
      offset += 12
    }

    offset += 2
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3))

  return geometry
}

function parseAsciiStl(buffer: ArrayBuffer): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry()
  const decoder = new TextDecoder('ascii')
  const text = decoder.decode(buffer)

  const vertices: number[] = []
  const normals: number[] = []

  const normalPattern =
    /facet\s+normal\s+([\d.\-e+]+)\s+([\d.\-e+]+)\s+([\d.\-e+]+)/gi
  const vertexPattern = /vertex\s+([\d.\-e+]+)\s+([\d.\-e+]+)\s+([\d.\-e+]+)/gi

  let normalMatch
  let currentNormal = [0, 0, 1]

  while ((normalMatch = normalPattern.exec(text)) !== null) {
    currentNormal = [
      parseFloat(normalMatch[1]),
      parseFloat(normalMatch[2]),
      parseFloat(normalMatch[3]),
    ]

    for (let i = 0; i < 3; i++) {
      const vertexMatch = vertexPattern.exec(text)
      if (vertexMatch) {
        vertices.push(
          parseFloat(vertexMatch[1]),
          parseFloat(vertexMatch[2]),
          parseFloat(vertexMatch[3]),
        )
        normals.push(...currentNormal)
      }
    }
  }

  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array(vertices), 3),
  )
  geometry.setAttribute(
    'normal',
    new THREE.BufferAttribute(new Float32Array(normals), 3),
  )

  return geometry
}

async function parse3MF(buffer: ArrayBuffer): Promise<THREE.BufferGeometry> {
  const zip = await JSZip.loadAsync(buffer)

  // Find model file
  const files = Object.keys(zip.files)
  let modelPath = files.find(f => f.toLowerCase() === '3d/3dmodel.model')
  if (!modelPath) {
    modelPath = files.find(f => f.toLowerCase().endsWith('.model'))
  }

  const allVertices: number[] = []
  const allNormals: number[] = []

  if (modelPath) {
    const modelXml = await zip.file(modelPath)!.async('text')

    // Parse meshes using regex
    const meshRegex = /<mesh[^>]*>([\s\S]*?)<\/mesh>/gi
    let meshMatch

    while ((meshMatch = meshRegex.exec(modelXml)) !== null) {
      const meshContent = meshMatch[1]
      const vertices: { x: number; y: number; z: number }[] = []
      const triangles: { v1: number; v2: number; v3: number }[] = []

      // Parse vertices
      const vertexRegex = /<vertex\s+x=["']([^"']+)["']\s+y=["']([^"']+)["']\s+z=["']([^"']+)["']/gi
      let vertexMatch
      while ((vertexMatch = vertexRegex.exec(meshContent)) !== null) {
        vertices.push({
          x: parseFloat(vertexMatch[1]),
          y: parseFloat(vertexMatch[2]),
          z: parseFloat(vertexMatch[3])
        })
      }

      // Parse triangles
      const triangleRegex = /<triangle\s+v1=["'](\d+)["']\s+v2=["'](\d+)["']\s+v3=["'](\d+)["']/gi
      let triangleMatch
      while ((triangleMatch = triangleRegex.exec(meshContent)) !== null) {
        triangles.push({
          v1: parseInt(triangleMatch[1]),
          v2: parseInt(triangleMatch[2]),
          v3: parseInt(triangleMatch[3])
        })
      }

      // Convert to geometry arrays
      for (const tri of triangles) {
        const v1 = vertices[tri.v1]
        const v2 = vertices[tri.v2]
        const v3 = vertices[tri.v3]

        if (!v1 || !v2 || !v3) continue

        // Calculate normal
        const ux = v2.x - v1.x, uy = v2.y - v1.y, uz = v2.z - v1.z
        const vx = v3.x - v1.x, vy = v3.y - v1.y, vz = v3.z - v1.z
        const nx = uy * vz - uz * vy
        const ny = uz * vx - ux * vz
        const nz = ux * vy - uy * vx
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1

        // Add vertices
        allVertices.push(v1.x, v1.y, v1.z)
        allVertices.push(v2.x, v2.y, v2.z)
        allVertices.push(v3.x, v3.y, v3.z)

        // Add normals
        allNormals.push(nx / len, ny / len, nz / len)
        allNormals.push(nx / len, ny / len, nz / len)
        allNormals.push(nx / len, ny / len, nz / len)
      }
    }
  }

  // Check for embedded STL files in multiple locations (BambuStudio/PrusaSlicer compatibility)
  const stlPatterns = [
    /\.stl$/i,                    // Any .stl file
    /Metadata\/.*\.stl$/i,        // Metadata folder
    /3D\/Objects\/.*\.stl$/i,     // 3D/Objects folder (PrusaSlicer)
    /3D\/.*\.stl$/i               // Any STL in 3D folder
  ]

  const stlFiles = files.filter(f => {
    if (f.toLowerCase().endsWith('.model')) return false
    return stlPatterns.some(pattern => pattern.test(f))
  })

  for (const stlFile of stlFiles) {
    try {
      const fileContent = zip.file(stlFile)
      if (!fileContent) continue

      const stlData = await fileContent.async('arraybuffer')
      const stlGeometry = parseStl(stlData)

      const positions = stlGeometry.getAttribute('position')
      const normals = stlGeometry.getAttribute('normal')

      if (positions) {
        for (let i = 0; i < positions.count; i++) {
          allVertices.push(positions.getX(i), positions.getY(i), positions.getZ(i))
        }
      }
      if (normals) {
        for (let i = 0; i < normals.count; i++) {
          allNormals.push(normals.getX(i), normals.getY(i), normals.getZ(i))
        }
      }
    } catch (e) {
      console.log(`Failed to parse embedded STL: ${stlFile}`, e)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array(allVertices), 3),
  )
  geometry.setAttribute(
    'normal',
    new THREE.BufferAttribute(new Float32Array(allNormals), 3),
  )

  return geometry
}

function Scene({ geometry }: { geometry: THREE.BufferGeometry }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.3} />

      <Center>
        <MeshObject geometry={geometry} />
      </Center>

      <AutoFitCamera geometry={geometry} />
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={1}
        maxDistance={1000}
      />
      <Environment preset="city" />
    </>
  )
}

export default function MeshViewer({ fileData, fileName }: MeshViewerProps) {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isF3D, setIsF3D] = useState(false)

  useEffect(() => {
    async function loadGeometry() {
      setLoading(true)
      setError(null)
      setIsF3D(false)

      try {
        // F3D files contain B-rep geometry that requires full conversion for preview
        if (fileName.toLowerCase().endsWith('.f3d')) {
          setIsF3D(true)
          setLoading(false)
          return
        }

        let geo: THREE.BufferGeometry

        if (fileName.toLowerCase().endsWith('.3mf')) {
          geo = await parse3MF(fileData)
        } else {
          geo = parseStl(fileData)
        }

        geo.center()
        geo.computeVertexNormals()
        setGeometry(geo)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load mesh')
      } finally {
        setLoading(false)
      }
    }

    loadGeometry()
  }, [fileData, fileName])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Loading 3D preview...
      </div>
    )
  }

  if (isF3D) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 p-4">
        <div className="text-4xl mb-4">🔧</div>
        <div className="text-center">
          <p className="font-medium text-gray-300">Fusion 360 File Detected</p>
          <p className="text-sm mt-2">
            F3D files contain parametric B-rep geometry.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Preview will be generated during conversion.
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-red-400">
        Failed to load preview: {error}
      </div>
    )
  }

  if (!geometry) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        No geometry to display
      </div>
    )
  }

  return (
    <Canvas
      camera={{ position: [5, 5, 5], fov: 45 }}
      style={{ background: '#1a1a1a' }}
    >
      <Scene geometry={geometry} />
    </Canvas>
  )
}
