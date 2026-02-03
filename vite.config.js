import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // This 'define' section fixes the C$1 error for Zoom
  define: {
    "process.env": {},
    "global": "window", 
  },
  optimizeDeps: {
    include: ['@zoomus/websdk', 'jsrsasign'],
  },
  build: {
    cssMinify: 'esbuild',
    outDir: 'dist',
  }
})