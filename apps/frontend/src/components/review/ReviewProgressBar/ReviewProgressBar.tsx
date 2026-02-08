import { Show, type Component } from 'solid-js';
import styles from './ReviewProgressBar.module.css';
import type { ReviewPhase, ReviewProgress } from '../../../types/review';

interface ReviewProgressBarProps {
  phase: ReviewPhase;
  progress: ReviewProgress | null;
}

const ReviewProgressBar: Component<ReviewProgressBarProps> = (props) => {
  const percent = () => props.progress?.percentComplete ?? 0;
  const isAnalyzing = () => props.phase === 'analyzing';
  const isInitializing = () => isAnalyzing() && !props.progress;

  return (
    <Show when={isAnalyzing()}>
      <div class={styles.progressContainer}>
        <Show
          when={!isInitializing()}
          fallback={
            <div class={styles.progressText}>
              <span>Initializing analysis...</span>
            </div>
          }
        >
          <div class={styles.progressText}>
            Analyzing move {props.progress?.currentMove ?? 0} of {props.progress?.totalMoves ?? 0}
            <span class={styles.progressPercent}>{percent()}%</span>
          </div>
        </Show>
        <div
          class={styles.progressTrack}
          role="progressbar"
          aria-valuenow={percent()}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Game review progress"
        >
          <div
            class={styles.progressFill}
            classList={{ [styles.progressFillIndeterminate]: isInitializing() }}
            style={{ width: isInitializing() ? undefined : `${percent()}%` }}
          />
        </div>
      </div>
    </Show>
  );
};

export default ReviewProgressBar;
