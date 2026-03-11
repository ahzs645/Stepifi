#!/usr/bin/env node
/**
 * Debug: trace intcurve chunk data to understand the '{' subtype issue
 */
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import JSZip from 'jszip'
import { AcisReader } from './acis-js/reader.js'
import { TAG_SUBTYPE_OPEN, TAG_SUBTYPE_CLOSE } from './acis-js/constants.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const f3dPath = process.argv[2] || join(__dirname, '..', 'slzb-06-wall-mount.f3d')

async function debug() {
  const data = readFileSync(f3dPath)
  const zip = await JSZip.loadAsync(data)
  const smbhFiles = Object.keys(zip.files).filter(f => f.toLowerCase().endsWith('.smbh'))

  const buf = await zip.files[smbhFiles[0]].async('arraybuffer')
  const reader = new AcisReader()
  reader.readBinary(new Uint8Array(buf))
  reader._resolveChunkReferences()

  // Find intcurve-curve records and dump their chunks
  let count = 0
  for (const record of reader.getRecords()) {
    if (!record || record.name !== 'intcurve-curve') continue
    if (count >= 3) break
    count++

    console.log(`\n=== intcurve-curve [${record.index}] ===`)
    console.log(`Chunks (${record.chunks.length}):`)
    for (let i = 0; i < Math.min(20, record.chunks.length); i++) {
      const c = record.chunks[i]
      const tagName = c.tag === TAG_SUBTYPE_OPEN ? 'OPEN{' :
                      c.tag === TAG_SUBTYPE_CLOSE ? 'CLOSE}' :
                      `tag=${c.tag}`
      const val = c.val !== undefined ? c.val : c.value
      console.log(`  [${i}] ${tagName}  val=${JSON.stringify(val)}`)
    }
  }
}

debug().catch(console.error)
