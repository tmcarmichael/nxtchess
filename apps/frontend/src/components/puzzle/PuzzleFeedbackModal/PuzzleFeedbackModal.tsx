import { type Component, onMount, onCleanup } from 'solid-js';
import styles from './PuzzleFeedbackModal.module.css';

interface PuzzleFeedbackModalProps {
  type: 'incorrect' | 'complete';
  message: string;
  onClose: () => void;
  onTryAgain?: () => void;
  onNewPuzzle: () => void;
  onEvaluatePuzzle?: () => void;
}

const PuzzleFeedbackModal: Component<PuzzleFeedbackModalProps> = (props) => {
  // eslint-disable-next-line no-undef
  let closeButtonRef: HTMLButtonElement | undefined;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (closeButtonRef) {
        closeButtonRef.classList.add(styles.closeButtonEscapeActive);
        setTimeout(() => {
          props.onClose();
        }, 150);
      } else {
        props.onClose();
      }
    }
  };

  onMount(() => {
    document.addEventListener('keydown', handleKeyDown);
  });

  onCleanup(() => {
    document.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div class={styles.feedbackOverlay} onClick={(e) => e.stopPropagation()}>
      <div class={styles.feedbackContent} onClick={(e) => e.stopPropagation()}>
        <button
          ref={closeButtonRef}
          class={styles.closeButton}
          onClick={() => props.onClose()}
          aria-label="Close"
        >
          <span class={styles.closeButtonIcon}>&times;</span>
        </button>
        <h3
          classList={{
            [styles.feedbackHeading]: true,
            [styles.feedbackHeadingIncorrect]: props.type === 'incorrect',
            [styles.feedbackHeadingComplete]: props.type === 'complete',
          }}
        >
          {props.type === 'incorrect' ? 'Incorrect Move' : 'Puzzle Complete!'}
        </h3>
        <p class={styles.feedbackMessage}>{props.message}</p>
        <div class={styles.feedbackButtons}>
          {props.type === 'incorrect' && props.onTryAgain && (
            <button
              classList={{
                [styles.feedbackButton]: true,
                [styles.feedbackButtonPrimary]: true,
              }}
              onClick={props.onTryAgain}
            >
              Try Again
            </button>
          )}
          <button
            classList={{
              [styles.feedbackButton]: true,
              [styles.feedbackButtonPrimary]: props.type === 'complete',
            }}
            onClick={() => props.onNewPuzzle()}
          >
            New Puzzle
          </button>
          {props.onEvaluatePuzzle && (
            <button class={styles.feedbackButton} onClick={props.onEvaluatePuzzle}>
              Evaluate Puzzle
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PuzzleFeedbackModal;
