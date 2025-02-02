import { createSignal, Show, createEffect } from 'solid-js';
import { useLocation } from '@solidjs/router';
import styles from './GameContainer.module.css';
import ChessGame from '../ChessGame/ChessGame';
import GamePanel from '../GamePanel/GamePanel';
import PlayModal from '../modals/PlayModal/PlayModal';
import { debugLog } from '../../utils';
import { useGameStore } from '../../store/game/GameContext';

const GameContainer = () => {
  const location = useLocation();
  const [showPlayModal, setShowPlayModal] = createSignal(false);

  const {
    timeControl,
    setCapturedWhite,
    setCapturedBlack,
    setBoardSquares,
    startNewGame,
    playerColor,
    difficulty,
  } = useGameStore();

  createEffect(() => {
    debugLog('createEffect() GameContainer.tsx LOCATION.STATE =>', location.state);
  });

  const handleStartGame = () => {
    setShowPlayModal(false);
    startNewGame(timeControl(), difficulty(), playerColor());
  };

  return (
    <div class={styles.gameContainer}>
      <Show when={showPlayModal()}>
        <PlayModal onClose={() => setShowPlayModal(false)} onStartGame={handleStartGame} />
      </Show>
      <div class={styles.gameLayout}>
        <div class={styles.boardWrapper}>
          <ChessGame
            timeControl={timeControl()}
            difficulty={difficulty()}
            side={playerColor()}
            onCapturedWhiteChange={(fn) => setCapturedWhite((prev: any) => fn(prev))}
            onCapturedBlackChange={(fn) => setCapturedBlack((prev: any) => fn(prev))}
            onBoardChange={(b) => setBoardSquares(b)}
          />
        </div>
        <div class={styles.panelWrapper}>
          <GamePanel />
        </div>
      </div>
    </div>
  );
};

export default GameContainer;
