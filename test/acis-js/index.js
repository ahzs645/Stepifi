/**
 * ACIS Parser - JavaScript Module
 *
 * A modular JavaScript port of the ACIS parser from Python.
 * Designed to replace FreeCAD dependencies with OpenCascade.js.
 *
 * Usage:
 *   import { AcisReader, RECORD_2_ENTITY } from './acis-js/index.js'
 *
 *   const reader = new AcisReader(data)
 *   reader.readBinary(buffer) // or reader.readText(string)
 *   reader.resolveEntities(RECORD_2_ENTITY)
 *   const bodies = reader.bodies
 */

// ============================================================================
// Core Exports
// ============================================================================

// Constants
export * from './constants.js'

// Math utilities
export * from './math.js'

// Data classes
export * from './data-classes.js'

// Utility functions
export * from './utils.js'

// Binary chunk readers
export * from './chunks.js'

// Entity base classes
export * from './entity.js'

// Topology entities
export * from './topology.js'

// Curve geometry
export * from './curves.js'

// Surface geometry
export * from './surfaces.js'

// Attributes
export * from './attributes.js'

// B-Spline functions
export * from './spline.js'

// Main reader
export * from './reader.js'

// Type mappings
export * from './type-mappings.js'

// Geometry builder for OpenCascade.js
export * from './geometry-builder.js'

// ============================================================================
// Circular Dependency Resolution
// ============================================================================

import { setCurveReader, setSurfaceReader, setLawReader } from './surfaces.js'
import {
  readCurve as splineReadCurve,
  readSurface as splineReadSurface,
  readLaw as splineReadLaw,
  setCurveClasses,
  setSurfaceClasses,
  setTransformClass
} from './spline.js'

// Initialize surfaces.js with curve/surface reader functions from spline.js
setCurveReader(splineReadCurve)
setSurfaceReader(splineReadSurface)
setLawReader(splineReadLaw)

// Import classes for CURVES and SURFACES mappings
import { Transform } from './entity.js'
import {
  CurveComp, CurveDegenerate, CurveEllipse, CurveInt, CurveIntInt, CurveP, CurveStraight
} from './curves.js'
import {
  SurfaceCone, SurfaceMesh, SurfacePlane, SurfaceSphere, SurfaceSpline, SurfaceTorus
} from './surfaces.js'

// CURVES mapping (Python Acis.py lines 5342-5352)
const CURVES = {
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

// SURFACES mapping (Python Acis.py lines 5354-5362)
const SURFACES = {
  'cone': SurfaceCone,
  'mesh': SurfaceMesh,
  'plane': SurfacePlane,
  'sphere': SurfaceSphere,
  'spline': SurfaceSpline,
  'torus': SurfaceTorus,
  'null_surface': null
}

// Initialize spline.js with class mappings
setCurveClasses(CURVES)
setSurfaceClasses(SURFACES)
setTransformClass(Transform)

// ============================================================================
// Convenience Functions
// ============================================================================

import { AcisReader } from './reader.js'
import { RECORD_2_ENTITY } from './type-mappings.js'
import { extractColor, extractName } from './attributes.js'
import { buildWithOpenCascade } from './geometry-builder.js'

/**
 * Parse ACIS binary data and return bodies
 * @param {ArrayBuffer|Uint8Array} data - Binary ACIS data
 * @returns {Array} Array of Body entities
 */
export function parseAcisBinary(data) {
  const reader = new AcisReader()
  if (!reader.readBinary(data)) {
    throw new Error('Failed to parse ACIS binary data')
  }
  reader.resolveEntities(RECORD_2_ENTITY)
  return reader.bodies
}

/**
 * Parse ACIS text data and return bodies
 * @param {string|ArrayBuffer} data - Text ACIS data (.sat format)
 * @returns {Array} Array of Body entities
 */
export function parseAcisText(data) {
  const reader = new AcisReader()
  if (!reader.readText(data)) {
    throw new Error('Failed to parse ACIS text data')
  }
  reader.resolveEntities(RECORD_2_ENTITY)
  return reader.bodies
}

/**
 * Detect ACIS format and parse accordingly
 * @param {ArrayBuffer|Uint8Array|string} data - ACIS data
 * @returns {Array} Array of Body entities
 */
export function parseAcis(data) {
  // Check if binary format
  if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data)
    const header = new TextDecoder().decode(bytes.slice(0, 15))

    if (header.startsWith('ACIS BinaryFile') || header.startsWith('ASM BinaryFile')) {
      return parseAcisBinary(data)
    }
    // Might be text in binary format
    return parseAcisText(data)
  }

  // String data - text format
  return parseAcisText(data)
}

/**
 * Parse ACIS data and build geometry with OpenCascade.js
 * @param {Object} oc - OpenCascade.js instance
 * @param {ArrayBuffer|Uint8Array|string} data - ACIS data
 * @returns {Object|null} OpenCascade.js shape (compound or shell)
 */
export function parseAndBuild(oc, data) {
  const bodies = parseAcis(data)
  return buildWithOpenCascade(oc, bodies)
}

/**
 * Get all faces from bodies
 * @param {Array} bodies - Array of Body entities
 * @returns {Array} Array of Face entities
 */
export function getAllFaces(bodies) {
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
 * @param {Array} bodies - Array of Body entities
 * @returns {Array} Array of Edge entities
 */
export function getAllEdges(bodies) {
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
 * Get all surfaces from bodies
 * @param {Array} bodies - Array of Body entities
 * @returns {Array} Array of Surface entities
 */
export function getAllSurfaces(bodies) {
  const surfaces = []
  const seen = new Set()

  for (const face of getAllFaces(bodies)) {
    const surface = face.getSurface ? face.getSurface() : null
    if (surface && !seen.has(surface.index)) {
      seen.add(surface.index)
      surfaces.push(surface)
    }
  }
  return surfaces
}

/**
 * Get all curves from bodies
 * @param {Array} bodies - Array of Body entities
 * @returns {Array} Array of Curve entities
 */
export function getAllCurves(bodies) {
  const curves = []
  const seen = new Set()

  for (const edge of getAllEdges(bodies)) {
    const curve = edge.getCurve ? edge.getCurve() : null
    if (curve && !seen.has(curve.index)) {
      seen.add(curve.index)
      curves.push(curve)
    }
  }
  return curves
}

/**
 * Extract color from entity attribute chain
 */
export { extractColor, extractName }

/**
 * Build geometry with OpenCascade.js
 */
export { buildWithOpenCascade }

// ============================================================================
// Default Export
// ============================================================================

export default {
  // Reader
  AcisReader,
  RECORD_2_ENTITY,

  // Parsing functions
  parseAcis,
  parseAcisBinary,
  parseAcisText,
  parseAndBuild,

  // Entity traversal
  getAllFaces,
  getAllEdges,
  getAllSurfaces,
  getAllCurves,

  // Attribute extraction
  extractColor,
  extractName,

  // Geometry building
  buildWithOpenCascade
}
