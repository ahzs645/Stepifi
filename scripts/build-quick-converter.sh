#!/bin/bash
# Build the lightweight stltostp WASM module using Depot

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "Building quick converter WASM module with Depot..."

cd "$PROJECT_DIR"

# Build using Depot and extract WASM files to public/
depot build -f Dockerfile.wasm --project r1zm5tn20w --output type=local,dest=./public .

echo "Quick converter WASM build complete!"
echo "Output files:"
ls -la "$PROJECT_DIR/public/stltostp."*
