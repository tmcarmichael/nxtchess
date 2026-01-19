import { useNavigate } from '@solidjs/router';
import { createSignal, onMount, onCleanup, Component, createMemo } from 'solid-js';
import { useGame } from '../../../store';
import { getRandomQuickPlayConfig } from '../../../services/game';
import styles from './HomeSiteHero.module.css';
import { StartGameOptions } from '../../../types';

const HomeSiteHero: Component = () => {
  const navigate = useNavigate();
  const { actions } = useGame();
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
    const [quickPlayTime, quickPlayDifficulty, quickPlaySide] = getRandomQuickPlayConfig();
    const playGameConfig: StartGameOptions = {
      side: quickPlaySide,
      mode: 'play',
      newTimeControl: quickPlayTime,
      newDifficultyLevel: quickPlayDifficulty,
    };
    navigate('/play', { replace: true });
    actions.startNewGame(playGameConfig);
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
