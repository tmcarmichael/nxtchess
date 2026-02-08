import { createStore } from 'solid-js/store';
import { BACKEND_URL } from '../../shared/config/env';
import { DEBUG } from '../../shared/utils/debug';

interface UserState {
  isLoggedIn: boolean;
  username: string;
  rating: number | null;
  profileIcon: string;
}

interface UserActions {
  checkUserStatus: (navigateFn: (path: string) => void) => Promise<void>;
  saveUsername: (newName: string, navigateFn: (path: string) => void) => Promise<void>;
  setIsLoggedIn: (val: boolean) => void;
  setUsername: (val: string) => void;
  fetchUserProfile: () => Promise<void>;
  setProfileIcon: (icon: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const createUserStore = () => {
  const [state, setState] = createStore<UserState>({
    isLoggedIn: false,
    username: '',
    rating: null,
    profileIcon: 'white-pawn',
  });

  const checkUserStatus = async (navigateFn: (path: string) => void) => {
    try {
      const res = await fetch(`${BACKEND_URL}/check-username`, {
        credentials: 'include',
      });
      if (!res.ok) {
        // Unexpected error
        setState('isLoggedIn', false);
        setState('username', '');
        setState('rating', null);
        setState('profileIcon', 'white-pawn');
        return;
      }
      const data = await res.json();
      if (!data.authenticated) {
        // Not logged in
        setState('isLoggedIn', false);
        setState('username', '');
        setState('rating', null);
        setState('profileIcon', 'white-pawn');
      } else if (!data.username_set) {
        // Logged in but no username
        setState('isLoggedIn', true);
        navigateFn('/username-setup');
      } else {
        // Fully logged in
        setState('isLoggedIn', true);
        setState('username', data.username);
        if (data.profile_icon) {
          setState('profileIcon', data.profile_icon);
        }
      }
    } catch (err) {
      if (DEBUG) console.error('Error checking username:', err);
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
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'An error occurred.');
      }
      setState('isLoggedIn', true);
      setState('username', newName);
      navigateFn(`/profile/${newName}`);
    } catch (err) {
      if (DEBUG) console.error('Error saving username:', err);
      throw err;
    }
  };

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/profile/${state.username}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch profile: ${res.status} - ${text}`);
      }
      const data = await res.json();
      setState('rating', data.rating);
      if (data.profile_icon) {
        setState('profileIcon', data.profile_icon);
      }
    } catch (err) {
      if (DEBUG) console.error('Error fetching user profile:', err);
      throw err;
    }
  };

  const setIsLoggedIn = (val: boolean) => {
    setState('isLoggedIn', val);
  };

  const setUsername = (val: string) => {
    setState('username', val);
  };

  const setProfileIcon = async (icon: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/set-profile-icon`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ icon }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to set profile icon');
      }
      setState('profileIcon', icon);
    } catch (err) {
      if (DEBUG) console.error('Error setting profile icon:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${BACKEND_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      if (DEBUG) console.error('Error during logout:', err);
    }
    // Reset all state regardless of API success
    setState('isLoggedIn', false);
    setState('username', '');
    setState('rating', null);
    setState('profileIcon', 'white-pawn');
  };

  const actions: UserActions = {
    checkUserStatus,
    saveUsername,
    setIsLoggedIn,
    setUsername,
    fetchUserProfile,
    setProfileIcon,
    logout,
  };

  return [state, actions] as const;
};
