import { createMemo, splitProps, type Component } from 'solid-js';
import { useGame } from '../../../store/game/GameContext';
import styles from './ChessClock.module.css';

interface GameClockProps {
  side: 'w' | 'b';
}

const ChessClock: Component<GameClockProps> = (props) => {
  const [local] = splitProps(props, ['side']);
  const { timer } = useGame();

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const label = () => (props.side === 'w' ? 'White' : 'Black');

  const timeValue = createMemo(() =>
    local.side === 'w' ? timer.state.whiteTime : timer.state.blackTime
  );

  return (
    <div class={styles.gameClock}>
      <span class={styles.label}>{label()}:</span>
      <span>{formatTime(timeValue())}</span>
    </div>
  );
};

export default ChessClock;
