export type Side = 'w' | 'b';
export type GameWinner = Side | 'draw' | null;
export type GameOverReason = 'checkmate' | 'stalemate' | 'time' | null;
export type RatedMode = 'rated' | 'casual';
export type AIPlayStyle = 'aggressive' | 'defensive' | 'balanced' | 'random' | 'positional' | null;
export type GamePhase = 'opening' | 'middlegame' | 'endgame' | null;
export type GameMode = 'play' | 'training' | 'analysis';
export interface StartGameOptions {
  side: Side;
  mode: GameMode;
  newTimeControl?: number;
  newDifficultyLevel?: number;
  trainingIsRated?: boolean;
  trainingAIPlayStyle?: AIPlayStyle;
  trainingGamePhase?: GamePhase;
  trainingAvailableHints?: number;
}
