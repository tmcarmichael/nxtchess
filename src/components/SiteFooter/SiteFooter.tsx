import styles from './SiteFooter.module.css';

const SiteFooter = () => {
  return (
    <footer class={styles.footer}>
      <ul class={styles.footerList}>
        <li>
          <a href="https://github.com/tmcarmichael/nxtchess?tab=readme-ov-file#nxt-chess">ABOUT</a>
        </li>
        <li>
          <a href="https://github.com/tmcarmichael/nxtchess/blob/main/README.md#-roadmap">
            ROADMAP
          </a>
        </li>
        <li>
          <a href="https://github.com/tmcarmichael/nxtchess?tab=readme-ov-file#-contact">SUPPORT</a>
        </li>
        <li>
          <a href="https://github.com/tmcarmichael/nxtchess/blob/main/PRIVACY.md">PRIVACY</a>
        </li>
        <li>
          <a href="https://github.com/tmcarmichael/nxtchess?tab=readme-ov-file#%EF%B8%8F-getting-started">
            CONTRIBUTE
          </a>
        </li>
        <li>
          <a href="https://github.com/tmcarmichael/nxtchess?tab=readme-ov-file#-contact">CONTACT</a>
        </li>
      </ul>
    </footer>
  );
};

export default SiteFooter;
