import { createMemo, splitProps, Component } from 'solid-js';
import { useGameStore } from '../../../store/GameContext';
import styles from './GameClock.module.css';

interface GameClockProps {
  side: 'w' | 'b';
}

const GameClock: Component<GameClockProps> = (props) => {
  const [local] = splitProps(props, ['side']);
  const [state] = useGameStore();

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const label = () => (props.side === 'w' ? 'White' : 'Black');

  const timeValue = createMemo(() => (local.side === 'w' ? state.whiteTime : state.blackTime));

  return (
    <div class={styles.gameClock}>
      <span class={styles.label}>{label()}:</span>
      <span>{formatTime(timeValue())}</span>
    </div>
  );
};

export default GameClock;
