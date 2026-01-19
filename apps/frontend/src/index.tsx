import { Router } from '@solidjs/router';
import { render } from 'solid-js/web';
import App from './App';
import { routes } from './routes';
import { GameProvider } from './store/game/GameContext';
import { UserProvider } from './store/user/UserContext';
import './index.css';

render(
  () => (
    <UserProvider>
      <GameProvider>
        <Router root={App}>{routes}</Router>
      </GameProvider>
    </UserProvider>
  ),
  document.body
);
