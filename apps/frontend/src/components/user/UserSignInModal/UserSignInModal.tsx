import { useSearchParams } from '@solidjs/router';
import { splitProps, type Component } from 'solid-js';
import { BACKEND_URL } from '../../../shared/config/env';
import ChessGameModal from '../../chess/ChessGameModal/ChessGameModal';
import styles from './UserSignInModal.module.css';

interface SignInModalProps {
  onClose: () => void;
}

const UserSignInModal: Component<SignInModalProps> = (props) => {
  const [local] = splitProps(props, ['onClose']);
  const [searchParams, setSearchParams] = useSearchParams();

  const dismissError = () => {
    setSearchParams({ error: undefined });
  };

  const handleClose = () => {
    dismissError();
    local.onClose();
  };

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
    <ChessGameModal title="Sign In" onClose={handleClose} size="md">
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
    </ChessGameModal>
  );
};

export default UserSignInModal;
