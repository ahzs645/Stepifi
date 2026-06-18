/**
 * STL/3MF to STEP/STL converter using OpenCascade.js via Web Worker
 * Features: mesh repair, face merging, multi-mesh support, tolerance control
 */

let worker: Worker | null = null

function getWorker(): Worker {
  if (!worker) {
    // Use import.meta.env.BASE_URL for correct path in GitHub Pages
    const base = import.meta.env.BASE_URL || '/'
    worker = new Worker(`${base}converter.worker.js`)
  }
  return worker
}

/** Formats the worker may emit (includes honest fallbacks). */
export type OutputFormat = 'step' | 'stl' | 'brep' | 'iges'

/**
 * Best-effort authoritative STEP validation using step-parser (the wasm STEP
 * reader). Runs on the main thread (ESM) where step-parser loads cleanly.
 * Returns true/false, or undefined if the validator itself couldn't run.
 */
async function validateStepBytes(bytes: Uint8Array): Promise<boolean | undefined> {
  try {
    const mod: any = await import('step-parser')
    await mod.initStepParser()
    const res = mod.parseStep(bytes)
    if (!res) return false
    if (typeof res.success === 'boolean') return res.success
    // A parsed object with any entities/geometry counts as valid.
    return true
  } catch (e) {
    console.warn('[Converter] step-parser validation skipped:', (e as Error).message)
    return undefined
  }
}

export interface ConversionOptions {
  /** Output format: 'step', 'stl', or 'brep' */
  outputFormat?: 'step' | 'stl' | 'brep'
  /** Tolerance for sewing and merging (0.01 - 1.0) */
  tolerance?: number
  /** Enable mesh repair operations */
  repair?: boolean
  /** Merge coplanar faces */
  mergeFaces?: boolean
  /** Skip face merge entirely (faster but larger files) */
  skipMerge?: boolean
}

export interface MeshStats {
  faceCount?: number
  edgeCount?: number
  vertexCount?: number
  triangleCount?: number
  boundingBox?: {
    min: { x: number; y: number; z: number }
    max: { x: number; y: number; z: number }
    size: { x: number; y: number; z: number }
  }
  volume?: number
  surfaceArea?: number
  isSolid?: boolean
  isWatertight?: boolean
  qualityIssues?: string[]
  note?: string
  // JS-level analysis fields
  holeCount?: number
  nonManifoldEdgeCount?: number
  selfIntersectionCount?: number
  selfIntersections?: string // 'skipped (large mesh)' if skipped
  jsAnalyzed?: boolean
  analyzedTriangles?: number
  analyzedVertices?: number
}

export interface ConversionResult {
  data: Uint8Array
  format: OutputFormat
  /** STEP validity per step-parser; true/false, or undefined if not checked. */
  stepValid?: boolean
  beforeStats?: MeshStats
  afterStats?: MeshStats
  repairs?: string[]
}

export function convertFile(
  fileData: ArrayBuffer,
  fileName: string,
  options: ConversionOptions = {},
  onProgress?: (message: string) => void,
  onBeforeStats?: (stats: MeshStats) => void,
  onAfterStats?: (stats: MeshStats) => void,
  onRepairLog?: (repairs: string[]) => void,
): Promise<ConversionResult> {
  return new Promise((resolve, reject) => {
    const w = getWorker()

    const {
      outputFormat = 'step',
      tolerance = 0.1,
      repair = true,
      mergeFaces = true,
      skipMerge = false,
    } = options

    let beforeStats: MeshStats | undefined
    let afterStats: MeshStats | undefined
    let repairs: string[] = []

    w.onmessage = (e: MessageEvent) => {
      const { type, data, message } = e.data

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
        case 'repairLog':
          repairs = data
          onRepairLog?.(data)
          break
        case 'complete': {
          const outBytes: Uint8Array = e.data.data
          const outFormat: OutputFormat = e.data.format
          const finish = (stepValid?: boolean) =>
            resolve({
              data: outBytes,
              format: outFormat,
              stepValid,
              beforeStats: e.data.beforeStats || beforeStats,
              afterStats: e.data.afterStats || afterStats,
              repairs: e.data.repairs || repairs,
            })
          // Authoritative post-write gate: validate real STEP output with step-parser.
          if (outFormat === 'step') {
            validateStepBytes(outBytes).then((valid) => {
              if (valid === false) {
                console.warn('[Converter] step-parser reported the STEP output is INVALID')
              }
              finish(valid)
            })
          } else {
            finish()
          }
          break
        }
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
        skipMerge,
      },
    })
  })
}

export function analyzeFile(
  fileData: ArrayBuffer,
  fileName: string = 'input.stl',
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
      data: { fileData: fileCopy, fileName },
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
