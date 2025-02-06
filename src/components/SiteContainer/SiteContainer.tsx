import { useLocation } from '@solidjs/router';
import SiteHeader from '../SiteHeader/SiteHeader';
import SiteFooter from '../SiteFooter/SiteFooter';
import SiteHero from '../SiteHero/SiteHero';
import styles from './SiteContainer.module.css';

const SiteContainer = (props: { children: any }) => {
  const location = useLocation();
  return (
    <div class={styles.container}>
      <SiteHeader />
      {location.pathname === '/' && <SiteHero />}
      <main class={styles.content}>{props.children}</main>
      <SiteFooter />
    </div>
  );
};

export default SiteContainer;
