import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../controllers/play_game_controller.dart';
import '../../models/game_types.dart';
import '../../providers/chess/chess_provider.dart';
import '../../providers/multiplayer/multiplayer_provider.dart';
import '../../providers/ui/ui_provider.dart';
import '../../services/sync/reconnect_store.dart';
import '../../theme/app_colors.dart';
import '../chess/end_dialog.dart';
import '../game/game_scaffold.dart';
import 'play_hub.dart';

class PlayScreen extends ConsumerStatefulWidget {
  final String? gameId;
  final Map<String, dynamic>? quickStart;

  const PlayScreen({super.key, this.gameId, this.quickStart});

  @override
  ConsumerState<PlayScreen> createState() => _PlayScreenState();
}

class _PlayScreenState extends ConsumerState<PlayScreen> {
  bool _initialRouteHandled = false;
  bool _dialogShowing = false;

  Map<String, dynamic>? _lastQuickStart;

  @override
  void initState() {
    super.initState();
    _lastQuickStart = widget.quickStart;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _handleInitialRoute();
    });
  }

  @override
  void didUpdateWidget(covariant PlayScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    final qs = widget.quickStart;
    if (qs != null && qs != _lastQuickStart) {
      _lastQuickStart = qs;
      final lifecycle = ref.read(chessProvider).lifecycle;
      if (lifecycle == GameLifecycle.idle) {
        _startQuickGame(qs);
      }
    }
  }

  void _handleInitialRoute() {
    if (_initialRouteHandled) return;
    _initialRouteHandled = true;

    final gameId = widget.gameId;
    if (gameId != null) {
      _joinOrReconnect(gameId);
      return;
    }

    if (widget.quickStart != null) {
      _startQuickGame(widget.quickStart!);
    }
  }

  void _startQuickGame(Map<String, dynamic> qs) {
    final minutes = qs['minutes'] as int? ?? 5;
    final increment = qs['increment'] as int? ?? 0;
    final difficulty = qs['difficulty'] as int? ?? 5;
    final sides = [Side.w, Side.b];
    final side = sides[DateTime.now().millisecondsSinceEpoch % 2];
    ref
        .read(playGameControllerProvider)
        .startAIGame(
          playerColor: side,
          difficulty: difficulty,
          timeControlMinutes: minutes,
          incrementSeconds: increment,
        );
  }

  Future<void> _joinOrReconnect(String gameId) async {
    final controller = ref.read(playGameControllerProvider);
    final activeGame = await loadActiveGame();
    if (activeGame != null && activeGame.gameId == gameId) {
      controller.reconnectToGame(gameId, activeGame.playerColor);
    } else {
      await clearActiveGame();
      controller.joinMultiplayerGame(gameId);
    }
  }

  @override
  Widget build(BuildContext context) {
    final chessState = ref.watch(chessProvider);
    final multiplayerState = ref.watch(multiplayerProvider);
    final uiState = ref.watch(uiProvider);
    final controller = ref.watch(playGameControllerProvider);

    if (uiState.showEndDialog && chessState.isGameOver && !_dialogShowing) {
      _dialogShowing = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        ref.read(uiProvider.notifier).hideEndDialog();
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => EndDialog(
            onNewGame: () {
              Navigator.of(context).pop();
              _dialogShowing = false;
              controller.onNewGame();
            },
            onExit: () {
              Navigator.of(context).pop();
              _dialogShowing = false;
              controller.onExitGame();
            },
          ),
        );
      });
    }

    if (chessState.lifecycle == GameLifecycle.idle && widget.gameId == null) {
      return SafeArea(
        child: PlayHub(
          onJoinGame: controller.joinMultiplayerGame,
          onCreateGame: controller.startMultiplayerGame,
          onStartAI: controller.startAIGame,
        ),
      );
    }

    if (chessState.lifecycle == GameLifecycle.initializing ||
        multiplayerState.isWaiting) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const CircularProgressIndicator(color: AppColors.primary),
            const SizedBox(height: 16),
            Text(
              multiplayerState.isWaiting
                  ? 'Waiting for opponent...'
                  : 'Connecting...',
              style: const TextStyle(
                color: AppColors.textSecondary,
                fontSize: 16,
              ),
            ),
            if (chessState.initError != null) ...[
              const SizedBox(height: 8),
              Text(
                chessState.initError!,
                style: const TextStyle(color: AppColors.error),
              ),
            ],
            const SizedBox(height: 24),
            TextButton(
              onPressed: controller.onExitGame,
              child: const Text('Cancel'),
            ),
          ],
        ),
      );
    }

    return SafeArea(
      child: Column(
        children: [
          if (multiplayerState.opponentDisconnected)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 6),
              color: AppColors.warning.withValues(alpha: 0.2),
              child: const Text(
                'Opponent disconnected...',
                textAlign: TextAlign.center,
                style: TextStyle(color: AppColors.warning, fontSize: 13),
              ),
            ),
          Expanded(
            child: GameScaffold(
              onMove: controller.onMove,
              controlButtons: [
                IconButton(
                  onPressed: controller.onNavigateToStart,
                  tooltip: 'Go to start',
                  icon: const Icon(
                    Icons.skip_previous,
                    color: AppColors.textSecondary,
                  ),
                ),
                IconButton(
                  onPressed: controller.onNavigateBackward,
                  tooltip: 'Previous move',
                  icon: const Icon(
                    Icons.chevron_left,
                    color: AppColors.textSecondary,
                  ),
                ),
                IconButton(
                  onPressed: controller.onNavigateForward,
                  tooltip: 'Next move',
                  icon: const Icon(
                    Icons.chevron_right,
                    color: AppColors.textSecondary,
                  ),
                ),
                IconButton(
                  onPressed: controller.onNavigateToEnd,
                  tooltip: 'Go to end',
                  icon: const Icon(
                    Icons.skip_next,
                    color: AppColors.textSecondary,
                  ),
                ),
                if (chessState.lifecycle == GameLifecycle.playing)
                  IconButton(
                    onPressed: () {
                      showDialog(
                        context: context,
                        builder: (ctx) => AlertDialog(
                          backgroundColor: AppColors.surface,
                          title: const Text(
                            'Resign?',
                            style: TextStyle(color: AppColors.textPrimary),
                          ),
                          content: const Text(
                            'Are you sure you want to resign?',
                            style: TextStyle(color: AppColors.textSecondary),
                          ),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.of(ctx).pop(),
                              child: const Text('Cancel'),
                            ),
                            ElevatedButton(
                              onPressed: () {
                                Navigator.of(ctx).pop();
                                controller.onResign();
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.error,
                              ),
                              child: const Text('Resign'),
                            ),
                          ],
                        ),
                      );
                    },
                    icon: const Icon(Icons.flag, color: AppColors.error),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
