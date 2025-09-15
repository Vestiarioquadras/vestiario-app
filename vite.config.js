import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    host: true,
    https: false, // Para PWA, considere usar HTTPS em produção
    hmr: {
      port: 3001 // Porta diferente para WebSocket
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          antd: ['antd', '@ant-design/icons']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'antd', '@ant-design/icons']
  },
  // Configurações para PWA
  define: {
    __PWA_ENABLED__: true
  }
})
