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
  MultiplayerGameOptions,
  OpponentType,
} from '../../types';
import {
  initAiEngine,
  computeAiMove,
  EngineError,
  initEvalEngine,
  getEvaluation,
} from '../../services/engine';
import {
  transition,
  canMakeMove,
  shouldRunTimer,
  getTurnFromFen,
  makePiece,
  sessionManager,
  GameSession,
} from '../../services/game';

export type EngineStatus = 'idle' | 'loading' | 'ready' | 'error';
import {
  fenToBoard,
  captureCheck,
  handleCapturedPiece,
  computeMaterial,
} from '../../services/game';
import { DIFFICULTY_VALUES_ELO, capitalizeFirst, generateSessionId } from '../../shared';
import {
  gameSyncService,
  GameStartedData,
  GameJoinedData,
  OpponentMoveData,
  MoveAcceptedData,
  GameEndedData,
  TimeUpdateData,
  SyncEvent,
} from '../../services/sync';

interface GameStoreState {
  // Session tracking
  currentSessionId: string | null;
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
  // Multiplayer state
  opponentType: OpponentType;
  multiplayerGameId: string | null;
  isWaitingForOpponent: boolean;
  opponentUsername: string | null;
}

export const createGameStore = () => {
  // Legacy chess instances for backward compatibility
  let chess = new Chess();
  const chessGameHistory = new Chess();

  // Current session reference (synced with sessionManager)
  let currentSession: GameSession | null = null;

  let timerId: number | undefined;
  let pendingGameConfig: StartGameOptions | null = null;
  const [state, setState] = createStore<GameStoreState>({
    currentSessionId: null,
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
    opponentType: 'ai',
    multiplayerGameId: null,
    isWaitingForOpponent: false,
    opponentUsername: null,
  });

  // ============================================================================
  // Session Synchronization
  // ============================================================================

  const syncStoreFromSession = (session: GameSession) => {
    const sessionState = session.currentState;
    batch(() => {
      setState('fen', sessionState.fen);
      setState('moveHistory', [...sessionState.moveHistory]);
      setState('whiteTime', sessionState.times.white);
      setState('blackTime', sessionState.times.black);
      setState('capturedWhite', [...sessionState.capturedPieces.white]);
      setState('capturedBlack', [...sessionState.capturedPieces.black]);
      setState('lifecycle', sessionState.lifecycle);
      setState('currentTurn', sessionState.currentTurn);
      setState('isGameOver', sessionState.isGameOver);
      setState('gameOverReason', sessionState.gameOverReason);
      setState('gameWinner', sessionState.gameWinner);
      setState('lastMove', sessionState.lastMove);
      setState('checkedKingSquare', sessionState.checkedKingSquare);
      setState('viewMoveIndex', sessionState.viewMoveIndex);
      setState('viewFen', sessionState.viewFen);
      setState('boardSquares', fenToBoard(sessionState.viewFen));
      setState('trainingEvalScore', sessionState.trainingEvalScore);
      setState('trainingUsedHints', sessionState.usedHints);
    });
  };

  // Subscribe to session events
  sessionManager.onEvent((event) => {
    if (event.sessionId !== state.currentSessionId) return;

    const session = sessionManager.getSession(event.sessionId);
    if (session) {
      syncStoreFromSession(session);
    }
  });

  // ============================================================================
  // Legacy Move Update (still used for direct chess updates)
  // ============================================================================

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

      // Sync times to session if available
      if (currentSession) {
        sessionManager.applyCommand(currentSession.sessionId, {
          type: 'UPDATE_TIMES',
          payload: { times: { white: state.whiteTime, black: state.blackTime } },
        });
      }
    }, 1000) as number;
  };

  const applyMove = (from: Square, to: Square, promotion?: PromotionPiece): boolean => {
    // Use session if available
    if (currentSession) {
      const result = sessionManager.applyCommand(currentSession.sessionId, {
        type: 'APPLY_MOVE',
        payload: { from, to, promotion },
      });

      if (result.success) {
        // Sync legacy chess instance
        chess.move({ from, to, promotion });
        syncStoreFromSession(currentSession);
        return true;
      }
      return false;
    } else {
      // Legacy path
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
      return true;
    }
  };

  const applyPlayerMove = (from: Square, to: Square, promotion?: PromotionPiece) => {
    const success = applyMove(from, to, promotion);
    if (!success) return;

    if (!state.isGameOver) afterMoveChecks(state.fen);

    // Trigger AI move if it's AI's turn
    if (!state.isGameOver && state.currentTurn === state.aiSide) {
      performAIMove();
    }
  };

  const applyAIMove = (from: Square, to: Square, promotion?: PromotionPiece) => {
    const success = applyMove(from, to, promotion);
    if (!success) return;

    if (!state.isGameOver) afterMoveChecks(state.fen);
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

    // Create a new session
    const sessionId = generateSessionId();
    const session = sessionManager.createSession({
      sessionId,
      mode,
      playerColor: side,
      opponentType: 'ai',
      timeControl: { initialTime: newTimeControl * 60 },
      difficulty: newDifficultyLevel,
      aiPlayStyle: trainingAIPlayStyle,
      gamePhase: trainingGamePhase,
      isRated: trainingIsRated,
      availableHints: trainingAvailableHints,
    });

    currentSession = session;
    sessionManager.setActiveSession(sessionId);

    // Transition session to initializing
    sessionManager.applyCommand(sessionId, {
      type: 'SYNC_STATE',
      payload: {
        state: {
          lifecycle: transition('idle', 'START_GAME'),
        },
      },
    });

    // Transition to initializing state
    batch(() => {
      setState({
        currentSessionId: sessionId,
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

      // Transition session to playing state
      sessionManager.applyCommand(sessionId, {
        type: 'SYNC_STATE',
        payload: {
          state: {
            lifecycle: transition('initializing', 'ENGINE_READY'),
          },
        },
      });

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

      // Transition session to playing state if exists
      if (currentSession) {
        sessionManager.applyCommand(currentSession.sessionId, {
          type: 'SYNC_STATE',
          payload: {
            state: {
              lifecycle: transition('initializing', 'ENGINE_READY'),
            },
          },
        });
      }

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
    const currentTurn = getTurnFromFen(newFen);
    updateCheckedKingSquare(chessFen, currentTurn, newFen);
    if (checkForTerminal(chessFen, currentTurn)) {
      return;
    }
    checkTrainingOpeningEnd(newFen);
  };

  const updateCheckedKingSquare = (chessFen: Chess, currentTurn: Side, newFen: string) => {
    if (chessFen.isCheck()) {
      const kingSquare = fenToBoard(newFen).find(
        ({ piece }) => piece === makePiece(currentTurn, 'K')
      )?.square;
      setState('checkedKingSquare', kingSquare ?? null);
    } else {
      setState('checkedKingSquare', null);
    }
  };

  const checkForTerminal = (chessFen: Chess, currentTurn: Side): boolean => {
    if (chessFen.isCheckmate()) {
      const winner = currentTurn === 'w' ? 'b' : 'w';

      // Update session if exists
      if (currentSession) {
        sessionManager.applyCommand(currentSession.sessionId, {
          type: 'END_GAME',
          payload: { reason: 'checkmate', winner },
        });
      }

      batch(() => {
        setState('lifecycle', transition(state.lifecycle, 'GAME_OVER'));
        setState('gameWinner', winner);
        setState('isGameOver', true);
        setState('gameOverReason', 'checkmate');
      });
      return true;
    }
    if (chessFen.isStalemate()) {
      // Update session if exists
      if (currentSession) {
        sessionManager.applyCommand(currentSession.sessionId, {
          type: 'END_GAME',
          payload: { reason: 'stalemate', winner: 'draw' },
        });
      }

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

      // Update session if exists
      if (currentSession) {
        sessionManager.applyCommand(currentSession.sessionId, {
          type: 'END_GAME',
          payload: { reason: null, winner: null, evalScore: score },
        });
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

    // Update session if exists
    if (currentSession) {
      sessionManager.applyCommand(currentSession.sessionId, {
        type: 'TIMEOUT',
        payload: { losingColor: winnerColor === 'w' ? 'b' : 'w' },
      });
    }

    batch(() => {
      setState('lifecycle', transition(state.lifecycle, 'GAME_OVER'));
      setState('gameOverReason', 'time');
      setState('isGameOver', true);
      setState('gameWinner', winnerColor);
    });
  };

  const jumpToMoveIndex = (targetIndex: number) => {
    // Use session if available
    if (currentSession) {
      const result = sessionManager.applyCommand(currentSession.sessionId, {
        type: 'NAVIGATE_HISTORY',
        payload: { targetIndex },
      });

      if (result.success) {
        syncStoreFromSession(currentSession);
        return;
      }
    }

    // Legacy path
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
    // Use session if available
    if (currentSession) {
      const result = sessionManager.applyCommand(currentSession.sessionId, {
        type: 'TAKE_BACK',
        payload: { playerColor: state.playerColor },
      });

      if (result.success) {
        // Sync legacy chess instance
        chess.undo();
        if (chess.turn() !== state.playerColor) {
          chess.undo();
        }
        syncStoreFromSession(currentSession);

        // If player is black and board is reset, trigger AI move
        if (currentSession.moveHistory.length === 0 && state.playerColor === 'b') {
          performAIMove();
        }
        return;
      }
    }

    // Legacy path
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

    // Update session if exists
    if (currentSession) {
      sessionManager.applyCommand(currentSession.sessionId, {
        type: 'RESIGN',
        payload: { resigningSide: state.playerColor },
      });
    }

    batch(() => {
      setState('lifecycle', transition(state.lifecycle, 'GAME_OVER'));
      setState('gameOverReason', 'resignation');
      setState('isGameOver', true);
      setState('gameWinner', winner);
    });
  };

  const exitGame = () => {
    if (timerId) clearInterval(timerId);

    // Clean up multiplayer connection
    if (state.multiplayerGameId) {
      gameSyncService.leaveGame(state.multiplayerGameId);
    }

    // Clean up session
    if (currentSession) {
      sessionManager.destroySession(currentSession.sessionId);
      currentSession = null;
    }

    batch(() => {
      setState('currentSessionId', null);
      setState('lifecycle', transition(state.lifecycle, 'EXIT_GAME'));
      setState('isGameOver', false);
      setState('gameOverReason', null);
      setState('gameWinner', null);
      setState('multiplayerGameId', null);
      setState('isWaitingForOpponent', false);
      setState('opponentUsername', null);
      setState('opponentType', 'ai');
    });
  };

  // ============================================================================
  // Multiplayer Game Functions
  // ============================================================================

  let syncEventUnsubscribe: (() => void) | null = null;

  const handleSyncEvent = (event: SyncEvent) => {
    switch (event.type) {
      case 'game:created': {
        const data = event.data as { gameId: string; color: 'white' | 'black' };
        batch(() => {
          setState('multiplayerGameId', data.gameId);
          setState('playerColor', data.color === 'white' ? 'w' : 'b');
          setState('boardView', data.color === 'white' ? 'w' : 'b');
          setState('isWaitingForOpponent', true);
        });
        break;
      }

      case 'game:joined': {
        const data = event.data as GameJoinedData;
        batch(() => {
          setState('multiplayerGameId', data.gameId);
          setState('playerColor', data.color === 'white' ? 'w' : 'b');
          setState('boardView', data.color === 'white' ? 'w' : 'b');
          setState('opponentUsername', data.opponent ?? null);
          // Still waiting for GAME_STARTED to begin playing
        });
        break;
      }

      case 'game:started': {
        const data = event.data as GameStartedData;
        const playerIsWhite = state.playerColor === 'w';
        const opponentInfo = playerIsWhite ? data.blackPlayer : data.whitePlayer;

        chess = new Chess(data.fen);

        batch(() => {
          setState('lifecycle', 'playing');
          setState('fen', data.fen);
          setState('viewFen', data.fen);
          setState('boardSquares', fenToBoard(data.fen));
          setState('isWaitingForOpponent', false);
          setState('opponentUsername', opponentInfo.username ?? null);
          setState('whiteTime', Math.floor(data.whiteTimeMs / 1000));
          setState('blackTime', Math.floor(data.blackTimeMs / 1000));
          setState('currentTurn', 'w');
          setState('engineStatus', 'ready');
        });
        break;
      }

      case 'game:move_accepted': {
        const data = event.data as MoveAcceptedData;
        // Update times from server
        batch(() => {
          if (data.whiteTimeMs !== undefined) {
            setState('whiteTime', Math.floor(data.whiteTimeMs / 1000));
          }
          if (data.blackTimeMs !== undefined) {
            setState('blackTime', Math.floor(data.blackTimeMs / 1000));
          }
        });
        break;
      }

      case 'game:opponent_move': {
        const data = event.data as OpponentMoveData;

        // Apply opponent's move
        const move = chess.move({
          from: data.from as Square,
          to: data.to as Square,
          promotion: data.promotion as PromotionPiece | undefined,
        });

        if (move) {
          const captured = captureCheck(data.to as Square, fenToBoard(state.fen));

          batch(() => {
            if (captured) {
              handleCapturedPiece(
                captured,
                (newWhitePieces) => setState('capturedWhite', newWhitePieces),
                (newBlackPieces) => setState('capturedBlack', newBlackPieces)
              );
            }
            setState('fen', data.fen);
            setState('viewFen', data.fen);
            setState('boardSquares', fenToBoard(data.fen));
            setState('lastMove', { from: data.from as Square, to: data.to as Square });
            setState('moveHistory', [...state.moveHistory, data.san]);
            setState('viewMoveIndex', state.moveHistory.length);
            setState('currentTurn', state.currentTurn === 'w' ? 'b' : 'w');

            if (data.whiteTimeMs !== undefined) {
              setState('whiteTime', Math.floor(data.whiteTimeMs / 1000));
            }
            if (data.blackTimeMs !== undefined) {
              setState('blackTime', Math.floor(data.blackTimeMs / 1000));
            }

            // Update check status
            if (data.isCheck) {
              const currentTurn = getTurnFromFen(data.fen);
              const kingSquare = fenToBoard(data.fen).find(
                ({ piece }) => piece === makePiece(currentTurn, 'K')
              )?.square;
              setState('checkedKingSquare', kingSquare ?? null);
            } else {
              setState('checkedKingSquare', null);
            }
          });
        }
        break;
      }

      case 'game:time_update': {
        const data = event.data as TimeUpdateData;
        batch(() => {
          setState('whiteTime', Math.floor(data.whiteTime / 1000));
          setState('blackTime', Math.floor(data.blackTime / 1000));
        });
        break;
      }

      case 'game:ended': {
        const data = event.data as GameEndedData;
        let winner: GameWinner = null;
        if (data.result === 'white') winner = 'w';
        else if (data.result === 'black') winner = 'b';
        else if (data.result === 'draw') winner = 'draw';

        let reason: GameOverReason = null;
        if (data.reason === 'checkmate') reason = 'checkmate';
        else if (data.reason === 'stalemate') reason = 'stalemate';
        else if (data.reason === 'timeout') reason = 'time';
        else if (data.reason === 'resignation') reason = 'resignation';

        batch(() => {
          setState('lifecycle', 'ended');
          setState('isGameOver', true);
          setState('gameWinner', winner);
          setState('gameOverReason', reason);
        });
        break;
      }

      case 'game:opponent_left': {
        // Opponent disconnected - for now, just end the game
        // Future: could show reconnection timer or handle differently
        break;
      }

      case 'error': {
        const data = event.data as { message: string };
        console.error('Game sync error:', data.message);
        break;
      }
    }
  };

  const startMultiplayerGame = async (options: MultiplayerGameOptions) => {
    if (timerId) clearInterval(timerId);
    chess = new Chess();

    const { side, mode = 'play', newTimeControl = 5, increment = 0 } = options;

    // Reset state for new multiplayer game
    // Note: engineStatus is 'ready' immediately since multiplayer doesn't need Stockfish
    batch(() => {
      setState({
        currentSessionId: null,
        lifecycle: 'initializing',
        fen: chess.fen(),
        timeControl: newTimeControl,
        difficulty: 0,
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
        boardSquares: fenToBoard(chess.fen()),
        moveHistory: [],
        viewMoveIndex: -1,
        viewFen: chess.fen(),
        mode,
        isAiThinking: false,
        engineStatus: 'ready',
        engineError: null,
        opponentType: 'human',
        multiplayerGameId: null,
        isWaitingForOpponent: true,
        opponentUsername: null,
      });
    });

    // Subscribe to sync events
    if (syncEventUnsubscribe) {
      syncEventUnsubscribe();
    }
    syncEventUnsubscribe = gameSyncService.onEvent(handleSyncEvent);

    // Connect to WebSocket and create game
    gameSyncService.connect();
    gameSyncService.createGame({
      initialTime: newTimeControl * 60,
      increment,
    });
  };

  const applyMultiplayerMove = (from: Square, to: Square, promotion?: PromotionPiece) => {
    if (state.opponentType !== 'human' || !state.multiplayerGameId) {
      return;
    }

    // Send move to server - server will validate and broadcast
    gameSyncService.sendMove(
      state.multiplayerGameId,
      from,
      to,
      promotion
    );

    // Optimistic update: apply move locally
    const move = chess.move({ from, to, promotion });
    if (move) {
      const captured = captureCheck(to, fenToBoard(state.fen));

      batch(() => {
        if (captured) {
          handleCapturedPiece(
            captured,
            (newWhitePieces) => setState('capturedWhite', newWhitePieces),
            (newBlackPieces) => setState('capturedBlack', newBlackPieces)
          );
        }
        setState('fen', chess.fen());
        setState('viewFen', chess.fen());
        setState('boardSquares', fenToBoard(chess.fen()));
        setState('lastMove', { from, to });
        setState('moveHistory', [...state.moveHistory, move.san]);
        setState('viewMoveIndex', state.moveHistory.length);
        setState('currentTurn', state.currentTurn === 'w' ? 'b' : 'w');

        // Update check status
        if (chess.isCheck()) {
          const currentTurn = getTurnFromFen(chess.fen());
          const kingSquare = fenToBoard(chess.fen()).find(
            ({ piece }) => piece === makePiece(currentTurn, 'K')
          )?.square;
          setState('checkedKingSquare', kingSquare ?? null);
        } else {
          setState('checkedKingSquare', null);
        }
      });

      // Check for game over
      if (chess.isCheckmate()) {
        batch(() => {
          setState('lifecycle', 'ended');
          setState('isGameOver', true);
          setState('gameWinner', state.currentTurn === 'w' ? 'b' : 'w');
          setState('gameOverReason', 'checkmate');
        });
      } else if (chess.isStalemate()) {
        batch(() => {
          setState('lifecycle', 'ended');
          setState('isGameOver', true);
          setState('gameWinner', 'draw');
          setState('gameOverReason', 'stalemate');
        });
      }
    }
  };

  const resignMultiplayer = () => {
    if (state.multiplayerGameId) {
      gameSyncService.resign(state.multiplayerGameId);
    }
  };

  const joinMultiplayerGame = (gameId: string) => {
    if (timerId) clearInterval(timerId);
    chess = new Chess();

    // Reset state for joining a multiplayer game
    batch(() => {
      setState({
        currentSessionId: null,
        lifecycle: 'initializing',
        fen: chess.fen(),
        timeControl: 0, // Will be set when game starts
        difficulty: 0,
        whiteTime: 0,
        blackTime: 0,
        playerColor: 'b', // Joiner typically gets black, server will confirm
        boardView: 'b',
        aiSide: 'w',
        currentTurn: 'w',
        checkedKingSquare: null,
        lastMove: null,
        isGameOver: false,
        gameOverReason: null,
        gameWinner: null,
        capturedWhite: [],
        capturedBlack: [],
        boardSquares: fenToBoard(chess.fen()),
        moveHistory: [],
        viewMoveIndex: -1,
        viewFen: chess.fen(),
        mode: 'play',
        isAiThinking: false,
        engineStatus: 'ready',
        engineError: null,
        opponentType: 'human',
        multiplayerGameId: gameId,
        isWaitingForOpponent: true,
        opponentUsername: null,
      });
    });

    // Subscribe to sync events
    if (syncEventUnsubscribe) {
      syncEventUnsubscribe();
    }
    syncEventUnsubscribe = gameSyncService.onEvent(handleSyncEvent);

    // Connect to WebSocket and join game
    gameSyncService.connect();
    gameSyncService.joinGame(gameId);
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

    /** Get the current session (if any) */
    currentSession: () => currentSession,

    /** Whether this is a multiplayer game */
    isMultiplayer: () => state.opponentType === 'human',

    /** Whether waiting for opponent to join */
    isWaitingForOpponent: () => state.isWaitingForOpponent,
  };

  const actions = {
    // Game lifecycle actions
    startNewGame,
    exitGame,
    resign,
    retryEngineInit,

    // Game play actions
    applyPlayerMove,
    performAIMove,
    handleTimeOut,
    jumpToMoveIndex,
    takeBack,
    afterMoveChecks,
    flipBoardView,
    clearGameTimer,

    // Multiplayer actions
    startMultiplayerGame,
    joinMultiplayerGame,
    applyMultiplayerMove,
    resignMultiplayer,

    // Direct access (backward compatibility)
    /** @deprecated Use session methods instead. Provided for backward compatibility. */
    getChessInstance: () => currentSession?.getChessInstance() ?? chess,
    setState,

    // Session access
    getCurrentSession: () => currentSession,
    getSessionManager: () => sessionManager,
  };

  return [state, actions, derived] as const;
};
