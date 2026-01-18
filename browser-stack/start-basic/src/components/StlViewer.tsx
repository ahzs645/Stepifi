import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Center, Environment } from '@react-three/drei'
import * as THREE from 'three'

interface StlViewerProps {
  stlData: ArrayBuffer
}

function StlMesh({ geometry }: { geometry: THREE.BufferGeometry }) {
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

export default function StlViewer({ stlData }: StlViewerProps) {
  const geometry = useMemo(() => {
    const geo = parseStl(stlData)
    geo.center()
    geo.computeVertexNormals()
    return geo
  }, [stlData])

  return (
    <Canvas
      camera={{ position: [5, 5, 5], fov: 45 }}
      style={{ background: '#1a1a1a' }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.3} />

      <Center>
        <StlMesh geometry={geometry} />
      </Center>

      <AutoFitCamera geometry={geometry} />
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={1}
        maxDistance={1000}
      />
      <Environment preset="city" />
    </Canvas>
  )
}
