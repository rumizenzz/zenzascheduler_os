import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      srcDir: 'src',
      filename: 'sw.ts',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'ZenzaLife Scheduler',
        short_name: 'ZenzaLife',
        description: 'Dreamlike family scheduler and life management platform.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2B5D3A',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      external: ["workbox-window"],
    },
  },
})

