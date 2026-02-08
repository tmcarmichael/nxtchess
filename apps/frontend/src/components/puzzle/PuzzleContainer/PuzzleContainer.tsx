import { useNavigate, useLocation } from '@solidjs/router';
import { type ParentComponent, createSignal, createEffect, on, onMount, Show } from 'solid-js';
import { PuzzleGameProvider, usePuzzleGame } from '../../../store/game/PuzzleGameContext';
import { useUserStore } from '../../../store/user/UserContext';
import ChessBoardController from '../../chess/ChessBoardController/ChessBoardController';
import GameContainer from '../../game/GameContainer/GameContainer';
import PuzzleControlPanel from '../PuzzleControlPanel/PuzzleControlPanel';
import PuzzleFeedbackModal from '../PuzzleFeedbackModal/PuzzleFeedbackModal';
import PuzzleModal from '../PuzzleModal/PuzzleModal';
import PuzzleNavigationPanel from '../PuzzleNavigationPanel/PuzzleNavigationPanel';
import type { StartGameOptions } from '../../../types/game';

interface LocationState {
  quickStart?: StartGameOptions;
}

const PuzzleContainerInner: ParentComponent = () => {
  const navigate = useNavigate();
  const location = useLocation<LocationState>();
  const { chess, ui, actions } = usePuzzleGame();
  const [, userActions] = useUserStore();
  const [showPuzzleModal, setShowPuzzleModal] = createSignal(false);
  const [showFeedbackModal, setShowFeedbackModal] = createSignal(false);

  createEffect(
    on(
      () => location.state,
      (state) => {
        if (state?.quickStart) {
          setShowPuzzleModal(false);
          actions.startNewGame(state.quickStart);
          navigate('/puzzles', { replace: true, state: {} });
        }
      }
    )
  );

  onMount(() => {
    if (chess.state.lifecycle === 'idle' && !location.state?.quickStart) {
      setShowPuzzleModal(true);
    }
  });

  createEffect(
    on(
      () => chess.state.lifecycle,
      (lifecycle, prevLifecycle) => {
        if (lifecycle === 'idle' && prevLifecycle === 'error') {
          setShowPuzzleModal(true);
        }
      }
    )
  );

  createEffect(
    on(
      () => chess.state.puzzleFeedback,
      (feedback) => {
        if (!feedback) {
          setShowFeedbackModal(false);
          return;
        }

        if (feedback.newRating !== undefined) {
          userActions.setPuzzleRating(feedback.newRating);
        }

        if (ui.state.trainingFocusMode) {
          if (feedback.type === 'complete') {
            setTimeout(() => {
              actions.dismissFeedback();
            }, 1500);
          } else if (chess.state.puzzleRated) {
            setTimeout(() => {
              actions.dismissFeedback();
            }, 2000);
          } else {
            setTimeout(() => {
              actions.dismissFeedback();
            }, 2000);
          }
        } else {
          // Eval mode: show feedback modal
          setShowFeedbackModal(true);
        }
      }
    )
  );

  const handleRequestNewGame = () => {
    setShowPuzzleModal(true);
  };

  const handleRestartGame = () => {
    actions.loadNextPuzzle();
  };

  const shouldAutoRestart = () => ui.state.trainingFocusMode;

  const handleFeedbackTryAgain = () => {
    actions.dismissFeedback();
    setShowFeedbackModal(false);
  };

  const handleFeedbackNewPuzzle = () => {
    actions.dismissFeedback();
    setShowFeedbackModal(false);
    actions.loadNextPuzzle();
  };

  const handleFeedbackEvaluate = () => {
    const fen = chess.state.puzzleStartFen;
    actions.dismissFeedback();
    setShowFeedbackModal(false);
    if (fen) {
      navigate('/analyze', { state: { importFen: fen } });
    }
  };

  return (
    <>
      <GameContainer
        layout="three-column"
        showModal={showPuzzleModal()}
        modalContent={
          <PuzzleModal
            onClose={() => {
              setShowPuzzleModal(false);
              if (chess.state.lifecycle === 'idle') {
                navigate('/', { replace: true });
              }
            }}
          />
        }
        leftPanel={<PuzzleNavigationPanel />}
        boardContent={
          <ChessBoardController
            onRequestNewGame={handleRequestNewGame}
            onRestartGame={handleRestartGame}
            autoRestartOnEnd={shouldAutoRestart}
          />
        }
        rightPanel={<PuzzleControlPanel />}
      />
      <Show when={showFeedbackModal() && chess.state.puzzleFeedback}>
        <PuzzleFeedbackModal
          type={chess.state.puzzleFeedback!.type}
          message={chess.state.puzzleFeedback!.message}
          onClose={handleFeedbackEvaluate}
          onTryAgain={
            chess.state.puzzleFeedback!.type === 'incorrect' && !chess.state.puzzleRated
              ? handleFeedbackTryAgain
              : undefined
          }
          onNewPuzzle={handleFeedbackNewPuzzle}
          onEvaluatePuzzle={handleFeedbackEvaluate}
          isRated={chess.state.puzzleRated}
          ratingDelta={chess.state.puzzleFeedback!.ratingDelta}
          newRating={chess.state.puzzleFeedback!.newRating}
        />
      </Show>
    </>
  );
};

const PuzzleContainer: ParentComponent = () => {
  return (
    <PuzzleGameProvider>
      <PuzzleContainerInner />
    </PuzzleGameProvider>
  );
};

export default PuzzleContainer;
