/**
 * AssetPreloader - Proactive asset loading for offline support
 *
 * Eagerly fetches all critical assets on app load to ensure
 * full offline functionality within ~10 seconds of page load.
 */

// Chess piece SVGs (12 pieces)
const CHESS_PIECES = [
  '/assets/wP.svg',
  '/assets/wN.svg',
  '/assets/wB.svg',
  '/assets/wR.svg',
  '/assets/wQ.svg',
  '/assets/wK.svg',
  '/assets/bP.svg',
  '/assets/bN.svg',
  '/assets/bB.svg',
  '/assets/bR.svg',
  '/assets/bQ.svg',
  '/assets/bK.svg',
];

// Board and UI assets
const UI_ASSETS = [
  '/assets/board.svg',
  '/assets/trainingModeAggressive.svg',
  '/assets/trainingModeDefensive.svg',
  '/assets/trainingModeBalanced.svg',
  '/assets/trainingModeRandom.svg',
  '/assets/trainingModePositional.svg',
];

// All critical image assets
const CRITICAL_ASSETS = [...CHESS_PIECES, ...UI_ASSETS];

// Stockfish WASM (lite variant for broad compatibility)
const WASM_URL = '/stockfish/stockfish-16.1-lite-single.wasm';

/**
 * Preloads critical image assets using <link rel="preload">.
 * This is high-priority and non-blocking.
 */
export function preloadCriticalAssets(): void {
  CRITICAL_ASSETS.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
}

/**
 * Preloads the Stockfish WASM file via fetch.
 * The service worker's CacheFirst strategy will cache it.
 * Returns a promise that resolves when cached (or fails silently).
 */
export function preloadWasm(): Promise<void> {
  return fetch(WASM_URL)
    .then(() => {
      // WASM cached successfully
    })
    .catch(() => {
      // Silent fail - engine will fetch when needed as fallback
    });
}

/**
 * Preloads self-hosted font files.
 * Called after critical assets to avoid competing for bandwidth.
 */
export function preloadFonts(): void {
  const fonts = [
    '/fonts/outfit-variable.woff2', // Variable font covers weights 300-700
    '/fonts/space-mono-400.woff2',
    '/fonts/space-mono-700.woff2',
  ];

  fonts.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.href = url;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

/**
 * Initializes all offline asset preloading.
 * Call this once at app bootstrap.
 */
export function initOfflineSupport(): void {
  // 1. Preload critical images immediately (highest priority)
  preloadCriticalAssets();

  // 2. Preload fonts (high priority, needed for render)
  preloadFonts();

  // 3. Start WASM fetch (larger file, runs in parallel)
  preloadWasm();
}
