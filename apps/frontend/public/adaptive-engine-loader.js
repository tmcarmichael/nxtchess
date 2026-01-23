// Adaptive Stockfish Engine Preloader
// Detects device capabilities and preloads the appropriate engine variant
(function () {
  // Check if we can use multi-threaded engine (requires SharedArrayBuffer)
  var canUseMultiThreaded =
    typeof SharedArrayBuffer !== 'undefined' &&
    typeof crossOriginIsolated !== 'undefined' &&
    crossOriginIsolated;

  // Check network conditions for adaptive loading
  var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  var shouldPreloadFull =
    canUseMultiThreaded && connection && connection.effectiveType === '4g' && !connection.saveData;

  // Create preload link for appropriate engine
  var preloadLink = document.createElement('link');
  preloadLink.rel = 'preload';
  preloadLink.as = 'fetch';
  preloadLink.crossOrigin = 'anonymous';

  if (shouldPreloadFull) {
    preloadLink.href = '/stockfish/stockfish-16.1.wasm';
  } else {
    // Default to lite 7MB version for mobile/slow connections
    preloadLink.href = '/stockfish/stockfish-16.1-lite.wasm';
  }

  document.head.appendChild(preloadLink);
})();
