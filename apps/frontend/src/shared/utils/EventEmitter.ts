/**
 * Type-safe event emitter for decoupled communication between stores.
 */

import { DEBUG } from './debug';

type EventHandler<T> = (data: T) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class TypedEventEmitter<Events extends Record<string, any>> {
  private listeners: Map<keyof Events, Set<EventHandler<unknown>>> = new Map();

  /**
   * Subscribe to an event.
   * @returns Unsubscribe function
   */
  on<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler as EventHandler<unknown>);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(handler as EventHandler<unknown>);
    };
  }

  /**
   * Emit an event to all subscribers.
   */
  emit<K extends keyof Events>(event: K, data: Events[K]): void {
    this.listeners.get(event)?.forEach((handler) => {
      try {
        handler(data);
      } catch (err) {
        if (DEBUG) console.error(`Error in event handler for '${String(event)}':`, err);
      }
    });
  }

  /**
   * Remove all listeners for an event, or all events if no event specified.
   */
  off<K extends keyof Events>(event?: K): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Subscribe to an event for a single emission.
   */
  once<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): () => void {
    const unsubscribe = this.on(event, (data) => {
      unsubscribe();
      handler(data);
    });
    return unsubscribe;
  }
}
