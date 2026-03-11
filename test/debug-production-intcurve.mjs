#!/usr/bin/env node
/**
 * Debug: test intcurve parsing with PRODUCTION acis-js code (public/acis-js/)
 */
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import JSZip from 'jszip'

// Import from PRODUCTION source (public/acis-js/) via index.js which initializes mappings
import { AcisReader, RECORD_2_ENTITY } from '../public/acis-js/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const f3dPath = process.argv[2] || join(__dirname, '..', 'slzb-06-wall-mount.f3d')

async function debug() {
  const data = readFileSync(f3dPath)
  const zip = await JSZip.loadAsync(data)
  const smbhFiles = Object.keys(zip.files).filter(f => f.toLowerCase().endsWith('.smbh'))

  console.log(`File: ${f3dPath}`)
  console.log(`SMBH files: ${smbhFiles.join(', ')}`)

  for (const file of smbhFiles) {
    console.log(`\n=== ${file} ===`)
    const buf = await zip.files[file].async('arraybuffer')
    const reader = new AcisReader()
    reader.readBinary(new Uint8Array(buf))
    reader.resolveEntities(RECORD_2_ENTITY)

    console.log(`Bodies: ${reader.bodies.length}`)

    // Count intcurve results
    let totalEdges = 0, intcurveCount = 0, splineMissing = 0
    for (const body of reader.bodies) {
      const lumps = body.getLumps ? body.getLumps() : []
      for (const lump of lumps) {
        const shells = lump.getShells ? lump.getShells() : []
        for (const shell of shells) {
          const faces = shell.getFaces ? shell.getFaces() : []
          for (const face of faces) {
            const loops = face.getLoops ? face.getLoops() : []
            for (const loop of loops) {
              const coedges = loop.getCoedges ? loop.getCoedges() : []
              for (const ce of coedges) {
                const edge = ce.getEdge ? ce.getEdge() : null
                if (!edge) continue
                totalEdges++
                const curve = edge.getCurve ? edge.getCurve() : null
                const ctype = curve && curve.getType ? curve.getType() : 'none'
                if (ctype.includes('intcurve')) {
                  intcurveCount++
                  const spline = curve.spline || curve.nubs
                  if (!spline || !spline.poles || spline.poles.length === 0) {
                    splineMissing++
                  }
                }
              }
            }
          }
        }
      }
    }

    console.log(`Edges: ${totalEdges}, Intcurves: ${intcurveCount}, Missing spline: ${splineMissing}`)
  }
}

debug().catch(console.error)
