import { useNavigate, useLocation } from '@solidjs/router';
import { type ParentComponent, createSignal, createEffect, on, onMount } from 'solid-js';
import { TrainingGameProvider, useTrainingGame } from '../../../store/game/TrainingGameContext';
import ChessBoardController from '../../chess/ChessBoardController/ChessBoardController';
import GameContainer from '../../game/GameContainer/GameContainer';
import TrainingControlPanel from '../TrainingControlPanel/TrainingControlPanel';
import TrainingModal from '../TrainingModal/TrainingModal';
import TrainingNavigationPanel from '../TrainingNavigationPanel/TrainingNavigationPanel';
import type { StartGameOptions } from '../../../types/game';

interface LocationState {
  quickStart?: StartGameOptions;
}

const TrainingContainerInner: ParentComponent = () => {
  const navigate = useNavigate();
  const location = useLocation<LocationState>();
  const { chess, ui, actions } = useTrainingGame();
  const [showTrainingModal, setShowTrainingModal] = createSignal(false);

  // Handle game start from navigation state (e.g., from header modal)
  // Use effect to react to navigation state changes (not just onMount)
  createEffect(
    on(
      () => location.state,
      (state) => {
        // If navigation state requests a new game, start it (even if a game is in progress)
        if (state?.quickStart) {
          actions.startNewGame(state.quickStart);
          // Clear the state to prevent re-triggering
          navigate('/training', { replace: true, state: {} });
        }
      }
    )
  );

  // Show training modal if no game is active on initial mount
  onMount(() => {
    if (chess.state.lifecycle === 'idle') {
      setShowTrainingModal(true);
    }
  });

  // Also show modal when lifecycle returns to idle (e.g., after error retry)
  createEffect(
    on(
      () => chess.state.lifecycle,
      (lifecycle, prevLifecycle) => {
        if (lifecycle === 'idle' && prevLifecycle === 'error') {
          setShowTrainingModal(true);
        }
      }
    )
  );

  const handleRequestNewGame = () => {
    setShowTrainingModal(true);
  };

  const handleRestartGame = () => {
    actions.restartGame();
  };

  // Auto-restart in focus mode for endgame training
  const shouldAutoRestart = () =>
    ui.state.trainingFocusMode && chess.state.trainingGamePhase === 'endgame';

  return (
    <GameContainer
      layout="three-column"
      showModal={showTrainingModal()}
      modalContent={<TrainingModal onClose={() => setShowTrainingModal(false)} />}
      leftPanel={<TrainingNavigationPanel />}
      boardContent={
        <ChessBoardController
          onRequestNewGame={handleRequestNewGame}
          onRestartGame={handleRestartGame}
          autoRestartOnEnd={shouldAutoRestart}
        />
      }
      rightPanel={<TrainingControlPanel />}
    />
  );
};

// Wrap with provider
const TrainingContainer: ParentComponent = () => {
  return (
    <TrainingGameProvider>
      <TrainingContainerInner />
    </TrainingGameProvider>
  );
};

export default TrainingContainer;
