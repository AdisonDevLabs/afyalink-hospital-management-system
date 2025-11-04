import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 5005,
    proxy: {
      '/api': loadEnv(mode, process.cwd(), '').VITE_BACKEND_URL || 'http://localhost:5006',
    },
  },
}))
