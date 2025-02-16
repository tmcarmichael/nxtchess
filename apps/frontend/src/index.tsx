import { render } from 'solid-js/web';
import { Router, Route } from '@solidjs/router';
import { GameProvider } from './store/GameContext';
import App from './App';
import HomeContainer from './components/home/HomeContainer/HomeContainer';
import GameContainer from './components/game/GameContainer/GameContainer';
import CommonNotFoundPage from './components/common/CommonNotFoundPage/CommonNotFoundPage';
import './index.css';

render(
  () => (
    <GameProvider>
      <Router root={App}>
        <Route path="/" component={HomeContainer} />
        <Route path="/game" component={GameContainer} />
        <Route path="*" component={CommonNotFoundPage} />
      </Router>
    </GameProvider>
  ),
  document.body
);
