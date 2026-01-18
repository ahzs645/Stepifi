/**
 * ACIS Attribute Classes
 * Attribute entities for colors, names, and metadata
 * Ported from Acis.py lines 4133-4700
 */

import { Entity } from './entity.js'
import {
  getRefNode, getBoolean, getInteger, getFloat, getFloats, getText,
  getVersion, isASM
} from './utils.js'

// ============================================================================
// Base Attributes Class
// ============================================================================

/**
 * Base class for attribute entities
 */
export class Attributes extends Entity {
  constructor() {
    super()
    this._next = null
    this._previous = null
    this._owner = null
  }

  set(record) {
    let i = super.set(record)
    ;[this._next, i] = getRefNode(record, i, 'attrib')
    ;[this._previous, i] = getRefNode(record, i, 'attrib')
    ;[this._owner, i] = getRefNode(record, i, null)
    return i
  }

  getNext() {
    return this._next ? this._next.entity : null
  }

  getPrevious() {
    return this._previous ? this._previous.entity : null
  }

  getOwner() {
    return this._owner ? this._owner.entity : null
  }
}

// ============================================================================
// Attrib Base
// ============================================================================

export class Attrib extends Attributes {
  constructor() {
    super()
  }
}

// ============================================================================
// ADesk (AutoDesk) Attributes
// ============================================================================

export class AttribADesk extends Attrib {
  constructor() {
    super()
  }
}

export class AttribADeskColor extends AttribADesk {
  constructor() {
    super()
    this.colorIndex = 0
  }

  set(record) {
    let i = super.set(record)
    ;[this.colorIndex, i] = getInteger(record.chunks, i)
    return i
  }
}

export class AttribADeskMaterial extends AttribADesk {
  constructor() {
    super()
    this.val1 = 0
    this.val2 = 0
  }

  set(record) {
    let i = super.set(record)
    ;[this.val1, i] = getInteger(record.chunks, i)
    ;[this.val2, i] = getInteger(record.chunks, i)
    return i
  }
}

export class AttribADeskTrueColor extends AttribADesk {
  constructor() {
    super()
    this.alpha = 0.0
    this.red = 0.749
    this.green = 0.749
    this.blue = 0.749
  }

  set(record) {
    let i = super.set(record)
    const [rgba, i2] = getInteger(record.chunks, i)
    this.alpha = ((rgba >> 24) & 0xFF) / 255.0
    this.red = ((rgba >> 16) & 0xFF) / 255.0
    this.green = ((rgba >> 8) & 0xFF) / 255.0
    this.blue = (rgba & 0xFF) / 255.0
    return i2
  }

  getColor() {
    return { r: this.red, g: this.green, b: this.blue, a: this.alpha }
  }
}

// ============================================================================
// Ansoft Attributes
// ============================================================================

export class AttribAnsoft extends Attrib {
  constructor() {
    super()
  }
}

export class AttribAnsoftId extends AttribAnsoft {
  constructor() {
    super()
  }
}

export class AttribAnsoftProperties extends AttribAnsoft {
  constructor() {
    super()
  }
}

// ============================================================================
// BT Attributes
// ============================================================================

export class AttribBt extends Attrib {
  constructor() {
    super()
  }
}

export class AttribBtEntityColor extends AttribBt {
  constructor() {
    super()
  }
}

// ============================================================================
// Gen (Generic) Attributes
// ============================================================================

export class AttribGen extends Attrib {
  constructor() {
    super()
  }
}

export class AttribGenName extends AttribGen {
  constructor() {
    super()
    this.text = ''
  }

  set(record) {
    let i = super.set(record)
    const vers = getVersion()
    if (vers > 1.7) {
      if (vers < 16.0 || isASM()) {
        i += 4 // Skip [(keep|copy), (keep_keep), (ignore), (copy)]
      }
      ;[this.text, i] = getText(record.chunks, i)
    }
    return i
  }

  getName() {
    return this.text
  }
}

export class AttribGenNameInt32 extends AttribGenName {
  constructor() {
    super()
    this.value = 0
  }

  set(record) {
    let i = super.set(record)
    ;[this.value, i] = getInteger(record.chunks, i)
    return i
  }
}

export class AttribGenNameInt64 extends AttribGenName {
  constructor() {
    super()
    this.value = 0
  }

  set(record) {
    let i = super.set(record)
    ;[this.value, i] = getInteger(record.chunks, i)
    return i
  }
}

export class AttribGenNameString extends AttribGenName {
  constructor() {
    super()
    this.value = ''
  }

  set(record) {
    let i = super.set(record)
    ;[this.value, i] = getText(record.chunks, i)
    return i
  }
}

export class AttribGenNameReal extends AttribGenName {
  constructor() {
    super()
    this.value = 0.0
  }

  set(record) {
    let i = super.set(record)
    ;[this.value, i] = getFloat(record.chunks, i)
    return i
  }
}

export class AttribGenNameVector extends AttribGenName {
  constructor() {
    super()
    this.value = { x: 0, y: 0, z: 0 }
  }

  set(record) {
    let i = super.set(record)
    const [x, i2] = getFloat(record.chunks, i)
    const [y, i3] = getFloat(record.chunks, i2)
    const [z, i4] = getFloat(record.chunks, i3)
    this.value = { x, y, z }
    return i4
  }
}

// ============================================================================
// ST (Standard) Attributes
// ============================================================================

export class AttribSt extends Attrib {
  constructor() {
    super()
  }
}

export class AttribStNoMerge extends AttribSt {
  constructor() {
    super()
  }
}

export class AttribStNoCombine extends AttribSt {
  constructor() {
    super()
  }
}

export class AttribStRgbColor extends AttribSt {
  constructor() {
    super()
    this.red = 0.749
    this.green = 0.749
    this.blue = 0.749
  }

  set(record) {
    let i = super.set(record)
    ;[this.red, i] = getFloat(record.chunks, i)
    ;[this.green, i] = getFloat(record.chunks, i)
    ;[this.blue, i] = getFloat(record.chunks, i)
    return i
  }

  getColor() {
    return { r: this.red, g: this.green, b: this.blue }
  }
}

export class AttribStDisplay extends AttribSt {
  constructor() {
    super()
  }
}

export class AttribStId extends AttribSt {
  constructor() {
    super()
  }
}

// ============================================================================
// Sys (System) Attributes
// ============================================================================

export class AttribSys extends Attrib {
  constructor() {
    super()
  }
}

export class AttribSysConvexity extends AttribSys {
  constructor() {
    super()
  }
}

export class AttribSysAnnotationAttrib extends AttribSys {
  constructor() {
    super()
  }
}

export class AttribSysStichHint extends AttribSys {
  constructor() {
    super()
  }
}

export class AttribSysTag extends AttribSys {
  constructor() {
    super()
  }
}

export class AttribSysVertedge extends AttribSys {
  constructor() {
    super()
  }
}

// ============================================================================
// TSL Attributes
// ============================================================================

export class AttribTsl extends Attrib {
  constructor() {
    super()
  }
}

export class AttribTslId extends AttribTsl {
  constructor() {
    super()
  }
}

export class AttribTslColour extends AttribTsl {
  constructor() {
    super()
    this.red = 0.749
    this.green = 0.749
    this.blue = 0.749
  }

  set(record) {
    let i = super.set(record)
    ;[this.red, i] = getFloat(record.chunks, i)
    ;[this.green, i] = getFloat(record.chunks, i)
    ;[this.blue, i] = getFloat(record.chunks, i)
    return i
  }

  getColor() {
    return { r: this.red, g: this.green, b: this.blue }
  }
}

// ============================================================================
// Other Attribute Types (stub classes)
// ============================================================================

export class AttribAtUfld extends Attrib { constructor() { super() } }
export class AttribAtUfldDefmData extends AttribAtUfld { constructor() { super() } }
export class AttribAtUfldDevPair extends AttribAtUfld { constructor() { super() } }
export class AttribAtUfldFlatBend extends AttribAtUfld { constructor() { super() } }
export class AttribAtUfldFfldPosTransf extends AttribAtUfld { constructor() { super() } }
export class AttribAtUfldFfldPosTransfMixUfContourRollTrack extends AttribAtUfldFfldPosTransf { constructor() { super() } }
export class AttribAtUfldFfldPosTransfMixUfTransformTrack extends AttribAtUfldFfldPosTransf { constructor() { super() } }
export class AttribAtUfldNonMergeBend extends AttribAtUfld { constructor() { super() } }
export class AttribAtUfldPosTrack extends AttribAtUfld { constructor() { super() } }
export class AttribAtUfldPosTrackMixUfRobustPositionTrack extends AttribAtUfldPosTrack { constructor() { super() } }
export class AttribAtUfldPosTrackSurfSimp extends AttribAtUfldPosTrack { constructor() { super() } }
export class AttribAcadSolidHistoryPersubent extends Attrib { constructor() { super() } }
export class AttribCwkBase extends Attrib { constructor() { super() } }
export class AttribCwkBaseCswDbid extends AttribCwkBase { constructor() { super() } }
export class AttribCustom extends Attrib { constructor() { super() } }
export class AttribDesigner extends Attrib { constructor() { super() } }
export class AttribDesignerHistory extends AttribDesigner { constructor() { super() } }
export class AttribDesignerSurfaceId extends AttribDesigner { constructor() { super() } }
export class AttribDesignerOwnerTag extends AttribDesigner { constructor() { super() } }
export class AttribDxid extends Attrib { constructor() { super() } }
export class AttribEye extends Attrib { constructor() { super() } }
export class AttribEyeFMesh extends AttribEye { constructor() { super() } }
export class AttribEyePtList extends AttribEye { constructor() { super() } }
export class AttribEyeRefVt extends AttribEye { constructor() { super() } }
export class AttribFdi extends Attrib { constructor() { super() } }
export class AttribFdiLabel extends AttribFdi { constructor() { super() } }
export class AttribKcId extends Attrib { constructor() { super() } }
export class AttribLwd extends Attrib { constructor() { super() } }
export class AttribLwdFMesh extends AttribLwd { constructor() { super() } }
export class AttribLwdPtList extends AttribLwd { constructor() { super() } }
export class AttribLwdRefVT extends AttribLwd { constructor() { super() } }
export class AttribMixOrganization extends Attrib { constructor() { super() } }
export class AttribMixOrganizationBendCenterEdge extends AttribMixOrganization { constructor() { super() } }
export class AttribMixOrganizationBendExtendedEdge extends AttribMixOrganization { constructor() { super() } }
export class AttribMixOrganizationBendExtendedEdgeProgenitorTagIds extends AttribMixOrganization { constructor() { super() } }
export class AttribMixOrganizationBendExtendPlane extends AttribMixOrganization { constructor() { super() } }
export class AttribMixOrganizationCornerEdge extends AttribMixOrganization { constructor() { super() } }
export class AttribMixOrganizationCreEntityQuality extends AttribMixOrganization { constructor() { super() } }
export class AttribMixOrganizationDecalEntity extends AttribMixOrganization { constructor() { super() } }
export class AttribMixOrganizationDetailEdgeInfo extends AttribMixOrganization { constructor() { super() } }
export class AttribMixOrganizationEntityQuality extends AttribMixOrganization { constructor() { super() } }
export class AttribMixOrganizationFlangeTrimEdge extends AttribMixOrganization { constructor() { super() } }
export class AttribMixOrganizationFlatPatternVis extends AttribMixOrganization { constructor() { super() } }
export class AttribMixOrganizationJacobiCornerEdge extends AttribMixOrganization { constructor() { super() } }
export class AttribMixOrganizationLimitTrackingFraceFrom extends AttribMixOrganization { constructor() { super() } }
export class AttribMixOrganizationLoftedFlangeNotch extends AttribMixOrganization { constructor() { super() } }
export class AttribMixOrganizationNoBendRelief extends AttribMixOrganization { constructor() { super() } }
export class AttribMixOrganizationNoCenterline extends AttribMixOrganization { constructor() { super() } }
export class AttribMixOrganizationRefoldInfo extends AttribMixOrganization { constructor() { super() } }
export class AttribMixOrganizationRolExtents extends AttribMixOrganization { constructor() { super() } }
export class AttribMixOrganizationSmoothBendEdge extends AttribMixOrganization { constructor() { super() } }
export class AttribMixOrganizationTraceFace extends AttribMixOrganization { constructor() { super() } }
export class AttribMixOrganizationUfContourRollExtentTrack extends AttribMixOrganization { constructor() { super() } }
export class AttribMixOrganizationUfFaceType extends AttribMixOrganization { constructor() { super() } }
export class AttribMixOrganizationUfUnrollTrack extends AttribMixOrganization { constructor() { super() } }
export class AttribMixOrganizationUnfoldInfo extends AttribMixOrganization { constructor() { super() } }
export class AttribNamingMatching extends Attrib { constructor() { super() } }
export class AttribNamingMatchingNMxBrepTag extends AttribNamingMatching { constructor() { super() } }
export class AttribNamingMatchingNMxBrepTagFeature extends AttribNamingMatchingNMxBrepTag { constructor() { super() } }
export class AttribNamingMatchingNMxBrepTagName extends AttribNamingMatchingNMxBrepTag { constructor() { super() } }
// ... many more naming matching subtypes
export class AttribRBase extends Attrib { constructor() { super() } }
export class AttribRBaseRender extends AttribRBase { constructor() { super() } }
export class AttribRfBase extends Attrib { constructor() { super() } }
export class AttribRfBaseFaceTracker extends AttribRfBase { constructor() { super() } }
export class AttribSg extends Attrib { constructor() { super() } }
export class AttribSgPidName extends AttribSg { constructor() { super() } }
export class AttribSnl extends Attrib { constructor() { super() } }
export class AttribSnlCubitOwner extends AttribSnl { constructor() { super() } }
export class AttribCt extends Attrib { constructor() { super() } }
export class AttribCtCellPtr extends AttribCt { constructor() { super() } }
export class AttribCtCFace extends AttribCt { constructor() { super() } }

// ============================================================================
// Utility: Extract color from entity's attribute chain
// ============================================================================

/**
 * Walk attribute chain and find color
 */
export function extractColor(entity) {
  if (!entity || !entity._attrib) return null

  let attr = entity._attrib.entity
  const visited = new Set()

  while (attr && !visited.has(attr.index)) {
    visited.add(attr.index)

    if (attr instanceof AttribStRgbColor ||
        attr instanceof AttribTslColour ||
        attr instanceof AttribADeskTrueColor) {
      return attr.getColor()
    }

    attr = attr.getNext()
  }

  return null
}

/**
 * Walk attribute chain and find name
 */
export function extractName(entity) {
  if (!entity || !entity._attrib) return null

  let attr = entity._attrib.entity
  const visited = new Set()

  while (attr && !visited.has(attr.index)) {
    visited.add(attr.index)

    if (attr instanceof AttribGenName) {
      return attr.getName()
    }

    attr = attr.getNext()
  }

  return null
}
