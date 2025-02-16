import { render } from 'solid-js/web';
import { Router, Route } from '@solidjs/router';
import { AuthProvider } from './store/AuthContext';
import { GameProvider } from './store/GameContext';
import App from './App';
import HomeContainer from './components/home/HomeContainer/HomeContainer';
import GameContainer from './components/game/GameContainer/GameContainer';
import CommonNotFoundPage from './components/common/CommonNotFoundPage/CommonNotFoundPage';
import UsernameSetup from './components/user/UsernameSetup/UsernameSetup';
import UserProfile from './components/user/UserProfile/UserProfile';
import './index.css';

render(
  () => (
    <AuthProvider>
      <GameProvider>
        <Router root={App}>
          <Route path="/" component={HomeContainer} />
          <Route path="/game" component={GameContainer} />
          <Route path="/username-setup" component={UsernameSetup} />
          <Route path="/profile/:username" component={UserProfile} />
          <Route path="*" component={CommonNotFoundPage} />
        </Router>
      </GameProvider>
    </AuthProvider>
  ),
  document.body
);
