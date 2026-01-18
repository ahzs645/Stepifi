/**
 * STL/3MF to STEP/STL converter using OpenCascade.js via Web Worker
 * Features: mesh repair, face merging, multi-mesh support, tolerance control
 */

let worker: Worker | null = null

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker('/converter.worker.js')
  }
  return worker
}

export interface ConversionOptions {
  /** Output format: 'step' or 'stl' */
  outputFormat?: 'step' | 'stl'
  /** Tolerance for sewing and merging (0.01 - 1.0) */
  tolerance?: number
  /** Enable mesh repair operations */
  repair?: boolean
  /** Merge coplanar faces */
  mergeFaces?: boolean
}

export interface MeshStats {
  faceCount?: number
  boundingBox?: {
    min: { x: number; y: number; z: number }
    max: { x: number; y: number; z: number }
    size: { x: number; y: number; z: number }
  }
  volume?: number
  surfaceArea?: number
  note?: string
}

export interface ConversionResult {
  data: Uint8Array
  format: 'step' | 'stl'
  beforeStats?: MeshStats
  afterStats?: MeshStats
}

export function convertFile(
  fileData: ArrayBuffer,
  fileName: string,
  options: ConversionOptions = {},
  onProgress?: (message: string) => void,
  onBeforeStats?: (stats: MeshStats) => void,
  onAfterStats?: (stats: MeshStats) => void,
): Promise<ConversionResult> {
  return new Promise((resolve, reject) => {
    const w = getWorker()

    const {
      outputFormat = 'step',
      tolerance = 0.1,
      repair = true,
      mergeFaces = true,
    } = options

    let beforeStats: MeshStats | undefined
    let afterStats: MeshStats | undefined

    w.onmessage = (e: MessageEvent) => {
      const { type, data, message, format } = e.data

      switch (type) {
        case 'progress':
          console.log(`[Converter] ${message}`)
          onProgress?.(message)
          break
        case 'beforeStats':
          beforeStats = data
          onBeforeStats?.(data)
          break
        case 'afterStats':
          afterStats = data
          onAfterStats?.(data)
          break
        case 'complete':
          resolve({
            data: e.data.data,
            format: e.data.format,
            beforeStats: e.data.beforeStats || beforeStats,
            afterStats: e.data.afterStats || afterStats,
          })
          break
        case 'error':
          reject(new Error(message))
          break
      }
    }

    w.onerror = (error) => {
      reject(new Error(`Worker error: ${error.message}`))
    }

    const fileCopy = fileData.slice(0)
    w.postMessage({
      type: 'convert',
      data: {
        fileData: fileCopy,
        fileName,
        outputFormat,
        tolerance,
        repair,
        mergeFaces,
      },
    })
  })
}

export function analyzeFile(
  fileData: ArrayBuffer,
  onProgress?: (message: string) => void,
): Promise<MeshStats> {
  return new Promise((resolve, reject) => {
    const w = getWorker()

    w.onmessage = (e: MessageEvent) => {
      const { type, data, message } = e.data

      switch (type) {
        case 'progress':
          console.log(`[Converter] ${message}`)
          onProgress?.(message)
          break
        case 'analysis':
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

    const fileCopy = fileData.slice(0)
    w.postMessage({
      type: 'analyze',
      data: { fileData: fileCopy },
    })
  })
}

// Legacy function for backwards compatibility
export function convertStlToStep(
  stlData: ArrayBuffer,
  onProgress?: (message: string) => void,
): Promise<Uint8Array> {
  return convertFile(stlData, 'input.stl', { outputFormat: 'step' }, onProgress).then(
    (result) => result.data,
  )
}
