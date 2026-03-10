/**
 * Chili-WASM Initialization
 * Handles loading and initializing chili3d's OpenCascade WASM module (OCCT 7.9.1)
 * in a web worker context
 */

/**
 * Initialize chili-wasm module
 * @param {string} basePath - Base path for loading WASM files
 * @param {function} postMessage - Worker's postMessage function for progress updates
 * @returns {Promise<Object>} Initialized chili-wasm module instance
 */
export async function initChiliWasm(basePath, postMessage) {
  const cacheVersion = 'v1'

  postMessage({ type: 'progress', message: 'Fetching chili-wasm.js...' })

  const response = await fetch(basePath + `chili-wasm/chili-wasm.js?${cacheVersion}`)
  let scriptText = await response.text()

  // Replace import.meta.url with a known URL so locateFile can resolve the WASM path
  const wasmBaseUrl = basePath + 'chili-wasm/'
  scriptText = scriptText.replace(
    /import\.meta\.url/g,
    JSON.stringify(wasmBaseUrl + 'chili-wasm.js')
  )

  // Remove ES module export statements
  scriptText = scriptText.replace(/export\s*\{[^}]*\}\s*;?\s*$/m, '')
  scriptText = scriptText.replace(/export\s+default\s+\w+\s*;?\s*$/m, '')

  postMessage({ type: 'progress', message: 'Parsing chili-wasm.js...' })

  eval(scriptText)

  postMessage({ type: 'progress', message: 'Initializing WASM (~15MB)...' })

  return await Module({
    locateFile: (file) => wasmBaseUrl + file + '?' + cacheVersion
  })
}
