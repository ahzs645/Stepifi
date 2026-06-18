#!/usr/bin/env node
// Diagnostic: tally ACIS surface/curve types from a parsed F3D (production bundle parser),
// BEFORE any OpenCascade conversion — isolates parse-loss vs convert-loss.
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { runInThisContext } from 'vm'
import JSZip from 'jszip'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const INPUT = process.argv[2] || join(ROOT, 'slzb-06-wall-mount.f3d')

globalThis.self = globalThis
runInThisContext(readFileSync(join(ROOT, 'public/acis-bundle.js'), 'utf-8'))
const { parseF3D } = globalThis.ACISParser
const ACIS = globalThis.ACIS

const fileData = readFileSync(INPUT)
const ab = fileData.buffer.slice(fileData.byteOffset, fileData.byteOffset + fileData.byteLength)
const bodies = await parseF3D(ab, async () => JSZip)

let nFaces = 0
const surfTypes = {}
const curveTypes = {}
let facesWithSurface = 0, facesWithoutSurface = 0

for (const body of bodies) {
  const lumps = body.getLumps ? body.getLumps() : []
  for (const lump of lumps) {
    const shells = lump.getShells ? lump.getShells() : []
    for (const shell of shells) {
      const faces = shell.getFaces ? shell.getFaces() : []
      for (const face of faces) {
        nFaces++
        const surf = face.getSurface ? face.getSurface() : null
        if (surf) {
          facesWithSurface++
          const t = surf.getType ? surf.getType() : 'unknown'
          surfTypes[t] = (surfTypes[t] || 0) + 1
        } else {
          facesWithoutSurface++
        }
        const loops = face.getLoops ? face.getLoops() : []
        for (const loop of loops) {
          const coedges = loop.getCoedges ? loop.getCoedges() : []
          for (const ce of coedges) {
            const edge = ce.getEdge ? ce.getEdge() : null
            const cv = edge && edge.getCurve ? edge.getCurve() : null
            if (cv) {
              const t = cv.getType ? cv.getType() : 'unknown'
              curveTypes[t] = (curveTypes[t] || 0) + 1
            }
          }
        }
      }
    }
  }
}

console.log('bodies:', bodies.length)
console.log('faces:', nFaces, '(withSurface', facesWithSurface, ', withoutSurface', facesWithoutSurface, ')')
console.log('surface types:', JSON.stringify(surfTypes, null, 2))
console.log('curve types:', JSON.stringify(curveTypes, null, 2))
