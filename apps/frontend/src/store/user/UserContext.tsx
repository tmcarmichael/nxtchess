import { createContext, useContext, JSX } from 'solid-js';
import { createUserStore } from './userStore';

const UserContext = createContext<ReturnType<typeof createUserStore> | null>(null);

export const UserProvider = (props: { children: JSX.Element }) => {
  const [state, actions] = createUserStore();

  return <UserContext.Provider value={[state, actions]}>{props.children}</UserContext.Provider>;
};

export const useUserStore = () => {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUserStore must be used within <UserProvider>');
  }
  return ctx;
};
