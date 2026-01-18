/**
 * Inventor Loader Utility Functions
 * Binary reading functions for parsing Inventor IPT/IAM/F3D files
 * Ported from importerUtils.py
 */

// ============================================================================
// UUID Name Mappings
// ============================================================================

export const UUID_NAMES = {
  '3c7f67aa4dd7848a040c58894ab06552': '_BodiesFolder',
  '328fc2ea44d13ec5f05abeb87d4aabca': '_ViewDirectionCollection',
  '8da49a2311d60c3210005aab87ae3483': 'AGxInstanceNode',
  'b91e695f11d52794100011ab87ae3483': 'AGxMultiBodyNode',
  '21e870bb11d0d2d000d8ccbc0663dc09': 'BRxEntry',
  'cb0adcaf11d50e7860009ba6c588fbb0': 'EExCollector',
  '6759d86f11d27838600094b70b02ecb0': 'FWxRenderingStyle',
  'a3ebe1984b705d656174d7969e5ae726': 'MBxBodyNode',
  'a03874b011d41238600018aa9dccefb0': 'MBxContourFlangeFeature',
  'c4c14b9011d328ff60004da99dccefb0': 'MBxFaceFeature',
  'c3dddc0811d397d06000a7a99dccefb0': 'MBxFlangeFeature',
  '10d6c06b46086923c73c0faca268550f': 'MBxSheetMetalRuleStyle',
  'c098d3cf11d5345310003697ab9f0ab5': 'MBRDxPunchToolFeature',
  '6045231311d30d7a6000ecb21d6eefb0': 'MBxUserSettingsAttribute',
  'cadd6468467ce6ee8e1494884110a2da': 'MIxBrepComponent',
  'f645595c11d51333100060a6bba647b5': 'MIxTransactablePartition',
  'd81cde4711d265f760005dbead9287b0': 'NBxEntry',
  '74e3441311d25aeb60005bbead9287b0': 'NBxFolder',
  'd8705bc711d15553000825a5b17adc09': 'NBxGraphicsArea',
  'dbbad87b11d228b0600052bead9287b0': 'NBxItem',
  '4c41596411d12e13000824a5fd7adc09': 'NBxNote',
  '3c95b7ce11d13388000820a5b17adc09': 'NBxNotebook',
  '9215a16211d19776600055bd861c3cb0': 'NBxNoteGlyphGroup',
  'fb96d24a11d18877600046bd861c3cb0': 'NBxNoteGlyphNode',
  'cc253bb711d15553000825a5b17adc09': 'NBxTextArea',
  'ccc5085a11d1aa4c0008c8ba32a3dc09': 'NMxFaceMergeData',
  'cce9204211d171c50008a7ba32a3dc09': 'NMxNameTable',
  'dd4c4d3a4fbbf55e16b785853b52d4dc': 'PMxASMFlatPatternPartRepresentation',
  '9a676a5011d45da66000e3b81269f1b0': 'PMxBodyNode',
  'af48560f11d48dc71000d58dc04a0ab5': 'PMxColorStylePrimAttr',
  '7dfc244811d461a01000c895bba647b5': 'PMxCompositeFeatureOutline',
  'b251bfc011d24761a0001580d694c7c9': 'PMxEntryManager',
  'c0014c894bd6a537fa9444be54ebc63d': 'PMxImage2D',
  '022ac1b511d20d356000f99ac5361ab0': 'PMxPartDrawAttr',
  'ca7163a311d0d3b20008bfbb21eddc09': 'PMxPartNode',
  '5e382456497725cff44fdeafccace65e': 'PMxPartRepresentation',
  'a94779e111d438066000b1b7b035f1b0': 'PMxPatternOutline',
  'a94779e011d438066000b1b7b035f1b0': 'PMxSingleFeatureOutline',
  'f7676ab011d23618a0001280d694c7c9': 'PMxSketchEntry',
  '590d0a1011d1e6ca80006fb1e13554c7': 'RDxAngle2',
  'bf3b5c8411d2e92a60004bb38932edb0': 'RDxAngle3Points2',
  '6d8a4ac711d4490f6000e6ab3a39fbb0': 'RDxAngleInterfaceDef',
  'ce52df3b11d0d2d00008ccbc0663dc09': 'RDxArc2',
  'bee90c4111d43c8280005a9a88fdf9c6': 'RDxAtomicInterfaceDef',
  'de818cc011d452d9c000ba967a14684f': 'RDxBendConstraint',
  '90874d4711d0d1f80008cabc0663dc09': 'RDxBody',
  '90874d4811d0d1f80008cabc0663dc09': 'RDxBodySet',
  '2b24130911d272cc60007bb79b49ebb0': 'RDxBrowserFolder',
  '9e43716a11d20fa5600084b7b035c3b0': 'RDxCircle3',
  '4ef32ef04cf83c27f0b185a66f245b22': 'RDxClientFeature',
  '90874d9411d0d1f80008cabc0663dc09': 'RDxCoincident2',
  '90874d5911d0d1f80008cabc0663dc09': 'RDxComponent',
  '81afc10f11d514051000569772d147b5': 'RDxCompositeInterfaceDef',
  '778752c64a5426253aab58b51014c910': 'RDxCurveToSurfaceProjection',
  '7f936baa4aef3859f4b80e8c548a4a11': 'RDxDecalFeature',
  '27ecb60f11d430c3c0001985e89c6b4f': 'RDxDerivedAssembly',
  'cd7c1c534dd0d3096a46e89e3ba9d923': 'RDxDerivedOccDataCollector',
  'bfb5eb9311d443e8c0001c85e89c6b4f': 'RDxDerivedOccFeature',
  '255d7ed711d3b5f2c0000385e89c6b4f': 'RDxDerivedPart',
  '26287e9611d490bd1000e2962dba09b5': 'RDxDeselTableNode',
  '89b87c6f11d2e0d26000f1b26c74fcb0': 'RDxDiagProfileInvalidLoop',
  '3683ce3311d2fcf16000fab26c74fcb0': 'RDxDiagSketchDimRefGeomFailed',
  '74df96e011d1e069800066b1e13554c7': 'RDxDiameter2',
  '1105855811d295e360000cb38932edb0': 'RDxDistanceDimension2',
  '10b6adef45f57b24911db28d8c498f80': 'RDxDistanceDimension3',
  '90874d5311d0d1f80008cabc0663dc09': 'RDxEdgeId',
  '9e43716b11d20fa5600084b7b035c3b0': 'RDxEllipse3',
  '4507d46011d1e6be80006fb1e13554c7': 'RDxEllipticArc2',
  '748fbd6411d1c41f6000b3b801f31bb0': 'RDxFaceSurfaceId',
  '90874d9111d0d1f80008cabc0663dc09': 'RDxFeature',
  'fd1f3f2111d449d88000679a88fdf9c6': 'RDxFlushInterfaceDef',
  'b71cbec94d8922eaa66f24ad3b81c470': 'RDxHelixConstraint3',
  '00acc00011d1e05f800066b1e13554c7': 'RDxHorizontalDistance2',
  '1b16984a11d28fce6000bdb72508ebb0': 'RDxHospital',
  '6d8a4ac911d4490f6000e6ab3a39fbb0': 'RDxInsertInterfaceDef',
  'dfb2586a11d60a0a10002fbd891e89b5': 'RDxIntersectionCurve',
  'ce52df3a11d0d2d00008ccbc0663dc09': 'RDxLine2',
  '8ef06c8911d1043c60007cb801f31bb0': 'RDxLine3',
  'a327786911d19690000826bd0663dc09': 'RDxLoop',
  'a789eeb011d1e6c080006fb1e13554c7': 'RDxMajorRadius2',
  '375c698211d16b510008a1ba32a3dc09': 'RDxMatchedEdge',
  'b382a87c45f4ffb9fe4a7486104813a4': 'RDxMatchedLoop',
  '5523121311d4490d6000e6ab3a39fbb0': 'RDxMateInterfaceDef',
  'b4964e9011d1e6c080006fb1e13554c7': 'RDxMinorRadius2',
  'fad9a9b511d2330560002cab01f31bb0': 'RDxMirrorPattern',
  '452121b611d514d6100061a6bba647b5': 'RDxModelerTxnMgr',
  '3e55d947407dffd912db059ae9d0ed1f': 'RDxOffsetCurve2',
  '90874d1611d0d1f80008cabc0663dc09': 'RDxPart',
  '90874d1111d0d1f80008cabc0663dc09': 'RDxPlanarSketch',
  'ce52df4211d0d2d00008ccbc0663dc09': 'RDxPlane',
  'ce52df3511d0d2d00008ccbc0663dc09': 'RDxPoint2',
  'ce52df3e11d0d2d00008ccbc0663dc09': 'RDxPoint3',
  '0697713111d2323260002cab01f31bb0': 'RDxPolarPattern',
  'f9884c4311d1983d000826bd0663dc09': 'RDxProfile',
  '2d06cad349986fa71ead34b67e52cd7b': 'RDxProjectCutEdges',
  '671bb70011d1e068800066b1e13554c7': 'RDxRadius2',
  '90874d2611d0d1f80008cabc0663dc09': 'RDxReal',
  '2067324411d21dc560002aab01f31bb0': 'RDxRectangularPattern',
  '2d86fc2642dfe34030c08ab05ef9bfc5': 'RDxReferenceEdgeLoopId',
  '317b734611d37a7c60001cb3d1c1fbb0': 'RDxRefSpline',
  '0b86ad43421c4a69e0e0deaab16e7154': 'RDxRefSpline3',
  '3ae9d8da11d42c3ac000ad967a14684f': 'RDxSketch3d',
  'ffd270b811d52d1410000897994909b5': 'RDxSketchFragment',
  'f9372fd411d1d315000847b00524dc09': 'RDxSpline2',
  '7c44abde11d2257a60008cb7b035c3b0': 'RDxSpline3',
  '8f41fd2411d26eac00082aab32a3dc09': 'RDxStopNode',
  '1fbb3c0111d2684da0009e9a3c3aa076': 'RDxString',
  '9a94e34711d36b7fc000d49545df724f': 'RDxToolBodyCacheAttribute',
  'ce52df4011d0d2d00008ccbc0663dc09': 'RDxVector3',
  '3683ff4011d1e05f800066b1e13554c7': 'RDxVerticalDistance2',
  'ea7da98811d447a26000d0b81269f1b0': 'RSeAcisEntityContainer',
  'cc0f752111d18027e38619962259017a': 'RSeAcisEntityWrapper',
  '60fd184511d0d79d0008bfbb21eddc09': 'SCxSketchNode',
  'da58aa0e11d43cb1c000ae967a14684f': 'S3xSketch3dNode',
  'fd1e899d11d635491000568ec04a0ab5': 'SMxAnalysisSetup',
  'a529d1e211d0d0900008bcbb21eddc09': 'SMxGroupNode',
  '022ac1b111d20d356000f99ac5361ab0': 'SMxPersistentScenePath',
  '716b5cd148299bd2474ec788e5ab0c74': 'UCxATEntry',
  'd48240694eb51a34aec9d789df4f97a4': 'UCxClientFeatureNode',
  'dbe41d9111d4414c8000609a88fdf9c6': 'UCxCompInterfaceNode',
  'ca7163a111d0d3b20008bfbb21eddc09': 'UCxComponentNode',
  'd1071d574d61a7c4f2e352bf50116935': 'UCxConstraint3DimensionItem',
  '7dfcc81711d6419710006eab87ae3483': 'UCxConstructionFolderEntry',
  '475e786111d296dba0004a803603c8c9': 'UCxFeatureDimensionStateAttr',
  '2c7020f611d1b3c06000b1b801f31bb0': 'UCxWorkaxisNode',
  '14533d8211d1087100085ba406e5dc09': 'UCxWorkplaneNode',
  '2c7020f811d1b3c06000b1b801f31bb0': 'UCxWorkpointNode',
  'd31891c248bf14c3aa42ea872a846b2a': 'UFRxRef'
}

// ============================================================================
// Global State
// ============================================================================

let _fileVersion = 0
let _fileBeta = -1
let _blockSize = 0

export function getFileVersion() {
  return _fileVersion
}

export function setFileVersion(version) {
  _fileVersion = version
  _blockSize = version > 2010 ? 0 : 4
}

export function getFileBeta() {
  return _fileBeta
}

export function setFileBeta(beta) {
  _fileBeta = beta
}

export function getBlockSize() {
  return _blockSize
}

// ============================================================================
// Binary Reading Functions
// ============================================================================

/**
 * Get boolean value (0 or 1)
 * @param {Uint8Array|DataView} data - Binary data
 * @param {number} offset - Byte offset
 * @returns {[boolean, number]} [value, newOffset]
 */
export function getBoolean(data, offset) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  const val = view.getUint8(offset)
  if (val === 1) return [true, offset + 1]
  if (val === 0) return [false, offset + 1]
  throw new Error(`Expected either 0 or 1 but found ${val.toString(16)}`)
}

/**
 * Get signed 8-bit integer
 */
export function getSInt8(data, offset) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  return [view.getInt8(offset), offset + 1]
}

/**
 * Get unsigned 8-bit integer
 */
export function getUInt8(data, offset) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  return [view.getUint8(offset), offset + 1]
}

/**
 * Get array of unsigned 8-bit integers
 */
export function getUInt8A(data, offset, size) {
  const end = offset + size
  const arr = new Uint8Array(data.buffer || data, data.byteOffset ? data.byteOffset + offset : offset, size)
  return [Array.from(arr), end]
}

/**
 * Get unsigned 16-bit integer (little-endian)
 */
export function getUInt16(data, offset) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  return [view.getUint16(offset, true), offset + 2]
}

/**
 * Get array of unsigned 16-bit integers
 */
export function getUInt16A(data, offset, size) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  const arr = []
  let i = offset
  for (let j = 0; j < size; j++) {
    arr.push(view.getUint16(i, true))
    i += 2
  }
  return [arr, i]
}

/**
 * Get signed 16-bit integer
 */
export function getSInt16(data, offset) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  return [view.getInt16(offset, true), offset + 2]
}

/**
 * Get array of signed 16-bit integers
 */
export function getSInt16A(data, offset, size) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  const arr = []
  let i = offset
  for (let j = 0; j < size; j++) {
    arr.push(view.getInt16(i, true))
    i += 2
  }
  return [arr, i]
}

/**
 * Get unsigned 32-bit integer
 */
export function getUInt32(data, offset) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  return [view.getUint32(offset, true), offset + 4]
}

/**
 * Get array of unsigned 32-bit integers
 */
export function getUInt32A(data, offset, size) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  const arr = []
  let i = offset
  for (let j = 0; j < size; j++) {
    arr.push(view.getUint32(i, true))
    i += 4
  }
  return [arr, i]
}

/**
 * Get signed 32-bit integer
 */
export function getSInt32(data, offset) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  return [view.getInt32(offset, true), offset + 4]
}

/**
 * Get array of signed 32-bit integers
 */
export function getSInt32A(data, offset, size) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  const arr = []
  let i = offset
  for (let j = 0; j < size; j++) {
    arr.push(view.getInt32(i, true))
    i += 4
  }
  return [arr, i]
}

/**
 * Get unsigned 64-bit integer (as BigInt)
 */
export function getUInt64(data, offset) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  return [view.getBigUint64(offset, true), offset + 8]
}

/**
 * Get array of unsigned 64-bit integers
 */
export function getUInt64A(data, offset, size) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  const arr = []
  let i = offset
  for (let j = 0; j < size; j++) {
    arr.push(view.getBigUint64(i, true))
    i += 8
  }
  return [arr, i]
}

/**
 * Get signed 64-bit integer (as BigInt)
 */
export function getSInt64(data, offset) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  return [view.getBigInt64(offset, true), offset + 8]
}

/**
 * Get array of signed 64-bit integers
 */
export function getSInt64A(data, offset, size) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  const arr = []
  let i = offset
  for (let j = 0; j < size; j++) {
    arr.push(view.getBigInt64(i, true))
    i += 8
  }
  return [arr, i]
}

/**
 * Get 32-bit float
 */
export function getFloat32(data, offset) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  return [view.getFloat32(offset, true), offset + 4]
}

/**
 * Get array of 32-bit floats
 */
export function getFloat32A(data, offset, size) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  const arr = []
  let i = offset
  for (let j = 0; j < size; j++) {
    arr.push(view.getFloat32(i, true))
    i += 4
  }
  return [arr, i]
}

/**
 * Get 2D point from 32-bit floats
 */
export function getFloat32_2D(data, offset) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  return [
    { x: view.getFloat32(offset, true), y: view.getFloat32(offset + 4, true) },
    offset + 8
  ]
}

/**
 * Get 3D point from 32-bit floats
 */
export function getFloat32_3D(data, offset) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  return [
    {
      x: view.getFloat32(offset, true),
      y: view.getFloat32(offset + 4, true),
      z: view.getFloat32(offset + 8, true)
    },
    offset + 12
  ]
}

/**
 * Get 64-bit float (double)
 */
export function getFloat64(data, offset) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  return [view.getFloat64(offset, true), offset + 8]
}

/**
 * Get array of 64-bit floats
 */
export function getFloat64A(data, offset, size) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  const arr = []
  let i = offset
  for (let j = 0; j < size; j++) {
    arr.push(view.getFloat64(i, true))
    i += 8
  }
  return [arr, i]
}

/**
 * Get 2D vector from 64-bit floats (with z=0)
 */
export function getFloat64_2D(data, offset) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  return [
    {
      x: view.getFloat64(offset, true),
      y: view.getFloat64(offset + 8, true),
      z: 0
    },
    offset + 16
  ]
}

/**
 * Get 3D vector from 64-bit floats
 */
export function getFloat64_3D(data, offset) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  return [
    {
      x: view.getFloat64(offset, true),
      y: view.getFloat64(offset + 8, true),
      z: view.getFloat64(offset + 16, true)
    },
    offset + 24
  ]
}

// ============================================================================
// Color Class
// ============================================================================

export class Color {
  constructor(red, green, blue, alpha = 1.0) {
    this.red = red
    this.green = green
    this.blue = blue
    this.alpha = alpha
  }

  getRGB() {
    return [this.red, this.green, this.blue]
  }

  getRGBA() {
    return [this.red, this.green, this.blue, this.alpha]
  }

  toString() {
    const r = Math.round(this.red * 255)
    const g = Math.round(this.green * 255)
    const b = Math.round(this.blue * 255)
    const a = Math.round(this.alpha * 255)
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}${a.toString(16).padStart(2, '0')}`
  }
}

/**
 * Get RGBA color from 4 floats
 */
export function getColorRGBA(data, offset) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  const r = view.getFloat32(offset, true)
  const g = view.getFloat32(offset + 4, true)
  const b = view.getFloat32(offset + 8, true)
  const a = view.getFloat32(offset + 12, true)
  return [new Color(r, g, b, a), offset + 16]
}

// ============================================================================
// UID Class
// ============================================================================

export class UID {
  constructor(options = {}) {
    if (options.bytes_le) {
      const b = options.bytes_le
      this.timeLow = (b[3] << 24) | (b[2] << 16) | (b[1] << 8) | b[0]
      this.val1 = (b[5] << 8) | b[4]
      this.val2 = (b[7] << 8) | b[6]
      this.val3 = (b[8] << 8) | b[9]
      // val4 is 6 bytes (48 bits)
      this.val4 = BigInt(b[10]) << 40n |
                  BigInt(b[11]) << 32n |
                  BigInt(b[12]) << 24n |
                  BigInt(b[13]) << 16n |
                  BigInt(b[14]) << 8n |
                  BigInt(b[15])
    } else if (options.str) {
      const vals = options.str.split('-')
      this.timeLow = parseInt(vals[0], 16)
      this.val1 = parseInt(vals[1], 16)
      this.val2 = parseInt(vals[2], 16)
      this.val3 = parseInt(vals[3], 16)
      this.val4 = BigInt('0x' + vals[4])
    } else {
      this.timeLow = 0
      this.val1 = 0
      this.val2 = 0
      this.val3 = 0
      this.val4 = 0n
    }
  }

  get hex() {
    return `${this.timeLow.toString(16).padStart(8, '0')}${this.val1.toString(16).padStart(4, '0')}${this.val2.toString(16).padStart(4, '0')}${this.val3.toString(16).padStart(4, '0')}${this.val4.toString(16).padStart(12, '0')}`
  }

  toString() {
    return `${this.timeLow.toString(16).toUpperCase().padStart(8, '0')}-${this.val1.toString(16).toUpperCase().padStart(4, '0')}-${this.val2.toString(16).toUpperCase().padStart(4, '0')}-${this.val3.toString(16).toUpperCase().padStart(4, '0')}-${this.val4.toString(16).toUpperCase().padStart(12, '0')}`
  }

  equals(other) {
    if (other instanceof UID) {
      return this.timeLow === other.timeLow &&
             this.val1 === other.val1 &&
             this.val2 === other.val2 &&
             this.val3 === other.val3 &&
             this.val4 === other.val4
    }
    return false
  }
}

/**
 * Get UUID from binary data
 */
export function getUUID(data, offset) {
  const bytes = data instanceof Uint8Array
    ? data.slice(offset, offset + 16)
    : new Uint8Array(data.buffer || data, offset, 16)
  return [new UID({ bytes_le: bytes }), offset + 16]
}

/**
 * Get DateTime from binary data (Windows FILETIME)
 */
export function getDateTime(data, offset) {
  const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength)
  const val = view.getBigUint64(offset, true)
  if (val !== 0n) {
    // Convert from Windows FILETIME (100-nanosecond intervals since 1601-01-01)
    // to JavaScript Date
    const milliseconds = Number(val / 10000n) - 11644473600000
    return [new Date(milliseconds), offset + 8]
  }
  return [null, offset + 8]
}

// ============================================================================
// Text Reading Functions
// ============================================================================

const ENCODING_FS = 'utf-8'

/**
 * Get text string with specified length
 */
export function getText8(data, offset, length) {
  const bytes = data instanceof Uint8Array
    ? data.slice(offset, offset + length)
    : new Uint8Array(data.buffer || data, offset, length)

  const decoder = new TextDecoder(ENCODING_FS)
  let txt = decoder.decode(bytes)

  // Remove trailing null or newline
  if (txt.endsWith('\0')) txt = txt.slice(0, -1)
  if (txt.endsWith('\n')) txt = txt.slice(0, -1)

  return [txt, offset + length]
}

/**
 * Get 8-bit length prefixed text
 */
export function getLen8Text8(data, offset) {
  const [length, i] = getUInt8(data, offset)
  return getText8(data, i, length)
}

/**
 * Get 32-bit length prefixed 8-bit text
 */
export function getLen32Text8(data, offset) {
  const [length, i] = getUInt32(data, offset)
  return getText8(data, i, length)
}

/**
 * Get 32-bit length prefixed 16-bit (UTF-16LE) text
 */
export function getLen32Text16(data, offset) {
  const [length, i] = getUInt32(data, offset)
  const end = i + 2 * length
  const bytes = data instanceof Uint8Array
    ? data.slice(i, end)
    : new Uint8Array(data.buffer || data, i, 2 * length)

  const decoder = new TextDecoder('utf-16le')
  let txt = decoder.decode(bytes)

  // Remove trailing null or newline
  if (txt.endsWith('\0')) txt = txt.slice(0, -1)
  if (txt.endsWith('\n')) txt = txt.slice(0, -1)

  return [txt, end]
}

/**
 * Get UID text name from UUID_NAMES mapping
 */
export function getUidText(uid) {
  const hex = uid.hex
  return UUID_NAMES[hex] || uid.toString()
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert float array to string
 */
export function floatArr2Str(arr) {
  return arr.map(f => f.toPrecision(6)).join(', ')
}

/**
 * Convert int array to hex string
 */
export function intArr2Str(arr, width = 2) {
  return arr.map(h => h.toString(16).toUpperCase().padStart(width, '0')).join(',')
}

/**
 * Convert 2D int array to string
 */
export function int2DArr2Str(arr, width = 2) {
  return arr.map(a => '[' + a.map(h => h.toString(16).toUpperCase().padStart(width, '0')).join(',') + ']').join(',')
}

/**
 * Check if value is a string
 */
export function isString(value) {
  return typeof value === 'string'
}

/**
 * Check if two vectors are approximately equal
 */
export function isEqual(a, b, epsilon = 0.0001) {
  if (a === null || a === undefined) return isEqual({ x: 0, y: 0, z: 0 }, b, epsilon)
  if (b === null || b === undefined) return isEqual(a, { x: 0, y: 0, z: 0 }, epsilon)
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = a.z - b.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz) < epsilon
}

/**
 * Check if two numbers are approximately equal
 */
export function isEqual1D(a, b, epsilon = 0.0001) {
  if (a === null || a === undefined) return isEqual1D(0, b, epsilon)
  if (b === null || b === undefined) return isEqual1D(a, 0, epsilon)
  return Math.abs(a - b) < epsilon
}

/**
 * Check if stream name indicates embeddings
 */
export function isEmbeddings(names) {
  return names.includes('RSeEmbeddings')
}

/**
 * Reshape flat array into 2D array
 */
export function reshape(nums, size) {
  if (size === 1) return nums
  const result = []
  for (let i = 0; i < nums.length; i += size) {
    result.push(nums.slice(i, i + size))
  }
  return result
}

// ============================================================================
// Default Export
// ============================================================================

export default {
  // State
  getFileVersion,
  setFileVersion,
  getFileBeta,
  setFileBeta,
  getBlockSize,

  // Binary readers
  getBoolean,
  getSInt8,
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
  getUInt64,
  getUInt64A,
  getSInt64,
  getSInt64A,
  getFloat32,
  getFloat32A,
  getFloat32_2D,
  getFloat32_3D,
  getFloat64,
  getFloat64A,
  getFloat64_2D,
  getFloat64_3D,
  getColorRGBA,
  getUUID,
  getDateTime,

  // Text readers
  getText8,
  getLen8Text8,
  getLen32Text8,
  getLen32Text16,
  getUidText,

  // Classes
  Color,
  UID,
  UUID_NAMES,

  // Utilities
  floatArr2Str,
  intArr2Str,
  int2DArr2Str,
  isString,
  isEqual,
  isEqual1D,
  isEmbeddings,
  reshape
}
