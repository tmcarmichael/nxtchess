import { JSX, splitProps, ParentComponent, createSignal, createEffect, Show } from 'solid-js';
import { useLocation, useSearchParams } from '@solidjs/router';
import HomeSiteHero from '../HomeSiteHero/HomeSiteHero';
import SignInModal from '../../user/UserSignInModal/UserSignInModal';
import styles from './HomeContainer.module.css';

interface HomeContainerProps {
  children?: JSX.Element | JSX.Element[];
}

const HomeContainer: ParentComponent<HomeContainerProps> = (props) => {
  const [local] = splitProps(props, ['children']);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showSignInModal, setShowSignInModal] = createSignal(false);

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
