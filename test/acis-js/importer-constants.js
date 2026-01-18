/**
 * Inventor Loader Constants
 * Ported from importerConstants.py
 */

// ============================================================================
// Reference Types
// ============================================================================

export const REF_CROSS = 1
export const REF_CHILD = 2
export const REF_PARENT = 3

// ============================================================================
// Value Types
// ============================================================================

export const VAL_GUESS = 0
export const VAL_UINT8 = 1
export const VAL_UINT16 = 2
export const VAL_UINT32 = 3
export const VAL_UINT64 = 4
export const VAL_REF = 5
export const VAL_STR8 = 6
export const VAL_STR16 = 7
export const VAL_DATETIME = 8
export const VAL_ENUM = 9

// ============================================================================
// Value Format Strings
// ============================================================================

export const VAL_FORMAT = {
  [VAL_GUESS]: '%s',
  [VAL_UINT8]: '%02X',
  [VAL_UINT16]: '%03X',
  [VAL_UINT32]: '%04X',
  [VAL_UINT64]: '%05X',
  [VAL_STR8]: "'%s'",
  [VAL_STR16]: '"%s"',
  [VAL_DATETIME]: '#%s#',
  [VAL_ENUM]: '%s'
}

// ============================================================================
// Angle Constants
// ============================================================================

export const MIN_0 = 0.0
export const MIN_PI = -Math.PI
export const MIN_PI2 = -Math.PI / 2
export const MIN_INF = -Infinity

export const MAX_2PI = 2 * Math.PI
export const MAX_PI = Math.PI
export const MAX_PI2 = Math.PI / 2
export const MAX_INF = Infinity
export const MAX_LEN = 2e100

// ============================================================================
// Direction Constants
// ============================================================================

export const CENTER = { x: 0, y: 0, z: 0 }
export const DIR_X = { x: 1, y: 0, z: 0 }
export const DIR_Y = { x: 0, y: 1, z: 0 }
export const DIR_Z = { x: 0, y: 0, z: 1 }

// ============================================================================
// File Encoding
// ============================================================================

export const ENCODING_FS = 'utf-8'

// ============================================================================
// Epsilon for floating point comparisons
// ============================================================================

export const EPS = 1.0e-6

// ============================================================================
// Segment Type IDs
// ============================================================================

export const SEG_APP = 'AppSegmentType'
export const SEG_APP_AM = 'AmAppSegmentType'
export const SEG_APP_PM = 'PmAppSegmentType'
export const SEG_BREP_AM = 'AmBREPSegmentType'
export const SEG_BREP_MB = 'MbBrepSegmentType'
export const SEG_BREP_PM = 'PmBrepSegmentType'
export const SEG_BROWSER_AM = 'AmBRxSegmentType'
export const SEG_BROWSER_DL = 'DlBRxSegmentType'
export const SEG_BROWSER_DX = 'DxBRxSegmentType'
export const SEG_BROWSER_PM = 'PmBRxSegmentType'
export const SEG_BROWSER_PM_OLD = 'PmBrowserSegment'
export const SEG_DC_AM = 'AmDcSegmentType'
export const SEG_DC_DL = 'DlDocDcSegmentType'
export const SEG_DC_DX = 'DxDcSegmentType'
export const SEG_DC_PM = 'PmDcSegmentType'
export const SEG_DESIGN_VIEW = 'FWxDesignViewType'
export const SEG_DESIGN_VIEW_MGR = 'FWxDesignViewManagerType'
export const SEG_DIRECTORY_DL = 'DlDirectorySegmentType'
export const SEG_EE_DATA = 'EeDataSegmentType'
export const SEG_EE_SCENE = 'EeSceneSegmentType'
export const SEG_FB_ATTRIBUTE = 'FBAttributeSegment'
export const SEG_GRAPHICS_AM = 'AmGRxSegmentType'
export const SEG_GRAPHICS_MB = 'MbGRxSegmentType'
export const SEG_GRAPHICS_PM = 'PmGRxSegmentType'
export const SEG_NOTEBOOK = 'NotebookSegmentType'
export const SEG_RESULT_AM = 'AmRxSegmentType'
export const SEG_RESULT_PM = 'PmResultSegmentType'
export const SEG_SHEET_DC_DL = 'DlSheetDcSegmentType'
export const SEG_SHEET_DL_DL = 'DlSheetDlSegmentType'
export const SEG_SHEET_SM_DL = 'DlSheetSmSegmentType'

// ============================================================================
// Segment Type Collections
// ============================================================================

export const SEGMENTS_APP = [SEG_APP, SEG_APP_AM, SEG_APP_PM]
export const SEGMENTS_BRP = [SEG_BREP_AM, SEG_BREP_MB, SEG_BREP_PM]
export const SEGMENTS_BRX = [SEG_BROWSER_AM, SEG_BROWSER_DL, SEG_BROWSER_DX, SEG_BROWSER_PM]
export const SEGMENTS_DOC = [SEG_DC_AM, SEG_DC_DL, SEG_DC_DX, SEG_DC_PM]
export const SEGMENTS_DVW = [SEG_DESIGN_VIEW, SEG_DESIGN_VIEW_MGR]
export const SEGMENTS_DIR = [SEG_DIRECTORY_DL]
export const SEGMENTS_EED = [SEG_EE_DATA]
export const SEGMENTS_EES = [SEG_EE_SCENE]
export const SEGMENTS_FBA = [SEG_FB_ATTRIBUTE]
export const SEGMENTS_GRX = [SEG_GRAPHICS_AM, SEG_GRAPHICS_MB, SEG_GRAPHICS_PM]
export const SEGMENTS_NTB = [SEG_NOTEBOOK]
export const SEGMENTS_RSX = [SEG_RESULT_AM, SEG_RESULT_PM]
export const SEGMENTS_SHT = [SEG_SHEET_DC_DL, SEG_SHEET_DL_DL, SEG_SHEET_SM_DL]

// ============================================================================
// Constraint Types (F3D)
// ============================================================================

export const CONSTRAINT_TYPE = {
  0x00000000001: 'Coincident',
  0x00000000002: 'Colinear',
  0x00000000004: 'Concentric',
  0x00000000010: 'Parallel',
  0x00000000020: 'Perpendicular',
  0x00000000040: 'Horizontal',
  0x00000000080: 'Vertical',
  0x00000000100: 'Tangential',
  0x00000000200: 'Curvature',
  0x00000000400: 'Symmetry',
  0x00000000800: 'Equal',
  0x00000001000: 'Midpoint',
  0x00000002000: 'Polygon',
  0x00010000000: 'Pattern_Circular',
  0x00020000000: 'Pattern_Rect',
  0x10000000000: 'Text_Frame',
  0x20000000000: 'Text_Path'
}

// ============================================================================
// Mathematical Functions
// ============================================================================

export const Functions = [
  '',
  'cos',
  'sin',
  'tan',
  'acos',
  'asin',
  'atan',
  'cosh',
  'sinh',
  'tanh',
  'sqrt',
  'exp',
  'pow',
  'log',
  'log10',
  'floor',
  'ceil',
  'round',
  'abs',
  'sign',
  'max',
  'min',
  'random',
  'acosh',
  'asinh',
  'atanh',
  'isolate'
]

export const FunctionsNotSupported = ['sign', 'random', 'acosh', 'asinh', 'atanh', 'isolate']

// ============================================================================
// Tolerances
// ============================================================================

export const Tolerances = {
  NOMINAL: 0,
  LOWER: 1,
  UPPER: 2,
  MEDIAN: 3
}

// ============================================================================
// DbInterface Type Mapping
// ============================================================================

export const DB_INTERFACE_TYPE_MAPPING = {
  0x01: 'BOOL',
  0x04: 'SINT',
  0x10: 'UUID',
  0x30: 'FLOAT[]',
  0x54: 'MAP'
}

// ============================================================================
// Default Export
// ============================================================================

export default {
  // Reference types
  REF_CROSS,
  REF_CHILD,
  REF_PARENT,

  // Value types
  VAL_GUESS,
  VAL_UINT8,
  VAL_UINT16,
  VAL_UINT32,
  VAL_UINT64,
  VAL_REF,
  VAL_STR8,
  VAL_STR16,
  VAL_DATETIME,
  VAL_ENUM,
  VAL_FORMAT,

  // Angle constants
  MIN_0,
  MIN_PI,
  MIN_PI2,
  MIN_INF,
  MAX_2PI,
  MAX_PI,
  MAX_PI2,
  MAX_INF,
  MAX_LEN,

  // Direction constants
  CENTER,
  DIR_X,
  DIR_Y,
  DIR_Z,

  // Other constants
  ENCODING_FS,
  EPS,

  // Segment types
  SEG_APP,
  SEG_APP_AM,
  SEG_APP_PM,
  SEG_BREP_AM,
  SEG_BREP_MB,
  SEG_BREP_PM,
  SEG_BROWSER_AM,
  SEG_BROWSER_DL,
  SEG_BROWSER_DX,
  SEG_BROWSER_PM,
  SEG_BROWSER_PM_OLD,
  SEG_DC_AM,
  SEG_DC_DL,
  SEG_DC_DX,
  SEG_DC_PM,
  SEG_DESIGN_VIEW,
  SEG_DESIGN_VIEW_MGR,
  SEG_DIRECTORY_DL,
  SEG_EE_DATA,
  SEG_EE_SCENE,
  SEG_FB_ATTRIBUTE,
  SEG_GRAPHICS_AM,
  SEG_GRAPHICS_MB,
  SEG_GRAPHICS_PM,
  SEG_NOTEBOOK,
  SEG_RESULT_AM,
  SEG_RESULT_PM,
  SEG_SHEET_DC_DL,
  SEG_SHEET_DL_DL,
  SEG_SHEET_SM_DL,

  // Segment collections
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
  SEGMENTS_SHT,

  // Constraint types
  CONSTRAINT_TYPE,

  // Functions
  Functions,
  FunctionsNotSupported,

  // Tolerances
  Tolerances,

  // Type mappings
  DB_INTERFACE_TYPE_MAPPING
}
