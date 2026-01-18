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
    // Handle both ArrayBuffer and Uint8Array
    if (buffer instanceof Uint8Array) {
      this.buffer = buffer
      this.view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)
    } else if (buffer instanceof ArrayBuffer) {
      this.buffer = new Uint8Array(buffer)
      this.view = new DataView(buffer)
    } else {
      throw new Error('ACISBinaryReader requires ArrayBuffer or Uint8Array')
    }
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
    // Bounds check
    if (this.offset + count > this.buffer.byteLength) {
      const available = this.buffer.byteLength - this.offset
      console.warn(`readBytes: requested ${count} bytes but only ${available} available`)
      count = available
    }
    const bytes = new Uint8Array(this.buffer.buffer, this.buffer.byteOffset + this.offset, count)
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

  readInt64() {
    // Read as two 32-bit values (JS doesn't have native 64-bit int)
    const lo = this.view.getUint32(this.offset, true)
    const hi = this.view.getInt32(this.offset + 4, true)
    this.offset += 8
    // For entity refs, -1 is common (0xffffffffffffffff)
    if (lo === 0xffffffff && hi === -1) return -1
    // Return as Number (may lose precision for very large values)
    return hi * 0x100000000 + lo
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
    if (length === 0) return ''
    if (length > 200) {
      // Suspiciously long string for an identifier
      console.warn(`Suspicious string length ${length} at offset ${this.offset - 1}`)
      return `<invalid_len_${length}>`
    }
    const bytes = this.readBytes(length)
    return new TextDecoder().decode(bytes)
  }

  readLongString() {
    const length = this.readUInt32()
    if (length === 0) return ''
    // Cap at 1MB to prevent memory issues
    if (length > 1024 * 1024) {
      console.warn(`String length ${length} exceeds limit at offset ${this.offset - 4}`)
      // Skip the bytes but don't try to decode
      this.offset += Math.min(length, this.buffer.byteLength - this.offset)
      return `<string_too_long_${length}>`
    }
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
        // ACIS binary uses 64-bit integers
        return { type: 'long', value: this.readInt64() }

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
        // ACIS binary uses 64-bit entity refs
        const id = this.readInt64()
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

  // Shell has a reference to the first face in a circular linked list
  // Find the first face reference
  let firstFaceId = null
  for (const chunk of entity.data) {
    if (chunk.type === 'entity_ref' && chunk.id >= 0) {
      const ref = entityMap.get(chunk.id)
      if (ref && ref.type === 'face') {
        firstFaceId = chunk.id
        break
      }
    }
  }

  if (firstFaceId === null) return shell

  // Follow the circular face linked list
  const visitedFaces = new Set()
  let currentFaceId = firstFaceId

  while (currentFaceId !== null && currentFaceId >= 0 && !visitedFaces.has(currentFaceId)) {
    visitedFaces.add(currentFaceId)

    const faceEntity = entityMap.get(currentFaceId)
    if (!faceEntity || faceEntity.type !== 'face') break

    const face = parseACISFace(faceEntity, entityMap, shell.id)
    if (face) shell.faces.push(face)

    // Find next face - it's the first face reference in the data
    currentFaceId = findNextFaceInCircularList(faceEntity, entityMap, firstFaceId, visitedFaces)
  }

  return shell
}

// Helper to find next face in circular linked list
function findNextFaceInCircularList(entity, entityMap, firstFaceId, visited) {
  // Face record structure: attrib, long, null, NEXT_FACE, loop, shell, null, surface
  // The first face reference is the "next" pointer
  for (const chunk of entity.data) {
    if (chunk.type === 'entity_ref' && chunk.id >= 0) {
      const ref = entityMap.get(chunk.id)
      if (ref && ref.type === 'face') {
        // Return this face if we haven't visited it yet
        if (!visited.has(chunk.id)) {
          return chunk.id
        }
        // If we've wrapped around to the first face, stop
        if (chunk.id === firstFaceId) {
          return null
        }
      }
    }
  }
  return null
}

// Helper to find next element in a linked list, excluding back-references
function findNextInList(entity, entityMap, targetType, parentId) {
  // In ACIS, linked lists are stored with next pointer early in the record
  for (const chunk of entity.data) {
    if (chunk.type === 'entity_ref' && chunk.id >= 0) {
      const ref = entityMap.get(chunk.id)
      if (ref && ref.type === targetType && chunk.id !== entity.id) {
        return chunk.id
      }
    }
  }
  return null
}

// Surface types that can be referenced by faces
const SURFACE_TYPES = new Set([
  'plane', 'plane-surface',
  'cone', 'cone-surface',
  'cylinder', 'cylinder-surface',
  'sphere', 'sphere-surface',
  'torus', 'torus-surface',
  'spline', 'spline-surface'
])

// Curve types that can be referenced by edges
const CURVE_TYPES = new Set([
  'straight', 'straight-curve',
  'ellipse', 'ellipse-curve',
  'intcurve', 'intcurve-curve',
  'spline', 'spline-curve'
])

function parseACISFace(entity, entityMap, shellId) {
  const face = {
    type: 'face',
    id: entity.id,
    surface: null,
    loops: [],
    sense: true
  }

  // Find first loop reference and surface
  let firstLoopId = null
  for (const chunk of entity.data) {
    if (chunk.type === 'entity_ref' && chunk.id >= 0) {
      const ref = entityMap.get(chunk.id)
      if (ref) {
        if (ref.type === 'loop' && firstLoopId === null) {
          firstLoopId = chunk.id
        } else if (SURFACE_TYPES.has(ref.type)) {
          face.surface = parseACISSurface(ref, entityMap)
        }
      }
    } else if (chunk.type === 'bool') {
      // Sense is stored as boolean in some ACIS versions
      if (chunk.value !== undefined) {
        face.sense = chunk.value
      }
    } else if (chunk.type === 'ident' && (chunk.value === 'forward' || chunk.value === 'reversed')) {
      face.sense = chunk.value === 'forward'
    }
  }

  // Follow loop linked list
  const visitedLoops = new Set()
  let currentLoopId = firstLoopId

  while (currentLoopId !== null && currentLoopId >= 0 && !visitedLoops.has(currentLoopId)) {
    visitedLoops.add(currentLoopId)

    const loopEntity = entityMap.get(currentLoopId)
    if (!loopEntity || loopEntity.type !== 'loop') break

    const loop = parseACISLoop(loopEntity, entityMap, face.id)
    if (loop) face.loops.push(loop)

    // Find next loop
    currentLoopId = findNextInList(loopEntity, entityMap, 'loop', face.id)
  }

  return face
}

function parseACISLoop(entity, entityMap, faceId) {
  const loop = {
    type: 'loop',
    id: entity.id,
    coedges: []
  }

  // Find first coedge reference
  let firstCoedgeId = null
  for (const chunk of entity.data) {
    if (chunk.type === 'entity_ref' && chunk.id >= 0) {
      const ref = entityMap.get(chunk.id)
      if (ref && ref.type === 'coedge') {
        firstCoedgeId = chunk.id
        break
      }
    }
  }

  // Follow coedge linked list (coedges form a circular list within a loop)
  const visitedCoedges = new Set()
  let currentCoedgeId = firstCoedgeId

  while (currentCoedgeId !== null && currentCoedgeId >= 0 && !visitedCoedges.has(currentCoedgeId)) {
    visitedCoedges.add(currentCoedgeId)

    const coedgeEntity = entityMap.get(currentCoedgeId)
    if (!coedgeEntity || coedgeEntity.type !== 'coedge') break

    const coedge = parseACISCoedge(coedgeEntity, entityMap)
    if (coedge) loop.coedges.push(coedge)

    // Find next coedge (coedges typically have next-coedge as first coedge ref)
    currentCoedgeId = findNextCoedge(coedgeEntity, entityMap, firstCoedgeId)
  }

  return loop
}

// Helper to find next coedge in the circular list
function findNextCoedge(entity, entityMap, firstCoedgeId) {
  // Coedge structure: next-coedge, prev-coedge, partner, edge, loop
  // The first coedge ref is usually the next coedge
  for (const chunk of entity.data) {
    if (chunk.type === 'entity_ref' && chunk.id >= 0) {
      const ref = entityMap.get(chunk.id)
      if (ref && ref.type === 'coedge' && chunk.id !== entity.id) {
        // Return the next coedge, but stop if we've wrapped around
        if (chunk.id === firstCoedgeId) {
          return null  // Completed the loop
        }
        return chunk.id
      }
    }
  }
  return null
}

function parseACISCoedge(entity, entityMap) {
  const coedge = {
    type: 'coedge',
    id: entity.id,
    edge: null,
    sense: true
  }

  for (const chunk of entity.data) {
    if (chunk.type === 'entity_ref' && chunk.id >= 0) {
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
    if (chunk.type === 'entity_ref' && chunk.id >= 0) {
      const ref = entityMap.get(chunk.id)
      if (ref) {
        if (ref.type === 'vertex') {
          if (!edge.startVertex) {
            edge.startVertex = parseACISVertex(ref, entityMap)
          } else {
            edge.endVertex = parseACISVertex(ref, entityMap)
          }
        } else if (CURVE_TYPES.has(ref.type)) {
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

  // Normalize surface type (handle both "plane" and "plane-surface")
  const normalizedType = surfaceType.endsWith('-surface') ? surfaceType : surfaceType + '-surface'

  switch (normalizedType) {
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

  // Normalize curve type (handle both "straight" and "straight-curve")
  const normalizedType = curveType.endsWith('-curve') ? curveType : curveType + '-curve'

  switch (normalizedType) {
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
 * Find the start of ACIS binary data in an SMB/SMBH file
 * The file starts with "ASM BinaryFile" header, and actual data begins at first TAG_IDENT (0x0d)
 */
function findACISDataStart(buffer) {
  const view = new Uint8Array(buffer)
  const headerText = new TextDecoder().decode(view.slice(0, Math.min(512, view.length)))

  // Look for "ASM BinaryFile" header (modern ACIS binary format)
  if (headerText.startsWith('ASM BinaryFile') || headerText.startsWith('ASM ')) {
    // Find the first TAG_IDENT (0x0d) which starts the asmheader record
    for (let i = 0; i < Math.min(512, view.length - 10); i++) {
      if (view[i] === 0x0d) {
        // Check if next bytes look like a valid ident (length byte followed by ASCII letters)
        const len = view[i + 1]
        if (len > 0 && len < 64 && i + 2 + len <= view.length) {
          const possibleStr = new TextDecoder().decode(view.slice(i + 2, i + 2 + len))
          if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(possibleStr)) {
            return i
          }
        }
      }
    }
  }

  // Check for text-based ACIS format with "End-of-ACIS-data" marker
  const endMarker = headerText.indexOf('End-of-ACIS-data')
  if (endMarker > 0) {
    let offset = endMarker + 'End-of-ACIS-data'.length
    // Skip whitespace
    while (offset < view.length &&
      (view[offset] === 0x0A || view[offset] === 0x0D || view[offset] === 0x20)) {
      offset++
    }
    return offset
  }

  return 0
}

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

      // Find where the actual ACIS data starts
      const dataOffset = findACISDataStart(smbData)

      // Create properly offset buffer
      const binaryData = new Uint8Array(smbData, dataOffset)
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
