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

// ============================================================================
// Convenience Functions
// ============================================================================

import { AcisReader } from './reader.js'
import { RECORD_2_ENTITY } from './type-mappings.js'
import { extractColor, extractName } from './attributes.js'

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
 * Get all faces from bodies
 * @param {Array} bodies - Array of Body entities
 * @returns {Array} Array of Face entities
 */
export function getAllFaces(bodies) {
  const faces = []
  for (const body of bodies) {
    for (const lump of body.getLumps()) {
      for (const shell of lump.getShells()) {
        faces.push(...shell.getFaces())
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
    for (const lump of body.getLumps()) {
      for (const shell of lump.getShells()) {
        for (const face of shell.getFaces()) {
          for (const loop of face.getLoops()) {
            for (const coedge of loop.getCoedges()) {
              const edge = coedge.getEdge()
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
 * Extract color from entity attribute chain
 */
export { extractColor, extractName }

// ============================================================================
// Default Export
// ============================================================================

export default {
  AcisReader,
  RECORD_2_ENTITY,
  parseAcis,
  parseAcisBinary,
  parseAcisText,
  getAllFaces,
  getAllEdges,
  extractColor,
  extractName
}
