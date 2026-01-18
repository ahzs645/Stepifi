/**
 * ACIS Data Classes
 * Core data structures for B-Splines, Helix, Range, Interval, etc.
 * Ported from Acis.py lines 1172-1450
 */

import {
  MIN_0, MAX_2PI, MIN_INF, MAX_INF,
  CENTER, DIR_X, DIR_Y, DIR_Z
} from './constants.js'
import { VEC, NORM, CROSS, SIZE, degrees, isEqual1D, V2D } from './math.js'

// ============================================================================
// Range Class
// ============================================================================

/**
 * Represents a range value that can be either infinite ('I') or finite ('F')
 */
export class Range {
  constructor(type, limit, scale = 1.0) {
    this.type = type    // 'I' for infinite, 'F' for finite
    this.limit = limit
    this.scale = scale
  }

  toString() {
    return this.type === 'I' ? 'I' : `F ${this.getLimit()}`
  }

  getLimit() {
    return this.type === 'I' ? this.limit : this.limit * this.scale
  }

  equals(other) {
    if (other instanceof Range) {
      return this.getLimit() === other.getLimit()
    }
    return this.getLimit() === other
  }

  subtract(other) {
    if (other instanceof Range) {
      return this.getLimit() - other.getLimit()
    }
    return this.getLimit() - other
  }

  add(other) {
    if (other instanceof Range) {
      return this.getLimit() + other.getLimit()
    }
    return this.getLimit() + other
  }
}

// ============================================================================
// Interval Class
// ============================================================================

/**
 * Represents an interval with lower and upper Range bounds
 */
export class Interval {
  constructor(lower, upper) {
    this.lower = lower
    this.upper = upper
  }

  toString() {
    return `${this.lower} ${this.upper}`
  }

  getLowerType() { return this.lower.type }
  getLowerLimit() { return this.lower.getLimit() }
  getUpperType() { return this.upper.type }
  getUpperLimit() { return this.upper.getLimit() }
  getLimit() { return this.getUpperLimit() - this.getLowerLimit() }
}

// ============================================================================
// B-Spline Curve Class
// ============================================================================

/**
 * B-Spline curve data structure
 */
export class BS_Curve {
  /**
   * @param {boolean} rational - True for NURBS, False for NUBS
   * @param {boolean} periodic - True for closed curves
   * @param {number} degree - Curve degree
   */
  constructor(rational, periodic, degree) {
    this.poles = []           // Array of {x, y, z} points
    this.uMults = []          // Knot multiplicities
    this.uKnots = []          // Knot values
    this.uPeriodic = periodic
    this.uDegree = degree
    this.weights = []         // Weights (same length as poles for rational)
    this.rational = rational
  }
}

// ============================================================================
// B-Spline Surface Class
// ============================================================================

/**
 * B-Spline surface data structure
 */
export class BS_Surface extends BS_Curve {
  /**
   * @param {boolean} rational - True for NURBS
   * @param {boolean} uPeriodic - Periodic in U direction
   * @param {boolean} vPeriodic - Periodic in V direction
   * @param {number} uDegree - Degree in U direction
   * @param {number} vDegree - Degree in V direction
   */
  constructor(rational, uPeriodic, vPeriodic, uDegree, vDegree) {
    super(rational, uPeriodic, uDegree)
    this.poles = [[]]         // 2D array of points
    this.weights = [[]]       // 2D array of weights
    this.vMults = []
    this.vKnots = []
    this.vPeriodic = vPeriodic
    this.vDegree = vDegree
  }
}

// ============================================================================
// Helix Class
// ============================================================================

/**
 * Helix curve data structure
 */
export class Helix {
  constructor() {
    this.radAngles = new Interval(new Range('I', 1.0), new Range('I', 1.0))
    this.posCenter = { ...CENTER }
    this.dirMajor = { ...DIR_X }
    this.dirMinor = { ...DIR_Y }
    this.dirPitch = { ...DIR_Z }
    this.facApex = MIN_0
    this.vecAxis = { ...DIR_Z }
  }

  toString() {
    return `${this.radAngles} ${JSON.stringify(this.posCenter)} ${JSON.stringify(this.dirMajor)} ` +
           `${JSON.stringify(this.dirMinor)} ${JSON.stringify(this.dirPitch)} ${this.facApex} ` +
           `${JSON.stringify(this.vecAxis)}`
  }

  getPitch() {
    return SIZE(this.dirPitch)
  }

  getHeight() {
    const angle = this.radAngles.getLimit()
    const pitch = this.getPitch()
    return pitch * angle / 2.0 / Math.PI
  }

  getRadius() {
    const majLen = SIZE(this.dirMajor)
    const minLen = SIZE(this.dirMinor)
    if (!isEqual1D(majLen, minLen)) {
      console.warn('Helix: elliptical helix not fully supported')
    }
    return majLen
  }

  getApexAngle() {
    const radApexAngle = Math.atan2(this.facApex * this.getRadius(), this.getPitch())
    return degrees(radApexAngle)
  }

  isLeftHanded() {
    const cross = CROSS(this.vecAxis, this.dirMajor)
    const angle = Math.acos(Math.max(-1, Math.min(1,
      (cross.x * this.dirMinor.x + cross.y * this.dirMinor.y + cross.z * this.dirMinor.z) /
      (SIZE(cross) * SIZE(this.dirMinor))
    )))
    return angle < 0.1
  }

  /**
   * Calculate parameter steps for helix interpolation
   */
  static calcSteps(a, b, numSegments = 6) {
    const startSegment = 0.05 // ~1 degree to smooth start
    const steps = [a, a + startSegment]

    const d = b - a
    const step = d / Math.ceil(numSegments * d / 2 / Math.PI)
    let c = a
    while (c < (b - startSegment)) {
      c += step
      steps.push(c)
    }

    steps.splice(steps.length - 1, 0, b - startSegment)
    return steps
  }

  /**
   * Calculate point on helix at parameter u
   */
  static calcPoint(u, minU, a, rMaj, rMin, handed, pitch) {
    const deltaU = (u - minU) / 2 / Math.PI
    const fac = 1 + a * deltaU
    const x = rMaj * fac * Math.cos(u)
    const y = rMin * fac * Math.sin(u) * handed
    const z = pitch * deltaU
    return { x, y, z }
  }

  /**
   * Build helix curve points for interpolation
   * @returns {Array<{x,y,z}>} Array of points
   */
  buildPoints() {
    const minU = this.radAngles.getLowerLimit()
    const maxU = this.radAngles.getUpperLimit()
    const rMaj = SIZE(this.dirMajor)
    const rMin = SIZE(this.dirMinor)
    const pitch = SIZE(this.dirPitch)
    const stepsU = Helix.calcSteps(minU, maxU)
    const handed = this.isLeftHanded() ? 1 : -1
    const points = []

    for (const u of stepsU) {
      const c = Helix.calcPoint(u, minU, this.facApex, rMaj, rMin, handed, pitch)
      points.push(c)
    }

    return points
  }
}

// ============================================================================
// Loft Data Classes
// ============================================================================

export class LoftData {
  constructor() {
    this.surface = null
    this.bs2cur = null
    this.e1 = false
    this.type = 213
    this.n = 1
    this.m = 1
    this.v = []
    this.e2 = false
    this.dir = null
  }
}

export class Skin {
  constructor() {
    this.a1 = [-1, -1, -1, -1]
    this.f1 = MIN_0
    this.loft = []
    this.a2 = [0.0, 0.0, 0.0]
    this.surf = null
    this.n = 0
    this.law = 'null_law'
    this.pcur = null
    this.cur = null
    this.cur2 = null
    this.vec = null
    this.f2 = 0
  }
}

// ============================================================================
// Boundary Geometry Classes
// ============================================================================

/**
 * Base class for boundary geometry
 */
export class BDY_GEOM {
  constructor(svId) {
    this.svId = svId
    this.shape = null
    this._readyToBuild = true
  }

  build() {
    if (this._readyToBuild) {
      this._readyToBuild = false
      this.buildCurve()
    }
    return this.shape
  }

  buildCurve() {
    // Override in subclasses
  }
}

export class BDY_GEOM_CIRCLE extends BDY_GEOM {
  constructor() {
    super('circle')
    this.curve = null
    this.twist = [null, null]
    this.parameters = [MIN_0, MAX_2PI]
    this.sense = 'forward'
    this.type = 'non_cross'
    this.magic = { ...CENTER }
    this.uSmoothing = 'non_smooth'
    this.vSmoothing = 'non_smooth'
    this.fullness = 0
  }

  buildCurve() {
    if (this.curve !== null) {
      const u = this.parameters[0]
      const v = this.parameters[1]
      this.shape = this.curve.build(u, v)
    }
  }
}

export class BDY_GEOM_DEG extends BDY_GEOM {
  constructor() {
    super('deg')
    this.location = { ...CENTER }
    this.normal1 = { ...DIR_X }
    this.normal2 = { ...DIR_Y }
    this.type = 'non_cross'
    this.magic = { ...CENTER }
    this.uSmoothing = 'non_smooth'
    this.vSmoothing = 'non_smooth'
    this.fullness = 0
  }

  buildCurve() {
    // Creates a point shape
    this.shape = { type: 'point', location: this.location }
  }
}

export class BDY_GEOM_PCURVE extends BDY_GEOM {
  constructor() {
    super('pcurve')
    this.surface = null
    this.pcurve = null
    this.sense = 'forward'
    this.fittolerance = 0.0
    this.type = 'non_cross'
    this.magic = { ...CENTER }
    this.uSmoothing = 'non_smooth'
    this.vSmoothing = 'non_smooth'
    this.fullness = 0
  }

  buildCurve() {
    // Build curve from pcurve on surface
    // This requires the OpenCascade geometry builder
  }
}

export class BDY_GEOM_PLANE extends BDY_GEOM {
  constructor() {
    super('plane')
    this.normal = { ...DIR_Z }
    this.parameters = [MIN_0, 1.0]
    this.curve = null
    this.type = 'non_cross'
    this.magic = { ...CENTER }
    this.uSmoothing = 'non_smooth'
    this.vSmoothing = 'non_smooth'
    this.fullness = 0
  }

  buildCurve() {
    if (this.curve !== null) {
      const u = this.parameters[0]
      const v = this.parameters[1]
      this.shape = this.curve.build(u, v)
    }
  }
}

// ============================================================================
// Index Mappings (for DC attributes)
// ============================================================================

export class IndexMappings {
  constructor() {
    this.attributes = []
  }

  append(attr) {
    this.attributes.push(attr)
  }

  _getTypedOwners(ownerType) {
    const result = new Map()
    for (const a of this.attributes) {
      const owner = a.getOwner()
      if (owner && owner.getType() === ownerType) {
        if (!result.has(owner.index)) {
          result.set(owner.index, owner)
        }
      }
    }
    return Array.from(result.values())
  }

  getEdges() {
    return this._getTypedOwners('edge')
  }

  getFaces() {
    return this._getTypedOwners('face')
  }
}

// ============================================================================
// VBL Classes Map
// ============================================================================

export const VBL_CLASSES = {
  'circle': BDY_GEOM_CIRCLE,
  'deg': BDY_GEOM_DEG,
  'pcurve': BDY_GEOM_PCURVE,
  'plane': BDY_GEOM_PLANE
}
