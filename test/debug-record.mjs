#!/usr/bin/env node
import { readFileSync } from 'fs'
import JSZip from 'jszip'
import { AcisReader, RECORD_2_ENTITY } from './acis-js/index.js'

async function debugRecord(f3dPath) {
  const data = readFileSync(f3dPath)
  const zip = await JSZip.loadAsync(data)
  
  const smbFile = Object.keys(zip.files).find(n => n.endsWith('.smb'))
  const buffer = await zip.files[smbFile].async('arraybuffer')
  const acisData = new Uint8Array(buffer)
  
  const reader = new AcisReader()
  reader.readBinary(acisData)
  
  console.log(`Header ASM: ${JSON.stringify(reader.header.asm)}`)
  console.log(`Version: ${reader.header.version}`)
  
  const records = reader.getRecords()
  
  // Look at body[1] and its referenced records
  const body = records.find(r => r && r.name === 'body')
  if (body) {
    console.log(`\nBody[${body.index}] chunks:`)
    body.chunks.forEach((c, i) => {
      let refInfo = ''
      if (c.tag === 0x0c && c.val >= 0 && records[c.val]) {
        refInfo = ` -> ${records[c.val].name}[${c.val}]`
      }
      console.log(`  [${i}] tag=0x${c.tag.toString(16)} val=${c.val}${refInfo}`)
    })
    
    // Check referenced records
    console.log('\nReferenced records:')
    for (const c of body.chunks) {
      if (c.tag === 0x0c && c.val >= 0 && records[c.val]) {
        const ref = records[c.val]
        console.log(`  Record ${c.val}: ${ref.name}`)
      }
    }
  }
  
  // Check record 356
  if (records[356]) {
    console.log(`\nRecord 356: ${records[356].name}`)
    console.log(`Chunks:`)
    records[356].chunks.slice(0, 10).forEach((c, i) => {
      console.log(`  [${i}] tag=0x${c.tag.toString(16)} val=${c.val}`)
    })
  }
}

const f3dPath = process.argv[2] || '/Users/ahmadjalil/github/Stepifi/slzb-06-wall-mount.f3d'
debugRecord(f3dPath).catch(console.error)
