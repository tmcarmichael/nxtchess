import { createStore, produce } from 'solid-js/store';
import type { Side } from '../../../types/game';

interface TimerState {
  whiteTime: number;
  blackTime: number;
  timeControl: number;
  isRunning: boolean;
}

export interface TimerStore {
  state: TimerState;
  start: (currentTurn: () => Side, onTimeout: (side: Side) => void) => void;
  stop: () => void;
  sync: (white: number, black: number) => void;
  reset: (minutes: number) => void;
  setTimeControl: (minutes: number) => void;
}

export const createTimerStore = (): TimerStore => {
  const [state, setState] = createStore<TimerState>({
    whiteTime: 300,
    blackTime: 300,
    timeControl: 5,
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
          s[key] = Math.max(0, s[key] - 1);
          if (s[key] === 0) {
            stop();
            onTimeout(side);
          }
        })
      );
    }, 1000);
  };

  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    setState('isRunning', false);
  };

  const sync = (white: number, black: number) => {
    setState({ whiteTime: white, blackTime: black });
  };

  const reset = (minutes: number) => {
    stop();
    const seconds = minutes * 60;
    setState({ whiteTime: seconds, blackTime: seconds, timeControl: minutes });
  };

  const setTimeControl = (minutes: number) => {
    setState('timeControl', minutes);
  };

  return { state, start, stop, sync, reset, setTimeControl };
};
