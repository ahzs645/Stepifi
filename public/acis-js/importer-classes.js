/**
 * Inventor Loader Data Classes
 * Data structures for reading Inventor IPT/IAM files
 * Ported from importerClasses.py
 */

import {
  intArr2Str,
  floatArr2Str
} from './importer-utils.js'

import {
  VAL_GUESS,
  VAL_UINT8,
  VAL_UINT16,
  VAL_UINT32,
  VAL_STR8,
  VAL_STR16,
  VAL_REF,
  VAL_ENUM,
  SEGMENTS_APP,
  SEGMENTS_BRP,
  SEGMENTS_BRX,
  SEGMENTS_DOC,
  SEGMENTS_DVW,
  SEGMENTS_DIR,
  SEGMENTS_EED,
  SEGMENTS_EES,
  SEGMENTS_FBA,
  SEGMENTS_GRX,
  SEGMENTS_NTB,
  SEGMENTS_RSX,
  SEGMENTS_SHT
} from './importer-constants.js'

// ============================================================================
// Version Info
// ============================================================================

export class VersionInfo {
  constructor() {
    this.revision = 0
    this.minor = 0
    this.major = 0
    this.data = [0, 0, 0, 0, 0]
  }

  getDisplayName() {
    if (this.major > 11) {
      return `Version ${this.major + 1996}.${this.minor}${this.revision}`
    }
    return `Version ${this.major}.${this.minor}${this.revision}`
  }

  getBits() {
    return (this.data[0] & 0x40) > 0 ? 64 : 32
  }

  toString() {
    return `Version ${this.major}.${this.minor}.${this.revision} [${intArr2Str(this.data, 2)}]`
  }
}

// ============================================================================
// RSeSegInformation
// ============================================================================

export class RSeSegInformation {
  constructor() {
    this.text = ''
    this.vers = []
    this.date = null
    this.uid = null
    this.arr2 = []
    this.arr3 = []
    this.u16 = 0
    this.text2 = ''
    this.arr4 = []
    this.segments = {}
    this.val = [] // UInt16[2]
    this.uidList1 = []
    this.uidList2 = []
  }
}

// ============================================================================
// RSeDatabase
// ============================================================================

export class RSeDatabase {
  constructor() {
    this.segInfo = new RSeSegInformation()
    this.uid = null // Internal-Name of the object
    this.schema = -1
    this.vers1 = null
    this.dat1 = null
    this.arr2 = []
    this.vers2 = null
    this.dat2 = null
    this.txt = ''
  }
}

// ============================================================================
// RSeSegmentObject
// ============================================================================

export class RSeSegmentObject {
  constructor() {
    this.revisionRef = null // reference to RSeDbRevisionInfo
    this.values = []
    this.segRef = null
    this.value1 = 0
    this.value2 = 0
  }

  toString() {
    return `[${intArr2Str(this.values, 4)}],${this.value1.toString(16).padStart(2, '0')},${this.value2.toString(16).padStart(2, '0')}`
  }
}

// ============================================================================
// RSeSegmentValue2
// ============================================================================

export class RSeSegmentValue2 {
  constructor() {
    this.index = -1
    this.indexSegList1 = -1
    this.indexSegList2 = -1
    this.values = []
    this.number = -1
  }

  toString() {
    return `${this.indexSegList1.toString(16).padStart(2, '0')},${this.indexSegList2.toString(16).padStart(2, '0')},${this.index.toString(16)},[${intArr2Str(this.values, 4)}],${this.number.toString(16).padStart(4, '0')}`
  }
}

// ============================================================================
// RSeSegment
// ============================================================================

export class RSeSegment {
  constructor() {
    this.name = ''
    this.ID = null
    this.revisionRef = null // reference to RSeDbRevisionInfo
    this.value1 = 0
    this.count1 = 0
    this.count2 = 0
    this.type = ''
    this.metaData = null
    this.arr1 = [] // ???, ???, ???, numSec1, ???
    this.arr2 = []
    this.version = null
    this.value2 = 0
    this.objects = []
    this.nodes = []
  }

  toString() {
    return `${this.type}:${this.name}, count=(${this.count1}/${this.count2}), ID={${this.ID}}, value1=${this.value1.toString(16).padStart(4, '0')}, arr1=[${intArr2Str(this.arr1, 4)}], arr2=[${intArr2Str(this.arr2, 4)}], value2=${this.value2.toString(16).padStart(4, '0')}, ${this.version}`
  }
}

// ============================================================================
// RSeStorageBlockSize
// ============================================================================

export class RSeStorageBlockSize {
  /**
   * @param {*} parent - Parent object
   * @param {number} value - Raw value containing length and flags
   */
  constructor(parent, value) {
    this.parent = parent
    this.length = value & 0x7FFFFFFF
    this.flags = (value & 0x80000000) > 0
  }

  toString() {
    return `f=${this.flags ? 1 : 0}, l=${this.length.toString(16)}`
  }
}

// ============================================================================
// RSeStorageSection Classes
// ============================================================================

export class RSeStorageSection2 {
  constructor(parent) {
    this.parent = parent
    this.revision = null // reference to RSeDbRevisionInfo
    this.flag = null
    this.val = 0
    this.arr = []
  }

  toString() {
    let a = ''
    let u = ''
    if (this.arr.length > 0) {
      a = ` [${intArr2Str(this.arr, 4)}]`
    }
    if (this.revision !== null) {
      u = ` - ${this.revision}`
    }
    return `${this.flag.toString(16)}, ${this.val.toString(16)}${u}${a}`
  }
}

export class RSeStorageSection3 {
  constructor(parent) {
    this.uid = null
    this.parent = parent
    this.arr = [] // UInt16[6]
  }

  toString() {
    return `${this.uid}: [${intArr2Str(this.arr, 4)}]`
  }
}

export class RSeStorageSection4Data {
  constructor() {
    this.num = 0 // UInt16
    this.val = 0 // UInt32
  }

  toString() {
    return `(${this.num.toString(16).padStart(4, '0')},${this.val.toString(16).padStart(8, '0')})`
  }
}

export class RSeStorageBlockType {
  constructor(parent) {
    this.parent = parent
    this.uid = null
    this.arr = [] // RSeStorageSection4Data[2]
  }

  toString() {
    return `${this.uid}: [${this.arr[0]},${this.arr[1]}]`
  }
}

export class RSeStorageSection4Data1 {
  constructor(uid, val) {
    this.uid = uid
    this.val = val
  }

  toString() {
    return `[${this.uid},${this.val}]`
  }
}

export class RSeStorageSection5 {
  constructor(parent) {
    this.parent = parent
    this.indexSec4 = []
  }
}

export class RSeStorageSection6 {
  constructor(parent) {
    this.parent = parent
    this.arr1 = []
    this.arr2 = []
  }
}

export class RSeStorageSection7 {
  constructor(parent) {
    this.parent = parent
    this.segRef = null
    this.segName = null
    this.revisionRef = null
    this.dbRef = null
    this.arr1 = []
    this.txt1 = ''
    this.arr2 = []
    this.txt2 = ''
    this.arr3 = []
    this.txt3 = ''
  }

  toString() {
    if (this.dbRef === null) {
      if (this.segName === null) {
        return `${this.segRef}`
      }
      return `'${this.segName}'`
    }
    if (this.segName === null) {
      return `[${this.segRef}] [${this.arr1}] [${this.arr2}] [${this.arr3}] '${this.txt1}' '${this.txt2}' '${this.txt3}'`
    }
    return `[${this.segName}] [${this.arr1}] [${this.arr2}] [${this.arr3}] '${this.txt1}' '${this.txt2}' '${this.txt3}'`
  }
}

export class RSeStorageSection8 {
  constructor(parent) {
    this.parent = parent
    this.dbRevisionInfoRef = null
    this.arr = [] // UInt16[2]
  }

  toString() {
    return `[${intArr2Str(this.arr, 4)}]`
  }
}

export class RSeStorageSection9 {
  constructor(parent) {
    this.parent = parent
    this.uid = null
    this.arr = [] // UInt16[3]
  }

  toString() {
    return `${this.uid}: [${intArr2Str(this.arr, 4)}]`
  }
}

export class RSeStorageSectionA {
  constructor(parent) {
    this.parent = parent
    this.uid = null
    this.arr = [] // UInt16[4]
  }

  toString() {
    return `[${intArr2Str(this.arr, 4)}]`
  }
}

export class RSeStorageSectionB {
  constructor(parent) {
    this.parent = parent
    this.uid = null
    this.arr = [] // UInt16[2]
  }

  toString() {
    return `[${intArr2Str(this.arr, 4)}]`
  }
}

// ============================================================================
// RSeRevisions
// ============================================================================

export class RSeRevisions {
  constructor() {
    this.mapping = new Map()
    this.infos = []
  }

  clear() {
    this.mapping.clear()
    this.infos = []
  }
}

// ============================================================================
// RSeDbRevisionInfo
// ============================================================================

export class RSeDbRevisionInfo {
  constructor() {
    this.ID = ''
    this.flags = 0
    this.type = 0
    this.b = 0
    this.a = []
  }

  toString() {
    const idStr = this.ID.toString().toUpperCase()
    if (this.a.length === 2) {
      return `{${idStr}},${this.flags.toString(16).padStart(6, '0')},${this.type.toString(16).padStart(4, '0')},${this.b.toString(16).padStart(2, '0')},[${this.a[0]},${this.a[1].toString(16).padStart(8, '0')}]`
    }
    if (this.a.length === 4) {
      return `{${idStr}},${this.flags.toString(16).padStart(6, '0')},${this.type.toString(16).padStart(4, '0')},${this.b.toString(16).padStart(2, '0')},[${this.a[0]},${this.a[1].toString(16).padStart(8, '0')}]`
    }
    return `{${idStr}},${this.flags.toString(16).padStart(6, '0')},${this.type.toString(16).padStart(4, '0')},${this.b.toString(16).padStart(2, '0')},${this.a}`
  }
}

// ============================================================================
// Inventor Main Model
// ============================================================================

export class Inventor {
  constructor() {
    this.UFRxDoc = null
    this.RSeDb = new RSeDatabase()
    this.RSeRevisions = new RSeRevisions()
    this.iProperties = {}
    this.RSeMetaData = {}
  }

  clear() {
    this.iProperties = {}
    this.RSeMetaData = {}
  }

  getApp() {
    for (const seg of Object.values(this.RSeMetaData)) {
      if (seg.isApp && seg.isApp()) return seg
    }
    return EMPTY_SEGMENT
  }

  getBRep() {
    for (const seg of Object.values(this.RSeMetaData)) {
      if (seg.isBRep && seg.isBRep()) return seg
    }
    return EMPTY_SEGMENT
  }

  getBrowser() {
    for (const seg of Object.values(this.RSeMetaData)) {
      if (seg.isBrowser && seg.isBrowser()) return seg
    }
    return EMPTY_SEGMENT
  }

  getDC() {
    for (const seg of Object.values(this.RSeMetaData)) {
      if (seg.isDC && seg.isDC()) return seg
    }
    return EMPTY_SEGMENT
  }

  getDesignViews() {
    const views = []
    for (const seg of Object.values(this.RSeMetaData)) {
      if (seg.isDesignView && seg.isDesignView()) {
        views.push(seg)
      }
    }
    return views
  }

  getDirectory() {
    for (const seg of Object.values(this.RSeMetaData)) {
      if (seg.isDirectory && seg.isDirectory()) return seg
    }
    return EMPTY_SEGMENT
  }

  getEeData() {
    for (const seg of Object.values(this.RSeMetaData)) {
      if (seg.isEeData && seg.isEeData()) return seg
    }
    return EMPTY_SEGMENT
  }

  getEeScene() {
    for (const seg of Object.values(this.RSeMetaData)) {
      if (seg.isEeScene && seg.isEeScene()) return seg
    }
    return EMPTY_SEGMENT
  }

  getFBAttribute() {
    for (const seg of Object.values(this.RSeMetaData)) {
      if (seg.isFBAttribute && seg.isFBAttribute()) return seg
    }
    return EMPTY_SEGMENT
  }

  getGraphics() {
    for (const seg of Object.values(this.RSeMetaData)) {
      if (seg.isGraphics && seg.isGraphics()) return seg
    }
    return EMPTY_SEGMENT
  }

  getNBNotebook() {
    for (const seg of Object.values(this.RSeMetaData)) {
      if (seg.isNBNotebook && seg.isNBNotebook()) return seg
    }
    return EMPTY_SEGMENT
  }

  getResult() {
    for (const seg of Object.values(this.RSeMetaData)) {
      if (seg.isResult && seg.isResult()) return seg
    }
    return EMPTY_SEGMENT
  }

  getSheets() {
    const sheets = []
    for (const seg of Object.values(this.RSeMetaData)) {
      if (seg.isSheet && seg.isSheet()) {
        sheets.push(seg)
      }
    }
    return sheets
  }
}

// ============================================================================
// DbInterface
// ============================================================================

export class DbInterface {
  static TYPE_MAPPING = {
    0x01: 'BOOL',
    0x04: 'SINT',
    0x10: 'UUID',
    0x30: 'FLOAT[]',
    0x54: 'MAP'
  }

  constructor(name) {
    this.name = name
    this.type = 0
    this.data = []
    this.uid = null
    this.value = null
  }

  toString() {
    const typeName = DbInterface.TYPE_MAPPING[this.type] || this.type.toString(16).padStart(4, '0')
    return `${this.name}=${this.value}:\t${typeName}\t${this.uid}`
  }
}

// ============================================================================
// Result Classes
// ============================================================================

export class ResultItem4 {
  constructor() {
    this.a0 = []
    this.a1 = []
    this.a2 = []
  }

  toString() {
    return `[${intArr2Str(this.a0, 4)}] (${floatArr2Str(this.a1)})-(${floatArr2Str(this.a2)})`
  }
}

// ============================================================================
// Graphics Classes
// ============================================================================

export class GraphicsFont {
  constructor() {
    this.number = -1 // UInt32
    this.ukn1 = 0 // UInt16[4]
    this.ukn2 = [] // UInt8[2]
    this.ukn3 = [] // UInt16[2]
    this.name = [] // getLen32Text16
    this.ukn4 = [] // Float32[2]
    this.ukn5 = [] // UInt8[3]
  }

  toString() {
    return `(${this.number}) ${this.name} ${this.ukn1} ${this.ukn2} ${this.ukn3} ${this.ukn4} ${this.ukn5}`
  }
}

export class Lightning {
  constructor() {
    this.n1 = 0
    this.c1 = null
    this.c2 = null
    this.c3 = null
    this.a1 = []
    this.a2 = []
  }

  toString() {
    return `${this.n1}: ${this.c1}, ${this.c2}, ${this.c3}, [${floatArr2Str(this.a1)}], [${floatArr2Str(this.a2)}]`
  }
}

// ============================================================================
// Value Classes
// ============================================================================

export class AbstractValue {
  constructor(x, factor, offset, unit) {
    this.x = x
    this.factor = factor
    this.offset = offset
    this.unit = unit
  }

  toString() {
    return `${this.x / this.factor - this.offset}${this.unit}`
  }

  toStandard() {
    return this.toString()
  }

  getNominalValue() {
    return this.x / this.factor + this.offset
  }

  negate() {
    return new this.constructor(-this.x, this.factor, this.unit)
  }

  sub(other) {
    if (other instanceof AbstractValue) {
      return new this.constructor(this.x - other.x, this.factor, this.unit)
    }
    return new this.constructor(this.x - other, this.factor, this.unit)
  }

  add(other) {
    if (other instanceof AbstractValue) {
      return new this.constructor(this.x + other.x, this.factor, this.unit)
    }
    return new this.constructor(this.x + other, this.factor, this.unit)
  }

  mul(other) {
    if (other instanceof AbstractValue) {
      return new this.constructor(this.x * other.x, this.factor, this.unit)
    }
    return new this.constructor(this.x * other, this.factor, this.unit)
  }
}

export class Length extends AbstractValue {
  constructor(x, factor = 0.1, unit = 'mm') {
    super(x, factor, 0.0, unit)
  }

  getMM() {
    return this.x / 0.1
  }

  toStandard() {
    return `${this.x / 0.1} mm`
  }
}

export class Angle extends AbstractValue {
  constructor(a, factor, unit) {
    super(a, factor, 0.0, unit)
  }

  getRAD() {
    return this.x
  }

  getGRAD() {
    return (this.x * 180) / Math.PI
  }

  toStandard() {
    return `${this.getGRAD()}\u00B0`
  }
}

export class Mass extends AbstractValue {
  constructor(m, factor, unit) {
    super(m, factor, 0.0, unit)
  }

  getGram() {
    return this.x
  }

  toStandard() {
    return `${this.getGram()}gr`
  }
}

export class Time extends AbstractValue {
  constructor(t, factor, unit) {
    super(t, factor, 0.0, unit)
  }
}

export class Temperature extends AbstractValue {
  constructor(t, factor, offset, unit) {
    super(t, factor, offset, unit)
  }

  toStandard() {
    return `${this.x} K`
  }
}

export class Velocity extends AbstractValue {
  constructor(v, factor, unit) {
    super(v, factor, 0.0, unit)
  }
}

export class Area extends AbstractValue {
  constructor(a, factor, unit) {
    super(a, factor, 0.0, unit)
  }
}

export class Volume extends AbstractValue {
  constructor(v, factor, unit) {
    super(v, factor, 0.0, unit)
  }
}

export class Force extends AbstractValue {
  constructor(F, factor, unit) {
    super(F, factor, 0.0, unit)
  }
}

export class Pressure extends AbstractValue {
  constructor(p, factor, unit) {
    super(p, factor, 0.0, unit)
  }
}

export class Power extends AbstractValue {
  constructor(p, factor, unit) {
    super(p, factor, 0.0, unit)
  }
}

export class Work extends AbstractValue {
  constructor(w, factor, unit) {
    super(w, factor, 0.0, unit)
  }
}

export class Electrical extends AbstractValue {
  constructor(l, factor, unit) {
    super(l, factor, 0.0, unit)
  }
}

export class Luminosity extends AbstractValue {
  constructor(l, unit) {
    super(l, 1.0, 0.0, unit)
  }
}

export class Substance extends AbstractValue {
  constructor(s, unit) {
    super(s, 1.0, 0.0, unit)
  }
}

export class Scalar extends AbstractValue {
  constructor(s) {
    super(s, 1.0, 0.0, '')
  }
}

export class Derived extends AbstractValue {
  constructor(s, unit) {
    super(s, 1.0, 0.0, unit)
  }
}

// ============================================================================
// Data Node Classes
// ============================================================================

export class DataNode {
  constructor(data) {
    this.data = data
    this.isRef = false
    this.children = []
    this.parent = null
  }

  get typeName() {
    if (this.data) return this.data.typeName
    return ''
  }

  get index() {
    if (this.data) return this.data.index
    return -1
  }

  get handled() {
    if (this.data) return this.data.handled
    return false
  }

  set handled(handled) {
    if (this.data) this.data.handled = handled
  }

  get valid() {
    if (this.data) return this.data.valid
    return false
  }

  set valid(valid) {
    if (this.data) this.data.valid = valid
  }

  get geometry() {
    if (this.data) return this.data.geometry
    return null
  }

  get segment() {
    if (this.data) return this.data.segment
    return null
  }

  size() {
    return this.children.length
  }

  isLeaf() {
    return this.size() === 0
  }

  get name() {
    if (this.data) return this.data.getName()
    return null
  }

  get sketchIndex() {
    if (this.data) return this.data.sketchIndex
    return null
  }

  setGeometry(geometry, index = 1) {
    if (this.data) {
      this.data.geometry = geometry
      this.data.sketchIndex = index
    }
  }

  append(node) {
    this.children.push(node)
    node.parent = this
    return node
  }

  get next() {
    const p = this.parent
    if (p === null) return null
    for (let i = 0; i < p.children.length; i++) {
      const e = p.children[i]
      if (e.index === this.index) {
        if (i < p.size() - 1) {
          return p.children[i + 1]
        }
      }
    }
    return null
  }

  getFirstChild(key) {
    for (const child of this.children) {
      if (child.typeName === key) return child
    }
    return null
  }

  get(name) {
    if (this.data) return this.data.get(name)
    return null
  }

  set(name, value, cls = VAL_GUESS) {
    if (this.data) this.data.set(name, value, cls)
  }

  getSegment() {
    if (this.data) return this.data.segment
    return null
  }

  getRefText() {
    const name = this.name
    if (name) {
      return `(${this.index.toString(16).padStart(4, '0')}): ${this.typeName} '${name}'`
    }
    return `(${this.index.toString(16).padStart(4, '0')}): ${this.typeName}`
  }

  getUnitName() {
    if (this.data) return this.data.getUnitName()
    return ''
  }

  getDerivedUnitName() {
    if (this.data) return this.data.getDerivedUnitName()
    return ''
  }

  toString() {
    const node = this.data
    if (node !== null) {
      const content = node.content
      const name = node.name
      if (name) {
        return `(${node.index.toString(16).padStart(4, '0')}): ${node.typeName} '${name}'${content}`
      }
      return `(${node.index.toString(16).padStart(4, '0')}): ${node.typeName}${content}`
    }
    return '<NONE>'
  }

  getSubTypeName() {
    const node = this.data
    if (node !== null) {
      return node.typeName
    }
    return null
  }

  getFxAttributes() {
    const attributes = {}
    let nxt = this
    while (nxt) {
      const nxtOld = nxt
      nxt = nxtOld.get('next')
      if (nxt) {
        attributes[nxt.typeName] = nxt
      }
    }
    return attributes
  }

  getParticipants() {
    const attributes = this.getFxAttributes()
    for (const atrName of Object.keys(attributes)) {
      const attribute = attributes[atrName]
      const participants = attribute.get('participants')
      if (participants) {
        return participants
      }
    }
    return []
  }
}

// ============================================================================
// Segment Class
// ============================================================================

export class Segment {
  constructor() {
    this.txt1 = ''
    this.ver = 0
    this.name = ''
    this.dat1 = ''
    this.val1 = 0
    this.dat2 = ''
    this.arr1 = []
    this.arr2 = []
    this.segID = null
    this.segment = null
    this.arr3 = []
    this.sec1 = []
    this.sec2 = []
    this.sec3 = []
    this.secBlkTyps = {}
    this.sec5 = []
    this.sec6 = []
    this.sec7 = []
    this.sec8 = []
    this.sec9 = []
    this.secA = []
    this.secB = []
    this.uid2 = null // should always be '9744e6a4-11d1-8dd8-0008-2998bedddc09'
    this.nodes = null
    this.elementNodes = {}
    this.indexNodes = {}
    this.tree = new DataNode(null)
    this.acis = null
    this.bodies = {}
    this.AcisList = []
  }

  getDcSatAttributes() {
    if (this.acis === null) return {}
    return this.acis.dcAttributes || {}
  }

  get type() {
    if (this.segment) return this.segment.type
    return this.name
  }

  isApp() {
    return SEGMENTS_APP.includes(this.type)
  }

  isBRep() {
    return SEGMENTS_BRP.includes(this.type)
  }

  isBrowser() {
    return SEGMENTS_BRX.includes(this.type)
  }

  isDC() {
    return SEGMENTS_DOC.includes(this.type)
  }

  isDesignView() {
    return SEGMENTS_DVW.includes(this.type)
  }

  isDirectory() {
    return SEGMENTS_DIR.includes(this.name)
  }

  isEeData() {
    return SEGMENTS_EED.includes(this.type)
  }

  isEeScene() {
    return SEGMENTS_EES.includes(this.type)
  }

  isFBAttribute() {
    return SEGMENTS_FBA.includes(this.type)
  }

  isGraphics() {
    return SEGMENTS_GRX.includes(this.type)
  }

  isNBNotebook() {
    return SEGMENTS_NTB.includes(this.type)
  }

  isResult() {
    return SEGMENTS_RSX.includes(this.type)
  }

  isSheet() {
    return SEGMENTS_SHT.includes(this.type)
  }

  toString() {
    return this.name
  }
}

export const EMPTY_SEGMENT = new Segment()

// ============================================================================
// AbstractData (Base for Node Data)
// ============================================================================

export class AbstractData {
  constructor() {
    this.uid = null
    this.name = null
    this.index = -1
    this.references = []
    this.properties = {}
    this.size = 0
    this.visible = false
    this.construction = false
    this.segment = null
    this.geometry = null
    this.sketchIndex = null
    this.sketchPos = null
    this.valid = true
    this.handled = false
    this.node = null
    this.skipCheck = true
    this.data = []
    this.typeName = ''
    this.analysed = false
  }

  set(name, value, cls = VAL_GUESS) {
    if (name) {
      this.properties[name] = [value, cls]
    }
  }

  get(name) {
    const prop = this.properties[name]
    if (prop) return prop[0]
    return null
  }

  delete(name) {
    if (name in this.properties) {
      delete this.properties[name]
    }
  }

  getName() {
    if (this.nameSet) return this.name
    if (this.name === null) {
      const label = this.get('next')
      if (label !== null) {
        this.nameSet = true
        this.name = label.name
      }
    }
    return this.name
  }

  getUnitName() {
    const unitRef = this.get('unit')
    if (unitRef) {
      return unitRef.get('Unit') || ''
    }
    return ''
  }

  getDerivedUnitName() {
    const unitRef = this.get('unit')
    if (unitRef) {
      const derivedRef = unitRef.get('derived')
      if (derivedRef) {
        return derivedRef.get('Unit')
      }
    }
    return null
  }

  getUnitOffset() {
    const unitRef = this.get('unit')
    if (unitRef) {
      return unitRef.get('UnitOffset') || 0.0
    }
    return 0.0
  }

  getUnitFactor() {
    const unitRef = this.get('unit')
    if (unitRef) {
      return unitRef.get('UnitFactor') || 1.0
    }
    return 1.0
  }

  get content() {
    const parts = []
    for (const [name, prop] of Object.entries(this.properties)) {
      const [value, cls] = prop
      if (cls === VAL_REF) continue
      let result = name ? `${name}=` : ''
      result += this._formatValue(value, cls)
      parts.push(result)
    }
    if (this.data && this.data.length > 0) {
      parts.push(`aX=(${this.data.map(c => c.toString(16).padStart(2, '0').toUpperCase()).join(' ')})`)
    }
    return parts.join(' ')
  }

  _formatValue(value, cls) {
    if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        if (cls === VAL_UINT8) return value.toString(16).padStart(2, '0').toUpperCase()
        if (cls === VAL_UINT16) return value.toString(16).padStart(3, '0').toUpperCase()
        if (cls === VAL_UINT32) return value.toString(16).padStart(4, '0').toUpperCase()
        return value.toString()
      }
      return value.toString()
    }
    if (typeof value === 'boolean') return value.toString()
    if (typeof value === 'string') {
      if (cls === VAL_STR8) return `'${value}'`
      return `"${value}"`
    }
    if (Array.isArray(value)) {
      return `[${value.map(v => this._formatValue(v, cls)).join(',')}]`
    }
    if (value && typeof value === 'object' && value.toString) {
      return value.toString()
    }
    return String(value)
  }

  toString() {
    if (this.name === null) {
      return `(${this.index.toString(16).padStart(4, '0')}): ${this.uid}${this.content}`
    }
    return `(${this.index.toString(16).padStart(4, '0')}): ${this.uid} '${this.name}'${this.content}`
  }
}

// ============================================================================
// Edge Classes
// ============================================================================

export class AbstractEdge {
  p2v(p, f = 1.0) {
    return { x: p[0] * f, y: p[1] * f, z: p[2] * f }
  }

  toString() {
    return 'AbstractEdge'
  }
}

export class PointEdge extends AbstractEdge {
  constructor(a) {
    super()
    this.p = this.p2v(a, 10.0)
  }

  toString() {
    return `Point:(${this.p.x},${this.p.y},${this.p.z})`
  }
}

export class LineEdge extends AbstractEdge {
  constructor(a) {
    super()
    this.p1 = this.p2v(a.slice(0, 3), 10.0)
    const dir = this.p2v(a.slice(3, 6), 10.0)
    this.p2 = { x: dir.x + this.p1.x, y: dir.y + this.p1.y, z: dir.z + this.p1.z }
  }

  toString() {
    return `Line:(${this.p1.x},${this.p1.y},${this.p1.z})-(${this.p2.x},${this.p2.y},${this.p2.z})`
  }
}

export class ArcOfConicEdge extends AbstractEdge {
  constructor(center, dir, major, a, b) {
    super()
    this.center = this.p2v(center, 10.0)
    this.dir = this.p2v(dir, 1.0)
    this.major = this.p2v(major, 10.0)
    this.a = a
    this.b = b
  }

  isArc() {
    if (Math.abs(Math.abs(this.a) - Math.PI) > 1e-6) return true
    return Math.abs(Math.abs(this.b) - Math.PI) > 1e-6
  }
}

export class ArcOfCircleEdge extends ArcOfConicEdge {
  constructor(a) {
    super(a.slice(0, 3), a.slice(3, 6), a.slice(6, 9), a[10], a[11])
    this.radius = a[9] * 10.0
  }

  toString() {
    return `Circle:(${this.center.x},${this.center.y},${this.center.z}), (${this.dir.x},${this.dir.y},${this.dir.z}), (${this.major.x},${this.major.y},${this.major.z}), ${this.radius}, ${this.a}, ${this.b}`
  }
}

export class ArcOfEllipseEdge extends ArcOfConicEdge {
  constructor(a) {
    super(a.slice(0, 3), a.slice(3, 6), a.slice(6, 9), a[11], a[12])
    this.majorRadius = a[9]
    this.minorRadius = a[10]
  }

  toString() {
    return `Ellipse:(${this.center.x},${this.center.y},${this.center.z}), (${this.dir.x},${this.dir.y},${this.dir.z}), (${this.major.x},${this.major.y},${this.major.z}), ${this.majorRadius}, ${this.minorRadius}, ${this.a}, ${this.b}`
  }
}

export class BSplineEdge extends AbstractEdge {
  constructor(a0, a1, a2, a3, a4) {
    super()
    this.a0 = [...a0, ...a4]
    this.a1 = a1[0]
    this.a2 = a2[1]
    this.a3 = a2[0]
    this.a4 = a2[1]
    this.a5 = a3[0]
    this.a6 = a3[1]
  }

  toString() {
    const points = this.a6.map(p => `(${p[0]},${p[1]},${p[2]})`).join(',')
    return `BSpline:(${floatArr2Str(this.a0)}),[${floatArr2Str(this.a1)}],[${floatArr2Str(this.a2)}],[${floatArr2Str(this.a3)}],[${floatArr2Str(this.a4)}],[${floatArr2Str(this.a5)}],[${points}]`
  }
}

export class BezierEdge extends AbstractEdge {
  constructor(a0, a1) {
    super()
    this.a0 = a0
    this.a1 = a1
  }

  toString() {
    const points = this.a1.map(a => `(${a[0]},${a[1]},${a[2]})`).join(',')
    return `Bezier:(${intArr2Str(this.a0.slice(1), 3)}: ${points})`
  }
}

// ============================================================================
// ModelerTxnMgr
// ============================================================================

export class ModelerTxnMgr {
  constructor() {
    this.node = 0 // DC.node
    this.dcIdx = 0 // DC-index ref
    this.lst = [] // 1st= ref BRep.node.ref_1,byte,key; 2nd = ref to Result.node,byte,key => mapping
  }

  toString() {
    const s = this.lst.map(a => `(${a[0].toString(16).padStart(4, '0')},${a[1].toString(16).padStart(2, '0')},${a[2].toString(16).padStart(4, '0')})`).join(',')
    return `${this.node.toString(16).padStart(4, '0')} ${this.dcIdx.toString(16).padStart(4, '0')} [${s}]`
  }
}

// ============================================================================
// Header0 (Node Header)
// ============================================================================

export class Header0 {
  constructor(m, x) {
    this.m = m
    this.x = x
  }

  toString() {
    return `m=${this.m.toString(16)} x=${this.x.toString(16).padStart(3, '0')}`
  }
}

// ============================================================================
// NtEntry (Name Table Entry)
// ============================================================================

export class NtEntry {
  constructor(nameTable, key) {
    this.nameTable = nameTable & 0x7FFFFFFF
    this.key = key
    this.entry = null
  }

  toString() {
    if (this.nameTable) {
      return `${this.nameTable.toString(16).padStart(4, '0')}[${this.key.toString(16).padStart(4, '0')}]`
    }
    return ''
  }
}

// ============================================================================
// Model Singleton
// ============================================================================

let model = null

export function createNewModel() {
  model = new Inventor()
  return model
}

export function getModel() {
  return model
}

export function releaseModel() {
  model = null
}

// ============================================================================
// Default Export
// ============================================================================

export default {
  // Version Info
  VersionInfo,

  // RSeSegmentation classes
  RSeSegInformation,
  RSeDatabase,
  RSeSegmentObject,
  RSeSegmentValue2,
  RSeSegment,
  RSeStorageBlockSize,
  RSeStorageSection2,
  RSeStorageSection3,
  RSeStorageSection4Data,
  RSeStorageBlockType,
  RSeStorageSection4Data1,
  RSeStorageSection5,
  RSeStorageSection6,
  RSeStorageSection7,
  RSeStorageSection8,
  RSeStorageSection9,
  RSeStorageSectionA,
  RSeStorageSectionB,
  RSeRevisions,
  RSeDbRevisionInfo,

  // Main model
  Inventor,
  DbInterface,

  // Result/Graphics
  ResultItem4,
  GraphicsFont,
  Lightning,

  // Value types
  AbstractValue,
  Length,
  Angle,
  Mass,
  Time,
  Temperature,
  Velocity,
  Area,
  Volume,
  Force,
  Pressure,
  Power,
  Work,
  Electrical,
  Luminosity,
  Substance,
  Scalar,
  Derived,

  // Node types
  DataNode,
  Segment,
  EMPTY_SEGMENT,
  AbstractData,

  // Edge types
  AbstractEdge,
  PointEdge,
  LineEdge,
  ArcOfConicEdge,
  ArcOfCircleEdge,
  ArcOfEllipseEdge,
  BSplineEdge,
  BezierEdge,

  // Modeler
  ModelerTxnMgr,
  Header0,
  NtEntry,

  // Model functions
  createNewModel,
  getModel,
  releaseModel
}
