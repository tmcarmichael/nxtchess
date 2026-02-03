import { type ParentComponent } from 'solid-js';
import styles from './GamePanelButton.module.css';

interface GamePanelButtonProps {
  onClick: () => void;
  disabled?: boolean;
  class?: string;
}

const GamePanelButton: ParentComponent<GamePanelButtonProps> = (props) => {
  return (
    <button
      onClick={() => props.onClick()}
      class={`${styles.gamePanelButton} ${props.class || ''}`}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
};

export default GamePanelButton;
