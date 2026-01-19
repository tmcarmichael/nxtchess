import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ReconnectingWebSocket, type ConnectionState } from './ReconnectingWebSocket';

// Mock WebSocket
class MockWebSocket {
  static instances: MockWebSocket[] = [];
  url: string;
  onopen: (() => void) | null = null;
  onclose: ((event: { wasClean: boolean }) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  readyState = 0; // CONNECTING

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  send = vi.fn();
  close = vi.fn();

  // Test helpers
  simulateOpen() {
    this.readyState = 1; // OPEN
    this.onopen?.();
  }

  simulateClose(wasClean = true) {
    this.readyState = 3; // CLOSED
    this.onclose?.({ wasClean });
  }

  simulateError() {
    this.onerror?.(new Event('error'));
  }

  simulateMessage(data: unknown) {
    this.onmessage?.({ data: JSON.stringify(data) });
  }
}

// Replace global WebSocket with mock
const originalWebSocket = globalThis.WebSocket;

describe('ReconnectingWebSocket', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    MockWebSocket.instances = [];
    globalThis.WebSocket = MockWebSocket as unknown as typeof WebSocket;
  });

  afterEach(() => {
    vi.useRealTimers();
    globalThis.WebSocket = originalWebSocket;
  });

  describe('initialization', () => {
    it('starts in disconnected state', () => {
      const ws = new ReconnectingWebSocket('ws://localhost:8080');
      expect(ws.getState()).toBe('disconnected');
    });

    it('stores the URL', () => {
      const ws = new ReconnectingWebSocket('ws://localhost:8080');
      expect(ws.getUrl()).toBe('ws://localhost:8080');
    });

    it('allows updating the URL', () => {
      const ws = new ReconnectingWebSocket('ws://localhost:8080');
      ws.setUrl('ws://localhost:9090');
      expect(ws.getUrl()).toBe('ws://localhost:9090');
    });
  });

  describe('connect', () => {
    it('transitions to connecting state', () => {
      const ws = new ReconnectingWebSocket('ws://localhost:8080');
      ws.connect();
      expect(ws.getState()).toBe('connecting');
    });

    it('creates a WebSocket with the correct URL', () => {
      const ws = new ReconnectingWebSocket('ws://localhost:8080');
      ws.connect();
      expect(MockWebSocket.instances).toHaveLength(1);
      expect(MockWebSocket.instances[0].url).toBe('ws://localhost:8080');
    });

    it('transitions to connected on open', () => {
      const ws = new ReconnectingWebSocket('ws://localhost:8080');
      ws.connect();
      MockWebSocket.instances[0].simulateOpen();
      expect(ws.getState()).toBe('connected');
    });

    it('does nothing if already connected', () => {
      const ws = new ReconnectingWebSocket('ws://localhost:8080');
      ws.connect();
      MockWebSocket.instances[0].simulateOpen();
      ws.connect();
      expect(MockWebSocket.instances).toHaveLength(1);
    });

    it('does nothing if already connecting', () => {
      const ws = new ReconnectingWebSocket('ws://localhost:8080');
      ws.connect();
      ws.connect();
      expect(MockWebSocket.instances).toHaveLength(1);
    });

    it('does not connect without a URL', () => {
      const ws = new ReconnectingWebSocket('');
      ws.connect();
      expect(ws.getState()).toBe('disconnected');
      expect(MockWebSocket.instances).toHaveLength(0);
    });
  });

  describe('disconnect', () => {
    it('closes the WebSocket', () => {
      const ws = new ReconnectingWebSocket('ws://localhost:8080');
      ws.connect();
      MockWebSocket.instances[0].simulateOpen();
      ws.disconnect();
      expect(MockWebSocket.instances[0].close).toHaveBeenCalled();
    });

    it('transitions to disconnected state', () => {
      const ws = new ReconnectingWebSocket('ws://localhost:8080');
      ws.connect();
      MockWebSocket.instances[0].simulateOpen();
      ws.disconnect();
      expect(ws.getState()).toBe('disconnected');
    });

    it('resets attempt count', () => {
      const ws = new ReconnectingWebSocket('ws://localhost:8080', { maxAttempts: 5 });
      ws.connect();
      MockWebSocket.instances[0].simulateClose(false);
      vi.advanceTimersByTime(1000);
      expect(ws.getAttemptCount()).toBe(1);
      ws.disconnect();
      expect(ws.getAttemptCount()).toBe(0);
    });

    it('cancels pending reconnection', () => {
      const ws = new ReconnectingWebSocket('ws://localhost:8080');
      ws.connect();
      MockWebSocket.instances[0].simulateClose(false);
      expect(ws.getState()).toBe('reconnecting');
      ws.disconnect();
      expect(ws.getState()).toBe('disconnected');
      vi.advanceTimersByTime(10000);
      expect(MockWebSocket.instances).toHaveLength(1);
    });
  });

  describe('send', () => {
    it('returns true when connected', () => {
      const ws = new ReconnectingWebSocket('ws://localhost:8080');
      ws.connect();
      MockWebSocket.instances[0].simulateOpen();
      const result = ws.send({ type: 'test' });
      expect(result).toBe(true);
      expect(MockWebSocket.instances[0].send).toHaveBeenCalledWith('{"type":"test"}');
    });

    it('returns false when not connected', () => {
      const ws = new ReconnectingWebSocket('ws://localhost:8080');
      const result = ws.send({ type: 'test' });
      expect(result).toBe(false);
    });

    it('returns false when connecting', () => {
      const ws = new ReconnectingWebSocket('ws://localhost:8080');
      ws.connect();
      const result = ws.send({ type: 'test' });
      expect(result).toBe(false);
    });

    it('sends string data directly', () => {
      const ws = new ReconnectingWebSocket('ws://localhost:8080');
      ws.connect();
      MockWebSocket.instances[0].simulateOpen();
      ws.send('raw string');
      expect(MockWebSocket.instances[0].send).toHaveBeenCalledWith('raw string');
    });
  });

  describe('callbacks', () => {
    it('calls onStateChange on state transitions', () => {
      const stateChanges: { state: ConnectionState; previous: ConnectionState }[] = [];
      const ws = new ReconnectingWebSocket('ws://localhost:8080');
      ws.setCallbacks({
        onStateChange: (state, previous) => stateChanges.push({ state, previous }),
      });

      ws.connect();
      expect(stateChanges).toEqual([{ state: 'connecting', previous: 'disconnected' }]);

      MockWebSocket.instances[0].simulateOpen();
      expect(stateChanges).toEqual([
        { state: 'connecting', previous: 'disconnected' },
        { state: 'connected', previous: 'connecting' },
      ]);
    });

    it('calls onMessage with parsed JSON data', () => {
      const messages: unknown[] = [];
      const ws = new ReconnectingWebSocket('ws://localhost:8080');
      ws.setCallbacks({
        onMessage: (data) => messages.push(data),
      });

      ws.connect();
      MockWebSocket.instances[0].simulateOpen();
      MockWebSocket.instances[0].simulateMessage({ type: 'test', value: 42 });

      expect(messages).toEqual([{ type: 'test', value: 42 }]);
    });

    it('calls onError on WebSocket error', () => {
      const errors: Event[] = [];
      const ws = new ReconnectingWebSocket('ws://localhost:8080');
      ws.setCallbacks({
        onError: (error) => errors.push(error),
      });

      ws.connect();
      MockWebSocket.instances[0].simulateError();

      expect(errors).toHaveLength(1);
    });
  });

  describe('reconnection', () => {
    it('attempts reconnection on abnormal close', () => {
      const ws = new ReconnectingWebSocket('ws://localhost:8080');
      ws.connect();
      MockWebSocket.instances[0].simulateOpen();
      MockWebSocket.instances[0].simulateClose(false);

      expect(ws.getState()).toBe('reconnecting');
    });

    it('does not reconnect on clean close', () => {
      const ws = new ReconnectingWebSocket('ws://localhost:8080');
      ws.connect();
      MockWebSocket.instances[0].simulateOpen();
      MockWebSocket.instances[0].simulateClose(true);

      expect(ws.getState()).toBe('disconnected');
    });

    it('reconnects after delay', () => {
      const ws = new ReconnectingWebSocket('ws://localhost:8080', { baseDelayMs: 1000 });
      ws.connect();
      MockWebSocket.instances[0].simulateOpen();
      MockWebSocket.instances[0].simulateClose(false);

      expect(MockWebSocket.instances).toHaveLength(1);

      vi.advanceTimersByTime(1000);

      expect(MockWebSocket.instances).toHaveLength(2);
      expect(ws.getState()).toBe('connecting');
    });

    it('uses exponential backoff', () => {
      const ws = new ReconnectingWebSocket('ws://localhost:8080', {
        baseDelayMs: 1000,
        backoffMultiplier: 2,
        maxAttempts: 5,
      });

      ws.connect();
      MockWebSocket.instances[0].simulateClose(false);

      // First attempt after 1000ms
      vi.advanceTimersByTime(999);
      expect(MockWebSocket.instances).toHaveLength(1);
      vi.advanceTimersByTime(1);
      expect(MockWebSocket.instances).toHaveLength(2);

      MockWebSocket.instances[1].simulateClose(false);

      // Second attempt after 2000ms (1000 * 2^1)
      vi.advanceTimersByTime(1999);
      expect(MockWebSocket.instances).toHaveLength(2);
      vi.advanceTimersByTime(1);
      expect(MockWebSocket.instances).toHaveLength(3);

      MockWebSocket.instances[2].simulateClose(false);

      // Third attempt after 4000ms (1000 * 2^2)
      vi.advanceTimersByTime(3999);
      expect(MockWebSocket.instances).toHaveLength(3);
      vi.advanceTimersByTime(1);
      expect(MockWebSocket.instances).toHaveLength(4);
    });

    it('respects maxDelayMs', () => {
      const ws = new ReconnectingWebSocket('ws://localhost:8080', {
        baseDelayMs: 1000,
        backoffMultiplier: 10,
        maxDelayMs: 5000,
        maxAttempts: 10,
      });

      ws.connect();
      MockWebSocket.instances[0].simulateClose(false);

      // First attempt after 1000ms
      vi.advanceTimersByTime(1000);
      expect(MockWebSocket.instances).toHaveLength(2);

      MockWebSocket.instances[1].simulateClose(false);

      // Second would be 10000ms but capped at 5000ms
      vi.advanceTimersByTime(5000);
      expect(MockWebSocket.instances).toHaveLength(3);
    });

    it('stops after maxAttempts', () => {
      const ws = new ReconnectingWebSocket('ws://localhost:8080', {
        baseDelayMs: 100,
        maxAttempts: 3,
      });

      ws.connect();

      // Fail 3 times
      for (let i = 0; i < 3; i++) {
        MockWebSocket.instances[i].simulateClose(false);
        vi.advanceTimersByTime(100 * Math.pow(2, i));
      }

      expect(MockWebSocket.instances).toHaveLength(4);
      MockWebSocket.instances[3].simulateClose(false);

      // Should not attempt 4th reconnection
      vi.advanceTimersByTime(10000);
      expect(MockWebSocket.instances).toHaveLength(4);
      expect(ws.getState()).toBe('disconnected');
    });

    it('resets attempt count on successful connection', () => {
      const ws = new ReconnectingWebSocket('ws://localhost:8080', {
        baseDelayMs: 100,
        maxAttempts: 5,
      });

      ws.connect();
      MockWebSocket.instances[0].simulateClose(false);
      vi.advanceTimersByTime(100);
      MockWebSocket.instances[1].simulateClose(false);
      vi.advanceTimersByTime(200);

      expect(ws.getAttemptCount()).toBe(2);

      MockWebSocket.instances[2].simulateOpen();
      expect(ws.getAttemptCount()).toBe(0);
    });
  });

  describe('isConnected', () => {
    it('returns true when connected', () => {
      const ws = new ReconnectingWebSocket('ws://localhost:8080');
      ws.connect();
      MockWebSocket.instances[0].simulateOpen();
      expect(ws.isConnected()).toBe(true);
    });

    it('returns false when not connected', () => {
      const ws = new ReconnectingWebSocket('ws://localhost:8080');
      expect(ws.isConnected()).toBe(false);
    });

    it('returns false when connecting', () => {
      const ws = new ReconnectingWebSocket('ws://localhost:8080');
      ws.connect();
      expect(ws.isConnected()).toBe(false);
    });

    it('returns false when reconnecting', () => {
      const ws = new ReconnectingWebSocket('ws://localhost:8080');
      ws.connect();
      MockWebSocket.instances[0].simulateOpen();
      MockWebSocket.instances[0].simulateClose(false);
      expect(ws.isConnected()).toBe(false);
    });
  });
});
