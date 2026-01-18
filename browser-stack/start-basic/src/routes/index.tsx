import { createFileRoute } from '@tanstack/react-router'
import { useState, useCallback, Suspense, lazy } from 'react'

const StlViewer = lazy(() => import('~/components/StlViewer'))

export const Route = createFileRoute('/')({
  component: Home,
})

type ConversionStatus = 'idle' | 'loading-occt' | 'converting' | 'done' | 'error'

interface ConversionResult {
  stepBlob: Blob | null
  fileName: string
  error?: string
}

function Home() {
  const [status, setStatus] = useState<ConversionStatus>('idle')
  const [progress, setProgress] = useState('')
  const [stlData, setStlData] = useState<ArrayBuffer | null>(null)
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [fileName, setFileName] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  const processFile = useCallback(async (file: File) => {
    setFileName(file.name)
    setStatus('idle')
    setResult(null)
    const arrayBuffer = await file.arrayBuffer()
    setStlData(arrayBuffer)
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

      if (!file.name.match(/\.(stl|3mf)$/i)) {
        alert('Please drop an STL or 3MF file')
        return
      }

      await processFile(file)
    },
    [processFile],
  )

  const handleConvert = useCallback(async () => {
    if (!stlData || !fileName) return

    setStatus('loading-occt')
    setProgress('Loading OpenCascade.js (~9MB)...')

    try {
      const { convertStlToStep } = await import('~/lib/converter')

      setStatus('converting')
      setProgress('Converting STL to STEP...')

      const stepData = await convertStlToStep(stlData, (msg) => {
        setProgress(msg)
      })

      const stepBlob = new Blob([stepData], { type: 'application/step' })
      const baseName = fileName.replace(/\.(stl|3mf)$/i, '')

      setResult({
        stepBlob,
        fileName: `${baseName}.step`,
      })
      setStatus('done')
      setProgress('Conversion complete!')
    } catch (err) {
      setStatus('error')
      setResult({
        stepBlob: null,
        fileName: '',
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      setProgress('')
    }
  }, [stlData, fileName])

  const handleDownload = useCallback(() => {
    if (!result?.stepBlob) return

    const url = URL.createObjectURL(result.stepBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = result.fileName
    a.click()
    URL.revokeObjectURL(url)
  }, [result])

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      <header className="text-center py-8 border-b border-gray-800">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          Stepifi
        </h1>
        <p className="text-gray-400 mt-2">Browser-based STL to STEP converter</p>
        <p className="text-gray-500 text-sm mt-1">
          Powered by OpenCascade.js - runs entirely in your browser
        </p>
      </header>

      <main className="flex-1 p-8 max-w-3xl mx-auto w-full">
        <div className="mb-8">
          <label
            className="block cursor-pointer"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".stl,.3mf"
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
                    Drop STL file here or click to browse
                  </span>
                </>
              )}
            </div>
          </label>
        </div>

        {stlData && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Preview</h3>
            <div className="h-72 rounded-xl overflow-hidden bg-gray-900 border border-gray-800">
              <Suspense
                fallback={
                  <div className="h-full flex items-center justify-center text-gray-500">
                    Loading 3D viewer...
                  </div>
                }
              >
                <StlViewer stlData={stlData} />
              </Suspense>
            </div>
          </div>
        )}

        {stlData && status !== 'done' && (
          <button
            onClick={handleConvert}
            disabled={status === 'loading-occt' || status === 'converting'}
            className="w-full py-4 px-6 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'idle' || status === 'error'
              ? 'Convert to STEP'
              : progress}
          </button>
        )}

        {status === 'error' && result?.error && (
          <div className="mt-4 p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-400">
            <strong>Error:</strong> {result.error}
          </div>
        )}

        {status === 'done' && result?.stepBlob && (
          <div className="mt-4">
            <div className="p-4 bg-green-900/30 border border-green-800 rounded-lg text-green-400 mb-4">
              Conversion successful! File size:{' '}
              {(result.stepBlob.size / 1024).toFixed(1)} KB
            </div>
            <button
              onClick={handleDownload}
              className="w-full py-4 px-6 text-lg font-semibold text-white bg-green-600 rounded-lg hover:bg-green-500 transition-colors"
            >
              Download {result.fileName}
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
