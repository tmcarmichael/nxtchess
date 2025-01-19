export interface GameState {
  fen: string;
  isGameOver: boolean;
}

export interface GameRouteState {
  timeControl: number;
  difficulty: string;
}
