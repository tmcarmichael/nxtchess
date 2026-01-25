# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See also: [Root CLAUDE.md](../../CLAUDE.md) for full-stack commands and backend info.

## Development Commands

```bash
yarn dev           # Vite dev server (http://localhost:5173)
yarn build         # TypeScript + Vite production build (runs format:check + lint)
yarn type:check    # Type checking only
yarn format        # Prettier formatting
yarn format:check  # Verify formatting
yarn lint          # ESLint check
yarn lint:fix      # ESLint auto-fix
yarn test          # Run Vitest unit tests
yarn test:watch    # Vitest watch mode
yarn test:coverage # Coverage report
yarn test:e2e      # Playwright E2E tests
yarn test:e2e:ui   # Playwright with UI
```

## Architecture

### Entry Point & Providers

Entry point `src/index.tsx` wraps the app in `UserProvider` → `Router`. **GameProvider is NOT global** — each game mode (Play, Training) wraps itself with its own provider internally. This ensures multiplayer code is not loaded on training pages and vice versa.

Pre-warms Stockfish AI engine on app load. Terminates both AI and eval engines on `beforeunload`.

Routes (all lazy-loaded via `routes.tsx`):

- `/` → HomeContainer
- `/play` → PlayContainer (multiplayer or vs AI)
- `/play/:gameId` → PlayContainer (join multiplayer game via URL)
- `/training` → TrainingContainer (untimed practice with eval)
- `/username-setup` → UsernameSetup
- `/profile/:username` → UserProfile
- `*` → CommonNotFoundPage

### Component Organization

**`chess/` (12 components)** — Core chess UI:

- `ChessBoardController` — Main game controller (move validation, drag/drop, AI triggers, animations)
- `ChessBoard` — Presentational board (receives callbacks, renders squares)
- `ChessPiece` — Individual piece renderer with drag support
- `ChessClock` — Timer display
- `ChessEvalBar` — Evaluation visualization bar
- `ChessEngineOverlay` — Engine status indicator overlay
- `ChessMaterialDisplay` — Captured pieces display
- `ChessPromotionModal` — Pawn promotion dialog
- `ChessGameModal` — Game setup modal base
- `ChessEndModal` — Game result display
- `ChessSideSelector` — Color selection UI
- `ChessDifficultySlider` — AI difficulty picker

**`game/` (7 components)** — Game layout:

- `GameContainer` — Layout wrapper (two-column/single-column responsive)
- `GameInfoPanel` — Player info and stats
- `GameNotation` — Move history display with SAN notation
- `ButtonPanel` — Action buttons container
- `GamePanelButton` — Styled button component
- `DifficultyDisplay` — Shows AI difficulty level
- `PlayerColorDisplay` — Player color indicator

**`play/` (5 components)** — Multiplayer mode:

- `PlayContainer` — Wraps with PlayGameProvider
- `PlayControlPanel` — Multiplayer-specific controls
- `PlayModal` — Game creation/join interface
- `PlayNavigationPanel` — Move history navigation
- `PlayResignModal` — Resignation confirmation

**`training/` (4 components)** — Training mode:

- `TrainingContainer` — Wraps with TrainingGameProvider
- `TrainingControlPanel` — Training controls (hints, eval)
- `TrainingModal` — Training setup dialog
- `TrainingNavigationPanel` — Move history navigation for training mode

**`home/` (2 components)** — Landing page:

- `HomeContainer` — Home page layout
- `HomeSiteHero` — Hero section with CTA

**`user/` (4 components)** — Auth & profile:

- `UserSignInModal` — OAuth login interface
- `UsernameSetup` — Initial username entry
- `UserProfile` — Player profile page
- `ProfileIconPicker` — Avatar selector

**`common/` (6 components)** — Shared layout:

- `CommonSiteHeader` — Top navigation bar
- `CommonSiteFooter` — Footer
- `CommonErrorBoundary` — Error handling wrapper
- `CommonNotFoundPage` — 404 page
- `CommonMobileMenu` — Mobile navigation drawer
- `NetworkStatusBanner` — Online/offline indicator

### Component Patterns

**Controller/Presenter separation**: `ChessBoardController` handles all game logic (move validation, drag/drop, promotion, AI triggers). `ChessBoard` is purely presentational—receives callbacks and renders squares.

**Container components** (`PlayContainer`, `TrainingContainer`) wrap themselves with their own provider and compose the controller with mode-specific panels and modals.

### State Management

#### Global User Store (`store/user/`)

- `UserContext.tsx` — Wraps entire app with user authentication state
- `userStore.ts` — User login, profile, ratings management
- States: `isLoggedIn`, `username`, `rating`, `profileIcon`
- Actions: `checkUserStatus()`, `saveUsername()`, `fetchUserProfile()`, `setProfileIcon()`, `logout()`

#### Mode-Specific Game Stores (`store/game/`)

Five independent SolidJS stores compose via context (NOT a monolithic store):

1. **ChessStore** (`createChessStore.ts`) — FEN, move history, game state, player color, current turn, captured pieces, game lifecycle
2. **TimerStore** (`createTimerStore.ts`) — White/black time in ms, time control, increment, 100ms tick precision
3. **EngineStore** (`createEngineStore.ts`) — Engine status (idle/loading/ready/error), difficulty, AI side, play style
4. **UIStore** (`createUIStore.ts`) — Board view perspective, modal visibility flags
5. **MultiplayerStore** (`createMultiplayerStore.ts`) — Game ID, opponent info, connection state, typed event emission

#### Context Providers

- **`PlayGameContext.tsx`** — Creates all 5 stores, provides `PlayGameContextValue` with `PlayActions`
- **`TrainingGameContext.tsx`** — Creates 4 stores (no multiplayer), provides `TrainingGameContextValue` with `TrainingActions`
- **`useGameContext.ts`** — Unified interface that both modes implement, allows components like `ChessBoardController` to work across modes

#### Action Factories (`store/game/actions/`)

- `createCoreActions.ts` — Shared actions (navigation, exit, flip board)
- `createSinglePlayerActions.ts` — Base single-player logic
- `createMultiplayerActions.ts` — Base multiplayer logic
- `createPlayActions.ts` — Play-mode specific (AI coordination + multiplayer sync)
- `createTrainingActions.ts` — Training-mode specific (eval computation, hint logic)

#### Type Definitions (`store/game/types.ts`)

```typescript
CoreActions       // jumpToMove, flipBoard, exitGame
SinglePlayerActions extends CoreActions  // startNewGame, applyPlayerMove, resign
MultiplayerActions extends CoreActions   // startMultiplayerGame, joinMultiplayerGame
PlayActions = SinglePlayerActions & MultiplayerActions
TrainingActions = SinglePlayerActions
```

### Services Layer

#### Engine Services (`services/engine/`)

- `StockfishEngine.ts` — Low-level UCI protocol wrapper (`postMessage`, `sendCommand` with timeout)
- `aiEngineWorker.ts` — AI move computation (Web Worker) with ELO limiting and playstyle options
- `evalEngineWorker.ts` — Position evaluation (separate Web Worker) for training mode eval bar
- `EnginePool.ts` — Multi-engine allocation per (purpose, gameId), max 4 engines, 1min idle timeout
- `ResilientEngine.ts` — Circuit breaker wrapper (3-strike rule, auto-recovery, command queuing)
- `engineService.ts` — High-level engine service interface
- `moveEvalService.ts` — Move quality evaluation for training hints (best move comparison)

Two separate Web Workers prevent UCI command race conditions. Both support single-game (`computeAiMove`) and multi-game (`computeAiMoveForGame`) APIs.

#### Game Services (`services/game/`)

- `chessGameService.ts` — Game rule enforcement (`fenToBoard`, `getLegalMoves`, `prepareMove`, `processCapturedPiece`)
- `gameLifecycle.ts` — State machine (idle → initializing → playing → ended)
- `BoardCache.ts` — O(1) board lookups, caches legal moves per position
- `fenUtils.ts` — FEN parsing (`getTurnFromFen`, `getRulesFromFen`)
- `pieceUtils.ts` — Piece manipulation (`getPieceColor`, `makePiece`)

**Session Layer** (`services/game/session/`) — Command pattern:

- `GameSession.ts` — Single game with commands (APPLY_MOVE, RESIGN, TIMEOUT), BoardCache integration
- `SessionManager.ts` — Singleton managing multiple concurrent sessions
- `types.ts` — Session type definitions

#### Network Services (`services/network/`)

- `ReconnectingWebSocket.ts` — WebSocket with exponential backoff (max 5 attempts, message queuing)

#### Sync Services (`services/sync/`)

- `GameSyncService.ts` — WebSocket client using ReconnectingWebSocket
- `useGameSync.ts` — SolidJS integration hook
- `types.ts` — Message types (GAME_CREATE, GAME_JOIN, MOVE, RESIGN, TIME_UPDATE, GAME_ENDED)

#### Persistence Services (`services/persistence/`)

- `GamePersistence.ts` — **IndexedDB** storage (DB: 'nxtchess', store: 'game_sessions'), 7-day cleanup
- `useAutoPersist.ts` — Auto-save hook (5-second periodic + 1-second debounced on change)

#### Audio Services (`services/audio/`)

- `AudioService.ts` — Move sounds and low-time warnings

#### Preferences Services (`services/preferences/`)

- `PreferencesService.ts` — User settings storage (singleton, LocalStorage)

#### Training Services (`services/training/`)

Modular training infrastructure for endgame practice:

- `index.ts` — Barrel export with full documentation
- `types.ts` — Training type definitions (TrainingConfig, TrainingScenario, etc.)
- `scenarios.ts` — Training scenario configurations (endgame themes, difficulty mapping)
- `positionSource.ts` — Position source resolution (API for random positions, predefined for specific themes)
- `terminationEvaluator.ts` — Training termination conditions (checkmate, draw, incorrect move)
- `scoringCalculator.ts` — Training performance scoring logic

#### Offline Services (`services/offline/`)

- `AssetPreloader.ts` — Pre-loads critical assets (fonts, Stockfish WASM) for offline capability

### Key Types (`src/types/`)

**chess.ts:**

```typescript
PieceType = 'wP' | 'bP' | 'wN' | ... (12 piece combinations)
Square = 'a1' | 'a2' | ... (64 squares)
Board = PieceType[][] (8x8 array)
PromotionPiece = 'q' | 'r' | 'b' | 'n'
PIECE_VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9 }
```

**game.ts:**

```typescript
Side = 'w' | 'b';
GameMode = 'play' | 'training' | 'analysis';
GameLifecycle = 'idle' | 'initializing' | 'playing' | 'error' | 'ended';
OpponentType = 'ai' | 'human';
RatedMode = 'rated' | 'casual';
GamePhase = 'opening' | 'middlegame' | 'endgame';
GameWinner = Side | 'draw' | null;
GameOverReason = 'checkmate' | 'stalemate' | 'time' | 'resignation' | null;
```

### Shared Utilities (`src/shared/`)

**Config:**

- `constants.ts` — `TIME_VALUES_MINUTES`, `DIFFICULTY_VALUES_ELO` (6 UI levels: Beginner/Easy/Medium/Hard/Expert/Grandmaster mapping to internal 1-10)
- `env.ts` — Environment variables (`VITE_BACKEND_URL`, `VITE_DEBUG`)

**Hooks:**

- `useKeyboardNavigation.ts` — Arrow keys for move history, 'f' to flip board

**Utils:**

- `EventEmitter.ts` — TypedEventEmitter for decoupled communication
- `debug.ts` — Debug utilities
- `generateId.ts` — Session ID generation
- `stringUtils.ts` — String helpers

### CSS Modules

All components use `.module.css` files. Import as `styles` and reference as `styles.className`.

### Keyboard Shortcuts

Defined in `useKeyboardNavigation` hook, used by `ChessBoardController`:

- `ArrowLeft/Right`: Navigate move history
- `f`: Flip board view

### Testing

**Unit tests** (Vitest + @solidjs/testing-library):

- `store/game/stores/` — createChessStore, createTimerStore, createUIStore, createMultiplayerStore
- `store/user/` — userStore
- `services/game/` — chessGameService, fenUtils, pieceUtils, gameLifecycle
- `services/game/session/` — GameSession, SessionManager
- `services/network/` — ReconnectingWebSocket

**E2E tests** (Playwright):

- `yarn test:e2e` for headless, `yarn test:e2e:ui` with UI

## PWA Configuration

This is a **Progressive Web App** with full offline support and installability.

**Manifest** (`public/manifest.json`):

- Standalone display mode (no browser chrome)
- Portrait orientation
- App shortcuts: "Play" and "Train" quick actions
- Icons: 72x72 to 512x512 (including maskable icons for Android)

**Service Worker** (via `vite-plugin-pwa`):

- Auto-update registration
- Workbox for runtime caching strategies

**Workbox Caching Strategies:**

- `CacheFirst` for fonts (googleapis, gstatic) — 1-year expiration
- `CacheFirst` for WASM files (.wasm) — 30-day expiration
- `NetworkFirst` for API calls — 10s network timeout fallback

**Offline Capabilities:**

- IndexedDB persistence (`services/persistence/`) for game sessions
- Auto-save: 5-second periodic + 1-second debounced on state change
- Session recovery on app restart
- `NetworkStatusBanner` component shows online/offline status

**COOP/COEP Headers** (required for SharedArrayBuffer / multi-threaded Stockfish):

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: credentialless
```

## Vite Configuration

- `vite-plugin-pwa` for service worker and manifest generation
- COOP/COEP headers configured in dev server
- `vite-plugin-static-copy` for asset copying

## Dependencies

**Runtime:**

- solid-js 1.9.3, @solidjs/router 0.15.3
- chess.js 1.0.0 (move validation)
- stockfish (nmrugg/stockfish.js WASM)
- apexcharts + solid-apexcharts (charts)

**Dev:**

- TypeScript 5.6.2, Vite 6.0.5
- Vitest 4.0.17 + @vitest/coverage-v8
- Playwright 1.57.0
- ESLint 9.39.2, Prettier 3.4.2
- Husky 9.1.7 + lint-staged
