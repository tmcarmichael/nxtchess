// Session types
export type {
  // Configuration
  OpponentType,
  TimeControl,
  GameSessionConfig,
  // State
  PlayerTimes,
  CapturedPieces as SessionCapturedPieces,
  LastMove,
  GameSessionState,
  GameSessionSnapshot,
  // Commands
  ApplyMoveCommand,
  SyncStateCommand,
  RollbackCommand,
  ResignCommand,
  TimeoutCommand,
  TakeBackCommand,
  EndGameCommand,
  UpdateTimesCommand,
  NavigateHistoryCommand,
  OptimisticMoveCommand,
  ConfirmMoveCommand,
  RejectMoveCommand,
  GameCommand,
  // Results
  CommandSuccess,
  CommandError,
  CommandResult,
  // Events
  SessionEventType,
  SessionEvent,
  SessionEventHandler,
} from './types';

// Session classes
export { GameSession } from './GameSession';
export { SessionManager, sessionManager } from './SessionManager';
