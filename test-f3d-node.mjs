#!/usr/bin/env node
/**
 * Test F3D conversion with OpenCascade.js in Node.js
 */

import { readFileSync } from 'fs'
import JSZip from 'jszip'

// Import ACIS parser
import { AcisReader, RECORD_2_ENTITY } from './public/acis-js/index.js'
import * as geometryBuilder from './public/acis-js/geometry-builder.js'

const F3D_PATH = '/Users/ahmadjalil/github/Stepifi/slzb-06-wall-mount.f3d'

async function parseF3D(filePath) {
  console.log('Loading F3D file...')
  const data = readFileSync(filePath)

  console.log('Extracting ZIP...')
  const zip = await JSZip.loadAsync(data)
  const files = Object.keys(zip.files)

  const smbFiles = files.filter(f =>
    f.toLowerCase().endsWith('.smb') || f.toLowerCase().endsWith('.smbh')
  )

  console.log(`Found ${smbFiles.length} SMB/SMBH files`)

  const allBodies = []

  for (const smbFile of smbFiles) {
    console.log(`Parsing ${smbFile}...`)
    const smbData = await zip.file(smbFile).async('arraybuffer')

    const reader = new AcisReader()
    if (!reader.readBinary(new Uint8Array(smbData))) {
      console.warn(`  Failed to read ${smbFile}`)
      continue
    }

    reader.resolveEntities(RECORD_2_ENTITY)
    console.log(`  Found ${reader.bodies.length} bodies`)
    allBodies.push(...reader.bodies)
  }

  return allBodies
}

async function main() {
  try {
    // Parse F3D
    const bodies = await parseF3D(F3D_PATH)
    console.log(`\nTotal bodies: ${bodies.length}`)

    // Load OpenCascade.js
    console.log('\nLoading OpenCascade.js for Node.js...')

    // Import the npm package
    const ocModule = await import('opencascade.js')
    const initOpenCascade = ocModule.default

    console.log('Initializing OpenCascade WASM...')
    const oc = await initOpenCascade()
    console.log('OpenCascade initialized!')

    // Convert geometry
    console.log('\nConverting ACIS geometry to OpenCascade...')
    const startTime = performance.now()

    // We need to use the geometry builder functions directly
    const shape = geometryBuilder.convertACISBodiesToShape(oc, bodies)

    const convTime = performance.now() - startTime
    console.log(`Conversion took ${convTime.toFixed(0)}ms`)

    if (!shape) {
      throw new Error('Failed to convert geometry')
    }
    console.log('Geometry converted successfully!')

    // Analyze bounding box
    console.log('\nAnalyzing bounding box...')
    const bndBox = new oc.Bnd_Box_1()
    oc.BRepBndLib.Add(shape, bndBox, false)

    if (!bndBox.IsVoid()) {
      const xMin = { current: 0 }, yMin = { current: 0 }, zMin = { current: 0 }
      const xMax = { current: 0 }, yMax = { current: 0 }, zMax = { current: 0 }
      bndBox.Get(xMin, yMin, zMin, xMax, yMax, zMax)

      const sizeX = xMax.current - xMin.current
      const sizeY = yMax.current - yMin.current
      const sizeZ = zMax.current - zMin.current

      console.log('Bounding box:')
      console.log(`  Min: (${xMin.current.toFixed(2)}, ${yMin.current.toFixed(2)}, ${zMin.current.toFixed(2)})`)
      console.log(`  Max: (${xMax.current.toFixed(2)}, ${yMax.current.toFixed(2)}, ${zMax.current.toFixed(2)})`)
      console.log(`  Size: ${sizeX.toFixed(2)} x ${sizeY.toFixed(2)} x ${sizeZ.toFixed(2)}`)

      if (sizeX > 1e10 || sizeY > 1e10 || sizeZ > 1e10) {
        console.log('\n*** WARNING: Bounding box has extreme values! ***')
      } else {
        console.log('\n*** SUCCESS: Bounding box looks valid! ***')
      }
    }

    // Count faces
    console.log('\nCounting faces...')
    let faceCount = 0
    const faceExplorer = new oc.TopExp_Explorer_2(
      shape,
      oc.TopAbs_ShapeEnum.TopAbs_FACE,
      oc.TopAbs_ShapeEnum.TopAbs_SHAPE
    )
    while (faceExplorer.More()) {
      faceCount++
      faceExplorer.Next()
    }
    console.log(`Total faces in shape: ${faceCount}`)

    console.log('\n=== TEST COMPLETE ===')

  } catch (e) {
    console.error('Error:', e.message)
    console.error(e.stack)
  }
}

main()
