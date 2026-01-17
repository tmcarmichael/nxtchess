import { ParentComponent, Show, createSignal } from 'solid-js';
import ChessBoardController from '../../chess/ChessBoardController/ChessBoardController';
import TrainingControlPanel from '../TrainingControlPanel/TrainingControlPanel';
import TrainingModal from '../TrainingModal/TrainingModal';
import CommonErrorBoundary from '../../common/CommonErrorBoundary/CommonErrorBoundary';
import styles from './TrainingContainer.module.css';

const TrainingContainer: ParentComponent = () => {
  const [showTrainingModal, setShowTrainingModal] = createSignal(false);

  const handleRequestNewGame = () => {
    setShowTrainingModal(true);
  };

  return (
    <CommonErrorBoundary>
      <div class={styles.trainingContainer}>
        <Show when={showTrainingModal()}>
          <TrainingModal onClose={() => setShowTrainingModal(false)} />
        </Show>
        <div class={styles.trainingLayout}>
          <div class={styles.boardWrapper}>
            <ChessBoardController onRequestNewGame={handleRequestNewGame} />
          </div>
          <TrainingControlPanel />
        </div>
      </div>
    </CommonErrorBoundary>
  );
};

export default TrainingContainer;
