import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const THEME_COLOR = '#2f74e8'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // New SW activates right away (skipWaiting + clientsClaim), but the page is not reloaded:
      // a forced reload mid-workout would drop the form draft. The new version is used on next launch.
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'GymLog — дневник тренировок',
        short_name: 'GymLog',
        description: 'Тренировочный дневник: подходы, история тренировок и замеры тела',
        lang: 'ru',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: THEME_COLOR,
        background_color: '#f7f7f8',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        // SPA routes offline: navigation requests get the precached index.html.
        navigateFallback: 'index.html',
        // API is proxied on the same origin: opening /api/... directly must hit the network.
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  // Same origin as in prod (Vercel rewrite): no CORS, SameSite=Strict refresh cookie works.
  server: {
    proxy: { '/api': 'http://localhost:3000' },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
