import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  transition,
  canTransition,
  getValidEvents,
  canMakeMove,
  shouldRunTimer,
  isEngineActive,
  canStartNewGame,
} from './gameLifecycle';
import type { GameLifecycle } from '../../types/game';

describe('transition', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockClear();
  });

  describe('from idle state', () => {
    it('transitions to initializing on START_GAME', () => {
      expect(transition('idle', 'START_GAME')).toBe('initializing');
    });

    it('stays in idle for invalid events', () => {
      expect(transition('idle', 'ENGINE_READY')).toBe('idle');
      expect(transition('idle', 'GAME_OVER')).toBe('idle');
      expect(consoleWarnSpy).toHaveBeenCalled();
    });
  });

  describe('from initializing state', () => {
    it('transitions to playing on ENGINE_READY', () => {
      expect(transition('initializing', 'ENGINE_READY')).toBe('playing');
    });

    it('transitions to error on ENGINE_ERROR', () => {
      expect(transition('initializing', 'ENGINE_ERROR')).toBe('error');
    });

    it('transitions to idle on EXIT_GAME', () => {
      expect(transition('initializing', 'EXIT_GAME')).toBe('idle');
    });

    it('stays in initializing for invalid events', () => {
      expect(transition('initializing', 'GAME_OVER')).toBe('initializing');
    });
  });

  describe('from playing state', () => {
    it('transitions to ended on GAME_OVER', () => {
      expect(transition('playing', 'GAME_OVER')).toBe('ended');
    });

    it('transitions to idle on EXIT_GAME', () => {
      expect(transition('playing', 'EXIT_GAME')).toBe('idle');
    });

    it('stays in playing for invalid events', () => {
      expect(transition('playing', 'START_GAME')).toBe('playing');
      expect(transition('playing', 'ENGINE_READY')).toBe('playing');
    });
  });

  describe('from error state', () => {
    it('transitions to initializing on RETRY_ENGINE', () => {
      expect(transition('error', 'RETRY_ENGINE')).toBe('initializing');
    });

    it('transitions to idle on EXIT_GAME', () => {
      expect(transition('error', 'EXIT_GAME')).toBe('idle');
    });

    it('stays in error for invalid events', () => {
      expect(transition('error', 'GAME_OVER')).toBe('error');
    });
  });

  describe('from ended state', () => {
    it('transitions to initializing on PLAY_AGAIN', () => {
      expect(transition('ended', 'PLAY_AGAIN')).toBe('initializing');
    });

    it('transitions to idle on EXIT_GAME', () => {
      expect(transition('ended', 'EXIT_GAME')).toBe('idle');
    });

    it('stays in ended for invalid events', () => {
      expect(transition('ended', 'GAME_OVER')).toBe('ended');
    });
  });
});

describe('canTransition', () => {
  it('returns true for valid transitions', () => {
    expect(canTransition('idle', 'START_GAME')).toBe(true);
    expect(canTransition('initializing', 'ENGINE_READY')).toBe(true);
    expect(canTransition('playing', 'GAME_OVER')).toBe(true);
    expect(canTransition('error', 'RETRY_ENGINE')).toBe(true);
    expect(canTransition('ended', 'PLAY_AGAIN')).toBe(true);
  });

  it('returns false for invalid transitions', () => {
    expect(canTransition('idle', 'GAME_OVER')).toBe(false);
    expect(canTransition('playing', 'ENGINE_READY')).toBe(false);
    expect(canTransition('ended', 'ENGINE_ERROR')).toBe(false);
  });

  it('EXIT_GAME is valid from most states', () => {
    expect(canTransition('initializing', 'EXIT_GAME')).toBe(true);
    expect(canTransition('playing', 'EXIT_GAME')).toBe(true);
    expect(canTransition('error', 'EXIT_GAME')).toBe(true);
    expect(canTransition('ended', 'EXIT_GAME')).toBe(true);
  });
});

describe('getValidEvents', () => {
  it('returns only START_GAME for idle state', () => {
    const events = getValidEvents('idle');
    expect(events).toEqual(['START_GAME']);
  });

  it('returns correct events for initializing state', () => {
    const events = getValidEvents('initializing');
    expect(events).toContain('ENGINE_READY');
    expect(events).toContain('ENGINE_ERROR');
    expect(events).toContain('EXIT_GAME');
    expect(events).toHaveLength(3);
  });

  it('returns correct events for playing state', () => {
    const events = getValidEvents('playing');
    expect(events).toContain('GAME_OVER');
    expect(events).toContain('EXIT_GAME');
    expect(events).toHaveLength(2);
  });

  it('returns correct events for error state', () => {
    const events = getValidEvents('error');
    expect(events).toContain('RETRY_ENGINE');
    expect(events).toContain('EXIT_GAME');
    expect(events).toHaveLength(2);
  });

  it('returns correct events for ended state', () => {
    const events = getValidEvents('ended');
    expect(events).toContain('PLAY_AGAIN');
    expect(events).toContain('EXIT_GAME');
    expect(events).toHaveLength(2);
  });
});

describe('canMakeMove', () => {
  it('returns true only for playing state', () => {
    expect(canMakeMove('playing')).toBe(true);
  });

  it('returns false for all other states', () => {
    expect(canMakeMove('idle')).toBe(false);
    expect(canMakeMove('initializing')).toBe(false);
    expect(canMakeMove('error')).toBe(false);
    expect(canMakeMove('ended')).toBe(false);
  });
});

describe('shouldRunTimer', () => {
  it('returns true only for playing state', () => {
    expect(shouldRunTimer('playing')).toBe(true);
  });

  it('returns false for all other states', () => {
    expect(shouldRunTimer('idle')).toBe(false);
    expect(shouldRunTimer('initializing')).toBe(false);
    expect(shouldRunTimer('error')).toBe(false);
    expect(shouldRunTimer('ended')).toBe(false);
  });
});

describe('isEngineActive', () => {
  it('returns true for initializing and playing states', () => {
    expect(isEngineActive('initializing')).toBe(true);
    expect(isEngineActive('playing')).toBe(true);
  });

  it('returns false for other states', () => {
    expect(isEngineActive('idle')).toBe(false);
    expect(isEngineActive('error')).toBe(false);
    expect(isEngineActive('ended')).toBe(false);
  });
});

describe('canStartNewGame', () => {
  it('returns true for idle and ended states', () => {
    expect(canStartNewGame('idle')).toBe(true);
    expect(canStartNewGame('ended')).toBe(true);
  });

  it('returns false for other states', () => {
    expect(canStartNewGame('initializing')).toBe(false);
    expect(canStartNewGame('playing')).toBe(false);
    expect(canStartNewGame('error')).toBe(false);
  });
});

describe('complete game flows', () => {
  it('handles successful game flow: idle -> playing -> ended', () => {
    let state: GameLifecycle = 'idle';

    state = transition(state, 'START_GAME');
    expect(state).toBe('initializing');

    state = transition(state, 'ENGINE_READY');
    expect(state).toBe('playing');

    state = transition(state, 'GAME_OVER');
    expect(state).toBe('ended');
  });

  it('handles play again flow: ended -> playing -> ended', () => {
    let state: GameLifecycle = 'ended';

    state = transition(state, 'PLAY_AGAIN');
    expect(state).toBe('initializing');

    state = transition(state, 'ENGINE_READY');
    expect(state).toBe('playing');

    state = transition(state, 'GAME_OVER');
    expect(state).toBe('ended');
  });

  it('handles engine error and retry flow', () => {
    let state: GameLifecycle = 'idle';

    state = transition(state, 'START_GAME');
    expect(state).toBe('initializing');

    state = transition(state, 'ENGINE_ERROR');
    expect(state).toBe('error');

    state = transition(state, 'RETRY_ENGINE');
    expect(state).toBe('initializing');

    state = transition(state, 'ENGINE_READY');
    expect(state).toBe('playing');
  });

  it('handles exit from any active state', () => {
    const activeStates: GameLifecycle[] = ['initializing', 'playing', 'error', 'ended'];

    for (const state of activeStates) {
      expect(transition(state, 'EXIT_GAME')).toBe('idle');
    }
  });
});
