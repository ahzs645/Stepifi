/**
 * STL to STEP converter using OpenCascade.js via Web Worker
 */

let worker: Worker | null = null

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker('/converter.worker.js')
  }
  return worker
}

export function convertStlToStep(
  stlData: ArrayBuffer,
  onProgress?: (message: string) => void,
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const w = getWorker()

    w.onmessage = (e: MessageEvent) => {
      const { type, data, message } = e.data

      switch (type) {
        case 'progress':
          console.log(`[Converter] ${message}`)
          onProgress?.(message)
          break
        case 'complete':
          resolve(data)
          break
        case 'error':
          reject(new Error(message))
          break
      }
    }

    w.onerror = (error) => {
      reject(new Error(`Worker error: ${error.message}`))
    }

    const stlCopy = stlData.slice(0)
    w.postMessage({ type: 'convert', data: { stlData: stlCopy } })
  })
}
