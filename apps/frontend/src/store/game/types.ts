import type { ChessStore } from './stores/createChessStore';
import type { EngineStore } from './stores/createEngineStore';
import type { MultiplayerStore } from './stores/createMultiplayerStore';
import type { TimerStore } from './stores/createTimerStore';
import type { UIStore } from './stores/createUIStore';
import type { Square, PromotionPiece } from '../../types/chess';
import type { Side, StartGameOptions, MultiplayerGameOptions } from '../../types/game';

export type { ChessStore, TimerStore, UIStore, EngineStore, MultiplayerStore };

export interface CoreActions {
  // Navigation & UI
  jumpToMove: (index: number) => void;
  jumpToPreviousMove: () => void;
  jumpToNextMove: () => void;
  jumpToFirstMove: () => void;
  jumpToLastMove: () => void;
  flipBoard: () => void;

  // Game lifecycle
  exitGame: () => void;
}

export interface SinglePlayerActions extends CoreActions {
  startNewGame: (options: StartGameOptions) => Promise<void>;
  applyPlayerMove: (from: Square, to: Square, promotion?: PromotionPiece) => void;
  resign: () => void;
  retryEngineInit: () => Promise<void>;
  handleTimeOut: (winner: Side) => void;
  takeBack: () => void;
}

export interface MultiplayerActions extends CoreActions {
  startMultiplayerGame: (options: MultiplayerGameOptions) => Promise<void>;
  joinMultiplayerGame: (gameId: string) => void;
  applyMultiplayerMove: (from: Square, to: Square, promotion?: PromotionPiece) => void;
  resignMultiplayer: () => void;
  handleTimeOut: (winner: Side) => void;
}

export type PlayActions = SinglePlayerActions & MultiplayerActions;

export interface TrainingActions extends SinglePlayerActions {
  restartGame: () => Promise<void>;
}

export interface CoreDerived {
  isPlaying: () => boolean;
  material: () => { diff: number };
}

export interface EngineDerived {
  isEngineReady: () => boolean;
  isEngineLoading: () => boolean;
  hasEngineError: () => boolean;
}

export interface MultiplayerDerived {
  isMultiplayer: () => boolean;
  isWaitingForOpponent: () => boolean;
}

export type PlayDerived = CoreDerived & EngineDerived & MultiplayerDerived;

export type TrainingDerived = CoreDerived & EngineDerived;

export interface AnalyzeActions extends CoreActions {
  loadFen: (fen: string) => boolean;
  loadPgn: (pgn: string) => boolean;
  resetToStart: () => void;
  applyMove: (from: Square, to: Square, promotion?: PromotionPiece) => boolean;
}

export type AnalyzeDerived = CoreDerived & EngineDerived;

export interface PuzzleActions extends CoreActions {
  startNewGame: (options: StartGameOptions) => Promise<void>;
  applyPlayerMove: (from: Square, to: Square, promotion?: PromotionPiece) => void;
  loadNextPuzzle: () => Promise<void>;
  retryEngineInit: () => Promise<void>;
  dismissFeedback: () => void;
}

export type PuzzleDerived = CoreDerived & EngineDerived;

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
