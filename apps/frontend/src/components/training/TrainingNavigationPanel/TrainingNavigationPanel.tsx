import { For, Show, createMemo, createEffect, on, type Component } from 'solid-js';
import { useTrainingGame } from '../../../store/game/TrainingGameContext';
import GameNotation from '../../game/GameNotation/GameNotation';
import styles from './TrainingNavigationPanel.module.css';
import type { MoveQuality } from '../../../types/moveQuality';

const TrainingNavigationPanel: Component = () => {
  const { chess, ui, actions } = useTrainingGame();

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

  // Create a map for quick evaluation lookup
  const evaluationMap = createMemo(() => {
    const map = new Map<number, MoveQuality | null>();
    for (const evaluation of chess.state.trainingMoveEvaluations) {
      map.set(evaluation.moveIndex, evaluation.quality);
    }
    return map;
  });

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

  const getQualityClass = (moveIndex: number): string => {
    if (ui.state.trainingFocusMode) {
      return '';
    }
    const quality = evaluationMap().get(moveIndex);
    if (!quality) {
      return '';
    }
    return styles[quality] || '';
  };

  const qualityLabels: Record<MoveQuality, string> = {
    best: 'best move',
    excellent: 'excellent',
    good: 'good',
    inaccuracy: 'inaccuracy',
    mistake: 'mistake',
    blunder: 'blunder',
  };

  const getQualityLabel = (moveIndex: number): string | null => {
    if (ui.state.trainingFocusMode) return null;
    const quality = evaluationMap().get(moveIndex);
    if (!quality) return null;
    return qualityLabels[quality] ?? null;
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
              [getQualityClass(props.whiteIndex)]: !!getQualityClass(props.whiteIndex),
            }}
            aria-current={whiteActive() ? 'step' : undefined}
            onClick={() => handleJumpToMoveIndex(props.whiteIndex)}
          >
            {`${props.turnNumber}. ${props.whiteMove}`}
            <Show when={getQualityLabel(props.whiteIndex)}>
              <span class="sr-only">{getQualityLabel(props.whiteIndex)}</span>
            </Show>
          </button>
        )}
        {props.blackMove && (
          <button
            classList={{
              [styles.moveCell]: true,
              [styles.moveCellActive]: blackActive(),
              [getQualityClass(props.blackIndex)]: !!getQualityClass(props.blackIndex),
            }}
            aria-current={blackActive() ? 'step' : undefined}
            onClick={() => handleJumpToMoveIndex(props.blackIndex)}
          >
            {`${props.turnNumber}.. ${props.blackMove}`}
            <Show when={getQualityLabel(props.blackIndex)}>
              <span class="sr-only">{getQualityLabel(props.blackIndex)}</span>
            </Show>
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
      <GameNotation
        fen={chess.state.fen}
        moveHistory={chess.state.moveHistory}
        hidePgn={chess.state.trainingGamePhase === 'endgame'}
      />
    </div>
  );
};

export default TrainingNavigationPanel;
