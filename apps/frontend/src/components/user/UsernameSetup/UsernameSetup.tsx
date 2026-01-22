import { useNavigate } from '@solidjs/router';
import { createSignal, createEffect, Show, type Component, onMount } from 'solid-js';
import { useUserStore } from '../../../store/user/UserContext';
import styles from './UsernameSetup.module.css';

const UsernameSetup: Component = () => {
  const navigate = useNavigate();
  const [userState, userActions] = useUserStore();
  const [localName, setLocalName] = createSignal('');
  const [error, setError] = createSignal('');
  const [isCheckingStatus, setIsCheckingStatus] = createSignal(true);
  const [isSubmitting, setIsSubmitting] = createSignal(false);

  // Check user status on mount
  onMount(async () => {
    // Only check if header hasn't already populated the state
    if (!userState.isLoggedIn) {
      await userActions.checkUserStatus(navigate);
    }
    setIsCheckingStatus(false);
  });

  // Redirect based on user state after status check completes
  createEffect(() => {
    if (isCheckingStatus()) return;

    if (!userState.isLoggedIn) {
      // Not logged in - redirect to home
      navigate('/', { replace: true });
    } else if (userState.username) {
      // Already has username - redirect to profile
      navigate(`/profile/${userState.username}`, { replace: true });
    }
  });

  const submitUsername = async () => {
    if (isSubmitting()) return;

    setIsSubmitting(true);
    setError('');

    try {
      await userActions.saveUsername(localName(), navigate);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error saving username';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Show
      when={!isCheckingStatus()}
      fallback={
        <div class={styles.usernameSetupContainer}>
          <p class={styles.usernameSetupLoading}>Loading...</p>
        </div>
      }
    >
      <div class={styles.usernameSetupContainer}>
        <h2 class={styles.usernameSetupTitle}>Set Your Username</h2>
        <input
          type="text"
          class={styles.usernameSetupInput}
          placeholder="Enter a username"
          value={localName()}
          onInput={(e) => setLocalName(e.currentTarget.value)}
          disabled={isSubmitting()}
        />
        <button
          class={styles.usernameSetupButton}
          onClick={submitUsername}
          disabled={isSubmitting()}
        >
          {isSubmitting() ? 'Saving...' : 'Save Username'}
        </button>
        {error() && <p class={styles.usernameSetupError}>{error()}</p>}
      </div>
    </Show>
  );
};

export default UsernameSetup;
