# CLAUDE.md

## Project overview

NXT Chess is a PWA and Flutter mobile app for real-time multiplayer chess with AI training, analysis, and puzzle modes. WebSocket multiplayer, Stockfish engine integration, ELO-rated play, achievements, and offline support.

## App-specific documentation

Each app has its own CLAUDE.md with component details, services, and patterns:

- [Frontend](apps/frontend/CLAUDE.md) - SolidJS + TypeScript + Vite + CSS Modules
- [Backend](apps/backend/CLAUDE.md) - Go + Chi + PostgreSQL + Redis + WebSocket
- [Mobile](apps/mobile/CLAUDE.md) - Flutter + Riverpod + dartchess + multistockfish

## Development commands

```bash
just dev                    # Build + run all services (frontend, backend, db, redis)
just up PROFILES=backend    # Backend + db + redis only
just up PROFILES=frontend   # Frontend only
just logs PROFILES=backend  # Follow logs
just exec-db                # psql into PostgreSQL
just exec-redis             # redis-cli
just clean PROFILES=full    # Remove containers + volumes
just prod-up                # Start production stack
```

Frontend: http://localhost:5173 | Backend: http://localhost:8080

### Frontend (from apps/frontend/)

```bash
yarn dev           # Vite dev server with HMR
yarn build         # TypeScript + Vite production build
yarn type:check    # Type checking only
yarn format        # Prettier formatting
yarn lint          # ESLint
yarn test          # Vitest
```

### Mobile (from apps/mobile/)

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
```

Grafana: http://localhost:3000 (admin/admin)

## Tech stack

- **Frontend (Web)**: SolidJS + TypeScript + Vite + CSS Modules + PWA (vite-plugin-pwa)
- **Frontend (Mobile)**: Flutter + Dart + Riverpod + freezed + go_router
- **Backend**: Go 1.24 (Chi router) + PostgreSQL 15 + Redis 7 + gorilla/websocket
- **Chess**: chess.js (web), dartchess + chessground (mobile), notnil/chess (server)
- **Engine**: stockfish.js lite-st 7MB (web), native multistockfish (mobile)
- **Infrastructure**: Docker Compose + Caddy + Nginx, GitHub Actions CI

## Key patterns

**Controller/Presenter**: `ChessBoardController` handles game logic via extracted hooks (`useAudioFeedback`, `useBoardAnnotations`, `useEvaluation`, `useMoveAnimation`). `ChessBoard` is purely presentational.

**Multi-store architecture**: Six independent SolidJS stores compose via context: chess, timer, engine, ui, multiplayer, lobby. Not a monolithic store.

**Unified context abstraction**: `UnifiedGameContext` provides a mode-agnostic interface. Components don't know about Play vs Training vs Analyze vs Puzzle. Each mode has its own provider implementing the unified interface.

**Three-layer engine resilience**: StockfishEngine (UCI protocol) -> ResilientEngine (circuit breaker, auto-recovery) -> EnginePool (allocation per purpose/gameId, max 4, idle timeout).

**Session layer**: GameSession executes commands (APPLY_MOVE, RESIGN, TIMEOUT, NAVIGATE_HISTORY). SessionManager singleton manages concurrent sessions with BoardCache for O(1) legal move lookups.

## Database

Six tables: `profiles`, `games`, `rating_history`, `puzzle_rating_history`, `endgame_positions`, `user_achievements`. Schema in `db/init.sql`, migrations in `db/migrations/` (000001-000005).

IMPORTANT: When adding a new migration, update 3 places: `db/migrations/`, `apps/backend/internal/migrate/migrations/` (embedded in Go binary), and `docker-compose.dev.yaml` DB init volumes.

## Git conventions

Commit prefixes: `feat:`, `fix:`, `chore:`, `refactor:`, `style:`, `nit:`
