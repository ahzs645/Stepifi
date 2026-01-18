#!/usr/bin/env node
import { readFileSync } from 'fs'
import JSZip from 'jszip'
import { AcisReader } from './acis-js/index.js'

async function debugChunks(f3dPath) {
  const data = readFileSync(f3dPath)
  const zip = await JSZip.loadAsync(data)
  
  const smbFile = Object.keys(zip.files).find(n => n.endsWith('.smb'))
  if (!smbFile) {
    console.log('No .smb file found')
    return
  }
  
  console.log(`Analyzing: ${smbFile}\n`)
  
  const buffer = await zip.files[smbFile].async('arraybuffer')
  const acisData = new Uint8Array(buffer)
  
  const reader = new AcisReader()
  reader.readBinary(acisData)
  
  const records = reader.getRecords()
  
  // Look at first few records of different types
  const types = ['body', 'vertex', 'edge', 'coedge', 'face', 'ATTRIB_CUSTOM-attrib']
  
  for (const type of types) {
    const record = records.find(r => r && r.name === type)
    if (record) {
      console.log(`\n=== ${record.name}[${record.index}] ===`)
      console.log(`Chunk count: ${record.chunks.length}`)
      record.chunks.slice(0, 10).forEach((c, i) => {
        console.log(`  [${i}] tag=0x${c.tag.toString(16).padStart(2,'0')} val=${c.val} (type: ${typeof c.val})`)
      })
    }
  }
}

const f3dPath = process.argv[2] || '/Users/ahmadjalil/github/Stepifi/slzb-06-wall-mount.f3d'
debugChunks(f3dPath).catch(console.error)
