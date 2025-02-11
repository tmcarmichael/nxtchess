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

  const handleDiscordSignIn = () => {
    alert('Discord sign-in coming soon...');
  };

  const handleGithubSignIn = () => {
    alert('GitHub sign-in coming soon...');
  };

  return (
    <div class={styles.modalOverlay} onClick={local.onClose}>
      <div class={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button class={styles.closeButton} onClick={local.onClose} aria-label="Close">
          &times;
        </button>
        <h2>Sign In</h2>
        <p>Choose your sign-in provider:</p>
        <div class={styles.signInOptions}>
          <button class={styles.signInButton} onClick={handleGoogleSignIn}>
            Sign in with Google
          </button>
          <button class={styles.signInButton} onClick={handleDiscordSignIn}>
            Sign in with Discord
          </button>
          <button class={styles.signInButton} onClick={handleGithubSignIn}>
            Sign in with GitHub
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignInModal;
