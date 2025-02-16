import { A } from '@solidjs/router';
import styles from './CommonNotFoundPage.module.css';

const CommonNotFoundPage = () => {
  return (
    <div class={styles.notFoundContainer}>
      <h1 class={styles.notFoundTitle}>404: Page Not Found</h1>
      <p class={styles.notFoundText}>The page you requested does not exist.</p>
      <A href="/" class={styles.backLink}>
        Home
      </A>
    </div>
  );
};

export default CommonNotFoundPage;
