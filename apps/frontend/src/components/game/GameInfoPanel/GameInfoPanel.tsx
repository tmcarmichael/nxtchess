import { Show, type Component, type JSX, type Accessor } from 'solid-js';
import ChessMaterialDisplay from '../../chess/ChessMaterialDisplay/ChessMaterialDisplay';
import DifficultyDisplay from '../DifficultyDisplay/DifficultyDisplay';
import PlayerColorDisplay from '../PlayerColorDisplay/PlayerColorDisplay';
import styles from './GameInfoPanel.module.css';
import type { Side } from '../../../types/game';

interface MaterialData {
  diff: number;
}

interface GameInfoPanelProps {
  playerColor: Side;
  difficulty?: number;
  material: Accessor<MaterialData>;
  capturedWhite: string[];
  capturedBlack: string[];
  extraInfo?: JSX.Element;
}

const GameInfoPanel: Component<GameInfoPanelProps> = (props) => {
  return (
    <div class={styles.infoPanel}>
      <PlayerColorDisplay playerColor={props.playerColor} />
      {props.extraInfo}
      <Show when={props.difficulty !== undefined}>
        <DifficultyDisplay difficulty={props.difficulty!} />
      </Show>
      <ChessMaterialDisplay
        material={props.material}
        capturedWhite={props.capturedWhite}
        capturedBlack={props.capturedBlack}
      />
    </div>
  );
};

export default GameInfoPanel;
