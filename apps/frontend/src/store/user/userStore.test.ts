import { createRoot } from 'solid-js';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createUserStore } from './userStore';

// Mock fetch
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// Mock document.cookie
const originalCookie = Object.getOwnPropertyDescriptor(document, 'cookie');

describe('createUserStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
  });

  afterEach(() => {
    // Restore original cookie descriptor
    if (originalCookie) {
      Object.defineProperty(document, 'cookie', originalCookie);
    }
  });

  describe('initial state', () => {
    it('has correct default values', () => {
      createRoot((dispose) => {
        const [state] = createUserStore();

        expect(state.isLoggedIn).toBe(false);
        expect(state.username).toBe('');
        expect(state.rating).toBeNull();

        dispose();
      });
    });
  });

  describe('setIsLoggedIn', () => {
    it('updates isLoggedIn state', () => {
      createRoot((dispose) => {
        const [state, actions] = createUserStore();

        actions.setIsLoggedIn(true);
        expect(state.isLoggedIn).toBe(true);

        actions.setIsLoggedIn(false);
        expect(state.isLoggedIn).toBe(false);

        dispose();
      });
    });
  });

  describe('setUsername', () => {
    it('updates username state', () => {
      createRoot((dispose) => {
        const [state, actions] = createUserStore();

        actions.setUsername('testuser');
        expect(state.username).toBe('testuser');

        dispose();
      });
    });
  });

  describe('checkUserStatus', () => {
    it('calls API and handles 401 when no session', async () => {
      await createRoot(async (dispose) => {
        const [state, actions] = createUserStore();
        const navigateFn = vi.fn();

        // Mock 401 response (no valid session)
        mockFetch.mockResolvedValueOnce({
          status: 401,
          ok: false,
        });

        await actions.checkUserStatus(navigateFn);

        expect(mockFetch).toHaveBeenCalled();
        expect(state.isLoggedIn).toBe(false);
        expect(state.username).toBe('');

        dispose();
      });
    });

    it('sets logged out on 401 response', async () => {
      await createRoot(async (dispose) => {
        Object.defineProperty(document, 'cookie', {
          writable: true,
          value: 'session_token=abc123',
        });

        mockFetch.mockResolvedValueOnce({
          status: 401,
          ok: false,
        });

        const [state, actions] = createUserStore();
        const navigateFn = vi.fn();

        await actions.checkUserStatus(navigateFn);

        expect(state.isLoggedIn).toBe(false);
        expect(state.username).toBe('');

        dispose();
      });
    });

    it('navigates to username setup when authenticated but no username', async () => {
      await createRoot(async (dispose) => {
        Object.defineProperty(document, 'cookie', {
          writable: true,
          value: 'session_token=abc123',
        });

        mockFetch.mockResolvedValueOnce({
          status: 200,
          ok: true,
          json: () => Promise.resolve({ authenticated: true, username_set: false }),
        });

        const [state, actions] = createUserStore();
        const navigateFn = vi.fn();

        await actions.checkUserStatus(navigateFn);

        expect(state.isLoggedIn).toBe(true);
        expect(navigateFn).toHaveBeenCalledWith('/username-setup');

        dispose();
      });
    });

    it('sets username on successful response', async () => {
      await createRoot(async (dispose) => {
        Object.defineProperty(document, 'cookie', {
          writable: true,
          value: 'session_token=abc123',
        });

        mockFetch.mockResolvedValueOnce({
          status: 200,
          ok: true,
          json: () =>
            Promise.resolve({ authenticated: true, username_set: true, username: 'testuser' }),
        });

        const [state, actions] = createUserStore();
        const navigateFn = vi.fn();

        await actions.checkUserStatus(navigateFn);

        expect(state.isLoggedIn).toBe(true);
        expect(state.username).toBe('testuser');

        dispose();
      });
    });

    it('handles fetch errors gracefully', async () => {
      await createRoot(async (dispose) => {
        Object.defineProperty(document, 'cookie', {
          writable: true,
          value: 'session_token=abc123',
        });

        vi.spyOn(console, 'error').mockImplementation(() => {});
        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        const [state, actions] = createUserStore();
        const navigateFn = vi.fn();

        await actions.checkUserStatus(navigateFn);

        expect(state.isLoggedIn).toBe(false);

        dispose();
      });
    });
  });

  describe('saveUsername', () => {
    it('saves username and navigates to profile', async () => {
      await createRoot(async (dispose) => {
        mockFetch.mockResolvedValueOnce({
          status: 200,
          ok: true,
        });

        const [state, actions] = createUserStore();
        const navigateFn = vi.fn();

        await actions.saveUsername('newuser', navigateFn);

        expect(state.isLoggedIn).toBe(true);
        expect(state.username).toBe('newuser');
        expect(navigateFn).toHaveBeenCalledWith('/profile/newuser');

        dispose();
      });
    });

    it('throws error on 409 conflict', async () => {
      await createRoot(async (dispose) => {
        mockFetch.mockResolvedValueOnce({
          status: 409,
          ok: false,
          json: () => Promise.resolve({ error: 'Username already taken' }),
        });

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const [, actions] = createUserStore();
        const navigateFn = vi.fn();

        await expect(actions.saveUsername('taken', navigateFn)).rejects.toThrow(
          'Username already taken'
        );

        consoleSpy.mockClear();
        dispose();
      });
    });

    it('throws error on other failures', async () => {
      await createRoot(async (dispose) => {
        mockFetch.mockResolvedValueOnce({
          status: 500,
          ok: false,
          json: () => Promise.resolve({}),
        });

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const [, actions] = createUserStore();
        const navigateFn = vi.fn();

        await expect(actions.saveUsername('newuser', navigateFn)).rejects.toThrow(
          'An error occurred.'
        );

        consoleSpy.mockClear();
        dispose();
      });
    });

    it('sends correct request body', async () => {
      await createRoot(async (dispose) => {
        mockFetch.mockResolvedValueOnce({
          status: 200,
          ok: true,
        });

        const [, actions] = createUserStore();
        const navigateFn = vi.fn();

        await actions.saveUsername('myusername', navigateFn);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/set-username'),
          expect.objectContaining({
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'myusername' }),
          })
        );

        dispose();
      });
    });
  });

  describe('fetchUserProfile', () => {
    it('fetches and updates rating', async () => {
      await createRoot(async (dispose) => {
        mockFetch.mockResolvedValueOnce({
          status: 200,
          ok: true,
          json: () => Promise.resolve({ rating: 1500 }),
        });

        const [state, actions] = createUserStore();
        actions.setUsername('testuser');

        await actions.fetchUserProfile();

        expect(state.rating).toBe(1500);

        dispose();
      });
    });

    it('throws error on failed fetch', async () => {
      await createRoot(async (dispose) => {
        mockFetch.mockResolvedValueOnce({
          status: 404,
          ok: false,
          text: () => Promise.resolve('Not found'),
        });

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const [, actions] = createUserStore();
        actions.setUsername('testuser');

        await expect(actions.fetchUserProfile()).rejects.toThrow('Failed to fetch profile');

        consoleSpy.mockClear();
        dispose();
      });
    });

    it('uses correct endpoint with username', async () => {
      await createRoot(async (dispose) => {
        mockFetch.mockResolvedValueOnce({
          status: 200,
          ok: true,
          json: () => Promise.resolve({ rating: 1200 }),
        });

        const [, actions] = createUserStore();
        actions.setUsername('myprofile');

        await actions.fetchUserProfile();

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/profile/myprofile'),
          expect.objectContaining({
            credentials: 'include',
          })
        );

        dispose();
      });
    });
  });

  describe('multiple stores', () => {
    it('creates independent store instances', () => {
      createRoot((dispose) => {
        const [state1, actions1] = createUserStore();
        const [state2] = createUserStore();

        actions1.setUsername('user1');

        expect(state1.username).toBe('user1');
        expect(state2.username).toBe('');

        dispose();
      });
    });
  });
});
