import styles from "./GamePanel.module.css";

// TODO: Game Panel is under construction 🛠️

const GamePanel = () => {
  const handleResign = () => {
    alert("Resign button clicked! Placeholder functionality.");
  };

  const handleOfferDraw = () => {
    alert("Offer Draw button clicked! Placeholder functionality.");
  };

  return (
    <div class={styles.panel}>
      <div class={styles.clock}>
        <p>03:00</p>
      </div>
      <div class={styles.info}>
        <p>Anonymous</p>
        <p>You play the white pieces</p>
      </div>
      <div class={styles.actions}>
        <button onClick={handleResign}>Resign</button>
        <button onClick={handleOfferDraw}>Offer Draw</button>
      </div>
    </div>
  );
};

export default GamePanel;
