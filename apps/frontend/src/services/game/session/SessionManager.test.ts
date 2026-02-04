import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameSession } from './GameSession';
import { SessionManager } from './SessionManager';
import type { GameSessionConfig, SessionEvent, GameSessionSnapshot } from './types';

const createTestConfig = (id: string = 'test-session-1'): GameSessionConfig => ({
  sessionId: id,
  mode: 'play',
  playerColor: 'w',
  opponentType: 'ai',
  timeControl: { initialTime: 300 },
  difficulty: 5,
});

const createTestSnapshot = (id: string = 'test-session-1'): GameSessionSnapshot => ({
  config: createTestConfig(id),
  state: {
    fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
    moveHistory: ['e4'],
    times: { white: 295, black: 300 },
    capturedPieces: { white: [], black: [] },
    lifecycle: 'playing',
    currentTurn: 'b',
    isGameOver: false,
    gameOverReason: null,
    gameWinner: null,
    lastMove: { from: 'e2', to: 'e4' },
    checkedKingSquare: null,
    viewMoveIndex: 0,
    viewFen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
    trainingEvalScore: null,
    usedHints: 0,
    lastConfirmedMoveIndex: -1,
    moveError: null,
  },
  createdAt: Date.now() - 60000,
  updatedAt: Date.now(),
});

describe('SessionManager', () => {
  let manager: SessionManager;

  beforeEach(() => {
    manager = new SessionManager();
  });

  describe('createSession', () => {
    it('creates a new session', () => {
      const config = createTestConfig();
      const session = manager.createSession(config);

      expect(session).toBeInstanceOf(GameSession);
      expect(session.sessionId).toBe('test-session-1');
      expect(manager.hasSession('test-session-1')).toBe(true);
    });

    it('emits session:created event', () => {
      const handler = vi.fn();
      manager.onEvent(handler);

      manager.createSession(createTestConfig());

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 'test-session-1',
          type: 'session:created',
          data: expect.objectContaining({ config: expect.any(Object) }),
        })
      );
    });

    it('replaces existing session with same ID', () => {
      const config1 = createTestConfig();
      const config2 = createTestConfig();
      config2.difficulty = 10;

      manager.createSession(config1);
      const session2 = manager.createSession(config2);

      expect(manager.getSessionCount()).toBe(1);
      expect(manager.getSession('test-session-1')).toBe(session2);
      expect(session2.config.difficulty).toBe(10);
    });
  });

  describe('restoreSession', () => {
    it('restores session from snapshot', () => {
      const snapshot = createTestSnapshot();
      const session = manager.restoreSession(snapshot);

      expect(session.sessionId).toBe('test-session-1');
      expect(session.moveHistory).toEqual(['e4']);
      expect(manager.hasSession('test-session-1')).toBe(true);
    });

    it('emits session:created event with restored flag', () => {
      const handler = vi.fn();
      manager.onEvent(handler);

      manager.restoreSession(createTestSnapshot());

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'session:created',
          data: expect.objectContaining({ restored: true }),
        })
      );
    });
  });

  describe('getSession', () => {
    it('returns session when exists', () => {
      manager.createSession(createTestConfig());

      const session = manager.getSession('test-session-1');

      expect(session).toBeInstanceOf(GameSession);
    });

    it('returns undefined when session not found', () => {
      const session = manager.getSession('nonexistent');

      expect(session).toBeUndefined();
    });
  });

  describe('destroySession', () => {
    it('removes session from manager', () => {
      manager.createSession(createTestConfig());

      const result = manager.destroySession('test-session-1');

      expect(result).toBe(true);
      expect(manager.hasSession('test-session-1')).toBe(false);
    });

    it('returns false when session not found', () => {
      const result = manager.destroySession('nonexistent');

      expect(result).toBe(false);
    });

    it('emits session:destroyed event', () => {
      manager.createSession(createTestConfig());
      const handler = vi.fn();
      manager.onEvent(handler);

      manager.destroySession('test-session-1');

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 'test-session-1',
          type: 'session:destroyed',
        })
      );
    });

    it('clears active session if destroyed', () => {
      manager.createSession(createTestConfig());
      manager.setActiveSession('test-session-1');

      manager.destroySession('test-session-1');

      expect(manager.getActiveSessionId()).toBeNull();
    });
  });

  describe('destroyAllSessions', () => {
    it('removes all sessions', () => {
      manager.createSession(createTestConfig('session-1'));
      manager.createSession(createTestConfig('session-2'));
      manager.createSession(createTestConfig('session-3'));

      manager.destroyAllSessions();

      expect(manager.getSessionCount()).toBe(0);
    });

    it('emits destroy events for each session', () => {
      manager.createSession(createTestConfig('session-1'));
      manager.createSession(createTestConfig('session-2'));
      const handler = vi.fn();
      manager.onEvent(handler);

      manager.destroyAllSessions();

      expect(handler).toHaveBeenCalledTimes(2);
    });
  });

  describe('setActiveSession', () => {
    it('sets active session when session exists', () => {
      manager.createSession(createTestConfig());

      const result = manager.setActiveSession('test-session-1');

      expect(result).toBe(true);
      expect(manager.getActiveSessionId()).toBe('test-session-1');
    });

    it('returns false when session not found', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = manager.setActiveSession('nonexistent');

      expect(result).toBe(false);
      expect(warnSpy).toHaveBeenCalled();
    });

    it('can clear active session with null', () => {
      manager.createSession(createTestConfig());
      manager.setActiveSession('test-session-1');

      const result = manager.setActiveSession(null);

      expect(result).toBe(true);
      expect(manager.getActiveSessionId()).toBeNull();
    });

    it('emits session:activated event', () => {
      manager.createSession(createTestConfig());
      const handler = vi.fn();
      manager.onEvent(handler);

      manager.setActiveSession('test-session-1');

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 'test-session-1',
          type: 'session:activated',
        })
      );
    });
  });

  describe('getActiveSession', () => {
    it('returns active session when set', () => {
      manager.createSession(createTestConfig());
      manager.setActiveSession('test-session-1');

      const session = manager.getActiveSession();

      expect(session).toBeInstanceOf(GameSession);
      expect(session?.sessionId).toBe('test-session-1');
    });

    it('returns null when no active session', () => {
      const session = manager.getActiveSession();

      expect(session).toBeNull();
    });
  });

  describe('getActiveSessionId', () => {
    it('returns active session ID when set', () => {
      manager.createSession(createTestConfig());
      manager.setActiveSession('test-session-1');

      expect(manager.getActiveSessionId()).toBe('test-session-1');
    });

    it('returns null when no active session', () => {
      expect(manager.getActiveSessionId()).toBeNull();
    });
  });

  describe('applyCommand', () => {
    it('applies command to specified session', () => {
      manager.createSession(createTestConfig());

      const result = manager.applyCommand('test-session-1', {
        type: 'APPLY_MOVE',
        payload: { from: 'e2', to: 'e4' },
      });

      expect(result.success).toBe(true);
      const session = manager.getSession('test-session-1');
      expect(session?.moveHistory).toEqual(['e4']);
    });

    it('returns error when session not found', () => {
      const result = manager.applyCommand('nonexistent', {
        type: 'APPLY_MOVE',
        payload: { from: 'e2', to: 'e4' },
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('not found');
      }
    });

    it('emits game:move event on successful move', () => {
      manager.createSession(createTestConfig());
      const handler = vi.fn();
      manager.onEvent(handler);

      manager.applyCommand('test-session-1', {
        type: 'APPLY_MOVE',
        payload: { from: 'e2', to: 'e4' },
      });

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'game:move',
        })
      );
    });

    it('emits game:ended event on resignation', () => {
      manager.createSession(createTestConfig());
      const handler = vi.fn();
      manager.onEvent(handler);

      manager.applyCommand('test-session-1', {
        type: 'RESIGN',
        payload: { resigningSide: 'w' },
      });

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'game:ended',
        })
      );
    });

    it('emits game:ended event on timeout', () => {
      manager.createSession(createTestConfig());
      const handler = vi.fn();
      manager.onEvent(handler);

      manager.applyCommand('test-session-1', {
        type: 'TIMEOUT',
        payload: { losingColor: 'w' },
      });

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'game:ended',
        })
      );
    });

    it('emits session:updated event for other commands', () => {
      manager.createSession(createTestConfig());
      const handler = vi.fn();
      manager.onEvent(handler);

      manager.applyCommand('test-session-1', {
        type: 'UPDATE_TIMES',
        payload: { times: { white: 200, black: 250 } },
      });

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'session:updated',
        })
      );
    });

    it('does not emit event on command failure', () => {
      manager.createSession(createTestConfig());
      const handler = vi.fn();
      manager.onEvent(handler);
      handler.mockClear(); // Clear the session:created event

      manager.applyCommand('test-session-1', {
        type: 'APPLY_MOVE',
        payload: { from: 'e2', to: 'e5' }, // Invalid move
      });

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('applyCommandToActive', () => {
    it('applies command to active session', () => {
      manager.createSession(createTestConfig());
      manager.setActiveSession('test-session-1');

      const result = manager.applyCommandToActive({
        type: 'APPLY_MOVE',
        payload: { from: 'e2', to: 'e4' },
      });

      expect(result.success).toBe(true);
    });

    it('returns error when no active session', () => {
      const result = manager.applyCommandToActive({
        type: 'APPLY_MOVE',
        payload: { from: 'e2', to: 'e4' },
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('No active session');
      }
    });
  });

  describe('onEvent', () => {
    it('registers event handler', () => {
      const handler = vi.fn();
      manager.onEvent(handler);

      manager.createSession(createTestConfig());

      expect(handler).toHaveBeenCalled();
    });

    it('returns unsubscribe function', () => {
      const handler = vi.fn();
      const unsubscribe = manager.onEvent(handler);

      unsubscribe();
      manager.createSession(createTestConfig());

      expect(handler).not.toHaveBeenCalled();
    });

    it('multiple handlers receive events', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      manager.onEvent(handler1);
      manager.onEvent(handler2);

      manager.createSession(createTestConfig());

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('handles errors in event handlers gracefully', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const throwingHandler = () => {
        throw new Error('Handler error');
      };
      const normalHandler = vi.fn();
      manager.onEvent(throwingHandler);
      manager.onEvent(normalHandler);

      manager.createSession(createTestConfig());

      expect(errorSpy).toHaveBeenCalled();
      expect(normalHandler).toHaveBeenCalled();
    });

    it('provides event with timestamp', () => {
      const handler = vi.fn();
      manager.onEvent(handler);

      manager.createSession(createTestConfig());

      const event: SessionEvent = handler.mock.calls[0][0];
      expect(event.timestamp).toBeGreaterThan(0);
    });
  });

  describe('getAllSessions', () => {
    it('returns empty array when no sessions', () => {
      const sessions = manager.getAllSessions();

      expect(sessions).toEqual([]);
    });

    it('returns all sessions', () => {
      manager.createSession(createTestConfig('session-1'));
      manager.createSession(createTestConfig('session-2'));

      const sessions = manager.getAllSessions();

      expect(sessions).toHaveLength(2);
      expect(sessions.every((s) => s instanceof GameSession)).toBe(true);
    });
  });

  describe('getSessionCount', () => {
    it('returns 0 when no sessions', () => {
      expect(manager.getSessionCount()).toBe(0);
    });

    it('returns correct count', () => {
      manager.createSession(createTestConfig('session-1'));
      manager.createSession(createTestConfig('session-2'));
      manager.createSession(createTestConfig('session-3'));

      expect(manager.getSessionCount()).toBe(3);
    });
  });

  describe('hasSession', () => {
    it('returns true when session exists', () => {
      manager.createSession(createTestConfig());

      expect(manager.hasSession('test-session-1')).toBe(true);
    });

    it('returns false when session not found', () => {
      expect(manager.hasSession('nonexistent')).toBe(false);
    });
  });

  describe('getSessionSnapshot', () => {
    it('returns snapshot for existing session', () => {
      manager.createSession(createTestConfig());
      manager.applyCommand('test-session-1', {
        type: 'APPLY_MOVE',
        payload: { from: 'e2', to: 'e4' },
      });

      const snapshot = manager.getSessionSnapshot('test-session-1');

      expect(snapshot).not.toBeNull();
      expect(snapshot?.config.sessionId).toBe('test-session-1');
      expect(snapshot?.state.moveHistory).toEqual(['e4']);
    });

    it('returns null for nonexistent session', () => {
      const snapshot = manager.getSessionSnapshot('nonexistent');

      expect(snapshot).toBeNull();
    });
  });

  describe('getAllSnapshots', () => {
    it('returns empty array when no sessions', () => {
      const snapshots = manager.getAllSnapshots();

      expect(snapshots).toEqual([]);
    });

    it('returns snapshots for all sessions', () => {
      manager.createSession(createTestConfig('session-1'));
      manager.createSession(createTestConfig('session-2'));

      const snapshots = manager.getAllSnapshots();

      expect(snapshots).toHaveLength(2);
      const ids = snapshots.map((s) => s.config.sessionId);
      expect(ids).toContain('session-1');
      expect(ids).toContain('session-2');
    });
  });
});
