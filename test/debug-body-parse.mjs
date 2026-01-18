#!/usr/bin/env node
import { readFileSync } from 'fs'
import JSZip from 'jszip'
import { AcisReader, RECORD_2_ENTITY } from './acis-js/index.js'
import { isASM, getVersion } from './acis-js/utils.js'

async function debugBodyParse(f3dPath) {
  const data = readFileSync(f3dPath)
  const zip = await JSZip.loadAsync(data)
  
  const smbFile = Object.keys(zip.files).find(n => n.endsWith('.smb'))
  const buffer = await zip.files[smbFile].async('arraybuffer')
  const acisData = new Uint8Array(buffer)
  
  const reader = new AcisReader()
  reader.readBinary(acisData)
  
  // Try resolving entities
  reader.resolveEntities(RECORD_2_ENTITY)
  
  console.log(`isASM: ${isASM()}`)
  console.log(`Version: ${getVersion()}`)
  console.log(`Bodies: ${reader.bodies.length}`)
  
  // Check first body
  if (reader.bodies[0]) {
    const body = reader.bodies[0]
    console.log(`\nFirst body:`)
    console.log(`  _lump: ${body._lump}`)
    console.log(`  _wire: ${body._wire}`)
    console.log(`  _transform: ${body._transform}`)
    
    const lump = body.getLump()
    console.log(`  getLump(): ${lump ? lump.constructor.name : null}`)
  }
}

const f3dPath = process.argv[2] || '/Users/ahmadjalil/github/Stepifi/slzb-06-wall-mount.f3d'
debugBodyParse(f3dPath).catch(console.error)
