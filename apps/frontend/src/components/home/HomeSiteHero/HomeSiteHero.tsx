import { useNavigate } from '@solidjs/router';
import { createSignal, onMount, onCleanup, For, type Component } from 'solid-js';
import { getRandomQuickPlayConfig } from '../../../services/game/chessGameService';
import { useSettings } from '../../../store/settings/SettingsContext';
import { type StartGameOptions } from '../../../types/game';
import styles from './HomeSiteHero.module.css';

const PIECE_TYPES = ['B', 'K', 'N', 'P', 'Q', 'R'];

interface FloatingPiece {
  id: number;
  type: string;
  duration: number;
  delay: number;
  yOffset: number;
  rotations: [number, number, number, number, number];
}

let pieceId = 0;

const HomeSiteHero: Component = () => {
  const navigate = useNavigate();
  const [settingsState] = useSettings();
  const [pieces, setPieces] = createSignal<FloatingPiece[]>([]);
  let spawnTimeout: ReturnType<typeof setTimeout> | undefined;

  const createPiece = (delay: number): FloatingPiece => {
    const speed = 0.8 + Math.random() * 0.4;
    return {
      id: pieceId++,
      type: PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)],
      duration: 20 / speed,
      delay,
      yOffset: Math.random() * 460 - 240,
      rotations: [
        Math.random() * 30 - 15,
        Math.random() * 30 - 15,
        Math.random() * 30 - 15,
        Math.random() * 30 - 15,
        Math.random() * 30 - 15,
      ],
    };
  };

  const spawnPiece = () => {
    if (pieces().length >= 40) return;
    setPieces((prev) => [...prev, createPiece(0)]);
  };

  const removePiece = (id: number) => {
    setPieces((prev) => prev.filter((p) => p.id !== id));
  };

  const scheduleSpawn = () => {
    spawnTimeout = setTimeout(
      () => {
        spawnPiece();
        scheduleSpawn();
      },
      400 + Math.random() * 600
    );
  };

  onMount(() => {
    const initial: FloatingPiece[] = [];
    for (let i = 0; i < 35; i++) {
      const piece = createPiece(0);
      piece.delay = -(Math.random() * 0.85 * piece.duration);
      initial.push(piece);
    }
    setPieces(initial);
    scheduleSpawn();
  });

  onCleanup(() => {
    clearTimeout(spawnTimeout);
  });

  const handlePlayNow = () => {
    const [quickPlayTime, quickPlayDifficulty, quickPlaySide] = getRandomQuickPlayConfig();
    const quickPlayConfig: StartGameOptions = {
      side: quickPlaySide,
      mode: 'play',
      newTimeControl: quickPlayTime,
      newDifficultyLevel: quickPlayDifficulty,
    };
    navigate('/play', { replace: true, state: { quickPlay: quickPlayConfig } });
  };

  return (
    <section class={styles.hero}>
      <For each={pieces()}>
        {(piece) => (
          <img
            src={`/assets/${settingsState.theme === 'dark' ? 'w' : 'b'}${piece.type}.svg`}
            alt=""
            class={styles.floatingPiece}
            style={{
              '--duration': `${piece.duration}s`,
              '--delay': `${piece.delay}s`,
              '--y-offset': `${piece.yOffset}px`,
              '--rot-a': `${piece.rotations[0]}deg`,
              '--rot-b': `${piece.rotations[1]}deg`,
              '--rot-c': `${piece.rotations[2]}deg`,
              '--rot-d': `${piece.rotations[3]}deg`,
              '--rot-e': `${piece.rotations[4]}deg`,
            }}
            draggable="false"
            onAnimationEnd={() => removePiece(piece.id)}
          />
        )}
      </For>
      <button class={styles.playNowButton} onClick={handlePlayNow}>
        Play Now
      </button>
    </section>
  );
};

export default HomeSiteHero;
