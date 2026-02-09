import { createMemo, For, type Component } from 'solid-js';
import styles from './ReviewEvalGraph.module.css';
import type { EvalPoint } from '../../../types/review';

interface ReviewEvalGraphProps {
  evalHistory: EvalPoint[];
  currentMoveIndex: number;
  onJumpToMove: (index: number) => void;
}

const EVAL_CLAMP = 5;
const GRAPH_HEIGHT = 120;
const MID_Y = GRAPH_HEIGHT / 2;

const ReviewEvalGraph: Component<ReviewEvalGraphProps> = (props) => {
  const evalBars = createMemo(() =>
    props.evalHistory.map((p) => {
      const clamped =
        p.evalAfter !== null ? Math.max(-EVAL_CLAMP, Math.min(EVAL_CLAMP, p.evalAfter)) : 0;
      const heightPx = Math.max(2, (Math.abs(clamped) / EVAL_CLAMP) * MID_Y);
      const isWhiteAdvantage = clamped >= 0;
      const topPx = isWhiteAdvantage ? MID_Y - heightPx : MID_Y;

      let color = 'var(--accent)';
      if (p.quality === 'blunder') color = 'var(--move-blunder)';
      else if (p.quality === 'mistake') color = 'var(--move-mistake)';
      else if (p.quality === 'inaccuracy') color = 'var(--move-inaccuracy)';

      return {
        moveIndex: p.moveIndex,
        heightPx,
        topPx,
        color,
        isCurrent: p.moveIndex === props.currentMoveIndex,
      };
    })
  );

  const TIMING_HEIGHT = 80;
  const TIMING_MID = TIMING_HEIGHT / 2;

  const maxMoveTime = createMemo(() => {
    let max = 0;
    for (const p of props.evalHistory) {
      if (p.moveTimeMs && p.moveTimeMs > max) max = p.moveTimeMs;
    }
    return max || 1;
  });

  const timingBars = createMemo(() =>
    props.evalHistory.map((p) => {
      const isWhite = p.side === 'w';
      const barHeight = Math.max(1, ((p.moveTimeMs ?? 0) / maxMoveTime()) * TIMING_MID);
      const topPx = isWhite ? TIMING_MID - barHeight : TIMING_MID;
      return {
        moveIndex: p.moveIndex,
        heightPx: barHeight,
        topPx,
        isWhite,
        isCurrent: p.moveIndex === props.currentMoveIndex,
      };
    })
  );

  return (
    <div class={styles.evalGraphContainer}>
      <div class={styles.evalGraphHeader}>Evaluation</div>
      <div class={styles.graphArea} style={{ height: `${GRAPH_HEIGHT}px` }}>
        <div class={styles.midLine} />
        <div class={styles.barContainer}>
          <For each={evalBars()}>
            {(bar) => (
              <div
                class={styles.barWrapper}
                classList={{ [styles.barWrapperCurrent]: bar.isCurrent }}
                onClick={() => props.onJumpToMove(bar.moveIndex)}
              >
                <div
                  class={styles.bar}
                  style={{
                    height: `${bar.heightPx}px`,
                    top: `${bar.topPx}px`,
                    background: bar.color,
                    opacity: bar.isCurrent ? '1' : '0.7',
                  }}
                />
              </div>
            )}
          </For>
        </div>
      </div>

      <div class={styles.evalGraphHeader}>Move Time</div>
      <div class={styles.timingGraphArea} style={{ height: `${TIMING_HEIGHT}px` }}>
        <div class={styles.midLine} />
        <div class={styles.barContainer}>
          <For each={timingBars()}>
            {(bar) => (
              <div
                class={styles.barWrapper}
                classList={{ [styles.barWrapperCurrent]: bar.isCurrent }}
                onClick={() => props.onJumpToMove(bar.moveIndex)}
              >
                <div
                  class={styles.timingBar}
                  style={{
                    height: `${bar.heightPx}px`,
                    top: `${bar.topPx}px`,
                    background: bar.isWhite ? 'var(--text-muted)' : 'var(--text-secondary)',
                    opacity: bar.isCurrent ? '1' : '0.6',
                  }}
                />
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  );
};

export default ReviewEvalGraph;
