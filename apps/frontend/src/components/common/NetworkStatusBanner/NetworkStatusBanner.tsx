import { createSignal, onMount, onCleanup, Show, type Component } from 'solid-js';
import styles from './NetworkStatusBanner.module.css';

const NetworkStatusBanner: Component = () => {
  const [isOnline, setIsOnline] = createSignal(navigator.onLine);
  const [showBanner, setShowBanner] = createSignal(false);
  const [wasOffline, setWasOffline] = createSignal(false);
  const [isDismissed, setIsDismissed] = createSignal(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    setShowBanner(false);
  };

  onMount(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Reset dismissed state when going online so banner reappears on next offline
      setIsDismissed(false);
      // Show "back online" message briefly if we were offline
      if (wasOffline()) {
        setShowBanner(true);
        setTimeout(() => {
          setShowBanner(false);
          setWasOffline(false);
        }, 3000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      // Only show banner if not dismissed
      if (!isDismissed()) {
        setShowBanner(true);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial state
    if (!navigator.onLine) {
      setIsOnline(false);
      setWasOffline(true);
      setShowBanner(true);
    }

    onCleanup(() => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    });
  });

  return (
    <Show when={showBanner()}>
      <div
        class={styles.networkBannerRoot}
        classList={{
          [styles.offline]: !isOnline(),
          [styles.online]: isOnline(),
        }}
        role="status"
        aria-live="polite"
      >
        <span class={styles.statusIcon}>{isOnline() ? '✓' : '!'}</span>
        <span class={styles.statusMessage}>
          {isOnline() ? 'Back online' : 'You are offline - some features may be unavailable'}
        </span>
        <Show when={!isOnline()}>
          <button class={styles.dismissButton} onClick={handleDismiss} aria-label="Dismiss">
            ×
          </button>
        </Show>
      </div>
    </Show>
  );
};

export default NetworkStatusBanner;
