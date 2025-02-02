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

export interface PieceValueMap {
  [key: string]: number;
}
