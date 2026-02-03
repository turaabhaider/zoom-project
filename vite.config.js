import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    "process.env": {},
    "global": "window", 
  },
  optimizeDeps: {
    // Zoom needs to be included for Vite to bundle it correctly for the browser
    include: ['@zoomus/websdk']
  },
  server: {
    allowedHosts: [
      'marth-coruscant-subterminally.ngrok-free.dev'
    ],
    // MANDATORY FOR MOBILE VIDEO:
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
  },
  build: {
    commonjsOptions: { transformMixedEsModules: true },
    cssMinify: 'esbuild',
    outDir: 'dist',
  }
})