import { type Component } from 'solid-js';
import FloatingPieces from '../../common/FloatingPieces/FloatingPieces';
import HomeQuickPlay from '../HomeQuickPlay/HomeQuickPlay';
import styles from './HomeSiteHero.module.css';

const HomeSiteHero: Component = () => {
  return (
    <section class={styles.hero}>
      <FloatingPieces />
      <HomeQuickPlay />
    </section>
  );
};

export default HomeSiteHero;
