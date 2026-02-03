import { type Component } from 'solid-js';
import { usePuzzleGame } from '../../../store/game/PuzzleGameContext';
import MoveHistoryPanel from '../../game/MoveHistoryPanel/MoveHistoryPanel';

const PuzzleNavigationPanel: Component = () => {
  const { chess, ui, actions } = usePuzzleGame();

  return (
    <MoveHistoryPanel
      fen={chess.state.fen}
      moveHistory={chess.state.moveHistory}
      viewMoveIndex={chess.state.viewMoveIndex}
      moveEvaluations={chess.state.trainingMoveEvaluations}
      focusMode={ui.state.trainingFocusMode}
      hidePgn={true}
      onJumpToMove={actions.jumpToMove}
      onJumpToPreviousMove={actions.jumpToPreviousMove}
      onJumpToNextMove={actions.jumpToNextMove}
    />
  );
};

export default PuzzleNavigationPanel;
