const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function createFocusTrap() {
  let container: HTMLElement | null = null;
  let previouslyFocused: HTMLElement | null = null;
  let listener: ((e: KeyboardEvent) => void) | null = null;

  function getFocusableElements(): HTMLElement[] {
    if (!container) return [];
    return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;

    const focusable = getFocusableElements();
    if (focusable.length === 0) {
      e.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function activate(el: HTMLElement) {
    container = el;
    previouslyFocused = document.activeElement as HTMLElement | null;
    listener = handleKeyDown;
    document.addEventListener('keydown', listener);

    const focusable = getFocusableElements();
    if (focusable.length > 0) {
      focusable[0].focus();
    }
  }

  function deactivate() {
    if (listener) {
      document.removeEventListener('keydown', listener);
      listener = null;
    }
    if (previouslyFocused && previouslyFocused instanceof HTMLElement) {
      previouslyFocused.focus();
    }
    container = null;
    previouslyFocused = null;
  }

  return { activate, deactivate };
}
