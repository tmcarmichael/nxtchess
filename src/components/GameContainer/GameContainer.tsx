import { useLocation } from '@solidjs/router';
import ChessGame from '../ChessGame/ChessGame';
import GamePanel from '../GamePanel/GamePanel';
import styles from './GameContainer.module.css';
import { GameRouteState } from '../../types';
import { debugLog } from '../../utils';

const GameContainer = () => {
  const location = useLocation<GameRouteState>();
  const timeControl = location.state?.timeControl;
  const difficulty = location.state?.difficulty;
  const side = location.state?.side;

  if (!timeControl || !difficulty || !side) {
    return <div>Error: Missing game settings. Please return to the homepage.</div>;
  }

  debugLog('GameContainer: ', timeControl, difficulty, side);

  return (
    <div class={styles.container}>
      <div class={styles.gameLayout}>
        <div class={styles.boardWrapper}>
          <ChessGame timeControl={timeControl} side={side} />
        </div>
        <div class={styles.panelWrapper}>
          <GamePanel />
        </div>
      </div>
    </div>
  );
};

export default GameContainer;
