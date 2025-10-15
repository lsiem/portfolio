import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Set base to '/' for custom domain (lsiem.de) or '/portfolio/' for GitHub Pages subdomain
  base: '/',
  plugins: [react(), tailwindcss()],
})
