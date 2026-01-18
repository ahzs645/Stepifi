/**
 * Inventor Loader Transformation Classes
 * 2D and 3D transformation matrices
 * Ported from importerTransformation.py
 */

import { getFloat64, getUInt32, getUInt16 } from './importer-utils.js'

// ============================================================================
// 2D Transformation Matrix
// ============================================================================

export class Transformation2D {
  constructor() {
    this.a0 = 0x00000000
    this.m = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ]
  }

  /**
   * Read transformation from binary data
   * @param {Uint8Array|DataView} data - Binary data
   * @param {number} offset - Byte offset
   * @returns {number} New offset after reading
   */
  read(data, offset) {
    let [a0, i] = getUInt32(data, offset)
    this.a0 = a0

    //                   +--- Value for the 3. row to be used for the transformation matrix
    //                   |+-- Value for the 2. row to be used for the transformation matrix
    //                   ||+- Value for the 1. row to be used for the transformation matrix
    //                   |||
    //                   vvv
    const m1 = (this.a0 & 0x00FF0000) >> 16
    //                      +------- Mask for the 3. row of the transformation matrix
    //                      |+------ Mask for the 2. row of the transformation matrix
    //                      ||+----- Mask for the 1. row of the transformation matrix
    //                      |||
    //                      vvv
    const m2 = this.a0 & 0x000001FF

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const j = col + 3 * row
        const b = 1 << j
        if ((m1 & b) === 0) {
          if ((m2 & b) === 0) {
            let [value, newI] = getFloat64(data, i)
            i = newI
            if (Math.abs(value) < 1.0e-6) value = 0.0
            this.m[row][col] = value
          }
        }
      }
    }
    return i
  }

  getX() {
    return this.m[0][2] * 10.0
  }

  getY() {
    return this.m[1][2] * 10.0
  }

  getBase() {
    const x = this.m[0][2]
    const y = this.m[1][2]
    return { x, y, z: 0 }
  }

  /**
   * Get 4x4 matrix representation for 3D use
   * @returns {number[][]} 4x4 matrix
   */
  getMatrix() {
    return [
      [this.m[0][0], this.m[0][1], 0, this.m[0][2]],
      [this.m[1][0], this.m[1][1], 0, this.m[1][2]],
      [0, 0, 1, 0],
      [this.m[2][0], this.m[2][1], 0, this.m[2][2]]
    ]
  }

  /**
   * Get flat 16-element array for OpenCascade
   * @returns {number[]} Flat 4x4 matrix in column-major order
   */
  getMatrixFlat() {
    const m = this.getMatrix()
    // Column-major order for OpenCascade
    return [
      m[0][0], m[1][0], m[2][0], m[3][0],
      m[0][1], m[1][1], m[2][1], m[3][1],
      m[0][2], m[1][2], m[2][2], m[3][2],
      m[0][3], m[1][3], m[2][3], m[3][3]
    ]
  }

  _m2s(index) {
    const v = this.m[index]
    return `[${v[0]}, ${v[1]}, ${v[2] * 10.0}]`
  }

  toString() {
    const m = this._repr()
    let mask = '|'
    const d1 = (this.a0 & 0x00FF0000) >> 16
    const d2 = this.a0 & 0x000001FF
    for (let j = 0; j < 9; j++) {
      const b = 1 << j
      if (d1 & b) {
        mask += (d2 & b) ? '-' : '0'
      } else {
        mask += (d2 & b) ? '+' : 'x'
      }
      if ((j + 1) % 3 === 0) mask += '|'
    }
    return ` transformation={a0=${mask} m=${m}}`
  }

  _repr() {
    const m0 = this._m2s(0)
    const m1 = this._m2s(1)
    const m2 = this._m2s(2)
    return `[${m0}, ${m1}, ${m2}]`
  }
}

// ============================================================================
// 3D Transformation Matrix
// ============================================================================

export class Transformation3D {
  constructor() {
    this.a0 = 0x00000000
    this.m = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ]
  }

  /**
   * Read transformation from binary data
   * @param {Uint8Array|DataView} data - Binary data
   * @param {number} offset - Byte offset
   * @returns {number} New offset after reading
   */
  read(data, offset) {
    let [n, k] = getUInt32(data, offset)
    let i
    if (n === 0x00000203) {
      i = k
    } else {
      i = offset
    }

    /*           +---- Value for the 4. row to be used for the transformation matrix
                |+--- Value for the 3. row to be used for the transformation matrix
                ||+-- Value for the 2. row to be used for the transformation matrix
                |||+- Value for the 1. row to be used for the transformation matrix
                ||||
                vvvv */
    let [d1, newI] = getUInt16(data, i)
    i = newI

    /*           +-------- Mask for the 4. row of the transformation matrix
                |+------- Mask for the 3. row of the transformation matrix
                ||+------ Mask for the 2. row of the transformation matrix
                |||+----- Mask for the 1. row of the transformation matrix
                ||||
                vvvv*/
    let [d2, newI2] = getUInt16(data, i)
    i = newI2

    this.a0 = d1 | (d2 << 16)
    this.m = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ]

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const j = col + 4 * row
        const b = 1 << j
        let value
        if ((d2 & b) === 0) {
          if ((d1 & b) === 0) {
            [value, i] = getFloat64(data, i)
            if (Math.abs(value) < 1.0e-6) value = 0.0
          } else {
            value = 1
          }
        } else {
          value = (d1 & b) === 0 ? 0 : -1
        }
        this.m[row][col] = value
      }
    }
    return i
  }

  getX() {
    return this.m[0][3] * 10.0
  }

  getY() {
    return this.m[1][3] * 10.0
  }

  getZ() {
    return this.m[2][3] * 10.0
  }

  getBase() {
    const x = this.m[0][3]
    const y = this.m[1][3]
    const z = this.m[2][3]
    return { x, y, z }
  }

  /**
   * Return quaternion from the transformation matrix.
   * @returns {{x: number, y: number, z: number, w: number}} Quaternion
   */
  getRotation() {
    // the trace is the sum of the diagonal elements
    const xx = this.m[0][0]
    const xy = this.m[0][1]
    const xz = this.m[0][2]
    const yx = this.m[1][0]
    const yy = this.m[1][1]
    const yz = this.m[1][2]
    const zx = this.m[2][0]
    const zy = this.m[2][1]
    const zz = this.m[2][2]
    const t = xx + yy + zz

    let x, y, z, w, s

    // we protect the division by s by ensuring that s>=1
    if (t >= 0) {
      // |w| >= .5
      s = Math.sqrt(t + 1) // |s|>=1 ...
      w = 0.5 * s
      s = 0.5 / s // so this division isn't bad
      x = (zy - yz) * s
      y = (xz - zx) * s
      z = (yx - xy) * s
    } else if (xx > yy && xx > zz) {
      s = Math.sqrt(1.0 + xx - yy - zz) // |s|>=1
      x = s * 0.5 // |x| >= 0.5
      s = 0.5 / s
      y = (yx + xy) * s
      z = (xz + zx) * s
      w = (zy - yz) * s
    } else if (yy > zz) {
      s = Math.sqrt(1.0 - xx + yy - zz) // |s|>=1
      y = s * 0.5 // |y| >= 0.5
      s = 0.5 / s
      x = (yx + xy) * s
      z = (zy + yz) * s
      w = (xz - zx) * s
    } else {
      s = Math.sqrt(1.0 + zz - xx - yy) // |s|>=1
      z = s * 0.5 // |z| >= 0.5
      s = 0.5 / s
      x = (xz + zx) * s
      y = (zy + yz) * s
      w = (yx - xy) * s
    }
    return { x, y, z, w }
  }

  /**
   * Get 4x4 matrix
   * @returns {number[][]} 4x4 matrix
   */
  getMatrix() {
    return this.m.map(row => [...row])
  }

  /**
   * Get flat 16-element array for OpenCascade
   * @returns {number[]} Flat 4x4 matrix in column-major order
   */
  getMatrixFlat() {
    const m = this.m
    // Column-major order for OpenCascade
    return [
      m[0][0], m[1][0], m[2][0], m[3][0],
      m[0][1], m[1][1], m[2][1], m[3][1],
      m[0][2], m[1][2], m[2][2], m[3][2],
      m[0][3], m[1][3], m[2][3], m[3][3]
    ]
  }

  /**
   * Get gp_Trsf parameters for OpenCascade.js
   * @returns {object} Translation and rotation data
   */
  getPlacement() {
    const translation = {
      x: this.m[0][3] * 10.0, // Convert to mm
      y: this.m[1][3] * 10.0,
      z: this.m[2][3] * 10.0
    }

    const rotation = this.getRotation()

    return {
      translation,
      rotation,
      matrix: this.getMatrixFlat()
    }
  }

  _m2s(index) {
    const v = this.m[index]
    return `[${v[0]}, ${v[1]}, ${v[2]}, ${v[3] * 10.0}]`
  }

  toString() {
    const m = this._repr()
    let j = 0
    let mask = '|'
    const d1 = (this.a0 & 0xFFFF0000) >> 16
    const d2 = this.a0 & 0x0000FFFF
    while (j < 16) {
      const b = 1 << j
      if (d1 & b) {
        if (d2 & b) {
          mask += '-'
        } else {
          mask += '0'
        }
      } else {
        if (d2 & b) {
          mask += '+'
        } else {
          mask += 'x'
        }
      }
      j++
      if (j % 4 === 0) {
        mask += '|'
      }
    }
    return ` transformation={a0=${mask} m=${m}}`
  }

  _repr() {
    const m0 = this._m2s(0)
    const m1 = this._m2s(1)
    const m2 = this._m2s(2)
    const m3 = this._m2s(3)
    return `[${m0},${m1},${m2},${m3}]`
  }
}

// ============================================================================
// Matrix Utilities
// ============================================================================

/**
 * Multiply two 4x4 matrices
 * @param {number[][]} a - First matrix
 * @param {number[][]} b - Second matrix
 * @returns {number[][]} Result matrix
 */
export function matrixMultiply(a, b) {
  const result = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      for (let k = 0; k < 4; k++) {
        result[i][j] += a[i][k] * b[k][j]
      }
    }
  }

  return result
}

/**
 * Invert a 4x4 matrix
 * @param {number[][]} m - Matrix to invert
 * @returns {number[][]|null} Inverted matrix or null if singular
 */
export function matrixInvert(m) {
  // Create augmented matrix
  const aug = m.map((row, i) => [
    ...row,
    ...[0, 0, 0, 0].map((_, j) => (i === j ? 1 : 0))
  ])

  // Gaussian elimination
  for (let i = 0; i < 4; i++) {
    // Find pivot
    let maxRow = i
    for (let k = i + 1; k < 4; k++) {
      if (Math.abs(aug[k][i]) > Math.abs(aug[maxRow][i])) {
        maxRow = k
      }
    }

    // Swap rows
    ;[aug[i], aug[maxRow]] = [aug[maxRow], aug[i]]

    // Check for singular matrix
    if (Math.abs(aug[i][i]) < 1e-10) {
      return null
    }

    // Eliminate column
    for (let k = 0; k < 4; k++) {
      if (k !== i) {
        const factor = aug[k][i] / aug[i][i]
        for (let j = 0; j < 8; j++) {
          aug[k][j] -= factor * aug[i][j]
        }
      }
    }

    // Scale row
    const divisor = aug[i][i]
    for (let j = 0; j < 8; j++) {
      aug[i][j] /= divisor
    }
  }

  // Extract inverse
  return aug.map(row => row.slice(4))
}

/**
 * Create identity 4x4 matrix
 * @returns {number[][]} Identity matrix
 */
export function identityMatrix() {
  return [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ]
}

/**
 * Create translation matrix
 * @param {number} x - X translation
 * @param {number} y - Y translation
 * @param {number} z - Z translation
 * @returns {number[][]} Translation matrix
 */
export function translationMatrix(x, y, z) {
  return [
    [1, 0, 0, x],
    [0, 1, 0, y],
    [0, 0, 1, z],
    [0, 0, 0, 1]
  ]
}

/**
 * Create rotation matrix from quaternion
 * @param {number} x - Quaternion x
 * @param {number} y - Quaternion y
 * @param {number} z - Quaternion z
 * @param {number} w - Quaternion w
 * @returns {number[][]} Rotation matrix
 */
export function quaternionToMatrix(x, y, z, w) {
  const xx = x * x
  const yy = y * y
  const zz = z * z
  const xy = x * y
  const xz = x * z
  const yz = y * z
  const wx = w * x
  const wy = w * y
  const wz = w * z

  return [
    [1 - 2 * (yy + zz), 2 * (xy - wz), 2 * (xz + wy), 0],
    [2 * (xy + wz), 1 - 2 * (xx + zz), 2 * (yz - wx), 0],
    [2 * (xz - wy), 2 * (yz + wx), 1 - 2 * (xx + yy), 0],
    [0, 0, 0, 1]
  ]
}

/**
 * Transform a point by a 4x4 matrix
 * @param {number[][]} m - Transformation matrix
 * @param {{x: number, y: number, z: number}} p - Point to transform
 * @returns {{x: number, y: number, z: number}} Transformed point
 */
export function transformPoint(m, p) {
  const w = m[3][0] * p.x + m[3][1] * p.y + m[3][2] * p.z + m[3][3]
  return {
    x: (m[0][0] * p.x + m[0][1] * p.y + m[0][2] * p.z + m[0][3]) / w,
    y: (m[1][0] * p.x + m[1][1] * p.y + m[1][2] * p.z + m[1][3]) / w,
    z: (m[2][0] * p.x + m[2][1] * p.y + m[2][2] * p.z + m[2][3]) / w
  }
}

/**
 * Transform a vector by a 4x4 matrix (ignoring translation)
 * @param {number[][]} m - Transformation matrix
 * @param {{x: number, y: number, z: number}} v - Vector to transform
 * @returns {{x: number, y: number, z: number}} Transformed vector
 */
export function transformVector(m, v) {
  return {
    x: m[0][0] * v.x + m[0][1] * v.y + m[0][2] * v.z,
    y: m[1][0] * v.x + m[1][1] * v.y + m[1][2] * v.z,
    z: m[2][0] * v.x + m[2][1] * v.y + m[2][2] * v.z
  }
}

// ============================================================================
// Default Export
// ============================================================================

export default {
  Transformation2D,
  Transformation3D,
  matrixMultiply,
  matrixInvert,
  identityMatrix,
  translationMatrix,
  quaternionToMatrix,
  transformPoint,
  transformVector
}
