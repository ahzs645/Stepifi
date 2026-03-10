export declare class BRepBndLib {
  constructor();
  static Add(S: TopoDS_Shape, B: Bnd_Box, useTriangulation: Standard_Boolean): void;
  static AddClose(S: TopoDS_Shape, B: Bnd_Box): void;
  static AddOptimal(S: TopoDS_Shape, B: Bnd_Box, useTriangulation: Standard_Boolean, useShapeTolerance: Standard_Boolean): void;
  static AddOBB(theS: TopoDS_Shape, theOBB: Bnd_OBB, theIsTriangulationUsed: Standard_Boolean, theIsOptimal: Standard_Boolean, theIsShapeToleranceUsed: Standard_Boolean): void;
  delete(): void;
}

export declare class BRepTools {
  constructor();
  static UVBounds_1(F: TopoDS_Face, UMin: Standard_Real, UMax: Standard_Real, VMin: Standard_Real, VMax: Standard_Real): void;
  static UVBounds_2(F: TopoDS_Face, W: TopoDS_Wire, UMin: Standard_Real, UMax: Standard_Real, VMin: Standard_Real, VMax: Standard_Real): void;
  static UVBounds_3(F: TopoDS_Face, E: TopoDS_Edge, UMin: Standard_Real, UMax: Standard_Real, VMin: Standard_Real, VMax: Standard_Real): void;
  static AddUVBounds_1(F: TopoDS_Face, B: Bnd_Box2d): void;
  static AddUVBounds_2(F: TopoDS_Face, W: TopoDS_Wire, B: Bnd_Box2d): void;
  static AddUVBounds_3(F: TopoDS_Face, E: TopoDS_Edge, B: Bnd_Box2d): void;
  static Update_1(V: TopoDS_Vertex): void;
  static Update_2(E: TopoDS_Edge): void;
  static Update_3(W: TopoDS_Wire): void;
  static Update_4(F: TopoDS_Face): void;
  static Update_5(S: TopoDS_Shell): void;
  static Update_6(S: TopoDS_Solid): void;
  static Update_7(C: TopoDS_CompSolid): void;
  static Update_8(C: TopoDS_Compound): void;
  static Update_9(S: TopoDS_Shape): void;
  static UpdateFaceUVPoints(theF: TopoDS_Face): void;
  static Clean(theShape: TopoDS_Shape, theForce: Standard_Boolean): void;
  static CleanGeometry(theShape: TopoDS_Shape): void;
  static RemoveUnusedPCurves(S: TopoDS_Shape): void;
  static Triangulation(theShape: TopoDS_Shape, theLinDefl: Standard_Real, theToCheckFreeEdges: Standard_Boolean): Standard_Boolean;
  static LoadTriangulation(theShape: TopoDS_Shape, theTriangulationIdx: Graphic3d_ZLayerId, theToSetAsActive: Standard_Boolean, theFileSystem: any): Standard_Boolean;
  static UnloadTriangulation(theShape: TopoDS_Shape, theTriangulationIdx: Graphic3d_ZLayerId): Standard_Boolean;
  static ActivateTriangulation(theShape: TopoDS_Shape, theTriangulationIdx: Graphic3d_ZLayerId, theToActivateStrictly: Standard_Boolean): Standard_Boolean;
  static LoadAllTriangulations(theShape: TopoDS_Shape, theFileSystem: any): Standard_Boolean;
  static UnloadAllTriangulations(theShape: TopoDS_Shape): Standard_Boolean;
  static Compare_1(V1: TopoDS_Vertex, V2: TopoDS_Vertex): Standard_Boolean;
  static Compare_2(E1: TopoDS_Edge, E2: TopoDS_Edge): Standard_Boolean;
  static OuterWire(F: TopoDS_Face): TopoDS_Wire;
  static Map3DEdges(S: TopoDS_Shape, M: TopTools_IndexedMapOfShape): void;
  static IsReallyClosed(E: TopoDS_Edge, F: TopoDS_Face): Standard_Boolean;
  static DetectClosedness(theFace: TopoDS_Face, theUclosed: Standard_Boolean, theVclosed: Standard_Boolean): void;
  static Dump(Sh: TopoDS_Shape, S: Standard_OStream): void;
  static Write_1(theShape: TopoDS_Shape, theStream: Standard_OStream, theProgress: Message_ProgressRange): void;
  static Write_2(theShape: TopoDS_Shape, theStream: Standard_OStream, theWithTriangles: Standard_Boolean, theWithNormals: Standard_Boolean, theVersion: TopTools_FormatVersion, theProgress: Message_ProgressRange): void;
  static Read_1(Sh: TopoDS_Shape, S: Standard_IStream, B: BRep_Builder, theProgress: Message_ProgressRange): void;
  static Write_3(theShape: TopoDS_Shape, theFile: Standard_CString, theProgress: Message_ProgressRange): Standard_Boolean;
  static Write_4(theShape: TopoDS_Shape, theFile: Standard_CString, theWithTriangles: Standard_Boolean, theWithNormals: Standard_Boolean, theVersion: TopTools_FormatVersion, theProgress: Message_ProgressRange): Standard_Boolean;
  static Read_2(Sh: TopoDS_Shape, File: Standard_CString, B: BRep_Builder, theProgress: Message_ProgressRange): Standard_Boolean;
  static EvalAndUpdateTol(theE: TopoDS_Edge, theC3d: Handle_Geom_Curve, theC2d: Handle_Geom2d_Curve, theS: Handle_Geom_Surface, theF: Standard_Real, theL: Standard_Real): Standard_Real;
  static OriEdgeInFace(theEdge: TopoDS_Edge, theFace: TopoDS_Face): TopAbs_Orientation;
  static RemoveInternals(theS: TopoDS_Shape, theForce: Standard_Boolean): void;
  static CheckLocations(theS: TopoDS_Shape, theProblemShapes: TopTools_ListOfShape): void;
  delete(): void;
}

export declare class Handle_Geom2d_Curve {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Geom2d_Curve): void;
  get(): Geom2d_Curve;
  delete(): void;
}

  export declare class Handle_Geom2d_Curve_1 extends Handle_Geom2d_Curve {
    constructor();
  }

  export declare class Handle_Geom2d_Curve_2 extends Handle_Geom2d_Curve {
    constructor(thePtr: Geom2d_Curve);
  }

  export declare class Handle_Geom2d_Curve_3 extends Handle_Geom2d_Curve {
    constructor(theHandle: Handle_Geom2d_Curve);
  }

  export declare class Handle_Geom2d_Curve_4 extends Handle_Geom2d_Curve {
    constructor(theHandle: Handle_Geom2d_Curve);
  }

export declare class Geom2d_Curve extends Geom2d_Geometry {
  Reverse(): void;
  ReversedParameter(U: Standard_Real): Standard_Real;
  TransformedParameter(U: Standard_Real, T: gp_Trsf2d): Standard_Real;
  ParametricTransformation(T: gp_Trsf2d): Standard_Real;
  Reversed(): Handle_Geom2d_Curve;
  FirstParameter(): Standard_Real;
  LastParameter(): Standard_Real;
  IsClosed(): Standard_Boolean;
  IsPeriodic(): Standard_Boolean;
  Period(): Standard_Real;
  Continuity(): GeomAbs_Shape;
  IsCN(N: Graphic3d_ZLayerId): Standard_Boolean;
  D0(U: Standard_Real, P: gp_Pnt2d): void;
  D1(U: Standard_Real, P: gp_Pnt2d, V1: gp_Vec2d): void;
  D2(U: Standard_Real, P: gp_Pnt2d, V1: gp_Vec2d, V2: gp_Vec2d): void;
  D3(U: Standard_Real, P: gp_Pnt2d, V1: gp_Vec2d, V2: gp_Vec2d, V3: gp_Vec2d): void;
  DN(U: Standard_Real, N: Graphic3d_ZLayerId): gp_Vec2d;
  Value(U: Standard_Real): gp_Pnt2d;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

export declare class Geom2d_Geometry extends Standard_Transient {
  Mirror_1(P: gp_Pnt2d): void;
  Mirror_2(A: gp_Ax2d): void;
  Rotate(P: gp_Pnt2d, Ang: Standard_Real): void;
  Scale(P: gp_Pnt2d, S: Standard_Real): void;
  Translate_1(V: gp_Vec2d): void;
  Translate_2(P1: gp_Pnt2d, P2: gp_Pnt2d): void;
  Transform(T: gp_Trsf2d): void;
  Mirrored_1(P: gp_Pnt2d): Handle_Geom2d_Geometry;
  Mirrored_2(A: gp_Ax2d): Handle_Geom2d_Geometry;
  Rotated(P: gp_Pnt2d, Ang: Standard_Real): Handle_Geom2d_Geometry;
  Scaled(P: gp_Pnt2d, S: Standard_Real): Handle_Geom2d_Geometry;
  Transformed(T: gp_Trsf2d): Handle_Geom2d_Geometry;
  Translated_1(V: gp_Vec2d): Handle_Geom2d_Geometry;
  Translated_2(P1: gp_Pnt2d, P2: gp_Pnt2d): Handle_Geom2d_Geometry;
  Copy(): Handle_Geom2d_Geometry;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

export declare class Handle_Geom2d_Geometry {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Geom2d_Geometry): void;
  get(): Geom2d_Geometry;
  delete(): void;
}

  export declare class Handle_Geom2d_Geometry_1 extends Handle_Geom2d_Geometry {
    constructor();
  }

  export declare class Handle_Geom2d_Geometry_2 extends Handle_Geom2d_Geometry {
    constructor(thePtr: Geom2d_Geometry);
  }

  export declare class Handle_Geom2d_Geometry_3 extends Handle_Geom2d_Geometry {
    constructor(theHandle: Handle_Geom2d_Geometry);
  }

  export declare class Handle_Geom2d_Geometry_4 extends Handle_Geom2d_Geometry {
    constructor(theHandle: Handle_Geom2d_Geometry);
  }

export declare class Handle_Geom2d_Circle {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Geom2d_Circle): void;
  get(): Geom2d_Circle;
  delete(): void;
}

  export declare class Handle_Geom2d_Circle_1 extends Handle_Geom2d_Circle {
    constructor();
  }

  export declare class Handle_Geom2d_Circle_2 extends Handle_Geom2d_Circle {
    constructor(thePtr: Geom2d_Circle);
  }

  export declare class Handle_Geom2d_Circle_3 extends Handle_Geom2d_Circle {
    constructor(theHandle: Handle_Geom2d_Circle);
  }

  export declare class Handle_Geom2d_Circle_4 extends Handle_Geom2d_Circle {
    constructor(theHandle: Handle_Geom2d_Circle);
  }

export declare class Geom2d_Circle extends Geom2d_Conic {
  SetCirc2d(C: gp_Circ2d): void;
  SetRadius(R: Standard_Real): void;
  Circ2d(): gp_Circ2d;
  Radius(): Standard_Real;
  ReversedParameter(U: Standard_Real): Standard_Real;
  Eccentricity(): Standard_Real;
  FirstParameter(): Standard_Real;
  LastParameter(): Standard_Real;
  IsClosed(): Standard_Boolean;
  IsPeriodic(): Standard_Boolean;
  D0(U: Standard_Real, P: gp_Pnt2d): void;
  D1(U: Standard_Real, P: gp_Pnt2d, V1: gp_Vec2d): void;
  D2(U: Standard_Real, P: gp_Pnt2d, V1: gp_Vec2d, V2: gp_Vec2d): void;
  D3(U: Standard_Real, P: gp_Pnt2d, V1: gp_Vec2d, V2: gp_Vec2d, V3: gp_Vec2d): void;
  DN(U: Standard_Real, N: Graphic3d_ZLayerId): gp_Vec2d;
  Transform(T: gp_Trsf2d): void;
  Copy(): Handle_Geom2d_Geometry;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

  export declare class Geom2d_Circle_1 extends Geom2d_Circle {
    constructor(C: gp_Circ2d);
  }

  export declare class Geom2d_Circle_2 extends Geom2d_Circle {
    constructor(A: gp_Ax2d, Radius: Standard_Real, Sense: Standard_Boolean);
  }

  export declare class Geom2d_Circle_3 extends Geom2d_Circle {
    constructor(A: gp_Ax22d, Radius: Standard_Real);
  }

export declare class Geom2d_TrimmedCurve extends Geom2d_BoundedCurve {
  constructor(C: Handle_Geom2d_Curve, U1: Standard_Real, U2: Standard_Real, Sense: Standard_Boolean, theAdjustPeriodic: Standard_Boolean)
  Reverse(): void;
  ReversedParameter(U: Standard_Real): Standard_Real;
  SetTrim(U1: Standard_Real, U2: Standard_Real, Sense: Standard_Boolean, theAdjustPeriodic: Standard_Boolean): void;
  BasisCurve(): Handle_Geom2d_Curve;
  Continuity(): GeomAbs_Shape;
  IsCN(N: Graphic3d_ZLayerId): Standard_Boolean;
  EndPoint(): gp_Pnt2d;
  FirstParameter(): Standard_Real;
  IsClosed(): Standard_Boolean;
  IsPeriodic(): Standard_Boolean;
  Period(): Standard_Real;
  LastParameter(): Standard_Real;
  StartPoint(): gp_Pnt2d;
  D0(U: Standard_Real, P: gp_Pnt2d): void;
  D1(U: Standard_Real, P: gp_Pnt2d, V1: gp_Vec2d): void;
  D2(U: Standard_Real, P: gp_Pnt2d, V1: gp_Vec2d, V2: gp_Vec2d): void;
  D3(U: Standard_Real, P: gp_Pnt2d, V1: gp_Vec2d, V2: gp_Vec2d, V3: gp_Vec2d): void;
  DN(U: Standard_Real, N: Graphic3d_ZLayerId): gp_Vec2d;
  Transform(T: gp_Trsf2d): void;
  TransformedParameter(U: Standard_Real, T: gp_Trsf2d): Standard_Real;
  ParametricTransformation(T: gp_Trsf2d): Standard_Real;
  Copy(): Handle_Geom2d_Geometry;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

export declare class Handle_Geom2d_TrimmedCurve {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Geom2d_TrimmedCurve): void;
  get(): Geom2d_TrimmedCurve;
  delete(): void;
}

  export declare class Handle_Geom2d_TrimmedCurve_1 extends Handle_Geom2d_TrimmedCurve {
    constructor();
  }

  export declare class Handle_Geom2d_TrimmedCurve_2 extends Handle_Geom2d_TrimmedCurve {
    constructor(thePtr: Geom2d_TrimmedCurve);
  }

  export declare class Handle_Geom2d_TrimmedCurve_3 extends Handle_Geom2d_TrimmedCurve {
    constructor(theHandle: Handle_Geom2d_TrimmedCurve);
  }

  export declare class Handle_Geom2d_TrimmedCurve_4 extends Handle_Geom2d_TrimmedCurve {
    constructor(theHandle: Handle_Geom2d_TrimmedCurve);
  }

export declare class Handle_Geom2d_Ellipse {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Geom2d_Ellipse): void;
  get(): Geom2d_Ellipse;
  delete(): void;
}

  export declare class Handle_Geom2d_Ellipse_1 extends Handle_Geom2d_Ellipse {
    constructor();
  }

  export declare class Handle_Geom2d_Ellipse_2 extends Handle_Geom2d_Ellipse {
    constructor(thePtr: Geom2d_Ellipse);
  }

  export declare class Handle_Geom2d_Ellipse_3 extends Handle_Geom2d_Ellipse {
    constructor(theHandle: Handle_Geom2d_Ellipse);
  }

  export declare class Handle_Geom2d_Ellipse_4 extends Handle_Geom2d_Ellipse {
    constructor(theHandle: Handle_Geom2d_Ellipse);
  }

export declare class Geom2d_Ellipse extends Geom2d_Conic {
  SetElips2d(E: gp_Elips2d): void;
  SetMajorRadius(MajorRadius: Standard_Real): void;
  SetMinorRadius(MinorRadius: Standard_Real): void;
  Elips2d(): gp_Elips2d;
  ReversedParameter(U: Standard_Real): Standard_Real;
  Directrix1(): gp_Ax2d;
  Directrix2(): gp_Ax2d;
  Eccentricity(): Standard_Real;
  Focal(): Standard_Real;
  Focus1(): gp_Pnt2d;
  Focus2(): gp_Pnt2d;
  MajorRadius(): Standard_Real;
  MinorRadius(): Standard_Real;
  Parameter(): Standard_Real;
  FirstParameter(): Standard_Real;
  LastParameter(): Standard_Real;
  IsClosed(): Standard_Boolean;
  IsPeriodic(): Standard_Boolean;
  D0(U: Standard_Real, P: gp_Pnt2d): void;
  D1(U: Standard_Real, P: gp_Pnt2d, V1: gp_Vec2d): void;
  D2(U: Standard_Real, P: gp_Pnt2d, V1: gp_Vec2d, V2: gp_Vec2d): void;
  D3(U: Standard_Real, P: gp_Pnt2d, V1: gp_Vec2d, V2: gp_Vec2d, V3: gp_Vec2d): void;
  DN(U: Standard_Real, N: Graphic3d_ZLayerId): gp_Vec2d;
  Transform(T: gp_Trsf2d): void;
  Copy(): Handle_Geom2d_Geometry;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

  export declare class Geom2d_Ellipse_1 extends Geom2d_Ellipse {
    constructor(E: gp_Elips2d);
  }

  export declare class Geom2d_Ellipse_2 extends Geom2d_Ellipse {
    constructor(MajorAxis: gp_Ax2d, MajorRadius: Standard_Real, MinorRadius: Standard_Real, Sense: Standard_Boolean);
  }

  export declare class Geom2d_Ellipse_3 extends Geom2d_Ellipse {
    constructor(Axis: gp_Ax22d, MajorRadius: Standard_Real, MinorRadius: Standard_Real);
  }

export declare class Handle_Geom2d_BoundedCurve {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Geom2d_BoundedCurve): void;
  get(): Geom2d_BoundedCurve;
  delete(): void;
}

  export declare class Handle_Geom2d_BoundedCurve_1 extends Handle_Geom2d_BoundedCurve {
    constructor();
  }

  export declare class Handle_Geom2d_BoundedCurve_2 extends Handle_Geom2d_BoundedCurve {
    constructor(thePtr: Geom2d_BoundedCurve);
  }

  export declare class Handle_Geom2d_BoundedCurve_3 extends Handle_Geom2d_BoundedCurve {
    constructor(theHandle: Handle_Geom2d_BoundedCurve);
  }

  export declare class Handle_Geom2d_BoundedCurve_4 extends Handle_Geom2d_BoundedCurve {
    constructor(theHandle: Handle_Geom2d_BoundedCurve);
  }

export declare class Geom2d_BoundedCurve extends Geom2d_Curve {
  EndPoint(): gp_Pnt2d;
  StartPoint(): gp_Pnt2d;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

export declare class Handle_Geom2d_BSplineCurve {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Geom2d_BSplineCurve): void;
  get(): Geom2d_BSplineCurve;
  delete(): void;
}

  export declare class Handle_Geom2d_BSplineCurve_1 extends Handle_Geom2d_BSplineCurve {
    constructor();
  }

  export declare class Handle_Geom2d_BSplineCurve_2 extends Handle_Geom2d_BSplineCurve {
    constructor(thePtr: Geom2d_BSplineCurve);
  }

  export declare class Handle_Geom2d_BSplineCurve_3 extends Handle_Geom2d_BSplineCurve {
    constructor(theHandle: Handle_Geom2d_BSplineCurve);
  }

  export declare class Handle_Geom2d_BSplineCurve_4 extends Handle_Geom2d_BSplineCurve {
    constructor(theHandle: Handle_Geom2d_BSplineCurve);
  }

export declare class Geom2d_BSplineCurve extends Geom2d_BoundedCurve {
  IncreaseDegree(Degree: Graphic3d_ZLayerId): void;
  IncreaseMultiplicity_1(Index: Graphic3d_ZLayerId, M: Graphic3d_ZLayerId): void;
  IncreaseMultiplicity_2(I1: Graphic3d_ZLayerId, I2: Graphic3d_ZLayerId, M: Graphic3d_ZLayerId): void;
  IncrementMultiplicity(I1: Graphic3d_ZLayerId, I2: Graphic3d_ZLayerId, M: Graphic3d_ZLayerId): void;
  InsertKnot(U: Standard_Real, M: Graphic3d_ZLayerId, ParametricTolerance: Standard_Real): void;
  InsertKnots(Knots: IntTools_CArray1OfReal, Mults: TColStd_Array1OfInteger, ParametricTolerance: Standard_Real, Add: Standard_Boolean): void;
  RemoveKnot(Index: Graphic3d_ZLayerId, M: Graphic3d_ZLayerId, Tolerance: Standard_Real): Standard_Boolean;
  InsertPoleAfter(Index: Graphic3d_ZLayerId, P: gp_Pnt2d, Weight: Standard_Real): void;
  InsertPoleBefore(Index: Graphic3d_ZLayerId, P: gp_Pnt2d, Weight: Standard_Real): void;
  RemovePole(Index: Graphic3d_ZLayerId): void;
  Reverse(): void;
  ReversedParameter(U: Standard_Real): Standard_Real;
  Segment(U1: Standard_Real, U2: Standard_Real, theTolerance: Standard_Real): void;
  SetKnot_1(Index: Graphic3d_ZLayerId, K: Standard_Real): void;
  SetKnots(K: IntTools_CArray1OfReal): void;
  SetKnot_2(Index: Graphic3d_ZLayerId, K: Standard_Real, M: Graphic3d_ZLayerId): void;
  PeriodicNormalization(U: Standard_Real): void;
  SetPeriodic(): void;
  SetOrigin(Index: Graphic3d_ZLayerId): void;
  SetNotPeriodic(): void;
  SetPole_1(Index: Graphic3d_ZLayerId, P: gp_Pnt2d): void;
  SetPole_2(Index: Graphic3d_ZLayerId, P: gp_Pnt2d, Weight: Standard_Real): void;
  SetWeight(Index: Graphic3d_ZLayerId, Weight: Standard_Real): void;
  MovePoint(U: Standard_Real, P: gp_Pnt2d, Index1: Graphic3d_ZLayerId, Index2: Graphic3d_ZLayerId, FirstModifiedPole: Graphic3d_ZLayerId, LastModifiedPole: Graphic3d_ZLayerId): void;
  MovePointAndTangent(U: Standard_Real, P: gp_Pnt2d, Tangent: gp_Vec2d, Tolerance: Standard_Real, StartingCondition: Graphic3d_ZLayerId, EndingCondition: Graphic3d_ZLayerId, ErrorStatus: Graphic3d_ZLayerId): void;
  IsCN(N: Graphic3d_ZLayerId): Standard_Boolean;
  IsG1(theTf: Standard_Real, theTl: Standard_Real, theAngTol: Standard_Real): Standard_Boolean;
  IsClosed(): Standard_Boolean;
  IsPeriodic(): Standard_Boolean;
  IsRational(): Standard_Boolean;
  Continuity(): GeomAbs_Shape;
  Degree(): Graphic3d_ZLayerId;
  D0(U: Standard_Real, P: gp_Pnt2d): void;
  D1(U: Standard_Real, P: gp_Pnt2d, V1: gp_Vec2d): void;
  D2(U: Standard_Real, P: gp_Pnt2d, V1: gp_Vec2d, V2: gp_Vec2d): void;
  D3(U: Standard_Real, P: gp_Pnt2d, V1: gp_Vec2d, V2: gp_Vec2d, V3: gp_Vec2d): void;
  DN(U: Standard_Real, N: Graphic3d_ZLayerId): gp_Vec2d;
  LocalValue(U: Standard_Real, FromK1: Graphic3d_ZLayerId, ToK2: Graphic3d_ZLayerId): gp_Pnt2d;
  LocalD0(U: Standard_Real, FromK1: Graphic3d_ZLayerId, ToK2: Graphic3d_ZLayerId, P: gp_Pnt2d): void;
  LocalD1(U: Standard_Real, FromK1: Graphic3d_ZLayerId, ToK2: Graphic3d_ZLayerId, P: gp_Pnt2d, V1: gp_Vec2d): void;
  LocalD2(U: Standard_Real, FromK1: Graphic3d_ZLayerId, ToK2: Graphic3d_ZLayerId, P: gp_Pnt2d, V1: gp_Vec2d, V2: gp_Vec2d): void;
  LocalD3(U: Standard_Real, FromK1: Graphic3d_ZLayerId, ToK2: Graphic3d_ZLayerId, P: gp_Pnt2d, V1: gp_Vec2d, V2: gp_Vec2d, V3: gp_Vec2d): void;
  LocalDN(U: Standard_Real, FromK1: Graphic3d_ZLayerId, ToK2: Graphic3d_ZLayerId, N: Graphic3d_ZLayerId): gp_Vec2d;
  EndPoint(): gp_Pnt2d;
  FirstUKnotIndex(): Graphic3d_ZLayerId;
  FirstParameter(): Standard_Real;
  Knot(Index: Graphic3d_ZLayerId): Standard_Real;
  Knots_1(K: IntTools_CArray1OfReal): void;
  Knots_2(): IntTools_CArray1OfReal;
  KnotSequence_1(K: IntTools_CArray1OfReal): void;
  KnotSequence_2(): IntTools_CArray1OfReal;
  KnotDistribution(): GeomAbs_BSplKnotDistribution;
  LastUKnotIndex(): Graphic3d_ZLayerId;
  LastParameter(): Standard_Real;
  LocateU(U: Standard_Real, ParametricTolerance: Standard_Real, I1: Graphic3d_ZLayerId, I2: Graphic3d_ZLayerId, WithKnotRepetition: Standard_Boolean): void;
  Multiplicity(Index: Graphic3d_ZLayerId): Graphic3d_ZLayerId;
  Multiplicities_1(M: TColStd_Array1OfInteger): void;
  Multiplicities_2(): TColStd_Array1OfInteger;
  NbKnots(): Graphic3d_ZLayerId;
  NbPoles(): Graphic3d_ZLayerId;
  Pole(Index: Graphic3d_ZLayerId): gp_Pnt2d;
  Poles_1(P: TColgp_Array1OfPnt2d): void;
  Poles_2(): TColgp_Array1OfPnt2d;
  StartPoint(): gp_Pnt2d;
  Weight(Index: Graphic3d_ZLayerId): Standard_Real;
  Weights_1(W: IntTools_CArray1OfReal): void;
  Weights_2(): IntTools_CArray1OfReal;
  Transform(T: gp_Trsf2d): void;
  static MaxDegree(): Graphic3d_ZLayerId;
  Resolution(ToleranceUV: Standard_Real, UTolerance: Standard_Real): void;
  Copy(): Handle_Geom2d_Geometry;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

  export declare class Geom2d_BSplineCurve_1 extends Geom2d_BSplineCurve {
    constructor(Poles: TColgp_Array1OfPnt2d, Knots: IntTools_CArray1OfReal, Multiplicities: TColStd_Array1OfInteger, Degree: Graphic3d_ZLayerId, Periodic: Standard_Boolean);
  }

  export declare class Geom2d_BSplineCurve_2 extends Geom2d_BSplineCurve {
    constructor(Poles: TColgp_Array1OfPnt2d, Weights: IntTools_CArray1OfReal, Knots: IntTools_CArray1OfReal, Multiplicities: TColStd_Array1OfInteger, Degree: Graphic3d_ZLayerId, Periodic: Standard_Boolean);
  }

export declare class Geom2d_Line extends Geom2d_Curve {
  SetLin2d(L: gp_Lin2d): void;
  SetDirection(V: gp_Dir2d): void;
  Direction(): gp_Dir2d;
  SetLocation(P: gp_Pnt2d): void;
  Location(): gp_Pnt2d;
  SetPosition(A: gp_Ax2d): void;
  Position(): gp_Ax2d;
  Lin2d(): gp_Lin2d;
  Reverse(): void;
  ReversedParameter(U: Standard_Real): Standard_Real;
  FirstParameter(): Standard_Real;
  LastParameter(): Standard_Real;
  IsClosed(): Standard_Boolean;
  IsPeriodic(): Standard_Boolean;
  Continuity(): GeomAbs_Shape;
  Distance(P: gp_Pnt2d): Standard_Real;
  IsCN(N: Graphic3d_ZLayerId): Standard_Boolean;
  D0(U: Standard_Real, P: gp_Pnt2d): void;
  D1(U: Standard_Real, P: gp_Pnt2d, V1: gp_Vec2d): void;
  D2(U: Standard_Real, P: gp_Pnt2d, V1: gp_Vec2d, V2: gp_Vec2d): void;
  D3(U: Standard_Real, P: gp_Pnt2d, V1: gp_Vec2d, V2: gp_Vec2d, V3: gp_Vec2d): void;
  DN(U: Standard_Real, N: Graphic3d_ZLayerId): gp_Vec2d;
  Transform(T: gp_Trsf2d): void;
  TransformedParameter(U: Standard_Real, T: gp_Trsf2d): Standard_Real;
  ParametricTransformation(T: gp_Trsf2d): Standard_Real;
  Copy(): Handle_Geom2d_Geometry;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

  export declare class Geom2d_Line_1 extends Geom2d_Line {
    constructor(A: gp_Ax2d);
  }

  export declare class Geom2d_Line_2 extends Geom2d_Line {
    constructor(L: gp_Lin2d);
  }

  export declare class Geom2d_Line_3 extends Geom2d_Line {
    constructor(P: gp_Pnt2d, V: gp_Dir2d);
  }

export declare class Handle_Geom2d_Line {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Geom2d_Line): void;
  get(): Geom2d_Line;
  delete(): void;
}

  export declare class Handle_Geom2d_Line_1 extends Handle_Geom2d_Line {
    constructor();
  }

  export declare class Handle_Geom2d_Line_2 extends Handle_Geom2d_Line {
    constructor(thePtr: Geom2d_Line);
  }

  export declare class Handle_Geom2d_Line_3 extends Handle_Geom2d_Line {
    constructor(theHandle: Handle_Geom2d_Line);
  }

  export declare class Handle_Geom2d_Line_4 extends Handle_Geom2d_Line {
    constructor(theHandle: Handle_Geom2d_Line);
  }

export declare class Handle_Geom2d_Conic {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Geom2d_Conic): void;
  get(): Geom2d_Conic;
  delete(): void;
}

  export declare class Handle_Geom2d_Conic_1 extends Handle_Geom2d_Conic {
    constructor();
  }

  export declare class Handle_Geom2d_Conic_2 extends Handle_Geom2d_Conic {
    constructor(thePtr: Geom2d_Conic);
  }

  export declare class Handle_Geom2d_Conic_3 extends Handle_Geom2d_Conic {
    constructor(theHandle: Handle_Geom2d_Conic);
  }

  export declare class Handle_Geom2d_Conic_4 extends Handle_Geom2d_Conic {
    constructor(theHandle: Handle_Geom2d_Conic);
  }

export declare class Geom2d_Conic extends Geom2d_Curve {
  SetAxis(theA: gp_Ax22d): void;
  SetXAxis(theAX: gp_Ax2d): void;
  SetYAxis(theAY: gp_Ax2d): void;
  SetLocation(theP: gp_Pnt2d): void;
  XAxis(): gp_Ax2d;
  YAxis(): gp_Ax2d;
  Eccentricity(): Standard_Real;
  Location(): gp_Pnt2d;
  Position(): gp_Ax22d;
  Reverse(): void;
  ReversedParameter(U: Standard_Real): Standard_Real;
  Continuity(): GeomAbs_Shape;
  IsCN(N: Graphic3d_ZLayerId): Standard_Boolean;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

export declare class TCollection_AsciiString {
  AssignCat_1(other: Standard_Character): void;
  AssignCat_2(other: Graphic3d_ZLayerId): void;
  AssignCat_3(other: Standard_Real): void;
  AssignCat_4(other: Standard_CString): void;
  AssignCat_5(other: XCAFDoc_PartId): void;
  Capitalize(): void;
  Cat_1(other: Standard_Character): XCAFDoc_PartId;
  Cat_2(other: Graphic3d_ZLayerId): XCAFDoc_PartId;
  Cat_3(other: Standard_Real): XCAFDoc_PartId;
  Cat_4(other: Standard_CString): XCAFDoc_PartId;
  Cat_5(other: XCAFDoc_PartId): XCAFDoc_PartId;
  Center(Width: Graphic3d_ZLayerId, Filler: Standard_Character): void;
  ChangeAll(aChar: Standard_Character, NewChar: Standard_Character, CaseSensitive: Standard_Boolean): void;
  Clear(): void;
  Copy_1(fromwhere: Standard_CString): void;
  Copy_2(fromwhere: XCAFDoc_PartId): void;
  Swap(theOther: XCAFDoc_PartId): void;
  FirstLocationInSet(Set: XCAFDoc_PartId, FromIndex: Graphic3d_ZLayerId, ToIndex: Graphic3d_ZLayerId): Graphic3d_ZLayerId;
  FirstLocationNotInSet(Set: XCAFDoc_PartId, FromIndex: Graphic3d_ZLayerId, ToIndex: Graphic3d_ZLayerId): Graphic3d_ZLayerId;
  Insert_1(where: Graphic3d_ZLayerId, what: Standard_Character): void;
  Insert_2(where: Graphic3d_ZLayerId, what: Standard_CString): void;
  Insert_3(where: Graphic3d_ZLayerId, what: XCAFDoc_PartId): void;
  InsertAfter(Index: Graphic3d_ZLayerId, other: XCAFDoc_PartId): void;
  InsertBefore(Index: Graphic3d_ZLayerId, other: XCAFDoc_PartId): void;
  IsEmpty(): Standard_Boolean;
  IsEqual_1(other: Standard_CString): Standard_Boolean;
  IsEqual_2(other: XCAFDoc_PartId): Standard_Boolean;
  IsDifferent_1(other: Standard_CString): Standard_Boolean;
  IsDifferent_2(other: XCAFDoc_PartId): Standard_Boolean;
  IsLess_1(other: Standard_CString): Standard_Boolean;
  IsLess_2(other: XCAFDoc_PartId): Standard_Boolean;
  IsGreater_1(other: Standard_CString): Standard_Boolean;
  IsGreater_2(other: XCAFDoc_PartId): Standard_Boolean;
  StartsWith(theStartString: XCAFDoc_PartId): Standard_Boolean;
  EndsWith(theEndString: XCAFDoc_PartId): Standard_Boolean;
  IntegerValue(): Graphic3d_ZLayerId;
  IsIntegerValue(): Standard_Boolean;
  IsRealValue(theToCheckFull: Standard_Boolean): Standard_Boolean;
  IsAscii(): Standard_Boolean;
  LeftAdjust(): void;
  LeftJustify(Width: Graphic3d_ZLayerId, Filler: Standard_Character): void;
  Length(): Graphic3d_ZLayerId;
  Location_1(other: XCAFDoc_PartId, FromIndex: Graphic3d_ZLayerId, ToIndex: Graphic3d_ZLayerId): Graphic3d_ZLayerId;
  Location_2(N: Graphic3d_ZLayerId, C: Standard_Character, FromIndex: Graphic3d_ZLayerId, ToIndex: Graphic3d_ZLayerId): Graphic3d_ZLayerId;
  LowerCase(): void;
  Prepend(other: XCAFDoc_PartId): void;
  Print(astream: Standard_OStream): void;
  Read(astream: Standard_IStream): void;
  RealValue(): Standard_Real;
  RemoveAll_1(C: Standard_Character, CaseSensitive: Standard_Boolean): void;
  RemoveAll_2(what: Standard_Character): void;
  Remove(where: Graphic3d_ZLayerId, ahowmany: Graphic3d_ZLayerId): void;
  RightAdjust(): void;
  RightJustify(Width: Graphic3d_ZLayerId, Filler: Standard_Character): void;
  Search_1(what: Standard_CString): Graphic3d_ZLayerId;
  Search_2(what: XCAFDoc_PartId): Graphic3d_ZLayerId;
  SearchFromEnd_1(what: Standard_CString): Graphic3d_ZLayerId;
  SearchFromEnd_2(what: XCAFDoc_PartId): Graphic3d_ZLayerId;
  SetValue_1(where: Graphic3d_ZLayerId, what: Standard_Character): void;
  SetValue_2(where: Graphic3d_ZLayerId, what: Standard_CString): void;
  SetValue_3(where: Graphic3d_ZLayerId, what: XCAFDoc_PartId): void;
  Split_1(where: Graphic3d_ZLayerId): XCAFDoc_PartId;
  SubString_1(FromIndex: Graphic3d_ZLayerId, ToIndex: Graphic3d_ZLayerId): XCAFDoc_PartId;
  ToCString(): Standard_CString;
  Token_1(separators: Standard_CString, whichone: Graphic3d_ZLayerId): XCAFDoc_PartId;
  Trunc(ahowmany: Graphic3d_ZLayerId): void;
  UpperCase(): void;
  UsefullLength(): Graphic3d_ZLayerId;
  Value(where: Graphic3d_ZLayerId): Standard_Character;
  static HashCode(theAsciiString: XCAFDoc_PartId, theUpperBound: Graphic3d_ZLayerId): Graphic3d_ZLayerId;
  static IsEqual_3(string1: XCAFDoc_PartId, string2: XCAFDoc_PartId): Standard_Boolean;
  static IsEqual_4(string1: XCAFDoc_PartId, string2: Standard_CString): Standard_Boolean;
  static IsSameString(theString1: XCAFDoc_PartId, theString2: XCAFDoc_PartId, theIsCaseSensitive: Standard_Boolean): Standard_Boolean;
  delete(): void;
}

  export declare class TCollection_AsciiString_1 extends TCollection_AsciiString {
    constructor();
  }

  export declare class TCollection_AsciiString_2 extends TCollection_AsciiString {
    constructor(message: Standard_CString);
  }

  export declare class TCollection_AsciiString_3 extends TCollection_AsciiString {
    constructor(message: Standard_CString, aLen: Graphic3d_ZLayerId);
  }

  export declare class TCollection_AsciiString_4 extends TCollection_AsciiString {
    constructor(aChar: Standard_Character);
  }

  export declare class TCollection_AsciiString_5 extends TCollection_AsciiString {
    constructor(length: Graphic3d_ZLayerId, filler: Standard_Character);
  }

  export declare class TCollection_AsciiString_6 extends TCollection_AsciiString {
    constructor(value: Graphic3d_ZLayerId);
  }

  export declare class TCollection_AsciiString_7 extends TCollection_AsciiString {
    constructor(value: Standard_Real);
  }

  export declare class TCollection_AsciiString_8 extends TCollection_AsciiString {
    constructor(astring: XCAFDoc_PartId);
  }

  export declare class TCollection_AsciiString_9 extends TCollection_AsciiString {
    constructor(theOther: XCAFDoc_PartId);
  }

  export declare class TCollection_AsciiString_10 extends TCollection_AsciiString {
    constructor(astring: XCAFDoc_PartId, message: Standard_Character);
  }

  export declare class TCollection_AsciiString_11 extends TCollection_AsciiString {
    constructor(astring: XCAFDoc_PartId, message: Standard_CString);
  }

  export declare class TCollection_AsciiString_12 extends TCollection_AsciiString {
    constructor(astring: XCAFDoc_PartId, message: XCAFDoc_PartId);
  }

  export declare class TCollection_AsciiString_13 extends TCollection_AsciiString {
    constructor(astring: TCollection_ExtendedString, replaceNonAscii: Standard_Character);
  }

  export declare class TCollection_AsciiString_14 extends TCollection_AsciiString {
    constructor(theStringUtf: Standard_WideChar);
  }

export declare class TCollection_ExtendedString {
  AssignCat_1(other: TCollection_ExtendedString): void;
  AssignCat_2(theChar: Standard_Utf16Char): void;
  Cat(other: TCollection_ExtendedString): TCollection_ExtendedString;
  ChangeAll(aChar: Standard_ExtCharacter, NewChar: Standard_ExtCharacter): void;
  Clear(): void;
  Copy(fromwhere: TCollection_ExtendedString): void;
  Swap(theOther: TCollection_ExtendedString): void;
  Insert_1(where: Graphic3d_ZLayerId, what: Standard_ExtCharacter): void;
  Insert_2(where: Graphic3d_ZLayerId, what: TCollection_ExtendedString): void;
  IsEmpty(): Standard_Boolean;
  IsEqual_1(other: Standard_ExtString): Standard_Boolean;
  IsEqual_2(other: TCollection_ExtendedString): Standard_Boolean;
  IsDifferent_1(other: Standard_ExtString): Standard_Boolean;
  IsDifferent_2(other: TCollection_ExtendedString): Standard_Boolean;
  IsLess_1(other: Standard_ExtString): Standard_Boolean;
  IsLess_2(other: TCollection_ExtendedString): Standard_Boolean;
  IsGreater_1(other: Standard_ExtString): Standard_Boolean;
  IsGreater_2(other: TCollection_ExtendedString): Standard_Boolean;
  StartsWith(theStartString: TCollection_ExtendedString): Standard_Boolean;
  EndsWith(theEndString: TCollection_ExtendedString): Standard_Boolean;
  IsAscii(): Standard_Boolean;
  Length(): Graphic3d_ZLayerId;
  Print(astream: Standard_OStream): void;
  RemoveAll(what: Standard_ExtCharacter): void;
  Remove(where: Graphic3d_ZLayerId, ahowmany: Graphic3d_ZLayerId): void;
  Search(what: TCollection_ExtendedString): Graphic3d_ZLayerId;
  SearchFromEnd(what: TCollection_ExtendedString): Graphic3d_ZLayerId;
  SetValue_1(where: Graphic3d_ZLayerId, what: Standard_ExtCharacter): void;
  SetValue_2(where: Graphic3d_ZLayerId, what: TCollection_ExtendedString): void;
  Split(where: Graphic3d_ZLayerId): TCollection_ExtendedString;
  Token(separators: Standard_ExtString, whichone: Graphic3d_ZLayerId): TCollection_ExtendedString;
  ToExtString(): Standard_ExtString;
  Trunc(ahowmany: Graphic3d_ZLayerId): void;
  Value(where: Graphic3d_ZLayerId): Standard_ExtCharacter;
  static HashCode(theString: TCollection_ExtendedString, theUpperBound: Graphic3d_ZLayerId): Graphic3d_ZLayerId;
  static IsEqual_3(theString1: TCollection_ExtendedString, theString2: TCollection_ExtendedString): Standard_Boolean;
  LengthOfCString(): Graphic3d_ZLayerId;
  delete(): void;
}

  export declare class TCollection_ExtendedString_1 extends TCollection_ExtendedString {
    constructor();
  }

  export declare class TCollection_ExtendedString_2 extends TCollection_ExtendedString {
    constructor(astring: Standard_CString, isMultiByte: Standard_Boolean);
  }

  export declare class TCollection_ExtendedString_3 extends TCollection_ExtendedString {
    constructor(astring: Standard_ExtString);
  }

  export declare class TCollection_ExtendedString_4 extends TCollection_ExtendedString {
    constructor(theStringUtf: Standard_WideChar);
  }

  export declare class TCollection_ExtendedString_5 extends TCollection_ExtendedString {
    constructor(aChar: Standard_Character);
  }

  export declare class TCollection_ExtendedString_6 extends TCollection_ExtendedString {
    constructor(aChar: Standard_ExtCharacter);
  }

  export declare class TCollection_ExtendedString_7 extends TCollection_ExtendedString {
    constructor(length: Graphic3d_ZLayerId, filler: Standard_ExtCharacter);
  }

  export declare class TCollection_ExtendedString_8 extends TCollection_ExtendedString {
    constructor(value: Graphic3d_ZLayerId);
  }

  export declare class TCollection_ExtendedString_9 extends TCollection_ExtendedString {
    constructor(value: Standard_Real);
  }

  export declare class TCollection_ExtendedString_10 extends TCollection_ExtendedString {
    constructor(astring: TCollection_ExtendedString);
  }

  export declare class TCollection_ExtendedString_11 extends TCollection_ExtendedString {
    constructor(theOther: TCollection_ExtendedString);
  }

  export declare class TCollection_ExtendedString_12 extends TCollection_ExtendedString {
    constructor(astring: XCAFDoc_PartId, isMultiByte: Standard_Boolean);
  }

export declare class TopExp {
  constructor();
  static MapShapes_1(S: TopoDS_Shape, T: TopAbs_ShapeEnum, M: TopTools_IndexedMapOfShape): void;
  static MapShapes_2(S: TopoDS_Shape, M: TopTools_IndexedMapOfShape, cumOri: Standard_Boolean, cumLoc: Standard_Boolean): void;
  static MapShapes_3(S: TopoDS_Shape, M: TopTools_MapOfShape, cumOri: Standard_Boolean, cumLoc: Standard_Boolean): void;
  static MapShapesAndAncestors(S: TopoDS_Shape, TS: TopAbs_ShapeEnum, TA: TopAbs_ShapeEnum, M: TopTools_IndexedDataMapOfShapeListOfShape): void;
  static MapShapesAndUniqueAncestors(S: TopoDS_Shape, TS: TopAbs_ShapeEnum, TA: TopAbs_ShapeEnum, M: TopTools_IndexedDataMapOfShapeListOfShape, useOrientation: Standard_Boolean): void;
  static FirstVertex(E: TopoDS_Edge, CumOri: Standard_Boolean): TopoDS_Vertex;
  static LastVertex(E: TopoDS_Edge, CumOri: Standard_Boolean): TopoDS_Vertex;
  static Vertices_1(E: TopoDS_Edge, Vfirst: TopoDS_Vertex, Vlast: TopoDS_Vertex, CumOri: Standard_Boolean): void;
  static Vertices_2(W: TopoDS_Wire, Vfirst: TopoDS_Vertex, Vlast: TopoDS_Vertex): void;
  static CommonVertex(E1: TopoDS_Edge, E2: TopoDS_Edge, V: TopoDS_Vertex): Standard_Boolean;
  delete(): void;
}

export declare class TopExp_Explorer {
  Init(S: TopoDS_Shape, ToFind: TopAbs_ShapeEnum, ToAvoid: TopAbs_ShapeEnum): void;
  More(): Standard_Boolean;
  Next(): void;
  Value(): TopoDS_Shape;
  Current(): TopoDS_Shape;
  ReInit(): void;
  ExploredShape(): TopoDS_Shape;
  Depth(): Graphic3d_ZLayerId;
  Clear(): void;
  delete(): void;
}

  export declare class TopExp_Explorer_1 extends TopExp_Explorer {
    constructor();
  }

  export declare class TopExp_Explorer_2 extends TopExp_Explorer {
    constructor(S: TopoDS_Shape, ToFind: TopAbs_ShapeEnum, ToAvoid: TopAbs_ShapeEnum);
  }

export declare class GProp_GProps {
  Add(Item: GProp_GProps, Density: Standard_Real): void;
  Mass(): Standard_Real;
  CentreOfMass(): gp_Pnt;
  MatrixOfInertia(): gp_Mat;
  StaticMoments(Ix: Standard_Real, Iy: Standard_Real, Iz: Standard_Real): void;
  MomentOfInertia(A: gp_Ax1): Standard_Real;
  PrincipalProperties(): GProp_PrincipalProps;
  RadiusOfGyration(A: gp_Ax1): Standard_Real;
  delete(): void;
}

  export declare class GProp_GProps_1 extends GProp_GProps {
    constructor();
  }

  export declare class GProp_GProps_2 extends GProp_GProps {
    constructor(SystemLocation: gp_Pnt);
  }

export declare class Handle_Poly_Triangulation {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Poly_Triangulation): void;
  get(): Poly_Triangulation;
  delete(): void;
}

  export declare class Handle_Poly_Triangulation_1 extends Handle_Poly_Triangulation {
    constructor();
  }

  export declare class Handle_Poly_Triangulation_2 extends Handle_Poly_Triangulation {
    constructor(thePtr: Poly_Triangulation);
  }

  export declare class Handle_Poly_Triangulation_3 extends Handle_Poly_Triangulation {
    constructor(theHandle: Handle_Poly_Triangulation);
  }

  export declare class Handle_Poly_Triangulation_4 extends Handle_Poly_Triangulation {
    constructor(theHandle: Handle_Poly_Triangulation);
  }

export declare class Poly_Triangulation extends Standard_Transient {
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  Copy(): Handle_Poly_Triangulation;
  Deflection_1(): Standard_Real;
  Deflection_2(theDeflection: Standard_Real): void;
  Parameters_1(): Handle_Poly_TriangulationParameters;
  Parameters_2(theParams: Handle_Poly_TriangulationParameters): void;
  Clear(): void;
  HasGeometry(): Standard_Boolean;
  NbNodes(): Graphic3d_ZLayerId;
  NbTriangles(): Graphic3d_ZLayerId;
  HasUVNodes(): Standard_Boolean;
  HasNormals(): Standard_Boolean;
  Node(theIndex: Graphic3d_ZLayerId): gp_Pnt;
  SetNode(theIndex: Graphic3d_ZLayerId, thePnt: gp_Pnt): void;
  UVNode(theIndex: Graphic3d_ZLayerId): gp_Pnt2d;
  SetUVNode(theIndex: Graphic3d_ZLayerId, thePnt: gp_Pnt2d): void;
  Triangle(theIndex: Graphic3d_ZLayerId): Poly_Triangle;
  SetTriangle(theIndex: Graphic3d_ZLayerId, theTriangle: Poly_Triangle): void;
  Normal_1(theIndex: Graphic3d_ZLayerId): gp_Dir;
  Normal_2(theIndex: Graphic3d_ZLayerId, theVec3: gp_Vec3f): void;
  SetNormal_1(theIndex: Graphic3d_ZLayerId, theNormal: gp_Vec3f): void;
  SetNormal_2(theIndex: Graphic3d_ZLayerId, theNormal: gp_Dir): void;
  MeshPurpose(): Poly_MeshPurpose;
  SetMeshPurpose(thePurpose: Poly_MeshPurpose): void;
  CachedMinMax(): Bnd_Box;
  SetCachedMinMax(theBox: Bnd_Box): void;
  HasCachedMinMax(): Standard_Boolean;
  UpdateCachedMinMax(): void;
  MinMax(theBox: Bnd_Box, theTrsf: gp_Trsf, theIsAccurate: Standard_Boolean): Standard_Boolean;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  IsDoublePrecision(): Standard_Boolean;
  SetDoublePrecision(theIsDouble: Standard_Boolean): void;
  ResizeNodes(theNbNodes: Graphic3d_ZLayerId, theToCopyOld: Standard_Boolean): void;
  ResizeTriangles(theNbTriangles: Graphic3d_ZLayerId, theToCopyOld: Standard_Boolean): void;
  AddUVNodes(): void;
  RemoveUVNodes(): void;
  AddNormals(): void;
  RemoveNormals(): void;
  ComputeNormals(): void;
  MapNodeArray(): Handle_TColgp_HArray1OfPnt;
  MapTriangleArray(): Handle_Poly_HArray1OfTriangle;
  MapUVNodeArray(): Handle_TColgp_HArray1OfPnt2d;
  MapNormalArray(): Handle_TShort_HArray1OfShortReal;
  InternalTriangles(): Poly_Array1OfTriangle;
  InternalNodes(): Poly_ArrayOfNodes;
  InternalUVNodes(): Poly_ArrayOfUVNodes;
  InternalNormals(): any;
  SetNormals(theNormals: Handle_TShort_HArray1OfShortReal): void;
  Triangles(): Poly_Array1OfTriangle;
  ChangeTriangles(): Poly_Array1OfTriangle;
  ChangeTriangle(theIndex: Graphic3d_ZLayerId): Poly_Triangle;
  NbDeferredNodes(): Graphic3d_ZLayerId;
  NbDeferredTriangles(): Graphic3d_ZLayerId;
  HasDeferredData(): Standard_Boolean;
  LoadDeferredData(theFileSystem: any): Standard_Boolean;
  DetachedLoadDeferredData(theFileSystem: any): Handle_Poly_Triangulation;
  UnloadDeferredData(): Standard_Boolean;
  delete(): void;
}

  export declare class Poly_Triangulation_1 extends Poly_Triangulation {
    constructor();
  }

  export declare class Poly_Triangulation_2 extends Poly_Triangulation {
    constructor(theNbNodes: Graphic3d_ZLayerId, theNbTriangles: Graphic3d_ZLayerId, theHasUVNodes: Standard_Boolean, theHasNormals: Standard_Boolean);
  }

  export declare class Poly_Triangulation_3 extends Poly_Triangulation {
    constructor(Nodes: TColgp_Array1OfPnt, Triangles: Poly_Array1OfTriangle);
  }

  export declare class Poly_Triangulation_4 extends Poly_Triangulation {
    constructor(Nodes: TColgp_Array1OfPnt, UVNodes: TColgp_Array1OfPnt2d, Triangles: Poly_Array1OfTriangle);
  }

  export declare class Poly_Triangulation_5 extends Poly_Triangulation {
    constructor(theTriangulation: Handle_Poly_Triangulation);
  }

export declare class TColStd_Array1OfInteger {
  begin(): any;
  end(): any;
  cbegin(): any;
  cend(): any;
  Init(theValue: Standard_Integer): void;
  Size(): Standard_Integer;
  Length(): Standard_Integer;
  IsEmpty(): Standard_Boolean;
  Lower(): Standard_Integer;
  Upper(): Standard_Integer;
  IsDeletable(): Standard_Boolean;
  IsAllocated(): Standard_Boolean;
  Assign(theOther: TColStd_Array1OfInteger): TColStd_Array1OfInteger;
  Move(theOther: TColStd_Array1OfInteger): TColStd_Array1OfInteger;
  First(): Standard_Integer;
  ChangeFirst(): Standard_Integer;
  Last(): Standard_Integer;
  ChangeLast(): Standard_Integer;
  Value(theIndex: Standard_Integer): Standard_Integer;
  ChangeValue(theIndex: Standard_Integer): Standard_Integer;
  SetValue(theIndex: Standard_Integer, theItem: Standard_Integer): void;
  Resize(theLower: Standard_Integer, theUpper: Standard_Integer, theToCopyData: Standard_Boolean): void;
  delete(): void;
}

  export declare class TColStd_Array1OfInteger_1 extends TColStd_Array1OfInteger {
    constructor();
  }

  export declare class TColStd_Array1OfInteger_2 extends TColStd_Array1OfInteger {
    constructor(theLower: Standard_Integer, theUpper: Standard_Integer);
  }

  export declare class TColStd_Array1OfInteger_3 extends TColStd_Array1OfInteger {
    constructor(theOther: TColStd_Array1OfInteger);
  }

  export declare class TColStd_Array1OfInteger_4 extends TColStd_Array1OfInteger {
    constructor(theOther: TColStd_Array1OfInteger);
  }

  export declare class TColStd_Array1OfInteger_5 extends TColStd_Array1OfInteger {
    constructor(theBegin: Standard_Integer, theLower: Standard_Integer, theUpper: Standard_Integer);
  }

export declare class TColStd_Array1OfReal {
  begin(): any;
  end(): any;
  cbegin(): any;
  cend(): any;
  Init(theValue: Standard_Real): void;
  Size(): Standard_Integer;
  Length(): Standard_Integer;
  IsEmpty(): Standard_Boolean;
  Lower(): Standard_Integer;
  Upper(): Standard_Integer;
  IsDeletable(): Standard_Boolean;
  IsAllocated(): Standard_Boolean;
  Assign(theOther: TColStd_Array1OfReal): TColStd_Array1OfReal;
  Move(theOther: TColStd_Array1OfReal): TColStd_Array1OfReal;
  First(): Standard_Real;
  ChangeFirst(): Standard_Real;
  Last(): Standard_Real;
  ChangeLast(): Standard_Real;
  Value(theIndex: Standard_Integer): Standard_Real;
  ChangeValue(theIndex: Standard_Integer): Standard_Real;
  SetValue(theIndex: Standard_Integer, theItem: Standard_Real): void;
  Resize(theLower: Standard_Integer, theUpper: Standard_Integer, theToCopyData: Standard_Boolean): void;
  delete(): void;
}

  export declare class TColStd_Array1OfReal_1 extends TColStd_Array1OfReal {
    constructor();
  }

  export declare class TColStd_Array1OfReal_2 extends TColStd_Array1OfReal {
    constructor(theLower: Standard_Integer, theUpper: Standard_Integer);
  }

  export declare class TColStd_Array1OfReal_3 extends TColStd_Array1OfReal {
    constructor(theOther: TColStd_Array1OfReal);
  }

  export declare class TColStd_Array1OfReal_4 extends TColStd_Array1OfReal {
    constructor(theOther: TColStd_Array1OfReal);
  }

  export declare class TColStd_Array1OfReal_5 extends TColStd_Array1OfReal {
    constructor(theBegin: Standard_Real, theLower: Standard_Integer, theUpper: Standard_Integer);
  }

export declare class TColStd_Array2OfReal {
  Init(theValue: Standard_Real): void;
  Size(): Standard_Integer;
  Length(): Standard_Integer;
  NbRows(): Standard_Integer;
  NbColumns(): Standard_Integer;
  RowLength(): Standard_Integer;
  ColLength(): Standard_Integer;
  LowerRow(): Standard_Integer;
  UpperRow(): Standard_Integer;
  LowerCol(): Standard_Integer;
  UpperCol(): Standard_Integer;
  IsDeletable(): Standard_Boolean;
  Assign(theOther: TColStd_Array2OfReal): TColStd_Array2OfReal;
  Move(theOther: TColStd_Array2OfReal): TColStd_Array2OfReal;
  Value(theRow: Standard_Integer, theCol: Standard_Integer): Standard_Real;
  ChangeValue(theRow: Standard_Integer, theCol: Standard_Integer): Standard_Real;
  SetValue(theRow: Standard_Integer, theCol: Standard_Integer, theItem: Standard_Real): void;
  Resize(theRowLower: Standard_Integer, theRowUpper: Standard_Integer, theColLower: Standard_Integer, theColUpper: Standard_Integer, theToCopyData: Standard_Boolean): void;
  delete(): void;
}

  export declare class TColStd_Array2OfReal_1 extends TColStd_Array2OfReal {
    constructor();
  }

  export declare class TColStd_Array2OfReal_2 extends TColStd_Array2OfReal {
    constructor(theRowLower: Standard_Integer, theRowUpper: Standard_Integer, theColLower: Standard_Integer, theColUpper: Standard_Integer);
  }

  export declare class TColStd_Array2OfReal_3 extends TColStd_Array2OfReal {
    constructor(theOther: TColStd_Array2OfReal);
  }

  export declare class TColStd_Array2OfReal_4 extends TColStd_Array2OfReal {
    constructor(theOther: TColStd_Array2OfReal);
  }

  export declare class TColStd_Array2OfReal_5 extends TColStd_Array2OfReal {
    constructor(theBegin: Standard_Real, theRowLower: Standard_Integer, theRowUpper: Standard_Integer, theColLower: Standard_Integer, theColUpper: Standard_Integer);
  }

export declare class Standard_Transient {
  Delete(): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  IsInstance_1(theType: Handle_Standard_Type): Standard_Boolean;
  IsInstance_2(theTypeName: Standard_CString): Standard_Boolean;
  IsKind_1(theType: Handle_Standard_Type): Standard_Boolean;
  IsKind_2(theTypeName: Standard_CString): Standard_Boolean;
  This(): Standard_Transient;
  GetRefCount(): Graphic3d_ZLayerId;
  IncrementRefCounter(): void;
  DecrementRefCounter(): Graphic3d_ZLayerId;
  delete(): void;
}

  export declare class Standard_Transient_1 extends Standard_Transient {
    constructor();
  }

  export declare class Standard_Transient_2 extends Standard_Transient {
    constructor(a: Standard_Transient);
  }

export declare class Handle_Standard_Transient {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Standard_Transient): void;
  get(): Standard_Transient;
  delete(): void;
}

  export declare class Handle_Standard_Transient_1 extends Handle_Standard_Transient {
    constructor();
  }

  export declare class Handle_Standard_Transient_2 extends Handle_Standard_Transient {
    constructor(thePtr: Standard_Transient);
  }

  export declare class Handle_Standard_Transient_3 extends Handle_Standard_Transient {
    constructor(theHandle: Handle_Standard_Transient);
  }

  export declare class Handle_Standard_Transient_4 extends Handle_Standard_Transient {
    constructor(theHandle: Handle_Standard_Transient);
  }

export declare class BRepCheck_Analyzer {
  constructor(S: TopoDS_Shape, GeomControls: Standard_Boolean, theIsParallel: Standard_Boolean)
  Init(S: TopoDS_Shape, GeomControls: Standard_Boolean, theIsParallel: Standard_Boolean): void;
  IsValid_1(S: TopoDS_Shape): Standard_Boolean;
  IsValid_2(): Standard_Boolean;
  Result(theSubS: TopoDS_Shape): Handle_BRepCheck_Result;
  delete(): void;
}

export declare class Handle_ShapeFix_Wire {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: ShapeFix_Wire): void;
  get(): ShapeFix_Wire;
  delete(): void;
}

  export declare class Handle_ShapeFix_Wire_1 extends Handle_ShapeFix_Wire {
    constructor();
  }

  export declare class Handle_ShapeFix_Wire_2 extends Handle_ShapeFix_Wire {
    constructor(thePtr: ShapeFix_Wire);
  }

  export declare class Handle_ShapeFix_Wire_3 extends Handle_ShapeFix_Wire {
    constructor(theHandle: Handle_ShapeFix_Wire);
  }

  export declare class Handle_ShapeFix_Wire_4 extends Handle_ShapeFix_Wire {
    constructor(theHandle: Handle_ShapeFix_Wire);
  }

export declare class ShapeFix_Wire extends ShapeFix_Root {
  ClearModes(): void;
  ClearStatuses(): void;
  Init_1(wire: TopoDS_Wire, face: TopoDS_Face, prec: Standard_Real): void;
  Init_2(saw: Handle_ShapeAnalysis_Wire): void;
  Load_1(wire: TopoDS_Wire): void;
  Load_2(sbwd: Handle_ShapeExtend_WireData): void;
  SetFace(face: TopoDS_Face): void;
  SetSurface_1(surf: Handle_Geom_Surface): void;
  SetSurface_2(surf: Handle_Geom_Surface, loc: TopLoc_Location): void;
  SetPrecision(prec: Standard_Real): void;
  SetMaxTailAngle(theMaxTailAngle: Standard_Real): void;
  SetMaxTailWidth(theMaxTailWidth: Standard_Real): void;
  IsLoaded(): Standard_Boolean;
  IsReady(): Standard_Boolean;
  NbEdges(): Graphic3d_ZLayerId;
  Wire(): TopoDS_Wire;
  WireAPIMake(): TopoDS_Wire;
  Analyzer(): Handle_ShapeAnalysis_Wire;
  WireData(): Handle_ShapeExtend_WireData;
  Face(): TopoDS_Face;
  ModifyTopologyMode(): Standard_Boolean;
  ModifyGeometryMode(): Standard_Boolean;
  ModifyRemoveLoopMode(): Graphic3d_ZLayerId;
  ClosedWireMode(): Standard_Boolean;
  PreferencePCurveMode(): Standard_Boolean;
  FixGapsByRangesMode(): Standard_Boolean;
  FixReorderMode(): Graphic3d_ZLayerId;
  FixSmallMode(): Graphic3d_ZLayerId;
  FixConnectedMode(): Graphic3d_ZLayerId;
  FixEdgeCurvesMode(): Graphic3d_ZLayerId;
  FixDegeneratedMode(): Graphic3d_ZLayerId;
  FixSelfIntersectionMode(): Graphic3d_ZLayerId;
  FixLackingMode(): Graphic3d_ZLayerId;
  FixGaps3dMode(): Graphic3d_ZLayerId;
  FixGaps2dMode(): Graphic3d_ZLayerId;
  FixReversed2dMode(): Graphic3d_ZLayerId;
  FixRemovePCurveMode(): Graphic3d_ZLayerId;
  FixAddPCurveMode(): Graphic3d_ZLayerId;
  FixRemoveCurve3dMode(): Graphic3d_ZLayerId;
  FixAddCurve3dMode(): Graphic3d_ZLayerId;
  FixSeamMode(): Graphic3d_ZLayerId;
  FixShiftedMode(): Graphic3d_ZLayerId;
  FixSameParameterMode(): Graphic3d_ZLayerId;
  FixVertexToleranceMode(): Graphic3d_ZLayerId;
  FixNotchedEdgesMode(): Graphic3d_ZLayerId;
  FixSelfIntersectingEdgeMode(): Graphic3d_ZLayerId;
  FixIntersectingEdgesMode(): Graphic3d_ZLayerId;
  FixNonAdjacentIntersectingEdgesMode(): Graphic3d_ZLayerId;
  FixTailMode(): Graphic3d_ZLayerId;
  Perform(): Standard_Boolean;
  FixReorder_1(): Standard_Boolean;
  FixSmall_1(lockvtx: Standard_Boolean, precsmall: Standard_Real): Graphic3d_ZLayerId;
  FixConnected_1(prec: Standard_Real): Standard_Boolean;
  FixEdgeCurves(): Standard_Boolean;
  FixDegenerated_1(): Standard_Boolean;
  FixSelfIntersection(): Standard_Boolean;
  FixLacking_1(force: Standard_Boolean): Standard_Boolean;
  FixClosed(prec: Standard_Real): Standard_Boolean;
  FixGaps3d(): Standard_Boolean;
  FixGaps2d(): Standard_Boolean;
  FixReorder_2(wi: ShapeAnalysis_WireOrder): Standard_Boolean;
  FixSmall_2(num: Graphic3d_ZLayerId, lockvtx: Standard_Boolean, precsmall: Standard_Real): Standard_Boolean;
  FixConnected_2(num: Graphic3d_ZLayerId, prec: Standard_Real): Standard_Boolean;
  FixSeam(num: Graphic3d_ZLayerId): Standard_Boolean;
  FixShifted(): Standard_Boolean;
  FixDegenerated_2(num: Graphic3d_ZLayerId): Standard_Boolean;
  FixLacking_2(num: Graphic3d_ZLayerId, force: Standard_Boolean): Standard_Boolean;
  FixNotchedEdges(): Standard_Boolean;
  FixGap3d(num: Graphic3d_ZLayerId, convert: Standard_Boolean): Standard_Boolean;
  FixGap2d(num: Graphic3d_ZLayerId, convert: Standard_Boolean): Standard_Boolean;
  FixTails(): Standard_Boolean;
  StatusReorder(status: ShapeExtend_Status): Standard_Boolean;
  StatusSmall(status: ShapeExtend_Status): Standard_Boolean;
  StatusConnected(status: ShapeExtend_Status): Standard_Boolean;
  StatusEdgeCurves(status: ShapeExtend_Status): Standard_Boolean;
  StatusDegenerated(status: ShapeExtend_Status): Standard_Boolean;
  StatusSelfIntersection(status: ShapeExtend_Status): Standard_Boolean;
  StatusLacking(status: ShapeExtend_Status): Standard_Boolean;
  StatusClosed(status: ShapeExtend_Status): Standard_Boolean;
  StatusGaps3d(status: ShapeExtend_Status): Standard_Boolean;
  StatusGaps2d(status: ShapeExtend_Status): Standard_Boolean;
  StatusNotches(status: ShapeExtend_Status): Standard_Boolean;
  StatusRemovedSegment(): Standard_Boolean;
  StatusFixTails(status: ShapeExtend_Status): Standard_Boolean;
  LastFixStatus(status: ShapeExtend_Status): Standard_Boolean;
  FixEdgeTool(): Handle_ShapeFix_Edge;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

  export declare class ShapeFix_Wire_1 extends ShapeFix_Wire {
    constructor();
  }

  export declare class ShapeFix_Wire_2 extends ShapeFix_Wire {
    constructor(wire: TopoDS_Wire, face: TopoDS_Face, prec: Standard_Real);
  }

export declare class ShapeFix_Shape extends ShapeFix_Root {
  Init(shape: TopoDS_Shape): void;
  Perform(theProgress: Message_ProgressRange): Standard_Boolean;
  Shape(): TopoDS_Shape;
  FixSolidTool(): Handle_ShapeFix_Solid;
  FixShellTool(): Handle_ShapeFix_Shell;
  FixFaceTool(): Handle_ShapeFix_Face;
  FixWireTool(): Handle_ShapeFix_Wire;
  FixEdgeTool(): Handle_ShapeFix_Edge;
  Status(status: ShapeExtend_Status): Standard_Boolean;
  SetMsgRegistrator(msgreg: Handle_ShapeExtend_BasicMsgRegistrator): void;
  SetPrecision(preci: Standard_Real): void;
  SetMinTolerance(mintol: Standard_Real): void;
  SetMaxTolerance(maxtol: Standard_Real): void;
  FixSolidMode(): Graphic3d_ZLayerId;
  FixFreeShellMode(): Graphic3d_ZLayerId;
  FixFreeFaceMode(): Graphic3d_ZLayerId;
  FixFreeWireMode(): Graphic3d_ZLayerId;
  FixSameParameterMode(): Graphic3d_ZLayerId;
  FixVertexPositionMode(): Graphic3d_ZLayerId;
  FixVertexTolMode(): Graphic3d_ZLayerId;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

  export declare class ShapeFix_Shape_1 extends ShapeFix_Shape {
    constructor();
  }

  export declare class ShapeFix_Shape_2 extends ShapeFix_Shape {
    constructor(shape: TopoDS_Shape);
  }

export declare class Handle_ShapeFix_Shape {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: ShapeFix_Shape): void;
  get(): ShapeFix_Shape;
  delete(): void;
}

  export declare class Handle_ShapeFix_Shape_1 extends Handle_ShapeFix_Shape {
    constructor();
  }

  export declare class Handle_ShapeFix_Shape_2 extends Handle_ShapeFix_Shape {
    constructor(thePtr: ShapeFix_Shape);
  }

  export declare class Handle_ShapeFix_Shape_3 extends Handle_ShapeFix_Shape {
    constructor(theHandle: Handle_ShapeFix_Shape);
  }

  export declare class Handle_ShapeFix_Shape_4 extends Handle_ShapeFix_Shape {
    constructor(theHandle: Handle_ShapeFix_Shape);
  }

export declare class ShapeFix_Shell extends ShapeFix_Root {
  Init(shell: TopoDS_Shell): void;
  Perform(theProgress: Message_ProgressRange): Standard_Boolean;
  FixFaceOrientation(shell: TopoDS_Shell, isAccountMultiConex: Standard_Boolean, NonManifold: Standard_Boolean): Standard_Boolean;
  Shell(): TopoDS_Shell;
  Shape(): TopoDS_Shape;
  NbShells(): Graphic3d_ZLayerId;
  ErrorFaces(): TopoDS_Compound;
  Status(status: ShapeExtend_Status): Standard_Boolean;
  FixFaceTool(): Handle_ShapeFix_Face;
  SetMsgRegistrator(msgreg: Handle_ShapeExtend_BasicMsgRegistrator): void;
  SetPrecision(preci: Standard_Real): void;
  SetMinTolerance(mintol: Standard_Real): void;
  SetMaxTolerance(maxtol: Standard_Real): void;
  FixFaceMode(): Graphic3d_ZLayerId;
  FixOrientationMode(): Graphic3d_ZLayerId;
  SetNonManifoldFlag(isNonManifold: Standard_Boolean): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

  export declare class ShapeFix_Shell_1 extends ShapeFix_Shell {
    constructor();
  }

  export declare class ShapeFix_Shell_2 extends ShapeFix_Shell {
    constructor(shape: TopoDS_Shell);
  }

export declare class Handle_ShapeFix_Shell {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: ShapeFix_Shell): void;
  get(): ShapeFix_Shell;
  delete(): void;
}

  export declare class Handle_ShapeFix_Shell_1 extends Handle_ShapeFix_Shell {
    constructor();
  }

  export declare class Handle_ShapeFix_Shell_2 extends Handle_ShapeFix_Shell {
    constructor(thePtr: ShapeFix_Shell);
  }

  export declare class Handle_ShapeFix_Shell_3 extends Handle_ShapeFix_Shell {
    constructor(theHandle: Handle_ShapeFix_Shell);
  }

  export declare class Handle_ShapeFix_Shell_4 extends Handle_ShapeFix_Shell {
    constructor(theHandle: Handle_ShapeFix_Shell);
  }

export declare class ShapeFix {
  constructor();
  static SameParameter(shape: TopoDS_Shape, enforce: Standard_Boolean, preci: Standard_Real, theProgress: Message_ProgressRange, theMsgReg: Handle_ShapeExtend_BasicMsgRegistrator): Standard_Boolean;
  static EncodeRegularity(shape: TopoDS_Shape, tolang: Standard_Real): void;
  static RemoveSmallEdges(shape: TopoDS_Shape, Tolerance: Standard_Real, context: Handle_ShapeBuild_ReShape): TopoDS_Shape;
  static FixVertexPosition(theshape: TopoDS_Shape, theTolerance: Standard_Real, thecontext: Handle_ShapeBuild_ReShape): Standard_Boolean;
  static LeastEdgeSize(theshape: TopoDS_Shape): Standard_Real;
  delete(): void;
}

export declare class Handle_ShapeFix_Root {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: ShapeFix_Root): void;
  get(): ShapeFix_Root;
  delete(): void;
}

  export declare class Handle_ShapeFix_Root_1 extends Handle_ShapeFix_Root {
    constructor();
  }

  export declare class Handle_ShapeFix_Root_2 extends Handle_ShapeFix_Root {
    constructor(thePtr: ShapeFix_Root);
  }

  export declare class Handle_ShapeFix_Root_3 extends Handle_ShapeFix_Root {
    constructor(theHandle: Handle_ShapeFix_Root);
  }

  export declare class Handle_ShapeFix_Root_4 extends Handle_ShapeFix_Root {
    constructor(theHandle: Handle_ShapeFix_Root);
  }

export declare class ShapeFix_Root extends Standard_Transient {
  constructor()
  Set(Root: Handle_ShapeFix_Root): void;
  SetContext(context: Handle_ShapeBuild_ReShape): void;
  Context(): Handle_ShapeBuild_ReShape;
  SetMsgRegistrator(msgreg: Handle_ShapeExtend_BasicMsgRegistrator): void;
  MsgRegistrator(): Handle_ShapeExtend_BasicMsgRegistrator;
  SetPrecision(preci: Standard_Real): void;
  Precision(): Standard_Real;
  SetMinTolerance(mintol: Standard_Real): void;
  MinTolerance(): Standard_Real;
  SetMaxTolerance(maxtol: Standard_Real): void;
  MaxTolerance(): Standard_Real;
  LimitTolerance(toler: Standard_Real): Standard_Real;
  SendMsg_1(shape: TopoDS_Shape, message: Message_Msg, gravity: Message_Gravity): void;
  SendMsg_2(message: Message_Msg, gravity: Message_Gravity): void;
  SendWarning_1(shape: TopoDS_Shape, message: Message_Msg): void;
  SendWarning_2(message: Message_Msg): void;
  SendFail_1(shape: TopoDS_Shape, message: Message_Msg): void;
  SendFail_2(message: Message_Msg): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

export declare class Handle_ShapeFix_Face {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: ShapeFix_Face): void;
  get(): ShapeFix_Face;
  delete(): void;
}

  export declare class Handle_ShapeFix_Face_1 extends Handle_ShapeFix_Face {
    constructor();
  }

  export declare class Handle_ShapeFix_Face_2 extends Handle_ShapeFix_Face {
    constructor(thePtr: ShapeFix_Face);
  }

  export declare class Handle_ShapeFix_Face_3 extends Handle_ShapeFix_Face {
    constructor(theHandle: Handle_ShapeFix_Face);
  }

  export declare class Handle_ShapeFix_Face_4 extends Handle_ShapeFix_Face {
    constructor(theHandle: Handle_ShapeFix_Face);
  }

export declare class ShapeFix_Face extends ShapeFix_Root {
  ClearModes(): void;
  Init_1(face: TopoDS_Face): void;
  Init_2(surf: Handle_Geom_Surface, preci: Standard_Real, fwd: Standard_Boolean): void;
  Init_3(surf: Handle_ShapeAnalysis_Surface, preci: Standard_Real, fwd: Standard_Boolean): void;
  SetMsgRegistrator(msgreg: Handle_ShapeExtend_BasicMsgRegistrator): void;
  SetPrecision(preci: Standard_Real): void;
  SetMinTolerance(mintol: Standard_Real): void;
  SetMaxTolerance(maxtol: Standard_Real): void;
  FixWireMode(): Graphic3d_ZLayerId;
  FixOrientationMode(): Graphic3d_ZLayerId;
  FixAddNaturalBoundMode(): Graphic3d_ZLayerId;
  FixMissingSeamMode(): Graphic3d_ZLayerId;
  FixSmallAreaWireMode(): Graphic3d_ZLayerId;
  RemoveSmallAreaFaceMode(): Graphic3d_ZLayerId;
  FixIntersectingWiresMode(): Graphic3d_ZLayerId;
  FixLoopWiresMode(): Graphic3d_ZLayerId;
  FixSplitFaceMode(): Graphic3d_ZLayerId;
  AutoCorrectPrecisionMode(): Graphic3d_ZLayerId;
  FixPeriodicDegeneratedMode(): Graphic3d_ZLayerId;
  Face(): TopoDS_Face;
  Result(): TopoDS_Shape;
  Add(wire: TopoDS_Wire): void;
  Perform(): Standard_Boolean;
  FixOrientation_1(): Standard_Boolean;
  FixOrientation_2(MapWires: TopTools_DataMapOfShapeListOfShape): Standard_Boolean;
  FixAddNaturalBound(): Standard_Boolean;
  FixMissingSeam(): Standard_Boolean;
  FixSmallAreaWire(theIsRemoveSmallFace: Standard_Boolean): Standard_Boolean;
  FixLoopWire(aResWires: TopTools_SequenceOfShape): Standard_Boolean;
  FixIntersectingWires(): Standard_Boolean;
  FixWiresTwoCoincEdges(): Standard_Boolean;
  FixSplitFace(MapWires: TopTools_DataMapOfShapeListOfShape): Standard_Boolean;
  FixPeriodicDegenerated(): Standard_Boolean;
  Status(status: ShapeExtend_Status): Standard_Boolean;
  FixWireTool(): Handle_ShapeFix_Wire;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

  export declare class ShapeFix_Face_1 extends ShapeFix_Face {
    constructor();
  }

  export declare class ShapeFix_Face_2 extends ShapeFix_Face {
    constructor(face: TopoDS_Face);
  }

export declare class Message_ProgressRange {
  UserBreak(): Standard_Boolean;
  More(): Standard_Boolean;
  IsActive(): Standard_Boolean;
  Close(): void;
  delete(): void;
}

  export declare class Message_ProgressRange_1 extends Message_ProgressRange {
    constructor();
  }

  export declare class Message_ProgressRange_2 extends Message_ProgressRange {
    constructor(theOther: Message_ProgressRange);
  }

export declare class Bnd_Box {
  SetWhole(): void;
  SetVoid(): void;
  Set_1(P: gp_Pnt): void;
  Set_2(P: gp_Pnt, D: gp_Dir): void;
  Update_1(aXmin: Standard_Real, aYmin: Standard_Real, aZmin: Standard_Real, aXmax: Standard_Real, aYmax: Standard_Real, aZmax: Standard_Real): void;
  Update_2(X: Standard_Real, Y: Standard_Real, Z: Standard_Real): void;
  GetGap(): Standard_Real;
  SetGap(Tol: Standard_Real): void;
  Enlarge(Tol: Standard_Real): void;
  Get(theXmin: Standard_Real, theYmin: Standard_Real, theZmin: Standard_Real, theXmax: Standard_Real, theYmax: Standard_Real, theZmax: Standard_Real): void;
  CornerMin(): gp_Pnt;
  CornerMax(): gp_Pnt;
  OpenXmin(): void;
  OpenXmax(): void;
  OpenYmin(): void;
  OpenYmax(): void;
  OpenZmin(): void;
  OpenZmax(): void;
  IsOpen(): Standard_Boolean;
  IsOpenXmin(): Standard_Boolean;
  IsOpenXmax(): Standard_Boolean;
  IsOpenYmin(): Standard_Boolean;
  IsOpenYmax(): Standard_Boolean;
  IsOpenZmin(): Standard_Boolean;
  IsOpenZmax(): Standard_Boolean;
  IsWhole(): Standard_Boolean;
  IsVoid(): Standard_Boolean;
  IsXThin(tol: Standard_Real): Standard_Boolean;
  IsYThin(tol: Standard_Real): Standard_Boolean;
  IsZThin(tol: Standard_Real): Standard_Boolean;
  IsThin(tol: Standard_Real): Standard_Boolean;
  Transformed(T: gp_Trsf): Bnd_Box;
  Add_1(Other: Bnd_Box): void;
  Add_2(P: gp_Pnt): void;
  Add_3(P: gp_Pnt, D: gp_Dir): void;
  Add_4(D: gp_Dir): void;
  IsOut_1(P: gp_Pnt): Standard_Boolean;
  IsOut_2(L: gp_Lin): Standard_Boolean;
  IsOut_3(P: gp_Pln): Standard_Boolean;
  IsOut_4(Other: Bnd_Box): Standard_Boolean;
  IsOut_5(Other: Bnd_Box, T: gp_Trsf): Standard_Boolean;
  IsOut_6(T1: gp_Trsf, Other: Bnd_Box, T2: gp_Trsf): Standard_Boolean;
  IsOut_7(P1: gp_Pnt, P2: gp_Pnt, D: gp_Dir): Standard_Boolean;
  Distance(Other: Bnd_Box): Standard_Real;
  Dump(): void;
  SquareExtent(): Standard_Real;
  FinitePart(): Bnd_Box;
  HasFinitePart(): Standard_Boolean;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  InitFromJson(theSStream: Standard_SStream, theStreamPos: Graphic3d_ZLayerId): Standard_Boolean;
  delete(): void;
}

  export declare class Bnd_Box_1 extends Bnd_Box {
    constructor();
  }

  export declare class Bnd_Box_2 extends Bnd_Box {
    constructor(theMin: gp_Pnt, theMax: gp_Pnt);
  }

export declare class TopLoc_Location {
  IsIdentity(): Standard_Boolean;
  Identity(): void;
  FirstDatum(): Handle_TopLoc_Datum3D;
  FirstPower(): Graphic3d_ZLayerId;
  NextLocation(): TopLoc_Location;
  Transformation(): gp_Trsf;
  Inverted(): TopLoc_Location;
  Multiplied(Other: TopLoc_Location): TopLoc_Location;
  Divided(Other: TopLoc_Location): TopLoc_Location;
  Predivided(Other: TopLoc_Location): TopLoc_Location;
  Powered(pwr: Graphic3d_ZLayerId): TopLoc_Location;
  HashCode(theUpperBound: Graphic3d_ZLayerId): Graphic3d_ZLayerId;
  IsEqual(Other: TopLoc_Location): Standard_Boolean;
  IsDifferent(Other: TopLoc_Location): Standard_Boolean;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  ShallowDump(S: Standard_OStream): void;
  Clear(): void;
  static ScalePrec(): Standard_Real;
  delete(): void;
}

  export declare class TopLoc_Location_1 extends TopLoc_Location {
    constructor();
  }

  export declare class TopLoc_Location_2 extends TopLoc_Location {
    constructor(T: gp_Trsf);
  }

  export declare class TopLoc_Location_3 extends TopLoc_Location {
    constructor(D: Handle_TopLoc_Datum3D);
  }

export declare class TColgp_Array2OfPnt {
  Init(theValue: gp_Pnt): void;
  Size(): Standard_Integer;
  Length(): Standard_Integer;
  NbRows(): Standard_Integer;
  NbColumns(): Standard_Integer;
  RowLength(): Standard_Integer;
  ColLength(): Standard_Integer;
  LowerRow(): Standard_Integer;
  UpperRow(): Standard_Integer;
  LowerCol(): Standard_Integer;
  UpperCol(): Standard_Integer;
  IsDeletable(): Standard_Boolean;
  Assign(theOther: TColgp_Array2OfPnt): TColgp_Array2OfPnt;
  Move(theOther: TColgp_Array2OfPnt): TColgp_Array2OfPnt;
  Value(theRow: Standard_Integer, theCol: Standard_Integer): gp_Pnt;
  ChangeValue(theRow: Standard_Integer, theCol: Standard_Integer): gp_Pnt;
  SetValue(theRow: Standard_Integer, theCol: Standard_Integer, theItem: gp_Pnt): void;
  Resize(theRowLower: Standard_Integer, theRowUpper: Standard_Integer, theColLower: Standard_Integer, theColUpper: Standard_Integer, theToCopyData: Standard_Boolean): void;
  delete(): void;
}

  export declare class TColgp_Array2OfPnt_1 extends TColgp_Array2OfPnt {
    constructor();
  }

  export declare class TColgp_Array2OfPnt_2 extends TColgp_Array2OfPnt {
    constructor(theRowLower: Standard_Integer, theRowUpper: Standard_Integer, theColLower: Standard_Integer, theColUpper: Standard_Integer);
  }

  export declare class TColgp_Array2OfPnt_3 extends TColgp_Array2OfPnt {
    constructor(theOther: TColgp_Array2OfPnt);
  }

  export declare class TColgp_Array2OfPnt_4 extends TColgp_Array2OfPnt {
    constructor(theOther: TColgp_Array2OfPnt);
  }

  export declare class TColgp_Array2OfPnt_5 extends TColgp_Array2OfPnt {
    constructor(theBegin: gp_Pnt, theRowLower: Standard_Integer, theRowUpper: Standard_Integer, theColLower: Standard_Integer, theColUpper: Standard_Integer);
  }

export declare class TColgp_Array1OfPnt2d {
  begin(): any;
  end(): any;
  cbegin(): any;
  cend(): any;
  Init(theValue: gp_Pnt2d): void;
  Size(): Standard_Integer;
  Length(): Standard_Integer;
  IsEmpty(): Standard_Boolean;
  Lower(): Standard_Integer;
  Upper(): Standard_Integer;
  IsDeletable(): Standard_Boolean;
  IsAllocated(): Standard_Boolean;
  Assign(theOther: TColgp_Array1OfPnt2d): TColgp_Array1OfPnt2d;
  Move(theOther: TColgp_Array1OfPnt2d): TColgp_Array1OfPnt2d;
  First(): gp_Pnt2d;
  ChangeFirst(): gp_Pnt2d;
  Last(): gp_Pnt2d;
  ChangeLast(): gp_Pnt2d;
  Value(theIndex: Standard_Integer): gp_Pnt2d;
  ChangeValue(theIndex: Standard_Integer): gp_Pnt2d;
  SetValue(theIndex: Standard_Integer, theItem: gp_Pnt2d): void;
  Resize(theLower: Standard_Integer, theUpper: Standard_Integer, theToCopyData: Standard_Boolean): void;
  delete(): void;
}

  export declare class TColgp_Array1OfPnt2d_1 extends TColgp_Array1OfPnt2d {
    constructor();
  }

  export declare class TColgp_Array1OfPnt2d_2 extends TColgp_Array1OfPnt2d {
    constructor(theLower: Standard_Integer, theUpper: Standard_Integer);
  }

  export declare class TColgp_Array1OfPnt2d_3 extends TColgp_Array1OfPnt2d {
    constructor(theOther: TColgp_Array1OfPnt2d);
  }

  export declare class TColgp_Array1OfPnt2d_4 extends TColgp_Array1OfPnt2d {
    constructor(theOther: TColgp_Array1OfPnt2d);
  }

  export declare class TColgp_Array1OfPnt2d_5 extends TColgp_Array1OfPnt2d {
    constructor(theBegin: gp_Pnt2d, theLower: Standard_Integer, theUpper: Standard_Integer);
  }

export declare class TColgp_Array1OfPnt {
  begin(): any;
  end(): any;
  cbegin(): any;
  cend(): any;
  Init(theValue: gp_Pnt): void;
  Size(): Standard_Integer;
  Length(): Standard_Integer;
  IsEmpty(): Standard_Boolean;
  Lower(): Standard_Integer;
  Upper(): Standard_Integer;
  IsDeletable(): Standard_Boolean;
  IsAllocated(): Standard_Boolean;
  Assign(theOther: TColgp_Array1OfPnt): TColgp_Array1OfPnt;
  Move(theOther: TColgp_Array1OfPnt): TColgp_Array1OfPnt;
  First(): gp_Pnt;
  ChangeFirst(): gp_Pnt;
  Last(): gp_Pnt;
  ChangeLast(): gp_Pnt;
  Value(theIndex: Standard_Integer): gp_Pnt;
  ChangeValue(theIndex: Standard_Integer): gp_Pnt;
  SetValue(theIndex: Standard_Integer, theItem: gp_Pnt): void;
  Resize(theLower: Standard_Integer, theUpper: Standard_Integer, theToCopyData: Standard_Boolean): void;
  delete(): void;
}

  export declare class TColgp_Array1OfPnt_1 extends TColgp_Array1OfPnt {
    constructor();
  }

  export declare class TColgp_Array1OfPnt_2 extends TColgp_Array1OfPnt {
    constructor(theLower: Standard_Integer, theUpper: Standard_Integer);
  }

  export declare class TColgp_Array1OfPnt_3 extends TColgp_Array1OfPnt {
    constructor(theOther: TColgp_Array1OfPnt);
  }

  export declare class TColgp_Array1OfPnt_4 extends TColgp_Array1OfPnt {
    constructor(theOther: TColgp_Array1OfPnt);
  }

  export declare class TColgp_Array1OfPnt_5 extends TColgp_Array1OfPnt {
    constructor(theBegin: gp_Pnt, theLower: Standard_Integer, theUpper: Standard_Integer);
  }

export declare class StlAPI_Writer {
  constructor()
  ASCIIMode(): Standard_Boolean;
  Write(theShape: TopoDS_Shape, theFileName: Standard_CString, theProgress: Message_ProgressRange): Standard_Boolean;
  delete(): void;
}

export declare class StlAPI_Reader {
  constructor();
  Read(theShape: TopoDS_Shape, theFileName: Standard_CString): Standard_Boolean;
  delete(): void;
}

export declare class StlAPI {
  constructor();
  static Write(theShape: TopoDS_Shape, theFile: Standard_CString, theAsciiMode: Standard_Boolean): Standard_Boolean;
  static Read(theShape: TopoDS_Shape, aFile: Standard_CString): Standard_Boolean;
  delete(): void;
}

export declare class TopTools_ListOfShape extends NCollection_BaseList {
  begin(): any;
  end(): any;
  cbegin(): any;
  cend(): any;
  Size(): Standard_Integer;
  Assign(theOther: TopTools_ListOfShape): TopTools_ListOfShape;
  Clear(theAllocator: Handle_NCollection_BaseAllocator): void;
  First_1(): TopoDS_Shape;
  First_2(): TopoDS_Shape;
  Last_1(): TopoDS_Shape;
  Last_2(): TopoDS_Shape;
  Append_1(theItem: TopoDS_Shape): TopoDS_Shape;
  Append_3(theOther: TopTools_ListOfShape): void;
  Prepend_1(theItem: TopoDS_Shape): TopoDS_Shape;
  Prepend_2(theOther: TopTools_ListOfShape): void;
  RemoveFirst(): void;
  Reverse(): void;
  delete(): void;
}

  export declare class TopTools_ListOfShape_1 extends TopTools_ListOfShape {
    constructor();
  }

  export declare class TopTools_ListOfShape_2 extends TopTools_ListOfShape {
    constructor(theAllocator: Handle_NCollection_BaseAllocator);
  }

  export declare class TopTools_ListOfShape_3 extends TopTools_ListOfShape {
    constructor(theOther: TopTools_ListOfShape);
  }

export declare class ShapeUpgrade_UnifySameDomain extends Standard_Transient {
  Initialize(aShape: TopoDS_Shape, UnifyEdges: Standard_Boolean, UnifyFaces: Standard_Boolean, ConcatBSplines: Standard_Boolean): void;
  AllowInternalEdges(theValue: Standard_Boolean): void;
  KeepShape(theShape: TopoDS_Shape): void;
  KeepShapes(theShapes: TopTools_MapOfShape): void;
  SetSafeInputMode(theValue: Standard_Boolean): void;
  SetLinearTolerance(theValue: Standard_Real): void;
  SetAngularTolerance(theValue: Standard_Real): void;
  Build(): void;
  Shape(): TopoDS_Shape;
  History_1(): Handle_BRepTools_History;
  History_2(): Handle_BRepTools_History;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

  export declare class ShapeUpgrade_UnifySameDomain_1 extends ShapeUpgrade_UnifySameDomain {
    constructor();
  }

  export declare class ShapeUpgrade_UnifySameDomain_2 extends ShapeUpgrade_UnifySameDomain {
    constructor(aShape: TopoDS_Shape, UnifyEdges: Standard_Boolean, UnifyFaces: Standard_Boolean, ConcatBSplines: Standard_Boolean);
  }

export declare type TopAbs_ShapeEnum = {
  TopAbs_COMPOUND: {};
  TopAbs_COMPSOLID: {};
  TopAbs_SOLID: {};
  TopAbs_SHELL: {};
  TopAbs_FACE: {};
  TopAbs_WIRE: {};
  TopAbs_EDGE: {};
  TopAbs_VERTEX: {};
  TopAbs_SHAPE: {};
}

export declare type TopAbs_Orientation = {
  TopAbs_FORWARD: {};
  TopAbs_REVERSED: {};
  TopAbs_INTERNAL: {};
  TopAbs_EXTERNAL: {};
}

export declare class BRepBuilderAPI_MakeSolid extends BRepBuilderAPI_MakeShape {
  Add(S: TopoDS_Shell): void;
  IsDone(): Standard_Boolean;
  Solid(): TopoDS_Solid;
  IsDeleted(S: TopoDS_Shape): Standard_Boolean;
  delete(): void;
}

  export declare class BRepBuilderAPI_MakeSolid_1 extends BRepBuilderAPI_MakeSolid {
    constructor();
  }

  export declare class BRepBuilderAPI_MakeSolid_2 extends BRepBuilderAPI_MakeSolid {
    constructor(S: TopoDS_CompSolid);
  }

  export declare class BRepBuilderAPI_MakeSolid_3 extends BRepBuilderAPI_MakeSolid {
    constructor(S: TopoDS_Shell);
  }

  export declare class BRepBuilderAPI_MakeSolid_4 extends BRepBuilderAPI_MakeSolid {
    constructor(S1: TopoDS_Shell, S2: TopoDS_Shell);
  }

  export declare class BRepBuilderAPI_MakeSolid_5 extends BRepBuilderAPI_MakeSolid {
    constructor(S1: TopoDS_Shell, S2: TopoDS_Shell, S3: TopoDS_Shell);
  }

  export declare class BRepBuilderAPI_MakeSolid_6 extends BRepBuilderAPI_MakeSolid {
    constructor(So: TopoDS_Solid);
  }

  export declare class BRepBuilderAPI_MakeSolid_7 extends BRepBuilderAPI_MakeSolid {
    constructor(So: TopoDS_Solid, S: TopoDS_Shell);
  }

export declare class BRepBuilderAPI_MakeShell extends BRepBuilderAPI_MakeShape {
  Init(S: Handle_Geom_Surface, UMin: Standard_Real, UMax: Standard_Real, VMin: Standard_Real, VMax: Standard_Real, Segment: Standard_Boolean): void;
  IsDone(): Standard_Boolean;
  Error(): BRepBuilderAPI_ShellError;
  Shell(): TopoDS_Shell;
  delete(): void;
}

  export declare class BRepBuilderAPI_MakeShell_1 extends BRepBuilderAPI_MakeShell {
    constructor();
  }

  export declare class BRepBuilderAPI_MakeShell_2 extends BRepBuilderAPI_MakeShell {
    constructor(S: Handle_Geom_Surface, Segment: Standard_Boolean);
  }

  export declare class BRepBuilderAPI_MakeShell_3 extends BRepBuilderAPI_MakeShell {
    constructor(S: Handle_Geom_Surface, UMin: Standard_Real, UMax: Standard_Real, VMin: Standard_Real, VMax: Standard_Real, Segment: Standard_Boolean);
  }

export declare class BRepBuilderAPI_MakeFace extends BRepBuilderAPI_MakeShape {
  Init_1(F: TopoDS_Face): void;
  Init_2(S: Handle_Geom_Surface, Bound: Standard_Boolean, TolDegen: Standard_Real): void;
  Init_3(S: Handle_Geom_Surface, UMin: Standard_Real, UMax: Standard_Real, VMin: Standard_Real, VMax: Standard_Real, TolDegen: Standard_Real): void;
  Add(W: TopoDS_Wire): void;
  IsDone(): Standard_Boolean;
  Error(): BRepBuilderAPI_FaceError;
  Face(): TopoDS_Face;
  delete(): void;
}

  export declare class BRepBuilderAPI_MakeFace_1 extends BRepBuilderAPI_MakeFace {
    constructor();
  }

  export declare class BRepBuilderAPI_MakeFace_2 extends BRepBuilderAPI_MakeFace {
    constructor(F: TopoDS_Face);
  }

  export declare class BRepBuilderAPI_MakeFace_3 extends BRepBuilderAPI_MakeFace {
    constructor(P: gp_Pln);
  }

  export declare class BRepBuilderAPI_MakeFace_4 extends BRepBuilderAPI_MakeFace {
    constructor(C: gp_Cylinder);
  }

  export declare class BRepBuilderAPI_MakeFace_5 extends BRepBuilderAPI_MakeFace {
    constructor(C: gp_Cone);
  }

  export declare class BRepBuilderAPI_MakeFace_6 extends BRepBuilderAPI_MakeFace {
    constructor(S: gp_Sphere);
  }

  export declare class BRepBuilderAPI_MakeFace_7 extends BRepBuilderAPI_MakeFace {
    constructor(C: gp_Torus);
  }

  export declare class BRepBuilderAPI_MakeFace_8 extends BRepBuilderAPI_MakeFace {
    constructor(S: Handle_Geom_Surface, TolDegen: Standard_Real);
  }

  export declare class BRepBuilderAPI_MakeFace_9 extends BRepBuilderAPI_MakeFace {
    constructor(P: gp_Pln, UMin: Standard_Real, UMax: Standard_Real, VMin: Standard_Real, VMax: Standard_Real);
  }

  export declare class BRepBuilderAPI_MakeFace_10 extends BRepBuilderAPI_MakeFace {
    constructor(C: gp_Cylinder, UMin: Standard_Real, UMax: Standard_Real, VMin: Standard_Real, VMax: Standard_Real);
  }

  export declare class BRepBuilderAPI_MakeFace_11 extends BRepBuilderAPI_MakeFace {
    constructor(C: gp_Cone, UMin: Standard_Real, UMax: Standard_Real, VMin: Standard_Real, VMax: Standard_Real);
  }

  export declare class BRepBuilderAPI_MakeFace_12 extends BRepBuilderAPI_MakeFace {
    constructor(S: gp_Sphere, UMin: Standard_Real, UMax: Standard_Real, VMin: Standard_Real, VMax: Standard_Real);
  }

  export declare class BRepBuilderAPI_MakeFace_13 extends BRepBuilderAPI_MakeFace {
    constructor(C: gp_Torus, UMin: Standard_Real, UMax: Standard_Real, VMin: Standard_Real, VMax: Standard_Real);
  }

  export declare class BRepBuilderAPI_MakeFace_14 extends BRepBuilderAPI_MakeFace {
    constructor(S: Handle_Geom_Surface, UMin: Standard_Real, UMax: Standard_Real, VMin: Standard_Real, VMax: Standard_Real, TolDegen: Standard_Real);
  }

  export declare class BRepBuilderAPI_MakeFace_15 extends BRepBuilderAPI_MakeFace {
    constructor(W: TopoDS_Wire, OnlyPlane: Standard_Boolean);
  }

  export declare class BRepBuilderAPI_MakeFace_16 extends BRepBuilderAPI_MakeFace {
    constructor(P: gp_Pln, W: TopoDS_Wire, Inside: Standard_Boolean);
  }

  export declare class BRepBuilderAPI_MakeFace_17 extends BRepBuilderAPI_MakeFace {
    constructor(C: gp_Cylinder, W: TopoDS_Wire, Inside: Standard_Boolean);
  }

  export declare class BRepBuilderAPI_MakeFace_18 extends BRepBuilderAPI_MakeFace {
    constructor(C: gp_Cone, W: TopoDS_Wire, Inside: Standard_Boolean);
  }

  export declare class BRepBuilderAPI_MakeFace_19 extends BRepBuilderAPI_MakeFace {
    constructor(S: gp_Sphere, W: TopoDS_Wire, Inside: Standard_Boolean);
  }

  export declare class BRepBuilderAPI_MakeFace_20 extends BRepBuilderAPI_MakeFace {
    constructor(C: gp_Torus, W: TopoDS_Wire, Inside: Standard_Boolean);
  }

  export declare class BRepBuilderAPI_MakeFace_21 extends BRepBuilderAPI_MakeFace {
    constructor(S: Handle_Geom_Surface, W: TopoDS_Wire, Inside: Standard_Boolean);
  }

  export declare class BRepBuilderAPI_MakeFace_22 extends BRepBuilderAPI_MakeFace {
    constructor(F: TopoDS_Face, W: TopoDS_Wire);
  }

export declare class BRepBuilderAPI_MakeWire extends BRepBuilderAPI_MakeShape {
  Add_1(E: TopoDS_Edge): void;
  Add_2(W: TopoDS_Wire): void;
  Add_3(L: TopTools_ListOfShape): void;
  IsDone(): Standard_Boolean;
  Error(): BRepBuilderAPI_WireError;
  Wire(): TopoDS_Wire;
  Edge(): TopoDS_Edge;
  Vertex(): TopoDS_Vertex;
  delete(): void;
}

  export declare class BRepBuilderAPI_MakeWire_1 extends BRepBuilderAPI_MakeWire {
    constructor();
  }

  export declare class BRepBuilderAPI_MakeWire_2 extends BRepBuilderAPI_MakeWire {
    constructor(E: TopoDS_Edge);
  }

  export declare class BRepBuilderAPI_MakeWire_3 extends BRepBuilderAPI_MakeWire {
    constructor(E1: TopoDS_Edge, E2: TopoDS_Edge);
  }

  export declare class BRepBuilderAPI_MakeWire_4 extends BRepBuilderAPI_MakeWire {
    constructor(E1: TopoDS_Edge, E2: TopoDS_Edge, E3: TopoDS_Edge);
  }

  export declare class BRepBuilderAPI_MakeWire_5 extends BRepBuilderAPI_MakeWire {
    constructor(E1: TopoDS_Edge, E2: TopoDS_Edge, E3: TopoDS_Edge, E4: TopoDS_Edge);
  }

  export declare class BRepBuilderAPI_MakeWire_6 extends BRepBuilderAPI_MakeWire {
    constructor(W: TopoDS_Wire);
  }

  export declare class BRepBuilderAPI_MakeWire_7 extends BRepBuilderAPI_MakeWire {
    constructor(W: TopoDS_Wire, E: TopoDS_Edge);
  }

export declare class BRepBuilderAPI_Command {
  IsDone(): Standard_Boolean;
  Check(): void;
  delete(): void;
}

export declare class BRepBuilderAPI_MakeEdge extends BRepBuilderAPI_MakeShape {
  Init_1(C: Handle_Geom_Curve): void;
  Init_2(C: Handle_Geom_Curve, p1: Standard_Real, p2: Standard_Real): void;
  Init_3(C: Handle_Geom_Curve, P1: gp_Pnt, P2: gp_Pnt): void;
  Init_4(C: Handle_Geom_Curve, V1: TopoDS_Vertex, V2: TopoDS_Vertex): void;
  Init_5(C: Handle_Geom_Curve, P1: gp_Pnt, P2: gp_Pnt, p1: Standard_Real, p2: Standard_Real): void;
  Init_6(C: Handle_Geom_Curve, V1: TopoDS_Vertex, V2: TopoDS_Vertex, p1: Standard_Real, p2: Standard_Real): void;
  Init_7(C: Handle_Geom2d_Curve, S: Handle_Geom_Surface): void;
  Init_8(C: Handle_Geom2d_Curve, S: Handle_Geom_Surface, p1: Standard_Real, p2: Standard_Real): void;
  Init_9(C: Handle_Geom2d_Curve, S: Handle_Geom_Surface, P1: gp_Pnt, P2: gp_Pnt): void;
  Init_10(C: Handle_Geom2d_Curve, S: Handle_Geom_Surface, V1: TopoDS_Vertex, V2: TopoDS_Vertex): void;
  Init_11(C: Handle_Geom2d_Curve, S: Handle_Geom_Surface, P1: gp_Pnt, P2: gp_Pnt, p1: Standard_Real, p2: Standard_Real): void;
  Init_12(C: Handle_Geom2d_Curve, S: Handle_Geom_Surface, V1: TopoDS_Vertex, V2: TopoDS_Vertex, p1: Standard_Real, p2: Standard_Real): void;
  IsDone(): Standard_Boolean;
  Error(): BRepBuilderAPI_EdgeError;
  Edge(): TopoDS_Edge;
  Vertex1(): TopoDS_Vertex;
  Vertex2(): TopoDS_Vertex;
  delete(): void;
}

  export declare class BRepBuilderAPI_MakeEdge_1 extends BRepBuilderAPI_MakeEdge {
    constructor();
  }

  export declare class BRepBuilderAPI_MakeEdge_2 extends BRepBuilderAPI_MakeEdge {
    constructor(V1: TopoDS_Vertex, V2: TopoDS_Vertex);
  }

  export declare class BRepBuilderAPI_MakeEdge_3 extends BRepBuilderAPI_MakeEdge {
    constructor(P1: gp_Pnt, P2: gp_Pnt);
  }

  export declare class BRepBuilderAPI_MakeEdge_4 extends BRepBuilderAPI_MakeEdge {
    constructor(L: gp_Lin);
  }

  export declare class BRepBuilderAPI_MakeEdge_5 extends BRepBuilderAPI_MakeEdge {
    constructor(L: gp_Lin, p1: Standard_Real, p2: Standard_Real);
  }

  export declare class BRepBuilderAPI_MakeEdge_6 extends BRepBuilderAPI_MakeEdge {
    constructor(L: gp_Lin, P1: gp_Pnt, P2: gp_Pnt);
  }

  export declare class BRepBuilderAPI_MakeEdge_7 extends BRepBuilderAPI_MakeEdge {
    constructor(L: gp_Lin, V1: TopoDS_Vertex, V2: TopoDS_Vertex);
  }

  export declare class BRepBuilderAPI_MakeEdge_8 extends BRepBuilderAPI_MakeEdge {
    constructor(L: gp_Circ);
  }

  export declare class BRepBuilderAPI_MakeEdge_9 extends BRepBuilderAPI_MakeEdge {
    constructor(L: gp_Circ, p1: Standard_Real, p2: Standard_Real);
  }

  export declare class BRepBuilderAPI_MakeEdge_10 extends BRepBuilderAPI_MakeEdge {
    constructor(L: gp_Circ, P1: gp_Pnt, P2: gp_Pnt);
  }

  export declare class BRepBuilderAPI_MakeEdge_11 extends BRepBuilderAPI_MakeEdge {
    constructor(L: gp_Circ, V1: TopoDS_Vertex, V2: TopoDS_Vertex);
  }

  export declare class BRepBuilderAPI_MakeEdge_12 extends BRepBuilderAPI_MakeEdge {
    constructor(L: gp_Elips);
  }

  export declare class BRepBuilderAPI_MakeEdge_13 extends BRepBuilderAPI_MakeEdge {
    constructor(L: gp_Elips, p1: Standard_Real, p2: Standard_Real);
  }

  export declare class BRepBuilderAPI_MakeEdge_14 extends BRepBuilderAPI_MakeEdge {
    constructor(L: gp_Elips, P1: gp_Pnt, P2: gp_Pnt);
  }

  export declare class BRepBuilderAPI_MakeEdge_15 extends BRepBuilderAPI_MakeEdge {
    constructor(L: gp_Elips, V1: TopoDS_Vertex, V2: TopoDS_Vertex);
  }

  export declare class BRepBuilderAPI_MakeEdge_16 extends BRepBuilderAPI_MakeEdge {
    constructor(L: gp_Hypr);
  }

  export declare class BRepBuilderAPI_MakeEdge_17 extends BRepBuilderAPI_MakeEdge {
    constructor(L: gp_Hypr, p1: Standard_Real, p2: Standard_Real);
  }

  export declare class BRepBuilderAPI_MakeEdge_18 extends BRepBuilderAPI_MakeEdge {
    constructor(L: gp_Hypr, P1: gp_Pnt, P2: gp_Pnt);
  }

  export declare class BRepBuilderAPI_MakeEdge_19 extends BRepBuilderAPI_MakeEdge {
    constructor(L: gp_Hypr, V1: TopoDS_Vertex, V2: TopoDS_Vertex);
  }

  export declare class BRepBuilderAPI_MakeEdge_20 extends BRepBuilderAPI_MakeEdge {
    constructor(L: gp_Parab);
  }

  export declare class BRepBuilderAPI_MakeEdge_21 extends BRepBuilderAPI_MakeEdge {
    constructor(L: gp_Parab, p1: Standard_Real, p2: Standard_Real);
  }

  export declare class BRepBuilderAPI_MakeEdge_22 extends BRepBuilderAPI_MakeEdge {
    constructor(L: gp_Parab, P1: gp_Pnt, P2: gp_Pnt);
  }

  export declare class BRepBuilderAPI_MakeEdge_23 extends BRepBuilderAPI_MakeEdge {
    constructor(L: gp_Parab, V1: TopoDS_Vertex, V2: TopoDS_Vertex);
  }

  export declare class BRepBuilderAPI_MakeEdge_24 extends BRepBuilderAPI_MakeEdge {
    constructor(L: Handle_Geom_Curve);
  }

  export declare class BRepBuilderAPI_MakeEdge_25 extends BRepBuilderAPI_MakeEdge {
    constructor(L: Handle_Geom_Curve, p1: Standard_Real, p2: Standard_Real);
  }

  export declare class BRepBuilderAPI_MakeEdge_26 extends BRepBuilderAPI_MakeEdge {
    constructor(L: Handle_Geom_Curve, P1: gp_Pnt, P2: gp_Pnt);
  }

  export declare class BRepBuilderAPI_MakeEdge_27 extends BRepBuilderAPI_MakeEdge {
    constructor(L: Handle_Geom_Curve, V1: TopoDS_Vertex, V2: TopoDS_Vertex);
  }

  export declare class BRepBuilderAPI_MakeEdge_28 extends BRepBuilderAPI_MakeEdge {
    constructor(L: Handle_Geom_Curve, P1: gp_Pnt, P2: gp_Pnt, p1: Standard_Real, p2: Standard_Real);
  }

  export declare class BRepBuilderAPI_MakeEdge_29 extends BRepBuilderAPI_MakeEdge {
    constructor(L: Handle_Geom_Curve, V1: TopoDS_Vertex, V2: TopoDS_Vertex, p1: Standard_Real, p2: Standard_Real);
  }

  export declare class BRepBuilderAPI_MakeEdge_30 extends BRepBuilderAPI_MakeEdge {
    constructor(L: Handle_Geom2d_Curve, S: Handle_Geom_Surface);
  }

  export declare class BRepBuilderAPI_MakeEdge_31 extends BRepBuilderAPI_MakeEdge {
    constructor(L: Handle_Geom2d_Curve, S: Handle_Geom_Surface, p1: Standard_Real, p2: Standard_Real);
  }

  export declare class BRepBuilderAPI_MakeEdge_32 extends BRepBuilderAPI_MakeEdge {
    constructor(L: Handle_Geom2d_Curve, S: Handle_Geom_Surface, P1: gp_Pnt, P2: gp_Pnt);
  }

  export declare class BRepBuilderAPI_MakeEdge_33 extends BRepBuilderAPI_MakeEdge {
    constructor(L: Handle_Geom2d_Curve, S: Handle_Geom_Surface, V1: TopoDS_Vertex, V2: TopoDS_Vertex);
  }

  export declare class BRepBuilderAPI_MakeEdge_34 extends BRepBuilderAPI_MakeEdge {
    constructor(L: Handle_Geom2d_Curve, S: Handle_Geom_Surface, P1: gp_Pnt, P2: gp_Pnt, p1: Standard_Real, p2: Standard_Real);
  }

  export declare class BRepBuilderAPI_MakeEdge_35 extends BRepBuilderAPI_MakeEdge {
    constructor(L: Handle_Geom2d_Curve, S: Handle_Geom_Surface, V1: TopoDS_Vertex, V2: TopoDS_Vertex, p1: Standard_Real, p2: Standard_Real);
  }

export declare class BRepBuilderAPI_Sewing extends Standard_Transient {
  constructor(tolerance: Standard_Real, option1: Standard_Boolean, option2: Standard_Boolean, option3: Standard_Boolean, option4: Standard_Boolean)
  Init(tolerance: Standard_Real, option1: Standard_Boolean, option2: Standard_Boolean, option3: Standard_Boolean, option4: Standard_Boolean): void;
  Load(shape: TopoDS_Shape): void;
  Add(shape: TopoDS_Shape): void;
  Perform(theProgress: Message_ProgressRange): void;
  SewedShape(): TopoDS_Shape;
  SetContext(theContext: Handle_BRepTools_ReShape): void;
  GetContext(): Handle_BRepTools_ReShape;
  NbFreeEdges(): Graphic3d_ZLayerId;
  FreeEdge(index: Graphic3d_ZLayerId): TopoDS_Edge;
  NbMultipleEdges(): Graphic3d_ZLayerId;
  MultipleEdge(index: Graphic3d_ZLayerId): TopoDS_Edge;
  NbContigousEdges(): Graphic3d_ZLayerId;
  ContigousEdge(index: Graphic3d_ZLayerId): TopoDS_Edge;
  ContigousEdgeCouple(index: Graphic3d_ZLayerId): TopTools_ListOfShape;
  IsSectionBound(section: TopoDS_Edge): Standard_Boolean;
  SectionToBoundary(section: TopoDS_Edge): TopoDS_Edge;
  NbDegeneratedShapes(): Graphic3d_ZLayerId;
  DegeneratedShape(index: Graphic3d_ZLayerId): TopoDS_Shape;
  IsDegenerated(shape: TopoDS_Shape): Standard_Boolean;
  IsModified(shape: TopoDS_Shape): Standard_Boolean;
  Modified(shape: TopoDS_Shape): TopoDS_Shape;
  IsModifiedSubShape(shape: TopoDS_Shape): Standard_Boolean;
  ModifiedSubShape(shape: TopoDS_Shape): TopoDS_Shape;
  Dump(): void;
  NbDeletedFaces(): Graphic3d_ZLayerId;
  DeletedFace(index: Graphic3d_ZLayerId): TopoDS_Face;
  WhichFace(theEdg: TopoDS_Edge, index: Graphic3d_ZLayerId): TopoDS_Face;
  SameParameterMode(): Standard_Boolean;
  SetSameParameterMode(SameParameterMode: Standard_Boolean): void;
  Tolerance(): Standard_Real;
  SetTolerance(theToler: Standard_Real): void;
  MinTolerance(): Standard_Real;
  SetMinTolerance(theMinToler: Standard_Real): void;
  MaxTolerance(): Standard_Real;
  SetMaxTolerance(theMaxToler: Standard_Real): void;
  FaceMode(): Standard_Boolean;
  SetFaceMode(theFaceMode: Standard_Boolean): void;
  FloatingEdgesMode(): Standard_Boolean;
  SetFloatingEdgesMode(theFloatingEdgesMode: Standard_Boolean): void;
  LocalTolerancesMode(): Standard_Boolean;
  SetLocalTolerancesMode(theLocalTolerancesMode: Standard_Boolean): void;
  SetNonManifoldMode(theNonManifoldMode: Standard_Boolean): void;
  NonManifoldMode(): Standard_Boolean;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

export declare class BRepBuilderAPI_MakeShape extends BRepBuilderAPI_Command {
  Build(theRange: Message_ProgressRange): void;
  Shape(): TopoDS_Shape;
  Generated(S: TopoDS_Shape): TopTools_ListOfShape;
  Modified(S: TopoDS_Shape): TopTools_ListOfShape;
  IsDeleted(S: TopoDS_Shape): Standard_Boolean;
  delete(): void;
}

export declare class BRepGProp {
  constructor();
  static LinearProperties(S: TopoDS_Shape, LProps: GProp_GProps, SkipShared: Standard_Boolean, UseTriangulation: Standard_Boolean): void;
  static SurfaceProperties_1(S: TopoDS_Shape, SProps: GProp_GProps, SkipShared: Standard_Boolean, UseTriangulation: Standard_Boolean): void;
  static SurfaceProperties_2(S: TopoDS_Shape, SProps: GProp_GProps, Eps: Standard_Real, SkipShared: Standard_Boolean): Standard_Real;
  static VolumeProperties_1(S: TopoDS_Shape, VProps: GProp_GProps, OnlyClosed: Standard_Boolean, SkipShared: Standard_Boolean, UseTriangulation: Standard_Boolean): void;
  static VolumeProperties_2(S: TopoDS_Shape, VProps: GProp_GProps, Eps: Standard_Real, OnlyClosed: Standard_Boolean, SkipShared: Standard_Boolean): Standard_Real;
  static VolumePropertiesGK_1(S: TopoDS_Shape, VProps: GProp_GProps, Eps: Standard_Real, OnlyClosed: Standard_Boolean, IsUseSpan: Standard_Boolean, CGFlag: Standard_Boolean, IFlag: Standard_Boolean, SkipShared: Standard_Boolean): Standard_Real;
  static VolumePropertiesGK_2(S: TopoDS_Shape, VProps: GProp_GProps, thePln: gp_Pln, Eps: Standard_Real, OnlyClosed: Standard_Boolean, IsUseSpan: Standard_Boolean, CGFlag: Standard_Boolean, IFlag: Standard_Boolean, SkipShared: Standard_Boolean): Standard_Real;
  delete(): void;
}

export declare type STEPControl_StepModelType = {
  STEPControl_AsIs: {};
  STEPControl_ManifoldSolidBrep: {};
  STEPControl_BrepWithVoids: {};
  STEPControl_FacetedBrep: {};
  STEPControl_FacetedBrepAndBrepWithVoids: {};
  STEPControl_ShellBasedSurfaceModel: {};
  STEPControl_GeometricCurveSet: {};
  STEPControl_Hybrid: {};
}

export declare class STEPControl_Writer {
  SetTolerance(Tol: Standard_Real): void;
  UnsetTolerance(): void;
  SetWS(WS: Handle_XSControl_WorkSession, scratch: Standard_Boolean): void;
  WS(): Handle_XSControl_WorkSession;
  Model(newone: Standard_Boolean): Handle_StepData_StepModel;
  Transfer(sh: TopoDS_Shape, mode: STEPControl_StepModelType, compgraph: Standard_Boolean, theProgress: Message_ProgressRange): IFSelect_ReturnStatus;
  Write(filename: Standard_CString): IFSelect_ReturnStatus;
  PrintStatsTransfer(what: Graphic3d_ZLayerId, mode: Graphic3d_ZLayerId): void;
  delete(): void;
}

  export declare class STEPControl_Writer_1 extends STEPControl_Writer {
    constructor();
  }

  export declare class STEPControl_Writer_2 extends STEPControl_Writer {
    constructor(WS: Handle_XSControl_WorkSession, scratch: Standard_Boolean);
  }

export declare class STEPControl_Reader extends XSControl_Reader {
  StepModel(): Handle_StepData_StepModel;
  TransferRoot(num: Graphic3d_ZLayerId, theProgress: Message_ProgressRange): Standard_Boolean;
  NbRootsForTransfer(): Graphic3d_ZLayerId;
  FileUnits(theUnitLengthNames: TColStd_SequenceOfAsciiString, theUnitAngleNames: TColStd_SequenceOfAsciiString, theUnitSolidAngleNames: TColStd_SequenceOfAsciiString): void;
  SetSystemLengthUnit(theLengthUnit: Standard_Real): void;
  SystemLengthUnit(): Standard_Real;
  delete(): void;
}

  export declare class STEPControl_Reader_1 extends STEPControl_Reader {
    constructor();
  }

  export declare class STEPControl_Reader_2 extends STEPControl_Reader {
    constructor(WS: Handle_XSControl_WorkSession, scratch: Standard_Boolean);
  }

export declare class Geom_BoundedSurface extends Geom_Surface {
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

export declare class Handle_Geom_BoundedSurface {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Geom_BoundedSurface): void;
  get(): Geom_BoundedSurface;
  delete(): void;
}

  export declare class Handle_Geom_BoundedSurface_1 extends Handle_Geom_BoundedSurface {
    constructor();
  }

  export declare class Handle_Geom_BoundedSurface_2 extends Handle_Geom_BoundedSurface {
    constructor(thePtr: Geom_BoundedSurface);
  }

  export declare class Handle_Geom_BoundedSurface_3 extends Handle_Geom_BoundedSurface {
    constructor(theHandle: Handle_Geom_BoundedSurface);
  }

  export declare class Handle_Geom_BoundedSurface_4 extends Handle_Geom_BoundedSurface {
    constructor(theHandle: Handle_Geom_BoundedSurface);
  }

export declare class Geom_ToroidalSurface extends Geom_ElementarySurface {
  SetMajorRadius(MajorRadius: Standard_Real): void;
  SetMinorRadius(MinorRadius: Standard_Real): void;
  SetTorus(T: gp_Torus): void;
  Torus(): gp_Torus;
  UReversedParameter(U: Standard_Real): Standard_Real;
  VReversedParameter(U: Standard_Real): Standard_Real;
  Area(): Standard_Real;
  Bounds(U1: Standard_Real, U2: Standard_Real, V1: Standard_Real, V2: Standard_Real): void;
  Coefficients(Coef: IntTools_CArray1OfReal): void;
  MajorRadius(): Standard_Real;
  MinorRadius(): Standard_Real;
  Volume(): Standard_Real;
  IsUClosed(): Standard_Boolean;
  IsVClosed(): Standard_Boolean;
  IsUPeriodic(): Standard_Boolean;
  IsVPeriodic(): Standard_Boolean;
  UIso(U: Standard_Real): Handle_Geom_Curve;
  VIso(V: Standard_Real): Handle_Geom_Curve;
  D0(U: Standard_Real, V: Standard_Real, P: gp_Pnt): void;
  D1(U: Standard_Real, V: Standard_Real, P: gp_Pnt, D1U: gp_Vec, D1V: gp_Vec): void;
  D2(U: Standard_Real, V: Standard_Real, P: gp_Pnt, D1U: gp_Vec, D1V: gp_Vec, D2U: gp_Vec, D2V: gp_Vec, D2UV: gp_Vec): void;
  D3(U: Standard_Real, V: Standard_Real, P: gp_Pnt, D1U: gp_Vec, D1V: gp_Vec, D2U: gp_Vec, D2V: gp_Vec, D2UV: gp_Vec, D3U: gp_Vec, D3V: gp_Vec, D3UUV: gp_Vec, D3UVV: gp_Vec): void;
  DN(U: Standard_Real, V: Standard_Real, Nu: Graphic3d_ZLayerId, Nv: Graphic3d_ZLayerId): gp_Vec;
  Transform(T: gp_Trsf): void;
  Copy(): Handle_Geom_Geometry;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

  export declare class Geom_ToroidalSurface_1 extends Geom_ToroidalSurface {
    constructor(A3: gp_Ax3, MajorRadius: Standard_Real, MinorRadius: Standard_Real);
  }

  export declare class Geom_ToroidalSurface_2 extends Geom_ToroidalSurface {
    constructor(T: gp_Torus);
  }

export declare class Handle_Geom_ToroidalSurface {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Geom_ToroidalSurface): void;
  get(): Geom_ToroidalSurface;
  delete(): void;
}

  export declare class Handle_Geom_ToroidalSurface_1 extends Handle_Geom_ToroidalSurface {
    constructor();
  }

  export declare class Handle_Geom_ToroidalSurface_2 extends Handle_Geom_ToroidalSurface {
    constructor(thePtr: Geom_ToroidalSurface);
  }

  export declare class Handle_Geom_ToroidalSurface_3 extends Handle_Geom_ToroidalSurface {
    constructor(theHandle: Handle_Geom_ToroidalSurface);
  }

  export declare class Handle_Geom_ToroidalSurface_4 extends Handle_Geom_ToroidalSurface {
    constructor(theHandle: Handle_Geom_ToroidalSurface);
  }

export declare class Handle_Geom_Parabola {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Geom_Parabola): void;
  get(): Geom_Parabola;
  delete(): void;
}

  export declare class Handle_Geom_Parabola_1 extends Handle_Geom_Parabola {
    constructor();
  }

  export declare class Handle_Geom_Parabola_2 extends Handle_Geom_Parabola {
    constructor(thePtr: Geom_Parabola);
  }

  export declare class Handle_Geom_Parabola_3 extends Handle_Geom_Parabola {
    constructor(theHandle: Handle_Geom_Parabola);
  }

  export declare class Handle_Geom_Parabola_4 extends Handle_Geom_Parabola {
    constructor(theHandle: Handle_Geom_Parabola);
  }

export declare class Geom_Parabola extends Geom_Conic {
  SetFocal(Focal: Standard_Real): void;
  SetParab(Prb: gp_Parab): void;
  Parab(): gp_Parab;
  ReversedParameter(U: Standard_Real): Standard_Real;
  FirstParameter(): Standard_Real;
  LastParameter(): Standard_Real;
  IsClosed(): Standard_Boolean;
  IsPeriodic(): Standard_Boolean;
  Directrix(): gp_Ax1;
  Eccentricity(): Standard_Real;
  Focus(): gp_Pnt;
  Focal(): Standard_Real;
  Parameter(): Standard_Real;
  D0(U: Standard_Real, P: gp_Pnt): void;
  D1(U: Standard_Real, P: gp_Pnt, V1: gp_Vec): void;
  D2(U: Standard_Real, P: gp_Pnt, V1: gp_Vec, V2: gp_Vec): void;
  D3(U: Standard_Real, P: gp_Pnt, V1: gp_Vec, V2: gp_Vec, V3: gp_Vec): void;
  DN(U: Standard_Real, N: Graphic3d_ZLayerId): gp_Vec;
  Transform(T: gp_Trsf): void;
  TransformedParameter(U: Standard_Real, T: gp_Trsf): Standard_Real;
  ParametricTransformation(T: gp_Trsf): Standard_Real;
  Copy(): Handle_Geom_Geometry;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

  export declare class Geom_Parabola_1 extends Geom_Parabola {
    constructor(Prb: gp_Parab);
  }

  export declare class Geom_Parabola_2 extends Geom_Parabola {
    constructor(A2: gp_Ax2, Focal: Standard_Real);
  }

  export declare class Geom_Parabola_3 extends Geom_Parabola {
    constructor(D: gp_Ax1, F: gp_Pnt);
  }

export declare class Handle_Geom_Geometry {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Geom_Geometry): void;
  get(): Geom_Geometry;
  delete(): void;
}

  export declare class Handle_Geom_Geometry_1 extends Handle_Geom_Geometry {
    constructor();
  }

  export declare class Handle_Geom_Geometry_2 extends Handle_Geom_Geometry {
    constructor(thePtr: Geom_Geometry);
  }

  export declare class Handle_Geom_Geometry_3 extends Handle_Geom_Geometry {
    constructor(theHandle: Handle_Geom_Geometry);
  }

  export declare class Handle_Geom_Geometry_4 extends Handle_Geom_Geometry {
    constructor(theHandle: Handle_Geom_Geometry);
  }

export declare class Geom_Geometry extends Standard_Transient {
  Mirror_1(P: gp_Pnt): void;
  Mirror_2(A1: gp_Ax1): void;
  Mirror_3(A2: gp_Ax2): void;
  Rotate(A1: gp_Ax1, Ang: Standard_Real): void;
  Scale(P: gp_Pnt, S: Standard_Real): void;
  Translate_1(V: gp_Vec): void;
  Translate_2(P1: gp_Pnt, P2: gp_Pnt): void;
  Transform(T: gp_Trsf): void;
  Mirrored_1(P: gp_Pnt): Handle_Geom_Geometry;
  Mirrored_2(A1: gp_Ax1): Handle_Geom_Geometry;
  Mirrored_3(A2: gp_Ax2): Handle_Geom_Geometry;
  Rotated(A1: gp_Ax1, Ang: Standard_Real): Handle_Geom_Geometry;
  Scaled(P: gp_Pnt, S: Standard_Real): Handle_Geom_Geometry;
  Transformed(T: gp_Trsf): Handle_Geom_Geometry;
  Translated_1(V: gp_Vec): Handle_Geom_Geometry;
  Translated_2(P1: gp_Pnt, P2: gp_Pnt): Handle_Geom_Geometry;
  Copy(): Handle_Geom_Geometry;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

export declare class Geom_Surface extends Geom_Geometry {
  UReverse(): void;
  UReversed(): Handle_Geom_Surface;
  UReversedParameter(U: Standard_Real): Standard_Real;
  VReverse(): void;
  VReversed(): Handle_Geom_Surface;
  VReversedParameter(V: Standard_Real): Standard_Real;
  TransformParameters(U: Standard_Real, V: Standard_Real, T: gp_Trsf): void;
  ParametricTransformation(T: gp_Trsf): gp_GTrsf2d;
  Bounds(U1: Standard_Real, U2: Standard_Real, V1: Standard_Real, V2: Standard_Real): void;
  IsUClosed(): Standard_Boolean;
  IsVClosed(): Standard_Boolean;
  IsUPeriodic(): Standard_Boolean;
  UPeriod(): Standard_Real;
  IsVPeriodic(): Standard_Boolean;
  VPeriod(): Standard_Real;
  UIso(U: Standard_Real): Handle_Geom_Curve;
  VIso(V: Standard_Real): Handle_Geom_Curve;
  Continuity(): GeomAbs_Shape;
  IsCNu(N: Graphic3d_ZLayerId): Standard_Boolean;
  IsCNv(N: Graphic3d_ZLayerId): Standard_Boolean;
  D0(U: Standard_Real, V: Standard_Real, P: gp_Pnt): void;
  D1(U: Standard_Real, V: Standard_Real, P: gp_Pnt, D1U: gp_Vec, D1V: gp_Vec): void;
  D2(U: Standard_Real, V: Standard_Real, P: gp_Pnt, D1U: gp_Vec, D1V: gp_Vec, D2U: gp_Vec, D2V: gp_Vec, D2UV: gp_Vec): void;
  D3(U: Standard_Real, V: Standard_Real, P: gp_Pnt, D1U: gp_Vec, D1V: gp_Vec, D2U: gp_Vec, D2V: gp_Vec, D2UV: gp_Vec, D3U: gp_Vec, D3V: gp_Vec, D3UUV: gp_Vec, D3UVV: gp_Vec): void;
  DN(U: Standard_Real, V: Standard_Real, Nu: Graphic3d_ZLayerId, Nv: Graphic3d_ZLayerId): gp_Vec;
  Value(U: Standard_Real, V: Standard_Real): gp_Pnt;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

export declare class Handle_Geom_Surface {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Geom_Surface): void;
  get(): Geom_Surface;
  delete(): void;
}

  export declare class Handle_Geom_Surface_1 extends Handle_Geom_Surface {
    constructor();
  }

  export declare class Handle_Geom_Surface_2 extends Handle_Geom_Surface {
    constructor(thePtr: Geom_Surface);
  }

  export declare class Handle_Geom_Surface_3 extends Handle_Geom_Surface {
    constructor(theHandle: Handle_Geom_Surface);
  }

  export declare class Handle_Geom_Surface_4 extends Handle_Geom_Surface {
    constructor(theHandle: Handle_Geom_Surface);
  }

export declare class Handle_Geom_SphericalSurface {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Geom_SphericalSurface): void;
  get(): Geom_SphericalSurface;
  delete(): void;
}

  export declare class Handle_Geom_SphericalSurface_1 extends Handle_Geom_SphericalSurface {
    constructor();
  }

  export declare class Handle_Geom_SphericalSurface_2 extends Handle_Geom_SphericalSurface {
    constructor(thePtr: Geom_SphericalSurface);
  }

  export declare class Handle_Geom_SphericalSurface_3 extends Handle_Geom_SphericalSurface {
    constructor(theHandle: Handle_Geom_SphericalSurface);
  }

  export declare class Handle_Geom_SphericalSurface_4 extends Handle_Geom_SphericalSurface {
    constructor(theHandle: Handle_Geom_SphericalSurface);
  }

export declare class Geom_SphericalSurface extends Geom_ElementarySurface {
  SetRadius(R: Standard_Real): void;
  SetSphere(S: gp_Sphere): void;
  Sphere(): gp_Sphere;
  UReversedParameter(U: Standard_Real): Standard_Real;
  VReversedParameter(V: Standard_Real): Standard_Real;
  Area(): Standard_Real;
  Bounds(U1: Standard_Real, U2: Standard_Real, V1: Standard_Real, V2: Standard_Real): void;
  Coefficients(A1: Standard_Real, A2: Standard_Real, A3: Standard_Real, B1: Standard_Real, B2: Standard_Real, B3: Standard_Real, C1: Standard_Real, C2: Standard_Real, C3: Standard_Real, D: Standard_Real): void;
  Radius(): Standard_Real;
  Volume(): Standard_Real;
  IsUClosed(): Standard_Boolean;
  IsVClosed(): Standard_Boolean;
  IsUPeriodic(): Standard_Boolean;
  IsVPeriodic(): Standard_Boolean;
  UIso(U: Standard_Real): Handle_Geom_Curve;
  VIso(V: Standard_Real): Handle_Geom_Curve;
  D0(U: Standard_Real, V: Standard_Real, P: gp_Pnt): void;
  D1(U: Standard_Real, V: Standard_Real, P: gp_Pnt, D1U: gp_Vec, D1V: gp_Vec): void;
  D2(U: Standard_Real, V: Standard_Real, P: gp_Pnt, D1U: gp_Vec, D1V: gp_Vec, D2U: gp_Vec, D2V: gp_Vec, D2UV: gp_Vec): void;
  D3(U: Standard_Real, V: Standard_Real, P: gp_Pnt, D1U: gp_Vec, D1V: gp_Vec, D2U: gp_Vec, D2V: gp_Vec, D2UV: gp_Vec, D3U: gp_Vec, D3V: gp_Vec, D3UUV: gp_Vec, D3UVV: gp_Vec): void;
  DN(U: Standard_Real, V: Standard_Real, Nu: Graphic3d_ZLayerId, Nv: Graphic3d_ZLayerId): gp_Vec;
  Transform(T: gp_Trsf): void;
  Copy(): Handle_Geom_Geometry;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

  export declare class Geom_SphericalSurface_1 extends Geom_SphericalSurface {
    constructor(A3: gp_Ax3, Radius: Standard_Real);
  }

  export declare class Geom_SphericalSurface_2 extends Geom_SphericalSurface {
    constructor(S: gp_Sphere);
  }

export declare class Handle_Geom_SurfaceOfLinearExtrusion {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Geom_SurfaceOfLinearExtrusion): void;
  get(): Geom_SurfaceOfLinearExtrusion;
  delete(): void;
}

  export declare class Handle_Geom_SurfaceOfLinearExtrusion_1 extends Handle_Geom_SurfaceOfLinearExtrusion {
    constructor();
  }

  export declare class Handle_Geom_SurfaceOfLinearExtrusion_2 extends Handle_Geom_SurfaceOfLinearExtrusion {
    constructor(thePtr: Geom_SurfaceOfLinearExtrusion);
  }

  export declare class Handle_Geom_SurfaceOfLinearExtrusion_3 extends Handle_Geom_SurfaceOfLinearExtrusion {
    constructor(theHandle: Handle_Geom_SurfaceOfLinearExtrusion);
  }

  export declare class Handle_Geom_SurfaceOfLinearExtrusion_4 extends Handle_Geom_SurfaceOfLinearExtrusion {
    constructor(theHandle: Handle_Geom_SurfaceOfLinearExtrusion);
  }

export declare class Geom_SurfaceOfLinearExtrusion extends Geom_SweptSurface {
  constructor(C: Handle_Geom_Curve, V: gp_Dir)
  SetDirection(V: gp_Dir): void;
  SetBasisCurve(C: Handle_Geom_Curve): void;
  UReverse(): void;
  UReversedParameter(U: Standard_Real): Standard_Real;
  VReverse(): void;
  VReversedParameter(V: Standard_Real): Standard_Real;
  Bounds(U1: Standard_Real, U2: Standard_Real, V1: Standard_Real, V2: Standard_Real): void;
  IsUClosed(): Standard_Boolean;
  IsVClosed(): Standard_Boolean;
  IsCNu(N: Graphic3d_ZLayerId): Standard_Boolean;
  IsCNv(N: Graphic3d_ZLayerId): Standard_Boolean;
  IsUPeriodic(): Standard_Boolean;
  IsVPeriodic(): Standard_Boolean;
  UIso(U: Standard_Real): Handle_Geom_Curve;
  VIso(V: Standard_Real): Handle_Geom_Curve;
  D0(U: Standard_Real, V: Standard_Real, P: gp_Pnt): void;
  D1(U: Standard_Real, V: Standard_Real, P: gp_Pnt, D1U: gp_Vec, D1V: gp_Vec): void;
  D2(U: Standard_Real, V: Standard_Real, P: gp_Pnt, D1U: gp_Vec, D1V: gp_Vec, D2U: gp_Vec, D2V: gp_Vec, D2UV: gp_Vec): void;
  D3(U: Standard_Real, V: Standard_Real, P: gp_Pnt, D1U: gp_Vec, D1V: gp_Vec, D2U: gp_Vec, D2V: gp_Vec, D2UV: gp_Vec, D3U: gp_Vec, D3V: gp_Vec, D3UUV: gp_Vec, D3UVV: gp_Vec): void;
  DN(U: Standard_Real, V: Standard_Real, Nu: Graphic3d_ZLayerId, Nv: Graphic3d_ZLayerId): gp_Vec;
  Transform(T: gp_Trsf): void;
  TransformParameters(U: Standard_Real, V: Standard_Real, T: gp_Trsf): void;
  ParametricTransformation(T: gp_Trsf): gp_GTrsf2d;
  Copy(): Handle_Geom_Geometry;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

export declare class Handle_Geom_SweptSurface {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Geom_SweptSurface): void;
  get(): Geom_SweptSurface;
  delete(): void;
}

  export declare class Handle_Geom_SweptSurface_1 extends Handle_Geom_SweptSurface {
    constructor();
  }

  export declare class Handle_Geom_SweptSurface_2 extends Handle_Geom_SweptSurface {
    constructor(thePtr: Geom_SweptSurface);
  }

  export declare class Handle_Geom_SweptSurface_3 extends Handle_Geom_SweptSurface {
    constructor(theHandle: Handle_Geom_SweptSurface);
  }

  export declare class Handle_Geom_SweptSurface_4 extends Handle_Geom_SweptSurface {
    constructor(theHandle: Handle_Geom_SweptSurface);
  }

export declare class Geom_SweptSurface extends Geom_Surface {
  Continuity(): GeomAbs_Shape;
  Direction(): gp_Dir;
  BasisCurve(): Handle_Geom_Curve;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

export declare class Geom_ConicalSurface extends Geom_ElementarySurface {
  SetCone(C: gp_Cone): void;
  SetRadius(R: Standard_Real): void;
  SetSemiAngle(Ang: Standard_Real): void;
  Cone(): gp_Cone;
  UReversedParameter(U: Standard_Real): Standard_Real;
  VReversedParameter(V: Standard_Real): Standard_Real;
  VReverse(): void;
  TransformParameters(U: Standard_Real, V: Standard_Real, T: gp_Trsf): void;
  ParametricTransformation(T: gp_Trsf): gp_GTrsf2d;
  Apex(): gp_Pnt;
  Bounds(U1: Standard_Real, U2: Standard_Real, V1: Standard_Real, V2: Standard_Real): void;
  Coefficients(A1: Standard_Real, A2: Standard_Real, A3: Standard_Real, B1: Standard_Real, B2: Standard_Real, B3: Standard_Real, C1: Standard_Real, C2: Standard_Real, C3: Standard_Real, D: Standard_Real): void;
  RefRadius(): Standard_Real;
  SemiAngle(): Standard_Real;
  IsUClosed(): Standard_Boolean;
  IsVClosed(): Standard_Boolean;
  IsUPeriodic(): Standard_Boolean;
  IsVPeriodic(): Standard_Boolean;
  UIso(U: Standard_Real): Handle_Geom_Curve;
  VIso(V: Standard_Real): Handle_Geom_Curve;
  D0(U: Standard_Real, V: Standard_Real, P: gp_Pnt): void;
  D1(U: Standard_Real, V: Standard_Real, P: gp_Pnt, D1U: gp_Vec, D1V: gp_Vec): void;
  D2(U: Standard_Real, V: Standard_Real, P: gp_Pnt, D1U: gp_Vec, D1V: gp_Vec, D2U: gp_Vec, D2V: gp_Vec, D2UV: gp_Vec): void;
  D3(U: Standard_Real, V: Standard_Real, P: gp_Pnt, D1U: gp_Vec, D1V: gp_Vec, D2U: gp_Vec, D2V: gp_Vec, D2UV: gp_Vec, D3U: gp_Vec, D3V: gp_Vec, D3UUV: gp_Vec, D3UVV: gp_Vec): void;
  DN(U: Standard_Real, V: Standard_Real, Nu: Graphic3d_ZLayerId, Nv: Graphic3d_ZLayerId): gp_Vec;
  Transform(T: gp_Trsf): void;
  Copy(): Handle_Geom_Geometry;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

  export declare class Geom_ConicalSurface_1 extends Geom_ConicalSurface {
    constructor(A3: gp_Ax3, Ang: Standard_Real, Radius: Standard_Real);
  }

  export declare class Geom_ConicalSurface_2 extends Geom_ConicalSurface {
    constructor(C: gp_Cone);
  }

export declare class Handle_Geom_ConicalSurface {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Geom_ConicalSurface): void;
  get(): Geom_ConicalSurface;
  delete(): void;
}

  export declare class Handle_Geom_ConicalSurface_1 extends Handle_Geom_ConicalSurface {
    constructor();
  }

  export declare class Handle_Geom_ConicalSurface_2 extends Handle_Geom_ConicalSurface {
    constructor(thePtr: Geom_ConicalSurface);
  }

  export declare class Handle_Geom_ConicalSurface_3 extends Handle_Geom_ConicalSurface {
    constructor(theHandle: Handle_Geom_ConicalSurface);
  }

  export declare class Handle_Geom_ConicalSurface_4 extends Handle_Geom_ConicalSurface {
    constructor(theHandle: Handle_Geom_ConicalSurface);
  }

export declare class Geom_Circle extends Geom_Conic {
  SetCirc(C: gp_Circ): void;
  SetRadius(R: Standard_Real): void;
  Circ(): gp_Circ;
  Radius(): Standard_Real;
  ReversedParameter(U: Standard_Real): Standard_Real;
  Eccentricity(): Standard_Real;
  FirstParameter(): Standard_Real;
  LastParameter(): Standard_Real;
  IsClosed(): Standard_Boolean;
  IsPeriodic(): Standard_Boolean;
  D0(U: Standard_Real, P: gp_Pnt): void;
  D1(U: Standard_Real, P: gp_Pnt, V1: gp_Vec): void;
  D2(U: Standard_Real, P: gp_Pnt, V1: gp_Vec, V2: gp_Vec): void;
  D3(U: Standard_Real, P: gp_Pnt, V1: gp_Vec, V2: gp_Vec, V3: gp_Vec): void;
  DN(U: Standard_Real, N: Graphic3d_ZLayerId): gp_Vec;
  Transform(T: gp_Trsf): void;
  Copy(): Handle_Geom_Geometry;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

  export declare class Geom_Circle_1 extends Geom_Circle {
    constructor(C: gp_Circ);
  }

  export declare class Geom_Circle_2 extends Geom_Circle {
    constructor(A2: gp_Ax2, Radius: Standard_Real);
  }

export declare class Handle_Geom_Circle {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Geom_Circle): void;
  get(): Geom_Circle;
  delete(): void;
}

  export declare class Handle_Geom_Circle_1 extends Handle_Geom_Circle {
    constructor();
  }

  export declare class Handle_Geom_Circle_2 extends Handle_Geom_Circle {
    constructor(thePtr: Geom_Circle);
  }

  export declare class Handle_Geom_Circle_3 extends Handle_Geom_Circle {
    constructor(theHandle: Handle_Geom_Circle);
  }

  export declare class Handle_Geom_Circle_4 extends Handle_Geom_Circle {
    constructor(theHandle: Handle_Geom_Circle);
  }

export declare class Geom_Conic extends Geom_Curve {
  SetAxis(theA1: gp_Ax1): void;
  SetLocation(theP: gp_Pnt): void;
  SetPosition(theA2: gp_Ax2): void;
  Axis(): gp_Ax1;
  Location(): gp_Pnt;
  Position(): gp_Ax2;
  Eccentricity(): Standard_Real;
  XAxis(): gp_Ax1;
  YAxis(): gp_Ax1;
  Reverse(): void;
  ReversedParameter(U: Standard_Real): Standard_Real;
  Continuity(): GeomAbs_Shape;
  IsCN(N: Graphic3d_ZLayerId): Standard_Boolean;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

export declare class Handle_Geom_Conic {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Geom_Conic): void;
  get(): Geom_Conic;
  delete(): void;
}

  export declare class Handle_Geom_Conic_1 extends Handle_Geom_Conic {
    constructor();
  }

  export declare class Handle_Geom_Conic_2 extends Handle_Geom_Conic {
    constructor(thePtr: Geom_Conic);
  }

  export declare class Handle_Geom_Conic_3 extends Handle_Geom_Conic {
    constructor(theHandle: Handle_Geom_Conic);
  }

  export declare class Handle_Geom_Conic_4 extends Handle_Geom_Conic {
    constructor(theHandle: Handle_Geom_Conic);
  }

export declare class Geom_SurfaceOfRevolution extends Geom_SweptSurface {
  constructor(C: Handle_Geom_Curve, A1: gp_Ax1)
  SetAxis(A1: gp_Ax1): void;
  SetDirection(V: gp_Dir): void;
  SetBasisCurve(C: Handle_Geom_Curve): void;
  SetLocation(P: gp_Pnt): void;
  Axis(): gp_Ax1;
  Location(): gp_Pnt;
  ReferencePlane(): gp_Ax2;
  UReverse(): void;
  UReversedParameter(U: Standard_Real): Standard_Real;
  VReverse(): void;
  VReversedParameter(V: Standard_Real): Standard_Real;
  TransformParameters(U: Standard_Real, V: Standard_Real, T: gp_Trsf): void;
  ParametricTransformation(T: gp_Trsf): gp_GTrsf2d;
  Bounds(U1: Standard_Real, U2: Standard_Real, V1: Standard_Real, V2: Standard_Real): void;
  IsUClosed(): Standard_Boolean;
  IsVClosed(): Standard_Boolean;
  IsCNu(N: Graphic3d_ZLayerId): Standard_Boolean;
  IsCNv(N: Graphic3d_ZLayerId): Standard_Boolean;
  IsUPeriodic(): Standard_Boolean;
  IsVPeriodic(): Standard_Boolean;
  UIso(U: Standard_Real): Handle_Geom_Curve;
  VIso(V: Standard_Real): Handle_Geom_Curve;
  D0(U: Standard_Real, V: Standard_Real, P: gp_Pnt): void;
  D1(U: Standard_Real, V: Standard_Real, P: gp_Pnt, D1U: gp_Vec, D1V: gp_Vec): void;
  D2(U: Standard_Real, V: Standard_Real, P: gp_Pnt, D1U: gp_Vec, D1V: gp_Vec, D2U: gp_Vec, D2V: gp_Vec, D2UV: gp_Vec): void;
  D3(U: Standard_Real, V: Standard_Real, P: gp_Pnt, D1U: gp_Vec, D1V: gp_Vec, D2U: gp_Vec, D2V: gp_Vec, D2UV: gp_Vec, D3U: gp_Vec, D3V: gp_Vec, D3UUV: gp_Vec, D3UVV: gp_Vec): void;
  DN(U: Standard_Real, V: Standard_Real, Nu: Graphic3d_ZLayerId, Nv: Graphic3d_ZLayerId): gp_Vec;
  Transform(T: gp_Trsf): void;
  Copy(): Handle_Geom_Geometry;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

export declare class Handle_Geom_SurfaceOfRevolution {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Geom_SurfaceOfRevolution): void;
  get(): Geom_SurfaceOfRevolution;
  delete(): void;
}

  export declare class Handle_Geom_SurfaceOfRevolution_1 extends Handle_Geom_SurfaceOfRevolution {
    constructor();
  }

  export declare class Handle_Geom_SurfaceOfRevolution_2 extends Handle_Geom_SurfaceOfRevolution {
    constructor(thePtr: Geom_SurfaceOfRevolution);
  }

  export declare class Handle_Geom_SurfaceOfRevolution_3 extends Handle_Geom_SurfaceOfRevolution {
    constructor(theHandle: Handle_Geom_SurfaceOfRevolution);
  }

  export declare class Handle_Geom_SurfaceOfRevolution_4 extends Handle_Geom_SurfaceOfRevolution {
    constructor(theHandle: Handle_Geom_SurfaceOfRevolution);
  }

export declare class Handle_Geom_RectangularTrimmedSurface {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Geom_RectangularTrimmedSurface): void;
  get(): Geom_RectangularTrimmedSurface;
  delete(): void;
}

  export declare class Handle_Geom_RectangularTrimmedSurface_1 extends Handle_Geom_RectangularTrimmedSurface {
    constructor();
  }

  export declare class Handle_Geom_RectangularTrimmedSurface_2 extends Handle_Geom_RectangularTrimmedSurface {
    constructor(thePtr: Geom_RectangularTrimmedSurface);
  }

  export declare class Handle_Geom_RectangularTrimmedSurface_3 extends Handle_Geom_RectangularTrimmedSurface {
    constructor(theHandle: Handle_Geom_RectangularTrimmedSurface);
  }

  export declare class Handle_Geom_RectangularTrimmedSurface_4 extends Handle_Geom_RectangularTrimmedSurface {
    constructor(theHandle: Handle_Geom_RectangularTrimmedSurface);
  }

export declare class Geom_RectangularTrimmedSurface extends Geom_BoundedSurface {
  SetTrim_1(U1: Standard_Real, U2: Standard_Real, V1: Standard_Real, V2: Standard_Real, USense: Standard_Boolean, VSense: Standard_Boolean): void;
  SetTrim_2(Param1: Standard_Real, Param2: Standard_Real, UTrim: Standard_Boolean, Sense: Standard_Boolean): void;
  BasisSurface(): Handle_Geom_Surface;
  UReverse(): void;
  UReversedParameter(U: Standard_Real): Standard_Real;
  VReverse(): void;
  VReversedParameter(V: Standard_Real): Standard_Real;
  Bounds(U1: Standard_Real, U2: Standard_Real, V1: Standard_Real, V2: Standard_Real): void;
  Continuity(): GeomAbs_Shape;
  IsUClosed(): Standard_Boolean;
  IsVClosed(): Standard_Boolean;
  IsCNu(N: Graphic3d_ZLayerId): Standard_Boolean;
  IsCNv(N: Graphic3d_ZLayerId): Standard_Boolean;
  IsUPeriodic(): Standard_Boolean;
  UPeriod(): Standard_Real;
  IsVPeriodic(): Standard_Boolean;
  VPeriod(): Standard_Real;
  UIso(U: Standard_Real): Handle_Geom_Curve;
  VIso(V: Standard_Real): Handle_Geom_Curve;
  D0(U: Standard_Real, V: Standard_Real, P: gp_Pnt): void;
  D1(U: Standard_Real, V: Standard_Real, P: gp_Pnt, D1U: gp_Vec, D1V: gp_Vec): void;
  D2(U: Standard_Real, V: Standard_Real, P: gp_Pnt, D1U: gp_Vec, D1V: gp_Vec, D2U: gp_Vec, D2V: gp_Vec, D2UV: gp_Vec): void;
  D3(U: Standard_Real, V: Standard_Real, P: gp_Pnt, D1U: gp_Vec, D1V: gp_Vec, D2U: gp_Vec, D2V: gp_Vec, D2UV: gp_Vec, D3U: gp_Vec, D3V: gp_Vec, D3UUV: gp_Vec, D3UVV: gp_Vec): void;
  DN(U: Standard_Real, V: Standard_Real, Nu: Graphic3d_ZLayerId, Nv: Graphic3d_ZLayerId): gp_Vec;
  Transform(T: gp_Trsf): void;
  TransformParameters(U: Standard_Real, V: Standard_Real, T: gp_Trsf): void;
  ParametricTransformation(T: gp_Trsf): gp_GTrsf2d;
  Copy(): Handle_Geom_Geometry;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

  export declare class Geom_RectangularTrimmedSurface_1 extends Geom_RectangularTrimmedSurface {
    constructor(S: Handle_Geom_Surface, U1: Standard_Real, U2: Standard_Real, V1: Standard_Real, V2: Standard_Real, USense: Standard_Boolean, VSense: Standard_Boolean);
  }

  export declare class Geom_RectangularTrimmedSurface_2 extends Geom_RectangularTrimmedSurface {
    constructor(S: Handle_Geom_Surface, Param1: Standard_Real, Param2: Standard_Real, UTrim: Standard_Boolean, Sense: Standard_Boolean);
  }

export declare class Geom_OffsetSurface extends Geom_Surface {
  constructor(S: Handle_Geom_Surface, Offset: Standard_Real, isNotCheckC0: Standard_Boolean)
  SetBasisSurface(S: Handle_Geom_Surface, isNotCheckC0: Standard_Boolean): void;
  SetOffsetValue(D: Standard_Real): void;
  Offset(): Standard_Real;
  BasisSurface(): Handle_Geom_Surface;
  OsculatingSurface(): Handle_Geom_OsculatingSurface;
  UReverse(): void;
  UReversedParameter(U: Standard_Real): Standard_Real;
  VReverse(): void;
  VReversedParameter(V: Standard_Real): Standard_Real;
  Bounds(U1: Standard_Real, U2: Standard_Real, V1: Standard_Real, V2: Standard_Real): void;
  Continuity(): GeomAbs_Shape;
  IsCNu(N: Graphic3d_ZLayerId): Standard_Boolean;
  IsCNv(N: Graphic3d_ZLayerId): Standard_Boolean;
  IsUClosed(): Standard_Boolean;
  IsVClosed(): Standard_Boolean;
  IsUPeriodic(): Standard_Boolean;
  UPeriod(): Standard_Real;
  IsVPeriodic(): Standard_Boolean;
  VPeriod(): Standard_Real;
  UIso(U: Standard_Real): Handle_Geom_Curve;
  VIso(V: Standard_Real): Handle_Geom_Curve;
  D0(U: Standard_Real, V: Standard_Real, P: gp_Pnt): void;
  D1(U: Standard_Real, V: Standard_Real, P: gp_Pnt, D1U: gp_Vec, D1V: gp_Vec): void;
  D2(U: Standard_Real, V: Standard_Real, P: gp_Pnt, D1U: gp_Vec, D1V: gp_Vec, D2U: gp_Vec, D2V: gp_Vec, D2UV: gp_Vec): void;
  D3(U: Standard_Real, V: Standard_Real, P: gp_Pnt, D1U: gp_Vec, D1V: gp_Vec, D2U: gp_Vec, D2V: gp_Vec, D2UV: gp_Vec, D3U: gp_Vec, D3V: gp_Vec, D3UUV: gp_Vec, D3UVV: gp_Vec): void;
  DN(U: Standard_Real, V: Standard_Real, Nu: Graphic3d_ZLayerId, Nv: Graphic3d_ZLayerId): gp_Vec;
  Transform(T: gp_Trsf): void;
  TransformParameters(U: Standard_Real, V: Standard_Real, T: gp_Trsf): void;
  ParametricTransformation(T: gp_Trsf): gp_GTrsf2d;
  Copy(): Handle_Geom_Geometry;
  Surface(): Handle_Geom_Surface;
  UOsculatingSurface(U: Standard_Real, V: Standard_Real, IsOpposite: Standard_Boolean, UOsculSurf: Handle_Geom_BSplineSurface): Standard_Boolean;
  VOsculatingSurface(U: Standard_Real, V: Standard_Real, IsOpposite: Standard_Boolean, VOsculSurf: Handle_Geom_BSplineSurface): Standard_Boolean;
  GetBasisSurfContinuity(): GeomAbs_Shape;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

export declare class Handle_Geom_OffsetSurface {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Geom_OffsetSurface): void;
  get(): Geom_OffsetSurface;
  delete(): void;
}

  export declare class Handle_Geom_OffsetSurface_1 extends Handle_Geom_OffsetSurface {
    constructor();
  }

  export declare class Handle_Geom_OffsetSurface_2 extends Handle_Geom_OffsetSurface {
    constructor(thePtr: Geom_OffsetSurface);
  }

  export declare class Handle_Geom_OffsetSurface_3 extends Handle_Geom_OffsetSurface {
    constructor(theHandle: Handle_Geom_OffsetSurface);
  }

  export declare class Handle_Geom_OffsetSurface_4 extends Handle_Geom_OffsetSurface {
    constructor(theHandle: Handle_Geom_OffsetSurface);
  }

export declare class Geom_Hyperbola extends Geom_Conic {
  SetHypr(H: gp_Hypr): void;
  SetMajorRadius(MajorRadius: Standard_Real): void;
  SetMinorRadius(MinorRadius: Standard_Real): void;
  Hypr(): gp_Hypr;
  ReversedParameter(U: Standard_Real): Standard_Real;
  FirstParameter(): Standard_Real;
  LastParameter(): Standard_Real;
  IsClosed(): Standard_Boolean;
  IsPeriodic(): Standard_Boolean;
  Asymptote1(): gp_Ax1;
  Asymptote2(): gp_Ax1;
  ConjugateBranch1(): gp_Hypr;
  ConjugateBranch2(): gp_Hypr;
  Directrix1(): gp_Ax1;
  Directrix2(): gp_Ax1;
  Eccentricity(): Standard_Real;
  Focal(): Standard_Real;
  Focus1(): gp_Pnt;
  Focus2(): gp_Pnt;
  MajorRadius(): Standard_Real;
  MinorRadius(): Standard_Real;
  OtherBranch(): gp_Hypr;
  Parameter(): Standard_Real;
  D0(U: Standard_Real, P: gp_Pnt): void;
  D1(U: Standard_Real, P: gp_Pnt, V1: gp_Vec): void;
  D2(U: Standard_Real, P: gp_Pnt, V1: gp_Vec, V2: gp_Vec): void;
  D3(U: Standard_Real, P: gp_Pnt, V1: gp_Vec, V2: gp_Vec, V3: gp_Vec): void;
  DN(U: Standard_Real, N: Graphic3d_ZLayerId): gp_Vec;
  Transform(T: gp_Trsf): void;
  Copy(): Handle_Geom_Geometry;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

  export declare class Geom_Hyperbola_1 extends Geom_Hyperbola {
    constructor(H: gp_Hypr);
  }

  export declare class Geom_Hyperbola_2 extends Geom_Hyperbola {
    constructor(A2: gp_Ax2, MajorRadius: Standard_Real, MinorRadius: Standard_Real);
  }

export declare class Handle_Geom_Hyperbola {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Geom_Hyperbola): void;
  get(): Geom_Hyperbola;
  delete(): void;
}

  export declare class Handle_Geom_Hyperbola_1 extends Handle_Geom_Hyperbola {
    constructor();
  }

  export declare class Handle_Geom_Hyperbola_2 extends Handle_Geom_Hyperbola {
    constructor(thePtr: Geom_Hyperbola);
  }

  export declare class Handle_Geom_Hyperbola_3 extends Handle_Geom_Hyperbola {
    constructor(theHandle: Handle_Geom_Hyperbola);
  }

  export declare class Handle_Geom_Hyperbola_4 extends Handle_Geom_Hyperbola {
    constructor(theHandle: Handle_Geom_Hyperbola);
  }

export declare class Handle_Geom_BoundedCurve {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Geom_BoundedCurve): void;
  get(): Geom_BoundedCurve;
  delete(): void;
}

  export declare class Handle_Geom_BoundedCurve_1 extends Handle_Geom_BoundedCurve {
    constructor();
  }

  export declare class Handle_Geom_BoundedCurve_2 extends Handle_Geom_BoundedCurve {
    constructor(thePtr: Geom_BoundedCurve);
  }

  export declare class Handle_Geom_BoundedCurve_3 extends Handle_Geom_BoundedCurve {
    constructor(theHandle: Handle_Geom_BoundedCurve);
  }

  export declare class Handle_Geom_BoundedCurve_4 extends Handle_Geom_BoundedCurve {
    constructor(theHandle: Handle_Geom_BoundedCurve);
  }

export declare class Geom_BoundedCurve extends Geom_Curve {
  EndPoint(): gp_Pnt;
  StartPoint(): gp_Pnt;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

export declare class Geom_BSplineCurve extends Geom_BoundedCurve {
  IncreaseDegree(Degree: Graphic3d_ZLayerId): void;
  IncreaseMultiplicity_1(Index: Graphic3d_ZLayerId, M: Graphic3d_ZLayerId): void;
  IncreaseMultiplicity_2(I1: Graphic3d_ZLayerId, I2: Graphic3d_ZLayerId, M: Graphic3d_ZLayerId): void;
  IncrementMultiplicity(I1: Graphic3d_ZLayerId, I2: Graphic3d_ZLayerId, M: Graphic3d_ZLayerId): void;
  InsertKnot(U: Standard_Real, M: Graphic3d_ZLayerId, ParametricTolerance: Standard_Real, Add: Standard_Boolean): void;
  InsertKnots(Knots: IntTools_CArray1OfReal, Mults: TColStd_Array1OfInteger, ParametricTolerance: Standard_Real, Add: Standard_Boolean): void;
  RemoveKnot(Index: Graphic3d_ZLayerId, M: Graphic3d_ZLayerId, Tolerance: Standard_Real): Standard_Boolean;
  Reverse(): void;
  ReversedParameter(U: Standard_Real): Standard_Real;
  Segment(U1: Standard_Real, U2: Standard_Real, theTolerance: Standard_Real): void;
  SetKnot_1(Index: Graphic3d_ZLayerId, K: Standard_Real): void;
  SetKnots(K: IntTools_CArray1OfReal): void;
  SetKnot_2(Index: Graphic3d_ZLayerId, K: Standard_Real, M: Graphic3d_ZLayerId): void;
  PeriodicNormalization(U: Standard_Real): void;
  SetPeriodic(): void;
  SetOrigin_1(Index: Graphic3d_ZLayerId): void;
  SetOrigin_2(U: Standard_Real, Tol: Standard_Real): void;
  SetNotPeriodic(): void;
  SetPole_1(Index: Graphic3d_ZLayerId, P: gp_Pnt): void;
  SetPole_2(Index: Graphic3d_ZLayerId, P: gp_Pnt, Weight: Standard_Real): void;
  SetWeight(Index: Graphic3d_ZLayerId, Weight: Standard_Real): void;
  MovePoint(U: Standard_Real, P: gp_Pnt, Index1: Graphic3d_ZLayerId, Index2: Graphic3d_ZLayerId, FirstModifiedPole: Graphic3d_ZLayerId, LastModifiedPole: Graphic3d_ZLayerId): void;
  MovePointAndTangent(U: Standard_Real, P: gp_Pnt, Tangent: gp_Vec, Tolerance: Standard_Real, StartingCondition: Graphic3d_ZLayerId, EndingCondition: Graphic3d_ZLayerId, ErrorStatus: Graphic3d_ZLayerId): void;
  IsCN(N: Graphic3d_ZLayerId): Standard_Boolean;
  IsG1(theTf: Standard_Real, theTl: Standard_Real, theAngTol: Standard_Real): Standard_Boolean;
  IsClosed(): Standard_Boolean;
  IsPeriodic(): Standard_Boolean;
  IsRational(): Standard_Boolean;
  Continuity(): GeomAbs_Shape;
  Degree(): Graphic3d_ZLayerId;
  D0(U: Standard_Real, P: gp_Pnt): void;
  D1(U: Standard_Real, P: gp_Pnt, V1: gp_Vec): void;
  D2(U: Standard_Real, P: gp_Pnt, V1: gp_Vec, V2: gp_Vec): void;
  D3(U: Standard_Real, P: gp_Pnt, V1: gp_Vec, V2: gp_Vec, V3: gp_Vec): void;
  DN(U: Standard_Real, N: Graphic3d_ZLayerId): gp_Vec;
  LocalValue(U: Standard_Real, FromK1: Graphic3d_ZLayerId, ToK2: Graphic3d_ZLayerId): gp_Pnt;
  LocalD0(U: Standard_Real, FromK1: Graphic3d_ZLayerId, ToK2: Graphic3d_ZLayerId, P: gp_Pnt): void;
  LocalD1(U: Standard_Real, FromK1: Graphic3d_ZLayerId, ToK2: Graphic3d_ZLayerId, P: gp_Pnt, V1: gp_Vec): void;
  LocalD2(U: Standard_Real, FromK1: Graphic3d_ZLayerId, ToK2: Graphic3d_ZLayerId, P: gp_Pnt, V1: gp_Vec, V2: gp_Vec): void;
  LocalD3(U: Standard_Real, FromK1: Graphic3d_ZLayerId, ToK2: Graphic3d_ZLayerId, P: gp_Pnt, V1: gp_Vec, V2: gp_Vec, V3: gp_Vec): void;
  LocalDN(U: Standard_Real, FromK1: Graphic3d_ZLayerId, ToK2: Graphic3d_ZLayerId, N: Graphic3d_ZLayerId): gp_Vec;
  EndPoint(): gp_Pnt;
  FirstUKnotIndex(): Graphic3d_ZLayerId;
  FirstParameter(): Standard_Real;
  Knot(Index: Graphic3d_ZLayerId): Standard_Real;
  Knots_1(K: IntTools_CArray1OfReal): void;
  Knots_2(): IntTools_CArray1OfReal;
  KnotSequence_1(K: IntTools_CArray1OfReal): void;
  KnotSequence_2(): IntTools_CArray1OfReal;
  KnotDistribution(): GeomAbs_BSplKnotDistribution;
  LastUKnotIndex(): Graphic3d_ZLayerId;
  LastParameter(): Standard_Real;
  LocateU(U: Standard_Real, ParametricTolerance: Standard_Real, I1: Graphic3d_ZLayerId, I2: Graphic3d_ZLayerId, WithKnotRepetition: Standard_Boolean): void;
  Multiplicity(Index: Graphic3d_ZLayerId): Graphic3d_ZLayerId;
  Multiplicities_1(M: TColStd_Array1OfInteger): void;
  Multiplicities_2(): TColStd_Array1OfInteger;
  NbKnots(): Graphic3d_ZLayerId;
  NbPoles(): Graphic3d_ZLayerId;
  Pole(Index: Graphic3d_ZLayerId): gp_Pnt;
  Poles_1(P: TColgp_Array1OfPnt): void;
  Poles_2(): TColgp_Array1OfPnt;
  StartPoint(): gp_Pnt;
  Weight(Index: Graphic3d_ZLayerId): Standard_Real;
  Weights_1(W: IntTools_CArray1OfReal): void;
  Weights_2(): IntTools_CArray1OfReal;
  Transform(T: gp_Trsf): void;
  static MaxDegree(): Graphic3d_ZLayerId;
  Resolution(Tolerance3D: Standard_Real, UTolerance: Standard_Real): void;
  Copy(): Handle_Geom_Geometry;
  IsEqual(theOther: Handle_Geom_BSplineCurve, thePreci: Standard_Real): Standard_Boolean;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

  export declare class Geom_BSplineCurve_1 extends Geom_BSplineCurve {
    constructor(Poles: TColgp_Array1OfPnt, Knots: IntTools_CArray1OfReal, Multiplicities: TColStd_Array1OfInteger, Degree: Graphic3d_ZLayerId, Periodic: Standard_Boolean);
  }

  export declare class Geom_BSplineCurve_2 extends Geom_BSplineCurve {
    constructor(Poles: TColgp_Array1OfPnt, Weights: IntTools_CArray1OfReal, Knots: IntTools_CArray1OfReal, Multiplicities: TColStd_Array1OfInteger, Degree: Graphic3d_ZLayerId, Periodic: Standard_Boolean, CheckRational: Standard_Boolean);
  }

export declare class Handle_Geom_BSplineCurve {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Geom_BSplineCurve): void;
  get(): Geom_BSplineCurve;
  delete(): void;
}

  export declare class Handle_Geom_BSplineCurve_1 extends Handle_Geom_BSplineCurve {
    constructor();
  }

  export declare class Handle_Geom_BSplineCurve_2 extends Handle_Geom_BSplineCurve {
    constructor(thePtr: Geom_BSplineCurve);
  }

  export declare class Handle_Geom_BSplineCurve_3 extends Handle_Geom_BSplineCurve {
    constructor(theHandle: Handle_Geom_BSplineCurve);
  }

  export declare class Handle_Geom_BSplineCurve_4 extends Handle_Geom_BSplineCurve {
    constructor(theHandle: Handle_Geom_BSplineCurve);
  }

export declare class Handle_Geom_BSplineSurface {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Geom_BSplineSurface): void;
  get(): Geom_BSplineSurface;
  delete(): void;
}

  export declare class Handle_Geom_BSplineSurface_1 extends Handle_Geom_BSplineSurface {
    constructor();
  }

  export declare class Handle_Geom_BSplineSurface_2 extends Handle_Geom_BSplineSurface {
    constructor(thePtr: Geom_BSplineSurface);
  }

  export declare class Handle_Geom_BSplineSurface_3 extends Handle_Geom_BSplineSurface {
    constructor(theHandle: Handle_Geom_BSplineSurface);
  }

  export declare class Handle_Geom_BSplineSurface_4 extends Handle_Geom_BSplineSurface {
    constructor(theHandle: Handle_Geom_BSplineSurface);
  }

export declare class Geom_BSplineSurface extends Geom_BoundedSurface {
  ExchangeUV(): void;
  SetUPeriodic(): void;
  SetVPeriodic(): void;
  PeriodicNormalization(U: Standard_Real, V: Standard_Real): void;
  SetUOrigin(Index: Graphic3d_ZLayerId): void;
  SetVOrigin(Index: Graphic3d_ZLayerId): void;
  SetUNotPeriodic(): void;
  SetVNotPeriodic(): void;
  UReverse(): void;
  VReverse(): void;
  UReversedParameter(U: Standard_Real): Standard_Real;
  VReversedParameter(V: Standard_Real): Standard_Real;
  IncreaseDegree(UDegree: Graphic3d_ZLayerId, VDegree: Graphic3d_ZLayerId): void;
  InsertUKnots(Knots: IntTools_CArray1OfReal, Mults: TColStd_Array1OfInteger, ParametricTolerance: Standard_Real, Add: Standard_Boolean): void;
  InsertVKnots(Knots: IntTools_CArray1OfReal, Mults: TColStd_Array1OfInteger, ParametricTolerance: Standard_Real, Add: Standard_Boolean): void;
  RemoveUKnot(Index: Graphic3d_ZLayerId, M: Graphic3d_ZLayerId, Tolerance: Standard_Real): Standard_Boolean;
  RemoveVKnot(Index: Graphic3d_ZLayerId, M: Graphic3d_ZLayerId, Tolerance: Standard_Real): Standard_Boolean;
  IncreaseUMultiplicity_1(UIndex: Graphic3d_ZLayerId, M: Graphic3d_ZLayerId): void;
  IncreaseUMultiplicity_2(FromI1: Graphic3d_ZLayerId, ToI2: Graphic3d_ZLayerId, M: Graphic3d_ZLayerId): void;
  IncrementUMultiplicity(FromI1: Graphic3d_ZLayerId, ToI2: Graphic3d_ZLayerId, Step: Graphic3d_ZLayerId): void;
  IncreaseVMultiplicity_1(VIndex: Graphic3d_ZLayerId, M: Graphic3d_ZLayerId): void;
  IncreaseVMultiplicity_2(FromI1: Graphic3d_ZLayerId, ToI2: Graphic3d_ZLayerId, M: Graphic3d_ZLayerId): void;
  IncrementVMultiplicity(FromI1: Graphic3d_ZLayerId, ToI2: Graphic3d_ZLayerId, Step: Graphic3d_ZLayerId): void;
  InsertUKnot(U: Standard_Real, M: Graphic3d_ZLayerId, ParametricTolerance: Standard_Real, Add: Standard_Boolean): void;
  InsertVKnot(V: Standard_Real, M: Graphic3d_ZLayerId, ParametricTolerance: Standard_Real, Add: Standard_Boolean): void;
  Segment(U1: Standard_Real, U2: Standard_Real, V1: Standard_Real, V2: Standard_Real, theUTolerance: Standard_Real, theVTolerance: Standard_Real): void;
  CheckAndSegment(U1: Standard_Real, U2: Standard_Real, V1: Standard_Real, V2: Standard_Real, theUTolerance: Standard_Real, theVTolerance: Standard_Real): void;
  SetUKnot_1(UIndex: Graphic3d_ZLayerId, K: Standard_Real): void;
  SetUKnots(UK: IntTools_CArray1OfReal): void;
  SetUKnot_2(UIndex: Graphic3d_ZLayerId, K: Standard_Real, M: Graphic3d_ZLayerId): void;
  SetVKnot_1(VIndex: Graphic3d_ZLayerId, K: Standard_Real): void;
  SetVKnots(VK: IntTools_CArray1OfReal): void;
  SetVKnot_2(VIndex: Graphic3d_ZLayerId, K: Standard_Real, M: Graphic3d_ZLayerId): void;
  LocateU(U: Standard_Real, ParametricTolerance: Standard_Real, I1: Graphic3d_ZLayerId, I2: Graphic3d_ZLayerId, WithKnotRepetition: Standard_Boolean): void;
  LocateV(V: Standard_Real, ParametricTolerance: Standard_Real, I1: Graphic3d_ZLayerId, I2: Graphic3d_ZLayerId, WithKnotRepetition: Standard_Boolean): void;
  SetPole_1(UIndex: Graphic3d_ZLayerId, VIndex: Graphic3d_ZLayerId, P: gp_Pnt): void;
  SetPole_2(UIndex: Graphic3d_ZLayerId, VIndex: Graphic3d_ZLayerId, P: gp_Pnt, Weight: Standard_Real): void;
  SetPoleCol_1(VIndex: Graphic3d_ZLayerId, CPoles: TColgp_Array1OfPnt): void;
  SetPoleCol_2(VIndex: Graphic3d_ZLayerId, CPoles: TColgp_Array1OfPnt, CPoleWeights: IntTools_CArray1OfReal): void;
  SetPoleRow_1(UIndex: Graphic3d_ZLayerId, CPoles: TColgp_Array1OfPnt, CPoleWeights: IntTools_CArray1OfReal): void;
  SetPoleRow_2(UIndex: Graphic3d_ZLayerId, CPoles: TColgp_Array1OfPnt): void;
  SetWeight(UIndex: Graphic3d_ZLayerId, VIndex: Graphic3d_ZLayerId, Weight: Standard_Real): void;
  SetWeightCol(VIndex: Graphic3d_ZLayerId, CPoleWeights: IntTools_CArray1OfReal): void;
  SetWeightRow(UIndex: Graphic3d_ZLayerId, CPoleWeights: IntTools_CArray1OfReal): void;
  MovePoint(U: Standard_Real, V: Standard_Real, P: gp_Pnt, UIndex1: Graphic3d_ZLayerId, UIndex2: Graphic3d_ZLayerId, VIndex1: Graphic3d_ZLayerId, VIndex2: Graphic3d_ZLayerId, UFirstIndex: Graphic3d_ZLayerId, ULastIndex: Graphic3d_ZLayerId, VFirstIndex: Graphic3d_ZLayerId, VLastIndex: Graphic3d_ZLayerId): void;
  IsUClosed(): Standard_Boolean;
  IsVClosed(): Standard_Boolean;
  IsCNu(N: Graphic3d_ZLayerId): Standard_Boolean;
  IsCNv(N: Graphic3d_ZLayerId): Standard_Boolean;
  IsUPeriodic(): Standard_Boolean;
  IsURational(): Standard_Boolean;
  IsVPeriodic(): Standard_Boolean;
  IsVRational(): Standard_Boolean;
  Bounds(U1: Standard_Real, U2: Standard_Real, V1: Standard_Real, V2: Standard_Real): void;
  Continuity(): GeomAbs_Shape;
  FirstUKnotIndex(): Graphic3d_ZLayerId;
  FirstVKnotIndex(): Graphic3d_ZLayerId;
  LastUKnotIndex(): Graphic3d_ZLayerId;
  LastVKnotIndex(): Graphic3d_ZLayerId;
  NbUKnots(): Graphic3d_ZLayerId;
  NbUPoles(): Graphic3d_ZLayerId;
  NbVKnots(): Graphic3d_ZLayerId;
  NbVPoles(): Graphic3d_ZLayerId;
  Pole(UIndex: Graphic3d_ZLayerId, VIndex: Graphic3d_ZLayerId): gp_Pnt;
  Poles_1(P: TColgp_Array2OfPnt): void;
  Poles_2(): TColgp_Array2OfPnt;
  UDegree(): Graphic3d_ZLayerId;
  UKnot(UIndex: Graphic3d_ZLayerId): Standard_Real;
  UKnotDistribution(): GeomAbs_BSplKnotDistribution;
  UKnots_1(Ku: IntTools_CArray1OfReal): void;
  UKnots_2(): IntTools_CArray1OfReal;
  UKnotSequence_1(Ku: IntTools_CArray1OfReal): void;
  UKnotSequence_2(): IntTools_CArray1OfReal;
  UMultiplicity(UIndex: Graphic3d_ZLayerId): Graphic3d_ZLayerId;
  UMultiplicities_1(Mu: TColStd_Array1OfInteger): void;
  UMultiplicities_2(): TColStd_Array1OfInteger;
  VDegree(): Graphic3d_ZLayerId;
  VKnot(VIndex: Graphic3d_ZLayerId): Standard_Real;
  VKnotDistribution(): GeomAbs_BSplKnotDistribution;
  VKnots_1(Kv: IntTools_CArray1OfReal): void;
  VKnots_2(): IntTools_CArray1OfReal;
  VKnotSequence_1(Kv: IntTools_CArray1OfReal): void;
  VKnotSequence_2(): IntTools_CArray1OfReal;
  VMultiplicity(VIndex: Graphic3d_ZLayerId): Graphic3d_ZLayerId;
  VMultiplicities_1(Mv: TColStd_Array1OfInteger): void;
  VMultiplicities_2(): TColStd_Array1OfInteger;
  Weight(UIndex: Graphic3d_ZLayerId, VIndex: Graphic3d_ZLayerId): Standard_Real;
  Weights_1(W: TColStd_Array2OfReal): void;
  Weights_2(): TColStd_Array2OfReal;
  D0(U: Standard_Real, V: Standard_Real, P: gp_Pnt): void;
  D1(U: Standard_Real, V: Standard_Real, P: gp_Pnt, D1U: gp_Vec, D1V: gp_Vec): void;
  D2(U: Standard_Real, V: Standard_Real, P: gp_Pnt, D1U: gp_Vec, D1V: gp_Vec, D2U: gp_Vec, D2V: gp_Vec, D2UV: gp_Vec): void;
  D3(U: Standard_Real, V: Standard_Real, P: gp_Pnt, D1U: gp_Vec, D1V: gp_Vec, D2U: gp_Vec, D2V: gp_Vec, D2UV: gp_Vec, D3U: gp_Vec, D3V: gp_Vec, D3UUV: gp_Vec, D3UVV: gp_Vec): void;
  DN(U: Standard_Real, V: Standard_Real, Nu: Graphic3d_ZLayerId, Nv: Graphic3d_ZLayerId): gp_Vec;
  LocalD0(U: Standard_Real, V: Standard_Real, FromUK1: Graphic3d_ZLayerId, ToUK2: Graphic3d_ZLayerId, FromVK1: Graphic3d_ZLayerId, ToVK2: Graphic3d_ZLayerId, P: gp_Pnt): void;
  LocalD1(U: Standard_Real, V: Standard_Real, FromUK1: Graphic3d_ZLayerId, ToUK2: Graphic3d_ZLayerId, FromVK1: Graphic3d_ZLayerId, ToVK2: Graphic3d_ZLayerId, P: gp_Pnt, D1U: gp_Vec, D1V: gp_Vec): void;
  LocalD2(U: Standard_Real, V: Standard_Real, FromUK1: Graphic3d_ZLayerId, ToUK2: Graphic3d_ZLayerId, FromVK1: Graphic3d_ZLayerId, ToVK2: Graphic3d_ZLayerId, P: gp_Pnt, D1U: gp_Vec, D1V: gp_Vec, D2U: gp_Vec, D2V: gp_Vec, D2UV: gp_Vec): void;
  LocalD3(U: Standard_Real, V: Standard_Real, FromUK1: Graphic3d_ZLayerId, ToUK2: Graphic3d_ZLayerId, FromVK1: Graphic3d_ZLayerId, ToVK2: Graphic3d_ZLayerId, P: gp_Pnt, D1U: gp_Vec, D1V: gp_Vec, D2U: gp_Vec, D2V: gp_Vec, D2UV: gp_Vec, D3U: gp_Vec, D3V: gp_Vec, D3UUV: gp_Vec, D3UVV: gp_Vec): void;
  LocalDN(U: Standard_Real, V: Standard_Real, FromUK1: Graphic3d_ZLayerId, ToUK2: Graphic3d_ZLayerId, FromVK1: Graphic3d_ZLayerId, ToVK2: Graphic3d_ZLayerId, Nu: Graphic3d_ZLayerId, Nv: Graphic3d_ZLayerId): gp_Vec;
  LocalValue(U: Standard_Real, V: Standard_Real, FromUK1: Graphic3d_ZLayerId, ToUK2: Graphic3d_ZLayerId, FromVK1: Graphic3d_ZLayerId, ToVK2: Graphic3d_ZLayerId): gp_Pnt;
  UIso_1(U: Standard_Real): Handle_Geom_Curve;
  VIso_1(V: Standard_Real): Handle_Geom_Curve;
  UIso_2(U: Standard_Real, CheckRational: Standard_Boolean): Handle_Geom_Curve;
  VIso_2(V: Standard_Real, CheckRational: Standard_Boolean): Handle_Geom_Curve;
  Transform(T: gp_Trsf): void;
  static MaxDegree(): Graphic3d_ZLayerId;
  Resolution(Tolerance3D: Standard_Real, UTolerance: Standard_Real, VTolerance: Standard_Real): void;
  Copy(): Handle_Geom_Geometry;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

  export declare class Geom_BSplineSurface_1 extends Geom_BSplineSurface {
    constructor(Poles: TColgp_Array2OfPnt, UKnots: IntTools_CArray1OfReal, VKnots: IntTools_CArray1OfReal, UMults: TColStd_Array1OfInteger, VMults: TColStd_Array1OfInteger, UDegree: Graphic3d_ZLayerId, VDegree: Graphic3d_ZLayerId, UPeriodic: Standard_Boolean, VPeriodic: Standard_Boolean);
  }

  export declare class Geom_BSplineSurface_2 extends Geom_BSplineSurface {
    constructor(Poles: TColgp_Array2OfPnt, Weights: TColStd_Array2OfReal, UKnots: IntTools_CArray1OfReal, VKnots: IntTools_CArray1OfReal, UMults: TColStd_Array1OfInteger, VMults: TColStd_Array1OfInteger, UDegree: Graphic3d_ZLayerId, VDegree: Graphic3d_ZLayerId, UPeriodic: Standard_Boolean, VPeriodic: Standard_Boolean);
  }

export declare class Geom_TrimmedCurve extends Geom_BoundedCurve {
  constructor(C: Handle_Geom_Curve, U1: Standard_Real, U2: Standard_Real, Sense: Standard_Boolean, theAdjustPeriodic: Standard_Boolean)
  Reverse(): void;
  ReversedParameter(U: Standard_Real): Standard_Real;
  SetTrim(U1: Standard_Real, U2: Standard_Real, Sense: Standard_Boolean, theAdjustPeriodic: Standard_Boolean): void;
  BasisCurve(): Handle_Geom_Curve;
  Continuity(): GeomAbs_Shape;
  IsCN(N: Graphic3d_ZLayerId): Standard_Boolean;
  EndPoint(): gp_Pnt;
  FirstParameter(): Standard_Real;
  IsClosed(): Standard_Boolean;
  IsPeriodic(): Standard_Boolean;
  Period(): Standard_Real;
  LastParameter(): Standard_Real;
  StartPoint(): gp_Pnt;
  D0(U: Standard_Real, P: gp_Pnt): void;
  D1(U: Standard_Real, P: gp_Pnt, V1: gp_Vec): void;
  D2(U: Standard_Real, P: gp_Pnt, V1: gp_Vec, V2: gp_Vec): void;
  D3(U: Standard_Real, P: gp_Pnt, V1: gp_Vec, V2: gp_Vec, V3: gp_Vec): void;
  DN(U: Standard_Real, N: Graphic3d_ZLayerId): gp_Vec;
  Transform(T: gp_Trsf): void;
  TransformedParameter(U: Standard_Real, T: gp_Trsf): Standard_Real;
  ParametricTransformation(T: gp_Trsf): Standard_Real;
  Copy(): Handle_Geom_Geometry;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

export declare class Handle_Geom_TrimmedCurve {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Geom_TrimmedCurve): void;
  get(): Geom_TrimmedCurve;
  delete(): void;
}

  export declare class Handle_Geom_TrimmedCurve_1 extends Handle_Geom_TrimmedCurve {
    constructor();
  }

  export declare class Handle_Geom_TrimmedCurve_2 extends Handle_Geom_TrimmedCurve {
    constructor(thePtr: Geom_TrimmedCurve);
  }

  export declare class Handle_Geom_TrimmedCurve_3 extends Handle_Geom_TrimmedCurve {
    constructor(theHandle: Handle_Geom_TrimmedCurve);
  }

  export declare class Handle_Geom_TrimmedCurve_4 extends Handle_Geom_TrimmedCurve {
    constructor(theHandle: Handle_Geom_TrimmedCurve);
  }

export declare class Handle_Geom_Curve {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Geom_Curve): void;
  get(): Geom_Curve;
  delete(): void;
}

  export declare class Handle_Geom_Curve_1 extends Handle_Geom_Curve {
    constructor();
  }

  export declare class Handle_Geom_Curve_2 extends Handle_Geom_Curve {
    constructor(thePtr: Geom_Curve);
  }

  export declare class Handle_Geom_Curve_3 extends Handle_Geom_Curve {
    constructor(theHandle: Handle_Geom_Curve);
  }

  export declare class Handle_Geom_Curve_4 extends Handle_Geom_Curve {
    constructor(theHandle: Handle_Geom_Curve);
  }

export declare class Geom_Curve extends Geom_Geometry {
  Reverse(): void;
  ReversedParameter(U: Standard_Real): Standard_Real;
  TransformedParameter(U: Standard_Real, T: gp_Trsf): Standard_Real;
  ParametricTransformation(T: gp_Trsf): Standard_Real;
  Reversed(): Handle_Geom_Curve;
  FirstParameter(): Standard_Real;
  LastParameter(): Standard_Real;
  IsClosed(): Standard_Boolean;
  IsPeriodic(): Standard_Boolean;
  Period(): Standard_Real;
  Continuity(): GeomAbs_Shape;
  IsCN(N: Graphic3d_ZLayerId): Standard_Boolean;
  D0(U: Standard_Real, P: gp_Pnt): void;
  D1(U: Standard_Real, P: gp_Pnt, V1: gp_Vec): void;
  D2(U: Standard_Real, P: gp_Pnt, V1: gp_Vec, V2: gp_Vec): void;
  D3(U: Standard_Real, P: gp_Pnt, V1: gp_Vec, V2: gp_Vec, V3: gp_Vec): void;
  DN(U: Standard_Real, N: Graphic3d_ZLayerId): gp_Vec;
  Value(U: Standard_Real): gp_Pnt;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

export declare class Geom_ElementarySurface extends Geom_Surface {
  SetAxis(theA1: gp_Ax1): void;
  SetLocation(theLoc: gp_Pnt): void;
  SetPosition(theAx3: gp_Ax3): void;
  Axis(): gp_Ax1;
  Location(): gp_Pnt;
  Position(): gp_Ax3;
  UReverse(): void;
  UReversedParameter(U: Standard_Real): Standard_Real;
  VReverse(): void;
  VReversedParameter(V: Standard_Real): Standard_Real;
  Continuity(): GeomAbs_Shape;
  IsCNu(N: Graphic3d_ZLayerId): Standard_Boolean;
  IsCNv(N: Graphic3d_ZLayerId): Standard_Boolean;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

export declare class Handle_Geom_ElementarySurface {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Geom_ElementarySurface): void;
  get(): Geom_ElementarySurface;
  delete(): void;
}

  export declare class Handle_Geom_ElementarySurface_1 extends Handle_Geom_ElementarySurface {
    constructor();
  }

  export declare class Handle_Geom_ElementarySurface_2 extends Handle_Geom_ElementarySurface {
    constructor(thePtr: Geom_ElementarySurface);
  }

  export declare class Handle_Geom_ElementarySurface_3 extends Handle_Geom_ElementarySurface {
    constructor(theHandle: Handle_Geom_ElementarySurface);
  }

  export declare class Handle_Geom_ElementarySurface_4 extends Handle_Geom_ElementarySurface {
    constructor(theHandle: Handle_Geom_ElementarySurface);
  }

export declare class Handle_Geom_CylindricalSurface {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Geom_CylindricalSurface): void;
  get(): Geom_CylindricalSurface;
  delete(): void;
}

  export declare class Handle_Geom_CylindricalSurface_1 extends Handle_Geom_CylindricalSurface {
    constructor();
  }

  export declare class Handle_Geom_CylindricalSurface_2 extends Handle_Geom_CylindricalSurface {
    constructor(thePtr: Geom_CylindricalSurface);
  }

  export declare class Handle_Geom_CylindricalSurface_3 extends Handle_Geom_CylindricalSurface {
    constructor(theHandle: Handle_Geom_CylindricalSurface);
  }

  export declare class Handle_Geom_CylindricalSurface_4 extends Handle_Geom_CylindricalSurface {
    constructor(theHandle: Handle_Geom_CylindricalSurface);
  }

export declare class Geom_CylindricalSurface extends Geom_ElementarySurface {
  SetCylinder(C: gp_Cylinder): void;
  SetRadius(R: Standard_Real): void;
  Cylinder(): gp_Cylinder;
  UReversedParameter(U: Standard_Real): Standard_Real;
  VReversedParameter(V: Standard_Real): Standard_Real;
  TransformParameters(U: Standard_Real, V: Standard_Real, T: gp_Trsf): void;
  ParametricTransformation(T: gp_Trsf): gp_GTrsf2d;
  Bounds(U1: Standard_Real, U2: Standard_Real, V1: Standard_Real, V2: Standard_Real): void;
  Coefficients(A1: Standard_Real, A2: Standard_Real, A3: Standard_Real, B1: Standard_Real, B2: Standard_Real, B3: Standard_Real, C1: Standard_Real, C2: Standard_Real, C3: Standard_Real, D: Standard_Real): void;
  Radius(): Standard_Real;
  IsUClosed(): Standard_Boolean;
  IsVClosed(): Standard_Boolean;
  IsUPeriodic(): Standard_Boolean;
  IsVPeriodic(): Standard_Boolean;
  UIso(U: Standard_Real): Handle_Geom_Curve;
  VIso(V: Standard_Real): Handle_Geom_Curve;
  D0(U: Standard_Real, V: Standard_Real, P: gp_Pnt): void;
  D1(U: Standard_Real, V: Standard_Real, P: gp_Pnt, D1U: gp_Vec, D1V: gp_Vec): void;
  D2(U: Standard_Real, V: Standard_Real, P: gp_Pnt, D1U: gp_Vec, D1V: gp_Vec, D2U: gp_Vec, D2V: gp_Vec, D2UV: gp_Vec): void;
  D3(U: Standard_Real, V: Standard_Real, P: gp_Pnt, D1U: gp_Vec, D1V: gp_Vec, D2U: gp_Vec, D2V: gp_Vec, D2UV: gp_Vec, D3U: gp_Vec, D3V: gp_Vec, D3UUV: gp_Vec, D3UVV: gp_Vec): void;
  DN(U: Standard_Real, V: Standard_Real, Nu: Graphic3d_ZLayerId, Nv: Graphic3d_ZLayerId): gp_Vec;
  Transform(T: gp_Trsf): void;
  Copy(): Handle_Geom_Geometry;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

  export declare class Geom_CylindricalSurface_1 extends Geom_CylindricalSurface {
    constructor(A3: gp_Ax3, Radius: Standard_Real);
  }

  export declare class Geom_CylindricalSurface_2 extends Geom_CylindricalSurface {
    constructor(C: gp_Cylinder);
  }

export declare class Geom_Plane extends Geom_ElementarySurface {
  SetPln(Pl: gp_Pln): void;
  Pln(): gp_Pln;
  UReverse(): void;
  UReversedParameter(U: Standard_Real): Standard_Real;
  VReverse(): void;
  VReversedParameter(V: Standard_Real): Standard_Real;
  TransformParameters(U: Standard_Real, V: Standard_Real, T: gp_Trsf): void;
  ParametricTransformation(T: gp_Trsf): gp_GTrsf2d;
  Bounds(U1: Standard_Real, U2: Standard_Real, V1: Standard_Real, V2: Standard_Real): void;
  Coefficients(A: Standard_Real, B: Standard_Real, C: Standard_Real, D: Standard_Real): void;
  IsUClosed(): Standard_Boolean;
  IsVClosed(): Standard_Boolean;
  IsUPeriodic(): Standard_Boolean;
  IsVPeriodic(): Standard_Boolean;
  UIso(U: Standard_Real): Handle_Geom_Curve;
  VIso(V: Standard_Real): Handle_Geom_Curve;
  D0(U: Standard_Real, V: Standard_Real, P: gp_Pnt): void;
  D1(U: Standard_Real, V: Standard_Real, P: gp_Pnt, D1U: gp_Vec, D1V: gp_Vec): void;
  D2(U: Standard_Real, V: Standard_Real, P: gp_Pnt, D1U: gp_Vec, D1V: gp_Vec, D2U: gp_Vec, D2V: gp_Vec, D2UV: gp_Vec): void;
  D3(U: Standard_Real, V: Standard_Real, P: gp_Pnt, D1U: gp_Vec, D1V: gp_Vec, D2U: gp_Vec, D2V: gp_Vec, D2UV: gp_Vec, D3U: gp_Vec, D3V: gp_Vec, D3UUV: gp_Vec, D3UVV: gp_Vec): void;
  DN(U: Standard_Real, V: Standard_Real, Nu: Graphic3d_ZLayerId, Nv: Graphic3d_ZLayerId): gp_Vec;
  Transform(T: gp_Trsf): void;
  Copy(): Handle_Geom_Geometry;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

  export declare class Geom_Plane_1 extends Geom_Plane {
    constructor(A3: gp_Ax3);
  }

  export declare class Geom_Plane_2 extends Geom_Plane {
    constructor(Pl: gp_Pln);
  }

  export declare class Geom_Plane_3 extends Geom_Plane {
    constructor(P: gp_Pnt, V: gp_Dir);
  }

  export declare class Geom_Plane_4 extends Geom_Plane {
    constructor(A: Standard_Real, B: Standard_Real, C: Standard_Real, D: Standard_Real);
  }

export declare class Handle_Geom_Plane {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Geom_Plane): void;
  get(): Geom_Plane;
  delete(): void;
}

  export declare class Handle_Geom_Plane_1 extends Handle_Geom_Plane {
    constructor();
  }

  export declare class Handle_Geom_Plane_2 extends Handle_Geom_Plane {
    constructor(thePtr: Geom_Plane);
  }

  export declare class Handle_Geom_Plane_3 extends Handle_Geom_Plane {
    constructor(theHandle: Handle_Geom_Plane);
  }

  export declare class Handle_Geom_Plane_4 extends Handle_Geom_Plane {
    constructor(theHandle: Handle_Geom_Plane);
  }

export declare class Geom_Ellipse extends Geom_Conic {
  SetElips(E: gp_Elips): void;
  SetMajorRadius(MajorRadius: Standard_Real): void;
  SetMinorRadius(MinorRadius: Standard_Real): void;
  Elips(): gp_Elips;
  ReversedParameter(U: Standard_Real): Standard_Real;
  Directrix1(): gp_Ax1;
  Directrix2(): gp_Ax1;
  Eccentricity(): Standard_Real;
  Focal(): Standard_Real;
  Focus1(): gp_Pnt;
  Focus2(): gp_Pnt;
  MajorRadius(): Standard_Real;
  MinorRadius(): Standard_Real;
  Parameter(): Standard_Real;
  FirstParameter(): Standard_Real;
  LastParameter(): Standard_Real;
  IsClosed(): Standard_Boolean;
  IsPeriodic(): Standard_Boolean;
  D0(U: Standard_Real, P: gp_Pnt): void;
  D1(U: Standard_Real, P: gp_Pnt, V1: gp_Vec): void;
  D2(U: Standard_Real, P: gp_Pnt, V1: gp_Vec, V2: gp_Vec): void;
  D3(U: Standard_Real, P: gp_Pnt, V1: gp_Vec, V2: gp_Vec, V3: gp_Vec): void;
  DN(U: Standard_Real, N: Graphic3d_ZLayerId): gp_Vec;
  Transform(T: gp_Trsf): void;
  Copy(): Handle_Geom_Geometry;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

  export declare class Geom_Ellipse_1 extends Geom_Ellipse {
    constructor(E: gp_Elips);
  }

  export declare class Geom_Ellipse_2 extends Geom_Ellipse {
    constructor(A2: gp_Ax2, MajorRadius: Standard_Real, MinorRadius: Standard_Real);
  }

export declare class Handle_Geom_Ellipse {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Geom_Ellipse): void;
  get(): Geom_Ellipse;
  delete(): void;
}

  export declare class Handle_Geom_Ellipse_1 extends Handle_Geom_Ellipse {
    constructor();
  }

  export declare class Handle_Geom_Ellipse_2 extends Handle_Geom_Ellipse {
    constructor(thePtr: Geom_Ellipse);
  }

  export declare class Handle_Geom_Ellipse_3 extends Handle_Geom_Ellipse {
    constructor(theHandle: Handle_Geom_Ellipse);
  }

  export declare class Handle_Geom_Ellipse_4 extends Handle_Geom_Ellipse {
    constructor(theHandle: Handle_Geom_Ellipse);
  }

export declare class Geom_Line extends Geom_Curve {
  SetLin(L: gp_Lin): void;
  SetDirection(V: gp_Dir): void;
  SetLocation(P: gp_Pnt): void;
  SetPosition(A1: gp_Ax1): void;
  Lin(): gp_Lin;
  Position(): gp_Ax1;
  Reverse(): void;
  ReversedParameter(U: Standard_Real): Standard_Real;
  FirstParameter(): Standard_Real;
  LastParameter(): Standard_Real;
  IsClosed(): Standard_Boolean;
  IsPeriodic(): Standard_Boolean;
  Continuity(): GeomAbs_Shape;
  IsCN(N: Graphic3d_ZLayerId): Standard_Boolean;
  D0(U: Standard_Real, P: gp_Pnt): void;
  D1(U: Standard_Real, P: gp_Pnt, V1: gp_Vec): void;
  D2(U: Standard_Real, P: gp_Pnt, V1: gp_Vec, V2: gp_Vec): void;
  D3(U: Standard_Real, P: gp_Pnt, V1: gp_Vec, V2: gp_Vec, V3: gp_Vec): void;
  DN(U: Standard_Real, N: Graphic3d_ZLayerId): gp_Vec;
  Transform(T: gp_Trsf): void;
  TransformedParameter(U: Standard_Real, T: gp_Trsf): Standard_Real;
  ParametricTransformation(T: gp_Trsf): Standard_Real;
  Copy(): Handle_Geom_Geometry;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

  export declare class Geom_Line_1 extends Geom_Line {
    constructor(A1: gp_Ax1);
  }

  export declare class Geom_Line_2 extends Geom_Line {
    constructor(L: gp_Lin);
  }

  export declare class Geom_Line_3 extends Geom_Line {
    constructor(P: gp_Pnt, V: gp_Dir);
  }

export declare class Handle_Geom_Line {
  Nullify(): void;
  IsNull(): boolean;
  reset(thePtr: Geom_Line): void;
  get(): Geom_Line;
  delete(): void;
}

  export declare class Handle_Geom_Line_1 extends Handle_Geom_Line {
    constructor();
  }

  export declare class Handle_Geom_Line_2 extends Handle_Geom_Line {
    constructor(thePtr: Geom_Line);
  }

  export declare class Handle_Geom_Line_3 extends Handle_Geom_Line {
    constructor(theHandle: Handle_Geom_Line);
  }

  export declare class Handle_Geom_Line_4 extends Handle_Geom_Line {
    constructor(theHandle: Handle_Geom_Line);
  }

export declare class gp_Ax2 {
  SetAxis(A1: gp_Ax1): void;
  SetDirection(V: gp_Dir): void;
  SetLocation(theP: gp_Pnt): void;
  SetXDirection(theVx: gp_Dir): void;
  SetYDirection(theVy: gp_Dir): void;
  Angle(theOther: gp_Ax2): Standard_Real;
  Axis(): gp_Ax1;
  Direction(): gp_Dir;
  Location(): gp_Pnt;
  XDirection(): gp_Dir;
  YDirection(): gp_Dir;
  IsCoplanar_1(Other: gp_Ax2, LinearTolerance: Standard_Real, AngularTolerance: Standard_Real): Standard_Boolean;
  IsCoplanar_2(A1: gp_Ax1, LinearTolerance: Standard_Real, AngularTolerance: Standard_Real): Standard_Boolean;
  Mirror_1(P: gp_Pnt): void;
  Mirrored_1(P: gp_Pnt): gp_Ax2;
  Mirror_2(A1: gp_Ax1): void;
  Mirrored_2(A1: gp_Ax1): gp_Ax2;
  Mirror_3(A2: gp_Ax2): void;
  Mirrored_3(A2: gp_Ax2): gp_Ax2;
  Rotate(theA1: gp_Ax1, theAng: Standard_Real): void;
  Rotated(theA1: gp_Ax1, theAng: Standard_Real): gp_Ax2;
  Scale(theP: gp_Pnt, theS: Standard_Real): void;
  Scaled(theP: gp_Pnt, theS: Standard_Real): gp_Ax2;
  Transform(theT: gp_Trsf): void;
  Transformed(theT: gp_Trsf): gp_Ax2;
  Translate_1(theV: gp_Vec): void;
  Translated_1(theV: gp_Vec): gp_Ax2;
  Translate_2(theP1: gp_Pnt, theP2: gp_Pnt): void;
  Translated_2(theP1: gp_Pnt, theP2: gp_Pnt): gp_Ax2;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  InitFromJson(theSStream: Standard_SStream, theStreamPos: Graphic3d_ZLayerId): Standard_Boolean;
  delete(): void;
}

  export declare class gp_Ax2_1 extends gp_Ax2 {
    constructor();
  }

  export declare class gp_Ax2_2 extends gp_Ax2 {
    constructor(P: gp_Pnt, N: gp_Dir, Vx: gp_Dir);
  }

  export declare class gp_Ax2_3 extends gp_Ax2 {
    constructor(P: gp_Pnt, V: gp_Dir);
  }

export declare class gp_Pln {
  Coefficients(theA: Standard_Real, theB: Standard_Real, theC: Standard_Real, theD: Standard_Real): void;
  SetAxis(theA1: gp_Ax1): void;
  SetLocation(theLoc: gp_Pnt): void;
  SetPosition(theA3: gp_Ax3): void;
  UReverse(): void;
  VReverse(): void;
  Direct(): Standard_Boolean;
  Axis(): gp_Ax1;
  Location(): gp_Pnt;
  Position(): gp_Ax3;
  Distance_1(theP: gp_Pnt): Standard_Real;
  Distance_2(theL: gp_Lin): Standard_Real;
  Distance_3(theOther: gp_Pln): Standard_Real;
  SquareDistance_1(theP: gp_Pnt): Standard_Real;
  SquareDistance_2(theL: gp_Lin): Standard_Real;
  SquareDistance_3(theOther: gp_Pln): Standard_Real;
  XAxis(): gp_Ax1;
  YAxis(): gp_Ax1;
  Contains_1(theP: gp_Pnt, theLinearTolerance: Standard_Real): Standard_Boolean;
  Contains_2(theL: gp_Lin, theLinearTolerance: Standard_Real, theAngularTolerance: Standard_Real): Standard_Boolean;
  Mirror_1(theP: gp_Pnt): void;
  Mirrored_1(theP: gp_Pnt): gp_Pln;
  Mirror_2(theA1: gp_Ax1): void;
  Mirrored_2(theA1: gp_Ax1): gp_Pln;
  Mirror_3(theA2: gp_Ax2): void;
  Mirrored_3(theA2: gp_Ax2): gp_Pln;
  Rotate(theA1: gp_Ax1, theAng: Standard_Real): void;
  Rotated(theA1: gp_Ax1, theAng: Standard_Real): gp_Pln;
  Scale(theP: gp_Pnt, theS: Standard_Real): void;
  Scaled(theP: gp_Pnt, theS: Standard_Real): gp_Pln;
  Transform(theT: gp_Trsf): void;
  Transformed(theT: gp_Trsf): gp_Pln;
  Translate_1(theV: gp_Vec): void;
  Translated_1(theV: gp_Vec): gp_Pln;
  Translate_2(theP1: gp_Pnt, theP2: gp_Pnt): void;
  Translated_2(theP1: gp_Pnt, theP2: gp_Pnt): gp_Pln;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  delete(): void;
}

  export declare class gp_Pln_1 extends gp_Pln {
    constructor();
  }

  export declare class gp_Pln_2 extends gp_Pln {
    constructor(theA3: gp_Ax3);
  }

  export declare class gp_Pln_3 extends gp_Pln {
    constructor(theP: gp_Pnt, theV: gp_Dir);
  }

  export declare class gp_Pln_4 extends gp_Pln {
    constructor(theA: Standard_Real, theB: Standard_Real, theC: Standard_Real, theD: Standard_Real);
  }

export declare class gp_Lin {
  Reverse(): void;
  Reversed(): gp_Lin;
  SetDirection(theV: gp_Dir): void;
  SetLocation(theP: gp_Pnt): void;
  SetPosition(theA1: gp_Ax1): void;
  Direction(): gp_Dir;
  Location(): gp_Pnt;
  Position(): gp_Ax1;
  Angle(theOther: gp_Lin): Standard_Real;
  Contains(theP: gp_Pnt, theLinearTolerance: Standard_Real): Standard_Boolean;
  Distance_1(theP: gp_Pnt): Standard_Real;
  Distance_2(theOther: gp_Lin): Standard_Real;
  SquareDistance_1(theP: gp_Pnt): Standard_Real;
  SquareDistance_2(theOther: gp_Lin): Standard_Real;
  Normal(theP: gp_Pnt): gp_Lin;
  Mirror_1(theP: gp_Pnt): void;
  Mirrored_1(theP: gp_Pnt): gp_Lin;
  Mirror_2(theA1: gp_Ax1): void;
  Mirrored_2(theA1: gp_Ax1): gp_Lin;
  Mirror_3(theA2: gp_Ax2): void;
  Mirrored_3(theA2: gp_Ax2): gp_Lin;
  Rotate(theA1: gp_Ax1, theAng: Standard_Real): void;
  Rotated(theA1: gp_Ax1, theAng: Standard_Real): gp_Lin;
  Scale(theP: gp_Pnt, theS: Standard_Real): void;
  Scaled(theP: gp_Pnt, theS: Standard_Real): gp_Lin;
  Transform(theT: gp_Trsf): void;
  Transformed(theT: gp_Trsf): gp_Lin;
  Translate_1(theV: gp_Vec): void;
  Translated_1(theV: gp_Vec): gp_Lin;
  Translate_2(theP1: gp_Pnt, theP2: gp_Pnt): void;
  Translated_2(theP1: gp_Pnt, theP2: gp_Pnt): gp_Lin;
  delete(): void;
}

  export declare class gp_Lin_1 extends gp_Lin {
    constructor();
  }

  export declare class gp_Lin_2 extends gp_Lin {
    constructor(theA1: gp_Ax1);
  }

  export declare class gp_Lin_3 extends gp_Lin {
    constructor(theP: gp_Pnt, theV: gp_Dir);
  }

export declare class gp_Dir {
  SetCoord_1(theIndex: Graphic3d_ZLayerId, theXi: Standard_Real): void;
  SetCoord_2(theXv: Standard_Real, theYv: Standard_Real, theZv: Standard_Real): void;
  SetX(theX: Standard_Real): void;
  SetY(theY: Standard_Real): void;
  SetZ(theZ: Standard_Real): void;
  SetXYZ(theCoord: gp_XYZ): void;
  Coord_1(theIndex: Graphic3d_ZLayerId): Standard_Real;
  Coord_2(theXv: Standard_Real, theYv: Standard_Real, theZv: Standard_Real): void;
  X(): Standard_Real;
  Y(): Standard_Real;
  Z(): Standard_Real;
  XYZ(): gp_XYZ;
  IsEqual(theOther: gp_Dir, theAngularTolerance: Standard_Real): Standard_Boolean;
  IsNormal(theOther: gp_Dir, theAngularTolerance: Standard_Real): Standard_Boolean;
  IsOpposite(theOther: gp_Dir, theAngularTolerance: Standard_Real): Standard_Boolean;
  IsParallel(theOther: gp_Dir, theAngularTolerance: Standard_Real): Standard_Boolean;
  Angle(theOther: gp_Dir): Standard_Real;
  AngleWithRef(theOther: gp_Dir, theVRef: gp_Dir): Standard_Real;
  Cross(theRight: gp_Dir): void;
  Crossed(theRight: gp_Dir): gp_Dir;
  CrossCross(theV1: gp_Dir, theV2: gp_Dir): void;
  CrossCrossed(theV1: gp_Dir, theV2: gp_Dir): gp_Dir;
  Dot(theOther: gp_Dir): Standard_Real;
  DotCross(theV1: gp_Dir, theV2: gp_Dir): Standard_Real;
  Reverse(): void;
  Reversed(): gp_Dir;
  Mirror_1(theV: gp_Dir): void;
  Mirrored_1(theV: gp_Dir): gp_Dir;
  Mirror_2(theA1: gp_Ax1): void;
  Mirrored_2(theA1: gp_Ax1): gp_Dir;
  Mirror_3(theA2: gp_Ax2): void;
  Mirrored_3(theA2: gp_Ax2): gp_Dir;
  Rotate(theA1: gp_Ax1, theAng: Standard_Real): void;
  Rotated(theA1: gp_Ax1, theAng: Standard_Real): gp_Dir;
  Transform(theT: gp_Trsf): void;
  Transformed(theT: gp_Trsf): gp_Dir;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  InitFromJson(theSStream: Standard_SStream, theStreamPos: Graphic3d_ZLayerId): Standard_Boolean;
  delete(): void;
}

  export declare class gp_Dir_1 extends gp_Dir {
    constructor();
  }

  export declare class gp_Dir_2 extends gp_Dir {
    constructor(theV: gp_Vec);
  }

  export declare class gp_Dir_3 extends gp_Dir {
    constructor(theCoord: gp_XYZ);
  }

  export declare class gp_Dir_4 extends gp_Dir {
    constructor(theXv: Standard_Real, theYv: Standard_Real, theZv: Standard_Real);
  }

export declare class gp_Elips {
  SetAxis(theA1: gp_Ax1): void;
  SetLocation(theP: gp_Pnt): void;
  SetMajorRadius(theMajorRadius: Standard_Real): void;
  SetMinorRadius(theMinorRadius: Standard_Real): void;
  SetPosition(theA2: gp_Ax2): void;
  Area(): Standard_Real;
  Axis(): gp_Ax1;
  Directrix1(): gp_Ax1;
  Directrix2(): gp_Ax1;
  Eccentricity(): Standard_Real;
  Focal(): Standard_Real;
  Focus1(): gp_Pnt;
  Focus2(): gp_Pnt;
  Location(): gp_Pnt;
  MajorRadius(): Standard_Real;
  MinorRadius(): Standard_Real;
  Parameter(): Standard_Real;
  Position(): gp_Ax2;
  XAxis(): gp_Ax1;
  YAxis(): gp_Ax1;
  Mirror_1(theP: gp_Pnt): void;
  Mirrored_1(theP: gp_Pnt): gp_Elips;
  Mirror_2(theA1: gp_Ax1): void;
  Mirrored_2(theA1: gp_Ax1): gp_Elips;
  Mirror_3(theA2: gp_Ax2): void;
  Mirrored_3(theA2: gp_Ax2): gp_Elips;
  Rotate(theA1: gp_Ax1, theAng: Standard_Real): void;
  Rotated(theA1: gp_Ax1, theAng: Standard_Real): gp_Elips;
  Scale(theP: gp_Pnt, theS: Standard_Real): void;
  Scaled(theP: gp_Pnt, theS: Standard_Real): gp_Elips;
  Transform(theT: gp_Trsf): void;
  Transformed(theT: gp_Trsf): gp_Elips;
  Translate_1(theV: gp_Vec): void;
  Translated_1(theV: gp_Vec): gp_Elips;
  Translate_2(theP1: gp_Pnt, theP2: gp_Pnt): void;
  Translated_2(theP1: gp_Pnt, theP2: gp_Pnt): gp_Elips;
  delete(): void;
}

  export declare class gp_Elips_1 extends gp_Elips {
    constructor();
  }

  export declare class gp_Elips_2 extends gp_Elips {
    constructor(theA2: gp_Ax2, theMajorRadius: Standard_Real, theMinorRadius: Standard_Real);
  }

export declare class gp_Pnt {
  SetCoord_1(theIndex: Graphic3d_ZLayerId, theXi: Standard_Real): void;
  SetCoord_2(theXp: Standard_Real, theYp: Standard_Real, theZp: Standard_Real): void;
  SetX(theX: Standard_Real): void;
  SetY(theY: Standard_Real): void;
  SetZ(theZ: Standard_Real): void;
  SetXYZ(theCoord: gp_XYZ): void;
  Coord_1(theIndex: Graphic3d_ZLayerId): Standard_Real;
  Coord_2(theXp: Standard_Real, theYp: Standard_Real, theZp: Standard_Real): void;
  X(): Standard_Real;
  Y(): Standard_Real;
  Z(): Standard_Real;
  XYZ(): gp_XYZ;
  Coord_3(): gp_XYZ;
  ChangeCoord(): gp_XYZ;
  BaryCenter(theAlpha: Standard_Real, theP: gp_Pnt, theBeta: Standard_Real): void;
  IsEqual(theOther: gp_Pnt, theLinearTolerance: Standard_Real): Standard_Boolean;
  Distance(theOther: gp_Pnt): Standard_Real;
  SquareDistance(theOther: gp_Pnt): Standard_Real;
  Mirror_1(theP: gp_Pnt): void;
  Mirrored_1(theP: gp_Pnt): gp_Pnt;
  Mirror_2(theA1: gp_Ax1): void;
  Mirrored_2(theA1: gp_Ax1): gp_Pnt;
  Mirror_3(theA2: gp_Ax2): void;
  Mirrored_3(theA2: gp_Ax2): gp_Pnt;
  Rotate(theA1: gp_Ax1, theAng: Standard_Real): void;
  Rotated(theA1: gp_Ax1, theAng: Standard_Real): gp_Pnt;
  Scale(theP: gp_Pnt, theS: Standard_Real): void;
  Scaled(theP: gp_Pnt, theS: Standard_Real): gp_Pnt;
  Transform(theT: gp_Trsf): void;
  Transformed(theT: gp_Trsf): gp_Pnt;
  Translate_1(theV: gp_Vec): void;
  Translated_1(theV: gp_Vec): gp_Pnt;
  Translate_2(theP1: gp_Pnt, theP2: gp_Pnt): void;
  Translated_2(theP1: gp_Pnt, theP2: gp_Pnt): gp_Pnt;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  InitFromJson(theSStream: Standard_SStream, theStreamPos: Graphic3d_ZLayerId): Standard_Boolean;
  delete(): void;
}

  export declare class gp_Pnt_1 extends gp_Pnt {
    constructor();
  }

  export declare class gp_Pnt_2 extends gp_Pnt {
    constructor(theCoord: gp_XYZ);
  }

  export declare class gp_Pnt_3 extends gp_Pnt {
    constructor(theXp: Standard_Real, theYp: Standard_Real, theZp: Standard_Real);
  }

export declare class gp_Sphere {
  SetLocation(theLoc: gp_Pnt): void;
  SetPosition(theA3: gp_Ax3): void;
  SetRadius(theR: Standard_Real): void;
  Area(): Standard_Real;
  Coefficients(theA1: Standard_Real, theA2: Standard_Real, theA3: Standard_Real, theB1: Standard_Real, theB2: Standard_Real, theB3: Standard_Real, theC1: Standard_Real, theC2: Standard_Real, theC3: Standard_Real, theD: Standard_Real): void;
  UReverse(): void;
  VReverse(): void;
  Direct(): Standard_Boolean;
  Location(): gp_Pnt;
  Position(): gp_Ax3;
  Radius(): Standard_Real;
  Volume(): Standard_Real;
  XAxis(): gp_Ax1;
  YAxis(): gp_Ax1;
  Mirror_1(theP: gp_Pnt): void;
  Mirrored_1(theP: gp_Pnt): gp_Sphere;
  Mirror_2(theA1: gp_Ax1): void;
  Mirrored_2(theA1: gp_Ax1): gp_Sphere;
  Mirror_3(theA2: gp_Ax2): void;
  Mirrored_3(theA2: gp_Ax2): gp_Sphere;
  Rotate(theA1: gp_Ax1, theAng: Standard_Real): void;
  Rotated(theA1: gp_Ax1, theAng: Standard_Real): gp_Sphere;
  Scale(theP: gp_Pnt, theS: Standard_Real): void;
  Scaled(theP: gp_Pnt, theS: Standard_Real): gp_Sphere;
  Transform(theT: gp_Trsf): void;
  Transformed(theT: gp_Trsf): gp_Sphere;
  Translate_1(theV: gp_Vec): void;
  Translated_1(theV: gp_Vec): gp_Sphere;
  Translate_2(theP1: gp_Pnt, theP2: gp_Pnt): void;
  Translated_2(theP1: gp_Pnt, theP2: gp_Pnt): gp_Sphere;
  delete(): void;
}

  export declare class gp_Sphere_1 extends gp_Sphere {
    constructor();
  }

  export declare class gp_Sphere_2 extends gp_Sphere {
    constructor(theA3: gp_Ax3, theRadius: Standard_Real);
  }

export declare class gp_Ax1 {
  SetDirection(theV: gp_Dir): void;
  SetLocation(theP: gp_Pnt): void;
  Direction(): gp_Dir;
  Location(): gp_Pnt;
  IsCoaxial(Other: gp_Ax1, AngularTolerance: Standard_Real, LinearTolerance: Standard_Real): Standard_Boolean;
  IsNormal(theOther: gp_Ax1, theAngularTolerance: Standard_Real): Standard_Boolean;
  IsOpposite(theOther: gp_Ax1, theAngularTolerance: Standard_Real): Standard_Boolean;
  IsParallel(theOther: gp_Ax1, theAngularTolerance: Standard_Real): Standard_Boolean;
  Angle(theOther: gp_Ax1): Standard_Real;
  Reverse(): void;
  Reversed(): gp_Ax1;
  Mirror_1(P: gp_Pnt): void;
  Mirrored_1(P: gp_Pnt): gp_Ax1;
  Mirror_2(A1: gp_Ax1): void;
  Mirrored_2(A1: gp_Ax1): gp_Ax1;
  Mirror_3(A2: gp_Ax2): void;
  Mirrored_3(A2: gp_Ax2): gp_Ax1;
  Rotate(theA1: gp_Ax1, theAngRad: Standard_Real): void;
  Rotated(theA1: gp_Ax1, theAngRad: Standard_Real): gp_Ax1;
  Scale(theP: gp_Pnt, theS: Standard_Real): void;
  Scaled(theP: gp_Pnt, theS: Standard_Real): gp_Ax1;
  Transform(theT: gp_Trsf): void;
  Transformed(theT: gp_Trsf): gp_Ax1;
  Translate_1(theV: gp_Vec): void;
  Translated_1(theV: gp_Vec): gp_Ax1;
  Translate_2(theP1: gp_Pnt, theP2: gp_Pnt): void;
  Translated_2(theP1: gp_Pnt, theP2: gp_Pnt): gp_Ax1;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  InitFromJson(theSStream: Standard_SStream, theStreamPos: Graphic3d_ZLayerId): Standard_Boolean;
  delete(): void;
}

  export declare class gp_Ax1_1 extends gp_Ax1 {
    constructor();
  }

  export declare class gp_Ax1_2 extends gp_Ax1 {
    constructor(theP: gp_Pnt, theV: gp_Dir);
  }

export declare class gp_Circ2d {
  SetLocation(theP: gp_Pnt2d): void;
  SetXAxis(theA: gp_Ax2d): void;
  SetAxis(theA: gp_Ax22d): void;
  SetYAxis(theA: gp_Ax2d): void;
  SetRadius(theRadius: Standard_Real): void;
  Area(): Standard_Real;
  Coefficients(theA: Standard_Real, theB: Standard_Real, theC: Standard_Real, theD: Standard_Real, theE: Standard_Real, theF: Standard_Real): void;
  Contains(theP: gp_Pnt2d, theLinearTolerance: Standard_Real): Standard_Boolean;
  Distance(theP: gp_Pnt2d): Standard_Real;
  SquareDistance(theP: gp_Pnt2d): Standard_Real;
  Length(): Standard_Real;
  Location(): gp_Pnt2d;
  Radius(): Standard_Real;
  Axis(): gp_Ax22d;
  Position(): gp_Ax22d;
  XAxis(): gp_Ax2d;
  YAxis(): gp_Ax2d;
  Reverse(): void;
  Reversed(): gp_Circ2d;
  IsDirect(): Standard_Boolean;
  Mirror_1(theP: gp_Pnt2d): void;
  Mirrored_1(theP: gp_Pnt2d): gp_Circ2d;
  Mirror_2(theA: gp_Ax2d): void;
  Mirrored_2(theA: gp_Ax2d): gp_Circ2d;
  Rotate(theP: gp_Pnt2d, theAng: Standard_Real): void;
  Rotated(theP: gp_Pnt2d, theAng: Standard_Real): gp_Circ2d;
  Scale(theP: gp_Pnt2d, theS: Standard_Real): void;
  Scaled(theP: gp_Pnt2d, theS: Standard_Real): gp_Circ2d;
  Transform(theT: gp_Trsf2d): void;
  Transformed(theT: gp_Trsf2d): gp_Circ2d;
  Translate_1(theV: gp_Vec2d): void;
  Translated_1(theV: gp_Vec2d): gp_Circ2d;
  Translate_2(theP1: gp_Pnt2d, theP2: gp_Pnt2d): void;
  Translated_2(theP1: gp_Pnt2d, theP2: gp_Pnt2d): gp_Circ2d;
  delete(): void;
}

  export declare class gp_Circ2d_1 extends gp_Circ2d {
    constructor();
  }

  export declare class gp_Circ2d_2 extends gp_Circ2d {
    constructor(theXAxis: gp_Ax2d, theRadius: Standard_Real, theIsSense: Standard_Boolean);
  }

  export declare class gp_Circ2d_3 extends gp_Circ2d {
    constructor(theAxis: gp_Ax22d, theRadius: Standard_Real);
  }

export declare class gp_Cylinder {
  SetAxis(theA1: gp_Ax1): void;
  SetLocation(theLoc: gp_Pnt): void;
  SetPosition(theA3: gp_Ax3): void;
  SetRadius(theR: Standard_Real): void;
  UReverse(): void;
  VReverse(): void;
  Direct(): Standard_Boolean;
  Axis(): gp_Ax1;
  Coefficients(theA1: Standard_Real, theA2: Standard_Real, theA3: Standard_Real, theB1: Standard_Real, theB2: Standard_Real, theB3: Standard_Real, theC1: Standard_Real, theC2: Standard_Real, theC3: Standard_Real, theD: Standard_Real): void;
  Location(): gp_Pnt;
  Position(): gp_Ax3;
  Radius(): Standard_Real;
  XAxis(): gp_Ax1;
  YAxis(): gp_Ax1;
  Mirror_1(theP: gp_Pnt): void;
  Mirrored_1(theP: gp_Pnt): gp_Cylinder;
  Mirror_2(theA1: gp_Ax1): void;
  Mirrored_2(theA1: gp_Ax1): gp_Cylinder;
  Mirror_3(theA2: gp_Ax2): void;
  Mirrored_3(theA2: gp_Ax2): gp_Cylinder;
  Rotate(theA1: gp_Ax1, theAng: Standard_Real): void;
  Rotated(theA1: gp_Ax1, theAng: Standard_Real): gp_Cylinder;
  Scale(theP: gp_Pnt, theS: Standard_Real): void;
  Scaled(theP: gp_Pnt, theS: Standard_Real): gp_Cylinder;
  Transform(theT: gp_Trsf): void;
  Transformed(theT: gp_Trsf): gp_Cylinder;
  Translate_1(theV: gp_Vec): void;
  Translated_1(theV: gp_Vec): gp_Cylinder;
  Translate_2(theP1: gp_Pnt, theP2: gp_Pnt): void;
  Translated_2(theP1: gp_Pnt, theP2: gp_Pnt): gp_Cylinder;
  delete(): void;
}

  export declare class gp_Cylinder_1 extends gp_Cylinder {
    constructor();
  }

  export declare class gp_Cylinder_2 extends gp_Cylinder {
    constructor(theA3: gp_Ax3, theRadius: Standard_Real);
  }

export declare class gp_Vec2d {
  SetCoord_1(theIndex: Graphic3d_ZLayerId, theXi: Standard_Real): void;
  SetCoord_2(theXv: Standard_Real, theYv: Standard_Real): void;
  SetX(theX: Standard_Real): void;
  SetY(theY: Standard_Real): void;
  SetXY(theCoord: gp_XY): void;
  Coord_1(theIndex: Graphic3d_ZLayerId): Standard_Real;
  Coord_2(theXv: Standard_Real, theYv: Standard_Real): void;
  X(): Standard_Real;
  Y(): Standard_Real;
  XY(): gp_XY;
  IsEqual(theOther: gp_Vec2d, theLinearTolerance: Standard_Real, theAngularTolerance: Standard_Real): Standard_Boolean;
  IsNormal(theOther: gp_Vec2d, theAngularTolerance: Standard_Real): Standard_Boolean;
  IsOpposite(theOther: gp_Vec2d, theAngularTolerance: Standard_Real): Standard_Boolean;
  IsParallel(theOther: gp_Vec2d, theAngularTolerance: Standard_Real): Standard_Boolean;
  Angle(theOther: gp_Vec2d): Standard_Real;
  Magnitude(): Standard_Real;
  SquareMagnitude(): Standard_Real;
  Add(theOther: gp_Vec2d): void;
  Added(theOther: gp_Vec2d): gp_Vec2d;
  Crossed(theRight: gp_Vec2d): Standard_Real;
  CrossMagnitude(theRight: gp_Vec2d): Standard_Real;
  CrossSquareMagnitude(theRight: gp_Vec2d): Standard_Real;
  Divide(theScalar: Standard_Real): void;
  Divided(theScalar: Standard_Real): gp_Vec2d;
  Dot(theOther: gp_Vec2d): Standard_Real;
  GetNormal(): gp_Vec2d;
  Multiply(theScalar: Standard_Real): void;
  Multiplied(theScalar: Standard_Real): gp_Vec2d;
  Normalize(): void;
  Normalized(): gp_Vec2d;
  Reverse(): void;
  Reversed(): gp_Vec2d;
  Subtract(theRight: gp_Vec2d): void;
  Subtracted(theRight: gp_Vec2d): gp_Vec2d;
  SetLinearForm_1(theA1: Standard_Real, theV1: gp_Vec2d, theA2: Standard_Real, theV2: gp_Vec2d, theV3: gp_Vec2d): void;
  SetLinearForm_2(theA1: Standard_Real, theV1: gp_Vec2d, theA2: Standard_Real, theV2: gp_Vec2d): void;
  SetLinearForm_3(theA1: Standard_Real, theV1: gp_Vec2d, theV2: gp_Vec2d): void;
  SetLinearForm_4(theV1: gp_Vec2d, theV2: gp_Vec2d): void;
  Mirror_1(theV: gp_Vec2d): void;
  Mirrored_1(theV: gp_Vec2d): gp_Vec2d;
  Mirror_2(theA1: gp_Ax2d): void;
  Mirrored_2(theA1: gp_Ax2d): gp_Vec2d;
  Rotate(theAng: Standard_Real): void;
  Rotated(theAng: Standard_Real): gp_Vec2d;
  Scale(theS: Standard_Real): void;
  Scaled(theS: Standard_Real): gp_Vec2d;
  Transform(theT: gp_Trsf2d): void;
  Transformed(theT: gp_Trsf2d): gp_Vec2d;
  delete(): void;
}

  export declare class gp_Vec2d_1 extends gp_Vec2d {
    constructor();
  }

  export declare class gp_Vec2d_2 extends gp_Vec2d {
    constructor(theV: gp_Dir2d);
  }

  export declare class gp_Vec2d_3 extends gp_Vec2d {
    constructor(theCoord: gp_XY);
  }

  export declare class gp_Vec2d_4 extends gp_Vec2d {
    constructor(theXv: Standard_Real, theYv: Standard_Real);
  }

  export declare class gp_Vec2d_5 extends gp_Vec2d {
    constructor(theP1: gp_Pnt2d, theP2: gp_Pnt2d);
  }

export declare class gp_Torus {
  SetAxis(theA1: gp_Ax1): void;
  SetLocation(theLoc: gp_Pnt): void;
  SetMajorRadius(theMajorRadius: Standard_Real): void;
  SetMinorRadius(theMinorRadius: Standard_Real): void;
  SetPosition(theA3: gp_Ax3): void;
  Area(): Standard_Real;
  UReverse(): void;
  VReverse(): void;
  Direct(): Standard_Boolean;
  Axis(): gp_Ax1;
  Coefficients(theCoef: IntTools_CArray1OfReal): void;
  Location(): gp_Pnt;
  Position(): gp_Ax3;
  MajorRadius(): Standard_Real;
  MinorRadius(): Standard_Real;
  Volume(): Standard_Real;
  XAxis(): gp_Ax1;
  YAxis(): gp_Ax1;
  Mirror_1(theP: gp_Pnt): void;
  Mirrored_1(theP: gp_Pnt): gp_Torus;
  Mirror_2(theA1: gp_Ax1): void;
  Mirrored_2(theA1: gp_Ax1): gp_Torus;
  Mirror_3(theA2: gp_Ax2): void;
  Mirrored_3(theA2: gp_Ax2): gp_Torus;
  Rotate(theA1: gp_Ax1, theAng: Standard_Real): void;
  Rotated(theA1: gp_Ax1, theAng: Standard_Real): gp_Torus;
  Scale(theP: gp_Pnt, theS: Standard_Real): void;
  Scaled(theP: gp_Pnt, theS: Standard_Real): gp_Torus;
  Transform(theT: gp_Trsf): void;
  Transformed(theT: gp_Trsf): gp_Torus;
  Translate_1(theV: gp_Vec): void;
  Translated_1(theV: gp_Vec): gp_Torus;
  Translate_2(theP1: gp_Pnt, theP2: gp_Pnt): void;
  Translated_2(theP1: gp_Pnt, theP2: gp_Pnt): gp_Torus;
  delete(): void;
}

  export declare class gp_Torus_1 extends gp_Torus {
    constructor();
  }

  export declare class gp_Torus_2 extends gp_Torus {
    constructor(theA3: gp_Ax3, theMajorRadius: Standard_Real, theMinorRadius: Standard_Real);
  }

export declare class gp_Cone {
  SetAxis(theA1: gp_Ax1): void;
  SetLocation(theLoc: gp_Pnt): void;
  SetPosition(theA3: gp_Ax3): void;
  SetRadius(theR: Standard_Real): void;
  SetSemiAngle(theAng: Standard_Real): void;
  Apex(): gp_Pnt;
  UReverse(): void;
  VReverse(): void;
  Direct(): Standard_Boolean;
  Axis(): gp_Ax1;
  Coefficients(theA1: Standard_Real, theA2: Standard_Real, theA3: Standard_Real, theB1: Standard_Real, theB2: Standard_Real, theB3: Standard_Real, theC1: Standard_Real, theC2: Standard_Real, theC3: Standard_Real, theD: Standard_Real): void;
  Location(): gp_Pnt;
  Position(): gp_Ax3;
  RefRadius(): Standard_Real;
  SemiAngle(): Standard_Real;
  XAxis(): gp_Ax1;
  YAxis(): gp_Ax1;
  Mirror_1(theP: gp_Pnt): void;
  Mirrored_1(theP: gp_Pnt): gp_Cone;
  Mirror_2(theA1: gp_Ax1): void;
  Mirrored_2(theA1: gp_Ax1): gp_Cone;
  Mirror_3(theA2: gp_Ax2): void;
  Mirrored_3(theA2: gp_Ax2): gp_Cone;
  Rotate(theA1: gp_Ax1, theAng: Standard_Real): void;
  Rotated(theA1: gp_Ax1, theAng: Standard_Real): gp_Cone;
  Scale(theP: gp_Pnt, theS: Standard_Real): void;
  Scaled(theP: gp_Pnt, theS: Standard_Real): gp_Cone;
  Transform(theT: gp_Trsf): void;
  Transformed(theT: gp_Trsf): gp_Cone;
  Translate_1(theV: gp_Vec): void;
  Translated_1(theV: gp_Vec): gp_Cone;
  Translate_2(theP1: gp_Pnt, theP2: gp_Pnt): void;
  Translated_2(theP1: gp_Pnt, theP2: gp_Pnt): gp_Cone;
  delete(): void;
}

  export declare class gp_Cone_1 extends gp_Cone {
    constructor();
  }

  export declare class gp_Cone_2 extends gp_Cone {
    constructor(theA3: gp_Ax3, theAng: Standard_Real, theRadius: Standard_Real);
  }

export declare class gp_Vec {
  SetCoord_1(theIndex: Graphic3d_ZLayerId, theXi: Standard_Real): void;
  SetCoord_2(theXv: Standard_Real, theYv: Standard_Real, theZv: Standard_Real): void;
  SetX(theX: Standard_Real): void;
  SetY(theY: Standard_Real): void;
  SetZ(theZ: Standard_Real): void;
  SetXYZ(theCoord: gp_XYZ): void;
  Coord_1(theIndex: Graphic3d_ZLayerId): Standard_Real;
  Coord_2(theXv: Standard_Real, theYv: Standard_Real, theZv: Standard_Real): void;
  X(): Standard_Real;
  Y(): Standard_Real;
  Z(): Standard_Real;
  XYZ(): gp_XYZ;
  IsEqual(theOther: gp_Vec, theLinearTolerance: Standard_Real, theAngularTolerance: Standard_Real): Standard_Boolean;
  IsNormal(theOther: gp_Vec, theAngularTolerance: Standard_Real): Standard_Boolean;
  IsOpposite(theOther: gp_Vec, theAngularTolerance: Standard_Real): Standard_Boolean;
  IsParallel(theOther: gp_Vec, theAngularTolerance: Standard_Real): Standard_Boolean;
  Angle(theOther: gp_Vec): Standard_Real;
  AngleWithRef(theOther: gp_Vec, theVRef: gp_Vec): Standard_Real;
  Magnitude(): Standard_Real;
  SquareMagnitude(): Standard_Real;
  Add(theOther: gp_Vec): void;
  Added(theOther: gp_Vec): gp_Vec;
  Subtract(theRight: gp_Vec): void;
  Subtracted(theRight: gp_Vec): gp_Vec;
  Multiply(theScalar: Standard_Real): void;
  Multiplied(theScalar: Standard_Real): gp_Vec;
  Divide(theScalar: Standard_Real): void;
  Divided(theScalar: Standard_Real): gp_Vec;
  Cross(theRight: gp_Vec): void;
  Crossed(theRight: gp_Vec): gp_Vec;
  CrossMagnitude(theRight: gp_Vec): Standard_Real;
  CrossSquareMagnitude(theRight: gp_Vec): Standard_Real;
  CrossCross(theV1: gp_Vec, theV2: gp_Vec): void;
  CrossCrossed(theV1: gp_Vec, theV2: gp_Vec): gp_Vec;
  Dot(theOther: gp_Vec): Standard_Real;
  DotCross(theV1: gp_Vec, theV2: gp_Vec): Standard_Real;
  Normalize(): void;
  Normalized(): gp_Vec;
  Reverse(): void;
  Reversed(): gp_Vec;
  SetLinearForm_1(theA1: Standard_Real, theV1: gp_Vec, theA2: Standard_Real, theV2: gp_Vec, theA3: Standard_Real, theV3: gp_Vec, theV4: gp_Vec): void;
  SetLinearForm_2(theA1: Standard_Real, theV1: gp_Vec, theA2: Standard_Real, theV2: gp_Vec, theA3: Standard_Real, theV3: gp_Vec): void;
  SetLinearForm_3(theA1: Standard_Real, theV1: gp_Vec, theA2: Standard_Real, theV2: gp_Vec, theV3: gp_Vec): void;
  SetLinearForm_4(theA1: Standard_Real, theV1: gp_Vec, theA2: Standard_Real, theV2: gp_Vec): void;
  SetLinearForm_5(theA1: Standard_Real, theV1: gp_Vec, theV2: gp_Vec): void;
  SetLinearForm_6(theV1: gp_Vec, theV2: gp_Vec): void;
  Mirror_1(theV: gp_Vec): void;
  Mirrored_1(theV: gp_Vec): gp_Vec;
  Mirror_2(theA1: gp_Ax1): void;
  Mirrored_2(theA1: gp_Ax1): gp_Vec;
  Mirror_3(theA2: gp_Ax2): void;
  Mirrored_3(theA2: gp_Ax2): gp_Vec;
  Rotate(theA1: gp_Ax1, theAng: Standard_Real): void;
  Rotated(theA1: gp_Ax1, theAng: Standard_Real): gp_Vec;
  Scale(theS: Standard_Real): void;
  Scaled(theS: Standard_Real): gp_Vec;
  Transform(theT: gp_Trsf): void;
  Transformed(theT: gp_Trsf): gp_Vec;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  delete(): void;
}

  export declare class gp_Vec_1 extends gp_Vec {
    constructor();
  }

  export declare class gp_Vec_2 extends gp_Vec {
    constructor(theV: gp_Dir);
  }

  export declare class gp_Vec_3 extends gp_Vec {
    constructor(theCoord: gp_XYZ);
  }

  export declare class gp_Vec_4 extends gp_Vec {
    constructor(theXv: Standard_Real, theYv: Standard_Real, theZv: Standard_Real);
  }

  export declare class gp_Vec_5 extends gp_Vec {
    constructor(theP1: gp_Pnt, theP2: gp_Pnt);
  }

export declare class gp_Trsf {
  SetMirror_1(theP: gp_Pnt): void;
  SetMirror_2(theA1: gp_Ax1): void;
  SetMirror_3(theA2: gp_Ax2): void;
  SetRotation_1(theA1: gp_Ax1, theAng: Standard_Real): void;
  SetRotation_2(theR: gp_Quaternion): void;
  SetRotationPart(theR: gp_Quaternion): void;
  SetScale(theP: gp_Pnt, theS: Standard_Real): void;
  SetDisplacement(theFromSystem1: gp_Ax3, theToSystem2: gp_Ax3): void;
  SetTransformation_1(theFromSystem1: gp_Ax3, theToSystem2: gp_Ax3): void;
  SetTransformation_2(theToSystem: gp_Ax3): void;
  SetTransformation_3(R: gp_Quaternion, theT: gp_Vec): void;
  SetTranslation_1(theV: gp_Vec): void;
  SetTranslation_2(theP1: gp_Pnt, theP2: gp_Pnt): void;
  SetTranslationPart(theV: gp_Vec): void;
  SetScaleFactor(theS: Standard_Real): void;
  SetForm(theP: gp_TrsfForm): void;
  SetValues(a11: Standard_Real, a12: Standard_Real, a13: Standard_Real, a14: Standard_Real, a21: Standard_Real, a22: Standard_Real, a23: Standard_Real, a24: Standard_Real, a31: Standard_Real, a32: Standard_Real, a33: Standard_Real, a34: Standard_Real): void;
  IsNegative(): Standard_Boolean;
  Form(): gp_TrsfForm;
  ScaleFactor(): Standard_Real;
  TranslationPart(): gp_XYZ;
  GetRotation_1(theAxis: gp_XYZ, theAngle: Standard_Real): Standard_Boolean;
  GetRotation_2(): gp_Quaternion;
  VectorialPart(): gp_Mat;
  HVectorialPart(): gp_Mat;
  Value(theRow: Graphic3d_ZLayerId, theCol: Graphic3d_ZLayerId): Standard_Real;
  Invert(): void;
  Inverted(): gp_Trsf;
  Multiplied(theT: gp_Trsf): gp_Trsf;
  Multiply(theT: gp_Trsf): void;
  PreMultiply(theT: gp_Trsf): void;
  Power(theN: Graphic3d_ZLayerId): void;
  Powered(theN: Graphic3d_ZLayerId): gp_Trsf;
  Transforms_1(theX: Standard_Real, theY: Standard_Real, theZ: Standard_Real): void;
  Transforms_2(theCoord: gp_XYZ): void;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  InitFromJson(theSStream: Standard_SStream, theStreamPos: Graphic3d_ZLayerId): Standard_Boolean;
  delete(): void;
}

  export declare class gp_Trsf_1 extends gp_Trsf {
    constructor();
  }

  export declare class gp_Trsf_2 extends gp_Trsf {
    constructor(theT: gp_Trsf2d);
  }

export declare class gp_Ax3 {
  XReverse(): void;
  YReverse(): void;
  ZReverse(): void;
  SetAxis(theA1: gp_Ax1): void;
  SetDirection(theV: gp_Dir): void;
  SetLocation(theP: gp_Pnt): void;
  SetXDirection(theVx: gp_Dir): void;
  SetYDirection(theVy: gp_Dir): void;
  Angle(theOther: gp_Ax3): Standard_Real;
  Axis(): gp_Ax1;
  Ax2(): gp_Ax2;
  Direction(): gp_Dir;
  Location(): gp_Pnt;
  XDirection(): gp_Dir;
  YDirection(): gp_Dir;
  Direct(): Standard_Boolean;
  IsCoplanar_1(theOther: gp_Ax3, theLinearTolerance: Standard_Real, theAngularTolerance: Standard_Real): Standard_Boolean;
  IsCoplanar_2(theA1: gp_Ax1, theLinearTolerance: Standard_Real, theAngularTolerance: Standard_Real): Standard_Boolean;
  Mirror_1(theP: gp_Pnt): void;
  Mirrored_1(theP: gp_Pnt): gp_Ax3;
  Mirror_2(theA1: gp_Ax1): void;
  Mirrored_2(theA1: gp_Ax1): gp_Ax3;
  Mirror_3(theA2: gp_Ax2): void;
  Mirrored_3(theA2: gp_Ax2): gp_Ax3;
  Rotate(theA1: gp_Ax1, theAng: Standard_Real): void;
  Rotated(theA1: gp_Ax1, theAng: Standard_Real): gp_Ax3;
  Scale(theP: gp_Pnt, theS: Standard_Real): void;
  Scaled(theP: gp_Pnt, theS: Standard_Real): gp_Ax3;
  Transform(theT: gp_Trsf): void;
  Transformed(theT: gp_Trsf): gp_Ax3;
  Translate_1(theV: gp_Vec): void;
  Translated_1(theV: gp_Vec): gp_Ax3;
  Translate_2(theP1: gp_Pnt, theP2: gp_Pnt): void;
  Translated_2(theP1: gp_Pnt, theP2: gp_Pnt): gp_Ax3;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  InitFromJson(theSStream: Standard_SStream, theStreamPos: Graphic3d_ZLayerId): Standard_Boolean;
  delete(): void;
}

  export declare class gp_Ax3_1 extends gp_Ax3 {
    constructor();
  }

  export declare class gp_Ax3_2 extends gp_Ax3 {
    constructor(theA: gp_Ax2);
  }

  export declare class gp_Ax3_3 extends gp_Ax3 {
    constructor(theP: gp_Pnt, theN: gp_Dir, theVx: gp_Dir);
  }

  export declare class gp_Ax3_4 extends gp_Ax3 {
    constructor(theP: gp_Pnt, theV: gp_Dir);
  }

export declare class gp_XYZ {
  SetCoord_1(theX: Standard_Real, theY: Standard_Real, theZ: Standard_Real): void;
  SetCoord_2(theIndex: Graphic3d_ZLayerId, theXi: Standard_Real): void;
  SetX(theX: Standard_Real): void;
  SetY(theY: Standard_Real): void;
  SetZ(theZ: Standard_Real): void;
  Coord_1(theIndex: Graphic3d_ZLayerId): Standard_Real;
  ChangeCoord(theIndex: Graphic3d_ZLayerId): Standard_Real;
  Coord_2(theX: Standard_Real, theY: Standard_Real, theZ: Standard_Real): void;
  GetData(): Standard_Real;
  ChangeData(): Standard_Real;
  X(): Standard_Real;
  Y(): Standard_Real;
  Z(): Standard_Real;
  Modulus(): Standard_Real;
  SquareModulus(): Standard_Real;
  IsEqual(theOther: gp_XYZ, theTolerance: Standard_Real): Standard_Boolean;
  Add(theOther: gp_XYZ): void;
  Added(theOther: gp_XYZ): gp_XYZ;
  Cross(theOther: gp_XYZ): void;
  Crossed(theOther: gp_XYZ): gp_XYZ;
  CrossMagnitude(theRight: gp_XYZ): Standard_Real;
  CrossSquareMagnitude(theRight: gp_XYZ): Standard_Real;
  CrossCross(theCoord1: gp_XYZ, theCoord2: gp_XYZ): void;
  CrossCrossed(theCoord1: gp_XYZ, theCoord2: gp_XYZ): gp_XYZ;
  Divide(theScalar: Standard_Real): void;
  Divided(theScalar: Standard_Real): gp_XYZ;
  Dot(theOther: gp_XYZ): Standard_Real;
  DotCross(theCoord1: gp_XYZ, theCoord2: gp_XYZ): Standard_Real;
  Multiply_1(theScalar: Standard_Real): void;
  Multiply_2(theOther: gp_XYZ): void;
  Multiply_3(theMatrix: gp_Mat): void;
  Multiplied_1(theScalar: Standard_Real): gp_XYZ;
  Multiplied_2(theOther: gp_XYZ): gp_XYZ;
  Multiplied_3(theMatrix: gp_Mat): gp_XYZ;
  Normalize(): void;
  Normalized(): gp_XYZ;
  Reverse(): void;
  Reversed(): gp_XYZ;
  Subtract(theOther: gp_XYZ): void;
  Subtracted(theOther: gp_XYZ): gp_XYZ;
  SetLinearForm_1(theA1: Standard_Real, theXYZ1: gp_XYZ, theA2: Standard_Real, theXYZ2: gp_XYZ, theA3: Standard_Real, theXYZ3: gp_XYZ, theXYZ4: gp_XYZ): void;
  SetLinearForm_2(theA1: Standard_Real, theXYZ1: gp_XYZ, theA2: Standard_Real, theXYZ2: gp_XYZ, theA3: Standard_Real, theXYZ3: gp_XYZ): void;
  SetLinearForm_3(theA1: Standard_Real, theXYZ1: gp_XYZ, theA2: Standard_Real, theXYZ2: gp_XYZ, theXYZ3: gp_XYZ): void;
  SetLinearForm_4(theA1: Standard_Real, theXYZ1: gp_XYZ, theA2: Standard_Real, theXYZ2: gp_XYZ): void;
  SetLinearForm_5(theA1: Standard_Real, theXYZ1: gp_XYZ, theXYZ2: gp_XYZ): void;
  SetLinearForm_6(theXYZ1: gp_XYZ, theXYZ2: gp_XYZ): void;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  InitFromJson(theSStream: Standard_SStream, theStreamPos: Graphic3d_ZLayerId): Standard_Boolean;
  delete(): void;
}

  export declare class gp_XYZ_1 extends gp_XYZ {
    constructor();
  }

  export declare class gp_XYZ_2 extends gp_XYZ {
    constructor(theX: Standard_Real, theY: Standard_Real, theZ: Standard_Real);
  }

export declare class gp_Dir2d {
  SetCoord_1(theIndex: Graphic3d_ZLayerId, theXi: Standard_Real): void;
  SetCoord_2(theXv: Standard_Real, theYv: Standard_Real): void;
  SetX(theX: Standard_Real): void;
  SetY(theY: Standard_Real): void;
  SetXY(theCoord: gp_XY): void;
  Coord_1(theIndex: Graphic3d_ZLayerId): Standard_Real;
  Coord_2(theXv: Standard_Real, theYv: Standard_Real): void;
  X(): Standard_Real;
  Y(): Standard_Real;
  XY(): gp_XY;
  IsEqual(theOther: gp_Dir2d, theAngularTolerance: Standard_Real): Standard_Boolean;
  IsNormal(theOther: gp_Dir2d, theAngularTolerance: Standard_Real): Standard_Boolean;
  IsOpposite(theOther: gp_Dir2d, theAngularTolerance: Standard_Real): Standard_Boolean;
  IsParallel(theOther: gp_Dir2d, theAngularTolerance: Standard_Real): Standard_Boolean;
  Angle(theOther: gp_Dir2d): Standard_Real;
  Crossed(theRight: gp_Dir2d): Standard_Real;
  Dot(theOther: gp_Dir2d): Standard_Real;
  Reverse(): void;
  Reversed(): gp_Dir2d;
  Mirror_1(theV: gp_Dir2d): void;
  Mirrored_1(theV: gp_Dir2d): gp_Dir2d;
  Mirror_2(theA: gp_Ax2d): void;
  Mirrored_2(theA: gp_Ax2d): gp_Dir2d;
  Rotate(Ang: Standard_Real): void;
  Rotated(theAng: Standard_Real): gp_Dir2d;
  Transform(theT: gp_Trsf2d): void;
  Transformed(theT: gp_Trsf2d): gp_Dir2d;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  delete(): void;
}

  export declare class gp_Dir2d_1 extends gp_Dir2d {
    constructor();
  }

  export declare class gp_Dir2d_2 extends gp_Dir2d {
    constructor(theV: gp_Vec2d);
  }

  export declare class gp_Dir2d_3 extends gp_Dir2d {
    constructor(theCoord: gp_XY);
  }

  export declare class gp_Dir2d_4 extends gp_Dir2d {
    constructor(theXv: Standard_Real, theYv: Standard_Real);
  }

export declare class gp_Circ {
  SetAxis(theA1: gp_Ax1): void;
  SetLocation(theP: gp_Pnt): void;
  SetPosition(theA2: gp_Ax2): void;
  SetRadius(theRadius: Standard_Real): void;
  Area(): Standard_Real;
  Axis(): gp_Ax1;
  Length(): Standard_Real;
  Location(): gp_Pnt;
  Position(): gp_Ax2;
  Radius(): Standard_Real;
  XAxis(): gp_Ax1;
  YAxis(): gp_Ax1;
  Distance(theP: gp_Pnt): Standard_Real;
  SquareDistance(theP: gp_Pnt): Standard_Real;
  Contains(theP: gp_Pnt, theLinearTolerance: Standard_Real): Standard_Boolean;
  Mirror_1(theP: gp_Pnt): void;
  Mirrored_1(theP: gp_Pnt): gp_Circ;
  Mirror_2(theA1: gp_Ax1): void;
  Mirrored_2(theA1: gp_Ax1): gp_Circ;
  Mirror_3(theA2: gp_Ax2): void;
  Mirrored_3(theA2: gp_Ax2): gp_Circ;
  Rotate(theA1: gp_Ax1, theAng: Standard_Real): void;
  Rotated(theA1: gp_Ax1, theAng: Standard_Real): gp_Circ;
  Scale(theP: gp_Pnt, theS: Standard_Real): void;
  Scaled(theP: gp_Pnt, theS: Standard_Real): gp_Circ;
  Transform(theT: gp_Trsf): void;
  Transformed(theT: gp_Trsf): gp_Circ;
  Translate_1(theV: gp_Vec): void;
  Translated_1(theV: gp_Vec): gp_Circ;
  Translate_2(theP1: gp_Pnt, theP2: gp_Pnt): void;
  Translated_2(theP1: gp_Pnt, theP2: gp_Pnt): gp_Circ;
  delete(): void;
}

  export declare class gp_Circ_1 extends gp_Circ {
    constructor();
  }

  export declare class gp_Circ_2 extends gp_Circ {
    constructor(theA2: gp_Ax2, theRadius: Standard_Real);
  }

export declare class gp {
  constructor();
  static Resolution(): Standard_Real;
  static Origin(): gp_Pnt;
  static DX(): gp_Dir;
  static DY(): gp_Dir;
  static DZ(): gp_Dir;
  static OX(): gp_Ax1;
  static OY(): gp_Ax1;
  static OZ(): gp_Ax1;
  static XOY(): gp_Ax2;
  static ZOX(): gp_Ax2;
  static YOZ(): gp_Ax2;
  static Origin2d(): gp_Pnt2d;
  static DX2d(): gp_Dir2d;
  static DY2d(): gp_Dir2d;
  static OX2d(): gp_Ax2d;
  static OY2d(): gp_Ax2d;
  delete(): void;
}

export declare class gp_Pnt2d {
  SetCoord_1(theIndex: Graphic3d_ZLayerId, theXi: Standard_Real): void;
  SetCoord_2(theXp: Standard_Real, theYp: Standard_Real): void;
  SetX(theX: Standard_Real): void;
  SetY(theY: Standard_Real): void;
  SetXY(theCoord: gp_XY): void;
  Coord_1(theIndex: Graphic3d_ZLayerId): Standard_Real;
  Coord_2(theXp: Standard_Real, theYp: Standard_Real): void;
  X(): Standard_Real;
  Y(): Standard_Real;
  XY(): gp_XY;
  Coord_3(): gp_XY;
  ChangeCoord(): gp_XY;
  IsEqual(theOther: gp_Pnt2d, theLinearTolerance: Standard_Real): Standard_Boolean;
  Distance(theOther: gp_Pnt2d): Standard_Real;
  SquareDistance(theOther: gp_Pnt2d): Standard_Real;
  Mirror_1(theP: gp_Pnt2d): void;
  Mirrored_1(theP: gp_Pnt2d): gp_Pnt2d;
  Mirror_2(theA: gp_Ax2d): void;
  Mirrored_2(theA: gp_Ax2d): gp_Pnt2d;
  Rotate(theP: gp_Pnt2d, theAng: Standard_Real): void;
  Rotated(theP: gp_Pnt2d, theAng: Standard_Real): gp_Pnt2d;
  Scale(theP: gp_Pnt2d, theS: Standard_Real): void;
  Scaled(theP: gp_Pnt2d, theS: Standard_Real): gp_Pnt2d;
  Transform(theT: gp_Trsf2d): void;
  Transformed(theT: gp_Trsf2d): gp_Pnt2d;
  Translate_1(theV: gp_Vec2d): void;
  Translated_1(theV: gp_Vec2d): gp_Pnt2d;
  Translate_2(theP1: gp_Pnt2d, theP2: gp_Pnt2d): void;
  Translated_2(theP1: gp_Pnt2d, theP2: gp_Pnt2d): gp_Pnt2d;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  delete(): void;
}

  export declare class gp_Pnt2d_1 extends gp_Pnt2d {
    constructor();
  }

  export declare class gp_Pnt2d_2 extends gp_Pnt2d {
    constructor(theCoord: gp_XY);
  }

  export declare class gp_Pnt2d_3 extends gp_Pnt2d {
    constructor(theXp: Standard_Real, theYp: Standard_Real);
  }

export declare class gp_Ax2d {
  SetLocation(theP: gp_Pnt2d): void;
  SetDirection(theV: gp_Dir2d): void;
  Location(): gp_Pnt2d;
  Direction(): gp_Dir2d;
  IsCoaxial(Other: gp_Ax2d, AngularTolerance: Standard_Real, LinearTolerance: Standard_Real): Standard_Boolean;
  IsNormal(theOther: gp_Ax2d, theAngularTolerance: Standard_Real): Standard_Boolean;
  IsOpposite(theOther: gp_Ax2d, theAngularTolerance: Standard_Real): Standard_Boolean;
  IsParallel(theOther: gp_Ax2d, theAngularTolerance: Standard_Real): Standard_Boolean;
  Angle(theOther: gp_Ax2d): Standard_Real;
  Reverse(): void;
  Reversed(): gp_Ax2d;
  Mirror_1(P: gp_Pnt2d): void;
  Mirrored_1(P: gp_Pnt2d): gp_Ax2d;
  Mirror_2(A: gp_Ax2d): void;
  Mirrored_2(A: gp_Ax2d): gp_Ax2d;
  Rotate(theP: gp_Pnt2d, theAng: Standard_Real): void;
  Rotated(theP: gp_Pnt2d, theAng: Standard_Real): gp_Ax2d;
  Scale(P: gp_Pnt2d, S: Standard_Real): void;
  Scaled(theP: gp_Pnt2d, theS: Standard_Real): gp_Ax2d;
  Transform(theT: gp_Trsf2d): void;
  Transformed(theT: gp_Trsf2d): gp_Ax2d;
  Translate_1(theV: gp_Vec2d): void;
  Translated_1(theV: gp_Vec2d): gp_Ax2d;
  Translate_2(theP1: gp_Pnt2d, theP2: gp_Pnt2d): void;
  Translated_2(theP1: gp_Pnt2d, theP2: gp_Pnt2d): gp_Ax2d;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  delete(): void;
}

  export declare class gp_Ax2d_1 extends gp_Ax2d {
    constructor();
  }

  export declare class gp_Ax2d_2 extends gp_Ax2d {
    constructor(theP: gp_Pnt2d, theV: gp_Dir2d);
  }

export declare class gp_Lin2d {
  Reverse(): void;
  Reversed(): gp_Lin2d;
  SetDirection(theV: gp_Dir2d): void;
  SetLocation(theP: gp_Pnt2d): void;
  SetPosition(theA: gp_Ax2d): void;
  Coefficients(theA: Standard_Real, theB: Standard_Real, theC: Standard_Real): void;
  Direction(): gp_Dir2d;
  Location(): gp_Pnt2d;
  Position(): gp_Ax2d;
  Angle(theOther: gp_Lin2d): Standard_Real;
  Contains(theP: gp_Pnt2d, theLinearTolerance: Standard_Real): Standard_Boolean;
  Distance_1(theP: gp_Pnt2d): Standard_Real;
  Distance_2(theOther: gp_Lin2d): Standard_Real;
  SquareDistance_1(theP: gp_Pnt2d): Standard_Real;
  SquareDistance_2(theOther: gp_Lin2d): Standard_Real;
  Normal(theP: gp_Pnt2d): gp_Lin2d;
  Mirror_1(theP: gp_Pnt2d): void;
  Mirrored_1(theP: gp_Pnt2d): gp_Lin2d;
  Mirror_2(theA: gp_Ax2d): void;
  Mirrored_2(theA: gp_Ax2d): gp_Lin2d;
  Rotate(theP: gp_Pnt2d, theAng: Standard_Real): void;
  Rotated(theP: gp_Pnt2d, theAng: Standard_Real): gp_Lin2d;
  Scale(theP: gp_Pnt2d, theS: Standard_Real): void;
  Scaled(theP: gp_Pnt2d, theS: Standard_Real): gp_Lin2d;
  Transform(theT: gp_Trsf2d): void;
  Transformed(theT: gp_Trsf2d): gp_Lin2d;
  Translate_1(theV: gp_Vec2d): void;
  Translated_1(theV: gp_Vec2d): gp_Lin2d;
  Translate_2(theP1: gp_Pnt2d, theP2: gp_Pnt2d): void;
  Translated_2(theP1: gp_Pnt2d, theP2: gp_Pnt2d): gp_Lin2d;
  delete(): void;
}

  export declare class gp_Lin2d_1 extends gp_Lin2d {
    constructor();
  }

  export declare class gp_Lin2d_2 extends gp_Lin2d {
    constructor(theA: gp_Ax2d);
  }

  export declare class gp_Lin2d_3 extends gp_Lin2d {
    constructor(theP: gp_Pnt2d, theV: gp_Dir2d);
  }

  export declare class gp_Lin2d_4 extends gp_Lin2d {
    constructor(theA: Standard_Real, theB: Standard_Real, theC: Standard_Real);
  }

export declare class gp_Elips2d {
  SetLocation(theP: gp_Pnt2d): void;
  SetMajorRadius(theMajorRadius: Standard_Real): void;
  SetMinorRadius(theMinorRadius: Standard_Real): void;
  SetAxis(theA: gp_Ax22d): void;
  SetXAxis(theA: gp_Ax2d): void;
  SetYAxis(theA: gp_Ax2d): void;
  Area(): Standard_Real;
  Coefficients(theA: Standard_Real, theB: Standard_Real, theC: Standard_Real, theD: Standard_Real, theE: Standard_Real, theF: Standard_Real): void;
  Directrix1(): gp_Ax2d;
  Directrix2(): gp_Ax2d;
  Eccentricity(): Standard_Real;
  Focal(): Standard_Real;
  Focus1(): gp_Pnt2d;
  Focus2(): gp_Pnt2d;
  Location(): gp_Pnt2d;
  MajorRadius(): Standard_Real;
  MinorRadius(): Standard_Real;
  Parameter(): Standard_Real;
  Axis(): gp_Ax22d;
  XAxis(): gp_Ax2d;
  YAxis(): gp_Ax2d;
  Reverse(): void;
  Reversed(): gp_Elips2d;
  IsDirect(): Standard_Boolean;
  Mirror_1(theP: gp_Pnt2d): void;
  Mirrored_1(theP: gp_Pnt2d): gp_Elips2d;
  Mirror_2(theA: gp_Ax2d): void;
  Mirrored_2(theA: gp_Ax2d): gp_Elips2d;
  Rotate(theP: gp_Pnt2d, theAng: Standard_Real): void;
  Rotated(theP: gp_Pnt2d, theAng: Standard_Real): gp_Elips2d;
  Scale(theP: gp_Pnt2d, theS: Standard_Real): void;
  Scaled(theP: gp_Pnt2d, theS: Standard_Real): gp_Elips2d;
  Transform(theT: gp_Trsf2d): void;
  Transformed(theT: gp_Trsf2d): gp_Elips2d;
  Translate_1(theV: gp_Vec2d): void;
  Translated_1(theV: gp_Vec2d): gp_Elips2d;
  Translate_2(theP1: gp_Pnt2d, theP2: gp_Pnt2d): void;
  Translated_2(theP1: gp_Pnt2d, theP2: gp_Pnt2d): gp_Elips2d;
  delete(): void;
}

  export declare class gp_Elips2d_1 extends gp_Elips2d {
    constructor();
  }

  export declare class gp_Elips2d_2 extends gp_Elips2d {
    constructor(theMajorAxis: gp_Ax2d, theMajorRadius: Standard_Real, theMinorRadius: Standard_Real, theIsSense: Standard_Boolean);
  }

  export declare class gp_Elips2d_3 extends gp_Elips2d {
    constructor(theA: gp_Ax22d, theMajorRadius: Standard_Real, theMinorRadius: Standard_Real);
  }

export declare class BRepMesh_IncrementalMesh extends BRepMesh_DiscretRoot {
  Perform_1(theRange: Message_ProgressRange): void;
  Perform_2(theContext: any, theRange: Message_ProgressRange): void;
  Parameters(): IMeshTools_Parameters;
  ChangeParameters(): IMeshTools_Parameters;
  IsModified(): Standard_Boolean;
  GetStatusFlags(): Graphic3d_ZLayerId;
  static Discret(theShape: TopoDS_Shape, theLinDeflection: Standard_Real, theAngDeflection: Standard_Real, theAlgo: BRepMesh_DiscretRoot): Graphic3d_ZLayerId;
  static IsParallelDefault(): Standard_Boolean;
  static SetParallelDefault(isInParallel: Standard_Boolean): void;
  static get_type_name(): Standard_Character;
  static get_type_descriptor(): Handle_Standard_Type;
  DynamicType(): Handle_Standard_Type;
  delete(): void;
}

  export declare class BRepMesh_IncrementalMesh_1 extends BRepMesh_IncrementalMesh {
    constructor();
  }

  export declare class BRepMesh_IncrementalMesh_2 extends BRepMesh_IncrementalMesh {
    constructor(theShape: TopoDS_Shape, theLinDeflection: Standard_Real, isRelative: Standard_Boolean, theAngDeflection: Standard_Real, isInParallel: Standard_Boolean);
  }

  export declare class BRepMesh_IncrementalMesh_3 extends BRepMesh_IncrementalMesh {
    constructor(theShape: TopoDS_Shape, theParameters: IMeshTools_Parameters, theRange: Message_ProgressRange);
  }

export declare class TopoDS_Builder {
  constructor();
  MakeWire(W: TopoDS_Wire): void;
  MakeShell(S: TopoDS_Shell): void;
  MakeSolid(S: TopoDS_Solid): void;
  MakeCompSolid(C: TopoDS_CompSolid): void;
  MakeCompound(C: TopoDS_Compound): void;
  Add(S: TopoDS_Shape, C: TopoDS_Shape): void;
  Remove(S: TopoDS_Shape, C: TopoDS_Shape): void;
  delete(): void;
}

export declare class TopoDS_Iterator {
  Initialize(S: TopoDS_Shape, cumOri: Standard_Boolean, cumLoc: Standard_Boolean): void;
  More(): Standard_Boolean;
  Next(): void;
  Value(): TopoDS_Shape;
  delete(): void;
}

  export declare class TopoDS_Iterator_1 extends TopoDS_Iterator {
    constructor();
  }

  export declare class TopoDS_Iterator_2 extends TopoDS_Iterator {
    constructor(S: TopoDS_Shape, cumOri: Standard_Boolean, cumLoc: Standard_Boolean);
  }

export declare class TopoDS_Vertex extends TopoDS_Shape {
  constructor()
  delete(): void;
}

export declare class TopoDS {
  constructor();
  static Vertex_1(S: TopoDS_Shape): TopoDS_Vertex;
  static Vertex_2(a0: TopoDS_Shape): TopoDS_Vertex;
  static Edge_1(S: TopoDS_Shape): TopoDS_Edge;
  static Edge_2(a0: TopoDS_Shape): TopoDS_Edge;
  static Wire_1(S: TopoDS_Shape): TopoDS_Wire;
  static Wire_2(a0: TopoDS_Shape): TopoDS_Wire;
  static Face_1(S: TopoDS_Shape): TopoDS_Face;
  static Face_2(a0: TopoDS_Shape): TopoDS_Face;
  static Shell_1(S: TopoDS_Shape): TopoDS_Shell;
  static Shell_2(a0: TopoDS_Shape): TopoDS_Shell;
  static Solid_1(S: TopoDS_Shape): TopoDS_Solid;
  static Solid_2(a0: TopoDS_Shape): TopoDS_Solid;
  static CompSolid_1(S: TopoDS_Shape): TopoDS_CompSolid;
  static CompSolid_2(a0: TopoDS_Shape): TopoDS_CompSolid;
  static Compound_1(S: TopoDS_Shape): TopoDS_Compound;
  static Compound_2(a0: TopoDS_Shape): TopoDS_Compound;
  delete(): void;
}

export declare class TopoDS_Face extends TopoDS_Shape {
  constructor()
  delete(): void;
}

export declare class TopoDS_Solid extends TopoDS_Shape {
  constructor()
  delete(): void;
}

export declare class TopoDS_Compound extends TopoDS_Shape {
  constructor()
  delete(): void;
}

export declare class TopoDS_Edge extends TopoDS_Shape {
  constructor()
  delete(): void;
}

export declare class TopoDS_Shell extends TopoDS_Shape {
  constructor()
  delete(): void;
}

export declare class TopoDS_Shape {
  constructor()
  IsNull(): Standard_Boolean;
  Nullify(): void;
  Location_1(): TopLoc_Location;
  Location_2(theLoc: TopLoc_Location, theRaiseExc: Standard_Boolean): void;
  Located(theLoc: TopLoc_Location, theRaiseExc: Standard_Boolean): TopoDS_Shape;
  Orientation_1(): TopAbs_Orientation;
  Orientation_2(theOrient: TopAbs_Orientation): void;
  Oriented(theOrient: TopAbs_Orientation): TopoDS_Shape;
  TShape_1(): Handle_TopoDS_TShape;
  ShapeType(): TopAbs_ShapeEnum;
  Free_1(): Standard_Boolean;
  Free_2(theIsFree: Standard_Boolean): void;
  Locked_1(): Standard_Boolean;
  Locked_2(theIsLocked: Standard_Boolean): void;
  Modified_1(): Standard_Boolean;
  Modified_2(theIsModified: Standard_Boolean): void;
  Checked_1(): Standard_Boolean;
  Checked_2(theIsChecked: Standard_Boolean): void;
  Orientable_1(): Standard_Boolean;
  Orientable_2(theIsOrientable: Standard_Boolean): void;
  Closed_1(): Standard_Boolean;
  Closed_2(theIsClosed: Standard_Boolean): void;
  Infinite_1(): Standard_Boolean;
  Infinite_2(theIsInfinite: Standard_Boolean): void;
  Convex_1(): Standard_Boolean;
  Convex_2(theIsConvex: Standard_Boolean): void;
  Move(thePosition: TopLoc_Location, theRaiseExc: Standard_Boolean): void;
  Moved(thePosition: TopLoc_Location, theRaiseExc: Standard_Boolean): TopoDS_Shape;
  Reverse(): void;
  Reversed(): TopoDS_Shape;
  Complement(): void;
  Complemented(): TopoDS_Shape;
  Compose(theOrient: TopAbs_Orientation): void;
  Composed(theOrient: TopAbs_Orientation): TopoDS_Shape;
  NbChildren(): Graphic3d_ZLayerId;
  IsPartner(theOther: TopoDS_Shape): Standard_Boolean;
  IsSame(theOther: TopoDS_Shape): Standard_Boolean;
  IsEqual(theOther: TopoDS_Shape): Standard_Boolean;
  IsNotEqual(theOther: TopoDS_Shape): Standard_Boolean;
  HashCode(theUpperBound: Graphic3d_ZLayerId): Graphic3d_ZLayerId;
  EmptyCopy(): void;
  EmptyCopied(): TopoDS_Shape;
  TShape_2(theTShape: Handle_TopoDS_TShape): void;
  DumpJson(theOStream: Standard_OStream, theDepth: Graphic3d_ZLayerId): void;
  delete(): void;
}

export declare class TopoDS_Wire extends TopoDS_Shape {
  constructor()
  delete(): void;
}

export declare class BRep_Builder extends TopoDS_Builder {
  constructor();
  MakeFace_1(F: TopoDS_Face): void;
  MakeFace_2(F: TopoDS_Face, S: Handle_Geom_Surface, Tol: Standard_Real): void;
  MakeFace_3(F: TopoDS_Face, S: Handle_Geom_Surface, L: TopLoc_Location, Tol: Standard_Real): void;
  MakeFace_4(theFace: TopoDS_Face, theTriangulation: Handle_Poly_Triangulation): void;
  MakeFace_5(theFace: TopoDS_Face, theTriangulations: Poly_ListOfTriangulation, theActiveTriangulation: Handle_Poly_Triangulation): void;
  UpdateFace_1(F: TopoDS_Face, S: Handle_Geom_Surface, L: TopLoc_Location, Tol: Standard_Real): void;
  UpdateFace_2(theFace: TopoDS_Face, theTriangulation: Handle_Poly_Triangulation, theToReset: Standard_Boolean): void;
  UpdateFace_3(F: TopoDS_Face, Tol: Standard_Real): void;
  NaturalRestriction(F: TopoDS_Face, N: Standard_Boolean): void;
  MakeEdge_1(E: TopoDS_Edge): void;
  MakeEdge_2(E: TopoDS_Edge, C: Handle_Geom_Curve, Tol: Standard_Real): void;
  MakeEdge_3(E: TopoDS_Edge, C: Handle_Geom_Curve, L: TopLoc_Location, Tol: Standard_Real): void;
  MakeEdge_4(E: TopoDS_Edge, P: Handle_Poly_Polygon3D): void;
  MakeEdge_5(E: TopoDS_Edge, N: Handle_Poly_PolygonOnTriangulation, T: Handle_Poly_Triangulation): void;
  MakeEdge_6(E: TopoDS_Edge, N: Handle_Poly_PolygonOnTriangulation, T: Handle_Poly_Triangulation, L: TopLoc_Location): void;
  UpdateEdge_1(E: TopoDS_Edge, C: Handle_Geom_Curve, Tol: Standard_Real): void;
  UpdateEdge_2(E: TopoDS_Edge, C: Handle_Geom_Curve, L: TopLoc_Location, Tol: Standard_Real): void;
  UpdateEdge_3(E: TopoDS_Edge, C: Handle_Geom2d_Curve, F: TopoDS_Face, Tol: Standard_Real): void;
  UpdateEdge_4(E: TopoDS_Edge, C1: Handle_Geom2d_Curve, C2: Handle_Geom2d_Curve, F: TopoDS_Face, Tol: Standard_Real): void;
  UpdateEdge_5(E: TopoDS_Edge, C: Handle_Geom2d_Curve, S: Handle_Geom_Surface, L: TopLoc_Location, Tol: Standard_Real): void;
  UpdateEdge_6(E: TopoDS_Edge, C: Handle_Geom2d_Curve, S: Handle_Geom_Surface, L: TopLoc_Location, Tol: Standard_Real, Pf: gp_Pnt2d, Pl: gp_Pnt2d): void;
  UpdateEdge_7(E: TopoDS_Edge, C1: Handle_Geom2d_Curve, C2: Handle_Geom2d_Curve, S: Handle_Geom_Surface, L: TopLoc_Location, Tol: Standard_Real): void;
  UpdateEdge_8(E: TopoDS_Edge, C1: Handle_Geom2d_Curve, C2: Handle_Geom2d_Curve, S: Handle_Geom_Surface, L: TopLoc_Location, Tol: Standard_Real, Pf: gp_Pnt2d, Pl: gp_Pnt2d): void;
  UpdateEdge_9(E: TopoDS_Edge, P: Handle_Poly_Polygon3D): void;
  UpdateEdge_10(E: TopoDS_Edge, P: Handle_Poly_Polygon3D, L: TopLoc_Location): void;
  UpdateEdge_11(E: TopoDS_Edge, N: Handle_Poly_PolygonOnTriangulation, T: Handle_Poly_Triangulation): void;
  UpdateEdge_12(E: TopoDS_Edge, N: Handle_Poly_PolygonOnTriangulation, T: Handle_Poly_Triangulation, L: TopLoc_Location): void;
  UpdateEdge_13(E: TopoDS_Edge, N1: Handle_Poly_PolygonOnTriangulation, N2: Handle_Poly_PolygonOnTriangulation, T: Handle_Poly_Triangulation): void;
  UpdateEdge_14(E: TopoDS_Edge, N1: Handle_Poly_PolygonOnTriangulation, N2: Handle_Poly_PolygonOnTriangulation, T: Handle_Poly_Triangulation, L: TopLoc_Location): void;
  UpdateEdge_15(E: TopoDS_Edge, P: Handle_Poly_Polygon2D, S: TopoDS_Face): void;
  UpdateEdge_16(E: TopoDS_Edge, P: Handle_Poly_Polygon2D, S: Handle_Geom_Surface, T: TopLoc_Location): void;
  UpdateEdge_17(E: TopoDS_Edge, P1: Handle_Poly_Polygon2D, P2: Handle_Poly_Polygon2D, S: TopoDS_Face): void;
  UpdateEdge_18(E: TopoDS_Edge, P1: Handle_Poly_Polygon2D, P2: Handle_Poly_Polygon2D, S: Handle_Geom_Surface, L: TopLoc_Location): void;
  UpdateEdge_19(E: TopoDS_Edge, Tol: Standard_Real): void;
  Continuity_1(E: TopoDS_Edge, F1: TopoDS_Face, F2: TopoDS_Face, C: GeomAbs_Shape): void;
  Continuity_2(E: TopoDS_Edge, S1: Handle_Geom_Surface, S2: Handle_Geom_Surface, L1: TopLoc_Location, L2: TopLoc_Location, C: GeomAbs_Shape): void;
  SameParameter(E: TopoDS_Edge, S: Standard_Boolean): void;
  SameRange(E: TopoDS_Edge, S: Standard_Boolean): void;
  Degenerated(E: TopoDS_Edge, D: Standard_Boolean): void;
  Range_1(E: TopoDS_Edge, First: Standard_Real, Last: Standard_Real, Only3d: Standard_Boolean): void;
  Range_2(E: TopoDS_Edge, S: Handle_Geom_Surface, L: TopLoc_Location, First: Standard_Real, Last: Standard_Real): void;
  Range_3(E: TopoDS_Edge, F: TopoDS_Face, First: Standard_Real, Last: Standard_Real): void;
  Transfert_1(Ein: TopoDS_Edge, Eout: TopoDS_Edge): void;
  MakeVertex_1(V: TopoDS_Vertex): void;
  MakeVertex_2(V: TopoDS_Vertex, P: gp_Pnt, Tol: Standard_Real): void;
  UpdateVertex_1(V: TopoDS_Vertex, P: gp_Pnt, Tol: Standard_Real): void;
  UpdateVertex_2(V: TopoDS_Vertex, P: Standard_Real, E: TopoDS_Edge, Tol: Standard_Real): void;
  UpdateVertex_3(V: TopoDS_Vertex, P: Standard_Real, E: TopoDS_Edge, F: TopoDS_Face, Tol: Standard_Real): void;
  UpdateVertex_4(V: TopoDS_Vertex, P: Standard_Real, E: TopoDS_Edge, S: Handle_Geom_Surface, L: TopLoc_Location, Tol: Standard_Real): void;
  UpdateVertex_5(Ve: TopoDS_Vertex, U: Standard_Real, V: Standard_Real, F: TopoDS_Face, Tol: Standard_Real): void;
  UpdateVertex_6(V: TopoDS_Vertex, Tol: Standard_Real): void;
  Transfert_2(Ein: TopoDS_Edge, Eout: TopoDS_Edge, Vin: TopoDS_Vertex, Vout: TopoDS_Vertex): void;
  delete(): void;
}

export declare class BRep_Tool {
  constructor();
  static IsClosed_1(S: TopoDS_Shape): Standard_Boolean;
  static Surface_1(F: TopoDS_Face, L: TopLoc_Location): Handle_Geom_Surface;
  static Surface_2(F: TopoDS_Face): Handle_Geom_Surface;
  static Triangulation(theFace: TopoDS_Face, theLocation: TopLoc_Location, theMeshPurpose: Poly_MeshPurpose): Handle_Poly_Triangulation;
  static Triangulations(theFace: TopoDS_Face, theLocation: TopLoc_Location): Poly_ListOfTriangulation;
  static Tolerance_1(F: TopoDS_Face): Standard_Real;
  static NaturalRestriction(F: TopoDS_Face): Standard_Boolean;
  static IsGeometric_1(F: TopoDS_Face): Standard_Boolean;
  static IsGeometric_2(E: TopoDS_Edge): Standard_Boolean;
  static Curve_1(E: TopoDS_Edge, L: TopLoc_Location, First: Standard_Real, Last: Standard_Real): Handle_Geom_Curve;
  static Curve_2(E: TopoDS_Edge, First: Standard_Real, Last: Standard_Real): Handle_Geom_Curve;
  static Polygon3D(E: TopoDS_Edge, L: TopLoc_Location): Handle_Poly_Polygon3D;
  static CurveOnSurface_1(E: TopoDS_Edge, F: TopoDS_Face, First: Standard_Real, Last: Standard_Real, theIsStored: Standard_Boolean): Handle_Geom2d_Curve;
  static CurveOnSurface_2(E: TopoDS_Edge, S: Handle_Geom_Surface, L: TopLoc_Location, First: Standard_Real, Last: Standard_Real, theIsStored: Standard_Boolean): Handle_Geom2d_Curve;
  static CurveOnPlane(E: TopoDS_Edge, S: Handle_Geom_Surface, L: TopLoc_Location, First: Standard_Real, Last: Standard_Real): Handle_Geom2d_Curve;
  static CurveOnSurface_3(E: TopoDS_Edge, C: Handle_Geom2d_Curve, S: Handle_Geom_Surface, L: TopLoc_Location, First: Standard_Real, Last: Standard_Real): void;
  static CurveOnSurface_4(E: TopoDS_Edge, C: Handle_Geom2d_Curve, S: Handle_Geom_Surface, L: TopLoc_Location, First: Standard_Real, Last: Standard_Real, Index: Graphic3d_ZLayerId): void;
  static PolygonOnSurface_1(E: TopoDS_Edge, F: TopoDS_Face): Handle_Poly_Polygon2D;
  static PolygonOnSurface_2(E: TopoDS_Edge, S: Handle_Geom_Surface, L: TopLoc_Location): Handle_Poly_Polygon2D;
  static PolygonOnSurface_3(E: TopoDS_Edge, C: Handle_Poly_Polygon2D, S: Handle_Geom_Surface, L: TopLoc_Location): void;
  static PolygonOnSurface_4(E: TopoDS_Edge, C: Handle_Poly_Polygon2D, S: Handle_Geom_Surface, L: TopLoc_Location, Index: Graphic3d_ZLayerId): void;
  static PolygonOnTriangulation_1(E: TopoDS_Edge, T: Handle_Poly_Triangulation, L: TopLoc_Location): Handle_Poly_PolygonOnTriangulation;
  static PolygonOnTriangulation_2(E: TopoDS_Edge, P: Handle_Poly_PolygonOnTriangulation, T: Handle_Poly_Triangulation, L: TopLoc_Location): void;
  static PolygonOnTriangulation_3(E: TopoDS_Edge, P: Handle_Poly_PolygonOnTriangulation, T: Handle_Poly_Triangulation, L: TopLoc_Location, Index: Graphic3d_ZLayerId): void;
  static IsClosed_2(E: TopoDS_Edge, F: TopoDS_Face): Standard_Boolean;
  static IsClosed_3(E: TopoDS_Edge, S: Handle_Geom_Surface, L: TopLoc_Location): Standard_Boolean;
  static IsClosed_4(E: TopoDS_Edge, T: Handle_Poly_Triangulation, L: TopLoc_Location): Standard_Boolean;
  static Tolerance_2(E: TopoDS_Edge): Standard_Real;
  static SameParameter(E: TopoDS_Edge): Standard_Boolean;
  static SameRange(E: TopoDS_Edge): Standard_Boolean;
  static Degenerated(E: TopoDS_Edge): Standard_Boolean;
  static Range_1(E: TopoDS_Edge, First: Standard_Real, Last: Standard_Real): void;
  static Range_2(E: TopoDS_Edge, S: Handle_Geom_Surface, L: TopLoc_Location, First: Standard_Real, Last: Standard_Real): void;
  static Range_3(E: TopoDS_Edge, F: TopoDS_Face, First: Standard_Real, Last: Standard_Real): void;
  static UVPoints_1(E: TopoDS_Edge, S: Handle_Geom_Surface, L: TopLoc_Location, PFirst: gp_Pnt2d, PLast: gp_Pnt2d): void;
  static UVPoints_2(E: TopoDS_Edge, F: TopoDS_Face, PFirst: gp_Pnt2d, PLast: gp_Pnt2d): void;
  static SetUVPoints_1(E: TopoDS_Edge, S: Handle_Geom_Surface, L: TopLoc_Location, PFirst: gp_Pnt2d, PLast: gp_Pnt2d): void;
  static SetUVPoints_2(E: TopoDS_Edge, F: TopoDS_Face, PFirst: gp_Pnt2d, PLast: gp_Pnt2d): void;
  static HasContinuity_1(E: TopoDS_Edge, F1: TopoDS_Face, F2: TopoDS_Face): Standard_Boolean;
  static Continuity_1(E: TopoDS_Edge, F1: TopoDS_Face, F2: TopoDS_Face): GeomAbs_Shape;
  static HasContinuity_2(E: TopoDS_Edge, S1: Handle_Geom_Surface, S2: Handle_Geom_Surface, L1: TopLoc_Location, L2: TopLoc_Location): Standard_Boolean;
  static Continuity_2(E: TopoDS_Edge, S1: Handle_Geom_Surface, S2: Handle_Geom_Surface, L1: TopLoc_Location, L2: TopLoc_Location): GeomAbs_Shape;
  static HasContinuity_3(E: TopoDS_Edge): Standard_Boolean;
  static MaxContinuity(theEdge: TopoDS_Edge): GeomAbs_Shape;
  static Pnt(V: TopoDS_Vertex): gp_Pnt;
  static Tolerance_3(V: TopoDS_Vertex): Standard_Real;
  static Parameter_1(theV: TopoDS_Vertex, theE: TopoDS_Edge, theParam: Standard_Real): Standard_Boolean;
  static Parameter_2(V: TopoDS_Vertex, E: TopoDS_Edge): Standard_Real;
  static Parameter_3(V: TopoDS_Vertex, E: TopoDS_Edge, F: TopoDS_Face): Standard_Real;
  static Parameter_4(V: TopoDS_Vertex, E: TopoDS_Edge, S: Handle_Geom_Surface, L: TopLoc_Location): Standard_Real;
  static Parameters(V: TopoDS_Vertex, F: TopoDS_Face): gp_Pnt2d;
  static MaxTolerance(theShape: TopoDS_Shape, theSubShape: TopAbs_ShapeEnum): Standard_Real;
  delete(): void;
}

export declare type IFSelect_ReturnStatus = {
  IFSelect_RetVoid: {};
  IFSelect_RetDone: {};
  IFSelect_RetError: {};
  IFSelect_RetFail: {};
  IFSelect_RetStop: {};
}

type Standard_Boolean = boolean;
type Standard_Byte = number;
type Standard_Character = number;
type Standard_CString = string;
type Standard_Integer = number;
type Standard_Real = number;
type Standard_ShortReal = number;
type Standard_Size = number;

declare namespace FS {
  interface Lookup {
      path: string;
      node: FSNode;
  }

  interface FSStream {}
  interface FSNode {}
  interface ErrnoError {}

  let ignorePermissions: boolean;
  let trackingDelegate: any;
  let tracking: any;
  let genericErrors: any;

  //
  // paths
  //
  function lookupPath(path: string, opts: any): Lookup;
  function getPath(node: FSNode): string;

  //
  // nodes
  //
  function isFile(mode: number): boolean;
  function isDir(mode: number): boolean;
  function isLink(mode: number): boolean;
  function isChrdev(mode: number): boolean;
  function isBlkdev(mode: number): boolean;
  function isFIFO(mode: number): boolean;
  function isSocket(mode: number): boolean;

  //
  // devices
  //
  function major(dev: number): number;
  function minor(dev: number): number;
  function makedev(ma: number, mi: number): number;
  function registerDevice(dev: number, ops: any): void;

  //
  // core
  //
  function syncfs(populate: boolean, callback: (e: any) => any): void;
  function syncfs(callback: (e: any) => any, populate?: boolean): void;
  function mount(type: any, opts: any, mountpoint: string): any;
  function unmount(mountpoint: string): void;

  function mkdir(path: string, mode?: number): any;
  function mkdev(path: string, mode?: number, dev?: number): any;
  function symlink(oldpath: string, newpath: string): any;
  function rename(old_path: string, new_path: string): void;
  function rmdir(path: string): void;
  function readdir(path: string): any;
  function unlink(path: string): void;
  function readlink(path: string): string;
  function stat(path: string, dontFollow?: boolean): any;
  function lstat(path: string): any;
  function chmod(path: string, mode: number, dontFollow?: boolean): void;
  function lchmod(path: string, mode: number): void;
  function fchmod(fd: number, mode: number): void;
  function chown(path: string, uid: number, gid: number, dontFollow?: boolean): void;
  function lchown(path: string, uid: number, gid: number): void;
  function fchown(fd: number, uid: number, gid: number): void;
  function truncate(path: string, len: number): void;
  function ftruncate(fd: number, len: number): void;
  function utime(path: string, atime: number, mtime: number): void;
  function open(path: string, flags: string, mode?: number, fd_start?: number, fd_end?: number): FSStream;
  function close(stream: FSStream): void;
  function llseek(stream: FSStream, offset: number, whence: number): any;
  function read(stream: FSStream, buffer: ArrayBufferView, offset: number, length: number, position?: number): number;
  function write(
      stream: FSStream,
      buffer: ArrayBufferView,
      offset: number,
      length: number,
      position?: number,
      canOwn?: boolean,
  ): number;
  function allocate(stream: FSStream, offset: number, length: number): void;
  function mmap(
      stream: FSStream,
      buffer: ArrayBufferView,
      offset: number,
      length: number,
      position: number,
      prot: number,
      flags: number,
  ): any;
  function ioctl(stream: FSStream, cmd: any, arg: any): any;
  function readFile(path: string, opts: { encoding: 'binary'; flags?: string }): Uint8Array;
  function readFile(path: string, opts: { encoding: 'utf8'; flags?: string }): string;
  function readFile(path: string, opts?: { flags?: string }): Uint8Array;
  function writeFile(path: string, data: string | ArrayBufferView, opts?: { flags?: string }): void;

  //
  // module-level FS code
  //
  function cwd(): string;
  function chdir(path: string): void;
  function init(
      input: null | (() => number | null),
      output: null | ((c: number) => any),
      error: null | ((c: number) => any),
  ): void;

  function createLazyFile(
      parent: string | FSNode,
      name: string,
      url: string,
      canRead: boolean,
      canWrite: boolean,
  ): FSNode;
  function createPreloadedFile(
      parent: string | FSNode,
      name: string,
      url: string,
      canRead: boolean,
      canWrite: boolean,
      onload?: () => void,
      onerror?: () => void,
      dontCreateFile?: boolean,
      canOwn?: boolean,
  ): void;
  function createDataFile(
      parent: string | FSNode,
      name: string,
      data: ArrayBufferView | string,
      canRead: boolean,
      canWrite: boolean,
      canOwn: boolean,
  ): FSNode;
  interface AnalysisResults {
    isRoot: boolean,
    exists: boolean,
    error: Error,
    name: string,
    path: any,
    object: any,
    parentExists: boolean,
    parentPath: any,
    parentObject: any
  }
  function analyzePath(path: string): AnalysisResults;
}


export type OpenCascadeInstance = {FS: typeof FS} & {
  BRepBndLib: typeof BRepBndLib;
  BRepTools: typeof BRepTools;
  Handle_Geom2d_Curve: typeof Handle_Geom2d_Curve;
  Handle_Geom2d_Curve_1: typeof Handle_Geom2d_Curve_1;
  Handle_Geom2d_Curve_2: typeof Handle_Geom2d_Curve_2;
  Handle_Geom2d_Curve_3: typeof Handle_Geom2d_Curve_3;
  Handle_Geom2d_Curve_4: typeof Handle_Geom2d_Curve_4;
  Geom2d_Curve: typeof Geom2d_Curve;
  Geom2d_Geometry: typeof Geom2d_Geometry;
  Handle_Geom2d_Geometry: typeof Handle_Geom2d_Geometry;
  Handle_Geom2d_Geometry_1: typeof Handle_Geom2d_Geometry_1;
  Handle_Geom2d_Geometry_2: typeof Handle_Geom2d_Geometry_2;
  Handle_Geom2d_Geometry_3: typeof Handle_Geom2d_Geometry_3;
  Handle_Geom2d_Geometry_4: typeof Handle_Geom2d_Geometry_4;
  Handle_Geom2d_Circle: typeof Handle_Geom2d_Circle;
  Handle_Geom2d_Circle_1: typeof Handle_Geom2d_Circle_1;
  Handle_Geom2d_Circle_2: typeof Handle_Geom2d_Circle_2;
  Handle_Geom2d_Circle_3: typeof Handle_Geom2d_Circle_3;
  Handle_Geom2d_Circle_4: typeof Handle_Geom2d_Circle_4;
  Geom2d_Circle: typeof Geom2d_Circle;
  Geom2d_Circle_1: typeof Geom2d_Circle_1;
  Geom2d_Circle_2: typeof Geom2d_Circle_2;
  Geom2d_Circle_3: typeof Geom2d_Circle_3;
  Geom2d_TrimmedCurve: typeof Geom2d_TrimmedCurve;
  Handle_Geom2d_TrimmedCurve: typeof Handle_Geom2d_TrimmedCurve;
  Handle_Geom2d_TrimmedCurve_1: typeof Handle_Geom2d_TrimmedCurve_1;
  Handle_Geom2d_TrimmedCurve_2: typeof Handle_Geom2d_TrimmedCurve_2;
  Handle_Geom2d_TrimmedCurve_3: typeof Handle_Geom2d_TrimmedCurve_3;
  Handle_Geom2d_TrimmedCurve_4: typeof Handle_Geom2d_TrimmedCurve_4;
  Handle_Geom2d_Ellipse: typeof Handle_Geom2d_Ellipse;
  Handle_Geom2d_Ellipse_1: typeof Handle_Geom2d_Ellipse_1;
  Handle_Geom2d_Ellipse_2: typeof Handle_Geom2d_Ellipse_2;
  Handle_Geom2d_Ellipse_3: typeof Handle_Geom2d_Ellipse_3;
  Handle_Geom2d_Ellipse_4: typeof Handle_Geom2d_Ellipse_4;
  Geom2d_Ellipse: typeof Geom2d_Ellipse;
  Geom2d_Ellipse_1: typeof Geom2d_Ellipse_1;
  Geom2d_Ellipse_2: typeof Geom2d_Ellipse_2;
  Geom2d_Ellipse_3: typeof Geom2d_Ellipse_3;
  Handle_Geom2d_BoundedCurve: typeof Handle_Geom2d_BoundedCurve;
  Handle_Geom2d_BoundedCurve_1: typeof Handle_Geom2d_BoundedCurve_1;
  Handle_Geom2d_BoundedCurve_2: typeof Handle_Geom2d_BoundedCurve_2;
  Handle_Geom2d_BoundedCurve_3: typeof Handle_Geom2d_BoundedCurve_3;
  Handle_Geom2d_BoundedCurve_4: typeof Handle_Geom2d_BoundedCurve_4;
  Geom2d_BoundedCurve: typeof Geom2d_BoundedCurve;
  Handle_Geom2d_BSplineCurve: typeof Handle_Geom2d_BSplineCurve;
  Handle_Geom2d_BSplineCurve_1: typeof Handle_Geom2d_BSplineCurve_1;
  Handle_Geom2d_BSplineCurve_2: typeof Handle_Geom2d_BSplineCurve_2;
  Handle_Geom2d_BSplineCurve_3: typeof Handle_Geom2d_BSplineCurve_3;
  Handle_Geom2d_BSplineCurve_4: typeof Handle_Geom2d_BSplineCurve_4;
  Geom2d_BSplineCurve: typeof Geom2d_BSplineCurve;
  Geom2d_BSplineCurve_1: typeof Geom2d_BSplineCurve_1;
  Geom2d_BSplineCurve_2: typeof Geom2d_BSplineCurve_2;
  Geom2d_Line: typeof Geom2d_Line;
  Geom2d_Line_1: typeof Geom2d_Line_1;
  Geom2d_Line_2: typeof Geom2d_Line_2;
  Geom2d_Line_3: typeof Geom2d_Line_3;
  Handle_Geom2d_Line: typeof Handle_Geom2d_Line;
  Handle_Geom2d_Line_1: typeof Handle_Geom2d_Line_1;
  Handle_Geom2d_Line_2: typeof Handle_Geom2d_Line_2;
  Handle_Geom2d_Line_3: typeof Handle_Geom2d_Line_3;
  Handle_Geom2d_Line_4: typeof Handle_Geom2d_Line_4;
  Handle_Geom2d_Conic: typeof Handle_Geom2d_Conic;
  Handle_Geom2d_Conic_1: typeof Handle_Geom2d_Conic_1;
  Handle_Geom2d_Conic_2: typeof Handle_Geom2d_Conic_2;
  Handle_Geom2d_Conic_3: typeof Handle_Geom2d_Conic_3;
  Handle_Geom2d_Conic_4: typeof Handle_Geom2d_Conic_4;
  Geom2d_Conic: typeof Geom2d_Conic;
  TCollection_AsciiString: typeof TCollection_AsciiString;
  TCollection_AsciiString_1: typeof TCollection_AsciiString_1;
  TCollection_AsciiString_2: typeof TCollection_AsciiString_2;
  TCollection_AsciiString_3: typeof TCollection_AsciiString_3;
  TCollection_AsciiString_4: typeof TCollection_AsciiString_4;
  TCollection_AsciiString_5: typeof TCollection_AsciiString_5;
  TCollection_AsciiString_6: typeof TCollection_AsciiString_6;
  TCollection_AsciiString_7: typeof TCollection_AsciiString_7;
  TCollection_AsciiString_8: typeof TCollection_AsciiString_8;
  TCollection_AsciiString_9: typeof TCollection_AsciiString_9;
  TCollection_AsciiString_10: typeof TCollection_AsciiString_10;
  TCollection_AsciiString_11: typeof TCollection_AsciiString_11;
  TCollection_AsciiString_12: typeof TCollection_AsciiString_12;
  TCollection_AsciiString_13: typeof TCollection_AsciiString_13;
  TCollection_AsciiString_14: typeof TCollection_AsciiString_14;
  TCollection_ExtendedString: typeof TCollection_ExtendedString;
  TCollection_ExtendedString_1: typeof TCollection_ExtendedString_1;
  TCollection_ExtendedString_2: typeof TCollection_ExtendedString_2;
  TCollection_ExtendedString_3: typeof TCollection_ExtendedString_3;
  TCollection_ExtendedString_4: typeof TCollection_ExtendedString_4;
  TCollection_ExtendedString_5: typeof TCollection_ExtendedString_5;
  TCollection_ExtendedString_6: typeof TCollection_ExtendedString_6;
  TCollection_ExtendedString_7: typeof TCollection_ExtendedString_7;
  TCollection_ExtendedString_8: typeof TCollection_ExtendedString_8;
  TCollection_ExtendedString_9: typeof TCollection_ExtendedString_9;
  TCollection_ExtendedString_10: typeof TCollection_ExtendedString_10;
  TCollection_ExtendedString_11: typeof TCollection_ExtendedString_11;
  TCollection_ExtendedString_12: typeof TCollection_ExtendedString_12;
  TopExp: typeof TopExp;
  TopExp_Explorer: typeof TopExp_Explorer;
  TopExp_Explorer_1: typeof TopExp_Explorer_1;
  TopExp_Explorer_2: typeof TopExp_Explorer_2;
  GProp_GProps: typeof GProp_GProps;
  GProp_GProps_1: typeof GProp_GProps_1;
  GProp_GProps_2: typeof GProp_GProps_2;
  Handle_Poly_Triangulation: typeof Handle_Poly_Triangulation;
  Handle_Poly_Triangulation_1: typeof Handle_Poly_Triangulation_1;
  Handle_Poly_Triangulation_2: typeof Handle_Poly_Triangulation_2;
  Handle_Poly_Triangulation_3: typeof Handle_Poly_Triangulation_3;
  Handle_Poly_Triangulation_4: typeof Handle_Poly_Triangulation_4;
  Poly_Triangulation: typeof Poly_Triangulation;
  Poly_Triangulation_1: typeof Poly_Triangulation_1;
  Poly_Triangulation_2: typeof Poly_Triangulation_2;
  Poly_Triangulation_3: typeof Poly_Triangulation_3;
  Poly_Triangulation_4: typeof Poly_Triangulation_4;
  Poly_Triangulation_5: typeof Poly_Triangulation_5;
  TColStd_Array1OfInteger: typeof TColStd_Array1OfInteger;
  TColStd_Array1OfInteger_1: typeof TColStd_Array1OfInteger_1;
  TColStd_Array1OfInteger_2: typeof TColStd_Array1OfInteger_2;
  TColStd_Array1OfInteger_3: typeof TColStd_Array1OfInteger_3;
  TColStd_Array1OfInteger_4: typeof TColStd_Array1OfInteger_4;
  TColStd_Array1OfInteger_5: typeof TColStd_Array1OfInteger_5;
  TColStd_Array1OfReal: typeof TColStd_Array1OfReal;
  TColStd_Array1OfReal_1: typeof TColStd_Array1OfReal_1;
  TColStd_Array1OfReal_2: typeof TColStd_Array1OfReal_2;
  TColStd_Array1OfReal_3: typeof TColStd_Array1OfReal_3;
  TColStd_Array1OfReal_4: typeof TColStd_Array1OfReal_4;
  TColStd_Array1OfReal_5: typeof TColStd_Array1OfReal_5;
  TColStd_Array2OfReal: typeof TColStd_Array2OfReal;
  TColStd_Array2OfReal_1: typeof TColStd_Array2OfReal_1;
  TColStd_Array2OfReal_2: typeof TColStd_Array2OfReal_2;
  TColStd_Array2OfReal_3: typeof TColStd_Array2OfReal_3;
  TColStd_Array2OfReal_4: typeof TColStd_Array2OfReal_4;
  TColStd_Array2OfReal_5: typeof TColStd_Array2OfReal_5;
  Standard_Transient: typeof Standard_Transient;
  Standard_Transient_1: typeof Standard_Transient_1;
  Standard_Transient_2: typeof Standard_Transient_2;
  Handle_Standard_Transient: typeof Handle_Standard_Transient;
  Handle_Standard_Transient_1: typeof Handle_Standard_Transient_1;
  Handle_Standard_Transient_2: typeof Handle_Standard_Transient_2;
  Handle_Standard_Transient_3: typeof Handle_Standard_Transient_3;
  Handle_Standard_Transient_4: typeof Handle_Standard_Transient_4;
  BRepCheck_Analyzer: typeof BRepCheck_Analyzer;
  Handle_ShapeFix_Wire: typeof Handle_ShapeFix_Wire;
  Handle_ShapeFix_Wire_1: typeof Handle_ShapeFix_Wire_1;
  Handle_ShapeFix_Wire_2: typeof Handle_ShapeFix_Wire_2;
  Handle_ShapeFix_Wire_3: typeof Handle_ShapeFix_Wire_3;
  Handle_ShapeFix_Wire_4: typeof Handle_ShapeFix_Wire_4;
  ShapeFix_Wire: typeof ShapeFix_Wire;
  ShapeFix_Wire_1: typeof ShapeFix_Wire_1;
  ShapeFix_Wire_2: typeof ShapeFix_Wire_2;
  ShapeFix_Shape: typeof ShapeFix_Shape;
  ShapeFix_Shape_1: typeof ShapeFix_Shape_1;
  ShapeFix_Shape_2: typeof ShapeFix_Shape_2;
  Handle_ShapeFix_Shape: typeof Handle_ShapeFix_Shape;
  Handle_ShapeFix_Shape_1: typeof Handle_ShapeFix_Shape_1;
  Handle_ShapeFix_Shape_2: typeof Handle_ShapeFix_Shape_2;
  Handle_ShapeFix_Shape_3: typeof Handle_ShapeFix_Shape_3;
  Handle_ShapeFix_Shape_4: typeof Handle_ShapeFix_Shape_4;
  ShapeFix_Shell: typeof ShapeFix_Shell;
  ShapeFix_Shell_1: typeof ShapeFix_Shell_1;
  ShapeFix_Shell_2: typeof ShapeFix_Shell_2;
  Handle_ShapeFix_Shell: typeof Handle_ShapeFix_Shell;
  Handle_ShapeFix_Shell_1: typeof Handle_ShapeFix_Shell_1;
  Handle_ShapeFix_Shell_2: typeof Handle_ShapeFix_Shell_2;
  Handle_ShapeFix_Shell_3: typeof Handle_ShapeFix_Shell_3;
  Handle_ShapeFix_Shell_4: typeof Handle_ShapeFix_Shell_4;
  ShapeFix: typeof ShapeFix;
  Handle_ShapeFix_Root: typeof Handle_ShapeFix_Root;
  Handle_ShapeFix_Root_1: typeof Handle_ShapeFix_Root_1;
  Handle_ShapeFix_Root_2: typeof Handle_ShapeFix_Root_2;
  Handle_ShapeFix_Root_3: typeof Handle_ShapeFix_Root_3;
  Handle_ShapeFix_Root_4: typeof Handle_ShapeFix_Root_4;
  ShapeFix_Root: typeof ShapeFix_Root;
  Handle_ShapeFix_Face: typeof Handle_ShapeFix_Face;
  Handle_ShapeFix_Face_1: typeof Handle_ShapeFix_Face_1;
  Handle_ShapeFix_Face_2: typeof Handle_ShapeFix_Face_2;
  Handle_ShapeFix_Face_3: typeof Handle_ShapeFix_Face_3;
  Handle_ShapeFix_Face_4: typeof Handle_ShapeFix_Face_4;
  ShapeFix_Face: typeof ShapeFix_Face;
  ShapeFix_Face_1: typeof ShapeFix_Face_1;
  ShapeFix_Face_2: typeof ShapeFix_Face_2;
  Message_ProgressRange: typeof Message_ProgressRange;
  Message_ProgressRange_1: typeof Message_ProgressRange_1;
  Message_ProgressRange_2: typeof Message_ProgressRange_2;
  Bnd_Box: typeof Bnd_Box;
  Bnd_Box_1: typeof Bnd_Box_1;
  Bnd_Box_2: typeof Bnd_Box_2;
  TopLoc_Location: typeof TopLoc_Location;
  TopLoc_Location_1: typeof TopLoc_Location_1;
  TopLoc_Location_2: typeof TopLoc_Location_2;
  TopLoc_Location_3: typeof TopLoc_Location_3;
  TColgp_Array2OfPnt: typeof TColgp_Array2OfPnt;
  TColgp_Array2OfPnt_1: typeof TColgp_Array2OfPnt_1;
  TColgp_Array2OfPnt_2: typeof TColgp_Array2OfPnt_2;
  TColgp_Array2OfPnt_3: typeof TColgp_Array2OfPnt_3;
  TColgp_Array2OfPnt_4: typeof TColgp_Array2OfPnt_4;
  TColgp_Array2OfPnt_5: typeof TColgp_Array2OfPnt_5;
  TColgp_Array1OfPnt2d: typeof TColgp_Array1OfPnt2d;
  TColgp_Array1OfPnt2d_1: typeof TColgp_Array1OfPnt2d_1;
  TColgp_Array1OfPnt2d_2: typeof TColgp_Array1OfPnt2d_2;
  TColgp_Array1OfPnt2d_3: typeof TColgp_Array1OfPnt2d_3;
  TColgp_Array1OfPnt2d_4: typeof TColgp_Array1OfPnt2d_4;
  TColgp_Array1OfPnt2d_5: typeof TColgp_Array1OfPnt2d_5;
  TColgp_Array1OfPnt: typeof TColgp_Array1OfPnt;
  TColgp_Array1OfPnt_1: typeof TColgp_Array1OfPnt_1;
  TColgp_Array1OfPnt_2: typeof TColgp_Array1OfPnt_2;
  TColgp_Array1OfPnt_3: typeof TColgp_Array1OfPnt_3;
  TColgp_Array1OfPnt_4: typeof TColgp_Array1OfPnt_4;
  TColgp_Array1OfPnt_5: typeof TColgp_Array1OfPnt_5;
  StlAPI_Writer: typeof StlAPI_Writer;
  StlAPI_Reader: typeof StlAPI_Reader;
  StlAPI: typeof StlAPI;
  TopTools_ListOfShape: typeof TopTools_ListOfShape;
  TopTools_ListOfShape_1: typeof TopTools_ListOfShape_1;
  TopTools_ListOfShape_2: typeof TopTools_ListOfShape_2;
  TopTools_ListOfShape_3: typeof TopTools_ListOfShape_3;
  ShapeUpgrade_UnifySameDomain: typeof ShapeUpgrade_UnifySameDomain;
  ShapeUpgrade_UnifySameDomain_1: typeof ShapeUpgrade_UnifySameDomain_1;
  ShapeUpgrade_UnifySameDomain_2: typeof ShapeUpgrade_UnifySameDomain_2;
  TopAbs_ShapeEnum: TopAbs_ShapeEnum;
  TopAbs_Orientation: TopAbs_Orientation;
  BRepBuilderAPI_MakeSolid: typeof BRepBuilderAPI_MakeSolid;
  BRepBuilderAPI_MakeSolid_1: typeof BRepBuilderAPI_MakeSolid_1;
  BRepBuilderAPI_MakeSolid_2: typeof BRepBuilderAPI_MakeSolid_2;
  BRepBuilderAPI_MakeSolid_3: typeof BRepBuilderAPI_MakeSolid_3;
  BRepBuilderAPI_MakeSolid_4: typeof BRepBuilderAPI_MakeSolid_4;
  BRepBuilderAPI_MakeSolid_5: typeof BRepBuilderAPI_MakeSolid_5;
  BRepBuilderAPI_MakeSolid_6: typeof BRepBuilderAPI_MakeSolid_6;
  BRepBuilderAPI_MakeSolid_7: typeof BRepBuilderAPI_MakeSolid_7;
  BRepBuilderAPI_MakeShell: typeof BRepBuilderAPI_MakeShell;
  BRepBuilderAPI_MakeShell_1: typeof BRepBuilderAPI_MakeShell_1;
  BRepBuilderAPI_MakeShell_2: typeof BRepBuilderAPI_MakeShell_2;
  BRepBuilderAPI_MakeShell_3: typeof BRepBuilderAPI_MakeShell_3;
  BRepBuilderAPI_MakeFace: typeof BRepBuilderAPI_MakeFace;
  BRepBuilderAPI_MakeFace_1: typeof BRepBuilderAPI_MakeFace_1;
  BRepBuilderAPI_MakeFace_2: typeof BRepBuilderAPI_MakeFace_2;
  BRepBuilderAPI_MakeFace_3: typeof BRepBuilderAPI_MakeFace_3;
  BRepBuilderAPI_MakeFace_4: typeof BRepBuilderAPI_MakeFace_4;
  BRepBuilderAPI_MakeFace_5: typeof BRepBuilderAPI_MakeFace_5;
  BRepBuilderAPI_MakeFace_6: typeof BRepBuilderAPI_MakeFace_6;
  BRepBuilderAPI_MakeFace_7: typeof BRepBuilderAPI_MakeFace_7;
  BRepBuilderAPI_MakeFace_8: typeof BRepBuilderAPI_MakeFace_8;
  BRepBuilderAPI_MakeFace_9: typeof BRepBuilderAPI_MakeFace_9;
  BRepBuilderAPI_MakeFace_10: typeof BRepBuilderAPI_MakeFace_10;
  BRepBuilderAPI_MakeFace_11: typeof BRepBuilderAPI_MakeFace_11;
  BRepBuilderAPI_MakeFace_12: typeof BRepBuilderAPI_MakeFace_12;
  BRepBuilderAPI_MakeFace_13: typeof BRepBuilderAPI_MakeFace_13;
  BRepBuilderAPI_MakeFace_14: typeof BRepBuilderAPI_MakeFace_14;
  BRepBuilderAPI_MakeFace_15: typeof BRepBuilderAPI_MakeFace_15;
  BRepBuilderAPI_MakeFace_16: typeof BRepBuilderAPI_MakeFace_16;
  BRepBuilderAPI_MakeFace_17: typeof BRepBuilderAPI_MakeFace_17;
  BRepBuilderAPI_MakeFace_18: typeof BRepBuilderAPI_MakeFace_18;
  BRepBuilderAPI_MakeFace_19: typeof BRepBuilderAPI_MakeFace_19;
  BRepBuilderAPI_MakeFace_20: typeof BRepBuilderAPI_MakeFace_20;
  BRepBuilderAPI_MakeFace_21: typeof BRepBuilderAPI_MakeFace_21;
  BRepBuilderAPI_MakeFace_22: typeof BRepBuilderAPI_MakeFace_22;
  BRepBuilderAPI_MakeWire: typeof BRepBuilderAPI_MakeWire;
  BRepBuilderAPI_MakeWire_1: typeof BRepBuilderAPI_MakeWire_1;
  BRepBuilderAPI_MakeWire_2: typeof BRepBuilderAPI_MakeWire_2;
  BRepBuilderAPI_MakeWire_3: typeof BRepBuilderAPI_MakeWire_3;
  BRepBuilderAPI_MakeWire_4: typeof BRepBuilderAPI_MakeWire_4;
  BRepBuilderAPI_MakeWire_5: typeof BRepBuilderAPI_MakeWire_5;
  BRepBuilderAPI_MakeWire_6: typeof BRepBuilderAPI_MakeWire_6;
  BRepBuilderAPI_MakeWire_7: typeof BRepBuilderAPI_MakeWire_7;
  BRepBuilderAPI_Command: typeof BRepBuilderAPI_Command;
  BRepBuilderAPI_MakeEdge: typeof BRepBuilderAPI_MakeEdge;
  BRepBuilderAPI_MakeEdge_1: typeof BRepBuilderAPI_MakeEdge_1;
  BRepBuilderAPI_MakeEdge_2: typeof BRepBuilderAPI_MakeEdge_2;
  BRepBuilderAPI_MakeEdge_3: typeof BRepBuilderAPI_MakeEdge_3;
  BRepBuilderAPI_MakeEdge_4: typeof BRepBuilderAPI_MakeEdge_4;
  BRepBuilderAPI_MakeEdge_5: typeof BRepBuilderAPI_MakeEdge_5;
  BRepBuilderAPI_MakeEdge_6: typeof BRepBuilderAPI_MakeEdge_6;
  BRepBuilderAPI_MakeEdge_7: typeof BRepBuilderAPI_MakeEdge_7;
  BRepBuilderAPI_MakeEdge_8: typeof BRepBuilderAPI_MakeEdge_8;
  BRepBuilderAPI_MakeEdge_9: typeof BRepBuilderAPI_MakeEdge_9;
  BRepBuilderAPI_MakeEdge_10: typeof BRepBuilderAPI_MakeEdge_10;
  BRepBuilderAPI_MakeEdge_11: typeof BRepBuilderAPI_MakeEdge_11;
  BRepBuilderAPI_MakeEdge_12: typeof BRepBuilderAPI_MakeEdge_12;
  BRepBuilderAPI_MakeEdge_13: typeof BRepBuilderAPI_MakeEdge_13;
  BRepBuilderAPI_MakeEdge_14: typeof BRepBuilderAPI_MakeEdge_14;
  BRepBuilderAPI_MakeEdge_15: typeof BRepBuilderAPI_MakeEdge_15;
  BRepBuilderAPI_MakeEdge_16: typeof BRepBuilderAPI_MakeEdge_16;
  BRepBuilderAPI_MakeEdge_17: typeof BRepBuilderAPI_MakeEdge_17;
  BRepBuilderAPI_MakeEdge_18: typeof BRepBuilderAPI_MakeEdge_18;
  BRepBuilderAPI_MakeEdge_19: typeof BRepBuilderAPI_MakeEdge_19;
  BRepBuilderAPI_MakeEdge_20: typeof BRepBuilderAPI_MakeEdge_20;
  BRepBuilderAPI_MakeEdge_21: typeof BRepBuilderAPI_MakeEdge_21;
  BRepBuilderAPI_MakeEdge_22: typeof BRepBuilderAPI_MakeEdge_22;
  BRepBuilderAPI_MakeEdge_23: typeof BRepBuilderAPI_MakeEdge_23;
  BRepBuilderAPI_MakeEdge_24: typeof BRepBuilderAPI_MakeEdge_24;
  BRepBuilderAPI_MakeEdge_25: typeof BRepBuilderAPI_MakeEdge_25;
  BRepBuilderAPI_MakeEdge_26: typeof BRepBuilderAPI_MakeEdge_26;
  BRepBuilderAPI_MakeEdge_27: typeof BRepBuilderAPI_MakeEdge_27;
  BRepBuilderAPI_MakeEdge_28: typeof BRepBuilderAPI_MakeEdge_28;
  BRepBuilderAPI_MakeEdge_29: typeof BRepBuilderAPI_MakeEdge_29;
  BRepBuilderAPI_MakeEdge_30: typeof BRepBuilderAPI_MakeEdge_30;
  BRepBuilderAPI_MakeEdge_31: typeof BRepBuilderAPI_MakeEdge_31;
  BRepBuilderAPI_MakeEdge_32: typeof BRepBuilderAPI_MakeEdge_32;
  BRepBuilderAPI_MakeEdge_33: typeof BRepBuilderAPI_MakeEdge_33;
  BRepBuilderAPI_MakeEdge_34: typeof BRepBuilderAPI_MakeEdge_34;
  BRepBuilderAPI_MakeEdge_35: typeof BRepBuilderAPI_MakeEdge_35;
  BRepBuilderAPI_Sewing: typeof BRepBuilderAPI_Sewing;
  BRepBuilderAPI_MakeShape: typeof BRepBuilderAPI_MakeShape;
  BRepGProp: typeof BRepGProp;
  STEPControl_StepModelType: STEPControl_StepModelType;
  STEPControl_Writer: typeof STEPControl_Writer;
  STEPControl_Writer_1: typeof STEPControl_Writer_1;
  STEPControl_Writer_2: typeof STEPControl_Writer_2;
  STEPControl_Reader: typeof STEPControl_Reader;
  STEPControl_Reader_1: typeof STEPControl_Reader_1;
  STEPControl_Reader_2: typeof STEPControl_Reader_2;
  Geom_BoundedSurface: typeof Geom_BoundedSurface;
  Handle_Geom_BoundedSurface: typeof Handle_Geom_BoundedSurface;
  Handle_Geom_BoundedSurface_1: typeof Handle_Geom_BoundedSurface_1;
  Handle_Geom_BoundedSurface_2: typeof Handle_Geom_BoundedSurface_2;
  Handle_Geom_BoundedSurface_3: typeof Handle_Geom_BoundedSurface_3;
  Handle_Geom_BoundedSurface_4: typeof Handle_Geom_BoundedSurface_4;
  Geom_ToroidalSurface: typeof Geom_ToroidalSurface;
  Geom_ToroidalSurface_1: typeof Geom_ToroidalSurface_1;
  Geom_ToroidalSurface_2: typeof Geom_ToroidalSurface_2;
  Handle_Geom_ToroidalSurface: typeof Handle_Geom_ToroidalSurface;
  Handle_Geom_ToroidalSurface_1: typeof Handle_Geom_ToroidalSurface_1;
  Handle_Geom_ToroidalSurface_2: typeof Handle_Geom_ToroidalSurface_2;
  Handle_Geom_ToroidalSurface_3: typeof Handle_Geom_ToroidalSurface_3;
  Handle_Geom_ToroidalSurface_4: typeof Handle_Geom_ToroidalSurface_4;
  Handle_Geom_Parabola: typeof Handle_Geom_Parabola;
  Handle_Geom_Parabola_1: typeof Handle_Geom_Parabola_1;
  Handle_Geom_Parabola_2: typeof Handle_Geom_Parabola_2;
  Handle_Geom_Parabola_3: typeof Handle_Geom_Parabola_3;
  Handle_Geom_Parabola_4: typeof Handle_Geom_Parabola_4;
  Geom_Parabola: typeof Geom_Parabola;
  Geom_Parabola_1: typeof Geom_Parabola_1;
  Geom_Parabola_2: typeof Geom_Parabola_2;
  Geom_Parabola_3: typeof Geom_Parabola_3;
  Handle_Geom_Geometry: typeof Handle_Geom_Geometry;
  Handle_Geom_Geometry_1: typeof Handle_Geom_Geometry_1;
  Handle_Geom_Geometry_2: typeof Handle_Geom_Geometry_2;
  Handle_Geom_Geometry_3: typeof Handle_Geom_Geometry_3;
  Handle_Geom_Geometry_4: typeof Handle_Geom_Geometry_4;
  Geom_Geometry: typeof Geom_Geometry;
  Geom_Surface: typeof Geom_Surface;
  Handle_Geom_Surface: typeof Handle_Geom_Surface;
  Handle_Geom_Surface_1: typeof Handle_Geom_Surface_1;
  Handle_Geom_Surface_2: typeof Handle_Geom_Surface_2;
  Handle_Geom_Surface_3: typeof Handle_Geom_Surface_3;
  Handle_Geom_Surface_4: typeof Handle_Geom_Surface_4;
  Handle_Geom_SphericalSurface: typeof Handle_Geom_SphericalSurface;
  Handle_Geom_SphericalSurface_1: typeof Handle_Geom_SphericalSurface_1;
  Handle_Geom_SphericalSurface_2: typeof Handle_Geom_SphericalSurface_2;
  Handle_Geom_SphericalSurface_3: typeof Handle_Geom_SphericalSurface_3;
  Handle_Geom_SphericalSurface_4: typeof Handle_Geom_SphericalSurface_4;
  Geom_SphericalSurface: typeof Geom_SphericalSurface;
  Geom_SphericalSurface_1: typeof Geom_SphericalSurface_1;
  Geom_SphericalSurface_2: typeof Geom_SphericalSurface_2;
  Handle_Geom_SurfaceOfLinearExtrusion: typeof Handle_Geom_SurfaceOfLinearExtrusion;
  Handle_Geom_SurfaceOfLinearExtrusion_1: typeof Handle_Geom_SurfaceOfLinearExtrusion_1;
  Handle_Geom_SurfaceOfLinearExtrusion_2: typeof Handle_Geom_SurfaceOfLinearExtrusion_2;
  Handle_Geom_SurfaceOfLinearExtrusion_3: typeof Handle_Geom_SurfaceOfLinearExtrusion_3;
  Handle_Geom_SurfaceOfLinearExtrusion_4: typeof Handle_Geom_SurfaceOfLinearExtrusion_4;
  Geom_SurfaceOfLinearExtrusion: typeof Geom_SurfaceOfLinearExtrusion;
  Handle_Geom_SweptSurface: typeof Handle_Geom_SweptSurface;
  Handle_Geom_SweptSurface_1: typeof Handle_Geom_SweptSurface_1;
  Handle_Geom_SweptSurface_2: typeof Handle_Geom_SweptSurface_2;
  Handle_Geom_SweptSurface_3: typeof Handle_Geom_SweptSurface_3;
  Handle_Geom_SweptSurface_4: typeof Handle_Geom_SweptSurface_4;
  Geom_SweptSurface: typeof Geom_SweptSurface;
  Geom_ConicalSurface: typeof Geom_ConicalSurface;
  Geom_ConicalSurface_1: typeof Geom_ConicalSurface_1;
  Geom_ConicalSurface_2: typeof Geom_ConicalSurface_2;
  Handle_Geom_ConicalSurface: typeof Handle_Geom_ConicalSurface;
  Handle_Geom_ConicalSurface_1: typeof Handle_Geom_ConicalSurface_1;
  Handle_Geom_ConicalSurface_2: typeof Handle_Geom_ConicalSurface_2;
  Handle_Geom_ConicalSurface_3: typeof Handle_Geom_ConicalSurface_3;
  Handle_Geom_ConicalSurface_4: typeof Handle_Geom_ConicalSurface_4;
  Geom_Circle: typeof Geom_Circle;
  Geom_Circle_1: typeof Geom_Circle_1;
  Geom_Circle_2: typeof Geom_Circle_2;
  Handle_Geom_Circle: typeof Handle_Geom_Circle;
  Handle_Geom_Circle_1: typeof Handle_Geom_Circle_1;
  Handle_Geom_Circle_2: typeof Handle_Geom_Circle_2;
  Handle_Geom_Circle_3: typeof Handle_Geom_Circle_3;
  Handle_Geom_Circle_4: typeof Handle_Geom_Circle_4;
  Geom_Conic: typeof Geom_Conic;
  Handle_Geom_Conic: typeof Handle_Geom_Conic;
  Handle_Geom_Conic_1: typeof Handle_Geom_Conic_1;
  Handle_Geom_Conic_2: typeof Handle_Geom_Conic_2;
  Handle_Geom_Conic_3: typeof Handle_Geom_Conic_3;
  Handle_Geom_Conic_4: typeof Handle_Geom_Conic_4;
  Geom_SurfaceOfRevolution: typeof Geom_SurfaceOfRevolution;
  Handle_Geom_SurfaceOfRevolution: typeof Handle_Geom_SurfaceOfRevolution;
  Handle_Geom_SurfaceOfRevolution_1: typeof Handle_Geom_SurfaceOfRevolution_1;
  Handle_Geom_SurfaceOfRevolution_2: typeof Handle_Geom_SurfaceOfRevolution_2;
  Handle_Geom_SurfaceOfRevolution_3: typeof Handle_Geom_SurfaceOfRevolution_3;
  Handle_Geom_SurfaceOfRevolution_4: typeof Handle_Geom_SurfaceOfRevolution_4;
  Handle_Geom_RectangularTrimmedSurface: typeof Handle_Geom_RectangularTrimmedSurface;
  Handle_Geom_RectangularTrimmedSurface_1: typeof Handle_Geom_RectangularTrimmedSurface_1;
  Handle_Geom_RectangularTrimmedSurface_2: typeof Handle_Geom_RectangularTrimmedSurface_2;
  Handle_Geom_RectangularTrimmedSurface_3: typeof Handle_Geom_RectangularTrimmedSurface_3;
  Handle_Geom_RectangularTrimmedSurface_4: typeof Handle_Geom_RectangularTrimmedSurface_4;
  Geom_RectangularTrimmedSurface: typeof Geom_RectangularTrimmedSurface;
  Geom_RectangularTrimmedSurface_1: typeof Geom_RectangularTrimmedSurface_1;
  Geom_RectangularTrimmedSurface_2: typeof Geom_RectangularTrimmedSurface_2;
  Geom_OffsetSurface: typeof Geom_OffsetSurface;
  Handle_Geom_OffsetSurface: typeof Handle_Geom_OffsetSurface;
  Handle_Geom_OffsetSurface_1: typeof Handle_Geom_OffsetSurface_1;
  Handle_Geom_OffsetSurface_2: typeof Handle_Geom_OffsetSurface_2;
  Handle_Geom_OffsetSurface_3: typeof Handle_Geom_OffsetSurface_3;
  Handle_Geom_OffsetSurface_4: typeof Handle_Geom_OffsetSurface_4;
  Geom_Hyperbola: typeof Geom_Hyperbola;
  Geom_Hyperbola_1: typeof Geom_Hyperbola_1;
  Geom_Hyperbola_2: typeof Geom_Hyperbola_2;
  Handle_Geom_Hyperbola: typeof Handle_Geom_Hyperbola;
  Handle_Geom_Hyperbola_1: typeof Handle_Geom_Hyperbola_1;
  Handle_Geom_Hyperbola_2: typeof Handle_Geom_Hyperbola_2;
  Handle_Geom_Hyperbola_3: typeof Handle_Geom_Hyperbola_3;
  Handle_Geom_Hyperbola_4: typeof Handle_Geom_Hyperbola_4;
  Handle_Geom_BoundedCurve: typeof Handle_Geom_BoundedCurve;
  Handle_Geom_BoundedCurve_1: typeof Handle_Geom_BoundedCurve_1;
  Handle_Geom_BoundedCurve_2: typeof Handle_Geom_BoundedCurve_2;
  Handle_Geom_BoundedCurve_3: typeof Handle_Geom_BoundedCurve_3;
  Handle_Geom_BoundedCurve_4: typeof Handle_Geom_BoundedCurve_4;
  Geom_BoundedCurve: typeof Geom_BoundedCurve;
  Geom_BSplineCurve: typeof Geom_BSplineCurve;
  Geom_BSplineCurve_1: typeof Geom_BSplineCurve_1;
  Geom_BSplineCurve_2: typeof Geom_BSplineCurve_2;
  Handle_Geom_BSplineCurve: typeof Handle_Geom_BSplineCurve;
  Handle_Geom_BSplineCurve_1: typeof Handle_Geom_BSplineCurve_1;
  Handle_Geom_BSplineCurve_2: typeof Handle_Geom_BSplineCurve_2;
  Handle_Geom_BSplineCurve_3: typeof Handle_Geom_BSplineCurve_3;
  Handle_Geom_BSplineCurve_4: typeof Handle_Geom_BSplineCurve_4;
  Handle_Geom_BSplineSurface: typeof Handle_Geom_BSplineSurface;
  Handle_Geom_BSplineSurface_1: typeof Handle_Geom_BSplineSurface_1;
  Handle_Geom_BSplineSurface_2: typeof Handle_Geom_BSplineSurface_2;
  Handle_Geom_BSplineSurface_3: typeof Handle_Geom_BSplineSurface_3;
  Handle_Geom_BSplineSurface_4: typeof Handle_Geom_BSplineSurface_4;
  Geom_BSplineSurface: typeof Geom_BSplineSurface;
  Geom_BSplineSurface_1: typeof Geom_BSplineSurface_1;
  Geom_BSplineSurface_2: typeof Geom_BSplineSurface_2;
  Geom_TrimmedCurve: typeof Geom_TrimmedCurve;
  Handle_Geom_TrimmedCurve: typeof Handle_Geom_TrimmedCurve;
  Handle_Geom_TrimmedCurve_1: typeof Handle_Geom_TrimmedCurve_1;
  Handle_Geom_TrimmedCurve_2: typeof Handle_Geom_TrimmedCurve_2;
  Handle_Geom_TrimmedCurve_3: typeof Handle_Geom_TrimmedCurve_3;
  Handle_Geom_TrimmedCurve_4: typeof Handle_Geom_TrimmedCurve_4;
  Handle_Geom_Curve: typeof Handle_Geom_Curve;
  Handle_Geom_Curve_1: typeof Handle_Geom_Curve_1;
  Handle_Geom_Curve_2: typeof Handle_Geom_Curve_2;
  Handle_Geom_Curve_3: typeof Handle_Geom_Curve_3;
  Handle_Geom_Curve_4: typeof Handle_Geom_Curve_4;
  Geom_Curve: typeof Geom_Curve;
  Geom_ElementarySurface: typeof Geom_ElementarySurface;
  Handle_Geom_ElementarySurface: typeof Handle_Geom_ElementarySurface;
  Handle_Geom_ElementarySurface_1: typeof Handle_Geom_ElementarySurface_1;
  Handle_Geom_ElementarySurface_2: typeof Handle_Geom_ElementarySurface_2;
  Handle_Geom_ElementarySurface_3: typeof Handle_Geom_ElementarySurface_3;
  Handle_Geom_ElementarySurface_4: typeof Handle_Geom_ElementarySurface_4;
  Handle_Geom_CylindricalSurface: typeof Handle_Geom_CylindricalSurface;
  Handle_Geom_CylindricalSurface_1: typeof Handle_Geom_CylindricalSurface_1;
  Handle_Geom_CylindricalSurface_2: typeof Handle_Geom_CylindricalSurface_2;
  Handle_Geom_CylindricalSurface_3: typeof Handle_Geom_CylindricalSurface_3;
  Handle_Geom_CylindricalSurface_4: typeof Handle_Geom_CylindricalSurface_4;
  Geom_CylindricalSurface: typeof Geom_CylindricalSurface;
  Geom_CylindricalSurface_1: typeof Geom_CylindricalSurface_1;
  Geom_CylindricalSurface_2: typeof Geom_CylindricalSurface_2;
  Geom_Plane: typeof Geom_Plane;
  Geom_Plane_1: typeof Geom_Plane_1;
  Geom_Plane_2: typeof Geom_Plane_2;
  Geom_Plane_3: typeof Geom_Plane_3;
  Geom_Plane_4: typeof Geom_Plane_4;
  Handle_Geom_Plane: typeof Handle_Geom_Plane;
  Handle_Geom_Plane_1: typeof Handle_Geom_Plane_1;
  Handle_Geom_Plane_2: typeof Handle_Geom_Plane_2;
  Handle_Geom_Plane_3: typeof Handle_Geom_Plane_3;
  Handle_Geom_Plane_4: typeof Handle_Geom_Plane_4;
  Geom_Ellipse: typeof Geom_Ellipse;
  Geom_Ellipse_1: typeof Geom_Ellipse_1;
  Geom_Ellipse_2: typeof Geom_Ellipse_2;
  Handle_Geom_Ellipse: typeof Handle_Geom_Ellipse;
  Handle_Geom_Ellipse_1: typeof Handle_Geom_Ellipse_1;
  Handle_Geom_Ellipse_2: typeof Handle_Geom_Ellipse_2;
  Handle_Geom_Ellipse_3: typeof Handle_Geom_Ellipse_3;
  Handle_Geom_Ellipse_4: typeof Handle_Geom_Ellipse_4;
  Geom_Line: typeof Geom_Line;
  Geom_Line_1: typeof Geom_Line_1;
  Geom_Line_2: typeof Geom_Line_2;
  Geom_Line_3: typeof Geom_Line_3;
  Handle_Geom_Line: typeof Handle_Geom_Line;
  Handle_Geom_Line_1: typeof Handle_Geom_Line_1;
  Handle_Geom_Line_2: typeof Handle_Geom_Line_2;
  Handle_Geom_Line_3: typeof Handle_Geom_Line_3;
  Handle_Geom_Line_4: typeof Handle_Geom_Line_4;
  gp_Ax2: typeof gp_Ax2;
  gp_Ax2_1: typeof gp_Ax2_1;
  gp_Ax2_2: typeof gp_Ax2_2;
  gp_Ax2_3: typeof gp_Ax2_3;
  gp_Pln: typeof gp_Pln;
  gp_Pln_1: typeof gp_Pln_1;
  gp_Pln_2: typeof gp_Pln_2;
  gp_Pln_3: typeof gp_Pln_3;
  gp_Pln_4: typeof gp_Pln_4;
  gp_Lin: typeof gp_Lin;
  gp_Lin_1: typeof gp_Lin_1;
  gp_Lin_2: typeof gp_Lin_2;
  gp_Lin_3: typeof gp_Lin_3;
  gp_Dir: typeof gp_Dir;
  gp_Dir_1: typeof gp_Dir_1;
  gp_Dir_2: typeof gp_Dir_2;
  gp_Dir_3: typeof gp_Dir_3;
  gp_Dir_4: typeof gp_Dir_4;
  gp_Elips: typeof gp_Elips;
  gp_Elips_1: typeof gp_Elips_1;
  gp_Elips_2: typeof gp_Elips_2;
  gp_Pnt: typeof gp_Pnt;
  gp_Pnt_1: typeof gp_Pnt_1;
  gp_Pnt_2: typeof gp_Pnt_2;
  gp_Pnt_3: typeof gp_Pnt_3;
  gp_Sphere: typeof gp_Sphere;
  gp_Sphere_1: typeof gp_Sphere_1;
  gp_Sphere_2: typeof gp_Sphere_2;
  gp_Ax1: typeof gp_Ax1;
  gp_Ax1_1: typeof gp_Ax1_1;
  gp_Ax1_2: typeof gp_Ax1_2;
  gp_Circ2d: typeof gp_Circ2d;
  gp_Circ2d_1: typeof gp_Circ2d_1;
  gp_Circ2d_2: typeof gp_Circ2d_2;
  gp_Circ2d_3: typeof gp_Circ2d_3;
  gp_Cylinder: typeof gp_Cylinder;
  gp_Cylinder_1: typeof gp_Cylinder_1;
  gp_Cylinder_2: typeof gp_Cylinder_2;
  gp_Vec2d: typeof gp_Vec2d;
  gp_Vec2d_1: typeof gp_Vec2d_1;
  gp_Vec2d_2: typeof gp_Vec2d_2;
  gp_Vec2d_3: typeof gp_Vec2d_3;
  gp_Vec2d_4: typeof gp_Vec2d_4;
  gp_Vec2d_5: typeof gp_Vec2d_5;
  gp_Torus: typeof gp_Torus;
  gp_Torus_1: typeof gp_Torus_1;
  gp_Torus_2: typeof gp_Torus_2;
  gp_Cone: typeof gp_Cone;
  gp_Cone_1: typeof gp_Cone_1;
  gp_Cone_2: typeof gp_Cone_2;
  gp_Vec: typeof gp_Vec;
  gp_Vec_1: typeof gp_Vec_1;
  gp_Vec_2: typeof gp_Vec_2;
  gp_Vec_3: typeof gp_Vec_3;
  gp_Vec_4: typeof gp_Vec_4;
  gp_Vec_5: typeof gp_Vec_5;
  gp_Trsf: typeof gp_Trsf;
  gp_Trsf_1: typeof gp_Trsf_1;
  gp_Trsf_2: typeof gp_Trsf_2;
  gp_Ax3: typeof gp_Ax3;
  gp_Ax3_1: typeof gp_Ax3_1;
  gp_Ax3_2: typeof gp_Ax3_2;
  gp_Ax3_3: typeof gp_Ax3_3;
  gp_Ax3_4: typeof gp_Ax3_4;
  gp_XYZ: typeof gp_XYZ;
  gp_XYZ_1: typeof gp_XYZ_1;
  gp_XYZ_2: typeof gp_XYZ_2;
  gp_Dir2d: typeof gp_Dir2d;
  gp_Dir2d_1: typeof gp_Dir2d_1;
  gp_Dir2d_2: typeof gp_Dir2d_2;
  gp_Dir2d_3: typeof gp_Dir2d_3;
  gp_Dir2d_4: typeof gp_Dir2d_4;
  gp_Circ: typeof gp_Circ;
  gp_Circ_1: typeof gp_Circ_1;
  gp_Circ_2: typeof gp_Circ_2;
  gp: typeof gp;
  gp_Pnt2d: typeof gp_Pnt2d;
  gp_Pnt2d_1: typeof gp_Pnt2d_1;
  gp_Pnt2d_2: typeof gp_Pnt2d_2;
  gp_Pnt2d_3: typeof gp_Pnt2d_3;
  gp_Ax2d: typeof gp_Ax2d;
  gp_Ax2d_1: typeof gp_Ax2d_1;
  gp_Ax2d_2: typeof gp_Ax2d_2;
  gp_Lin2d: typeof gp_Lin2d;
  gp_Lin2d_1: typeof gp_Lin2d_1;
  gp_Lin2d_2: typeof gp_Lin2d_2;
  gp_Lin2d_3: typeof gp_Lin2d_3;
  gp_Lin2d_4: typeof gp_Lin2d_4;
  gp_Elips2d: typeof gp_Elips2d;
  gp_Elips2d_1: typeof gp_Elips2d_1;
  gp_Elips2d_2: typeof gp_Elips2d_2;
  gp_Elips2d_3: typeof gp_Elips2d_3;
  BRepMesh_IncrementalMesh: typeof BRepMesh_IncrementalMesh;
  BRepMesh_IncrementalMesh_1: typeof BRepMesh_IncrementalMesh_1;
  BRepMesh_IncrementalMesh_2: typeof BRepMesh_IncrementalMesh_2;
  BRepMesh_IncrementalMesh_3: typeof BRepMesh_IncrementalMesh_3;
  TopoDS_Builder: typeof TopoDS_Builder;
  TopoDS_Iterator: typeof TopoDS_Iterator;
  TopoDS_Iterator_1: typeof TopoDS_Iterator_1;
  TopoDS_Iterator_2: typeof TopoDS_Iterator_2;
  TopoDS_Vertex: typeof TopoDS_Vertex;
  TopoDS: typeof TopoDS;
  TopoDS_Face: typeof TopoDS_Face;
  TopoDS_Solid: typeof TopoDS_Solid;
  TopoDS_Compound: typeof TopoDS_Compound;
  TopoDS_Edge: typeof TopoDS_Edge;
  TopoDS_Shell: typeof TopoDS_Shell;
  TopoDS_Shape: typeof TopoDS_Shape;
  TopoDS_Wire: typeof TopoDS_Wire;
  BRep_Builder: typeof BRep_Builder;
  BRep_Tool: typeof BRep_Tool;
  IFSelect_ReturnStatus: IFSelect_ReturnStatus;
};

declare function init(): Promise<OpenCascadeInstance>;

export default init;
