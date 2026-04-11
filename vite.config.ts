import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  base: '/cca-f-quiz/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/counter': {
        target: 'https://api.counterapi.dev/v2/uladzislau-piatkievichs-team-3702/first-counter-3702',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/counter/, ''),
      },
    },
  },
})
