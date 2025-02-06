import { For, Show, createSignal, createMemo, batch } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { computeMaterial, fenToBoard } from '../../logic/gameState';
import { PieceType } from '../../types';
import { useGameStore } from '../../store/game/GameContext';
import Piece from '../Piece/Piece';
import ResignModal from '../modals/ResignModal/ResignModal';
import GameClock from '../GameClock/GameClock';
import { DIFFICULTY_VALUES_ELO } from '../../utils';
import styles from './GamePanel.module.css';

const GamePanel = () => {
  const navigate = useNavigate();
  const [
    _,
    {
      boardSquares,
      capturedWhite,
      capturedBlack,
      startNewGame,
      playerColor,
      difficulty,
      setBoardView,
      getChessInstance,
      setFen,
      setViewFen,
      setBoardSquares,
      setCapturedBlack,
      setCapturedWhite,
      setMoveHistory,
      setViewMoveIndex,
      setIsGameOver,
      setGameOverReason,
      setGameWinner,
      setCurrentTurn,
      performAIMove,
    },
  ] = useGameStore();

  const [showResignModal, setShowResignModal] = createSignal(false);

  const handleResign = () => {
    setShowResignModal(true);
  };

  const handleReplay = () => {
    startNewGame(5, 3, playerColor() === 'w' ? 'b' : 'w');
    setShowResignModal(false);
  };

  const handleHome = () => {
    navigate('/');
    setShowResignModal(false);
  };

  const handleTakeBack = () => {
    const chess = getChessInstance();
    const undone1 = chess.undo();
    if (!undone1) return;
    if (undone1.captured) {
      if (undone1.color === 'w') {
        setCapturedBlack((prev) => prev.slice(0, -1));
      } else {
        setCapturedWhite((prev) => prev.slice(0, -1));
      }
    }
    if (chess.turn() !== playerColor()) {
      const undone2 = chess.undo();
      if (undone2 && undone2.captured) {
        if (undone2.color === 'w') {
          setCapturedBlack((prev) => prev.slice(0, -1));
        } else {
          setCapturedWhite((prev) => prev.slice(0, -1));
        }
      }
    }
    batch(() => {
      const newFen = chess.fen();
      setFen(newFen);
      setViewFen(newFen);
      setBoardSquares(fenToBoard(newFen));
      setMoveHistory(chess.history());
      setViewMoveIndex(chess.history().length - 1);
      setIsGameOver(false);
      setGameOverReason(null);
      setGameWinner(null);

      if (chess.history().length === 0) {
        setCurrentTurn('w');

        if (playerColor() === 'b') {
          performAIMove();
        }
      }
    });
  };

  const material = createMemo(() => computeMaterial(boardSquares()));

  const opponentSide = () => (playerColor() === 'w' ? 'b' : 'w');

  const flipBoardView = () => {
    setBoardView((c) => (c === 'w' ? 'b' : 'w'));
  };

  const difficultyLevel = difficulty();
  const difficultyELO = DIFFICULTY_VALUES_ELO[difficultyLevel - 1];

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
            <span>{`Difficulty: ${difficultyELO} ELO`}</span>
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
