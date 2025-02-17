import { createSignal, Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useUserStore } from '../../../store/UserContext';
import styles from './UsernameSetup.module.css';

const UsernameSetup: Component = () => {
  const navigate = useNavigate();
  const [_, userActions] = useUserStore();
  const [localName, setLocalName] = createSignal('');
  const [error, setError] = createSignal('');

  const submitUsername = async () => {
    try {
      await userActions.saveUsername(localName(), navigate);
    } catch (err: any) {
      setError(err.message || 'Error saving username');
    }
  };

  return (
    <div class={styles.usernameSetupContainer}>
      <h2 class={styles.usernameSetupTitle}>Set Your Username</h2>
      <input
        type="text"
        class={styles.usernameSetupInput}
        placeholder="Enter a username"
        onInput={(e) => setLocalName(e.currentTarget.value)}
      />
      <button class={styles.usernameSetupButton} onClick={submitUsername}>
        Save Username
      </button>
      {error() && <p class={styles.usernameSetupError}>{error()}</p>}
    </div>
  );
};

export default UsernameSetup;
