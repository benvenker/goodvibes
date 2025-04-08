import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    target: 'esnext',
  },
  server: {
    host: true,
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    proxy: {
      '/websocket': {
        target: 'ws://localhost:8787',
        ws: true,
      },
    },
    allowedHosts: true,
  },
})
