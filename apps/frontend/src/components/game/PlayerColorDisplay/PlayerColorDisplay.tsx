import { Show, type Component } from 'solid-js';
import Piece from '../../chess/ChessPiece/ChessPiece';
import styles from './PlayerColorDisplay.module.css';
import type { Side } from '../../../types/game';

interface PlayerColorDisplayProps {
  playerColor: Side;
}

const PlayerColorDisplay: Component<PlayerColorDisplayProps> = (props) => {
  return (
    <>
      <Show when={props.playerColor === 'w'}>
        <div class={styles.playerColorDisplayRow}>
          <span>You play White pieces </span>
          <Piece type="wN" style={{ width: '32px', height: '32px' }} />
        </div>
      </Show>
      <Show when={props.playerColor === 'b'}>
        <div class={styles.playerColorDisplayRow}>
          <span>You play Black pieces </span>
          <Piece type="bN" style={{ width: '32px', height: '32px' }} />
        </div>
      </Show>
    </>
  );
};

export default PlayerColorDisplay;
