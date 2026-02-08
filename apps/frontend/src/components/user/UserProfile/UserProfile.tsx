import { useParams } from '@solidjs/router';
import { SolidApexCharts } from 'solid-apexcharts';
import { createEffect, createSignal, on, Show } from 'solid-js';
import { BACKEND_URL } from '../../../shared/config/env';
import { DEBUG } from '../../../shared/utils/debug';
import { getRatingIcon } from '../ProfileIconPicker/ProfileIconPicker';
import styles from './UserProfile.module.css';

interface ViewedProfile {
  username: string;
  rating: number;
  puzzleRating: number;
}

// DEV/TEST user profile rating graph
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
const devCategories = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const devSeriesData = [1500, 1480, 1510, 1495, 1580, 1568, 1600, 1530, 1570, 1590, 1690, 1730];
const devChartOptions = {
  chart: {
    toolbar: { show: false },
    animations: { enabled: true },
  },
  xaxis: {
    categories: devCategories,
  },
  yaxis: {
    min: 1400,
    max: 1800,
  },
  stroke: {
    width: 2,
    curve: 'smooth' as const,
  },
  markers: {
    size: 4,
  },
  title: {
    text: 'Rating Over Time (Dev)',
    align: 'center' as const,
    style: { color: '#ccc' },
  },
  tooltip: {
    theme: 'dark' as const,
  },
  theme: {
    mode: 'dark' as const,
  },
};

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

const UserProfile = () => {
  const params = useParams();
  const [viewedProfile, setViewedProfile] = createSignal<ViewedProfile | null>(null);
  const [isLoading, setIsLoading] = createSignal(true);
  const [notFound, setNotFound] = createSignal(false);
  const [fetchError, setFetchError] = createSignal(false);

  let currentRequestVersion = 0;

  createEffect(
    on(
      () => params.username,
      (username) => {
        if (!username) return;

        // Increment version for this request
        const requestVersion = ++currentRequestVersion;

        setIsLoading(true);
        setNotFound(false);
        setFetchError(false);
        setViewedProfile(null);

        fetch(`${BACKEND_URL}/api/profile/${username}`, {
          credentials: 'include',
        })
          .then((res) => {
            // Ignore stale responses
            if (requestVersion !== currentRequestVersion) return null;

            if (res.status === 404) {
              setNotFound(true);
              setIsLoading(false);
              return null;
            }
            if (!res.ok) {
              throw new Error('Failed to fetch profile');
            }
            return res.json();
          })
          .then((data) => {
            // Ignore stale responses
            if (requestVersion !== currentRequestVersion) return;

            if (data) {
              setViewedProfile({
                username: data.username,
                rating: data.rating,
                puzzleRating: data.puzzle_rating ?? 1200,
              });
            }
            setIsLoading(false);
          })
          .catch((err) => {
            // Ignore stale responses
            if (requestVersion !== currentRequestVersion) return;

            if (DEBUG) console.error('Error fetching profile:', err);
            setFetchError(true);
            setIsLoading(false);
          });
      }
    )
  );

  return (
    <Show
      when={!notFound()}
      fallback={
        <div class={styles.userProfileContainer}>
          <h2 class={styles.userProfileTitle}>User Not Found</h2>
          <p class={styles.userProfileLoading}>The user "{params.username}" does not exist.</p>
        </div>
      }
    >
      <Show
        when={!fetchError()}
        fallback={
          <div class={styles.userProfileContainer}>
            <h2 class={styles.userProfileTitle}>Error</h2>
            <p class={styles.userProfileLoading}>Failed to load profile. Please try again later.</p>
          </div>
        }
      >
        <div class={styles.userProfileContainer}>
          <Show
            when={!isLoading() && viewedProfile()}
            fallback={<p class={styles.userProfileLoading}>Loading profile...</p>}
          >
            <div class={styles.userProfileHeader}>
              <img
                src={getRatingIcon(viewedProfile()!.rating, viewedProfile()!.puzzleRating)}
                alt="Profile icon"
                class={styles.userProfileIcon}
              />
              <h2 class={styles.userProfileTitle}>{viewedProfile()!.username}</h2>
            </div>
            <div class={styles.userProfileRatings}>
              <div class={styles.userProfileRatingItem}>
                <span class={styles.userProfileRatingLabel}>Game Rating</span>
                <span class={styles.userProfileRatingValue}>{viewedProfile()!.rating}</span>
              </div>
              <div class={styles.userProfileRatingItem}>
                <span class={styles.userProfileRatingLabel}>Puzzle Rating</span>
                <span class={styles.userProfileRatingValue}>{viewedProfile()!.puzzleRating}</span>
              </div>
            </div>
            <div class={styles.userProfileGraph}>
              <SolidApexCharts
                type="line"
                width="100%"
                height="500px"
                options={devChartOptions} // DEV/TEST
                series={[{ name: 'My Rating', data: devSeriesData }]} // DEV/TEST
              />
            </div>
          </Show>
        </div>
      </Show>
    </Show>
  );
};

export default UserProfile;
