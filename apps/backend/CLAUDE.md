# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

No tests exist yet in this codebase.

## Architecture

### Entry Point and Routing
`cmd/server/main.go` initializes all services and registers Chi routes:
- OAuth routes: `/auth/{google,github,discord}/{login,callback}`
- Protected routes (require session): `/profile/{username}`, `/check-username`, `/set-username`

### Package Structure
```
internal/
├── auth/           # OAuth handlers (google, github, discord)
├── config/         # Environment config loader (config.Load())
├── controllers/    # HTTP handlers (profile operations)
├── database/       # Direct SQL queries against postgres (no ORM)
├── httpx/          # JSON response helpers
├── middleware/     # CORS, Recovery, Session auth
├── models/         # Data structures (Profile, Game, PublicProfile)
├── sessions/       # Redis session store operations
└── utils/          # Random string generation, auth redirects
```

### Key Patterns

**Session Authentication**: Cookie-based sessions stored in Redis (24h TTL). Session middleware extracts `session_token` cookie, looks up userID in Redis, and attaches to request context via `middleware.UserIDFromContext()`.

**Database Layer**: Uses `database/sql` directly with `lib/pq`. All queries are in `database/*.go`. Global `database.DB` is initialized once in `main.go`.

**OAuth Flow**:
1. `/auth/{provider}/login` - Generate state, set cookie, redirect to provider
2. `/auth/{provider}/callback` - Validate state, exchange code, create session, upsert profile, redirect to frontend

**Response Helpers**: Use `httpx.WriteJSON()` and `httpx.WriteJSONError()` for consistent JSON responses.

## Database Schema

Profiles table (PostgreSQL):
- `user_id` (TEXT, PK) - OAuth provider's user ID
- `username` (TEXT, nullable, unique)
- `rating` (INT)

## Environment Variables

Required for OAuth (copy from `.env.example`):
```
GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET
DISCORD_CLIENT_ID / DISCORD_CLIENT_SECRET
```

Service URLs:
```
DATABASE_URL="postgres://postgres:postgres@db:5432/chess_db?sslmode=disable"
REDIS_PORT="redis:6379"
FRONTEND_URL="http://localhost:5173"
BACKEND_URL="http://localhost:8080"
PORT="8080"
```

## Adding New Endpoints

1. Add handler in `internal/controllers/`
2. Use `middleware.UserIDFromContext()` for authenticated user
3. Use `httpx.WriteJSON/WriteJSONError` for responses
4. Register route in `cmd/server/main.go` (inside `pr.Group` for protected routes)
5. Add any new DB queries in `internal/database/`
