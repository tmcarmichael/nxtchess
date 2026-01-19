import { type ParentComponent, createSignal } from 'solid-js';
import ChessBoardController from '../../chess/ChessBoardController/ChessBoardController';
import GameContainer from '../../game/GameContainer/GameContainer';
import TrainingControlPanel from '../TrainingControlPanel/TrainingControlPanel';
import TrainingModal from '../TrainingModal/TrainingModal';

const TrainingContainer: ParentComponent = () => {
  const [showTrainingModal, setShowTrainingModal] = createSignal(false);

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

export default TrainingContainer;
