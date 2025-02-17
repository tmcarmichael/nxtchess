import { createEffect, Show } from 'solid-js';
import { useParams } from '@solidjs/router';
import { useUserStore } from '../../../store/UserContext';
import { SolidApexCharts } from 'solid-apexcharts';
import styles from './UserProfile.module.css';

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
  const [userState, userAction] = useUserStore();

  createEffect(() => {
    if (userState.username === params.username) {
      userAction.fetchUserProfile();
    }
  });

  return (
    <div class={styles.userProfileContainer}>
      <h2 class={styles.userProfileTitle}>{params.username}</h2>
      <Show
        when={userState.rating != null}
        fallback={<p class={styles.userProfileLoading}>Loading user rating...</p>}
      >
        <p class={styles.userProfileRating}>Rating: {userState.rating}</p>
      </Show>
      <div class={styles.userProfileGraph}>
        <SolidApexCharts
          type="line"
          width="100%"
          height="500px"
          options={devChartOptions} // DEV/TEST
          series={[{ name: 'My Rating', data: devSeriesData }]} // DEV/TEST
        />
      </div>
    </div>
  );
};

export default UserProfile;
