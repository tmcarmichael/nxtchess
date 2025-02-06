import { createMemo } from 'solid-js';
import { useGameStore } from '../../store/game/GameContext';
import styles from './GameClock.module.css';

const GameClock = (props: { side: 'w' | 'b' }) => {
  const [state, _] = useGameStore();

  const whiteTime = () => state.whiteTime;
  const blackTime = () => state.blackTime;

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const label = () => (props.side === 'w' ? 'White' : 'Black');

  const timeValue = createMemo(() => (props.side === 'w' ? whiteTime() : blackTime()));

  return (
    <div class={styles.gameClock}>
      <span class={styles.label}>{label()}:</span>
      <span>{formatTime(timeValue())}</span>
    </div>
  );
};

export default GameClock;
