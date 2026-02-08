# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NXT Chess is a **Progressive Web App (PWA)** for real-time multiplayer chess with AI training and analysis modes. Key features:

- WebSocket-based multiplayer with shareable game links (`/play/:gameId`) and lobby browser
- Timed games with server-managed clocks (100ms precision) and ELO-rated play
- Training mode with Stockfish evaluation and hints
- Analysis mode with multi-line engine evaluation and FEN/PGN import
- Puzzles with ELO-rated difficulty tracking (mate-in-1/2/3)
- Achievements system with 51 badges across 6 categories
- Profile pages with rating history, game stats, and achievement showcase
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

### Monitoring

```bash
just mon-up                 # Start Prometheus, Loki, Grafana
just mon-down               # Stop monitoring stack
just mon-logs               # Follow monitoring logs
```

Grafana: http://localhost:3000 (admin/admin)

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
- **Monitoring**: Prometheus (metrics) + Loki (logs) + Grafana (dashboards)

### Frontend Structure (apps/frontend/src/)

```
@types/              # External library types (stockfish-js.d.ts)

components/
├── chess/           # Chess UI: ChessBoard, ChessBoardController (+ hooks/), ChessBoardArrows, ChessPiece, ChessClock, ChessEvalBar, TimeControlGrid
├── game/            # Game layout: GameContainer, GameInfoPanel, GameNotation, MoveHistoryPanel, ButtonPanel, DifficultyDisplay
├── play/            # Multiplayer: PlayContainer, PlayHub, PlayModal, PlayAIModal, PlayCreateGameModal, PlayControlPanel, PlayNavigationPanel, PlayResignModal
├── training/        # Training: TrainingContainer, TrainingModal, TrainingControlPanel, TrainingNavigationPanel
├── analyze/         # Analysis: AnalyzeContainer, AnalyzeEnginePanel, AnalyzeControlPanel, AnalyzeImportModal, AnalyzeNavigationPanel
├── puzzle/          # Puzzles: PuzzleContainer, PuzzleModal, PuzzleControlPanel, PuzzleNavigationPanel, PuzzleFeedbackModal
├── home/            # Landing page
├── user/            # Auth & profile: UserSignInModal, UserProfile, UsernameSetup, ProfileIconPicker, UserAchievements, AchievementBadge
└── common/          # Header, Footer, 404, ErrorBoundary, NetworkStatus, SettingsDropdown, AchievementToast, FloatingPieces

store/
├── game/            # Multi-store architecture
│   ├── stores/      # Independent store factories (chess, timer, engine, ui, multiplayer, lobby)
│   ├── actions/     # Mode-specific actions (core, singlePlayer, training, multiplayer, play, analyze, puzzle)
│   └── types.ts     # Store type definitions
├── settings/        # SettingsContext + SettingsProvider (theme, sound)
└── user/            # UserContext + userStore (auth state, profile)

services/
├── audio/           # AudioService for move sounds and warnings
├── engine/          # Stockfish management
│   ├── StockfishEngine.ts    # Low-level UCI protocol wrapper
│   ├── ResilientEngine.ts    # Circuit breaker with auto-recovery
│   ├── EnginePool.ts         # Multi-engine allocation per (purpose, gameId)
│   ├── aiEngineWorker.ts     # AI move computation (Web Worker)
│   ├── evalEngineWorker.ts   # Position evaluation (Web Worker)
│   ├── analysisEngineService.ts  # Multi-line analysis for analyze mode (MultiPV)
│   └── moveEvalService.ts    # Move quality evaluation for training hints
├── game/            # Game logic
│   ├── chessGameService.ts   # Move validation, legal move computation
│   ├── gameLifecycle.ts      # State machine (idle → initializing → playing → ended)
│   ├── BoardCache.ts         # O(1) board lookups, caches legal moves
│   └── session/              # GameSession (command pattern) + SessionManager (singleton)
├── network/         # ReconnectingWebSocket with exponential backoff
├── sync/            # GameSyncService for multiplayer, useGameSync hook
├── persistence/     # IndexedDB: GamePersistence + useAutoPersist (5s periodic, 1s debounced)
├── preferences/     # User settings storage
├── puzzle/          # Puzzle data (mate-in-N definitions), setup move computation
├── settings/        # SettingsService (theme/sound via localStorage)
├── training/        # Training mode logic
│   ├── scenarios.ts          # Training scenario configurations (endgame themes, difficulty)
│   ├── positionSource.ts     # Position source resolution (API, predefined)
│   ├── terminationEvaluator.ts  # Training termination conditions
│   └── scoringCalculator.ts  # Training performance scoring
└── offline/         # AssetPreloader for fonts, WASM pre-caching

shared/
├── config/          # Constants (time values, difficulty, play styles, time controls)
├── hooks/           # useKeyboardNavigation
└── utils/           # Debug, ID generation, strings, EventEmitter, createFocusTrap

types/               # chess.ts (Square, PieceType, Board), game.ts (Side, GameMode, etc.), moveQuality.ts, achievements.ts
```

### Backend Structure (apps/backend/)

```
cmd/server/main.go           # Entry point, route registration, graceful shutdown

internal/
├── auth/            # OAuth 2.0: oauth.go (handlers), providers.go (Google, GitHub, Discord)
├── chess/           # Server-side validation wrapping notnil/chess
├── config/          # Environment config loader
├── achievements/    # Achievement definitions (51 badges), checker logic, game analysis
├── controllers/     # HTTP handlers: auth.go, profile.go, training.go, puzzle.go
├── database/        # PostgreSQL: connection pooling, direct SQL queries (no ORM)
│   ├── endgame.go   # Training position queries
│   ├── puzzle.go    # Puzzle rating operations
│   ├── rating.go    # ELO calculation and game finalization
│   └── achievements.go  # Achievement grant and unlock tracking
├── elo/             # ELO rating calculation (multiplayer + puzzle)
├── httpx/           # JSON responses, secure cookies, client IP extraction
├── logger/          # Structured logging: levels (DEBUG/INFO/WARN/ERROR), JSON mode
├── metrics/         # Prometheus metrics: HTTP requests, WS connections, DB queries
├── middleware/      # CORS, recovery, security headers, session, rate limit, body limit, request ID, metrics
├── migrate/         # Database migrations runner (golang-migrate)
├── models/          # Data structures: Profile, PublicProfile, Game, EndgamePosition, RatingPoint, RecentGame
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
profiles: user_id (PK), username (UNIQUE), rating, puzzle_rating, profile_icon, achievement_points, win_streak, puzzle_streak, created_at
games: game_id (UUID PK), pgn, playerW_id, playerB_id, stockfish_difficulty, playerW_start_rating, playerB_start_rating, result, created_at
rating_history: id, user_id (FK), rating, created_at
puzzle_rating_history: id, user_id (FK), rating, created_at
endgame_positions: position_id (PK), fen, rating, themes[], moves, initial_eval, description, source
user_achievements: user_id (FK), achievement_id, unlocked_at (UNIQUE user_id+achievement_id)
```

Migrations managed via golang-migrate in `db/migrations/` (000001–000005). Seeds in `db/seeds/`.

**Dev database initialization** (docker-compose.dev.yaml):

1. `00_init.sql` - Base tables (profiles, games, rating_history)
2. `01-03_migration.sql` - Migrations (constraints, profile_icon, endgame_positions table)
3. `90-91_seed*.sql` - Seed data (endgame positions)

Backend also runs golang-migrate on startup (idempotent), applying 000004 (puzzle rating) and 000005 (achievements).

## Key Patterns

### Controller/Presenter Pattern

`ChessBoardController` handles game logic, delegating to extracted hooks: `useAudioFeedback` (move sounds), `useBoardAnnotations` (right-click arrows, highlights), `useEvaluation` (engine eval bar), `useMoveAnimation` (piece animation). `ChessBoard` is purely presentational—receives callbacks and renders squares. Same pattern for `ChessPiece`, `ChessClock`, `ChessEvalBar`.

### Modular Multi-Store Architecture

Six independent stores compose via context:

```typescript
chess = createChessStore(); // FEN, move history, game state
timer = createTimerStore(); // Game clocks
engine = createEngineStore(); // Engine status, thinking state
ui = createUIStore(); // Modal visibility, highlights
multiplayer = createMultiplayerStore(); // gameId, opponent, connection
lobby = createLobbyStore(); // Open games list, lobby subscription
```

### Unified Context Abstraction

`UnifiedGameContext` provides mode-agnostic interface. Components like `ChessBoardController` don't know about Play vs Training vs Analyze vs Puzzle modes. Providers (`PlayGameProvider`, `TrainingGameProvider`, `AnalyzeGameProvider`, `PuzzleGameProvider`) implement the unified interface differently.

### Three-Layer Engine Resilience

1. **StockfishEngine**: Low-level UCI protocol with timeout handling
2. **ResilientEngine**: Circuit breaker (3 failures → open, 1min timeout), auto-recovery, command queuing
3. **EnginePool**: Allocation per (purpose, gameId), max 4 engines, 1min idle timeout, eviction policy

### Adaptive Engine Loading

Detects device capabilities at runtime:

- `full-mt` (69MB): Multi-threaded, requires SharedArrayBuffer + COOP/COEP headers
- `full-st`: Single-threaded full version
- `lite-st` (7MB): Single-threaded, mobile-optimized fallback

### Session Layer (Command Pattern)

`GameSession` executes commands: `APPLY_MOVE`, `RESIGN`, `TIMEOUT`, `NAVIGATE_HISTORY`. `SessionManager` (singleton) manages concurrent sessions with `BoardCache` for O(1) legal move lookups.

### CSS Style Guidelines

**No comments in CSS files.** Use expressive, readable class names and logical property grouping to convey intent instead of comments. Class names should be self-documenting (e.g., `.boardActiveTurnGlow` not `.glow` with a comment). Use blank lines to visually separate property groups instead of section divider comments.

### TypeScript Style Guidelines

**No section divider comments in TypeScript/TSX files.** Do not use banner-style comment blocks like:

```typescript
// ============================================================================
// Section Name
// ============================================================================
```

Use blank lines to separate logical sections. Let function names, class names, and code structure convey organization. If a file needs section headers to be readable, it should be split into smaller files instead.

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
- **Prometheus metrics**: HTTP request count/duration, active WS connections/games, DB query duration via `internal/metrics`

### WebSocket Protocol

```
Client → Server: { type: "MESSAGE_TYPE", data: { ... } }
Server → Client: { type: "MESSAGE_TYPE", data: { ... } }

Game Lifecycle:
GAME_CREATE → GAME_CREATED (gameId, color)
GAME_JOIN → GAME_JOINED / GAME_STARTED (both players)
MOVE → MOVE_ACCEPTED / MOVE_REJECTED / OPPONENT_MOVE
TIME_UPDATE (every 1s) / RESIGN / GAME_ENDED (includes rating deltas + achievement unlocks)

Lobby:
LOBBY_SUBSCRIBE → LOBBY_LIST (all waiting games)
LOBBY_UNSUBSCRIBE
LOBBY_UPDATE (game added/removed broadcast to subscribers)
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
GameMode = 'play' | 'training' | 'analysis' | 'puzzle'
OpponentType = 'ai' | 'human'
RatedMode = 'rated' | 'casual'
GameLifecycle = 'idle' | 'initializing' | 'playing' | 'error' | 'ended'
GamePhase = 'opening' | 'middlegame' | 'endgame' | null
PuzzleCategory = 'mate-in-1' | 'mate-in-2' | 'mate-in-3' | 'random'
MoveQuality = 'best' | 'excellent' | 'good' | 'inaccuracy' | 'mistake' | 'blunder'
AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
AchievementCategory = 'loyalty' | 'streaks' | 'rating' | 'chess_moments' | 'volume' | 'fun'
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

1. Lobby: `LOBBY_SUBSCRIBE` → receive `LOBBY_LIST` of waiting games → `LOBBY_UPDATE` on changes
2. Creator: `GAME_CREATE` → server assigns gameId → URL updates to `/play/:gameId`
3. Joiner: Opens URL or clicks lobby game → `GAME_JOIN` → both receive `GAME_STARTED`
4. Player move: `applyOptimisticMove()` (immediate UI update)
5. WebSocket sends `MOVE` → server validates with notnil/chess → broadcasts
6. Opponent receives `OPPONENT_MOVE` with updated FEN and times
7. Server manages clocks (100ms ticks), sends `TIME_UPDATE` every 1s
8. Timeout/resign/checkmate → `GAME_ENDED` with rating deltas and achievement unlocks to both players

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
/play               → PlayContainer (lobby browser, vs AI, or create multiplayer)
/play/:gameId       → PlayContainer (join multiplayer via URL)
/training           → TrainingContainer (untimed practice with eval)
/analyze            → AnalyzeContainer (position analysis with FEN/PGN import)
/puzzles            → PuzzleContainer (mate-in-N tactics puzzles)
/username-setup     → UsernameSetup
/profile/:username  → UserProfile
*                   → 404
```

## Roadmap

### Training & Analysis

**Syzygy Tablebases Integration**

- Mathematically perfect endgame play (6 pieces or fewer)
- Shows DTZ (distance to zeroing) and WDL (win/draw/loss)
- Integrates with existing endgame training mode

**Opening Explorer with Master Game Statistics**

- Position statistics from master games ("e4: 52% win, 45k games")
- Named opening recognition ("Sicilian Defense, Najdorf Variation")
- Filter by rating range (2000+, 2200+, 2500+)
- Add to Analyze mode or include in Tools section

**Post-Game Analysis with Move Classification**

- Classify moves: Best, Good, Inaccuracy, Mistake, Blunder
- Centipawn loss graph showing critical moments
- Accuracy percentage per game
- Extends existing analysisEngineService infrastructure
- Gamify post game analysis

**Tactics Puzzles with Spaced Repetition** *(mate-in-1/2/3 implemented with ELO-rated puzzle tracking)*

- ~~Mate in 1, 2, 3 puzzle targets~~ (done)
- ~~Puzzle ELO rating system~~ (done — separate puzzle_rating with history tracking)
- Themed puzzles (forks, pins, back rank mates)
- SM-2 spaced repetition for failed puzzles
- Server-side puzzle database

**Middlegame Training Mode**

- Positional training from complex positions
- Similar architecture to endgame training
- Use positions from classical and famous games

### Multiplayer & Competitive

**Multiplayer Lobby** *(implemented — PlayHub with real-time lobby via WebSocket)*

- ~~Browse and join open games~~ (done)
- ~~Filter by time control~~ (done — categorized Bullet/Blitz/Rapid/Classical)
- ELO range based filtering for lobby

**Tournaments**

- Swiss and arena formats
- Scheduled events

**Rated Play** *(implemented — ELO system for multiplayer + puzzles)*

- ~~ELO-based matchmaking~~ (done — K-factor 40 for <10 games, 32 after)
- ~~Rating history visualization~~ (done — profile chart with time range selector)
- ELO range based option for lobby

**Achievements** *(implemented — 51 badges across 6 categories)*

- ~~Achievement definitions with rarity levels~~ (done — common/uncommon/rare/epic/legendary)
- ~~Achievement checking on game end and puzzle solve~~ (done)
- ~~Achievement toast notifications~~ (done)
- ~~Profile achievement showcase~~ (done — collapsible categories)

### Platform

**Profile Features** *(implemented — rating history, game stats, achievements)*

- ~~Game history and statistics~~ (done — recent games, win/loss/draw counts)
- ~~Rating history charts~~ (done — with time range selector)
- ~~Achievement points and badges~~ (done)
- Opening repertoire tracking

**Mobile App**

- Native wrapper or React Native port
- Push notifications
- PWA support

**CI/CD**

- Automated testing pipeline
- Deployment automation
- GitHub Actions

**Observability** *(PLG stack implemented — Prometheus, Loki, Grafana with backend dashboard)*

- ~~Grafana LGTM stack (Loki, Grafana, Tempo, Mimir)~~ → implemented as PLG
- ~~Prometheus metrics~~ (HTTP requests, WS connections, DB queries)
- ~~Grafana dashboards~~ (backend request rate, latency, active connections)
- ~~Loki log aggregation~~ (via Promtail, Docker log driver)
- Performance monitoring (frontend metrics, Core Web Vitals)

## Git Conventions

Commit prefixes: `feat:`, `fix:`, `chore:`, `refactor:`, `style:`, `nit:`

Example: `feat: PWA push notifications and offline support`
