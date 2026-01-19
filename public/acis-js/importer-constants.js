/**
 * Inventor Loader Constants
 * Re-exports from unified constants.js for backwards compatibility
 */

// Re-export all constants from the unified constants file
export {
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
} from './constants.js'
