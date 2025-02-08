import { JSX, splitProps } from 'solid-js';
import { useLocation } from '@solidjs/router';
import HomeSiteHero from '../HomeSiteHero/HomeSiteHero';
import styles from './HomeContainer.module.css';

interface HomeContainerProps {
  children?: JSX.Element | JSX.Element[];
}

const HomeContainer = (props: HomeContainerProps) => {
  const [local] = splitProps(props, ['children']);
  const location = useLocation();
  return (
    <div class={styles.container}>
      {location.pathname === '/' && <HomeSiteHero />}
      <main class={styles.content}>{local.children}</main>
    </div>
  );
};

export default HomeContainer;
