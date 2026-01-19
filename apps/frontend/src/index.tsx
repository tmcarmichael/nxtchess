import { Router } from '@solidjs/router';
import { render } from 'solid-js/web';
import App from './App';
import { routes } from './routes';
import { UserProvider } from './store/user/UserContext';
import './index.css';

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
