# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NXT Chess is a real-time multiplayer chess platform with AI training modes. Features include WebSocket-based multiplayer with shareable game links, timed games with clocks, and training mode with Stockfish evaluation.

## Development Commands

### Quick Start (Full Stack)
```bash
just dev                    # Build + run frontend, backend, db, redis
```
Frontend: http://localhost:5173 | Backend: http://localhost:8080

### Selective Startup
```bash
just up PROFILES=backend    # Backend + db + redis only
just up PROFILES=frontend   # Frontend only
```

### Frontend Commands (run from apps/frontend/)
```bash
yarn dev           # Vite dev server
yarn build         # TypeScript + Vite production build
yarn type:check    # Type checking only
yarn format        # Prettier formatting
yarn format:check  # Verify formatting (runs in prebuild)
```

### Useful Just Commands
```bash
just logs PROFILES=backend  # Follow logs
just exec-db                # psql into PostgreSQL
just exec-redis             # redis-cli
just clean PROFILES=full    # Remove containers + volumes
```

## Architecture

### Tech Stack
- **Frontend**: SolidJS + TypeScript + Vite + CSS Modules
- **Backend**: Go (Chi router) + PostgreSQL + Redis
- **Chess**: chess.js (validation) + stockfish.js (browser-side AI/eval)

### Frontend Structure (apps/frontend/src/)
```
components/
├── chess/       # Reusable chess UI (ChessBoard, ChessBoardController, ChessPiece, etc.)
├── game/        # Game layout components (GameContainer, GameInfoPanel, ButtonPanel)
├── play/        # Multiplayer mode (PlayContainer, PlayModal, PlayControlPanel)
├── training/    # Training mode (TrainingContainer, TrainingModal, TrainingControlPanel)
├── home/        # Landing page
├── user/        # Auth & profile (UserSignInModal, UserProfile, UsernameSetup)
└── common/      # Header, footer, 404, ErrorBoundary

store/
├── game/        # GameContext + gameStore (chess.js wrapper, timers, move history)
└── user/        # UserContext + userStore (auth state, profile)

services/
├── engine/      # Stockfish AI & evaluation
│   ├── aiEngineWorker.ts       # AI move computation (Web Worker)
│   ├── evalEngineWorker.ts     # Position evaluation (Web Worker)
│   ├── EnginePool.ts           # Multi-engine management
│   └── ResilientEngine.ts      # Auto-recovery wrapper
├── game/        # Game logic layer
│   ├── chessGameService.ts     # Rule enforcement
│   ├── gameLifecycle.ts        # State transitions
│   └── session/                # GameSession + SessionManager
├── sync/        # WebSocket multiplayer (GameSyncService, useGameSync)
├── persistence/ # LocalStorage session recovery (GamePersistence, useAutoPersist)
└── preferences/ # User settings storage

shared/
├── config/      # Constants, environment variables
├── hooks/       # useKeyboardNavigation
└── utils/       # Debug, ID generation, string utils

types/           # Shared TypeScript types (chess.ts, game.ts)
```

### Backend Structure (apps/backend/)
```
cmd/server/main.go                    # Entry point, route registration
internal/
├── auth/          # OAuth 2.0 (Google, Discord, GitHub)
├── chess/         # Server-side move validation (wraps notnil/chess)
├── config/        # Environment config loader
├── controllers/   # HTTP handlers (profile, auth)
├── database/      # Direct SQL queries (no ORM)
├── httpx/         # JSON response helpers, secure cookies
├── logger/        # Structured logging with levels
├── middleware/    # CORS, recovery, security headers, session, rate limit
├── models/        # Data structures (Profile, Game)
├── sessions/      # Redis session store
├── validation/    # Input validation (username rules, etc.)
├── ws/            # WebSocket hub, client, game management
└── utils/         # Random strings, auth redirects
```

### Key Patterns

**Controller/Presenter Pattern**: `ChessBoardController` handles all game logic (move validation, drag/drop, AI triggers). `ChessBoard` is purely presentational—receives callbacks and renders squares.

**Web Workers for Engines**: AI and eval run in separate workers to prevent UI blocking and UCI race conditions. EnginePool manages multiple engines for concurrent games.

**Session Layer**: `GameSession` represents a single game, `SessionManager` manages multiple concurrent sessions. Enables multiplayer without global state conflicts.

**WebSocket Multiplayer**: `GameSyncService` handles real-time game sync with server-side move validation. Games are joinable via `/play/:gameId` URL.

**SolidJS Patterns**:
- `createStore()` for complex state with derived properties
- `createSignal()` for simple local component state
- Context + Provider for global state
- `batch()` for atomic state updates
- `splitProps()` to separate reactive/static props

**Backend Patterns**:
- Structured logging with `logger.Info/Error()` and `logger.F()` for fields
- Rate limiting with token bucket (Auth: 10/min, API: 60/min, Strict: 5/min)
- Server-side move validation using notnil/chess
- Cookie-based sessions stored in Redis (24h TTL)

**Key Types**:
- `Side = 'w' | 'b'` (white/black)
- `GameMode = 'play' | 'training' | 'analysis'`
- `OpponentType = 'ai' | 'human'`
- `AIPlayStyle = 'aggressive' | 'defensive' | 'balanced' | 'random' | 'positional'`

### Data Flow

**Single-player (vs AI)**:
1. User configures game via PlayModal/TrainingModal
2. GameStore manages chess.js state + UI state
3. Stockfish in Web Worker computes AI moves
4. Separate eval worker provides position evaluation

**Multiplayer**:
1. Creator: `GAME_CREATE` via WebSocket → receives `gameId`
2. Joiner: Navigate to `/play/:gameId` → `GAME_JOIN` → both receive `GAME_STARTED`
3. Moves validated server-side, broadcast to both players
4. Clock managed server-side with 100ms precision

## Environment Setup

**Frontend** (apps/frontend/.env):
```
VITE_BACKEND_URL=http://localhost:8080
```

**Backend** (apps/backend/.env): Copy from .env.example, add OAuth credentials for sign-in functionality.

## Git Conventions

Commit prefixes: `feat:`, `fix:`, `chore:`, `refactor:`, `style:`

Example: `feat: training mode select either side`
