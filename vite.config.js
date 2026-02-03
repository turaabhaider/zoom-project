import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    "process.env": {},
    "global": "window", 
  },
  optimizeDeps: {
    // Adding this tells Vite to stop trying to "fix" these libraries
    exclude: ['@zoomus/websdk']
  },
  build: {
    commonjsOptions: { transformMixedEsModules: true }
  }
})