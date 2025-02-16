import { createContext, useContext } from 'solid-js';
import { createAuthStore } from './authStore';

const AuthContext = createContext<ReturnType<typeof createAuthStore> | null>(null);

export function AuthProvider(props: { children: any }) {
  const [state, actions] = createAuthStore();

  return <AuthContext.Provider value={[state, actions]}>{props.children}</AuthContext.Provider>;
}

export function useAuthStore() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthStore must be used within <AuthProvider>');
  }
  return ctx;
}
