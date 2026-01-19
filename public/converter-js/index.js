/**
 * Converter Module Entry Point
 * STL/3MF/F3D to STEP/STL conversion utilities
 */

// Configuration
export * from './config.js'

// Mesh utilities
export * from './mesh-utils.js'

// Mesh analysis (spatial hashing, intersection detection)
export * from './mesh-analysis.js'

// JavaScript-level mesh repair
export * from './mesh-repair.js'

// Format parsers (3MF, STL)
export * from './format-parsers.js'

// OpenCascade initialization
export * from './oc-init.js'

// OpenCascade repair functions
export * from './oc-repair.js'

// OpenCascade I/O (read/write, analysis)
export * from './oc-io.js'

// Default export with commonly used functions
import { LARGE_MESH_THRESHOLD, VERY_LARGE_MESH_THRESHOLD } from './config.js'
import { repairMeshData } from './mesh-repair.js'
import { parse3MF, meshToStl, parseStlBinary, loadJSZip } from './format-parsers.js'
import { initOpenCascade } from './oc-init.js'
import { processShape, mergeFaces, repairMesh } from './oc-repair.js'
import { analyzeMesh, readStl, writeOutput } from './oc-io.js'
import {
  edgeKey,
  buildEdgeMap,
  harmonizeNormals,
  detectNonManifolds,
  removeNonManifolds,
  findBoundaryEdges,
  groupBoundaryEdgesIntoLoops,
  fillHoles,
  triangulateHole
} from './mesh-utils.js'
import {
  computeOptimalCellSize,
  detectSelfIntersections
} from './mesh-analysis.js'

export default {
  // Config
  LARGE_MESH_THRESHOLD,
  VERY_LARGE_MESH_THRESHOLD,

  // Mesh utilities
  edgeKey,
  buildEdgeMap,
  harmonizeNormals,
  detectNonManifolds,
  removeNonManifolds,
  findBoundaryEdges,
  groupBoundaryEdgesIntoLoops,
  fillHoles,
  triangulateHole,

  // Mesh analysis
  computeOptimalCellSize,
  detectSelfIntersections,

  // Mesh repair
  repairMeshData,

  // Format parsers
  parse3MF,
  meshToStl,
  parseStlBinary,
  loadJSZip,

  // OpenCascade
  initOpenCascade,
  processShape,
  mergeFaces,
  repairMesh,
  analyzeMesh,
  readStl,
  writeOutput
}
