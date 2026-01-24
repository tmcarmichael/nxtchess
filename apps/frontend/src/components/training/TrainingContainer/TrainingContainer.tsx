import { useNavigate, useLocation } from '@solidjs/router';
import { type ParentComponent, createSignal, createEffect, on, onMount } from 'solid-js';
import { TrainingGameProvider, useTrainingGame } from '../../../store/game/TrainingGameContext';
import ChessBoardController from '../../chess/ChessBoardController/ChessBoardController';
import GameContainer from '../../game/GameContainer/GameContainer';
import TrainingControlPanel from '../TrainingControlPanel/TrainingControlPanel';
import TrainingModal from '../TrainingModal/TrainingModal';
import type { StartGameOptions } from '../../../types/game';

interface LocationState {
  quickStart?: StartGameOptions;
}

const TrainingContainerInner: ParentComponent = () => {
  const navigate = useNavigate();
  const location = useLocation<LocationState>();
  const { chess, actions } = useTrainingGame();
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

  const handleRequestNewGame = () => {
    setShowTrainingModal(true);
  };

  return (
    <GameContainer
      layout="two-column"
      showModal={showTrainingModal()}
      modalContent={<TrainingModal onClose={() => setShowTrainingModal(false)} />}
      boardContent={<ChessBoardController onRequestNewGame={handleRequestNewGame} />}
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
