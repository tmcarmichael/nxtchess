import { createStore } from 'solid-js/store';
import { BACKEND_URL } from '../config/env';

interface AuthState {
  isLoggedIn: boolean;
  username: string;
  rating: number | null;
}

interface AuthActions {
  checkUserStatus: (navigateFn: (path: string) => void) => Promise<void>;
  saveUsername: (newName: string, navigateFn: (path: string) => void) => Promise<void>;
  setIsLoggedIn: (val: boolean) => void;
  setUsername: (val: string) => void;
  fetchUserProfile: () => Promise<void>;
}

export function createAuthStore() {
  const [state, setState] = createStore<AuthState>({
    isLoggedIn: false,
    username: '',
    rating: null,
  });

  async function checkUserStatus(navigateFn: (path: string) => void) {
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
  }

  async function saveUsername(newName: string, navigateFn: (path: string) => void) {
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
  }

  async function fetchUserProfile() {
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
  }

  function setIsLoggedIn(val: boolean) {
    setState('isLoggedIn', val);
  }

  function setUsername(val: string) {
    setState('username', val);
  }

  const actions: AuthActions = {
    checkUserStatus,
    saveUsername,
    setIsLoggedIn,
    setUsername,
    fetchUserProfile,
  };

  return [state, actions] as const;
}
