#!/usr/bin/env node
/**
 * Examine raw ACIS chunks for a cone surface to understand the major vector encoding
 */
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const acisCode = readFileSync(join(__dirname, 'public/acis-bundle.js'), 'utf-8')
const self = { ACISParser: null }
new Function('self', acisCode)(self)

const jszipCode = readFileSync(join(__dirname, 'node_modules/jszip/dist/jszip.min.js'), 'utf-8')
const loadJSZip = async () => {
  const module = { exports: {} }
  new Function('module', 'exports', jszipCode)(module, module.exports)
  return module.exports
}

const f3dData = readFileSync(join(__dirname, 'slzb-06-wall-mount.f3d')).buffer
const bodies = await self.ACISParser.parseF3D(f3dData, loadJSZip)

// Find first cone surface record and print its raw chunks
const body = bodies[0]
for (const lump of body.getLumps()) {
  for (const shell of lump.getShells()) {
    for (const face of shell.getFaces()) {
      const surf = face.getSurface()
      if (!surf) continue
      const type = surf.getType ? surf.getType() : ''
      if (type.includes('cone')) {
        console.log('=== Cone surface raw record ===')
        console.log('Record name:', surf.record?.name)
        console.log('Record index:', surf.record?.index)
        const chunks = surf.record?.chunks || []
        console.log(`Chunks (${chunks.length}):`)
        for (let ci = 0; ci < chunks.length; ci++) {
          const c = chunks[ci]
          const desc = {
            tag: c.tag,
            type: c.type || 'unknown',
            val: c.val,
          }
          if (c.scale !== undefined) desc.scale = c.scale
          if (c.type === 'position') {
            desc.value = c.value
          } else if (c.type === 'vector3d') {
            desc.value = c.value
          }
          console.log(`  [${ci}]`, JSON.stringify(desc))
        }

        // Also check the face entity
        console.log('\n=== Face entity ===')
        console.log('Face record name:', face.record?.name)
        const faceChunks = face.record?.chunks || []
        for (let ci = 0; ci < faceChunks.length; ci++) {
          const c = faceChunks[ci]
          console.log(`  [${ci}] tag=${c.tag} type=${c.type||'?'} val=${JSON.stringify(c.val)?.slice(0,80)}`)
        }

        // Check one of the ellipse curve records
        for (const loop of face.getLoops()) {
          for (const ce of loop.getCoedges()) {
            const edge = ce.getEdge()
            if (!edge) continue
            const curve = edge.getCurve()
            if (!curve) continue
            const ct = curve.getType ? curve.getType() : ''
            if (ct.includes('ellipse')) {
              console.log('\n=== Ellipse curve raw record ===')
              const eChunks = curve.record?.chunks || []
              for (let ci = 0; ci < eChunks.length; ci++) {
                const c = eChunks[ci]
                const desc = {
                  tag: c.tag,
                  type: c.type || 'unknown',
                  val: c.val,
                }
                if (c.scale !== undefined) desc.scale = c.scale
                if (c.type === 'position') desc.value = c.value
                if (c.type === 'vector3d') desc.value = c.value
                console.log(`  [${ci}]`, JSON.stringify(desc))
              }
              break
            }
          }
          break
        }

        process.exit(0)
      }
    }
  }
}
