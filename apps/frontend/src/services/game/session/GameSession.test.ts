import { describe, it, expect, beforeEach } from 'vitest';
import { GameSession } from './GameSession';
import type { GameSessionConfig, GameSessionState, GameCommand } from './types';

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const createTestConfig = (overrides?: Partial<GameSessionConfig>): GameSessionConfig => ({
  sessionId: 'test-session-1',
  mode: 'play',
  playerColor: 'w',
  opponentType: 'ai',
  timeControl: { initialTime: 300 },
  difficulty: 5,
  ...overrides,
});

const createTestState = (overrides?: Partial<GameSessionState>): GameSessionState => ({
  fen: INITIAL_FEN,
  moveHistory: [],
  times: { white: 300, black: 300 },
  capturedPieces: { white: [], black: [] },
  lifecycle: 'idle',
  currentTurn: 'w',
  isGameOver: false,
  gameOverReason: null,
  gameWinner: null,
  lastMove: null,
  checkedKingSquare: null,
  viewMoveIndex: -1,
  viewFen: INITIAL_FEN,
  trainingEvalScore: null,
  usedHints: 0,
  lastConfirmedMoveIndex: -1,
  moveError: null,
  ...overrides,
});

describe('GameSession', () => {
  describe('constructor', () => {
    it('creates session with fresh state when no initial state provided', () => {
      const config = createTestConfig();
      const session = new GameSession(config);

      expect(session.sessionId).toBe('test-session-1');
      expect(session.fen).toBe(INITIAL_FEN);
      expect(session.moveHistory).toEqual([]);
      expect(session.isGameOver).toBe(false);
    });

    it('uses default time when no time control provided', () => {
      const config = createTestConfig({ timeControl: undefined });
      const session = new GameSession(config);

      expect(session.currentState.times).toEqual({ white: 300, black: 300 });
    });

    it('uses custom time when time control provided', () => {
      const config = createTestConfig({ timeControl: { initialTime: 600 } });
      const session = new GameSession(config);

      expect(session.currentState.times).toEqual({ white: 600, black: 600 });
    });

    it('restores from initial state when provided', () => {
      const config = createTestConfig();
      const state = createTestState({
        fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
        moveHistory: ['e4'],
        currentTurn: 'b',
        viewMoveIndex: 0,
      });

      const session = new GameSession(config, state);

      expect(session.fen).toBe(state.fen);
      expect(session.moveHistory).toEqual(['e4']);
      expect(session.currentState.currentTurn).toBe('b');
    });
  });

  describe('getters', () => {
    let session: GameSession;

    beforeEach(() => {
      session = new GameSession(createTestConfig());
    });

    it('sessionId returns config session ID', () => {
      expect(session.sessionId).toBe('test-session-1');
    });

    it('config returns readonly config', () => {
      const config = session.config;
      expect(config.mode).toBe('play');
      expect(config.playerColor).toBe('w');
    });

    it('currentState returns readonly state', () => {
      const state = session.currentState;
      expect(state.fen).toBe(INITIAL_FEN);
      expect(state.lifecycle).toBe('idle');
    });

    it('fen returns current FEN string', () => {
      expect(session.fen).toBe(INITIAL_FEN);
    });

    it('moveHistory returns move list', () => {
      expect(session.moveHistory).toEqual([]);
    });

    it('isGameOver returns game over status', () => {
      expect(session.isGameOver).toBe(false);
    });
  });

  describe('APPLY_MOVE command', () => {
    let session: GameSession;

    beforeEach(() => {
      session = new GameSession(createTestConfig());
    });

    it('applies valid move successfully', () => {
      const command: GameCommand = {
        type: 'APPLY_MOVE',
        payload: { from: 'e2', to: 'e4' },
      };

      const result = session.applyCommand(command);

      expect(result.success).toBe(true);
      expect(session.moveHistory).toEqual(['e4']);
      expect(session.currentState.currentTurn).toBe('b');
      expect(session.currentState.lastMove).toEqual({ from: 'e2', to: 'e4' });
    });

    it('fails for invalid move', () => {
      const command: GameCommand = {
        type: 'APPLY_MOVE',
        payload: { from: 'e2', to: 'e5' }, // Invalid - pawn can't move 3 squares
      };

      const result = session.applyCommand(command);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Invalid move');
      }
    });

    it('handles pawn promotion', () => {
      const config = createTestConfig();
      const promotionFen = '8/P7/8/8/8/8/8/4K2k w - - 0 1';
      const state = createTestState({
        fen: promotionFen,
        viewFen: promotionFen,
      });
      const session = new GameSession(config, state);

      const command: GameCommand = {
        type: 'APPLY_MOVE',
        payload: { from: 'a7', to: 'a8', promotion: 'q' },
      };

      const result = session.applyCommand(command);

      expect(result.success).toBe(true);
      expect(session.fen).toContain('Q'); // Queen on a8
    });

    it('tracks captured pieces', () => {
      const config = createTestConfig();
      // Position where white can capture black pawn on e5
      const captureFen = 'rnbqkbnr/pppp1ppp/8/4p3/3P4/8/PPP1PPPP/RNBQKBNR w KQkq e6 0 2';
      const state = createTestState({
        fen: captureFen,
        viewFen: captureFen,
      });
      const session = new GameSession(config, state);

      const command: GameCommand = {
        type: 'APPLY_MOVE',
        payload: { from: 'd4', to: 'e5' }, // Capture black pawn
      };

      const result = session.applyCommand(command);

      expect(result.success).toBe(true);
      // White captures black pawn, so black's captured pieces should have it
      expect(session.currentState.capturedPieces.black.length).toBeGreaterThan(0);
    });

    it('tracks en passant captures', () => {
      const config = createTestConfig();
      // White pawn on e5, black pawn just advanced to d5 — en passant available on d6
      const epFen = 'rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3';
      const state = createTestState({
        fen: epFen,
        viewFen: epFen,
      });
      const session = new GameSession(config, state);

      const command: GameCommand = {
        type: 'APPLY_MOVE',
        payload: { from: 'e5', to: 'd6' }, // En passant capture
      };

      const result = session.applyCommand(command);

      expect(result.success).toBe(true);
      // White captures black pawn via en passant
      expect(session.currentState.capturedPieces.black).toContain('bP');
      expect(session.currentState.capturedPieces.black).toHaveLength(1);
    });

    it('generates correct en passant FEN after move sequence', () => {
      const config = createTestConfig();
      const session = new GameSession(config);

      // Play: 1. e4 Nf6 2. e5 d5 (creates en passant on d6)
      const moves = [
        { from: 'e2', to: 'e4' },
        { from: 'g8', to: 'f6' },
        { from: 'e4', to: 'e5' },
        { from: 'd7', to: 'd5' },
      ];

      for (const move of moves) {
        const result = session.applyCommand({
          type: 'APPLY_MOVE',
          payload: { from: move.from, to: move.to },
        });
        expect(result.success).toBe(true);
      }

      // After d7-d5, the FEN should have d6 as en passant square
      const fen = session.currentState.fen;
      const enPassantSquare = fen.split(' ')[3];
      expect(enPassantSquare).toBe('d6');

      // viewFen should also have the en passant square
      expect(session.currentState.viewFen.split(' ')[3]).toBe('d6');

      // The en passant capture should be a legal move for e5 pawn
      const legalMoves = session.getLegalMoves('e5');
      expect(legalMoves).toContain('d6');
    });

    it('en passant capture works through move sequence', () => {
      const config = createTestConfig();
      const session = new GameSession(config);

      // Play: 1. e4 Nf6 2. e5 d5 3. exd6 (en passant)
      const moves = [
        { from: 'e2', to: 'e4' },
        { from: 'g8', to: 'f6' },
        { from: 'e4', to: 'e5' },
        { from: 'd7', to: 'd5' },
        { from: 'e5', to: 'd6' }, // en passant
      ];

      for (const move of moves) {
        const result = session.applyCommand({
          type: 'APPLY_MOVE',
          payload: { from: move.from, to: move.to },
        });
        expect(result.success).toBe(true);
      }

      // Should have captured the black pawn via en passant
      expect(session.currentState.capturedPieces.black).toContain('bP');

      // The white pawn should now be on d6 (rank 6: ...Pd6...Nf6...)
      expect(session.currentState.fen).toContain('3P1n2');
    });

    it('black en passant works through move sequence', () => {
      const config = createTestConfig({ playerColor: 'b' });
      const session = new GameSession(config);

      // Play: 1. a3 d5 2. a4 d4 3. c4 (double push, en passant target c3)
      const moves = [
        { from: 'a2', to: 'a3' },
        { from: 'd7', to: 'd5' },
        { from: 'a3', to: 'a4' },
        { from: 'd5', to: 'd4' },
        { from: 'c2', to: 'c4' },
      ];

      for (const move of moves) {
        const result = session.applyCommand({
          type: 'APPLY_MOVE',
          payload: { from: move.from, to: move.to },
        });
        expect(result.success).toBe(true);
      }

      // FEN should have c3 as en passant square
      const fen = session.currentState.fen;
      expect(fen.split(' ')[3]).toBe('c3');

      // Black's d4 pawn should have c3 as a legal move
      const legalMoves = session.getLegalMoves('d4');
      expect(legalMoves).toContain('c3');

      // Execute en passant
      const epResult = session.applyCommand({
        type: 'APPLY_MOVE',
        payload: { from: 'd4', to: 'c3' },
      });
      expect(epResult.success).toBe(true);
      expect(session.currentState.capturedPieces.white).toContain('wP');
    });

    it('detects checkmate and ends game', () => {
      const config = createTestConfig();
      // Scholar's mate position - one move from checkmate
      const nearMateFen = 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4';
      const state = createTestState({
        fen: nearMateFen,
        viewFen: nearMateFen,
        lifecycle: 'playing',
      });
      const session = new GameSession(config, state);

      const command: GameCommand = {
        type: 'APPLY_MOVE',
        payload: { from: 'h5', to: 'f7' }, // Qxf7# - checkmate
      };

      const result = session.applyCommand(command);

      expect(result.success).toBe(true);
      expect(session.isGameOver).toBe(true);
      expect(session.currentState.gameOverReason).toBe('checkmate');
      expect(session.currentState.gameWinner).toBe('w');
    });

    it('updates viewMoveIndex after move', () => {
      const command: GameCommand = {
        type: 'APPLY_MOVE',
        payload: { from: 'e2', to: 'e4' },
      };

      session.applyCommand(command);

      expect(session.currentState.viewMoveIndex).toBe(0);
    });
  });

  describe('SYNC_STATE command', () => {
    let session: GameSession;

    beforeEach(() => {
      session = new GameSession(createTestConfig());
    });

    it('updates state with partial state', () => {
      const command: GameCommand = {
        type: 'SYNC_STATE',
        payload: {
          state: {
            times: { white: 200, black: 250 },
            trainingEvalScore: 0.5,
          },
        },
      };

      const result = session.applyCommand(command);

      expect(result.success).toBe(true);
      expect(session.currentState.times).toEqual({ white: 200, black: 250 });
      expect(session.currentState.trainingEvalScore).toBe(0.5);
    });

    it('updates chess instance when FEN changes', () => {
      const newFen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
      const command: GameCommand = {
        type: 'SYNC_STATE',
        payload: {
          state: { fen: newFen },
        },
      };

      const result = session.applyCommand(command);

      expect(result.success).toBe(true);
      expect(session.fen).toBe(newFen);
    });
  });

  describe('ROLLBACK command', () => {
    let session: GameSession;

    beforeEach(() => {
      session = new GameSession(createTestConfig());
      // Make some moves first
      session.applyCommand({ type: 'APPLY_MOVE', payload: { from: 'e2', to: 'e4' } });
      session.applyCommand({ type: 'APPLY_MOVE', payload: { from: 'e7', to: 'e5' } });
      session.applyCommand({ type: 'APPLY_MOVE', payload: { from: 'd2', to: 'd4' } });
    });

    it('rolls back to specified move index', () => {
      const command: GameCommand = {
        type: 'ROLLBACK',
        payload: { toMoveIndex: 0 }, // Back to after e4
      };

      const result = session.applyCommand(command);

      expect(result.success).toBe(true);
      expect(session.moveHistory).toEqual(['e4']);
      expect(session.currentState.currentTurn).toBe('b');
    });

    it('rolls back to initial position with index -1', () => {
      const command: GameCommand = {
        type: 'ROLLBACK',
        payload: { toMoveIndex: -1 },
      };

      const result = session.applyCommand(command);

      expect(result.success).toBe(true);
      expect(session.moveHistory).toEqual([]);
      expect(session.fen).toBe(INITIAL_FEN);
    });

    it('fails for invalid move index', () => {
      const command: GameCommand = {
        type: 'ROLLBACK',
        payload: { toMoveIndex: 100 },
      };

      const result = session.applyCommand(command);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Invalid move index');
      }
    });

    it('clears game over state on rollback', () => {
      // First end the game
      session.applyCommand({
        type: 'END_GAME',
        payload: { reason: 'resignation', winner: 'w' },
      });

      // Then rollback
      const result = session.applyCommand({
        type: 'ROLLBACK',
        payload: { toMoveIndex: 1 },
      });

      expect(result.success).toBe(true);
      expect(session.isGameOver).toBe(false);
      expect(session.currentState.gameOverReason).toBeNull();
    });
  });

  describe('RESIGN command', () => {
    let session: GameSession;

    beforeEach(() => {
      session = new GameSession(createTestConfig());
    });

    it('ends game with opponent as winner when white resigns', () => {
      const command: GameCommand = {
        type: 'RESIGN',
        payload: { resigningSide: 'w' },
      };

      const result = session.applyCommand(command);

      expect(result.success).toBe(true);
      expect(session.isGameOver).toBe(true);
      expect(session.currentState.gameOverReason).toBe('resignation');
      expect(session.currentState.gameWinner).toBe('b');
    });

    it('ends game with opponent as winner when black resigns', () => {
      const command: GameCommand = {
        type: 'RESIGN',
        payload: { resigningSide: 'b' },
      };

      const result = session.applyCommand(command);

      expect(result.success).toBe(true);
      expect(session.currentState.gameWinner).toBe('w');
    });

    it('transitions lifecycle to ended', () => {
      session.applyCommand({
        type: 'SYNC_STATE',
        payload: { state: { lifecycle: 'playing' } },
      });

      session.applyCommand({
        type: 'RESIGN',
        payload: { resigningSide: 'w' },
      });

      expect(session.currentState.lifecycle).toBe('ended');
    });
  });

  describe('TIMEOUT command', () => {
    let session: GameSession;

    beforeEach(() => {
      session = new GameSession(createTestConfig());
    });

    it('ends game with opponent as winner on timeout', () => {
      const command: GameCommand = {
        type: 'TIMEOUT',
        payload: { losingColor: 'w' },
      };

      const result = session.applyCommand(command);

      expect(result.success).toBe(true);
      expect(session.isGameOver).toBe(true);
      expect(session.currentState.gameOverReason).toBe('time');
      expect(session.currentState.gameWinner).toBe('b');
    });

    it('black timeout gives white the win', () => {
      const command: GameCommand = {
        type: 'TIMEOUT',
        payload: { losingColor: 'b' },
      };

      const result = session.applyCommand(command);

      expect(result.success).toBe(true);
      expect(session.currentState.gameWinner).toBe('w');
    });
  });

  describe('TAKE_BACK command', () => {
    it('undoes last move when it is players turn', () => {
      const session = new GameSession(createTestConfig({ playerColor: 'w' }));
      session.applyCommand({ type: 'APPLY_MOVE', payload: { from: 'e2', to: 'e4' } });
      session.applyCommand({ type: 'APPLY_MOVE', payload: { from: 'e7', to: 'e5' } });

      // After e5, it's white's turn. Take back should undo e5 (and e4 if needed to get back to white's turn)
      const command: GameCommand = {
        type: 'TAKE_BACK',
        payload: { playerColor: 'w' },
      };

      const result = session.applyCommand(command);

      expect(result.success).toBe(true);
      expect(session.currentState.currentTurn).toBe('w');
    });

    it('fails when there are no moves to take back', () => {
      const session = new GameSession(createTestConfig());

      const command: GameCommand = {
        type: 'TAKE_BACK',
        payload: { playerColor: 'w' },
      };

      const result = session.applyCommand(command);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('No moves to take back');
      }
    });

    it('clears game over state', () => {
      const session = new GameSession(createTestConfig());
      session.applyCommand({ type: 'APPLY_MOVE', payload: { from: 'e2', to: 'e4' } });
      session.applyCommand({
        type: 'END_GAME',
        payload: { reason: 'resignation', winner: 'b' },
      });

      const result = session.applyCommand({
        type: 'TAKE_BACK',
        payload: { playerColor: 'w' },
      });

      expect(result.success).toBe(true);
      expect(session.isGameOver).toBe(false);
    });
  });

  describe('END_GAME command', () => {
    let session: GameSession;

    beforeEach(() => {
      session = new GameSession(createTestConfig());
    });

    it('ends game with specified reason and winner', () => {
      const command: GameCommand = {
        type: 'END_GAME',
        payload: { reason: 'checkmate', winner: 'w' },
      };

      const result = session.applyCommand(command);

      expect(result.success).toBe(true);
      expect(session.isGameOver).toBe(true);
      expect(session.currentState.gameOverReason).toBe('checkmate');
      expect(session.currentState.gameWinner).toBe('w');
    });

    it('sets draw correctly', () => {
      const command: GameCommand = {
        type: 'END_GAME',
        payload: { reason: 'stalemate', winner: 'draw' },
      };

      const result = session.applyCommand(command);

      expect(result.success).toBe(true);
      expect(session.currentState.gameWinner).toBe('draw');
    });

    it('saves eval score for training mode', () => {
      const command: GameCommand = {
        type: 'END_GAME',
        payload: { reason: 'resignation', winner: 'w', evalScore: 2.5 },
      };

      const result = session.applyCommand(command);

      expect(result.success).toBe(true);
      expect(session.currentState.trainingEvalScore).toBe(2.5);
    });
  });

  describe('UPDATE_TIMES command', () => {
    let session: GameSession;

    beforeEach(() => {
      session = new GameSession(createTestConfig());
    });

    it('updates player times', () => {
      const command: GameCommand = {
        type: 'UPDATE_TIMES',
        payload: { times: { white: 150, black: 200 } },
      };

      const result = session.applyCommand(command);

      expect(result.success).toBe(true);
      expect(session.currentState.times).toEqual({ white: 150, black: 200 });
    });
  });

  describe('NAVIGATE_HISTORY command', () => {
    let session: GameSession;

    beforeEach(() => {
      session = new GameSession(createTestConfig());
      session.applyCommand({ type: 'APPLY_MOVE', payload: { from: 'e2', to: 'e4' } });
      session.applyCommand({ type: 'APPLY_MOVE', payload: { from: 'e7', to: 'e5' } });
      session.applyCommand({ type: 'APPLY_MOVE', payload: { from: 'd2', to: 'd4' } });
    });

    it('navigates to specific move index', () => {
      const command: GameCommand = {
        type: 'NAVIGATE_HISTORY',
        payload: { targetIndex: 0 },
      };

      const result = session.applyCommand(command);

      expect(result.success).toBe(true);
      expect(session.currentState.viewMoveIndex).toBe(0);
      // viewFen should show position after e4
      expect(session.currentState.viewFen).toContain('4P3');
    });

    it('navigates to initial position with index -1', () => {
      const command: GameCommand = {
        type: 'NAVIGATE_HISTORY',
        payload: { targetIndex: -1 },
      };

      const result = session.applyCommand(command);

      expect(result.success).toBe(true);
      expect(session.currentState.viewMoveIndex).toBe(-1);
    });

    it('clamps index to valid range', () => {
      const command: GameCommand = {
        type: 'NAVIGATE_HISTORY',
        payload: { targetIndex: 100 },
      };

      const result = session.applyCommand(command);

      expect(result.success).toBe(true);
      // Should clamp to last move (index 2)
      expect(session.currentState.viewMoveIndex).toBe(2);
    });

    it('preserves actual game state while navigating view', () => {
      session.applyCommand({
        type: 'NAVIGATE_HISTORY',
        payload: { targetIndex: 0 },
      });

      // moveHistory and fen should be unchanged
      expect(session.moveHistory).toEqual(['e4', 'e5', 'd4']);
      // viewFen shows historical position, fen shows current
      expect(session.currentState.viewFen).not.toBe(session.fen);
    });
  });

  describe('OPTIMISTIC_MOVE command', () => {
    let session: GameSession;

    beforeEach(() => {
      session = new GameSession(createTestConfig());
    });

    it('applies move and clears move error', () => {
      // First set a move error
      session.applyCommand({
        type: 'SYNC_STATE',
        payload: { state: { moveError: 'Previous error' } },
      });

      const command: GameCommand = {
        type: 'OPTIMISTIC_MOVE',
        payload: { from: 'e2', to: 'e4' },
      };

      const result = session.applyCommand(command);

      expect(result.success).toBe(true);
      expect(session.moveHistory).toEqual(['e4']);
      expect(session.currentState.moveError).toBeNull();
    });

    it('fails for invalid move', () => {
      const command: GameCommand = {
        type: 'OPTIMISTIC_MOVE',
        payload: { from: 'e2', to: 'e5' },
      };

      const result = session.applyCommand(command);

      expect(result.success).toBe(false);
    });
  });

  describe('CONFIRM_MOVE command', () => {
    let session: GameSession;

    beforeEach(() => {
      session = new GameSession(createTestConfig());
      session.applyCommand({ type: 'APPLY_MOVE', payload: { from: 'e2', to: 'e4' } });
    });

    it('updates confirmed move index and times', () => {
      const command: GameCommand = {
        type: 'CONFIRM_MOVE',
        payload: {
          serverFen: session.fen,
          whiteTimeMs: 295000,
          blackTimeMs: 300000,
        },
      };

      const result = session.applyCommand(command);

      expect(result.success).toBe(true);
      expect(session.currentState.lastConfirmedMoveIndex).toBe(0);
      expect(session.currentState.times).toEqual({ white: 295, black: 300 });
      expect(session.currentState.moveError).toBeNull();
    });
  });

  describe('REJECT_MOVE command', () => {
    let session: GameSession;

    beforeEach(() => {
      session = new GameSession(createTestConfig());
      session.applyCommand({ type: 'APPLY_MOVE', payload: { from: 'e2', to: 'e4' } });
    });

    it('rolls back to server state and sets error', () => {
      const command: GameCommand = {
        type: 'REJECT_MOVE',
        payload: {
          serverFen: INITIAL_FEN,
          reason: 'Invalid move',
        },
      };

      const result = session.applyCommand(command);

      expect(result.success).toBe(true);
      expect(session.fen).toBe(INITIAL_FEN);
      expect(session.currentState.moveError).toBe('Invalid move');
    });
  });

  describe('unknown command', () => {
    it('returns error for unknown command type', () => {
      const session = new GameSession(createTestConfig());

      const result = session.applyCommand({
        type: 'UNKNOWN_COMMAND' as 'APPLY_MOVE',
        payload: {},
      } as GameCommand);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Unknown command type');
      }
    });
  });

  describe('snapshot', () => {
    it('creates snapshot with config and state', () => {
      const session = new GameSession(createTestConfig());
      session.applyCommand({ type: 'APPLY_MOVE', payload: { from: 'e2', to: 'e4' } });

      const snapshot = session.createSnapshot();

      expect(snapshot.config.sessionId).toBe('test-session-1');
      expect(snapshot.state.moveHistory).toEqual(['e4']);
      expect(snapshot.createdAt).toBeGreaterThan(0);
      expect(snapshot.updatedAt).toBeGreaterThan(0);
    });

    it('restores session from snapshot', () => {
      const original = new GameSession(createTestConfig());
      original.applyCommand({ type: 'APPLY_MOVE', payload: { from: 'e2', to: 'e4' } });
      original.applyCommand({ type: 'APPLY_MOVE', payload: { from: 'e7', to: 'e5' } });

      const snapshot = original.createSnapshot();
      const restored = GameSession.fromSnapshot(snapshot);

      expect(restored.sessionId).toBe(original.sessionId);
      expect(restored.moveHistory).toEqual(original.moveHistory);
      expect(restored.fen).toBe(original.fen);
    });
  });

  describe('chess delegation methods', () => {
    let session: GameSession;

    beforeEach(() => {
      session = new GameSession(createTestConfig());
    });

    it('getLegalMoves returns valid moves for piece', () => {
      const moves = session.getLegalMoves('e2');
      expect(moves).toContain('e3');
      expect(moves).toContain('e4');
    });

    it('getLegalMoves returns empty for empty square', () => {
      const moves = session.getLegalMoves('e4');
      expect(moves).toEqual([]);
    });

    it('isSquareOccupied returns true for occupied square', () => {
      expect(session.isSquareOccupied('e2')).toBe(true);
      expect(session.isSquareOccupied('e1')).toBe(true);
    });

    it('isSquareOccupied returns false for empty square', () => {
      expect(session.isSquareOccupied('e4')).toBe(false);
    });

    it('getPieceAt returns piece info for occupied square', () => {
      const piece = session.getPieceAt('e1');
      expect(piece).toEqual({ type: 'k', color: 'w' });
    });

    it('getPieceAt returns null for empty square', () => {
      expect(session.getPieceAt('e4')).toBeNull();
    });

    it('isCheck returns false in initial position', () => {
      expect(session.isCheck()).toBe(false);
    });

    it('isCheckmate returns false in initial position', () => {
      expect(session.isCheckmate()).toBe(false);
    });

    it('isStalemate returns false in initial position', () => {
      expect(session.isStalemate()).toBe(false);
    });

    it('isDraw returns false in initial position', () => {
      expect(session.isDraw()).toBe(false);
    });

    it('getBoard returns board squares', () => {
      const board = session.getBoard();
      expect(board).toHaveLength(64);
    });

    it('getPieceSymbol returns piece symbol', () => {
      expect(session.getPieceSymbol('e1')).toBe('wK');
      expect(session.getPieceSymbol('e8')).toBe('bK');
      expect(session.getPieceSymbol('e4')).toBeNull();
    });

    it('getChessInstance returns chess.js instance', () => {
      const chess = session.getChessInstance();
      expect(chess).toBeDefined();
      expect(chess.fen()).toBe(INITIAL_FEN);
    });

    it('getBoardCache returns board cache', () => {
      const cache = session.getBoardCache();
      expect(cache).toBeDefined();
    });
  });

  describe('TRUNCATE_TO_VIEW command', () => {
    it('truncates history to viewed position', () => {
      const session = new GameSession(createTestConfig());
      session.applyCommand({ type: 'APPLY_MOVE', payload: { from: 'e2', to: 'e4' } });
      session.applyCommand({ type: 'APPLY_MOVE', payload: { from: 'e7', to: 'e5' } });
      session.applyCommand({ type: 'APPLY_MOVE', payload: { from: 'd2', to: 'd4' } });

      // Navigate to move index 0 (after e4)
      session.applyCommand({ type: 'NAVIGATE_HISTORY', payload: { targetIndex: 0 } });

      const result = session.applyCommand({ type: 'TRUNCATE_TO_VIEW', payload: {} });

      expect(result.success).toBe(true);
      expect(session.moveHistory).toEqual(['e4']);
      expect(session.currentState.viewMoveIndex).toBe(0);
    });

    it('does nothing when already at the end', () => {
      const session = new GameSession(createTestConfig());
      session.applyCommand({ type: 'APPLY_MOVE', payload: { from: 'e2', to: 'e4' } });

      const result = session.applyCommand({ type: 'TRUNCATE_TO_VIEW', payload: {} });

      expect(result.success).toBe(true);
      expect(session.moveHistory).toEqual(['e4']);
    });

    it('truncates to empty when viewing before any moves', () => {
      const session = new GameSession(createTestConfig());
      session.applyCommand({ type: 'APPLY_MOVE', payload: { from: 'e2', to: 'e4' } });
      session.applyCommand({ type: 'APPLY_MOVE', payload: { from: 'e7', to: 'e5' } });

      // Navigate to index -1 (before any moves)
      session.applyCommand({ type: 'NAVIGATE_HISTORY', payload: { targetIndex: -1 } });

      const result = session.applyCommand({ type: 'TRUNCATE_TO_VIEW', payload: {} });

      expect(result.success).toBe(true);
      expect(session.moveHistory).toEqual([]);
      expect(session.fen).toBe(INITIAL_FEN);
    });

    it('recalculates captured pieces after truncation', () => {
      const session = new GameSession(createTestConfig());
      // Play moves that include a capture
      session.applyCommand({ type: 'APPLY_MOVE', payload: { from: 'e2', to: 'e4' } });
      session.applyCommand({ type: 'APPLY_MOVE', payload: { from: 'd7', to: 'd5' } });
      session.applyCommand({ type: 'APPLY_MOVE', payload: { from: 'e4', to: 'd5' } }); // capture

      expect(session.currentState.capturedPieces.black.length).toBe(1);

      // Navigate before the capture
      session.applyCommand({ type: 'NAVIGATE_HISTORY', payload: { targetIndex: 1 } });

      // Truncate - should recalculate captures (no capture in first 2 moves)
      session.applyCommand({ type: 'TRUNCATE_TO_VIEW', payload: {} });

      expect(session.currentState.capturedPieces.black).toEqual([]);
      expect(session.currentState.capturedPieces.white).toEqual([]);
    });

    it('allows new move after truncation', () => {
      const session = new GameSession(createTestConfig());
      session.applyCommand({ type: 'APPLY_MOVE', payload: { from: 'e2', to: 'e4' } });
      session.applyCommand({ type: 'APPLY_MOVE', payload: { from: 'e7', to: 'e5' } });
      session.applyCommand({ type: 'APPLY_MOVE', payload: { from: 'd2', to: 'd4' } });

      // Navigate to after e4, truncate, play a different move
      session.applyCommand({ type: 'NAVIGATE_HISTORY', payload: { targetIndex: 0 } });
      session.applyCommand({ type: 'TRUNCATE_TO_VIEW', payload: {} });

      const result = session.applyCommand({
        type: 'APPLY_MOVE',
        payload: { from: 'e7', to: 'e6' },
      });

      expect(result.success).toBe(true);
      expect(session.moveHistory).toEqual(['e4', 'e6']);
    });
  });

  describe('getLegalMoveCaptures', () => {
    it('returns capture squares for a piece with captures available', () => {
      const session = new GameSession(createTestConfig());
      session.applyCommand({ type: 'APPLY_MOVE', payload: { from: 'e2', to: 'e4' } });
      session.applyCommand({ type: 'APPLY_MOVE', payload: { from: 'd7', to: 'd5' } });

      const captures = session.getLegalMoveCaptures('e4');
      expect(captures.has('d5')).toBe(true);
      expect(captures.size).toBe(1);
    });

    it('returns empty set when no captures available', () => {
      const session = new GameSession(createTestConfig());

      const captures = session.getLegalMoveCaptures('e2');
      expect(captures.size).toBe(0);
    });

    it('returns empty set for empty square', () => {
      const session = new GameSession(createTestConfig());

      const captures = session.getLegalMoveCaptures('e4');
      expect(captures.size).toBe(0);
    });

    it('detects en passant capture', () => {
      const config = createTestConfig({
        startingFen: 'rnbqkbnr/pppp1ppp/8/4pP2/8/8/PPPPP1PP/RNBQKBNR w KQkq e6 0 3',
      });
      const session = new GameSession(config);

      const captures = session.getLegalMoveCaptures('f5');
      expect(captures.has('e6')).toBe(true);
    });
  });

  describe('error handling', () => {
    it('catches and returns errors thrown during command execution', () => {
      const session = new GameSession(createTestConfig());

      // Corrupt the chess instance to force an error
      const result = session.applyCommand({
        type: 'ROLLBACK',
        payload: { toMoveIndex: -5 }, // Invalid index
      });

      expect(result.success).toBe(false);
    });
  });
});
