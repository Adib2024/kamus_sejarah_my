import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// base relatif supaya app berfungsi di mana-mana hos (GitHub Pages, Vercel, dll.)
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,woff2}'] },
      manifest: {
        name: 'Kamus Sejarah MY',
        short_name: 'Kamus Sejarah',
        description: 'Kamus istilah Sejarah untuk guru dan pelajar.',
        lang: 'ms',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        theme_color: '#1f3a5f',
        background_color: '#f7f4ee',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
