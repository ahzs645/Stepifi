import { createFileRoute } from '@tanstack/react-router';
import { useState, useCallback, Suspense, lazy } from 'react'

const StlViewer = lazy(() => import('~/components/StlViewer'))

export const Route = createFileRoute('/')({
  component: Home,
});

type ConversionStatus = 'idle' | 'loading-occt' | 'converting' | 'done' | 'error';

interface ConversionResult {
  stepBlob: Blob | null;
  fileName: string;
  error?: string;
}

function Home() {
  const [status, setStatus] = useState<ConversionStatus>('idle');
  const [progress, setProgress] = useState('');
  const [stlData, setStlData] = useState<ArrayBuffer | null>(null);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [fileName, setFileName] = useState('');

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setStatus('idle');
    setResult(null);

    const arrayBuffer = await file.arrayBuffer();
    setStlData(arrayBuffer);
  }, []);

  const handleConvert = useCallback(async () => {
    if (!stlData || !fileName) return;

    setStatus('loading-occt');
    setProgress('Loading OpenCascade.js (~9MB)...');

    try {
      const { convertStlToStep } = await import('~/lib/converter')

      setStatus('converting');
      setProgress('Converting STL to STEP...');

      const stepData = await convertStlToStep(stlData, (msg) => {
        setProgress(msg);
      });

      const stepBlob = new Blob([stepData], { type: 'application/step' });
      const baseName = fileName.replace(/\.(stl|3mf)$/i, '');

      setResult({
        stepBlob,
        fileName: `${baseName}.step`,
      });
      setStatus('done');
      setProgress('Conversion complete!');
    } catch (err) {
      setStatus('error');
      setResult({
        stepBlob: null,
        fileName: '',
        error: err instanceof Error ? err.message : 'Unknown error',
      });
      setProgress('');
    }
  }, [stlData, fileName]);

  const handleDownload = useCallback(() => {
    if (!result?.stepBlob) return;

    const url = URL.createObjectURL(result.stepBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.fileName;
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Stepifi</h1>
        <p style={styles.subtitle}>Browser-based STL to STEP converter</p>
        <p style={styles.note}>Powered by OpenCascade.js - runs entirely in your browser</p>
      </header>

      <main style={styles.main}>
        <div style={styles.uploadSection}>
          <label style={styles.uploadLabel}>
            <input
              type="file"
              accept=".stl,.3mf"
              onChange={handleFileSelect}
              style={styles.fileInput}
            />
            <div style={styles.uploadBox}>
              {fileName ? (
                <span>{fileName}</span>
              ) : (
                <>
                  <span style={styles.uploadIcon}>📁</span>
                  <span>Drop STL file here or click to browse</span>
                </>
              )}
            </div>
          </label>
        </div>

        {stlData && (
          <div style={styles.previewSection}>
            <h3 style={styles.sectionTitle}>Preview</h3>
            <div style={styles.viewerContainer}>
              <Suspense fallback={<div style={styles.loading}>Loading 3D viewer...</div>}>
                <StlViewer stlData={stlData} />
              </Suspense>
            </div>
          </div>
        )}

        {stlData && status !== 'done' && (
          <button
            onClick={handleConvert}
            disabled={status === 'loading-occt' || status === 'converting'}
            style={{
              ...styles.convertButton,
              ...(status === 'loading-occt' || status === 'converting' ? styles.buttonDisabled : {}),
            }}
          >
            {status === 'idle' || status === 'error' ? 'Convert to STEP' : progress}
          </button>
        )}

        {status === 'error' && result?.error && (
          <div style={styles.error}>
            <strong>Error:</strong> {result.error}
          </div>
        )}

        {status === 'done' && result?.stepBlob && (
          <div style={styles.resultSection}>
            <div style={styles.success}>
              Conversion successful! File size: {(result.stepBlob.size / 1024).toFixed(1)} KB
            </div>
            <button onClick={handleDownload} style={styles.downloadButton}>
              Download {result.fileName}
            </button>
          </div>
        )}
      </main>

      <footer style={styles.footer}>
        <p>No data leaves your browser. All processing happens locally.</p>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    color: '#fafafa',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    textAlign: 'center',
    padding: '2rem',
    borderBottom: '1px solid #222',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 700,
    margin: 0,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#888',
    margin: '0.5rem 0 0 0',
  },
  note: {
    fontSize: '0.85rem',
    color: '#666',
    margin: '0.5rem 0 0 0',
  },
  main: {
    flex: 1,
    padding: '2rem',
    maxWidth: '800px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
  },
  uploadSection: {
    marginBottom: '2rem',
  },
  uploadLabel: {
    display: 'block',
    cursor: 'pointer',
  },
  fileInput: {
    display: 'none',
  },
  uploadBox: {
    border: '2px dashed #444',
    borderRadius: '12px',
    padding: '3rem 2rem',
    textAlign: 'center',
    transition: 'all 0.2s',
    backgroundColor: '#111',
  },
  uploadIcon: {
    fontSize: '2rem',
    display: 'block',
    marginBottom: '0.5rem',
  },
  previewSection: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: '1rem',
    color: '#aaa',
  },
  viewerContainer: {
    height: '300px',
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
  },
  loading: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
  },
  convertButton: {
    width: '100%',
    padding: '1rem 2rem',
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#fff',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  buttonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  error: {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: '#2d1f1f',
    borderRadius: '8px',
    color: '#ff6b6b',
    border: '1px solid #5c2626',
  },
  resultSection: {
    marginTop: '1rem',
  },
  success: {
    padding: '1rem',
    backgroundColor: '#1f2d1f',
    borderRadius: '8px',
    color: '#6bff6b',
    border: '1px solid #265c26',
    marginBottom: '1rem',
  },
  downloadButton: {
    width: '100%',
    padding: '1rem 2rem',
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#fff',
    backgroundColor: '#22c55e',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  footer: {
    textAlign: 'center',
    padding: '1.5rem',
    borderTop: '1px solid #222',
    color: '#666',
    fontSize: '0.85rem',
  },
};
