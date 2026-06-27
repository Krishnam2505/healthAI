import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // This proxy is magical! 
    // Normally, the frontend (running on port 5173) cannot talk to the backend (on port 5001) due to CORS security.
    // By adding this proxy, whenever the frontend tries to fetch '/api/...', Vite intercepts it 
    // and seamlessly forwards it to 'http://localhost:5001/api/...', tricking the browser into 
    // thinking they are running on the exact same server! This bypasses all CORS issues during development.
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  }
})
