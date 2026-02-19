# NXT Chess

## Mobile - Flutter, Dart

### Getting Started

See [primary README](https://github.com/tmcarmichael/nxtchess/blob/main/README.md)

---

### Mobile Dev Steps

**Prerequisites:** Flutter SDK 3.11+, Xcode (iOS), Android Studio (Android)

#### Setup:

1. Install dependencies:

```bash
flutter pub get
```

2. Run code generation (Freezed models, Riverpod providers):

```bash
dart run build_runner build --delete-conflicting-outputs
```

3. Start the development server:

```bash
flutter run
```

### Architecture

- **State management**: Riverpod with code generation (`flutter_riverpod` + `riverpod_annotation`)
- **Models**: Freezed for immutable data classes with JSON serialization
- **Routing**: GoRouter with `StatefulShellRoute` for bottom navigation
- **Chess**: `chessground` (board UI) + `dartchess` (move validation) + `multistockfish` (engine)
- **Networking**: Dio (HTTP) + `web_socket_channel` (WebSocket multiplayer)
- **Persistence**: Drift (SQLite) for local storage, `shared_preferences` for settings
- **Auth**: `flutter_web_auth_2` for OAuth flows (Google, GitHub, Discord)

### Project Structure

```
lib/
├── config/          # Constants, environment, time controls
├── controllers/     # Game controllers (play, training, analyze, puzzle, review)
├── models/          # Freezed data models (chess types, game types, user, achievements)
├── providers/       # Riverpod state providers
│   ├── chess/       # Board state, FEN, move history
│   ├── engine/      # Stockfish engine state
│   ├── lobby/       # Multiplayer lobby
│   ├── multiplayer/ # Game sync, WebSocket connection
│   ├── settings/    # Theme, sound preferences
│   ├── timer/       # Game clocks
│   ├── ui/          # UI state (modals, highlights)
│   └── user/        # Auth state, profile
├── router/          # GoRouter configuration
├── services/        # Audio, haptics, networking, persistence
├── theme/           # Material theme configuration
├── utils/           # Shared utilities
└── widgets/         # UI components
    ├── analyze/     # Analysis mode screens
    ├── auth/        # Sign-in, username setup
    ├── chess/       # Board, clock, eval bar, dialogs
    ├── common/      # App shell, lifecycle observer, settings
    ├── game/        # Game notation, scaffold
    ├── home/        # Home screen
    ├── play/        # Multiplayer lobby, game creation
    ├── profile/     # User profile
    ├── puzzle/      # Puzzle mode
    ├── review/      # Post-game review
    └── training/    # Training mode
```

### Routes

| Path | Screen | Navigation |
|------|--------|------------|
| `/` | Home | Bottom tab |
| `/play` | Play (lobby, vs AI) | Bottom tab |
| `/play/:gameId` | Join multiplayer game | Deep link |
| `/training` | Training mode | Bottom tab |
| `/puzzles` | Puzzles | Bottom tab |
| `/analyze` | Analysis mode | Full screen |
| `/review` | Post-game review | Full screen |
| `/profile/:username` | User profile | Full screen |
| `/auth/username-setup` | Username setup | Full screen |

---

For full project info see main README: [https://github.com/tmcarmichael/nxtchess/blob/main/README.md](https://github.com/tmcarmichael/nxtchess/blob/main/README.md)
