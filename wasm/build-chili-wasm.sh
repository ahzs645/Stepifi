#!/bin/bash
# Build custom chili-wasm with Stepifi extended bindings
# Prerequisites: git, cmake (>=3.30), ninja, python3, node
# Outputs: public/chili-wasm/chili-wasm.{js,wasm,d.ts}
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CHILI_SRC="$SCRIPT_DIR/chili-src"
BUILD_DIR="$CHILI_SRC/build"
OUTPUT_DIR="$PROJECT_ROOT/public/chili-wasm"

BUILD_TYPE="${1:-release}"  # "release" or "debug"

echo "=== Building chili-wasm ($BUILD_TYPE) ==="
echo "Source: $CHILI_SRC"
echo "Output: $OUTPUT_DIR"

# -------------------------------------------------------------------
# Step 1: Ensure src/ directory has the source files
# CMakeLists.txt expects sources in src/ relative to CMAKE_SOURCE_DIR
# -------------------------------------------------------------------
SRC_DIR="$CHILI_SRC/src"
mkdir -p "$SRC_DIR"

SOURCE_FILES=(
    converter.cpp factory.cpp geometry.cpp mesher.cpp opencascade.cpp
    shape.cpp shared.cpp shared.hpp stepifi-bindings.cpp transient.cpp
    utils.cpp utils.hpp
)

for f in "${SOURCE_FILES[@]}"; do
    if [ -f "$CHILI_SRC/$f" ]; then
        cp "$CHILI_SRC/$f" "$SRC_DIR/$f"
    fi
done

echo "Source files prepared in src/"

# -------------------------------------------------------------------
# Step 2: Setup dependencies (emsdk + OCCT) if not already present
# -------------------------------------------------------------------
mkdir -p "$BUILD_DIR"

EMSDK_DIR="$BUILD_DIR/emsdk"
OCCT_DIR="$BUILD_DIR/occt"

# Clone emsdk
if [ ! -d "$EMSDK_DIR" ]; then
    echo "Cloning emsdk 4.0.8..."
    git clone --depth=1 -b 4.0.8 https://github.com/emscripten-core/emsdk.git "$EMSDK_DIR"
else
    echo "emsdk already present"
fi

# Install and activate emsdk
echo "Setting up emsdk..."
"$EMSDK_DIR/emsdk" install latest
"$EMSDK_DIR/emsdk" activate --embedded latest

# Install emscripten npm deps
if [ -f "$EMSDK_DIR/upstream/emscripten/package.json" ]; then
    cd "$EMSDK_DIR/upstream/emscripten"
    npm i --no-audit --no-fund 2>/dev/null || true
    cd "$CHILI_SRC"
fi

# Fix emscripten.py --skipLibCheck (from chili3d's setup)
EMSCRIPTEN_PY="$EMSDK_DIR/upstream/emscripten/tools/emscripten.py"
if [ -f "$EMSCRIPTEN_PY" ]; then
    if grep -q "'--declaration', '--emitDeclarationOnly'" "$EMSCRIPTEN_PY" 2>/dev/null; then
        sed -i.bak "s/'--declaration', '--emitDeclarationOnly'/'--declaration', '--skipLibCheck', '--emitDeclarationOnly'/" "$EMSCRIPTEN_PY"
        echo "Fixed emscripten.py (added --skipLibCheck)"
    fi
fi

# Clone OCCT
if [ ! -d "$OCCT_DIR" ]; then
    echo "Cloning OCCT V7_9_1..."
    git clone --depth=1 -b V7_9_1 https://github.com/Open-Cascade-SAS/OCCT.git "$OCCT_DIR"
else
    echo "OCCT already present"
fi

# -------------------------------------------------------------------
# Step 3: Source emsdk environment and build
# -------------------------------------------------------------------
echo "Sourcing emsdk environment..."
source "$EMSDK_DIR/emsdk_env.sh"

cd "$CHILI_SRC"

echo "Configuring CMake ($BUILD_TYPE)..."
cmake --preset "$BUILD_TYPE"

echo "Building..."
cmake --build --preset "$BUILD_TYPE" --parallel "$(nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 4)"

# -------------------------------------------------------------------
# Step 4: Copy output to public/chili-wasm/
# -------------------------------------------------------------------
if [ "$BUILD_TYPE" = "release" ]; then
    TARGET_DIR="$BUILD_DIR/target/release"
else
    TARGET_DIR="$BUILD_DIR/target/debug"
fi

# The install target puts files in packages/wasm/lib relative to parent of CMAKE_SOURCE_DIR
# But we also check the build target directory directly
INSTALL_DIR="$SCRIPT_DIR/packages/wasm/lib"

# Find the built files
WASM_JS=""
WASM_FILE=""
WASM_DTS=""

for dir in "$INSTALL_DIR" "$TARGET_DIR"; do
    [ -f "$dir/chili-wasm.js" ] && WASM_JS="$dir/chili-wasm.js"
    [ -f "$dir/chili-wasm.wasm" ] && WASM_FILE="$dir/chili-wasm.wasm"
    [ -f "$dir/chili-wasm.d.ts" ] && WASM_DTS="$dir/chili-wasm.d.ts"
done

if [ -z "$WASM_JS" ] || [ -z "$WASM_FILE" ]; then
    echo "ERROR: Build output not found!"
    echo "Searched: $INSTALL_DIR and $TARGET_DIR"
    ls -la "$TARGET_DIR" 2>/dev/null || true
    ls -la "$INSTALL_DIR" 2>/dev/null || true
    exit 1
fi

mkdir -p "$OUTPUT_DIR"
cp "$WASM_JS" "$OUTPUT_DIR/chili-wasm.js"
cp "$WASM_FILE" "$OUTPUT_DIR/chili-wasm.wasm"
[ -n "$WASM_DTS" ] && cp "$WASM_DTS" "$OUTPUT_DIR/chili-wasm.d.ts"

echo ""
echo "=== Build complete ==="
echo "Output files:"
ls -lh "$OUTPUT_DIR"/chili-wasm.*
echo ""
echo "JS:   $(wc -c < "$OUTPUT_DIR/chili-wasm.js" | tr -d ' ') bytes"
echo "WASM: $(wc -c < "$OUTPUT_DIR/chili-wasm.wasm" | tr -d ' ') bytes"
