// ============================================================================
// Types
// ============================================================================

export type EngineErrorCode =
  | 'INIT_TIMEOUT'
  | 'OPERATION_TIMEOUT'
  | 'NOT_INITIALIZED'
  | 'WORKER_ERROR';

export class EngineError extends Error {
  constructor(
    message: string,
    public readonly code: EngineErrorCode
  ) {
    super(message);
    this.name = 'EngineError';
  }
}

export interface EngineConfig {
  /** Timeout for initialization in milliseconds */
  initTimeoutMs?: number;
  /** Default timeout for operations in milliseconds */
  operationTimeoutMs?: number;
  /** Name for logging purposes */
  name?: string;
}

// ============================================================================
// StockfishEngine Class
// ============================================================================

const DEFAULT_CONFIG: Required<EngineConfig> = {
  initTimeoutMs: 15000,
  operationTimeoutMs: 15000,
  name: 'StockfishEngine',
};

// ============================================================================
// Browser & Device Detection
// ============================================================================

/**
 * Available Stockfish engine variants, ordered by capability.
 *
 * - full-mt: Full NNUE, multi-threaded (69MB) - fastest, requires SharedArrayBuffer
 * - full-st: Full NNUE, single-threaded (69MB) - desktop fallback
 * - lite-st: Lite NNUE, single-threaded (7MB) - mobile optimized
 */
export type EngineVariant = 'full-mt' | 'full-st' | 'lite-st';

const ENGINE_PATHS: Record<EngineVariant, string> = {
  'full-mt': '/stockfish/stockfish-16.1.js',
  'full-st': '/stockfish/stockfish-16.1-single.js',
  'lite-st': '/stockfish/stockfish-16.1-lite-single.js',
};

/**
 * Detect if the device is a mobile device (phone or tablet).
 * Uses multiple signals for reliable detection.
 */
function isMobileDevice(): boolean {
  // Guard for SSR/non-browser environments (e.g., Node.js, tests)
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  // Check for touch capability + small screen (phones)
  // or touch + medium screen (tablets)
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Check user agent for mobile indicators
  const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  // iPad on iOS 13+ reports as Mac, so check for touch + Mac
  const isIPad = navigator.userAgent.includes('Mac') && hasTouch && navigator.maxTouchPoints > 1;

  // Consider it mobile if UA indicates mobile OR it's an iPad
  return mobileUA || isIPad;
}

/**
 * Detect if the browser supports SharedArrayBuffer and Atomics,
 * which are required for multi-threaded Stockfish WASM.
 */
function hasMultiThreadSupport(): boolean {
  try {
    // Check if SharedArrayBuffer and Atomics are available
    if (typeof SharedArrayBuffer === 'undefined' || typeof Atomics === 'undefined') {
      return false;
    }

    // Check if the page is cross-origin isolated (COOP/COEP headers present)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const global = globalThis as any;
    if ('crossOriginIsolated' in global && !global.crossOriginIsolated) {
      return false;
    }

    // Try to actually create a SharedArrayBuffer to verify it works
    new SharedArrayBuffer(1);

    return true;
  } catch {
    return false;
  }
}

/** Cached detection results */
let _engineVariant: EngineVariant | null = null;
let _isMobile: boolean | null = null;

/**
 * Detect the best engine variant for this device/browser.
 *
 * Selection logic:
 * - Desktop with SharedArrayBuffer → full-mt (multi-threaded, fastest)
 * - Everything else → lite-st (7MB, fast loading, broad compatibility)
 *
 * We use the lite engine for all fallback cases because:
 * - 7MB vs 69MB makes a huge difference in load time
 * - The lite NNUE is still strong enough for most use cases
 * - Better UX to load fast than to have marginally better analysis
 */
export function detectEngineVariant(): EngineVariant {
  if (_engineVariant === null) {
    _isMobile = isMobileDevice();
    const hasThreads = hasMultiThreadSupport();

    if (hasThreads) {
      // Desktop with thread support: use full multi-threaded (fastest, best analysis)
      _engineVariant = 'full-mt';
    } else {
      // Everything else: use lite single-threaded
      // This covers: mobile, Safari, Firefox without COOP/COEP, older browsers, etc.
      // The 7MB file loads ~10x faster than the 69MB alternatives
      _engineVariant = 'lite-st';
    }

    console.warn(
      `Stockfish engine: ${_engineVariant} (${_isMobile ? 'mobile' : 'desktop'}, threads: ${hasThreads})`
    );
  }

  return _engineVariant;
}

/**
 * Check if running on a mobile device.
 */
export function isMobile(): boolean {
  if (_isMobile === null) {
    detectEngineVariant(); // This will set _isMobile
  }
  return _isMobile!;
}

/**
 * Get whether the browser supports multi-threaded Stockfish.
 * @deprecated Use detectEngineVariant() instead for full detection.
 */
export function supportsMultiThreaded(): boolean {
  return detectEngineVariant() === 'full-mt';
}

/**
 * A reusable wrapper around the Stockfish web worker that handles:
 * - Worker lifecycle (creation, termination)
 * - UCI protocol initialization
 * - Message/error event handling with automatic cleanup
 * - Timeout support for all operations
 */
export class StockfishEngine {
  private worker: Worker | null = null;
  private _isInitialized = false;
  private config: Required<EngineConfig>;

  constructor(config: EngineConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  /**
   * Initialize the Stockfish engine.
   * Terminates any existing worker before creating a new one.
   *
   * Automatically selects the appropriate engine variant:
   * - Mobile → lite-st (7MB, single-threaded, memory optimized)
   * - Desktop with SharedArrayBuffer → full-mt (69MB, multi-threaded, fastest)
   * - Desktop without SharedArrayBuffer → full-st (69MB, single-threaded)
   */
  async init(): Promise<void> {
    this.terminate();
    this._isInitialized = false;

    try {
      // Select engine variant based on device type and browser capabilities
      const variant = detectEngineVariant();
      const enginePath = ENGINE_PATHS[variant];

      // Load stockfish directly from public folder where both JS and WASM are co-located
      // This ensures the WASM file is always found regardless of bundling
      this.worker = new Worker(enginePath);

      this.worker.onerror = (e) => {
        console.error(`${this.config.name} worker error:`, e);
        this._isInitialized = false;
      };

      this.postMessage('uci');
      await this.waitForReady();
      this.postMessage('ucinewgame');
      await this.waitForReady();

      this._isInitialized = true;
    } catch (err) {
      this.terminate();
      throw err;
    }
  }

  /**
   * Terminate the worker and clean up resources.
   */
  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this._isInitialized = false;
  }

  /**
   * Send a UCI command to the engine.
   * @throws EngineError if worker is not created
   */
  postMessage(command: string): void {
    if (!this.worker) {
      throw new EngineError(`${this.config.name} not created`, 'NOT_INITIALIZED');
    }
    this.worker.postMessage(command);
  }

  /**
   * Wait for the engine to be ready (sends "isready", waits for "readyok").
   */
  async waitForReady(): Promise<void> {
    if (!this.worker) {
      throw new EngineError(`${this.config.name} not created`, 'NOT_INITIALIZED');
    }

    const promise = new Promise<void>((resolve, reject) => {
      const onMessage = (e: MessageEvent) => {
        if (typeof e.data === 'string' && e.data.includes('readyok')) {
          this.worker?.removeEventListener('message', onMessage);
          this.worker?.removeEventListener('error', onError);
          resolve();
        }
      };

      const onError = (e: ErrorEvent) => {
        this.worker?.removeEventListener('message', onMessage);
        this.worker?.removeEventListener('error', onError);
        reject(new EngineError(`${this.config.name} error: ${e.message}`, 'WORKER_ERROR'));
      };

      this.worker!.addEventListener('message', onMessage);
      this.worker!.addEventListener('error', onError);
      this.worker!.postMessage('isready');
    });

    return this.withTimeout(
      promise,
      this.config.initTimeoutMs,
      `${this.config.name} initialization timed out`
    );
  }

  /**
   * Send one or more UCI commands and wait for a response matching the matcher.
   *
   * @param commands - Single command or array of commands to send
   * @param matcher - Function that receives message data and returns a result when matched, or null/undefined to keep waiting
   * @param timeoutMs - Optional timeout override (defaults to operationTimeoutMs)
   * @returns The matched result from the matcher function
   * @throws EngineError if not initialized or on timeout
   */
  async sendCommand<T>(
    commands: string | string[],
    matcher: (data: string) => T | null | undefined,
    timeoutMs?: number
  ): Promise<T> {
    if (!this.worker || !this._isInitialized) {
      throw new EngineError(`${this.config.name} not initialized`, 'NOT_INITIALIZED');
    }

    const cmds = Array.isArray(commands) ? commands : [commands];

    const promise = new Promise<T>((resolve, reject) => {
      const onMessage = (e: MessageEvent) => {
        const data = e.data as string;
        const result = matcher(data);
        if (result !== null && result !== undefined) {
          this.worker?.removeEventListener('message', onMessage);
          this.worker?.removeEventListener('error', onError);
          resolve(result);
        }
      };

      const onError = (e: ErrorEvent) => {
        this.worker?.removeEventListener('message', onMessage);
        this.worker?.removeEventListener('error', onError);
        reject(new EngineError(`${this.config.name} error: ${e.message}`, 'WORKER_ERROR'));
      };

      this.worker!.addEventListener('message', onMessage);
      this.worker!.addEventListener('error', onError);

      for (const cmd of cmds) {
        this.worker!.postMessage(cmd);
      }
    });

    const timeout = timeoutMs ?? this.config.operationTimeoutMs;
    return this.withTimeout(promise, timeout, `${this.config.name} operation timed out`);
  }

  /**
   * Listen to all messages from the engine (useful for accumulating results).
   * Returns a cleanup function to remove the listener.
   */
  onMessage(handler: (data: string) => void): () => void {
    if (!this.worker) {
      throw new EngineError(`${this.config.name} not created`, 'NOT_INITIALIZED');
    }

    const listener = (e: MessageEvent) => {
      handler(e.data as string);
    };

    this.worker.addEventListener('message', listener);
    return () => this.worker?.removeEventListener('message', listener);
  }

  /**
   * Wrap a promise with a timeout.
   */
  private withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new EngineError(errorMessage, 'OPERATION_TIMEOUT'));
      }, timeoutMs);

      promise
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }
}
