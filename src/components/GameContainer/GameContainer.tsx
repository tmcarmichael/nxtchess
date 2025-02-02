import { createSignal, Show, createEffect } from 'solid-js';
import { useLocation } from '@solidjs/router';
import { Difficulty, NewGameSettings, Side } from '../../types';
import styles from './GameContainer.module.css';
import ChessGame from '../ChessGame/ChessGame';
import GamePanel from '../GamePanel/GamePanel';
import PlayModal from '../modals/PlayModal/PlayModal';
import { debugLog } from '../../utils';
import { useGameStore } from '../../store/game/GameContext';

const GameContainer = () => {
  const location = useLocation();
  const [showPlayModal, setShowPlayModal] = createSignal(false);
  const [timeControl, setTimeControl] = createSignal<number>(5);
  const [difficulty, setDifficulty] = createSignal<Difficulty>('medium');
  const [side, setSide] = createSignal<Side>('w');

  const { setCapturedWhite, setCapturedBlack, setBoardSquares, startNewGame } = useGameStore();

  createEffect(() => {
    debugLog('createEffect() GameContainer.tsx LOCATION.STATE =>', location.state);
    const state = location.state as any;
    if (!state) return;
    if (state.timeControl !== undefined) setTimeControl(state.timeControl);
    if (state.difficulty !== undefined) setDifficulty(state.difficulty);
    if (state.side !== undefined) setSide(state.side);
  });

  const handleStartGame = (newSettings: NewGameSettings) => {
    const { timeControl, difficulty, side } = newSettings;
    setTimeControl(timeControl);
    setDifficulty(difficulty);
    setSide(side);
    setShowPlayModal(false);

    startNewGame(timeControl, difficulty, side);
  };

  return (
    <div class={styles.gameContainer}>
      <Show when={showPlayModal()}>
        <PlayModal
          onClose={() => setShowPlayModal(false)}
          onStartGame={handleStartGame}
          initialSettings={{
            timeControl: timeControl(),
            difficulty: difficulty(),
            side: side(),
          }}
        />
      </Show>
      <div class={styles.gameLayout}>
        <div class={styles.boardWrapper}>
          <ChessGame
            timeControl={timeControl()}
            difficulty={difficulty()}
            side={side()}
            onCapturedWhiteChange={(fn) => setCapturedWhite((prev: any) => fn(prev))}
            onCapturedBlackChange={(fn) => setCapturedBlack((prev: any) => fn(prev))}
            onBoardChange={(b) => setBoardSquares(b)}
          />
        </div>
        <div class={styles.panelWrapper}>
          <GamePanel />
        </div>
      </div>
    </div>
  );
};

export default GameContainer;
