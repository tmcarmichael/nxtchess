import { useNavigate } from '@solidjs/router';
import { type Component } from 'solid-js';
import { getRandomQuickPlayConfig } from '../../../services/game/chessGameService';
import { type StartGameOptions } from '../../../types/game';
import FloatingPieces from '../../common/FloatingPieces/FloatingPieces';
import styles from './HomeSiteHero.module.css';

const HomeSiteHero: Component = () => {
  const navigate = useNavigate();

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
      <FloatingPieces />
      <button class={styles.playNowButton} onClick={handlePlayNow}>
        Play Now
      </button>
    </section>
  );
};

export default HomeSiteHero;
