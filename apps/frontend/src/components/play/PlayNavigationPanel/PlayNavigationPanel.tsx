import { For, createMemo, createEffect, on, type Component } from 'solid-js';
import { usePlayGame } from '../../../store/game/PlayGameContext';
import GameNotation from '../../game/GameNotation/GameNotation';
import styles from './PlayNavigationPanel.module.css';

const PlayNavigationPanel: Component = () => {
  const { chess, actions } = usePlayGame();

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
              [styles.moveCellActive]: whiteActive(),
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
              [styles.moveCellActive]: blackActive(),
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
          ←
        </button>
        <button onClick={goToNextMove} class={styles.arrowButton} aria-label="Next move">
          →
        </button>
      </div>
      <GameNotation fen={chess.state.fen} moveHistory={chess.state.moveHistory} />
    </div>
  );
};

export default PlayNavigationPanel;
