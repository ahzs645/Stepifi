#!/usr/bin/env node
import { getSInt64, getUInt32, getSInt32 } from './acis-js/chunks.js'

// Test reading -1 (0xFFFFFFFFFFFFFFFF)
const minusOne = new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF])
const [val1, pos1] = getSInt64(minusOne, 0)
console.log(`Reading FF FF FF FF FF FF FF FF as signed 64-bit: ${val1}`)

// What getUInt32 returns for 0xFFFFFFFF
const lo = getUInt32(minusOne, 0)[0]
const hi = getSInt32(minusOne, 4)[0]
console.log(`  lo (unsigned 32): ${lo} (0x${lo.toString(16)})`)
console.log(`  hi (signed 32): ${hi}`)
console.log(`  lo === 0xffffffff: ${lo === 0xffffffff}`)
console.log(`  hi === -1: ${hi === -1}`)
console.log(`  computed: hi * 0x100000000 + lo = ${hi * 0x100000000 + lo}`)

// Test with explicit value
console.log(`\n0xffffffff value: ${0xffffffff}`)
console.log(`0xffffffff === 4294967295: ${0xffffffff === 4294967295}`)

// What about this value?
console.log(`\n-4294967297 in hex: 0x${(BigInt(-4294967297) & BigInt("0xFFFFFFFFFFFFFFFF")).toString(16)}`)
