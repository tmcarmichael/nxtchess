import { ErrorBoundary, type ParentComponent } from 'solid-js';
import styles from './CommonErrorBoundary.module.css';

interface ErrorFallbackProps {
  error: Error;
  reset: () => void;
}

const ErrorFallback = (props: ErrorFallbackProps) => {
  return (
    <div class={styles.errorContainer}>
      <div class={styles.errorContent}>
        <h2 class={styles.errorTitle}>Something went wrong</h2>
        <p class={styles.errorMessage}>{props.error.message || 'An unexpected error occurred'}</p>
        <div class={styles.errorActions}>
          <button class={styles.retryButton} onClick={props.reset}>
            Try Again
          </button>
          <button class={styles.homeButton} onClick={() => (window.location.href = '/')}>
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

const CommonErrorBoundary: ParentComponent = (props) => {
  return (
    <ErrorBoundary fallback={(err, reset) => <ErrorFallback error={err} reset={reset} />}>
      {props.children}
    </ErrorBoundary>
  );
};

export default CommonErrorBoundary;
