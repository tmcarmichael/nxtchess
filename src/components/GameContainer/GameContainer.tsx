import { createSignal, Show, createEffect } from 'solid-js';
import { useLocation } from '@solidjs/router';
import { Difficulty, Side, ChessGameProps, NewGameSettings, BoardSquare } from '../../types';
import styles from './GameContainer.module.css';
import ChessGame from '../ChessGame/ChessGame';
import GamePanel from '../GamePanel/GamePanel';
import PlayModal from '../PlayModal/PlayModal';
import { debugLog } from '../../utils';

const GameContainer = () => {
  const location = useLocation();
  const [timeControl, setTimeControl] = createSignal(5);
  const [difficulty, setDifficulty] = createSignal<Difficulty>('medium');
  const [side, setSide] = createSignal<Side>('w');
  const [showPlayModal, setShowPlayModal] = createSignal(false);
  const [capturedWhite, setCapturedWhite] = createSignal<string[]>([]);
  const [capturedBlack, setCapturedBlack] = createSignal<string[]>([]);
  const [boardSquares, setBoardSquares] = createSignal<BoardSquare[]>([]);

  const handleStartGame = (newSettings: NewGameSettings) => {
    const { timeControl, difficulty, side } = newSettings;
    setTimeControl(timeControl);
    setDifficulty(difficulty);
    setSide(side);
    setShowPlayModal(false);
    setCapturedWhite([]);
    setCapturedBlack([]);
  };

  createEffect(() => {
    debugLog('LOCATION.STATE =>', location.state);
    const state = location.state as ChessGameProps | undefined;
    if (!state) return;
    if (state.timeControl !== undefined) setTimeControl(state.timeControl);
    if (state.difficulty !== undefined) setDifficulty(state.difficulty);
    if (state.side !== undefined) setSide(state.side);
  });

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
          {debugLog('GameContainer => Rendering ChessGame with:', {
            timeControl: timeControl(),
            difficulty: difficulty(),
            side: side(),
          }) === null}
          <ChessGame
            timeControl={timeControl()}
            difficulty={difficulty()}
            side={side()}
            onCapturedWhiteChange={(fn) => setCapturedWhite((prev) => fn(prev))}
            onCapturedBlackChange={(fn) => setCapturedBlack((prev) => fn(prev))}
            onBoardChange={(b) => setBoardSquares(b)}
          />
        </div>
        <div class={styles.panelWrapper}>
          <GamePanel
            capturedWhite={() => capturedWhite()}
            capturedBlack={() => capturedBlack()}
            board={() => boardSquares()}
          />
        </div>
      </div>
    </div>
  );
};

export default GameContainer;
