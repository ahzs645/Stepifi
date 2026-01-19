/**
 * OpenCascade Initialization
 * Handles loading and initializing OpenCascade.js in a web worker
 */

/**
 * Initialize OpenCascade.js
 * @param {string} basePath - Base path for loading OpenCascade files
 * @param {function} postMessage - Worker's postMessage function for progress updates
 * @returns {Promise<Object>} OpenCascade.js instance
 */
export async function initOpenCascade(basePath, postMessage) {
  postMessage({ type: 'progress', message: 'Fetching OpenCascade.js...' })

  const response = await fetch(basePath + 'opencascade/opencascade.full.js')
  let scriptText = await response.text()

  // Remove ES module export statements
  scriptText = scriptText.replace(/export\s*\{[^}]*\}\s*;?\s*$/m, '')
  scriptText = scriptText.replace(/export\s+default\s+\w+\s*;?\s*$/m, '')

  postMessage({ type: 'progress', message: 'Parsing OpenCascade.js...' })

  eval(scriptText)

  postMessage({ type: 'progress', message: 'Initializing WASM (~50MB)...' })

  return await Module({
    locateFile: (file) => basePath + 'opencascade/' + file
  })
}
