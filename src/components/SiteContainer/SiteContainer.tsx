import SiteHeader from '../SiteHeader/SiteHeader';
import SiteFooter from '../SiteFooter/SiteFooter';
import styles from './SiteContainer.module.css';

const SiteContainer = (props: { children?: any }) => {
  return (
    <div class={styles.container}>
      <SiteHeader />
      <main class={styles.content}>{props.children}</main>
      <SiteFooter />
    </div>
  );
};

export default SiteContainer;
