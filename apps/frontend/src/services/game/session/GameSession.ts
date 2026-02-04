import { Chess } from 'chess.js';
import { BoardCache } from '../BoardCache';
import { processCapturedPiece } from '../chessGameService';
import { getTurnFromFen } from '../fenUtils';
import { transition } from '../gameLifecycle';
import type {
  GameSessionConfig,
  GameSessionState,
  GameSessionSnapshot,
  GameCommand,
  CommandResult,
} from './types';
import type { Square, PromotionPiece, BoardSquare } from '../../../types/chess';
import type { Side, GameOverReason, GameWinner } from '../../../types/game';

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export class GameSession {
  private chess: Chess;
  private historyChess: Chess; // For navigating through move history
  private boardCache: BoardCache; // Efficient board representation
  private _config: GameSessionConfig;
  private _state: GameSessionState;
  private stateHistory: GameSessionState[] = [];
  private maxHistorySize = 50;

  constructor(config: GameSessionConfig, initialState?: GameSessionState) {
    this._config = config;
    this.chess = new Chess();
    this.historyChess = new Chess();
    this.boardCache = new BoardCache();

    if (initialState) {
      // Restore from snapshot
      this._state = { ...initialState };
      this.chess.load(initialState.fen);
      this.boardCache.load(initialState.fen);
      // Replay moves to sync chess instance
      this.historyChess.reset();
      for (const move of initialState.moveHistory) {
        this.historyChess.move(move);
      }
    } else {
      // Initialize fresh game (may use custom starting FEN from config)
      this._state = this.createInitialState(config);
      // Load the starting position into chess instances
      const startFen = this._state.fen;
      this.chess.load(startFen);
      this.boardCache.load(startFen);
      this.historyChess.load(startFen);
    }

    this.pushStateHistory();
  }

  get sessionId(): string {
    return this._config.sessionId;
  }

  get config(): Readonly<GameSessionConfig> {
    return this._config;
  }

  get currentState(): Readonly<GameSessionState> {
    return this._state;
  }

  get fen(): string {
    return this._state.fen;
  }

  get moveHistory(): readonly string[] {
    return this._state.moveHistory;
  }

  get isGameOver(): boolean {
    return this._state.isGameOver;
  }

  applyCommand(command: GameCommand): CommandResult {
    const previousState = { ...this._state };

    try {
      switch (command.type) {
        case 'APPLY_MOVE':
          return this.handleApplyMove(command.payload);
        case 'SYNC_STATE':
          return this.handleSyncState(command.payload);
        case 'ROLLBACK':
          return this.handleRollback(command.payload);
        case 'RESIGN':
          return this.handleResign(command.payload);
        case 'TIMEOUT':
          return this.handleTimeout(command.payload);
        case 'TAKE_BACK':
          return this.handleTakeBack(command.payload);
        case 'END_GAME':
          return this.handleEndGame(command.payload);
        case 'UPDATE_TIMES':
          return this.handleUpdateTimes(command.payload);
        case 'NAVIGATE_HISTORY':
          return this.handleNavigateHistory(command.payload);
        case 'OPTIMISTIC_MOVE':
          return this.handleOptimisticMove(command.payload);
        case 'CONFIRM_MOVE':
          return this.handleConfirmMove(command.payload);
        case 'REJECT_MOVE':
          return this.handleRejectMove(command.payload);
        case 'TRUNCATE_TO_VIEW':
          return this.handleTruncateToView();
        default:
          return {
            success: false,
            error: `Unknown command type: ${(command as GameCommand).type}`,
            rollbackState: previousState,
          };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return {
        success: false,
        error: errorMessage,
        rollbackState: previousState,
      };
    }
  }

  createSnapshot(): GameSessionSnapshot {
    return {
      config: { ...this._config },
      state: { ...this._state },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  static fromSnapshot(snapshot: GameSessionSnapshot): GameSession {
    return new GameSession(snapshot.config, snapshot.state);
  }

  /** Get legal moves for a piece at the given square. Uses cached computation. */
  getLegalMoves(square: Square): Square[] {
    return this.boardCache.getLegalMoves(square);
  }

  /** Check if a square is occupied. O(1) lookup. */
  isSquareOccupied(square: Square): boolean {
    return this.boardCache.isSquareOccupied(square);
  }

  /** Get piece at a square. O(1) lookup. */
  getPieceAt(square: Square): { type: string; color: Side } | null {
    const piece = this.boardCache.getPieceAt(square);
    if (!piece) return null;
    return { type: piece.type, color: piece.color as Side };
  }

  /** Check if the current position is check. Cached. */
  isCheck(): boolean {
    return this.boardCache.isCheck;
  }

  /** Check if the current position is checkmate. Cached. */
  isCheckmate(): boolean {
    return this.boardCache.isCheckmate;
  }

  /** Check if the current position is stalemate. Cached. */
  isStalemate(): boolean {
    return this.boardCache.isStalemate;
  }

  /** Check if the current position is a draw. Cached. */
  isDraw(): boolean {
    return this.boardCache.isDraw;
  }

  /** Get the board as an array of squares for UI rendering. */
  getBoard(): BoardSquare[] {
    return this.boardCache.toBoardSquares();
  }

  /** Get piece symbol (e.g., 'wK', 'bP') at a square. O(1) lookup. */
  getPieceSymbol(square: Square): string | null {
    return this.boardCache.getPieceSymbol(square);
  }

  /** @deprecated Use getLegalMoves instead. Provided for backward compatibility. */
  getChessInstance(): Chess {
    return this.chess;
  }

  /** Get the BoardCache instance for advanced usage. */
  getBoardCache(): BoardCache {
    return this.boardCache;
  }

  private handleApplyMove(payload: {
    from: Square;
    to: Square;
    promotion?: PromotionPiece;
  }): CommandResult {
    const { from, to, promotion } = payload;

    // Check for capture before move using cached board (O(1) lookup)
    const capturedPieceSymbol = this.boardCache.getPieceSymbol(to);

    // Attempt the move
    const move = this.chess.move({ from, to, promotion });
    if (!move) {
      return {
        success: false,
        error: `Invalid move from ${from} to ${to}`,
      };
    }

    const newFen = this.chess.fen();
    const history = this.chess.history();

    // Sync BoardCache with new position
    this.boardCache.load(newFen);

    // Update captured pieces
    let newCapturedPieces = { ...this._state.capturedPieces };
    if (capturedPieceSymbol) {
      newCapturedPieces = processCapturedPiece(capturedPieceSymbol, newCapturedPieces);
    }

    // Determine checked king square using cached board
    const checkedKingSquare = this.boardCache.checkedKingSquare;

    // Check for game end using cached state
    const { isGameOver, gameOverReason, gameWinner } = this.checkTerminalState();

    // Update state
    this._state = {
      ...this._state,
      fen: newFen,
      moveHistory: history,
      capturedPieces: newCapturedPieces,
      currentTurn: this._state.currentTurn === 'w' ? 'b' : 'w',
      lastMove: { from, to },
      checkedKingSquare,
      viewMoveIndex: history.length - 1,
      viewFen: newFen,
      isGameOver,
      gameOverReason: isGameOver ? gameOverReason : this._state.gameOverReason,
      gameWinner: isGameOver ? gameWinner : this._state.gameWinner,
      lifecycle: isGameOver
        ? transition(this._state.lifecycle, 'GAME_OVER')
        : this._state.lifecycle,
    };

    this.pushStateHistory();

    return { success: true, newState: this._state };
  }

  private handleSyncState(payload: { state: Partial<GameSessionState> }): CommandResult {
    const { state: partialState } = payload;

    // If FEN is being synced, update chess instance and BoardCache
    if (partialState.fen && partialState.fen !== this._state.fen) {
      this.chess.load(partialState.fen);
      this.boardCache.load(partialState.fen);
    }

    this._state = { ...this._state, ...partialState };
    this.pushStateHistory();

    return { success: true, newState: this._state };
  }

  private handleRollback(payload: { toMoveIndex: number }): CommandResult {
    const { toMoveIndex } = payload;

    if (toMoveIndex < -1 || toMoveIndex >= this._state.moveHistory.length) {
      return {
        success: false,
        error: `Invalid move index: ${toMoveIndex}`,
      };
    }

    // Reset chess instance to starting position (may be custom FEN) and replay moves
    const startingFen = this._config.startingFen ?? INITIAL_FEN;
    this.chess.load(startingFen);
    for (let i = 0; i <= toMoveIndex; i++) {
      this.chess.move(this._state.moveHistory[i]);
    }

    const newFen = this.chess.fen();
    const newHistory = this.chess.history();

    // Sync BoardCache with new position
    this.boardCache.load(newFen);

    this._state = {
      ...this._state,
      fen: newFen,
      moveHistory: newHistory,
      currentTurn: getTurnFromFen(newFen),
      viewMoveIndex: newHistory.length - 1,
      viewFen: newFen,
      lastMove: null,
      checkedKingSquare: this.boardCache.checkedKingSquare,
      isGameOver: false,
      gameOverReason: null,
      gameWinner: null,
    };

    this.pushStateHistory();

    return { success: true, newState: this._state };
  }

  private handleResign(payload: { resigningSide: Side }): CommandResult {
    const winner = payload.resigningSide === 'w' ? 'b' : 'w';

    this._state = {
      ...this._state,
      lifecycle: transition(this._state.lifecycle, 'GAME_OVER'),
      isGameOver: true,
      gameOverReason: 'resignation',
      gameWinner: winner,
    };

    this.pushStateHistory();

    return { success: true, newState: this._state };
  }

  private handleTimeout(payload: { losingColor: Side }): CommandResult {
    const winner = payload.losingColor === 'w' ? 'b' : 'w';

    this._state = {
      ...this._state,
      lifecycle: transition(this._state.lifecycle, 'GAME_OVER'),
      isGameOver: true,
      gameOverReason: 'time',
      gameWinner: winner,
    };

    this.pushStateHistory();

    return { success: true, newState: this._state };
  }

  private handleTakeBack(payload: { playerColor: Side }): CommandResult {
    const { playerColor } = payload;

    // Undo player's move
    const undone1 = this.chess.undo();
    if (!undone1) {
      return { success: false, error: 'No moves to take back' };
    }

    // Update captured pieces for first undo
    const newCapturedPieces = { ...this._state.capturedPieces };
    if (undone1.captured) {
      if (undone1.color === 'w') {
        newCapturedPieces.black = newCapturedPieces.black.slice(0, -1);
      } else {
        newCapturedPieces.white = newCapturedPieces.white.slice(0, -1);
      }
    }

    // If it's still not player's turn, undo AI move too
    if (this.chess.turn() !== playerColor) {
      const undone2 = this.chess.undo();
      if (undone2?.captured) {
        if (undone2.color === 'w') {
          newCapturedPieces.black = newCapturedPieces.black.slice(0, -1);
        } else {
          newCapturedPieces.white = newCapturedPieces.white.slice(0, -1);
        }
      }
    }

    const newFen = this.chess.fen();
    const history = this.chess.history();

    // Sync BoardCache with new position
    this.boardCache.load(newFen);

    this._state = {
      ...this._state,
      fen: newFen,
      viewFen: newFen,
      moveHistory: history,
      capturedPieces: newCapturedPieces,
      viewMoveIndex: history.length - 1,
      currentTurn: history.length === 0 ? 'w' : getTurnFromFen(newFen),
      isGameOver: false,
      gameOverReason: null,
      gameWinner: null,
      lastMove: null,
      checkedKingSquare: this.boardCache.checkedKingSquare,
    };

    this.pushStateHistory();

    return { success: true, newState: this._state };
  }

  private handleEndGame(payload: {
    reason: GameOverReason;
    winner: GameWinner;
    evalScore?: number;
  }): CommandResult {
    this._state = {
      ...this._state,
      lifecycle: transition(this._state.lifecycle, 'GAME_OVER'),
      isGameOver: true,
      gameOverReason: payload.reason,
      gameWinner: payload.winner,
      trainingEvalScore: payload.evalScore ?? this._state.trainingEvalScore,
    };

    this.pushStateHistory();

    return { success: true, newState: this._state };
  }

  private handleUpdateTimes(payload: { times: { white: number; black: number } }): CommandResult {
    this._state = {
      ...this._state,
      times: payload.times,
    };

    // Don't push to history for time updates (too frequent)
    return { success: true, newState: this._state };
  }

  private handleNavigateHistory(payload: { targetIndex: number }): CommandResult {
    const { targetIndex } = payload;
    const history = this._state.moveHistory;
    const clamped = Math.min(Math.max(-1, targetIndex), history.length - 1);

    // Reset history chess to starting position (may be custom FEN) and replay moves
    const startingFen = this._config.startingFen ?? INITIAL_FEN;
    this.historyChess.load(startingFen);
    for (let i = 0; i <= clamped; i++) {
      if (i >= 0 && i < history.length) {
        this.historyChess.move(history[i]);
      }
    }

    const viewFen = clamped === history.length - 1 ? this._state.fen : this.historyChess.fen();

    this._state = {
      ...this._state,
      viewMoveIndex: clamped,
      viewFen,
    };

    return { success: true, newState: this._state };
  }

  private handleOptimisticMove(payload: {
    from: Square;
    to: Square;
    promotion?: PromotionPiece;
  }): CommandResult {
    // Save rollback point before optimistic update
    this.pushStateHistory();

    // Apply the move using normal handler
    const result = this.handleApplyMove(payload);
    if (!result.success) {
      return result;
    }

    // Clear any previous move error on successful optimistic move
    this._state = {
      ...this._state,
      moveError: null,
    };

    return { success: true, newState: this._state };
  }

  private handleConfirmMove(payload: {
    serverFen: string;
    whiteTimeMs: number;
    blackTimeMs: number;
  }): CommandResult {
    // Server confirmed the move - update confirmed index and sync times
    this._state = {
      ...this._state,
      lastConfirmedMoveIndex: this._state.moveHistory.length - 1,
      moveError: null,
      times: {
        white: payload.whiteTimeMs / 1000,
        black: payload.blackTimeMs / 1000,
      },
    };

    return { success: true, newState: this._state };
  }

  private handleRejectMove(payload: { serverFen: string; reason: string }): CommandResult {
    // Rollback to last confirmed state
    const rollbackIndex = this._state.lastConfirmedMoveIndex;

    // Reset chess instance to starting position (may be custom FEN) and replay moves up to confirmed point
    const startingFen = this._config.startingFen ?? INITIAL_FEN;
    this.chess.load(startingFen);
    for (let i = 0; i <= rollbackIndex; i++) {
      if (i >= 0 && i < this._state.moveHistory.length) {
        this.chess.move(this._state.moveHistory[i]);
      }
    }

    // Sync to authoritative server state
    this.chess.load(payload.serverFen);
    this.boardCache.load(payload.serverFen);

    const newHistory = this.chess.history();

    this._state = {
      ...this._state,
      fen: payload.serverFen,
      viewFen: payload.serverFen,
      moveHistory: newHistory,
      viewMoveIndex: newHistory.length - 1,
      currentTurn: this.boardCache.turn as 'w' | 'b',
      lastMove: null,
      checkedKingSquare: this.boardCache.checkedKingSquare,
      moveError: payload.reason,
    };

    return { success: true, newState: this._state };
  }

  private handleTruncateToView(): CommandResult {
    const viewIndex = this._state.viewMoveIndex;

    // If already at the end, nothing to truncate
    if (viewIndex >= this._state.moveHistory.length - 1 && viewIndex !== -1) {
      return { success: true, newState: this._state };
    }

    // Reload chess from starting position and replay up to viewIndex
    const startingFen = this._config.startingFen ?? INITIAL_FEN;
    this.chess.load(startingFen);
    for (let i = 0; i <= viewIndex; i++) {
      if (i >= 0 && i < this._state.moveHistory.length) {
        this.chess.move(this._state.moveHistory[i]);
      }
    }

    // Truncate history
    const newHistory = viewIndex >= 0 ? this._state.moveHistory.slice(0, viewIndex + 1) : [];
    const newFen = this.chess.fen();

    // Sync BoardCache with new position
    this.boardCache.load(newFen);

    // Recalculate captured pieces from truncated history
    const newCapturedPieces = { white: [] as string[], black: [] as string[] };
    // Note: We'd need to replay all moves to accurately recalculate captures
    // For now, we clear captures on truncation (they'll be rebuilt on new moves)

    this._state = {
      ...this._state,
      fen: newFen,
      viewFen: newFen,
      moveHistory: newHistory,
      viewMoveIndex: newHistory.length - 1,
      currentTurn: getTurnFromFen(newFen),
      lastMove: newHistory.length > 0 ? this._state.lastMove : null,
      checkedKingSquare: this.boardCache.checkedKingSquare,
      isGameOver: false,
      gameOverReason: null,
      gameWinner: null,
      capturedPieces: newCapturedPieces,
    };

    this.pushStateHistory();

    return { success: true, newState: this._state };
  }

  private createInitialState(config: GameSessionConfig): GameSessionState {
    const initialTime = config.timeControl?.initialTime ?? 300;
    const startingFen = config.startingFen ?? INITIAL_FEN;
    // Determine starting turn from FEN (second field is 'w' or 'b')
    const startingTurn = getTurnFromFen(startingFen);

    return {
      fen: startingFen,
      moveHistory: [],
      times: { white: initialTime, black: initialTime },
      capturedPieces: { white: [], black: [] },
      lifecycle: 'idle',
      currentTurn: startingTurn,
      isGameOver: false,
      gameOverReason: null,
      gameWinner: null,
      lastMove: null,
      checkedKingSquare: null,
      viewMoveIndex: -1,
      viewFen: startingFen,
      trainingEvalScore: null,
      trainingStartEval: null,
      usedHints: 0,
      lastConfirmedMoveIndex: -1,
      moveError: null,
    };
  }

  /**
   * Check terminal state using cached board state.
   * Should be called after boardCache is synced.
   */
  private checkTerminalState(): {
    isGameOver: boolean;
    gameOverReason: GameOverReason;
    gameWinner: GameWinner;
  } {
    if (this.boardCache.isCheckmate) {
      const currentTurn = this.boardCache.turn;
      return {
        isGameOver: true,
        gameOverReason: 'checkmate',
        gameWinner: currentTurn === 'w' ? 'b' : 'w',
      };
    }

    if (this.boardCache.isStalemate) {
      return {
        isGameOver: true,
        gameOverReason: 'stalemate',
        gameWinner: 'draw',
      };
    }

    if (this.boardCache.isDraw) {
      return {
        isGameOver: true,
        gameOverReason: null,
        gameWinner: 'draw',
      };
    }

    return {
      isGameOver: false,
      gameOverReason: null,
      gameWinner: null,
    };
  }

  private pushStateHistory(): void {
    this.stateHistory.push({ ...this._state });
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift();
    }
  }
}
