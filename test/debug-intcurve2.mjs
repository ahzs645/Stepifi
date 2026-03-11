#!/usr/bin/env node
/**
 * Debug: patch setBulk to trace the '{' subtype issue
 */
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import JSZip from 'jszip'
import { AcisReader } from './acis-js/reader.js'
import { RECORD_2_ENTITY } from './acis-js/type-mappings.js'
import { CurveInt } from './acis-js/curves.js'
import { TAG_SUBTYPE_OPEN } from './acis-js/constants.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const f3dPath = process.argv[2] || join(__dirname, '..', 'slzb-06-wall-mount.f3d')

// Monkey-patch setBulk to log context when '{' appears
const origSetBulk = CurveInt.prototype.setBulk
let errorCount = 0
CurveInt.prototype.setBulk = function(chunks, index) {
  let i = index

  // Skip TAG_SUBTYPE_OPEN marker if present
  if (chunks[i] && chunks[i].tag === TAG_SUBTYPE_OPEN) {
    i += 1
  }

  const subtypeChunk = chunks[i]
  const subtype = subtypeChunk ? (subtypeChunk.val !== undefined ? subtypeChunk.val : subtypeChunk.value) : undefined

  if (subtype === '{') {
    errorCount++
    if (errorCount <= 3) {
      console.log(`\n--- setBulk '{' ERROR #${errorCount} ---`)
      console.log(`  Called with index=${index}`)
      console.log(`  After OPEN skip: i=${i}`)
      console.log(`  Chunk[index]:`, chunks[index] ? `tag=${chunks[index].tag} val=${JSON.stringify(chunks[index].val)}` : 'undefined')
      console.log(`  Chunk[i]:`, chunks[i] ? `tag=${chunks[i].tag} val=${JSON.stringify(chunks[i].val)}` : 'undefined')
      console.log(`  Chunk[i-1]:`, chunks[i-1] ? `tag=${chunks[i-1].tag} val=${JSON.stringify(chunks[i-1].val)}` : 'undefined')
      console.log(`  Chunk[i+1]:`, chunks[i+1] ? `tag=${chunks[i+1].tag} val=${JSON.stringify(chunks[i+1].val)}` : 'undefined')
      console.log(`  Chunk[i+2]:`, chunks[i+2] ? `tag=${chunks[i+2].tag} val=${JSON.stringify(chunks[i+2].val)}` : 'undefined')

      // Show surrounding context
      const start = Math.max(0, index - 3)
      const end = Math.min(chunks.length, index + 8)
      console.log(`  Context [${start}..${end}]:`)
      for (let j = start; j < end; j++) {
        const c = chunks[j]
        const marker = j === index ? ' <-- index' : (j === i ? ' <-- i' : '')
        console.log(`    [${j}] tag=${c.tag} val=${JSON.stringify(c.val)}${marker}`)
      }

      // Check: is this a nested call from inside a surface/curve?
      const stack = new Error().stack.split('\n').slice(1, 6)
      console.log(`  Call stack:`)
      for (const line of stack) console.log(`    ${line.trim()}`)
    }
  }

  return origSetBulk.call(this, chunks, index)
}

async function debug() {
  const data = readFileSync(f3dPath)
  const zip = await JSZip.loadAsync(data)
  const smbhFiles = Object.keys(zip.files).filter(f => f.toLowerCase().endsWith('.smbh'))

  const buf = await zip.files[smbhFiles[0]].async('arraybuffer')
  const reader = new AcisReader()
  reader.readBinary(new Uint8Array(buf))
  reader.resolveEntities(RECORD_2_ENTITY)

  console.log(`\nTotal '{' errors: ${errorCount}`)
  console.log(`Bodies: ${reader.bodies.length}`)
}

debug().catch(console.error)
