import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [
    react(),
    svgr({
      include: '**/*.svg?react',
    }),
  ],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    open: false,
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: true,
    open: false,
  },
})
