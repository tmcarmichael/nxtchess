import Chessboard from "./components/Chessboard/Chessboard";
import GamePanel from "./components/GamePanel/GamePanel";
import styles from "./App.module.css";

function App() {
  return (
    <div class={styles.container}>
      <Chessboard />
      <GamePanel />
    </div>
  );
}

export default App;
