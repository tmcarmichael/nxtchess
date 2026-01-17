import { createContext, useContext, onCleanup, JSX } from 'solid-js';
import { createGameStore } from './gameStore';
import { terminateAiEngine, terminateEvalEngine } from '../../services/engine';

type GameStoreValue = ReturnType<typeof createGameStore>;

const GameContext = createContext<GameStoreValue>();

export const GameProvider = (props: { children: JSX.Element }) => {
  const [state, actions, derived] = createGameStore();

  onCleanup(() => {
    actions.clearGameTimer();
    terminateAiEngine();
    terminateEvalEngine();
  });

  return (
    <GameContext.Provider value={[state, actions, derived]}>{props.children}</GameContext.Provider>
  );
};

export const useGameStore = () => {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error('useGameStore must be used within <GameProvider>');
  }
  return ctx;
};
