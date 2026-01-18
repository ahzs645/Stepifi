/**
 * ACIS Entity Classes
 * Base entity class and simple entity types
 * Ported from Acis.py lines 1527-1628
 */

import { TAG_ENTITY_REF } from './constants.js'
import {
  getRefNode, getBoolean, getInteger, getFloat, getFloats, getText,
  getLocation, getVector, getVersion, isASM
} from './utils.js'

// ============================================================================
// Base Entity Class
// ============================================================================

/**
 * Base class for all ACIS entities
 */
export class Entity {
  constructor() {
    this.record = null
    this.index = -1
    this._attrib = null
    this._readyToBuild = true
    this.shape = null
  }

  /**
   * Get the entity type name
   */
  getType() {
    if (this.record) {
      return this.record.name
    }
    return this.constructor.name
  }

  /**
   * Get SAT text representation
   */
  getSatText() {
    if (this.record) {
      return this.record.chunks.map(c => c.toString()).join(' ')
    }
    return ''
  }

  /**
   * Get referenced entity
   */
  getRef(chunk) {
    if (chunk && chunk.record && chunk.record.entity) {
      return chunk.record.entity
    }
    return null
  }

  /**
   * Set entity data from record
   */
  set(record) {
    let i = 0

    // Handle attrib reference
    if (record.chunks.length > 0) {
      const firstChunk = record.chunks[0]
      if (firstChunk.tag === TAG_ENTITY_REF || firstChunk.type === 'entity_ref') {
        [this._attrib, i] = getRefNode(record, 0, 'attrib')
      }
    }

    return i
  }

  /**
   * Get attribute entity
   */
  getAttrib() {
    return this._attrib ? this._attrib.entity : null
  }

  /**
   * Build the shape (override in subclasses)
   */
  build() {
    return this.shape
  }

  toString() {
    return `${this.getType()} [${this.index}]`
  }
}

// ============================================================================
// Transform Entity
// ============================================================================

/**
 * Transformation matrix entity
 */
export class Transform extends Entity {
  constructor() {
    super()
    // 4x4 transformation matrix (row-major)
    this.matrix = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ]
    this.reflect = false
    this.rotation = false
    this.shear = false
    this.scale = 1.0
  }

  set(record) {
    let i = super.set(record)

    // Read 3x3 rotation matrix
    const [row1, i1] = getFloats(record.chunks, i, 3)
    const [row2, i2] = getFloats(record.chunks, i1, 3)
    const [row3, i3] = getFloats(record.chunks, i2, 3)

    this.matrix[0][0] = row1[0]; this.matrix[0][1] = row1[1]; this.matrix[0][2] = row1[2]
    this.matrix[1][0] = row2[0]; this.matrix[1][1] = row2[1]; this.matrix[1][2] = row2[2]
    this.matrix[2][0] = row3[0]; this.matrix[2][1] = row3[1]; this.matrix[2][2] = row3[2]

    // Read translation vector (scaled)
    const [translation, i4] = getLocation(record.chunks, i3)
    this.matrix[0][3] = translation.x
    this.matrix[1][3] = translation.y
    this.matrix[2][3] = translation.z

    // Read scale
    let i5 = i4
    ;[this.scale, i5] = getFloat(record.chunks, i5)

    // Read flags
    ;[this.reflect, i5] = getBoolean(record.chunks, i5)
    ;[this.rotation, i5] = getBoolean(record.chunks, i5)
    ;[this.shear, i5] = getBoolean(record.chunks, i5)

    return i5
  }

  /**
   * Transform a point
   */
  transformPoint(point) {
    const x = this.matrix[0][0] * point.x + this.matrix[0][1] * point.y +
              this.matrix[0][2] * point.z + this.matrix[0][3]
    const y = this.matrix[1][0] * point.x + this.matrix[1][1] * point.y +
              this.matrix[1][2] * point.z + this.matrix[1][3]
    const z = this.matrix[2][0] * point.x + this.matrix[2][1] * point.y +
              this.matrix[2][2] * point.z + this.matrix[2][3]
    return { x, y, z }
  }

  /**
   * Transform a direction (no translation)
   */
  transformDirection(dir) {
    const x = this.matrix[0][0] * dir.x + this.matrix[0][1] * dir.y + this.matrix[0][2] * dir.z
    const y = this.matrix[1][0] * dir.x + this.matrix[1][1] * dir.y + this.matrix[1][2] * dir.z
    const z = this.matrix[2][0] * dir.x + this.matrix[2][1] * dir.y + this.matrix[2][2] * dir.z
    return { x, y, z }
  }
}

// ============================================================================
// World Coordinate System Entity
// ============================================================================

/**
 * WCS (World Coordinate System) entity
 */
export class Wcs extends Entity {
  constructor() {
    super()
    this._transform = null
  }

  set(record) {
    let i = super.set(record)
    ;[this._transform, i] = getRefNode(record, i, 'transform')
    return i
  }

  getTransform() {
    return this._transform ? this._transform.entity : null
  }
}

// ============================================================================
// T Entity (Terminator)
// ============================================================================

/**
 * T entity - terminator/marker
 */
export class T extends Entity {
  constructor() {
    super()
  }

  set(record) {
    // T entity has no data
    return 0
  }
}

// ============================================================================
// Eye Refinement Entity
// ============================================================================

/**
 * Eye refinement entity
 */
export class EyeRefinement extends Entity {
  constructor() {
    super()
  }

  set(record) {
    let i = super.set(record)
    // Eye refinement data depends on version
    return i
  }
}

// ============================================================================
// Vertex Template Entity
// ============================================================================

/**
 * Vertex template entity
 */
export class VertexTemplate extends Entity {
  constructor() {
    super()
    this.position = { x: 0, y: 0, z: 0 }
  }

  set(record) {
    let i = super.set(record)
    ;[this.position, i] = getLocation(record.chunks, i)
    return i
  }
}

// ============================================================================
// Annotation Entities
// ============================================================================

export class Annotation extends Entity {
  constructor() {
    super()
  }

  set(record) {
    let i = super.set(record)
    return i
  }
}

export class AnnotationPrimitive extends Annotation {
  constructor() {
    super()
  }
}

export class AnnotationSplit extends Annotation {
  constructor() {
    super()
  }
}

export class AnnotationTol extends Annotation {
  constructor() {
    super()
  }
}

export class AnnotationTolCreate extends AnnotationTol {
  constructor() {
    super()
  }
}

export class AnnotationTolRevert extends AnnotationTol {
  constructor() {
    super()
  }
}

// ============================================================================
// Point Entity
// ============================================================================

/**
 * Point geometry entity
 */
export class Point extends Entity {
  constructor() {
    super()
    this.position = { x: 0, y: 0, z: 0 }
    this.count = -1
  }

  set(record) {
    let i = super.set(record)

    // Skip version-specific data
    if (getVersion() > 10.0 && !isASM()) {
      i += 1
    }
    if (getVersion() > 6.0) {
      const [anyRef, i2] = getRefNode(record, i, null)
      i = i2
    }

    ;[this.position, i] = getLocation(record.chunks, i)
    return i
  }

  getPosition() {
    return this.position
  }
}

// ============================================================================
// Refinement Entity
// ============================================================================

export class Refinement extends Entity {
  constructor() {
    super()
  }

  set(record) {
    let i = super.set(record)
    return i
  }
}

// ============================================================================
// RH Entity (Render Hint)
// ============================================================================

export class RhEntity extends Entity {
  constructor() {
    super()
  }
}

export class RhEntityRhMaterial extends RhEntity {
  constructor() {
    super()
  }

  set(record) {
    let i = super.set(record)
    // Parse material data (color, phong, etc.)
    return i
  }
}

// ============================================================================
// ASM Header Entity
// ============================================================================

export class AsmHeader extends Entity {
  static getVersion = (str) => {
    const match = str.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/)
    return match ? [match[1], match[2], match[3], match[4]].map(Number) : null
  }

  constructor() {
    super()
    this.version = '7.0'
    this.major = 7
    this.minor = 0
    this.revision = 0
    this.build = 0
  }

  set(record) {
    let i = super.set(record)
    const [version, i2] = getText(record.chunks, i)
    const v = AsmHeader.getVersion(version)
    if (v) {
      this.major = v[0]
      this.minor = v[1]
      this.revision = v[2]
      this.build = v[3]
    }
    return i2
  }
}
