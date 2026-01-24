// Stockfish Engine Loader
// Eagerly caches the WASM for instant engine initialization on any route.
//
// Uses fetch instead of <link rel="preload"> to avoid "unused preload" warnings
// while ensuring the file is cached and ready. The service worker's CacheFirst
// strategy for .wasm files serves it instantly when the engine initializes.
//
// Future "Power Mode" feature can load full engine (69MB) for users with:
// - SharedArrayBuffer support (crossOriginIsolated === true)
// - Good network (navigator.connection?.effectiveType === '4g')
(function () {
  var wasmUrl = '/stockfish/stockfish-16.1-lite-single.wasm';

  // Wait for idle time to avoid competing with critical resources
  var schedule =
    window.requestIdleCallback ||
    function (cb) {
      setTimeout(cb, 1);
    };

  schedule(function () {
    fetch(wasmUrl).catch(function () {
      // Silent fail - engine will fetch when needed
    });
  });
})();
