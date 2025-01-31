import { createSignal, Show, createEffect } from 'solid-js';
import { useLocation } from '@solidjs/router';
import { Difficulty, Side, GameRouteState } from '../../types';
import styles from './GameContainer.module.css';
import ChessGame from '../ChessGame/ChessGame';
import GamePanel from '../GamePanel/GamePanel';
import PlayModal from '../PlayModal/PlayModal';

const GameContainer = () => {
  const location = useLocation();
  const [timeControl, setTimeControl] = createSignal(5);
  const [difficulty, setDifficulty] = createSignal<Difficulty>('medium');
  const [side, setSide] = createSignal<Side>('w');
  const [showPlayModal, setShowPlayModal] = createSignal(false);

  const handleStartGame = (newTime: number, newDiff: Difficulty, newSide: Side) => {
    setTimeControl(newTime);
    setDifficulty(newDiff);
    setSide(newSide);
    setShowPlayModal(false);
  };

  createEffect(() => {
    console.log('LOCATION.STATE =>', location.state);
    const state = location.state as GameRouteState | undefined;
    if (state?.timeControl !== undefined) setTimeControl(state.timeControl);
    if (state?.difficulty !== undefined) setDifficulty(state.difficulty);
    if (state?.side !== undefined) setSide(state.side);
  });

  return (
    <div class={styles.gameContainer}>
      <button onClick={() => setShowPlayModal(true)}>Change Settings</button>
      <Show when={showPlayModal()}>
        <PlayModal onClose={() => setShowPlayModal(false)} onStartGame={handleStartGame} />
      </Show>
      <div class={styles.gameLayout}>
        <div class={styles.boardWrapper}>
          <ChessGame timeControl={timeControl()} difficulty={difficulty()} side={side()} />
        </div>
        <div class={styles.panelWrapper}>
          <GamePanel />
        </div>
      </div>
    </div>
  );
};

export default GameContainer;
