import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // ✅ makes all CSS/JS relative for any host
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    cssCodeSplit: false, // 🧩 prevent broken CSS
    minify: 'esbuild',   // faster, safer minify
    sourcemap: false,    // disable heavy mapping
  },
  server: {
    port: 5173,
    open: true
  }
})
