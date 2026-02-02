import { For, createMemo, createEffect, on, type Component } from 'solid-js';
import { useAnalyzeGame } from '../../../store/game/AnalyzeGameContext';
import GameNotation from '../../game/GameNotation/GameNotation';
import styles from './AnalyzeNavigationPanel.module.css';

const AnalyzeNavigationPanel: Component = () => {
  const { chess, actions } = useAnalyzeGame();

  let movesContainerRef: HTMLDivElement | undefined;
  createEffect(
    on(
      () => chess.state.moveHistory.length,
      () => {
        queueMicrotask(() => {
          if (movesContainerRef) {
            movesContainerRef.scrollTop = movesContainerRef.scrollHeight;
          }
        });
      }
    )
  );

  const whiteMoves = createMemo(() => chess.state.moveHistory.filter((_, i) => i % 2 === 0));
  const blackMoves = createMemo(() => chess.state.moveHistory.filter((_, i) => i % 2 === 1));

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
    actions.jumpToMove(index);
  };

  const MoveRow: Component<{
    turnNumber: number;
    whiteMove: string;
    blackMove: string;
    whiteIndex: number;
    blackIndex: number;
  }> = (props) => {
    const whiteActive = () => props.whiteIndex === chess.state.viewMoveIndex;
    const blackActive = () => props.blackIndex === chess.state.viewMoveIndex;

    return (
      <div class={styles.moveRow}>
        {props.whiteMove && (
          <button
            classList={{
              [styles.moveCell]: true,
              [styles.moveActive]: whiteActive(),
            }}
            aria-current={whiteActive() ? 'step' : undefined}
            onClick={() => handleJumpToMoveIndex(props.whiteIndex)}
          >
            {`${props.turnNumber}. ${props.whiteMove}`}
          </button>
        )}
        {props.blackMove && (
          <button
            classList={{
              [styles.moveCell]: true,
              [styles.moveActive]: blackActive(),
            }}
            aria-current={blackActive() ? 'step' : undefined}
            onClick={() => handleJumpToMoveIndex(props.blackIndex)}
          >
            {`${props.turnNumber}.. ${props.blackMove}`}
          </button>
        )}
      </div>
    );
  };

  const goToPreviousMove = () => {
    actions.jumpToPreviousMove();
  };

  const goToNextMove = () => {
    actions.jumpToNextMove();
  };

  return (
    <div class={styles.navigationPanel}>
      <div class={styles.navigationPanelHeader}>Move History</div>
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
        <button onClick={goToPreviousMove} class={styles.arrowButton} aria-label="Previous move">
          <span class={styles.arrowIcon}>&larr;</span>
        </button>
        <button onClick={goToNextMove} class={styles.arrowButton} aria-label="Next move">
          <span class={styles.arrowIcon}>&rarr;</span>
        </button>
      </div>
      <GameNotation fen={chess.state.fen} moveHistory={chess.state.moveHistory} />
    </div>
  );
};

export default AnalyzeNavigationPanel;
