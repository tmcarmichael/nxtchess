export type Side = 'w' | 'b';
export type SideSelection = Side | 'random';
export type GameWinner = Side | 'draw' | null;
export type GameOverReason = 'checkmate' | 'stalemate' | 'time' | 'resignation' | null;
export type GamePhase = 'opening' | 'middlegame' | 'endgame' | null;
export type GameMode = 'play' | 'training' | 'analysis' | 'puzzle';
export type PuzzleCategory = 'mate-in-1' | 'mate-in-2' | 'mate-in-3' | 'random';
export type OpponentType = 'ai' | 'human';

/**
 * Represents the lifecycle phases of a game session.
 * - idle: No active game, ready to start
 * - initializing: Engine loading, game setup in progress
 * - playing: Active game in progress
 * - error: Engine or initialization failure (recoverable)
 * - ended: Game completed (checkmate, stalemate, time, resign)
 */
export type GameLifecycle = 'idle' | 'initializing' | 'playing' | 'error' | 'ended';

export interface StartGameOptions {
  side: Side;
  mode: GameMode;
  newTimeControl?: number;
  newIncrement?: number;
  newDifficultyLevel?: number;
  trainingGamePhase?: GamePhase;
  trainingAvailableHints?: number;
  trainingTheme?: string;
  /** Exclude a specific position ID to avoid repeats on restart */
  trainingExcludePositionId?: string;
  puzzleCategory?: PuzzleCategory;
}

export interface MultiplayerGameOptions {
  side: Side;
  mode: GameMode;
  newTimeControl?: number;
  increment?: number;
}
