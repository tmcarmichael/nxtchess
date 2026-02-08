import { For, Show, createMemo, createEffect, on, type Component } from 'solid-js';
import GameNotation from '../GameNotation/GameNotation';
import styles from './MoveHistoryPanel.module.css';
import type { MoveQuality, MoveEvaluation } from '../../../types/moveQuality';

interface MoveHistoryPanelProps {
  fen: string;
  moveHistory: string[];
  viewMoveIndex: number;
  moveEvaluations: MoveEvaluation[];
  focusMode: boolean;
  hidePgn?: boolean;
  onJumpToMove: (index: number) => void;
  onJumpToPreviousMove: () => void;
  onJumpToNextMove: () => void;
  onJumpToFirstMove: () => void;
  onJumpToLastMove: () => void;
}

const MoveHistoryPanel: Component<MoveHistoryPanelProps> = (props) => {
  let movesContainerRef: HTMLDivElement | undefined;
  createEffect(
    on(
      () => props.moveHistory.length,
      () => {
        requestAnimationFrame(() => {
          if (!movesContainerRef) return;
          const lastRow = movesContainerRef.querySelector(':scope > * > :last-child');
          if (lastRow) {
            lastRow.scrollIntoView({ block: 'end' });
          } else {
            movesContainerRef.scrollTop = movesContainerRef.scrollHeight;
          }
        });
      }
    )
  );

  createEffect(
    on(
      () => props.viewMoveIndex,
      () => {
        requestAnimationFrame(() => {
          if (!movesContainerRef) return;
          const activeButton = movesContainerRef.querySelector('[aria-current="step"]');
          if (activeButton) {
            activeButton.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }
        });
      }
    )
  );

  const whiteMoves = createMemo(() => props.moveHistory.filter((_, i) => i % 2 === 0));
  const blackMoves = createMemo(() => props.moveHistory.filter((_, i) => i % 2 === 1));

  const evaluationMap = createMemo(() => {
    const map = new Map<number, MoveQuality | null>();
    for (const evaluation of props.moveEvaluations) {
      map.set(evaluation.moveIndex, evaluation.quality);
    }
    return map;
  });

  const movesRows = createMemo(() => {
    const totalRows = Math.max(whiteMoves().length, blackMoves().length);
    const white = whiteMoves();
    const black = blackMoves();
    return Array.from({ length: totalRows }, (_, i) => ({
      turnNumber: i + 1,
      whiteMove: white[i] || '',
      blackMove: black[i] || '',
      whiteIndex: i * 2,
      blackIndex: i * 2 + 1,
    }));
  });

  const getQualityClass = (moveIndex: number): string => {
    if (props.focusMode) return '';
    const quality = evaluationMap().get(moveIndex);
    if (!quality) return '';
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
    if (props.focusMode) return null;
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
  }> = (rowProps) => {
    const whiteActive = () => rowProps.whiteIndex === props.viewMoveIndex;
    const blackActive = () => rowProps.blackIndex === props.viewMoveIndex;

    return (
      <div class={styles.moveRow}>
        {rowProps.whiteMove && (
          <button
            classList={{
              [styles.moveCell]: true,
              [styles.moveCellActive]: whiteActive(),
              [getQualityClass(rowProps.whiteIndex)]: !!getQualityClass(rowProps.whiteIndex),
            }}
            aria-current={whiteActive() ? 'step' : undefined}
            onClick={() => props.onJumpToMove(rowProps.whiteIndex)}
          >
            {`${rowProps.turnNumber}. ${rowProps.whiteMove}`}
            <Show when={getQualityLabel(rowProps.whiteIndex)}>
              <span class="sr-only">{getQualityLabel(rowProps.whiteIndex)}</span>
            </Show>
          </button>
        )}
        {rowProps.blackMove && (
          <button
            classList={{
              [styles.moveCell]: true,
              [styles.moveCellActive]: blackActive(),
              [getQualityClass(rowProps.blackIndex)]: !!getQualityClass(rowProps.blackIndex),
            }}
            aria-current={blackActive() ? 'step' : undefined}
            onClick={() => props.onJumpToMove(rowProps.blackIndex)}
          >
            {`${rowProps.turnNumber}.. ${rowProps.blackMove}`}
            <Show when={getQualityLabel(rowProps.blackIndex)}>
              <span class="sr-only">{getQualityLabel(rowProps.blackIndex)}</span>
            </Show>
          </button>
        )}
      </div>
    );
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
        <button
          onClick={() => props.onJumpToFirstMove()}
          class={styles.skipButton}
          aria-label="First move"
        >
          ≪
        </button>
        <button
          onClick={() => props.onJumpToPreviousMove()}
          class={styles.arrowButton}
          aria-label="Previous move"
        >
          ←
        </button>
        <button
          onClick={() => props.onJumpToNextMove()}
          class={styles.arrowButton}
          aria-label="Next move"
        >
          →
        </button>
        <button
          onClick={() => props.onJumpToLastMove()}
          class={styles.skipButton}
          aria-label="Last move"
        >
          ≫
        </button>
      </div>
      <GameNotation fen={props.fen} moveHistory={props.moveHistory} hidePgn={props.hidePgn} />
    </div>
  );
};

export default MoveHistoryPanel;
