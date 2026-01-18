#!/usr/bin/env python3
"""
Minimal F3D analyzer - extracts and analyzes ACIS data without FreeCAD.
"""

import sys
import os
import zipfile
import struct
import json

def analyze_f3d(f3d_path):
    """Extract and analyze ACIS data from F3D file."""
    print(f"\n{'='*60}")
    print(f"Analyzing F3D file: {f3d_path}")
    print('='*60)

    if not os.path.exists(f3d_path):
        print(f"ERROR: File not found: {f3d_path}")
        return

    # Open as ZIP
    with zipfile.ZipFile(f3d_path, 'r') as zf:
        # List all files
        print("\nFiles in F3D archive:")
        for name in zf.namelist():
            info = zf.getinfo(name)
            print(f"  {name} ({info.file_size} bytes)")

        # Find and read Manifest.dat
        manifest_path = None
        for name in zf.namelist():
            if name.endswith('Manifest.dat'):
                manifest_path = name
                break

        if manifest_path:
            print(f"\nReading manifest: {manifest_path}")
            manifest_data = zf.read(manifest_path)

            # Parse manifest (simple key=value format)
            folder_breps = None
            for line in manifest_data.decode('utf-8', errors='ignore').split('\n'):
                print(f"  {line}")
                if 'folderBreps' in line:
                    # Extract the folder path
                    parts = line.split('=')
                    if len(parts) >= 2:
                        folder_breps = parts[1].strip()

        # Find ACIS binary files (SMB/SAB)
        smb_files = []
        for name in zf.namelist():
            if 'Breps' in name or name.endswith('.smb') or name.endswith('.sab'):
                smb_files.append(name)

        print(f"\nFound {len(smb_files)} potential ACIS files:")
        for smb in smb_files:
            print(f"  {smb}")

        # Analyze each ACIS file
        for smb_path in smb_files:
            analyze_acis_binary(zf.read(smb_path), smb_path)

def analyze_acis_binary(data, name):
    """Analyze ACIS binary data."""
    print(f"\n{'='*60}")
    print(f"Analyzing ACIS data: {name}")
    print('='*60)

    if len(data) < 100:
        print(f"  Too small: {len(data)} bytes")
        return

    # Check header
    header = data[:50].decode('ascii', errors='ignore')
    print(f"  Header: {header[:40]}...")

    is_binary = False
    if header.startswith('ACIS BinaryFile'):
        print("  Format: ACIS Binary (7.0)")
        is_binary = True
    elif header.startswith('ASM BinaryFile4'):
        print("  Format: ASM Binary 32-bit")
        is_binary = True
    elif header.startswith('ASM BinaryFile8'):
        print("  Format: ASM Binary 64-bit")
        is_binary = True
    elif header.startswith('acis') or header.startswith('700') or header.startswith('400'):
        print("  Format: ACIS Text (SAT)")
        is_binary = False
    else:
        print(f"  Format: Unknown")
        # Hex dump first 100 bytes
        print(f"  First 100 bytes (hex): {data[:100].hex()}")
        return

    if is_binary:
        analyze_acis_binary_format(data)
    else:
        analyze_acis_text_format(data)

def analyze_acis_binary_format(data):
    """Analyze ACIS binary format."""
    # Tag constants
    TAG_CHAR = 0x02
    TAG_SHORT = 0x03
    TAG_LONG = 0x04
    TAG_FLOAT = 0x05
    TAG_DOUBLE = 0x06
    TAG_UTF8_U8 = 0x07
    TAG_UTF8_U16 = 0x08
    TAG_UTF8_U32 = 0x09
    TAG_TRUE = 0x0A
    TAG_FALSE = 0x0B
    TAG_ENTITY_REF = 0x0C
    TAG_TERMINATOR = 0x11
    TAG_POSITION = 0x13
    TAG_VECTOR_3D = 0x14
    TAG_VECTOR_2D = 0x16

    # Find header end (look for newlines)
    header_end = 0
    for i in range(min(1000, len(data))):
        if data[i:i+1] == b'\n':
            header_end = i + 1
            # Count newlines to find end of text header
            if data[i+1:i+2] != b'\n' and not data[i+1:i+2].isalnum():
                break

    print(f"  Header ends at: {header_end}")

    # Parse binary data after header
    offset = header_end
    while offset < min(header_end + 200, len(data)):
        if offset >= len(data):
            break
        print(f"  Byte {offset}: 0x{data[offset]:02x}")
        offset += 1

    # Look for position data (tag 0x13)
    positions_found = []
    for i in range(len(data) - 25):
        if data[i] == TAG_POSITION:
            # Try to read 3 doubles
            try:
                x = struct.unpack_from('<d', data, i+1)[0]
                y = struct.unpack_from('<d', data, i+9)[0]
                z = struct.unpack_from('<d', data, i+17)[0]
                # Check if values are reasonable
                if abs(x) < 1e10 and abs(y) < 1e10 and abs(z) < 1e10:
                    positions_found.append((x, y, z))
                    if len(positions_found) <= 10:
                        print(f"  Position at {i}: ({x:.6f}, {y:.6f}, {z:.6f})")
            except:
                pass

    print(f"\n  Found {len(positions_found)} valid positions")
    if positions_found:
        # Calculate bounding box
        min_x = min(p[0] for p in positions_found)
        max_x = max(p[0] for p in positions_found)
        min_y = min(p[1] for p in positions_found)
        max_y = max(p[1] for p in positions_found)
        min_z = min(p[2] for p in positions_found)
        max_z = max(p[2] for p in positions_found)
        print(f"\n  Bounding box:")
        print(f"    X: {min_x:.6f} to {max_x:.6f} (size: {max_x - min_x:.6f})")
        print(f"    Y: {min_y:.6f} to {max_y:.6f} (size: {max_y - min_y:.6f})")
        print(f"    Z: {min_z:.6f} to {max_z:.6f} (size: {max_z - min_z:.6f})")

def analyze_acis_text_format(data):
    """Analyze ACIS text (SAT) format."""
    text = data.decode('utf-8', errors='ignore')
    lines = text.split('\n')

    print(f"  Total lines: {len(lines)}")
    print(f"\n  First 20 lines:")
    for i, line in enumerate(lines[:20]):
        print(f"    {i}: {line[:80]}")

    # Look for vertex/point data
    print(f"\n  Looking for vertices...")
    vertex_positions = []
    for line in lines:
        if 'point' in line or 'vertex' in line:
            # Try to extract coordinates
            parts = line.split()
            floats = []
            for part in parts:
                try:
                    val = float(part)
                    floats.append(val)
                except:
                    pass
            if len(floats) >= 3:
                # Take the last 3 floats as coordinates
                pos = tuple(floats[-3:])
                if all(abs(v) < 1e10 for v in pos):
                    vertex_positions.append(pos)
                    if len(vertex_positions) <= 5:
                        print(f"    Position: {pos}")

    print(f"\n  Found {len(vertex_positions)} vertices with valid coordinates")
    if vertex_positions:
        min_x = min(p[0] for p in vertex_positions)
        max_x = max(p[0] for p in vertex_positions)
        min_y = min(p[1] for p in vertex_positions)
        max_y = max(p[1] for p in vertex_positions)
        min_z = min(p[2] for p in vertex_positions)
        max_z = max(p[2] for p in vertex_positions)
        print(f"\n  Bounding box:")
        print(f"    X: {min_x:.6f} to {max_x:.6f} (size: {max_x - min_x:.6f})")
        print(f"    Y: {min_y:.6f} to {max_y:.6f} (size: {max_y - min_y:.6f})")
        print(f"    Z: {min_z:.6f} to {max_z:.6f} (size: {max_z - min_z:.6f})")

if __name__ == '__main__':
    if len(sys.argv) > 1:
        f3d_file = sys.argv[1]
    else:
        # Default
        f3d_file = '/Users/ahmadjalil/github/Stepifi/slzb-06-wall-mount.f3d'

    analyze_f3d(f3d_file)
