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
 * Initializes all offline asset preloading.
 * Call this once at app bootstrap.
 */
export function initOfflineSupport(): void {
  preloadCriticalAssets();
  preloadWasm();
}
