import ChessGame from "./components/ChessGame/ChessGame";
import GamePanel from "./components/GamePanel/GamePanel";
import styles from "./App.module.css";

function App() {
  return (
    <div class={styles.container}>
      <ChessGame />
      <GamePanel />
    </div>
  );
}

export default App;
