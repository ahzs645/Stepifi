/**
 * Inventor Loader Segment Node Classes
 * Node type handlers for reading segment data
 * Ported from importerSegNode.py
 */

import {
  getUInt8,
  getUInt8A,
  getUInt16,
  getUInt16A,
  getSInt16,
  getSInt16A,
  getUInt32,
  getUInt32A,
  getSInt32,
  getSInt32A,
  getFloat32,
  getFloat32A,
  getFloat32_2D,
  getFloat32_3D,
  getFloat64,
  getFloat64A,
  getFloat64_2D,
  getFloat64_3D,
  getBoolean,
  getUUID,
  getColorRGBA,
  getText8,
  getLen32Text8,
  getLen32Text16,
  getFileVersion,
  getBlockSize,
  intArr2Str,
  reshape
} from './importer-utils.js'

import {
  REF_CHILD,
  REF_CROSS,
  REF_PARENT,
  VAL_UINT8,
  VAL_UINT16,
  VAL_UINT32,
  VAL_REF,
  VAL_STR8,
  VAL_STR16,
  VAL_ENUM
} from './importer-constants.js'

import {
  AbstractData,
  Header0,
  Angle,
  GraphicsFont,
  Lightning,
  ModelerTxnMgr,
  NtEntry,
  ResultItem4
} from './importer-classes.js'

import { Transformation3D } from './importer-transformation.js'

// ============================================================================
// Type Constants
// ============================================================================

export const _TYP_CHAR_ = 0x0010
export const _TYP_UINT8_ = 0x0011
export const _TYP_SINT8_ = 0x0012
export const _TYP_UINT16_ = 0x0013
export const _TYP_SINT16_ = 0x0014
export const _TYP_UINT32_ = 0x0015
export const _TYP_SINT32_ = 0x0016
export const _TYP_FLOAT32_ = 0x0017
export const _TYP_FLOAT64_ = 0x0018
export const _TYP_NODE_REF_ = 0x0019
export const _TYP_NODE_X_REF_ = 0x001A
export const _TYP_STRING8_ = 0x001B
export const _TYP_STRING16_ = 0x001C

export const _TYP_UINT8_A_ = 0x0020
export const _TYP_SINT8_A_ = 0x0021
export const _TYP_UINT16_A_ = 0x0022
export const _TYP_SINT16_A_ = 0x0023
export const _TYP_UINT32_A_ = 0x0024
export const _TYP_SINT32_A_ = 0x0025
export const _TYP_FLOAT32_A_ = 0x0026
export const _TYP_FLOAT64_A_ = 0x0027

export const _TYP_FONT_ = 0x0040
export const _TYP_2D_F64_U32_4D_U8_ = 0x0041
export const _TYP_LIGHTNING_ = 0x0042
export const _TYP_RESULT_ITEM4_ = 0x0043
export const _TYP_NT_ENTRY_ = 0x0048
export const _TYP_2D_UINT32_ = 0x0049
export const _TYP_MTM_LST_ = 0x004A
export const _TYP_NODE_LST2_X_REF_ = 0x004B
export const _TYP_TRANSFORMATIONS_ = 0x004C

export const _TYP_MAP_U32_U8_ = 0x7001
export const _TYP_MAP_U32_U32_ = 0x7002
export const _TYP_MAP_KEY_REF_ = 0x7004
export const _TYP_MAP_KEY_X_REF_ = 0x7005
export const _TYP_MAP_X_REF_REF_ = 0x700D
export const _TYP_MAP_X_REF_X_REF_ = 0x7011

// ============================================================================
// Utility Functions
// ============================================================================

export function isList(data, code) {
  return data[data.length - 1] === 0x3000 && data[data.length - 2] === code
}

export function CheckList(data, offset, type) {
  const [lst, i] = getUInt16A(data, offset, 2)
  if (getFileVersion() < 2015) {
    if (lst[0] === 0 && lst[1] === 0) {
      return i - 4
    }
  }
  if (!isList(lst, type)) {
    throw new Error(`Expected list ${type} - not [${intArr2Str(lst, 4)}]`)
  }
  return i
}

// ============================================================================
// SecNodeRef - Reference to another node
// ============================================================================

export class SecNodeRef {
  constructor(value, type, attrName) {
    this.index = value & 0x7FFFFFFF
    this.type = type
    this.attrName = attrName
    this.number = null
    this._data = null
    this.analysed = false
    this.node = null
  }

  get typeName() {
    if (this._data) return this._data.typeName
    return ''
  }

  toString() {
    if (this.number !== null) {
      return `${this.attrName}[${this.number}] -> ${this.index.toString(16).padStart(4, '0')}`
    }
    return `${this.attrName} -> ${this.index.toString(16).padStart(4, '0')}`
  }
}

// ============================================================================
// SecNode - Segment Node
// ============================================================================

export class SecNode extends AbstractData {
  constructor() {
    super()
    this.analysed = false
    this.offset = 0
    this.reader = null
  }

  // Basic type readers
  ReadUInt8(offset, name) {
    const [x, i] = getUInt8(this.data, offset)
    this.set(name, x, VAL_UINT8)
    return i
  }

  ReadUInt8A(offset, n, name) {
    const [x, i] = getUInt8A(this.data, offset, n)
    this.set(name, x, VAL_UINT8)
    return i
  }

  ReadUInt16(offset, name) {
    const [x, i] = getUInt16(this.data, offset)
    this.set(name, x, VAL_UINT16)
    return i
  }

  ReadUInt16A(offset, n, name) {
    const [x, i] = getUInt16A(this.data, offset, n)
    this.set(name, x, VAL_UINT16)
    return i
  }

  ReadSInt16(offset, name) {
    const [x, i] = getSInt16(this.data, offset)
    this.set(name, x)
    return i
  }

  ReadSInt16A(offset, n, name) {
    const [x, i] = getSInt16A(this.data, offset, n)
    this.set(name, x)
    return i
  }

  ReadUInt32(offset, name) {
    const [x, i] = getUInt32(this.data, offset)
    this.set(name, x, VAL_UINT32)
    return i
  }

  ReadUInt32A(offset, n, name) {
    const [x, i] = getUInt32A(this.data, offset, n)
    this.set(name, x, VAL_UINT32)
    return i
  }

  ReadSInt32(offset, name) {
    const [x, i] = getSInt32(this.data, offset)
    this.set(name, x)
    return i
  }

  ReadSInt32A(offset, n, name) {
    const [x, i] = getSInt32A(this.data, offset, n)
    this.set(name, x)
    return i
  }

  ReadFloat32(offset, name) {
    const [x, i] = getFloat32(this.data, offset)
    this.set(name, x)
    return i
  }

  ReadFloat32A(offset, n, name) {
    const [x, i] = getFloat32A(this.data, offset, n)
    this.set(name, x)
    return i
  }

  ReadFloat32_2D(offset, name) {
    const [x, i] = getFloat32_2D(this.data, offset)
    this.set(name, x)
    return i
  }

  ReadFloat32_3D(offset, name) {
    const [x, i] = getFloat32_3D(this.data, offset)
    this.set(name, x)
    return i
  }

  ReadFloat64(offset, name) {
    const [x, i] = getFloat64(this.data, offset)
    this.set(name, x)
    return i
  }

  ReadFloat64A(offset, n, name) {
    const [x, i] = getFloat64A(this.data, offset, n)
    this.set(name, x)
    return i
  }

  ReadFloat64_2D(offset, name) {
    const [v, i] = getFloat64_2D(this.data, offset)
    this.set(name, v)
    return i
  }

  ReadFloat64_3D(offset, name) {
    const [v, i] = getFloat64_3D(this.data, offset)
    this.set(name, v)
    return i
  }

  ReadVec3D(offset, name, scale = 1.0) {
    const [v, i] = getFloat64_3D(this.data, offset)
    this.set(name, {
      x: v.x * scale,
      y: v.y * scale,
      z: v.z * scale
    })
    return i
  }

  ReadUUID(offset, name) {
    const [x, i] = getUUID(this.data, offset)
    this.set(name, x)
    return i
  }

  ReadColorRGBA(offset, name) {
    const [x, i] = getColorRGBA(this.data, offset)
    this.set(name, x)
    return i + getBlockSize()
  }

  ReadBoolean(offset, name) {
    const [x, i] = getBoolean(this.data, offset)
    this.set(name, x)
    return i
  }

  ReadEnum16(offset, name, enumName, enumValues) {
    const [index, i] = getUInt16(this.data, offset)
    this.set('Enum', enumName, null)
    this.set('Values', enumValues, null)
    this.set(name, index, VAL_ENUM)
    return i
  }

  ReadEnum32(offset, name, enumName, enumValues) {
    const [index, i] = getUInt32(this.data, offset)
    this.set('Enum', enumName, null)
    this.set('Values', enumValues, null)
    this.set(name, index, VAL_ENUM)
    return i
  }

  ReadAngle(offset, name) {
    const [x, i] = getFloat64(this.data, offset)
    const angle = new Angle(x, Math.PI / 180.0, '\u00b0')
    this.set(name, angle)
    return i
  }

  ReadLen32Text8(offset, name = null) {
    const [x, i] = getLen32Text8(this.data, offset)
    if (name) {
      this.set(name, x, VAL_STR8)
    } else {
      this.name = x
    }
    return i
  }

  ReadText8(offset, l, name = null) {
    const [x, i] = getText8(this.data, offset, l)
    if (name) {
      this.set(name, x, VAL_STR8)
    } else {
      this.name = x
    }
    return i
  }

  ReadLen32Text16(offset, name = null) {
    const [x, i] = getLen32Text16(this.data, offset)
    if (name) {
      this.set(name, x, VAL_STR16)
    } else {
      this.name = x
    }
    return i
  }

  // Reference readers
  ReadNodeRef(offset, name, number, type) {
    const [m, i] = getUInt32(this.data, offset)
    const ref = new SecNodeRef(m, type, name)

    if (ref.index > 0) {
      ref.number = number
      if (ref.index === this.index) {
        console.error(`Found self-ref '${name}' for (${this.index.toString(16).padStart(4, '0')}): ${this.typeName}`)
      } else {
        this.references.push(ref)
      }
    }
    this.set(name, ref.index > 0 ? ref : null, VAL_REF)
    return i
  }

  ReadChildRef(offset, name = 'ref', number = null) {
    return this.ReadNodeRef(offset, name, number, REF_CHILD)
  }

  ReadCrossRef(offset, name = 'ref', number = null) {
    return this.ReadNodeRef(offset, name, number, REF_CROSS)
  }

  ReadParentRef(offset) {
    return this.ReadNodeRef(offset, 'parent', null, REF_CROSS)
  }

  // Header reader
  Read_Header0(typeName = null) {
    if (typeName !== null) {
      this.typeName = typeName
    }

    let i = 0
    const [m, newI] = getUInt16(this.data, i)
    i = newI
    const [x, newI2] = getUInt16(this.data, i)
    i = newI2

    this.set('header0', new Header0(m, x), null)
    return i
  }

  // List readers
  ReadList2(offset, typ, name, arraySize = 1) {
    const [cnt, i] = getUInt32(this.data, offset)
    return this._readListByType(i, typ, name, cnt, arraySize)
  }

  ReadList3(offset, typ, name, arraySize = 1) {
    let i = CheckList(this.data, offset, 0x0004)
    const [cnt, newI] = getUInt32(this.data, i)
    i = newI
    return this._readListByType(i, typ, name, cnt, arraySize)
  }

  ReadList4(offset, typ, name, arraySize = 1) {
    let i = CheckList(this.data, offset, 0x0004)
    const [cnt, newI] = getUInt32(this.data, i)
    i = newI
    return this._readListByType(i, typ, name, cnt, arraySize)
  }

  _readListByType(offset, typ, name, cnt, arraySize) {
    let i = offset
    const lst = []

    switch (typ) {
      case _TYP_NODE_REF_:
        for (let j = 0; j < cnt; j++) {
          i = this.ReadChildRef(i, name, j)
          lst.push(this.get(name))
        }
        break

      case _TYP_NODE_X_REF_:
        for (let j = 0; j < cnt; j++) {
          i = this.ReadCrossRef(i, name, j)
          lst.push(this.get(name))
        }
        break

      case _TYP_UINT8_:
        for (let j = 0; j < cnt; j++) {
          const [val, newI] = getUInt8(this.data, i)
          i = newI
          lst.push(val)
        }
        break

      case _TYP_UINT16_:
        for (let j = 0; j < cnt; j++) {
          const [val, newI] = getUInt16(this.data, i)
          i = newI
          lst.push(val)
        }
        break

      case _TYP_UINT32_:
        for (let j = 0; j < cnt; j++) {
          const [val, newI] = getUInt32(this.data, i)
          i = newI
          lst.push(val)
        }
        break

      case _TYP_FLOAT32_:
        for (let j = 0; j < cnt; j++) {
          const [val, newI] = getFloat32(this.data, i)
          i = newI
          lst.push(val)
        }
        break

      case _TYP_FLOAT64_:
        for (let j = 0; j < cnt; j++) {
          const [val, newI] = getFloat64(this.data, i)
          i = newI
          lst.push(val)
        }
        break

      case _TYP_STRING8_:
        for (let j = 0; j < cnt; j++) {
          const [val, newI] = getLen32Text8(this.data, i)
          i = newI
          lst.push(val)
        }
        break

      case _TYP_STRING16_:
        for (let j = 0; j < cnt; j++) {
          const [val, newI] = getLen32Text16(this.data, i)
          i = newI
          lst.push(val)
        }
        break

      case _TYP_UINT16_A_:
        for (let j = 0; j < cnt; j++) {
          const [val, newI] = getUInt16A(this.data, i, arraySize)
          i = newI
          lst.push(val)
        }
        break

      case _TYP_UINT32_A_:
        for (let j = 0; j < cnt; j++) {
          const [val, newI] = getUInt32A(this.data, i, arraySize)
          i = newI
          lst.push(val)
        }
        break

      case _TYP_FLOAT64_A_:
        for (let j = 0; j < cnt; j++) {
          const [val, newI] = getFloat64A(this.data, i, arraySize)
          i = newI
          lst.push(val)
        }
        break

      case _TYP_NT_ENTRY_:
        for (let j = 0; j < cnt; j++) {
          const [nameTable, newI] = getUInt32(this.data, i)
          i = newI
          const [key, newI2] = getUInt32(this.data, i)
          i = newI2
          lst.push(new NtEntry(nameTable, key))
        }
        break

      case _TYP_TRANSFORMATIONS_:
        for (let j = 0; j < cnt; j++) {
          const transform = new Transformation3D()
          i = transform.read(this.data, i)
          lst.push(transform)
        }
        break

      default:
        console.warn(`Unsupported list type: 0x${typ.toString(16)}`)
        break
    }

    this.set(name, lst, VAL_REF)
    return i
  }

  // Map readers
  ReadMap(offset, typ, name) {
    let i = CheckList(this.data, offset, 0x0006)
    const [cnt, newI] = getUInt32(this.data, i)
    i = newI

    const map = new Map()

    switch (typ) {
      case _TYP_MAP_U32_U8_:
        for (let j = 0; j < cnt; j++) {
          const [key, newI] = getUInt32(this.data, i)
          i = newI
          const [val, newI2] = getUInt8(this.data, i)
          i = newI2
          map.set(key, val)
        }
        break

      case _TYP_MAP_U32_U32_:
        for (let j = 0; j < cnt; j++) {
          const [key, newI] = getUInt32(this.data, i)
          i = newI
          const [val, newI2] = getUInt32(this.data, i)
          i = newI2
          map.set(key, val)
        }
        break

      case _TYP_MAP_KEY_REF_:
        for (let j = 0; j < cnt; j++) {
          const [key, newI] = getUInt32(this.data, i)
          i = newI
          i = this.ReadChildRef(i, `${name}_ref`, key)
          map.set(key, this.get(`${name}_ref`))
        }
        break

      case _TYP_MAP_KEY_X_REF_:
        for (let j = 0; j < cnt; j++) {
          const [key, newI] = getUInt32(this.data, i)
          i = newI
          i = this.ReadCrossRef(i, `${name}_ref`, key)
          map.set(key, this.get(`${name}_ref`))
        }
        break

      case _TYP_MAP_X_REF_REF_:
        for (let j = 0; j < cnt; j++) {
          i = this.ReadCrossRef(i, `${name}_key`, j)
          const key = this.get(`${name}_key`)
          i = this.ReadChildRef(i, `${name}_val`, j)
          const val = this.get(`${name}_val`)
          map.set(key, val)
        }
        break

      case _TYP_MAP_X_REF_X_REF_:
        for (let j = 0; j < cnt; j++) {
          i = this.ReadCrossRef(i, `${name}_key`, j)
          const key = this.get(`${name}_key`)
          i = this.ReadCrossRef(i, `${name}_val`, j)
          const val = this.get(`${name}_val`)
          map.set(key, val)
        }
        break

      default:
        console.warn(`Unsupported map type: 0x${typ.toString(16)}`)
        break
    }

    this.set(name, map, VAL_REF)
    return i
  }
}

// ============================================================================
// Default Export
// ============================================================================

export default {
  // Type constants
  _TYP_CHAR_,
  _TYP_UINT8_,
  _TYP_SINT8_,
  _TYP_UINT16_,
  _TYP_SINT16_,
  _TYP_UINT32_,
  _TYP_SINT32_,
  _TYP_FLOAT32_,
  _TYP_FLOAT64_,
  _TYP_NODE_REF_,
  _TYP_NODE_X_REF_,
  _TYP_STRING8_,
  _TYP_STRING16_,
  _TYP_UINT8_A_,
  _TYP_SINT8_A_,
  _TYP_UINT16_A_,
  _TYP_SINT16_A_,
  _TYP_UINT32_A_,
  _TYP_SINT32_A_,
  _TYP_FLOAT32_A_,
  _TYP_FLOAT64_A_,
  _TYP_FONT_,
  _TYP_NT_ENTRY_,
  _TYP_2D_UINT32_,
  _TYP_MTM_LST_,
  _TYP_NODE_LST2_X_REF_,
  _TYP_TRANSFORMATIONS_,
  _TYP_MAP_U32_U8_,
  _TYP_MAP_U32_U32_,
  _TYP_MAP_KEY_REF_,
  _TYP_MAP_KEY_X_REF_,
  _TYP_MAP_X_REF_REF_,
  _TYP_MAP_X_REF_X_REF_,

  // Utility functions
  isList,
  CheckList,

  // Classes
  SecNodeRef,
  SecNode
}
