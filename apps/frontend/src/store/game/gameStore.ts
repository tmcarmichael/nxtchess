import { createStore } from 'solid-js/store';
import { Chess } from 'chess.js';
import { batch } from 'solid-js';
import {
  Side,
  BoardSquare,
  Square,
  PromotionPiece,
  GameOverReason,
  GameMode,
  GameWinner,
  AIPlayStyle,
  GamePhase,
  GameLifecycle,
  StartGameOptions,
} from '../../types';
import {
  initAiEngine,
  computeAiMove,
  EngineError,
  initEvalEngine,
  getEvaluation,
} from '../../services/engine';
import { transition, canMakeMove, shouldRunTimer } from '../../services/game';

export type EngineStatus = 'idle' | 'loading' | 'ready' | 'error';
import {
  fenToBoard,
  captureCheck,
  handleCapturedPiece,
  computeMaterial,
} from '../../services/game';
import { DIFFICULTY_VALUES_ELO, capitalizeFirst } from '../../shared';

interface GameStoreState {
  // Game lifecycle
  lifecycle: GameLifecycle;
  // Core game state
  fen: string;
  whiteTime: number;
  blackTime: number;
  timeControl: number;
  difficulty: number;
  currentTurn: Side;
  playerColor: Side;
  boardView: Side;
  isGameOver: boolean;
  gameOverReason: GameOverReason;
  gameWinner: GameWinner;
  capturedWhite: string[];
  capturedBlack: string[];
  boardSquares: BoardSquare[];
  aiSide: Side;
  lastMove: { from: Square; to: Square } | null;
  checkedKingSquare: Square | null;
  moveHistory: string[];
  viewMoveIndex: number;
  viewFen: string;
  mode: GameMode;
  // Training mode state
  trainingIsRated: boolean;
  trainingAIPlayStyle: AIPlayStyle;
  trainingGamePhase: GamePhase;
  trainingAvailableHints: number;
  trainingUsedHints: number;
  trainingEvalScore: number | null;
  // AI state
  isAiThinking: boolean;
  // Engine state
  engineStatus: EngineStatus;
  engineError: string | null;
}

export const createGameStore = () => {
  let chess = new Chess();
  const chessGameHistory = new Chess();

  let timerId: number | undefined;
  let pendingGameConfig: StartGameOptions | null = null;
  const [state, setState] = createStore<GameStoreState>({
    lifecycle: 'idle',
    fen: chess.fen(),
    whiteTime: 300,
    blackTime: 300,
    timeControl: 5,
    difficulty: 3,
    currentTurn: 'w',
    playerColor: 'w',
    boardView: 'w',
    isGameOver: false,
    gameOverReason: null,
    gameWinner: null,
    capturedWhite: [],
    capturedBlack: [],
    boardSquares: [],
    aiSide: 'w',
    lastMove: null,
    checkedKingSquare: null,
    moveHistory: [],
    viewMoveIndex: -1,
    viewFen: chess.fen(),
    mode: 'play',
    trainingIsRated: false,
    trainingAIPlayStyle: null,
    trainingGamePhase: null,
    trainingAvailableHints: 0,
    trainingUsedHints: 0,
    trainingEvalScore: null,
    isAiThinking: false,
    engineStatus: 'idle',
    engineError: null,
  });

  const updateGameState = (from: Square, to: Square, promotion?: PromotionPiece): string => {
    const move = chess.move({ from, to, promotion });
    if (!move) {
      throw new Error(`Invalid move from ${from} to ${to} (promotion=${promotion})`);
    }
    return chess.fen();
  };

  const startTimer = () => {
    if (timerId) clearInterval(timerId);
    timerId = setInterval(() => {
      // Only run timer when game is in playing state
      if (!shouldRunTimer(state.lifecycle)) {
        clearInterval(timerId);
        return;
      }
      if (state.currentTurn === 'w') {
        setState('whiteTime', (t) => Math.max(0, t - 1));
        if (state.whiteTime < 1) handleTimeOut('b');
      } else {
        setState('blackTime', (t) => Math.max(0, t - 1));
        if (state.blackTime < 1) handleTimeOut('w');
      }
    }, 1000) as number;
  };

  const applyAIMove = (from: Square, to: Square, promotion?: PromotionPiece) => {
    const fenAfterMove = updateGameState(from, to, promotion);
    batch(() => {
      const captured = captureCheck(to, fenToBoard(state.fen));
      if (captured) {
        handleCapturedPiece(
          captured,
          (newWhitePieces) => setState('capturedWhite', newWhitePieces),
          (newBlackPieces) => setState('capturedBlack', newBlackPieces)
        );
      }
      setState('fen', fenAfterMove);
      setState('lastMove', { from, to });
      const hist = chess.history();
      setState('moveHistory', hist);
      setState('viewMoveIndex', hist.length - 1);
      setState('boardSquares', fenToBoard(fenAfterMove));
      setState('viewFen', fenAfterMove);
      setState('currentTurn', state.currentTurn === 'w' ? 'b' : 'w');
    });
    if (!state.isGameOver) afterMoveChecks(fenAfterMove);
  };

  const performAIMove = async () => {
    // Only allow AI moves in playing state
    if (!canMakeMove(state.lifecycle) || state.currentTurn !== state.aiSide || state.isAiThinking) {
      return;
    }
    setState('isAiThinking', true);
    try {
      const fenAtStart = state.fen;
      const { from, to, promotion } = await computeAiMove(state.fen);
      if (state.fen !== fenAtStart) throw new Error('Engine worker out of sync FEN');
      applyAIMove(from as Square, to as Square, promotion as PromotionPiece | undefined);
    } catch (err) {
      console.error('AI move error:', err);
    } finally {
      setState('isAiThinking', false);
    }
  };

  const startNewGame = async (options: StartGameOptions) => {
    if (timerId) clearInterval(timerId);
    chess = new Chess();
    chessGameHistory.reset();

    // Store config for potential retry
    pendingGameConfig = options;

    const {
      side,
      mode = 'play',
      newTimeControl = 5,
      newDifficultyLevel = 3,
      trainingIsRated = false,
      trainingAIPlayStyle = 'balanced',
      trainingGamePhase = 'opening',
      trainingAvailableHints = 0,
    } = options;

    // Transition to initializing state
    batch(() => {
      setState({
        lifecycle: transition(state.lifecycle, 'START_GAME'),
        fen: chess.fen(),
        timeControl: newTimeControl,
        difficulty: newDifficultyLevel,
        whiteTime: newTimeControl * 60,
        blackTime: newTimeControl * 60,
        playerColor: side,
        boardView: side,
        aiSide: side === 'w' ? 'b' : 'w',
        currentTurn: 'w',
        checkedKingSquare: null,
        lastMove: null,
        isGameOver: false,
        gameOverReason: null,
        gameWinner: null,
        capturedWhite: [],
        capturedBlack: [],
        boardSquares: [],
        moveHistory: [],
        viewMoveIndex: -1,
        viewFen: chess.fen(),
        mode,
        trainingIsRated: trainingIsRated,
        trainingAIPlayStyle: trainingAIPlayStyle,
        trainingGamePhase: trainingGamePhase,
        trainingAvailableHints: trainingAvailableHints,
        trainingUsedHints: 0,
        isAiThinking: false,
        engineStatus: 'loading',
        engineError: null,
      });
    });

    if (mode !== 'play') {
      // Non-blocking eval engine init for training mode
      initEvalEngine().catch((err) => {
        console.warn('Eval engine init failed (non-critical):', err.message);
      });
    }

    const elo = DIFFICULTY_VALUES_ELO[newDifficultyLevel - 1] ?? 600;
    const aiPlayStyle = trainingAIPlayStyle ?? 'balanced';

    try {
      await initAiEngine(elo, aiPlayStyle);

      // Transition to playing state
      batch(() => {
        setState('lifecycle', transition(state.lifecycle, 'ENGINE_READY'));
        setState('engineStatus', 'ready');
        setState('engineError', null);
      });

      // Start timer only for play mode after entering playing state
      if (mode === 'play') {
        startTimer();
      }

      // If player is black, AI moves first
      if (side === 'b') {
        performAIMove();
      }
    } catch (err) {
      const errorMessage =
        err instanceof EngineError
          ? err.message
          : 'Failed to initialize chess engine. Please try again.';

      batch(() => {
        setState('engineStatus', 'error');
        setState('engineError', errorMessage);
      });
      console.error('Engine initialization failed:', err);
    }
  };

  const retryEngineInit = async () => {
    if (!pendingGameConfig) {
      console.warn('No pending game config to retry');
      return;
    }

    const {
      newDifficultyLevel = 3,
      trainingAIPlayStyle = 'balanced',
      side,
      mode = 'play',
    } = pendingGameConfig;
    const elo = DIFFICULTY_VALUES_ELO[newDifficultyLevel - 1] ?? 600;

    batch(() => {
      setState('engineStatus', 'loading');
      setState('engineError', null);
    });

    try {
      await initAiEngine(elo, trainingAIPlayStyle);

      // Transition to playing state
      batch(() => {
        setState('lifecycle', transition(state.lifecycle, 'ENGINE_READY'));
        setState('engineStatus', 'ready');
        setState('engineError', null);
      });

      // Start timer for play mode
      if (mode === 'play') {
        startTimer();
      }

      // If player is black and game just started, AI moves first
      if (side === 'b' && state.moveHistory.length === 0) {
        performAIMove();
      }
    } catch (err) {
      const errorMessage =
        err instanceof EngineError
          ? err.message
          : 'Failed to initialize chess engine. Please try again.';

      batch(() => {
        setState('engineStatus', 'error');
        setState('engineError', errorMessage);
      });
      console.error('Engine retry failed:', err);
    }
  };

  const afterMoveChecks = (newFen: string) => {
    if (state.isGameOver) return;
    const chessFen = new Chess(newFen);
    const currentTurn = newFen.split(' ')[1] as 'w' | 'b';
    updateCheckedKingSquare(chessFen, currentTurn, newFen);
    if (checkForTerminal(chessFen, currentTurn)) {
      return;
    }
    checkTrainingOpeningEnd(newFen);
  };

  const updateCheckedKingSquare = (chessFen: Chess, currentTurn: 'w' | 'b', newFen: string) => {
    if (chessFen.isCheck()) {
      const kingSquare = fenToBoard(newFen).find(
        ({ piece }) => piece === currentTurn + 'K'
      )?.square;
      setState('checkedKingSquare', kingSquare ?? null);
    } else {
      setState('checkedKingSquare', null);
    }
  };

  const checkForTerminal = (chessFen: Chess, currentTurn: 'w' | 'b'): boolean => {
    if (chessFen.isCheckmate()) {
      const winner = currentTurn === 'w' ? 'b' : 'w';
      batch(() => {
        setState('lifecycle', transition(state.lifecycle, 'GAME_OVER'));
        setState('gameWinner', winner);
        setState('isGameOver', true);
        setState('gameOverReason', 'checkmate');
      });
      return true;
    }
    if (chessFen.isStalemate()) {
      batch(() => {
        setState('lifecycle', transition(state.lifecycle, 'GAME_OVER'));
        setState('gameWinner', 'draw');
        setState('isGameOver', true);
        setState('gameOverReason', 'stalemate');
      });
      return true;
    }
    return false;
  };

  const checkTrainingOpeningEnd = (newFen: string) => {
    if (state.mode !== 'training' || state.trainingGamePhase !== 'opening') {
      return;
    }
    const moveCount = state.moveHistory.length;
    if (moveCount < 20) {
      return;
    }
    const fenAtStart = state.fen;
    // const ENGINE_DEPTH = 15;
    getEvaluation(newFen /*opt ENGINE_DEPTH*/).then((score: number) => {
      if (state.fen !== fenAtStart) {
        throw new Error('Engine worker out of sync FEN');
      }
      batch(() => {
        setState('lifecycle', transition(state.lifecycle, 'GAME_OVER'));
        setState('trainingEvalScore', score);
        setState('isGameOver', true);
        setState('gameWinner', null);
        setState('gameOverReason', null);
      });
    });
  };

  const handleTimeOut = (winnerColor: Side) => {
    if (timerId) clearInterval(timerId);
    batch(() => {
      setState('lifecycle', transition(state.lifecycle, 'GAME_OVER'));
      setState('gameOverReason', 'time');
      setState('isGameOver', true);
      setState('gameWinner', winnerColor);
    });
  };

  const jumpToMoveIndex = (targetIndex: number) => {
    const history = state.moveHistory;
    const clamped = Math.min(Math.max(0, targetIndex), history.length - 1);

    chessGameHistory.reset();
    history.slice(0, clamped + 1).forEach((moveSan) => {
      chessGameHistory.move(moveSan);
    });

    batch(() => {
      setState('viewMoveIndex', clamped);
      if (clamped === history.length - 1) {
        setState('viewFen', state.fen);
      } else {
        setState('viewFen', chessGameHistory.fen());
      }
    });
  };

  const takeBack = () => {
    const undone1 = chess.undo();
    if (!undone1) return;

    // Remove captured piece from first undo
    if (undone1.captured) {
      if (undone1.color === 'w') {
        setState('capturedBlack', (prev) => prev.slice(0, -1));
      } else {
        setState('capturedWhite', (prev) => prev.slice(0, -1));
      }
    }

    // If it's still not player's turn, undo AI move too
    if (chess.turn() !== state.playerColor) {
      const undone2 = chess.undo();
      if (undone2?.captured) {
        if (undone2.color === 'w') {
          setState('capturedBlack', (prev) => prev.slice(0, -1));
        } else {
          setState('capturedWhite', (prev) => prev.slice(0, -1));
        }
      }
    }

    batch(() => {
      const newFen = chess.fen();
      const history = chess.history();
      setState('fen', newFen);
      setState('viewFen', newFen);
      setState('boardSquares', fenToBoard(newFen));
      setState('moveHistory', history);
      setState('viewMoveIndex', history.length - 1);
      setState('isGameOver', false);
      setState('gameOverReason', null);
      setState('gameWinner', null);
      setState('lastMove', null);
      setState('checkedKingSquare', null);

      if (history.length === 0) {
        setState('currentTurn', 'w');
      }
    });

    // If player is black and board is reset, trigger AI move
    if (chess.history().length === 0 && state.playerColor === 'b') {
      performAIMove();
    }
  };

  const clearGameTimer = () => {
    if (timerId) clearInterval(timerId);
  };

  const flipBoardView = () => {
    setState('boardView', (c) => (c === 'w' ? 'b' : 'w'));
  };

  const resign = () => {
    if (!canMakeMove(state.lifecycle)) return;
    if (timerId) clearInterval(timerId);
    const winner = state.playerColor === 'w' ? 'b' : 'w';
    batch(() => {
      setState('lifecycle', transition(state.lifecycle, 'GAME_OVER'));
      setState('gameOverReason', 'resignation');
      setState('isGameOver', true);
      setState('gameWinner', winner);
    });
  };

  const exitGame = () => {
    if (timerId) clearInterval(timerId);
    batch(() => {
      setState('lifecycle', transition(state.lifecycle, 'EXIT_GAME'));
      setState('isGameOver', false);
      setState('gameOverReason', null);
      setState('gameWinner', null);
    });
  };

  // Derived state - computed values that depend on store state
  // These are accessor functions that will be reactive when used in tracking scopes
  const derived = {
    /** The opponent's side (opposite of playerColor) */
    opponentSide: () => (state.playerColor === 'w' ? 'b' : 'w') as Side,

    /** The current board position based on viewFen (for history navigation) */
    currentBoard: () => fenToBoard(state.viewFen),

    /** Whether it's currently the player's turn */
    isPlayerTurn: () => state.currentTurn === state.playerColor,

    /** Whether the player can make a move (playing state, their turn, AI not thinking) */
    canMove: () =>
      canMakeMove(state.lifecycle) &&
      !state.isAiThinking &&
      state.currentTurn === state.playerColor,

    /** Whether we're viewing a historical position (not the current game state) */
    isViewingHistory: () => state.viewFen !== state.fen,

    /** Formatted AI playstyle for display (capitalized) */
    formattedAIPlayStyle: () =>
      state.trainingAIPlayStyle ? capitalizeFirst(state.trainingAIPlayStyle) : '',

    /** Material balance calculation */
    material: () => computeMaterial(state.boardSquares),

    /** Current player's time based on playerColor */
    playerTime: () => (state.playerColor === 'w' ? state.whiteTime : state.blackTime),

    /** Opponent's time based on playerColor */
    opponentTime: () => (state.playerColor === 'w' ? state.blackTime : state.whiteTime),

    /** Whether the engine is ready for play */
    isEngineReady: () => state.engineStatus === 'ready',

    /** Whether the engine is currently loading */
    isEngineLoading: () => state.engineStatus === 'loading',

    /** Whether the engine has an error */
    hasEngineError: () => state.engineStatus === 'error',

    /** Whether the game is in playing state */
    isPlaying: () => state.lifecycle === 'playing',

    /** Whether the game is in idle state */
    isIdle: () => state.lifecycle === 'idle',

    /** Whether the game has ended */
    isEnded: () => state.lifecycle === 'ended',

    /** Whether the game is initializing */
    isInitializing: () => state.lifecycle === 'initializing',
  };

  const actions = {
    // Game lifecycle actions
    startNewGame,
    exitGame,
    resign,
    retryEngineInit,

    // Game play actions
    performAIMove,
    handleTimeOut,
    jumpToMoveIndex,
    takeBack,
    afterMoveChecks,
    flipBoardView,
    clearGameTimer,

    // Direct access
    getChessInstance: () => chess,
    setState,
  };

  return [state, actions, derived] as const;
};
