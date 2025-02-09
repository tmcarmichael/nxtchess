import { For, Show, createSignal, createMemo, batch, ParentComponent } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { computeMaterial, fenToBoard } from '../../../services/chessGameService';
import { PieceType } from '../../../types';
import { useGameStore } from '../../../store/GameContext';
import Piece from '../GamePiece/GamePiece';
import ResignModal from '../../modals/ResignModal/ResignModal';
import GameClock from '../GameClock/GameClock';
import { DIFFICULTY_VALUES_ELO } from '../../../utils';
import styles from './GameControlsPanel.module.css';

const GameControlsPanel: ParentComponent = () => {
  const navigate = useNavigate();
  const [_, actions] = useGameStore();

  const [showResignModal, setShowResignModal] = createSignal(false);

  const handleResign = () => {
    setShowResignModal(true);
  };

  const handleReplay = () => {
    actions.startNewGame(5, 3, actions.playerColor() === 'w' ? 'b' : 'w');
    setShowResignModal(false);
  };

  const handleHome = () => {
    navigate('/');
    setShowResignModal(false);
  };

  const handleTakeBack = () => {
    const chess = actions.getChessInstance();
    const undone1 = chess.undo();
    if (!undone1) return;
    if (undone1.captured) {
      if (undone1.color === 'w') {
        actions.setCapturedBlack((prev) => prev.slice(0, -1));
      } else {
        actions.setCapturedWhite((prev) => prev.slice(0, -1));
      }
    }
    if (chess.turn() !== actions.playerColor()) {
      const undone2 = chess.undo();
      if (undone2 && undone2.captured) {
        if (undone2.color === 'w') {
          actions.setCapturedBlack((prev) => prev.slice(0, -1));
        } else {
          actions.setCapturedWhite((prev) => prev.slice(0, -1));
        }
      }
    }
    batch(() => {
      const newFen = chess.fen();
      actions.setFen(newFen);
      actions.setViewFen(newFen);
      actions.setBoardSquares(fenToBoard(newFen));
      actions.setMoveHistory(chess.history());
      actions.setViewMoveIndex(chess.history().length - 1);
      actions.setIsGameOver(false);
      actions.setGameOverReason(null);
      actions.setGameWinner(null);

      if (chess.history().length === 0) {
        actions.setCurrentTurn('w');

        if (actions.playerColor() === 'b') {
          actions.performAIMove();
        }
      }
    });
  };

  const material = createMemo(() => computeMaterial(actions.boardSquares()));

  const opponentSide = () => (actions.playerColor() === 'w' ? 'b' : 'w');

  const flipBoardView = () => {
    actions.setBoardView((c) => (c === 'w' ? 'b' : 'w'));
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
          <Show when={actions.playerColor() === 'w'}>
            <div class={styles.playerInfo}>
              <span>You play White pieces </span>
              <Piece type="wN" style={{ width: '32px', height: '32px' }} />
            </div>
          </Show>
          <Show when={actions.playerColor() === 'b'}>
            <div class={styles.playerInfo}>
              <span>You play Black pieces </span>
              <Piece type="bN" style={{ width: '32px', height: '32px' }} />
            </div>
          </Show>
          <div class={styles.difficulty}>
            <span>Difficulty: {DIFFICULTY_VALUES_ELO[actions.difficulty() - 1]} ELO</span>
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
                <For each={actions.capturedBlack()}>
                  {(cap) => (
                    <span class={styles.capturedPiece}>
                      <Piece type={cap as PieceType} style={{ width: '24px', height: '24px' }} />
                    </span>
                  )}
                </For>
              </div>
              <div class="capturesRow">
                <For each={actions.capturedWhite()}>
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
          <GameClock side={actions.playerColor()} />
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

export default GameControlsPanel;
