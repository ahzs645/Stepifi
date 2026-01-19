/**
 * ACIS Constants
 * Binary format tags and enum mappings
 * Ported from Acis.py lines 26-104
 */

// ============================================================================
// Binary Format Tags (Primitives for Binary File Format .sab)
// ============================================================================

export const TAG_CHAR = 0x02          // character (unsigned 8 bit)
export const TAG_SHORT = 0x03         // 16Bit signed value
export const TAG_LONG = 0x04          // 32/64Bit signed value
export const TAG_FLOAT = 0x05         // 32Bit IEEE Float value
export const TAG_DOUBLE = 0x06        // 64Bit IEEE Float value
export const TAG_UTF8_U8 = 0x07       // 8Bit length + UTF8-Char
export const TAG_UTF8_U16 = 0x08      // 16Bit length + UTF8-Char
export const TAG_UTF8_U32_A = 0x09    // 32Bit length + UTF8-Char
export const TAG_TRUE = 0x0A          // Logical true value
export const TAG_FALSE = 0x0B         // Logical false value
export const TAG_ENTITY_REF = 0x0C    // Entity reference
export const TAG_IDENT = 0x0D         // Sub-Class-Name
export const TAG_SUBIDENT = 0x0E      // Base-Class-Name
export const TAG_SUBTYPE_OPEN = 0x0F  // Opening block tag
export const TAG_SUBTYPE_CLOSE = 0x10 // Closing block tag
export const TAG_TERMINATOR = 0x11    // '#' sign
export const TAG_UTF8_U32_B = 0x12    // 32Bit length + UTF8-Char
export const TAG_POSITION = 0x13      // 3D-Vector scaled
export const TAG_VECTOR_3D = 0x14     // 3D-Vector normalized
export const TAG_ENUM_VALUE = 0x15    // value of an enumeration
export const TAG_VECTOR_2D = 0x16     // U-V-Vector
export const TAG_INT64 = 0x17         // used by AutoCAD ASM int64 attributes

// Convenience object for all tags
export const ACIS_TAGS = {
  TAG_CHAR,
  TAG_SHORT,
  TAG_LONG,
  TAG_FLOAT,
  TAG_DOUBLE,
  TAG_UTF8_U8,
  TAG_UTF8_U16,
  TAG_UTF8_U32_A,
  TAG_TRUE,
  TAG_FALSE,
  TAG_ENTITY_REF,
  TAG_IDENT,
  TAG_SUBIDENT,
  TAG_SUBTYPE_OPEN,
  TAG_SUBTYPE_CLOSE,
  TAG_TERMINATOR,
  TAG_UTF8_U32_B,
  TAG_POSITION,
  TAG_VECTOR_3D,
  TAG_ENUM_VALUE,
  TAG_VECTOR_2D,
  TAG_INT64
}

// ============================================================================
// Boolean Enum Builder
// ============================================================================

function buildBoolEnum(falseValue, trueValue, trueKey = 'T') {
  return {
    [TAG_TRUE]: trueValue,
    [trueKey]: trueValue,
    1: trueValue,
    [TAG_FALSE]: falseValue,
    'F': falseValue,
    0: falseValue
  }
}

// ============================================================================
// TAG_FALSE, TAG_TRUE value mappings
// ============================================================================

export const RANGE = buildBoolEnum('I', 'F', 'I')
export const REFLECTION = buildBoolEnum('no_reflect', 'reflect')
export const SURF_RIGID = buildBoolEnum('non_rigid', 'rigid')
export const SURF_AXIS_SWEEP = buildBoolEnum('non_axis_sweep', 'axis_sweep')
export const ROTATION = buildBoolEnum('no_rotate', 'rotate')
export const SHEAR = buildBoolEnum('no_shear', 'shear')
export const SENSE = buildBoolEnum('forward', 'reversed')
export const SENSEV = buildBoolEnum('forward_v', 'reverse_v')
export const SIDES = buildBoolEnum('single', 'double')
export const SIDE = buildBoolEnum('out', 'in')
export const SURF_BOOL = buildBoolEnum('FALSE', 'TRUE')
export const SURF_NORM = buildBoolEnum('ISO', 'UNKNOWN')
export const SURF_DIR = buildBoolEnum('SKIN', 'PERPENDICULAR')
export const SURF_SWEEP = buildBoolEnum('angled', 'normal')
export const CIRC_TYP = buildBoolEnum('non_cross', 'cross')
export const CIRC_SMTH = buildBoolEnum('non_smooth', 'smooth')
export const CALIBRATED = buildBoolEnum('uncalibrated', 'calibrated')
export const CHAMFER_TYPE = buildBoolEnum('const', 'radius')
export const CONVEXITY = buildBoolEnum('concave', 'convex')
export const RENDER_BLEND = buildBoolEnum('rb_snapshot', 'rb_envelope')
export const BOOLEAN = buildBoolEnum('F', 'T')

// ============================================================================
// TAG_ENUM value mappings
// ============================================================================

export const RAD_FORM_ENTS = ['unknown', 'two_ends', 'functional', 'fixed_width']

export const VAR_RADIUS = { 0: 'single_radius', 1: 'two_radii' }
export const VAR_CHAMFER = { 3: 'rounded_chamfer' }
export const CLOSURE = {
  0: 'open',
  1: 'closed',
  2: 'periodic',
  [TAG_FALSE]: 'open',
  [TAG_TRUE]: 'periodic'
}
export const SINGULARITY = {
  0: 'full',
  1: 'v',
  2: 'none',
  [TAG_FALSE]: 'none',
  [TAG_TRUE]: 'full'
}
export const VBL_CIRCLE = {
  0: 'circle',
  1: 'ellipse',
  3: 'unknown',
  'cylinder': 'circle'
}
export const CURV_DIR = { 0: 'left', 2: 'right' }

// ============================================================================
// Token Translations (for text format parsing)
// ============================================================================

export const TOKEN_TRANSLATIONS = {
  '0x0a': TAG_TRUE,
  '0x0A': TAG_TRUE,
  '0x0b': TAG_FALSE,
  '0x0B': TAG_FALSE,
  '{': TAG_SUBTYPE_OPEN,
  '}': TAG_SUBTYPE_CLOSE,
  '#': TAG_TERMINATOR
}

// ============================================================================
// Default Constants
// ============================================================================

export const MIN_0 = 0.0
export const MIN_PI = -Math.PI
export const MIN_PI2 = -Math.PI / 2
export const MIN_INF = -Infinity
export const MAX_2PI = 2 * Math.PI
export const MAX_PI = Math.PI
export const MAX_PI2 = Math.PI / 2
export const MAX_INF = Infinity
export const MAX_LEN = 1e10

// Default vectors
export const CENTER = { x: 0, y: 0, z: 0 }
export const DIR_X = { x: 1, y: 0, z: 0 }
export const DIR_Y = { x: 0, y: 1, z: 0 }
export const DIR_Z = { x: 0, y: 0, z: 1 }

// ============================================================================
// All Enums Object (for convenience)
// ============================================================================

export const ENUMS = {
  RANGE,
  REFLECTION,
  SURF_RIGID,
  SURF_AXIS_SWEEP,
  ROTATION,
  SHEAR,
  SENSE,
  SENSEV,
  SIDES,
  SIDE,
  SURF_BOOL,
  SURF_NORM,
  SURF_DIR,
  SURF_SWEEP,
  CIRC_TYP,
  CIRC_SMTH,
  CALIBRATED,
  CHAMFER_TYPE,
  CONVEXITY,
  RENDER_BLEND,
  BOOLEAN,
  VAR_RADIUS,
  VAR_CHAMFER,
  CLOSURE,
  SINGULARITY,
  VBL_CIRCLE,
  CURV_DIR
}

// ============================================================================
// Importer Constants (from importer-constants.js)
// ============================================================================

// Reference Types
export const REF_CROSS = 1
export const REF_CHILD = 2
export const REF_PARENT = 3

// Value Types
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

// Value Format Strings
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

// File Encoding
export const ENCODING_FS = 'utf-8'

// Epsilon for floating point comparisons
export const EPS = 1.0e-6

// Constraint Types (F3D)
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

// Mathematical Functions
export const Functions = [
  '', 'cos', 'sin', 'tan', 'acos', 'asin', 'atan',
  'cosh', 'sinh', 'tanh', 'sqrt', 'exp', 'pow', 'log', 'log10',
  'floor', 'ceil', 'round', 'abs', 'sign', 'max', 'min', 'random',
  'acosh', 'asinh', 'atanh', 'isolate'
]
export const FunctionsNotSupported = ['sign', 'random', 'acosh', 'asinh', 'atanh', 'isolate']

// Tolerances
export const Tolerances = {
  NOMINAL: 0,
  LOWER: 1,
  UPPER: 2,
  MEDIAN: 3
}

// DbInterface Type Mapping
export const DB_INTERFACE_TYPE_MAPPING = {
  0x01: 'BOOL',
  0x04: 'SINT',
  0x10: 'UUID',
  0x30: 'FLOAT[]',
  0x54: 'MAP'
}

// Segment Type IDs
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

// Segment Type Collections
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
