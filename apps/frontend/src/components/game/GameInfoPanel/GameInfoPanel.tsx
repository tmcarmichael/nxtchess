import { Component, JSX, Accessor } from 'solid-js';
import type { Side } from '../../../types';
import { PlayerColorDisplay } from '../PlayerColorDisplay';
import { DifficultyDisplay } from '../DifficultyDisplay';
import { ChessMaterialDisplay } from '../../chess/ChessMaterialDisplay';
import styles from './GameInfoPanel.module.css';

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
