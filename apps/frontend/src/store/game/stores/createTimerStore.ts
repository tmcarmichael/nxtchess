import { createStore, produce } from 'solid-js/store';
import type { Side } from '../../../types/game';

interface TimerState {
  whiteTime: number; // milliseconds
  blackTime: number; // milliseconds
  timeControl: number; // minutes (for display)
  increment: number; // milliseconds
  isRunning: boolean;
}

export interface TimerStore {
  state: TimerState;
  start: (currentTurn: () => Side, onTimeout: (side: Side) => void) => void;
  stop: () => void;
  sync: (whiteMs: number, blackMs: number) => void;
  reset: (minutes: number, incrementSeconds?: number) => void;
  setTimeControl: (minutes: number) => void;
  addIncrement: (side: Side) => void;
}

export const createTimerStore = (): TimerStore => {
  const [state, setState] = createStore<TimerState>({
    whiteTime: 300000, // 5 minutes in ms
    blackTime: 300000,
    timeControl: 5,
    increment: 0,
    isRunning: false,
  });

  let intervalId: ReturnType<typeof setInterval> | null = null;

  const start = (currentTurn: () => Side, onTimeout: (side: Side) => void) => {
    stop();
    setState('isRunning', true);
    intervalId = setInterval(() => {
      const side = currentTurn();
      const key = side === 'w' ? 'whiteTime' : 'blackTime';
      setState(
        produce((s) => {
          s[key] = Math.max(0, s[key] - 100);
          if (s[key] === 0) {
            stop();
            onTimeout(side);
          }
        })
      );
    }, 100);
  };

  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    setState('isRunning', false);
  };

  const sync = (whiteMs: number, blackMs: number) => {
    setState({ whiteTime: whiteMs, blackTime: blackMs });
  };

  const reset = (minutes: number, incrementSeconds: number = 0) => {
    stop();
    const ms = minutes * 60 * 1000;
    const incrementMs = incrementSeconds * 1000;
    setState({ whiteTime: ms, blackTime: ms, timeControl: minutes, increment: incrementMs });
  };

  const setTimeControl = (minutes: number) => {
    setState('timeControl', minutes);
  };

  const addIncrement = (side: Side) => {
    if (state.increment <= 0) return;
    const key = side === 'w' ? 'whiteTime' : 'blackTime';
    setState(key, (prev) => prev + state.increment);
  };

  return { state, start, stop, sync, reset, setTimeControl, addIncrement };
};
