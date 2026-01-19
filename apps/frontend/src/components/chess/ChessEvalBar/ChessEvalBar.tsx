import { type Component, Show } from 'solid-js';
import styles from './ChessEvalBar.module.css';

interface EvalBarProps {
  evalScore: number | null;
}

const ChessEvalBar: Component<EvalBarProps> = (props) => {
  const barHeightPercent = () => {
    if (props.evalScore === null) return 50;
    const minEval = -10;
    const maxEval = 10;
    const clampedEval = Math.max(minEval, Math.min(maxEval, props.evalScore));
    return ((clampedEval - minEval) / (maxEval - minEval)) * 100;
  };

  return (
    <div class={styles.evalBarContainer}>
      <div class={styles.barBackground}>
        <div class={styles.barFill} style={{ height: `${barHeightPercent()}%` }} />
      </div>
      <div class={styles.evalScore}>
        <Show when={props.evalScore !== null} fallback="--">
          {props.evalScore?.toFixed(2)}
        </Show>
      </div>
    </div>
  );
};

export default ChessEvalBar;
