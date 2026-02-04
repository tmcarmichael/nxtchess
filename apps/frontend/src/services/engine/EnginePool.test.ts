// eslint-disable-next-line import/order
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// Hoist mock class so vi.mock factory can reference it
const { MockResilientEngine, mockEngineIdRef } = vi.hoisted(() => {
  const mockEngineIdRef = { value: 0 };

  class MockResilientEngine {
    readonly engineId: string;
    private _state = 'uninitialized';
    private _isFailed = false;
    private _isRecovering = false;

    constructor() {
      this.engineId = `mock-engine-${++mockEngineIdRef.value}`;
    }

    get state() {
      return this._state;
    }
    get isReady() {
      return this._state === 'ready';
    }
    get isInitialized() {
      return this._state === 'ready' || this._state === 'busy';
    }
    get isFailed() {
      return this._isFailed;
    }
    get isRecovering() {
      return this._isRecovering;
    }

    setFailed() {
      this._isFailed = true;
      this._state = 'failed';
    }

    async init() {
      this._state = 'ready';
    }

    terminate = vi.fn(() => {
      this._state = 'terminated';
    });

    resetForNewGame = vi.fn(async () => {});
    onEvent = vi.fn(() => () => {});
    sendCommand = vi.fn();
    applyConfig = vi.fn();
    postMessage = vi.fn();
    waitForReady = vi.fn();
  }

  return { MockResilientEngine, mockEngineIdRef };
});

vi.mock('./ResilientEngine', () => ({
  ResilientEngine: MockResilientEngine,
}));

import { EnginePool } from './EnginePool';

describe('EnginePool', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockEngineIdRef.value = 0;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('acquisition', () => {
    it('creates a new engine when pool is empty', async () => {
      const pool = new EnginePool();
      const engine = await pool.acquire('ai', 'game-1');
      expect(engine).toBeDefined();
      expect(pool.getAllocatedCount()).toBe(1);
    });

    it('reuses engine for same purpose and gameId', async () => {
      const pool = new EnginePool();
      const engine1 = await pool.acquire('ai', 'game-1');
      const engine2 = await pool.acquire('ai', 'game-1');
      expect(engine1).toBe(engine2);
      expect(pool.getAllocatedCount()).toBe(1);
    });

    it('creates separate engines for different purposes', async () => {
      const pool = new EnginePool();
      const aiEngine = await pool.acquire('ai', 'game-1');
      const evalEngine = await pool.acquire('eval', 'game-1');
      expect(aiEngine).not.toBe(evalEngine);
      expect(pool.getAllocatedCount()).toBe(2);
    });

    it('creates separate engines for different gameIds', async () => {
      const pool = new EnginePool();
      const engine1 = await pool.acquire('ai', 'game-1');
      const engine2 = await pool.acquire('ai', 'game-2');
      expect(engine1).not.toBe(engine2);
      expect(pool.getAllocatedCount()).toBe(2);
    });

    it('evicts oldest allocation at capacity', async () => {
      const pool = new EnginePool({ maxEngines: 2 });
      const engine1 = await pool.acquire('ai', 'game-1');
      await pool.acquire('ai', 'game-2');

      // At capacity, acquiring a third should evict the oldest
      await pool.acquire('ai', 'game-3');

      expect(pool.getAllocatedCount()).toBe(2);
      expect(
        (engine1 as unknown as InstanceType<typeof MockResilientEngine>).terminate
      ).toHaveBeenCalled();
    });
  });

  describe('release', () => {
    it('returns engine to idle pool', async () => {
      const pool = new EnginePool();
      await pool.acquire('ai', 'game-1');
      await pool.release('ai', 'game-1');

      expect(pool.getAllocatedCount()).toBe(0);
      expect(pool.getIdleCount()).toBe(1);
    });

    it('terminates failed engines on release', async () => {
      const pool = new EnginePool();
      const engine = (await pool.acquire('ai', 'game-1')) as unknown as InstanceType<
        typeof MockResilientEngine
      >;
      engine.setFailed();

      await pool.release('ai', 'game-1');
      expect(engine.terminate).toHaveBeenCalled();
      expect(pool.getIdleCount()).toBe(0);
    });

    it('terminates when maxUses exceeded', async () => {
      const pool = new EnginePool({ maxUsesBeforeRecreate: 2 });
      const engine = await pool.acquire('ai', 'game-1');
      // Second acquire increments useCount to 2
      await pool.acquire('ai', 'game-1');

      await pool.release('ai', 'game-1');
      expect(
        (engine as unknown as InstanceType<typeof MockResilientEngine>).terminate
      ).toHaveBeenCalled();
      expect(pool.getIdleCount()).toBe(0);
    });

    it('terminates when terminate flag is passed', async () => {
      const pool = new EnginePool();
      const engine = await pool.acquire('ai', 'game-1');
      await pool.release('ai', 'game-1', true);
      expect(
        (engine as unknown as InstanceType<typeof MockResilientEngine>).terminate
      ).toHaveBeenCalled();
      expect(pool.getIdleCount()).toBe(0);
    });
  });

  describe('idle pool', () => {
    it('terminates idle engines after timeout', async () => {
      const pool = new EnginePool({ idleTimeoutMs: 5000 });
      const engine = await pool.acquire('ai', 'game-1');
      await pool.release('ai', 'game-1');

      expect(pool.getIdleCount()).toBe(1);

      vi.advanceTimersByTime(5100);

      expect(pool.getIdleCount()).toBe(0);
      expect(
        (engine as unknown as InstanceType<typeof MockResilientEngine>).terminate
      ).toHaveBeenCalled();
    });

    it('reuses idle engine for new allocation', async () => {
      const pool = new EnginePool();
      await pool.acquire('ai', 'game-1');
      await pool.release('ai', 'game-1');

      expect(pool.getIdleCount()).toBe(1);

      await pool.acquire('ai', 'game-2');

      expect(pool.getIdleCount()).toBe(0);
      expect(pool.getAllocatedCount()).toBe(1);
      expect(pool.getStats().totalCreated).toBe(1);
    });

    it('skips failed engines in idle pool', async () => {
      const pool = new EnginePool();
      const engine = (await pool.acquire('ai', 'game-1')) as unknown as InstanceType<
        typeof MockResilientEngine
      >;
      await pool.release('ai', 'game-1');

      // Mark as failed while idle
      engine.setFailed();

      // Acquiring should skip the failed engine and create new
      await pool.acquire('ai', 'game-2');
      expect(engine.terminate).toHaveBeenCalled();
      expect(pool.getStats().totalCreated).toBe(2);
    });
  });

  describe('game release', () => {
    it('releases all allocations for a gameId', async () => {
      const pool = new EnginePool();
      await pool.acquire('ai', 'game-1');
      await pool.acquire('eval', 'game-1');
      await pool.acquire('ai', 'game-2');

      expect(pool.getAllocatedCount()).toBe(3);

      await pool.releaseGame('game-1');

      expect(pool.getAllocatedCount()).toBe(1);
      expect(pool.hasAllocation('ai', 'game-1')).toBe(false);
      expect(pool.hasAllocation('eval', 'game-1')).toBe(false);
      expect(pool.hasAllocation('ai', 'game-2')).toBe(true);
    });
  });

  describe('cleanup', () => {
    it('terminateAll cleans up all engines', async () => {
      const pool = new EnginePool();
      const engine1 = (await pool.acquire('ai', 'game-1')) as unknown as InstanceType<
        typeof MockResilientEngine
      >;
      const engine2 = (await pool.acquire('eval', 'game-1')) as unknown as InstanceType<
        typeof MockResilientEngine
      >;
      await pool.acquire('ai', 'game-2');
      await pool.release('ai', 'game-2');

      pool.terminateAll();

      expect(engine1.terminate).toHaveBeenCalled();
      expect(engine2.terminate).toHaveBeenCalled();
      expect(pool.getAllocatedCount()).toBe(0);
      expect(pool.getIdleCount()).toBe(0);
      expect(pool.getTotalCount()).toBe(0);
    });

    it('getStats reports correct counts', async () => {
      const pool = new EnginePool();
      await pool.acquire('ai', 'game-1');
      await pool.acquire('eval', 'game-1');
      await pool.release('eval', 'game-1');

      const stats = pool.getStats();
      expect(stats.allocated).toBe(1);
      expect(stats.idle).toBe(1);
      expect(stats.total).toBe(2);
      expect(stats.totalCreated).toBe(2);
    });

    it('hasAllocation returns correct results', async () => {
      const pool = new EnginePool();
      await pool.acquire('ai', 'game-1');

      expect(pool.hasAllocation('ai', 'game-1')).toBe(true);
      expect(pool.hasAllocation('eval', 'game-1')).toBe(false);
      expect(pool.hasAllocation('ai', 'game-2')).toBe(false);
    });

    it('getAllocationInfo returns allocation details', async () => {
      const pool = new EnginePool();
      await pool.acquire('ai', 'game-1');

      const info = pool.getAllocationInfo('ai', 'game-1');
      expect(info).toBeDefined();
      expect(info!.purpose).toBe('ai');
      expect(info!.gameId).toBe('game-1');
      expect(info!.useCount).toBe(1);
    });
  });
});
