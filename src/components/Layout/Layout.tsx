import { useNavigate } from '@solidjs/router';
import { createSignal } from 'solid-js';
import styles from './Layout.module.css';
import Modal from '../Modal/Modal';

const Layout = (props: { children?: any }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [timeControl, setTimeControl] = createSignal(5);
  const [difficulty, setDifficulty] = createSignal('medium');

  const handleStartGame = () => {
    navigate('/game', {
      state: { timeControl: timeControl(), difficulty: difficulty() },
    });
    setIsModalOpen(false);
  };

  return (
    <div>
      <header class={styles.header}>
        <div class={styles.titleAndPanel}>
          <h1 class={styles.title} onClick={() => navigate('/')}>
            nxtchess
          </h1>
          <div class={styles.buttonPanel}>
            <button class={styles.button} onClick={() => setIsModalOpen(true)}>
              Play
            </button>
            <button class={styles.button} onClick={() => alert('Sign In placeholder')}>
              Sign In
            </button>
            <button class={styles.button} onClick={() => alert('Tools placeholder')}>
              Tools
            </button>
          </div>
        </div>
      </header>

      <main class={styles.mainContent}>{props.children}</main>

      {isModalOpen() && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <h2>Game Settings</h2>
          <div class={styles.settings}>
            <div>
              <label>Time Control:</label>
              <select
                value={timeControl()}
                onChange={(e) => setTimeControl(parseInt(e.currentTarget.value))}
              >
                <option value="3">3 Minutes</option>
                <option value="5">5 Minutes</option>
                <option value="10">10 Minutes</option>
              </select>
            </div>
            <div>
              <label>Difficulty:</label>
              <select value={difficulty()} onChange={(e) => setDifficulty(e.currentTarget.value)}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
          <div class={styles.modalActions}>
            <button onClick={handleStartGame}>Start Game</button>
            <button onClick={() => setIsModalOpen(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Layout;
