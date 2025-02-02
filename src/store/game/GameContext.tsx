import { createContext, useContext, createSignal, batch, onCleanup } from 'solid-js';
import { Side, Difficulty, BoardSquare } from '../../types';
import { initializeGame } from '../../logic/gameState';
import { initEngine } from '../ai/stockfishService';

interface GameStoreValue {
  fen: () => string;
  setFen: (val: string) => void;
  whiteTime: () => number;
  setWhiteTime: (fn: (prev: number) => number) => void;
  blackTime: () => number;
  setBlackTime: (fn: (prev: number) => number) => void;
  timeControl: () => number;
  setTimeControl: (val: number) => void;
  difficulty: () => Difficulty;
  setDifficulty: (val: Difficulty) => void;
  currentTurn: () => Side;
  setCurrentTurn: (value: Side | ((prev: Side) => Side)) => void;
  playerColor: () => Side;
  setPlayerColor: (value: Side | ((prev: Side) => Side)) => void;
  isGameOver: () => boolean;
  setIsGameOver: (val: boolean) => void;
  gameOverReason: () => 'checkmate' | 'stalemate' | 'time' | null;
  setGameOverReason: (val: 'checkmate' | 'stalemate' | 'time' | null) => void;
  gameWinner: () => Side | 'draw' | null;
  setGameWinner: (val: Side | 'draw' | null) => void;
  capturedWhite: () => string[];
  setCapturedWhite: (fn: (prev: string[]) => string[]) => void;
  capturedBlack: () => string[];
  setCapturedBlack: (fn: (prev: string[]) => string[]) => void;
  boardSquares: () => BoardSquare[];
  setBoardSquares: (val: BoardSquare[]) => void;
  startNewGame: (time: number, diff: Difficulty, side: Side) => void;
  handleTimeOut: (winner: Side) => void;
}

const GameContext = createContext<GameStoreValue>();

export const GameProvider = (props: { children: any }) => {
  const [fen, setFen] = createSignal(initializeGame().fen);
  const [whiteTime, setWhiteTime] = createSignal(300);
  const [blackTime, setBlackTime] = createSignal(300);
  const [timeControl, setTimeControl] = createSignal(5);
  const [difficulty, setDifficulty] = createSignal<Difficulty>('medium');
  const [currentTurn, setCurrentTurn] = createSignal<Side>('w');
  const [playerColor, setPlayerColor] = createSignal<Side>('w');
  const [isGameOver, setIsGameOver] = createSignal(false);
  const [gameOverReason, setGameOverReason] = createSignal<
    'checkmate' | 'stalemate' | 'time' | null
  >(null);
  const [capturedWhite, setCapturedWhite] = createSignal<string[]>([]);
  const [capturedBlack, setCapturedBlack] = createSignal<string[]>([]);
  const [gameWinner, setGameWinner] = createSignal<Side | 'draw' | null>(null);
  const [boardSquares, setBoardSquares] = createSignal<BoardSquare[]>([]);

  let timerId: number | undefined;

  const startNewGame = (newTimeControl: number, newDifficulty: Difficulty, side: Side) => {
    if (timerId) clearInterval(timerId);

    batch(() => {
      setFen(initializeGame().fen);
      setTimeControl(newTimeControl);
      setDifficulty(newDifficulty);
      setWhiteTime(newTimeControl * 60);
      setBlackTime(newTimeControl * 60);
      setPlayerColor(side);

      setIsGameOver(false);
      setGameOverReason(null);
      setGameWinner(null);
      setCapturedWhite([]);
      setCapturedBlack([]);
      setBoardSquares([]);
    });

    startTimer();

    const elo = { easy: 800, medium: 1400, hard: 2000 }[newDifficulty] ?? 1400;
    initEngine(elo).then(() => {
      if (side === 'b') {
        // Trigger AI move first
      }
    });
  };

  const startTimer = () => {
    if (timerId) clearInterval(timerId);
    timerId = setInterval(() => {
      if (isGameOver()) {
        clearInterval(timerId);
        return;
      }
      if (currentTurn() === 'w') {
        setWhiteTime((t) => Math.max(0, t - 1));
        if (whiteTime() <= 1) handleTimeOut('b');
      } else {
        setBlackTime((t) => Math.max(0, t - 1));
        if (blackTime() <= 1) handleTimeOut('w');
      }
    }, 1000) as unknown as number;
  };

  const handleTimeOut = (winnerColor: Side) => {
    if (timerId) clearInterval(timerId);
    setIsGameOver(true);
    setGameOverReason('time');
    setGameWinner(winnerColor);
  };

  onCleanup(() => {
    if (timerId) clearInterval(timerId);
  });

  const storeValue: GameStoreValue = {
    fen,
    setFen,
    whiteTime,
    setWhiteTime,
    blackTime,
    setBlackTime,
    timeControl,
    setTimeControl,
    difficulty,
    setDifficulty,
    currentTurn,
    setCurrentTurn,
    playerColor,
    setPlayerColor,
    isGameOver,
    setIsGameOver,
    gameOverReason,
    setGameOverReason,
    gameWinner,
    setGameWinner,
    capturedWhite,
    setCapturedWhite,
    capturedBlack,
    setCapturedBlack,
    boardSquares,
    setBoardSquares,
    startNewGame,
    handleTimeOut,
  };

  return <GameContext.Provider value={storeValue}>{props.children}</GameContext.Provider>;
};

export const useGameStore = () => {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error('useGameStore must be used within <GameProvider>');
  }
  return ctx;
};
