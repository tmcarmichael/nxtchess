import styles from './GamePanel.module.css';
import { For, Show, createSignal, createMemo } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { computeMaterial } from '../../logic/gameState';
import Piece from '../Piece/Piece';
import { PieceType } from '../../types';
import { useGameStore } from '../../store/game/GameContext';
import ResignModal from '../modals/ResignModal/ResignModal';
import GameClock from '../GameClock/GameClock';

const GamePanel = () => {
  const navigate = useNavigate();
  const {
    boardSquares,
    capturedWhite,
    capturedBlack,
    startNewGame,
    playerColor,
    difficulty,
    setBoardView,
  } = useGameStore();
  const [showResignModal, setShowResignModal] = createSignal(false);

  const handleResign = () => {
    setShowResignModal(true);
  };

  const handleReplay = () => {
    startNewGame(3, 600, playerColor() === 'w' ? 'b' : 'w');
    setShowResignModal(false);
  };

  const handleHome = () => {
    navigate('/');
    setShowResignModal(false);
  };

  const handleTakeBack = () => {
    console.log('Take back action');
    alert('Take back action placeholder');
  };

  const material = createMemo(() => computeMaterial(boardSquares()));

  const opponentSide = () => (playerColor() === 'w' ? 'b' : 'w');

  const flipBoardView = () => {
    setBoardView((c) => (c === 'w' ? 'b' : 'w'));
  };

  return (
    <div>
      <div class={styles.clockLayout}>
        <div class={styles.clockWrapper}>
          <GameClock side={opponentSide()} />
        </div>
        <div class={styles.panel}>
          <div class={styles.buttonPanel}>
            <button onClick={handleResign} class={styles.gamePanelButton}>
              <span>Resign ⏹️</span>
            </button>
            <button onClick={flipBoardView} class={styles.gamePanelButton}>
              <span>Flip Board 🔄</span>
            </button>
            <button onClick={handleTakeBack} class={styles.gamePanelButton}>
              <span>Take Back ⏪</span>
            </button>
          </div>
          <Show when={playerColor() === 'w'}>
            <div class={styles.playerInfo}>
              <span>You play White pieces </span>
              <Piece type="wN" style={{ width: '32px', height: '32px' }} />
            </div>
          </Show>
          <Show when={playerColor() === 'b'}>
            <div class={styles.playerInfo}>
              <span>You play Black pieces </span>
              <Piece type="bN" style={{ width: '32px', height: '32px' }} />
            </div>
          </Show>
          <div class={styles.difficulty}>
            <span>{`Difficulty: ${difficulty()} ELO`}</span>
          </div>
          <div class={styles.materialContainer}>
            <div class={styles.materialDiff}>
              <Show when={material().diff !== 0}>
                <span>
                  {material().diff > 0 ? `White +${material().diff}` : `Black +${-material().diff}`}
                </span>
              </Show>
              <Show when={material().diff === 0}>
                <span>Material equal</span>
              </Show>
            </div>
            <div class={styles.capturesContainer}>
              <div class="capturesRow">
                <For each={capturedBlack()}>
                  {(cap) => (
                    <span class={styles.capturedPiece}>
                      <Piece type={cap as PieceType} style={{ width: '24px', height: '24px' }} />
                    </span>
                  )}
                </For>
              </div>
              <div class="capturesRow">
                <For each={capturedWhite()}>
                  {(cap) => (
                    <span class={styles.capturedPiece}>
                      <Piece type={cap as PieceType} style={{ width: '24px', height: '24px' }} />
                    </span>
                  )}
                </For>
              </div>
            </div>
          </div>
        </div>
        <div class={styles.clockWrapper}>
          <GameClock side={playerColor()} />
        </div>
      </div>
      <Show when={showResignModal()}>
        <ResignModal
          onClose={() => setShowResignModal(false)}
          onReplay={handleReplay}
          onHome={handleHome}
        />
      </Show>
    </div>
  );
};

export default GamePanel;
