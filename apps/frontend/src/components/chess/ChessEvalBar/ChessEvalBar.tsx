import { type Component, Show } from 'solid-js';
import styles from './ChessEvalBar.module.css';

interface EvalBarProps {
  evalScore: number | null;
}

const ChessEvalBar: Component<EvalBarProps> = (props) => {
  // Calculate white's portion of the bar (0-100%)
  // +10 eval → 100% white, -10 eval → 0% white
  const whitePortion = () => {
    if (props.evalScore === null) return 50;
    const minEval = -10;
    const maxEval = 10;
    const clampedEval = Math.max(minEval, Math.min(maxEval, props.evalScore));
    return ((clampedEval - minEval) / (maxEval - minEval)) * 100;
  };

  // Black's portion is the inverse (barFill represents black, positioned at top)
  const blackPortion = () => 100 - whitePortion();

  return (
    <div class={styles.evalBarContainer}>
      <div class={styles.barBackground}>
        <div class={styles.barFill} style={{ '--fill-percent': `${blackPortion()}%` }} />
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
