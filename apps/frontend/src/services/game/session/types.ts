import type {
  Side,
  GameMode,
  GameOverReason,
  GameWinner,
  AIPlayStyle,
  GamePhase,
  Square,
  PromotionPiece,
} from '../../../types';
import type { GameLifecycle } from '../gameLifecycle';

// ============================================================================
// Session Configuration Types
// ============================================================================

export type OpponentType = 'ai' | 'human';

export interface TimeControl {
  initialTime: number; // in seconds
  increment?: number; // in seconds per move
}

export interface GameSessionConfig {
  sessionId: string;
  mode: GameMode;
  playerColor: Side;
  opponentType: OpponentType;
  timeControl?: TimeControl;
  difficulty?: number;
  aiPlayStyle?: AIPlayStyle;
  gamePhase?: GamePhase;
  isRated?: boolean;
  availableHints?: number;
}

// ============================================================================
// Session State Types
// ============================================================================

export interface PlayerTimes {
  white: number;
  black: number;
}

export interface CapturedPieces {
  white: string[];
  black: string[];
}

export interface LastMove {
  from: Square;
  to: Square;
}

export interface GameSessionState {
  // Core game state
  fen: string;
  moveHistory: string[];
  times: PlayerTimes;
  capturedPieces: CapturedPieces;

  // Game lifecycle
  lifecycle: GameLifecycle;
  currentTurn: Side;
  isGameOver: boolean;
  gameOverReason: GameOverReason;
  gameWinner: GameWinner;

  // UI/Navigation state
  lastMove: LastMove | null;
  checkedKingSquare: Square | null;
  viewMoveIndex: number;
  viewFen: string;

  // Training mode specific
  trainingEvalScore: number | null;
  usedHints: number;
}

// ============================================================================
// Session Snapshot (for persistence/recovery)
// ============================================================================

export interface GameSessionSnapshot {
  config: GameSessionConfig;
  state: GameSessionState;
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// Command Types (for state mutations)
// ============================================================================

export interface ApplyMoveCommand {
  type: 'APPLY_MOVE';
  payload: {
    from: Square;
    to: Square;
    promotion?: PromotionPiece;
  };
}

export interface SyncStateCommand {
  type: 'SYNC_STATE';
  payload: {
    state: Partial<GameSessionState>;
  };
}

export interface RollbackCommand {
  type: 'ROLLBACK';
  payload: {
    toMoveIndex: number;
  };
}

export interface ResignCommand {
  type: 'RESIGN';
  payload: {
    resigningSide: Side;
  };
}

export interface TimeoutCommand {
  type: 'TIMEOUT';
  payload: {
    losingColor: Side;
  };
}

export interface TakeBackCommand {
  type: 'TAKE_BACK';
  payload: {
    playerColor: Side;
  };
}

export interface EndGameCommand {
  type: 'END_GAME';
  payload: {
    reason: GameOverReason;
    winner: GameWinner;
    evalScore?: number;
  };
}

export interface UpdateTimesCommand {
  type: 'UPDATE_TIMES';
  payload: {
    times: PlayerTimes;
  };
}

export interface NavigateHistoryCommand {
  type: 'NAVIGATE_HISTORY';
  payload: {
    targetIndex: number;
  };
}

export type GameCommand =
  | ApplyMoveCommand
  | SyncStateCommand
  | RollbackCommand
  | ResignCommand
  | TimeoutCommand
  | TakeBackCommand
  | EndGameCommand
  | UpdateTimesCommand
  | NavigateHistoryCommand;

// ============================================================================
// Command Result Types
// ============================================================================

export interface CommandSuccess {
  success: true;
  newState: GameSessionState;
}

export interface CommandError {
  success: false;
  error: string;
  rollbackState?: GameSessionState;
}

export type CommandResult = CommandSuccess | CommandError;

// ============================================================================
// Session Events (for external subscriptions)
// ============================================================================

export type SessionEventType =
  | 'session:created'
  | 'session:updated'
  | 'session:destroyed'
  | 'session:activated'
  | 'game:started'
  | 'game:move'
  | 'game:ended';

export interface SessionEvent {
  sessionId: string;
  type: SessionEventType;
  data?: unknown;
  timestamp: number;
}

export type SessionEventHandler = (event: SessionEvent) => void;
