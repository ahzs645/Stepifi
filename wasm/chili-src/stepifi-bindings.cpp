// Stepifi extended bindings for ACIS geometry reconstruction
// Adds BRep building APIs needed for F3D/ACIS support

#include <emscripten/bind.h>
#include <emscripten/val.h>
#include "shared.hpp"

#include <BRep_Builder.hxx>
#include <BRep_Tool.hxx>
#include <BRepBuilderAPI_Command.hxx>
#include <BRepBuilderAPI_MakeShape.hxx>
#include <BRepBuilderAPI_MakeEdge.hxx>
#include <BRepBuilderAPI_MakeWire.hxx>
#include <BRepBuilderAPI_MakeFace.hxx>
#include <BRepBuilderAPI_MakeSolid.hxx>
#include <BRepBuilderAPI_Sewing.hxx>
#include <BRepOffsetAPI_ThruSections.hxx>
#include <BRepBndLib.hxx>
#include <Bnd_Box.hxx>
#include <TopExp_Explorer.hxx>
#include <GeomAPI_Interpolate.hxx>
#include <Geom_Curve.hxx>
#include <Geom_Surface.hxx>
#include <Geom2d_Curve.hxx>
#include <Message_ProgressRange.hxx>
#include <TColgp_HArray1OfPnt.hxx>
#include <TopoDS_Shell.hxx>
#include <TopoDS_Edge.hxx>
#include <TopoDS_Wire.hxx>
#include <TopoDS_Face.hxx>
#include <TopoDS_Solid.hxx>
#include <TopoDS_Compound.hxx>

using namespace emscripten;

// Wrapper for Bnd_Box::Get which uses output reference parameters
static val bndBoxGet(const Bnd_Box& box) {
    double xmin, ymin, zmin, xmax, ymax, zmax;
    box.Get(xmin, ymin, zmin, xmax, ymax, zmax);
    val result = val::object();
    result.set("xmin", xmin);
    result.set("ymin", ymin);
    result.set("zmin", zmin);
    result.set("xmax", xmax);
    result.set("ymax", ymax);
    result.set("zmax", zmax);
    return result;
}

// Wrapper for BRep_Builder::Add (first param is non-const ref, tricky in embind)
static void brepBuilderAdd(BRep_Builder& builder, TopoDS_Shape& parent, const TopoDS_Shape& child) {
    builder.Add(parent, child);
}

// Wrapper for BRep_Builder::MakeShell (output param)
static TopoDS_Shell brepBuilderMakeShell(BRep_Builder& builder) {
    TopoDS_Shell shell;
    builder.MakeShell(shell);
    return shell;
}

// Wrapper for BRep_Builder::MakeCompound (output param)
static TopoDS_Compound brepBuilderMakeCompound(BRep_Builder& builder) {
    TopoDS_Compound compound;
    builder.MakeCompound(compound);
    return compound;
}

// Wrapper for BRepBndLib::Add (static method with default param)
static void brepBndLibAdd(const TopoDS_Shape& shape, Bnd_Box& box) {
    BRepBndLib::Add(shape, box, false);
}

// Factory for BRepBuilderAPI_MakeEdge from 2D curve on surface (avoids 2-arg constructor collision)
static TopoDS_Edge makeEdgeFromPCurve(const Handle(Geom2d_Curve)& curve2d, const Handle(Geom_Surface)& surface) {
    BRepBuilderAPI_MakeEdge builder(curve2d, surface);
    if (builder.IsDone()) return builder.Edge();
    return TopoDS_Edge();
}

// Wrapper for BRepOffsetAPI_ThruSections::Build (takes optional ProgressRange)
static void thruSectionsBuild(BRepOffsetAPI_ThruSections& builder) {
    builder.Build();
}

EMSCRIPTEN_BINDINGS(stepifi_brep_builder) {

    // Base classes needed for inheritance hierarchy (tsgen requires these)
    class_<BRepBuilderAPI_Command>("BRepBuilderAPI_Command")
        .function("isDone", &BRepBuilderAPI_Command::IsDone);

    class_<BRepBuilderAPI_MakeShape, base<BRepBuilderAPI_Command>>("BRepBuilderAPI_MakeShape")
        .function("shape", &BRepBuilderAPI_MakeShape::Shape);

    // BRepBuilderAPI_MakeEdge - multiple construction modes
    class_<BRepBuilderAPI_MakeEdge, base<BRepBuilderAPI_MakeShape>>("BRepBuilderAPI_MakeEdge")
        .constructor<const gp_Pnt&, const gp_Pnt&>()
        .constructor<const Handle(Geom_Curve)&>()
        .constructor<const Handle(Geom_Curve)&, double, double>()
        .class_function("fromPCurve", &makeEdgeFromPCurve)
        .function("isDone", &BRepBuilderAPI_MakeEdge::IsDone)
        .function("edge", &BRepBuilderAPI_MakeEdge::Edge);

    // BRepBuilderAPI_MakeWire - wire builder
    class_<BRepBuilderAPI_MakeWire, base<BRepBuilderAPI_MakeShape>>("BRepBuilderAPI_MakeWire")
        .constructor<>()
        .constructor<const TopoDS_Edge&>()
        .function("add", select_overload<void(const TopoDS_Edge&)>(&BRepBuilderAPI_MakeWire::Add))
        .function("isDone", &BRepBuilderAPI_MakeWire::IsDone)
        .function("wire", &BRepBuilderAPI_MakeWire::Wire);

    // BRepBuilderAPI_MakeFace - face from surface
    class_<BRepBuilderAPI_MakeFace, base<BRepBuilderAPI_MakeShape>>("BRepBuilderAPI_MakeFace")
        .constructor<const Handle(Geom_Surface)&, double>()
        .constructor<const Handle(Geom_Surface)&, double, double, double, double, double>()
        .constructor<const TopoDS_Wire&>()
        .function("add", &BRepBuilderAPI_MakeFace::Add)
        .function("isDone", &BRepBuilderAPI_MakeFace::IsDone)
        .function("face", &BRepBuilderAPI_MakeFace::Face);

    // BRepBuilderAPI_MakeSolid - solid from shell
    class_<BRepBuilderAPI_MakeSolid, base<BRepBuilderAPI_MakeShape>>("BRepBuilderAPI_MakeSolid")
        .constructor<const TopoDS_Shell&>()
        .function("isDone", &BRepBuilderAPI_MakeSolid::IsDone)
        .function("solid", &BRepBuilderAPI_MakeSolid::Solid);

    // BRepBuilderAPI_Sewing - general purpose sewing
    class_<BRepBuilderAPI_Sewing>("BRepBuilderAPI_Sewing")
        .constructor<double, bool, bool, bool, bool>()
        .function("add", select_overload<void(const TopoDS_Shape&)>(&BRepBuilderAPI_Sewing::Add))
        .function("perform",
            select_overload<void(const Message_ProgressRange&)>(&BRepBuilderAPI_Sewing::Perform))
        .function("sewedShape", &BRepBuilderAPI_Sewing::SewedShape);

    // BRep_Builder - low-level topology builder (uses wrapper functions for output params)
    class_<BRep_Builder>("BRep_Builder")
        .constructor<>()
        .function("makeShell", &brepBuilderMakeShell)
        .function("makeCompound", &brepBuilderMakeCompound)
        .function("add", &brepBuilderAdd);

    // BRepOffsetAPI_ThruSections - loft builder
    class_<BRepOffsetAPI_ThruSections, base<BRepBuilderAPI_MakeShape>>("BRepOffsetAPI_ThruSections")
        .constructor<bool, bool>()
        .function("addWire", &BRepOffsetAPI_ThruSections::AddWire)
        .function("build", &thruSectionsBuild)
        .function("isDone", &BRepOffsetAPI_ThruSections::IsDone)
        .function("shape", &BRepOffsetAPI_ThruSections::Shape);

    // Bnd_Box - bounding box (uses wrapper for Get)
    class_<Bnd_Box>("Bnd_Box")
        .constructor<>()
        .function("isVoid", &Bnd_Box::IsVoid)
        .function("get", &bndBoxGet);

    // BRepBndLib - add shapes to bounding box (uses wrapper)
    class_<BRepBndLib>("BRepBndLib")
        .class_function("add", &brepBndLibAdd);

    // TopExp_Explorer - topology iteration
    class_<TopExp_Explorer>("TopExp_Explorer")
        .constructor<const TopoDS_Shape&, TopAbs_ShapeEnum, TopAbs_ShapeEnum>()
        .function("more", &TopExp_Explorer::More)
        .function("next", &TopExp_Explorer::Next)
        .function("current", &TopExp_Explorer::Current);

    // GeomAPI_Interpolate - curve interpolation
    class_<GeomAPI_Interpolate>("GeomAPI_Interpolate")
        .constructor<const Handle(TColgp_HArray1OfPnt)&, bool, double>()
        .function("perform", &GeomAPI_Interpolate::Perform)
        .function("isDone", &GeomAPI_Interpolate::IsDone)
        .function("curve", &GeomAPI_Interpolate::Curve);

    // Message_ProgressRange (needed for Sewing.Perform)
    class_<Message_ProgressRange>("Message_ProgressRange")
        .constructor<>();
}
