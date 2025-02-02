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
