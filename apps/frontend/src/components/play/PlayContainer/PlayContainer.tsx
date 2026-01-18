import { createSignal, createEffect, on, ParentComponent } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import ChessBoardController from '../../chess/ChessBoardController/ChessBoardController';
import PlayControlPanel from '../PlayControlPanel/PlayControlPanel';
import PlayModal from '../PlayModal/PlayModal';
import PlayNavigationPanel from '../PlayNavigationPanel/PlayNavigationPanel';
import { GameContainer } from '../../game';
import { useGameStore } from '../../../store';

const PlayContainer: ParentComponent = () => {
  const params = useParams<{ gameId?: string }>();
  const navigate = useNavigate();
  const [state, actions] = useGameStore();
  const [showPlayModal, setShowPlayModal] = createSignal(false);

  // Auto-join game if gameId is in URL and we're not already in a game
  createEffect(
    on(
      () => params.gameId,
      (gameId) => {
        if (gameId && !state.multiplayerGameId && state.lifecycle !== 'playing') {
          actions.joinMultiplayerGame(gameId);
        }
      }
    )
  );

  // Update URL when game is created (creator gets gameId from server)
  createEffect(
    on(
      () => state.multiplayerGameId,
      (gameId) => {
        // Update URL if we have a gameId and URL doesn't match
        if (gameId && params.gameId !== gameId) {
          navigate(`/play/${gameId}`, { replace: true });
        }
      }
    )
  );

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
