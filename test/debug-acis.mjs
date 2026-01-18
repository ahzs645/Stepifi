#!/usr/bin/env node
/**
 * Debug ACIS parsing - trace through the binary reading step by step
 */

import { readFileSync } from 'fs'
import JSZip from 'jszip'

async function debugAcis(f3dPath) {
  console.log(`\nDebugging ACIS parsing for: ${f3dPath}`)

  const data = readFileSync(f3dPath)
  const zip = await JSZip.loadAsync(data)

  // Get the .smb file (should have good data)
  const brepFile = Object.keys(zip.files).find(n => n.endsWith('.smb'))
  if (!brepFile) {
    console.log('No .smb file found')
    return
  }

  console.log(`\nAnalyzing: ${brepFile}`)

  const buffer = await zip.files[brepFile].async('arraybuffer')
  const acisData = new Uint8Array(buffer)

  // Header info
  console.log('\n=== Header Analysis ===')
  const header = new TextDecoder().decode(acisData.slice(0, 15))
  console.log(`Format (first 15 bytes): "${header}"`)
  console.log(`Format ends with '8': ${header.endsWith('8')}`)
  console.log(`Format ends with '4': ${header.endsWith('4')}`)

  // Check if 64-bit mode
  const is64Bit = header.endsWith('8')
  const intSize = is64Bit ? 8 : 4
  console.log(`64-bit mode: ${is64Bit}, int size: ${intSize}`)

  // Read header values
  const view = new DataView(acisData.buffer, acisData.byteOffset, acisData.byteLength)
  let pos = 15

  function readUInt64() {
    const lo = view.getUint32(pos, true)
    const hi = view.getUint32(pos + 4, true)
    pos += 8
    return hi * 0x100000000 + lo
  }

  function readUInt32() {
    const val = view.getUint32(pos, true)
    pos += 4
    return val
  }

  function readSInt64() {
    const lo = view.getUint32(pos, true)
    const hi = view.getInt32(pos + 4, true)
    pos += 8
    if (lo === 0xffffffff && hi === -1) return -1
    return hi * 0x100000000 + lo
  }

  const readLong = is64Bit ? readUInt64 : readUInt32
  const readSLong = is64Bit ? readSInt64 : () => view.getInt32((pos += 4) - 4, true)

  const version = readLong()
  const records = readLong()
  const bodies = readLong()
  const flags = readLong()

  console.log(`\n=== Header Values (starting at byte 15) ===`)
  console.log(`Version (raw): ${version} -> ${version/100}.${version%100}`)
  console.log(`Records: ${records}`)
  console.log(`Bodies: ${bodies}`)
  console.log(`Flags: ${flags}`)
  console.log(`Position after header values: ${pos}`)

  // Now read chunks
  console.log(`\n=== Reading Chunks ===`)

  function readChunk() {
    const startPos = pos
    const tag = acisData[pos++]

    let val = null
    let desc = ''

    const TAG_DOUBLE = 0x06
    const TAG_UTF8_U8 = 0x07
    const TAG_TRUE = 0x0A
    const TAG_FALSE = 0x0B
    const TAG_ENTITY_REF = 0x0C
    const TAG_IDENT = 0x0D
    const TAG_SUBIDENT = 0x0E
    const TAG_SUBTYPE_OPEN = 0x0F
    const TAG_SUBTYPE_CLOSE = 0x10
    const TAG_TERMINATOR = 0x11
    const TAG_POSITION = 0x13
    const TAG_VECTOR_3D = 0x14

    const TAG_CHAR = 0x02
    const TAG_SHORT = 0x03
    const TAG_LONG = 0x04
    const TAG_FLOAT = 0x05
    const TAG_UTF8_U16 = 0x08
    const TAG_UTF8_U32_A = 0x09
    const TAG_UTF8_U32_B = 0x12
    const TAG_ENUM_VALUE = 0x15
    const TAG_INT64 = 0x17

    switch (tag) {
      case TAG_CHAR: // 0x02
        val = acisData[pos++]
        desc = `char: ${val}`
        break
      case TAG_SHORT: // 0x03
        val = view.getInt16(pos, true)
        pos += 2
        desc = `short: ${val}`
        break
      case TAG_LONG: // 0x04
        val = readSLong()
        desc = `long: ${val}`
        break
      case TAG_FLOAT: // 0x05
        val = view.getFloat32(pos, true)
        pos += 4
        desc = `float: ${val}`
        break
      case TAG_UTF8_U8: // 0x07
      case TAG_IDENT:   // 0x0D
      case TAG_SUBIDENT: // 0x0E
        const len = acisData[pos++]
        val = new TextDecoder().decode(acisData.slice(pos, pos + len))
        pos += len
        desc = `string(${len}): "${val}"`
        break
      case TAG_UTF8_U16: // 0x08
        const len16 = view.getUint16(pos, true)
        pos += 2
        val = new TextDecoder().decode(acisData.slice(pos, pos + len16))
        pos += len16
        desc = `string16(${len16}): "${val}"`
        break
      case TAG_UTF8_U32_A: // 0x09
      case TAG_UTF8_U32_B: // 0x12
        const len32 = view.getUint32(pos, true)
        pos += 4
        val = new TextDecoder().decode(acisData.slice(pos, pos + len32))
        pos += len32
        desc = `string32(${len32}): "${val}"`
        break
      case TAG_DOUBLE: // 0x06
        val = view.getFloat64(pos, true)
        pos += 8
        desc = `double: ${val}`
        break
      case TAG_ENTITY_REF: // 0x0C
        val = readSLong()
        desc = `ref: $${val}`
        break
      case TAG_TRUE:
        val = true
        desc = 'true'
        break
      case TAG_FALSE:
        val = false
        desc = 'false'
        break
      case TAG_TERMINATOR:
        val = '#'
        desc = 'terminator'
        break
      case TAG_POSITION:
        const x = view.getFloat64(pos, true)
        const y = view.getFloat64(pos + 8, true)
        const z = view.getFloat64(pos + 16, true)
        pos += 24
        val = {x, y, z}
        desc = `position: (${x}, ${y}, ${z})`
        break
      case TAG_VECTOR_3D:
        const vx = view.getFloat64(pos, true)
        const vy = view.getFloat64(pos + 8, true)
        const vz = view.getFloat64(pos + 16, true)
        pos += 24
        val = {x: vx, y: vy, z: vz}
        desc = `vector3d: (${vx}, ${vy}, ${vz})`
        break
      case TAG_VECTOR_2D: // 0x16
        const u = view.getFloat64(pos, true)
        const v = view.getFloat64(pos + 8, true)
        pos += 16
        val = {u, v}
        desc = `vector2d: (${u}, ${v})`
        break
      case TAG_SUBTYPE_OPEN:
        val = '{'
        desc = 'subtype_open'
        break
      case TAG_SUBTYPE_CLOSE:
        val = '}'
        desc = 'subtype_close'
        break
      case TAG_ENUM_VALUE: // 0x15
        const enumLen = acisData[pos++]
        val = new TextDecoder().decode(acisData.slice(pos, pos + enumLen))
        pos += enumLen
        desc = `enum: "${val}"`
        break
      case TAG_INT64: // 0x17
        val = readSLong()
        desc = `int64: ${val}`
        break
      case 0x00:
        desc = `NULL/END marker`
        break
      case 0x01:
        desc = `TAG 0x01 (unknown purpose)`
        break
      default:
        desc = `UNKNOWN TAG 0x${tag.toString(16)}`
        // Show surrounding bytes
        const start = Math.max(0, startPos - 10)
        const end = Math.min(acisData.length, startPos + 20)
        const bytes = Array.from(acisData.slice(start, end))
          .map((b, i) => `${i === (startPos - start) ? '[' : ''}${b.toString(16).padStart(2, '0')}${i === (startPos - start) ? ']' : ''}`)
          .join(' ')
        console.log(`  Context bytes: ${bytes}`)
    }

    return { tag, val, desc, startPos }
  }

  // Read header chunks
  console.log('\nHeader chunks (prodId, prodVer, date, scale, resabs, resnor):')
  for (let i = 0; i < 6; i++) {
    const chunk = readChunk()
    console.log(`  ${i}: pos ${chunk.startPos}: tag 0x${chunk.tag.toString(16)} - ${chunk.desc}`)
    if (chunk.desc.startsWith('UNKNOWN')) {
      console.log(`\n*** Stopping at unknown tag ***`)
      return
    }
  }

  console.log(`\nPosition after header chunks: ${pos}`)

  // Read first few records
  console.log('\n=== Reading Records ===')
  let recordCount = 0
  while (pos < acisData.length && recordCount < 100) {
    console.log(`\n--- Record ${recordCount} at position ${pos} ---`)

    // Read record identifier/index
    let recordIndex = -1
    let chunk = readChunk()
    console.log(`  First chunk: tag 0x${chunk.tag.toString(16)} - ${chunk.desc}`)

    if (chunk.desc.startsWith('UNKNOWN')) break

    // Check if first chunk is index or identifier
    if (chunk.tag !== 0x0D && chunk.tag !== 0x0E) {
      recordIndex = chunk.val
      chunk = readChunk()
      console.log(`  Record index: ${recordIndex}`)
      console.log(`  Name chunk: tag 0x${chunk.tag.toString(16)} - ${chunk.desc}`)
    }

    // Read class names
    const names = [chunk.val]
    while (chunk.tag !== 0x0D) { // TAG_IDENT
      chunk = readChunk()
      names.push(chunk.val)
    }
    const recordName = names.filter(n => n).join('-')
    console.log(`  Record name: ${recordName}`)

    if (recordName.startsWith('End-of-')) {
      console.log(`  End marker - stopping`)
      break
    }

    // Read record chunks until terminator
    let chunkCount = 0
    while (pos < acisData.length && chunkCount < 50) {
      chunk = readChunk()
      if (chunk.tag === 0x11) { // TAG_TERMINATOR
        console.log(`  ... ${chunkCount} chunks, terminated`)
        break
      }
      if (chunk.desc.startsWith('UNKNOWN')) {
        console.log(`  *** Unknown tag at chunk ${chunkCount} ***`)
        break
      }
      chunkCount++
    }

    recordCount++
  }
}

const f3dPath = process.argv[2] || '/Users/ahmadjalil/github/Stepifi/slzb-06-wall-mount.f3d'
debugAcis(f3dPath).catch(console.error)
