#!/usr/bin/env node
import { readFileSync } from 'fs'
import JSZip from 'jszip'
import { AcisReader, RECORD_2_ENTITY } from './acis-js/index.js'

async function debugPositions(f3dPath) {
  const data = readFileSync(f3dPath)
  const zip = await JSZip.loadAsync(data)
  
  const smbFile = Object.keys(zip.files).find(n => n.endsWith('.smb'))
  const buffer = await zip.files[smbFile].async('arraybuffer')
  const acisData = new Uint8Array(buffer)
  
  const reader = new AcisReader()
  reader.readBinary(acisData)
  
  console.log(`Scale: ${reader.header.scale}`)
  
  const records = reader.getRecords()
  
  // Check raw position chunks in all records
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
  
  console.log(`\nFound ${rawPositions.length} raw position chunks`)
  
  if (rawPositions.length > 0) {
    // Calculate bounding box
    const minX = Math.min(...rawPositions.map(p => p.x))
    const maxX = Math.max(...rawPositions.map(p => p.x))
    const minY = Math.min(...rawPositions.map(p => p.y))
    const maxY = Math.max(...rawPositions.map(p => p.y))
    const minZ = Math.min(...rawPositions.map(p => p.z))
    const maxZ = Math.max(...rawPositions.map(p => p.z))
    
    console.log(`\nRaw position bounding box (already scaled):`)
    console.log(`  X: ${minX.toFixed(4)} to ${maxX.toFixed(4)} mm`)
    console.log(`  Y: ${minY.toFixed(4)} to ${maxY.toFixed(4)} mm`)
    console.log(`  Z: ${minZ.toFixed(4)} to ${maxZ.toFixed(4)} mm`)
    
    // Divided by scale (in case scale is applied twice)
    const scale = reader.header.scale
    console.log(`\nIf divided by scale (${scale}):`)
    console.log(`  X: ${(minX/scale).toFixed(4)} to ${(maxX/scale).toFixed(4)} mm`)
    console.log(`  Y: ${(minY/scale).toFixed(4)} to ${(maxY/scale).toFixed(4)} mm`)
    console.log(`  Z: ${(minZ/scale).toFixed(4)} to ${(maxZ/scale).toFixed(4)} mm`)
    
    console.log(`\nSample positions (first 5):`)
    for (const p of rawPositions.slice(0, 5)) {
      console.log(`  (${p.x.toFixed(4)}, ${p.y.toFixed(4)}, ${p.z.toFixed(4)})`)
    }
  }
}

debugPositions('/Users/ahmadjalil/github/Stepifi/slzb-06-wall-mount.f3d').catch(console.error)
