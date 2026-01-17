import { onMount, onCleanup, Accessor } from 'solid-js';

interface KeyboardNavigationOptions {
  /** Called when left arrow is pressed */
  onPrevious: () => void;
  /** Called when right arrow is pressed */
  onNext: () => void;
  /** Called when 'f' key is pressed */
  onFlip: () => void;
  /** Whether keyboard navigation is enabled (accessor for reactivity) */
  enabled?: Accessor<boolean>;
}

/**
 * Hook for keyboard navigation in chess game.
 * Handles ArrowLeft (previous move), ArrowRight (next move), and 'f' (flip board).
 */
export const useKeyboardNavigation = (options: KeyboardNavigationOptions): void => {
  const { onPrevious, onNext, onFlip, enabled = () => true } = options;

  onMount(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!enabled()) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onPrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNext();
      } else if (e.key === 'f') {
        onFlip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    onCleanup(() => {
      window.removeEventListener('keydown', handleKeyDown);
    });
  });
};
