import { splitProps, Component, createEffect } from 'solid-js';
// import { useNavigate } from '@solidjs/router';
import styles from './SignInModal.module.css';

interface SignInModalProps {
  onClose: () => void;
}

const SignInModal: Component<SignInModalProps> = (props) => {
  const [local] = splitProps(props, ['onClose']);
  // const navigate = useNavigate();

  const handleGoogleSignIn = () => {
    window.location.href = 'http://localhost:8080/auth/google/login';
  };

  const handleDiscordSignIn = () => {
    window.location.href = 'http://localhost:8080/auth/discord/login';
  };

  const handleGitHubSignIn = () => {
    window.location.href = 'http://localhost:8080/auth/github/login';
  };

  createEffect(() => {
    fetch('http://localhost:8080/check-username', { credentials: 'include' })
      .then((res) => {
        if (res.status === 404) {
          // navigate('/TODO-USERNAME');
        } else if (res.ok) {
          // navigate('/TODO-PROFILE');
        }
      })
      .catch(console.error);
  });

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
          <button class={styles.signInButton} onClick={handleDiscordSignIn}>
            Sign in with Discord OAuth2
          </button>
          <button class={styles.signInButton} onClick={handleGitHubSignIn}>
            Sign in with GitHub OAuth2
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignInModal;
