import { createEffect } from 'solid-js';
import { useParams } from '@solidjs/router';
import { useAuthStore } from '../../../store/AuthContext';
import styles from './UserProfile.module.css';

const UserProfile = () => {
  const params = useParams();
  const [authState, authActions] = useAuthStore();

  createEffect(() => {
    if (authState.username === params.username) {
      authActions.fetchUserProfile();
    }
  });

  return (
    <div class={styles.userProfileContainer}>
      <h2 class={styles.userProfileTitle}>{params.username}</h2>
      {authState.rating != null ? (
        <p class={styles.userProfileRating}>Rating: {authState.rating}</p>
      ) : (
        <p class={styles.userProfileLoading}>Loading user rating...</p>
      )}
    </div>
  );
};

export default UserProfile;
