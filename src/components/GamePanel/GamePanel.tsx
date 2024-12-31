import styles from "./GamePanel.module.css";

// TODO: Game Panel is under construction 🛠️

const GamePanel = () => {
  return (
    <div class={styles.panel}>
      {/* Clock Section */}
      <div class={styles.clock}>
        <p>03:00</p>
      </div>

      {/* Game Info Section */}
      <div class={styles.info}>
        <p>Anonymous</p>
        <p>You play the white pieces</p>
      </div>

      {/* Action Buttons */}
      <div class={styles.actions}>
        <button>Resign</button>
        <button>Offer Draw</button>
      </div>
    </div>
  );
};

export default GamePanel;
