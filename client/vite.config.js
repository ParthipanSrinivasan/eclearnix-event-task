import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Forward API calls to the Express server during development.
    // Set API_URL to point at a server on another port.
    proxy: {
      '/api': process.env.API_URL ?? 'http://localhost:5000',
    },
  },
})
