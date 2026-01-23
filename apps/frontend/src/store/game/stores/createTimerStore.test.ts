import { createRoot } from 'solid-js';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createTimerStore } from './createTimerStore';

describe('createTimerStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('has correct default values', () => {
      createRoot((dispose) => {
        const store = createTimerStore();

        expect(store.state.whiteTime).toBe(300000); // 5 minutes in ms
        expect(store.state.blackTime).toBe(300000);
        expect(store.state.timeControl).toBe(5);
        expect(store.state.isRunning).toBe(false);

        dispose();
      });
    });
  });

  describe('reset', () => {
    it('resets times to specified minutes', () => {
      createRoot((dispose) => {
        const store = createTimerStore();

        store.reset(10);

        expect(store.state.whiteTime).toBe(600000); // 10 minutes in ms
        expect(store.state.blackTime).toBe(600000);
        expect(store.state.timeControl).toBe(10);

        dispose();
      });
    });

    it('stops running timer on reset', () => {
      createRoot((dispose) => {
        const store = createTimerStore();
        const onTimeout = vi.fn();

        store.start(() => 'w', onTimeout);
        expect(store.state.isRunning).toBe(true);

        store.reset(5);
        expect(store.state.isRunning).toBe(false);

        dispose();
      });
    });
  });

  describe('setTimeControl', () => {
    it('updates time control value', () => {
      createRoot((dispose) => {
        const store = createTimerStore();

        store.setTimeControl(15);

        expect(store.state.timeControl).toBe(15);

        dispose();
      });
    });
  });

  describe('sync', () => {
    it('updates both player times', () => {
      createRoot((dispose) => {
        const store = createTimerStore();

        store.sync(150, 200);

        expect(store.state.whiteTime).toBe(150);
        expect(store.state.blackTime).toBe(200);

        dispose();
      });
    });
  });

  describe('start', () => {
    it('sets isRunning to true', () => {
      createRoot((dispose) => {
        const store = createTimerStore();

        store.start(() => 'w', vi.fn());

        expect(store.state.isRunning).toBe(true);

        dispose();
      });
    });

    it('decrements white time when white turn', () => {
      createRoot((dispose) => {
        const store = createTimerStore();
        store.reset(5); // 300000ms (5 minutes)

        store.start(() => 'w', vi.fn());
        vi.advanceTimersByTime(3000); // 3 seconds

        expect(store.state.whiteTime).toBe(297000); // 297 seconds in ms
        expect(store.state.blackTime).toBe(300000);

        store.stop();
        dispose();
      });
    });

    it('decrements black time when black turn', () => {
      createRoot((dispose) => {
        const store = createTimerStore();
        store.reset(5);

        store.start(() => 'b', vi.fn());
        vi.advanceTimersByTime(5000); // 5 seconds

        expect(store.state.whiteTime).toBe(300000);
        expect(store.state.blackTime).toBe(295000); // 295 seconds in ms

        store.stop();
        dispose();
      });
    });

    it('calls onTimeout when time reaches zero', () => {
      createRoot((dispose) => {
        const store = createTimerStore();
        const onTimeout = vi.fn();

        store.sync(2, 300); // White has 2 seconds
        store.start(() => 'w', onTimeout);
        vi.advanceTimersByTime(3000); // 3 seconds

        expect(onTimeout).toHaveBeenCalledWith('w');
        expect(store.state.whiteTime).toBe(0);
        expect(store.state.isRunning).toBe(false);

        dispose();
      });
    });

    it('does not go below zero', () => {
      createRoot((dispose) => {
        const store = createTimerStore();
        const onTimeout = vi.fn();

        store.sync(1, 300);
        store.start(() => 'w', onTimeout);
        vi.advanceTimersByTime(5000);

        expect(store.state.whiteTime).toBe(0);

        dispose();
      });
    });

    it('stops previous timer when start is called again', () => {
      createRoot((dispose) => {
        const store = createTimerStore();
        store.reset(5);

        // Start first timer
        store.start(() => 'w', vi.fn());
        vi.advanceTimersByTime(2000);

        // Start new timer (should clear old one)
        store.start(() => 'b', vi.fn());
        vi.advanceTimersByTime(2000);

        // White should only have decremented 2 seconds (2000ms)
        expect(store.state.whiteTime).toBe(298000);
        // Black should have decremented 2 seconds (2000ms)
        expect(store.state.blackTime).toBe(298000);

        store.stop();
        dispose();
      });
    });
  });

  describe('stop', () => {
    it('sets isRunning to false', () => {
      createRoot((dispose) => {
        const store = createTimerStore();

        store.start(() => 'w', vi.fn());
        store.stop();

        expect(store.state.isRunning).toBe(false);

        dispose();
      });
    });

    it('stops timer from decrementing', () => {
      createRoot((dispose) => {
        const store = createTimerStore();
        store.reset(5);

        store.start(() => 'w', vi.fn());
        vi.advanceTimersByTime(2000);
        store.stop();

        const timeAfterStop = store.state.whiteTime;
        vi.advanceTimersByTime(5000);

        expect(store.state.whiteTime).toBe(timeAfterStop);

        dispose();
      });
    });

    it('is safe to call multiple times', () => {
      createRoot((dispose) => {
        const store = createTimerStore();

        store.stop();
        store.stop();

        expect(store.state.isRunning).toBe(false);

        dispose();
      });
    });
  });

  describe('dynamic turn changes', () => {
    it('switches which timer decrements based on currentTurn getter', () => {
      createRoot((dispose) => {
        const store = createTimerStore();
        store.reset(5);

        let currentTurn: 'w' | 'b' = 'w';
        store.start(() => currentTurn, vi.fn());

        // White's turn for 3 seconds
        vi.advanceTimersByTime(3000);
        expect(store.state.whiteTime).toBe(297000); // 297 seconds in ms
        expect(store.state.blackTime).toBe(300000);

        // Switch to black's turn
        currentTurn = 'b';
        vi.advanceTimersByTime(2000);

        expect(store.state.whiteTime).toBe(297000);
        expect(store.state.blackTime).toBe(298000); // 298 seconds in ms

        store.stop();
        dispose();
      });
    });
  });

  describe('multiple stores', () => {
    it('creates independent store instances', () => {
      createRoot((dispose) => {
        const store1 = createTimerStore();
        const store2 = createTimerStore();

        store1.reset(10);

        expect(store1.state.timeControl).toBe(10);
        expect(store2.state.timeControl).toBe(5);

        dispose();
      });
    });
  });
});
