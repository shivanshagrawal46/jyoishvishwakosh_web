import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'https://www.jyotishvishwakosh.in',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
      // Proxy for auth API on .shop domain - same as other APIs
      '/auth-api': {
        target: 'https://www.jyotishvishwakosh.shop',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/auth-api/, '/api'),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxy Auth Request:', req.method, req.url)
          })
          proxy.on('error', (err, req, res) => {
            console.error('Proxy Auth Error:', err)
          })
        }
      }
    }
  }
})
