import { createSignal, ParentComponent } from 'solid-js';
import ChessBoardController from '../../chess/ChessBoardController/ChessBoardController';
import PlayControlPanel from '../PlayControlPanel/PlayControlPanel';
import PlayModal from '../PlayModal/PlayModal';
import PlayNavigationPanel from '../PlayNavigationPanel/PlayNavigationPanel';
import { GameContainer } from '../../game';

const PlayContainer: ParentComponent = () => {
  const [showPlayModal, setShowPlayModal] = createSignal(false);

  const handleRequestNewGame = () => {
    setShowPlayModal(true);
  };

  return (
    <GameContainer
      layout="three-column"
      showModal={showPlayModal()}
      modalContent={<PlayModal onClose={() => setShowPlayModal(false)} />}
      leftPanel={<PlayNavigationPanel />}
      boardContent={<ChessBoardController onRequestNewGame={handleRequestNewGame} />}
      rightPanel={<PlayControlPanel />}
    />
  );
};

export default PlayContainer;
