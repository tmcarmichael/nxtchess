import { useNavigate } from '@solidjs/router';
import { createSignal, createEffect, Show, For, type Component, onMount } from 'solid-js';
import { useUserStore } from '../../../store/user/UserContext';
import ChessGameModal from '../../chess/ChessGameModal/ChessGameModal';
import styles from './UsernameSetup.module.css';

const SKILL_LEVELS = [
  { rating: 500, label: 'Beginner', description: '500' },
  { rating: 1000, label: 'Intermediate', description: '1000' },
  { rating: 1500, label: 'Expert', description: '1500' },
];

const UsernameSetup: Component = () => {
  const navigate = useNavigate();
  const [userState, userActions] = useUserStore();
  const [localName, setLocalName] = createSignal('');
  const [startingRating, setStartingRating] = createSignal(1000);
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
      await userActions.saveUsername(localName(), navigate, startingRating());
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
      <ChessGameModal title="Set Username" onClose={handleCancel} size="md">
        <div class={styles.setupContent}>
          <input
            type="text"
            class={styles.setupInput}
            placeholder="Enter a username"
            value={localName()}
            onInput={(e) => setLocalName(e.currentTarget.value)}
            disabled={isSubmitting()}
          />

          <div class={styles.skillLevelSection}>
            <label class={styles.skillLevelLabel}>Skill Level:</label>
            <div class={styles.skillLevelGrid}>
              <For each={SKILL_LEVELS}>
                {(level) => (
                  <button
                    class={styles.skillLevelButton}
                    classList={{
                      [styles.skillLevelButtonActive]: startingRating() === level.rating,
                    }}
                    onClick={() => setStartingRating(level.rating)}
                    disabled={isSubmitting()}
                  >
                    <span class={styles.skillLevelName}>{level.label}</span>
                    <span class={styles.skillLevelElo}>{level.description}</span>
                  </button>
                )}
              </For>
            </div>
          </div>

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
