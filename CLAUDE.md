# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NXT Chess is a **Progressive Web App (PWA)** for real-time multiplayer chess with AI training modes. Key features:

- WebSocket-based multiplayer with shareable game links (`/play/:gameId`)
- Timed games with server-managed clocks (100ms precision)
- Training mode with Stockfish evaluation and hints
- Offline-capable with IndexedDB persistence
- Adaptive Stockfish engine (multi-threaded 69MB or single-threaded 7MB based on device)

## App-Specific Documentation

For deeper details when working in a specific app:

- [Frontend CLAUDE.md](apps/frontend/CLAUDE.md) - Component hierarchy, stores, services, PWA config
- [Backend CLAUDE.md](apps/backend/CLAUDE.md) - Package structure, middleware, WebSocket protocol

## Development Commands

### Quick Start

```bash
just dev                    # Build + run all services (frontend, backend, db, redis)
```

Frontend: http://localhost:5173 | Backend: http://localhost:8080

### Selective Startup

```bash
just up PROFILES=backend    # Backend + db + redis only
just up PROFILES=frontend   # Frontend only
```

### Frontend Commands (from apps/frontend/)

```bash
yarn dev           # Vite dev server with HMR
yarn build         # TypeScript + Vite production build
yarn type:check    # Type checking only
yarn format        # Prettier formatting
```

### Useful Just Commands

```bash
just logs PROFILES=backend  # Follow logs
just exec-db                # psql into PostgreSQL
just exec-redis             # redis-cli
just clean PROFILES=full    # Remove containers + volumes
just prod-up                # Start production stack
```

## Architecture

### Tech Stack

- **Frontend**: SolidJS + TypeScript + Vite + CSS Modules + PWA (vite-plugin-pwa)
- **Backend**: Go (Chi router) + PostgreSQL + Redis + gorilla/websocket
- **Chess**: chess.js (browser validation) + stockfish.js (Web Worker AI/eval) + notnil/chess (server validation)
- **Infrastructure**: Docker Compose + Caddy (reverse proxy) + Nginx (static serving)

### Frontend Structure (apps/frontend/src/)

```
@types/              # External library types (stockfish-js.d.ts)

components/
├── chess/           # Chess UI: ChessBoard, ChessBoardController, ChessPiece, ChessClock, ChessEvalBar
├── game/            # Game layout: GameContainer, GameInfoPanel, ButtonPanel, GameStatusDisplay
├── play/            # Multiplayer: PlayContainer, PlayModal, PlayControlPanel
├── training/        # Training: TrainingContainer, TrainingModal, TrainingControlPanel
├── home/            # Landing page
├── user/            # Auth & profile: UserSignInModal, UserProfile, UsernameSetup
└── common/          # Header, Footer, 404, ErrorBoundary, NetworkStatus

store/
├── game/            # Multi-store architecture
│   ├── stores/      # Independent store factories (chess, timer, engine, ui, multiplayer)
│   ├── actions/     # Mode-specific actions (core, singlePlayer, training, multiplayer, play)
│   └── types.ts     # Store type definitions
└── user/            # UserContext + userStore (auth state, profile)

services/
├── audio/           # AudioService for move sounds and warnings
├── engine/          # Stockfish management
│   ├── StockfishEngine.ts    # Low-level UCI protocol wrapper
│   ├── ResilientEngine.ts    # Circuit breaker with auto-recovery
│   ├── EnginePool.ts         # Multi-engine allocation per (purpose, gameId)
│   ├── aiEngineWorker.ts     # AI move computation (Web Worker)
│   └── evalEngineWorker.ts   # Position evaluation (Web Worker)
├── game/            # Game logic
│   ├── chessGameService.ts   # Move validation, legal move computation
│   ├── gameLifecycle.ts      # State machine (idle → initializing → playing → ended)
│   ├── BoardCache.ts         # O(1) board lookups, caches legal moves
│   └── session/              # GameSession (command pattern) + SessionManager (singleton)
├── network/         # ReconnectingWebSocket with exponential backoff
├── sync/            # GameSyncService for multiplayer, useGameSync hook
├── persistence/     # IndexedDB: GamePersistence + useAutoPersist (5s periodic, 1s debounced)
└── preferences/     # User settings storage

shared/
├── config/          # Constants (time values, difficulty, play styles)
├── hooks/           # useKeyboardNavigation
└── utils/           # Debug, ID generation, strings, EventEmitter

types/               # chess.ts (Square, PieceType, Board), game.ts (Side, GameMode, etc.)
```

### Backend Structure (apps/backend/)

```
cmd/server/main.go           # Entry point, route registration, graceful shutdown

internal/
├── auth/            # OAuth 2.0: oauth.go (handlers), providers.go (Google, GitHub, Discord)
├── chess/           # Server-side validation wrapping notnil/chess
├── config/          # Environment config loader
├── controllers/     # HTTP handlers: auth.go, profile.go
├── database/        # PostgreSQL: connection pooling, direct SQL queries (no ORM)
├── httpx/           # JSON responses, secure cookies, client IP extraction
├── logger/          # Structured logging: levels (DEBUG/INFO/WARN/ERROR), JSON mode
├── middleware/      # CORS, recovery, security headers, session, rate limit, body limit, request ID
├── models/          # Data structures: Profile, PublicProfile, Game
├── sessions/        # Redis session store (24h TTL)
├── validation/      # Username validation rules
├── ws/              # WebSocket multiplayer
│   ├── handler.go   # Upgrade, connection limiting (5/IP, 200ms between)
│   ├── hub.go       # Client registry, message routing
│   ├── client.go    # Read/write pumps, per-client rate limiting
│   ├── game.go      # GameManager, GameState, clock management
│   └── message.go   # Message types and payloads
└── utils/           # Random strings, auth redirects
```

### Database Schema (db/)

```sql
profiles: user_id (PK), username (UNIQUE), rating, profile_icon, created_at
games: game_id (UUID PK), pgn, playerW_id, playerB_id, result, created_at
rating_history: id, user_id (FK), rating, created_at
```

## Key Patterns

### Controller/Presenter Pattern

`ChessBoardController` handles ALL game logic (move validation, drag/drop, AI triggers, animations). `ChessBoard` is purely presentational—receives callbacks and renders squares. Same pattern for `ChessPiece`, `ChessClock`, `ChessEvalBar`.

### Modular Multi-Store Architecture

Five independent stores compose via context:

```typescript
chess = createChessStore(); // FEN, move history, game state
timer = createTimerStore(); // Game clocks
engine = createEngineStore(); // Engine status, thinking state
ui = createUIStore(); // Modal visibility, highlights
multiplayer = createMultiplayerStore(); // gameId, opponent, connection
```

### Unified Context Abstraction

`UnifiedGameContext` provides mode-agnostic interface. Components like `ChessBoardController` don't know about Play vs Training modes. Providers (`PlayGameProvider`, `TrainingGameProvider`) implement the unified interface differently.

### Three-Layer Engine Resilience

1. **StockfishEngine**: Low-level UCI protocol with timeout handling
2. **ResilientEngine**: Circuit breaker (3 failures → open, 1min timeout), auto-recovery, command queuing
3. **EnginePool**: Allocation per (purpose, gameId), max 4 engines, 1min idle timeout, eviction policy

### Adaptive Engine Loading

Detects device capabilities at runtime:

- `full-mt` (69MB): Multi-threaded, requires SharedArrayBuffer + COOP/COEP headers
- `lite-st` (7MB): Single-threaded, mobile-optimized fallback

### Session Layer (Command Pattern)

`GameSession` executes commands: `APPLY_MOVE`, `RESIGN`, `TIMEOUT`, `NAVIGATE_HISTORY`. `SessionManager` (singleton) manages concurrent sessions with `BoardCache` for O(1) legal move lookups.

### SolidJS Patterns

- `createStore()` with `batch()` for atomic multi-property updates
- `splitProps()` to separate reactive from static props
- Context + Provider for global state injection
- `createEffect(on(...))` for reactive side effects
- Lazy-loaded routes with `@solidjs/router`

### Backend Patterns

- **Structured logging**: `logger.Info("msg", logger.F("key", value, "key2", value2))`
- **Token bucket rate limiting**: Auth (10/min), API (60/min), Strict (5/min)
- **Nested locking**: GameManager RWMutex for map, GameState RWMutex for state
- **Context propagation**: Single context for entire OAuth flow with 30s timeout
- **Read/write pumps**: Concurrent goroutines per WebSocket client
- **Garbage collection**: Ended games (5min), waiting games (30min)

### WebSocket Protocol

```
Client → Server: { type: "MESSAGE_TYPE", data: { ... } }
Server → Client: { type: "MESSAGE_TYPE", data: { ... } }

Game Lifecycle:
GAME_CREATE → GAME_CREATED (gameId, color)
GAME_JOIN → GAME_JOINED / GAME_STARTED (both players)
MOVE → MOVE_ACCEPTED / MOVE_REJECTED / OPPONENT_MOVE
TIME_UPDATE (every 1s) / RESIGN / GAME_ENDED
```

### PWA Configuration

- **Manifest**: Standalone display, portrait orientation, app shortcuts (Play, Train)
- **Workbox caching**: CacheFirst for fonts/WASM, NetworkFirst for API
- **Service worker**: Auto-update registration
- **IndexedDB**: Session persistence with auto-save (5s periodic, 1s debounced on change)

### Security Headers (COOP/COEP)

Required for SharedArrayBuffer (multi-threaded Stockfish):

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: credentialless
```

Applied in Caddy, Nginx, and Vite dev server.

## Key Types

```typescript
Side = 'w' | 'b'
GameMode = 'play' | 'training' | 'analysis'
OpponentType = 'ai' | 'human'
GameLifecycle = 'idle' | 'initializing' | 'playing' | 'error' | 'ended'
AIPlayStyle = 'aggressive' | 'defensive' | 'balanced' | 'random' | 'positional'
GamePhase = 'opening' | 'middlegame' | 'endgame'
Square = 'a1' | 'a2' | ... (64 squares)
PieceType = 'wP' | 'bP' | 'wN' | ... (white/black piece notation)
```

## Data Flow

### Single-Player (vs AI)

1. User configures game via PlayModal/TrainingModal
2. Container creates stores + provider with unified context
3. ChessBoardController uses context for chess, engine, timer, ui
4. Player move → `ChessStore.applyMove()` → `GameSession.applyCommand('APPLY_MOVE')`
5. If AI turn → `EnginePool.acquire()` → aiEngineWorker computes move
6. `useAutoPersist` saves to IndexedDB periodically
7. Game end → ChessEndModal displays results

### Multiplayer

1. Creator: `GAME_CREATE` → server assigns gameId → URL updates to `/play/:gameId`
2. Joiner: Opens URL → `GAME_JOIN` → both receive `GAME_STARTED`
3. Player move: `applyOptimisticMove()` (immediate UI update)
4. WebSocket sends `MOVE` → server validates with notnil/chess → broadcasts
5. Opponent receives `OPPONENT_MOVE` with updated FEN and times
6. Server manages clocks (100ms ticks), sends `TIME_UPDATE` every 1s
7. Timeout/resign/checkmate → `GAME_ENDED` to both players

## Environment Setup

**Frontend** (apps/frontend/.env):

```
VITE_DEBUG=true
VITE_BACKEND_URL=http://localhost:8080
```

**Backend** (apps/backend/.env): Copy from `.env.example`, configure:

- `DATABASE_URL`, `REDIS_ADDR`, `REDIS_PASSWORD`
- OAuth credentials (GOOGLE/GITHUB/DISCORD_CLIENT_ID/SECRET) for sign-in
- `LOG_LEVEL=DEBUG`, `LOG_JSON=false` for development

## Production Deployment

**Docker Compose** with Caddy reverse proxy:

- Caddy handles HTTPS/SSL via Let's Encrypt
- COOP/COEP headers for SharedArrayBuffer
- Resource limits: Backend 512MB/0.5CPU, Frontend 256MB/0.5CPU, DB 1GB/1CPU

**Railway**: Alternative deployment with `railway.toml` in each app directory.

## Routing

```
/                   → HomeContainer
/play               → PlayContainer (vs AI or create multiplayer)
/play/:gameId       → PlayContainer (join multiplayer via URL)
/training           → TrainingContainer (untimed practice with eval)
/username-setup     → UsernameSetup
/profile/:username  → UserProfile
*                   → 404
```

## Git Conventions

Commit prefixes: `feat:`, `fix:`, `chore:`, `refactor:`, `style:`

Example: `feat: PWA push notifications and offline support`
