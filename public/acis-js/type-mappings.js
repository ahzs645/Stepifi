/**
 * ACIS Type Mappings
 * Maps record names to entity classes
 * Ported from Acis.py lines 5488-5710
 */

// Import all entity classes
import {
  Entity, Transform, Wcs, T, EyeRefinement, VertexTemplate,
  Annotation, AnnotationPrimitive, AnnotationSplit, AnnotationTol,
  AnnotationTolCreate, AnnotationTolRevert,
  Point, Refinement, RhEntity, RhEntityRhMaterial, AsmHeader
} from './entity.js'

import {
  Body, Lump, Shell, SubShell, Face, Loop, Wire,
  CoEdge, CoEdgeTolerance, Edge, EdgeTolerance,
  Vertex, VertexTolerance,
  Cell, Cell3d, CFace, CShell
} from './topology.js'

import {
  Curve, CurveStraight, CurveEllipse, CurveDegenerate, CurveComp,
  CurveInt, CurveIntInt, CurveP
} from './curves.js'

import {
  Surface, SurfacePlane, SurfaceCone, SurfaceSphere, SurfaceTorus,
  SurfaceMesh, SurfaceSpline
} from './surfaces.js'

import {
  Attrib, Attributes,
  AttribADesk, AttribADeskColor, AttribADeskMaterial, AttribADeskTrueColor,
  AttribAnsoft, AttribAnsoftId, AttribAnsoftProperties,
  AttribBt, AttribBtEntityColor,
  AttribGen, AttribGenName, AttribGenNameInt32, AttribGenNameInt64,
  AttribGenNameString, AttribGenNameReal, AttribGenNameVector,
  AttribSt, AttribStNoMerge, AttribStNoCombine, AttribStRgbColor, AttribStDisplay, AttribStId,
  AttribSys, AttribSysConvexity, AttribSysAnnotationAttrib, AttribSysStichHint, AttribSysTag, AttribSysVertedge,
  AttribTsl, AttribTslId, AttribTslColour,
  AttribAtUfld, AttribAtUfldDefmData, AttribAtUfldDevPair, AttribAtUfldFlatBend,
  AttribAtUfldFfldPosTransf, AttribAtUfldFfldPosTransfMixUfContourRollTrack, AttribAtUfldFfldPosTransfMixUfTransformTrack,
  AttribAtUfldNonMergeBend, AttribAtUfldPosTrack, AttribAtUfldPosTrackMixUfRobustPositionTrack, AttribAtUfldPosTrackSurfSimp,
  AttribAcadSolidHistoryPersubent,
  AttribCwkBase, AttribCwkBaseCswDbid,
  AttribCustom,
  AttribDesigner, AttribDesignerHistory, AttribDesignerSurfaceId, AttribDesignerOwnerTag,
  AttribDxid,
  AttribEye, AttribEyeFMesh, AttribEyePtList, AttribEyeRefVt,
  AttribFdi, AttribFdiLabel,
  AttribKcId,
  AttribLwd, AttribLwdFMesh, AttribLwdPtList, AttribLwdRefVT,
  AttribMixOrganization,
  AttribNamingMatching, AttribNamingMatchingNMxBrepTag, AttribNamingMatchingNMxBrepTagFeature, AttribNamingMatchingNMxBrepTagName,
  AttribRBase, AttribRBaseRender,
  AttribRfBase, AttribRfBaseFaceTracker,
  AttribSg, AttribSgPidName,
  AttribSnl, AttribSnlCubitOwner,
  AttribCt, AttribCtCellPtr, AttribCtCFace
} from './attributes.js'

import {
  BeginOfAcisHistoryData, EndOfAcisHistorySection, EndOfAcisData, DeltaState
} from './reader.js'

// ============================================================================
// Record Name to Entity Class Mapping
// ============================================================================

export const RECORD_2_ENTITY = {
  // Annotations
  'annotation': Annotation,
  'primitive_annotation-annotation': AnnotationPrimitive,
  'split_annotation-annotation': AnnotationSplit,
  'tol_annotation-annotation': AnnotationTol,
  'create_tol_anno-tol_annotation-annotation': AnnotationTolCreate,
  'revert_tol_anno-tol_annotation-annotation': AnnotationTolRevert,

  // ASM Header
  'asmheader': AsmHeader,

  // Attributes - base
  'attrib': Attrib,

  // Attributes - ADesk
  'adesk-attrib': AttribADesk,
  'color-adesk-attrib': AttribADeskColor,
  'material-adesk-attrib': AttribADeskMaterial,
  'truecolor-adesk-attrib': AttribADeskTrueColor,

  // Attributes - Ansoft
  'ansoft-attrib': AttribAnsoft,
  'id-ansoft-attrib': AttribAnsoftId,
  'properties-ansoft-attrib': AttribAnsoftProperties,

  // Attributes - At Ufld
  'at_ufld-attrib': AttribAtUfld,
  'ufld_defm_data_attrib-at_ufld-attrib': AttribAtUfldDefmData,
  'ufld_dev_pair_attrib-at_ufld-attrib': AttribAtUfldDevPair,
  'ufld_flat_bend_attrib-at_ufld-attrib': AttribAtUfldFlatBend,
  'ufld_pos_transf_attrib-at_ufld-attrib': AttribAtUfldFfldPosTransf,
  'mix_UF_ContourRoll_Track-ufld_pos_transf_attrib-at_ufld-attrib': AttribAtUfldFfldPosTransfMixUfContourRollTrack,
  'mix_UF_Transform_Track-ufld_pos_transf_attrib-at_ufld-attrib': AttribAtUfldFfldPosTransfMixUfTransformTrack,
  'ufld_non_merge_bend_attrib-at_ufld-attrib': AttribAtUfldNonMergeBend,
  'ufld_pos_track_attrib-at_ufld-attrib': AttribAtUfldPosTrack,
  'mix_UF_RobustPositionTrack-ufld_pos_track_attrib-at_ufld-attrib': AttribAtUfldPosTrackMixUfRobustPositionTrack,
  'ufld_surf_simp_attrib-ufld_pos_track_attrib-at_ufld-attrib': AttribAtUfldPosTrackSurfSimp,
  'persubent-acadSolidHistory-attrib': AttribAcadSolidHistoryPersubent,

  // Attributes - BT
  'bt-attrib': AttribBt,
  'entatt_color-bt-attrib': AttribBtEntityColor,

  // Attributes - CWK
  'cwkbase-attrib': AttribCwkBase,
  'cwkdbid-cwkbase-attrib': AttribCwkBaseCswDbid,

  // Attributes - Custom/Designer
  'ATTRIB_CUSTOM-attrib': AttribCustom,
  'Designer-attrib': AttribDesigner,
  'history-Designer-attrib': AttribDesignerHistory,
  'SURFACE_ID-Designer-attrib': AttribDesignerSurfaceId,
  'OWNER_TAG-Designer-attrib': AttribDesignerOwnerTag,
  'DXID-attrib': AttribDxid,

  // Attributes - Eye
  'eye-attrib': AttribEye,
  'fmesh-eye-attrib': AttribEyeFMesh,
  'ptlist-eye-attrib': AttribEyePtList,
  'ref_vt-eye-attrib': AttribEyeRefVt,

  // Attributes - FDI
  'fdi-attrib': AttribFdi,
  'label-fdi-attrib': AttribFdiLabel,

  // Attributes - Gen
  'gen-attrib': AttribGen,
  'name_attrib-gen-attrib': AttribGenName,
  'integer_attrib-name_attrib-gen-attrib': AttribGenNameInt32,
  'int64_attrib-name_attrib-gen-attrib': AttribGenNameInt64,
  'string_attrib-name_attrib-gen-attrib': AttribGenNameString,
  'real_attrib-name_attrib-gen-attrib': AttribGenNameReal,
  'vector_attrib-name_attrib-gen-attrib': AttribGenNameVector,

  // Attributes - KC
  'kc_id-attrib': AttribKcId,

  // Attributes - LWD
  'lwd-attrib': AttribLwd,
  'fmesh-lwd-attrib': AttribLwdFMesh,
  'ptlist-lwd-attrib': AttribLwdPtList,
  'ref_vt-lwd-attrib': AttribLwdRefVT,

  // Attributes - Mix Organization
  'mix_Organizaion-attrib': AttribMixOrganization,

  // Attributes - Naming/Matching
  'NamingMatching-attrib': AttribNamingMatching,
  'NMx_Brep_tag-NamingMatching-attrib': AttribNamingMatchingNMxBrepTag,
  'NMx_Brep_Feature_tag-NMx_Brep_tag-NamingMatching-attrib': AttribNamingMatchingNMxBrepTagFeature,
  'NMx_Brep_Name_tag-NMx_Brep_tag-NamingMatching-attrib': AttribNamingMatchingNMxBrepTagName,

  // Attributes - RBase
  'render-rbase-attrib': AttribRBaseRender,
  'RFbase-attrib': AttribRfBase,
  'RFFaceTracker-RFbase-attrib': AttribRfBaseFaceTracker,

  // Attributes - SG
  'sg-attrib': AttribSg,
  'pid_name-sg-attrib': AttribSgPidName,

  // Attributes - SNL
  'snl-attrib': AttribSnl,
  'cubit_owner-snl-attrib': AttribSnlCubitOwner,

  // Attributes - ST
  'st-attrib': AttribSt,
  'no_merge_attribute-st-attrib': AttribStNoMerge,
  'no_combine_attribute-st-attrib': AttribStNoCombine,
  'rgb_color-st-attrib': AttribStRgbColor,
  'display_attribute-st-attrib': AttribStDisplay,
  'id_attribute-st-attrib': AttribStId,

  // Attributes - Sys
  'sys-attrib': AttribSys,
  'convexity-sys-attrib': AttribSysConvexity,
  'attrib_annotation-sys-attrib': AttribSysAnnotationAttrib,
  'stitch_hint-sys-attrib': AttribSysStichHint,
  'tag-sys-attrib': AttribSysTag,
  'vertedge-sys-attrib': AttribSysVertedge,

  // Attributes - TSL
  'tsl-attrib': AttribTsl,
  'id-tsl-attrib': AttribTslId,
  'colour-tsl-attrib': AttribTslColour,

  // Attributes - CT (cellular)
  'ct-attrib': AttribCt,
  'cell_ptr-ct-attrib': AttribCtCellPtr,
  'cface_ptr-ct-attrib': AttribCtCFace,

  // History
  'Begin-of-ACIS-History-Data': BeginOfAcisHistoryData,
  'delta_state': DeltaState,
  'End-of-ACIS-data': EndOfAcisData,
  'End-of-ACIS-History-Section': EndOfAcisHistorySection,

  // Topology
  'body': Body,
  'lump': Lump,
  'shell': Shell,
  'subshell': SubShell,
  'face': Face,
  'loop': Loop,
  'wire': Wire,
  'coedge': CoEdge,
  'tcoedge-coedge': CoEdgeTolerance,
  'edge': Edge,
  'tedge-edge': EdgeTolerance,
  'vertex': Vertex,
  'tvertex-vertex': VertexTolerance,

  // Curves
  'curve': Curve,
  'straight-curve': CurveStraight,
  'ellipse-curve': CurveEllipse,
  'degenerate_curve-curve': CurveDegenerate,
  'compcurv-curve': CurveComp,
  'intcurve-curve': CurveInt,
  'intcurve-intcurve-curve': CurveIntInt,
  'pcurve': CurveP,

  // Surfaces
  'surface': Surface,
  'plane-surface': SurfacePlane,
  'cone-surface': SurfaceCone,
  'sphere-surface': SurfaceSphere,
  'torus-surface': SurfaceTorus,
  'meshsurf-surface': SurfaceMesh,
  'spline-surface': SurfaceSpline,

  // Geometry
  'point': Point,

  // Other
  'T': T,
  'transform': Transform,
  'wcs': Wcs,
  'vertex_template': VertexTemplate,
  'eye_refinement': EyeRefinement,
  'refinement': Refinement,
  'rh_material-rh_entity': RhEntityRhMaterial,

  // Cellular
  'cell': Cell,
  'cell3d-cell': Cell3d,
  'cface': CFace,
  'cshell': CShell
}

// ============================================================================
// Curve and Surface Type Handlers (re-export from curves.js and surfaces.js)
// ============================================================================

export { CURVE_TYPES, CURVE_SET_DATA, PCURVE_SET_DATA } from './curves.js'
export { SURFACE_TYPES } from './surfaces.js'

// ============================================================================
// Utility Functions for Type Resolution
// ============================================================================

/**
 * Get entity class for a record name
 * @param {string} name - Record name
 * @returns {Function|null} Entity class constructor or null
 */
export function getEntityClass(name) {
  return RECORD_2_ENTITY[name] || null
}

/**
 * Check if a record name is known
 * @param {string} name - Record name
 * @returns {boolean}
 */
export function isKnownRecordType(name) {
  return name in RECORD_2_ENTITY
}
