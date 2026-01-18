/**
 * ACIS Surface Classes
 * Surface geometry classes: Plane, Cone, Sphere, Torus, Spline, etc.
 * Ported from Acis.py lines 2700-4086
 */

import {
  SENSE, SENSEV, SIDES, SIDE,
  MIN_0, MAX_2PI, MIN_INF, MAX_INF, MAX_LEN, MIN_PI, MAX_PI,
  CENTER, DIR_X, DIR_Y, DIR_Z,
  CLOSURE, SINGULARITY,
  SURF_BOOL, SURF_NORM, SURF_DIR, SURF_SWEEP, SURF_RIGID, SURF_AXIS_SWEEP,
  CIRC_TYP, CIRC_SMTH, VBL_CIRCLE,
  VAR_RADIUS, VAR_CHAMFER, CHAMFER_TYPE, CONVEXITY, RENDER_BLEND,
  TAG_LONG, TAG_FLOAT, TAG_DOUBLE, TAG_TRUE, TAG_FALSE,
  TAG_UTF8_U8, TAG_IDENT, TAG_SUBIDENT, TAG_SUBTYPE_OPEN, TAG_SUBTYPE_CLOSE
} from './constants.js'
import { Geometry, CurveInt } from './curves.js'
import { Range, Interval, BS_Surface, Skin, LoftData, VBL_CLASSES } from './data-classes.js'
import {
  getRefNode, getBoolean, getInteger, getIntegers, getFloat, getFloats, getFloatArray,
  getLength, getLong, getText, getValue, getEnumByTag, getEnumByValue, getSingularity,
  getLocation, getVector, getPoint, getInterval,
  getVersion, isASM, getAsmMajor, getScale, getReader, isString, reshape
} from './utils.js'
import { VEC, vec2sat, NORM, SIZE } from './math.js'
import {
  readBS2Curve, readBS3Curve, readBS3Surface, readSplineSurface
} from './spline.js'
import { readFormula, readLofSubdata, getDiscontinuityInfo } from './spline.js'

// Forward declarations for circular dependency resolution
let readCurve, readSurface, readLaw

/**
 * Set curve reader function (called from index.js to resolve circular dependency)
 */
export function setCurveReader(fn) {
  readCurve = fn
}

/**
 * Set surface reader function (called from index.js to resolve circular dependency)
 */
export function setSurfaceReader(fn) {
  readSurface = fn
}

/**
 * Set law reader function (called from index.js to resolve circular dependency)
 */
export function setLawReader(fn) {
  readLaw = fn
}

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
    // Parse mesh data: vertex count, vertices, face count, faces
    let i = index
    let n
    ;[n, i] = getInteger(chunks, i)

    // Read vertices
    this.vertices = []
    for (let k = 0; k < n; k++) {
      let pt
      ;[pt, i] = getLocation(chunks, i)
      this.vertices.push(pt)
    }

    // Read faces
    ;[n, i] = getInteger(chunks, i)
    this.faces = []
    for (let k = 0; k < n; k++) {
      const [idx, i2] = getIntegers(chunks, i, 3)
      this.faces.push(idx)
      i = i2
    }

    return i
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
    this.record = null
    this.index = -1
    this.rangeU = null
    this.rangeV = null
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

  // ==========================================================================
  // Helper Methods for Reading Complex Data
  // ==========================================================================

  _readLoftProfile(chunks, index, inventor) {
    // Read loft profile curve data
    let i = index
    let curve
    ;[curve, i] = readCurve ? readCurve(chunks, i) : [null, i]
    return [curve, i]
  }

  _readLoftPath(chunks, index) {
    // Read loft path curve data
    let i = index
    let curve
    ;[curve, i] = readCurve ? readCurve(chunks, i) : [null, i]
    return [curve, i]
  }

  _readLofSection(chunks, index, inventor) {
    let n, i
    ;[n, i] = getInteger(chunks, index)
    const loft = []

    for (let k = 0; k < n; k++) {
      let fk, profile, path
      ;[fk, i] = getFloat(chunks, i)
      ;[profile, i] = this._readLoftProfile(chunks, i, inventor)
      if (inventor) {
        ;[path, i] = this._readLoftPath(chunks, i)
      } else {
        path = null
      }
      loft.push([fk, profile, path])
    }
    return [loft, i]
  }

  _readLoftData(chunks, index) {
    const data = new LoftData()
    let i = index

    ;[data.surface, i] = readSurface ? readSurface(chunks, i) : [null, i]
    ;[data.bs2cur, i] = readBS2Curve(chunks, i)
    ;[data.e1, i] = getBoolean(chunks, i)
    ;[data.type, i] = getInteger(chunks, i)
    ;[data.n, i] = getInteger(chunks, i)
    ;[data.m, i] = getInteger(chunks, i)

    data.v = []
    for (let k = 0; k < data.m; k++) {
      let val
      ;[val, i] = getFloat(chunks, i)
      data.v.push(val)
    }

    return [data, i]
  }

  _readRbBlendSurface1(chunks, index, inventor) {
    let i = index
    let name, surface, curve, bs, v

    ;[name, i] = getText(chunks, i)
    ;[surface, i] = readSurface ? readSurface(chunks, i) : [null, i]
    ;[curve, i] = readCurve ? readCurve(chunks, i) : [null, i]
    ;[bs, i] = readBS2Curve(chunks, i)
    ;[v, i] = getLocation(chunks, i)

    if (inventor) {
      let bs1, spline, tol
      ;[bs1, i] = readBS2Curve(chunks, i)
      ;[spline, tol, i] = readSplineSurface(chunks, i, false)
      return [[name, surface, curve, bs, v, [bs1, spline, tol]], i]
    }
    return [[name, surface, curve, bs, v, null], i]
  }

  _readRbBlendSurface2(chunks, index, inventor) {
    let i = index
    let name, surface, curve, bs, v

    ;[name, i] = getText(chunks, i)
    ;[surface, i] = readSurface ? readSurface(chunks, i) : [null, i]
    ;[curve, i] = readCurve ? readCurve(chunks, i) : [null, i]
    ;[bs, i] = readBS2Curve(chunks, i)
    ;[v, i] = getLocation(chunks, i)

    if (inventor) {
      let bs1, f, bs2
      ;[bs1, i] = readBS2Curve(chunks, i)
      ;[f, i] = getFloat(chunks, i)
      ;[bs2, i] = readBS2Curve(chunks, i)
    }
    return [[name, surface, curve, bs, v], i]
  }

  _readRbBlendCurve(chunks, index, inventor) {
    let i = index
    let txt, srf, cur, bs2, vec

    ;[txt, i] = getText(chunks, i)
    ;[srf, i] = readSurface ? readSurface(chunks, i) : [null, i]
    ;[cur, i] = readCurve ? readCurve(chunks, i) : [null, i]
    ;[bs2, i] = readBS2Curve(chunks, i)
    ;[vec, i] = getVector(chunks, i)

    if (inventor) {
      let bs3, num, bs4
      ;[bs3, i] = readBS2Curve(chunks, i)
      ;[num, i] = getInteger(chunks, i)
      ;[bs4, i] = readBS2Curve(chunks, i)
      i += 1 // skip "False"
      return [[txt, srf, cur, bs2, vec, [bs3, num, bs4]], i]
    }
    return [[txt, srf, cur, bs2, vec, null], i]
  }

  _readScaleClLoft(chunks, index) {
    const chunk = chunks[index]
    if (chunk.tag === TAG_TRUE || chunk.tag === TAG_FALSE) {
      return [null, index]
    }

    let n, i
    ;[n, i] = getInteger(chunks, index)
    const lofts = []

    for (let k = 0; k < n; k++) {
      let nk, ck, lk
      ;[nk, i] = getInteger(chunks, i)
      ;[ck, i] = readCurve ? readCurve(chunks, i) : [null, i]
      ;[lk, i] = this._readLoftData(chunks, i)
      lofts.push([nk, ck, lk])
    }

    const nextChunk = chunks[i]
    if (nextChunk && ![TAG_UTF8_U8, TAG_IDENT, TAG_SUBIDENT].includes(nextChunk.tag)) {
      return [null, index]
    }

    let cur, bs3, arr
    ;[cur, i] = readCurve ? readCurve(chunks, i) : [null, i]
    ;[n, i] = getInteger(chunks, i)

    bs3 = []
    for (let k = 0; k < n; k++) {
      let bs3c
      ;[bs3c, i] = readBS3Curve(chunks, i)
      bs3.push(bs3c)
    }

    ;[arr, i] = getIntegers(chunks, i, 2)
    return [[lofts, cur, bs3, arr], i]
  }

  _readSkin(chunks, index, inventor) {
    const skin = new Skin()
    let i = index

    ;[skin.a1, i] = getIntegers(chunks, i, 4)
    ;[skin.f1, i] = getFloat(chunks, i)

    if (inventor) {
      let n
      ;[n, i] = getInteger(chunks, i)
      const nextChunk = chunks[i]

      if (nextChunk && ![TAG_UTF8_U8, TAG_IDENT, TAG_SUBIDENT].includes(nextChunk.tag)) {
        for (let k = 0; k < n; k++) {
          i += 1
          let curve, loftdata
          ;[curve, i] = readCurve ? readCurve(chunks, i) : [null, i]
          ;[loftdata, i] = this._readLoftData(chunks, i)
          skin.loft.push([curve, loftdata])
        }
        ;[skin.cur2, i] = readCurve ? readCurve(chunks, i) : [null, i]
        i += 2 // 0, -1
      } else {
        ;[skin.cur, i] = readCurve ? readCurve(chunks, i) : [null, i]
        ;[skin.loft, i] = readLofSubdata(chunks, i)
        i += 1
        ;[skin.cur2, i] = readCurve ? readCurve(chunks, i) : [null, i]
        i += 1
      }
      ;[skin.vec, i] = getVector(chunks, i)
    } else {
      ;[skin.cur, i] = readCurve ? readCurve(chunks, i) : [null, i]
      ;[skin.vec, i] = getVector(chunks, i)
      ;[skin.surf, i] = readSurface ? readSurface(chunks, i) : [null, i]
    }

    ;[skin.f2, i] = getFloat(chunks, i)
    ;[skin.law, i] = readFormula(chunks, i)
    ;[skin.pcur, i] = readCurve ? readCurve(chunks, i) : [null, i]

    return [skin, i]
  }

  _readBoundaryGeometry(chunks, index, inventor) {
    let i = index
    let svId
    ;[svId, i] = getText(chunks, i)

    const VblClass = VBL_CLASSES[svId]
    if (!VblClass) {
      console.warn(`Unknown VBL type: ${svId}`)
      return [null, i]
    }

    const vbl = new VblClass()
    ;[vbl.type, i] = getEnumByTag(chunks, i, CIRC_TYP)
    ;[vbl.magic, i] = getLocation(chunks, i)
    ;[vbl.uSmoothing, i] = getEnumByTag(chunks, i, CIRC_SMTH)
    ;[vbl.vSmoothing, i] = getEnumByTag(chunks, i, CIRC_SMTH)
    ;[vbl.fullness, i] = getFloat(chunks, i)

    if (svId === 'circle') {
      ;[vbl.curve, i] = readCurve ? readCurve(chunks, i) : [null, i]
      let subType
      ;[subType, i] = getEnumByValue(chunks, i, VBL_CIRCLE)

      if (subType === 'circle') {
        vbl.twist = [null, null]
      } else if (subType === 'ellipse') {
        let v1
        ;[v1, i] = getLocation(chunks, i)
        vbl.twist = [v1, null]
      } else if (subType === 'unknown') {
        let v1, v2
        ;[v1, i] = getLocation(chunks, i)
        ;[v2, i] = getLocation(chunks, i)
        vbl.twist = [v1, v2]
      }

      ;[vbl.parameters, i] = getFloats(chunks, i, 2)
      ;[vbl.sense, i] = getEnumByTag(chunks, i, SENSE)
    } else if (svId === 'deg') {
      ;[vbl.location, i] = getLocation(chunks, i)
      ;[vbl.normal1, i] = getVector(chunks, i)
      ;[vbl.normal2, i] = getVector(chunks, i)
    } else if (svId === 'pcurve') {
      ;[vbl.surface, i] = readSurface ? readSurface(chunks, i) : [null, i]
      ;[vbl.pcurve, i] = readBS2Curve(chunks, i)
      ;[vbl.sense, i] = getEnumByTag(chunks, i, SENSE)
      ;[vbl.fittolerance, i] = getFloats(chunks, i, 1)
    } else if (svId === 'plane') {
      ;[vbl.normal, i] = getVector(chunks, i)
      ;[vbl.parameters, i] = getFloats(chunks, i, 2)
      ;[vbl.curve, i] = readCurve ? readCurve(chunks, i) : [null, i]
    }

    return [vbl, i]
  }

  _getBlendValues(chunks, index) {
    // Read blend values (radius definitions)
    let i = index
    let n
    ;[n, i] = getInteger(chunks, i)

    const values = []
    for (let k = 0; k < n; k++) {
      let f
      ;[f, i] = getFloat(chunks, i)
      values.push(f)
    }

    return [values, i]
  }

  // ==========================================================================
  // Surface Shape Base Method
  // ==========================================================================

  setSurfaceShape(chunks, index, inventor, subtype = 'spl_sur') {
    this.subtype = subtype
    let i = index

    ;[this.spline, this.tolerance, i] = readSplineSurface(chunks, i, true)

    if (getVersion() >= 2.0) {
      let arr
      ;[arr, i] = getDiscontinuityInfo(chunks, i, inventor)
    }

    return i
  }

  // ==========================================================================
  // Surface Setters - Simple
  // ==========================================================================

  setRotation(chunks, index, inventor) {
    let i = index
    ;[this.profile, i] = readCurve ? readCurve(chunks, i) : [null, i]
    ;[this.loc, i] = getLocation(chunks, i)
    ;[this.dir, i] = getVector(chunks, i)
    i = this.setSurfaceShape(chunks, i, inventor, 'rot_spl_sur')
    return i
  }

  setRule(chunks, index, inventor) {
    let i = index
    ;[this.profile1, i] = readCurve ? readCurve(chunks, i) : [null, i]
    ;[this.profile2, i] = readCurve ? readCurve(chunks, i) : [null, i]
    i = this.setSurfaceShape(chunks, i, inventor, 'rule_sur')
    return i
  }

  setCylinder(chunks, index, inventor) {
    let i = index
    ;[this.profile, i] = readCurve ? readCurve(chunks, i) : [null, i]
    ;[this.axis, i] = getVector(chunks, i)
    ;[this.center, i] = getLocation(chunks, i)
    i = this.setSurfaceShape(chunks, i, inventor, 'cyl_spl_sur')
    return i
  }

  setExact(chunks, index, inventor) {
    let i = this.setSurfaceShape(chunks, index, inventor, 'exact_spl_sur')

    if (getVersion() > 2.0) {
      let rU, rV
      ;[rU, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())
      ;[rV, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())
      if (inventor) {
        let ft
        ;[ft, i] = getInteger(chunks, i)
      }
    }
    return i
  }

  setSum(chunks, index, inventor) {
    let i = index
    ;[this.curve1, i] = readCurve ? readCurve(chunks, i) : [null, i]
    ;[this.curve2, i] = readCurve ? readCurve(chunks, i) : [null, i]
    ;[this.origin, i] = getLocation(chunks, i)
    i = this.setSurfaceShape(chunks, i, inventor, 'sum_spl_sur')
    return i
  }

  setOrtho(chunks, index, inventor) {
    let i = this.setTaper(chunks, index, inventor, 'ortho_spl_sur')
    ;[this.senseBool, i] = getBoolean(chunks, i)
    return i
  }

  // ==========================================================================
  // Surface Setters - Medium Complexity
  // ==========================================================================

  setOffset(chunks, index, inventor) {
    let i = index
    ;[this.surface, i] = readSurface ? readSurface(chunks, i) : [null, i]
    ;[this.offset, i] = getFloat(chunks, i)
    ;[this.senseU, i] = getEnumByTag(chunks, i, SENSE)
    ;[this.senseV, i] = getEnumByTag(chunks, i, SENSE)

    if (inventor) {
      let e3
      ;[e3, i] = getBoolean(chunks, i)
      if (e3) {
        let e4
        ;[e4, i] = getBoolean(chunks, i)
      }
      const chunk = chunks[i]
      if (chunk && (chunk.tag === TAG_TRUE || chunk.tag === TAG_FALSE)) {
        let e5
        ;[e5, i] = getBoolean(chunks, i)
      }
    }

    i = this.setSurfaceShape(chunks, i, inventor, 'off_spl_sur')
    return i
  }

  setSkin(chunks, index, inventor) {
    let i = index
    const skins = []

    let bool, norm, dir, n
    ;[bool, i] = getEnumByTag(chunks, i, SURF_BOOL)
    ;[norm, i] = getEnumByTag(chunks, i, SURF_NORM)
    ;[dir, i] = getEnumByTag(chunks, i, SURF_DIR)
    ;[n, i] = getInteger(chunks, i)

    for (let k = 0; k < n; k++) {
      let skin
      ;[skin, i] = this._readSkin(chunks, i, inventor)
      skins.push(skin)
    }

    this.skins = skins
    ;[n, i] = getInteger(chunks, i)
    i = this.setSurfaceShape(chunks, i, inventor, 'skin_spl_sur')
    return i
  }

  setVertexBlend(chunks, index, inventor) {
    let i = index
    let n
    ;[n, i] = getInteger(chunks, i)

    this.boundaries = []
    for (let j = 0; j < n; j++) {
      let vbl
      ;[vbl, i] = this._readBoundaryGeometry(chunks, i, inventor)
      this.boundaries.push(vbl)
    }

    let grid, tolerance
    ;[grid, i] = getInteger(chunks, i)
    ;[tolerance, i] = getFloat(chunks, i)

    this.subtype = 'VBL_SURF'
    return i
  }

  setHelixCircle(chunks, index, inventor) {
    this.subtype = 'helix_spl_circ'
    let i = index

    ;[this.angle, i] = getInterval(chunks, i, MIN_PI, MAX_PI, 1.0)
    ;[this.dime1, i] = getInterval(chunks, i, -MAX_LEN, MAX_LEN, getScale())
    ;[this.length, i] = getLength(chunks, i)

    this.path = new CurveInt('helix_int_cur')
    i = this.path.setHelix(chunks, i, inventor)

    ;[this.radius, i] = getLength(chunks, i)
    return i
  }

  setHelixLine(chunks, index, inventor) {
    this.subtype = 'helix_spl_line'
    let i = index

    ;[this.angle, i] = getInterval(chunks, i, MIN_PI, MAX_PI, 1.0)
    ;[this.dime1, i] = getInterval(chunks, i, -MAX_LEN, MAX_LEN, 1.0)

    this.path = new CurveInt('helix_int_cur')
    i = this.path.setHelix(chunks, i, inventor)

    ;[this.origin, i] = getLocation(chunks, i)
    return i
  }

  setCompound(chunks, index, inventor) {
    let i = this.setSurfaceShape(chunks, index, inventor, 'comp_spl_sur')
    let d
    ;[d, i] = getFloatArray(chunks, i)

    this.compounds = []
    for (let k = 0; k < d.length; k++) {
      let f
      ;[f, i] = readSurface ? readSurface(chunks, i) : [null, i]
      this.compounds.push(f)
    }
    return i
  }

  setClLoft(chunks, index, inventor) {
    let i = this.setSurfaceShape(chunks, index, inventor, 'cl_loft_spl_sur')

    let scl1, scl2, scl3, scl4, scl5
    ;[scl1, i] = this._readScaleClLoft(chunks, i)
    ;[scl2, i] = this._readScaleClLoft(chunks, i)
    ;[scl3, i] = this._readScaleClLoft(chunks, i)
    ;[scl4, i] = this._readScaleClLoft(chunks, i)

    const chunk = chunks[i]
    if (chunk && chunk.tag === TAG_LONG) {
      ;[scl5, i] = this._readScaleClLoft(chunks, i)
    }

    let e1, e2, n1
    ;[e1, i] = getBoolean(chunks, i)
    ;[e2, i] = getBoolean(chunks, i)
    ;[n1, i] = getInteger(chunks, i)

    if (n1 === 6) {
      let e3, e4, n2, v1, r1, bsc1
      ;[e3, i] = getBoolean(chunks, i)
      ;[e4, i] = getBoolean(chunks, i)
      ;[scl5, i] = this._readScaleClLoft(chunks, i)
      ;[n2, i] = getInteger(chunks, i)
      ;[v1, i] = getVector(chunks, i)
      ;[r1, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
      ;[bsc1, i] = readBS3Curve(chunks, i)
    } else if (n1 === 7) {
      let e3, e4, scl6, n2, v1, e5, e6
      ;[e3, i] = getBoolean(chunks, i)
      ;[scl5, i] = this._readScaleClLoft(chunks, i)
      ;[e4, i] = getBoolean(chunks, i)
      ;[scl6, i] = this._readScaleClLoft(chunks, i)
      ;[n2, i] = getInteger(chunks, i)
      ;[v1, i] = getVector(chunks, i)
      ;[e5, i] = getBoolean(chunks, i)
      ;[e6, i] = getBoolean(chunks, i)
    } else {
      let e3, e4, n2, c3, e5, e6
      ;[e3, i] = getBoolean(chunks, i)
      ;[e4, i] = getBoolean(chunks, i)
      ;[n2, i] = getInteger(chunks, i)
      if (n2 === 0) {
        ;[c3, i] = getVector(chunks, i)
      } else {
        ;[c3, i] = readBS3Curve(chunks, i)
      }
      ;[e5, i] = getBoolean(chunks, i)
      ;[e6, i] = getBoolean(chunks, i)
    }

    return i
  }

  // ==========================================================================
  // Surface Setters - High Complexity
  // ==========================================================================

  setLoft(chunks, index, inventor) {
    let i = index

    ;[this.ls1, i] = this._readLofSection(chunks, i, inventor)
    ;[this.ls2, i] = this._readLofSection(chunks, i, inventor)
    ;[this.r1, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
    ;[this.r2, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
    ;[this.clsr1, i] = getEnumByValue(chunks, i, CLOSURE)
    ;[this.clsr2, i] = getEnumByValue(chunks, i, CLOSURE)
    ;[this.sng1, i] = getSingularity(chunks, i)
    ;[this.sng2, i] = getSingularity(chunks, i)

    let b
    ;[b, i] = getInteger(chunks, i)

    // Skip until we find the spline surface
    while (i < chunks.length - 1) {
      const nextChunk = chunks[i + 1]
      if (nextChunk && [TAG_UTF8_U8, TAG_IDENT, TAG_SUBIDENT].includes(nextChunk.tag)) {
        break
      }
      i++
    }

    i = this.setSurfaceShape(chunks, i, inventor, 'loft_spl_sur')
    return i
  }

  setNet(chunks, index, inventor) {
    let i = index

    ;[this.ls1, i] = this._readLofSection(chunks, i, inventor)
    ;[this.ls2, i] = this._readLofSection(chunks, i, inventor)

    if (inventor) {
      let a1, a2, v1, v2, v3, v4
      ;[a1, i] = getFloats(chunks, i, 12)
      ;[a2, i] = getInteger(chunks, i)
      ;[v1, i] = getVector(chunks, i)
      ;[v2, i] = getVector(chunks, i)
      ;[v3, i] = getVector(chunks, i)
      ;[v4, i] = getVector(chunks, i)
    } else {
      const st = []
      const n_u = this.ls1.length
      for (let j = 0; j < this.ls2.length; j++) {
        let a2
        ;[a2, i] = getFloats(chunks, i, 2 * n_u)
        st.push(reshape(a2, 2))
      }
    }

    ;[this.frml1, i] = readFormula(chunks, i)
    ;[this.frml2, i] = readFormula(chunks, i)
    ;[this.frml3, i] = readFormula(chunks, i)
    ;[this.frml4, i] = readFormula(chunks, i)

    i = this.setSurfaceShape(chunks, i, inventor, 'net_spl_sur')
    return i
  }

  setRbBlend(chunks, index, inventor, subtype = 'rb_blend_spl_sur') {
    this.subtype = subtype
    let i = index
    const vrs = getVersion()

    ;[this.blend1, i] = this._readRbBlendSurface1(chunks, i, inventor)
    ;[this.blend2, i] = this._readRbBlendSurface1(chunks, i, inventor)

    if (vrs > 22.0 && !isASM()) {
      i += 2 // 43, 1e-10
    }

    ;[this.slice, i] = readCurve ? readCurve(chunks, i) : [null, i]

    if (vrs > 22.0 && !isASM()) {
      ;[this.cT1, i] = readCurve ? readCurve(chunks, i) : [null, i]
      ;[this.cT2, i] = readCurve ? readCurve(chunks, i) : [null, i]
      ;[this.cT3, i] = readCurve ? readCurve(chunks, i) : [null, i]
      ;[this.cT4, i] = readCurve ? readCurve(chunks, i) : [null, i]
    }

    ;[this.offset_left, i] = getLength(chunks, i)
    ;[this.offset_right, i] = getLength(chunks, i)

    let f1
    ;[f1, i] = getValue(chunks, i)

    let rU
    ;[rU, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)

    if (vrs <= 3.0) {
      let r1, r2
      ;[r1, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
      ;[r2, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
      i += 2
    }

    let rV, a2
    ;[rV, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
    ;[a2, i] = getFloats(chunks, i, 3)

    if (vrs > 22.0 && !isASM()) {
      i += 1 // T
    }

    i += 1 // skip long

    if (vrs > 3.0) {
      i = this.setSurfaceShape(chunks, i, inventor, subtype)
    }

    if (inventor) {
      // Discontinuity-Info
      let di1, di2, di3
      ;[di1, i] = getFloatArray(chunks, i)
      ;[di2, i] = getFloatArray(chunks, i)
      ;[di3, i] = getFloatArray(chunks, i)
    }

    return i
  }

  setG2Blend(chunks, index, inventor) {
    let i = index

    let t11
    ;[t11, i] = getValue(chunks, i)
    while (!isString(t11)) {
      ;[t11, i] = getValue(chunks, i)
    }

    let s11, c11, p11, v11, p12
    ;[s11, i] = readSurface ? readSurface(chunks, i) : [null, i]
    ;[c11, i] = readCurve ? readCurve(chunks, i) : [null, i]
    ;[p11, i] = readBS2Curve(chunks, i)
    ;[v11, i] = getVector(chunks, i)
    ;[p12, i] = readBS2Curve(chunks, i)

    let singularity
    ;[singularity, i] = getSingularity(chunks, i)

    if (singularity === 'full') {
      let s12
      ;[s12, i] = readBS3Surface(chunks, i)
      if (s12) {
        let tol11
        ;[tol11, i] = getLength(chunks, i)
      }
    } else if (singularity === 'none') {
      let s12, tol11, p13
      ;[s12, i] = getFloats(chunks, i, 9)
      ;[tol11, i] = getLength(chunks, i)

      const chunk = chunks[i]
      if (chunk && ![TAG_UTF8_U8, TAG_IDENT, TAG_SUBIDENT].includes(chunk.tag)) {
        i += 1 // newer Inventor versions (>2017)
      }
      ;[p13, i] = readBS2Curve(chunks, i)
    }

    let t21, s21, c21, p21, v21, p22, s22, tol21
    ;[t21, i] = getValue(chunks, i)
    ;[s21, i] = readSurface ? readSurface(chunks, i) : [null, i]
    ;[c21, i] = readCurve ? readCurve(chunks, i) : [null, i]
    ;[p21, i] = readBS2Curve(chunks, i)
    ;[v21, i] = getVector(chunks, i)
    ;[p22, i] = readBS2Curve(chunks, i)
    ;[s22, tol21, i] = readSplineSurface(chunks, i, true)

    let c1, a1, l1, rU, rV
    ;[c1, i] = readCurve ? readCurve(chunks, i) : [null, i]
    ;[a1, i] = getFloats(chunks, i, 2)
    ;[l1, i] = getLong(chunks, i)
    ;[rU, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
    ;[rV, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
    ;[a1, i] = getFloats(chunks, i, 4)

    i = this.setSurfaceShape(chunks, i, inventor, 'g2_blend_spl_sur')

    if (inventor) {
      // Discontinuity-Info
      let di1, di2, di3
      ;[di1, i] = getFloatArray(chunks, i)
      ;[di2, i] = getFloatArray(chunks, i)
      ;[di3, i] = getFloatArray(chunks, i)
    }

    return i
  }

  setDefm(chunks, index, inventor) {
    let i = index

    ;[this.surface, i] = readSurface ? readSurface(chunks, i) : [null, i]

    let t1
    ;[t1, i] = getInteger(chunks, i)

    if (t1 === 1) {
      let v11, v12, v13, v14, f15
      ;[v11, i] = getVector(chunks, i)
      ;[v12, i] = getVector(chunks, i)
      ;[v13, i] = getVector(chunks, i)
      ;[v14, i] = getVector(chunks, i)
      ;[f15, i] = getFloat(chunks, i)

      let e21, e22, e23
      ;[e21, i] = getBoolean(chunks, i)
      ;[e22, i] = getBoolean(chunks, i)
      ;[e23, i] = getBoolean(chunks, i)

      let v21, v22, v23, f21
      ;[v21, i] = getVector(chunks, i)
      ;[v22, i] = getVector(chunks, i)
      ;[v23, i] = getVector(chunks, i)
      ;[f21, i] = getFloat(chunks, i)

      let e24, e25, v24, e26, e27, e28, e29, e2A
      ;[e24, i] = getBoolean(chunks, i)
      ;[e25, i] = getBoolean(chunks, i)
      ;[v24, i] = getPoint(chunks, i)
      ;[e26, i] = getBoolean(chunks, i)
      ;[e27, i] = getBoolean(chunks, i)
      ;[e28, i] = getBoolean(chunks, i)
      ;[e29, i] = getBoolean(chunks, i)
      ;[e2A, i] = getBoolean(chunks, i)

      let t2
      ;[t2, i] = getInteger(chunks, i)
      if (t2 > 0) {
        let a1
        ;[a1, i] = getFloats(chunks, i, 3 * t2)
      }
    } else if (t1 === 3) {
      let v11, v12, v13, v14, f15
      ;[v11, i] = getVector(chunks, i)
      ;[v12, i] = getVector(chunks, i)
      ;[v13, i] = getVector(chunks, i)
      ;[v14, i] = getVector(chunks, i)
      ;[f15, i] = getFloat(chunks, i)

      let e21, e22, e23
      ;[e21, i] = getBoolean(chunks, i)
      ;[e22, i] = getBoolean(chunks, i)
      ;[e23, i] = getBoolean(chunks, i)

      let v21, v22, v23, f21
      ;[v21, i] = getVector(chunks, i)
      ;[v22, i] = getVector(chunks, i)
      ;[v23, i] = getVector(chunks, i)
      ;[f21, i] = getFloat(chunks, i)

      let e24, e25, v24, e26, e27, e28, e29, e2A
      ;[e24, i] = getBoolean(chunks, i)
      ;[e25, i] = getBoolean(chunks, i)
      ;[v24, i] = getPoint(chunks, i)
      ;[e26, i] = getBoolean(chunks, i)
      ;[e27, i] = getBoolean(chunks, i)
      ;[e28, i] = getBoolean(chunks, i)
      ;[e29, i] = getBoolean(chunks, i)
      ;[e2A, i] = getBoolean(chunks, i)

      let t3, v31
      ;[t3, i] = getInteger(chunks, i)
      ;[v31, i] = getFloat(chunks, i)
    } else if (t1 === 5) {
      ;[this.surface, i] = readSurface ? readSurface(chunks, i) : [null, i]

      let i32, e31, f32, i33, f34
      ;[i32, i] = getLong(chunks, i)
      ;[e31, i] = getBoolean(chunks, i)
      ;[f32, i] = getFloat(chunks, i)
      ;[i33, i] = getInteger(chunks, i)
      ;[f34, i] = getFloat(chunks, i)

      this.curve = new CurveInt()
      i = this.curve.setSubtype(chunks, i)

      let v11, v12, v13, v14, f15
      ;[v11, i] = getVector(chunks, i)
      ;[v12, i] = getVector(chunks, i)
      ;[v13, i] = getVector(chunks, i)
      ;[v14, i] = getVector(chunks, i)
      ;[f15, i] = getFloat(chunks, i)

      let e21, e22, e23, t2
      ;[e21, i] = getBoolean(chunks, i)
      ;[e22, i] = getBoolean(chunks, i)
      ;[e23, i] = getBoolean(chunks, i)
      ;[t2, i] = getInteger(chunks, i)

      if (t2 > 0) {
        let a1
        ;[a1, i] = getFloats(chunks, i, 3 * t2)
      }
    } else if (t1 === 6) {
      let v11, v12, v13, v14, t2, b1, b2, b3
      ;[v11, i] = getVector(chunks, i)
      ;[v12, i] = getVector(chunks, i)
      ;[v13, i] = getVector(chunks, i)
      ;[v14, i] = getVector(chunks, i)
      ;[t2, i] = getFloat(chunks, i)
      ;[b1, i] = getBoolean(chunks, i)
      ;[b2, i] = getBoolean(chunks, i)
      ;[b3, i] = getBoolean(chunks, i)
      ;[t2, i] = getInteger(chunks, i)

      let srf, v15, b4
      ;[srf, i] = readSurface ? readSurface(chunks, i) : [null, i]
      ;[v15, i] = getLong(chunks, i)
      ;[b4, i] = getBoolean(chunks, i)

      let v16
      ;[v16, i] = getFloat(chunks, i)

      if (getVersion() > 225 && isASM()) {
        let v17
        ;[v17, i] = getLong(chunks, i)
      }

      let v18
      ;[v18, i] = getFloat(chunks, i)

      const d17 = new CurveInt()
      i = d17.setSubtype(chunks, i)

      let d18, d19, d20, d21, d22, d23, d24, d25
      ;[d18, i] = getVector(chunks, i)
      ;[d19, i] = getVector(chunks, i)
      ;[d20, i] = getVector(chunks, i)
      ;[d21, i] = getVector(chunks, i)
      ;[d22, i] = getFloat(chunks, i)
      ;[d23, i] = getBoolean(chunks, i)
      ;[d24, i] = getBoolean(chunks, i)
      ;[d25, i] = getBoolean(chunks, i)

      let d26, d27, d28, d29, d30, d31, d32, d33, d34
      ;[d26, i] = getVector(chunks, i)
      ;[d27, i] = getVector(chunks, i)
      ;[d28, i] = getVector(chunks, i)
      ;[d29, i] = getVector(chunks, i)
      ;[d30, i] = getFloat(chunks, i)
      ;[d31, i] = getBoolean(chunks, i)
      ;[d32, i] = getBoolean(chunks, i)
      ;[d33, i] = getBoolean(chunks, i)
      ;[d34, i] = getLong(chunks, i)
    } else if (t1 === 8) {
      let v11, v12, v13, v14, t2
      ;[v11, i] = getVector(chunks, i)
      ;[v12, i] = getVector(chunks, i)
      ;[v13, i] = getVector(chunks, i)
      ;[v14, i] = getVector(chunks, i)
      ;[t2, i] = getInteger(chunks, i)
    } else {
      throw new TypeError(`Unknown defm_sur_spl type ${t1}`)
    }

    i = this.setSurfaceShape(chunks, i, inventor, 'defm_spl_sur')
    return i
  }

  setSweep(chunks, index, inventor) {
    let i = index
    const vrs = getVersion()

    if (vrs > 11.0 && !isASM()) {
      let r11
      ;[r11, i] = getText(chunks, i)
    }

    ;[this.s1, i] = getEnumByTag(chunks, i, SURF_SWEEP)

    const chunk = chunks[i]
    if (chunk && [TAG_LONG, TAG_FLOAT, TAG_DOUBLE].includes(chunk.tag)) {
      let n
      ;[n, i] = getInteger(chunks, i)
      ;[this.profile, i] = readCurve ? readCurve(chunks, i) : [null, i]
      ;[this.prof_rng, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)

      let b1
      ;[b1, i] = getBoolean(chunks, i)
      if (b1) {
        ;[this.v1, i] = getLocation(chunks, i)
        ;[this.v2, i] = getVector(chunks, i)
      } else {
        this.v1 = { ...CENTER }
        this.v2 = { ...DIR_Z }
      }

      ;[this.v3, i] = getLocation(chunks, i)
      ;[this.v4, i] = getVector(chunks, i)
      ;[this.v5, i] = getVector(chunks, i)
      ;[this.v6, i] = getVector(chunks, i)

      const nextChunk = chunks[i]
      if (nextChunk && [TAG_LONG, TAG_FLOAT, TAG_DOUBLE].includes(nextChunk.tag)) {
        let n2, bln2
        ;[n2, i] = getInteger(chunks, i)
        ;[bln2, i] = getBoolean(chunks, i)
        ;[this.path, i] = readCurve ? readCurve(chunks, i) : [null, i]

        let rng2, flt2
        ;[rng2, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())
        ;[flt2, i] = getFloat(chunks, i)

        if (n2 === 1) {
          let bln3, frm1, bln4
          ;[bln3, i] = getBoolean(chunks, i)
          ;[frm1, i] = readFormula(chunks, i)
          ;[bln4, i] = getBoolean(chunks, i)
        } else if (n2 === 2) {
          let bln3, bln4, c1, rng3, num3, num4, flt3, bln5, bln6, bln7
          ;[bln3, i] = getBoolean(chunks, i)
          ;[bln4, i] = getBoolean(chunks, i)
          ;[c1, i] = readCurve ? readCurve(chunks, i) : [null, i]
          ;[rng3, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
          ;[num3, i] = getInteger(chunks, i)
          ;[num4, i] = getInteger(chunks, i)
          ;[flt3, i] = getFloats(chunks, i, 6)
          ;[bln5, i] = getBoolean(chunks, i)
          ;[bln6, i] = getBoolean(chunks, i)
          ;[bln7, i] = getBoolean(chunks, i)
        } else if (n2 === 3) {
          let sng1, srf1, bln4, crv1, bln6, bln7
          ;[sng1, i] = getSingularity(chunks, i)
          ;[srf1, i] = readSurface ? readSurface(chunks, i) : [null, i]
          ;[bln4, i] = getBoolean(chunks, i)
          if (bln4) {
            ;[crv1, i] = readCurve ? readCurve(chunks, i) : [null, i]
          }
          ;[bln6, i] = getBoolean(chunks, i)
          if (getAsmMajor() < 219) {
            ;[bln7, i] = getBoolean(chunks, i)
          }
        }
      } else {
        let l1, n1, r1, v1, n2, b1, c1, r2, x1, b2, l2, n3, f1, b3
        ;[l1, i] = readLaw ? readLaw(chunks, i) : [null, i]
        ;[n1, i] = getInteger(chunks, i)
        ;[r1, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
        ;[v1, i] = getVector(chunks, i)
        ;[n2, i] = getInteger(chunks, i)
        ;[b1, i] = getBoolean(chunks, i)
        ;[c1, i] = readCurve ? readCurve(chunks, i) : [null, i]
        ;[r2, i] = getInterval(chunks, i, MIN_INF, MAX_INF, 1.0)
        ;[x1, i] = getFloat(chunks, i)
        ;[b2, i] = getBoolean(chunks, i)
        ;[l2, i] = readLaw ? readLaw(chunks, i) : [null, i]
        ;[n3, i] = getInteger(chunks, i)
        ;[f1, i] = readFormula(chunks, i)
        ;[b3, i] = getBoolean(chunks, i)
      }
    } else {
      ;[this.profile, i] = readCurve ? readCurve(chunks, i) : [null, i]
      ;[this.path, i] = readCurve ? readCurve(chunks, i) : [null, i]
      ;[this.s2, i] = getEnumByTag(chunks, i, SURF_SWEEP)
      ;[this.v1, i] = getVector(chunks, i)

      if (!isASM()) {
        if (vrs > 16.0) {
          let r
          ;[r, i] = getEnumByValue(chunks, i, SURF_RIGID)
          if (vrs > 24.0) {
            let s
            ;[s, i] = getEnumByValue(chunks, i, SURF_AXIS_SWEEP)
          }
        }
      }

      ;[this.v2, i] = getVector(chunks, i)
      ;[this.v3, i] = getVector(chunks, i)
      ;[this.v4, i] = getVector(chunks, i)
      ;[this.v5, i] = getVector(chunks, i)
      ;[this.v6, i] = getLocation(chunks, i)

      if (inventor) {
        ;[this.a1, i] = getFloats(chunks, i, 4)
      } else {
        ;[this.a1, i] = getFloats(chunks, i, 1)
      }

      ;[this.frml, i] = readFormula(chunks, i)
      ;[this.frm2, i] = readFormula(chunks, i)
      ;[this.frm3, i] = readFormula(chunks, i)
    }

    i = this.setSurfaceShape(chunks, i, inventor, 'sweep_spl_sur')
    return i
  }

  // ==========================================================================
  // Additional Surface Setters
  // ==========================================================================

  setTaper(chunks, index, inventor, subtype = 'taper_spl_sur') {
    let i = index
    ;[this.surface, i] = readSurface ? readSurface(chunks, i) : [null, i]
    ;[this.curve, i] = readCurve ? readCurve(chunks, i) : [null, i]
    ;[this.pcurve, i] = readBS2Curve(chunks, i)

    let f1
    ;[f1, i] = getFloat(chunks, i)

    i = this.setSurfaceShape(chunks, i, inventor, subtype)
    return i
  }

  setEdgeTaper(chunks, index, inventor, subtype = 'edge_tpr_spl_sur') {
    let i = this.setTaper(chunks, index, inventor, subtype)
    ;[this.draft, i] = getVector(chunks, i)
    return i
  }

  setShadowTaper(chunks, index, inventor) {
    let i = this.setEdgeTaper(chunks, index, inventor, 'shadow_tpr_spl_sur')
    ;[this.sine, i] = getFloat(chunks, i)
    ;[this.cosine, i] = getFloat(chunks, i)
    return i
  }

  setRuledTaper(chunks, index, inventor) {
    let i = this.setEdgeTaper(chunks, index, inventor, 'ruled_tpr_spl_sur')
    ;[this.sine, i] = getFloat(chunks, i)
    ;[this.cosine, i] = getFloat(chunks, i)
    ;[this.fac, i] = getFloat(chunks, i)
    return i
  }

  setSweptTaper(chunks, index, inventor) {
    let i = this.setEdgeTaper(chunks, index, inventor, 'swept_tpr_spl_sur')
    ;[this.sine, i] = getFloat(chunks, i)
    ;[this.cosine, i] = getFloat(chunks, i)
    return i
  }

  setVarBlend(chunks, index, inventor, subtype = 'var_blend_spl_sur') {
    this.subtype = subtype
    let i = index
    const vrs = getVersion()

    let bs1, bs2
    ;[bs1, i] = this._readRbBlendSurface2(chunks, i, inventor)
    ;[bs2, i] = this._readRbBlendSurface2(chunks, i, inventor)

    if (vrs > 22.0 && !isASM()) {
      i += 2 // 122, -1
    }

    let cur1
    ;[cur1, i] = readCurve ? readCurve(chunks, i) : [null, i]

    if (vrs > 22.0 && !isASM()) {
      let curT1, curT2, curT3, curT4
      ;[curT1, i] = readCurve ? readCurve(chunks, i) : [null, i]
      ;[curT2, i] = readCurve ? readCurve(chunks, i) : [null, i]
      ;[curT3, i] = readCurve ? readCurve(chunks, i) : [null, i]
      ;[curT4, i] = readCurve ? readCurve(chunks, i) : [null, i]
    }

    let off
    ;[off, i] = getFloats(chunks, i, 2)

    let r1, bv1
    ;[r1, i] = getEnumByValue(chunks, i, VAR_RADIUS)
    ;[bv1, i] = this._getBlendValues(chunks, i)

    if (r1 === 'two_radii') {
      let bv2, vc, ct, bv3
      ;[bv2, i] = this._getBlendValues(chunks, i)
      const chunk = chunks[i]
      if (chunk && (chunk.val === 3 || chunk.val === 'rounded_chamfer')) {
        ;[vc, i] = getEnumByValue(chunks, i, VAR_CHAMFER)
        ;[ct, i] = getEnumByTag(chunks, i, CHAMFER_TYPE)
        ;[bv3, i] = this._getBlendValues(chunks, i)
      }
    } else if (r1 === 'single_radius') {
      const chunk = chunks[i]
      if (chunk && (chunk.val === 1 || chunk.val === 7)) {
        let ut1, uv1
        ;[ut1, i] = getValue(chunks, i)
        ;[uv1, i] = getFloats(chunks, i, 2)
      }
    }

    let rU
    ;[rU, i] = getInterval(chunks, i, 0, 1, 1.0)

    if (vrs > 7.0 && vrs < 23) {
      let r1Val, r2
      ;[r1Val, i] = getInterval(chunks, i, 0, 1, 1.0)
      ;[r2, i] = getInterval(chunks, i, 0, 1, 1.0)
      i += 2 // skip 0, 2
    }

    let rV
    ;[rV, i] = getInterval(chunks, i, 0, 1, 1.0)

    if (vrs > 3.0) {
      let j, f, s
      ;[j, i] = getInteger(chunks, i)
      ;[f, i] = getFloat(chunks, i)
      ;[s, i] = getLength(chunks, i)

      if (vrs > 22.0 && !isASM()) {
        let b
        ;[b, i] = getBoolean(chunks, i)
      }

      let k
      ;[k, i] = getInteger(chunks, i)
      i = this.setSurfaceShape(chunks, i, inventor, subtype)

      if (inventor) {
        let a
        ;[a, i] = getIntegers(chunks, i, 3)
      }
    } else {
      let r1Val, a1, v1, k
      ;[r1Val, i] = getInterval(chunks, i, 0, 1, 1.0)
      ;[a1, i] = getFloats(chunks, i, 2)
      ;[r1Val, i] = getInterval(chunks, i, 0, 1, 1.0)
      ;[v1, i] = getLocation(chunks, i)
      ;[k, i] = getInteger(chunks, i)
    }

    let cur2, c, rb
    ;[cur2, i] = readCurve ? readCurve(chunks, i) : [null, i]
    ;[c, i] = getEnumByTag(chunks, i, CONVEXITY)

    if (vrs > 3.0) {
      ;[rb, i] = getEnumByTag(chunks, i, RENDER_BLEND)
    }

    if (inventor) {
      let r, bc1, bc2
      ;[r, i] = getInterval(chunks, i, 0.0, 1.0, 1.0)
      ;[bc1, i] = readBS3Curve(chunks, i)
      ;[bc2, i] = readBS2Curve(chunks, i)
    }

    return i
  }

  setSssBlend(chunks, index, inventor) {
    let i = this.setRbBlend(chunks, index, inventor, 'sss_blend_spl_sur')
    let rb3
    ;[rb3, i] = this._readRbBlendCurve(chunks, i, inventor)
    return i
  }

  setSrfSrvVBlend(chunks, index, inventor) {
    return this.setVarBlend(chunks, index, inventor, 'srf_srf_v_bl_spl_sur')
  }

  setTSpline(chunks, index, inventor) {
    let i = this.setSurfaceShape(chunks, index, inventor, 't_spl_sur')

    let rU, rV, typ
    ;[rU, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())
    ;[rV, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())
    ;[typ, i] = getInteger(chunks, i)

    const chunk = chunks[i]
    if (chunk && chunk.tag === TAG_SUBTYPE_OPEN) {
      i += 1

      const nextChunk = chunks[i]
      if (nextChunk && nextChunk.val === 't_spl_subtrans_object') {
        let data
        ;[data, i] = getValue(chunks, i + 1)
        if (chunks[i].tag !== 0x08) i += 1
        let values
        ;[values, i] = getValue(chunks, i)
        // t_spline handling - would add to reader
      } else if (nextChunk && nextChunk.val === 'ref') {
        ;[this.tRef, i] = getInteger(chunks, i + 1)
      }

      const closeChunk = chunks[i]
      if (closeChunk && closeChunk.tag === TAG_SUBTYPE_CLOSE) {
        let num
        ;[num, i] = getInteger(chunks, i + 1)
      }
    }

    return i
  }

  setScaleClft(chunks, index, inventor) {
    this.subtype = 'scaled_cloft_spl_sur'
    let i = index

    let singularity
    ;[singularity, i] = getSingularity(chunks, i)

    if (singularity === 'full') {
      let spline, tol
      ;[spline, i] = readBS3Surface(chunks, i)
      if (spline) {
        this.spline = spline
      }
      ;[tol, i] = getLength(chunks, i)
    } else if (singularity === 'none') {
      let r1, r2, a11, a12
      ;[r1, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())
      ;[r2, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())
      ;[a11, i] = getFloatArray(chunks, i)
      ;[a12, i] = getFloatArray(chunks, i)
    }

    let arr
    ;[arr, i] = getDiscontinuityInfo(chunks, i, inventor)

    let l1, l2, l3
    ;[l1, i] = this._readScaleClLoft(chunks, i)
    ;[l2, i] = this._readScaleClLoft(chunks, i)
    ;[l3, i] = this._readScaleClLoft(chunks, i)

    let e1, e2, i1
    ;[e1, i] = getBoolean(chunks, i)
    ;[e2, i] = getBoolean(chunks, i)
    ;[i1, i] = getInteger(chunks, i)

    let e4
    ;[e4, i] = getBoolean(chunks, i)

    if (e4) {
      let l5, e5
      ;[l5, i] = this._readScaleClLoft(chunks, i)
      ;[e5, i] = getBoolean(chunks, i)
      if (e5) {
        let l6, i6, p6
        ;[l6, i] = this._readScaleClLoft(chunks, i)
        ;[i6, i] = getInteger(chunks, i)
        ;[p6, i] = getVector(chunks, i)
      } else {
        let e6, i6, c6
        ;[e6, i] = getBoolean(chunks, i)
        ;[i6, i] = getSingularity(chunks, i)
        ;[c6, i] = readBS3Curve(chunks, i)
      }
    } else {
      let e5, i5, l5
      ;[e5, i] = getBoolean(chunks, i)
      ;[i5, i] = getInteger(chunks, i)
      if (i5 === 0) {
        ;[l5, i] = getVector(chunks, i)
      } else {
        ;[l5, i] = readBS3Curve(chunks, i)
      }
    }

    let e5New, e6, i3, v1, v2, i4, p3
    ;[e5New, i] = getBoolean(chunks, i)
    ;[e6, i] = getBoolean(chunks, i)
    ;[i3, i] = getInteger(chunks, i)
    ;[v1, i] = getVector(chunks, i)
    ;[v2, i] = getVector(chunks, i)
    ;[i4, i] = getSingularity(chunks, i)
    ;[p3, i] = readBS3Curve(chunks, i)

    return i
  }

  // ==========================================================================
  // Reference and Bulk Setters
  // ==========================================================================

  setRef(chunks, index) {
    this.subtype = 'ref'
    ;[this.ref, ] = getInteger(chunks, index)
    const reader = getReader()
    if (reader && reader.getSubtypeEntity) {
      this.surface = reader.getSubtypeEntity(this.ref)
    }
    return index + 1
  }

  setBulk(chunks, index) {
    let i = index
    ;[this.subtype, i] = getValue(chunks, i)

    if (this.subtype === 'ref') {
      return this.setRef(chunks, i)
    }

    try {
      if (getVersion() >= 25.0 && !isASM()) {
        let id
        ;[id, i] = getInteger(chunks, i)
      }

      const reader = getReader()
      if (reader && reader.addSubtypeEntity) {
        reader.addSubtypeEntity(this)
      }

      const prm = SURFACE_TYPES[this.subtype]
      if (!prm) {
        throw new Error(`No implementation available for spline '${this.subtype}'`)
      }

      const method = this[prm[0]]
      if (typeof method !== 'function') {
        throw new Error(`Method ${prm[0]} not found for spline '${this.subtype}'`)
      }

      return method.call(this, chunks, i + prm[1], prm[2])
    } catch (e) {
      console.error(`SurfaceSpline.setBulk failed for ${this.subtype}:`, e.message)
      throw e
    }
  }

  setSubtypeBulk(chunks, index) {
    ;[this.sense, ] = getEnumByTag(chunks, index, SENSE)

    if (this.record === null) {
      this.record = { name: 'spline', index: this.index, entity: this }
    }

    let i = this.setBulk(chunks, index + 2)

    const chunk = chunks[i]
    if (!chunk || chunk.tag !== TAG_SUBTYPE_CLOSE) {
      console.warn(`SurfaceSpline: expected close tag at ${i}, found ${chunk?.tag}`)
    }

    ;[this.rangeU, i] = getInterval(chunks, i + 1, MIN_INF, MAX_INF, getScale())
    ;[this.rangeV, i] = getInterval(chunks, i, MIN_INF, MAX_INF, getScale())

    return i
  }

  // ==========================================================================
  // Surface Resolution
  // ==========================================================================

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

  // ==========================================================================
  // Build Method
  // ==========================================================================

  build(face = null) {
    if (this._readyToBuild) {
      this._readyToBuild = false

      if (this.subtype === 'ref') {
        const surface = this.getSurface()
        if (surface && typeof surface.build === 'function') {
          this.shape = surface.build(face)
        }
      } else if (this.spline) {
        this.shape = {
          type: 'bspline_surface',
          spline: this.spline,
          subtype: this.subtype
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
  // Cylinder
  'cylsur': ['setCylinder', 0, false],
  'cyl_spl_sur': ['setCylinder', 1, true],

  // Defm (deformation)
  'defmsur': ['setDefm', 0, false],
  'defm_spl_sur': ['setDefm', 1, true],

  // Exact
  'exactsur': ['setExact', 0, false],
  'exact_spl_sur': ['setExact', 1, true],

  // G2 Blend
  'g2blnsur': ['setG2Blend', 0, false],
  'g2_blend_spl_sur': ['setG2Blend', 1, true],

  // Loft
  'loftsur': ['setLoft', 0, false],
  'loft_spl_sur': ['setLoft', 1, true],

  // Net
  'netsur': ['setNet', 0, false],
  'net_spl_sur': ['setNet', 1, true],

  // Offset
  'offsur': ['setOffset', 0, false],
  'off_spl_sur': ['setOffset', 1, true],

  // Ortho
  'orthosur': ['setOrtho', 0, false],
  'ortho_spl_sur': ['setOrtho', 1, true],

  // Rolling Ball Blend
  'rbblnsur': ['setRbBlend', 0, false],
  'rb_blend_spl_sur': ['setRbBlend', 1, true],

  // Rotation
  'rotsur': ['setRotation', 0, false],
  'rot_spl_sur': ['setRotation', 1, true],

  // Ruled
  'rulesur': ['setRule', 0, false],
  'rule_sur': ['setRule', 1, true],

  // Skin
  'skinsur': ['setSkin', 0, false],
  'skin_spl_sur': ['setSkin', 1, true],

  // Sweep
  'sweepsur': ['setSweep', 0, false],
  'sweep_spl_sur': ['setSweep', 1, true],
  'sweep_sur': ['setSweep', 1, true],

  // Sum
  'sumsur': ['setSum', 0, false],
  'sum_spl_sur': ['setSum', 1, true],

  // Vertex Blend
  'vertexblendsur': ['setVertexBlend', 0, false],
  'VBL_SURF': ['setVertexBlend', 1, true],

  // ASM Extensions
  'cl_loft_spl_sur': ['setClLoft', 1, true],
  'comp_spl_sur': ['setCompound', 1, true],
  'helix_spl_circ': ['setHelixCircle', 1, true],
  'helix_spl_line': ['setHelixLine', 1, true],
  't_spl_sur': ['setTSpline', 1, true],
  'scaled_cloft_spl_sur': ['setScaleClft', 1, true],

  // Variable Blend
  'var_blend_spl_sur': ['setVarBlend', 1, true],
  'sss_blend_spl_sur': ['setSssBlend', 1, true],
  'srf_srf_v_bl_spl_sur': ['setSrfSrvVBlend', 1, true],

  // Taper variants
  'taper_spl_sur': ['setTaper', 1, true],
  'edge_tpr_spl_sur': ['setEdgeTaper', 1, true],
  'shadow_tpr_spl_sur': ['setShadowTaper', 1, true],
  'ruled_tpr_spl_sur': ['setRuledTaper', 1, true],
  'swept_tpr_spl_sur': ['setSweptTaper', 1, true]
}
