import { useLocation } from '@solidjs/router';
import HomeSiteHero from '../HomeSiteHero/HomeSiteHero';
import styles from './HomeContainer.module.css';

const HomeContainer = (props: any) => {
  const location = useLocation();
  return (
    <div class={styles.container}>
      {location.pathname === '/' && <HomeSiteHero />}
      <main class={styles.content}>{props.children}</main>
    </div>
  );
};

export default HomeContainer;
