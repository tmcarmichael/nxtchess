# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NXT Chess is a **Progressive Web App (PWA)** and **Flutter mobile app** for real-time multiplayer chess with AI training and analysis modes. Key features:

- WebSocket-based multiplayer with shareable game links (`/play/:gameId`), lobby browser (250ms batched updates), and reconnection support (20s grace period)
- Timed games with server-managed clocks (100ms precision) and ELO-rated play
- Post-game review with move-by-move analysis, accuracy scoring, and evaluation graphs
- Training mode with Stockfish evaluation and hints
- Analysis mode with multi-line engine evaluation and FEN/PGN import
- Puzzles with ELO-rated difficulty tracking (mate-in-1/2/3) and session history
- Achievements system with 49 badges across 6 categories
- Profile pages with rating history, game stats, and achievement showcase
- Offline-capable with IndexedDB persistence (web) and shared_preferences (mobile)
- Stockfish engine: lite-st (7MB single-threaded) for all web users; native multistockfish on mobile
- Mobile OAuth via deep links (`nxtchess://callback`)

## App-Specific Documentation

For deeper details when working in a specific app:

- [Frontend CLAUDE.md](apps/frontend/CLAUDE.md) - Component hierarchy, stores, services, PWA config
- [Backend CLAUDE.md](apps/backend/CLAUDE.md) - Package structure, middleware, WebSocket protocol
- Mobile app (`apps/mobile/`) - Flutter/Riverpod, full feature parity with web frontend

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
yarn lint          # ESLint
yarn test          # Vitest
```

### Mobile Commands (from apps/mobile/)

```bash
flutter run                     # Run debug build
flutter test                    # Run 137+ tests
flutter build apk               # Android release
flutter build ios                # iOS release
dart run build_runner build      # Regenerate freezed/riverpod code
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

- **Frontend (Web)**: SolidJS + TypeScript + Vite + CSS Modules + PWA (vite-plugin-pwa)
- **Frontend (Mobile)**: Flutter + Dart + Riverpod + freezed + go_router
- **Backend**: Go 1.24 (Chi router) + PostgreSQL 15 + Redis 7 + gorilla/websocket
- **Chess (Web)**: chess.js (browser validation) + stockfish.js (Web Worker AI/eval)
- **Chess (Mobile)**: dartchess (validation) + chessground (board UI) + multistockfish (native engine)
- **Chess (Server)**: notnil/chess (server validation)
- **Infrastructure**: Docker Compose + Caddy (reverse proxy) + Nginx (static serving)
- **CI/CD**: GitHub Actions (frontend lint/test + backend test)
- **Monitoring**: Prometheus (metrics) + Loki (logs) + Grafana (dashboards)

### Frontend Structure (apps/frontend/src/)

```
@types/              # External library types (stockfish-js.d.ts)

components/
├── chess/           # Chess UI: ChessBoard, ChessBoardController (+ hooks/), ChessBoardArrows, ChessPiece, ChessClock, ChessEvalBar, ChessEndModal, ChessGameModal, ChessPromotionModal, ChessDifficultySlider, ChessEngineOverlay, ChessMaterialDisplay, ChessSideSelector, TimeControlGrid
├── game/            # Game layout: GameContainer, GameInfoPanel, GameNotation, MoveHistoryPanel, ButtonPanel, GamePanelButton, DifficultyDisplay, PlayerColorDisplay
├── play/            # Multiplayer: PlayContainer, PlayHub, PlayModal, PlayAIModal, PlayCreateGameModal, PlayControlPanel, PlayNavigationPanel, PlayResignModal
├── training/        # Training: TrainingContainer, TrainingModal, TrainingControlPanel, TrainingNavigationPanel
├── analyze/         # Analysis: AnalyzeContainer, AnalyzeEnginePanel, AnalyzeControlPanel, AnalyzeImportModal, AnalyzeNavigationPanel
├── puzzle/          # Puzzles: PuzzleContainer, PuzzleModal, PuzzleControlPanel, PuzzleNavigationPanel, PuzzleFeedbackModal, PuzzleHistoryStrip
├── review/          # Game review: ReviewContainer, ReviewSummaryPanel, ReviewEvalGraph, ReviewProgressBar, ReviewControlPanel, ReviewNavigationPanel, GameReviewModal
├── home/            # Landing page: HomeContainer, HomeSiteHero, HomeQuickPlay
├── user/            # Auth & profile: UserSignInModal, UserProfile, UsernameSetup, ProfileIconPicker, UserAchievements, AchievementBadge
└── common/          # Header, Footer, 404, ErrorBoundary, NetworkStatus, MobileMenu, SettingsDropdown, AchievementToast, FloatingPieces

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
│   ├── engineService.ts      # High-level engine service wrapping EnginePool
│   ├── aiEngineWorker.ts     # AI move computation (Web Worker)
│   ├── evalEngineWorker.ts   # Position evaluation (Web Worker)
│   ├── analysisEngineService.ts  # Multi-line analysis for analyze mode (MultiPV)
│   └── moveEvalService.ts    # Move quality evaluation for training hints
├── game/            # Game logic
│   ├── chessGameService.ts   # Move validation, legal moves, premove system
│   ├── gameLifecycle.ts      # State machine (idle → initializing → playing → ended)
│   ├── BoardCache.ts         # O(1) board lookups, caches legal moves
│   ├── fenUtils.ts           # FEN parsing (turn, king square)
│   ├── pieceUtils.ts         # Piece color/type helpers
│   └── session/              # GameSession (command pattern) + SessionManager (singleton)
├── review/          # gameReviewService (post-game move analysis, accuracy scoring)
├── network/         # ReconnectingWebSocket with exponential backoff
├── sync/            # GameSyncService, useGameSync hook, reconnectStore (session storage for active game tracking)
├── persistence/     # IndexedDB: GamePersistence + useAutoPersist (5s periodic, 1s debounced)
├── preferences/     # User settings storage
├── puzzle/          # Puzzle data (mate-in-N definitions), setup move computation, puzzleHistory (session tracking)
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

types/               # chess.ts (Square, PieceType, Board), game.ts (Side, GameMode, etc.), moveQuality.ts, achievements.ts, review.ts
```

### Backend Structure (apps/backend/)

```
cmd/server/main.go           # Entry point, route registration, graceful shutdown

internal/
├── auth/            # OAuth 2.0: oauth.go (handlers + mobile deep link support), providers.go (Google, GitHub, Discord)
├── chess/           # Server-side validation wrapping notnil/chess
├── config/          # Environment config loader
├── achievements/    # Achievement definitions (49 badges), checker logic, game analysis
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
├── middleware/      # Recovery, security headers, session, rate limit, body limit, request ID + logging, metrics, internal-only
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

### Mobile App Structure (apps/mobile/)

```
lib/
├── main.dart                    # Entry point, initializes services, ProviderScope
├── config/
│   └── env.dart                 # Compile-time config (--dart-define): BACKEND_URL, ENV, DEBUG
├── router/
│   └── app_router.dart          # GoRouter: 4-tab StatefulShellRoute + full-screen routes
├── models/                      # freezed immutable data classes (game_state, review_types, etc.)
├── providers/                   # Riverpod providers/notifiers
│   ├── chess_notifier.dart      # Central game state machine (mirrors web ChessStore)
│   ├── play_game_controller.dart    # Multiplayer game controller
│   ├── training_game_controller.dart
│   ├── analyze_game_controller.dart
│   ├── puzzle_game_controller.dart
│   └── review_game_controller.dart
├── services/
│   ├── api_client.dart          # Dio HTTP client with cookie persistence
│   ├── auth_service.dart        # OAuth via flutter_web_auth_2 (nxtchess:// deep link)
│   ├── game_sync_service.dart   # WebSocket multiplayer (mirrors web GameSyncService)
│   ├── reconnecting_websocket.dart  # Exponential backoff, message queuing
│   ├── engine_service.dart      # Native multistockfish integration
│   ├── audio_service.dart       # audioplayers sound effects
│   ├── haptics_service.dart     # Platform haptic feedback
│   └── review_service.dart      # Post-game analysis
├── screens/                     # Full-screen route widgets
│   ├── home/, play/, training/, analyze/, puzzles/, review/
│   ├── profile/, settings/
│   └── auth/                    # Username setup
├── widgets/                     # Reusable UI components
│   ├── chess_board.dart         # chessground-based board
│   ├── eval_bar.dart, clock.dart, move_list.dart
│   └── common/                  # Shared UI elements
└── utils/                       # UCI parsing, PGN parsing, move quality classification

test/                            # 137+ tests (chess_notifier, websocket, puzzles, etc.)
```

Platform config: Android `com.nxtchess.nxtchess` (Java 17, Gradle Kotlin DSL), iOS `com.nxtchess.nxtchess` (ProMotion support). Custom URL scheme `nxtchess://` for OAuth callbacks.

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

### Engine Loading

Three Stockfish variants exist but currently all web users get `lite-st`:

- `full-mt` (69MB): Multi-threaded, requires SharedArrayBuffer + COOP/COEP headers (reserved for future "Power Mode")
- `full-st`: Single-threaded full version (unused)
- `lite-st` (7MB): Single-threaded, currently used for all web users

Mobile app uses native `multistockfish` package (full multi-threaded engine).

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
- **Token bucket rate limiting**: Auth (15/min burst 10), API (60/min burst 20), Strict (5/min burst 3)
- **Nested locking**: GameManager RWMutex for map, GameState RWMutex for state
- **Context propagation**: Single context for entire OAuth flow with 30s timeout
- **Read/write pumps**: Concurrent goroutines per WebSocket client, 30msg/10s rate limit with 30s block after 3 violations
- **Garbage collection**: Ended games (5min), waiting games (5min)
- **Game limits**: 10s creation cooldown, max 2 active games per user/IP, 1000 total server capacity
- **Reconnection**: 20s grace period on authenticated disconnect (anonymous = immediate forfeit), full state hydration on reconnect
- **Mobile OAuth**: `?mobile=true` query param on login → redirects to `nxtchess://callback?token=<session>`
- **Lobby batching**: 250ms batch window with deduplication (add+remove of same game cancels out)
- **Prometheus metrics**: HTTP request count/duration, active WS connections/games, DB query duration via `internal/metrics`
- **InternalOnly middleware**: Restricts `/metrics` to private IPs and trusted proxies

### WebSocket Protocol

```
Client → Server: { type: "MESSAGE_TYPE", data: { ... } }
Server → Client: { type: "MESSAGE_TYPE", data: { ... } }

Keepalive:
PING → PONG (client sends every 30s)

Game Lifecycle:
GAME_CREATE → GAME_CREATED (gameId, color)
GAME_JOIN → GAME_JOINED / GAME_STARTED (both players) / GAME_NOT_FOUND / GAME_FULL
GAME_LEAVE → ends waiting/active game
MOVE → MOVE_ACCEPTED / MOVE_REJECTED / OPPONENT_MOVE
TIME_UPDATE (every 1s) / RESIGN / GAME_ENDED (includes rating deltas + achievement unlocks)
OPPONENT_LEFT (player left without disconnecting)

Reconnection:
GAME_RECONNECT → GAME_RECONNECTED (full state: gameId, color, fen, moveHistory, times, opponent, rated)
OPPONENT_DISCONNECTED (20s grace period starts)
OPPONENT_RECONNECTED (opponent restored connection)

Lobby:
LOBBY_SUBSCRIBE → LOBBY_LIST (all waiting games)
LOBBY_UNSUBSCRIBE
LOBBY_UPDATE (game added/removed, 250ms batched with dedup)

Future (defined, not yet implemented):
MATCHMAKING_JOIN, MATCHMAKING_CANCEL → MATCHMAKING_WAITING, MATCHMAKING_MATCHED
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
SideSelection = Side | 'random'
GameMode = 'play' | 'training' | 'analysis' | 'puzzle'
OpponentType = 'ai' | 'human'
RatedMode = 'rated' | 'casual'
GameLifecycle = 'idle' | 'initializing' | 'playing' | 'error' | 'ended'
GamePhase = 'opening' | 'middlegame' | 'endgame' | null
GameOverReason = 'checkmate' | 'stalemate' | 'time' | 'resignation' | 'disconnection' | 'abandonment' | 'insufficient_material' | 'threefold_repetition' | 'fifty_move_rule' | null
PuzzleCategory = 'mate-in-1' | 'mate-in-2' | 'mate-in-3' | 'random'
MoveQuality = 'best' | 'excellent' | 'good' | 'inaccuracy' | 'mistake' | 'blunder'
AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
AchievementCategory = 'loyalty' | 'streaks' | 'rating' | 'chess_moments' | 'volume' | 'fun'
ReviewPhase = 'idle' | 'analyzing' | 'complete'
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
9. Reconnection: `reconnectStore` saves active game to sessionStorage → on disconnect, `GAME_RECONNECT` → server sends `GAME_RECONNECTED` with full state → `hydrateFromReconnect()` rebuilds board

### Post-Game Review

1. Game ends (any mode with PGN) → user clicks "Review" → navigates to `/review` with PGN in location state
2. `ReviewContainer` wraps with `PlayGameProvider`, loads PGN into chess store
3. `gameReviewService` analyzes each position (800ms per move) with dedicated Stockfish engine
4. Computes accuracy (win-percentage formula), move quality classification, eval history
5. `ReviewSummaryPanel` shows white/black accuracy and quality distribution
6. `ReviewEvalGraph` visualizes evaluation over the game
7. User navigates moves to see per-move quality annotations

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
- `TRUSTED_PROXIES` (comma-separated CIDRs for InternalOnly middleware)
- `SKIP_MIGRATIONS=true` to skip startup migrations

**Mobile** (apps/mobile/): Configure via `--dart-define` flags:

```bash
flutter run --dart-define=BACKEND_URL=http://localhost:8080 --dart-define=ENV=development
```

## Production Deployment

**Docker Compose** with Caddy reverse proxy:

- Caddy handles HTTPS/SSL via Let's Encrypt
- COOP/COEP headers for SharedArrayBuffer
- Resource limits: Backend 512MB/0.5CPU, Frontend 256MB/0.5CPU, DB 1GB/1CPU
- Prod DB only gets `db/init.sql` — backend binary runs golang-migrate at startup for full schema
- `backend.Dockerfile` (project root context) used for prod; `apps/backend/Dockerfile` for Railway

**Railway**: Alternative deployment with `railway.toml` in each app directory.

**CI/CD**: GitHub Actions (`.github/workflows/ci.yml`) runs on push/PR to `main`:

- Frontend job: `yarn install --frozen-lockfile` → format:check → lint → type:check → test
- Backend job: `go test -race -count=1 ./...`
- Pre-commit hook: gofmt + go vet + go test; frontend lint-staged + lint + tsc + vitest

## Routing

### Frontend Routes

```
/                   → HomeContainer (quick play cards for instant game start)
/play               → PlayContainer (lobby browser, vs AI, or create multiplayer)
/play/:gameId       → PlayContainer (join multiplayer via URL)
/training           → TrainingContainer (untimed practice with eval)
/analyze            → AnalyzeContainer (position analysis with FEN/PGN import)
/puzzles            → PuzzleContainer (mate-in-N tactics puzzles)
/review             → ReviewContainer (post-game analysis with accuracy scoring)
/username-setup     → UsernameSetup
/profile/:username  → UserProfile
*                   → 404
```

### Mobile Routes

```
/ (tab)             → Home (quick play)
/play (tab)         → Play (lobby + AI)
/play/:gameId       → Play (join multiplayer)
/training (tab)     → Training
/puzzles (tab)      → Puzzles
/analyze            → Analyze (full-screen)
/review             → Review (full-screen)
/profile/:username  → Profile (full-screen)
/settings           → Settings (full-screen)
/auth/username-setup → Username setup
```

### Backend API Routes

```
GET  /health              → Full status (DB, Redis, WS clients) for private IPs; minimal for public
GET  /health/live         → Liveness probe (always 200)
GET  /health/ready        → Readiness probe (DB + Redis check)
GET  /metrics             → Prometheus (InternalOnly middleware)
GET  /ws                  → WebSocket upgrade

GET  /auth/{provider}/login     → OAuth login (Google, GitHub, Discord) — supports ?mobile=true
GET  /auth/{provider}/callback  → OAuth callback
POST /auth/logout               → Clear session

GET  /api/profile/{username}                 → Public profile
GET  /api/profile/{username}/rating-history  → Game + puzzle rating history
GET  /api/profile/{username}/recent-games    → Last 10 games
GET  /api/profile/{username}/achievements    → User achievements
GET  /api/achievements                       → Full achievement catalog
GET  /api/training/endgame/random            → Random endgame position
GET  /api/training/endgame/themes            → Available themes
GET  /api/training/endgame/stats             → Position count by difficulty
POST /api/puzzle/result                      → Submit puzzle result (auth required)

GET  /check-username      → Auth status + username check (triggers loyalty achievements)
POST /set-username        → Set username (optional starting_rating: 500/1000/1500)
POST /set-profile-icon    → Update profile icon
```

## Roadmap

### Mobile App v1.0 (current milestone)

**Flutter App** *(in active development — full feature parity with web)*

- ~~All game modes: Play (AI + multiplayer), Training, Analysis, Puzzles, Review~~ (done)
- ~~WebSocket multiplayer with reconnection~~ (done)
- ~~Native Stockfish via multistockfish~~ (done)
- ~~OAuth deep links (nxtchess:// URL scheme)~~ (done — backend supports ?mobile=true)
- ~~Profile, achievements, rating history~~ (done)
- ~~137+ tests~~ (done)
- App Store / Play Store submission
- Push notifications
- App-specific CI job in GitHub Actions

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

**Gamify Post-Game Analysis**

- Post-game review is implemented (gameReviewService, accuracy scoring, eval graphs)
- Add gamification layer (streaks, comparative accuracy, challenge modes)

**Tactics Puzzles Expansion**

- Mate-in-1/2/3 with ELO-rated tracking is implemented
- Themed puzzles (forks, pins, back rank mates)
- SM-2 spaced repetition for failed puzzles
- Server-side puzzle database

**Middlegame Training Mode**

- Positional training from complex positions
- Similar architecture to endgame training
- Use positions from classical and famous games

### Multiplayer & Competitive

**Matchmaking** *(message stubs defined: MATCHMAKING_JOIN/CANCEL/WAITING/MATCHED)*

- ELO range based filtering for lobby
- Auto-matching by rating bracket

**Tournaments**

- Swiss and arena formats
- Scheduled events

### Platform

**Profile Enhancements**

- Opening repertoire tracking

**Performance Monitoring**

- Frontend metrics, Core Web Vitals
- Mobile app performance tracking

## Git Conventions

Commit prefixes: `feat:`, `fix:`, `chore:`, `refactor:`, `style:`, `nit:`

Example: `feat: PWA push notifications and offline support`
