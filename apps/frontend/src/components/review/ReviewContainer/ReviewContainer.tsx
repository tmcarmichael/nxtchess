import { useNavigate, useLocation } from '@solidjs/router';
import { Chess } from 'chess.js';
import { createEffect, on, batch, type ParentComponent } from 'solid-js';
import { PlayGameProvider, usePlayGame } from '../../../store/game/PlayGameContext';
import ChessBoardController from '../../chess/ChessBoardController/ChessBoardController';
import GameContainer from '../../game/GameContainer/GameContainer';
import ReviewControlPanel from '../ReviewControlPanel/ReviewControlPanel';
import ReviewNavigationPanel from '../ReviewNavigationPanel/ReviewNavigationPanel';
import type { Square, PromotionPiece } from '../../../types/chess';
import type { Side, GameOverReason, GameWinner } from '../../../types/game';

interface LocationState {
  pgn?: string;
  playerColor?: Side;
}

function determineGameResult(chess: Chess): { reason: GameOverReason; winner: GameWinner } {
  if (chess.isCheckmate()) {
    const winner: Side = chess.turn() === 'w' ? 'b' : 'w';
    return { reason: 'checkmate', winner };
  }
  if (chess.isStalemate() || chess.isDraw()) {
    return { reason: 'stalemate', winner: 'draw' };
  }
  const headers = chess.header();
  const result = headers['Result'];
  if (result === '1-0') return { reason: 'resignation', winner: 'w' };
  if (result === '0-1') return { reason: 'resignation', winner: 'b' };
  if (result === '1/2-1/2') return { reason: 'stalemate', winner: 'draw' };
  return { reason: null, winner: null };
}

const ReviewContainerInner: ParentComponent = () => {
  const navigate = useNavigate();
  const location = useLocation<LocationState>();
  const { chess, review, ui } = usePlayGame();
  let initialized = false;

  createEffect(
    on(
      () => location.state,
      (state) => {
        if (initialized) return;
        if (!state?.pgn) {
          navigate('/play', { replace: true });
          return;
        }
        initialized = true;
        loadPgnAndStartReview(state.pgn, state.playerColor ?? 'w');
      }
    )
  );

  const loadPgnAndStartReview = (pgn: string, playerColor: Side) => {
    const tempChess = new Chess();
    try {
      tempChess.loadPgn(pgn);
    } catch {
      navigate('/play', { replace: true });
      return;
    }

    const history = tempChess.history({ verbose: true });
    if (history.length === 0) {
      navigate('/play', { replace: true });
      return;
    }

    chess.startGame({
      mode: 'play',
      playerColor,
      opponentType: 'ai',
      timeControl: 0,
    });

    for (const move of history) {
      chess.applyMove(move.from as Square, move.to as Square, move.promotion as PromotionPiece);
    }

    const result = determineGameResult(tempChess);
    chess.endGame(result.reason, result.winner);

    batch(() => {
      ui.setBoardView(playerColor);
    });

    setTimeout(() => review.startReview(), 0);
  };

  const handleExitReview = () => {
    review.exitReview();
    navigate('/', { replace: true });
  };

  return (
    <GameContainer
      layout="three-column"
      showModal={false}
      leftPanel={<ReviewNavigationPanel />}
      boardContent={<ChessBoardController />}
      rightPanel={<ReviewControlPanel onExit={handleExitReview} />}
    />
  );
};

const ReviewContainer: ParentComponent = () => {
  return (
    <PlayGameProvider>
      <ReviewContainerInner />
    </PlayGameProvider>
  );
};

export default ReviewContainer;
