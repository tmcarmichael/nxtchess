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

  const evalDescription = createMemo(() => {
    if (props.evalScore === null) return 'Position evaluation: not available';
    const mate = mateInfo();
    if (mate) {
      const side = mate.isWhiteMating ? 'White' : 'Black';
      return `Position evaluation: ${side} has checkmate in ${mate.mateDistance}`;
    }
    const score = props.evalScore;
    const abs = Math.abs(score);
    if (abs < 0.3) return 'Position evaluation: equal';
    const side = score > 0 ? 'White' : 'Black';
    const descriptor = abs < 1 ? 'slightly better' : abs < 3 ? 'better' : 'winning';
    const sign = score > 0 ? 'plus' : 'minus';
    return `Position evaluation: ${side} is ${descriptor}, ${sign} ${abs.toFixed(1)} pawns`;
  });

  return (
    <div class={styles.evalBarContainer} role="img" aria-label={evalDescription()}>
      <div class={styles.evalBarTrack}>
        <div class={styles.evalBarFill} style={{ '--fill-percent': `${whitePortion()}%` }} />
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
