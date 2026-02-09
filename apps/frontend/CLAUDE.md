# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See also: [Root CLAUDE.md](../../CLAUDE.md) for full-stack commands and backend info.

## Development Commands

**Important:** All `yarn` commands below must be run from `apps/frontend/`, not from the monorepo root. Tools like `prettier`, `eslint`, and `vite` are installed in this package's `node_modules` and won't be found otherwise. If `node_modules` is missing or empty, run `yarn install` from this directory first.

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

Entry point `src/index.tsx` wraps the app in `SettingsProvider` → `UserProvider` → `Router`. **GameProvider is NOT global** — each game mode (Play, Training, Analyze, Puzzle) wraps itself with its own provider internally. This ensures multiplayer code is not loaded on training/analysis pages and vice versa.

Pre-warms Stockfish AI engine on app load. Terminates both AI and eval engines on `beforeunload`.

Routes (all lazy-loaded via `routes.tsx`):

- `/` → HomeContainer
- `/play` → PlayContainer (lobby browser, multiplayer, or vs AI)
- `/play/:gameId` → PlayContainer (join multiplayer game via URL)
- `/training` → TrainingContainer (untimed practice with eval)
- `/analyze` → AnalyzeContainer (position analysis with FEN/PGN import)
- `/puzzles` → PuzzleContainer (mate-in-N tactics puzzles)
- `/review` → ReviewContainer (post-game analysis with accuracy scoring, via PGN in location state)
- `/username-setup` → UsernameSetup
- `/profile/:username` → UserProfile
- `*` → CommonNotFoundPage

### Component Organization

**`chess/` (14 components)** — Core chess UI:

- `ChessBoardController` — Main game controller with extracted hooks:
  - `hooks/useAudioFeedback.ts` — Move sounds, capture/check audio
  - `hooks/useBoardAnnotations.ts` — Right-click drag arrows, square highlights
  - `hooks/useEvaluation.ts` — Engine evaluation bar integration
  - `hooks/useMoveAnimation.ts` — Piece movement animation coordination
- `ChessBoard` — Presentational board (receives callbacks, renders squares)
- `ChessBoardArrows` — Right-click drag arrow annotations with valid move filtering
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
- `TimeControlGrid` — Time control category selection (Bullet/Blitz/Rapid/Classical)

**`game/` (8 components)** — Game layout:

- `GameContainer` — Layout wrapper (two-column/single-column responsive)
- `GameInfoPanel` — Player info and stats
- `GameNotation` — Move history display with SAN notation
- `MoveHistoryPanel` — Move history panel wrapper
- `ButtonPanel` — Action buttons container
- `GamePanelButton` — Styled button component
- `DifficultyDisplay` — Shows AI difficulty level
- `PlayerColorDisplay` — Player color indicator

**`play/` (8 components)** — Multiplayer mode:

- `PlayContainer` — Wraps with PlayGameProvider
- `PlayHub` — Lobby browser showing available games with real-time updates
- `PlayModal` — Game creation/join interface
- `PlayAIModal` — AI game setup (difficulty, color, time control)
- `PlayCreateGameModal` — Multiplayer game creation (time control, rated/casual)
- `PlayControlPanel` — Multiplayer-specific controls
- `PlayNavigationPanel` — Move history navigation
- `PlayResignModal` — Resignation confirmation

**`training/` (4 components)** — Training mode:

- `TrainingContainer` — Wraps with TrainingGameProvider
- `TrainingControlPanel` — Training controls (hints, eval)
- `TrainingModal` — Training setup dialog
- `TrainingNavigationPanel` — Move history navigation for training mode

**`analyze/` (5 components)** — Analysis mode:

- `AnalyzeContainer` — Wraps with AnalyzeGameProvider, three-column layout
- `AnalyzeEnginePanel` — Multi-line engine analysis display (MultiPV)
- `AnalyzeControlPanel` — Analysis controls (import, reset)
- `AnalyzeImportModal` — FEN/PGN import dialog
- `AnalyzeNavigationPanel` — Move history navigation for analysis mode

**`puzzle/` (5 components)** — Puzzle/tactics mode:

- `PuzzleContainer` — Wraps with PuzzleGameProvider
- `PuzzleModal` — Puzzle category selection (mate-in-1/2/3)
- `PuzzleControlPanel` — Puzzle controls (next puzzle, category)
- `PuzzleNavigationPanel` — Move history navigation for puzzle mode
- `PuzzleFeedbackModal` — Correct/incorrect feedback after puzzle attempt
- `PuzzleHistoryStrip` — Visual strip showing recent puzzle results with clear history action

**`review/` (7 components)** — Post-game review mode:

- `ReviewContainer` — Wraps with PlayGameProvider, loads PGN from location state
- `ReviewSummaryPanel` — White/black accuracy percentages and move quality distribution
- `ReviewEvalGraph` — Evaluation graph visualization over the game
- `ReviewProgressBar` — Analysis progress indicator during engine processing
- `ReviewControlPanel` — Review controls (exit)
- `ReviewNavigationPanel` — Move navigation for review mode
- `GameReviewModal` — Modal for initiating game review

**`home/` (3 components)** — Landing page:

- `HomeContainer` — Home page layout
- `HomeSiteHero` — Hero section with floating chess pieces animation (gravitational spread) and CTA
- `HomeQuickPlay` — Quick-start cards for instant play (Bullet/Blitz/Rapid/Classical time controls, Mate-in-1/2/3 puzzles) with staggered animation

**`user/` (6 components)** — Auth & profile:

- `UserSignInModal` — OAuth login interface
- `UsernameSetup` — Initial username entry
- `UserProfile` — Player profile page with rating chart, game stats, achievements with collapsible sections (rating chart, game stats, achievements)
- `ProfileIconPicker` — Avatar selector
- `UserAchievements` — Achievement display with collapsible categories and rarity badges
- `AchievementBadge` — Individual achievement badge renderer

**`common/` (9 components)** — Shared layout:

- `CommonSiteHeader` — Top navigation bar with active route indicators
- `CommonSiteFooter` — Footer
- `CommonErrorBoundary` — Error handling wrapper
- `CommonNotFoundPage` — 404 page
- `CommonMobileMenu` — Mobile navigation drawer
- `CommonSettingsDropdown` — Theme toggle (dark/light) and sound control
- `NetworkStatusBanner` — Online/offline indicator
- `AchievementToast` — Achievement unlock notification toast
- `FloatingPieces` — Animated chess pieces with gravitational spread (hero section)

### Component Patterns

**Controller/Presenter separation**: `ChessBoardController` handles game logic, delegating to extracted hooks (`useAudioFeedback`, `useBoardAnnotations`, `useEvaluation`, `useMoveAnimation`). Uses unified pointer events for drag/drop across desktop and mobile. `ChessBoard` is purely presentational—receives callbacks and renders squares.

**Container components** (`PlayContainer`, `TrainingContainer`, `AnalyzeContainer`, `PuzzleContainer`) wrap themselves with their own provider and compose the controller with mode-specific panels and modals.

### State Management

#### Global Settings Store (`store/settings/`)

- `SettingsContext.tsx` — Wraps entire app (above UserProvider) with theme and sound state
- Backed by `services/settings/SettingsService.ts` (localStorage, key: `nxtchess:settings`)
- State: `theme` ('dark' | 'light'), `soundEnabled` (boolean)
- Actions: `toggleTheme()`, `toggleSound()`
- Theme applied via `data-theme="light"` attribute on `<body>`, with flash-prevention script in `index.html`

#### Global User Store (`store/user/`)

- `UserContext.tsx` — Wraps entire app with user authentication state
- `userStore.ts` — User login, profile, ratings management
- States: `isLoggedIn`, `username`, `rating`, `profileIcon`
- Actions: `checkUserStatus()`, `saveUsername()`, `fetchUserProfile()`, `setProfileIcon()`, `logout()`

#### Mode-Specific Game Stores (`store/game/`)

Six independent SolidJS stores compose via context (NOT a monolithic store):

1. **ChessStore** (`createChessStore.ts`) — FEN, move history, game state, player color, current turn, captured pieces, game lifecycle, `hydrateFromReconnect()` for rebuilding state from UCI move history
2. **TimerStore** (`createTimerStore.ts`) — White/black time in ms, time control, increment, 100ms tick precision
3. **EngineStore** (`createEngineStore.ts`) — Engine status (idle/loading/ready/error), difficulty, AI side, play style
4. **UIStore** (`createUIStore.ts`) — Board view perspective, modal visibility flags
5. **MultiplayerStore** (`createMultiplayerStore.ts`) — Game ID, opponent info, connection state, typed event emission, reconnection events (`game:reconnected`, `game:opponent_disconnected`, `game:opponent_reconnected`)
6. **LobbyStore** (`createLobbyStore.ts`) — Open games list, lobby WebSocket subscription, real-time updates

#### Context Providers

- **`PlayGameContext.tsx`** — Creates all 5 stores, provides `PlayGameContextValue` with `PlayActions`
- **`TrainingGameContext.tsx`** — Creates 4 stores (no multiplayer), provides `TrainingGameContextValue` with `TrainingActions`
- **`AnalyzeGameContext.tsx`** — Creates 4 stores (no multiplayer), provides `AnalyzeGameContextValue` with `AnalyzeActions`, includes `AnalyzeEngineState` for multi-line analysis
- **`PuzzleGameContext.tsx`** — Creates 4 stores (no multiplayer), provides `PuzzleGameContextValue` with `PuzzleActions`
- **`useGameContext.ts`** — Unified interface that all modes implement, allows components like `ChessBoardController` to work across modes

#### Action Factories (`store/game/actions/`)

- `createCoreActions.ts` — Shared actions (navigation, exit, flip board)
- `createSinglePlayerActions.ts` — Base single-player logic
- `createMultiplayerActions.ts` — Base multiplayer logic
- `createPlayActions.ts` — Play-mode specific (AI coordination + multiplayer sync)
- `createTrainingActions.ts` — Training-mode specific (eval computation, hint logic)
- `createAnalyzeActions.ts` — Analysis-mode specific (FEN/PGN loading, move application with history truncation)
- `createPuzzleActions.ts` — Puzzle-mode specific (puzzle loading, move validation against solution, feedback)

#### Type Definitions (`store/game/types.ts`)

```typescript
CoreActions       // jumpToMove, flipBoard, exitGame
SinglePlayerActions extends CoreActions  // startNewGame, applyPlayerMove, resign
MultiplayerActions extends CoreActions   // startMultiplayerGame, joinMultiplayerGame
PlayActions = SinglePlayerActions & MultiplayerActions
TrainingActions extends SinglePlayerActions  // restartGame
AnalyzeActions extends CoreActions  // loadFen, loadPgn, resetToStart, applyMove
PuzzleActions extends CoreActions   // startNewGame, applyPlayerMove, loadNextPuzzle, dismissFeedback
```

### Services Layer

#### Engine Services (`services/engine/`)

- `StockfishEngine.ts` — Low-level UCI protocol wrapper (`postMessage`, `sendCommand` with timeout)
- `aiEngineWorker.ts` — AI move computation (Web Worker) with ELO limiting and playstyle options
- `evalEngineWorker.ts` — Position evaluation (separate Web Worker) for training mode eval bar
- `analysisEngineService.ts` — Multi-line analysis service for analyze mode (MultiPV, configurable depth/time)
- `EnginePool.ts` — Multi-engine allocation per (purpose, gameId), max 4 engines, 1min idle timeout
- `ResilientEngine.ts` — Circuit breaker wrapper (3-strike rule, auto-recovery, command queuing)
- `engineService.ts` — High-level engine service interface
- `moveEvalService.ts` — Move quality evaluation for training hints (best move comparison)

Two separate Web Workers (ai/eval) prevent UCI command race conditions. Analysis mode uses a dedicated singleton engine instance.

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

#### Review Services (`services/review/`)

- `gameReviewService.ts` — Post-game analysis engine: move-by-move evaluation (800ms per position), accuracy calculation via win-percentage formula, move quality classification, quality distribution stats, dedicated review engine with auto-recovery, progress callbacks, abortable analysis

#### Network Services (`services/network/`)

- `ReconnectingWebSocket.ts` — WebSocket with exponential backoff (max 5 attempts, message queuing)

#### Sync Services (`services/sync/`)

- `GameSyncService.ts` — WebSocket client using ReconnectingWebSocket, includes reconnection protocol
- `useGameSync.ts` — SolidJS integration hook
- `reconnectStore.ts` — Session storage for active game tracking (`saveActiveGame`, `loadActiveGame`, `clearActiveGame`)
- `types.ts` — Message types (GAME_CREATE, GAME_JOIN, MOVE, RESIGN, TIME_UPDATE, GAME_ENDED, GAME_RECONNECT, GAME_RECONNECTED, OPPONENT_DISCONNECTED, OPPONENT_RECONNECTED, LOBBY_SUBSCRIBE, LOBBY_UNSUBSCRIBE, LOBBY_LIST, LOBBY_UPDATE)

#### Persistence Services (`services/persistence/`)

- `GamePersistence.ts` — **IndexedDB** storage (DB: 'nxtchess', store: 'game_sessions'), 7-day cleanup
- `useAutoPersist.ts` — Auto-save hook (5-second periodic + 1-second debounced on change)

#### Audio Services (`services/audio/`)

- `AudioService.ts` — Move sounds and low-time warnings

#### Preferences Services (`services/preferences/`)

- `PreferencesService.ts` — User settings storage (singleton, LocalStorage)

#### Puzzle Services (`services/puzzle/`)

- `puzzleData.ts` — Client-side puzzle definitions (mate-in-1/2/3), shuffled queue with deduplication
- `puzzleHistory.ts` — Session-scoped puzzle attempt tracking (max 20 entries), solved puzzle deduplication
- `setupMoveComputer.ts` — Computes animated setup moves for puzzle initialization
- `index.ts` — Barrel exports (`getRandomPuzzle`, `uciToFromTo`, `computeSetupMove`)

#### Settings Services (`services/settings/`)

- `SettingsService.ts` — Theme ('dark'|'light') and sound settings via localStorage (key: `nxtchess:settings`)

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
GameMode = 'play' | 'training' | 'analysis' | 'puzzle';
GameLifecycle = 'idle' | 'initializing' | 'playing' | 'error' | 'ended';
OpponentType = 'ai' | 'human';
RatedMode = 'rated' | 'casual';
GamePhase = 'opening' | 'middlegame' | 'endgame' | null;
PuzzleCategory = 'mate-in-1' | 'mate-in-2' | 'mate-in-3' | 'random';
GameWinner = Side | 'draw' | null;
GameOverReason = 'checkmate' | 'stalemate' | 'time' | 'resignation' | null;
```

**achievements.ts:**

```typescript
AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
AchievementCategory = 'loyalty' | 'streaks' | 'rating' | 'chess_moments' | 'volume' | 'fun';
Achievement { id, name, description, category, rarity, points, icon }
UserAchievement extends Achievement { unlocked_at }
AchievementUnlock { id, name, description, rarity, points, icon }  // minimal, for toast notifications
AchievementsResponse { achievements[], total_points, total_unlocked, total_available }
```

**moveQuality.ts:**

```typescript
MoveQuality = 'best' | 'excellent' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';
QUALITY_THRESHOLDS = { excellent: 20, good: 50, inaccuracy: 100, mistake: 200 }; // centipawns
```

**review.ts:**

```typescript
ReviewPhase = 'idle' | 'analyzing' | 'complete';
ReviewProgress { currentMove, totalMoves, percentComplete }
EvalPoint { moveIndex, evalAfter, san, side, quality, moveTimeMs? }
QualityDistribution = Record<MoveQuality, number>;
ReviewSummary { whiteAccuracy, blackAccuracy, evaluations, evalHistory, qualityDistribution }
ReviewHandle { abort() }  // abortable analysis control
```

### Shared Utilities (`src/shared/`)

**Config:**

- `constants.ts` — `TIME_VALUES_MINUTES`, `DIFFICULTY_VALUES_ELO` (6 UI levels: Beginner/Easy/Medium/Hard/Expert/Grandmaster mapping to internal 1-10)
- `timeControls.ts` — Categorized time controls (Bullet/Blitz/Rapid/Classical) with 12 presets, default 5+3
- `env.ts` — Environment variables (`VITE_BACKEND_URL`, `VITE_DEBUG`)

**Hooks:**

- `useKeyboardNavigation.ts` — Arrow keys for move history, 'f' to flip board

**Utils:**

- `EventEmitter.ts` — TypedEventEmitter for decoupled communication
- `createFocusTrap.ts` — Focus trap utility for modal accessibility (traps Tab/Shift+Tab within element)
- `debug.ts` — Debug utilities
- `generateId.ts` — Session ID generation
- `stringUtils.ts` — String helpers

### CSS Modules

All components use `.module.css` files. Import as `styles` and reference as `styles.className`.

**No comments in CSS.** Use expressive, readable class names and logical property grouping instead of comments. Class names should be self-documenting (e.g., `.boardActiveTurnGlow` instead of `.glow` with a `/* Active turn indicator */` comment). Group related properties with blank lines for visual separation instead of section dividers.

**No section divider comments in TypeScript/TSX.** Do not use `// ====...` banner blocks to separate sections. Use blank lines instead. If a file needs section headers to be readable, split it into smaller files.

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
- `services/engine/` — EnginePool, ResilientEngine
- `services/network/` — ReconnectingWebSocket
- `shared/utils/` — createFocusTrap

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
- Dev server proxy for backend routes (`/api`, `/auth`, `/ws`, `/check-username`, `/set-username`, `/set-profile-icon`) → `BACKEND_PROXY_URL` (default `http://localhost:8080`)

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
