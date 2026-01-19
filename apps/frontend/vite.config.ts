import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    solid(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/stockfish/src/stockfish-16.1.wasm',
          dest: 'assets',
        },
      ],
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
