import { type Component } from 'solid-js';
import { useTrainingGame } from '../../../store/game/TrainingGameContext';
import MoveHistoryPanel from '../../game/MoveHistoryPanel/MoveHistoryPanel';

const TrainingNavigationPanel: Component = () => {
  const { chess, ui, actions } = useTrainingGame();

  return (
    <MoveHistoryPanel
      fen={chess.state.fen}
      moveHistory={chess.state.moveHistory}
      viewMoveIndex={chess.state.viewMoveIndex}
      moveEvaluations={chess.state.trainingMoveEvaluations}
      focusMode={ui.state.trainingFocusMode}
      hidePgn={chess.state.trainingGamePhase === 'endgame'}
      onJumpToMove={actions.jumpToMove}
      onJumpToPreviousMove={actions.jumpToPreviousMove}
      onJumpToNextMove={actions.jumpToNextMove}
      onJumpToFirstMove={actions.jumpToFirstMove}
      onJumpToLastMove={actions.jumpToLastMove}
    />
  );
};

export default TrainingNavigationPanel;
