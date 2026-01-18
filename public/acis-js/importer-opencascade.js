/**
 * OpenCascade.js Integration for Inventor Loader
 * Replaces FreeCAD geometry operations with OpenCascade.js
 * Ported from importerFreeCAD.py
 */

// ============================================================================
// Group and Body Creation
// ============================================================================

/**
 * Create a group (compound) for organizing shapes
 * @param {object} oc - OpenCascade.js instance
 * @param {string} name - Group name
 * @returns {object} OpenCascade compound shape
 */
export function createGroup(oc, name) {
  const builder = new oc.BRep_Builder()
  const compound = new oc.TopoDS_Compound()
  builder.MakeCompound(compound)

  // Store name as metadata
  compound._name = name

  return compound
}

/**
 * Add a shape to a group (compound)
 * @param {object} oc - OpenCascade.js instance
 * @param {object} group - Target compound
 * @param {object} shape - Shape to add
 */
export function addToGroup(oc, group, shape) {
  const builder = new oc.BRep_Builder()
  builder.Add(group, shape)
}

/**
 * Create a body from a shape with optional transformation
 * @param {object} oc - OpenCascade.js instance
 * @param {object} shape - Source shape
 * @param {object} [transform] - Optional transformation
 * @returns {object} Transformed shape
 */
export function createBody(oc, shape, transform = null) {
  if (!transform) return shape

  // Apply transformation
  const trsf = new oc.gp_Trsf()

  if (transform.matrix) {
    // Set transformation from matrix
    const m = transform.matrix
    trsf.SetValues(
      m[0], m[1], m[2], m[3],
      m[4], m[5], m[6], m[7],
      m[8], m[9], m[10], m[11]
    )
  } else if (transform.translation || transform.rotation) {
    // Build transformation from components
    if (transform.translation) {
      const t = transform.translation
      trsf.SetTranslation(new oc.gp_Vec(t.x, t.y, t.z))
    }
    // Note: rotation would need additional handling
  }

  const transformer = new oc.BRepBuilderAPI_Transform(shape, trsf, false)
  return transformer.Shape()
}

// ============================================================================
// Material and Color Application
// ============================================================================

/**
 * Color/material data structure
 */
export class Material {
  constructor() {
    this.name = ''
    this.diffuse = { r: 0.8, g: 0.8, b: 0.8, a: 1.0 }
    this.ambient = { r: 0.2, g: 0.2, b: 0.2, a: 1.0 }
    this.specular = { r: 1.0, g: 1.0, b: 1.0, a: 1.0 }
    this.shininess = 0.5
  }
}

/**
 * Store of materials for shapes
 */
export const materialStore = new Map()

/**
 * Apply material to a shape (stores for later use)
 * @param {object} shape - Target shape
 * @param {Material} material - Material to apply
 */
export function applyMaterial(shape, material) {
  materialStore.set(shape, material)
}

/**
 * Get material for a shape
 * @param {object} shape - Source shape
 * @returns {Material|null} Material or null
 */
export function getMaterial(shape) {
  return materialStore.get(shape) || null
}

// ============================================================================
// Geometry Conversion Utilities
// ============================================================================

/**
 * Convert Inventor point to OpenCascade gp_Pnt
 * @param {object} oc - OpenCascade.js instance
 * @param {{x: number, y: number, z: number}} p - Point
 * @param {number} [scale=10.0] - Scale factor (Inventor uses cm, OCC uses mm)
 * @returns {object} gp_Pnt
 */
export function toPoint(oc, p, scale = 10.0) {
  return new oc.gp_Pnt(p.x * scale, p.y * scale, p.z * scale)
}

/**
 * Convert Inventor vector to OpenCascade gp_Vec
 * @param {object} oc - OpenCascade.js instance
 * @param {{x: number, y: number, z: number}} v - Vector
 * @param {number} [scale=1.0] - Scale factor
 * @returns {object} gp_Vec
 */
export function toVector(oc, v, scale = 1.0) {
  return new oc.gp_Vec(v.x * scale, v.y * scale, v.z * scale)
}

/**
 * Convert Inventor direction to OpenCascade gp_Dir
 * @param {object} oc - OpenCascade.js instance
 * @param {{x: number, y: number, z: number}} d - Direction
 * @returns {object} gp_Dir
 */
export function toDirection(oc, d) {
  return new oc.gp_Dir(d.x, d.y, d.z)
}

/**
 * Create axis from point and direction
 * @param {object} oc - OpenCascade.js instance
 * @param {{x: number, y: number, z: number}} point - Point
 * @param {{x: number, y: number, z: number}} dir - Direction
 * @returns {object} gp_Ax1
 */
export function toAxis(oc, point, dir) {
  return new oc.gp_Ax1(toPoint(oc, point), toDirection(oc, dir))
}

/**
 * Create coordinate system from point and two directions
 * @param {object} oc - OpenCascade.js instance
 * @param {{x: number, y: number, z: number}} point - Origin
 * @param {{x: number, y: number, z: number}} normal - Z direction
 * @param {{x: number, y: number, z: number}} xDir - X direction
 * @returns {object} gp_Ax2
 */
export function toAxis2(oc, point, normal, xDir) {
  return new oc.gp_Ax2(toPoint(oc, point), toDirection(oc, normal), toDirection(oc, xDir))
}

// ============================================================================
// Shape Building Functions
// ============================================================================

/**
 * Create a line edge
 * @param {object} oc - OpenCascade.js instance
 * @param {{x: number, y: number, z: number}} p1 - Start point
 * @param {{x: number, y: number, z: number}} p2 - End point
 * @returns {object} TopoDS_Edge
 */
export function makeLine(oc, p1, p2) {
  const pnt1 = toPoint(oc, p1)
  const pnt2 = toPoint(oc, p2)
  const edge = new oc.BRepBuilderAPI_MakeEdge_3(pnt1, pnt2)
  return edge.Edge()
}

/**
 * Create a circle edge
 * @param {object} oc - OpenCascade.js instance
 * @param {{x: number, y: number, z: number}} center - Center point
 * @param {{x: number, y: number, z: number}} normal - Axis direction
 * @param {number} radius - Radius
 * @returns {object} TopoDS_Edge
 */
export function makeCircle(oc, center, normal, radius) {
  const ax2 = new oc.gp_Ax2(toPoint(oc, center), toDirection(oc, normal))
  const circle = new oc.gp_Circ(ax2, radius)
  const edge = new oc.BRepBuilderAPI_MakeEdge_8(circle)
  return edge.Edge()
}

/**
 * Create an arc edge
 * @param {object} oc - OpenCascade.js instance
 * @param {{x: number, y: number, z: number}} center - Center point
 * @param {{x: number, y: number, z: number}} normal - Axis direction
 * @param {number} radius - Radius
 * @param {number} startAngle - Start angle in radians
 * @param {number} endAngle - End angle in radians
 * @returns {object} TopoDS_Edge
 */
export function makeArc(oc, center, normal, radius, startAngle, endAngle) {
  const ax2 = new oc.gp_Ax2(toPoint(oc, center), toDirection(oc, normal))
  const circle = new oc.gp_Circ(ax2, radius)
  const edge = new oc.BRepBuilderAPI_MakeEdge_9(circle, startAngle, endAngle)
  return edge.Edge()
}

/**
 * Create a wire from edges
 * @param {object} oc - OpenCascade.js instance
 * @param {object[]} edges - Array of edges
 * @returns {object} TopoDS_Wire
 */
export function makeWire(oc, edges) {
  const wireBuilder = new oc.BRepBuilderAPI_MakeWire()
  for (const edge of edges) {
    wireBuilder.Add_1(edge)
  }
  return wireBuilder.Wire()
}

/**
 * Create a face from a wire
 * @param {object} oc - OpenCascade.js instance
 * @param {object} wire - Outer wire
 * @param {object[]} [innerWires] - Inner wires (holes)
 * @returns {object} TopoDS_Face
 */
export function makeFace(oc, wire, innerWires = []) {
  const faceBuilder = new oc.BRepBuilderAPI_MakeFace_15(wire, true)
  for (const innerWire of innerWires) {
    faceBuilder.Add(innerWire)
  }
  return faceBuilder.Face()
}

/**
 * Create a solid by extruding a face
 * @param {object} oc - OpenCascade.js instance
 * @param {object} face - Base face
 * @param {{x: number, y: number, z: number}} direction - Extrusion direction
 * @param {number} distance - Extrusion distance
 * @returns {object} TopoDS_Shape
 */
export function makeExtrusion(oc, face, direction, distance) {
  const vec = new oc.gp_Vec(direction.x * distance, direction.y * distance, direction.z * distance)
  const prism = new oc.BRepPrimAPI_MakePrism_1(face, vec, false, true)
  return prism.Shape()
}

/**
 * Create a solid by revolving a face
 * @param {object} oc - OpenCascade.js instance
 * @param {object} face - Base face
 * @param {{x: number, y: number, z: number}} axisPoint - Point on axis
 * @param {{x: number, y: number, z: number}} axisDir - Axis direction
 * @param {number} angle - Revolution angle in radians
 * @returns {object} TopoDS_Shape
 */
export function makeRevolution(oc, face, axisPoint, axisDir, angle) {
  const axis = toAxis(oc, axisPoint, axisDir)
  const revol = new oc.BRepPrimAPI_MakeRevol_1(face, axis, angle, true)
  return revol.Shape()
}

// ============================================================================
// Boolean Operations
// ============================================================================

/**
 * Perform boolean union
 * @param {object} oc - OpenCascade.js instance
 * @param {object} shape1 - First shape
 * @param {object} shape2 - Second shape
 * @returns {object} Result shape
 */
export function booleanUnion(oc, shape1, shape2) {
  const fuse = new oc.BRepAlgoAPI_Fuse_3(shape1, shape2)
  return fuse.Shape()
}

/**
 * Perform boolean subtraction (cut)
 * @param {object} oc - OpenCascade.js instance
 * @param {object} shape1 - Shape to cut from
 * @param {object} shape2 - Shape to cut with
 * @returns {object} Result shape
 */
export function booleanCut(oc, shape1, shape2) {
  const cut = new oc.BRepAlgoAPI_Cut_3(shape1, shape2)
  return cut.Shape()
}

/**
 * Perform boolean intersection
 * @param {object} oc - OpenCascade.js instance
 * @param {object} shape1 - First shape
 * @param {object} shape2 - Second shape
 * @returns {object} Result shape
 */
export function booleanIntersection(oc, shape1, shape2) {
  const common = new oc.BRepAlgoAPI_Common_3(shape1, shape2)
  return common.Shape()
}

// ============================================================================
// Mesh Generation
// ============================================================================

/**
 * Generate mesh from shape
 * @param {object} oc - OpenCascade.js instance
 * @param {object} shape - Shape to mesh
 * @param {number} [linearDeflection=0.1] - Linear deflection
 * @param {number} [angularDeflection=0.5] - Angular deflection
 * @returns {{vertices: Float32Array, indices: Uint32Array, normals: Float32Array}}
 */
export function generateMesh(oc, shape, linearDeflection = 0.1, angularDeflection = 0.5) {
  // Perform meshing
  new oc.BRepMesh_IncrementalMesh_2(shape, linearDeflection, false, angularDeflection, false)

  const vertices = []
  const indices = []
  const normals = []

  // Extract triangulation from faces
  const explorer = new oc.TopExp_Explorer_2(shape, oc.TopAbs_ShapeEnum.TopAbs_FACE, oc.TopAbs_ShapeEnum.TopAbs_SHAPE)

  let indexOffset = 0
  while (explorer.More()) {
    const face = oc.TopoDS.Face_1(explorer.Current())
    const location = new oc.TopLoc_Location_1()
    const triangulation = oc.BRep_Tool.Triangulation(face, location)

    if (!triangulation.IsNull()) {
      const transformation = location.Transformation()

      // Get vertices
      const numNodes = triangulation.NbNodes()
      for (let i = 1; i <= numNodes; i++) {
        const p = triangulation.Node(i).Transformed(transformation)
        vertices.push(p.X(), p.Y(), p.Z())
      }

      // Get triangles
      const numTriangles = triangulation.NbTriangles()
      for (let i = 1; i <= numTriangles; i++) {
        const tri = triangulation.Triangle(i)
        const n1 = tri.Value(1) - 1 + indexOffset
        const n2 = tri.Value(2) - 1 + indexOffset
        const n3 = tri.Value(3) - 1 + indexOffset

        // Check face orientation
        const orientation = face.Orientation_1()
        if (orientation === oc.TopAbs_Orientation.TopAbs_REVERSED) {
          indices.push(n1, n3, n2)
        } else {
          indices.push(n1, n2, n3)
        }
      }

      // Calculate normals (simplified - per vertex)
      if (triangulation.HasNormals()) {
        for (let i = 1; i <= numNodes; i++) {
          const n = triangulation.Normal(i)
          normals.push(n.X(), n.Y(), n.Z())
        }
      } else {
        // Generate flat normals
        for (let i = 1; i <= numNodes; i++) {
          normals.push(0, 0, 1) // Placeholder
        }
      }

      indexOffset += numNodes
    }

    explorer.Next()
  }

  return {
    vertices: new Float32Array(vertices),
    indices: new Uint32Array(indices),
    normals: new Float32Array(normals)
  }
}

// ============================================================================
// Export Functions
// ============================================================================

/**
 * Export shape to STEP format
 * @param {object} oc - OpenCascade.js instance
 * @param {object} shape - Shape to export
 * @param {string} [filename='output.step'] - Output filename
 * @returns {string} STEP file content
 */
export function exportSTEP(oc, shape, filename = 'output.step') {
  const writer = new oc.STEPControl_Writer_1()
  writer.Transfer(shape, oc.STEPControl_StepModelType.STEPControl_AsIs, true)

  // Write to virtual file
  const fs = oc.FS
  writer.Write(filename)

  // Read file content
  const content = fs.readFile(filename, { encoding: 'utf8' })
  fs.unlink(filename)

  return content
}

/**
 * Export shape to BREP format
 * @param {object} oc - OpenCascade.js instance
 * @param {object} shape - Shape to export
 * @param {string} [filename='output.brep'] - Output filename
 * @returns {string} BREP file content
 */
export function exportBREP(oc, shape, filename = 'output.brep') {
  const fs = oc.FS
  oc.BRepTools.Write_2(shape, filename)

  const content = fs.readFile(filename, { encoding: 'utf8' })
  fs.unlink(filename)

  return content
}

// ============================================================================
// Default Export
// ============================================================================

export default {
  // Group/Body creation
  createGroup,
  addToGroup,
  createBody,

  // Materials
  Material,
  materialStore,
  applyMaterial,
  getMaterial,

  // Geometry conversion
  toPoint,
  toVector,
  toDirection,
  toAxis,
  toAxis2,

  // Shape building
  makeLine,
  makeCircle,
  makeArc,
  makeWire,
  makeFace,
  makeExtrusion,
  makeRevolution,

  // Boolean operations
  booleanUnion,
  booleanCut,
  booleanIntersection,

  // Meshing
  generateMesh,

  // Export
  exportSTEP,
  exportBREP
}
