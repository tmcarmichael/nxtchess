import { createRoot } from 'solid-js';
import { describe, it, expect, afterEach } from 'vitest';
import { sessionManager } from '../../../services/game/session/SessionManager';
import { createChessStore } from './createChessStore';

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

describe('createChessStore', () => {
  // Clean up sessions after each test
  afterEach(() => {
    sessionManager.destroyAllSessions();
  });

  describe('initial state', () => {
    it('has correct default values', () => {
      createRoot((dispose) => {
        const store = createChessStore();

        expect(store.state.sessionId).toBeNull();
        expect(store.state.fen).toBe(INITIAL_FEN);
        expect(store.state.currentTurn).toBe('w');
        expect(store.state.moveHistory).toEqual([]);
        expect(store.state.isGameOver).toBe(false);
        expect(store.state.playerColor).toBe('w');
        expect(store.state.mode).toBe('play');
        expect(store.state.lifecycle).toBe('idle');

        dispose();
      });
    });
  });

  describe('startGame', () => {
    it('creates a new game session', () => {
      createRoot((dispose) => {
        const store = createChessStore();

        const sessionId = store.startGame({
          mode: 'play',
          playerColor: 'w',
          opponentType: 'ai',
          timeControl: 5,
          difficulty: 3,
        });

        expect(sessionId).toBeTruthy();
        expect(store.state.sessionId).toBe(sessionId);
        expect(store.state.mode).toBe('play');
        expect(store.state.playerColor).toBe('w');
        expect(store.state.opponentType).toBe('ai');

        dispose();
      });
    });

    it('sets training mode options', () => {
      createRoot((dispose) => {
        const store = createChessStore();

        store.startGame({
          mode: 'training',
          playerColor: 'b',
          opponentType: 'ai',
          timeControl: 10,
          difficulty: 5,
          trainingIsRated: true,
          trainingAIPlayStyle: 'aggressive',
          trainingGamePhase: 'middlegame',
          trainingAvailableHints: 3,
        });

        expect(store.state.mode).toBe('training');
        expect(store.state.playerColor).toBe('b');
        expect(store.state.trainingIsRated).toBe(true);
        expect(store.state.trainingAIPlayStyle).toBe('aggressive');
        expect(store.state.trainingGamePhase).toBe('middlegame');
        expect(store.state.trainingAvailableHints).toBe(3);

        dispose();
      });
    });

    it('resets game state on new game', () => {
      createRoot((dispose) => {
        const store = createChessStore();

        // Start first game and make a move
        store.startGame({
          mode: 'play',
          playerColor: 'w',
          opponentType: 'ai',
          timeControl: 5,
        });
        store.applyMove('e2', 'e4');

        // Start new game
        store.startGame({
          mode: 'play',
          playerColor: 'b',
          opponentType: 'ai',
          timeControl: 10,
        });

        expect(store.state.moveHistory).toEqual([]);
        expect(store.state.fen).toBe(INITIAL_FEN);
        expect(store.state.isGameOver).toBe(false);

        dispose();
      });
    });

    it('returns session to active in sessionManager', () => {
      createRoot((dispose) => {
        const store = createChessStore();

        const sessionId = store.startGame({
          mode: 'play',
          playerColor: 'w',
          opponentType: 'ai',
          timeControl: 5,
        });

        expect(sessionManager.getActiveSessionId()).toBe(sessionId);

        dispose();
      });
    });
  });

  describe('applyMove', () => {
    it('applies valid move', () => {
      createRoot((dispose) => {
        const store = createChessStore();

        store.startGame({
          mode: 'play',
          playerColor: 'w',
          opponentType: 'ai',
          timeControl: 5,
        });

        const result = store.applyMove('e2', 'e4');

        expect(result).toBe(true);
        expect(store.state.moveHistory).toEqual(['e4']);
        expect(store.state.currentTurn).toBe('b');
        expect(store.state.lastMove).toEqual({ from: 'e2', to: 'e4' });

        dispose();
      });
    });

    it('rejects invalid move', () => {
      createRoot((dispose) => {
        const store = createChessStore();

        store.startGame({
          mode: 'play',
          playerColor: 'w',
          opponentType: 'ai',
          timeControl: 5,
        });

        const result = store.applyMove('e2', 'e5'); // Invalid

        expect(result).toBe(false);
        expect(store.state.moveHistory).toEqual([]);

        dispose();
      });
    });

    it('returns false when no session', () => {
      createRoot((dispose) => {
        const store = createChessStore();

        const result = store.applyMove('e2', 'e4');

        expect(result).toBe(false);

        dispose();
      });
    });

    it('handles promotion', () => {
      createRoot((dispose) => {
        const store = createChessStore();

        // Set up promotion position
        store.startGame({
          mode: 'play',
          playerColor: 'w',
          opponentType: 'ai',
          timeControl: 5,
        });

        // Get session and manually set promotion position
        const session = store.getSession();
        if (session) {
          sessionManager.applyCommand(session.sessionId, {
            type: 'SYNC_STATE',
            payload: {
              state: {
                fen: '8/P7/8/8/8/8/8/4K2k w - - 0 1',
                viewFen: '8/P7/8/8/8/8/8/4K2k w - - 0 1',
              },
            },
          });
        }

        const result = store.applyMove('a7', 'a8', 'q');

        expect(result).toBe(true);
        expect(store.state.fen).toContain('Q');

        dispose();
      });
    });
  });

  describe('applyOptimisticMove', () => {
    it('applies move and clears error', () => {
      createRoot((dispose) => {
        const store = createChessStore();

        store.startGame({
          mode: 'play',
          playerColor: 'w',
          opponentType: 'human',
          timeControl: 5,
        });

        const result = store.applyOptimisticMove('e2', 'e4');

        expect(result).toBe(true);
        expect(store.state.moveError).toBeNull();

        dispose();
      });
    });
  });

  describe('confirmMove', () => {
    it('syncs times from server', () => {
      createRoot((dispose) => {
        const store = createChessStore();

        store.startGame({
          mode: 'play',
          playerColor: 'w',
          opponentType: 'human',
          timeControl: 5,
        });
        store.applyMove('e2', 'e4');

        store.confirmMove(store.state.fen, 295000, 300000);

        // Times are synced in the session, check session state
        const session = store.getSession();
        expect(session?.currentState.times).toEqual({ white: 295, black: 300 });

        dispose();
      });
    });
  });

  describe('rejectMove', () => {
    it('sets move error', () => {
      createRoot((dispose) => {
        const store = createChessStore();

        store.startGame({
          mode: 'play',
          playerColor: 'w',
          opponentType: 'human',
          timeControl: 5,
        });
        store.applyMove('e2', 'e4');

        store.rejectMove(INITIAL_FEN, 'Invalid move');

        expect(store.state.moveError).toBe('Invalid move');
        expect(store.state.fen).toBe(INITIAL_FEN);

        dispose();
      });
    });
  });

  describe('endGame', () => {
    it('ends game with reason and winner', () => {
      createRoot((dispose) => {
        const store = createChessStore();

        store.startGame({
          mode: 'play',
          playerColor: 'w',
          opponentType: 'ai',
          timeControl: 5,
        });

        store.endGame('checkmate', 'w');

        expect(store.state.isGameOver).toBe(true);
        expect(store.state.gameOverReason).toBe('checkmate');
        expect(store.state.gameWinner).toBe('w');

        dispose();
      });
    });

    it('saves eval score for training', () => {
      createRoot((dispose) => {
        const store = createChessStore();

        store.startGame({
          mode: 'training',
          playerColor: 'w',
          opponentType: 'ai',
          timeControl: 5,
        });

        store.endGame('resignation', 'b', 2.5);

        expect(store.state.trainingEvalScore).toBe(2.5);

        dispose();
      });
    });

    it('works without session (fallback mode)', () => {
      createRoot((dispose) => {
        const store = createChessStore();

        store.endGame('time', 'b');

        expect(store.state.isGameOver).toBe(true);
        expect(store.state.gameOverReason).toBe('time');
        expect(store.state.gameWinner).toBe('b');
        expect(store.state.lifecycle).toBe('ended');

        dispose();
      });
    });
  });

  describe('exitGame', () => {
    it('resets to initial state', () => {
      createRoot((dispose) => {
        const store = createChessStore();

        store.startGame({
          mode: 'play',
          playerColor: 'w',
          opponentType: 'ai',
          timeControl: 5,
        });
        store.applyMove('e2', 'e4');

        store.exitGame();

        expect(store.state.sessionId).toBeNull();
        expect(store.state.fen).toBe(INITIAL_FEN);
        expect(store.state.moveHistory).toEqual([]);
        expect(store.state.lifecycle).toBe('idle');

        dispose();
      });
    });

    it('destroys session in sessionManager', () => {
      createRoot((dispose) => {
        const store = createChessStore();

        const sessionId = store.startGame({
          mode: 'play',
          playerColor: 'w',
          opponentType: 'ai',
          timeControl: 5,
        });

        store.exitGame();

        expect(sessionManager.hasSession(sessionId)).toBe(false);

        dispose();
      });
    });
  });

  describe('resign', () => {
    it('ends game with resignation', () => {
      createRoot((dispose) => {
        const store = createChessStore();

        store.startGame({
          mode: 'play',
          playerColor: 'w',
          opponentType: 'ai',
          timeControl: 5,
        });

        // Set lifecycle to playing so resign works
        store.setLifecycle('playing');
        store.resign();

        expect(store.state.isGameOver).toBe(true);
        expect(store.state.gameOverReason).toBe('resignation');
        expect(store.state.gameWinner).toBe('b'); // Opponent wins

        dispose();
      });
    });

    it('does nothing when lifecycle is not playing', () => {
      createRoot((dispose) => {
        const store = createChessStore();

        store.startGame({
          mode: 'play',
          playerColor: 'w',
          opponentType: 'ai',
          timeControl: 5,
        });

        // Lifecycle is 'idle' by default
        store.resign();

        expect(store.state.isGameOver).toBe(false);

        dispose();
      });
    });
  });

  describe('takeBack', () => {
    it('undoes last move', () => {
      createRoot((dispose) => {
        const store = createChessStore();

        store.startGame({
          mode: 'play',
          playerColor: 'w',
          opponentType: 'ai',
          timeControl: 5,
        });
        store.applyMove('e2', 'e4');
        store.applyMove('e7', 'e5');

        store.takeBack();

        // Should undo moves to get back to player's turn
        expect(store.state.currentTurn).toBe('w');

        dispose();
      });
    });
  });

  describe('jumpToMoveIndex', () => {
    it('navigates to specific move in history', () => {
      createRoot((dispose) => {
        const store = createChessStore();

        store.startGame({
          mode: 'play',
          playerColor: 'w',
          opponentType: 'ai',
          timeControl: 5,
        });
        store.applyMove('e2', 'e4');
        store.applyMove('e7', 'e5');
        store.applyMove('d2', 'd4');

        store.jumpToMoveIndex(0);

        expect(store.state.viewMoveIndex).toBe(0);
        expect(store.state.viewFen).not.toBe(store.state.fen);

        dispose();
      });
    });
  });

  describe('syncFromMultiplayer', () => {
    it('updates state from multiplayer data', () => {
      createRoot((dispose) => {
        const store = createChessStore();

        store.startGame({
          mode: 'play',
          playerColor: 'w',
          opponentType: 'human',
          timeControl: 5,
        });

        const newFen = 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2';
        store.syncFromMultiplayer({
          fen: newFen,
          san: 'e5',
          from: 'e7',
          to: 'e5',
        });

        expect(store.state.fen).toBe(newFen);
        expect(store.state.lastMove).toEqual({ from: 'e7', to: 'e5' });
        expect(store.state.moveHistory).toContain('e5');

        dispose();
      });
    });

    it('handles check indication', () => {
      createRoot((dispose) => {
        const store = createChessStore();

        store.startGame({
          mode: 'play',
          playerColor: 'w',
          opponentType: 'human',
          timeControl: 5,
        });

        // FEN where white king is in check
        const checkFen = 'rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3';
        store.syncFromMultiplayer({
          fen: checkFen,
          san: 'Qh4+',
          from: 'd8',
          to: 'h4',
          isCheck: true,
        });

        expect(store.state.checkedKingSquare).toBeTruthy();

        dispose();
      });
    });
  });

  describe('setLifecycle', () => {
    it('updates lifecycle state', () => {
      createRoot((dispose) => {
        const store = createChessStore();

        store.setLifecycle('playing');

        expect(store.state.lifecycle).toBe('playing');

        dispose();
      });
    });

    it('syncs to session when session exists', () => {
      createRoot((dispose) => {
        const store = createChessStore();

        store.startGame({
          mode: 'play',
          playerColor: 'w',
          opponentType: 'ai',
          timeControl: 5,
        });

        store.setLifecycle('playing');

        const session = store.getSession();
        expect(session?.currentState.lifecycle).toBe('playing');

        dispose();
      });
    });
  });

  describe('setPlayerColor', () => {
    it('updates player color', () => {
      createRoot((dispose) => {
        const store = createChessStore();

        store.setPlayerColor('b');

        expect(store.state.playerColor).toBe('b');

        dispose();
      });
    });
  });

  describe('resetForMultiplayer', () => {
    it('resets state for multiplayer game', () => {
      createRoot((dispose) => {
        const store = createChessStore();

        // Start a single player game first
        store.startGame({
          mode: 'play',
          playerColor: 'w',
          opponentType: 'ai',
          timeControl: 5,
        });
        store.applyMove('e2', 'e4');

        store.resetForMultiplayer('play');

        expect(store.state.sessionId).toBeNull();
        expect(store.state.fen).toBe(INITIAL_FEN);
        expect(store.state.moveHistory).toEqual([]);
        expect(store.state.opponentType).toBe('human');
        expect(store.state.lifecycle).toBe('initializing');

        dispose();
      });
    });
  });

  describe('derived', () => {
    it('currentBoard returns board squares', () => {
      createRoot((dispose) => {
        const store = createChessStore();

        const board = store.derived.currentBoard();

        expect(board).toHaveLength(64);

        dispose();
      });
    });

    it('isPlayerTurn returns true when player turn', () => {
      createRoot((dispose) => {
        const store = createChessStore();

        store.startGame({
          mode: 'play',
          playerColor: 'w',
          opponentType: 'ai',
          timeControl: 5,
        });

        expect(store.derived.isPlayerTurn()).toBe(true);

        dispose();
      });
    });

    it('isPlayerTurn returns false when opponent turn', () => {
      createRoot((dispose) => {
        const store = createChessStore();

        store.startGame({
          mode: 'play',
          playerColor: 'w',
          opponentType: 'ai',
          timeControl: 5,
        });
        store.applyMove('e2', 'e4');

        expect(store.derived.isPlayerTurn()).toBe(false);

        dispose();
      });
    });

    it('canMove checks lifecycle and turn', () => {
      createRoot((dispose) => {
        const store = createChessStore();

        store.startGame({
          mode: 'play',
          playerColor: 'w',
          opponentType: 'ai',
          timeControl: 5,
        });

        // Lifecycle is idle, should not be able to move
        expect(store.derived.canMove()).toBe(false);

        store.setLifecycle('playing');
        expect(store.derived.canMove()).toBe(true);

        dispose();
      });
    });

    it('isViewingHistory detects history navigation', () => {
      createRoot((dispose) => {
        const store = createChessStore();

        store.startGame({
          mode: 'play',
          playerColor: 'w',
          opponentType: 'ai',
          timeControl: 5,
        });
        store.applyMove('e2', 'e4');
        store.applyMove('e7', 'e5');

        expect(store.derived.isViewingHistory()).toBe(false);

        store.jumpToMoveIndex(0);
        expect(store.derived.isViewingHistory()).toBe(true);

        dispose();
      });
    });

    it('opponentSide returns opposite of player color', () => {
      createRoot((dispose) => {
        const store = createChessStore();

        expect(store.derived.opponentSide()).toBe('b');

        store.setPlayerColor('b');
        expect(store.derived.opponentSide()).toBe('w');

        dispose();
      });
    });
  });

  describe('getSession', () => {
    it('returns null when no session', () => {
      createRoot((dispose) => {
        const store = createChessStore();

        expect(store.getSession()).toBeNull();

        dispose();
      });
    });

    it('returns session when game started', () => {
      createRoot((dispose) => {
        const store = createChessStore();

        store.startGame({
          mode: 'play',
          playerColor: 'w',
          opponentType: 'ai',
          timeControl: 5,
        });

        const session = store.getSession();
        expect(session).not.toBeNull();
        expect(session?.sessionId).toBe(store.state.sessionId);

        dispose();
      });
    });
  });
});
