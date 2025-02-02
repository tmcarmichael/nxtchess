import SiteHeader from './components/SiteHeader/SiteHeader';
import GameContainer from './components/GameContainer/GameContainer';
import { Route } from '@solidjs/router';

const App = () => {
  return (
    <Route path="/" component={SiteHeader}>
      <Route path="/" component={() => <div></div>} />
      <Route path="/game" component={GameContainer} />
    </Route>
  );
};

export default App;
