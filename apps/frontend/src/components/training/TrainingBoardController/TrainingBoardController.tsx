import { createSignal, onMount, ParentComponent } from 'solid-js';
import { fenToBoard } from '../../../services/chessGameService';
import ChessBoard from '../../chess/ChessBoard/ChessBoard';
import styles from './TrainingBoardController.module.css';

const TrainingBoardController: ParentComponent = () => {
  const [highlightedMoves, setHighlightedMoves] = createSignal([]);
  const [selectedSquare, setSelectedSquare] = createSignal(null);

  onMount(() => {
    // init /training
  });

  const handleSquareClick = (square: string) => {
    setSelectedSquare;
    setHighlightedMoves;
  };

  return (
    <div class={styles.chessGameContainer}>
      <ChessBoard
        board={() => fenToBoard('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')}
        highlightedMoves={highlightedMoves}
        selectedSquare={selectedSquare}
        draggedPiece={() => null}
        cursorPosition={() => ({ x: 0, y: 0 })}
        onSquareClick={handleSquareClick}
        onSquareMouseUp={() => {}}
        onDragStart={() => {}}
        lastMove={() => null}
        checkedKingSquare={() => null}
        boardView={() => 'w'}
        activePieceColor={() => 'w'}
      />
    </div>
  );
};

export default TrainingBoardController;
