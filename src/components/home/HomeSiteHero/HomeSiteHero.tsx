import { useNavigate } from '@solidjs/router';
import { createSignal, onMount, onCleanup, Component, createMemo } from 'solid-js';
import { useGameStore } from '../../../store/GameContext';
import styles from './HomeSiteHero.module.css';

const HomeSiteHero: Component = () => {
  const navigate = useNavigate();
  const [_, actions] = useGameStore();
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
    actions.startNewGame(quickPlayTime, quickPlayDifficulty, quickPlaySide);
  };

  const knightStyle = createMemo(() => ({
    transition: 'transform 2s ease-in-out',
    transform: `translate(${pos().x}px, ${pos().y}px) rotate(${pos().r}deg)`,
  }));

  return (
    <section class={styles.hero}>
      <img
        src="/assets/wN.svg"
        alt="Faded Knight Hero Image"
        class={styles.knight}
        style={knightStyle()}
        draggable="false"
      />
      <button class={styles.playNowButton} onClick={handlePlayNow}>
        Play Now
      </button>
    </section>
  );
};

export default HomeSiteHero;
