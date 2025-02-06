import { createContext, useContext, onCleanup } from 'solid-js';
import { createGameStore } from './gameStore';

type GameStoreValue = ReturnType<typeof createGameStore>;

const GameContext = createContext<GameStoreValue>();

export function GameProvider(props: { children: any }) {
  const [state, actions] = createGameStore();

  onCleanup(() => {
    actions.clearGameTimer();
  });

  return <GameContext.Provider value={[state, actions]}>{props.children}</GameContext.Provider>;
}

export function useGameStore() {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error('useGameStore must be used within <GameProvider>');
  }
  return ctx;
}
