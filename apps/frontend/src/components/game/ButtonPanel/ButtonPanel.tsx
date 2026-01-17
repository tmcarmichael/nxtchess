import { ParentComponent } from 'solid-js';
import styles from './ButtonPanel.module.css';

const ButtonPanel: ParentComponent = (props) => {
  return <div class={styles.buttonPanel}>{props.children}</div>;
};

export default ButtonPanel;
