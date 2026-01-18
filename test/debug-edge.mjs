#!/usr/bin/env node
import { readFileSync } from 'fs'
import JSZip from 'jszip'
import { AcisReader } from './acis-js/index.js'

async function debugEdge(f3dPath) {
  const data = readFileSync(f3dPath)
  const zip = await JSZip.loadAsync(data)
  
  const smbFile = Object.keys(zip.files).find(n => n.endsWith('.smb'))
  const buffer = await zip.files[smbFile].async('arraybuffer')
  const acisData = new Uint8Array(buffer)
  
  const reader = new AcisReader()
  reader.readBinary(acisData)
  
  const records = reader.getRecords()
  const edge = records.find(r => r && r.name === 'edge')
  
  if (edge) {
    console.log(`edge[${edge.index}] chunks (${edge.chunks.length}):`)
    edge.chunks.forEach((c, i) => {
      let typeInfo = c.type || ''
      let refName = ''
      if (c.tag === 0x0c && c.val >= 0 && records[c.val]) {
        refName = ` -> ${records[c.val].name}[${c.val}]`
      }
      console.log(`  [${i}] tag=0x${c.tag.toString(16).padStart(2,'0')} val=${c.val}${typeInfo}${refName}`)
    })
    
    // Show what the Python Edge expects
    console.log('\nPython Edge.set() expects:')
    console.log('  i = Topology.set() (skips attrib + LONG + ref)')
    console.log('  attrib ref, coedge ref, start vertex ref, start_param,')
    console.log('  end vertex ref, end_param, owner ref, curve ref, sense')
  }
}

debugEdge('/Users/ahmadjalil/github/Stepifi/slzb-06-wall-mount.f3d').catch(console.error)
