import { useSearchParams } from '@solidjs/router';
import { splitProps, type Component, onMount, onCleanup } from 'solid-js';
import { BACKEND_URL } from '../../../shared/config/env';
import styles from './UserSignInModal.module.css';

interface SignInModalProps {
  onClose: () => void;
}

const UserSignInModal: Component<SignInModalProps> = (props) => {
  const [local] = splitProps(props, ['onClose']);
  const [searchParams, setSearchParams] = useSearchParams();
  // eslint-disable-next-line no-undef
  let closeButtonRef: HTMLButtonElement | undefined;

  const dismissError = () => {
    setSearchParams({ error: undefined });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (closeButtonRef) {
        closeButtonRef.classList.add(styles.escapeActive);
        setTimeout(() => {
          dismissError();
          local.onClose();
        }, 150);
      } else {
        dismissError();
        local.onClose();
      }
    }
  };

  onMount(() => {
    document.addEventListener('keydown', handleKeyDown);
  });

  onCleanup(() => {
    document.removeEventListener('keydown', handleKeyDown);
  });

  const handleGoogleSignIn = () => {
    window.location.href = `${BACKEND_URL}/auth/google/login`;
  };
  const handleDiscordSignIn = () => {
    window.location.href = `${BACKEND_URL}/auth/discord/login`;
  };
  const handleGitHubSignIn = () => {
    window.location.href = `${BACKEND_URL}/auth/github/login`;
  };

  return (
    <div class={styles.modalOverlay} onClick={local.onClose}>
      <div class={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button
          ref={closeButtonRef}
          class={styles.closeButton}
          onClick={() => {
            dismissError();
            local.onClose();
          }}
          aria-label="Close"
        >
          <span class={styles.closeIcon}>&times;</span>
        </button>
        <h2>Sign In</h2>
        {searchParams.error && (
          <div class={styles.errorBanner}>
            <p>{searchParams.error}</p>
            <button onClick={dismissError}>Dismiss Error</button>
          </div>
        )}
        <p>Choose your OAuth sign-in provider:</p>
        <div class={styles.signInOptions}>
          <button class={styles.signInButton} onClick={handleGoogleSignIn}>
            Sign in with Google
          </button>
          <button class={styles.signInButton} onClick={handleDiscordSignIn}>
            Sign in with Discord
          </button>
          <button class={styles.signInButton} onClick={handleGitHubSignIn}>
            Sign in with GitHub
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSignInModal;
