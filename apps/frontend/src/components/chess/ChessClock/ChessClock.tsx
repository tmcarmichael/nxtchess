import { type Accessor, type Component } from 'solid-js';
import styles from './ChessClock.module.css';

interface GameClockProps {
  timeMs: Accessor<number>;
  isActive?: Accessor<boolean>;
}

const ChessClock: Component<GameClockProps> = (props) => {
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

  const isLowTime = () => props.timeMs() < 30000;
  const isCritical = () => props.timeMs() < 10000;

  return (
    <div
      class={styles.gameClock}
      classList={{
        [styles.activeTurn]: props.isActive?.() ?? false,
        [styles.lowTimeWarning]: isLowTime(),
        [styles.criticalTimeWarning]: isCritical(),
      }}
    >
      <span class={styles.activeTurnDot} />
      <span class={styles.clockTimeDisplay}>{formatTime(props.timeMs())}</span>
    </div>
  );
};

export default ChessClock;
