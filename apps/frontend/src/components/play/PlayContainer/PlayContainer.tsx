import { useParams, useNavigate, useLocation } from '@solidjs/router';
import { createSignal, createEffect, on, onMount, type ParentComponent } from 'solid-js';
import { PlayGameProvider, usePlayGame } from '../../../store/game/PlayGameContext';
import { type StartGameOptions, type MultiplayerGameOptions } from '../../../types/game';
import ChessBoardController from '../../chess/ChessBoardController/ChessBoardController';
import GameContainer from '../../game/GameContainer/GameContainer';
import PlayControlPanel from '../PlayControlPanel/PlayControlPanel';
import PlayModal from '../PlayModal/PlayModal';
import PlayNavigationPanel from '../PlayNavigationPanel/PlayNavigationPanel';

interface LocationState {
  quickPlay?: StartGameOptions;
  multiplayerCreate?: MultiplayerGameOptions;
}

const PlayContainerInner: ParentComponent = () => {
  const params = useParams<{ gameId?: string }>();
  const navigate = useNavigate();
  const location = useLocation<LocationState>();
  const { chess, multiplayer, actions } = usePlayGame();
  const [showPlayModal, setShowPlayModal] = createSignal(false);

  // Handle game start from navigation state (e.g., from header modal)
  // Use effect to react to navigation state changes (not just onMount)
  createEffect(
    on(
      () => location.state,
      (state) => {
        // If navigation state requests a new game, start it (even if a game is in progress)
        if (state?.quickPlay) {
          actions.startNewGame(state.quickPlay);
          // Clear the state to prevent re-triggering
          navigate('/play', { replace: true, state: {} });
          return;
        }

        if (state?.multiplayerCreate) {
          actions.startMultiplayerGame(state.multiplayerCreate);
          // Clear the state to prevent re-triggering
          navigate('/play', { replace: true, state: {} });
        }
      }
    )
  );

  // Show play modal if no game is active on initial mount
  onMount(() => {
    const gameIdInUrl = params.gameId;
    if (chess.state.lifecycle === 'idle' && !gameIdInUrl) {
      setShowPlayModal(true);
    }
  });

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

// Wrap with provider
const PlayContainer: ParentComponent = () => {
  return (
    <PlayGameProvider>
      <PlayContainerInner />
    </PlayGameProvider>
  );
};

export default PlayContainer;
