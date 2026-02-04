import { useNavigate } from '@solidjs/router';
import { createSignal, createEffect, Show, type Component, onMount } from 'solid-js';
import { useUserStore } from '../../../store/user/UserContext';
import ChessGameModal from '../../chess/ChessGameModal/ChessGameModal';
import styles from './UsernameSetup.module.css';

const UsernameSetup: Component = () => {
  const navigate = useNavigate();
  const [userState, userActions] = useUserStore();
  const [localName, setLocalName] = createSignal('');
  const [error, setError] = createSignal('');
  const [isCheckingStatus, setIsCheckingStatus] = createSignal(true);
  const [isSubmitting, setIsSubmitting] = createSignal(false);

  onMount(async () => {
    if (!userState.isLoggedIn) {
      await userActions.checkUserStatus(navigate);
    }
    setIsCheckingStatus(false);
  });

  createEffect(() => {
    if (isCheckingStatus()) return;

    if (!userState.isLoggedIn) {
      navigate('/', { replace: true });
    } else if (userState.username) {
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

  const handleCancel = async () => {
    await userActions.logout();
    navigate('/');
  };

  return (
    <Show when={!isCheckingStatus()} fallback={<div class={styles.setupLoading}>Loading...</div>}>
      <ChessGameModal title="Set Username" onClose={handleCancel} size="sm">
        <div class={styles.setupContent}>
          <input
            type="text"
            class={styles.setupInput}
            placeholder="Enter a username"
            value={localName()}
            onInput={(e) => setLocalName(e.currentTarget.value)}
            disabled={isSubmitting()}
          />
          <Show when={error()}>
            <p class={styles.setupError}>{error()}</p>
          </Show>
          <div class={styles.setupActions}>
            <button class={styles.cancelButton} onClick={handleCancel}>
              Cancel
            </button>
            <button class={styles.saveButton} onClick={submitUsername} disabled={isSubmitting()}>
              {isSubmitting() ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </ChessGameModal>
    </Show>
  );
};

export default UsernameSetup;
