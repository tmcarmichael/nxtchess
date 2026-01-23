import { createSignal, onMount, onCleanup, Show, type Component } from 'solid-js';
import styles from './NetworkStatusBanner.module.css';

const NetworkStatusBanner: Component = () => {
  const [isOnline, setIsOnline] = createSignal(navigator.onLine);
  const [showBanner, setShowBanner] = createSignal(false);
  const [wasOffline, setWasOffline] = createSignal(false);

  onMount(() => {
    const handleOnline = () => {
      setIsOnline(true);
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
      setShowBanner(true);
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
        class={styles.banner}
        classList={{
          [styles.offline]: !isOnline(),
          [styles.online]: isOnline(),
        }}
        role="status"
        aria-live="polite"
      >
        <span class={styles.icon}>{isOnline() ? '✓' : '!'}</span>
        <span class={styles.message}>
          {isOnline() ? 'Back online' : 'You are offline - some features may be unavailable'}
        </span>
        <Show when={!isOnline()}>
          <span class={styles.hint}>Training mode works offline</span>
        </Show>
      </div>
    </Show>
  );
};

export default NetworkStatusBanner;
