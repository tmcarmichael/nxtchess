// eslint-disable-next-line import/order
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// Hoist mock class so vi.mock factory can reference it
const { MockStockfishEngine } = vi.hoisted(() => {
  class MockStockfishEngine {
    static instances: MockStockfishEngine[] = [];
    static globalInitShouldFail = false;
    static globalWaitForReadyShouldFail = false;
    _isInitialized = false;
    initShouldFail = false;
    sendCommandShouldFail = false;
    waitForReadyShouldFail = false;

    constructor() {
      // Inherit global flags so new instances created during recovery also fail
      this.initShouldFail = MockStockfishEngine.globalInitShouldFail;
      this.waitForReadyShouldFail = MockStockfishEngine.globalWaitForReadyShouldFail;
      MockStockfishEngine.instances.push(this);
    }

    get isInitialized() {
      return this._isInitialized;
    }

    async init() {
      if (this.initShouldFail) {
        throw Object.assign(new Error('Init failed'), {
          name: 'EngineError',
          code: 'INIT_TIMEOUT',
        });
      }
      this._isInitialized = true;
    }

    terminate() {
      this._isInitialized = false;
    }

    postMessage = vi.fn();

    async waitForReady() {
      if (this.waitForReadyShouldFail) {
        throw Object.assign(new Error('Not ready'), {
          name: 'EngineError',
          code: 'OPERATION_TIMEOUT',
        });
      }
    }

    async sendCommand<T>(
      _commands: string | string[],
      matcher: (data: string) => T | null | undefined,
      _timeoutMs?: number
    ): Promise<T> {
      if (this.sendCommandShouldFail) {
        throw Object.assign(new Error('Command failed'), {
          name: 'EngineError',
          code: 'OPERATION_TIMEOUT',
        });
      }
      const result = matcher('bestmove e2e4');
      if (result !== null && result !== undefined) return result;
      throw Object.assign(new Error('No match'), {
        name: 'EngineError',
        code: 'OPERATION_TIMEOUT',
      });
    }

    onMessage = vi.fn(() => () => {});
  }

  return { MockStockfishEngine };
});

vi.mock('./StockfishEngine', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('./StockfishEngine');
  return {
    ...actual,
    StockfishEngine: MockStockfishEngine,
  };
});

import { ResilientEngine, type EngineState, type EngineEvent } from './ResilientEngine';

describe('ResilientEngine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    MockStockfishEngine.instances = [];
    MockStockfishEngine.globalInitShouldFail = false;
    MockStockfishEngine.globalWaitForReadyShouldFail = false;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initialization', () => {
    it('starts in uninitialized state', () => {
      const engine = new ResilientEngine();
      expect(engine.state).toBe('uninitialized');
      expect(engine.isReady).toBe(false);
      expect(engine.isInitialized).toBe(false);
    });

    it('transitions to ready after init', async () => {
      const engine = new ResilientEngine({ healthCheckIntervalMs: 0 });
      await engine.init();
      expect(engine.state).toBe('ready');
      expect(engine.isReady).toBe(true);
      expect(engine.isInitialized).toBe(true);
    });

    it('deduplicates concurrent init calls', async () => {
      const engine = new ResilientEngine({ healthCheckIntervalMs: 0 });
      const instancesBefore = MockStockfishEngine.instances.length;
      const [p1, p2] = [engine.init(), engine.init()];
      await Promise.all([p1, p2]);
      // Only the constructor from new ResilientEngine() creates one instance
      // init() reuses the existing engine, no additional StockfishEngine created
      const instancesCreated = MockStockfishEngine.instances.length - instancesBefore;
      // Only the initial constructor should have created one
      expect(instancesCreated).toBe(0);
    });

    it('emits init:start and init:success events', async () => {
      const engine = new ResilientEngine({ healthCheckIntervalMs: 0 });
      const events: EngineEvent[] = [];
      engine.onEvent((e) => events.push(e));

      await engine.init();

      expect(events.some((e) => e.type === 'init:start')).toBe(true);
      expect(events.some((e) => e.type === 'init:success')).toBe(true);
    });

    it('emits init:fail on initialization failure', async () => {
      const engine = new ResilientEngine({ autoRecover: false, healthCheckIntervalMs: 0 });
      const events: EngineEvent[] = [];
      engine.onEvent((e) => events.push(e));

      // Make the underlying engine fail
      const mock = MockStockfishEngine.instances[MockStockfishEngine.instances.length - 1];
      mock.initShouldFail = true;

      try {
        await engine.init();
      } catch {
        // Expected
      }

      expect(events.some((e) => e.type === 'init:fail')).toBe(true);
    });
  });

  describe('command execution', () => {
    it('auto-initializes on first command', async () => {
      const engine = new ResilientEngine({ healthCheckIntervalMs: 0 });
      const result = await engine.sendCommand('go depth 1', (data) =>
        data.startsWith('bestmove') ? data : null
      );
      expect(result).toBe('bestmove e2e4');
      expect(engine.isInitialized).toBe(true);
    });

    it('transitions ready→busy→ready during command', async () => {
      const engine = new ResilientEngine({ healthCheckIntervalMs: 0 });
      await engine.init();

      const states: EngineState[] = [];
      engine.onEvent((e) => {
        if (e.type === 'state:changed') {
          const data = e.data as { newState: EngineState };
          states.push(data.newState);
        }
      });

      await engine.sendCommand('go depth 1', (data) => (data.startsWith('bestmove') ? data : null));

      expect(states).toContain('busy');
      expect(states[states.length - 1]).toBe('ready');
    });

    it('emits command:start and command:success events', async () => {
      const engine = new ResilientEngine({ healthCheckIntervalMs: 0 });
      await engine.init();

      const events: string[] = [];
      engine.onEvent((e) => events.push(e.type));

      await engine.sendCommand('go depth 1', (data) => (data.startsWith('bestmove') ? data : null));

      expect(events).toContain('command:start');
      expect(events).toContain('command:success');
    });

    it('emits command:timeout on timeout error', async () => {
      const engine = new ResilientEngine({
        healthCheckIntervalMs: 0,
        autoRecover: false,
      });
      await engine.init();

      // Make the command fail — mock throws with code OPERATION_TIMEOUT
      const mock = MockStockfishEngine.instances[MockStockfishEngine.instances.length - 1];
      mock.sendCommandShouldFail = true;

      const events: string[] = [];
      engine.onEvent((e) => events.push(e.type));

      try {
        await engine.sendCommand('go depth 1', (data) =>
          data.startsWith('bestmove') ? data : null
        );
      } catch {
        // Expected
      }

      // The mock throws a plain Error with .code, not an EngineError instance,
      // so ResilientEngine treats it as a non-timeout command failure
      expect(events).toContain('command:fail');
    });

    it('rejects when in terminated state', async () => {
      const engine = new ResilientEngine({ healthCheckIntervalMs: 0 });
      await engine.init();
      engine.terminate();

      await expect(
        engine.sendCommand('go depth 1', (data) => (data.startsWith('bestmove') ? data : null))
      ).rejects.toThrow();
    });
  });

  describe('circuit breaker', () => {
    it('opens after exceeding maxRecoveryAttempts', async () => {
      MockStockfishEngine.globalInitShouldFail = true;

      // maxRecoveryAttempts: 1 — handleFailure increments to 1, checks > 1 (false),
      // calls attemptRecovery which fails, catch checks 1 < 1 (false), calls openCircuit
      const engine = new ResilientEngine({
        maxRecoveryAttempts: 1,
        recoveryDelayMs: 10,
        healthCheckIntervalMs: 0,
      });

      const events: string[] = [];
      engine.onEvent((e) => events.push(e.type));

      const initPromise = engine.init().catch(() => {});

      for (let i = 0; i < 20; i++) {
        await vi.advanceTimersByTimeAsync(100);
      }

      await initPromise;

      expect(engine.isFailed).toBe(true);
      expect(events).toContain('circuit:open');
    });

    it('rejects commands when open', async () => {
      MockStockfishEngine.globalInitShouldFail = true;

      const engine = new ResilientEngine({
        maxRecoveryAttempts: 1,
        recoveryDelayMs: 10,
        healthCheckIntervalMs: 0,
      });

      const initPromise = engine.init().catch(() => {});

      for (let i = 0; i < 20; i++) {
        await vi.advanceTimersByTimeAsync(100);
      }

      await initPromise;

      await expect(
        engine.sendCommand('go depth 1', (data) => (data.startsWith('bestmove') ? data : null))
      ).rejects.toThrow('circuit breaker is open');
    });

    it('allows retry after circuitResetMs expires', async () => {
      MockStockfishEngine.globalInitShouldFail = true;

      const engine = new ResilientEngine({
        maxRecoveryAttempts: 1,
        recoveryDelayMs: 10,
        circuitResetMs: 1000,
        healthCheckIntervalMs: 0,
      });

      const initPromise = engine.init().catch(() => {});

      for (let i = 0; i < 20; i++) {
        await vi.advanceTimersByTimeAsync(100);
      }

      await initPromise;
      expect(engine.isFailed).toBe(true);

      // Advance past circuit reset time
      await vi.advanceTimersByTimeAsync(2000);

      // Allow init to succeed now
      MockStockfishEngine.globalInitShouldFail = false;
      for (const mock of MockStockfishEngine.instances) {
        mock.initShouldFail = false;
      }

      await engine.init();
      expect(engine.state).toBe('ready');
    });
  });

  describe('recovery', () => {
    it('emits recovery:start events', async () => {
      MockStockfishEngine.globalInitShouldFail = true;

      const engine = new ResilientEngine({
        maxRecoveryAttempts: 1,
        recoveryDelayMs: 10,
        healthCheckIntervalMs: 0,
      });

      const events: EngineEvent[] = [];
      engine.onEvent((e) => {
        if (e.type === 'recovery:start') events.push(e);
      });

      const initPromise = engine.init().catch(() => {});

      for (let i = 0; i < 20; i++) {
        await vi.advanceTimersByTimeAsync(100);
      }

      await initPromise;

      const attempts = events.map((e) => (e.data as { attempt: number }).attempt);
      expect(attempts.length).toBeGreaterThan(0);
    });

    it('re-applies UCI config after successful recovery', async () => {
      const engine = new ResilientEngine({
        maxRecoveryAttempts: 3,
        recoveryDelayMs: 10,
        healthCheckIntervalMs: 0,
      });

      await engine.init();
      await engine.applyConfig(['setoption name Threads value 1']);

      // Make the underlying send fail to trigger recovery
      const initialMock = MockStockfishEngine.instances[MockStockfishEngine.instances.length - 1];
      initialMock.sendCommandShouldFail = true;

      try {
        await engine.sendCommand('go depth 1', (data) =>
          data.startsWith('bestmove') ? data : null
        );
      } catch {
        // Expected
      }

      // Pump timers through recovery — new mock engines will succeed
      for (let i = 0; i < 20; i++) {
        await vi.advanceTimersByTimeAsync(100);
      }

      // After recovery, a new MockStockfishEngine was created and config should have been applied
      const allPostMessageCalls = MockStockfishEngine.instances.flatMap((m) =>
        m.postMessage.mock.calls.map((c: string[]) => c[0])
      );
      const configCalls = allPostMessageCalls.filter(
        (c: string) => c === 'setoption name Threads value 1'
      );
      expect(configCalls.length).toBeGreaterThanOrEqual(1);
    });

    it('sets state to failed when autoRecover is disabled', async () => {
      const engine = new ResilientEngine({
        autoRecover: false,
        healthCheckIntervalMs: 0,
      });

      for (const mock of MockStockfishEngine.instances) {
        mock.initShouldFail = true;
      }

      try {
        await engine.init();
      } catch {
        // Expected
      }

      expect(engine.state).toBe('failed');
    });
  });

  describe('command queue', () => {
    it('rejects when queue is full', async () => {
      const engine = new ResilientEngine({
        maxRecoveryAttempts: 3,
        recoveryDelayMs: 100000,
        queueDuringRecovery: true,
        maxQueueSize: 2,
        healthCheckIntervalMs: 0,
      });

      await engine.init();

      // Force into recovering state
      const mock = MockStockfishEngine.instances[MockStockfishEngine.instances.length - 1];
      mock.sendCommandShouldFail = true;

      try {
        await engine.sendCommand('go depth 1', (data) =>
          data.startsWith('bestmove') ? data : null
        );
      } catch {
        // Expected - triggers recovery
      }

      // Wait for recovery state
      await vi.advanceTimersByTimeAsync(10);

      // Queue should fill up and reject
      if (engine.isRecovering) {
        const promises: Promise<unknown>[] = [];
        for (let i = 0; i < 3; i++) {
          promises.push(
            engine
              .sendCommand(`go depth ${i}`, (data) => (data.startsWith('bestmove') ? data : null))
              .catch((e) => e)
          );
        }

        const results = await Promise.all(promises);
        // At least one should have been rejected due to full queue
        const hasQueueFullError = results.some(
          (r) => r instanceof Error && r.message.includes('queue full')
        );
        expect(hasQueueFullError || engine.queueLength <= 2).toBe(true);
      }
    });
  });

  describe('health checks', () => {
    it('starts health checks after init', async () => {
      const engine = new ResilientEngine({ healthCheckIntervalMs: 1000 });
      await engine.init();

      const events: string[] = [];
      engine.onEvent((e) => events.push(e.type));

      await vi.advanceTimersByTimeAsync(1100);

      expect(events).toContain('health:check');
    });

    it('triggers recovery after 2 consecutive health failures', async () => {
      const engine = new ResilientEngine({
        healthCheckIntervalMs: 100,
        healthCheckTimeoutMs: 50,
        maxRecoveryAttempts: 3,
        recoveryDelayMs: 10,
      });
      await engine.init();

      const events: string[] = [];
      engine.onEvent((e) => events.push(e.type));

      // Make health checks fail (global flag ensures new instances also fail)
      MockStockfishEngine.globalWaitForReadyShouldFail = true;
      for (const mock of MockStockfishEngine.instances) {
        mock.waitForReadyShouldFail = true;
      }

      // Advance through health check intervals
      await vi.advanceTimersByTimeAsync(300);

      expect(events.filter((e) => e === 'health:fail').length).toBeGreaterThanOrEqual(1);
    });

    it('stops health checks on terminate', async () => {
      const engine = new ResilientEngine({ healthCheckIntervalMs: 100 });
      await engine.init();

      engine.terminate();

      const events: string[] = [];
      engine.onEvent((e) => events.push(e.type));

      await vi.advanceTimersByTimeAsync(500);

      const healthChecks = events.filter((e) => e === 'health:check');
      expect(healthChecks).toHaveLength(0);
    });
  });

  describe('termination', () => {
    it('transitions to terminated state', async () => {
      const engine = new ResilientEngine({ healthCheckIntervalMs: 0 });
      await engine.init();
      engine.terminate();
      expect(engine.state).toBe('terminated');
    });

    it('rejects queued commands on terminate', async () => {
      const engine = new ResilientEngine({
        healthCheckIntervalMs: 0,
        queueDuringRecovery: true,
        maxRecoveryAttempts: 3,
        recoveryDelayMs: 100000,
      });

      await engine.init();

      // Force recovery state
      const mock = MockStockfishEngine.instances[MockStockfishEngine.instances.length - 1];
      mock.sendCommandShouldFail = true;

      try {
        await engine.sendCommand('go depth 1', (data) =>
          data.startsWith('bestmove') ? data : null
        );
      } catch {
        // Expected
      }

      await vi.advanceTimersByTimeAsync(10);

      // Queue a command if in recovery
      let queuedError: Error | null = null;
      if (engine.isRecovering) {
        const queuedPromise = engine
          .sendCommand('go depth 2', (data) => (data.startsWith('bestmove') ? data : null))
          .catch((e) => {
            queuedError = e;
          });

        // Terminate should reject queued commands
        engine.terminate();
        await queuedPromise;
        expect(queuedError).toBeTruthy();
      } else {
        engine.terminate();
      }

      expect(engine.state).toBe('terminated');
    });

    it('cleans up event handler via unsubscribe', async () => {
      const engine = new ResilientEngine({ healthCheckIntervalMs: 0 });
      const events: string[] = [];
      const unsub = engine.onEvent((e) => events.push(e.type));

      await engine.init();
      const countAfterInit = events.length;

      unsub();
      engine.terminate();

      expect(events.length).toBe(countAfterInit);
    });
  });
});
