import { useNavigate } from '@solidjs/router';
import { For, type Component } from 'solid-js';
import { type PuzzleCategory, type StartGameOptions } from '../../../types/game';
import styles from './HomeQuickPlay.module.css';

const BulletIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M15 8.5c0-2.5-1.5-5.5-3-6.5-1.5 1-3 4-3 6.5v5c0 .6.4 1 1 1h4c.6 0 1-.4 1-1v-5zM10 17h4v2h-4z"
      fill="currentColor"
    />
  </svg>
);

const BlitzIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M13 2L3 14h8l-2 8 12-14h-8l2-6z" fill="currentColor" />
  </svg>
);

const RapidIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      fill-rule="evenodd"
      d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm1-15h-2v6l5.25 3.15.75-1.23-4-2.42V7z"
      fill="currentColor"
    />
  </svg>
);

const ClassicalIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M6 2v4l4 4-4 4v4h12v-4l-4-4 4-4V2H6zm2 1h8v2.5l-4 4-4-4V3zm0 18v-2.5l4-4 4 4V21H8z"
      fill="currentColor"
    />
  </svg>
);

const CrownIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M3 18l2.5-8L9 14l3-9 3 9 3.5-4L21 18H3zm1 2h16v2H4z" fill="currentColor" />
  </svg>
);

interface QuickPlayCard {
  icon: () => ReturnType<typeof BulletIcon>;
  label: string;
  sublabel: string;
  ariaLabel: string;
  minutes: number;
  increment: number;
}

interface QuickPuzzleCard {
  label: string;
  category: PuzzleCategory;
}

const PLAY_CARDS: QuickPlayCard[] = [
  {
    icon: BulletIcon,
    label: '1+0',
    sublabel: 'Bullet',
    ariaLabel: 'Quick play Bullet 1+0',
    minutes: 1,
    increment: 0,
  },
  {
    icon: BlitzIcon,
    label: '3+2',
    sublabel: 'Blitz',
    ariaLabel: 'Quick play Blitz 3+2',
    minutes: 3,
    increment: 2,
  },
  {
    icon: RapidIcon,
    label: '10+5',
    sublabel: 'Rapid',
    ariaLabel: 'Quick play Rapid 10+5',
    minutes: 10,
    increment: 5,
  },
  {
    icon: ClassicalIcon,
    label: '30+15',
    sublabel: 'Classical',
    ariaLabel: 'Quick play Classical 30+15',
    minutes: 30,
    increment: 15,
  },
];

const PUZZLE_CARDS: QuickPuzzleCard[] = [
  { label: 'Mate in 1', category: 'mate-in-1' },
  { label: 'Mate in 2', category: 'mate-in-2' },
  { label: 'Mate in 3', category: 'mate-in-3' },
];

const HomeQuickPlay: Component = () => {
  const navigate = useNavigate();

  const handleQuickPlay = (minutes: number, increment: number) => {
    const difficulty = 5;
    const side = Math.random() < 0.5 ? 'w' : 'b';
    const config: StartGameOptions = {
      side,
      mode: 'play',
      newTimeControl: minutes,
      newIncrement: increment,
      newDifficultyLevel: difficulty,
    };
    navigate('/play', { replace: true, state: { quickPlay: config } });
  };

  const handlePuzzle = (category: PuzzleCategory) => {
    const config: StartGameOptions = {
      side: 'w',
      mode: 'puzzle',
      puzzleCategory: category,
      puzzleRated: false,
    };
    navigate('/puzzles', { replace: true, state: { quickStart: config } });
  };

  return (
    <div class={styles.quickPlayRoot}>
      <div class={styles.quickPlaySection}>
        <span class={styles.sectionLabel}>Quick Play</span>
        <div class={styles.playRow}>
          <For each={PLAY_CARDS}>
            {(card, i) => (
              <button
                class={styles.quickCard}
                aria-label={card.ariaLabel}
                style={{ '--stagger': `${i() * 60}ms` }}
                onClick={() => handleQuickPlay(card.minutes, card.increment)}
              >
                <span class={styles.cardIcon}>
                  <card.icon />
                </span>
                <span class={styles.cardLabel}>{card.label}</span>
                <span class={styles.cardSublabel}>{card.sublabel}</span>
              </button>
            )}
          </For>
        </div>
      </div>

      <div class={styles.quickPlaySection}>
        <span class={styles.sectionLabel}>Puzzles</span>
        <div class={styles.puzzleRow}>
          <For each={PUZZLE_CARDS}>
            {(card, i) => (
              <button
                class={styles.quickCard}
                style={{ '--stagger': `${(i() + PLAY_CARDS.length) * 60}ms` }}
                onClick={() => handlePuzzle(card.category)}
              >
                <span class={styles.cardIcon}>
                  <CrownIcon />
                </span>
                <span class={styles.cardLabel}>{card.label}</span>
              </button>
            )}
          </For>
        </div>
      </div>
    </div>
  );
};

export default HomeQuickPlay;
