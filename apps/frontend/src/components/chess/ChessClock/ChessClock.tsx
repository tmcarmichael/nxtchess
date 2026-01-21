import { createMemo, splitProps, type Component } from 'solid-js';
import { usePlayGame } from '../../../store/game/PlayGameContext';
import styles from './ChessClock.module.css';

interface GameClockProps {
  side: 'w' | 'b';
}

const ChessClock: Component<GameClockProps> = (props) => {
  const [local] = splitProps(props, ['side']);
  const { timer } = usePlayGame();

  const formatTime = (timeMs: number) => {
    const totalSeconds = Math.floor(timeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const base = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Show tenths only when under 20 seconds
    if (totalSeconds < 20) {
      const tenths = Math.floor((timeMs % 1000) / 100);
      return `${base}.${tenths}`;
    }
    return base;
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
