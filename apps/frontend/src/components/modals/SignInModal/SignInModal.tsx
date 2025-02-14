import { splitProps, Component } from 'solid-js';
import styles from './SignInModal.module.css';

interface SignInModalProps {
  onClose: () => void;
}

const SignInModal: Component<SignInModalProps> = (props) => {
  const [local] = splitProps(props, ['onClose']);

  const handleGoogleSignIn = () => {
    window.location.href = 'http://localhost:8080/auth/google';
  };

  const handleDiscordLogin = () => {
    window.location.href = 'http://localhost:8080/auth/discord';
  };

  const handleGitHubLogin = () => {
    window.location.href = 'http://localhost:8080/auth/github';
  };

  return (
    <div class={styles.modalOverlay} onClick={local.onClose}>
      <div class={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button class={styles.closeButton} onClick={local.onClose} aria-label="Close">
          &times;
        </button>
        <h2>Sign In</h2>
        <p>Choose your OAuth sign-in provider:</p>
        <div class={styles.signInOptions}>
          <button class={styles.signInButton} onClick={handleGoogleSignIn}>
            Sign in with Google OAuth2
          </button>
          <button class={styles.signInButton} onClick={handleDiscordLogin}>
            Sign in with Discord OAuth2
          </button>
          <button class={styles.signInButton} onClick={handleGitHubLogin}>
            Sign in with GitHub OAuth2
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignInModal;
