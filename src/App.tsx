import SiteContainer from './components/SiteContainer/SiteContainer';
import GameContainer from './components/GameContainer/GameContainer';
import { Route } from '@solidjs/router';

const App = () => {
  return (
    <Route path="/" component={SiteContainer}>
      <Route path="/" component={() => <div></div>} />
      <Route path="/game" component={GameContainer} />
    </Route>
  );
};

export default App;
