#!/usr/bin/env node
/**
 * Simple test server to run F3D conversion test in browser
 */

import { createServer } from 'http'
import { readFileSync, existsSync } from 'fs'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT = 3333

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.wasm': 'application/wasm',
  '.f3d': 'application/octet-stream',
}

// Create test HTML page
const testHtml = `<!DOCTYPE html>
<html>
<head>
  <title>F3D Conversion Test</title>
  <style>
    body { font-family: monospace; padding: 20px; background: #1a1a2e; color: #eee; }
    #log { white-space: pre-wrap; background: #16213e; padding: 15px; border-radius: 5px; max-height: 70vh; overflow-y: auto; }
    .error { color: #ff6b6b; }
    .success { color: #51cf66; }
    .info { color: #74c0fc; }
    button { margin: 10px 5px; padding: 10px 20px; font-size: 14px; cursor: pointer; }
  </style>
</head>
<body>
  <h2>F3D to STEP Conversion Test</h2>
  <button onclick="runTest()">Run F3D Conversion Test</button>
  <button onclick="clearLog()">Clear Log</button>
  <div id="log"></div>

  <script>
    const logEl = document.getElementById('log');

    function log(msg, type = '') {
      const span = document.createElement('span');
      span.className = type;
      span.textContent = msg + '\\n';
      logEl.appendChild(span);
      logEl.scrollTop = logEl.scrollHeight;
      console.log(msg);
    }

    function clearLog() {
      logEl.innerHTML = '';
    }

    async function runTest() {
      clearLog();
      log('Starting F3D conversion test...', 'info');

      try {
        // Load ACIS bundle
        log('Loading ACIS parser bundle...');
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = '/acis-bundle.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
        log('ACIS parser loaded', 'success');

        // Load OpenCascade.js
        log('Loading OpenCascade.js (this may take a moment)...');
        const ocResponse = await fetch('/opencascade/opencascade.full.js');
        let ocScript = await ocResponse.text();
        ocScript = ocScript.replace(/export\\s*\\{[^}]*\\}\\s*;?\\s*$/m, '');
        ocScript = ocScript.replace(/export\\s+default\\s+\\w+\\s*;?\\s*$/m, '');

        const blob = new Blob([ocScript], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = url;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
        log('OpenCascade.js script loaded', 'success');

        // Initialize OpenCascade
        log('Initializing OpenCascade WASM...');
        const oc = await opencascade({
          locateFile: (path) => '/opencascade/' + path
        });
        log('OpenCascade initialized', 'success');

        // Load F3D file
        log('Loading F3D file...');
        const f3dResponse = await fetch('/slzb-06-wall-mount.f3d');
        const f3dData = await f3dResponse.arrayBuffer();
        log('F3D file loaded: ' + f3dData.byteLength + ' bytes', 'success');

        // Load JSZip
        log('Loading JSZip...');
        const JSZip = (await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm')).default;
        log('JSZip loaded', 'success');

        // Parse F3D
        log('Parsing F3D file...');
        const loadJSZip = async () => JSZip;
        const bodies = await ACISParser.parseF3D(f3dData, loadJSZip);
        log('Found ' + bodies.length + ' bodies', 'success');

        // Convert to OpenCascade
        log('Converting ACIS geometry to OpenCascade...');
        const startTime = performance.now();

        const shape = ACISGeometry.convertACISBodiesToShape(oc, bodies);

        const convTime = performance.now() - startTime;
        log('Conversion took ' + convTime.toFixed(0) + 'ms', 'info');

        if (!shape) {
          throw new Error('Failed to convert geometry');
        }
        log('Geometry converted successfully', 'success');

        // Analyze bounding box
        log('Analyzing bounding box...');
        const bndBox = new oc.Bnd_Box_1();
        oc.BRepBndLib.Add(shape, bndBox, false);

        if (!bndBox.IsVoid()) {
          const xMin = { current: 0 }, yMin = { current: 0 }, zMin = { current: 0 };
          const xMax = { current: 0 }, yMax = { current: 0 }, zMax = { current: 0 };
          bndBox.Get(xMin, yMin, zMin, xMax, yMax, zMax);

          const sizeX = xMax.current - xMin.current;
          const sizeY = yMax.current - yMin.current;
          const sizeZ = zMax.current - zMin.current;

          log('Bounding box:', 'info');
          log('  Min: (' + xMin.current.toFixed(2) + ', ' + yMin.current.toFixed(2) + ', ' + zMin.current.toFixed(2) + ')');
          log('  Max: (' + xMax.current.toFixed(2) + ', ' + yMax.current.toFixed(2) + ', ' + zMax.current.toFixed(2) + ')');
          log('  Size: ' + sizeX.toFixed(2) + ' x ' + sizeY.toFixed(2) + ' x ' + sizeZ.toFixed(2));

          if (sizeX > 1e10 || sizeY > 1e10 || sizeZ > 1e10) {
            log('WARNING: Bounding box has extreme values!', 'error');
          } else {
            log('Bounding box looks valid!', 'success');
          }
        }

        // Count faces
        log('Counting faces...');
        let faceCount = 0;
        const faceExplorer = new oc.TopExp_Explorer_2(
          shape,
          oc.TopAbs_ShapeEnum.TopAbs_FACE,
          oc.TopAbs_ShapeEnum.TopAbs_SHAPE
        );
        while (faceExplorer.More()) {
          faceCount++;
          faceExplorer.Next();
        }
        log('Total faces in shape: ' + faceCount, 'info');

        log('\\n=== TEST COMPLETE ===', 'success');

      } catch (e) {
        log('ERROR: ' + e.message, 'error');
        log(e.stack, 'error');
      }
    }
  </script>
</body>
</html>`;

const server = createServer((req, res) => {
  let filePath = req.url === '/' ? '/test.html' : req.url

  // Handle special test page
  if (filePath === '/test.html') {
    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    })
    res.end(testHtml)
    return
  }

  // Serve static files from public directory
  const fullPath = join(__dirname, 'public', filePath)

  if (!existsSync(fullPath)) {
    // Try root directory for F3D file
    const rootPath = join(__dirname, filePath)
    if (existsSync(rootPath)) {
      const ext = extname(rootPath)
      const mimeType = MIME_TYPES[ext] || 'application/octet-stream'

      res.writeHead(200, {
        'Content-Type': mimeType,
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp'
      })
      res.end(readFileSync(rootPath))
      return
    }

    res.writeHead(404)
    res.end('Not found: ' + filePath)
    return
  }

  const ext = extname(fullPath)
  const mimeType = MIME_TYPES[ext] || 'application/octet-stream'

  res.writeHead(200, {
    'Content-Type': mimeType,
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp'
  })
  res.end(readFileSync(fullPath))
})

server.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`)
  console.log(`Open http://localhost:${PORT}/test.html in your browser`)
  console.log('Press Ctrl+C to stop')
})
