import { Route } from '@solidjs/router';
import SiteHeader from './components/SiteHeader/SiteHeader';
import GameContainer from './components/GameContainer/GameContainer';

function App() {
  return (
    <>
      <Route path="/" component={SiteHeader}>
        <Route path="/game" component={GameContainer} />
        <Route path="/" component={() => <div></div>} />
      </Route>
    </>
  );
}

export default App;
