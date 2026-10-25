import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Matches --color-surface (dark theme): status bar and splash blend with the page.
const THEME_COLOR = '#100d1b'

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
        background_color: THEME_COLOR,
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: [
          '**/*.{js,css,html,svg,png,webmanifest}',
          // Only the Latin and Cyrillic font subsets: the UI never needs greek/vietnamese/*-ext.
          'assets/*-{latin,cyrillic}-wght-normal-*.woff2',
        ],
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
