import { For, createMemo, createEffect, on } from 'solid-js';
import { useGameStore } from '../../../store/GameContext';
import styles from './GameNavigationPanel.module.css';

const GameNavigationPanel = () => {
  const [state, actions] = useGameStore();
  const moveHistory = () => state.moveHistory;
  const viewMoveIndex = () => state.viewMoveIndex;
  const { jumpToMoveIndex } = actions;

  let movesContainerRef: HTMLDivElement | undefined;

  createEffect(
    on(
      () => moveHistory().length,
      () => {
        queueMicrotask(() => {
          if (movesContainerRef) {
            movesContainerRef.scrollTop = movesContainerRef.scrollHeight;
          }
        });
      }
    )
  );

  const whiteMoves = createMemo(() => moveHistory().filter((_, i) => i % 2 === 0));
  const blackMoves = createMemo(() => moveHistory().filter((_, i) => i % 2 === 1));

  const movesRows = createMemo(() => {
    const totalRows = Math.max(whiteMoves().length, blackMoves().length);
    return Array.from({ length: totalRows }, (_, i) => ({
      whiteMove: whiteMoves()[i] || '',
      blackMove: blackMoves()[i] || '',
      whiteIndex: i * 2,
      blackIndex: i * 2 + 1,
    }));
  });

  const MoveRow = (props: {
    whiteMove: string;
    blackMove: string;
    whiteIndex: number;
    blackIndex: number;
  }) => (
    <div class={styles.moveRow}>
      <span class={`${styles.move} ${props.whiteIndex === viewMoveIndex() ? styles.active : ''}`}>
        {props.whiteMove}
      </span>
      <span class={`${styles.move} ${props.blackIndex === viewMoveIndex() ? styles.active : ''}`}>
        {props.blackMove}
      </span>
    </div>
  );

  const goToPreviousMove = () => {
    const newIndex = Math.max(0, viewMoveIndex() - 1);
    jumpToMoveIndex(newIndex);
  };

  const goToNextMove = () => {
    const newIndex = Math.min(moveHistory().length - 1, viewMoveIndex() + 1);
    jumpToMoveIndex(newIndex);
  };

  return (
    <div class={styles.navigationPanel}>
      <div class={styles.movesContainer} ref={movesContainerRef}>
        <div class={styles.movesGrid}>
          <For each={movesRows()}>
            {(rowData) => (
              <MoveRow
                whiteMove={rowData.whiteMove}
                blackMove={rowData.blackMove}
                whiteIndex={rowData.whiteIndex}
                blackIndex={rowData.blackIndex}
              />
            )}
          </For>
        </div>
      </div>
      <div class={styles.arrowButtons}>
        <button onClick={goToPreviousMove} class={styles.arrowButton}>
          ←
        </button>
        <button onClick={goToNextMove} class={styles.arrowButton}>
          →
        </button>
      </div>
    </div>
  );
};

export default GameNavigationPanel;
