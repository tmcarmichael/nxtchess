import { GameSession } from './GameSession';
import type {
  GameSessionConfig,
  GameSessionSnapshot,
  GameCommand,
  CommandResult,
  SessionEvent,
  SessionEventHandler,
  SessionEventType,
} from './types';

export { GameSession };

// ============================================================================
// SessionManager Class
// ============================================================================

export class SessionManager {
  private sessions: Map<string, GameSession> = new Map();
  private activeSessionId: string | null = null;
  private eventHandlers: Set<SessionEventHandler> = new Set();

  // ============================================================================
  // Session Lifecycle Methods
  // ============================================================================

  createSession(config: GameSessionConfig): GameSession {
    // Clean up existing session with same ID if present
    if (this.sessions.has(config.sessionId)) {
      this.destroySession(config.sessionId);
    }

    const session = new GameSession(config);
    this.sessions.set(config.sessionId, session);

    this.emitEvent({
      sessionId: config.sessionId,
      type: 'session:created',
      data: { config },
      timestamp: Date.now(),
    });

    return session;
  }

  restoreSession(snapshot: GameSessionSnapshot): GameSession {
    const session = GameSession.fromSnapshot(snapshot);
    this.sessions.set(session.sessionId, session);

    this.emitEvent({
      sessionId: session.sessionId,
      type: 'session:created',
      data: { restored: true, config: snapshot.config },
      timestamp: Date.now(),
    });

    return session;
  }

  getSession(sessionId: string): GameSession | undefined {
    return this.sessions.get(sessionId);
  }

  destroySession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    this.sessions.delete(sessionId);

    if (this.activeSessionId === sessionId) {
      this.activeSessionId = null;
    }

    this.emitEvent({
      sessionId,
      type: 'session:destroyed',
      timestamp: Date.now(),
    });

    return true;
  }

  destroyAllSessions(): void {
    const sessionIds = Array.from(this.sessions.keys());
    for (const sessionId of sessionIds) {
      this.destroySession(sessionId);
    }
  }

  // ============================================================================
  // Active Session Management
  // ============================================================================

  setActiveSession(sessionId: string | null): boolean {
    if (sessionId === null) {
      this.activeSessionId = null;
      return true;
    }

    if (!this.sessions.has(sessionId)) {
      console.warn(`SessionManager: Cannot set active session - session ${sessionId} not found`);
      return false;
    }

    this.activeSessionId = sessionId;

    this.emitEvent({
      sessionId,
      type: 'session:activated',
      timestamp: Date.now(),
    });

    return true;
  }

  getActiveSession(): GameSession | null {
    if (!this.activeSessionId) return null;
    return this.sessions.get(this.activeSessionId) ?? null;
  }

  getActiveSessionId(): string | null {
    return this.activeSessionId;
  }

  // ============================================================================
  // Command Execution
  // ============================================================================

  applyCommand(sessionId: string, command: GameCommand): CommandResult {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return {
        success: false,
        error: `Session ${sessionId} not found`,
      };
    }

    const result = session.applyCommand(command);

    if (result.success) {
      this.emitEvent({
        sessionId,
        type: this.getEventTypeForCommand(command),
        data: { command, newState: result.newState },
        timestamp: Date.now(),
      });
    }

    return result;
  }

  applyCommandToActive(command: GameCommand): CommandResult {
    if (!this.activeSessionId) {
      return {
        success: false,
        error: 'No active session',
      };
    }

    return this.applyCommand(this.activeSessionId, command);
  }

  // ============================================================================
  // Event System
  // ============================================================================

  onEvent(handler: SessionEventHandler): () => void {
    this.eventHandlers.add(handler);
    return () => {
      this.eventHandlers.delete(handler);
    };
  }

  private emitEvent(event: SessionEvent): void {
    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (err) {
        console.error('SessionManager: Event handler error:', err);
      }
    }
  }

  private getEventTypeForCommand(command: GameCommand): SessionEventType {
    switch (command.type) {
      case 'APPLY_MOVE':
        return 'game:move';
      case 'END_GAME':
      case 'RESIGN':
      case 'TIMEOUT':
        return 'game:ended';
      default:
        return 'session:updated';
    }
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  getAllSessions(): GameSession[] {
    return Array.from(this.sessions.values());
  }

  getSessionCount(): number {
    return this.sessions.size;
  }

  hasSession(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  getSessionSnapshot(sessionId: string): GameSessionSnapshot | null {
    const session = this.sessions.get(sessionId);
    return session?.createSnapshot() ?? null;
  }

  getAllSnapshots(): GameSessionSnapshot[] {
    return this.getAllSessions().map((session) => session.createSnapshot());
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const sessionManager = new SessionManager();
