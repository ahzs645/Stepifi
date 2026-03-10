#!/usr/bin/env node
/**
 * Build script for converter.worker.js
 * Bundles all converter-js modules into a single IIFE for web worker use
 *
 * Supports two backends:
 * - 'chili' (default): chili3d's OCCT 7.9.1 WASM build (15MB, faster, cleaner API)
 * - 'legacy': opencascade.js v2.0.0-beta (48MB, more repair features)
 *
 * Usage: node scripts/build-converter-bundle.mjs [--backend=chili|legacy]
 */

import { readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CONVERTER_JS_DIR = join(__dirname, '../public/converter-js')
const OUTPUT_FILE = join(__dirname, '../public/converter.worker.js')

// Parse --backend flag
const args = process.argv.slice(2)
const backendArg = args.find(a => a.startsWith('--backend='))
const backend = backendArg ? backendArg.split('=')[1] : 'chili'

// Files to bundle in dependency order (backend-specific)
const CHILI_FILES = [
  'config.js',
  'mesh-utils.js',
  'mesh-analysis.js',
  'mesh-repair.js',
  'format-parsers.js',
  'chili-init.js',
  'chili-io.js',
  'chili-repair.js',
  'chili-geometry-bridge.js',
  'chili-worker.js'
]

const LEGACY_FILES = [
  'config.js',
  'mesh-utils.js',
  'mesh-analysis.js',
  'mesh-repair.js',
  'format-parsers.js',
  'oc-init.js',
  'oc-io.js',
  'oc-repair.js',
  'worker.js'
]

const FILES = backend === 'legacy' ? LEGACY_FILES : CHILI_FILES
const WORKER_FILE = backend === 'legacy' ? 'worker.js' : 'chili-worker.js'

function stripImports(code) {
  // Remove import statements
  return code.replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, '')
             .replace(/^import\s+\{[\s\S]*?\}\s+from\s+['"].*?['"];?\s*$/gm, '')
             .replace(/^import\s+\*\s+as\s+\w+\s+from\s+['"].*?['"];?\s*$/gm, '')
}

function stripExports(code) {
  // Convert "export async function" to just "async function"
  code = code.replace(/^export\s+async\s+function\s+/gm, 'async function ')
  // Convert "export function" to just "function"
  code = code.replace(/^export\s+function\s+/gm, 'function ')
  // Convert "export class" to just "class"
  code = code.replace(/^export\s+class\s+/gm, 'class ')
  // Convert "export const" to just "const"
  code = code.replace(/^export\s+const\s+/gm, 'const ')
  // Convert "export let" to just "let"
  code = code.replace(/^export\s+let\s+/gm, 'let ')
  // Remove "export { ... }" statements (single or multi-line)
  code = code.replace(/^export\s+\{[\s\S]*?\}\s*;?\s*$/gm, '')
  // Remove "export default { ... }" multi-line objects
  code = code.replace(/^export\s+default\s+\{[\s\S]*?\n\}\s*$/gm, '')
  // Remove "export default" single line statements
  code = code.replace(/^export\s+default\s+[^{].*$/gm, '')
  // Remove standalone "export *" statements
  code = code.replace(/^export\s+\*\s+from\s+['"].*?['"];?\s*$/gm, '')
  return code
}

function processFile(filename) {
  const filepath = join(CONVERTER_JS_DIR, filename)
  let code = readFileSync(filepath, 'utf-8')

  // Strip imports and exports
  code = stripImports(code)
  code = stripExports(code)

  // Add section header
  const header = `\n// ============================================================================\n// ${filename}\n// ============================================================================\n\n`

  return header + code
}

function buildBundle() {
  console.log(`Building converter.worker.js (${backend} backend) from converter-js/ modules...`)

  const backendLabel = backend === 'legacy'
    ? 'OpenCascade.js v2 (legacy)'
    : 'chili-wasm OCCT 7.9.1'

  let bundle = `/**
 * Web Worker for ${backendLabel} STL/3MF to STEP/STL conversion
 * Auto-generated from converter-js modules
 * Generated: ${new Date().toISOString()}
 * Backend: ${backend}
 *
 * Features: mesh repair, face merging, multi-mesh support, tolerance control,
 *           large mesh optimization, JavaScript mesh repairs
 */

// Auto-detect base path from worker's own URL (works on GitHub Pages, subdomains, etc.)
const WORKER_BASE_PATH = (() => {
  const url = self.location.href
  // Remove the worker filename to get the base directory
  return url.substring(0, url.lastIndexOf('/') + 1)
})()

// Load ACIS parser bundle (includes parser + geometry conversion)
try {
  importScripts(WORKER_BASE_PATH + 'acis-bundle.js')
} catch (e) {
  // ACIS module is optional - F3D support will be disabled
  console.log('ACIS module not loaded (F3D support disabled):', e.message)
}

let ${backend === 'legacy' ? 'ocInstance' : 'wasmInstance'} = null

`

  // Process each file (except worker entry which needs special handling)
  for (const file of FILES) {
    if (file === WORKER_FILE) continue
    console.log(`  Processing ${file}...`)
    bundle += processFile(file)
  }

  // Process worker entry and remove redundant declarations
  console.log(`  Processing ${WORKER_FILE}...`)
  let workerCode = readFileSync(join(CONVERTER_JS_DIR, WORKER_FILE), 'utf-8')
  workerCode = stripImports(workerCode)
  workerCode = stripExports(workerCode)

  // Remove duplicate WORKER_BASE_PATH and instance declarations from worker
  workerCode = workerCode.replace(/\/\/ Worker base path detection[\s\S]*?let (?:ocInstance|wasmInstance) = null\s*/m, '')
  // Remove duplicate ACIS loading
  workerCode = workerCode.replace(/\/\/ Load ACIS parser bundle[\s\S]*?console\.log\('ACIS module not loaded[\s\S]*?\}\s*/m, '')

  bundle += `\n// ============================================================================\n// ${WORKER_FILE}\n// ============================================================================\n\n`
  bundle += workerCode

  // Write the bundle
  writeFileSync(OUTPUT_FILE, bundle)
  console.log(`\nBundle written to ${OUTPUT_FILE}`)
  console.log(`Size: ${(bundle.length / 1024).toFixed(1)} KB`)
}

buildBundle()
