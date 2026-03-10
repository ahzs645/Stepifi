import { useRef, useEffect, useMemo, useState, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Center, Environment } from '@react-three/drei'
import * as THREE from 'three'
import type { MeshData } from '~/lib/converter'

function ShapeMesh({ geometry }: { geometry: THREE.BufferGeometry }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2
    }
  })

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial
        color="#4ade80"
        metalness={0.3}
        roughness={0.4}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

function AutoFitCamera({ geometry, onFit }: { geometry: THREE.BufferGeometry, onFit?: (distance: number) => void }) {
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

    const cam = camera as THREE.PerspectiveCamera
    cam.near = distance * 0.001
    cam.far = distance * 100
    cam.updateProjectionMatrix()

    camera.position.set(distance * 0.7, distance * 0.5, distance * 0.7)
    camera.lookAt(0, 0, 0)
    onFit?.(distance)
  }, [geometry, camera, onFit])

  return null
}

export default function ShapeViewer({ meshData }: { meshData: MeshData }) {
  const [fitDistance, setFitDistance] = useState(100)
  const onFit = useCallback((d: number) => setFitDistance(d), [])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(meshData.positions, 3))
    geo.setAttribute('normal', new THREE.BufferAttribute(meshData.normals, 3))
    if (meshData.indices.length > 0) {
      geo.setIndex(new THREE.BufferAttribute(meshData.indices, 1))
    }
    geo.center()
    geo.computeVertexNormals()
    return geo
  }, [meshData])

  return (
    <Canvas
      camera={{ position: [5, 5, 5], fov: 45 }}
      style={{ background: '#1a1a1a' }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.3} />
      <Center>
        <ShapeMesh geometry={geometry} />
      </Center>
      <AutoFitCamera geometry={geometry} onFit={onFit} />
      <OrbitControls enableDamping dampingFactor={0.05} minDistance={fitDistance * 0.01} maxDistance={fitDistance * 20} />
      <Environment preset="city" />
    </Canvas>
  )
}
