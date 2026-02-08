import { Chess } from 'chess.js';
import { batch } from 'solid-js';
import { createStore } from 'solid-js/store';
import { fenToBoard, getOpponentSide } from '../../../services/game/chessGameService';
import { findKingSquareFromFen } from '../../../services/game/fenUtils';
import { canMakeMove } from '../../../services/game/gameLifecycle';
import { sessionManager, type GameSession } from '../../../services/game/session/SessionManager';
import { generateSessionId } from '../../../shared/utils/generateId';
import type { Square, PromotionPiece, BoardSquare } from '../../../types/chess';
import type {
  Side,
  GameMode,
  GameOverReason,
  GameWinner,
  GamePhase,
  GameLifecycle,
  OpponentType,
  PuzzleCategory,
} from '../../../types/game';
import type { MoveEvaluation } from '../../../types/moveQuality';

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

interface ChessState {
  sessionId: string | null;
  fen: string;
  viewFen: string;
  currentTurn: Side;
  moveHistory: string[];
  viewMoveIndex: number;
  lastMove: { from: Square; to: Square } | null;
  checkedKingSquare: Square | null;
  isGameOver: boolean;
  gameOverReason: GameOverReason;
  gameWinner: GameWinner;
  playerColor: Side;
  mode: GameMode;
  opponentType: OpponentType;
  capturedWhite: string[];
  capturedBlack: string[];
  lifecycle: GameLifecycle;
  // Training mode
  trainingGamePhase: GamePhase;
  trainingAvailableHints: number;
  trainingUsedHints: number;
  trainingEvalScore: number | null;
  trainingStartEval: number | null;
  trainingPositionId: string | null;
  trainingTheme: string | null;
  trainingMoveEvaluations: MoveEvaluation[];
  // Puzzle mode
  puzzleCategory: PuzzleCategory | null;
  puzzleId: string | null;
  puzzleSolutionIndex: number;
  puzzleRated: boolean;
  puzzleFeedback: {
    type: 'incorrect' | 'complete';
    message: string;
    incorrectMoveSan?: string;
    ratingDelta?: number;
    newRating?: number;
  } | null;
  puzzleStartFen: string | null;
  // Multiplayer optimistic state
  moveError: string | null;
  // Initialization error (position fetch, etc.)
  initError: string | null;
  // Rating change after multiplayer game
  ratingChange: {
    whiteRating: number;
    blackRating: number;
    whiteRatingDelta: number;
    blackRatingDelta: number;
  } | null;
}

export interface ChessStore {
  state: ChessState;
  startGame: (config: {
    mode: GameMode;
    playerColor: Side;
    opponentType: OpponentType;
    timeControl: number;
    difficulty?: number;
    trainingGamePhase?: GamePhase;
    trainingAvailableHints?: number;
    trainingStartEval?: number;
    trainingPositionId?: string;
    trainingTheme?: string;
    fen?: string;
    puzzleCategory?: PuzzleCategory;
    puzzleId?: string;
    puzzleRated?: boolean;
    puzzleStartFen?: string;
  }) => string;
  applyMove: (from: Square, to: Square, promotion?: PromotionPiece) => boolean;
  applyOptimisticMove: (from: Square, to: Square, promotion?: PromotionPiece) => boolean;
  confirmMove: (data: {
    serverFen: string;
    san: string;
    from: string;
    to: string;
    isCheck?: boolean;
    whiteTimeMs: number;
    blackTimeMs: number;
  }) => void;
  rejectMove: (serverFen: string, reason: string) => void;
  endGame: (reason: GameOverReason, winner: GameWinner, evalScore?: number) => void;
  exitGame: () => void;
  resign: () => void;
  takeBack: () => void;
  jumpToMoveIndex: (targetIndex: number) => void;
  truncateToViewPosition: () => void;
  syncFromMultiplayer: (data: {
    fen: string;
    san: string;
    from: string;
    to: string;
    whiteTimeMs?: number;
    blackTimeMs?: number;
    isCheck?: boolean;
  }) => void;
  // Multiplayer coordination setters - used by GameContext callbacks when server assigns values
  setLifecycle: (lifecycle: GameLifecycle) => void;
  setPlayerColor: (color: Side) => void;
  resetForMultiplayer: (gameMode: GameMode) => void;
  setInitError: (error: string | null) => void;
  // Training move evaluations
  updateMoveEvaluation: (evaluation: MoveEvaluation) => void;
  clearMoveEvaluations: () => void;
  removeMoveEvaluationsFromIndex: (fromIndex: number) => void;
  // Puzzle mode
  setPuzzleSolutionIndex: (index: number) => void;
  setPuzzleFeedback: (feedback: ChessState['puzzleFeedback']) => void;
  setRatingChange: (ratingChange: ChessState['ratingChange']) => void;
  getLegalMoves: (square: Square) => Square[];
  getLegalMoveCaptures: (square: Square) => Set<Square>;
  derived: {
    currentBoard: () => BoardSquare[];
    isPlayerTurn: () => boolean;
    canMove: () => boolean;
    isViewingHistory: () => boolean;
    opponentSide: () => Side;
  };
  getSession: () => GameSession | null;
}

export const createChessStore = (): ChessStore => {
  const [state, setState] = createStore<ChessState>({
    sessionId: null,
    fen: INITIAL_FEN,
    viewFen: INITIAL_FEN,
    currentTurn: 'w',
    moveHistory: [],
    viewMoveIndex: -1,
    lastMove: null,
    checkedKingSquare: null,
    isGameOver: false,
    gameOverReason: null,
    gameWinner: null,
    playerColor: 'w',
    mode: 'play',
    opponentType: 'ai',
    capturedWhite: [],
    capturedBlack: [],
    lifecycle: 'idle',
    trainingGamePhase: null,
    trainingAvailableHints: 0,
    trainingUsedHints: 0,
    trainingEvalScore: null,
    trainingStartEval: null,
    trainingPositionId: null,
    trainingTheme: null,
    trainingMoveEvaluations: [],
    puzzleCategory: null,
    puzzleId: null,
    puzzleRated: false,
    puzzleSolutionIndex: 0,
    puzzleFeedback: null,
    puzzleStartFen: null,
    moveError: null,
    initError: null,
    ratingChange: null,
  });

  let currentSession: GameSession | null = null;

  const syncFromSession = () => {
    if (!currentSession) return;
    const s = currentSession.currentState;
    batch(() => {
      setState('fen', s.fen);
      setState('viewFen', s.viewFen);
      setState('currentTurn', s.currentTurn);
      setState('moveHistory', [...s.moveHistory]);
      setState('viewMoveIndex', s.viewMoveIndex);
      setState('lastMove', s.lastMove);
      setState('checkedKingSquare', s.checkedKingSquare);
      setState('isGameOver', s.isGameOver);
      setState('gameOverReason', s.gameOverReason);
      setState('gameWinner', s.gameWinner);
      setState('capturedWhite', [...s.capturedPieces.white]);
      setState('capturedBlack', [...s.capturedPieces.black]);
      setState('lifecycle', s.lifecycle);
      setState('trainingEvalScore', s.trainingEvalScore);
      setState('trainingStartEval', s.trainingStartEval);
      setState('trainingUsedHints', s.usedHints);
      setState('moveError', s.moveError);
    });
  };

  // Subscribe to session events
  // eslint-disable-next-line solid/reactivity -- state.sessionId is accessed at event time, not for reactive tracking
  sessionManager.onEvent((event) => {
    if (event.sessionId !== state.sessionId) return;
    const session = sessionManager.getSession(event.sessionId);
    if (session) {
      syncFromSession();
    }
  });

  const startGame = (config: {
    mode: GameMode;
    playerColor: Side;
    opponentType: OpponentType;
    timeControl: number;
    difficulty?: number;
    trainingGamePhase?: GamePhase;
    trainingAvailableHints?: number;
    trainingStartEval?: number;
    trainingPositionId?: string;
    trainingTheme?: string;
    fen?: string;
    puzzleCategory?: PuzzleCategory;
    puzzleId?: string;
    puzzleRated?: boolean;
    puzzleStartFen?: string;
  }): string => {
    const sessionId = generateSessionId();
    const session = sessionManager.createSession({
      sessionId,
      mode: config.mode,
      playerColor: config.playerColor,
      opponentType: config.opponentType,
      timeControl: { initialTime: config.timeControl * 60 },
      difficulty: config.difficulty,
      gamePhase: config.trainingGamePhase ?? undefined,
      availableHints: config.trainingAvailableHints,
      startingFen: config.fen,
    });

    currentSession = session;
    sessionManager.setActiveSession(sessionId);

    batch(() => {
      setState('sessionId', sessionId);
      setState('mode', config.mode);
      setState('playerColor', config.playerColor);
      setState('opponentType', config.opponentType);
      setState('isGameOver', false);
      setState('gameOverReason', null);
      setState('gameWinner', null);
      setState('trainingGamePhase', config.trainingGamePhase ?? null);
      setState('trainingAvailableHints', config.trainingAvailableHints ?? 0);
      setState('trainingUsedHints', 0);
      setState('trainingEvalScore', null);
      setState('trainingStartEval', config.trainingStartEval ?? null);
      setState('trainingPositionId', config.trainingPositionId ?? null);
      setState('trainingTheme', config.trainingTheme ?? null);
      setState('trainingMoveEvaluations', []);
      setState('puzzleCategory', config.puzzleCategory ?? null);
      setState('puzzleId', config.puzzleId ?? null);
      setState('puzzleRated', config.puzzleRated ?? false);
      setState('puzzleSolutionIndex', 0);
      setState('puzzleFeedback', null);
      setState('puzzleStartFen', config.puzzleStartFen ?? null);
      setState('moveError', null);
      setState('initError', null);
      setState('capturedWhite', []);
      setState('capturedBlack', []);
      setState('moveHistory', []);
      setState('lastMove', null);
      setState('checkedKingSquare', null);
    });

    syncFromSession();
    return sessionId;
  };

  const applyMove = (from: Square, to: Square, promotion?: PromotionPiece): boolean => {
    if (!currentSession) return false;
    const result = sessionManager.applyCommand(currentSession.sessionId, {
      type: 'APPLY_MOVE',
      payload: { from, to, promotion },
    });
    if (result.success) {
      syncFromSession();
    }
    return result.success;
  };

  const applyOptimisticMove = (from: Square, to: Square, promotion?: PromotionPiece): boolean => {
    if (!currentSession) return false;
    const result = sessionManager.applyCommand(currentSession.sessionId, {
      type: 'OPTIMISTIC_MOVE',
      payload: { from, to, promotion },
    });
    if (result.success) {
      syncFromSession();
    }
    return result.success;
  };

  const confirmMove = (data: {
    serverFen: string;
    san: string;
    from: string;
    to: string;
    isCheck?: boolean;
    whiteTimeMs: number;
    blackTimeMs: number;
  }) => {
    if (currentSession) {
      // Single-player mode with session
      sessionManager.applyCommand(currentSession.sessionId, {
        type: 'CONFIRM_MOVE',
        payload: {
          serverFen: data.serverFen,
          whiteTimeMs: data.whiteTimeMs,
          blackTimeMs: data.blackTimeMs,
        },
      });
      syncFromSession();
    } else {
      // Multiplayer mode (no session) - update state directly like syncFromMultiplayer
      batch(() => {
        setState('fen', data.serverFen);
        setState('viewFen', data.serverFen);
        setState('lastMove', { from: data.from as Square, to: data.to as Square });
        setState('moveHistory', [...state.moveHistory, data.san]);
        setState('viewMoveIndex', state.moveHistory.length);
        setState('currentTurn', getOpponentSide(state.currentTurn));
        if (data.isCheck) {
          const currentTurn = data.serverFen.split(' ')[1] as Side;
          setState('checkedKingSquare', findKingSquareFromFen(data.serverFen, currentTurn));
        } else {
          setState('checkedKingSquare', null);
        }
        setState('moveError', null);
      });
    }
  };

  const rejectMove = (serverFen: string, reason: string) => {
    if (currentSession) {
      sessionManager.applyCommand(currentSession.sessionId, {
        type: 'REJECT_MOVE',
        payload: { serverFen, reason },
      });
      syncFromSession();
    } else {
      // Multiplayer mode (no session) - set error directly
      // No board state to revert since we don't do optimistic updates in multiplayer
      setState('moveError', reason);
    }
  };

  const endGame = (reason: GameOverReason, winner: GameWinner, evalScore?: number) => {
    if (currentSession) {
      sessionManager.applyCommand(currentSession.sessionId, {
        type: 'END_GAME',
        payload: { reason, winner, evalScore },
      });
      syncFromSession();
    } else {
      batch(() => {
        setState('isGameOver', true);
        setState('gameOverReason', reason);
        setState('gameWinner', winner);
        setState('lifecycle', 'ended');
        if (evalScore !== undefined) {
          setState('trainingEvalScore', evalScore);
        }
      });
    }
  };

  const exitGame = () => {
    if (currentSession) {
      sessionManager.destroySession(currentSession.sessionId);
      currentSession = null;
    }
    batch(() => {
      setState('sessionId', null);
      setState('fen', INITIAL_FEN);
      setState('viewFen', INITIAL_FEN);
      setState('moveHistory', []);
      setState('isGameOver', false);
      setState('gameOverReason', null);
      setState('gameWinner', null);
      setState('lifecycle', 'idle');
      setState('lastMove', null);
      setState('checkedKingSquare', null);
      setState('moveError', null);
      setState('ratingChange', null);
      setState('puzzleRated', false);
    });
  };

  const resign = () => {
    if (!currentSession || !canMakeMove(state.lifecycle)) return;
    sessionManager.applyCommand(currentSession.sessionId, {
      type: 'RESIGN',
      payload: { resigningSide: state.playerColor },
    });
    syncFromSession();
  };

  const takeBack = () => {
    if (!currentSession) return;
    const result = sessionManager.applyCommand(currentSession.sessionId, {
      type: 'TAKE_BACK',
      payload: { playerColor: state.playerColor },
    });
    if (result.success) {
      syncFromSession();
    }
  };

  const jumpToMoveIndex = (targetIndex: number) => {
    if (!currentSession) {
      const clamped = Math.min(Math.max(-1, targetIndex), state.moveHistory.length - 1);
      const chess = new Chess();
      for (let i = 0; i <= clamped; i++) {
        chess.move(state.moveHistory[i]);
      }
      batch(() => {
        setState('viewMoveIndex', clamped);
        setState('viewFen', chess.fen());
        setState('lastMove', null);
        setState('checkedKingSquare', null);
      });
      return;
    }
    sessionManager.applyCommand(currentSession.sessionId, {
      type: 'NAVIGATE_HISTORY',
      payload: { targetIndex },
    });
    syncFromSession();
    batch(() => {
      setState('lastMove', null);
      setState('checkedKingSquare', null);
    });
  };

  const truncateToViewPosition = () => {
    if (!currentSession) return;
    sessionManager.applyCommand(currentSession.sessionId, {
      type: 'TRUNCATE_TO_VIEW',
      payload: {},
    });
    syncFromSession();
  };

  const syncFromMultiplayer = (data: {
    fen: string;
    san: string;
    from: string;
    to: string;
    whiteTimeMs?: number;
    blackTimeMs?: number;
    isCheck?: boolean;
  }) => {
    // For multiplayer opponent moves, directly update state
    batch(() => {
      setState('fen', data.fen);
      setState('viewFen', data.fen);
      setState('lastMove', { from: data.from as Square, to: data.to as Square });
      setState('moveHistory', [...state.moveHistory, data.san]);
      setState('viewMoveIndex', state.moveHistory.length);
      setState('currentTurn', getOpponentSide(state.currentTurn));
      if (data.isCheck) {
        const currentTurn = data.fen.split(' ')[1] as Side;
        setState('checkedKingSquare', findKingSquareFromFen(data.fen, currentTurn));
      } else {
        setState('checkedKingSquare', null);
      }
    });
  };

  const setLifecycle = (lifecycle: GameLifecycle) => {
    setState('lifecycle', lifecycle);
    if (currentSession) {
      sessionManager.applyCommand(currentSession.sessionId, {
        type: 'SYNC_STATE',
        payload: { state: { lifecycle } },
      });
    }
  };

  const setPlayerColor = (color: Side) => {
    setState('playerColor', color);
  };

  const setInitError = (error: string | null) => {
    setState('initError', error);
  };

  const resetForMultiplayer = (gameMode: GameMode) => {
    batch(() => {
      setState('sessionId', null);
      setState('fen', INITIAL_FEN);
      setState('viewFen', INITIAL_FEN);
      setState('currentTurn', 'w');
      setState('moveHistory', []);
      setState('viewMoveIndex', -1);
      setState('lastMove', null);
      setState('checkedKingSquare', null);
      setState('isGameOver', false);
      setState('gameOverReason', null);
      setState('gameWinner', null);
      setState('mode', gameMode);
      setState('opponentType', 'human');
      setState('capturedWhite', []);
      setState('capturedBlack', []);
      setState('lifecycle', 'initializing');
      setState('moveError', null);
    });
    currentSession = null;
  };

  // Training move evaluation methods
  const updateMoveEvaluation = (evaluation: MoveEvaluation) => {
    // Find and update existing evaluation, or add new one
    const existingIndex = state.trainingMoveEvaluations.findIndex(
      (e) => e.moveIndex === evaluation.moveIndex
    );
    if (existingIndex >= 0) {
      setState('trainingMoveEvaluations', existingIndex, evaluation);
    } else {
      setState('trainingMoveEvaluations', [...state.trainingMoveEvaluations, evaluation]);
    }
  };

  const clearMoveEvaluations = () => {
    setState('trainingMoveEvaluations', []);
  };

  const removeMoveEvaluationsFromIndex = (fromIndex: number) => {
    setState(
      'trainingMoveEvaluations',
      state.trainingMoveEvaluations.filter((e) => e.moveIndex < fromIndex)
    );
  };

  const setPuzzleSolutionIndex = (index: number) => {
    setState('puzzleSolutionIndex', index);
  };

  const setPuzzleFeedback = (feedback: ChessState['puzzleFeedback']) => {
    setState('puzzleFeedback', feedback);
  };

  const setRatingChange = (ratingChange: ChessState['ratingChange']) => {
    setState('ratingChange', ratingChange);
  };

  // Derived state
  const derived = {
    currentBoard: () => fenToBoard(state.viewFen),
    isPlayerTurn: () => state.currentTurn === state.playerColor,
    canMove: () => canMakeMove(state.lifecycle) && state.currentTurn === state.playerColor,
    isViewingHistory: () => state.viewFen !== state.fen,
    opponentSide: () => getOpponentSide(state.playerColor),
  };

  const getSession = () => currentSession;

  const emptyCaptures = new Set<Square>();

  const getLegalMoves = (square: Square): Square[] => {
    return currentSession?.getLegalMoves(square) ?? [];
  };

  const getLegalMoveCaptures = (square: Square): Set<Square> => {
    return currentSession?.getLegalMoveCaptures(square) ?? emptyCaptures;
  };

  return {
    state,
    startGame,
    applyMove,
    applyOptimisticMove,
    confirmMove,
    rejectMove,
    endGame,
    exitGame,
    resign,
    takeBack,
    jumpToMoveIndex,
    truncateToViewPosition,
    syncFromMultiplayer,
    setLifecycle,
    setPlayerColor,
    setInitError,
    resetForMultiplayer,
    updateMoveEvaluation,
    clearMoveEvaluations,
    removeMoveEvaluationsFromIndex,
    setPuzzleSolutionIndex,
    setPuzzleFeedback,
    setRatingChange,
    getLegalMoves,
    getLegalMoveCaptures,
    derived,
    getSession,
  };
};
