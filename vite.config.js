// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANT: must match the repo name exactly
export default defineConfig({
  plugins: [react()],
  base: '/compressor-tracker/',
})


