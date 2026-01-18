import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// Base path configuration:
// - For GitHub Pages (ahzs645.github.io/Stepifi): '/Stepifi/'
// - For custom subdomain (stepifi.example.com): '/'
// Set VITE_BASE_PATH environment variable to override
const BASE_PATH = process.env.VITE_BASE_PATH || '/Stepifi/'

export default defineConfig({
  base: BASE_PATH,
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  build: {
    target: 'esnext',
    outDir: 'dist',
  },
  server: {
    port: 3000,
  },
})
