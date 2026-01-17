import 'stockfish/src/stockfish-16.1.js';

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
  initTimeoutMs: 10000,
  operationTimeoutMs: 15000,
  name: 'StockfishEngine',
};

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
   */
  async init(): Promise<void> {
    this.terminate();
    this._isInitialized = false;

    try {
      this.worker = new Worker(new URL('stockfish/src/stockfish-16.1.js', import.meta.url));

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
