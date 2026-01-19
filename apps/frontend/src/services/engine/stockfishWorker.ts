// Wrapper worker for Stockfish that configures WASM location
// This solves the production build issue where Vite hashes the JS file
// but stockfish expects the WASM at a matching path

// Configure Module.locateFile BEFORE stockfish loads
// This tells Emscripten where to find the WASM file
(globalThis as unknown as Record<string, unknown>).Module = {
  locateFile: (path: string) => {
    if (path.endsWith('.wasm')) {
      // WASM is served from public folder at a known, unhashed location
      return '/stockfish/stockfish-16.1.wasm';
    }
    return path;
  },
};

// Now import stockfish - it will use our locateFile configuration
import 'stockfish/src/stockfish-16.1.js';
