import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      viteStaticCopy({
        targets: [
          {
            src: 'public/_redirects', // 👈 This is correct
            dest: '.',                // 👈 This copies it to `dist/`
          },
        ],
      }),
    ],
    server: {
      port: 5005,
      proxy: {
        '/api': env.VITE_BACKEND_URL || 'http://localhost:5000',
      },
    },
  }
})
