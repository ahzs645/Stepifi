#!/usr/bin/env node
/**
 * Test script to parse F3D files with the JavaScript ACIS parser
 * and analyze the parsed geometry data
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import JSZip from 'jszip'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Import our ACIS reader
import { AcisReader, RECORD_2_ENTITY } from './acis-js/index.js'

async function analyzeF3D(f3dPath) {
  console.log('\n' + '='.repeat(60))
  console.log(`Analyzing F3D file: ${f3dPath}`)
  console.log('='.repeat(60))

  // Read F3D file
  const data = readFileSync(f3dPath)
  const zip = await JSZip.loadAsync(data)

  // List all files
  console.log('\nFiles in archive:')
  for (const name of Object.keys(zip.files)) {
    const file = zip.files[name]
    if (!file.dir) {
      console.log(`  ${name} (${file._data ? file._data.uncompressedSize : '?'} bytes)`)
    }
  }

  // Find BREP files
  const brepFiles = Object.keys(zip.files).filter(name =>
    name.includes('Breps.BlobParts') && !zip.files[name].dir
  )

  console.log(`\nFound ${brepFiles.length} BREP files`)

  // Analyze each BREP file
  for (const brepPath of brepFiles) {
    console.log('\n' + '-'.repeat(60))
    console.log(`Analyzing: ${brepPath}`)
    console.log('-'.repeat(60))

    const buffer = await zip.files[brepPath].async('arraybuffer')
    const acisData = new Uint8Array(buffer)

    // Check header
    const header = new TextDecoder().decode(acisData.slice(0, 50))
    console.log(`  Header: ${header.substring(0, 40)}...`)

    // Try to parse with our ACIS reader
    try {
      const reader = new AcisReader()
      const success = reader.readBinary(acisData)

      console.log(`  Parse success: ${success}`)
      console.log(`  Version: ${reader.header.version}`)
      console.log(`  Scale: ${reader.header.scale}`)
      console.log(`  Records: ${reader.header.records}`)
      console.log(`  Bodies: ${reader.header.bodies}`)

      // Resolve entities
      reader.resolveEntities(RECORD_2_ENTITY)
      console.log(`  Resolved bodies: ${reader.bodies.length}`)

      // Get all records
      const records = reader.getRecords()
      console.log(`  Total records: ${records.length}`)

      // Count record types
      const typeCounts = {}
      for (const record of records) {
        if (record) {
          typeCounts[record.name] = (typeCounts[record.name] || 0) + 1
        }
      }

      console.log('\n  Record types:')
      const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])
      for (const [type, count] of sortedTypes.slice(0, 20)) {
        console.log(`    ${type}: ${count}`)
      }

      // Analyze vertex positions
      console.log('\n  Analyzing vertex positions...')
      let positions = []

      for (const record of records) {
        if (record && record.name === 'vertex' && record.entity) {
          const vertex = record.entity
          const point = vertex.getPoint ? vertex.getPoint() : null
          if (point) {
            positions.push({ x: point.x, y: point.y, z: point.z })
          }
        }
      }

      console.log(`  Found ${positions.length} vertex positions`)

      if (positions.length > 0) {
        // Calculate bounding box
        const minX = Math.min(...positions.map(p => p.x))
        const maxX = Math.max(...positions.map(p => p.x))
        const minY = Math.min(...positions.map(p => p.y))
        const maxY = Math.max(...positions.map(p => p.y))
        const minZ = Math.min(...positions.map(p => p.z))
        const maxZ = Math.max(...positions.map(p => p.z))

        console.log('\n  Bounding box:')
        console.log(`    X: ${minX.toFixed(6)} to ${maxX.toFixed(6)} (size: ${(maxX - minX).toFixed(6)})`)
        console.log(`    Y: ${minY.toFixed(6)} to ${maxY.toFixed(6)} (size: ${(maxY - minY).toFixed(6)})`)
        console.log(`    Z: ${minZ.toFixed(6)} to ${maxZ.toFixed(6)} (size: ${(maxZ - minZ).toFixed(6)})`)

        // Check for extreme values
        const extremePositions = positions.filter(p =>
          Math.abs(p.x) > 1000 || Math.abs(p.y) > 1000 || Math.abs(p.z) > 1000
        )

        if (extremePositions.length > 0) {
          console.log(`\n  WARNING: Found ${extremePositions.length} positions with extreme values (>1000):`)
          for (const p of extremePositions.slice(0, 5)) {
            console.log(`    (${p.x}, ${p.y}, ${p.z})`)
          }
        }

        // Sample normal positions
        console.log('\n  Sample positions (first 5):')
        for (const p of positions.slice(0, 5)) {
          console.log(`    (${p.x.toFixed(6)}, ${p.y.toFixed(6)}, ${p.z.toFixed(6)})`)
        }
      }

      // Also check for any position chunks in raw records
      console.log('\n  Checking raw position chunks...')
      let rawPositions = []
      for (const record of records) {
        if (record && record.chunks) {
          for (const chunk of record.chunks) {
            if (chunk.type === 'position' && chunk.val) {
              rawPositions.push(chunk.val)
            }
          }
        }
      }

      console.log(`  Found ${rawPositions.length} raw position chunks`)
      if (rawPositions.length > 0) {
        const minX = Math.min(...rawPositions.map(p => p.x))
        const maxX = Math.max(...rawPositions.map(p => p.x))
        const minY = Math.min(...rawPositions.map(p => p.y))
        const maxY = Math.max(...rawPositions.map(p => p.y))
        const minZ = Math.min(...rawPositions.map(p => p.z))
        const maxZ = Math.max(...rawPositions.map(p => p.z))

        console.log('\n  Raw position bounding box:')
        console.log(`    X: ${minX.toFixed(6)} to ${maxX.toFixed(6)}`)
        console.log(`    Y: ${minY.toFixed(6)} to ${maxY.toFixed(6)}`)
        console.log(`    Z: ${minZ.toFixed(6)} to ${maxZ.toFixed(6)}`)

        // Check for extreme values
        const extremeRaw = rawPositions.filter(p =>
          Math.abs(p.x) > 1e10 || Math.abs(p.y) > 1e10 || Math.abs(p.z) > 1e10
        )

        if (extremeRaw.length > 0) {
          console.log(`\n  CRITICAL: Found ${extremeRaw.length} raw positions with EXTREME values (>1e10):`)
          for (const p of extremeRaw.slice(0, 10)) {
            console.log(`    (${p.x}, ${p.y}, ${p.z})`)
          }
        }
      }

    } catch (e) {
      console.log(`  Parse ERROR: ${e.message}`)
      console.log(e.stack)
    }
  }
}

// Run test
const f3dPath = process.argv[2] || join(__dirname, '..', 'slzb-06-wall-mount.f3d')
analyzeF3D(f3dPath).catch(console.error)
