import { createRoot } from 'solid-js';
import { describe, it, expect } from 'vitest';
import { createUIStore } from './createUIStore';

describe('createUIStore', () => {
  describe('initial state', () => {
    it('has correct default values', () => {
      createRoot((dispose) => {
        const store = createUIStore();

        expect(store.state.boardView).toBe('w');
        expect(store.state.showEndModal).toBe(false);
        expect(store.state.showResignModal).toBe(false);

        dispose();
      });
    });
  });

  describe('flipBoard', () => {
    it('toggles board view from white to black', () => {
      createRoot((dispose) => {
        const store = createUIStore();

        store.flipBoard();

        expect(store.state.boardView).toBe('b');

        dispose();
      });
    });

    it('toggles board view from black to white', () => {
      createRoot((dispose) => {
        const store = createUIStore();

        store.flipBoard(); // w -> b
        store.flipBoard(); // b -> w

        expect(store.state.boardView).toBe('w');

        dispose();
      });
    });
  });

  describe('setBoardView', () => {
    it('sets board view to white', () => {
      createRoot((dispose) => {
        const store = createUIStore();

        store.setBoardView('w');

        expect(store.state.boardView).toBe('w');

        dispose();
      });
    });

    it('sets board view to black', () => {
      createRoot((dispose) => {
        const store = createUIStore();

        store.setBoardView('b');

        expect(store.state.boardView).toBe('b');

        dispose();
      });
    });
  });

  describe('end modal', () => {
    it('showEndModal sets showEndModal to true', () => {
      createRoot((dispose) => {
        const store = createUIStore();

        store.showEndModal();

        expect(store.state.showEndModal).toBe(true);

        dispose();
      });
    });

    it('hideEndModal sets showEndModal to false', () => {
      createRoot((dispose) => {
        const store = createUIStore();

        store.showEndModal();
        store.hideEndModal();

        expect(store.state.showEndModal).toBe(false);

        dispose();
      });
    });
  });

  describe('resign modal', () => {
    it('showResignModal sets showResignModal to true', () => {
      createRoot((dispose) => {
        const store = createUIStore();

        store.showResignModal();

        expect(store.state.showResignModal).toBe(true);

        dispose();
      });
    });

    it('hideResignModal sets showResignModal to false', () => {
      createRoot((dispose) => {
        const store = createUIStore();

        store.showResignModal();
        store.hideResignModal();

        expect(store.state.showResignModal).toBe(false);

        dispose();
      });
    });
  });

  describe('multiple stores', () => {
    it('creates independent store instances', () => {
      createRoot((dispose) => {
        const store1 = createUIStore();
        const store2 = createUIStore();

        store1.flipBoard();

        expect(store1.state.boardView).toBe('b');
        expect(store2.state.boardView).toBe('w');

        dispose();
      });
    });
  });
});
