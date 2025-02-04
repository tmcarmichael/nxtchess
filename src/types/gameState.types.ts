export interface GameState {
  fen: string;
  isGameOver: boolean;
}

export type Side = 'w' | 'b';

export interface PieceValueMap {
  [key: string]: number;
}
