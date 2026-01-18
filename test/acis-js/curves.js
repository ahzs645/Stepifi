/**
 * ACIS Curve Classes
 * Curve geometry classes: Straight, Ellipse, IntCurve, etc.
 * Ported from Acis.py lines 2063-2700
 */

import {
  TAG_ENTITY_REF, TAG_SUBTYPE_CLOSE, TAG_UTF8_U8, TAG_IDENT, TAG_SUBIDENT,
  SENSE, CLOSURE, MIN_0, MAX_2PI, MIN_INF, MAX_INF,
  CENTER, DIR_X, DIR_Y, DIR_Z
} from './constants.js'
import { Entity } from './entity.js'
import { Range, Interval, Helix, BS_Curve } from './data-classes.js'
import {
  getRefNode, getBoolean, getInteger, getFloat, getFloats, getFloatArray,
  getLength, getText, getEnumByTag, getEnumByValue, getSingularity,
  getLocation, getVector, getInterval,
  getVersion, isASM, getAsmMajor, getScale
} from './utils.js'
import { VEC, vec2sat } from './math.js'

// ============================================================================
// Base Geometry Class
// ============================================================================

/**
 * Base class for geometry entities (curves, surfaces, points)
 */
export class Geometry extends Entity {
  constructor(name) {
    super()
    this.__name__ = name
  }

  set(record) {
    let i = super.set(record)

    // Version-specific skip
    if (getVersion() > 10.0 && !isASM()) {
      i += 1
    }
    if (getVersion() > 6.0) {
      const [anyRef, i2] = getRefNode(record, i, null)
      i = i2
    }

    return i
  }

  getSatTextGeometry(index) {
    return this.record.chunks.slice(index).map(c => c.toString()).join(' ')
  }

  toString() {
    if (!this.record) {
      if (this.ref !== undefined) {
        return `${this.__name__} { ref ${this.ref} }`
      }
      if (this.subtype) {
        return `${this.__name__} { ${this.subtype} ... }`
      }
      return `${this.__name__} { ... }`
    }
    return super.toString()
  }
}

// ============================================================================
// Base Curve Class
// ============================================================================

/**
 * Base class for curves
 */
export class Curve extends Geometry {
  constructor(name) {
    super(name)
    this.shape = null
  }

  setSubtype(chunks, index) {
    return index
  }

  set(record) {
    let i = super.set(record)
    i = this.setSubtype(record.chunks, i)
    return i
  }

  /**
   * Build curve shape between start and end points
   * Default: creates a line segment (fallback)
   */
  build(start, end) {
    console.warn(`Curve '${this.constructor.name}' not yet supported - forced to straight-curve`)
    if (this._readyToBuild) {
      this._readyToBuild = false
      // Force everything to straight line as fallback
      if (start && end) {
        this.shape = { type: 'line', start, end }
      }
    }
    return this.shape
  }
}

// ============================================================================
// Straight Curve
// ============================================================================

/**
 * Straight line curve
 */
export class CurveStraight extends Curve {
  constructor() {
    super('straight')
    this.origin = { ...CENTER }
    this.direction = { ...DIR_X }
    this.range = new Interval(new Range('I', MIN_INF), new Range('I', MAX_INF))
  }

  setSubtype(chunks, index) {
    let i = index
    ;[this.origin, i] = getLocation(chunks, i)
    ;[this.direction, i] = getVector(chunks, i)
    ;[this.range, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())
    return i
  }

  build(start, end) {
    if (this._readyToBuild) {
      this._readyToBuild = false
      const p1 = start || this.origin
      const p2 = end || {
        x: this.origin.x + this.direction.x,
        y: this.origin.y + this.direction.y,
        z: this.origin.z + this.direction.z
      }
      this.shape = { type: 'line', origin: this.origin, direction: this.direction, start: p1, end: p2 }
    }
    return this.shape
  }
}

// ============================================================================
// Ellipse Curve
// ============================================================================

/**
 * Ellipse/Circle curve
 */
export class CurveEllipse extends Curve {
  constructor() {
    super('ellipse')
    this.center = { ...CENTER }
    this.axis = { ...DIR_Z }
    this.major = { ...DIR_X }
    this.ratio = MIN_0
    this.range = new Interval(new Range('I', MIN_0), new Range('I', MAX_2PI))
  }

  setSubtype(chunks, index) {
    let i = index
    ;[this.center, i] = getLocation(chunks, i)
    ;[this.axis, i] = getVector(chunks, i)
    ;[this.major, i] = getLocation(chunks, i)
    ;[this.ratio, i] = getFloat(chunks, i)
    ;[this.range, i] = getInterval(chunks, i, MIN_0, MAX_2PI, 1.0)
    return i
  }

  isCircle() {
    return Math.abs(this.ratio - 1.0) < 1e-6
  }

  getMajorRadius() {
    return Math.sqrt(this.major.x ** 2 + this.major.y ** 2 + this.major.z ** 2)
  }

  getMinorRadius() {
    return this.getMajorRadius() * this.ratio
  }

  build(start, end) {
    if (this._readyToBuild) {
      this._readyToBuild = false
      this.shape = {
        type: this.isCircle() ? 'circle' : 'ellipse',
        center: this.center,
        axis: this.axis,
        major: this.major,
        majorRadius: this.getMajorRadius(),
        minorRadius: this.getMinorRadius(),
        ratio: this.ratio,
        range: this.range,
        start, end
      }
    }
    return this.shape
  }
}

// ============================================================================
// Degenerate Curve
// ============================================================================

/**
 * Degenerate curve (single point)
 */
export class CurveDegenerate extends Curve {
  constructor() {
    super('degenerate')
    this.start = { ...CENTER }
    this.range = new Interval(new Range('I', MIN_INF), new Range('I', MAX_INF))
  }

  setSubtype(chunks, index) {
    let i = index
    ;[this.start, i] = getLocation(chunks, i)
    ;[this.range, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
    return i
  }

  build(start, end) {
    this.shape = { type: 'point', position: this.start }
    return this.shape
  }
}

// ============================================================================
// Compound Curve
// ============================================================================

/**
 * Compound curve (multiple segments)
 */
export class CurveComp extends Curve {
  constructor() {
    super('compcurv')
    this.curves = []
  }

  setSubtype(chunks, index) {
    // Compound curve parsing - depends on version
    return index
  }
}

// ============================================================================
// IntCurve (Interpolated/Spline Curve)
// ============================================================================

/**
 * Interpolated curve (B-spline, etc.)
 */
export class CurveInt extends Curve {
  constructor(name = '', subtype = 'cur_int') {
    super(name + 'intcurve')
    this.sense = 'forward'
    this.range = new Interval(new Range('I', MIN_INF), new Range('I', MAX_INF))
    this.subtype = subtype
    this.spline = null
    this.curve = null
    this.tolerance = 0.0
    this.singularity = 'full'
  }

  toString() {
    const senseStr = SENSE[this.sense] || this.sense
    return `${this.__name__} ${senseStr} {${this.subtype} ...}`
  }

  getSurface() {
    return this.surface || null
  }

  setProjectionSurface(surface, curve) {
    if (surface !== null) {
      this.surface = surface
      if (curve !== null) {
        this.surfaceProjection = { surface, curve }
        return true
      }
    }
    return false
  }

  setSubtype(chunks, index) {
    if (index >= chunks.length) return index

    const chunk = chunks[index]
    const val = chunk.val || chunk.value

    // Check for subtype open bracket or subtype name
    if (chunk.tag === TAG_UTF8_U8 || chunk.tag === TAG_IDENT || chunk.tag === TAG_SUBIDENT) {
      // Parse based on subtype
      return this._parseSubtype(chunks, index, val)
    }

    return index
  }

  _parseSubtype(chunks, index, subtype) {
    let i = index + 1 // Skip the subtype identifier

    // Route to specific handler
    switch (subtype) {
      case 'cur_int':
      case 'int_cur':
        return this.setCurve(chunks, i)
      case 'helix_int_cur':
        return this.setHelix(chunks, i)
      case 'law_int_cur':
        return this.setLaw(chunks, i)
      case 'off_int_cur':
        return this.setOff(chunks, i)
      case 'offset_int_cur':
        return this.setOffset(chunks, i)
      case 'proj_int_cur':
        return this.setProject(chunks, i)
      case 'exact_int_cur':
        return this.setExact(chunks, i)
      default:
        this.subtype = subtype
        return this.setCurve(chunks, i)
    }
  }

  setCurve(chunks, index) {
    let i = index
    ;[this.singularity, i] = getSingularity(chunks, i)

    if (this.singularity === 'full') {
      // Read B-spline curve data
      // This would call readBS3Curve from spline.js
      ;[this.tolerance, i] = getLength(chunks, i)
    } else if (this.singularity === 'none') {
      ;[this.range, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())
      const [val, i2] = chunks[i] ? [chunks[i].val, i + 1] : [null, i]
      if (typeof val === 'number') {
        this.tolerance = val
        i = i2
      }
    } else if (this.singularity === 'summary') {
      if (getVersion() >= 16.0 && !isASM()) {
        i += 1
      }
      ;[this.arr, i] = getFloatArray(chunks, i)
      ;[this.fac, i] = getFloat(chunks, i)
      ;[this.closure, i] = getEnumByValue(chunks, i, CLOSURE)
    } else if (this.singularity === 'v') {
      this.spline = new BS_Curve(false, false, 3)
      ;[this.spline.uKnots, i] = getFloatArray(chunks, i)
      this.spline.uMults = new Array(this.spline.uKnots.length).fill(3)
      ;[this.tolerance, i] = getLength(chunks, i)
      ;[this.f2, i] = getFloat(chunks, i)
    }

    return i
  }

  setHelix(chunks, index) {
    this.helix = new Helix()
    let i = index
    ;[this.helix.radAngles, i] = getInterval(chunks, i, MIN_0, MAX_2PI, 1.0)
    ;[this.helix.posCenter, i] = getLocation(chunks, i)
    ;[this.helix.dirMajor, i] = getLocation(chunks, i)
    ;[this.helix.dirMinor, i] = getLocation(chunks, i)
    ;[this.helix.dirPitch, i] = getLocation(chunks, i)
    ;[this.helix.facApex, i] = getFloat(chunks, i)
    ;[this.helix.vecAxis, i] = getVector(chunks, i)

    // Read surfaces and pcurves (usually null)
    // s1, p1, s2, p2
    // ...

    this.shape = { type: 'helix', helix: this.helix }
    this._readyToBuild = false

    return i
  }

  setLaw(chunks, index) {
    this.subtype = 'law_int_cur'
    let i = this.setCurve(chunks, index)
    // Read law formula
    return i
  }

  setOff(chunks, index) {
    this.subtype = 'off_int_cur'
    let i = this.setCurve(chunks, index)
    ;[this.left, i] = getLength(chunks, i)
    ;[this.right, i] = getLength(chunks, i)
    return i
  }

  setOffset(chunks, index) {
    this.subtype = 'offset_int_cur'
    let i = this.setCurve(chunks, index)
    // Read offset data
    return i
  }

  setProject(chunks, index) {
    this.subtype = 'proj_int_cur'
    let i = this.setCurve(chunks, index)
    return i
  }

  setExact(chunks, index) {
    this.subtype = 'exact_int_cur'
    let i = this.setCurve(chunks, index)
    return i
  }

  build(start, end) {
    if (this._readyToBuild) {
      this._readyToBuild = false

      if (this.helix) {
        this.shape = { type: 'helix', helix: this.helix, start, end }
      } else if (this.spline) {
        this.shape = {
          type: 'bspline_curve',
          spline: this.spline,
          start, end
        }
      } else {
        // Fallback to line
        if (start && end) {
          this.shape = { type: 'line', start, end }
        }
      }
    }
    return this.shape
  }
}

// ============================================================================
// IntCurveInt (Nested interpolated curve)
// ============================================================================

export class CurveIntInt extends CurveInt {
  constructor() {
    super('intcurve-')
  }
}

// ============================================================================
// PCurve (Parameter curve on surface)
// ============================================================================

export class CurveP extends Geometry {
  constructor() {
    super('pcurve')
    this._surface = null
    this._curve = null
    this.range = new Interval(new Range('I', MIN_INF), new Range('I', MAX_INF))
  }

  set(record) {
    let i = super.set(record)

    // Read surface and 2D curve references
    ;[this._surface, i] = getRefNode(record, i, 'surface')

    // PCurve data parsing depends on version
    return i
  }

  getSurface() {
    return this._surface ? this._surface.entity : null
  }

  getCurve() {
    return this._curve ? this._curve.entity : null
  }
}

// ============================================================================
// Export CURVE_TYPES for type mapping
// ============================================================================

export const CURVE_TYPES = {
  // Basic subtypes
  'cur_int': ['setCurve', 0, false],
  'int_cur': ['setSurfaceCurve', 1, true],

  // Specific subtypes
  'blend_int_cur': ['setBlendSpring', 1, true],
  'comp_int_cur': ['setComp', 1, true],
  'defm_int_cur': ['setDefm', 1, true],
  'exact_int_cur': ['setExact', 1, true],
  'helix_int_cur': ['setHelix', 1, true],
  'int_int_cur': ['setInt', 1, true],
  'law_int_cur': ['setLaw', 1, true],
  'off_int_cur': ['setOff', 1, true],
  'offset_int_cur': ['setOffset', 1, true],
  'off_surf_int_cur': ['setOffsetSurface', 1, true],
  'ortho_int_cur': ['setOrtho', 1, true],
  'para_int_cur': ['setParameter', 1, true],
  'proj_int_cur': ['setProject', 1, true],
  'spring_int_cur': ['setBlendSpring', 1, true],
  'sss_int_cur': ['setSSS', 1, true],
  'surf_int_cur': ['setSurfaceCurve', 1, true]
}
