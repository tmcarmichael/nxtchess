import { render } from 'solid-js/web';
import { Router, Route } from '@solidjs/router';
import { GameProvider } from './store/game/GameContext';
import App from './App';
import HomeContainer from './components/HomeContainer/HomeContainer';
import GameContainer from './components/GameContainer/GameContainer';
import './index.css';

render(
  () => (
    <GameProvider>
      <Router root={App}>
        <Route path="/" component={HomeContainer} />
        <Route path="/game" component={GameContainer} />
      </Router>
    </GameProvider>
  ),
  document.body
);
