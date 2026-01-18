/**
 * ACIS Binary Parser for F3D (Fusion 360) files
 * Parses ACIS binary format (.smb/.smbh) into entity objects
 */

// ============================================================================
// ACIS Binary Tag Constants
// ============================================================================

const ACIS_TAGS = {
  TAG_CHAR: 0x02,
  TAG_SHORT: 0x03,
  TAG_LONG: 0x04,
  TAG_FLOAT: 0x05,
  TAG_DOUBLE: 0x06,
  TAG_UTF8_U8: 0x07,
  TAG_UTF8_U32: 0x08,
  TAG_TRUE: 0x0A,
  TAG_FALSE: 0x0B,
  TAG_ENTITY_REF: 0x0C,
  TAG_IDENT: 0x0D,
  TAG_SUBIDENT: 0x0E,
  TAG_SUBSUBIDENT: 0x0F,
  TAG_TERMINATOR: 0x11,
  TAG_POSITION: 0x13,
  TAG_VECTOR_3D: 0x14,
  TAG_ENUM_VALUE: 0x15
}

// ============================================================================
// ACIS Binary Reader Class
// ============================================================================

class ACISBinaryReader {
  constructor(buffer) {
    this.buffer = buffer
    this.view = new DataView(buffer)
    this.offset = 0
    this.entities = new Map()
    this.entityList = []
  }

  hasMore() {
    return this.offset < this.buffer.byteLength
  }

  readByte() {
    if (this.offset >= this.buffer.byteLength) {
      throw new Error('Unexpected end of ACIS data')
    }
    return this.view.getUint8(this.offset++)
  }

  peekByte() {
    if (this.offset >= this.buffer.byteLength) return -1
    return this.view.getUint8(this.offset)
  }

  readBytes(count) {
    const bytes = new Uint8Array(this.buffer, this.offset, count)
    this.offset += count
    return bytes
  }

  readInt16() {
    const val = this.view.getInt16(this.offset, true)
    this.offset += 2
    return val
  }

  readInt32() {
    const val = this.view.getInt32(this.offset, true)
    this.offset += 4
    return val
  }

  readUInt32() {
    const val = this.view.getUint32(this.offset, true)
    this.offset += 4
    return val
  }

  readFloat32() {
    const val = this.view.getFloat32(this.offset, true)
    this.offset += 4
    return val
  }

  readFloat64() {
    const val = this.view.getFloat64(this.offset, true)
    this.offset += 8
    return val
  }

  readPosition() {
    return {
      x: this.readFloat64(),
      y: this.readFloat64(),
      z: this.readFloat64()
    }
  }

  readVector3D() {
    return {
      x: this.readFloat64(),
      y: this.readFloat64(),
      z: this.readFloat64()
    }
  }

  readString() {
    const length = this.readByte()
    const bytes = this.readBytes(length)
    return new TextDecoder().decode(bytes)
  }

  readLongString() {
    const length = this.readUInt32()
    const bytes = this.readBytes(length)
    return new TextDecoder().decode(bytes)
  }

  /**
   * Read a tagged value from the binary stream
   */
  readTaggedValue() {
    const tag = this.readByte()

    switch (tag) {
      case ACIS_TAGS.TAG_CHAR:
        return { type: 'char', value: this.readByte() }

      case ACIS_TAGS.TAG_SHORT:
        return { type: 'short', value: this.readInt16() }

      case ACIS_TAGS.TAG_LONG:
        return { type: 'long', value: this.readInt32() }

      case ACIS_TAGS.TAG_FLOAT:
        return { type: 'float', value: this.readFloat32() }

      case ACIS_TAGS.TAG_DOUBLE:
        return { type: 'double', value: this.readFloat64() }

      case ACIS_TAGS.TAG_UTF8_U8:
        return { type: 'string', value: this.readString() }

      case ACIS_TAGS.TAG_UTF8_U32:
        return { type: 'string', value: this.readLongString() }

      case ACIS_TAGS.TAG_TRUE:
        return { type: 'bool', value: true }

      case ACIS_TAGS.TAG_FALSE:
        return { type: 'bool', value: false }

      case ACIS_TAGS.TAG_ENTITY_REF: {
        const id = this.readInt32()
        return { type: 'entity_ref', id }
      }

      case ACIS_TAGS.TAG_IDENT:
        return { type: 'ident', value: this.readString() }

      case ACIS_TAGS.TAG_SUBIDENT:
        return { type: 'subident', value: this.readString() }

      case ACIS_TAGS.TAG_SUBSUBIDENT:
        return { type: 'subsubident', value: this.readString() }

      case ACIS_TAGS.TAG_TERMINATOR:
        return { type: 'terminator' }

      case ACIS_TAGS.TAG_POSITION:
        return { type: 'position', value: this.readPosition() }

      case ACIS_TAGS.TAG_VECTOR_3D:
        return { type: 'vector3d', value: this.readVector3D() }

      case ACIS_TAGS.TAG_ENUM_VALUE:
        return { type: 'enum', value: this.readString() }

      default:
        console.warn(`Unknown ACIS tag: 0x${tag.toString(16)} at offset ${this.offset - 1}`)
        return { type: 'unknown', tag }
    }
  }

  /**
   * Read a complete entity record
   */
  readRecord() {
    const startOffset = this.offset
    const chunks = []

    try {
      const typeVal = this.readTaggedValue()
      if (typeVal.type !== 'ident' && typeVal.type !== 'subident') {
        return null
      }

      chunks.push(typeVal)

      let maxChunks = 1000
      while (maxChunks-- > 0) {
        const val = this.readTaggedValue()
        chunks.push(val)

        if (val.type === 'terminator') break
        if (val.type === 'unknown') break
      }

      return {
        entityType: typeVal.value,
        chunks,
        startOffset
      }
    } catch (e) {
      console.warn(`Failed to read record at offset ${startOffset}:`, e.message)
      return null
    }
  }
}

// ============================================================================
// Entity Parsers
// ============================================================================

function parseACISEntities(reader) {
  const entities = []
  const entityMap = new Map()
  let entityId = 0

  while (reader.hasMore()) {
    const record = reader.readRecord()
    if (!record) break

    const entity = {
      id: entityId++,
      type: record.entityType,
      data: record.chunks.filter(c => c.type !== 'terminator'),
      refs: []
    }

    for (const chunk of record.chunks) {
      if (chunk.type === 'entity_ref') {
        entity.refs.push(chunk.id)
      }
    }

    entities.push(entity)
    entityMap.set(entity.id, entity)
  }

  return { entities, entityMap }
}

function buildACISBodies(entities, entityMap) {
  const bodies = []

  for (const entity of entities) {
    if (entity.type === 'body') {
      const body = parseACISBody(entity, entityMap)
      if (body) bodies.push(body)
    }
  }

  return bodies
}

function parseACISBody(entity, entityMap) {
  const body = {
    type: 'body',
    id: entity.id,
    lumps: [],
    transform: null
  }

  for (const chunk of entity.data) {
    if (chunk.type === 'entity_ref') {
      const ref = entityMap.get(chunk.id)
      if (ref && ref.type === 'lump') {
        const lump = parseACISLump(ref, entityMap)
        if (lump) body.lumps.push(lump)
      } else if (ref && ref.type === 'transform') {
        body.transform = parseACISTransform(ref, entityMap)
      }
    }
  }

  return body
}

function parseACISLump(entity, entityMap) {
  const lump = {
    type: 'lump',
    id: entity.id,
    shells: []
  }

  for (const chunk of entity.data) {
    if (chunk.type === 'entity_ref') {
      const ref = entityMap.get(chunk.id)
      if (ref && ref.type === 'shell') {
        const shell = parseACISShell(ref, entityMap)
        if (shell) lump.shells.push(shell)
      }
    }
  }

  return lump
}

function parseACISShell(entity, entityMap) {
  const shell = {
    type: 'shell',
    id: entity.id,
    faces: []
  }

  for (const chunk of entity.data) {
    if (chunk.type === 'entity_ref') {
      const ref = entityMap.get(chunk.id)
      if (ref && ref.type === 'face') {
        const face = parseACISFace(ref, entityMap)
        if (face) shell.faces.push(face)
      }
    }
  }

  return shell
}

function parseACISFace(entity, entityMap) {
  const face = {
    type: 'face',
    id: entity.id,
    surface: null,
    loops: [],
    sense: true
  }

  for (const chunk of entity.data) {
    if (chunk.type === 'entity_ref') {
      const ref = entityMap.get(chunk.id)
      if (ref) {
        if (ref.type === 'loop') {
          const loop = parseACISLoop(ref, entityMap)
          if (loop) face.loops.push(loop)
        } else if (ref.type.endsWith('-surface')) {
          face.surface = parseACISSurface(ref, entityMap)
        }
      }
    } else if (chunk.type === 'ident' && (chunk.value === 'forward' || chunk.value === 'reversed')) {
      face.sense = chunk.value === 'forward'
    }
  }

  return face
}

function parseACISLoop(entity, entityMap) {
  const loop = {
    type: 'loop',
    id: entity.id,
    coedges: []
  }

  for (const chunk of entity.data) {
    if (chunk.type === 'entity_ref') {
      const ref = entityMap.get(chunk.id)
      if (ref && ref.type === 'coedge') {
        const coedge = parseACISCoedge(ref, entityMap)
        if (coedge) loop.coedges.push(coedge)
      }
    }
  }

  return loop
}

function parseACISCoedge(entity, entityMap) {
  const coedge = {
    type: 'coedge',
    id: entity.id,
    edge: null,
    sense: true,
    nextCoedge: null,
    prevCoedge: null
  }

  for (const chunk of entity.data) {
    if (chunk.type === 'entity_ref') {
      const ref = entityMap.get(chunk.id)
      if (ref && ref.type === 'edge') {
        coedge.edge = parseACISEdge(ref, entityMap)
      }
    } else if (chunk.type === 'ident' && (chunk.value === 'forward' || chunk.value === 'reversed')) {
      coedge.sense = chunk.value === 'forward'
    }
  }

  return coedge
}

function parseACISEdge(entity, entityMap) {
  const edge = {
    type: 'edge',
    id: entity.id,
    curve: null,
    startVertex: null,
    endVertex: null,
    startParam: 0,
    endParam: 1
  }

  let paramIdx = 0
  for (const chunk of entity.data) {
    if (chunk.type === 'entity_ref') {
      const ref = entityMap.get(chunk.id)
      if (ref) {
        if (ref.type === 'vertex') {
          if (!edge.startVertex) {
            edge.startVertex = parseACISVertex(ref, entityMap)
          } else {
            edge.endVertex = parseACISVertex(ref, entityMap)
          }
        } else if (ref.type.endsWith('-curve')) {
          edge.curve = parseACISCurve(ref, entityMap)
        }
      }
    } else if (chunk.type === 'double') {
      if (paramIdx === 0) {
        edge.startParam = chunk.value
        paramIdx++
      } else {
        edge.endParam = chunk.value
      }
    }
  }

  return edge
}

function parseACISVertex(entity, entityMap) {
  const vertex = {
    type: 'vertex',
    id: entity.id,
    point: null
  }

  for (const chunk of entity.data) {
    if (chunk.type === 'entity_ref') {
      const ref = entityMap.get(chunk.id)
      if (ref && ref.type === 'point') {
        vertex.point = parseACISPoint(ref, entityMap)
      }
    } else if (chunk.type === 'position') {
      vertex.point = chunk.value
    }
  }

  return vertex
}

function parseACISPoint(entity, _entityMap) {
  for (const chunk of entity.data) {
    if (chunk.type === 'position') {
      return chunk.value
    }
  }
  return { x: 0, y: 0, z: 0 }
}

// ============================================================================
// Surface Parsers
// ============================================================================

function parseACISSurface(entity, _entityMap) {
  const surfaceType = entity.type
  const surface = { type: surfaceType, id: entity.id }

  switch (surfaceType) {
    case 'plane-surface': {
      let hasPosition = false
      for (const chunk of entity.data) {
        if (chunk.type === 'position' && !hasPosition) {
          surface.origin = chunk.value
          hasPosition = true
        } else if (chunk.type === 'vector3d') {
          surface.normal = chunk.value
        }
      }
      break
    }

    case 'cone-surface': {
      let posIdx = 0, vecIdx = 0
      for (const chunk of entity.data) {
        if (chunk.type === 'position') {
          if (posIdx === 0) surface.origin = chunk.value
          posIdx++
        } else if (chunk.type === 'vector3d') {
          if (vecIdx === 0) surface.axis = chunk.value
          else if (vecIdx === 1) surface.refDirection = chunk.value
          vecIdx++
        } else if (chunk.type === 'double') {
          if (surface.semiAngle === undefined) surface.semiAngle = chunk.value
          else if (surface.cosine === undefined) surface.cosine = chunk.value
          else if (surface.sine === undefined) surface.sine = chunk.value
        }
      }
      break
    }

    case 'cylinder-surface': {
      let posIdx = 0, vecIdx = 0
      for (const chunk of entity.data) {
        if (chunk.type === 'position') {
          if (posIdx === 0) surface.origin = chunk.value
          posIdx++
        } else if (chunk.type === 'vector3d') {
          if (vecIdx === 0) surface.axis = chunk.value
          else if (vecIdx === 1) surface.refDirection = chunk.value
          vecIdx++
        } else if (chunk.type === 'double') {
          if (surface.radius === undefined) surface.radius = chunk.value
        }
      }
      break
    }

    case 'sphere-surface': {
      for (const chunk of entity.data) {
        if (chunk.type === 'position') {
          surface.origin = chunk.value
        } else if (chunk.type === 'double') {
          if (surface.radius === undefined) surface.radius = chunk.value
        }
      }
      break
    }

    case 'torus-surface': {
      let vecIdx = 0
      for (const chunk of entity.data) {
        if (chunk.type === 'position') {
          surface.origin = chunk.value
        } else if (chunk.type === 'vector3d') {
          if (vecIdx === 0) surface.axis = chunk.value
          vecIdx++
        } else if (chunk.type === 'double') {
          if (surface.majorRadius === undefined) surface.majorRadius = chunk.value
          else if (surface.minorRadius === undefined) surface.minorRadius = chunk.value
        }
      }
      break
    }

    case 'spline-surface': {
      surface.uDegree = 3
      surface.vDegree = 3
      surface.poles = []
      surface.uKnots = []
      surface.vKnots = []
      surface.weights = []

      for (const chunk of entity.data) {
        if (chunk.type === 'long') {
          if (!surface.nU) surface.nU = chunk.value
          else if (!surface.nV) surface.nV = chunk.value
        } else if (chunk.type === 'position') {
          surface.poles.push(chunk.value)
        } else if (chunk.type === 'double') {
          // Knots or weights based on context
          surface.uKnots.push(chunk.value)
        }
      }
      break
    }

    default:
      surface.rawData = entity.data
  }

  return surface
}

// ============================================================================
// Curve Parsers
// ============================================================================

function parseACISCurve(entity, _entityMap) {
  const curveType = entity.type
  const curve = { type: curveType, id: entity.id }

  switch (curveType) {
    case 'straight-curve': {
      for (const chunk of entity.data) {
        if (chunk.type === 'position') {
          curve.origin = chunk.value
        } else if (chunk.type === 'vector3d') {
          curve.direction = chunk.value
        }
      }
      break
    }

    case 'ellipse-curve': {
      let vecIdx = 0
      for (const chunk of entity.data) {
        if (chunk.type === 'position') {
          curve.center = chunk.value
        } else if (chunk.type === 'vector3d') {
          if (vecIdx === 0) curve.normal = chunk.value
          else if (vecIdx === 1) curve.majorAxis = chunk.value
          vecIdx++
        } else if (chunk.type === 'double') {
          if (curve.majorRadius === undefined) curve.majorRadius = chunk.value
          else if (curve.ratio === undefined) curve.ratio = chunk.value
        }
      }
      break
    }

    case 'intcurve-curve':
    case 'spline-curve': {
      curve.degree = 3
      curve.poles = []
      curve.knots = []
      curve.weights = []

      for (const chunk of entity.data) {
        if (chunk.type === 'long') {
          if (!curve.numPoles) curve.numPoles = chunk.value
        } else if (chunk.type === 'position') {
          curve.poles.push(chunk.value)
        } else if (chunk.type === 'double') {
          if (curve.poles.length === 0) {
            // Before poles
          } else if (curve.knots.length < (curve.numPoles || 0) + curve.degree + 1) {
            curve.knots.push(chunk.value)
          } else {
            curve.weights.push(chunk.value)
          }
        }
      }
      break
    }

    default:
      curve.rawData = entity.data
  }

  return curve
}

// ============================================================================
// Transform Parser
// ============================================================================

function parseACISTransform(entity, _entityMap) {
  const transform = {
    type: 'transform',
    matrix: [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ]
  }

  const values = []
  for (const chunk of entity.data) {
    if (chunk.type === 'double') {
      values.push(chunk.value)
    }
  }

  if (values.length >= 12) {
    transform.matrix = [
      [values[0], values[1], values[2], values[3] || 0],
      [values[4], values[5], values[6], values[7] || 0],
      [values[8], values[9], values[10], values[11] || 0],
      [values[12] || 0, values[13] || 0, values[14] || 0, values[15] || 1]
    ]
  }

  return transform
}

// ============================================================================
// F3D File Parser
// ============================================================================

/**
 * Parse F3D file (ZIP-based Fusion 360 format)
 * @param {ArrayBuffer} arrayBuffer - The F3D file data
 * @param {Function} loadJSZip - Function to load JSZip library
 * @returns {Promise<Array>} Array of parsed ACIS bodies
 */
async function parseF3D(arrayBuffer, loadJSZip) {
  const JSZip = await loadJSZip()
  const zip = await JSZip.loadAsync(arrayBuffer)

  const files = Object.keys(zip.files)

  // Find ACIS binary files (.smb or .smbh)
  const smbFiles = files.filter(f =>
    f.toLowerCase().endsWith('.smb') ||
    f.toLowerCase().endsWith('.smbh')
  )

  if (smbFiles.length === 0) {
    throw new Error('No ACIS binary data (.smb/.smbh) found in F3D file')
  }

  const bodies = []

  for (const smbFile of smbFiles) {
    try {
      const smbData = await zip.file(smbFile).async('arraybuffer')

      // Skip header if present
      let dataOffset = 0
      const headerView = new Uint8Array(smbData)

      const headerText = new TextDecoder().decode(headerView.slice(0, Math.min(4096, headerView.length)))
      const endMarkerIdx = headerText.indexOf('\x00')
      if (endMarkerIdx > 0 && endMarkerIdx < 2048) {
        dataOffset = endMarkerIdx + 1
      }

      const asbMarker = headerText.indexOf('asmheader')
      if (asbMarker >= 0) {
        const endHeader = headerText.indexOf('End-of-ACIS-data')
        if (endHeader > 0) {
          dataOffset = endHeader + 'End-of-ACIS-data'.length
          while (dataOffset < headerView.length &&
            (headerView[dataOffset] === 0x0A ||
              headerView[dataOffset] === 0x0D ||
              headerView[dataOffset] === 0x20)) {
            dataOffset++
          }
        }
      }

      const binaryData = smbData.slice(dataOffset)
      const reader = new ACISBinaryReader(binaryData)
      const { entities, entityMap } = parseACISEntities(reader)
      const parsedBodies = buildACISBodies(entities, entityMap)
      bodies.push(...parsedBodies)
    } catch (e) {
      console.warn(`Failed to parse ${smbFile}:`, e.message)
    }
  }

  if (bodies.length === 0) {
    throw new Error('No geometry bodies found in F3D file')
  }

  return bodies
}

// Export for use in worker
if (typeof self !== 'undefined') {
  self.ACISParser = {
    parseF3D,
    ACISBinaryReader,
    parseACISEntities,
    buildACISBodies
  }
}
