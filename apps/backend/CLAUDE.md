# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See also: [Root CLAUDE.md](../../CLAUDE.md) for full-stack commands and frontend info.

## Development Commands

```bash
# From project root - recommended approach
make up PROFILES=backend      # Start backend + PostgreSQL + Redis
make logs PROFILES=backend    # Follow logs
make exec-db                  # psql into PostgreSQL (chess_db)
make exec-redis               # redis-cli

# From apps/backend/ - local Go development
go mod tidy                   # Sync dependencies
go run cmd/server/main.go     # Run locally (requires running DB/Redis)
go build -o server cmd/server/main.go  # Build binary
```

## Architecture

### Entry Point and Routing
`cmd/server/main.go` initializes all services and registers Chi routes:
- WebSocket: `GET /ws` (multiplayer game connections)
- OAuth routes: `/auth/{google,github,discord}/{login,callback}` (rate limited: 10/min)
- Logout: `POST /auth/logout` (rate limited: 10/min)
- Health routes: `/health`, `/health/live`, `/health/ready` (no rate limit)
- Protected routes (require session, rate limited: 60/min): `/profile/{username}`, `/check-username`, `/set-username`

### Package Structure
```
internal/
├── auth/           # OAuth provider system (generic handlers + provider configs)
├── chess/          # Chess move validation wrapper (uses notnil/chess)
├── config/         # Environment config loader (config.Load())
├── controllers/    # HTTP handlers (profile, auth operations)
├── database/       # Direct SQL queries with connection pooling
├── httpx/          # JSON response helpers, secure cookie factory
├── logger/         # Structured logging with levels (DEBUG/INFO/WARN/ERROR)
├── middleware/     # CORS, Recovery, Security, Session, RateLimit
├── models/         # Data structures (Profile, Game, PublicProfile)
├── sessions/       # Redis session store operations
├── validation/     # Input validation (username rules, etc.)
├── ws/             # WebSocket hub, client, game management for multiplayer
└── utils/          # Random string generation, auth redirects
```

### Key Patterns

**Structured Logging**: Use `logger.Info()`, `logger.Error()`, etc. with `logger.F()` for fields:
```go
logger.Info("User logged in", logger.F("userId", id, "provider", "google"))
```

**Input Validation**: Use `validation.ValidateUsername()` and similar functions:
```go
if err := validation.ValidateUsername(username); err != nil {
    httpx.WriteJSONError(w, http.StatusBadRequest, err.Message)
    return
}
```

**Rate Limiting**: Three preset limiters available:
- `NewAuthRateLimiter()` - 10/min, burst 5 (auth endpoints)
- `NewAPIRateLimiter()` - 60/min, burst 20 (general API)
- `NewStrictRateLimiter()` - 5/min, burst 3 (sensitive operations)

**OAuth Provider System**: Generic handlers in `auth/oauth.go` with provider-specific configs in `auth/providers.go`.

**Session Authentication**: Cookie-based sessions stored in Redis (24h TTL). Session middleware extracts `session_token` cookie, looks up userID in Redis, and attaches to request context via `middleware.UserIDFromContext()`.

**Security Middleware**: Adds headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, CSP, HSTS in production).

**Secure Cookies**: Use `httpx.NewSecureCookie(cfg, name, value, maxAge)` which sets `Secure` and `SameSite` based on environment.

### Middleware Stack
Order matters - applied from outermost to innermost:
1. CORS (allows cross-origin requests from frontend)
2. Recovery (panic handling, hides details in production)
3. Security (security headers)
4. Rate Limiting (per route group)
5. Session (authentication for protected routes)

### Health Checks
- `GET /health` - Full health with DB/Redis status (JSON)
- `GET /health/live` - Liveness probe (always 200 if running)
- `GET /health/ready` - Readiness probe (checks DB + Redis)

## Database Schema

See `db/init.sql` for full schema. Key tables:
- `profiles` - user_id (PK), username, rating, created_at
- `games` - game_id (UUID), pgn, playerW_id, playerB_id, result, created_at (FK to profiles)
- `rating_history` - user_id (FK), rating, created_at

Migrations in `db/migrations/` for existing databases.

## Environment Variables

See `.env.example` for all options. Key variables:

```bash
# Server
ENV=development|production
LOG_LEVEL=DEBUG|INFO|WARN|ERROR
LOG_JSON=true|false

# Database (with connection pooling)
DATABASE_URL=postgres://...
DB_MAX_OPEN_CONNS=25
DB_MAX_IDLE_CONNS=5
DB_CONN_MAX_LIFETIME_MINS=5

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8080

# OAuth (optional - missing providers are skipped)
GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET
DISCORD_CLIENT_ID / DISCORD_CLIENT_SECRET
```

## Adding New Endpoints

1. Add handler in `internal/controllers/`
2. Use `middleware.UserIDFromContext()` for authenticated user
3. Use `httpx.WriteJSON/WriteJSONError` for responses
4. Use `logger.Info/Error` for logging
5. Use `validation.*` for input validation
6. Register route in `cmd/server/main.go` (choose appropriate rate limit group)
7. Add any new DB queries in `internal/database/`

## Adding New OAuth Provider

1. Add client ID/secret to `config.Config`
2. Create `initProviderName()` in `auth/providers.go`
3. Call it from `InitOAuthProviders()`
4. Add routes in `main.go` under the auth rate limiter group

## Username Validation Rules

Validated in `validation.ValidateUsername()`:
- Length: 3-20 characters
- Format: starts with letter, alphanumeric + underscore only
- No consecutive underscores
- Reserved names blocked (admin, system, etc.)
- Basic offensive content filter

## WebSocket Multiplayer Protocol

Connect to `ws://localhost:8080/ws` for multiplayer games. Session cookie is optional (allows anonymous play).

### Message Format
```json
// Client → Server
{ "type": "MESSAGE_TYPE", "data": { ... } }

// Server → Client
{ "type": "MESSAGE_TYPE", "data": { ... } }
```

### Client → Server Messages
| Type | Data | Description |
|------|------|-------------|
| `PING` | none | Heartbeat |
| `GAME_CREATE` | `{timeControl?}` | Create new game (you play white) |
| `GAME_JOIN` | `{gameId}` | Join existing game (you play black) |
| `MOVE` | `{gameId, from, to, promotion?}` | Make a move |
| `RESIGN` | `{gameId}` | Resign from game |
| `GAME_LEAVE` | `{gameId}` | Leave/cancel game |

### Server → Client Messages
| Type | Data | Description |
|------|------|-------------|
| `PONG` | none | Heartbeat response |
| `ERROR` | `{code, message}` | Error occurred |
| `GAME_CREATED` | `{gameId, color}` | Game created, waiting for opponent |
| `GAME_JOINED` | `{gameId, color}` | Successfully joined game |
| `GAME_STARTED` | `{gameId, fen, whitePlayer, blackPlayer}` | Game started |
| `MOVE_ACCEPTED` | `{gameId, from, to, san, fen, moveNum, isCheck?}` | Your move was accepted |
| `MOVE_REJECTED` | `{gameId, reason, fen, moveNum}` | Your move was rejected (illegal move) |
| `OPPONENT_MOVE` | `{gameId, from, to, san, fen, moveNum, isCheck?}` | Opponent made a move |
| `GAME_ENDED` | `{gameId, result, reason}` | Game ended (checkmate, stalemate, resignation, etc.) |
| `OPPONENT_LEFT` | `{gameId}` | Opponent disconnected |
| `TIME_UPDATE` | `{gameId, whiteTime, blackTime}` | Periodic clock update (ms) |

### Server-Side Move Validation

Moves are validated server-side using the `internal/chess` package (wraps `github.com/notnil/chess`):
- Validates move legality (piece can make that move)
- Validates turn order (correct player's turn)
- Detects check, checkmate, stalemate
- Detects draw conditions (insufficient material, threefold repetition, fifty-move rule)
- Returns SAN notation (e.g., "e4", "Nxf3+", "O-O")

### Time Controls

Games support chess clocks with increment:
- Set via `timeControl: { initialTime: 600, increment: 5 }` in `GAME_CREATE` (seconds)
- Clock starts when second player joins (game becomes active)
- Active player's clock decrements; opponent's clock is paused
- Increment added after each move
- Timeout results in loss for the player whose time expires
- Times reported in milliseconds via `TIME_UPDATE` (every second) and in move responses

### Testing
Open `test_ws.html` in browser to test WebSocket connections interactively.

### Game Flow
1. Player A: `GAME_CREATE` with optional timeControl → receives `GAME_CREATED` with gameId
2. Player A: Share gameId with Player B
3. Player B: `GAME_JOIN` with gameId → both receive `GAME_STARTED` (clock starts for white)
4. Players alternate: `MOVE` → sender gets `MOVE_ACCEPTED`, opponent gets `OPPONENT_MOVE` (both include current times)
5. Both players receive `TIME_UPDATE` every second with current clock times
6. Game ends: both receive `GAME_ENDED` with result and reason (timeout, checkmate, resignation, etc.)
