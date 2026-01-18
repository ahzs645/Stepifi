#!/usr/bin/env node
import { readFileSync } from 'fs'
import JSZip from 'jszip'
import { AcisReader, RECORD_2_ENTITY } from './acis-js/index.js'

async function debugVertices(f3dPath) {
  const data = readFileSync(f3dPath)
  const zip = await JSZip.loadAsync(data)
  
  const smbFile = Object.keys(zip.files).find(n => n.endsWith('.smb'))
  const buffer = await zip.files[smbFile].async('arraybuffer')
  const acisData = new Uint8Array(buffer)
  
  const reader = new AcisReader()
  reader.readBinary(acisData)
  reader.resolveEntities(RECORD_2_ENTITY)
  
  const records = reader.getRecords()
  
  // Check vertex entities
  let validPositions = 0
  let invalidPositions = 0
  
  for (const record of records) {
    if (record && record.name === 'vertex' && record.entity) {
      const vertex = record.entity
      const point = vertex.getPoint ? vertex.getPoint() : null
      if (point) {
        const pos = point.getPosition ? point.getPosition() : null
        if (pos && pos.x !== undefined && !isNaN(pos.x)) {
          validPositions++
          if (validPositions <= 5) {
            console.log(`Vertex[${record.index}]: (${pos.x.toFixed(4)}, ${pos.y.toFixed(4)}, ${pos.z.toFixed(4)})`)
          }
        } else {
          invalidPositions++
          if (invalidPositions <= 3) {
            console.log(`Invalid vertex[${record.index}]: point=${point}, pos=${JSON.stringify(pos)}`)
          }
        }
      } else {
        invalidPositions++
        if (invalidPositions <= 3) {
          console.log(`Vertex[${record.index}] has no point: _point=${JSON.stringify(vertex._point)}`)
        }
      }
    }
  }
  
  console.log(`\nValid positions: ${validPositions}`)
  console.log(`Invalid positions: ${invalidPositions}`)
  
  // Check point records
  const pointRecord = records.find(r => r && r.name === 'point')
  if (pointRecord) {
    console.log(`\nFirst point record[${pointRecord.index}]:`)
    pointRecord.chunks.forEach((c, i) => {
      console.log(`  [${i}] tag=0x${c.tag.toString(16)} val=${JSON.stringify(c.val)}`)
    })
  }
}

debugVertices('/Users/ahmadjalil/github/Stepifi/slzb-06-wall-mount.f3d').catch(console.error)
