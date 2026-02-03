import type { ChessStore } from './stores/createChessStore';
import type { EngineStore } from './stores/createEngineStore';
import type { MultiplayerStore } from './stores/createMultiplayerStore';
import type { TimerStore } from './stores/createTimerStore';
import type { UIStore } from './stores/createUIStore';
import type { Square, PromotionPiece } from '../../types/chess';
import type { Side, StartGameOptions, MultiplayerGameOptions } from '../../types/game';

// ============================================================================
// Store Types (re-exported for convenience)
// ============================================================================

export type { ChessStore, TimerStore, UIStore, EngineStore, MultiplayerStore };

// ============================================================================
// Core Actions (available in all game modes)
// ============================================================================

export interface CoreActions {
  // Navigation & UI
  jumpToMove: (index: number) => void;
  jumpToPreviousMove: () => void;
  jumpToNextMove: () => void;
  flipBoard: () => void;

  // Game lifecycle
  exitGame: () => void;
}

// ============================================================================
// Single Player Actions (Play vs AI, Training)
// ============================================================================

export interface SinglePlayerActions extends CoreActions {
  startNewGame: (options: StartGameOptions) => Promise<void>;
  applyPlayerMove: (from: Square, to: Square, promotion?: PromotionPiece) => void;
  resign: () => void;
  retryEngineInit: () => Promise<void>;
  handleTimeOut: (winner: Side) => void;
  takeBack: () => void;
}

// ============================================================================
// Multiplayer Actions
// ============================================================================

export interface MultiplayerActions extends CoreActions {
  startMultiplayerGame: (options: MultiplayerGameOptions) => Promise<void>;
  joinMultiplayerGame: (gameId: string) => void;
  applyMultiplayerMove: (from: Square, to: Square, promotion?: PromotionPiece) => void;
  resignMultiplayer: () => void;
  handleTimeOut: (winner: Side) => void;
}

// ============================================================================
// Play Mode Actions (combines single player + multiplayer)
// ============================================================================

export type PlayActions = SinglePlayerActions & MultiplayerActions;

// ============================================================================
// Training Mode Actions
// ============================================================================

export interface TrainingActions extends SinglePlayerActions {
  restartGame: () => Promise<void>;
}

// ============================================================================
// Core Derived State
// ============================================================================

export interface CoreDerived {
  isPlaying: () => boolean;
  material: () => { diff: number };
}

// ============================================================================
// Engine Derived State
// ============================================================================

export interface EngineDerived {
  isEngineReady: () => boolean;
  isEngineLoading: () => boolean;
  hasEngineError: () => boolean;
}

// ============================================================================
// Multiplayer Derived State
// ============================================================================

export interface MultiplayerDerived {
  isMultiplayer: () => boolean;
  isWaitingForOpponent: () => boolean;
}

// ============================================================================
// Play Mode Derived (all derived state)
// ============================================================================

export type PlayDerived = CoreDerived & EngineDerived & MultiplayerDerived;

// ============================================================================
// Training Mode Derived
// ============================================================================

export type TrainingDerived = CoreDerived & EngineDerived;

// ============================================================================
// Analyze Mode Actions
// ============================================================================

export interface AnalyzeActions extends CoreActions {
  loadFen: (fen: string) => boolean;
  loadPgn: (pgn: string) => boolean;
  resetToStart: () => void;
  applyMove: (from: Square, to: Square, promotion?: PromotionPiece) => boolean;
}

// ============================================================================
// Analyze Mode Derived
// ============================================================================

export type AnalyzeDerived = CoreDerived & EngineDerived;

// ============================================================================
// Puzzle Mode Actions
// ============================================================================

export interface PuzzleActions extends CoreActions {
  startNewGame: (options: StartGameOptions) => Promise<void>;
  applyPlayerMove: (from: Square, to: Square, promotion?: PromotionPiece) => void;
  loadNextPuzzle: () => Promise<void>;
  retryEngineInit: () => Promise<void>;
  dismissFeedback: () => void;
}

// ============================================================================
// Puzzle Mode Derived
// ============================================================================

export type PuzzleDerived = CoreDerived & EngineDerived;

// ============================================================================
// Context Value Types
// ============================================================================

export interface CoreGameContextValue {
  chess: ChessStore;
  timer: TimerStore;
  ui: UIStore;
  actions: CoreActions;
  derived: CoreDerived;
}

export interface PlayGameContextValue {
  chess: ChessStore;
  timer: TimerStore;
  ui: UIStore;
  engine: EngineStore;
  multiplayer: MultiplayerStore;
  actions: PlayActions;
  derived: PlayDerived;
}

export interface TrainingGameContextValue {
  chess: ChessStore;
  timer: TimerStore;
  ui: UIStore;
  engine: EngineStore;
  actions: TrainingActions;
  derived: TrainingDerived;
}

export interface AnalyzeGameContextValue {
  chess: ChessStore;
  timer: TimerStore;
  ui: UIStore;
  engine: EngineStore;
  actions: AnalyzeActions;
  derived: AnalyzeDerived;
}

export interface PuzzleGameContextValue {
  chess: ChessStore;
  timer: TimerStore;
  ui: UIStore;
  engine: EngineStore;
  actions: PuzzleActions;
  derived: PuzzleDerived;
}
