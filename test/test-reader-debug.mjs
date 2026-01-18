#!/usr/bin/env node
/**
 * Debug the actual ACIS reader to see where parsing fails
 */

import { readFileSync } from 'fs'
import JSZip from 'jszip'
import { AcisReader, RECORD_2_ENTITY } from './acis-js/index.js'
import { setIntSize, getIntSize } from './acis-js/chunks.js'

async function debugReader(f3dPath) {
  console.log(`\nDebugging reader for: ${f3dPath}`)

  const data = readFileSync(f3dPath)
  const zip = await JSZip.loadAsync(data)

  // Get the .smb file
  const brepFile = Object.keys(zip.files).find(n => n.endsWith('.smb'))
  if (!brepFile) {
    console.log('No .smb file found')
    return
  }

  console.log(`\nAnalyzing: ${brepFile}`)

  const buffer = await zip.files[brepFile].async('arraybuffer')
  const acisData = new Uint8Array(buffer)

  // Show header
  const header = new TextDecoder().decode(acisData.slice(0, 15))
  console.log(`Format: "${header}"`)

  // Reset intSize before parsing
  setIntSize(4)
  console.log(`Initial intSize: ${getIntSize()}`)

  // Create reader and try to parse
  const reader = new AcisReader()

  // Monkey-patch _readChunkBinary to add logging
  const originalReadChunk = reader._readChunkBinary.bind(reader)
  let chunkCount = 0
  reader._readChunkBinary = function() {
    const pos = this._pos
    const tag = this._data[pos]
    chunkCount++
    if (chunkCount <= 20 || tag === 0) {
      console.log(`  Chunk ${chunkCount}: pos=${pos}, tag=0x${tag.toString(16)}`)
    }
    try {
      return originalReadChunk()
    } catch (e) {
      console.log(`  ERROR at pos=${pos}, tag=0x${tag.toString(16)}: ${e.message}`)
      // Show surrounding bytes
      const start = Math.max(0, pos - 10)
      const end = Math.min(this._data.length, pos + 20)
      const bytes = Array.from(this._data.slice(start, end))
        .map((b, i) => {
          const marker = i === (pos - start) ? '[' : ''
          const markerEnd = i === (pos - start) ? ']' : ''
          return `${marker}${b.toString(16).padStart(2, '0')}${markerEnd}`
        })
        .join(' ')
      console.log(`  Context: ${bytes}`)
      throw e
    }
  }

  try {
    console.log(`\nParsing with reader...`)
    console.log(`intSize before parse: ${getIntSize()}`)
    const success = reader.readBinary(acisData)
    console.log(`Parse success: ${success}`)
    console.log(`intSize after parse: ${getIntSize()}`)
    console.log(`Total chunks read: ${chunkCount}`)
    console.log(`Version: ${reader.header.version}`)
    console.log(`Records: ${reader._records.length}`)
  } catch (e) {
    console.log(`\nParse failed after ${chunkCount} chunks: ${e.message}`)
    console.log(`intSize at failure: ${getIntSize()}`)
  }
}

const f3dPath = process.argv[2] || '/Users/ahmadjalil/github/Stepifi/slzb-06-wall-mount.f3d'
debugReader(f3dPath).catch(console.error)
