# Fixing `Standard_OStream` (`std::ostream`) bindings in OpenCascade.js

## Problem

Some OpenCascade.js bindings expose OCCT APIs that accept `Standard_OStream` / `Standard_IStream` (aka `std::ostream` / `std::istream`). At runtime, calling those methods fails with an embind error similar to:

```
Cannot call … due to unbound types: NSt3__213basic_ostreamIcNS_11char_traitsIcEEEE
```

That's expected: **C++ iostream types are not directly usable across the JS ↔ C++ boundary with embind**.

The most visible examples are:

- `BRepTools::Write` overloads taking an ostream
- `…::Dump()` / `DumpJson()` style APIs writing to an ostream
- Various exporters/importers with stream overloads

## Current upstream status

OpenCascade.js' maintainer has publicly stated that `Standard_OStream` is **currently unusable** from JS and recommends using filename overloads such as `BRepTools.Write_3` instead.

---

## Solution 1: Prefer filename overloads + Emscripten virtual FS (No build required)

This is the most reliable approach today and is **already implemented in Stepifi**.

### Text formats (BREP, STEP, IGES)

```js
function withTempPath(prefix, ext) {
  const rand = Math.random().toString(16).slice(2);
  return `/tmp/${prefix}-${rand}.${ext}`;
}

function exportBrepToString(oc, shape) {
  const path = withTempPath('shape', 'brep');
  oc.BRepTools.Write_3(shape, path, new oc.Message_ProgressRange_1());
  const content = oc.FS.readFile(path, { encoding: 'utf8' });
  oc.FS.unlink(path);
  return content;
}

function exportIgesToString(oc, shape) {
  oc.IGESControl_Controller.Init();
  const writer = new oc.IGESControl_Writer_1();
  writer.AddShape(shape, new oc.Message_ProgressRange_1());
  writer.ComputeModel();
  const path = withTempPath('shape', 'iges');
  writer.Write_2(path, new oc.Message_ProgressRange_1());
  const content = oc.FS.readFile(path, { encoding: 'utf8' });
  oc.FS.unlink(path);
  writer.delete?.();
  return content;
}
```

### Binary formats

Use `FS.readFile(path)` **without** `encoding: 'utf8'` and return the `Uint8Array`.

```js
function exportStlToBytes(oc, shape) {
  const path = withTempPath('shape', 'stl');
  oc.StlAPI.Write(shape, path);
  const bytes = oc.FS.readFile(path); // Uint8Array
  oc.FS.unlink(path);
  return bytes;
}
```

---

## Solution 2: Custom Build with OCJS_IO Wrapper Class

If you *must* capture ostream-only APIs, add wrapper methods in a custom build.

### Changes Applied to `/Users/ahmadjalil/Downloads/opencascade.js-master 3/`

#### 1. Updated `builds/opencascade.full.yml`

Added `OCJS_IO` class with string-based wrapper methods:

```yaml
additionalCppCode: |
  typedef Handle(IMeshTools_Context) Handle_IMeshTools_Context;

  class OCJS {
  public:
    static Standard_Failure* getStandard_FailureData(intptr_t exceptionPtr) {
      return reinterpret_cast<Standard_Failure*>(exceptionPtr);
    }
  };

  // String-based I/O wrappers for methods that use Standard_OStream
  #include <sstream>
  #include <string>
  #include <BRepTools.hxx>
  #include <TopoDS_Shape.hxx>
  #include <IGESControl_Writer.hxx>
  #include <IGESControl_Controller.hxx>
  #include <STEPControl_Writer.hxx>
  #include <Interface_Static.hxx>

  class OCJS_IO {
  public:
    // BRepTools::Write (ostream overload) -> std::string
    static std::string BRep_WriteToString(const TopoDS_Shape& shape) {
      std::ostringstream ss;
      BRepTools::Write(shape, ss);
      return ss.str();
    }

    // TopoDS_Shape::DumpJson -> std::string
    static std::string Shape_DumpJsonToString(const TopoDS_Shape& shape, Standard_Integer depth = -1) {
      std::ostringstream ss;
      shape.DumpJson(ss, depth);
      return ss.str();
    }

    // TopoDS_Shape::Dump -> std::string
    static std::string Shape_DumpToString(const TopoDS_Shape& shape) {
      std::ostringstream ss;
      shape.Dump(ss);
      return ss.str();
    }
  };
```

#### 2. Updated `src/filter/filterMethodOrProperties.py`

Added filter to exclude methods with ostream/istream parameters (prevents runtime crashes):

```python
# Filter out methods with Standard_OStream/Standard_IStream parameters
# These cannot be used from JS due to unbound std::ostream/std::istream types
STREAM_MARKERS = [
  'Standard_OStream', 'Standard_IStream',
  'std::ostream', 'std::istream',
  'basic_ostream', 'basic_istream',
]
try:
  for arg in methodOrProperty.get_arguments():
    spelling = arg.type.spelling
    canonical = arg.type.get_canonical().spelling
    if any(m in spelling for m in STREAM_MARKERS) or any(m in canonical for m in STREAM_MARKERS):
      return False
except Exception:
  pass  # get_arguments may not be available on all method types
```

### JS usage after custom build

```js
const brep = oc.OCJS_IO.BRep_WriteToString(shape);
const json = oc.OCJS_IO.Shape_DumpJsonToString(shape);
const dump = oc.OCJS_IO.Shape_DumpToString(shape);
```

---

## Building the Custom OpenCascade.js

### Prerequisites

- Docker installed
- ~16GB RAM available
- ~50GB disk space

### Build Steps

```bash
cd "/Users/ahmadjalil/Downloads/opencascade.js-master 3"

# Build the Docker container
./build-docker-container.sh

# Or build manually with Docker:
docker build -t opencascade.js:custom .

# Run the build (this takes a while - ~30-60 mins)
docker run --rm -v $(pwd)/builds:/opencascade.js/builds \
  -v $(pwd)/dist:/opencascade.js/dist \
  opencascade.js:custom \
  /opencascade.js/builds/opencascade.full.yml

# Output files will be in:
#   dist/opencascade.full.js
#   dist/opencascade.full.wasm
#   dist/opencascade.full.d.ts
```

### Alternative: GitHub Actions

Fork the repo and push your changes. GitHub Actions will build automatically on push.

---

## STEP "getWasmTableEntry … is not a function" crash

This is a **separate issue** from the ostream binding problem.

If it appears only for certain shapes, it often indicates an invalid indirect function call (bad function pointer / table index), which can happen from:

- Memory corruption / UB in native code paths
- Toolchain/runtime mismatch (JS glue not matching WASM)
- Rare OCCT bugs triggered by specific geometry

**Pragmatic workarounds:**
- Export to BREP (works reliably), re-import, then export STEP
- Use IGES when STEP export is unstable for a particular model

**Debugging ideas:**
- Build with assertions/debug info (`-sASSERTIONS=2 -g`) to get a clearer trace
- Ensure your bundler serves the matching `.js` + `.wasm` pair

---

## Test Checklist

- ✅ Minimal shape (box) export/import round-trip
- ✅ Real-world shape export/import (large, many faces)
- ✅ Large output sizes (multi‑MB BREP/STEP)
- ✅ No FS leaks (unlink temp files)
- ✅ No OC heap leaks (`delete()` / local GC strategy)

---

## Summary

| Solution | Build Required | Reliability | Use Case |
|----------|---------------|-------------|----------|
| Virtual FS (`Write_3`) | No | High | All exports (recommended) |
| Custom `OCJS_IO` class | Yes | High | DumpJson, Dump, etc. |
| Filter ostream methods | Yes | Medium | Prevent runtime errors |

**Recommendation:** Use Solution 1 (Virtual FS) for production. Solution 2 (custom build) is only needed for APIs that don't have filename overloads.
