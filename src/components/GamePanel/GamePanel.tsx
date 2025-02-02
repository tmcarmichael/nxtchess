import styles from './GamePanel.module.css';
import { For, Show, createSignal, createMemo } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { computeMaterial } from '../../logic/gameState';
import Piece from '../Piece/Piece';
import { PieceType } from '../../types';
import { useGameStore } from '../../store/game/GameContext';
import ResignModal from '../modals/ResignModal/ResignModal';

const GamePanel = () => {
  const [showResignModal, setShowResignModal] = createSignal(false);
  const { boardSquares, capturedWhite, capturedBlack, startNewGame, playerColor } = useGameStore();
  const navigate = useNavigate();

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

  return (
    <div class={styles.panel}>
      <div class={styles.materialContainer}>
        <div class="capturesRow">
          <For each={capturedBlack()}>
            {(cap) => (
              <span class={styles.capturedPiece}>
                <Piece type={cap as PieceType} style={{ width: '20px', height: '20px' }} />
              </span>
            )}
          </For>
        </div>
        <div class="capturesRow">
          <For each={capturedWhite()}>
            {(cap) => (
              <span class={styles.capturedPiece}>
                <Piece type={cap as PieceType} style={{ width: '20px', height: '20px' }} />
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
      </div>
      <div>
        <button class={styles.panelButton} onClick={handleResign}>
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
    </div>
  );
};

export default GamePanel;
