/**
 * Quick Converter - Lightweight STL to STEP conversion using stltostp WASM
 *
 * This is a fast, lightweight alternative to OpenCascade for simple STL→STEP conversion.
 * It performs direct triangle-to-triangle conversion with edge merging.
 */

interface QuickConversionResult {
  success: boolean;
  data: string;
  error: string;
  triangleCount: number;
  mergedEdges: number;
}

interface StlToStpModule {
  convertSTLtoSTEP(
    stlData: string,
    tolerance: number,
    units: string,
    schema: string
  ): QuickConversionResult;
}

type ModuleFactory = () => Promise<StlToStpModule>;

declare global {
  interface Window {
    createStlToStpModule: ModuleFactory;
  }
}

let modulePromise: Promise<StlToStpModule> | null = null;
let moduleLoaded = false;

export function isQuickConverterLoaded(): boolean {
  return moduleLoaded;
}

export async function loadQuickConverter(): Promise<StlToStpModule> {
  if (modulePromise) {
    return modulePromise;
  }

  modulePromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.createStlToStpModule) {
      window.createStlToStpModule()
        .then((module) => {
          moduleLoaded = true;
          resolve(module);
        })
        .catch(reject);
      return;
    }

    const script = document.createElement('script');
    const basePath = import.meta.env.BASE_URL || '/';
    script.src = `${basePath}stltostp.js`;
    script.async = true;

    script.onload = async () => {
      try {
        const module = await window.createStlToStpModule();
        moduleLoaded = true;
        resolve(module);
      } catch (err) {
        reject(err);
      }
    };

    script.onerror = () => {
      reject(new Error('Failed to load quick converter WASM module'));
    };

    document.head.appendChild(script);
  });

  return modulePromise;
}

export interface QuickConversionOptions {
  tolerance?: number;
  units?: 'mm' | 'cm' | 'm' | 'in';
  schema?: '203' | '214';
}

export interface QuickConversionOutput {
  success: boolean;
  stepData?: string;
  error?: string;
  stats: {
    triangleCount: number;
    totalEdges: number;
    mergedEdges: number;
    uniqueEdges: number;
    edgeReductionPercent: number;
  };
}

export async function quickConvertSTLtoSTEP(
  stlFile: File | ArrayBuffer,
  options: QuickConversionOptions = {}
): Promise<QuickConversionOutput> {
  const { tolerance = 1e-6, units = 'mm', schema = '203' } = options;

  const module = await loadQuickConverter();

  // Read file as binary string
  let arrayBuffer: ArrayBuffer;
  if (stlFile instanceof File) {
    arrayBuffer = await stlFile.arrayBuffer();
  } else {
    arrayBuffer = stlFile;
  }

  const uint8Array = new Uint8Array(arrayBuffer);

  // Convert to binary string (required by the WASM module)
  let binaryString = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binaryString += String.fromCharCode(uint8Array[i]);
  }

  const result = module.convertSTLtoSTEP(binaryString, tolerance, units, schema);

  // Calculate stats
  const totalEdges = result.triangleCount * 3;
  const uniqueEdges = totalEdges - result.mergedEdges;
  const edgeReductionPercent = totalEdges > 0
    ? (result.mergedEdges / totalEdges) * 100
    : 0;

  return {
    success: result.success,
    stepData: result.success ? result.data : undefined,
    error: result.success ? undefined : result.error,
    stats: {
      triangleCount: result.triangleCount,
      totalEdges,
      mergedEdges: result.mergedEdges,
      uniqueEdges,
      edgeReductionPercent,
    },
  };
}

export function downloadQuickConvertedSTEP(data: string, filename: string): void {
  const blob = new Blob([data], { type: 'application/step' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
