import { type Component, type JSX, type Accessor } from 'solid-js';
import { ChessMaterialDisplay } from '../../chess/ChessMaterialDisplay';
import { DifficultyDisplay } from '../DifficultyDisplay';
import { PlayerColorDisplay } from '../PlayerColorDisplay';
import styles from './GameInfoPanel.module.css';
import type { Side } from '../../../types';

interface MaterialData {
  diff: number;
}

interface GameInfoPanelProps {
  playerColor: Side;
  difficulty: number;
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
      <DifficultyDisplay difficulty={props.difficulty} />
      <ChessMaterialDisplay
        material={props.material}
        capturedWhite={props.capturedWhite}
        capturedBlack={props.capturedBlack}
      />
    </div>
  );
};

export default GameInfoPanel;
