import { useNavigate } from '@solidjs/router';
import { createSignal, onMount, onCleanup, type Component, createMemo } from 'solid-js';
import { getRandomQuickPlayConfig } from '../../../services/game/chessGameService';
import { useSettings } from '../../../store/settings/SettingsContext';
import { type StartGameOptions } from '../../../types/game';
import styles from './HomeSiteHero.module.css';

const HomeSiteHero: Component = () => {
  const navigate = useNavigate();
  const [settingsState] = useSettings();
  const [pos, setPos] = createSignal({ x: 0, y: 0, r: 0 });
  let intervalId: ReturnType<typeof setInterval> | undefined;

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
    const quickPlayConfig: StartGameOptions = {
      side: quickPlaySide,
      mode: 'play',
      newTimeControl: quickPlayTime,
      newDifficultyLevel: quickPlayDifficulty,
    };
    // Pass config to PlayContainer via navigation state
    navigate('/play', { replace: true, state: { quickPlay: quickPlayConfig } });
  };

  const knightStyle = createMemo(() => ({
    transition: 'transform 2s ease-in-out',
    transform: `translate(${pos().x}px, ${pos().y}px) rotate(${pos().r}deg)`,
  }));

  return (
    <section class={styles.hero}>
      <img
        src={settingsState.theme === 'dark' ? '/assets/wN.svg' : '/assets/bN.svg'}
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
