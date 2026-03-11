/**
 * ACIS Curve Classes
 * Curve geometry classes: Straight, Ellipse, IntCurve, etc.
 * Ported from Acis.py lines 2063-2700
 */

import {
  TAG_ENTITY_REF, TAG_SUBTYPE_CLOSE, TAG_SUBTYPE_OPEN, TAG_UTF8_U8, TAG_IDENT, TAG_SUBIDENT,
  TAG_TRUE, TAG_FALSE, TAG_LONG, TAG_FLOAT, TAG_DOUBLE,
  SENSE, CLOSURE, MIN_0, MAX_2PI, MIN_INF, MAX_INF, MIN_PI, MAX_PI,
  CENTER, DIR_X, DIR_Y, DIR_Z, CURV_DIR
} from './constants.js'
import { Entity } from './entity.js'
import { Range, Interval, Helix, BS_Curve } from './data-classes.js'
import {
  getRefNode, getBoolean, getInteger, getFloat, getFloats, getFloatArray,
  getLength, getText, getEnumByTag, getEnumByValue, getSingularity, getLong,
  getLocation, getVector, getInterval, getValue, getIntegers, getUnknownFT,
  getVersion, isASM, getAsmMajor, getScale, getReader, reshape
} from './utils.js'
import { VEC, vec2sat } from './math.js'
import { readBS2Curve, readBS3Curve, readSurface, readCurve, readFormula } from './spline.js'

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
    let i = index
    const [count, i2] = getInteger(chunks, i)
    i = i2

    this.curves = []
    for (let k = 0; k < count; k++) {
      const [curve, i3] = readCurve(chunks, i)
      this.curves.push(curve)
      i = i3
    }

    return i
  }

  build(start, end) {
    if (this._readyToBuild) {
      this._readyToBuild = false

      if (this.curves.length > 0) {
        const shapes = []
        for (const curve of this.curves) {
          if (curve && typeof curve.build === 'function') {
            const shape = curve.build(start, end)
            if (shape) shapes.push(shape)
          }
        }
        if (shapes.length > 0) {
          this.shape = { type: 'compound_curve', curves: shapes }
        }
      }
    }
    return this.shape
  }
}

// ============================================================================
// CURVE_SET_DATA - Maps subtype names to setter methods
// ============================================================================

export const CURVE_SET_DATA = {
  // Basic subtypes
  'cur_int': ['setCurve', 0, false],
  'int_cur': ['setSurfaceCurve', 1, true],

  // Specific subtypes
  'blend_int_cur': ['setBlend', 1, true],
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
  'surf_int_cur': ['setSurface', 1, true],

  // Silhouette subtypes
  'silh_int_cur': ['setSilhouette', 1, true],
  'para_silh_int_cur': ['setSilhouetteParameter', 1, true],
  'taper_silh_int_cur': ['setSilhouetteTaper', 1, true]
}

// ============================================================================
// IntCurve (Interpolated/Spline Curve)
// ============================================================================

/**
 * Interpolated curve (B-spline, etc.)
 * Complete implementation matching Python Acis.py lines 2063-2640
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
    if (this.surface) return this.surface
    if (this.surface1) return this.surface1
    return null
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

  // Base curve data reader (Python lines 2159-2202)
  setCurve(chunks, index) {
    let i = index
    ;[this.singularity, i] = getSingularity(chunks, i)

    if (this.singularity === 'full') {
      // Read B-spline curve data
      ;[this.spline, i] = readBS3Curve(chunks, i)
      ;[this.tolerance, i] = getLength(chunks, i)
    } else if (this.singularity === 'none') {
      ;[this.range, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())
      if (chunks[i] && typeof chunks[i].val === 'number') {
        ;[this.tolerance, i] = getFloat(chunks, i)
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

  // Surface curve reader (Python lines 2204-2221)
  setSurfaceCurve(chunks, index, inventor, subtype = 'int_cur') {
    this.subtype = subtype
    const vrs = getVersion()
    let i = this.setCurve(chunks, index)

    ;[this.surface1, i] = readSurface(chunks, i)
    ;[this.surface2, i] = readSurface(chunks, i)
    ;[this.pcurve1, i] = readBS2Curve(chunks, i)
    ;[this.pcurve2, i] = readBS2Curve(chunks, i)

    if ((vrs > 11.0) && !isASM()) {
      i += 2 // '0xb 0xb' ?!?
    }

    ;[this.range2, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())

    if (vrs > 2.1) {
      // Discontinuity-Info
      ;[this.di1, i] = getFloatArray(chunks, i)
      ;[this.di2, i] = getFloatArray(chunks, i)
      ;[this.di3, i] = getFloatArray(chunks, i)
    }

    if (!this.setProjectionSurface(this.surface1, this.pcurve1)) {
      this.setProjectionSurface(this.surface2, this.pcurve2)
    }

    return i
  }

  // Blend/Spring curve (Python lines 2222-2251)
  setBlendSpring(chunks, index, inventor) {
    this.subtype = 'spring_int_cur'
    let i = this.setCurve(chunks, index)

    ;[this.surface1, i] = readSurface(chunks, i)
    if (this.surface1 === null) {
      ;[this.ruS1, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
      ;[this.rvS1, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
    }

    ;[this.surface2, i] = readSurface(chunks, i)
    if (this.surface2 === null) {
      ;[this.ruS2, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
      ;[this.rvS2, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
    }

    ;[this.pcurve1, i] = readBS2Curve(chunks, i)
    if (this.pcurve1 === null) {
      ;[this.ruP1, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
    }

    ;[this.pcurve2, i] = readBS2Curve(chunks, i)
    ;[this.range2, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)

    if (getVersion() >= 2.0) {
      // Discontinuity-Info
      ;[this.di1, i] = getFloatArray(chunks, i)
      ;[this.di2, i] = getFloatArray(chunks, i)
      ;[this.di3, i] = getFloatArray(chunks, i)
    }

    if (!this.setProjectionSurface(this.surface1, this.pcurve1)) {
      this.setProjectionSurface(this.surface2, this.pcurve2)
    }

    if (inventor) {
      i += 1 // ???
      ;[this.direction, i] = getEnumByValue(chunks, i, CURV_DIR)
    } else {
      ;[this.direction, i] = getText(chunks, i)
    }

    return i
  }

  // Comp curve (Python lines 2253-2263)
  setComp(chunks, index, inventor) {
    let i = this.setSurfaceCurve(chunks, index, inventor)
    ;[this.a4, i] = getFloatArray(chunks, i)
    ;[this.count, i] = getInteger(chunks, i)
    ;[this.a5, i] = getFloats(chunks, i, this.count)

    if (inventor) i += 1 // Boolean

    this.curves = []
    for (let k = 0; k < this.count; k++) {
      const [c, i2] = readCurve(chunks, i)
      this.curves.push(c)
      i = i2
    }

    return i
  }

  // Defm curve (Python lines 2264-2384)
  setDefm(chunks, index, inventor) {
    let i = this.setSurfaceCurve(chunks, index, inventor)

    if (inventor) {
      ;[this.lng1, i] = getInteger(chunks, i) // 0
    }

    ;[this.bend, i] = readCurve(chunks, i)
    ;[this.d1, i] = getInteger(chunks, i) // 8

    if (this.d1 === 8) {
      ;[this.d2, i] = getVector(chunks, i)
      ;[this.d3, i] = getVector(chunks, i)
      ;[this.d4, i] = getVector(chunks, i)
      ;[this.d5, i] = getVector(chunks, i)
      ;[this.n1, i] = getInteger(chunks, i) // 0
      if (this.n1 > 0) {
        ;[this.a1, i] = getFloats(chunks, i, 2 * this.n1)
        this.a1 = reshape(this.a1, 2)
      } else {
        this.a1 = []
      }
    } else if (this.d1 === 5) {
      this.d15 = new CurveInt()
      ;[this.d10, i] = readSurface(chunks, i)
      ;[this.d11, i] = getValue(chunks, i)
      ;[this.d12, i] = getFloat(chunks, i)
      ;[this.d13, i] = getInteger(chunks, i)
      if ((getVersion() > 225) && isASM()) {
        ;[this.d16, i] = getLong(chunks, i)
      }
      ;[this.d14, i] = getFloat(chunks, i)
      i = this.d15.setSubtype(chunks, i)
      ;[this.d2, i] = getVector(chunks, i)
      ;[this.d3, i] = getVector(chunks, i)
      ;[this.d4, i] = getVector(chunks, i)
      ;[this.d5, i] = getVector(chunks, i)
      ;[this.d6, i] = getFloat(chunks, i)
      ;[this.d7, i] = getValue(chunks, i)
      ;[this.d8, i] = getValue(chunks, i)
      ;[this.d9, i] = getValue(chunks, i)
      ;[this.n1, i] = getInteger(chunks, i) // 0
      if (this.n1 > 0) {
        ;[this.a1, i] = getFloats(chunks, i, 2 * this.n1)
        this.a1 = reshape(this.a1, 2)
      } else {
        this.a1 = []
      }
    } else if (this.d1 === 6) {
      ;[this.d2, i] = getVector(chunks, i)
      ;[this.d3, i] = getVector(chunks, i)
      ;[this.d4, i] = getVector(chunks, i)
      ;[this.d5, i] = getVector(chunks, i)
      ;[this.d6, i] = getFloat(chunks, i)
      ;[this.d7, i] = getBoolean(chunks, i)
      ;[this.d8, i] = getBoolean(chunks, i)
      ;[this.d9, i] = getBoolean(chunks, i)
      ;[this.d10, i] = getInteger(chunks, i)
      ;[this.d11, i] = readSurface(chunks, i)
      ;[this.d12, i] = getLong(chunks, i)
      ;[this.d13, i] = getBoolean(chunks, i)
      ;[this.d14, i] = getFloat(chunks, i)
      if ((getVersion() > 225) && isASM()) {
        ;[this.d15, i] = getLong(chunks, i)
      }
      ;[this.d16, i] = getFloat(chunks, i)
      this.d17 = new CurveInt()
      i = this.d17.setSubtype(chunks, i)
      ;[this.d18, i] = getVector(chunks, i)
      ;[this.d19, i] = getVector(chunks, i)
      ;[this.d20, i] = getVector(chunks, i)
      ;[this.d21, i] = getVector(chunks, i)
      ;[this.d22, i] = getFloat(chunks, i)
      ;[this.d23, i] = getBoolean(chunks, i)
      ;[this.d24, i] = getBoolean(chunks, i)
      ;[this.d25, i] = getBoolean(chunks, i)
      ;[this.d26, i] = getVector(chunks, i)
      ;[this.d27, i] = getVector(chunks, i)
      ;[this.d28, i] = getVector(chunks, i)
      ;[this.d29, i] = getVector(chunks, i)
      ;[this.d30, i] = getFloat(chunks, i)
      ;[this.d31, i] = getBoolean(chunks, i)
      ;[this.d32, i] = getBoolean(chunks, i)
      ;[this.d33, i] = getBoolean(chunks, i)
      ;[this.d34, i] = getLong(chunks, i)
    } else { // d1 == 3 or d1 == 1 or d1 == 4
      ;[this.d2, i] = getVector(chunks, i)
      ;[this.d3, i] = getVector(chunks, i)
      ;[this.d4, i] = getVector(chunks, i)
      ;[this.d5, i] = getVector(chunks, i)
      ;[this.d6, i] = getFloat(chunks, i)
      ;[this.d7, i] = getValue(chunks, i)
      ;[this.d8, i] = getValue(chunks, i)
      ;[this.d9, i] = getValue(chunks, i)
      ;[this.d10, i] = getLocation(chunks, i)
      ;[this.d11, i] = getVector(chunks, i)
      ;[this.d12, i] = getVector(chunks, i)
      ;[this.d13, i] = getFloat(chunks, i)
      ;[this.d14, i] = getValue(chunks, i)
      ;[this.d15, i] = getValue(chunks, i)
      ;[this.d16, i] = getFloat(chunks, i)
      ;[this.d17, i] = getFloat(chunks, i)
      ;[this.d18, i] = getFloat(chunks, i)
      ;[this.d19, i] = getValue(chunks, i)
      ;[this.d20, i] = getValue(chunks, i)
      ;[this.d21, i] = getValue(chunks, i)
      ;[this.d22, i] = getValue(chunks, i)
      ;[this.d23, i] = getValue(chunks, i)

      if (this.d1 === 1) {
        ;[this.d25, i] = getInteger(chunks, i)
        ;[this.d26, i] = getFloat(chunks, i)
        ;[this.d27, i] = getFloat(chunks, i)
      } else if (this.d1 === 3) {
        ;[this.d24, i] = getFloat(chunks, i)
        ;[this.n1, i] = getInteger(chunks, i)
        if (this.n1 > 0) {
          ;[this.a1, i] = getFloats(chunks, i, 2 * this.n1)
          this.a1 = reshape(this.a1, 2)
        } else {
          this.a1 = []
        }
      } else if (this.d1 === 4) {
        ;[this.b1, i] = getBoolean(chunks, i)
        ;[this.d26, i] = getFloat(chunks, i)
        ;[this.n1, i] = getInteger(chunks, i)
        ;[this.d27, i] = getFloat(chunks, i)
        ;[this.d28, i] = getFloat(chunks, i)
      }
    }

    return i
  }

  // Exact curve (Python lines 2385-2399)
  setExact(chunks, index, inventor) {
    const vrs = getVersion()
    let i = this.setSurfaceCurve(chunks, index, inventor, 'exact_int_cur')

    if (vrs >= 2.0) {
      if (inventor) {
        ;[this.x, i] = getFloat(chunks, i)
      }
      if ((vrs > 11.0) && !isASM()) {
        ;[this.s, i] = getSingularity(chunks, i)
        if ((vrs > 12.0) && !isASM()) {
          ;[this.b, i] = getBoolean(chunks, i)
        }
      }
      ;[this.unknown, i] = getUnknownFT(chunks, i)
      ;[this.range2x, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())
    }

    if (inventor) {
      i += 2 // skip 2x Enum-Values
    }

    return i
  }

  // Helix curve (Python lines 2400-2417)
  setHelix(chunks, index, inventor) {
    this.helix = new Helix()
    let i = index
    ;[this.helix.radAngles, i] = getInterval(chunks, i, MIN_0, MAX_2PI, 1.0)
    ;[this.helix.posCenter, i] = getLocation(chunks, i)
    ;[this.helix.dirMajor, i] = getLocation(chunks, i)
    ;[this.helix.dirMinor, i] = getLocation(chunks, i)
    ;[this.helix.dirPitch, i] = getLocation(chunks, i)
    ;[this.helix.facApex, i] = getFloat(chunks, i)
    ;[this.helix.vecAxis, i] = getVector(chunks, i)

    ;[this.s1, i] = readSurface(chunks, i)
    ;[this.s2, i] = readSurface(chunks, i)
    ;[this.p1, i] = readBS2Curve(chunks, i)
    ;[this.p2, i] = readBS2Curve(chunks, i)

    this.shape = { type: 'helix', helix: this.helix }
    if (!this.setProjectionSurface(this.s1, this.p1)) {
      this.setProjectionSurface(this.s2, this.p2)
    }
    this._readyToBuild = (this.shape === null)

    return i
  }

  // Int curve (Python lines 2418-2430)
  setInt(chunks, index, inventor) {
    let i = this.setSurfaceCurve(chunks, index, inventor, 'int_int_cur')

    if ((getVersion() > 10.0) && !isASM()) {
      ;[this.x, i] = getFloat(chunks, i)
      ;[this.s, i] = getSingularity(chunks, i)
      ;[this.b, i] = getBoolean(chunks, i)
      if (this.s === 'summary') {
        ;[this.n, i] = getInteger(chunks, i)
        ;[this.a, i] = getFloatArray(chunks, i)
      }
    } else {
      if (inventor) {
        ;[this.val, i] = getBoolean(chunks, i)
      }
    }

    return i
  }

  // Law curve (Python lines 2431-2447)
  setLaw(chunks, index, inventor) {
    let i = this.setSurfaceCurve(chunks, index, inventor, 'law_int_cur')

    if (inventor) {
      ;[this.n, i] = getInteger(chunks, i) // 0
    } else {
      if ((getVersion() > 15.0) && !isASM()) {
        ;[this.x, i] = getFloat(chunks, i)
        ;[this.s, i] = getSingularity(chunks, i)
        ;[this.b, i] = getBoolean(chunks, i)
      }
    }

    ;[this.l, i] = readFormula(chunks, i)
    this.laws = [this.l]
    const subLaws = this.l[1]
    ;[this.lawCount, i] = getInteger(chunks, i)

    for (let cnt = 0; cnt < this.lawCount; cnt++) {
      const [l, i2] = readFormula(chunks, i)
      subLaws.push(l)
      i = i2
    }

    return i
  }

  // Off curve (Python lines 2448-2455)
  setOff(chunks, index, inventor) {
    let i = this.setSurfaceCurve(chunks, index, inventor, 'off_int_cur')

    if (inventor) i += 1
    if ((getVersion() > 22.0) && !isASM()) i += 3

    ;[this.left, i] = getLength(chunks, i)
    ;[this.right, i] = getLength(chunks, i)

    return i
  }

  // Offset curve (Python lines 2456-2468)
  setOffset(chunks, index, inventor) {
    let i = this.setSurfaceCurve(chunks, index, inventor, 'offset_int_cur')

    if (inventor) i += 1

    ;[this.curve, i] = readCurve(chunks, i)
    ;[this.start, i] = getFloat(chunks, i)
    ;[this.end, i] = getFloat(chunks, i)
    ;[this.offset, i] = getVector(chunks, i)
    ;[this.oTxt1, i] = getValue(chunks, i)
    ;[this.oI, i] = getInteger(chunks, i)
    ;[this.oTxt2, i] = getValue(chunks, i)
    ;[this.oJ, i] = getInteger(chunks, i)

    return i
  }

  // Offset surface curve (Python lines 2469-2480)
  setOffsetSurface(chunks, index, inventor) {
    let i = this.setSurfaceCurve(chunks, index, inventor, 'off_surf_int_cur')

    if (inventor) i += 1

    ;[this.base_U, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
    ;[this.base_V, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
    ;[this.base, i] = readCurve(chunks, i)
    ;[this.base_rng, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
    ;[this.dist, i] = getFloat(chunks, i)
    ;[this.shift, i] = getFloat(chunks, i)
    ;[this.curveScale, i] = getFloat(chunks, i)

    return i
  }

  // Project curve (Python lines 2481-2492)
  setProject(chunks, index, inventor) {
    let i = this.setSurfaceCurve(chunks, index, inventor, 'proj_int_cur')

    if (inventor) i += 1

    ;[this.c, i] = readCurve(chunks, i)

    if (inventor) {
      ;[this.projB, i] = getBoolean(chunks, i)
      if (chunks[i] && chunks[i].tag === TAG_SUBTYPE_CLOSE) {
        return i
      }
    }

    ;[this.r, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())
    ;[this.t, i] = getText(chunks, i)

    return i
  }

  // SSS curve (Python lines 2493-2500)
  setSSS(chunks, index, inventor) {
    this.subtype = 'sss_int_cur'
    let i = this.setSurfaceCurve(chunks, index, inventor)

    ;[this.sssN, i] = getInteger(chunks, i)
    ;[this.sssS, i] = readSurface(chunks, i)
    ;[this.sssP, i] = readBS2Curve(chunks, i)

    this.setProjectionSurface(this.sssS, this.sssP)

    return i
  }

  // Silhouette curve (Python lines 2501-2506)
  setSilhouette(chunks, index, inventor, subtype = 'silh_int_cur') {
    let i = this.setSurfaceCurve(chunks, index, inventor, subtype)

    if (inventor) {
      ;[this.silhV, i] = getInteger(chunks, i)
    }

    ;[this.direction, i] = getVector(chunks, i)

    return i
  }

  // Silhouette parameter curve (Python lines 2507-2514)
  setSilhouetteParameter(chunks, index, inventor) {
    let i = this.setSilhouette(chunks, index, inventor, 'para_silh_int_cur')

    ;[this.parameter, i] = getFloat(chunks, i)

    if ((getVersion() > 225.0) && isASM()) {
      ;[this.silhR, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())
      ;[this.silhVec, i] = getVector(chunks, i)
      ;[this.silhD, i] = getFloat(chunks, i)
    }

    return i
  }

  // Silhouette taper curve (Python lines 2515-2518)
  setSilhouetteTaper(chunks, index, inventor) {
    let i = this.setSilhouette(chunks, index, inventor, 'taper_silh_int_cur')
    ;[this.taperangle, i] = getFloat(chunks, i)
    return i
  }

  // Blend curve (Python lines 2519-2535)
  setBlend(chunks, index, inventor) {
    const vrs = getVersion()
    let i = this.setSurfaceCurve(chunks, index, inventor, 'blend_int_cur')

    if (!isASM()) {
      if (vrs > 10.0) {
        if (vrs > 15.0) {
          ;[this.blendX, i] = getFloat(chunks, i)
        }
        ;[this.blendS, i] = getSingularity(chunks, i)
        ;[this.blendB, i] = getBoolean(chunks, i)
        if (this.blendB) {
          ;[this.blendN, i] = getInteger(chunks, i)
          ;[this.blendA, i] = getFloatArray(chunks, i)
        }
      }
      ;[this.blendT, i] = getText(chunks, i)
    }

    if (inventor) {
      ;[this.blendS2, i] = getSingularity(chunks, i)
      ;[this.blendB2, i] = getBoolean(chunks, i)
    }

    return i
  }

  // Parameter curve (Python lines 2536-2554)
  setParameter(chunks, index, inventor) {
    const vrs = getVersion()
    let i = this.setSurfaceCurve(chunks, index, inventor, 'par_int_cur')

    if ((vrs > 15.0) && !isASM()) {
      i += 1 // float
    }

    if (!inventor) {
      if (vrs > 10.0) {
        ;[this.paramSing, i] = getSingularity(chunks, i)
        ;[this.paramB1, i] = getBoolean(chunks, i)
        if (this.paramB1) {
          ;[this.paramN, i] = getInteger(chunks, i)
          ;[this.paramF, i] = getFloatArray(chunks, i)
        }
      }
      ;[this.paramT, i] = getText(chunks, i)
    } else {
      i += 1 // skip Number
      i += 1 // skip Boolean
      if (chunks[i] && chunks[i].tag !== TAG_SUBTYPE_CLOSE) {
        ;[this.paramB2, i] = getBoolean(chunks, i)
      }
    }

    return i
  }

  // Surface curve (Python lines 2555-2569)
  setSurface(chunks, index, inventor) {
    let i = this.setSurfaceCurve(chunks, index, inventor, 'surf_int_cur')

    if ((getVersion() > 15) && !isASM()) {
      ;[this.surfN, i] = getInteger(chunks, i)
      ;[this.surfO, i] = getValue(chunks, i)
      ;[this.surfB1, i] = getBoolean(chunks, i)
      ;[this.surfT, i] = getText(chunks, i)
      ;[this.surfB2, i] = getBoolean(chunks, i)
    } else {
      if (inventor) {
        ;[this.surfN, i] = getInteger(chunks, i)
        ;[this.surfB, i] = getBoolean(chunks, i)
      } else {
        ;[this.surfT, i] = getText(chunks, i)
      }
    }

    return i
  }

  // Ortho curve
  setOrtho(chunks, index, inventor) {
    let i = this.setSurfaceCurve(chunks, index, inventor, 'ortho_int_cur')
    ;[this.orthoB, i] = getBoolean(chunks, i)
    return i
  }

  // Ref curve (Python lines 2570-2577)
  setRef(chunks, index) {
    this.subtype = 'ref'
    ;[this.ref, ] = getInteger(chunks, index)
    const reader = getReader()
    if (reader) {
      this.curve = reader.getSubtypeEntity(this.ref)
    }

    if (this.curve && !(this.curve instanceof Curve)) {
      console.error(`Expected CURVE for 'ref ${this.ref}' but found ${this.curve?.constructor?.name}`)
      this.curve = null
    }

    return index + 1
  }

  // Bulk router (Python lines 2578-2593)
  setBulk(chunks, index) {
    let i = index

    // Skip TAG_SUBTYPE_OPEN marker if present
    if (chunks[i] && chunks[i].tag === TAG_SUBTYPE_OPEN) {
      i += 1
    }

    ;[this.subtype, ] = getValue(chunks, i)
    i += 1

    if (this.subtype === 'ref') {
      return this.setRef(chunks, i)
    }

    try {
      if (getVersion() >= 25.0 && !isASM()) {
        ;[this.id, i] = getInteger(chunks, i)
      }
      const reader = getReader()
      if (reader) {
        reader.addSubtypeEntity(this)
      }

      const prm = CURVE_SET_DATA[this.subtype]
      if (!prm) {
        throw new Error(`No implementation for intcurve '${this.subtype}'`)
      }

      const fkt = this[prm[0]]
      if (typeof fkt !== 'function') {
        throw new Error(`Method ${prm[0]} not found for intcurve '${this.subtype}'`)
      }

      // prm[1] = chunk offset before calling method (matches Python: fkt(chunks, i + prm[1], prm[2]))
      return fkt.call(this, chunks, i + prm[1], prm[2])
    } catch (e) {
      console.error(`Error parsing intcurve '${this.subtype}':`, e.message)
      return i
    }
  }

  // Main setSubtype (Python lines 2591-2596)
  setSubtype(chunks, index) {
    ;[this.sense, ] = getEnumByTag(chunks, index, SENSE)
    let i = index + 1

    i = this.setBulk(chunks, i)

    // Verify closing bracket
    if (chunks[i] && chunks[i].tag === TAG_SUBTYPE_CLOSE) {
      i += 1
    }

    ;[this.range, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())

    return i
  }

  build(start, end) {
    if (this._readyToBuild) {
      this._readyToBuild = false

      // Build based on subtype
      if (this.subtype === 'ref') {
        let cur = this.curve
        if (cur && !(cur instanceof Curve)) {
          cur = cur.getCurve ? cur.getCurve() : null
        }
        if (cur) {
          this.shape = cur.build(start, end)
        }
      } else if (this.helix) {
        this.shape = { type: 'helix', helix: this.helix, start, end }
      } else if (this.spline) {
        this.shape = {
          type: 'bspline_curve',
          spline: this.spline,
          sense: this.sense,
          start, end
        }
      } else if (this.surfaceProjection) {
        const { surface, curve } = this.surfaceProjection
        this.shape = {
          type: 'pcurve',
          surface, curve,
          sense: this.sense,
          start, end
        }
      } else if (this.curves && this.curves.length > 0) {
        const shapes = []
        for (const c of this.curves) {
          if (c && typeof c.build === 'function') {
            const shp = c.build(start, end)
            if (shp) shapes.push(shp)
          }
        }
        if (shapes.length > 0) {
          this.shape = { type: 'compound_curve', curves: shapes }
        }
      } else if (start && end) {
        this.shape = { type: 'line', start, end }
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

  setBulk(chunks, index) {
    let i = index

    // Skip TAG_SUBTYPE_OPEN marker if present
    if (chunks[i] && chunks[i].tag === TAG_SUBTYPE_OPEN) {
      i += 1
    }

    ;[this.subtype, ] = getValue(chunks, i)
    i += 1

    if (this.subtype === 'ref') {
      return this.setRef(chunks, i)
    }

    if ((getVersion() >= 25.0) && !isASM()) {
      ;[this.id, i] = getInteger(chunks, i)
    }

    const reader = getReader()
    if (reader) {
      reader.addSubtypeEntity(this)
    }

    if (this.subtype === 'lawintcur') {
      return this.setLaw(chunks, i, false)
    }
    if (this.subtype === 'law_int_cur') {
      return this.setLaw(chunks, i + 1, true)
    }

    throw new Error(`No implementation for intcurve-intcurve '${this.subtype}'`)
  }
}

// ============================================================================
// PCURVE_SET_DATA - Maps pcurve subtype names to setter methods
// ============================================================================

export const PCURVE_SET_DATA = {
  'exppc': 'setExpPar',
  'exp_par_cur': 'setExpPar',
  'imppc': 'setImpPar',
  'imp_par_cur': 'setImpPar'
}

// ============================================================================
// PCurve (Parameter curve on surface)
// ============================================================================

export class CurveP extends Curve {
  constructor() {
    super('pcurve')
    this.subtype = -1
    this.sense = 'forward'
    this.pcurve = null
    this.type = 0
  }

  getSurface() {
    if (this.surface) return this.surface
    if (this.pcurve && this.pcurve.getSurface) {
      return this.pcurve.getSurface()
    }
    return null
  }

  // Explicit parametric curve (Python lines 2667-2674)
  setExpPar(chunks, index) {
    this.subtype = 'exp_par_cur'
    const vrs = getVersion()
    let i = index

    ;[this.pcurve, i] = readBS2Curve(chunks, i)
    ;[this.tolerance, i] = getFloat(chunks, i)

    if ((vrs > 11.0) && !isASM()) {
      i += 1
    }

    ;[this.surface, i] = readSurface(chunks, i)

    return i
  }

  // Implicit parametric curve (Python lines 2675-2682)
  setImpPar(chunks, index) {
    this.subtype = 'imp_par_cur'
    let i = index

    ;[this.sense, i] = getEnumByTag(chunks, i, SENSE)

    this.curve = new CurveInt()
    i = this.curve.setBulk(chunks, i + 1)

    // Verify closing bracket
    if (chunks[i] && chunks[i].tag === TAG_SUBTYPE_CLOSE) {
      // Don't advance, will be handled by caller
    }

    this.surface = this.curve.getSurface()

    return i
  }

  // Ref pcurve (Python lines 2683-2690)
  setRef(chunks, index) {
    this.subtype = 'ref'
    ;[this.ref, ] = getInteger(chunks, index)

    const reader = getReader()
    if (reader) {
      this.pcurve = reader.getSubtypeEntity(this.ref)
    }

    if (this.pcurve && !(this.pcurve instanceof CurveP)) {
      console.error(`Expected PCURVE for 'ref ${this.ref}' but found ${this.pcurve?.constructor?.name}`)
      this.pcurve = null
    }

    return index + 1
  }

  // Bulk router (Python lines 2691-2703)
  setBulk(chunks, index) {
    let i = index

    // Skip TAG_SUBTYPE_OPEN marker if present
    if (chunks[i] && chunks[i].tag === TAG_SUBTYPE_OPEN) {
      i += 1
    }

    ;[this.subtype, ] = getValue(chunks, i)
    i += 1

    if (this.subtype === 'ref') {
      return this.setRef(chunks, i)
    }

    try {
      if (getVersion() >= 25.0) {
        ;[this.id, i] = getInteger(chunks, i)
      }

      const reader = getReader()
      if (reader) {
        reader.addSubtypeEntity(this)
      }

      const prm = PCURVE_SET_DATA[this.subtype]
      if (!prm) {
        throw new Error(`No implementation for pcurve '${this.subtype}'`)
      }

      const fkt = this[prm]
      if (typeof fkt !== 'function') {
        throw new Error(`Method ${prm} not found for pcurve '${this.subtype}'`)
      }

      return fkt.call(this, chunks, i)
    } catch (e) {
      console.error(`Error parsing pcurve '${this.subtype}':`, e.message)
      return i
    }
  }

  // Main setSubtype (Python lines 2704-2710)
  setSubtypeInternal(chunks, index) {
    ;[this.sense, ] = getEnumByTag(chunks, index, SENSE)
    let i = index + 1

    i = this.setBulk(chunks, i)

    // Verify closing bracket
    if (chunks[i] && chunks[i].tag === TAG_SUBTYPE_CLOSE) {
      i += 1
    }

    ;[this.u, i] = getFloat(chunks, i)
    ;[this.v, i] = getFloat(chunks, i)

    return i
  }

  // Main set (Python lines 2711-2721)
  set(record) {
    let i = super.set(record)

    ;[this.type, i] = getInteger(record.chunks, i)

    if (this.type === 0) {
      i = this.setSubtypeInternal(record.chunks, i)
    } else {
      ;[this.pcurve, i] = getRefNode(record, i, 'curve')
      ;[this.u, i] = getFloat(record.chunks, i)
      ;[this.v, i] = getFloat(record.chunks, i)
      this.subtype = 'ref'
    }

    return i
  }

  // Build (Python lines 2722-2731)
  build(start, end) {
    if (this._readyToBuild) {
      this._readyToBuild = false

      if (this.subtype === 'ref') {
        if (this.pcurve && typeof this.pcurve.build === 'function') {
          this.shape = this.pcurve.build(start, end)
        }
      } else if (this.subtype === 'exp_par_cur') {
        this.shape = {
          type: 'pcurve',
          pcurve: this.pcurve,
          surface: this.surface,
          sense: this.sense,
          start, end
        }
      } else if (this.subtype === 'imp_par_cur') {
        if (this.curve && typeof this.curve.build === 'function') {
          this.shape = this.curve.build(start, end)
        }
      }
    }
    return this.shape
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
  'blend_int_cur': ['setBlend', 1, true],
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
  'surf_int_cur': ['setSurface', 1, true],

  // Silhouette subtypes
  'silh_int_cur': ['setSilhouette', 1, true],
  'para_silh_int_cur': ['setSilhouetteParameter', 1, true],
  'taper_silh_int_cur': ['setSilhouetteTaper', 1, true]
}
