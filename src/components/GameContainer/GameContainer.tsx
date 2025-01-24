import { useLocation } from '@solidjs/router';
import ChessGame from '../ChessGame/ChessGame';
import GamePanel from '../GamePanel/GamePanel';
import styles from './GameContainer.module.css';
import { GameRouteState } from '../../types';

const GameContainer = () => {
  const location = useLocation<GameRouteState>();
  const timeControl = location.state?.timeControl;
  const difficulty = location.state?.difficulty;

  if (!timeControl || !difficulty) {
    return <div>Error: Missing game settings. Please return to the homepage.</div>;
  }

  return (
    <div class={styles.container}>
      <h1 class={styles.title}>Game Started!</h1>
      <div class={styles.details}>
        <p>Time Control: {timeControl} minutes</p>
        <p>Difficulty: {difficulty}</p>
      </div>
      <div class={styles.gameLayout}>
        <div class={styles.boardWrapper}>
          <ChessGame timeControl={timeControl} />
        </div>
        <div class={styles.panelWrapper}>
          <GamePanel />
        </div>
      </div>
    </div>
  );
};

export default GameContainer;
