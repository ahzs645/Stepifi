# OpenCascade.js Bytes-Based I/O Patch

This document describes how to add bytes-based I/O functions to OpenCascade.js to bypass the ostream binding limitation.

## The Problem

OpenCascade.js cannot use `std::ostream`-based methods because Emscripten's embind doesn't support the `Standard_OStream` type. Methods like:
- `STEPControl_Writer::WriteStream(ostream&)`
- `BRepTools::Write(shape, ostream&)`
- `IGESControl_Writer::Write(ostream&)`

All fail with: `"Cannot call ... due to unbound types: NSt3__213basic_ostreamIcNS_11char_traitsIcEEEE"`

## The Solution

Add C++ wrapper functions that use `std::ostringstream` internally and return byte arrays (via Emscripten's `emscripten::val`).

## Implementation

### 1. Create a new file: `src/bytes_io.cpp`

```cpp
#include <sstream>
#include <emscripten/bind.h>
#include <emscripten/val.h>

#include <BRepTools.hxx>
#include <BRep_Builder.hxx>
#include <STEPControl_Writer.hxx>
#include <STEPControl_Reader.hxx>
#include <IGESControl_Writer.hxx>
#include <IGESControl_Controller.hxx>
#include <TopoDS_Shape.hxx>

using namespace emscripten;

// Convert string to JavaScript Uint8Array
val stringToUint8Array(const std::string& str) {
    return val(typed_memory_view(str.size(), reinterpret_cast<const uint8_t*>(str.data()))).call<val>("slice");
}

// Write shape to BREP bytes
val writeBrepToBytes(const TopoDS_Shape& shape) {
    std::ostringstream stream;
    BRepTools::Write(shape, stream);
    return stringToUint8Array(stream.str());
}

// Write STEP to bytes (call after Transfer)
val writeStepToBytes(STEPControl_Writer& writer) {
    std::ostringstream stream;
    writer.WriteStream(stream);
    return stringToUint8Array(stream.str());
}

// Write IGES to bytes (call after AddShape + ComputeModel)
val writeIgesToBytes(IGESControl_Writer& writer) {
    std::ostringstream stream;
    writer.Write(stream);
    return stringToUint8Array(stream.str());
}

// Read BREP from bytes
TopoDS_Shape readBrepFromBytes(const std::string& data) {
    TopoDS_Shape shape;
    std::istringstream stream(data);
    BRep_Builder builder;
    BRepTools::Read(shape, stream, builder);
    return shape;
}

// Read STEP from bytes
TopoDS_Shape readStepFromBytes(const std::string& data) {
    // Write to temp virtual file (required by STEP reader API)
    std::string tempPath = "/tmp_step_input.step";

    // Use Emscripten FS to write bytes
    EM_ASM({
        FS.writeFile(UTF8ToString($0), new Uint8Array(HEAPU8.buffer, $1, $2));
    }, tempPath.c_str(), data.data(), data.size());

    STEPControl_Reader reader;
    reader.ReadFile(tempPath.c_str());
    reader.TransferRoots();

    TopoDS_Shape shape = reader.OneShape();

    // Cleanup
    EM_ASM({ FS.unlink(UTF8ToString($0)); }, tempPath.c_str());

    return shape;
}

EMSCRIPTEN_BINDINGS(bytes_io) {
    function("writeBrepToBytes", &writeBrepToBytes);
    function("writeStepToBytes", &writeStepToBytes);
    function("writeIgesToBytes", &writeIgesToBytes);
    function("readBrepFromBytes", &readBrepFromBytes);
    function("readStepFromBytes", &readStepFromBytes);
}
```

### 2. Update CMakeLists.txt

Add `src/bytes_io.cpp` to the build.

### 3. Usage in JavaScript

```javascript
// After processing shape...

// BREP export (simplest)
const brepBytes = oc.writeBrepToBytes(shape);
// brepBytes is a Uint8Array

// STEP export
const writer = new oc.STEPControl_Writer_1();
writer.Transfer(shape, oc.STEPControl_StepModelType.STEPControl_AsIs, true, new oc.Message_ProgressRange_1());
const stepBytes = oc.writeStepToBytes(writer);
// stepBytes is a Uint8Array

// IGES export
oc.IGESControl_Controller.Init();
const igesWriter = new oc.IGESControl_Writer_1();
igesWriter.AddShape(shape, new oc.Message_ProgressRange_1());
igesWriter.ComputeModel();
const igesBytes = oc.writeIgesToBytes(igesWriter);
// igesBytes is a Uint8Array

// BREP import
const shape = oc.readBrepFromBytes(brepData);

// STEP import
const shape = oc.readStepFromBytes(stepData);
```

## Benefits

1. **No virtual FS needed** - Direct bytes in/out
2. **Cleaner code** - No temp file management
3. **Better memory efficiency** - No extra file copies
4. **Works with Web APIs** - Uint8Array integrates with fetch, Blob, etc.

## Alternative: Fork opencascade.js

If upstream doesn't accept the patch, fork the repo and add these functions:
1. Clone https://github.com/nickmitchko/opencascade.js (or official repo)
2. Add the `bytes_io.cpp` file
3. Rebuild with: `docker run -it nickmitchko/opencascade.js`
4. Use your custom build in `/public/opencascade/`

## Reference Implementation

See `opencascade-rs` for a working Rust/C++ implementation:
- `crates/opencascade-sys/include/wrapper.hxx` - C++ wrapper functions
- `crates/opencascade/src/primitives/shape.rs` - High-level API
