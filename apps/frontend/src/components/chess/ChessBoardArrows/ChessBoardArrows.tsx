import { type Component, For, Show, createMemo } from 'solid-js';
import { type BoardArrow, type Square } from '../../../types/chess';
import { type Side } from '../../../types/game';
import styles from './ChessBoardArrows.module.css';

interface ChessBoardArrowsProps {
  arrows: () => BoardArrow[];
  previewArrow: () => BoardArrow | null;
  boardView: () => Side;
}

const ARROW_COLOR = 'rgba(168, 50, 65, 0.8)';
const PREVIEW_COLOR = 'rgba(168, 50, 65, 0.45)';
const STROKE_WIDTH = 14;
const HEAD_SIZE = 30;

const squareToSvgCenter = (square: Square, view: Side): { x: number; y: number } => {
  const file = square.charCodeAt(0) - 97;
  const rank = parseInt(square[1], 10) - 1;
  if (view === 'w') {
    return { x: file * 100 + 50, y: (7 - rank) * 100 + 50 };
  }
  return { x: (7 - file) * 100 + 50, y: rank * 100 + 50 };
};

const isKnightMove = (from: { x: number; y: number }, to: { x: number; y: number }): boolean => {
  const dx = Math.abs(to.x - from.x) / 100;
  const dy = Math.abs(to.y - from.y) / 100;
  return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);
};

const buildStraightPath = (
  from: { x: number; y: number },
  to: { x: number; y: number }
): string => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return '';

  const ux = dx / dist;
  const uy = dy / dist;

  const endX = to.x - ux * HEAD_SIZE;
  const endY = to.y - uy * HEAD_SIZE;

  return `M ${from.x},${from.y} L ${endX},${endY}`;
};

const buildKnightPath = (from: { x: number; y: number }, to: { x: number; y: number }): string => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  let bendX: number;
  let bendY: number;

  if (absDx > absDy) {
    bendX = from.x + dx;
    bendY = from.y;
  } else {
    bendX = from.x;
    bendY = from.y + dy;
  }

  const endDx = to.x - bendX;
  const endDy = to.y - bendY;
  const endDist = Math.sqrt(endDx * endDx + endDy * endDy);
  const eux = endDist > 0 ? endDx / endDist : 0;
  const euy = endDist > 0 ? endDy / endDist : 0;

  const endX = to.x - eux * HEAD_SIZE;
  const endY = to.y - euy * HEAD_SIZE;

  return `M ${from.x},${from.y} L ${bendX},${bendY} L ${endX},${endY}`;
};

const buildArrowPath = (from: { x: number; y: number }, to: { x: number; y: number }): string => {
  if (isKnightMove(from, to)) {
    return buildKnightPath(from, to);
  }
  return buildStraightPath(from, to);
};

const ChessBoardArrows: Component<ChessBoardArrowsProps> = (props) => {
  const arrowData = createMemo(() => {
    const view = props.boardView();
    return props.arrows().map((arrow) => {
      const from = squareToSvgCenter(arrow.from, view);
      const to = squareToSvgCenter(arrow.to, view);
      return {
        key: `${arrow.from}-${arrow.to}`,
        path: buildArrowPath(from, to),
      };
    });
  });

  const previewData = createMemo(() => {
    const arrow = props.previewArrow();
    if (!arrow) return null;
    const view = props.boardView();
    const from = squareToSvgCenter(arrow.from, view);
    const to = squareToSvgCenter(arrow.to, view);
    return buildArrowPath(from, to);
  });

  return (
    <svg class={styles.arrowOverlay} viewBox="0 0 800 800">
      <defs>
        <marker
          id="arrowhead"
          markerWidth={HEAD_SIZE}
          markerHeight={HEAD_SIZE}
          refX={0}
          refY={HEAD_SIZE / 2}
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <polygon
            points={`0 0, ${HEAD_SIZE} ${HEAD_SIZE / 2}, 0 ${HEAD_SIZE}`}
            fill={ARROW_COLOR}
          />
        </marker>
        <marker
          id="arrowhead-preview"
          markerWidth={HEAD_SIZE}
          markerHeight={HEAD_SIZE}
          refX={0}
          refY={HEAD_SIZE / 2}
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <polygon
            points={`0 0, ${HEAD_SIZE} ${HEAD_SIZE / 2}, 0 ${HEAD_SIZE}`}
            fill={PREVIEW_COLOR}
          />
        </marker>
      </defs>
      <For each={arrowData()}>
        {(arrow) => (
          <path
            d={arrow.path}
            stroke={ARROW_COLOR}
            stroke-width={STROKE_WIDTH}
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="none"
            marker-end="url(#arrowhead)"
          />
        )}
      </For>
      <Show when={previewData()}>
        {(path) => (
          <path
            d={path()}
            stroke={PREVIEW_COLOR}
            stroke-width={STROKE_WIDTH}
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="none"
            marker-end="url(#arrowhead-preview)"
          />
        )}
      </Show>
    </svg>
  );
};

export default ChessBoardArrows;
