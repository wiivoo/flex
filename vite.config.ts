import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Needed so assets work when hosted at /flex/ on GitHub Pages
  base: '/flex/',
})
