#!/usr/bin/env node
/**
 * What is the global scale factor for this F3D file?
 * And what happens if we scale the cone major vector?
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

// Patch: intercept the parser to get the reader/scale
let capturedScale = null
const origParse = self.ACISParser.parseF3D
self.ACISParser.parseF3D = async function(...args) {
  const result = await origParse.apply(this, args)
  return result
}

const bodies = await self.ACISParser.parseF3D(f3dData, loadJSZip)

// Check the cone surface's scale field and see if that's related
const body = bodies[0]
const lumps = body.getLumps()
for (const lump of lumps) {
  for (const shell of lump.getShells()) {
    const faces = shell.getFaces()
    for (const face of faces) {
      const surf = face.getSurface()
      if (!surf) continue
      const type = surf.getType ? surf.getType() : ''

      if (type.includes('cone')) {
        console.log('Cone surface:')
        console.log('  center:', surf.center)
        console.log('  axis:', surf.axis)
        console.log('  major:', surf.major, '|major|=', Math.sqrt(surf.major.x**2+surf.major.y**2+surf.major.z**2))
        console.log('  sine:', surf.sine, 'cosine:', surf.cosine)
        console.log('  scale:', surf.scale)
        console.log('  ratio:', surf.ratio)
        console.log('  getMajorRadius():', surf.getMajorRadius())

        // Now check edges
        const loops = face.getLoops()
        if (loops.length > 0) {
          const coedges = loops[0].getCoedges()
          for (const ce of coedges) {
            const edge = ce.getEdge()
            if (!edge) continue
            const curve = edge.getCurve()
            const ct = curve && curve.getType ? curve.getType() : ''
            if (ct.includes('ellipse')) {
              console.log('  Circle edge:')
              console.log('    center:', curve.center)
              console.log('    major:', curve.major, '|major|=', Math.sqrt(curve.major.x**2+curve.major.y**2+curve.major.z**2))
              console.log('    ratio:', curve.ratio)
              console.log('    scale:', curve.scale)

              // Check if scale factor maps cone radius to circle radius
              const coneR = surf.getMajorRadius()
              const circleR = Math.sqrt(curve.major.x**2+curve.major.y**2+curve.major.z**2)
              console.log('    coneR/circleR ratio:', coneR / circleR)
              console.log('    circleR/coneR ratio:', circleR / coneR)

              // Check vertex distance from surface center
              const sp = edge.getStart()
              const sv = sp && sp.point ? sp.point : sp
              if (sv) {
                const dy = sv.y - surf.center.y
                const dx = sv.x - surf.center.x
                const dist = Math.sqrt(dx*dx + dy*dy)
                console.log('    vertex distance from axis:', dist.toFixed(4))
                console.log('    vertex/circleR:', (dist / circleR).toFixed(4))
                console.log('    vertex/coneR:', (dist / coneR).toFixed(4))
              }
              break
            }
          }
        }

        // Also check plane, sphere, torus for comparison
        break
      }
    }

    // Check a plane face
    let planeChecked = false
    for (const face of faces) {
      const surf = face.getSurface()
      if (!surf) continue
      const type = surf.getType ? surf.getType() : ''
      if (type.includes('plane') && !planeChecked) {
        planeChecked = true
        console.log('\nPlane surface:')
        console.log('  origin:', surf.origin)
        console.log('  normal:', surf.normal)

        const loops = face.getLoops()
        if (loops.length > 0) {
          const coedges = loops[0].getCoedges()
          for (const ce of coedges.slice(0, 2)) {
            const edge = ce.getEdge()
            if (!edge) continue
            const sp = edge.getStart(), ep = edge.getEnd()
            const sv = sp && sp.point ? sp.point : sp
            const ev = ep && ep.point ? ep.point : ep
            if (sv) console.log('  vertex:', sv)
          }
        }
      }
    }

    // Check a sphere face
    let sphereChecked = false
    for (const face of faces) {
      const surf = face.getSurface()
      if (!surf) continue
      const type = surf.getType ? surf.getType() : ''
      if (type.includes('sphere') && !sphereChecked) {
        sphereChecked = true
        console.log('\nSphere surface:')
        console.log('  center:', surf.center)
        console.log('  radius:', surf.radius)

        const loops = face.getLoops()
        if (loops.length > 0) {
          const coedges = loops[0].getCoedges()
          for (const ce of coedges.slice(0, 2)) {
            const edge = ce.getEdge()
            if (!edge) continue
            const sp = edge.getStart()
            const sv = sp && sp.point ? sp.point : sp
            if (sv && surf.center) {
              const dist = Math.sqrt((sv.x-surf.center.x)**2 + (sv.y-surf.center.y)**2 + (sv.z-surf.center.z)**2)
              console.log('  vertex dist from center:', dist.toFixed(4), 'radius:', surf.radius.toFixed(4))
            }
          }
        }
      }
    }

    break
  }
  break
}

// Let's also check: what does the ellipse curve parser read?
console.log('\n=== Checking ellipse curve parser ===')
for (const lump of body.getLumps()) {
  for (const shell of lump.getShells()) {
    for (const face of shell.getFaces()) {
      const loops = face.getLoops()
      for (const loop of loops) {
        for (const ce of loop.getCoedges()) {
          const edge = ce.getEdge()
          if (!edge) continue
          const curve = edge.getCurve()
          if (!curve) continue
          const ct = curve.getType ? curve.getType() : ''
          if (ct.includes('ellipse')) {
            // Check all properties
            console.log('Ellipse curve properties:', Object.keys(curve).filter(k => !k.startsWith('_')))
            console.log('  center:', curve.center)
            console.log('  axis:', curve.axis)
            console.log('  major:', curve.major)
            console.log('  ratio:', curve.ratio)
            console.log('  scale:', curve.scale)
            console.log('  range:', curve.range ? JSON.stringify(curve.range) : 'none')
            break
          }
        }
        break
      }
      break
    }
    break
  }
  break
}
