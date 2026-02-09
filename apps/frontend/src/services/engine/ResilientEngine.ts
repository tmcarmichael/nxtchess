import { StockfishEngine, EngineError, type EngineConfig } from './StockfishEngine';

export type EngineState =
  | 'uninitialized'
  | 'initializing'
  | 'ready'
  | 'busy'
  | 'recovering'
  | 'failed'
  | 'terminated';

export type EngineEventType =
  | 'state:changed'
  | 'init:start'
  | 'init:success'
  | 'init:fail'
  | 'command:start'
  | 'command:success'
  | 'command:fail'
  | 'command:timeout'
  | 'health:check'
  | 'health:fail'
  | 'recovery:start'
  | 'recovery:success'
  | 'recovery:fail'
  | 'circuit:open'
  | 'circuit:close';

export interface EngineEvent {
  type: EngineEventType;
  engineId: string;
  timestamp: number;
  data?: unknown;
}

export type EngineEventHandler = (event: EngineEvent) => void;

export interface ResilientEngineConfig extends EngineConfig {
  /** Enable auto-recovery on failure. Default: true */
  autoRecover: boolean;
  /** Maximum recovery attempts before circuit opens. Default: 3 */
  maxRecoveryAttempts: number;
  /** Base delay between recovery attempts (ms). Default: 1000 */
  recoveryDelayMs: number;
  /** Maximum recovery delay with backoff (ms). Default: 30000 */
  maxRecoveryDelayMs: number;
  /** Health check interval (ms). Default: 30000. Set to 0 to disable. */
  healthCheckIntervalMs: number;
  /** Health check timeout (ms). Default: 5000 */
  healthCheckTimeoutMs: number;
  /** Time before circuit breaker resets (ms). Default: 60000 */
  circuitResetMs: number;
  /** Queue commands during recovery. Default: true */
  queueDuringRecovery: boolean;
  /** Max queued commands. Default: 10 */
  maxQueueSize: number;
}

interface QueuedCommand<T> {
  commands: string | string[];
  matcher: (data: string) => T | null | undefined;
  timeoutMs: number;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  queuedAt: number;
}

const DEFAULT_CONFIG: ResilientEngineConfig = {
  name: 'ResilientEngine',
  initTimeoutMs: 10000,
  operationTimeoutMs: 15000,
  autoRecover: true,
  maxRecoveryAttempts: 3,
  recoveryDelayMs: 1000,
  maxRecoveryDelayMs: 30000,
  healthCheckIntervalMs: 30000,
  healthCheckTimeoutMs: 5000,
  circuitResetMs: 60000,
  queueDuringRecovery: true,
  maxQueueSize: 10,
};

let engineIdCounter = 0;

export class ResilientEngine {
  private readonly id: string;
  private engine: StockfishEngine;
  private config: ResilientEngineConfig;
  private _state: EngineState = 'uninitialized';
  private eventHandlers: Set<EngineEventHandler> = new Set();

  // Recovery state
  private recoveryAttempts: number = 0;
  private lastFailureTime: number = 0;
  private circuitOpen: boolean = false;

  // Health check
  private healthCheckTimer: ReturnType<typeof setInterval> | null = null;
  private consecutiveHealthFailures: number = 0;

  // Command queue
  private commandQueue: QueuedCommand<unknown>[] = [];
  private isProcessingQueue: boolean = false;

  // Pending initialization promise
  private initPromise: Promise<void> | null = null;

  // Configuration applied to engine
  private appliedConfig: { commands: string[] } | null = null;

  constructor(config: Partial<ResilientEngineConfig> = {}) {
    this.id = `engine-${++engineIdCounter}`;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.engine = new StockfishEngine({
      name: this.config.name,
      initTimeoutMs: this.config.initTimeoutMs,
      operationTimeoutMs: this.config.operationTimeoutMs,
    });
  }

  get engineId(): string {
    return this.id;
  }

  get state(): EngineState {
    return this._state;
  }

  get isReady(): boolean {
    return this._state === 'ready';
  }

  get isInitialized(): boolean {
    return this._state === 'ready' || this._state === 'busy';
  }

  get isFailed(): boolean {
    return this._state === 'failed' || this.circuitOpen;
  }

  get isRecovering(): boolean {
    return this._state === 'recovering';
  }

  get queueLength(): number {
    return this.commandQueue.length;
  }

  async init(): Promise<void> {
    // If already initializing, return existing promise
    if (this.initPromise && this._state === 'initializing') {
      return this.initPromise;
    }

    // Check circuit breaker
    if (this.circuitOpen) {
      if (Date.now() - this.lastFailureTime < this.config.circuitResetMs) {
        throw new EngineError(`${this.config.name} circuit breaker is open`, 'NOT_INITIALIZED');
      }
      // Circuit timeout expired, allow retry
      this.closeCircuit();
    }

    this.initPromise = this.doInit();
    return this.initPromise;
  }

  private async doInit(): Promise<void> {
    this.setState('initializing');
    this.emit('init:start');

    try {
      await this.engine.init();
      this.setState('ready');
      this.emit('init:success');
      this.recoveryAttempts = 0;
      this.startHealthChecks();
    } catch (err) {
      this.emit('init:fail', { error: err });
      await this.handleFailure(err);
      throw err;
    } finally {
      this.initPromise = null;
    }
  }

  async sendCommand<T>(
    commands: string | string[],
    matcher: (data: string) => T | null | undefined,
    timeoutMs?: number
  ): Promise<T> {
    const timeout = timeoutMs ?? this.config.operationTimeoutMs ?? 15000;

    // If recovering and queueing enabled, queue the command
    if (this._state === 'recovering' && this.config.queueDuringRecovery) {
      return this.queueCommand(commands, matcher, timeout);
    }

    // If not ready, try to initialize or fail
    if (!this.isInitialized) {
      if (this.circuitOpen) {
        throw new EngineError(`${this.config.name} circuit breaker is open`, 'NOT_INITIALIZED');
      }

      // Auto-init if uninitialized
      if (this._state === 'uninitialized') {
        await this.init();
      } else if (this._state === 'initializing') {
        await this.initPromise;
      } else {
        throw new EngineError(`${this.config.name} is in state ${this._state}`, 'NOT_INITIALIZED');
      }
    }

    return this.executeCommand(commands, matcher, timeout);
  }

  private async executeCommand<T>(
    commands: string | string[],
    matcher: (data: string) => T | null | undefined,
    timeoutMs: number
  ): Promise<T> {
    const previousState = this._state;
    this.setState('busy');
    this.emit('command:start', { commands });

    try {
      const result = await this.engine.sendCommand(commands, matcher, timeoutMs);
      this.setState('ready');
      this.emit('command:success', { commands, result });
      return result;
    } catch (err) {
      const isTimeout = err instanceof EngineError && err.code === 'OPERATION_TIMEOUT';

      this.emit(isTimeout ? 'command:timeout' : 'command:fail', {
        commands,
        error: err,
      });

      // Restore previous state or handle failure
      if (isTimeout) {
        // Timeout might mean engine is stuck - trigger recovery
        await this.handleFailure(err);
      } else {
        this.setState(previousState === 'busy' ? 'ready' : previousState);
      }

      throw err;
    }
  }

  postMessage(command: string): void {
    if (!this.isInitialized) {
      throw new EngineError(`${this.config.name} not initialized`, 'NOT_INITIALIZED');
    }
    this.engine.postMessage(command);
  }

  async waitForReady(): Promise<void> {
    if (!this.isInitialized) {
      throw new EngineError(`${this.config.name} not initialized`, 'NOT_INITIALIZED');
    }
    await this.engine.waitForReady();
  }

  /**
   * Apply UCI configuration commands. These will be re-applied after recovery.
   */
  async applyConfig(commands: string[]): Promise<void> {
    this.appliedConfig = { commands };

    if (!this.isInitialized) return;

    for (const cmd of commands) {
      this.engine.postMessage(cmd);
    }
    await this.engine.waitForReady();
  }

  /**
   * Reset for new game. Call this when reusing engine from pool.
   */
  async resetForNewGame(): Promise<void> {
    if (!this.isInitialized) return;

    this.engine.postMessage('ucinewgame');
    await this.engine.waitForReady();
  }

  terminate(): void {
    this.stopHealthChecks();
    this.rejectAllQueued(new EngineError('Engine terminated', 'NOT_INITIALIZED'));
    this.engine.terminate();
    this.setState('terminated');
    this.initPromise = null;
  }

  onEvent(handler: EngineEventHandler): () => void {
    this.eventHandlers.add(handler);
    return () => {
      this.eventHandlers.delete(handler);
    };
  }

  private emit(type: EngineEventType, data?: unknown): void {
    const event: EngineEvent = {
      type,
      engineId: this.id,
      timestamp: Date.now(),
      data,
    };

    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch {
        // Event handler error - non-fatal
      }
    }
  }

  private startHealthChecks(): void {
    if (this.config.healthCheckIntervalMs <= 0) return;

    this.stopHealthChecks();
    this.healthCheckTimer = setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckIntervalMs);
  }

  private stopHealthChecks(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }

  private async performHealthCheck(): Promise<void> {
    if (this._state !== 'ready') return;

    this.emit('health:check');

    try {
      // Send isready and wait for readyok with timeout
      await this.withTimeout(
        this.engine.waitForReady(),
        this.config.healthCheckTimeoutMs,
        'Health check timeout'
      );
      this.consecutiveHealthFailures = 0;
    } catch (err) {
      this.consecutiveHealthFailures++;
      this.emit('health:fail', {
        error: err,
        consecutiveFailures: this.consecutiveHealthFailures,
      });

      // Trigger recovery after multiple failures
      if (this.consecutiveHealthFailures >= 2) {
        await this.handleFailure(err);
      }
    }
  }

  private async handleFailure(_error: unknown): Promise<void> {
    this.lastFailureTime = Date.now();

    if (!this.config.autoRecover) {
      this.setState('failed');
      return;
    }

    // Check if we should open circuit
    this.recoveryAttempts++;
    if (this.recoveryAttempts > this.config.maxRecoveryAttempts) {
      this.openCircuit();
      return;
    }

    await this.attemptRecovery();
  }

  private async attemptRecovery(): Promise<void> {
    this.setState('recovering');
    this.emit('recovery:start', { attempt: this.recoveryAttempts });

    // Calculate delay with exponential backoff
    const delay = Math.min(
      this.config.recoveryDelayMs * Math.pow(2, this.recoveryAttempts - 1),
      this.config.maxRecoveryDelayMs
    );

    await this.sleep(delay);

    try {
      // Terminate and reinitialize
      this.engine.terminate();
      this.engine = new StockfishEngine({
        name: this.config.name,
        initTimeoutMs: this.config.initTimeoutMs,
        operationTimeoutMs: this.config.operationTimeoutMs,
      });

      await this.engine.init();

      // Re-apply configuration
      if (this.appliedConfig) {
        for (const cmd of this.appliedConfig.commands) {
          this.engine.postMessage(cmd);
        }
        await this.engine.waitForReady();
      }

      this.setState('ready');
      this.emit('recovery:success');
      this.recoveryAttempts = 0;
      this.consecutiveHealthFailures = 0;
      this.startHealthChecks();

      // Process queued commands
      this.processQueue();
    } catch (err) {
      this.emit('recovery:fail', { error: err, attempt: this.recoveryAttempts });

      // Retry or fail
      if (this.recoveryAttempts < this.config.maxRecoveryAttempts) {
        await this.attemptRecovery();
      } else {
        this.openCircuit();
      }
    }
  }

  private openCircuit(): void {
    this.circuitOpen = true;
    this.setState('failed');
    this.emit('circuit:open');
    this.rejectAllQueued(new EngineError('Circuit breaker opened', 'NOT_INITIALIZED'));
  }

  private closeCircuit(): void {
    this.circuitOpen = false;
    this.recoveryAttempts = 0;
    this.emit('circuit:close');
  }

  private queueCommand<T>(
    commands: string | string[],
    matcher: (data: string) => T | null | undefined,
    timeoutMs: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (this.commandQueue.length >= this.config.maxQueueSize) {
        reject(new EngineError('Command queue full', 'OPERATION_TIMEOUT'));
        return;
      }

      this.commandQueue.push({
        commands,
        matcher: matcher as (data: string) => unknown,
        timeoutMs,
        resolve: resolve as (value: unknown) => void,
        reject,
        queuedAt: Date.now(),
      });
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.commandQueue.length === 0) return;

    this.isProcessingQueue = true;

    while (this.commandQueue.length > 0 && this._state === 'ready') {
      const cmd = this.commandQueue.shift()!;

      // Check if command has been waiting too long
      if (Date.now() - cmd.queuedAt > cmd.timeoutMs) {
        cmd.reject(new EngineError('Queued command timed out', 'OPERATION_TIMEOUT'));
        continue;
      }

      try {
        const result = await this.executeCommand(cmd.commands, cmd.matcher, cmd.timeoutMs);
        cmd.resolve(result);
      } catch (err) {
        cmd.reject(err as Error);
      }
    }

    this.isProcessingQueue = false;
  }

  private rejectAllQueued(error: Error): void {
    while (this.commandQueue.length > 0) {
      const cmd = this.commandQueue.shift()!;
      cmd.reject(error);
    }
  }

  private setState(newState: EngineState): void {
    const oldState = this._state;
    if (oldState === newState) return;

    this._state = newState;
    this.emit('state:changed', { oldState, newState });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new EngineError(message, 'OPERATION_TIMEOUT'));
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
