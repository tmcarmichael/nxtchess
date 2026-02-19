# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See also: [Root CLAUDE.md](../../CLAUDE.md) for full-stack commands and backend info.

## Development Commands

```bash
# From apps/mobile/
flutter run                       # Run on connected device/emulator (dev defaults)
flutter run --dart-define=BACKEND_URL=http://10.0.2.2:8080  # Android emulator (host localhost)
flutter run --dart-define=BACKEND_URL=http://localhost:8080  # iOS simulator
flutter build apk --dart-define=ENV=production --dart-define=BACKEND_URL=https://api.nxtchess.com  # Android release
flutter build ios --dart-define=ENV=production --dart-define=BACKEND_URL=https://api.nxtchess.com  # iOS release
flutter test                      # Run all tests (137 tests)
flutter analyze                   # Dart static analysis (0 issues expected)
dart run build_runner build --delete-conflicting-outputs  # Regenerate Freezed/JSON/Riverpod code
```

**Important:** After modifying any `@freezed`, `@JsonSerializable`, or `@riverpod` annotated class, run `build_runner` to regenerate `.freezed.dart`, `.g.dart` files. These generated files are checked in.

## Architecture

### Entry Point

`lib/main.dart` initializes services before building the widget tree:

1. `WidgetsFlutterBinding.ensureInitialized()`
2. Initialize `AudioService` (pre-creates `AudioPlayer` instances per sound type)
3. Initialize `ApiClient` (Dio with `PersistCookieJar` for session cookies)
4. Wrap app in `ProviderScope` with service overrides
5. Build `NxtChessApp` (`ConsumerWidget` → `MaterialApp.router`)

### Package Structure

```
lib/
├── main.dart                           # Entry point, service initialization
├── app.dart                            # NxtChessApp root widget (ConsumerWidget)
├── config/
│   ├── constants.dart                  # Difficulty ELO/think-time tables, reconnection timing, auto-save intervals, WS backoff config
│   ├── env.dart                        # BACKEND_URL, ENV, DEBUG, computed wsUrl/authUrl, isProd/isStaging/isDev, AppConstants.callbackUrlScheme
│   └── time_controls.dart              # Bullet/Blitz/Rapid/Classical definitions with 12 presets
├── controllers/                        # Game mode orchestrators (see Controllers section)
│   ├── game_controller.dart            # Abstract base class
│   ├── play_game_controller.dart       # AI + multiplayer flow
│   ├── training_game_controller.dart   # Endgame training with eval scoring
│   ├── analyze_game_controller.dart    # FEN/PGN analysis with multi-PV
│   ├── puzzle_game_controller.dart     # Mate-in-N puzzle solving
│   └── review_game_controller.dart     # Post-game analysis pipeline
├── models/                             # Freezed data classes (see Models section)
│   ├── game_types.dart                 # Side, GameMode, GameLifecycle, OpponentType, etc.
│   ├── move_quality.dart               # MoveQuality enum + classification function
│   ├── multiplayer_events.dart         # Sealed MultiplayerEvent classes
│   ├── achievement.dart                # AchievementUnlock (Freezed + JSON)
│   ├── sync_types.dart                 # WS payload types (GameStartedData, MoveAcceptedData, etc.)
│   └── user.dart                       # PublicProfile, RatingPoint, RecentGame
├── providers/                          # Riverpod state (see State Management section)
│   ├── chess/                          # ChessNotifier + ChessState (central state machine)
│   ├── engine/                         # StockfishService wrapper (AI + eval engines)
│   ├── lobby/                          # Open games list via WS subscription
│   ├── multiplayer/                    # WS game events, reconnection
│   ├── settings/                       # Sound, haptics, coordinates, legal moves, auto-queen
│   ├── timer/                          # Clock ticks, increment, low-time callback
│   ├── ui/                             # Modal/sheet visibility flags
│   └── user/                           # Auth state, profile, sign-in/logout
├── router/
│   └── app_router.dart                 # GoRouter with StatefulShellRoute + auth redirect guard
├── services/                           # Platform services (see Services section)
│   ├── api/api_client.dart             # Dio HTTP + PersistCookieJar
│   ├── audio/audio_service.dart        # audioplayers wrapper (7 sound types)
│   ├── auth/auth_service.dart          # flutter_web_auth_2 OAuth (Google, GitHub, Discord)
│   ├── engine/
│   │   ├── stockfish_service.dart      # UCI protocol wrapper (multistockfish)
│   │   └── analysis_engine_service.dart # Multi-PV analysis for analyze/review modes
│   ├── haptics/haptics_service.dart    # HapticFeedback wrapper with per-event semantics
│   ├── network/reconnecting_websocket.dart  # Exponential backoff WS with jitter
│   ├── persistence/game_persistence.dart    # SharedPreferences auto-save (5s periodic + 1s debounce)
│   ├── puzzle/
│   │   ├── puzzle_data.dart            # Client-side mate-in-1/2/3 definitions
│   │   └── puzzle_setup.dart           # Setup move computation for puzzle initialization
│   ├── review/game_review_service.dart # Move-by-move analysis, accuracy scoring
│   ├── sync/
│   │   ├── game_sync_service.dart      # WS protocol layer (typed messages, message queue, ping)
│   │   └── reconnect_store.dart        # Active game session tracking (SharedPreferences)
│   └── training/training_service.dart  # Training scenario logic
├── theme/
│   ├── app_colors.dart                 # Color constants
│   └── app_theme.dart                  # Material 3 dark ThemeData
├── utils/
│   ├── pgn_parser.dart                 # PGN → SAN token parsing
│   └── uci_utils.dart                  # UCI move parsing utilities
└── widgets/                            # UI components by feature (see Widgets section)
    ├── analyze/                        # AnalyzeScreen, engine panel, import sheet
    ├── auth/                           # SignInSheet, UsernameSetupScreen
    ├── chess/                          # ChessBoardWidget, ChessClockWidget, EvalBar, dialogs
    ├── common/                         # AppShell, AppLifecycleObserver, SettingsSheet
    ├── game/                           # GameScaffold, MoveHistoryWidget, MoveNavigationBar
    ├── home/                           # HomeScreen
    ├── play/                           # PlayScreen, PlayHub, creation/AI sheets
    ├── profile/                        # ProfileScreen
    ├── puzzle/                         # PuzzleScreen, feedback dialog, setup sheet
    ├── review/                         # ReviewScreen, EvalGraph, SummaryPanel, ProgressBar
    └── training/                       # TrainingScreen, setup sheet
```

### Routes

```
StatefulShellRoute (bottom nav: 4 tabs)
├── /                  → HomeScreen
├── /play              → PlayScreen (lobby browser, vs AI, or create multiplayer)
│   └── /play/:gameId  → PlayScreen (join multiplayer via URL)
├── /training          → TrainingScreen (endgame training with eval)
└── /puzzles           → PuzzleScreen (mate-in-N tactics)

Full-screen routes (root navigator):
├── /analyze           → AnalyzeScreen (optional FEN via route extra)
├── /review            → ReviewScreen (requires PGN + playerColor via extra; redirects to / if missing)
├── /profile/:username → ProfileScreen
├── /auth/username-setup → UsernameSetupScreen
└── /settings          → SettingsSheet
```

Auth redirect guard: logged-in users without a username are forced to `/auth/username-setup`. A `_UserStateNotifier extends ChangeNotifier` bridges Riverpod user state to GoRouter's `refreshListenable`.

## State Management

### Riverpod with Notifier Pattern

Each domain has a co-located provider + state pair using `NotifierProvider<XNotifier, XState>`. All state classes use `@freezed` for immutability with `copyWith`.

| Provider | State | Purpose |
|----------|-------|---------|
| `chessProvider` | `ChessState` | FEN, move history, game lifecycle, player color, current turn, captured pieces, nested `TrainingState` + `PuzzleState` |
| `engineProvider` | `EngineState` | Wraps two `StockfishService` instances (AI + eval), manages UCI ELO limiter, thinking state |
| `timerProvider` | `TimerState` | White/black time in ms, time control, increment, 100ms tick precision, low-time callback (10s threshold, fires once per side) |
| `multiplayerProvider` | `MultiplayerState` | Game ID, opponent info, connection state, rated mode; emits typed `MultiplayerEvent` sealed classes |
| `lobbyProvider` | `LobbyState` | Open games list via WS subscription, real-time add/remove |
| `uiProvider` | `UIState` | Modal/sheet visibility flags, board orientation |
| `settingsProvider` | `SettingsState` | Sound, haptics, coordinates, legal moves, auto-queen (persisted via SharedPreferences) |
| `userProvider` | `UserState` | Auth state (`isLoggedIn`, `needsUsername`), profile, ratings |

All providers are globally scoped, injected via `ProviderScope` at root. Services (`ApiClient`, `AudioService`, `HapticsService`) are pre-initialized in `main()` and injected as `ProviderScope.overrides`.

### ChessNotifier: Central State Machine

`ChessNotifier` is the core state machine all game modes feed through:

- `startGame(fen, playerColor, mode, ...)` — initialize board
- `applyMove(san)` — local move application
- `applyOptimisticMove(san)` / `confirmMove()` / `rejectMove()` — multiplayer optimistic updates
- `hydrateFromReconnect(fen, uciMoveHistory)` — replay moves to rebuild SAN history after reconnect
- `endGame(winner, reason)` — transition to ended lifecycle
- `jumpToMoveIndex(index)` — history navigation

## Controllers

Abstract `GameController` base class defines the interface: `onMove`, `onResign`, `onNewGame`, `onExitGame`, `dispose`, plus shared history navigation helpers.

### PlayGameController

Handles both AI and multiplayer games. Routes moves through `_handleAIGameMove` or `_handleMultiplayerMove` (optimistic updates). Subscribes to `MultiplayerNotifier.onEvent()` via sealed `MultiplayerEvent` pattern matching. Handles reconnection via `GameReconnectedEvent`. Wires all audio/haptic triggers.

### TrainingGameController

Endgame training with eval scoring. AI responses via `StockfishService.getBestMove()`. Audio/haptics on moves and game end.

### AnalyzeGameController

FEN/PGN analysis with `AnalysisEngineService` multi-PV. Move sounds only (no haptics).

### PuzzleGameController

Mate-in-N puzzle solving. Validates moves against solution sequence. Submits results to `/api/puzzle/result` for ELO rating. Parses `new_achievements` from response. Audio/haptics for correct/incorrect moves.

### ReviewGameController

Loads PGN into `ChessNotifier`, runs `GameReviewService.startGameReview()` async pipeline with progress callbacks.

## Services

### ApiClient (`services/api/`)

Dio HTTP client with `PersistCookieJar` for session cookie persistence to disk. TLS enforced in production (`Env.isProd`). Base URL from `Env.backendUrl`.

### AuthService (`services/auth/`)

OAuth via `flutter_web_auth_2` with custom URL scheme `nxtchess://callback`. Supports Google, GitHub, Discord. Session token extracted from redirect URL and stored in cookie jar.

### StockfishService (`services/engine/`)

Low-level UCI protocol wrapper using `multistockfish` package (native Stockfish binary). Methods: `getBestMove(fen, moveTimeMs)` and `getEvaluation(fen, depth)` with timeouts.

### AnalysisEngineService (`services/engine/`)

Multi-PV analysis for analyze and review modes. Wraps `StockfishService` with higher-level analysis API.

### ReconnectingWebSocket (`services/network/`)

State machine: `disconnected → connecting → connected → reconnecting`. Exponential backoff with 50%-100% jitter. Configurable: max 5 attempts, 1s base delay, 2.0x multiplier, 30s max delay. Attempt count resets on fresh `connect()`.

### GameSyncService (`services/sync/`)

Sits above `ReconnectingWebSocket`. Translates typed WS messages to/from event emitter. Message queue for messages sent during reconnection. 30s ping keepalive. Auto-sends `GAME_RECONNECT` on transport reconnect if mid-game (tracks `_currentGameId`).

### AudioService (`services/audio/`)

Pre-created `AudioPlayer` instances per `SoundType`. Seven sound types matching the frontend `AudioService.ts`:

| SoundType | Asset | Description |
|-----------|-------|-------------|
| `move` | `move.wav` | 30ms woody click |
| `capture` | `capture.wav` | 50ms heavier click |
| `gameStart` | `game_start.wav` | 400ms ascending chime (C5→E5) |
| `check` | `check.wav` | 150ms low thud |
| `illegalMove` | `illegal.wav` | 40ms dull knock |
| `gameEnd` | `game_end.wav` | 300ms deep resonant knock |
| `lowTime` | `low_time.wav` | 400ms descending chime (E5→C5) |

### HapticsService (`services/haptics/`)

Wraps Flutter's `HapticFeedback` with per-event semantics:

| Method | Haptic | Used for |
|--------|--------|----------|
| `onMove()` | `lightImpact` | Piece placement |
| `onCapture()` | `mediumImpact` | Capture moves |
| `onCheck()` | `heavyImpact` | Check detection |
| `onGameEnd()` | `heavyImpact` | Game end |
| `onPuzzleCorrect()` | `mediumImpact` | Correct puzzle move |
| `onPuzzleIncorrect()` | `selectionClick` | Wrong puzzle move |

### GamePersistence (`services/persistence/`)

SharedPreferences auto-save with 5s periodic timer + 1s debounce on change. JSON-encoded game state in a single key.

## Models

All complex models use `@freezed` with `copyWith` and JSON serialization via `json_serializable`. Generated `.freezed.dart` and `.g.dart` files live alongside source.

### Key Types

```dart
enum Side { white, black }              // @JsonValue('w') / @JsonValue('b')
enum GameMode { play, training, analysis, puzzle }
enum GameLifecycle { idle, initializing, playing, ended }
enum OpponentType { ai, human }
enum RatedMode { rated, casual }
enum PuzzleCategory { mateIn1, mateIn2, mateIn3, random }
enum MoveQuality { best, excellent, good, inaccuracy, mistake, blunder }
```

### Multiplayer Events (Sealed Classes)

```dart
sealed class MultiplayerEvent {}
class GameCreatedEvent extends MultiplayerEvent { ... }
class GameStartedEvent extends MultiplayerEvent { ... }
class MoveAcceptedEvent extends MultiplayerEvent { ... }
class OpponentMoveEvent extends MultiplayerEvent { ... }
class GameEndedEvent extends MultiplayerEvent { ... }
class GameReconnectedEvent extends MultiplayerEvent { ... }
class OpponentDisconnectedEvent extends MultiplayerEvent { ... }
class OpponentReconnectedEvent extends MultiplayerEvent { ... }
// ... etc
```

### WS Payload Types (Freezed)

`sync_types.dart` defines typed payloads for all WS messages: `GameCreatedData`, `GameStartedData`, `MoveAcceptedData`, `GameEndedData`, `GameReconnectedData`, `LobbyListData`, `LobbyUpdateData`, etc.

## Widgets

### Widget Organization

Widgets are organized by feature under `widgets/`. Each feature typically has:
- A `Screen` widget (the route target, composes scaffolding + game logic)
- Setup sheets (bottom sheets for game configuration)
- Mode-specific panels and controls

### Key Patterns

**GameScaffold** (`widgets/game/`) — Common game layout with board, move history, navigation bar. Used by all game mode screens.

**ChessBoardWidget** (`widgets/chess/`) — Wraps the `chessground` package's board. Receives callbacks for moves, renders pieces, highlights, and arrows.

**AppShell** (`widgets/common/`) — `StatefulShellRoute` scaffold with bottom navigation bar (Home, Play, Training, Puzzles).

**AppLifecycleObserver** (`widgets/common/`) — `WidgetsBindingObserver` that stops timer and pauses engine on app background, resumes on foreground.

**Bottom Sheets** — Game configuration uses modal bottom sheets (Material 3 style) rather than full-screen modals: `PlayAISheet`, `PlayCreateGameSheet`, `TrainingSetupSheet`, `PuzzleSetupSheet`, `AnalyzeImportSheet`.

## Platform Setup

### Android

- Package: `com.nxtchess.nxtchess`
- Java compatibility: `VERSION_17`
- Intent filter for `nxtchess://` custom URL scheme (OAuth callback)
- Release signing: TODO (currently uses debug)

### iOS

- Bundle ID: `com.nxtchess.nxtchess`
- Display name: `Nxtchess`
- `CFBundleURLSchemes: [nxtchess]` for OAuth callback
- `CADisableMinimumFrameDurationOnPhone: true` for ProMotion support
- SceneDelegate forwards `openURLContexts` to super for `flutter_web_auth_2`
- Supports portrait + landscape on iPhone; all orientations on iPad

## Testing

```bash
flutter test                    # Run all 137 tests
flutter test test/chess_notifier_test.dart  # Run specific test file
```

| Test File | Coverage |
|-----------|----------|
| `chess_notifier_test.dart` | ChessNotifier — startGame, applyMove, optimistic/confirm/reject, sync, endGame, resign, hydrateFromReconnect, computed properties (30+ tests) |
| `reconnecting_websocket_test.dart` | WS state machine, exponential backoff, jitter |
| `move_quality_test.dart` | `classifyMoveQuality()` centipawn thresholds |
| `pgn_parser_test.dart` | `parsePgnToSanTokens()` |
| `puzzle_data_test.dart` | Puzzle definitions validation |
| `review_types_test.dart` | ReviewSummary, accuracy computation |
| `training_service_test.dart` | Training service logic |
| `uci_utils_test.dart` | UCI move parsing utilities |
| `widget_test.dart` | Smoke/widget tests |

Tests use plain `ProviderContainer()` — Riverpod providers tested in isolation with `container.read(provider.notifier)`.

## Dependencies

### Runtime

| Category | Package | Purpose |
|----------|---------|---------|
| Chess UI | `chessground` ^7.2.0 | Board rendering widget |
| Chess Logic | `dartchess` ^0.12.0 | Move validation, FEN/PGN parsing |
| Chess Engine | `multistockfish` ^0.1.0 | Native Stockfish UCI engine |
| State | `flutter_riverpod` ^3.0.0 | State management |
| Models | `freezed_annotation` ^3.0.0 | Immutable data classes |
| Models | `json_annotation` ^4.9.0 | JSON serialization |
| HTTP | `dio` ^5.7.0 | API client |
| Cookies | `dio_cookie_manager` ^3.3.0 + `cookie_jar` ^4.0.0 | Session persistence |
| WebSocket | `web_socket_channel` ^3.0.0 | WS transport |
| Routing | `go_router` ^14.0.0 | Declarative routing |
| Auth | `flutter_web_auth_2` ^4.0.0 | OAuth browser flow |
| Charts | `fl_chart` ^0.70.0 | Rating history, eval graphs |
| Audio | `audioplayers` ^6.0.0 | Sound effects |
| Storage | `shared_preferences` ^2.3.0 | Settings + game persistence |

### Dev

| Package | Purpose |
|---------|---------|
| `build_runner` | Code generation runner |
| `freezed` | Immutable class generator |
| `json_serializable` | JSON codec generator |
| `riverpod_generator` | Provider code generator |
| `riverpod_lint` + `custom_lint` | Riverpod-specific linting |

## Key Patterns

### Multiplayer Event Pipeline

```
ReconnectingWebSocket → GameSyncService → MultiplayerNotifier → PlayGameController
       (transport)         (WS protocol)      (typed events)      (game logic)
```

Each layer is decoupled: `GameSyncService` emits string-typed events, `MultiplayerNotifier` converts to sealed `MultiplayerEvent` classes, `PlayGameController` handles via pattern matching.

### Optimistic Multiplayer Moves

```dart
// 1. Apply move immediately to UI
chess.applyOptimisticMove(san);
// 2. Send to server via WS
multiplayer.sendMove(from, to, promotion);
// 3. Server confirms → chess.confirmMove()
// 4. Server rejects → chess.rejectMove() (rolls back)
```

### Reconnection Flow

1. App backgrounds or loses connection → `ReconnectingWebSocket` enters `reconnecting` state
2. Timer stopped in `AppLifecycleObserver._onPaused()` to prevent false timeout
3. On transport reconnect, `GameSyncService` auto-sends `GAME_RECONNECT` if `_currentGameId` is set
4. Server responds with `GAME_RECONNECTED` (full state: FEN, UCI move history, clocks, opponent)
5. `ChessNotifier.hydrateFromReconnect()` replays UCI moves to rebuild SAN history

### Code Generation

After modifying annotated classes, regenerate:

```bash
dart run build_runner build --delete-conflicting-outputs
```

Affected annotations: `@freezed`, `@JsonSerializable`, `@riverpod`, `@JsonKey`, `@Default`, `@JsonValue`

### Environment Configuration

Configuration is set at compile time via `--dart-define`, matching the backend's `ENV` + `BACKEND_URL` pattern:

| Variable | Values | Default |
|----------|--------|---------|
| `ENV` | `development`, `staging`, `production` | `development` |
| `BACKEND_URL` | Full URL to backend | `http://localhost:8080` |
| `DEBUG` | `true`/`false` | `false` |

```bash
# Development (local)
flutter run --dart-define=BACKEND_URL=http://10.0.2.2:8080    # Android emulator
flutter run --dart-define=BACKEND_URL=http://localhost:8080     # iOS simulator

# Staging
flutter run --dart-define=ENV=staging --dart-define=BACKEND_URL=https://staging-api.nxtchess.com

# Production
flutter build apk --dart-define=ENV=production --dart-define=BACKEND_URL=https://api.nxtchess.com
flutter build ios --dart-define=ENV=production --dart-define=BACKEND_URL=https://api.nxtchess.com
```

`Env` class provides:
- `isProd` / `isStaging` / `isDev` — environment checks (mirrors backend's `IsProd()`)
- `backendUrl` — Dio base URL (HTTP requests)
- `wsUrl` — `ws://` or `wss://` variant (WebSocket), handles standard ports correctly
- `authUrl` — `${backendUrl}/auth` (OAuth)

## Style Guidelines

Follow the same conventions as the frontend and backend CLAUDE.md files:

- **No section divider comments** — no `// ====` banner blocks. Use blank lines to separate sections.
- **No unnecessary comments** — let function names and code structure convey intent. Only comment non-obvious logic.
- Keep widgets focused — if a widget file exceeds ~200 lines, extract sub-widgets.
- Use `const` constructors wherever possible.
- Prefer `final` for local variables.
- Use single quotes for strings.
