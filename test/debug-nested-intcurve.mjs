#!/usr/bin/env node
/**
 * Debug: replace setBulk entirely to trace exact execution
 */
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import JSZip from 'jszip'
import { AcisReader } from './acis-js/reader.js'
import { RECORD_2_ENTITY } from './acis-js/type-mappings.js'
import { CurveInt, CURVE_SET_DATA } from './acis-js/curves.js'
import { TAG_SUBTYPE_OPEN, TAG_SUBTYPE_CLOSE } from './acis-js/constants.js'
import { getValue, getInteger, getVersion, isASM, getReader } from './acis-js/utils.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const f3dPath = process.argv[2] || join(__dirname, '..', 'slzb-06-wall-mount.f3d')

let errorCount = 0
let callCount = 0

// Completely replace setBulk to trace every step
CurveInt.prototype.setBulk = function(chunks, index) {
  callCount++
  const callId = callCount
  let i = index

  // Step 1: Skip TAG_SUBTYPE_OPEN
  const hadOpen = chunks[i] && chunks[i].tag === TAG_SUBTYPE_OPEN
  if (hadOpen) {
    i += 1
  }

  // Step 2: Read subtype
  ;[this.subtype, ] = getValue(chunks, i)
  i += 1

  if (this.subtype === '{') {
    errorCount++
    if (errorCount <= 5) {
      console.log(`\n=== setBulk '{' ERROR #${errorCount} (call #${callId}) ===`)
      console.log(`  index=${index}, hadOpen=${hadOpen}`)
      console.log(`  chunks[index]: tag=${chunks[index]?.tag} val=${JSON.stringify(chunks[index]?.val)}`)
      console.log(`  chunks[index+1]: tag=${chunks[index+1]?.tag} val=${JSON.stringify(chunks[index+1]?.val)}`)
      console.log(`  chunks[index+2]: tag=${chunks[index+2]?.tag} val=${JSON.stringify(chunks[index+2]?.val)}`)

      // Context
      const start = Math.max(0, index - 3)
      const end = Math.min(chunks.length, index + 8)
      for (let j = start; j < end; j++) {
        const c = chunks[j]
        const tn = c.tag === TAG_SUBTYPE_OPEN ? 'OPEN' :
                   c.tag === TAG_SUBTYPE_CLOSE ? 'CLOSE' :
                   `tag=${c.tag}`
        const v = c.val !== undefined ? c.val : c.value
        const m = j === index ? ' <-- index' : ''
        console.log(`    [${j}] ${tn}  val=${JSON.stringify(v)}${m}`)
      }

      // Stack
      const stack = new Error().stack.split('\n').slice(1, 12)
      for (const line of stack) console.log(`    ${line.trim()}`)
    }
  }

  // Step 3: Handle ref
  if (this.subtype === 'ref') {
    return this.setRef(chunks, i)
  }

  try {
    if (getVersion() >= 25.0 && !isASM()) {
      ;[this.id, i] = getInteger(chunks, i)
    }
    const reader = getReader()
    if (reader) {
      reader.addSubtypeEntity(this)
    }

    const prm = CURVE_SET_DATA[this.subtype]
    if (!prm) {
      throw new Error(`No implementation for intcurve '${this.subtype}'`)
    }

    const fkt = this[prm[0]]
    if (typeof fkt !== 'function') {
      throw new Error(`Method ${prm[0]} not found for intcurve '${this.subtype}'`)
    }

    return fkt.call(this, chunks, i + prm[1], prm[2])
  } catch (e) {
    console.error(`Error parsing intcurve '${this.subtype}':`, e.message)
    return i
  }
}

async function debug() {
  const data = readFileSync(f3dPath)
  const zip = await JSZip.loadAsync(data)
  const smbhFiles = Object.keys(zip.files).filter(f => f.toLowerCase().endsWith('.smbh'))

  const buf = await zip.files[smbhFiles[0]].async('arraybuffer')
  const reader = new AcisReader()
  reader.readBinary(new Uint8Array(buf))
  reader.resolveEntities(RECORD_2_ENTITY)

  console.log(`\nTotal setBulk calls: ${callCount}`)
  console.log(`Total '{' errors: ${errorCount}`)
  console.log(`Bodies: ${reader.bodies.length}`)
}

debug().catch(console.error)
