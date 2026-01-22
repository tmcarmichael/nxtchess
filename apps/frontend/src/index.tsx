import { Router } from '@solidjs/router';
import { render } from 'solid-js/web';
import App from './App';
import { routes } from './routes';
import { initAiEngine } from './services/engine/aiEngineWorker';
import { UserProvider } from './store/user/UserContext';
import './index.css';

// Pre-warm the Stockfish engine immediately on app load.
// This runs in the background so the engine is ready when user starts a game.
initAiEngine(600, 'balanced').catch(() => {});

// Note: GameProvider is no longer global.
// Each game mode (Play, Training) wraps itself with its own provider.
// This ensures multiplayer code is not loaded on training pages and vice versa.

render(
  () => (
    <UserProvider>
      <Router root={App}>{routes}</Router>
    </UserProvider>
  ),
  document.body
);
