import { createSignal, createEffect, on, type Accessor } from 'solid-js';
import type { Square } from '../../../../types/chess';

interface AnimatingMove {
  from: Square;
  to: Square;
  piece: string;
}

interface BoardSquare {
  square: Square;
  piece: string | null;
}

export function useMoveAnimation(params: {
  moveHistoryLength: Accessor<number>;
  isViewingHistory: Accessor<boolean>;
  timeControl: number;
  lastMove: Accessor<{ from: Square; to: Square } | null>;
  currentBoard: Accessor<BoardSquare[]>;
}): { animatingMove: Accessor<AnimatingMove | null> } {
  const ANIMATION_DURATION = 500;
  const [animatingMove, setAnimatingMove] = createSignal<AnimatingMove | null>(null);

  createEffect(
    on(params.moveHistoryLength, (length, prevLength) => {
      if (prevLength === undefined || length <= prevLength) return;
      if (params.isViewingHistory()) return;
      if (params.timeControl === 1) return;

      const last = params.lastMove();
      if (!last) return;

      const board = params.currentBoard();
      const piece = board.find((sq) => sq.square === last.to)?.piece;
      if (!piece) return;

      setAnimatingMove({ from: last.from, to: last.to, piece });
      setTimeout(() => setAnimatingMove(null), ANIMATION_DURATION);
    })
  );

  return { animatingMove };
}
