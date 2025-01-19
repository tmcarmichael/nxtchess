import { Route } from "@solidjs/router";
import Layout from "./components/Layout/Layout";
import GameContainer from "./components/GameContainer/GameContainer";

function App() {
  return (
    <Route
      path="/"
      component={Layout}
      children={
        <>
          <Route path="/" />
          <Route path="/game" component={GameContainer} />
        </>
      }
    />
  );
}

export default App;
