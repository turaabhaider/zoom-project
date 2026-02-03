import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    "process.env": {},
    "global": "window", 
  },
  optimizeDeps: {
    exclude: ['@zoomus/websdk']
  },
  server: {
    // This allows your ngrok link to bypass Vite's security block
    allowedHosts: [
      'marth-coruscant-subterminally.ngrok-free.dev'
    ]
  },
  build: {
    commonjsOptions: { transformMixedEsModules: true },
    cssMinify: 'esbuild',
    outDir: 'dist',
  }
})