import { useParams, useNavigate } from '@solidjs/router';
import { createSignal, createEffect, on, type ParentComponent } from 'solid-js';
import { useGame } from '../../../store';
import ChessBoardController from '../../chess/ChessBoardController/ChessBoardController';
import { GameContainer } from '../../game';
import PlayControlPanel from '../PlayControlPanel/PlayControlPanel';
import PlayModal from '../PlayModal/PlayModal';
import PlayNavigationPanel from '../PlayNavigationPanel/PlayNavigationPanel';

const PlayContainer: ParentComponent = () => {
  const params = useParams<{ gameId?: string }>();
  const navigate = useNavigate();
  const { chess, multiplayer, actions } = useGame();
  const [showPlayModal, setShowPlayModal] = createSignal(false);

  // Auto-join game if gameId is in URL and we're not already in a game
  createEffect(
    on(
      () => params.gameId,
      (gameId) => {
        if (gameId && !multiplayer.state.gameId && chess.state.lifecycle !== 'playing') {
          actions.joinMultiplayerGame(gameId);
        }
      }
    )
  );

  // Update URL when game is created (creator gets gameId from server)
  createEffect(
    on(
      () => multiplayer.state.gameId,
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
