#!/usr/bin/env node
import { readFileSync } from 'fs'
import JSZip from 'jszip'
import { AcisReader } from './acis-js/index.js'

async function debugAsmHeader(f3dPath) {
  const data = readFileSync(f3dPath)
  const zip = await JSZip.loadAsync(data)
  
  const smbFile = Object.keys(zip.files).find(n => n.endsWith('.smb'))
  const buffer = await zip.files[smbFile].async('arraybuffer')
  const acisData = new Uint8Array(buffer)
  
  const reader = new AcisReader()
  reader.readBinary(acisData)
  
  const records = reader.getRecords()
  const asmheader = records.find(r => r && r.name === 'asmheader')
  
  if (asmheader) {
    console.log(`asmheader[${asmheader.index}] chunks:`)
    asmheader.chunks.forEach((c, i) => {
      console.log(`  [${i}] tag=0x${c.tag.toString(16)} val=${JSON.stringify(c.val)} (${typeof c.val})`)
    })
  }
}

debugAsmHeader('/Users/ahmadjalil/github/Stepifi/slzb-06-wall-mount.f3d').catch(console.error)
