import { batch } from 'solid-js';
import { createStore } from 'solid-js/store';
import {
  sessionManager,
  type GameSession,
  fenToBoard,
  canMakeMove,
  getOpponentSide,
} from '../../../services/game';
import { generateSessionId } from '../../../shared';
import type {
  Side,
  GameMode,
  GameOverReason,
  GameWinner,
  AIPlayStyle,
  GamePhase,
  Square,
  PromotionPiece,
  BoardSquare,
  GameLifecycle,
  OpponentType,
} from '../../../types';

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
  trainingIsRated: boolean;
  trainingAIPlayStyle: AIPlayStyle;
  trainingGamePhase: GamePhase;
  trainingAvailableHints: number;
  trainingUsedHints: number;
  trainingEvalScore: number | null;
  // Multiplayer optimistic state
  moveError: string | null;
}

export interface ChessStore {
  state: ChessState;
  startGame: (config: {
    mode: GameMode;
    playerColor: Side;
    opponentType: OpponentType;
    timeControl: number;
    difficulty?: number;
    trainingIsRated?: boolean;
    trainingAIPlayStyle?: AIPlayStyle;
    trainingGamePhase?: GamePhase;
    trainingAvailableHints?: number;
    fen?: string;
  }) => string;
  applyMove: (from: Square, to: Square, promotion?: PromotionPiece) => boolean;
  applyOptimisticMove: (from: Square, to: Square, promotion?: PromotionPiece) => boolean;
  confirmMove: (serverFen: string, whiteTimeMs: number, blackTimeMs: number) => void;
  rejectMove: (serverFen: string, reason: string) => void;
  endGame: (reason: GameOverReason, winner: GameWinner, evalScore?: number) => void;
  exitGame: () => void;
  resign: () => void;
  takeBack: () => void;
  jumpToMoveIndex: (targetIndex: number) => void;
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
    trainingIsRated: false,
    trainingAIPlayStyle: null,
    trainingGamePhase: null,
    trainingAvailableHints: 0,
    trainingUsedHints: 0,
    trainingEvalScore: null,
    moveError: null,
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
      setState('trainingUsedHints', s.usedHints);
      setState('moveError', s.moveError);
    });
  };

  // Subscribe to session events
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
    trainingIsRated?: boolean;
    trainingAIPlayStyle?: AIPlayStyle;
    trainingGamePhase?: GamePhase;
    trainingAvailableHints?: number;
    fen?: string;
  }): string => {
    const sessionId = generateSessionId();
    const session = sessionManager.createSession({
      sessionId,
      mode: config.mode,
      playerColor: config.playerColor,
      opponentType: config.opponentType,
      timeControl: { initialTime: config.timeControl * 60 },
      difficulty: config.difficulty,
      aiPlayStyle: config.trainingAIPlayStyle ?? undefined,
      gamePhase: config.trainingGamePhase ?? undefined,
      isRated: config.trainingIsRated,
      availableHints: config.trainingAvailableHints,
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
      setState('trainingIsRated', config.trainingIsRated ?? false);
      setState('trainingAIPlayStyle', config.trainingAIPlayStyle ?? null);
      setState('trainingGamePhase', config.trainingGamePhase ?? null);
      setState('trainingAvailableHints', config.trainingAvailableHints ?? 0);
      setState('trainingUsedHints', 0);
      setState('trainingEvalScore', null);
      setState('moveError', null);
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

  const confirmMove = (serverFen: string, whiteTimeMs: number, blackTimeMs: number) => {
    if (!currentSession) return;
    sessionManager.applyCommand(currentSession.sessionId, {
      type: 'CONFIRM_MOVE',
      payload: { serverFen, whiteTimeMs, blackTimeMs },
    });
    syncFromSession();
  };

  const rejectMove = (serverFen: string, reason: string) => {
    if (!currentSession) return;
    sessionManager.applyCommand(currentSession.sessionId, {
      type: 'REJECT_MOVE',
      payload: { serverFen, reason },
    });
    syncFromSession();
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
    if (!currentSession) return;
    sessionManager.applyCommand(currentSession.sessionId, {
      type: 'NAVIGATE_HISTORY',
      payload: { targetIndex },
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
        const board = fenToBoard(data.fen);
        const currentTurn = data.fen.split(' ')[1] as Side;
        const kingPiece = currentTurn === 'w' ? 'wK' : 'bK';
        const kingSquare = board.find((sq) => sq.piece === kingPiece)?.square;
        setState('checkedKingSquare', kingSquare ?? null);
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

  // Derived state
  const derived = {
    currentBoard: () => fenToBoard(state.viewFen),
    isPlayerTurn: () => state.currentTurn === state.playerColor,
    canMove: () => canMakeMove(state.lifecycle) && state.currentTurn === state.playerColor,
    isViewingHistory: () => state.viewFen !== state.fen,
    opponentSide: () => getOpponentSide(state.playerColor),
  };

  const getSession = () => currentSession;

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
    syncFromMultiplayer,
    setLifecycle,
    setPlayerColor,
    resetForMultiplayer,
    derived,
    getSession,
  };
};
