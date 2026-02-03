import { type RouteDefinition } from '@solidjs/router';
import { lazy } from 'solid-js';

const HomeContainer = lazy(() => import('./components/home/HomeContainer/HomeContainer'));
const PlayContainer = lazy(() => import('./components/play/PlayContainer/PlayContainer'));
const TrainingContainer = lazy(
  () => import('./components/training/TrainingContainer/TrainingContainer')
);
const AnalyzeContainer = lazy(
  () => import('./components/analyze/AnalyzeContainer/AnalyzeContainer')
);
const PuzzleContainer = lazy(() => import('./components/puzzle/PuzzleContainer/PuzzleContainer'));
const UsernameSetup = lazy(() => import('./components/user/UsernameSetup/UsernameSetup'));
const UserProfile = lazy(() => import('./components/user/UserProfile/UserProfile'));
const NotFoundPage = lazy(
  () => import('./components/common/CommonNotFoundPage/CommonNotFoundPage')
);

export const routes: RouteDefinition[] = [
  { path: '/', component: HomeContainer },
  { path: '/play', component: PlayContainer },
  { path: '/play/:gameId', component: PlayContainer },
  { path: '/training', component: TrainingContainer },
  { path: '/analyze', component: AnalyzeContainer },
  { path: '/puzzles', component: PuzzleContainer },
  { path: '/username-setup', component: UsernameSetup },
  { path: '/profile/:username', component: UserProfile },
  { path: '*', component: NotFoundPage },
];
