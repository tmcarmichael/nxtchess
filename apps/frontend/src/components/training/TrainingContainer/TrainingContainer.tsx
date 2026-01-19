import { useNavigate, useLocation } from '@solidjs/router';
import { type ParentComponent, createSignal, onMount } from 'solid-js';
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
  onMount(() => {
    const state = location.state;
    if (state?.quickStart && chess.state.lifecycle === 'idle') {
      actions.startNewGame(state.quickStart);
      // Clear the state to prevent re-triggering
      navigate('/training', { replace: true, state: {} });
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
