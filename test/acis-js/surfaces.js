/**
 * ACIS Surface Classes
 * Surface geometry classes: Plane, Cone, Sphere, Torus, Spline, etc.
 * Ported from Acis.py lines 2700-4086
 */

import {
  SENSE, SENSEV, SIDES, SIDE,
  MIN_0, MAX_2PI, MIN_INF, MAX_INF,
  CENTER, DIR_X, DIR_Y, DIR_Z
} from './constants.js'
import { Geometry } from './curves.js'
import { Range, Interval, BS_Surface } from './data-classes.js'
import {
  getRefNode, getBoolean, getInteger, getFloat, getFloats, getFloatArray,
  getLength, getText, getEnumByTag, getEnumByValue, getSingularity,
  getLocation, getVector, getInterval,
  getVersion, isASM, getAsmMajor, getScale
} from './utils.js'
import { VEC, vec2sat, NORM, SIZE } from './math.js'

// ============================================================================
// Base Surface Class
// ============================================================================

/**
 * Base class for surfaces
 */
export class Surface extends Geometry {
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

  build(face = null) {
    console.warn(`Surface '${this.constructor.name}' build() not implemented`)
    return this.shape
  }
}

// ============================================================================
// Plane Surface
// ============================================================================

/**
 * Plane surface
 */
export class SurfacePlane extends Surface {
  constructor() {
    super('plane')
    this.origin = { ...CENTER }
    this.normal = { ...DIR_Z }
    this.uDir = { ...DIR_X }
    this.sensev = 'forward_v'
    this.uRange = new Interval(new Range('I', MIN_INF), new Range('I', MAX_INF))
    this.vRange = new Interval(new Range('I', MIN_INF), new Range('I', MAX_INF))
  }

  setSubtype(chunks, index) {
    let i = index
    ;[this.origin, i] = getLocation(chunks, i)
    ;[this.normal, i] = getVector(chunks, i)
    ;[this.uDir, i] = getLocation(chunks, i)
    ;[this.sensev, i] = getEnumByTag(chunks, i, SENSEV)
    ;[this.uRange, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())
    ;[this.vRange, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())
    return i
  }

  build(face = null) {
    if (this._readyToBuild) {
      this._readyToBuild = false
      this.shape = {
        type: 'plane',
        origin: this.origin,
        normal: this.normal,
        uDir: this.uDir
      }
    }
    return this.shape
  }
}

// ============================================================================
// Cone Surface
// ============================================================================

/**
 * Cone surface
 */
export class SurfaceCone extends Surface {
  constructor() {
    super('cone')
    this.center = { ...CENTER }
    this.axis = { ...DIR_Z }
    this.majorRadius = 1.0
    this.minorRadius = 1.0
    this.ratio = 1.0
    this.semiAngle = Math.PI / 4
    this.uvOrigin = { ...DIR_X }
    this.sensev = 'forward_v'
    this.uRange = new Interval(new Range('I', MIN_0), new Range('I', MAX_2PI))
    this.vRange = new Interval(new Range('I', MIN_INF), new Range('I', MAX_INF))
  }

  setSubtype(chunks, index) {
    let i = index
    ;[this.center, i] = getLocation(chunks, i)
    ;[this.axis, i] = getVector(chunks, i)
    ;[this.majorRadius, i] = getLength(chunks, i)
    ;[this.ratio, i] = getFloat(chunks, i)
    ;[this.uvOrigin, i] = getLocation(chunks, i)
    ;[this.semiAngle, i] = getFloat(chunks, i)
    ;[this.sensev, i] = getEnumByTag(chunks, i, SENSEV)
    ;[this.uRange, i] = getInterval(chunks, i, MIN_0, MAX_2PI, 1.0)
    ;[this.vRange, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())
    return i
  }

  getMinorRadius() {
    return this.majorRadius * this.ratio
  }

  isCircular() {
    return Math.abs(this.ratio - 1.0) < 1e-6
  }

  build(face = null) {
    if (this._readyToBuild) {
      this._readyToBuild = false
      this.shape = {
        type: 'cone',
        center: this.center,
        axis: this.axis,
        majorRadius: this.majorRadius,
        minorRadius: this.getMinorRadius(),
        semiAngle: this.semiAngle,
        uvOrigin: this.uvOrigin
      }
    }
    return this.shape
  }
}

// ============================================================================
// Sphere Surface
// ============================================================================

/**
 * Sphere surface
 */
export class SurfaceSphere extends Surface {
  constructor() {
    super('sphere')
    this.center = { ...CENTER }
    this.radius = 1.0
    this.uvOrigin = { ...DIR_Z }
    this.pole = { ...DIR_X }
    this.sensev = 'forward_v'
    this.uRange = new Interval(new Range('I', MIN_0), new Range('I', MAX_2PI))
    this.vRange = new Interval(new Range('I', -Math.PI / 2), new Range('I', Math.PI / 2))
  }

  setSubtype(chunks, index) {
    let i = index
    ;[this.center, i] = getLocation(chunks, i)
    ;[this.radius, i] = getLength(chunks, i)
    ;[this.uvOrigin, i] = getLocation(chunks, i)
    ;[this.pole, i] = getLocation(chunks, i)
    ;[this.sensev, i] = getEnumByTag(chunks, i, SENSEV)
    ;[this.uRange, i] = getInterval(chunks, i, MIN_0, MAX_2PI, 1.0)
    ;[this.vRange, i] = getInterval(chunks, i, -Math.PI / 2, Math.PI / 2, 1.0)
    return i
  }

  build(face = null) {
    if (this._readyToBuild) {
      this._readyToBuild = false
      this.shape = {
        type: 'sphere',
        center: this.center,
        radius: this.radius
      }
    }
    return this.shape
  }
}

// ============================================================================
// Torus Surface
// ============================================================================

/**
 * Torus surface
 */
export class SurfaceTorus extends Surface {
  constructor() {
    super('torus')
    this.center = { ...CENTER }
    this.axis = { ...DIR_Z }
    this.major = 1.0
    this.minor = 0.1
    this.uvOrigin = { ...CENTER }
    this.sensev = 'forward_v'
    this.uRange = new Interval(new Range('I', MIN_0), new Range('I', MAX_2PI))
    this.vRange = new Interval(new Range('I', MIN_0), new Range('I', MAX_2PI))
  }

  setSubtype(chunks, index) {
    let i = index
    ;[this.center, i] = getLocation(chunks, i)
    ;[this.axis, i] = getVector(chunks, i)
    ;[this.major, i] = getLength(chunks, i)
    ;[this.minor, i] = getLength(chunks, i)
    ;[this.uvOrigin, i] = getLocation(chunks, i)
    ;[this.sensev, i] = getEnumByTag(chunks, i, SENSEV)
    ;[this.uRange, i] = getInterval(chunks, i, MIN_0, MAX_2PI, 1.0)
    ;[this.vRange, i] = getInterval(chunks, i, MIN_0, MAX_2PI, 1.0)
    return i
  }

  build(face = null) {
    if (this._readyToBuild) {
      this._readyToBuild = false
      this.shape = {
        type: 'torus',
        center: this.center,
        axis: this.axis,
        majorRadius: Math.abs(this.major),
        minorRadius: Math.abs(this.minor)
      }
    }
    return this.shape
  }
}

// ============================================================================
// Mesh Surface
// ============================================================================

/**
 * Mesh/Faceted surface
 */
export class SurfaceMesh extends Surface {
  constructor() {
    super('meshsurf')
    this.vertices = []
    this.faces = []
  }

  setSubtype(chunks, index) {
    // Parse mesh data
    return index
  }

  build(face = null) {
    if (this._readyToBuild) {
      this._readyToBuild = false
      this.shape = {
        type: 'mesh',
        vertices: this.vertices,
        faces: this.faces
      }
    }
    return this.shape
  }
}

// ============================================================================
// Spline Surface
// ============================================================================

/**
 * Spline (B-spline) surface - handles many subtypes
 */
export class SurfaceSpline extends Surface {
  constructor() {
    super('spline')
    this.surface = null
    this.spline = null
    this.tolerance = 0.0
    this.sense = 'forward'
    this.subtype = 'spl_sur'
  }

  toString() {
    const senseStr = SENSE[this.sense] || this.sense
    return `${this.__name__} ${senseStr} {${this.subtype} ...}`
  }

  setSubtype(chunks, index) {
    if (index >= chunks.length) return index

    const chunk = chunks[index]
    const val = chunk.val || chunk.value

    // Check for sense first
    if (val === 'forward' || val === 'reversed') {
      this.sense = val
      return this._parseSubtype(chunks, index + 1)
    }

    return this._parseSubtype(chunks, index)
  }

  _parseSubtype(chunks, index) {
    if (index >= chunks.length) return index

    const chunk = chunks[index]
    const val = chunk.val || chunk.value

    if (typeof val !== 'string') return index

    // Route based on subtype
    const handler = SURFACE_TYPES[val]
    if (handler) {
      const [method, version, inventor] = handler
      this.subtype = val
      if (typeof this[method] === 'function') {
        return this[method](chunks, index + 1, inventor)
      }
    }

    // Default: try to read as spline surface
    return this.setSurfaceShape(chunks, index, false)
  }

  setSurfaceShape(chunks, index, inventor, subtype = 'spl_sur') {
    this.subtype = subtype
    let i = index
    // Would read spline surface data via readSplineSurface
    // For now just mark index
    return i
  }

  setRotation(chunks, index, inventor) {
    this.subtype = 'rot_spl_sur'
    let i = this.setSurfaceShape(chunks, index, inventor, 'rot_spl_sur')
    // Read rotation profile
    return i
  }

  setSweep(chunks, index, inventor) {
    this.subtype = 'sweep_spl_sur'
    let i = this.setSurfaceShape(chunks, index, inventor, 'sweep_spl_sur')
    // Read sweep data
    return i
  }

  setLoft(chunks, index, inventor) {
    this.subtype = 'loft_spl_sur'
    let i = this.setSurfaceShape(chunks, index, inventor, 'loft_spl_sur')
    // Read loft data
    return i
  }

  setRule(chunks, index, inventor) {
    this.subtype = 'rule_sur'
    let i = this.setSurfaceShape(chunks, index, inventor, 'rule_sur')
    // Read ruled surface data
    return i
  }

  setOffset(chunks, index, inventor) {
    this.subtype = 'off_spl_sur'
    let i = this.setSurfaceShape(chunks, index, inventor, 'off_spl_sur')
    // Read offset data
    return i
  }

  setCylinder(chunks, index, inventor) {
    this.subtype = 'cyl_spl_sur'
    let i = this.setSurfaceShape(chunks, index, inventor, 'cyl_spl_sur')
    return i
  }

  setExact(chunks, index, inventor) {
    this.subtype = 'exact_spl_sur'
    let i = this.setSurfaceShape(chunks, index, inventor, 'exact_spl_sur')
    return i
  }

  setNet(chunks, index, inventor) {
    this.subtype = 'net_spl_sur'
    let i = this.setSurfaceShape(chunks, index, inventor, 'net_spl_sur')
    return i
  }

  setOrtho(chunks, index, inventor) {
    this.subtype = 'ortho_spl_sur'
    let i = this.setSurfaceShape(chunks, index, inventor, 'ortho_spl_sur')
    return i
  }

  setRbBlend(chunks, index, inventor) {
    this.subtype = 'rb_blend_spl_sur'
    let i = this.setSurfaceShape(chunks, index, inventor, 'rb_blend_spl_sur')
    return i
  }

  setG2Blend(chunks, index, inventor) {
    this.subtype = 'g2_blend_spl_sur'
    let i = this.setSurfaceShape(chunks, index, inventor, 'g2_blend_spl_sur')
    return i
  }

  setSkin(chunks, index, inventor) {
    this.subtype = 'skin_spl_sur'
    let i = this.setSurfaceShape(chunks, index, inventor, 'skin_spl_sur')
    return i
  }

  setSum(chunks, index, inventor) {
    this.subtype = 'sum_spl_sur'
    let i = this.setSurfaceShape(chunks, index, inventor, 'sum_spl_sur')
    return i
  }

  setVertexBlend(chunks, index, inventor) {
    this.subtype = 'VBL_SURF'
    let i = this.setSurfaceShape(chunks, index, inventor, 'VBL_SURF')
    return i
  }

  setDefm(chunks, index, inventor) {
    this.subtype = 'defm_spl_sur'
    let i = this.setSurfaceShape(chunks, index, inventor, 'defm_spl_sur')
    return i
  }

  getSurface() {
    let sNext = this
    let ref = null
    while (sNext && sNext.subtype === 'ref') {
      if (ref === null) {
        ref = sNext.ref
      } else if (ref >= sNext.ref) {
        sNext = null
        break
      }
      sNext = sNext.surface
      if (sNext === null) break
    }
    return sNext
  }

  build(face = null) {
    if (this._readyToBuild) {
      this._readyToBuild = false

      if (this.spline) {
        this.shape = {
          type: 'bspline_surface',
          spline: this.spline
        }
      } else if (this.surface && typeof this.surface.build === 'function') {
        this.shape = this.surface.build()
      } else {
        this.shape = {
          type: 'spline_surface',
          subtype: this.subtype
        }
      }
    }
    return this.shape
  }
}

// ============================================================================
// Surface Type Handlers
// ============================================================================

export const SURFACE_TYPES = {
  'cylsur': ['setCylinder', 0, false],
  'cyl_spl_sur': ['setCylinder', 1, true],
  'defmsur': ['setDefm', 0, false],
  'defm_spl_sur': ['setDefm', 1, true],
  'exactsur': ['setExact', 0, false],
  'exact_spl_sur': ['setExact', 1, true],
  'g2blnsur': ['setG2Blend', 0, false],
  'g2_blend_spl_sur': ['setG2Blend', 1, true],
  'loftsur': ['setLoft', 0, false],
  'loft_spl_sur': ['setLoft', 1, true],
  'netsur': ['setNet', 0, false],
  'net_spl_sur': ['setNet', 1, true],
  'offsur': ['setOffset', 0, false],
  'off_spl_sur': ['setOffset', 1, true],
  'orthosur': ['setOrtho', 0, false],
  'ortho_spl_sur': ['setOrtho', 1, true],
  'rbblnsur': ['setRbBlend', 0, false],
  'rb_blend_spl_sur': ['setRbBlend', 1, true],
  'rotsur': ['setRotation', 0, false],
  'rot_spl_sur': ['setRotation', 1, true],
  'rulesur': ['setRule', 0, false],
  'rule_sur': ['setRule', 1, true],
  'skinsur': ['setSkin', 0, false],
  'skin_spl_sur': ['setSkin', 1, true],
  'sweepsur': ['setSweep', 0, false],
  'sweep_spl_sur': ['setSweep', 1, true],
  'sweep_sur': ['setSweep', 1, true],
  'sumsur': ['setSum', 0, false],
  'sum_spl_sur': ['setSum', 1, true],
  'vertexblendsur': ['setVertexBlend', 0, false],
  'VBL_SURF': ['setVertexBlend', 1, true],
  // ASM Extensions
  'cl_loft_spl_sur': ['setClLoft', 1, true],
  'comp_spl_sur': ['setCompound', 1, true],
  'helix_spl_circ': ['setHelixCircle', 1, true],
  'helix_spl_line': ['setHelixLine', 1, true],
  't_spl_sur': ['setTSpline', 1, true]
}
