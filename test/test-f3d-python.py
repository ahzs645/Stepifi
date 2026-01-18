#!/usr/bin/env python3
"""
Test script to parse F3D files using Python InventorLoader
and dump ACIS data for comparison with JavaScript implementation.
"""

import sys
import os
import json

# Add InventorLoader to path
INVENTOR_LOADER_PATH = '/Users/ahmadjalil/Downloads/InventorLoader-master'
sys.path.insert(0, INVENTOR_LOADER_PATH)

# Set up a dump folder for output
os.makedirs('/Users/ahmadjalil/github/Stepifi/test/f3d-dump', exist_ok=True)
os.environ['DUMP_FOLDER'] = '/Users/ahmadjalil/github/Stepifi/test/f3d-dump'

def test_f3d_file(f3d_path):
    """Parse an F3D file and dump ACIS data."""
    print(f"\n{'='*60}")
    print(f"Testing F3D file: {f3d_path}")
    print('='*60)

    if not os.path.exists(f3d_path):
        print(f"ERROR: File not found: {f3d_path}")
        return

    try:
        # Import InventorLoader modules
        from importerF3D import read, smb_files
        from importerSAT import dumpSat
        import Acis

        # Initialize ACIS
        Acis.init()

        # Read the F3D file
        print(f"\nReading F3D file...")
        result = read(f3d_path)
        print(f"Read result: {result}")

        # Check what ACIS data was found
        print(f"\nFound {len(smb_files)} SMB (ACIS) files in F3D")

        for i, acis_reader in enumerate(smb_files):
            print(f"\n--- ACIS Reader {i} ---")
            print(f"  Version: {acis_reader.version}")

            # Get records
            records = acis_reader.getRecords()
            print(f"  Records: {len(records)}")

            # Count entity types
            entity_types = {}
            for record in records:
                if hasattr(record, 'chunks') and record.chunks:
                    entity_type = record.chunks[0].val if record.chunks else 'unknown'
                    entity_types[entity_type] = entity_types.get(entity_type, 0) + 1

            print(f"  Entity types:")
            for etype, count in sorted(entity_types.items()):
                print(f"    {etype}: {count}")

            # Look for geometry stats
            body_count = entity_types.get('body', 0)
            face_count = entity_types.get('face', 0)
            edge_count = entity_types.get('edge', 0)
            vertex_count = entity_types.get('vertex', 0)

            print(f"\n  Geometry summary:")
            print(f"    Bodies: {body_count}")
            print(f"    Faces: {face_count}")
            print(f"    Edges: {edge_count}")
            print(f"    Vertices: {vertex_count}")

            # Dump to SAT file for inspection
            base_name = os.path.basename(f3d_path).replace('.f3d', '')
            sat_name = f"{base_name}_acis_{i}"
            print(f"\n  Dumping to SAT: {sat_name}.sat")
            dumpSat(sat_name, acis_reader)

            # Also analyze some records to check values
            print(f"\n  Sample vertex positions:")
            vertex_samples = 0
            for record in records:
                if hasattr(record, 'chunks') and record.chunks:
                    if record.chunks[0].val == 'vertex':
                        # Look for position data
                        for chunk in record.chunks:
                            if hasattr(chunk, 'tag') and hasattr(chunk, 'val'):
                                if isinstance(chunk.val, (list, tuple)) and len(chunk.val) == 3:
                                    x, y, z = chunk.val
                                    print(f"    Vertex: ({x:.6f}, {y:.6f}, {z:.6f})")
                                    vertex_samples += 1
                                    if vertex_samples >= 5:
                                        break
                if vertex_samples >= 5:
                    break

    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()

def analyze_sat_file(sat_path):
    """Analyze a dumped SAT file for coordinate values."""
    print(f"\n{'='*60}")
    print(f"Analyzing SAT file: {sat_path}")
    print('='*60)

    if not os.path.exists(sat_path):
        print(f"ERROR: File not found: {sat_path}")
        return

    with open(sat_path, 'r') as f:
        lines = f.readlines()

    # Find vertex lines and extract coordinates
    print("\nSample vertex coordinates:")
    vertex_count = 0
    for line in lines:
        if line.strip().startswith('vertex'):
            # Parse vertex line
            parts = line.strip().split()
            # Look for position values (usually after 'vertex $-1 $-1 $ref position')
            print(f"  {line.strip()[:100]}...")
            vertex_count += 1
            if vertex_count >= 10:
                break

    # Look for any extreme values
    print("\nChecking for extreme values (>1e10 or <-1e10):")
    extreme_count = 0
    for line in lines:
        # Try to find floating point numbers
        parts = line.split()
        for part in parts:
            try:
                val = float(part)
                if abs(val) > 1e10 and abs(val) != float('inf'):
                    print(f"  Found extreme value: {val} in line: {line.strip()[:80]}...")
                    extreme_count += 1
                    if extreme_count >= 10:
                        break
            except ValueError:
                pass
        if extreme_count >= 10:
            break

    if extreme_count == 0:
        print("  No extreme values found - coordinates look reasonable")

if __name__ == '__main__':
    # Get F3D file from command line or use default
    if len(sys.argv) > 1:
        f3d_file = sys.argv[1]
    else:
        # Try to find an F3D file in the project
        possible_paths = [
            '/Users/ahmadjalil/github/Stepifi/public/slzb-06-wall-mount.f3d',
            '/Users/ahmadjalil/github/Stepifi/test/slzb-06-wall-mount.f3d',
        ]
        f3d_file = None
        for path in possible_paths:
            if os.path.exists(path):
                f3d_file = path
                break

        if not f3d_file:
            print("Usage: python test-f3d-python.py <path-to-f3d-file>")
            print("\nNo F3D file found in default locations.")
            sys.exit(1)

    # Test the F3D file
    test_f3d_file(f3d_file)

    # Analyze the output SAT file
    dump_folder = '/Users/ahmadjalil/github/Stepifi/test/f3d-dump'
    sat_files = [f for f in os.listdir(dump_folder) if f.endswith('.sat')]
    for sat_file in sat_files:
        analyze_sat_file(os.path.join(dump_folder, sat_file))
