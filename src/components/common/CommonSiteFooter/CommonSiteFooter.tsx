import { For } from 'solid-js';
import styles from './CommonSiteFooter.module.css';

const links = [
  {
    label: 'ABOUT',
    url: 'https://github.com/tmcarmichael/nxtchess?tab=readme-ov-file#nxt-chess',
  },
  {
    label: 'ROADMAP',
    url: 'https://github.com/tmcarmichael/nxtchess/blob/main/README.md#-roadmap',
  },
  {
    label: 'SUPPORT',
    url: 'https://github.com/tmcarmichael/nxtchess?tab=readme-ov-file#-contact',
  },
  {
    label: 'PRIVACY',
    url: 'https://github.com/tmcarmichael/nxtchess/blob/main/PRIVACY.md',
  },
  {
    label: 'CONTRIBUTE',
    url: 'https://github.com/tmcarmichael/nxtchess?tab=readme-ov-file#%EF%B8%8F-getting-started',
  },
  {
    label: 'CONTACT',
    url: 'https://github.com/tmcarmichael/nxtchess?tab=readme-ov-file#-contact',
  },
];

const CommonSiteFooter = () => {
  return (
    <footer class={styles.footer}>
      <ul class={styles.footerList}>
        <For each={links}>
          {(link) => (
            <li>
              <a href={link.url}>{link.label}</a>
            </li>
          )}
        </For>
      </ul>
    </footer>
  );
};

export default CommonSiteFooter;
