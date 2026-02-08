import { useParams, useNavigate, useLocation } from '@solidjs/router';
import { createEffect, on, Show, type ParentComponent } from 'solid-js';
import { PlayGameProvider, usePlayGame } from '../../../store/game/PlayGameContext';
import { type StartGameOptions, type MultiplayerGameOptions } from '../../../types/game';
import ChessBoardController from '../../chess/ChessBoardController/ChessBoardController';
import GameContainer from '../../game/GameContainer/GameContainer';
import ReviewControlPanel from '../../review/ReviewControlPanel/ReviewControlPanel';
import ReviewNavigationPanel from '../../review/ReviewNavigationPanel/ReviewNavigationPanel';
import PlayControlPanel from '../PlayControlPanel/PlayControlPanel';
import PlayHub from '../PlayHub/PlayHub';
import PlayNavigationPanel from '../PlayNavigationPanel/PlayNavigationPanel';

interface LocationState {
  quickPlay?: StartGameOptions;
  multiplayerCreate?: MultiplayerGameOptions;
  reset?: number;
}

const PlayContainerInner: ParentComponent = () => {
  const params = useParams<{ gameId?: string }>();
  const navigate = useNavigate();
  const location = useLocation<LocationState>();
  const { chess, multiplayer, actions, review } = usePlayGame();

  createEffect(
    on(
      () => location.state,
      (state) => {
        if (state?.quickPlay) {
          actions.startNewGame(state.quickPlay);
          navigate('/play', { replace: true, state: {} });
          return;
        }

        if (state?.multiplayerCreate) {
          actions.startMultiplayerGame(state.multiplayerCreate);
          navigate('/play', { replace: true, state: {} });
          return;
        }

        if (state?.reset && chess.state.lifecycle !== 'idle') {
          actions.exitGame();
          navigate('/play', { replace: true, state: {} });
        }
      }
    )
  );

  createEffect(
    on(
      () => params.gameId,
      (gameId) => {
        if (
          gameId &&
          !multiplayer.state.gameId &&
          !multiplayer.state.isWaiting &&
          chess.state.lifecycle !== 'playing'
        ) {
          actions.joinMultiplayerGame(gameId);
        }
      }
    )
  );

  createEffect(
    on(
      () => multiplayer.state.gameId,
      (gameId) => {
        if (gameId && params.gameId !== gameId) {
          navigate(`/play/${gameId}`, { replace: true });
        }
      }
    )
  );

  const isIdle = () => chess.state.lifecycle === 'idle' && !params.gameId;
  const isReviewing = () => review.phase() !== 'idle';

  return (
    <Show when={!isIdle()} fallback={<PlayHub />}>
      <GameContainer
        layout="three-column"
        showModal={false}
        leftPanel={
          <Show when={isReviewing()} fallback={<PlayNavigationPanel />}>
            <ReviewNavigationPanel />
          </Show>
        }
        boardContent={
          <ChessBoardController
            onRequestNewGame={() => {
              actions.exitGame();
              navigate('/play', { replace: true });
            }}
            onReviewGame={() => review.startReview()}
          />
        }
        rightPanel={
          <Show when={isReviewing()} fallback={<PlayControlPanel />}>
            <ReviewControlPanel />
          </Show>
        }
      />
    </Show>
  );
};

const PlayContainer: ParentComponent = () => {
  return (
    <PlayGameProvider>
      <PlayContainerInner />
    </PlayGameProvider>
  );
};

export default PlayContainer;
