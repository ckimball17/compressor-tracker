// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 👇 replace with your repo name exactly
const repoName = 'compressor-tracker' 

export default defineConfig({
  plugins: [react()],
  base: `/${repoName}/`,
})

