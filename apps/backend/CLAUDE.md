# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See also: [Root CLAUDE.md](../../CLAUDE.md) for full-stack commands and frontend info.

## Development Commands

```bash
# From project root - recommended approach
just up PROFILES=backend      # Start backend + PostgreSQL + Redis
just logs PROFILES=backend    # Follow logs
just exec-db                  # psql into PostgreSQL (chess_db)
just exec-redis               # redis-cli

# From apps/backend/ - local Go development
go mod tidy                   # Sync dependencies
go run cmd/server/main.go     # Run locally (requires running DB/Redis)
go build -o server cmd/server/main.go  # Build binary
```

## Architecture

### Entry Point and Routing

`cmd/server/main.go` initializes services in order:
1. Load .env file (optional)
2. Load config from environment
3. Initialize logger
4. Connect to PostgreSQL (with pool)
5. Run database migrations (unless `SKIP_MIGRATIONS=true`)
6. Connect to Redis
7. Register OAuth providers
8. Create WebSocket hub + handler (with connection limiter)
9. Create rate limiters
10. Register Prometheus metrics
11. Register routes
12. Start HTTP server with graceful shutdown (15s timeout)

**Routes:**

| Group | Middleware | Endpoints |
|-------|-----------|-----------|
| Health | None | `GET /health`, `/health/live`, `/health/ready` |
| Metrics | InternalOnly | `GET /metrics` (Prometheus) |
| WebSocket | None | `GET /ws` |
| OAuth | AuthRateLimiter (10/min) | `GET /auth/{google,github,discord}/{login,callback}` |
| Logout | AuthRateLimiter, SmallBodyLimit | `POST /auth/logout` |
| Public API | APIRateLimiter (60/min), SmallBodyLimit | `GET /api/profile/{username}`, `GET /api/profile/{username}/rating-history`, `GET /api/profile/{username}/recent-games`, `GET /api/profile/{username}/achievements`, `GET /api/achievements`, `GET /api/training/endgame/{random,themes,stats}` |
| Optional Session | APIRateLimiter, SmallBodyLimit, OptionalSession | `GET /check-username` |
| Protected | APIRateLimiter (60/min), SmallBodyLimit, Session | `POST /set-username`, `POST /set-profile-icon`, `POST /api/puzzle/result` |

### Package Structure

```
cmd/server/main.go               # Entry point, route registration, graceful shutdown

internal/
├── achievements/                # Achievement system
│   ├── definitions.go           # 51 achievements across 6 categories with 5 rarity levels
│   ├── checker.go               # Achievement eligibility checking
│   └── analysis.go              # Game analysis for chess moment achievements
├── auth/                        # OAuth 2.0 system
│   ├── oauth.go                 # Generic login/callback handlers
│   └── providers.go             # Google, GitHub, Discord configs
├── chess/                       # Server-side validation
│   ├── chess.go                 # notnil/chess wrapper
│   └── chess_test.go            # Validation tests
├── config/                      # Environment config
│   └── config.go                # Load(), IsProd()
├── controllers/                 # HTTP handlers
│   ├── auth.go                  # Logout handler
│   ├── profile.go               # Profile endpoints (profile, rating history, recent games, achievements)
│   ├── training.go              # Training API (endgame positions)
│   └── puzzle.go                # Puzzle result submission with ELO rating
├── database/                    # PostgreSQL operations
│   ├── db.go                    # Connection pool setup
│   ├── profile.go               # User queries
│   ├── game.go                  # Game queries (debug)
│   ├── endgame.go               # Training position queries
│   ├── puzzle.go                # Puzzle rating operations (rate limiting, finalize results)
│   ├── rating.go                # ELO calculation and game finalization (transactional)
│   └── achievements.go          # Achievement grant/unlock tracking, streak management
├── elo/                         # ELO rating calculation
│   ├── elo.go                   # Calculate() for multiplayer, CalculatePuzzle() for puzzles
│   └── elo_test.go              # Rating calculation tests
├── httpx/                       # HTTP utilities
│   └── httpx.go                 # JSON responses, cookies, IP extraction
├── logger/                      # Structured logging
│   └── logger.go                # Levels, JSON mode, thread-safe
├── metrics/                    # Prometheus instrumentation
│   └── metrics.go               # HTTP, WS, DB metric collectors (CounterVec, HistogramVec, Gauge)
├── middleware/                  # HTTP middleware
│   ├── security.go              # Security headers
│   ├── recovery.go              # Panic recovery
│   ├── bodylimit.go             # Request size limits
│   ├── session.go               # Redis session auth
│   ├── ratelimit.go             # Token bucket per-IP
│   ├── requestid.go             # Request ID + request logging with duration
│   ├── metrics.go               # Prometheus HTTP request instrumentation
│   └── internal.go              # InternalOnly: restrict to private IPs / trusted proxies
├── models/                      # Data structures
│   ├── profile.go               # Profile, PublicProfile
│   ├── game.go                  # Game model
│   └── endgame_position.go      # EndgamePosition, query params
├── sessions/                    # Redis session store
│   └── session_store.go         # CRUD operations
├── migrate/                     # Database migrations
│   └── migrate.go               # golang-migrate runner
├── validation/                  # Input validation
│   └── validation.go            # Username, email, icon rules
├── utils/                       # Helpers
│   └── helpers.go               # Random strings, redirects
└── ws/                          # WebSocket multiplayer
    ├── handler.go               # Upgrade, connection limits
    ├── hub.go                   # Client registry, routing
    ├── client.go                # Read/write pumps, rate limit
    ├── game.go                  # Game state, clock, lifecycle
    └── message.go               # Message types

test_ws.html                     # Browser-based WS testing tool
```

### Test Coverage

```
internal/chess/chess_test.go              # Move validation, check/checkmate/stalemate detection
internal/elo/elo_test.go                  # ELO rating calculation (multiplayer + puzzle)
internal/httpx/httpx_test.go              # JSON response helpers, cookie creation, IP extraction
internal/middleware/bodylimit_test.go      # Request size enforcement
internal/middleware/ratelimit_test.go      # Token bucket rate limiting
internal/middleware/recovery_test.go       # Panic recovery behavior
internal/middleware/requestid_test.go      # Request ID generation and propagation
internal/middleware/security_test.go       # Security header injection
internal/middleware/session_test.go        # Session cookie auth, context injection
internal/models/endgame_position_test.go   # Endgame model serialization
internal/validation/validation_test.go     # Username/icon validation rules
internal/ws/message_test.go               # WebSocket message serialization
```

Run tests: `go test ./...` from `apps/backend/`.

### Key Patterns

**Structured Logging**: Use `logger.Info()`, `logger.Error()`, etc. with `logger.F()` for fields:
```go
logger.Info("User logged in", logger.F("userId", id, "provider", "google"))
```

**Input Validation**: Use `validation.ValidateUsername()` and similar:
```go
if err := validation.ValidateUsername(username); err != nil {
    httpx.WriteJSONError(w, http.StatusBadRequest, err.Message)
    return
}
```

**Rate Limiting**: Three preset limiters:
- `NewAuthRateLimiter()` - 10/min, burst 5 (auth endpoints)
- `NewAPIRateLimiter()` - 60/min, burst 20 (general API)
- `NewStrictRateLimiter()` - 5/min, burst 3 (sensitive operations)

**Prometheus Metrics**: `internal/metrics` defines counters, histograms, and gauges. `middleware/metrics.go` instruments all HTTP routes. WebSocket hub tracks active connections/games. Exposed at `/metrics` for Prometheus scraping.

**OAuth Provider System**: Generic handlers in `auth/oauth.go` with provider-specific configs in `auth/providers.go`. Providers missing credentials are skipped.

**Session Authentication**: Cookie-based sessions in Redis (24h TTL). Session middleware extracts `session_token` cookie, validates against Redis, attaches userID to context via `middleware.UserIDFromContext()`.

**Secure Cookies**: Use `httpx.NewSecureCookie(cfg, name, value, maxAge)` - HttpOnly always, Secure in prod, SameSite=Lax (dev) or None (prod).

**Trusted Proxy Support**: Configure `TRUSTED_PROXIES` with CIDR blocks (e.g., `10.0.0.0/8,172.16.0.0/12`) for accurate client IP extraction behind reverse proxies.

### Middleware Stack

Applied outermost to innermost:
1. **RequestID** - 16-char hex ID per request, X-Request-ID header
2. **Metrics** - Prometheus HTTP request count and duration per route/method/status
3. **RequestLogger** - Request logging with method, path, status, and duration
4. **Recovery** - Panic handling, hides details in production
5. **Security** - Headers (CSP, HSTS, X-Frame-Options, etc.)
6. **BodyLimit** - 1MB default, 64KB for JSON APIs
7. **RateLimiter** - Per route group, token bucket algorithm
8. **Session** - Authentication for protected routes
9. **InternalOnly** - Restricts `/metrics` to private IPs and trusted proxies

### Health Checks
- `GET /health` - Full health with DB/Redis status (JSON)
- `GET /health/live` - Liveness probe (always 200)
- `GET /health/ready` - Readiness probe (checks DB + Redis)

## Models

```go
type Profile struct {
    UserID      string    `json:"user_id"`
    Username    string    `json:"username"`
    Rating      int       `json:"rating"`
    PuzzleRating int      `json:"puzzle_rating"`
    ProfileIcon string    `json:"profile_icon"`
    CreatedAt   time.Time `json:"created_at"`
}

type PublicProfile struct {
    Username          string    `json:"username"`
    Rating            int       `json:"rating"`
    PuzzleRating      int       `json:"puzzle_rating"`
    ProfileIcon       string    `json:"profile_icon"`
    CreatedAt         time.Time `json:"created_at"`
    GamesPlayed       int       `json:"games_played"`
    Wins              int       `json:"wins"`
    Losses            int       `json:"losses"`
    Draws             int       `json:"draws"`
    AchievementPoints int       `json:"achievement_points"`
}

type RatingPoint struct {
    Rating    int       `json:"rating"`
    CreatedAt time.Time `json:"created_at"`
}

type RecentGame struct {
    GameID      string    `json:"game_id"`
    Opponent    string    `json:"opponent"`
    Result      string    `json:"result"`
    PlayerColor string    `json:"player_color"`
    CreatedAt   time.Time `json:"created_at"`
}

type Game struct {
    GameID              string
    PGN                 string
    PlayerWID           string
    PlayerBID           string
    StockfishDifficulty *int      // nullable, for AI games
    PlayerWStartRating  int
    PlayerBStartRating  int
    Result              string    // "1-0", "0-1", "1/2-1/2", "*"
    CreatedAt           time.Time
}

type EndgamePosition struct {
    PositionID  string
    FEN         string
    Moves       string        // optional, UCI solution
    Rating      int
    Themes      []string
    InitialEval *int          // nullable, centipawns
    Description string        // optional, human-readable title
    Source      string        // optional, attribution
    CreatedAt   time.Time
}

type EndgamePositionResponse struct {
    PositionID     string `json:"position_id"`
    FEN            string `json:"fen"`
    InitialEval    *int   `json:"initial_eval,omitempty"`
    Theme          string `json:"theme,omitempty"`
    Difficulty     int    `json:"difficulty"`
    SolutionMoves  string `json:"solution_moves,omitempty"`
    ExpectedResult string `json:"expected_result,omitempty"`
}

type EndgameQueryParams struct {
    MinRating                int
    MaxRating                int
    Theme                    string
    Side                     string    // filters via FEN parsing (split_part)
    ExcludePositionID        string
    RequireOpponentMaterial  bool
    RequirePawnForSideToMove bool      // for knight/bishop endgames
}
```

## Database Schema

See `db/init.sql` for full schema:

```sql
profiles (
    user_id VARCHAR PRIMARY KEY,
    username VARCHAR UNIQUE,
    rating INTEGER DEFAULT 1200,
    puzzle_rating INTEGER DEFAULT 1200 CHECK (puzzle_rating >= 0 AND puzzle_rating <= 4000),
    profile_icon VARCHAR DEFAULT 'white-pawn',
    achievement_points INTEGER DEFAULT 0,
    win_streak INTEGER DEFAULT 0,
    puzzle_streak INTEGER DEFAULT 0,
    created_at TIMESTAMP
)

games (
    game_id UUID PRIMARY KEY,
    pgn TEXT,
    playerW_id VARCHAR REFERENCES profiles(user_id),
    playerB_id VARCHAR REFERENCES profiles(user_id),
    stockfish_difficulty INTEGER,  -- nullable
    playerW_start_rating INTEGER,
    playerB_start_rating INTEGER,
    result VARCHAR,  -- '1-0', '0-1', '1/2-1/2', '*'
    created_at TIMESTAMP
)

rating_history (
    id INTEGER PRIMARY KEY,
    user_id VARCHAR REFERENCES profiles(user_id),
    rating INTEGER,
    created_at TIMESTAMP
)

puzzle_rating_history (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR REFERENCES profiles(user_id),
    rating INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
)

endgame_positions (
    position_id TEXT PRIMARY KEY,
    fen TEXT NOT NULL,
    moves TEXT,                  -- Solution moves (UCI format)
    rating INT NOT NULL DEFAULT 1500 CHECK (rating >= 0 AND rating <= 4000),
    themes TEXT[] NOT NULL DEFAULT '{}',  -- e.g., {'rookEndgame', 'lucena'}
    initial_eval INT,            -- Centipawn evaluation
    description TEXT,            -- Human-readable title
    source TEXT,                 -- Attribution
    created_at TIMESTAMP
)

user_achievements (
    user_id VARCHAR REFERENCES profiles(user_id),
    achievement_id VARCHAR NOT NULL,
    unlocked_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
)
```

Migrations managed via golang-migrate in `db/migrations/` (000001–000005). Endgame positions seeded from `db/seeds/`.

## Environment Variables

```bash
# Server
PORT=8080                           # HTTP port
ENV=development|production          # Environment mode
LOG_LEVEL=DEBUG|INFO|WARN|ERROR     # Log verbosity (auto: DEBUG dev, INFO prod)
LOG_JSON=true|false                 # JSON logging (auto: true in prod)

# Database
DATABASE_URL=postgres://...         # Required
DB_MAX_OPEN_CONNS=25               # Connection pool max
DB_MAX_IDLE_CONNS=5                # Idle connections
DB_CONN_MAX_LIFETIME_MINS=5        # Connection lifetime

# Redis
REDIS_ADDR=redis:6379              # Redis address
REDIS_PASSWORD=                     # Redis password (optional)

# URLs
FRONTEND_URL=http://localhost:5173  # For CORS and redirects
BACKEND_URL=http://localhost:8080   # For OAuth callbacks

# Trusted Proxies (for accurate IP extraction behind load balancers)
TRUSTED_PROXIES=10.0.0.0/8,172.16.0.0/12  # Comma-separated CIDRs or IPs

# OAuth (optional - providers without credentials are skipped)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
```

## WebSocket Multiplayer Protocol

Connect to `ws://localhost:8080/ws` for multiplayer games. Session cookie is optional (anonymous play allowed).

### Connection Limits
- **5 connections per IP** maximum
- **200ms minimum** between connection attempts
- Stale entries cleaned after 5 minutes

### Per-Client Rate Limiting
- Token bucket: 30 messages per 10 seconds, burst 10
- 3 violations → 30-second block (connection closed)

### Message Format
```json
{ "type": "MESSAGE_TYPE", "data": { ... } }
```

### Client → Server Messages

| Type | Data | Description |
|------|------|-------------|
| `PING` | none | Heartbeat |
| `GAME_CREATE` | `{timeControl?, rated?}` | Create game |
| `GAME_JOIN` | `{gameId}` | Join game |
| `MOVE` | `{gameId, from, to, promotion?}` | Make a move (e.g., "e2" → "e4") |
| `RESIGN` | `{gameId}` | Resign from game |
| `GAME_LEAVE` | `{gameId}` | Leave/cancel waiting game |
| `GAME_RECONNECT` | `{gameId}` | Attempt to rejoin a disconnected game |
| `LOBBY_SUBSCRIBE` | none | Subscribe to lobby updates |
| `LOBBY_UNSUBSCRIBE` | none | Unsubscribe from lobby updates |

### Server → Client Messages

| Type | Data | Description |
|------|------|-------------|
| `PONG` | none | Heartbeat response |
| `ERROR` | `{code, message}` | Error notification |
| `GAME_CREATED` | `{gameId, color}` | Waiting for opponent |
| `GAME_JOINED` | `{gameId, color}` | Joined, waiting for start |
| `GAME_STARTED` | `{gameId, fen, whitePlayer, blackPlayer, timeControl?, times}` | Game active |
| `GAME_NOT_FOUND` | `{gameId}` | Requested game does not exist |
| `GAME_FULL` | `{gameId}` | Requested game already has two players |
| `MOVE_ACCEPTED` | `{gameId, from, to, san, fen, moveNum, isCheck?, times}` | Move valid |
| `MOVE_REJECTED` | `{gameId, reason, fen, moveNum}` | Move invalid |
| `OPPONENT_MOVE` | `{gameId, from, to, san, fen, moveNum, isCheck?, times}` | Opponent moved |
| `GAME_ENDED` | `{gameId, result, reason, whiteRating?, blackRating?, whiteRatingDelta?, blackRatingDelta?, whiteNewAchievements?, blackNewAchievements?}` | Game over with rating changes and achievement unlocks |
| `OPPONENT_LEFT` | `{gameId}` | Opponent disconnected |
| `GAME_RECONNECTED` | `{gameId, color, fen, moveHistory, whiteTimeMs, blackTimeMs, timeControl?, opponent, rated}` | Full game state after successful reconnection |
| `OPPONENT_DISCONNECTED` | `{gameId}` | Opponent lost connection (20s grace period starts) |
| `OPPONENT_RECONNECTED` | `{gameId}` | Opponent restored connection |
| `TIME_UPDATE` | `{gameId, whiteTime, blackTime}` | Clock state (every 1s) |
| `LOBBY_LIST` | `{games: LobbyGameInfo[]}` | Current list of waiting games |
| `LOBBY_UPDATE` | `{action, game?, gameId?}` | Game added/removed from lobby |

### Game States
- **waiting**: First player joined, waiting for second
- **active**: Both players present, clock running
- **ended**: Game concluded

### Game End Reasons
`checkmate`, `stalemate`, `resignation`, `timeout`, `disconnection`, `abandonment`, `insufficient_material`, `threefold_repetition`, `fifty_move_rule`, `agreement`

### Time Controls
- Set via `timeControl: { initialTime: 600, increment: 5 }` in `GAME_CREATE` (seconds)
- Clock precision: 100ms ticks
- Clock starts when second player joins
- Increment added after each move
- Times in milliseconds via `TIME_UPDATE` and move responses

### Garbage Collection
- Runs every 1 minute
- Ended games removed after 5 minutes
- Waiting games removed after 30 minutes

### Server-Side Move Validation

Uses `internal/chess` package (wraps `github.com/notnil/chess`):
- Move legality validation
- Turn order enforcement
- Check/checkmate/stalemate detection
- Draw conditions (insufficient material, threefold repetition, 50-move rule)
- SAN notation generation (e.g., "e4", "Nxf3+", "O-O")
- Promotion handling ("q", "r", "b", "n")

### Lobby Flow
1. Client: `LOBBY_SUBSCRIBE` → receives `LOBBY_LIST` with all waiting games
2. As games are created/joined: receives `LOBBY_UPDATE` with `action: "added"` or `"removed"`
3. Client: `LOBBY_UNSUBSCRIBE` to stop receiving updates

### Game Flow
1. Player A: `GAME_CREATE` → receives `GAME_CREATED` with gameId (lobby subscribers notified)
2. Player A shares gameId URL or Player B finds game in lobby
3. Player B: `GAME_JOIN` → both receive `GAME_STARTED` (clock starts, lobby subscribers notified)
4. Players alternate: `MOVE` → sender gets `MOVE_ACCEPTED`, opponent gets `OPPONENT_MOVE`
5. Both receive `TIME_UPDATE` every second
6. Game ends: both receive `GAME_ENDED` with result, reason, rating deltas, and achievement unlocks

### Reconnection Flow
1. Player disconnects → server starts 20-second grace period
2. After grace period elapses without reconnection → opponent receives `OPPONENT_DISCONNECTED`
3. Disconnected player sends `GAME_RECONNECT` with gameId → receives `GAME_RECONNECTED` with full state (FEN, move history as UCI, clock times, opponent info)
4. Opponent receives `OPPONENT_RECONNECTED` → game resumes normally

## Training API

REST endpoints for endgame training positions. All public (no auth required).

### GET /api/training/endgame/random

Returns a random endgame position matching criteria.

**Query Parameters:**
- `difficulty` (1-10): Internal level mapping to rating ranges. UI exposes 6 levels:
  - Beginner (1) → 0-500
  - Easy (2) → 400-800
  - Medium (4) → 1000-1400
  - Hard (6) → 1600-2000
  - Expert (8) → 2200-2600
  - Grandmaster (10) → 2700-3500
- `theme`: Filter by endgame theme (pawnEndgame, rookEndgame, bishopEndgame, knightEndgame, queenEndgame, queenRookEndgame, basicMate, opposition, lucena, philidor)
- `side`: 'w' or 'b' (filter by side to move)
- `exclude`: Position ID to exclude (avoid repeats)
- `requireOpponentMaterial`: 'false' to include K vs K+pieces (default true, auto-disabled for basicMate)

**Response:**
```json
{
  "positionId": "abc123",
  "fen": "8/8/4k3/8/4K3/4P3/8/8 w - - 0 1",
  "initialEval": 450,
  "theme": "pawnEndgame",
  "difficulty": 3,
  "solutionMoves": "Kd5 Kd7 e4..."
}
```

### GET /api/training/endgame/themes

Returns list of available endgame themes with counts.

### GET /api/training/endgame/stats

Returns position counts by difficulty level.

## Puzzle API

### POST /api/puzzle/result

Submit puzzle solve/fail result with ELO rating update. Requires authentication.

**Rate Limiting:** 3-second minimum between submissions.

**Request Body:**
```json
{
  "puzzle_id": "mate2_001",
  "category": "mate-in-2",
  "solved": true
}
```

**Category → Puzzle Rating Mapping:**
- `mate-in-2` → 1200
- `mate-in-3` → 1600

**Response:**
```json
{
  "new_rating": 1215,
  "rating_delta": 15,
  "old_rating": 1200,
  "new_achievements": [{"id": "first_puzzle", "name": "First Steps", ...}]
}
```

## ELO Rating System

The `internal/elo` package handles rating calculations:

- **Multiplayer:** K-factor 40 for players with <10 games, 32 after. Standard ELO formula with 0-4000 clamping.
- **Puzzles:** Separate puzzle rating with own K-factor and history tracking.
- `Calculate(whiteRating, blackRating, whiteGames, blackGames, result)` → `RatingChange`
- `CalculatePuzzle(playerRating, puzzleRating, playerGames, solved)` → `PuzzleRatingChange`

## Achievements System

The `internal/achievements` package defines 51 achievements across 6 categories:

| Category | Count | Examples |
|----------|-------|---------|
| Loyalty | 4 | Account age milestones (1yr-5yr) |
| Streaks | 8 | Win streaks (3, 5, 10, 20), Puzzle streaks (3, 5, 10, 20) |
| Rating | 14 | Rating milestones (1600-3000), Puzzle rating milestones (1400-3000) |
| Chess Moments | 6 | Back Rank Mate, En Passant, Scholar's Mate |
| Volume | 11 | Games played (10-1000), Puzzles solved (10-500) |
| Fun | 8 | Stalemate, Win on Time, Marathon (100+ moves) |

**Rarity levels:** Common, Uncommon, Rare, Epic, Legendary (1-10 points each)

Achievement checking runs automatically on game end and puzzle completion.

## Dependencies

```
go-chi/chi/v5           v5.2.1      # Router
gorilla/websocket       v1.5.3      # WebSocket
joho/godotenv           v1.5.1      # .env loading
lib/pq                  v1.10.9     # PostgreSQL driver
notnil/chess            v1.10.0     # Chess logic
redis/go-redis/v9       v9.7.0      # Redis client
golang.org/x/oauth2     v0.30.0     # OAuth2
prometheus/client_golang v1.23.2    # Prometheus metrics
```

## Adding New Endpoints

1. Add handler in `internal/controllers/`
2. Use `middleware.UserIDFromContext(r.Context())` for authenticated user
3. Use `httpx.WriteJSON()` / `httpx.WriteJSONError()` for responses
4. Use `logger.Info()` / `logger.Error()` with `logger.F()` for logging
5. Use `validation.*` for input validation
6. Register route in `cmd/server/main.go` (choose appropriate rate limit group)
7. Add DB queries in `internal/database/` if needed

## Adding New OAuth Provider

1. Add client ID/secret fields to `config.Config`
2. Create `initProviderName()` in `auth/providers.go`
3. Call it from `InitOAuthProviders()`
4. Add routes in `main.go` under auth rate limiter group

**OAuth Flow:**
Login → State cookie → Provider auth → Callback → Token exchange (30s timeout) → Fetch user info → Create session → Upsert profile → Redirect to username setup or home

**Provider User ID Formats:**
- Google: `id` field as-is
- GitHub: `github_{id}` (prefixed to avoid collisions)
- Discord: `discord_{id}` (prefixed to avoid collisions)

## Validation Rules

### Username
- Length: 3-20 characters
- Format: starts with letter, alphanumeric + underscore only
- No consecutive underscores
- Reserved names blocked (admin, system, nxtchess, etc.)
- Offensive content filter

### Profile Icons
Whitelist: `white-king`, `white-queen`, `white-rook`, `white-bishop`, `white-knight`, `white-pawn`, `black-king`, `black-queen`, `black-rook`, `black-bishop`, `black-knight`, `black-pawn`

## Security Notes

- All chess moves validated server-side (prevents cheating)
- Session tokens: crypto/rand, 256-bit, base64-encoded
- OAuth state parameter prevents CSRF
- CORS locked to frontend origin
- Rate limiting prevents brute force / DDoS
- CSP header restricts resource loading
- No secrets in response bodies
- Secure cookies (HttpOnly, Secure in prod)

## Performance Notes

- Connection pooling (25 max open, 5 idle, 5min lifetime)
- Query timeout: 5 seconds default
- RWMutex allows concurrent reads in WebSocket
- Token bucket rate limiting (efficient, no per-request allocations)
- Message buffering (256 per client) with warning on full buffer
- Two-phase garbage collection to minimize lock contention
