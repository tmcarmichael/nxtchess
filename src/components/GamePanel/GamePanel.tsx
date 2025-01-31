import styles from './GamePanel.module.css';

const GamePanel = () => {
  const handleResign = () => {
    alert('Resign button clicked - Placeholder functionality.');
  };

  const handleOfferDraw = () => {
    alert('Offer Draw button clicked - Placeholder functionality.');
  };

  return (
    <div class={styles.panel}>
      <div class={styles.info}>
        <p>Debug placeholder game text</p>
      </div>
      <div>
        <button class={styles.panelButton} onClick={handleResign}>
          <span>Resign</span>
        </button>
      </div>
      <div class={styles.divider} />
      <div>
        <button class={styles.panelButton} onClick={handleOfferDraw}>
          <span>Offer Draw</span>
        </button>
      </div>
    </div>
  );
};

export default GamePanel;
