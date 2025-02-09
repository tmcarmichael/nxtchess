export interface GameState {
  fen: string;
  isGameOver: boolean;
}

export type Side = 'w' | 'b';

export type GameOverReason = 'checkmate' | 'stalemate' | 'time' | null;
