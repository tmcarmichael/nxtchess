import { type Component, Show, createMemo } from 'solid-js';
import styles from './ChessEvalBar.module.css';

interface EvalBarProps {
  evalScore: number | null;
}

// Threshold above which we consider it a "mate" score
// Engine encodes mate as 999 - mateDistance, so scores >= 90 are mate-in-9 or closer
const MATE_THRESHOLD = 90;

const ChessEvalBar: Component<EvalBarProps> = (props) => {
  // Detect if this is a mate score and extract mate distance
  const mateInfo = createMemo(() => {
    if (props.evalScore === null) return null;
    const absScore = Math.abs(props.evalScore);
    if (absScore >= MATE_THRESHOLD) {
      const mateDistance = Math.round(999 - absScore);
      const isWhiteMating = props.evalScore > 0;
      return { mateDistance, isWhiteMating };
    }
    return null;
  });

  // Format the display score
  const displayScore = createMemo(() => {
    if (props.evalScore === null) return '--';
    const mate = mateInfo();
    if (mate) {
      // Show "M5" for mate in 5, "-M5" for getting mated in 5
      const sign = mate.isWhiteMating ? '' : '-';
      return `${sign}M${mate.mateDistance}`;
    }
    // Cap display at ±9.9 for readability
    const capped = Math.max(-9.9, Math.min(9.9, props.evalScore));
    return capped.toFixed(1);
  });

  // Calculate white's portion of the bar (0-100%)
  // +10 eval → 100% white, -10 eval → 0% white
  // For mate scores, push to 100% or 0%
  const whitePortion = () => {
    if (props.evalScore === null) return 50;
    const mate = mateInfo();
    if (mate) {
      return mate.isWhiteMating ? 100 : 0;
    }
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
          {displayScore()}
        </Show>
      </div>
    </div>
  );
};

export default ChessEvalBar;
