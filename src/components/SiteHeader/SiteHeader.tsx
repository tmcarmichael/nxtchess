// SiteHeader.tsx
import { useNavigate } from '@solidjs/router';
import { createSignal, Show } from 'solid-js';
import styles from './SiteHeader.module.css';
import PlayModal from '../PlayModal/PlayModal';
import { Side } from '../../types';

const SiteHeader = (props: { children?: any }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = createSignal(false);

  const handleStartGame = (timeControl: number, difficulty: string, side: Side) => {
    navigate('/game', {
      replace: true,
      state: { timeControl, difficulty, side },
    });
    setIsModalOpen(false);
  };

  return (
    <>
      <header class={styles.header}>
        <div class={styles.titleAndPanel}>
          <h1 class={styles.title} onClick={() => navigate('/')}>
            nxtchess
          </h1>
          <div class={styles.buttonPanel}>
            <button class={styles.button} onClick={() => setIsModalOpen(true)}>
              <span>Play</span>
            </button>
            <button class={styles.button} onClick={() => alert('Tools placeholder')}>
              <span>Tools</span>
            </button>
            <button class={styles.button} onClick={() => alert('Puzzles placeholder')}>
              <span>Puzzles</span>
            </button>
            <button class={styles.button} onClick={() => alert('Database placeholder')}>
              <span>Database</span>
            </button>
            <button class={styles.button} onClick={() => alert('Sign In placeholder')}>
              <span>Sign In</span>
            </button>
          </div>
        </div>
      </header>

      <Show when={isModalOpen()}>
        <PlayModal onClose={() => setIsModalOpen(false)} onStartGame={handleStartGame} />
      </Show>

      <main class={styles.mainContent}>{props.children}</main>
    </>
  );
};

export default SiteHeader;
