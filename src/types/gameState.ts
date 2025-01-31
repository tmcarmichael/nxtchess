export interface GameState {
  fen: string;
  isGameOver: boolean;
}

export interface GameRouteState {
  timeControl: number;
  difficulty: Difficulty;
  side: Side;
}

export type Difficulty = 'easy' | 'medium' | 'hard';
export type Side = 'w' | 'b';
