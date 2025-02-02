import { render } from 'solid-js/web';
import { Router } from '@solidjs/router';
import { GameProvider } from './store/game/GameContext';
import './index.css';
import App from './App';

render(
  () => (
    <GameProvider>
      <Router>
        <App />
      </Router>
    </GameProvider>
  ),
  document.getElementById('root')!
);
