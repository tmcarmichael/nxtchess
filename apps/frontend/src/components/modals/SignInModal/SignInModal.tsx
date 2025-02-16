import { splitProps, Component, createEffect } from 'solid-js';
import { useSearchParams } from '@solidjs/router';
import { BACKEND_URL } from '../../../config/env';
import styles from './SignInModal.module.css';

interface SignInModalProps {
  onClose: () => void;
}

const SignInModal: Component<SignInModalProps> = (props) => {
  const [local] = splitProps(props, ['onClose']);
  const [searchParams, setSearchParams] = useSearchParams();

  const handleGoogleSignIn = () => {
    // window.location.href = `${BACKEND_URL}/auth/google/fail`; // DEV
    window.location.href = `${BACKEND_URL}/auth/google/login`;
  };
  const handleDiscordSignIn = () => {
    window.location.href = `${BACKEND_URL}/auth/discord/login`;
  };
  const handleGitHubSignIn = () => {
    window.location.href = `${BACKEND_URL}/auth/github/login`;
  };

  const dismissError = () => {
    setSearchParams({ error: undefined });
  };

  createEffect(() => {
    if (searchParams.error) {
      console.log('OAuth Error:', searchParams.error);
    }
  });

  return (
    <div class={styles.modalOverlay} onClick={local.onClose}>
      <div class={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button
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
            <button
              onClick={() => {
                dismissError();
              }}
            >
              Dismiss Error
            </button>
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

export default SignInModal;
