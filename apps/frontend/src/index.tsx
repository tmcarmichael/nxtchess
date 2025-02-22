import { render } from 'solid-js/web';
import { Router, Route } from '@solidjs/router';
import { UserProvider } from './store/UserContext';
import { GameProvider } from './store/GameContext';
import App from './App';
import HomeContainer from './components/home/HomeContainer/HomeContainer';
import PlayContainer from './components/play/PlayContainer/PlayContainer';
import TrainingContainer from './components/training/TrainingContainer/TrainingContainer';
import NotFoundPage from './components/common/CommonNotFoundPage/CommonNotFoundPage';
import UsernameSetup from './components/user/UsernameSetup/UsernameSetup';
import UserProfile from './components/user/UserProfile/UserProfile';
import './index.css';

render(
  () => (
    <UserProvider>
      <GameProvider>
        <Router root={App}>
          <Route path="/" component={HomeContainer} />
          <Route path="/play" component={PlayContainer} />
          <Route path="/training" component={TrainingContainer} />
          <Route path="/username-setup" component={UsernameSetup} />
          <Route path="/profile/:username" component={UserProfile} />
          <Route path="*" component={NotFoundPage} />
        </Router>
      </GameProvider>
    </UserProvider>
  ),
  document.body
);
