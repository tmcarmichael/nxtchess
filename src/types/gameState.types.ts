import { BoardSquare } from './chessBoard.types';

export interface GameState {
  fen: string;
  isGameOver: boolean;
}

export interface ChessGameProps {
  timeControl: number;
  difficulty: Difficulty;
  side: Side;
  onCapturedWhiteChange?: (updater: (prev: string[]) => string[]) => void;
  onCapturedBlackChange?: (updater: (prev: string[]) => string[]) => void;
  onBoardChange?: (squares: BoardSquare[]) => void;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export type Side = 'w' | 'b';

export interface NewGameSettings {
  timeControl: number;
  difficulty: Difficulty;
  side: Side;
}

export interface PlayModalProps {
  onClose: () => void;
  onStartGame: (newSettings: NewGameSettings) => void;
  initialSettings: NewGameSettings;
  timeControlOptions?: number[];
  difficultyOptions?: Difficulty[];
  sideOptions?: { value: Side; label: string }[];
}

export interface PieceValueMap {
  [key: string]: number;
}

export interface GameStoreValue {
  fen: () => string;
  setFen: (val: string) => void;
  whiteTime: () => number;
  setWhiteTime: (fn: (prev: number) => number) => void;
  blackTime: () => number;
  setBlackTime: (fn: (prev: number) => number) => void;
  currentTurn: () => Side;
  setCurrentTurn: (val: Side) => void;
  playerColor: () => Side;
  setPlayerColor: (val: Side) => void;
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
  startNewGame: (time: number, diff: Difficulty, side: Side) => void;
  handleTimeOut: (winner: Side) => void;
}
