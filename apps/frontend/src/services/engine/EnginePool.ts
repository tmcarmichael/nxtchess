import { ResilientEngine, ResilientEngineConfig, EngineEventHandler } from './ResilientEngine';

// ============================================================================
// Types
// ============================================================================

export type EnginePurpose = 'ai' | 'eval';

export interface EngineAllocation {
  engine: ResilientEngine;
  purpose: EnginePurpose;
  gameId: string;
  allocatedAt: number;
  lastUsedAt: number;
  useCount: number;
}

export interface PoolConfig {
  maxEngines: number;
  idleTimeoutMs: number;
  engineConfig?: Partial<ResilientEngineConfig>;
  /** Reset engine state when returning to idle pool. Default: true */
  resetOnRelease: boolean;
  /** Max uses before forcing engine recreation. Default: 100 */
  maxUsesBeforeRecreate: number;
}

export interface PoolStats {
  allocated: number;
  idle: number;
  total: number;
  totalCreated: number;
  totalRecovered: number;
  totalFailed: number;
}

// ============================================================================
// EnginePool Class
// ============================================================================

const DEFAULT_POOL_CONFIG: PoolConfig = {
  maxEngines: 4,
  idleTimeoutMs: 60000, // 1 minute
  resetOnRelease: true,
  maxUsesBeforeRecreate: 100,
};

export class EnginePool {
  private allocations: Map<string, EngineAllocation> = new Map();
  private idleEngines: ResilientEngine[] = [];
  private idleTimeouts: Map<ResilientEngine, ReturnType<typeof setTimeout>> = new Map();
  private config: PoolConfig;

  // Stats tracking
  private stats = {
    totalCreated: 0,
    totalRecovered: 0,
    totalFailed: 0,
  };

  // Event handlers for pool-level events
  private eventHandlers: Set<EngineEventHandler> = new Set();

  constructor(config: Partial<PoolConfig> = {}) {
    this.config = { ...DEFAULT_POOL_CONFIG, ...config };
  }

  // ============================================================================
  // Event Subscription
  // ============================================================================

  onEvent(handler: EngineEventHandler): () => void {
    this.eventHandlers.add(handler);
    return () => {
      this.eventHandlers.delete(handler);
    };
  }

  // ============================================================================
  // Allocation Key Helper
  // ============================================================================

  private getAllocationKey(purpose: EnginePurpose, gameId: string): string {
    return `${purpose}:${gameId}`;
  }

  // ============================================================================
  // Engine Acquisition
  // ============================================================================

  async acquire(purpose: EnginePurpose, gameId: string): Promise<ResilientEngine> {
    const key = this.getAllocationKey(purpose, gameId);

    // Check for existing allocation
    const existing = this.allocations.get(key);
    if (existing) {
      existing.lastUsedAt = Date.now();
      existing.useCount++;
      return existing.engine;
    }

    // Try to reuse an idle engine
    let engine = await this.getIdleEngine();

    if (!engine) {
      // Check if we're at capacity
      const totalEngines = this.allocations.size + this.idleEngines.length;
      if (totalEngines >= this.config.maxEngines) {
        // Evict oldest allocation
        this.evictOldestAllocation();
      }

      // Create a new engine
      engine = this.createEngine(purpose, gameId);
    }

    // Store allocation
    const allocation: EngineAllocation = {
      engine,
      purpose,
      gameId,
      allocatedAt: Date.now(),
      lastUsedAt: Date.now(),
      useCount: 1,
    };
    this.allocations.set(key, allocation);

    return engine;
  }

  private createEngine(purpose: EnginePurpose, gameId: string): ResilientEngine {
    const engine = new ResilientEngine({
      ...this.config.engineConfig,
      name: `Engine-${purpose}-${gameId.slice(0, 8)}`,
    });

    // Subscribe to engine events for stats tracking
    engine.onEvent((event) => {
      if (event.type === 'recovery:success') {
        this.stats.totalRecovered++;
      } else if (event.type === 'circuit:open') {
        this.stats.totalFailed++;
      }

      // Forward to pool event handlers
      for (const handler of this.eventHandlers) {
        try {
          handler(event);
        } catch (err) {
          console.error('EnginePool: Event handler error:', err);
        }
      }
    });

    this.stats.totalCreated++;
    return engine;
  }

  // ============================================================================
  // Engine Release
  // ============================================================================

  async release(purpose: EnginePurpose, gameId: string, terminate: boolean = false): Promise<void> {
    const key = this.getAllocationKey(purpose, gameId);
    const allocation = this.allocations.get(key);

    if (!allocation) {
      return;
    }

    this.allocations.delete(key);

    if (terminate || allocation.engine.isFailed) {
      allocation.engine.terminate();
      return;
    }

    // Check if engine has exceeded max uses
    if (allocation.useCount >= this.config.maxUsesBeforeRecreate) {
      allocation.engine.terminate();
      return;
    }

    // Return to idle pool with reset
    await this.returnToIdlePool(allocation.engine);
  }

  async releaseGame(gameId: string): Promise<void> {
    // Find all allocations for this game
    const keysToRemove: string[] = [];

    for (const [key, allocation] of this.allocations) {
      if (allocation.gameId === gameId) {
        keysToRemove.push(key);
      }
    }

    // Release each allocation
    for (const key of keysToRemove) {
      const allocation = this.allocations.get(key);
      if (allocation) {
        this.allocations.delete(key);
        await this.returnToIdlePool(allocation.engine);
      }
    }
  }

  // ============================================================================
  // Termination
  // ============================================================================

  terminateAll(): void {
    // Clear all idle timeouts
    for (const timeout of this.idleTimeouts.values()) {
      clearTimeout(timeout);
    }
    this.idleTimeouts.clear();

    // Terminate all idle engines
    for (const engine of this.idleEngines) {
      engine.terminate();
    }
    this.idleEngines = [];

    // Terminate all allocated engines
    for (const allocation of this.allocations.values()) {
      allocation.engine.terminate();
    }
    this.allocations.clear();
  }

  // ============================================================================
  // Pool Information
  // ============================================================================

  getAllocatedCount(): number {
    return this.allocations.size;
  }

  getIdleCount(): number {
    return this.idleEngines.length;
  }

  getTotalCount(): number {
    return this.allocations.size + this.idleEngines.length;
  }

  hasAllocation(purpose: EnginePurpose, gameId: string): boolean {
    return this.allocations.has(this.getAllocationKey(purpose, gameId));
  }

  getAllocationInfo(purpose: EnginePurpose, gameId: string): EngineAllocation | undefined {
    return this.allocations.get(this.getAllocationKey(purpose, gameId));
  }

  getStats(): PoolStats {
    return {
      allocated: this.allocations.size,
      idle: this.idleEngines.length,
      total: this.allocations.size + this.idleEngines.length,
      ...this.stats,
    };
  }

  /**
   * Get health status of all engines in the pool.
   */
  getHealthStatus(): { healthy: number; recovering: number; failed: number } {
    let healthy = 0;
    let recovering = 0;
    let failed = 0;

    for (const allocation of this.allocations.values()) {
      if (allocation.engine.isFailed) {
        failed++;
      } else if (allocation.engine.isRecovering) {
        recovering++;
      } else if (allocation.engine.isReady) {
        healthy++;
      }
    }

    for (const engine of this.idleEngines) {
      if (engine.isFailed) {
        failed++;
      } else if (engine.isRecovering) {
        recovering++;
      } else if (engine.isReady) {
        healthy++;
      }
    }

    return { healthy, recovering, failed };
  }

  // ============================================================================
  // Private Helpers
  // ============================================================================

  private async getIdleEngine(): Promise<ResilientEngine | null> {
    while (this.idleEngines.length > 0) {
      const engine = this.idleEngines.pop()!;

      // Cancel idle timeout
      const timeout = this.idleTimeouts.get(engine);
      if (timeout) {
        clearTimeout(timeout);
        this.idleTimeouts.delete(engine);
      }

      // Skip failed engines
      if (engine.isFailed) {
        engine.terminate();
        continue;
      }

      // Ensure engine is ready
      if (!engine.isInitialized) {
        try {
          await engine.init();
        } catch {
          engine.terminate();
          continue;
        }
      }

      return engine;
    }

    return null;
  }

  private async returnToIdlePool(engine: ResilientEngine): Promise<void> {
    // Don't pool failed engines
    if (engine.isFailed) {
      engine.terminate();
      return;
    }

    // Reset engine state for reuse
    if (this.config.resetOnRelease && engine.isInitialized) {
      try {
        await engine.resetForNewGame();
      } catch (err) {
        console.warn('EnginePool: Failed to reset engine, terminating:', err);
        engine.terminate();
        return;
      }
    }

    this.idleEngines.push(engine);

    // Set idle timeout
    const timeout = setTimeout(() => {
      this.removeFromIdlePool(engine);
    }, this.config.idleTimeoutMs);

    this.idleTimeouts.set(engine, timeout);
  }

  private removeFromIdlePool(engine: ResilientEngine): void {
    const index = this.idleEngines.indexOf(engine);
    if (index !== -1) {
      this.idleEngines.splice(index, 1);
    }

    const timeout = this.idleTimeouts.get(engine);
    if (timeout) {
      clearTimeout(timeout);
      this.idleTimeouts.delete(engine);
    }

    engine.terminate();
  }

  private evictOldestAllocation(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, allocation] of this.allocations) {
      if (allocation.lastUsedAt < oldestTime) {
        oldestTime = allocation.lastUsedAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      const allocation = this.allocations.get(oldestKey);
      if (allocation) {
        this.allocations.delete(oldestKey);
        allocation.engine.terminate();
      }
    }
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const enginePool = new EnginePool();
