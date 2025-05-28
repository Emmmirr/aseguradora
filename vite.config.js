import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api/clientes': {
        target: 'https://4.246.104.44',
        changeOrigin: true
      },
      '/api/reclamaciones': {
        target: 'http://164.92.93.169:8443',
        changeOrigin: true
      },
      '/api/planes': {
        target: 'http://164.92.93.169',
        changeOrigin: true
      },
      '/api/pagos': {
        target: 'http://164.92.93.169:8443',
        changeOrigin: true
      },
      '/api/polizas': {
        target: 'http://164.92.93.169',
        changeOrigin: true
      }
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 8080,
    allowedHosts: [
      'aseguradora-a63xn.ondigitalocean.app',
      'localhost',
      '.ondigitalocean.app'
    ]
  }
})