import { createStore } from 'solid-js/store';
import { Chess } from 'chess.js';
import { batch } from 'solid-js';
import { Side, BoardSquare, Square, PromotionPiece, GameState } from '../types';
import { initAiEngine, getBestMove } from '../services/engine/aiEngineWorker';
import { initEvalEngine, getEvaluation } from '../services/engine/evalEngineWorker';
import { fenToBoard, captureCheck, handleCapturedPiece } from '../services/chessGameService';
import { DIFFICULTY_VALUES_ELO } from '../utils';

interface GameStoreState {
  fen: string;
  whiteTime: number;
  blackTime: number;
  timeControl: number;
  difficulty: number;
  currentTurn: Side;
  playerColor: Side;
  boardView: Side;
  isGameOver: boolean;
  gameOverReason: 'checkmate' | 'stalemate' | 'time' | null;
  gameWinner: Side | 'draw' | null;
  capturedWhite: string[];
  capturedBlack: string[];
  boardSquares: BoardSquare[];
  aiSide: Side;
  lastMove: { from: Square; to: Square } | null;
  checkedKingSquare: Square | null;
  moveHistory: string[];
  viewMoveIndex: number;
  viewFen: string;
  mode: 'play' | 'training' | 'analysis';
  trainingIsRated: boolean;
  trainingOpponentStyle: 'aggressive' | 'defensive' | 'balanced' | 'positional' | 'random' | null;
  trainingGamePhase: 'opening' | 'middlegame' | 'endgame' | null;
  trainingAvailableHints: number;
  trainingUsedHints: number;
  trainingEvalScore: number | null;
  isAiThinking: boolean;
}

export const createGameStore = () => {
  let chess = new Chess();
  const chessGameHistory = new Chess();

  let timerId: number | undefined;
  const [state, setState] = createStore<GameStoreState>({
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
    trainingOpponentStyle: null,
    trainingGamePhase: null,
    trainingAvailableHints: 0,
    trainingUsedHints: 0,
    trainingEvalScore: null,
    isAiThinking: false,
  });

  const updateGameState = (from: Square, to: Square, promotion?: PromotionPiece): GameState => {
    const move = chess.move({ from, to, promotion });
    if (!move) {
      throw new Error(`Invalid move from ${from} to ${to} (promotion=${promotion})`);
    }
    return {
      fen: chess.fen(),
      isGameOver: chess.isGameOver(),
    };
  };

  const startTimer = () => {
    if (timerId) clearInterval(timerId);
    timerId = setInterval(() => {
      if (state.isGameOver) {
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
    }, 1000) as unknown as number;
  };

  const performAIMove = async () => {
    if (state.isGameOver || state.currentTurn !== state.aiSide || state.isAiThinking) return;
    setState('isAiThinking', true);
    try {
      const fenAtStart = state.fen;
      const best = await getBestMove(state.fen);
      if (!best) {
        throw Error('No AI best move');
      }
      if (state.fen !== fenAtStart) {
        throw new Error('Engine worker out of sync FEN');
      }
      const from = best.slice(0, 2) as Square;
      const to = best.slice(2, 4) as Square;
      const promo = best.length === 5 ? best[4] : null;

      const updatedState = promo
        ? updateGameState(from, to, promo as PromotionPiece)
        : updateGameState(from, to);

      batch(() => {
        const captured = captureCheck(to, fenToBoard(state.fen));
        if (captured) {
          handleCapturedPiece(
            captured,
            (fn) => setState('capturedBlack', fn),
            (fn) => setState('capturedWhite', fn)
          );
        }
        setState('fen', updatedState.fen);
        setState('lastMove', { from, to });
        const hist = chess.history();
        setState('moveHistory', hist);
        setState('viewMoveIndex', hist.length - 1);
        setState('boardSquares', fenToBoard(updatedState.fen));
        setState('viewFen', updatedState.fen);
        setState('currentTurn', state.currentTurn === 'w' ? 'b' : 'w');
      });
      if (!state.isGameOver) afterMoveChecks(updatedState.fen);
    } catch (err) {
      console.error('Engine error:', err);
    } finally {
      setState('isAiThinking', false);
    }
  };

  const startNewGame = (
    newTimeControl: number,
    newDifficultyLevel: number,
    side: Side,
    options?: {
      mode?: 'play' | 'training' | 'analysis';
      trainingIsRated?: boolean;
      trainingOpponentStyle?:
        | 'aggressive'
        | 'defensive'
        | 'balanced'
        | 'positional'
        | 'random'
        | null;
      trainingGamePhase?: 'opening' | 'middlegame' | 'endgame';
      trainingAvailableHints?: number;
    }
  ) => {
    if (timerId) clearInterval(timerId);
    chess = new Chess();
    chessGameHistory.reset();
    const mode = options?.mode ?? 'play';

    batch(() => {
      setState({
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
        trainingIsRated: options?.trainingIsRated ?? false,
        trainingOpponentStyle: options?.trainingOpponentStyle ?? null,
        trainingGamePhase: options?.trainingGamePhase ?? null,
        trainingAvailableHints: options?.trainingAvailableHints ?? 0,
        trainingUsedHints: 0,
        isAiThinking: false,
      });
    });

    if (mode === 'play') {
      startTimer();
    } else {
      initEvalEngine();
    }

    const elo = DIFFICULTY_VALUES_ELO[newDifficultyLevel - 1] ?? 600;
    initAiEngine(elo).then(() => {
      if (side === 'b') {
        performAIMove();
      }
    });
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
      setState('gameWinner', winner);
      setState('isGameOver', true);
      setState('gameOverReason', 'checkmate');
      return true;
    }
    if (chessFen.isStalemate()) {
      setState('gameWinner', 'draw');
      setState('isGameOver', true);
      setState('gameOverReason', 'stalemate');
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
      setState('trainingEvalScore', score);
      setState('isGameOver', true);
      setState('gameWinner', null);
      setState('gameOverReason', null);
    });
  };

  const handleTimeOut = (winnerColor: Side) => {
    if (timerId) clearInterval(timerId);
    setState('gameOverReason', 'time');
    setState('isGameOver', true);
    setState('gameWinner', winnerColor);
  };

  const jumpToMoveIndex = (targetIndex: number) => {
    const history = state.moveHistory;
    const clamped = Math.min(Math.max(0, targetIndex), history.length - 1);

    chessGameHistory.reset();
    history.slice(0, clamped + 1).forEach((moveSan) => {
      chessGameHistory.move(moveSan);
    });

    setState('viewMoveIndex', clamped);
    if (clamped === history.length - 1) {
      setState('viewFen', state.fen);
    } else {
      setState('viewFen', chessGameHistory.fen());
    }
  };

  const clearGameTimer = () => {
    if (timerId) clearInterval(timerId);
  };

  const fen = () => state.fen;
  const whiteTime = () => state.whiteTime;
  const blackTime = () => state.blackTime;
  const timeControl = () => state.timeControl;
  const difficulty = () => state.difficulty;
  const currentTurn = () => state.currentTurn;
  const playerColor = () => state.playerColor;
  const boardView = () => state.boardView;
  const isGameOver = () => state.isGameOver;
  const gameOverReason = () => state.gameOverReason;
  const gameWinner = () => state.gameWinner;
  const capturedWhite = () => state.capturedWhite;
  const capturedBlack = () => state.capturedBlack;
  const boardSquares = () => state.boardSquares;
  const aiSide = () => state.aiSide;
  const lastMove = () => state.lastMove;
  const checkedKingSquare = () => state.checkedKingSquare;
  const moveHistory = () => state.moveHistory;
  const viewMoveIndex = () => state.viewMoveIndex;
  const viewFen = () => state.viewFen;
  const trainingEvalScore = () => state.trainingEvalScore;
  const isAiThinking = () => state.isAiThinking;

  const setFen = (value: string) => setState('fen', value);
  const setWhiteTime = (value: number | ((prev: number) => number)) => setState('whiteTime', value);
  const setBlackTime = (value: number | ((prev: number) => number)) => setState('blackTime', value);
  const setTimeControl = (value: number) => setState('timeControl', value);
  const setDifficulty = (value: number) => setState('difficulty', value);
  const setCurrentTurn = (value: Side | ((prev: Side) => Side)) => setState('currentTurn', value);
  const setPlayerColor = (value: Side | ((prev: Side) => Side)) => setState('playerColor', value);
  const setBoardView = (value: Side | ((prev: Side) => Side)) => setState('boardView', value);
  const setIsGameOver = (value: boolean) => setState('isGameOver', value);
  const setGameOverReason = (value: 'checkmate' | 'stalemate' | 'time' | null) =>
    setState('gameOverReason', value);
  const setGameWinner = (value: Side | 'draw' | null) => setState('gameWinner', value);
  const setCapturedWhite = (value: string[] | ((prev: string[]) => string[])) =>
    setState('capturedWhite', value);
  const setCapturedBlack = (value: string[] | ((prev: string[]) => string[])) =>
    setState('capturedBlack', value);
  const setBoardSquares = (value: BoardSquare[]) => setState('boardSquares', value);
  const setLastMove = (value: { from: Square; to: Square } | null) => setState('lastMove', value);
  const setCheckedKingSquare = (value: Square | null) => setState('checkedKingSquare', value);
  const setMoveHistory = (value: string[]) => setState('moveHistory', value);
  const setViewMoveIndex = (value: number) => setState('viewMoveIndex', value);
  const setViewFen = (value: string) => setState('viewFen', value);
  const setTrainingEvalScore = (value: number | null) => setState('trainingEvalScore', value);
  const setIsAiThinking = (value: boolean) => setState('isAiThinking', value);

  const actions = {
    performAIMove,
    startNewGame,
    handleTimeOut,
    jumpToMoveIndex,
    clearGameTimer,
    getChessInstance: () => chess,
    afterMoveChecks,

    fen,
    whiteTime,
    blackTime,
    timeControl,
    difficulty,
    currentTurn,
    playerColor,
    boardView,
    isGameOver,
    gameOverReason,
    gameWinner,
    capturedWhite,
    capturedBlack,
    boardSquares,
    aiSide,
    lastMove,
    checkedKingSquare,
    moveHistory,
    viewMoveIndex,
    viewFen,
    trainingEvalScore,
    isAiThinking,

    setFen,
    setWhiteTime,
    setBlackTime,
    setTimeControl,
    setDifficulty,
    setCurrentTurn,
    setPlayerColor,
    setBoardView,
    setIsGameOver,
    setGameOverReason,
    setGameWinner,
    setCapturedWhite,
    setCapturedBlack,
    setBoardSquares,
    setLastMove,
    setCheckedKingSquare,
    setMoveHistory,
    setViewMoveIndex,
    setViewFen,
    setTrainingEvalScore,
    setIsAiThinking,
  };

  return [state, actions] as const;
};
