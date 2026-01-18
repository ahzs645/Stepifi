/**
 * Inventor Loader Segment Reader
 * Base segment reader infrastructure
 * Ported from importerSegment.py
 */

import {
  getUInt8A,
  getUInt16,
  getUInt32,
  getFloat64A,
  getBoolean,
  getLen32Text8,
  getFileVersion,
  setFileVersion,
  getBlockSize,
  reshape
} from './importer-utils.js'

import {
  REF_CHILD,
  REF_CROSS
} from './importer-constants.js'

import {
  DataNode,
  Segment,
  PointEdge,
  LineEdge,
  ArcOfCircleEdge,
  ArcOfEllipseEdge,
  BSplineEdge,
  BezierEdge
} from './importer-classes.js'

import { Transformation2D, Transformation3D } from './importer-transformation.js'
import { SecNode, SecNodeRef, CheckList, _TYP_NODE_REF_ } from './importer-seg-node.js'

// ============================================================================
// Branch Node Type Mapping
// ============================================================================

const BRANCH_NODES = {
  'Parameter': 'ParameterNode',
  'ParameterText': 'ParameterTextNode',
  'Boolean': 'ValueNode',
  'RotateClockwise': 'ValueNode',
  'Enum': 'EnumNode',
  'Feature': 'FeatureNode',
  'Point2D': 'PointNode',
  'Point3D': 'PointNode',
  'Line2D': 'LineNode',
  'Line3D': 'LineNode',
  'Arc2D': 'CircleNode',
  'Circle2D': 'CircleNode',
  'Circle3D': 'CircleNode',
  'BodyCollection': 'ObjectCollectionNode',
  'ObjectCollection': 'ObjectCollectionNode',
  'DirectionAxis': 'DirectionNode',
  'DirectionEdge': 'DirectionNode',
  'DirectionFace': 'DirectionNode',
  'DirectionPath': 'DirectionNode',
  'SketchBlock': 'SketchNode',
  'Sketch2D': 'SketchNode',
  'Sketch3D': 'SketchNode'
}

// ============================================================================
// Utility Functions
// ============================================================================

function getBranchNode(data) {
  // Create appropriate node type based on typeName
  data.node = new DataNode(data)
}

function buildBranch(parent, data, level, ref) {
  parent.append(data.node)

  if (!data.analysed) {
    data.analysed = true
    for (const childRef of data.references) {
      if (!childRef.analysed) {
        childRef.analysed = true
        const child = childRef._data
        if (child !== null) {
          if (childRef.type === REF_CHILD) {
            buildBranch(data.node, child, level + 1, childRef)
          } else if (childRef.type === REF_CROSS) {
            const node = childRef.node
            if (node !== null) {
              parent.append(childRef.node)
            }
          }
        }
      }
    }
  }
}

function resolveReferences(nodes) {
  for (const node of Object.values(nodes)) {
    getBranchNode(node)
    node.handled = false
    node.sketchIndex = null
    node.parent = null

    for (const ref of node.references) {
      if (ref.index in nodes) {
        ref._data = nodes[ref.index]
        if (ref.type === REF_CROSS && node.parent === null) {
          const parentData = nodes[ref.index]
          if (parentData) {
            node.parent = parentData
          }
        }
      }
    }
  }
}

function resolveParentNodes(nodes) {
  for (const parent of Object.values(nodes)) {
    for (const ref of parent.references) {
      const child = ref._data
      if (child !== null) {
        if (ref.index > parent.index) {
          if (ref.type === REF_CHILD) {
            if (child.parent === null) {
              child.parent = parent
            } else {
              ref.type = REF_CROSS
            }
          }
        }
      }
    }
  }
}

function buildTree(nodes) {
  // Link the node's references with the corresponding nodes
  resolveReferences(nodes)

  // Set the parent property for each node
  resolveParentNodes(nodes)

  // Now the tree can be built
  const roots = new DataNode(null)
  for (const node of Object.values(nodes)) {
    if (node.parent === null) {
      buildBranch(roots, node, 0, null)
    }
  }
  return roots
}

function readTypedFloatArr(data, offset, size = 1) {
  const [n, i] = getUInt32(data, offset)
  const [a, j] = getUInt32A(data, i, 2)
  const [b, k] = getFloat64A(data, j, n * size)

  return [
    [a, size > 1 ? reshape(b, size) : b],
    k
  ]
}

function getNodeUID(index, seg) {
  if (!(index in seg.secBlkTyps)) {
    throw new Error(`Index ${index.toString(16)} not defined in segment's section block types!`)
  }
  const blockType = seg.secBlkTyps[index]
  return blockType.uid
}

// ============================================================================
// SegmentReader Class
// ============================================================================

export class SegmentReader {
  constructor(segment) {
    this.segment = segment
    this.version = segment.segment ? segment.segment.version.major : 2020
    if (this.version > 11) this.version += 1996
    setFileVersion(this.version)
    this.nodeCounter = 0
  }

  postRead() {
    for (const node of Object.values(this.segment.elementNodes)) {
      node.data = null
    }
  }

  ReadNodeRef(node, offset, number, type, name) {
    const [m, i] = getUInt32(node.data, offset)
    const ref = new SecNodeRef(m, type, name)
    if (ref.index > 0) {
      ref.number = number
      node.references.push(ref)
    }
    return [ref.index > 0 ? ref : null, i]
  }

  ReadNodeRefs(node, offset, name, type) {
    const [n, i] = getUInt32(node.data, offset)
    const lst = []
    let j = i
    for (let k = 0; k < n; k++) {
      const [ref, newJ] = this.ReadNodeRef(node, j, k, type, name)
      j = newJ
      if (ref !== null) {
        lst.push(ref)
      }
    }
    node.set(name, lst)
    return j
  }

  ReadTransformation2D(node, offset) {
    const val = new Transformation2D()
    const i = val.read(node.data, offset)
    node.set('transformation', val)
    return i
  }

  ReadTransformation3D(node, offset, name = 'transformation') {
    const val = new Transformation3D()
    const i = val.read(node.data, offset)
    node.set(name, val)
    return i
  }

  ReadEdge(node, offset) {
    let i = offset
    const [n] = getUInt16(node.data, i)
    if (n !== 0) {
      i = offset
    }
    let [t, newI] = getUInt32(node.data, i)
    i = newI

    if (t === 0x0203) {
      [t, i] = getUInt32(node.data, i)
    }

    let a
    switch (t) {
      case 0x05: // Point
        [a, i] = getFloat64A(node.data, i, 3)
        return [new PointEdge(a), i]

      case 0x0B: // Circle
        [a, i] = getFloat64A(node.data, i, 12)
        return [new ArcOfCircleEdge(a), i]

      case 0x13: // Line
      case 0x17:
        [a, i] = getFloat64A(node.data, i, 6)
        return [new LineEdge(a), i]

      case 0x11: // Ellipse
        [a, i] = getFloat64A(node.data, i, 13)
        return [new ArcOfEllipseEdge(a), i]

      case 0x28: // Bezier
        [a, i] = getUInt32A(node.data, i, 3)
        const b = []
        for (let j = 0; j < a[0]; j++) {
          const [c, newI] = getFloat64A(node.data, i, 3)
          i = newI
          b.push(c)
        }
        return [new BezierEdge(a, b), i]

      case 0x2A: // BSpline
        // Read BSpline data structure
        const view = new DataView(node.data.buffer, node.data.byteOffset, node.data.byteLength)
        const a0 = [
          view.getUint32(i, true),
          view.getUint32(i + 4, true),
          view.getUint32(i + 8, true),
          view.getFloat64(i + 12, true)
        ]
        i += 20

        const [a1, i1] = readTypedFloatArr(node.data, i)
        const [a2, i2] = readTypedFloatArr(node.data, i1)
        const [a3, i3] = readTypedFloatArr(node.data, i2, 3)
        const a4 = [
          view.getFloat64(i3, true),
          view.getUint32(i3 + 8, true),
          view.getUint32(i3 + 12, true),
          view.getFloat64(i3 + 16, true),
          view.getFloat64(i3 + 24, true)
        ]
        i = i3 + 32
        return [new BSplineEdge(a0, a1, a2, a3, a4), i]

      default:
        throw new Error(`Unknown edge type 0x${t.toString(16)} in node ${node.typeName}`)
    }
  }

  ReadEdgeList(node, offset) {
    const [cnt, i] = getUInt32(node.data, offset)
    const lst = []
    let j = i

    for (let k = 0; k < cnt; k++) {
      const [edge, newJ] = this.ReadEdge(node, j)
      j = newJ
      lst.push(edge)
    }

    node.set('edges', lst)
    return j
  }

  skipBlockSize(offset, l = 1) {
    return offset + l * getBlockSize()
  }

  HandleBlock(node) {
    let i = 0
    try {
      const readType = this[`Read_${node.typeName}`]
      if (readType) {
        i = readType.call(this, node)
      }
    } catch (e) {
      console.warn(`Error reading node ${node.typeName}:`, e.message)
    }

    node.data = node.data.slice(i)
  }

  ReadBlock(data, offset, size) {
    this.nodeCounter++
    const node = new SecNode()
    node.index = this.nodeCounter
    node.size = size
    node.offset = offset
    node.reader = this
    node.segment = this.segment

    this.segment.elementNodes[node.index] = node

    // Set node's data
    const [n, i] = getUInt32(data, offset)
    node.uid = getNodeUID(n & 0xFF, this.segment)
    node.typeName = node.uid.timeLow.toString(16).padStart(8, '0').toUpperCase()
    node.data = data.slice(i, i + size)

    this.HandleBlock(node)
    return node
  }

  ReadTrailer(buffer, offset) {
    let i = offset
    if (this.version > 2014) {
      const [trailing, newI] = getBoolean(buffer, i)
      i = newI
      if (trailing) {
        const [n, j] = getUInt32(buffer, i)
        i = j
        if ((n & 0x80000000) === 0) {
          for (let k = 0; k < n; k++) {
            const [txt, newI] = getLen32Text8(buffer, i)
            i = newI
            const [u32_1, j2] = getUInt32(buffer, i)
            i = j2

            // Skip variant data based on type
            if (u32_1 === 0b0001) {
              i += 3
            } else if (u32_1 === 0b0011 || u32_1 === 0b0111) {
              i += 4
            } else if (u32_1 === 0b1000 || u32_1 === 0b1010) {
              i += 6
            } else if (u32_1 === 0b1011) {
              i += 10
            } else if (u32_1 === 0b1110) {
              const [typ] = getUInt16(buffer, i)
              i += 2
              const [cnt] = getUInt32(buffer, i)
              i += 4
              i += cnt
            }
          }
          i = CheckList(buffer, i, 0x0006)
          const [cnt, j3] = getUInt32(buffer, i)
          i = j3
          if (cnt > 0) {
            i += 8 // Skip arr32
            for (let k = 0; k < cnt; k++) {
              const [txt, newI] = getLen32Text8(buffer, i)
              i = newI
              i += 4 // Skip m
            }
          }
        }
      }
    }
    return i
  }

  ReadSegmentData(buffer) {
    this.nodeCounter = 0
    this.segment.elementNodes = {}
    this.segment.indexNodes = {}
    this.segment.AcisList = []

    let i = 0

    for (const sec of this.segment.sec1) {
      if (sec.flags === 1) {
        const start = i
        const data = this.ReadBlock(buffer, i, sec.length)
        i += data.size + 4

        const [l, newI] = getUInt32(buffer, i)
        i = newI
        i = this.ReadTrailer(buffer, i)

        if (l !== 0 && sec.length !== l) {
          console.warn(`Block size mismatch: expected ${sec.length}, got ${l}`)
        }
      }
    }

    this.segment.tree = buildTree(this.segment.elementNodes)
    this.postRead()
  }
}

// ============================================================================
// Default Export
// ============================================================================

export default {
  SegmentReader,
  buildTree,
  resolveReferences,
  resolveParentNodes,
  getBranchNode,
  buildBranch
}
