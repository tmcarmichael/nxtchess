import { existsSync, createReadStream } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import { VitePWA } from 'vite-plugin-pwa';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    solid(),
    // Copy stockfish files from node_modules to dist during build
    // Only copy the variants actually used (see StockfishEngine.ts ENGINE_PATHS):
    // - full-mt: stockfish-16.1.js/.wasm (multi-threaded, 69MB)
    // - full-st: stockfish-16.1-single.js/.wasm (single-threaded, 69MB)
    // - lite-st: stockfish-16.1-lite-single.js/.wasm (mobile, 7MB)
    viteStaticCopy({
      targets: [
        {
          src: [
            'node_modules/stockfish/src/stockfish-16.1.js',
            'node_modules/stockfish/src/stockfish-16.1.wasm',
            'node_modules/stockfish/src/stockfish-16.1-single.js',
            'node_modules/stockfish/src/stockfish-16.1-single.wasm',
            'node_modules/stockfish/src/stockfish-16.1-lite-single.js',
            'node_modules/stockfish/src/stockfish-16.1-lite-single.wasm',
          ],
          dest: 'stockfish',
        },
      ],
    }),
    // Serve stockfish from node_modules during development
    {
      name: 'serve-stockfish-dev',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.startsWith('/stockfish/')) {
            const filename = req.url.replace('/stockfish/', '');
            const filepath = resolve(__dirname, 'node_modules/stockfish/src', filename);

            if (existsSync(filepath)) {
              const contentType = filename.endsWith('.wasm')
                ? 'application/wasm'
                : 'application/javascript';
              res.setHeader('Content-Type', contentType);
              res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
              res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
              createReadStream(filepath).pipe(res);
              return;
            }
          }
          next();
        });
      },
    },
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
        navigateFallbackDenylist: [
          /\/auth\//,
          /\/api\//,
          /\/ws/,
          /\/health/,
          /\/metrics/,
          /\/check-username/,
          /\/set-username/,
          /\/set-profile-icon/,
        ],
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
