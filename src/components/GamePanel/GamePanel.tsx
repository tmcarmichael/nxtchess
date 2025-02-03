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
  const { boardSquares, capturedWhite, capturedBlack, startNewGame, playerColor, difficulty } =
    useGameStore();
  const [showResignModal, setShowResignModal] = createSignal(false);

  const handleResign = () => {
    setShowResignModal(true);
  };

  const handleReplay = () => {
    startNewGame(3, 'easy', playerColor() === 'w' ? 'b' : 'w');
    setShowResignModal(false);
  };

  const handleHome = () => {
    navigate('/');
    setShowResignModal(false);
  };

  const material = createMemo(() => computeMaterial(boardSquares()));

  const opponentSide = () => (playerColor() === 'w' ? 'b' : 'w');

  return (
    <div class={styles.clockLayout}>
      <div class={styles.clockWrapper}>
        <GameClock side={opponentSide()} />
      </div>
      <div class={styles.panel}>
        <div class={styles.materialContainer}>
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
          <div class={styles.difficulty}>
            <span>{`Difficulty: ${difficulty()}`}</span>
          </div>
        </div>
        <button class={styles.resignButton} onClick={handleResign}>
          <span>Resign</span>
        </button>
        <Show when={showResignModal()}>
          <ResignModal
            onClose={() => setShowResignModal(false)}
            onReplay={handleReplay}
            onHome={handleHome}
          />
        </Show>
      </div>
      <div class={styles.clockWrapper}>
        <GameClock side={playerColor()} />
      </div>
    </div>
  );
};

export default GamePanel;
