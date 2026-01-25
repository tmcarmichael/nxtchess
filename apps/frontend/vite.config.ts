import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    solid(),
    // Stockfish files are in public/stockfish/ and served automatically
    // No viteStaticCopy or custom middleware needed
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'stockfish/**/*'],
      devOptions: {
        enabled: true,
        suppressWarnings: true,
        type: 'module',
      },
      manifest: {
        name: 'NXT Chess',
        short_name: 'NXT Chess',
        description: 'Real-time multiplayer chess with AI training',
        id: '/nxtchess',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'portrait',
        categories: ['games', 'entertainment', 'education'],
        icons: [
          {
            src: '/icons/icon-72.png',
            sizes: '72x72',
            type: 'image/png',
          },
          {
            src: '/icons/icon-96.png',
            sizes: '96x96',
            type: 'image/png',
          },
          {
            src: '/icons/icon-120.png',
            sizes: '120x120',
            type: 'image/png',
          },
          {
            src: '/icons/icon-128.png',
            sizes: '128x128',
            type: 'image/png',
          },
          {
            src: '/icons/icon-144.png',
            sizes: '144x144',
            type: 'image/png',
          },
          {
            src: '/icons/icon-152.png',
            sizes: '152x152',
            type: 'image/png',
          },
          {
            src: '/icons/icon-167.png',
            sizes: '167x167',
            type: 'image/png',
          },
          {
            src: '/icons/icon-180.png',
            sizes: '180x180',
            type: 'image/png',
          },
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-384.png',
            sizes: '384x384',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          {
            name: 'New Game',
            short_name: 'Play',
            url: '/play',
            description: 'Start a new chess game',
            icons: [{ src: '/icons/shortcut-play.png', sizes: '96x96', type: 'image/png' }],
          },
          {
            name: 'Train',
            short_name: 'Train',
            url: '/training',
            description: 'Practice with AI evaluation',
            icons: [{ src: '/icons/shortcut-train.png', sizes: '96x96', type: 'image/png' }],
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Activate new service worker immediately for faster offline readiness
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /\.wasm$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'wasm-cache',
              expiration: {
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          {
            urlPattern: /\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
            },
          },
        ],
        navigateFallbackDenylist: [/\/ws/],
      },
    }),
  ],
  resolve: {
    alias: {
      '@components': '/src/components',
      '@services': '/src/services',
      '@store': '/src/store',
      '@shared': '/src/shared',
      '@types': '/src/types',
    },
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless',
    },
  },
});
