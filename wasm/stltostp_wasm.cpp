/*
 * WebAssembly wrapper for stltostp
 * Original code Copyright(c) 2018, slugdev (BSD License)
 * WASM bindings added for browser use
 */

#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <cstdint>
#include <vector>
#include <string>
#include <sstream>
#include <cstring>

// Include the StepKernel implementation
#include "StepKernel.h"
#include "StepKernel.cpp"

// Parse binary STL from raw bytes
std::vector<double> parse_stl_binary(const uint8_t* data, size_t size) {
    std::vector<double> nodes;

    if (size < 84) { // 80 byte header + 4 byte triangle count
        return nodes;
    }

    // Skip 80-byte header
    const uint8_t* ptr = data + 80;

    // Read triangle count
    uint32_t tris = 0;
    std::memcpy(&tris, ptr, sizeof(uint32_t));
    ptr += sizeof(uint32_t);

    // Each triangle: 12 floats (normal + 3 vertices) + 2 byte attribute
    size_t expected_size = 84 + tris * 50;
    if (size < expected_size) {
        return nodes;
    }

    nodes.resize(static_cast<size_t>(tris) * 9);

    for (uint32_t i = 0; i < tris; i++) {
        // Skip normal (3 floats)
        ptr += sizeof(float) * 3;

        // Read 3 vertices (9 floats)
        float pts[9];
        std::memcpy(pts, ptr, sizeof(float) * 9);
        ptr += sizeof(float) * 9;

        // Skip attribute byte count
        ptr += sizeof(uint16_t);

        for (int j = 0; j < 9; j++) {
            nodes[i * 9 + j] = pts[j];
        }
    }

    return nodes;
}

// Parse ASCII STL from string
std::vector<double> parse_stl_ascii(const std::string& content) {
    std::vector<double> nodes;
    std::istringstream iss(content);
    std::string line;

    while (std::getline(iss, line)) {
        std::istringstream line_stream(line);
        std::string vert;
        double x, y, z;
        if ((line_stream >> vert >> x >> y >> z) && vert == "vertex") {
            nodes.push_back(x);
            nodes.push_back(y);
            nodes.push_back(z);
        }
    }

    return nodes;
}

// Detect if STL is binary or ASCII and parse accordingly
std::vector<double> parse_stl(const uint8_t* data, size_t size) {
    if (size < 15) {
        return std::vector<double>();
    }

    // Check if starts with "solid" (ASCII STL)
    if (data[0] == 's' && data[1] == 'o' && data[2] == 'l' &&
        data[3] == 'i' && data[4] == 'd') {
        // Likely ASCII - convert to string and parse
        std::string content(reinterpret_cast<const char*>(data), size);
        auto nodes = parse_stl_ascii(content);
        // If we got vertices, it's ASCII; otherwise try binary
        if (!nodes.empty()) {
            return nodes;
        }
    }

    // Binary STL
    return parse_stl_binary(data, size);
}

// Result structure for conversion
struct ConversionResult {
    bool success;
    std::string data;
    std::string error;
    int triangleCount;
    int mergedEdges;
};

// Main conversion function exposed to JavaScript
ConversionResult convertSTLtoSTEP(
    const std::string& stlData,
    double tolerance,
    const std::string& units,
    const std::string& schema
) {
    ConversionResult result;
    result.success = false;
    result.triangleCount = 0;
    result.mergedEdges = 0;

    // Parse STL data
    const uint8_t* data = reinterpret_cast<const uint8_t*>(stlData.data());
    size_t size = stlData.size();

    std::vector<double> nodes = parse_stl(data, size);

    if (nodes.empty() || nodes.size() / 9 == 0) {
        result.error = "No triangles found in STL data";
        return result;
    }

    result.triangleCount = static_cast<int>(nodes.size() / 9);

    // Build STEP model
    StepKernel kernel;
    int merged_edge_cnt = 0;
    kernel.build_tri_body(nodes, tolerance, merged_edge_cnt);
    result.mergedEdges = merged_edge_cnt;

    // Write STEP to string stream
    std::ostringstream output;

    // We need to modify write_step to write to a stream instead of file
    // For now, let's create a custom write function

    std::time_t tt = std::chrono::system_clock::to_time_t(std::chrono::system_clock::now());
    struct std::tm* ptm = std::localtime(&tt);
    std::stringstream iso_time;
    iso_time << std::put_time(ptm, "%FT%T");

    output << std::fixed << std::setprecision(15);

    // Normalize unit
    std::string u = units;
    for (auto& c : u) c = static_cast<char>(std::tolower(static_cast<unsigned char>(c)));
    std::string step_unit_label = "MILLIMETRE";
    double unit_scale = 0.001;

    if (u == "mm" || u == "millimetre" || u == "millimeter") {
        step_unit_label = "MILLIMETRE";
        unit_scale = 0.001;
    } else if (u == "cm" || u == "centimetre" || u == "centimeter") {
        step_unit_label = "CENTIMETRE";
        unit_scale = 0.01;
    } else if (u == "m" || u == "metre" || u == "meter") {
        step_unit_label = "METRE";
        unit_scale = 1.0;
    } else if (u == "in" || u == "inch" || u == "inches") {
        step_unit_label = "INCH";
        unit_scale = 0.0254;
    }

    std::string s = schema;
    for (auto& c : s) c = static_cast<char>(std::tolower(static_cast<unsigned char>(c)));

    // Header
    output << "ISO-10303-21;\n";
    output << "HEADER;\n";
    output << "FILE_DESCRIPTION(('Configuration controlled 3D design of mechanical parts and assemblies'),'2;1');\n";
    output << "FILE_NAME('converted.stp','" << iso_time.str() << "',('stltostp-web'),('web'),'StepKernel by stltostp','stltostp-web v1.0',' ');\n";

    if (s == "214" || s == "ap214") {
        output << "FILE_SCHEMA(('AP214IS'),'3');\n";
    } else {
        output << "FILE_SCHEMA(('AP203'),'2');\n";
    }
    output << "ENDSEC;\n";

    // Data section
    output << "DATA;\n";

    int next_id = static_cast<int>(kernel.entities.size()) + 1;

    for (auto e : kernel.entities) {
        e->serialize(output);
    }

    int manifold_shape_id = static_cast<int>(kernel.entities.size());

    output << "#" << next_id << " = UNIT_ASSIGNMENT((#" << (next_id + 1) << "));\n";
    next_id++;
    output << "#" << next_id << " = LENGTH_UNIT('" << step_unit_label << "'," << unit_scale << ");\n";
    next_id++;

    if (s == "214" || s == "ap214") {
        output << "#" << next_id << " = GEOMETRIC_REPRESENTATION_CONTEXT('2D',#" << (next_id + 1) << ",#" << (next_id + 2) << ");\n";
        next_id++;
        output << "#" << next_id << " = PARAMETRIC_REPRESENTATION_CONTEXT('3D',#" << (next_id + 1) << ");\n";
        next_id++;
        output << "#" << next_id << " = REPRESENTATION_CONTEXT('3D','3D Space');\n";
        next_id++;

        int placement_id = next_id;
        output << "#" << next_id << " = AXIS2_PLACEMENT_3D('Global Origin',#" << (next_id + 1) << ",#" << (next_id + 2) << ",#" << (next_id + 3) << ");\n";
        next_id++;
        output << "#" << next_id << " = CARTESIAN_POINT('Origin',(0.0,0.0,0.0));\n";
        next_id++;
        output << "#" << next_id << " = DIRECTION('Z',(0.0,0.0,1.0));\n";
        next_id++;
        output << "#" << next_id << " = DIRECTION('X',(1.0,0.0,0.0));\n";
        next_id++;

        int prod_def_shape_id = next_id;
        output << "#" << next_id << " = PRODUCT_DEFINITION_SHAPE('Converted Mesh',' ',#" << (next_id + 1) << ");\n";
        next_id++;
        output << "#" << next_id << " = SHAPE_DEFINITION_REPRESENTATION(#" << prod_def_shape_id << ",#" << (next_id + 1) << ");\n";
        next_id++;
        output << "#" << next_id << " = REPRESENTATION('Mesh Representation',(#" << manifold_shape_id << "),#" << (next_id - 5) << ");\n";
        next_id++;

        int product_id = next_id;
        output << "#" << next_id << " = PRODUCT('Converted Mesh Part','Converted Mesh Part','STL Converted Part',( ));\n";
        next_id++;
        output << "#" << next_id << " = PRODUCT_DEFINITION_CONTEXT('3D Mechanical Parts',#" << (next_id + 1) << "'part definition');\n";
        next_id++;
        output << "#" << next_id << " = APPLICATION_CONTEXT('3D mechanical design');\n";
        next_id++;
        output << "#" << next_id << " = PRODUCT_DEFINITION('design','',#" << product_id << ",#" << (next_id - 2) << ");\n";
        next_id++;
        output << "#" << next_id << " = PRODUCT_DEFINITION_FORMATION_WITH_SPECIFIED_SOURCE(' ','',#" << (next_id - 1) << ",.MADE_FROM.);\n";
    }

    output << "ENDSEC;\n";
    output << "END-ISO-10303-21;\n";

    result.data = output.str();
    result.success = true;

    return result;
}

// Embind bindings
EMSCRIPTEN_BINDINGS(stltostp) {
    emscripten::value_object<ConversionResult>("ConversionResult")
        .field("success", &ConversionResult::success)
        .field("data", &ConversionResult::data)
        .field("error", &ConversionResult::error)
        .field("triangleCount", &ConversionResult::triangleCount)
        .field("mergedEdges", &ConversionResult::mergedEdges);

    emscripten::function("convertSTLtoSTEP", &convertSTLtoSTEP);
}
