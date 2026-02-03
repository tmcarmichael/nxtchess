import { useNavigate, useLocation } from '@solidjs/router';
import { type ParentComponent, createSignal, createEffect, on, onMount, Show } from 'solid-js';
import { PuzzleGameProvider, usePuzzleGame } from '../../../store/game/PuzzleGameContext';
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

        if (ui.state.trainingFocusMode) {
          // Focus mode: toasts are handled by ChessBoardController via getPuzzleFeedback
          // For 'complete', ChessBoardController's autoRestartOnEnd handles loading next puzzle
          if (feedback.type === 'complete') {
            setTimeout(() => {
              actions.dismissFeedback();
            }, 1500);
          } else {
            // Incorrect in focus mode: auto-dismiss after 2 seconds
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
        modalContent={<PuzzleModal onClose={() => setShowPuzzleModal(false)} />}
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
            chess.state.puzzleFeedback!.type === 'incorrect' ? handleFeedbackTryAgain : undefined
          }
          onNewPuzzle={handleFeedbackNewPuzzle}
          onEvaluatePuzzle={handleFeedbackEvaluate}
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
