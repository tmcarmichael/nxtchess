import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../models/game_types.dart';
import '../providers/user/user_provider.dart';
import '../widgets/analyze/analyze_screen.dart';
import '../widgets/auth/username_setup_screen.dart';
import '../widgets/common/app_shell.dart';
import '../widgets/common/settings_sheet.dart';
import '../widgets/home/home_screen.dart';
import '../widgets/play/play_screen.dart';
import '../widgets/profile/profile_screen.dart';
import '../widgets/puzzle/puzzle_screen.dart';
import '../widgets/review/review_screen.dart';
import '../widgets/training/training_screen.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();

final appRouterProvider = Provider<GoRouter>((ref) {
  final userListenable = _UserStateNotifier();
  ref.listen(userProvider, (_, next) => userListenable.update(next));

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/',
    refreshListenable: userListenable,
    redirect: (context, state) {
      final user = ref.read(userProvider);
      final goingToSetup = state.matchedLocation == '/auth/username-setup';
      if (user.isLoggedIn && user.needsUsername && !goingToSetup) {
        return '/auth/username-setup';
      }
      if (goingToSetup && !(user.isLoggedIn && user.needsUsername)) {
        return '/';
      }
      return null;
    },
    errorBuilder: (context, state) => Scaffold(
      appBar: AppBar(title: const Text('Not Found')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('Page not found', style: TextStyle(fontSize: 18)),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => context.go('/'),
              child: const Text('Go Home'),
            ),
          ],
        ),
      ),
    ),
    routes: [
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) =>
            AppShell(navigationShell: navigationShell),
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/',
                builder: (context, state) => const HomeScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/play',
                builder: (context, state) {
                  final extra = state.extra;
                  final quickStart = extra is Map<String, dynamic>
                      ? extra
                      : null;
                  return PlayScreen(quickStart: quickStart);
                },
                routes: [
                  GoRoute(
                    path: ':gameId',
                    builder: (context, state) =>
                        PlayScreen(gameId: state.pathParameters['gameId']),
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/training',
                builder: (context, state) => const TrainingScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/puzzles',
                builder: (context, state) {
                  final extra = state.extra;
                  if (extra is Map<String, dynamic>) {
                    return PuzzleScreen(
                      quickStartCategory: extra['category'] as PuzzleCategory?,
                      quickStartRated: extra['rated'] as bool?,
                    );
                  }
                  return const PuzzleScreen();
                },
              ),
            ],
          ),
        ],
      ),
      GoRoute(
        path: '/analyze',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) {
          final extra = state.extra;
          final importFen = extra is Map<String, dynamic>
              ? extra['fen'] as String?
              : null;
          return AnalyzeScreen(importFen: importFen);
        },
      ),
      GoRoute(
        path: '/review',
        parentNavigatorKey: _rootNavigatorKey,
        redirect: (context, state) {
          if (state.extra == null) return '/';
          return null;
        },
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>?;
          final pgn = extra?['pgn'] as String?;
          final colorStr = extra?['playerColor'] as String?;
          Side? playerColor;
          if (colorStr == 'w') playerColor = Side.w;
          if (colorStr == 'b') playerColor = Side.b;
          return ReviewScreen(pgn: pgn, playerColor: playerColor);
        },
      ),
      GoRoute(
        path: '/profile/:username',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) =>
            ProfileScreen(username: state.pathParameters['username']!),
      ),
      GoRoute(
        path: '/auth/username-setup',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const UsernameSetupScreen(),
      ),
      GoRoute(
        path: '/settings',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const SettingsSheet(),
      ),
    ],
  );
});

// Bridges Riverpod state changes to GoRouter's refreshListenable.
class _UserStateNotifier extends ChangeNotifier {
  void update(UserState _) => notifyListeners();
}
