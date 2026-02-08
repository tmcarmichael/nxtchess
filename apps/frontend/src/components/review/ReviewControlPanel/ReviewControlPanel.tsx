import { Show, type Component } from 'solid-js';
import { usePlayGame } from '../../../store/game/PlayGameContext';
import ReviewEvalGraph from '../ReviewEvalGraph/ReviewEvalGraph';
import ReviewProgressBar from '../ReviewProgressBar/ReviewProgressBar';
import ReviewSummaryPanel from '../ReviewSummaryPanel/ReviewSummaryPanel';
import styles from './ReviewControlPanel.module.css';

const ReviewControlPanel: Component = () => {
  const { chess, actions, review } = usePlayGame();

  const isComplete = () => review.phase() === 'complete';

  const handleJumpToMove = (moveIndex: number) => {
    actions.jumpToMove(moveIndex);
  };

  return (
    <div class={styles.controlPanelRoot}>
      <div class={styles.controlPanelHeader}>Game Review</div>

      <div class={styles.controlPanelContent}>
        <ReviewProgressBar phase={review.phase()} progress={review.progress()} />

        <Show when={isComplete()}>
          <ReviewSummaryPanel summary={review.summary()} playerColor={chess.state.playerColor} />
        </Show>

        <Show when={isComplete() && review.evalHistory().length > 1}>
          <ReviewEvalGraph
            evalHistory={review.evalHistory()}
            currentMoveIndex={chess.state.viewMoveIndex}
            onJumpToMove={handleJumpToMove}
          />
        </Show>
      </div>

      <div class={styles.controlPanelFooter}>
        <button class={styles.exitButton} onClick={() => review.exitReview()}>
          Exit Review
        </button>
      </div>
    </div>
  );
};

export default ReviewControlPanel;
