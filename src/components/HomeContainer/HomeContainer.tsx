import { useLocation } from '@solidjs/router';
import SiteHero from '../SiteHero/SiteHero';
import styles from './HomeContainer.module.css';

const HomeContainer = (props: any) => {
  const location = useLocation();
  return (
    <div class={styles.container}>
      {location.pathname === '/' && <SiteHero />}
      <main class={styles.content}>{props.children}</main>
    </div>
  );
};

export default HomeContainer;
