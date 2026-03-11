#!/usr/bin/env node
/**
 * Diagnostic: analyze ACIS body/shell/face structure in an F3D file
 * Reports which face types exist and how many intcurves fail
 */
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import JSZip from 'jszip'
import { AcisReader, RECORD_2_ENTITY } from './acis-js/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const f3dPath = process.argv[2] || join(__dirname, '..', 'slzb-06-wall-mount.f3d')

async function diagnose() {
  const data = readFileSync(f3dPath)
  const zip = await JSZip.loadAsync(data)
  const smbhFiles = Object.keys(zip.files).filter(f => f.toLowerCase().endsWith('.smbh'))

  for (const file of smbhFiles) {
    console.log(`\n=== ${file} ===`)
    const buf = await zip.files[file].async('arraybuffer')
    const reader = new AcisReader()
    reader.readBinary(new Uint8Array(buf))
    reader.resolveEntities(RECORD_2_ENTITY)

    console.log(`Header: version=${reader.header.version}, scale=${reader.header.scale}, resabs=${reader.header.resabs}`)
    console.log(`Bodies: ${reader.bodies.length}`)

    let totalFaces = 0, totalEdges = 0, totalLoops = 0
    let surfaceTypes = {}, curveTypes = {}, curveFailures = {}

    for (const body of reader.bodies) {
      const lumps = body.getLumps ? body.getLumps() : []
      for (const lump of lumps) {
        const shells = lump.getShells ? lump.getShells() : []
        for (const shell of shells) {
          const faces = shell.getFaces ? shell.getFaces() : []
          totalFaces += faces.length
          for (const face of faces) {
            const surf = face.getSurface ? face.getSurface() : null
            const stype = surf && surf.getType ? surf.getType() : 'unknown'
            surfaceTypes[stype] = (surfaceTypes[stype] || 0) + 1

            const loops = face.getLoops ? face.getLoops() : []
            totalLoops += loops.length
            for (const loop of loops) {
              const coedges = loop.getCoedges ? loop.getCoedges() : []
              for (const ce of coedges) {
                const edge = ce.getEdge ? ce.getEdge() : null
                if (!edge) continue
                totalEdges++
                const curve = edge.getCurve ? edge.getCurve() : null
                const ctype = curve && curve.getType ? curve.getType() : 'none'
                curveTypes[ctype] = (curveTypes[ctype] || 0) + 1

                // Check if intcurve has spline data
                if (ctype.includes('intcurve')) {
                  const spline = curve.spline || curve.nubs
                  if (!spline || !spline.poles || spline.poles.length === 0) {
                    curveFailures[ctype] = (curveFailures[ctype] || 0) + 1
                  }
                }
              }
            }
          }
        }
      }
    }

    console.log(`\nFaces: ${totalFaces}, Loops: ${totalLoops}, Edges: ${totalEdges}`)
    console.log('\nSurface types:')
    for (const [k, v] of Object.entries(surfaceTypes).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${k}: ${v}`)
    }
    console.log('\nCurve types:')
    for (const [k, v] of Object.entries(curveTypes).sort((a, b) => b[1] - a[1])) {
      const fail = curveFailures[k]
      console.log(`  ${k}: ${v}${fail ? ` (${fail} missing spline data)` : ''}`)
    }
    if (Object.keys(curveFailures).length > 0) {
      const totalFail = Object.values(curveFailures).reduce((a, b) => a + b, 0)
      console.log(`\n⚠ ${totalFail} edges have intcurves without spline data — these fall back to straight lines`)
    }
  }
}

diagnose().catch(console.error)
