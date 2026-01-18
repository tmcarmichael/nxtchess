# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See also: [Root CLAUDE.md](../../CLAUDE.md) for full-stack commands and backend info.

## Development Commands

```bash
yarn dev           # Vite dev server (http://localhost:5173)
yarn build         # TypeScript + Vite production build
yarn type:check    # Type checking only
yarn format        # Prettier formatting
yarn format:check  # Verify formatting (runs in prebuild)
```

## Architecture

### Routing & Providers

Entry point `src/index.tsx` wraps the app in `UserProvider` → `GameProvider` → `Router`. All routes use lazy loading. Routes:

- `/` → HomeContainer
- `/play` → PlayContainer (multiplayer or vs AI)
- `/play/:gameId` → PlayContainer (join multiplayer game via URL)
- `/training` → TrainingContainer (untimed practice with eval)
- `/username-setup` → UsernameSetup
- `/profile/:username` → UserProfile

### Component Patterns

**Controller/Presenter separation**: `ChessBoardController` handles all game logic (move validation, drag/drop, promotion, AI triggers). `ChessBoard` is purely presentational—receives callbacks and renders squares.

**Container components** (`PlayContainer`, `TrainingContainer`) compose the controller with mode-specific panels and modals.

**Component organization**:
- `chess/` — Reusable chess UI (ChessBoard, ChessBoardController, ChessPiece, ChessClock, ChessEvalBar, etc.)
- `game/` — Game layout components (GameContainer, GameInfoPanel, ButtonPanel, PlayerColorDisplay)
- `play/` — Multiplayer mode (PlayContainer, PlayModal, PlayControlPanel, PlayResignModal)
- `training/` — Training mode (TrainingContainer, TrainingModal, TrainingControlPanel)
- `user/` — Auth & profile (UserSignInModal, UserProfile, UsernameSetup)
- `common/` — Shared layout (CommonSiteHeader, CommonSiteFooter, CommonErrorBoundary)

### State Management

`gameStore.ts` creates a SolidJS store factory (`createGameStore`) that:

- Wraps `chess.js` instance for move validation
- Manages timers, captured pieces, move history
- Coordinates with engine workers for AI moves and evaluation
- Uses `batch()` for atomic state updates

Access via `useGameStore()` hook which returns `[state, actions]`.

### Services Layer

**Engine services** (`services/engine/`):
- `aiEngineWorker.ts` — AI move computation via Stockfish with ELO limiting and playstyle options
- `evalEngineWorker.ts` — Position evaluation (used in training mode for eval bar)
- `EnginePool.ts` — Multi-engine management for concurrent games
- `ResilientEngine.ts` — Auto-recovery wrapper for engine failures
- Two separate Web Workers prevent UCI command race conditions
- Both workers support single-game (`computeAiMove`) and multi-game (`computeAiMoveForGame`) APIs

**Game services** (`services/game/`):
- `chessGameService.ts` — Game rule enforcement
- `gameLifecycle.ts` — State transitions
- `session/` — Session management layer:
  - `GameSession.ts` — Single game session with commands (ApplyMove, Resign, Timeout)
  - `SessionManager.ts` — Singleton managing multiple concurrent sessions

**Sync services** (`services/sync/`):
- `GameSyncService.ts` — WebSocket client for multiplayer
- `useGameSync.ts` — SolidJS integration hook
- Message types: GAME_CREATE, GAME_JOIN, MOVE, RESIGN, etc.

**Persistence** (`services/persistence/`):
- `GamePersistence.ts` — LocalStorage session storage
- `useAutoPersist.ts` — Auto-save hook with `createAutoPersist()` and `recoverActiveSession()`

**Preferences** (`services/preferences/`):
- `PreferencesService.ts` — User settings storage (singleton `preferences`)

### Key Types (`src/types/`)

```typescript
Side = 'w' | 'b'
GameMode = 'play' | 'training' | 'analysis'
OpponentType = 'ai' | 'human'
RatedMode = 'rated' | 'casual'
AIPlayStyle = 'aggressive' | 'defensive' | 'balanced' | 'random' | 'positional'
GamePhase = 'opening' | 'middlegame' | 'endgame'
Square = 'a1' | 'a2' | ... (64 chess squares)
PieceType = 'wP' | 'bP' | 'wN' | ... (all pieces)
PromotionPiece = 'q' | 'r' | 'b' | 'n'
```

### Shared Utilities (`src/shared/`)

```
config/      constants.ts (TIME_VALUES, DIFFICULTY_PRESETS), env.ts
hooks/       useKeyboardNavigation.ts (Arrow keys, 'f' to flip)
utils/       debug.ts, generateId.ts, stringUtils.ts
```

### CSS Modules

All components use `.module.css` files. Import as `styles` and reference as `styles.className`.

### Keyboard Shortcuts

Defined in `useKeyboardNavigation` hook, used by `ChessBoardController`:

- `ArrowLeft/Right`: Navigate move history
- `f`: Flip board view

## Vite Configuration

COOP/COEP headers enabled in `vite.config.ts` for SharedArrayBuffer support (required by Stockfish WASM).
