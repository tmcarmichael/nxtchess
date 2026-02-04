import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createFocusTrap } from './createFocusTrap';

describe('createFocusTrap', () => {
  let container: HTMLDivElement;
  let outsideButton: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = `
      <button id="btn1">First</button>
      <input id="input1" type="text" />
      <button id="btn2">Last</button>
    `;
    document.body.appendChild(container);

    outsideButton = document.createElement('button');
    outsideButton.id = 'outside';
    document.body.appendChild(outsideButton);
    outsideButton.focus();
  });

  afterEach(() => {
    document.body.removeChild(container);
    document.body.removeChild(outsideButton);
  });

  it('focuses first focusable element on activate', () => {
    const trap = createFocusTrap();
    trap.activate(container);
    expect(document.activeElement?.id).toBe('btn1');
    trap.deactivate();
  });

  it('wraps Tab from last to first element', () => {
    const trap = createFocusTrap();
    trap.activate(container);

    // Focus last element
    const lastBtn = container.querySelector<HTMLElement>('#btn2')!;
    lastBtn.focus();
    expect(document.activeElement?.id).toBe('btn2');

    // Simulate Tab
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    let defaultPrevented = false;
    Object.defineProperty(event, 'preventDefault', {
      value: () => {
        defaultPrevented = true;
      },
    });
    document.dispatchEvent(event);

    expect(defaultPrevented).toBe(true);
    expect(document.activeElement?.id).toBe('btn1');

    trap.deactivate();
  });

  it('wraps Shift+Tab from first to last element', () => {
    const trap = createFocusTrap();
    trap.activate(container);

    // First element is already focused
    expect(document.activeElement?.id).toBe('btn1');

    // Simulate Shift+Tab
    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
    });
    let defaultPrevented = false;
    Object.defineProperty(event, 'preventDefault', {
      value: () => {
        defaultPrevented = true;
      },
    });
    document.dispatchEvent(event);

    expect(defaultPrevented).toBe(true);
    expect(document.activeElement?.id).toBe('btn2');

    trap.deactivate();
  });

  it('restores focus on deactivate', () => {
    outsideButton.focus();
    expect(document.activeElement?.id).toBe('outside');

    const trap = createFocusTrap();
    trap.activate(container);
    expect(document.activeElement?.id).toBe('btn1');

    trap.deactivate();
    expect(document.activeElement?.id).toBe('outside');
  });

  it('handles empty container', () => {
    const emptyDiv = document.createElement('div');
    document.body.appendChild(emptyDiv);

    const trap = createFocusTrap();
    trap.activate(emptyDiv);

    // Tab should be prevented with no focusable elements
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    let defaultPrevented = false;
    Object.defineProperty(event, 'preventDefault', {
      value: () => {
        defaultPrevented = true;
      },
    });
    document.dispatchEvent(event);
    expect(defaultPrevented).toBe(true);

    trap.deactivate();
    document.body.removeChild(emptyDiv);
  });

  it('removes keydown listener on deactivate', () => {
    const trap = createFocusTrap();
    trap.activate(container);

    const lastBtn = container.querySelector<HTMLElement>('#btn2')!;
    lastBtn.focus();

    trap.deactivate();

    // Tab should no longer wrap
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    let defaultPrevented = false;
    Object.defineProperty(event, 'preventDefault', {
      value: () => {
        defaultPrevented = true;
      },
    });
    document.dispatchEvent(event);
    expect(defaultPrevented).toBe(false);
  });
});
