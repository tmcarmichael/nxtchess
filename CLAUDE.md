# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NXT Chess is a multiplayer chess platform with AI training modes. Currently in Phase 4 development (training modes, engine integration, rating system).

## Development Commands

### Quick Start (Full Stack)
```bash
make dev                    # Build + run frontend, backend, db, redis
```
Frontend: http://localhost:5173 | Backend: http://localhost:8080

### Selective Startup
```bash
make up PROFILES=backend    # Backend + db + redis only
make up PROFILES=frontend   # Frontend only
```

### Frontend Commands (run from apps/frontend/)
```bash
yarn dev           # Vite dev server
yarn build         # TypeScript + Vite production build
yarn type:check    # Type checking only
yarn format        # Prettier formatting
yarn format:check  # Verify formatting (runs in prebuild)
```

### Useful Make Targets
```bash
make logs PROFILES=backend  # Follow logs
make exec-db                # psql into PostgreSQL
make exec-redis             # redis-cli
make clean PROFILES=full    # Remove containers + volumes
```

## Architecture

### Tech Stack
- **Frontend**: SolidJS + TypeScript + Vite + CSS Modules
- **Backend**: Go (Chi router) + PostgreSQL + Redis
- **Chess**: chess.js (validation) + stockfish.js (browser-side AI/eval)

### Frontend Structure (apps/frontend/src/)
```
components/
├── chess/       # Reusable chess UI (ChessBoard, ChessPiece, etc.)
├── play/        # Play mode with PlayBoardController
├── training/    # Training mode with TrainingBoardController
├── home/        # Home page
├── user/        # Auth & profile
└── common/      # Header, footer, 404

store/
├── GameContext.tsx + gameStore.ts   # Game state (SolidJS context + store)
└── UserContext.tsx + userStore.ts   # User/auth state

services/
├── chessGameService.ts              # Game logic extracted from store
└── engine/
    ├── aiEngineWorker.ts            # AI move computation (Web Worker)
    └── evalEngineWorker.ts          # Position evaluation (Web Worker)

types/
├── chessBoard.types.ts
└── gameState.types.ts
```

### Backend Structure (apps/backend/)
```
cmd/server/main.go                    # Entry point
internal/
├── auth/          # OAuth 2.0 (Google, Discord, GitHub)
├── controllers/   # HTTP handlers
├── database/      # Direct SQL queries (no ORM)
├── models/        # Data structures
├── middleware/    # CORS, session auth, recovery
└── sessions/      # Redis session store
```

### Key Patterns

**Controller/Presenter Pattern**: Components like `PlayBoardController` handle logic; `ChessBoard` is purely presentational.

**Web Workers for Engines**: AI and eval run in separate workers to prevent UI blocking and UCI race conditions.

**SolidJS Patterns**:
- `createStore()` for complex state
- `createSignal()` for simple reactive values
- Context + Provider for global state
- `splitProps()` to separate reactive/static props

**Game Modes**: `'play' | 'training' | 'analysis'`
**Sides**: `'w' | 'b'` (white/black)
**AI Playstyles**: `'aggressive' | 'defensive' | 'balanced' | 'random' | 'positional'`

### Data Flow
1. User configures game via modal (PlayModal/TrainingModal)
2. GameStore manages chess.js state + UI state
3. Stockfish in Web Worker computes AI moves
4. Separate eval worker provides position evaluation
5. Backend persists user profiles/games via OAuth sessions

## Environment Setup

**Frontend** (apps/frontend/.env):
```
VITE_BACKEND_URL=http://localhost:8080
```

**Backend** (apps/backend/.env): Copy from .env.example, add OAuth credentials for sign-in functionality.

## Git Conventions

Commit prefixes: `feat:`, `fix:`, `chore:`, `refactor:`, `style:`

Example: `feat: training mode select either side`
