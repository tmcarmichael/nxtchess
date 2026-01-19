import { useLocation, useSearchParams } from '@solidjs/router';
import {
  type JSX,
  splitProps,
  type ParentComponent,
  createSignal,
  createEffect,
  onMount,
  onCleanup,
  Show,
} from 'solid-js';
import { enginePool } from '../../../services';
import SignInModal from '../../user/UserSignInModal/UserSignInModal';
import HomeSiteHero from '../HomeSiteHero/HomeSiteHero';
import styles from './HomeContainer.module.css';

interface HomeContainerProps {
  children?: JSX.Element | JSX.Element[];
}

const HomeContainer: ParentComponent<HomeContainerProps> = (props) => {
  const [local] = splitProps(props, ['children']);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showSignInModal, setShowSignInModal] = createSignal(false);

  // Pre-warm engine during idle time on home page for faster game start
  onMount(() => {
    let isMounted = true;

    if ('requestIdleCallback' in window) {
      const idleHandle = requestIdleCallback(
        async () => {
          if (!isMounted) return;
          try {
            const engine = await enginePool.acquire('ai', '__warmup__');
            if (!isMounted) {
              await enginePool.release('ai', '__warmup__');
              return;
            }
            await engine.init();
            await enginePool.release('ai', '__warmup__');
          } catch {
            // Warmup is best-effort, silently ignore failures
          }
        },
        { timeout: 3000 }
      );

      onCleanup(() => {
        isMounted = false;
        if ('cancelIdleCallback' in window) {
          cancelIdleCallback(idleHandle);
        }
      });
    }
  });

  createEffect(() => {
    if (searchParams.error) {
      setShowSignInModal(true);
    }
  });

  const closeModal = () => {
    setShowSignInModal(false);
    setSearchParams({ error: undefined });
  };

  return (
    <div class={styles.container}>
      {location.pathname === '/' && <HomeSiteHero />}
      <main class={styles.content}>{local.children}</main>
      <Show when={showSignInModal()}>
        <SignInModal onClose={closeModal} />
      </Show>
    </div>
  );
};

export default HomeContainer;
