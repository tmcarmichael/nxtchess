import { lazy } from 'solid-js';
import { RouteDefinition } from '@solidjs/router';

const HomeContainer = lazy(() => import('./components/home/HomeContainer/HomeContainer'));
const PlayContainer = lazy(() => import('./components/play/PlayContainer/PlayContainer'));
const TrainingContainer = lazy(
  () => import('./components/training/TrainingContainer/TrainingContainer')
);
const UsernameSetup = lazy(() => import('./components/user/UsernameSetup/UsernameSetup'));
const UserProfile = lazy(() => import('./components/user/UserProfile/UserProfile'));
const NotFoundPage = lazy(
  () => import('./components/common/CommonNotFoundPage/CommonNotFoundPage')
);

export const routes: RouteDefinition[] = [
  { path: '/', component: HomeContainer },
  { path: '/play', component: PlayContainer },
  { path: '/training', component: TrainingContainer },
  { path: '/username-setup', component: UsernameSetup },
  { path: '/profile/:username', component: UserProfile },
  { path: '*', component: NotFoundPage },
];
