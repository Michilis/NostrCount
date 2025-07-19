import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          ndk: ['@nostr-dev-kit/ndk'],
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
}) 