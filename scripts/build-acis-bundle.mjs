#!/usr/bin/env node
/**
 * Build script for acis-bundle.js
 * Bundles all acis-js modules into a single IIFE for web worker use
 */

import { readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ACIS_JS_DIR = join(__dirname, '../public/acis-js')
const OUTPUT_FILE = join(__dirname, '../public/acis-bundle.js')

// Files to bundle in dependency order
const FILES = [
  'constants.js',
  'math.js',
  'data-classes.js',
  'utils.js',
  'chunks.js',
  'entity.js',
  'topology.js',
  'curves.js',
  'surfaces.js',
  'attributes.js',
  'spline.js',
  'reader.js',
  'type-mappings.js',
  'geometry-builder.js'
]

function stripImports(code) {
  // Remove import statements
  return code.replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, '')
             .replace(/^import\s+\{[\s\S]*?\}\s+from\s+['"].*?['"];?\s*$/gm, '')
             .replace(/^import\s+\*\s+as\s+\w+\s+from\s+['"].*?['"];?\s*$/gm, '')
}

function stripExports(code) {
  // Convert "export function" to just "function"
  code = code.replace(/^export\s+function\s+/gm, 'function ')
  // Convert "export class" to just "class"
  code = code.replace(/^export\s+class\s+/gm, 'class ')
  // Convert "export const" to just "const"
  code = code.replace(/^export\s+const\s+/gm, 'const ')
  // Convert "export let" to just "let"
  code = code.replace(/^export\s+let\s+/gm, 'let ')
  // Remove "export { ... }" statements (single or multi-line)
  code = code.replace(/^export\s+\{[\s\S]*?\}\s*;?\s*$/gm, '')
  // Remove "export default { ... }" multi-line objects
  code = code.replace(/^export\s+default\s+\{[\s\S]*?\n\}\s*$/gm, '')
  // Remove "export default" single line statements
  code = code.replace(/^export\s+default\s+[^{].*$/gm, '')
  // Remove standalone "export *" statements
  code = code.replace(/^export\s+\*\s+from\s+['"].*?['"];?\s*$/gm, '')
  return code
}

function fixCircularDependencies(code, filename) {
  // In surfaces.js, the placeholder variables conflict with the actual functions in spline.js
  // Rename the placeholders to avoid conflicts
  if (filename === 'surfaces.js') {
    code = code.replace(/let readCurve, readSurface, readLaw/g, 'let _readCurveFn, _readSurfaceFn, _readLawFn')
    code = code.replace(/readCurve = fn/g, '_readCurveFn = fn')
    code = code.replace(/readSurface = fn/g, '_readSurfaceFn = fn')
    code = code.replace(/readLaw = fn/g, '_readLawFn = fn')
    // Replace usages (but not the function definitions which come from spline.js)
    code = code.replace(/readCurve \? readCurve\(/g, '_readCurveFn ? _readCurveFn(')
    code = code.replace(/readSurface \? readSurface\(/g, '_readSurfaceFn ? _readSurfaceFn(')
    code = code.replace(/readLaw \? readLaw\(/g, '_readLawFn ? _readLawFn(')
  }
  return code
}

function processFile(filename) {
  const filepath = join(ACIS_JS_DIR, filename)
  let code = readFileSync(filepath, 'utf-8')

  // Strip imports and exports
  code = stripImports(code)
  code = stripExports(code)

  // Fix circular dependency naming conflicts
  code = fixCircularDependencies(code, filename)

  // Add section header
  const header = `\n// ============================================================================\n// ${filename}\n// ============================================================================\n\n`

  return header + code
}

function buildBundle() {
  console.log('Building acis-bundle.js from acis-js/ modules...')

  let bundle = `/**
 * ACIS Parser Bundle
 * Auto-generated from acis-js modules
 * Generated: ${new Date().toISOString()}
 *
 * For use with Web Workers via importScripts()
 */

;(function(global) {
  'use strict'

`

  // Process each file
  for (const file of FILES) {
    console.log(`  Processing ${file}...`)
    bundle += processFile(file)
  }

  // Add initialization code for circular dependencies
  bundle += `
// ============================================================================
// Circular Dependency Resolution
// ============================================================================

// Wire up the circular dependencies
// surfaces.js uses _readCurveFn, _readSurfaceFn, _readLawFn as placeholders
// spline.js defines the actual readCurve, readSurface, readLaw functions
setCurveReader(readCurve)
setSurfaceReader(readSurface)
setLawReader(readLaw)

// Initialize curve and surface class mappings (from index.js)
const _CURVES = {
  'compcurv': CurveComp,
  'degenerate_curve': CurveDegenerate,
  'ellipse': CurveEllipse,
  'intcurve': CurveInt,
  'intcurve-intcurve': CurveIntInt,
  'pcurve': CurveP,
  'straight': CurveStraight,
  'null_curve': null,
  'null_pcurve': null
}

const _SURFACES = {
  'cone': SurfaceCone,
  'mesh': SurfaceMesh,
  'plane': SurfacePlane,
  'sphere': SurfaceSphere,
  'spline': SurfaceSpline,
  'torus': SurfaceTorus,
  'null_surface': null
}

setCurveClasses(_CURVES)
setSurfaceClasses(_SURFACES)
setTransformClass(Transform)

// ============================================================================
// High-level API Functions
// ============================================================================

/**
 * Parse ACIS binary data and return bodies
 */
function parseAcisBinary(data) {
  const reader = new AcisReader()
  if (!reader.readBinary(data)) {
    throw new Error('Failed to parse ACIS binary data')
  }
  reader.resolveEntities(RECORD_2_ENTITY)
  return reader.bodies
}

/**
 * Parse ACIS text data and return bodies
 */
function parseAcisText(data) {
  const reader = new AcisReader()
  if (!reader.readText(data)) {
    throw new Error('Failed to parse ACIS text data')
  }
  reader.resolveEntities(RECORD_2_ENTITY)
  return reader.bodies
}

/**
 * Detect ACIS format and parse accordingly
 */
function parseAcis(data) {
  if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data)
    const header = new TextDecoder().decode(bytes.slice(0, 15))

    if (header.startsWith('ACIS BinaryFile') || header.startsWith('ASM BinaryFile')) {
      return parseAcisBinary(data)
    }
    return parseAcisText(data)
  }
  return parseAcisText(data)
}

/**
 * Get all faces from bodies
 */
function getAllFaces(bodies) {
  const faces = []
  for (const body of bodies) {
    const lumps = body.getLumps ? body.getLumps() : []
    for (const lump of lumps) {
      const shells = lump.getShells ? lump.getShells() : []
      for (const shell of shells) {
        const shellFaces = shell.getFaces ? shell.getFaces() : []
        faces.push(...shellFaces)
      }
    }
  }
  return faces
}

/**
 * Get all edges from bodies
 */
function getAllEdges(bodies) {
  const edges = []
  const seen = new Set()

  for (const body of bodies) {
    const lumps = body.getLumps ? body.getLumps() : []
    for (const lump of lumps) {
      const shells = lump.getShells ? lump.getShells() : []
      for (const shell of shells) {
        const faces = shell.getFaces ? shell.getFaces() : []
        for (const face of faces) {
          const loops = face.getLoops ? face.getLoops() : []
          for (const loop of loops) {
            const coedges = loop.getCoedges ? loop.getCoedges() : []
            for (const coedge of coedges) {
              const edge = coedge.getEdge ? coedge.getEdge() : null
              if (edge && !seen.has(edge.index)) {
                seen.add(edge.index)
                edges.push(edge)
              }
            }
          }
        }
      }
    }
  }
  return edges
}

/**
 * Find the start of ACIS data in SMB/SMBH files
 */
function findACISDataStart(data) {
  const view = data instanceof Uint8Array ? data : new Uint8Array(data)
  for (let i = 0; i < Math.min(1024, view.length - 1); i++) {
    if (view[i] === 0x0d) {
      if (i + 1 < view.length && view[i + 1] < 64 && view[i + 1] > 0) {
        return i
      }
    }
  }
  if (view[0] === 0x0d) return 0
  return 0
}

/**
 * Parse F3D file (Fusion 360 ZIP format)
 */
async function parseF3D(arrayBuffer, loadJSZip) {
  const JSZip = await loadJSZip()
  const zip = await JSZip.loadAsync(arrayBuffer)
  const files = Object.keys(zip.files)

  const smbFiles = files.filter(f =>
    f.toLowerCase().endsWith('.smb') || f.toLowerCase().endsWith('.smbh')
  )

  if (smbFiles.length === 0) {
    throw new Error('No ACIS binary data (.smb/.smbh) found in F3D file')
  }

  const allBodies = []

  for (const smbFile of smbFiles) {
    try {
      const smbData = await zip.file(smbFile).async('arraybuffer')
      console.log('Parsing ' + smbFile + ': ' + smbData.byteLength + ' bytes')

      const bodies = parseAcisBinary(new Uint8Array(smbData))
      console.log('  Found ' + bodies.length + ' bodies')
      allBodies.push(...bodies)
    } catch (e) {
      console.warn('Failed to parse ' + smbFile + ':', e.message)
      console.warn(e.stack)
    }
  }

  if (allBodies.length === 0) {
    throw new Error('No geometry bodies found in F3D file')
  }

  return allBodies
}

// ============================================================================
// Geometry Conversion Functions (for OpenCascade.js)
// ============================================================================

/**
 * Convert ACIS surface entity to OpenCascade surface
 */
function convertACISSurface(oc, surfaceEntity) {
  if (!surfaceEntity) return null

  try {
    const typeName = surfaceEntity.getType ? surfaceEntity.getType() : ''

    if (typeName.includes('plane')) {
      const pnt = makePoint(oc, surfaceEntity.origin)
      const dir = makeDirection(oc, surfaceEntity.normal)
      return new oc.Geom_Plane_2(pnt, dir)
    } else if (typeName.includes('cone')) {
      const ax3 = makeAx3(oc, surfaceEntity.center, surfaceEntity.axis, surfaceEntity.uvOrigin)
      const radius = surfaceEntity.majorRadius || 1.0
      const semiAngle = Math.abs(surfaceEntity.semiAngle) || Math.PI / 4
      if (Math.abs(semiAngle) < 1e-6) {
        return new oc.Geom_CylindricalSurface_1(ax3, radius)
      }
      return new oc.Geom_ConicalSurface_1(ax3, semiAngle, radius)
    } else if (typeName.includes('sphere')) {
      const ax3 = makeAx3(oc, surfaceEntity.center, { x: 0, y: 0, z: 1 })
      const radius = surfaceEntity.radius || 1.0
      return new oc.Geom_SphericalSurface_1(ax3, radius)
    } else if (typeName.includes('torus')) {
      const ax3 = makeAx3(oc, surfaceEntity.center, surfaceEntity.axis)
      const majorRadius = Math.abs(surfaceEntity.major) || 2.0
      const minorRadius = Math.abs(surfaceEntity.minor) || 0.5
      return new oc.Geom_ToroidalSurface_1(ax3, majorRadius, minorRadius)
    } else if (typeName.includes('spline') && surfaceEntity.nubs) {
      return createBSplineSurface(oc, surfaceEntity.nubs)
    }

    console.warn('Unsupported surface type: ' + typeName)
    return null
  } catch (e) {
    console.warn('Failed to convert surface:', e.message)
    return null
  }
}

/**
 * Convert ACIS curve entity to OpenCascade curve
 */
function convertACISCurve(oc, curveEntity, startPt, endPt) {
  if (!curveEntity) return null

  try {
    const typeName = curveEntity.getType ? curveEntity.getType() : ''

    if (typeName.includes('straight')) {
      const origin = makePoint(oc, curveEntity.origin)
      const direction = makeDirection(oc, curveEntity.direction)
      return new oc.Geom_Line_2(origin, direction)
    } else if (typeName.includes('ellipse')) {
      const center = makePoint(oc, curveEntity.center)
      const normal = makeDirection(oc, curveEntity.axis)
      const majorVec = curveEntity.major || { x: 1, y: 0, z: 0 }
      const majorAxis = makeDirection(oc, majorVec)
      const majorRadius = Math.sqrt(majorVec.x ** 2 + majorVec.y ** 2 + majorVec.z ** 2) || 1.0
      const ratio = curveEntity.ratio || 1.0
      const minorRadius = majorRadius * ratio

      const ax2 = new oc.gp_Ax2_2(center, normal, majorAxis)

      if (Math.abs(ratio - 1.0) < 1e-6) {
        return new oc.Geom_Circle_2(ax2, majorRadius)
      } else {
        return new oc.Geom_Ellipse_1(ax2, majorRadius, minorRadius)
      }
    } else if ((typeName.includes('intcurve') || typeName.includes('spline')) && curveEntity.nubs) {
      return createBSplineCurve(oc, curveEntity.nubs, 'forward', typeName)
    }

    // Fallback: create line between start and end points
    if (startPt && endPt) {
      const p1 = makePoint(oc, startPt)
      const p2 = makePoint(oc, endPt)
      const dir = makeDirection(oc, {
        x: endPt.x - startPt.x,
        y: endPt.y - startPt.y,
        z: endPt.z - startPt.z
      })
      return new oc.Geom_Line_2(p1, dir)
    }

    console.warn('Unsupported curve type: ' + typeName)
    return null
  } catch (e) {
    console.warn('Failed to convert curve:', e.message)
    return null
  }
}

/**
 * Convert ACIS edge to OpenCascade edge
 */
function convertACISEdge(oc, edgeEntity) {
  if (!edgeEntity) return null

  try {
    const curveEntity = edgeEntity.getCurve ? edgeEntity.getCurve() : null
    const startPt = edgeEntity.getStart ? edgeEntity.getStart() : null
    const endPt = edgeEntity.getEnd ? edgeEntity.getEnd() : null

    if (startPt && endPt) {
      const p1 = makePoint(oc, startPt)
      const p2 = makePoint(oc, endPt)

      const dx = endPt.x - startPt.x
      const dy = endPt.y - startPt.y
      const dz = endPt.z - startPt.z
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

      if (dist < 1e-6) return null

      const curve = convertACISCurve(oc, curveEntity, startPt, endPt)

      if (curve) {
        try {
          const handleCurve = new oc.Handle_Geom_Curve_2(curve)
          if (curveEntity && curveEntity.getType && curveEntity.getType().includes('straight')) {
            const builder = new oc.BRepBuilderAPI_MakeEdge_24(handleCurve, 0, dist)
            if (builder.IsDone()) return builder.Edge()
          }
          const builder = new oc.BRepBuilderAPI_MakeEdge_20(handleCurve)
          if (builder.IsDone()) return builder.Edge()
        } catch (e) {
          // Fall through to point-based edge
        }
      }

      const builder = new oc.BRepBuilderAPI_MakeEdge_3(p1, p2)
      if (builder.IsDone()) return builder.Edge()
    }
  } catch (e) {
    console.warn('Failed to create edge:', e.message)
  }
  return null
}

/**
 * Convert ACIS loop to OpenCascade wire
 */
function convertACISLoop(oc, loopEntity) {
  if (!loopEntity) return null

  try {
    const coedges = loopEntity.getCoedges ? loopEntity.getCoedges() : []
    if (coedges.length === 0) return null

    const wireBuilder = new oc.BRepBuilderAPI_MakeWire_1()
    let edgeCount = 0

    for (const coedge of coedges) {
      const edgeEntity = coedge.getEdge ? coedge.getEdge() : null
      if (!edgeEntity) continue

      const edge = convertACISEdge(oc, edgeEntity)
      if (edge) {
        if (coedge.sense === 'reversed') edge.Reverse()
        try {
          wireBuilder.Add_1(edge)
          edgeCount++
        } catch (e) {
          // Edge might not connect properly
        }
      }
    }

    if (edgeCount > 0 && wireBuilder.IsDone()) {
      return wireBuilder.Wire()
    }
  } catch (e) {
    console.warn('Failed to create wire:', e.message)
  }
  return null
}

/**
 * Convert ACIS face to OpenCascade face
 */
function convertACISFace(oc, faceEntity) {
  if (!faceEntity) return null

  try {
    const surfaceEntity = faceEntity.getSurface ? faceEntity.getSurface() : null
    const surface = convertACISSurface(oc, surfaceEntity)

    if (!surface) {
      console.warn('No surface for face, skipping')
      return null
    }

    const handleSurface = new oc.Handle_Geom_Surface_2(surface)
    const loops = faceEntity.getLoops ? faceEntity.getLoops() : []

    if (loops.length > 0) {
      const outerLoop = loops[0]
      const outerWire = convertACISLoop(oc, outerLoop)

      if (outerWire) {
        try {
          const faceBuilder = new oc.BRepBuilderAPI_MakeFace_15(handleSurface, outerWire, true)

          for (let i = 1; i < loops.length; i++) {
            const innerWire = convertACISLoop(oc, loops[i])
            if (innerWire) {
              innerWire.Reverse()
              faceBuilder.Add(innerWire)
            }
          }

          if (faceBuilder.IsDone()) {
            const result = faceBuilder.Face()
            if (faceEntity.sense === 'reversed') result.Reverse()
            return result
          }
        } catch (e) {
          // Fall through to unbounded face
        }
      }
    }

    try {
      const faceBuilder = new oc.BRepBuilderAPI_MakeFace_8(handleSurface, 1e-6)
      if (faceBuilder.IsDone()) {
        const result = faceBuilder.Face()
        if (faceEntity.sense === 'reversed') result.Reverse()
        return result
      }
    } catch (e) {
      console.warn('Failed to create unbounded face:', e.message)
    }
  } catch (e) {
    console.warn('Failed to create face:', e.message)
  }
  return null
}

/**
 * Convert ACIS shell to OpenCascade shell
 */
function convertACISShell(oc, shellEntity) {
  if (!shellEntity) return null

  try {
    const faces = shellEntity.getFaces ? shellEntity.getFaces() : []
    if (faces.length === 0) return null

    const builder = new oc.BRep_Builder()
    const ocShell = new oc.TopoDS_Shell()
    builder.MakeShell(ocShell)

    let faceCount = 0
    for (const faceEntity of faces) {
      const ocFace = convertACISFace(oc, faceEntity)
      if (ocFace) {
        builder.Add(ocShell, ocFace)
        faceCount++
      }
    }

    if (faceCount > 0) {
      console.log('  Created shell with ' + faceCount + ' faces')
      return ocShell
    }
  } catch (e) {
    console.warn('Failed to create shell:', e.message)
  }
  return null
}

/**
 * Convert ACIS body to OpenCascade shape
 */
function convertACISBody(oc, bodyEntity) {
  if (!bodyEntity) return null

  const shapes = []

  try {
    const lumps = bodyEntity.lumps || (bodyEntity.getLumps ? bodyEntity.getLumps() : [])

    for (const lump of lumps) {
      const shells = lump.shells || (lump.getShells ? lump.getShells() : [])

      for (const shell of shells) {
        const ocShell = convertACISShell(oc, shell)
        if (ocShell) {
          try {
            const solidBuilder = new oc.BRepBuilderAPI_MakeSolid_2(ocShell)
            if (solidBuilder.IsDone()) {
              shapes.push(solidBuilder.Solid())
            } else {
              shapes.push(ocShell)
            }
          } catch (e) {
            shapes.push(ocShell)
          }
        }
      }
    }

    if (shapes.length === 0) return null
    if (shapes.length === 1) return shapes[0]

    const builder = new oc.BRep_Builder()
    const compound = new oc.TopoDS_Compound()
    builder.MakeCompound(compound)

    for (const shape of shapes) {
      builder.Add(compound, shape)
    }

    return compound
  } catch (e) {
    console.warn('Failed to convert body:', e.message)
  }
  return null
}

/**
 * Convert ACIS bodies to OpenCascade compound shape
 */
function convertACISBodiesToShape(oc, bodies) {
  if (!bodies || bodies.length === 0) return null

  console.log('Converting ' + bodies.length + ' ACIS bodies to OpenCascade shapes...')

  const shapes = []
  let totalFaces = 0

  for (let i = 0; i < bodies.length; i++) {
    const body = bodies[i]
    console.log('  Processing body ' + (i + 1) + '/' + bodies.length + '...')

    const lumps = body.getLumps ? body.getLumps() : []
    for (const lump of lumps) {
      const shells = lump.getShells ? lump.getShells() : []
      for (const shell of shells) {
        const faces = shell.getFaces ? shell.getFaces() : []
        totalFaces += faces.length
      }
    }

    const shape = convertACISBody(oc, body)
    if (shape) shapes.push(shape)
  }

  console.log('  Total faces to process: ' + totalFaces)

  if (shapes.length === 0) {
    throw new Error('Failed to convert any ACIS bodies to geometry')
  }

  if (shapes.length === 1) return shapes[0]

  const builder = new oc.BRep_Builder()
  const compound = new oc.TopoDS_Compound()
  builder.MakeCompound(compound)

  for (const shape of shapes) {
    builder.Add(compound, shape)
  }

  console.log('  Combined ' + shapes.length + ' shapes into compound')
  return compound
}

// ============================================================================
// Export to global
// ============================================================================

global.ACIS = {
  // Reader
  AcisReader,
  RECORD_2_ENTITY,

  // Parsing functions
  parseAcis,
  parseAcisBinary,
  parseAcisText,
  parseF3D,

  // Entity traversal
  getAllFaces,
  getAllEdges,
  extractColor,
  extractName,
  findACISDataStart,

  // Classes
  Entity, Body, Lump, Shell, Face, Loop, CoEdge, Edge, Vertex,
  Curve, CurveStraight, CurveEllipse, CurveInt,
  Surface, SurfacePlane, SurfaceCone, SurfaceSphere, SurfaceTorus, SurfaceSpline,
  Point, Transform,

  // Data structures
  Range, Interval, BS_Curve, BS_Surface, Helix,

  // Math functions
  VEC, NORM, CROSS, DOT, SIZE,

  // Geometry builder functions
  makePoint,
  makePoint2d,
  makeDirection,
  makeVec,
  makeAx1,
  makeAx2,
  makeAx3,
  createLine,
  createCircle,
  createEllipse,
  createBSplineCurve,
  createBSplineCurve2d,
  createBSplineSurface,
  createPlaneSurface,
  createCylindricalSurface,
  createConicalSurface,
  createSphericalSurface,
  createToroidalSurface,
  createFaceFromSurface,
  createEdgeFromCurve
}

// ACISParser for backwards compatibility
global.ACISParser = {
  parseF3D: parseF3D
}

// ACISGeometry for OpenCascade.js conversion
global.ACISGeometry = {
  convertACISBody,
  convertACISBodiesToShape,
  convertACISSurface,
  convertACISCurve,
  convertACISEdge,
  convertACISFace,
  convertACISShell
}

})(typeof self !== 'undefined' ? self : this)
`

  // Write the bundle
  writeFileSync(OUTPUT_FILE, bundle)
  console.log(`\nBundle written to ${OUTPUT_FILE}`)
  console.log(`Size: ${(bundle.length / 1024).toFixed(1)} KB`)
}

buildBundle()
