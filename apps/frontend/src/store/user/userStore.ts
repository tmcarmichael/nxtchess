import { createStore } from 'solid-js/store';
import { BACKEND_URL } from '../../shared/config';

interface UserState {
  isLoggedIn: boolean;
  username: string;
  rating: number | null;
}

interface UserActions {
  checkUserStatus: (navigateFn: (path: string) => void) => Promise<void>;
  saveUsername: (newName: string, navigateFn: (path: string) => void) => Promise<void>;
  setIsLoggedIn: (val: boolean) => void;
  setUsername: (val: string) => void;
  fetchUserProfile: () => Promise<void>;
}

export const createUserStore = () => {
  const [state, setState] = createStore<UserState>({
    isLoggedIn: false,
    username: '',
    rating: null,
  });

  const checkUserStatus = async (navigateFn: (path: string) => void) => {
    try {
      const res = await fetch(`${BACKEND_URL}/check-username`, {
        credentials: 'include',
      });
      if (res.status === 401) {
        setState('isLoggedIn', false);
        setState('username', '');
      } else if (res.status === 404) {
        setState('isLoggedIn', true);
        navigateFn('/username-setup');
      } else if (res.ok) {
        setState('isLoggedIn', true);
        const data = await res.json();
        if (data.username) {
          setState('username', data.username);
        }
      }
    } catch (err) {
      console.error('Error checking username:', err);
    }
  };

  const saveUsername = async (newName: string, navigateFn: (path: string) => void) => {
    try {
      const res = await fetch(`${BACKEND_URL}/set-username`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newName }),
      });
      if (res.status === 409) {
        throw new Error('Username already taken');
      } else if (!res.ok) {
        throw new Error('An error occurred.');
      }
      setState('isLoggedIn', true);
      setState('username', newName);
      navigateFn(`/profile/${newName}`);
    } catch (err) {
      console.error('Error saving username:', err);
      throw err;
    }
  };

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/profile/${state.username}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch profile: ${res.status} - ${text}`);
      }
      const data = await res.json();
      setState('rating', data.rating);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      throw err;
    }
  };

  const setIsLoggedIn = (val: boolean) => {
    setState('isLoggedIn', val);
  };

  const setUsername = (val: string) => {
    setState('username', val);
  };

  const actions: UserActions = {
    checkUserStatus,
    saveUsername,
    setIsLoggedIn,
    setUsername,
    fetchUserProfile,
  };

  return [state, actions] as const;
};
