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

Entry point `src/index.tsx` wraps the app in `UserProvider` → `GameProvider` → `Router`. Routes:

- `/` → HomeContainer
- `/play` → PlayContainer (timed games vs AI)
- `/training` → TrainingContainer (untimed practice with eval)
- `/profile/:username` → UserProfile

### Component Patterns

**Controller/Presenter separation**: `ChessBoardController` handles all game logic (move validation, drag/drop, promotion, AI triggers). `ChessBoard` is purely presentational—receives callbacks and renders squares.

**Container components** (`PlayContainer`, `TrainingContainer`) compose the controller with mode-specific panels and modals.

### State Management

`gameStore.ts` creates a SolidJS store factory (`createGameStore`) that:

- Wraps `chess.js` instance for move validation
- Manages timers, captured pieces, move history
- Coordinates with engine workers for AI moves and evaluation
- Uses `batch()` for atomic state updates

Access via `useGameStore()` hook which returns `[state, actions]`.

### Engine Workers

Two separate Web Workers prevent UCI command race conditions:

- `aiEngineWorker.ts`: AI move computation via Stockfish with ELO limiting and playstyle options
- `evalEngineWorker.ts`: Position evaluation (used in training mode for eval bar)

Both use the same pattern: `init*Engine()` → `waitForReady()` → UCI commands.

### Key Types (`src/types/`)

```typescript
Side = 'w' | 'b'
GameMode = 'play' | 'training' | 'analysis'
AIPlayStyle = 'aggressive' | 'defensive' | 'balanced' | 'random' | 'positional'
GamePhase = 'opening' | 'middlegame' | 'endgame'
Square = 'a1' | 'a2' | ... (chess squares)
```

### CSS Modules

All components use `.module.css` files. Import as `styles` and reference as `styles.className`.

### Keyboard Shortcuts

Defined in `ChessBoardController`:

- `ArrowLeft/Right`: Navigate move history
- `f`: Flip board view

## Vite Configuration

COOP/COEP headers enabled in `vite.config.ts` for SharedArrayBuffer support (required by Stockfish WASM).
