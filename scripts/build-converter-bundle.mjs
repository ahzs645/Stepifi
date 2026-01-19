#!/usr/bin/env node
/**
 * Build script for converter.worker.js
 * Bundles all converter-js modules into a single IIFE for web worker use
 */

import { readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CONVERTER_JS_DIR = join(__dirname, '../public/converter-js')
const OUTPUT_FILE = join(__dirname, '../public/converter.worker.js')

// Files to bundle in dependency order
const FILES = [
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
  console.log('Building converter.worker.js from converter-js/ modules...')

  let bundle = `/**
 * Web Worker for OpenCascade.js v2 STL/3MF/F3D to STEP/STL conversion
 * Auto-generated from converter-js modules
 * Generated: ${new Date().toISOString()}
 *
 * Features: mesh repair, face merging, multi-mesh support, tolerance control,
 *           large mesh optimization, JavaScript mesh repairs, fallback strategies,
 *           F3D (Fusion 360) ACIS binary support
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

let ocInstance = null

`

  // Process each file (except worker.js which needs special handling)
  for (const file of FILES) {
    if (file === 'worker.js') continue
    console.log(`  Processing ${file}...`)
    bundle += processFile(file)
  }

  // Process worker.js and remove redundant declarations
  console.log('  Processing worker.js...')
  let workerCode = readFileSync(join(CONVERTER_JS_DIR, 'worker.js'), 'utf-8')
  workerCode = stripImports(workerCode)
  workerCode = stripExports(workerCode)

  // Remove duplicate WORKER_BASE_PATH and ocInstance declarations from worker.js
  workerCode = workerCode.replace(/\/\/ Worker base path detection[\s\S]*?let ocInstance = null\s*/m, '')
  // Remove duplicate ACIS loading
  workerCode = workerCode.replace(/\/\/ Load ACIS parser bundle[\s\S]*?console\.log\('ACIS module not loaded[\s\S]*?\}\s*/m, '')

  bundle += `\n// ============================================================================\n// worker.js\n// ============================================================================\n\n`
  bundle += workerCode

  // Write the bundle
  writeFileSync(OUTPUT_FILE, bundle)
  console.log(`\nBundle written to ${OUTPUT_FILE}`)
  console.log(`Size: ${(bundle.length / 1024).toFixed(1)} KB`)
}

buildBundle()
