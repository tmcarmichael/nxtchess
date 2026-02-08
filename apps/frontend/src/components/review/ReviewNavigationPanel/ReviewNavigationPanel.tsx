import { usePlayGame } from '../../../store/game/PlayGameContext';
import MoveHistoryPanel from '../../game/MoveHistoryPanel/MoveHistoryPanel';
import type { Component } from 'solid-js';

const ReviewNavigationPanel: Component = () => {
  const { chess, actions, review } = usePlayGame();

  return (
    <MoveHistoryPanel
      fen={chess.state.viewFen}
      moveHistory={chess.state.moveHistory}
      viewMoveIndex={chess.state.viewMoveIndex}
      moveEvaluations={review.evaluations()}
      focusMode={false}
      onJumpToMove={(i) => actions.jumpToMove(i)}
      onJumpToPreviousMove={() => actions.jumpToPreviousMove()}
      onJumpToNextMove={() => actions.jumpToNextMove()}
      onJumpToFirstMove={() => actions.jumpToFirstMove()}
      onJumpToLastMove={() => actions.jumpToLastMove()}
    />
  );
};

export default ReviewNavigationPanel;
