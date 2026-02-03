import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    cssMinify: 'esbuild', // Faster and avoids Tailwind specific at-rule errors
    outDir: 'dist',
  }
})