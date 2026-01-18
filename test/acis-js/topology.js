/**
 * ACIS Topology Classes
 * Topology entities: Body, Lump, Shell, Face, Loop, Wire, CoEdge, Edge, Vertex
 * Ported from Acis.py lines 1628-2060
 */

import { TAG_ENTITY_REF, SENSE, SENSEV, SIDES, SIDE } from './constants.js'
import { Entity } from './entity.js'
import {
  getRefNode, getBoolean, getInteger, getFloat, getEnumByTag, getText,
  getVersion, isASM, getAsmMajor
} from './utils.js'

// ============================================================================
// Base Topology Class
// ============================================================================

/**
 * Base class for topology entities
 * Handles version-specific chunk skipping from _handle_topology_ in Python
 */
export class Topology extends Entity {
  constructor() {
    super()
  }

  set(record) {
    let i = super.set(record)

    // Handle topology-specific skips based on version (from Python _handle_topology_)
    const vrs = getVersion()

    if (isASM()) {
      // ASM format: Entity.set() already skips 1 for the LONG at position 1.
      // Topology needs to skip 1 more for the extra ref field.
      i += 1
    } else {
      // Non-ASM format:
      // For version > 10.0, skip 1 chunk
      if (vrs > 10.0) {
        i += 1
      }
      // For version > 6.0, skip 1 chunk
      if (vrs > 6.0) {
        i += 1
      }
    }

    return i
  }
}

// ============================================================================
// Body Entity
// ============================================================================

/**
 * Body entity - top-level container for lumps
 */
export class Body extends Topology {
  constructor() {
    super()
    this._lump = null       // First lump
    this._wire = null       // First wire
    this._transform = null  // Transform reference
  }

  set(record) {
    let i = super.set(record)
    ;[this._lump, i] = getRefNode(record, i, 'lump')
    ;[this._wire, i] = getRefNode(record, i, 'wire')
    ;[this._transform, i] = getRefNode(record, i, 'transform')
    return i
  }

  getLump() {
    return this._lump ? this._lump.entity : null
  }

  getWire() {
    return this._wire ? this._wire.entity : null
  }

  getTransform() {
    return this._transform ? this._transform.entity : null
  }

  /**
   * Get all lumps in this body
   */
  getLumps() {
    const lumps = []
    let lump = this.getLump()
    while (lump) {
      lumps.push(lump)
      lump = lump.getNext()
    }
    return lumps
  }

  /**
   * Get all wires in this body
   */
  getWires() {
    const wires = []
    let wire = this.getWire()
    while (wire) {
      wires.push(wire)
      wire = wire.getNext()
    }
    return wires
  }

  build() {
    if (this._readyToBuild) {
      this._readyToBuild = false
      // Build logic would go here with OpenCascade
    }
    return this.shape
  }
}

// ============================================================================
// Lump Entity
// ============================================================================

/**
 * Lump entity - container for shells
 */
export class Lump extends Topology {
  constructor() {
    super()
    this._next = null   // Next lump in body
    this._shell = null  // First shell
    this._owner = null  // Owning body
  }

  set(record) {
    let i = super.set(record)
    ;[this._next, i] = getRefNode(record, i, 'lump')
    ;[this._shell, i] = getRefNode(record, i, 'shell')
    ;[this._owner, i] = getRefNode(record, i, 'body')
    return i
  }

  getNext() {
    return this._next ? this._next.entity : null
  }

  getShell() {
    return this._shell ? this._shell.entity : null
  }

  getParent() {
    return this._owner ? this._owner.entity : null
  }

  /**
   * Get all shells in this lump
   */
  getShells() {
    const shells = []
    let shell = this.getShell()
    while (shell) {
      shells.push(shell)
      shell = shell.getNext()
    }
    return shells
  }

  build() {
    if (this._readyToBuild) {
      this._readyToBuild = false
      // Build logic
    }
    return this.shape
  }
}

// ============================================================================
// Shell Entity
// ============================================================================

/**
 * Shell entity - container for faces
 */
export class Shell extends Topology {
  constructor() {
    super()
    this._next = null     // Next shell in lump
    this._subshell = null // First subshell
    this._face = null     // First face
    this._wire = null     // First wire
    this._owner = null    // Owning lump
  }

  set(record) {
    let i = super.set(record)
    ;[this._next, i] = getRefNode(record, i, 'shell')
    ;[this._subshell, i] = getRefNode(record, i, 'subshell')
    ;[this._face, i] = getRefNode(record, i, 'face')
    ;[this._wire, i] = getRefNode(record, i, 'wire')
    ;[this._owner, i] = getRefNode(record, i, 'lump')
    return i
  }

  getNext() {
    return this._next ? this._next.entity : null
  }

  getFace() {
    return this._face ? this._face.entity : null
  }

  getParent() {
    return this._owner ? this._owner.entity : null
  }

  /**
   * Get all faces in this shell
   */
  getFaces() {
    const faces = []
    let face = this.getFace()
    const visited = new Set()
    while (face && !visited.has(face.index)) {
      visited.add(face.index)
      faces.push(face)
      face = face.getNext()
    }
    return faces
  }

  build() {
    if (this._readyToBuild) {
      this._readyToBuild = false
      // Build logic
    }
    return this.shape
  }
}

// ============================================================================
// SubShell Entity
// ============================================================================

/**
 * SubShell entity
 */
export class SubShell extends Topology {
  constructor() {
    super()
    this._next = null
    this._child = null
    this._face = null
    this._wire = null
    this._owner = null
  }

  set(record) {
    let i = super.set(record)
    ;[this._next, i] = getRefNode(record, i, 'subshell')
    ;[this._child, i] = getRefNode(record, i, 'subshell')
    ;[this._face, i] = getRefNode(record, i, 'face')
    ;[this._wire, i] = getRefNode(record, i, 'wire')
    ;[this._owner, i] = getRefNode(record, i, null)
    return i
  }
}

// ============================================================================
// Face Entity
// ============================================================================

/**
 * Face entity - container for loops with a surface
 */
export class Face extends Topology {
  constructor() {
    super()
    this._next = null     // Next face in shell
    this._loop = null     // First loop
    this._shell = null    // Owning shell
    this._subshell = null // Owning subshell
    this._surface = null  // Surface geometry
    this.sense = 'forward'
    this.sides = 'single'
    this.side = null
    this.containment = null
  }

  set(record) {
    let i = super.set(record)
    ;[this._next, i] = getRefNode(record, i, 'face')
    ;[this._loop, i] = getRefNode(record, i, 'loop')
    ;[this._shell, i] = getRefNode(record, i, 'shell')
    ;[this._subshell, i] = getRefNode(record, i, 'subshell')
    ;[this._surface, i] = getRefNode(record, i, 'surface')
    ;[this.sense, i] = getEnumByTag(record.chunks, i, SENSE)

    // Handle sides
    const [sides, i2] = getEnumByTag(record.chunks, i, SIDES)
    this.sides = sides
    i = i2
    if (sides === 'double') {
      ;[this.side, i] = getEnumByTag(record.chunks, i, SIDE)
    }

    // Version-specific containment
    if (getVersion() > 5.0) {
      ;[this.containment, i] = getEnumByTag(record.chunks, i, { 0: 'unset', 1: 'set' })
    }

    return i
  }

  getNext() {
    return this._next ? this._next.entity : null
  }

  getLoop() {
    return this._loop ? this._loop.entity : null
  }

  getSurface() {
    return this._surface ? this._surface.entity : null
  }

  getParent() {
    return this._shell ? this._shell.entity : null
  }

  /**
   * Get all loops in this face
   */
  getLoops() {
    const loops = []
    let loop = this.getLoop()
    const visited = new Set()
    while (loop && !visited.has(loop.index)) {
      visited.add(loop.index)
      loops.push(loop)
      loop = loop.getNext()
    }
    return loops
  }

  build() {
    if (this._readyToBuild) {
      this._readyToBuild = false
      // Build logic
    }
    return this.shape
  }
}

// ============================================================================
// Loop Entity
// ============================================================================

/**
 * Loop entity - container for coedges
 */
export class Loop extends Topology {
  constructor() {
    super()
    this._next = null    // Next loop in face
    this._coedge = null  // First coedge
    this._face = null    // Owning face
  }

  set(record) {
    let i = super.set(record)
    ;[this._next, i] = getRefNode(record, i, 'loop')
    ;[this._coedge, i] = getRefNode(record, i, 'coedge')
    ;[this._face, i] = getRefNode(record, i, 'face')
    return i
  }

  getNext() {
    return this._next ? this._next.entity : null
  }

  getCoedge() {
    return this._coedge ? this._coedge.entity : null
  }

  getParent() {
    return this._face ? this._face.entity : null
  }

  /**
   * Get all coedges in this loop
   */
  getCoedges() {
    const coedges = []
    let coedge = this.getCoedge()
    const visited = new Set()
    while (coedge && !visited.has(coedge.index)) {
      visited.add(coedge.index)
      coedges.push(coedge)
      coedge = coedge.getNext()
    }
    return coedges
  }

  build() {
    if (this._readyToBuild) {
      this._readyToBuild = false
      // Build logic
    }
    return this.shape
  }
}

// ============================================================================
// Wire Entity
// ============================================================================

/**
 * Wire entity - standalone edge container
 */
export class Wire extends Topology {
  constructor() {
    super()
    this._next = null
    this._coedge = null
    this._owner = null  // Shell or body
  }

  set(record) {
    let i = super.set(record)
    ;[this._next, i] = getRefNode(record, i, 'wire')
    ;[this._coedge, i] = getRefNode(record, i, 'coedge')
    ;[this._owner, i] = getRefNode(record, i, null)
    return i
  }

  getNext() {
    return this._next ? this._next.entity : null
  }

  getCoedge() {
    return this._coedge ? this._coedge.entity : null
  }

  getParent() {
    return this._owner ? this._owner.entity : null
  }
}

// ============================================================================
// CoEdge Entity
// ============================================================================

/**
 * CoEdge entity - edge with direction/sense in a loop
 */
export class CoEdge extends Topology {
  constructor() {
    super()
    this._next = null      // Next coedge in loop
    this._previous = null  // Previous coedge in loop
    this._partner = null   // Partner coedge (shared edge)
    this._edge = null      // Edge geometry
    this._owner = null     // Owning loop or wire
    this._pcurve = null    // Parameter curve on surface
    this.sense = 'forward'
  }

  set(record) {
    let i = super.set(record)
    ;[this._next, i] = getRefNode(record, i, 'coedge')
    ;[this._previous, i] = getRefNode(record, i, 'coedge')
    ;[this._partner, i] = getRefNode(record, i, 'coedge')
    ;[this._edge, i] = getRefNode(record, i, 'edge')
    ;[this.sense, i] = getEnumByTag(record.chunks, i, SENSE)
    ;[this._owner, i] = getRefNode(record, i, null) // loop or wire

    // Optional pcurve
    if (i < record.chunks.length && record.chunks[i].tag === TAG_ENTITY_REF) {
      ;[this._pcurve, i] = getRefNode(record, i, 'pcurve')
    }

    return i
  }

  getNext() {
    return this._next ? this._next.entity : null
  }

  getPrevious() {
    return this._previous ? this._previous.entity : null
  }

  getPartner() {
    return this._partner ? this._partner.entity : null
  }

  getEdge() {
    return this._edge ? this._edge.entity : null
  }

  getParent() {
    return this._owner ? this._owner.entity : null
  }

  getPcurve() {
    return this._pcurve ? this._pcurve.entity : null
  }

  build() {
    if (this._readyToBuild) {
      this._readyToBuild = false
      const edge = this.getEdge()
      if (edge) {
        this.shape = edge.build()
        if (this.shape && this.sense === 'reversed') {
          // Reverse the shape
        }
      }
    }
    return this.shape
  }
}

/**
 * Tolerant CoEdge
 */
export class CoEdgeTolerance extends CoEdge {
  constructor() {
    super()
    this.tolerance = 0.0
  }

  set(record) {
    let i = super.set(record)
    ;[this.tolerance, i] = getFloat(record.chunks, i)
    return i
  }
}

// ============================================================================
// Edge Entity
// ============================================================================

/**
 * Edge entity - curve between two vertices
 */
export class Edge extends Topology {
  constructor() {
    super()
    this._start = null   // Start vertex
    this._end = null     // End vertex
    this._owner = null   // Owning coedge
    this._curve = null   // Curve geometry
    this.sense = 'forward'
    this.parameter1 = 0.0  // Start parameter on curve
    this.parameter2 = 1.0  // End parameter on curve
    this.text = ''
  }

  set(record) {
    let i = super.set(record)
    ;[this._start, i] = getRefNode(record, i, 'vertex')

    // Version > 4.0: read start parameter
    if (getVersion() > 4.0) {
      [this.parameter1, i] = getFloat(record.chunks, i)
    }

    ;[this._end, i] = getRefNode(record, i, 'vertex')

    // Version > 4.0: read end parameter
    if (getVersion() > 4.0) {
      [this.parameter2, i] = getFloat(record.chunks, i)
    }

    ;[this._owner, i] = getRefNode(record, i, 'coedge')
    ;[this._curve, i] = getRefNode(record, i, 'curve')
    ;[this.sense, i] = getEnumByTag(record.chunks, i, SENSE)

    // Version > 5.0: read text
    if (getVersion() > 5.0 && i < record.chunks.length) {
      [this.text, i] = getText(record.chunks, i)
    }

    return i
  }

  getStart() {
    const v = this._start ? this._start.entity : null
    return v ? v.getPosition() : null
  }

  getEnd() {
    const v = this._end ? this._end.entity : null
    return v ? v.getPosition() : null
  }

  getCurve() {
    return this._curve ? this._curve.entity : null
  }

  getParent() {
    return this._owner ? this._owner.entity : null
  }

  getPoints() {
    const points = []
    const ptStart = this._start ? this._start.entity : null
    if (ptStart) points.push(ptStart.getPosition())
    const ptEnd = this._end ? this._end.entity : null
    if (ptEnd && ptEnd.index !== (ptStart ? ptStart.index : -1)) {
      points.push(ptEnd.getPosition())
    }
    return points
  }

  build() {
    if (this._readyToBuild) {
      this._readyToBuild = false
      const curve = this.getCurve()
      if (curve) {
        const p1 = this.getStart()
        const p2 = this.getEnd()
        this.shape = curve.build(p1, p2)
        if (this.shape && this.sense === 'reversed') {
          // Reverse the shape
        }
      }
    }
    return this.shape
  }
}

/**
 * Tolerant Edge
 */
export class EdgeTolerance extends Edge {
  constructor() {
    super()
    this.tolerance = 0.0
  }

  set(record) {
    let i = super.set(record)
    // Tolerance is read in parent class for some versions
    return i
  }
}

// ============================================================================
// Vertex Entity
// ============================================================================

/**
 * Vertex entity - point in topology
 */
export class Vertex extends Topology {
  constructor() {
    super()
    this._owner = null  // Owning edge
    this._point = null  // Point geometry
    this.count = -1     // Number of edges using this vertex
  }

  set(record) {
    let i = super.set(record)
    ;[this._owner, i] = getRefNode(record, i, 'edge')

    if (getAsmMajor() > 217) {
      i += 1 // skip
    }

    // Inventor workaround
    if (record.chunks[i] && record.chunks[i].tag !== TAG_ENTITY_REF) {
      i += 1 // skip count
    }

    ;[this._point, i] = getRefNode(record, i, 'point')

    return i
  }

  getParent() {
    return this._owner ? this._owner.entity : null
  }

  getPoint() {
    return this._point ? this._point.entity : null
  }

  getPosition() {
    const p = this.getPoint()
    return p ? p.position : null
  }
}

/**
 * Tolerant Vertex
 */
export class VertexTolerance extends Vertex {
  constructor() {
    super()
    this.tolerance = 0.0
  }

  set(record) {
    let i = super.set(record)
    ;[this.tolerance, i] = getFloat(record.chunks, i)

    if (getAsmMajor() > 217) {
      i += 2 // skip floats
    }

    return i
  }
}

// ============================================================================
// Cell Entities (for cellular topology)
// ============================================================================

export class Cell extends Topology {
  constructor() {
    super()
  }
}

export class Cell3d extends Cell {
  constructor() {
    super()
  }
}

export class CFace extends Topology {
  constructor() {
    super()
  }
}

export class CShell extends Topology {
  constructor() {
    super()
  }
}
