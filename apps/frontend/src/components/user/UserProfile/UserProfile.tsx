import { createEffect, Show } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { useAuthStore } from '../../../store/AuthContext';
import styles from './UserProfile.module.css';

const UserProfile = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [authState, authActions] = useAuthStore();

  createEffect(() => {
    if (authState.username === params.username) {
      authActions.fetchUserProfile();
    }
  });

  const signOut = () => {
    document.cookie = 'session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    authActions.setIsLoggedIn(false);
    authActions.setUsername('');
    navigate('/');
  };

  return (
    <div class={styles.userProfileContainer}>
      <h2 class={styles.userProfileTitle}>{params.username}</h2>
      <Show
        when={authState.rating != null}
        fallback={<p class={styles.userProfileLoading}>Loading user rating...</p>}
      >
        <p class={styles.userProfileRating}>Rating: {authState.rating}</p>
      </Show>
      <div class={styles.userProfileGraph}>
        <p>Rating Graph (dev)</p>
      </div>
    </div>
  );
};

export default UserProfile;
