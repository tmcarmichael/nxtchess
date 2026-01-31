import { Show, type Component, type JSX } from 'solid-js';
import CommonErrorBoundary from '../../common/CommonErrorBoundary/CommonErrorBoundary';
import styles from './GameContainer.module.css';

type LayoutType = 'two-column' | 'three-column';

interface GameContainerProps {
  layout: LayoutType;
  showModal: boolean;
  modalContent?: JSX.Element;
  leftPanel?: JSX.Element;
  boardContent: JSX.Element;
  rightPanel: JSX.Element;
}

const GameContainer: Component<GameContainerProps> = (props) => {
  return (
    <CommonErrorBoundary>
      <div class={styles.gameContainer}>
        <Show when={props.showModal}>{props.modalContent}</Show>
        <div
          class={styles.gameLayout}
          classList={{ [styles.threeColumn]: props.layout === 'three-column' }}
        >
          <Show when={props.layout === 'three-column' && props.leftPanel}>
            <div class={styles.gameSidePanelWrapper}>{props.leftPanel}</div>
          </Show>
          <div class={styles.gameBoardWrapper}>{props.boardContent}</div>
          <div class={styles.gameSidePanelWrapper}>{props.rightPanel}</div>
        </div>
      </div>
    </CommonErrorBoundary>
  );
};

export default GameContainer;
