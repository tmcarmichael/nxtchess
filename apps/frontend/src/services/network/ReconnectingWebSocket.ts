import { DEBUG } from '../../shared/utils/debug';

export interface ReconnectConfig {
  /** Maximum number of reconnection attempts before giving up */
  maxAttempts: number;
  /** Base delay between reconnection attempts in milliseconds */
  baseDelayMs: number;
  /** Maximum delay between reconnection attempts in milliseconds */
  maxDelayMs: number;
  /** Multiplier for exponential backoff */
  backoffMultiplier: number;
}

const DEFAULT_CONFIG: ReconnectConfig = {
  maxAttempts: 5,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
};

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

export interface ReconnectingWebSocketCallbacks {
  onStateChange?: (state: ConnectionState, previousState: ConnectionState) => void;
  onMessage?: (data: unknown) => void;
  onError?: (error: Event) => void;
}

export class ReconnectingWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private config: ReconnectConfig;
  private state: ConnectionState = 'disconnected';
  private attemptCount = 0;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private callbacks: ReconnectingWebSocketCallbacks = {};

  constructor(url: string, config: Partial<ReconnectConfig> = {}) {
    this.url = url;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Set the WebSocket URL. Useful when URL is determined after construction.
   */
  setUrl(url: string): void {
    this.url = url;
  }

  /**
   * Get the current WebSocket URL.
   */
  getUrl(): string {
    return this.url;
  }

  /**
   * Register event callbacks.
   */
  setCallbacks(callbacks: ReconnectingWebSocketCallbacks): void {
    this.callbacks = callbacks;
  }

  /**
   * Initiate a connection to the WebSocket server.
   * If already connected or connecting, this is a no-op.
   */
  connect(): void {
    if (this.state === 'connected' || this.state === 'connecting') {
      return;
    }

    if (!this.url) {
      if (DEBUG) console.error('ReconnectingWebSocket: No URL configured');
      return;
    }

    this.setState('connecting');

    try {
      this.ws = new WebSocket(this.url);
      this.ws.onopen = () => this.handleOpen();
      this.ws.onclose = (event) => this.handleClose(event);
      this.ws.onerror = (event) => this.handleError(event);
      this.ws.onmessage = (event) => this.handleMessage(event);
    } catch (err) {
      if (DEBUG) console.error('ReconnectingWebSocket: Failed to create WebSocket:', err);
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect from the WebSocket server and stop reconnection attempts.
   */
  disconnect(): void {
    this.clearReconnectTimeout();
    this.attemptCount = 0;

    if (this.ws) {
      // Remove handlers to prevent reconnection on clean close
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      this.ws.onopen = null;
      this.ws.close();
      this.ws = null;
    }

    this.setState('disconnected');
  }

  /**
   * Send data through the WebSocket connection.
   * @returns true if the message was sent, false if not connected
   */
  send(data: unknown): boolean {
    if (this.state !== 'connected' || !this.ws) {
      return false;
    }

    try {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      this.ws.send(message);
      return true;
    } catch (err) {
      if (DEBUG) console.error('ReconnectingWebSocket: Failed to send message:', err);
      return false;
    }
  }

  /**
   * Get the current connection state.
   */
  getState(): ConnectionState {
    return this.state;
  }

  /**
   * Check if the WebSocket is currently connected.
   */
  isConnected(): boolean {
    return this.state === 'connected';
  }

  /**
   * Get the current reconnection attempt count.
   */
  getAttemptCount(): number {
    return this.attemptCount;
  }

  /**
   * Reset the reconnection attempt counter.
   * Useful when manually triggering a reconnection.
   */
  resetAttemptCount(): void {
    this.attemptCount = 0;
  }

  private handleOpen(): void {
    this.attemptCount = 0;
    this.setState('connected');
  }

  private handleClose(event: CloseEvent): void {
    this.ws = null;

    if (event.wasClean) {
      // Clean close - don't reconnect
      this.setState('disconnected');
    } else {
      // Abnormal close - attempt reconnection
      this.scheduleReconnect();
    }
  }

  private handleError(event: Event): void {
    if (DEBUG) console.error('ReconnectingWebSocket: WebSocket error:', event);
    this.callbacks.onError?.(event);
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      this.callbacks.onMessage?.(data);
    } catch {
      // If not valid JSON, pass raw data
      this.callbacks.onMessage?.(event.data);
    }
  }

  private scheduleReconnect(): void {
    if (this.attemptCount >= this.config.maxAttempts) {
      if (DEBUG) {
        console.warn(
          `ReconnectingWebSocket: Max reconnection attempts (${this.config.maxAttempts}) reached`
        );
      }
      this.setState('disconnected');
      return;
    }

    this.setState('reconnecting');
    this.attemptCount++;

    const delay = this.calculateBackoffDelay();
    if (DEBUG) {
      console.warn(
        `ReconnectingWebSocket: Reconnecting in ${delay}ms (attempt ${this.attemptCount}/${this.config.maxAttempts})`
      );
    }

    this.reconnectTimeout = setTimeout(() => {
      if (this.state === 'reconnecting') {
        this.connect();
      }
    }, delay);
  }

  private calculateBackoffDelay(): number {
    const exponentialDelay =
      this.config.baseDelayMs * Math.pow(this.config.backoffMultiplier, this.attemptCount - 1);
    return Math.min(exponentialDelay, this.config.maxDelayMs);
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private setState(newState: ConnectionState): void {
    const previousState = this.state;
    if (previousState === newState) {
      return;
    }

    this.state = newState;
    this.callbacks.onStateChange?.(newState, previousState);
  }
}
