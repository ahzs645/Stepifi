import { useState, useCallback, Suspense, lazy } from 'react'
import type { ConversionOptions, MeshStats, MeshData } from '~/lib/converter'
import { quickConvertSTLtoSTEP, loadQuickConverter, type QuickConversionOutput } from '~/lib/quick-converter'

const MeshViewer = lazy(() => import('~/components/MeshViewer'))
const ShapeViewer = lazy(() => import('~/components/ShapeViewer'))

type ConversionStatus = 'idle' | 'loading-occt' | 'loading-quick' | 'converting' | 'analyzing' | 'analyzed' | 'done' | 'error'
type ConverterMode = 'quick' | 'advanced'

interface ConversionResult {
  blob: Blob | null
  fileName: string
  format: 'step' | 'stl'
  error?: string
}

function formatNumber(num: number): string {
  return num.toLocaleString()
}

function StatsColumn({ title, stats, color }: { title: string; stats: MeshStats; color: 'blue' | 'green' }) {
  const borderColor = color === 'blue' ? 'border-blue-600' : 'border-green-600'
  const bgColor = color === 'blue' ? 'bg-blue-900/20' : 'bg-green-900/20'
  const textColor = color === 'blue' ? 'text-blue-400' : 'text-green-400'

  return (
    <div className={`p-4 rounded-lg border ${borderColor} ${bgColor}`}>
      <h4 className={`text-sm font-semibold ${textColor} mb-3`}>{title}</h4>
      <div className="space-y-2 text-sm">
        {stats.faceCount !== undefined && (
          <div className="flex justify-between">
            <span className="text-gray-500">Faces:</span>
            <span className="text-gray-200 font-mono">{formatNumber(stats.faceCount)}</span>
          </div>
        )}
        {stats.triangleCount !== undefined && stats.triangleCount > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-500">Triangles:</span>
            <span className="text-gray-200 font-mono">{formatNumber(stats.triangleCount)}</span>
          </div>
        )}
        {stats.edgeCount !== undefined && stats.edgeCount > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-500">Edges:</span>
            <span className="text-gray-200 font-mono">{formatNumber(stats.edgeCount)}</span>
          </div>
        )}
        {stats.vertexCount !== undefined && stats.vertexCount > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-500">Vertices:</span>
            <span className="text-gray-200 font-mono">{formatNumber(stats.vertexCount)}</span>
          </div>
        )}
        {stats.surfaceArea !== undefined && stats.surfaceArea > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-500">Surface:</span>
            <span className="text-gray-200 font-mono">{stats.surfaceArea.toFixed(2)} mm²</span>
          </div>
        )}
        {stats.volume !== undefined && stats.volume > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-500">Volume:</span>
            <span className="text-gray-200 font-mono">{stats.volume.toFixed(2)} mm³</span>
          </div>
        )}
        {stats.boundingBox && (
          <div className="flex justify-between">
            <span className="text-gray-500">Size:</span>
            <span className="text-gray-200 font-mono text-xs">
              {stats.boundingBox.size.x.toFixed(1)} × {stats.boundingBox.size.y.toFixed(1)} × {stats.boundingBox.size.z.toFixed(1)}
            </span>
          </div>
        )}
        {stats.isSolid !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Solid:</span>
            <span className={`text-xs px-2 py-0.5 rounded ${stats.isSolid ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
              {stats.isSolid ? 'Yes' : 'No'}
            </span>
          </div>
        )}
        {stats.isWatertight !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Watertight:</span>
            <span className={`text-xs px-2 py-0.5 rounded ${stats.isWatertight ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
              {stats.isWatertight ? 'Yes' : 'No'}
            </span>
          </div>
        )}
        {stats.holeCount !== undefined && stats.holeCount > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Holes:</span>
            <span className="text-xs px-2 py-0.5 rounded bg-yellow-900/50 text-yellow-400">
              {stats.holeCount}
            </span>
          </div>
        )}
        {stats.nonManifoldEdgeCount !== undefined && stats.nonManifoldEdgeCount > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Non-manifold:</span>
            <span className="text-xs px-2 py-0.5 rounded bg-red-900/50 text-red-400">
              {stats.nonManifoldEdgeCount} edges
            </span>
          </div>
        )}
        {stats.selfIntersectionCount !== undefined && stats.selfIntersectionCount > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Self-intersect:</span>
            <span className="text-xs px-2 py-0.5 rounded bg-red-900/50 text-red-400">
              {stats.selfIntersectionCount} pairs
            </span>
          </div>
        )}
        {stats.selfIntersections === 'skipped (large mesh)' && (
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Self-intersect:</span>
            <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400">
              Skipped
            </span>
          </div>
        )}
      </div>
      {stats.qualityIssues && stats.qualityIssues.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-xs text-yellow-500 font-medium mb-1">Warnings:</p>
          <ul className="text-xs text-yellow-400/80 space-y-1">
            {stats.qualityIssues.map((issue, i) => (
              <li key={i}>• {issue}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [status, setStatus] = useState<ConversionStatus>('idle')
  const [progress, setProgress] = useState('')
  const [fileData, setFileData] = useState<ArrayBuffer | null>(null)
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [fileName, setFileName] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [beforeStats, setBeforeStats] = useState<MeshStats | null>(null)
  const [afterStats, setAfterStats] = useState<MeshStats | null>(null)
  const [repairs, setRepairs] = useState<string[]>([])
  const [outputMesh, setOutputMesh] = useState<MeshData | null>(null)

  // Converter mode: 'quick' (lightweight stltostp) or 'advanced' (OpenCascade)
  const [converterMode, setConverterMode] = useState<ConverterMode>('quick')
  const [quickStats, setQuickStats] = useState<QuickConversionOutput['stats'] | null>(null)

  // Conversion options
  const [outputFormat, setOutputFormat] = useState<'step' | 'stl'>('step')
  const [tolerance, setTolerance] = useState(0.1)
  const [repair, setRepair] = useState(true)
  const [mergeFaces, setMergeFaces] = useState(true)
  const [skipMerge, setSkipMerge] = useState(false)

  const processFile = useCallback(async (file: File) => {
    setFileName(file.name)
    setStatus('idle')
    setResult(null)
    setBeforeStats(null)
    setAfterStats(null)
    setQuickStats(null)
    setOutputMesh(null)
    const arrayBuffer = await file.arrayBuffer()
    setFileData(arrayBuffer)
  }, [])

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      await processFile(file)
    },
    [processFile],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const file = e.dataTransfer.files?.[0]
      if (!file) return

      if (!file.name.match(/\.(stl|3mf|f3d)$/i)) {
        alert('Please drop an STL, 3MF, or F3D file')
        return
      }

      await processFile(file)
    },
    [processFile],
  )

  const handleConvert = useCallback(async () => {
    if (!fileData || !fileName) return

    setStatus('loading-occt')
    setProgress('Loading OCCT WASM (~15MB)...')
    setBeforeStats(null)
    setAfterStats(null)
    setRepairs([])
    setOutputMesh(null)

    try {
      const { convertFile } = await import('~/lib/converter')

      setStatus('converting')
      setProgress('Converting...')

      const options: ConversionOptions = {
        outputFormat,
        tolerance,
        repair,
        mergeFaces,
        skipMerge,
      }

      const conversionResult = await convertFile(
        fileData,
        fileName,
        options,
        (msg) => setProgress(msg),
        (stats) => setBeforeStats(stats),
        (stats) => setAfterStats(stats),
        (repairLog) => setRepairs(repairLog),
        (mesh) => setOutputMesh(mesh),
      )

      const mimeType = conversionResult.format === 'step' ? 'application/step' : 'model/stl'
      const blob = new Blob([new Uint8Array(conversionResult.data).buffer as ArrayBuffer], { type: mimeType })
      const baseName = fileName.replace(/\.(stl|3mf|f3d)$/i, '')

      // Update stats and repairs from result if available
      if (conversionResult.beforeStats) setBeforeStats(conversionResult.beforeStats)
      if (conversionResult.afterStats) setAfterStats(conversionResult.afterStats)
      if (conversionResult.repairs) setRepairs(conversionResult.repairs)

      setResult({
        blob,
        fileName: `${baseName}.${conversionResult.format}`,
        format: conversionResult.format,
      })
      setStatus('done')
      setProgress('Conversion complete!')
    } catch (err) {
      setStatus('error')
      setResult({
        blob: null,
        fileName: '',
        format: 'step',
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      setProgress('')
    }
  }, [fileData, fileName, outputFormat, tolerance, repair, mergeFaces, skipMerge])

  // Quick conversion using lightweight stltostp WASM
  const handleQuickConvert = useCallback(async () => {
    if (!fileData || !fileName) return

    // Quick mode only supports STL input
    if (!fileName.toLowerCase().endsWith('.stl')) {
      setStatus('error')
      setResult({
        blob: null,
        fileName: '',
        format: 'step',
        error: 'Quick mode only supports STL files. Use Advanced mode for 3MF/F3D.',
      })
      return
    }

    setStatus('loading-quick')
    setProgress('Loading quick converter (~230KB)...')
    setBeforeStats(null)
    setAfterStats(null)
    setQuickStats(null)
    setRepairs([])

    try {
      await loadQuickConverter()

      setStatus('converting')
      setProgress('Converting...')

      const quickResult = await quickConvertSTLtoSTEP(fileData, {
        tolerance,
        units: 'mm',
        schema: '203',
      })

      if (quickResult.success && quickResult.stepData) {
        const blob = new Blob([quickResult.stepData], { type: 'application/step' })
        const baseName = fileName.replace(/\.stl$/i, '')

        setQuickStats(quickResult.stats)
        setResult({
          blob,
          fileName: `${baseName}.stp`,
          format: 'step',
        })
        setStatus('done')
        setProgress('Conversion complete!')
      } else {
        throw new Error(quickResult.error || 'Quick conversion failed')
      }
    } catch (err) {
      setStatus('error')
      setResult({
        blob: null,
        fileName: '',
        format: 'step',
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      setProgress('')
    }
  }, [fileData, fileName, tolerance])

  const handleAnalyze = useCallback(async () => {
    if (!fileData || !fileName) return

    setStatus('loading-occt')
    setProgress('Loading OCCT WASM (~15MB)...')
    setBeforeStats(null)
    setAfterStats(null)
    setRepairs([])

    try {
      const { analyzeFile } = await import('~/lib/converter')

      setStatus('analyzing')
      setProgress('Analyzing mesh...')

      const stats = await analyzeFile(
        fileData,
        fileName,
        (msg) => setProgress(msg),
      )

      setBeforeStats(stats)
      setStatus('analyzed')
      setProgress('Analysis complete!')
    } catch (err) {
      setStatus('error')
      setResult({
        blob: null,
        fileName: '',
        format: 'step',
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      setProgress('')
    }
  }, [fileData, fileName])

  const handleDownload = useCallback(() => {
    if (!result?.blob) return

    const url = URL.createObjectURL(result.blob)
    const a = document.createElement('a')
    a.href = url
    a.download = result.fileName
    a.click()
    URL.revokeObjectURL(url)
  }, [result])

  // Calculate face reduction percentage
  const faceReduction = beforeStats?.faceCount && afterStats?.faceCount
    ? ((beforeStats.faceCount - afterStats.faceCount) / beforeStats.faceCount * 100).toFixed(1)
    : null

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      <header className="text-center py-8 border-b border-gray-800">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          Stepifi
        </h1>
        <p className="text-gray-400 mt-2">Browser-based STL/3MF/F3D to STEP/STL converter</p>
        <p className="text-gray-500 text-sm mt-1">
          Powered by OpenCascade OCCT 7.9.1 - runs entirely in your browser
        </p>
      </header>

      <main className="flex-1 p-8 max-w-4xl mx-auto w-full">
        {/* File Upload */}
        <div className="mb-8">
          <label
            className="block cursor-pointer"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".stl,.3mf,.f3d"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors bg-gray-900 ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-900/20'
                  : 'border-gray-700 hover:border-gray-500'
              }`}
            >
              {fileName ? (
                <span className="text-gray-300">{fileName}</span>
              ) : (
                <>
                  <span className="text-3xl block mb-2">📁</span>
                  <span className="text-gray-400">
                    Drop STL, 3MF, or F3D file here or click to browse
                  </span>
                </>
              )}
            </div>
          </label>
        </div>

        {/* 3D Preview */}
        {fileData && (
          <div className="mb-8">
            <div className={`grid ${outputMesh ? 'grid-cols-1 md:grid-cols-2 gap-4' : 'grid-cols-1'}`}>
              <div>
                <h3 className="text-sm font-semibold text-blue-400 mb-3">
                  {outputMesh ? 'Input' : 'Preview'}
                </h3>
                <div className="h-72 rounded-xl overflow-hidden bg-gray-900 border border-gray-800">
                  <Suspense
                    fallback={
                      <div className="h-full flex items-center justify-center text-gray-500">
                        Loading 3D viewer...
                      </div>
                    }
                  >
                    <MeshViewer fileData={fileData} fileName={fileName} />
                  </Suspense>
                </div>
              </div>
              {outputMesh && (
                <div>
                  <h3 className="text-sm font-semibold text-green-400 mb-3">Output (Converted)</h3>
                  <div className="h-72 rounded-xl overflow-hidden bg-gray-900 border border-gray-800">
                    <Suspense
                      fallback={
                        <div className="h-full flex items-center justify-center text-gray-500">
                          Loading 3D viewer...
                        </div>
                      }
                    >
                      <ShapeViewer meshData={outputMesh} />
                    </Suspense>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Before/After Mesh Analysis */}
        {(beforeStats || afterStats) && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-400">Mesh Analysis</h3>
              {faceReduction && parseFloat(faceReduction) > 0 && (
                <span className="text-xs px-2 py-1 bg-green-900/30 text-green-400 rounded-full">
                  {faceReduction}% face reduction
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {beforeStats && (
                <StatsColumn title="Before (Input)" stats={beforeStats} color="blue" />
              )}
              {afterStats && (
                <StatsColumn title="After (Output)" stats={afterStats} color="green" />
              )}
            </div>
          </div>
        )}

        {/* Repair Operations Log */}
        {repairs.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Repair Operations</h3>
            <div className="p-4 rounded-lg border border-purple-600 bg-purple-900/20">
              <ul className="text-sm text-gray-300 space-y-1">
                {repairs.map((repair, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">✓</span>
                    <span>{repair}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Converter Mode Toggle */}
        {fileData && status !== 'done' && (
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Converter Engine</label>
            <div className="flex gap-2">
              <button
                onClick={() => setConverterMode('quick')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  converterMode === 'quick'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <div className="font-semibold">Quick</div>
                <div className="text-xs opacity-80">~230KB • Fast • STL only</div>
              </button>
              <button
                onClick={() => setConverterMode('advanced')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  converterMode === 'advanced'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <div className="font-semibold">Advanced</div>
                <div className="text-xs opacity-80">~15MB • Repair • All formats</div>
              </button>
            </div>
          </div>
        )}

        {/* Conversion Options */}
        {fileData && status !== 'done' && (
          <div className="mb-8 p-4 bg-gray-900 border border-gray-800 rounded-xl">
            <h3 className="text-sm font-semibold text-gray-400 mb-4">Conversion Options</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Output Format - Only show for Advanced mode */}
              {converterMode === 'advanced' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Output Format</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setOutputFormat('step')}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        outputFormat === 'step'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      STEP
                    </button>
                    <button
                      onClick={() => setOutputFormat('stl')}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        outputFormat === 'stl'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      STL
                    </button>
                  </div>
                </div>
              )}

              {/* Tolerance - Show for both modes */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  {converterMode === 'quick' ? 'Edge Merge Tolerance' : 'Tolerance'}: {converterMode === 'quick' ? tolerance.toExponential(0) : tolerance.toFixed(2)}
                </label>
                <input
                  type="range"
                  min={converterMode === 'quick' ? '-8' : '0.01'}
                  max={converterMode === 'quick' ? '-4' : '1'}
                  step={converterMode === 'quick' ? '1' : '0.01'}
                  value={converterMode === 'quick' ? Math.log10(tolerance) : tolerance}
                  onChange={(e) => {
                    if (converterMode === 'quick') {
                      setTolerance(Math.pow(10, parseFloat(e.target.value)))
                    } else {
                      setTolerance(parseFloat(e.target.value))
                    }
                  }}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Fine</span>
                  <span>Coarse</span>
                </div>
              </div>

              {/* Advanced mode options */}
              {converterMode === 'advanced' && (
                <>
                  {/* Repair Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm text-gray-300">Mesh Repair</label>
                      <p className="text-xs text-gray-500">Fix common mesh issues</p>
                    </div>
                    <button
                      onClick={() => setRepair(!repair)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        repair ? 'bg-indigo-600' : 'bg-gray-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          repair ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Merge Faces Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm text-gray-300">Merge Faces</label>
                      <p className="text-xs text-gray-500">Combine coplanar faces</p>
                    </div>
                    <button
                      onClick={() => setMergeFaces(!mergeFaces)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        mergeFaces ? 'bg-indigo-600' : 'bg-gray-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          mergeFaces ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Skip Merge Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm text-gray-300">Skip Face Merge</label>
                      <p className="text-xs text-gray-500">Faster but larger STEP files</p>
                    </div>
                    <button
                      onClick={() => setSkipMerge(!skipMerge)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        skipMerge ? 'bg-indigo-600' : 'bg-gray-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          skipMerge ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Convert & Analyze Buttons */}
        {fileData && status !== 'done' && (
          <div className="flex gap-3">
            <button
              onClick={converterMode === 'quick' ? handleQuickConvert : handleConvert}
              disabled={status === 'loading-occt' || status === 'loading-quick' || status === 'converting' || status === 'analyzing'}
              className={`flex-1 py-4 px-6 text-lg font-semibold text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${
                converterMode === 'quick'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600'
              }`}
            >
              {status === 'idle' || status === 'error' || status === 'analyzed'
                ? converterMode === 'quick'
                  ? 'Quick Convert to STEP'
                  : `Convert to ${outputFormat.toUpperCase()}`
                : progress}
            </button>
            {converterMode === 'advanced' && (
              <button
                onClick={handleAnalyze}
                disabled={status === 'loading-occt' || status === 'loading-quick' || status === 'converting' || status === 'analyzing'}
                className="py-4 px-6 text-lg font-semibold text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Analyze mesh quality without converting"
              >
                {status === 'analyzing' ? 'Analyzing...' : 'Analyze Only'}
              </button>
            )}
          </div>
        )}

        {/* Quick Conversion Stats */}
        {quickStats && status === 'done' && (
          <div className="mt-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Conversion Stats</h3>
            <div className="p-4 rounded-lg border border-green-600 bg-green-900/20">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Triangles</span>
                  <p className="text-gray-200 font-mono text-lg">{formatNumber(quickStats.triangleCount)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Edges</span>
                  <p className="text-gray-200 font-mono">
                    <span className="text-gray-500">{formatNumber(quickStats.totalEdges)}</span>
                    <span className="text-green-400 mx-1">→</span>
                    <span className="text-lg">{formatNumber(quickStats.uniqueEdges)}</span>
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Merged</span>
                  <p className="text-gray-200 font-mono text-lg">{formatNumber(quickStats.mergedEdges)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Reduction</span>
                  <p className="text-green-400 font-mono text-lg">-{quickStats.edgeReductionPercent.toFixed(0)}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {status === 'error' && result?.error && (
          <div className="mt-4 p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-400">
            <strong>Error:</strong> {result.error}
          </div>
        )}

        {/* Success & Download */}
        {status === 'done' && result?.blob && (
          <div className="mt-4">
            <div className="p-4 bg-green-900/30 border border-green-800 rounded-lg text-green-400 mb-4">
              Conversion successful! File size:{' '}
              {(result.blob.size / 1024).toFixed(1)} KB
            </div>
            <button
              onClick={handleDownload}
              className="w-full py-4 px-6 text-lg font-semibold text-white bg-green-600 rounded-lg hover:bg-green-500 transition-colors"
            >
              Download {result.fileName}
            </button>
            <button
              onClick={() => {
                setStatus('idle')
                setResult(null)
                setBeforeStats(null)
                setAfterStats(null)
                setRepairs([])
                setOutputMesh(null)
              }}
              className="w-full mt-2 py-3 px-6 text-sm font-medium text-gray-400 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Convert Another File
            </button>
          </div>
        )}
      </main>

      <footer className="text-center py-6 border-t border-gray-800 text-gray-500 text-sm">
        <p>No data leaves your browser. All processing happens locally.</p>
      </footer>
    </div>
  )
}
