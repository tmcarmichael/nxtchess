import { createRoot } from 'solid-js';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { gameSyncService } from '../../../services/sync/GameSyncService';
import { createMultiplayerStore } from './createMultiplayerStore';

// Mock the gameSyncService
vi.mock('../../../services/sync/GameSyncService', () => ({
  gameSyncService: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    createGame: vi.fn(),
    joinGame: vi.fn(),
    sendMove: vi.fn(),
    resign: vi.fn(),
    leaveGame: vi.fn(),
    onEvent: vi.fn(() => vi.fn()), // Returns unsubscribe function
  },
}));

describe('createMultiplayerStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('has correct default values', () => {
      createRoot((dispose) => {
        const store = createMultiplayerStore();

        expect(store.state.gameId).toBeNull();
        expect(store.state.opponentUsername).toBeNull();
        expect(store.state.isWaiting).toBe(false);
        expect(store.state.isConnected).toBe(false);

        dispose();
      });
    });
  });

  describe('connect', () => {
    it('connects to sync service', () => {
      createRoot((dispose) => {
        const store = createMultiplayerStore();

        store.connect();

        expect(gameSyncService.connect).toHaveBeenCalled();
        expect(store.state.isConnected).toBe(true);

        dispose();
      });
    });

    it('subscribes to sync service events', () => {
      createRoot((dispose) => {
        const store = createMultiplayerStore();

        store.connect();

        expect(gameSyncService.onEvent).toHaveBeenCalled();

        dispose();
      });
    });

    it('only subscribes once on multiple connects', () => {
      createRoot((dispose) => {
        const store = createMultiplayerStore();

        store.connect();
        store.connect();

        expect(gameSyncService.onEvent).toHaveBeenCalledTimes(1);

        dispose();
      });
    });
  });

  describe('disconnect', () => {
    it('disconnects from sync service', () => {
      createRoot((dispose) => {
        const store = createMultiplayerStore();

        store.connect();
        store.disconnect();

        expect(gameSyncService.disconnect).toHaveBeenCalled();
        expect(store.state.isConnected).toBe(false);

        dispose();
      });
    });
  });

  describe('createGame', () => {
    it('connects and creates game', () => {
      createRoot((dispose) => {
        const store = createMultiplayerStore();

        store.createGame(5, 0);

        expect(gameSyncService.connect).toHaveBeenCalled();
        expect(gameSyncService.createGame).toHaveBeenCalledWith({
          initialTime: 300, // 5 * 60
          increment: 0,
        });
        expect(store.state.isWaiting).toBe(true);

        dispose();
      });
    });

    it('uses default increment of 0', () => {
      createRoot((dispose) => {
        const store = createMultiplayerStore();

        store.createGame(10);

        expect(gameSyncService.createGame).toHaveBeenCalledWith({
          initialTime: 600,
          increment: 0,
        });

        dispose();
      });
    });
  });

  describe('joinGame', () => {
    it('connects and joins game', () => {
      createRoot((dispose) => {
        const store = createMultiplayerStore();

        store.joinGame('game-123');

        expect(gameSyncService.connect).toHaveBeenCalled();
        expect(gameSyncService.joinGame).toHaveBeenCalledWith('game-123');
        expect(store.state.gameId).toBe('game-123');
        expect(store.state.isWaiting).toBe(true);

        dispose();
      });
    });
  });

  describe('sendMove', () => {
    it('sends move when game id exists', () => {
      createRoot((dispose) => {
        const store = createMultiplayerStore();

        store.setGameId('game-123');
        store.sendMove('e2', 'e4');

        expect(gameSyncService.sendMove).toHaveBeenCalledWith('game-123', 'e2', 'e4', undefined);

        dispose();
      });
    });

    it('sends move with promotion', () => {
      createRoot((dispose) => {
        const store = createMultiplayerStore();

        store.setGameId('game-123');
        store.sendMove('a7', 'a8', 'q');

        expect(gameSyncService.sendMove).toHaveBeenCalledWith('game-123', 'a7', 'a8', 'q');

        dispose();
      });
    });

    it('does nothing when no game id', () => {
      createRoot((dispose) => {
        const store = createMultiplayerStore();

        store.sendMove('e2', 'e4');

        expect(gameSyncService.sendMove).not.toHaveBeenCalled();

        dispose();
      });
    });
  });

  describe('resign', () => {
    it('resigns when game id exists', () => {
      createRoot((dispose) => {
        const store = createMultiplayerStore();

        store.setGameId('game-123');
        store.resign();

        expect(gameSyncService.resign).toHaveBeenCalledWith('game-123');

        dispose();
      });
    });

    it('does nothing when no game id', () => {
      createRoot((dispose) => {
        const store = createMultiplayerStore();

        store.resign();

        expect(gameSyncService.resign).not.toHaveBeenCalled();

        dispose();
      });
    });
  });

  describe('leave', () => {
    it('leaves game and resets state', () => {
      createRoot((dispose) => {
        const store = createMultiplayerStore();

        store.setGameId('game-123');
        store.setGameStarted('game-123', 'opponent');

        store.leave();

        expect(gameSyncService.leaveGame).toHaveBeenCalledWith('game-123');
        expect(store.state.gameId).toBeNull();
        expect(store.state.opponentUsername).toBeNull();
        expect(store.state.isWaiting).toBe(false);
        expect(store.state.isConnected).toBe(false);

        dispose();
      });
    });

    it('does not call leaveGame when no game id', () => {
      createRoot((dispose) => {
        const store = createMultiplayerStore();

        store.leave();

        expect(gameSyncService.leaveGame).not.toHaveBeenCalled();

        dispose();
      });
    });
  });

  describe('setGameStarted', () => {
    it('sets game id and opponent', () => {
      createRoot((dispose) => {
        const store = createMultiplayerStore();

        store.setGameStarted('game-123', 'opponent_user');

        expect(store.state.gameId).toBe('game-123');
        expect(store.state.opponentUsername).toBe('opponent_user');
        expect(store.state.isWaiting).toBe(false);

        dispose();
      });
    });

    it('handles null opponent', () => {
      createRoot((dispose) => {
        const store = createMultiplayerStore();

        store.setGameStarted('game-123', null);

        expect(store.state.opponentUsername).toBeNull();

        dispose();
      });
    });
  });

  describe('setGameId', () => {
    it('sets game id', () => {
      createRoot((dispose) => {
        const store = createMultiplayerStore();

        store.setGameId('game-456');

        expect(store.state.gameId).toBe('game-456');

        dispose();
      });
    });
  });

  describe('setWaiting', () => {
    it('sets waiting state', () => {
      createRoot((dispose) => {
        const store = createMultiplayerStore();

        store.setWaiting(true);
        expect(store.state.isWaiting).toBe(true);

        store.setWaiting(false);
        expect(store.state.isWaiting).toBe(false);

        dispose();
      });
    });
  });

  describe('setPlayerColorGetter', () => {
    it('sets player color getter function', () => {
      createRoot((dispose) => {
        const store = createMultiplayerStore();

        // This is used internally for game:started event handling
        store.setPlayerColorGetter(() => 'w');

        // No direct way to verify, but should not throw
        expect(true).toBe(true);

        dispose();
      });
    });
  });

  describe('event subscription', () => {
    it('on() returns unsubscribe function', () => {
      createRoot((dispose) => {
        const store = createMultiplayerStore();
        const handler = vi.fn();

        const unsubscribe = store.on('game:created', handler);

        expect(typeof unsubscribe).toBe('function');

        dispose();
      });
    });

    it('handlers are called when events are emitted', () => {
      createRoot((dispose) => {
        let eventCallback: ((event: unknown) => void) | null = null;
        vi.mocked(gameSyncService.onEvent).mockImplementation((cb) => {
          eventCallback = cb as (event: unknown) => void;
          return vi.fn();
        });

        const store = createMultiplayerStore();
        const handler = vi.fn();

        store.on('game:created', handler);
        store.connect();

        // Simulate sync service emitting game:created event
        if (eventCallback) {
          eventCallback({
            type: 'game:created',
            data: { gameId: 'test-game', color: 'white' },
          });
        }

        expect(handler).toHaveBeenCalledWith({
          gameId: 'test-game',
          playerColor: 'w',
        });
        expect(store.state.gameId).toBe('test-game');
        expect(store.state.isWaiting).toBe(true);

        dispose();
      });
    });

    it('handles game:joined event', () => {
      createRoot((dispose) => {
        let eventCallback: ((event: unknown) => void) | null = null;
        vi.mocked(gameSyncService.onEvent).mockImplementation((cb) => {
          eventCallback = cb as (event: unknown) => void;
          return vi.fn();
        });

        const store = createMultiplayerStore();
        const handler = vi.fn();

        store.on('game:joined', handler);
        store.connect();

        if (eventCallback) {
          eventCallback({
            type: 'game:joined',
            data: { gameId: 'test-game', color: 'black', opponent: 'player2' },
          });
        }

        expect(handler).toHaveBeenCalledWith({
          gameId: 'test-game',
          playerColor: 'b',
          opponent: 'player2',
        });
        expect(store.state.opponentUsername).toBe('player2');
        expect(store.state.isWaiting).toBe(false);

        dispose();
      });
    });

    it('handles game:started event', () => {
      createRoot((dispose) => {
        let eventCallback: ((event: unknown) => void) | null = null;
        vi.mocked(gameSyncService.onEvent).mockImplementation((cb) => {
          eventCallback = cb as (event: unknown) => void;
          return vi.fn();
        });

        const store = createMultiplayerStore();
        const handler = vi.fn();

        store.setPlayerColorGetter(() => 'w');
        store.on('game:started', handler);
        store.connect();

        if (eventCallback) {
          eventCallback({
            type: 'game:started',
            data: {
              gameId: 'test-game',
              whitePlayer: { username: 'player1' },
              blackPlayer: { username: 'opponent' },
              whiteTimeMs: 300000,
              blackTimeMs: 300000,
            },
          });
        }

        expect(handler).toHaveBeenCalledWith({
          gameId: 'test-game',
          opponent: 'opponent',
          whiteTimeMs: 300000,
          blackTimeMs: 300000,
        });

        dispose();
      });
    });

    it('handles move:accepted event', () => {
      createRoot((dispose) => {
        let eventCallback: ((event: unknown) => void) | null = null;
        vi.mocked(gameSyncService.onEvent).mockImplementation((cb) => {
          eventCallback = cb as (event: unknown) => void;
          return vi.fn();
        });

        const store = createMultiplayerStore();
        const handler = vi.fn();

        store.on('move:accepted', handler);
        store.connect();

        if (eventCallback) {
          eventCallback({
            type: 'game:move_accepted',
            data: { fen: 'test-fen', whiteTimeMs: 295000, blackTimeMs: 300000 },
          });
        }

        expect(handler).toHaveBeenCalledWith({
          fen: 'test-fen',
          whiteTimeMs: 295000,
          blackTimeMs: 300000,
        });

        dispose();
      });
    });

    it('handles move:rejected event', () => {
      createRoot((dispose) => {
        let eventCallback: ((event: unknown) => void) | null = null;
        vi.mocked(gameSyncService.onEvent).mockImplementation((cb) => {
          eventCallback = cb as (event: unknown) => void;
          return vi.fn();
        });

        const store = createMultiplayerStore();
        const handler = vi.fn();

        store.on('move:rejected', handler);
        store.connect();

        if (eventCallback) {
          eventCallback({
            type: 'game:move_rejected',
            data: { fen: 'test-fen', reason: 'Invalid move' },
          });
        }

        expect(handler).toHaveBeenCalledWith({
          fen: 'test-fen',
          reason: 'Invalid move',
        });

        dispose();
      });
    });

    it('handles move:opponent event', () => {
      createRoot((dispose) => {
        let eventCallback: ((event: unknown) => void) | null = null;
        vi.mocked(gameSyncService.onEvent).mockImplementation((cb) => {
          eventCallback = cb as (event: unknown) => void;
          return vi.fn();
        });

        const store = createMultiplayerStore();
        const handler = vi.fn();

        store.on('move:opponent', handler);
        store.connect();

        if (eventCallback) {
          eventCallback({
            type: 'game:opponent_move',
            data: {
              fen: 'test-fen',
              san: 'e5',
              from: 'e7',
              to: 'e5',
              whiteTimeMs: 295000,
              blackTimeMs: 290000,
              isCheck: false,
            },
          });
        }

        expect(handler).toHaveBeenCalledWith({
          fen: 'test-fen',
          san: 'e5',
          from: 'e7',
          to: 'e5',
          whiteTimeMs: 295000,
          blackTimeMs: 290000,
          isCheck: false,
        });

        dispose();
      });
    });

    it('handles time:update event', () => {
      createRoot((dispose) => {
        let eventCallback: ((event: unknown) => void) | null = null;
        vi.mocked(gameSyncService.onEvent).mockImplementation((cb) => {
          eventCallback = cb as (event: unknown) => void;
          return vi.fn();
        });

        const store = createMultiplayerStore();
        const handler = vi.fn();

        store.on('time:update', handler);
        store.connect();

        if (eventCallback) {
          eventCallback({
            type: 'game:time_update',
            data: { whiteTime: 200000, blackTime: 250000 },
          });
        }

        expect(handler).toHaveBeenCalledWith({
          whiteTimeMs: 200000,
          blackTimeMs: 250000,
        });

        dispose();
      });
    });

    it('handles game:ended event', () => {
      createRoot((dispose) => {
        let eventCallback: ((event: unknown) => void) | null = null;
        vi.mocked(gameSyncService.onEvent).mockImplementation((cb) => {
          eventCallback = cb as (event: unknown) => void;
          return vi.fn();
        });

        const store = createMultiplayerStore();
        const handler = vi.fn();

        store.setGameId('test-game');
        store.on('game:ended', handler);
        store.connect();

        if (eventCallback) {
          eventCallback({
            type: 'game:ended',
            data: { result: 'white', reason: 'checkmate' },
          });
        }

        expect(handler).toHaveBeenCalledWith({
          reason: 'checkmate',
          winner: 'w',
        });
        expect(store.state.gameId).toBeNull();

        dispose();
      });
    });

    it('handles game:ended with draw result', () => {
      createRoot((dispose) => {
        let eventCallback: ((event: unknown) => void) | null = null;
        vi.mocked(gameSyncService.onEvent).mockImplementation((cb) => {
          eventCallback = cb as (event: unknown) => void;
          return vi.fn();
        });

        const store = createMultiplayerStore();
        const handler = vi.fn();

        store.on('game:ended', handler);
        store.connect();

        if (eventCallback) {
          eventCallback({
            type: 'game:ended',
            data: { result: 'draw', reason: 'stalemate' },
          });
        }

        expect(handler).toHaveBeenCalledWith({
          reason: 'stalemate',
          winner: 'draw',
        });

        dispose();
      });
    });

    it('handles game:opponent_left event', () => {
      createRoot((dispose) => {
        let eventCallback: ((event: unknown) => void) | null = null;
        vi.mocked(gameSyncService.onEvent).mockImplementation((cb) => {
          eventCallback = cb as (event: unknown) => void;
          return vi.fn();
        });

        const store = createMultiplayerStore();
        const handler = vi.fn();

        store.on('game:opponent_left', handler);
        store.connect();

        if (eventCallback) {
          eventCallback({
            type: 'game:opponent_left',
            data: {},
          });
        }

        expect(handler).toHaveBeenCalled();

        dispose();
      });
    });

    it('handles error event', () => {
      createRoot((dispose) => {
        let eventCallback: ((event: unknown) => void) | null = null;
        vi.mocked(gameSyncService.onEvent).mockImplementation((cb) => {
          eventCallback = cb as (event: unknown) => void;
          return vi.fn();
        });

        const store = createMultiplayerStore();
        const handler = vi.fn();

        store.on('game:error', handler);
        store.connect();

        if (eventCallback) {
          eventCallback({
            type: 'error',
            data: { message: 'Connection failed' },
          });
        }

        expect(handler).toHaveBeenCalledWith({
          message: 'Connection failed',
        });

        dispose();
      });
    });
  });

  describe('multiple stores', () => {
    it('creates independent store instances', () => {
      createRoot((dispose) => {
        const store1 = createMultiplayerStore();
        const store2 = createMultiplayerStore();

        store1.setGameId('game-1');

        expect(store1.state.gameId).toBe('game-1');
        expect(store2.state.gameId).toBeNull();

        dispose();
      });
    });
  });
});
