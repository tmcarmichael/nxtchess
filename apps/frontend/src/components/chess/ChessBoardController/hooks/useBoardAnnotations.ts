import {
  createSignal,
  createMemo,
  createEffect,
  on,
  onCleanup,
  batch,
  type Accessor,
} from 'solid-js';
import type { Square, BoardArrow } from '../../../../types/chess';

export interface BoardAnnotationsResult {
  rightClickHighlights: Accessor<Set<Square>>;
  rightClickArrows: Accessor<BoardArrow[]>;
  previewArrow: Accessor<BoardArrow | null>;
  clearAnnotations: () => void;
  handleSquareRightMouseDown: (square: Square) => void;
  handleSquareRightMouseUp: (square: Square) => void;
  handleSquareMouseEnter: (square: Square) => void;
}

export function useBoardAnnotations(moveHistoryLength: Accessor<number>): BoardAnnotationsResult {
  const [rightClickHighlights, setRightClickHighlights] = createSignal<Set<Square>>(new Set());
  const [rightClickArrows, setRightClickArrows] = createSignal<BoardArrow[]>([]);
  const [rightClickDragStart, setRightClickDragStart] = createSignal<Square | null>(null);
  const [rightClickHoverSquare, setRightClickHoverSquare] = createSignal<Square | null>(null);

  const isValidArrowMove = (from: Square, to: Square): boolean => {
    const dx = Math.abs(to.charCodeAt(0) - from.charCodeAt(0));
    const dy = Math.abs(parseInt(to[1], 10) - parseInt(from[1], 10));
    if (dx === 0 && dy === 0) return false;
    if (dx === 0 || dy === 0) return true;
    if (dx === dy) return true;
    if ((dx === 2 && dy === 1) || (dx === 1 && dy === 2)) return true;
    return false;
  };

  const previewArrow = createMemo((): BoardArrow | null => {
    const start = rightClickDragStart();
    const hover = rightClickHoverSquare();
    if (!start || !hover || start === hover) return null;
    if (!isValidArrowMove(start, hover)) return null;
    return { from: start, to: hover };
  });

  const clearAnnotations = () => {
    if (rightClickHighlights().size > 0 || rightClickArrows().length > 0) {
      batch(() => {
        setRightClickHighlights(new Set<Square>());
        setRightClickArrows([]);
      });
    }
  };

  const toggleArrow = (arrow: BoardArrow) => {
    setRightClickArrows((prev) => {
      const idx = prev.findIndex((a) => a.from === arrow.from && a.to === arrow.to);
      if (idx >= 0) {
        return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
      }
      return [...prev, arrow];
    });
  };

  const handleSquareRightMouseDown = (square: Square) => {
    setRightClickDragStart(square);
    setRightClickHoverSquare(square);
  };

  const handleSquareRightMouseUp = (square: Square) => {
    const start = rightClickDragStart();
    batch(() => {
      setRightClickDragStart(null);
      setRightClickHoverSquare(null);
    });

    if (!start) return;

    if (start === square) {
      setRightClickHighlights((prev) => {
        const next = new Set(prev);
        if (next.has(square)) {
          next.delete(square);
        } else {
          next.add(square);
        }
        return next;
      });
    } else if (isValidArrowMove(start, square)) {
      toggleArrow({ from: start, to: square });
    }
  };

  const handleSquareMouseEnter = (square: Square) => {
    if (rightClickDragStart()) {
      setRightClickHoverSquare(square);
    }
  };

  // Clear annotations on any non-right-click anywhere on the page
  // Also clean up right-click drag if released outside board
  createEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 2) {
        clearAnnotations();
      }
    };
    const onMouseUp = (e: MouseEvent) => {
      if (e.button === 2 && rightClickDragStart()) {
        batch(() => {
          setRightClickDragStart(null);
          setRightClickHoverSquare(null);
        });
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    onCleanup(() => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
    });
  });

  // Clear annotations when a move is made
  createEffect(
    on(moveHistoryLength, (length, prevLength) => {
      if (prevLength !== undefined && length !== prevLength) {
        clearAnnotations();
      }
    })
  );

  return {
    rightClickHighlights,
    rightClickArrows,
    previewArrow,
    clearAnnotations,
    handleSquareRightMouseDown,
    handleSquareRightMouseUp,
    handleSquareMouseEnter,
  };
}
