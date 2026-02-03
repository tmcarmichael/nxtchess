import { Show, type Component } from 'solid-js';
import styles from './ChessEngineOverlay.module.css';

interface ChessEngineOverlayProps {
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string | null;
  onRetry: () => void;
}

const ChessEngineOverlay: Component<ChessEngineOverlayProps> = (props) => {
  return (
    <Show when={props.isLoading || props.hasError}>
      <div class={styles.engineOverlay}>
        <div class={styles.engineOverlayContent}>
          <Show when={props.isLoading && !props.hasError}>
            <div class={styles.engineLoadingState}>
              <div class={styles.engineLoadingSpinner} />
              <h3 class={styles.engineLoadingTitle}>Initializing Chess Engine</h3>
              <p class={styles.engineLoadingMessage}>Loading Stockfish...</p>
            </div>
          </Show>

          <Show when={props.hasError}>
            <div class={styles.errorState}>
              <div class={styles.errorIcon}>!</div>
              <h3 class={styles.errorTitle}>Engine Failed to Load</h3>
              <p class={styles.errorMessage}>
                {props.errorMessage || 'The chess engine could not be initialized.'}
              </p>
              <button class={styles.retryButton} onClick={() => props.onRetry()}>
                Retry
              </button>
            </div>
          </Show>
        </div>
      </div>
    </Show>
  );
};

export default ChessEngineOverlay;
