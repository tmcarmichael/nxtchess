import { render } from 'solid-js/web';
import { Router } from '@solidjs/router';
import { UserProvider, GameProvider } from './store';
import App from './App';
import { routes } from './routes';
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
