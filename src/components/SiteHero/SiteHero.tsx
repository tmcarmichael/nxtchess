import { useNavigate } from '@solidjs/router';
import { createSignal, onMount, onCleanup } from 'solid-js';
import { useGameStore } from '../../store/game/GameContext';
import styles from './SiteHero.module.css';

const SiteHero = () => {
  const navigate = useNavigate();
  const [_, { startNewGame }] = useGameStore();
  const [pos, setPos] = createSignal({ x: 0, y: 0, r: 0 });
  let intervalId: number | undefined;

  onMount(() => {
    intervalId = setInterval(() => {
      setPos({
        x: Math.random() * 18 - 9,
        y: Math.random() * 18 - 9,
        r: Math.random() * 4 - 2,
      });
    }, 2000);
  });

  onCleanup(() => {
    clearInterval(intervalId);
  });

  const handlePlayNow = () => {
    const quickPlayDifficulty = Math.floor(Math.random() * (8 - 2 + 1)) + 2;
    const quickPlayTime = [3, 5, 10][Math.floor(Math.random() * 3)];
    const quickPlaySide = Math.random() < 0.5 ? 'w' : 'b';
    navigate('/game', { replace: true });
    startNewGame(quickPlayTime, quickPlayDifficulty, quickPlaySide);
  };

  return (
    <section class={styles.hero}>
      <img
        src="/assets/wN.svg"
        alt="Faded Knight Hero Image"
        class={styles.knight}
        style={{
          transition: 'transform 2s ease-in-out',
          transform: `translate(${pos().x}px, ${pos().y}px) rotate(${pos().r}deg)`,
        }}
        draggable="false"
      />
      <button class={styles.playNowButton} onClick={handlePlayNow}>
        Play Now
      </button>
    </section>
  );
};

export default SiteHero;
