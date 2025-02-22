import { For, createMemo, createEffect, on, Component } from 'solid-js';
import { useGameStore } from '../../../store/GameContext';
import styles from './PlayNavigationPanel.module.css';

const PlayNavigationPanel: Component = () => {
  const [state, actions] = useGameStore();

  let movesContainerRef: HTMLDivElement | undefined;
  createEffect(
    on(
      () => state.moveHistory.length,
      () => {
        queueMicrotask(() => {
          if (movesContainerRef) {
            movesContainerRef.scrollTop = movesContainerRef.scrollHeight;
          }
        });
      }
    )
  );

  const whiteMoves = createMemo(() => state.moveHistory.filter((_, i) => i % 2 === 0));
  const blackMoves = createMemo(() => state.moveHistory.filter((_, i) => i % 2 === 1));

  const movesRows = createMemo(() => {
    const totalRows = Math.max(whiteMoves().length, blackMoves().length);
    return Array.from({ length: totalRows }, (_, i) => ({
      turnNumber: i + 1,
      whiteMove: whiteMoves()[i] || '',
      blackMove: blackMoves()[i] || '',
      whiteIndex: i * 2,
      blackIndex: i * 2 + 1,
    }));
  });

  const handleJumpToMoveIndex = (index: number) => {
    actions.jumpToMoveIndex(index);
  };

  const MoveRow: Component<{
    turnNumber: number;
    whiteMove: string;
    blackMove: string;
    whiteIndex: number;
    blackIndex: number;
  }> = (props) => {
    const whiteActive = () => props.whiteIndex === state.viewMoveIndex;
    const blackActive = () => props.blackIndex === state.viewMoveIndex;

    return (
      <div class={styles.moveRow}>
        {props.whiteMove && (
          <span
            classList={{
              [styles.move]: true,
              [styles.active]: whiteActive(),
            }}
            onClick={() => handleJumpToMoveIndex(props.whiteIndex)}
          >
            {`${props.turnNumber}. ${props.whiteMove}`}
          </span>
        )}
        {props.blackMove && (
          <span
            classList={{
              [styles.move]: true,
              [styles.active]: blackActive(),
            }}
            onClick={() => handleJumpToMoveIndex(props.blackIndex)}
          >
            {`${props.turnNumber}.. ${props.blackMove}`}
          </span>
        )}
      </div>
    );
  };

  const goToPreviousMove = () => {
    const newIndex = Math.max(0, state.viewMoveIndex - 1);
    handleJumpToMoveIndex(newIndex);
  };

  const goToNextMove = () => {
    const newIndex = Math.min(state.moveHistory.length - 1, state.viewMoveIndex + 1);
    handleJumpToMoveIndex(newIndex);
  };

  return (
    <div class={styles.navigationPanel}>
      <div class={styles.movesContainer} ref={movesContainerRef}>
        <div class={styles.movesGrid}>
          <For each={movesRows()}>
            {(rowData) => (
              <MoveRow
                turnNumber={rowData.turnNumber}
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

export default PlayNavigationPanel;
