import type { GameLifecycle } from '../../types/game';

// Re-export for backward compatibility
export type { GameLifecycle } from '../../types/game';

/**
 * Events that can trigger state transitions in the game lifecycle.
 */
export type GameLifecycleEvent =
  | 'START_GAME' // User initiates a new game
  | 'ENGINE_READY' // Engine successfully initialized
  | 'ENGINE_ERROR' // Engine failed to initialize
  | 'GAME_OVER' // Game ended (checkmate, stalemate, time, resign)
  | 'PLAY_AGAIN' // User wants to start another game
  | 'EXIT_GAME' // User exits to menu/home
  | 'RETRY_ENGINE'; // User retries engine initialization

/**
 * Valid state transitions for the game lifecycle.
 * Maps current state + event → next state (or null if transition is invalid).
 */
const TRANSITIONS: Record<GameLifecycle, Partial<Record<GameLifecycleEvent, GameLifecycle>>> = {
  idle: {
    START_GAME: 'initializing',
  },
  initializing: {
    ENGINE_READY: 'playing',
    ENGINE_ERROR: 'error',
    EXIT_GAME: 'idle',
  },
  playing: {
    GAME_OVER: 'ended',
    EXIT_GAME: 'idle',
  },
  error: {
    RETRY_ENGINE: 'initializing',
    EXIT_GAME: 'idle',
  },
  ended: {
    PLAY_AGAIN: 'initializing',
    EXIT_GAME: 'idle',
  },
};

/**
 * Attempt to transition to a new state based on an event.
 * Returns the new state if the transition is valid, or the current state if not.
 */
export const transition = (
  currentState: GameLifecycle,
  event: GameLifecycleEvent
): GameLifecycle => {
  const nextState = TRANSITIONS[currentState][event];
  if (nextState === undefined) {
    return currentState;
  }
  return nextState;
};

/**
 * Check if a transition is valid without performing it.
 */
export const canTransition = (currentState: GameLifecycle, event: GameLifecycleEvent): boolean => {
  return TRANSITIONS[currentState][event] !== undefined;
};

/**
 * Get all valid events for the current state.
 */
export const getValidEvents = (currentState: GameLifecycle): GameLifecycleEvent[] => {
  return Object.keys(TRANSITIONS[currentState]) as GameLifecycleEvent[];
};

/**
 * Check if the game is in a state where moves can be made.
 */
export const canMakeMove = (lifecycle: GameLifecycle): boolean => {
  return lifecycle === 'playing';
};

/**
 * Check if the game is in a state where the timer should run.
 */
export const shouldRunTimer = (lifecycle: GameLifecycle): boolean => {
  return lifecycle === 'playing';
};

/**
 * Check if the game is in a state where engine operations are expected.
 */
export const isEngineActive = (lifecycle: GameLifecycle): boolean => {
  return lifecycle === 'initializing' || lifecycle === 'playing';
};

/**
 * Check if a new game can be started from the current state.
 */
export const canStartNewGame = (lifecycle: GameLifecycle): boolean => {
  return lifecycle === 'idle' || lifecycle === 'ended';
};
