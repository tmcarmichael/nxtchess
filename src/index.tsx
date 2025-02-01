import { render } from 'solid-js/web';
import { Router } from '@solidjs/router';
import App from './App';
// import { GameProvider } from './store/game/GameContext';
import './index.css';

render(
  () => (
    <Router>
      {/* <GameProvider> */}
      <App />
      {/* </GameProvider> */}
    </Router>
  ),
  document.getElementById('root') as HTMLElement
);
