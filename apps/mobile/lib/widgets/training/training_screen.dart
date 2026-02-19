import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../controllers/training_game_controller.dart';
import '../../models/game_types.dart';
import '../../providers/chess/chess_provider.dart';
import '../../providers/engine/engine_provider.dart';
import '../../theme/app_colors.dart';
import '../chess/chess_board_widget.dart';
import '../chess/chess_eval_bar.dart';
import '../game/move_history_widget.dart';
import '../game/move_navigation_bar.dart';
import 'training_setup_sheet.dart';

class TrainingScreen extends ConsumerStatefulWidget {
  const TrainingScreen({super.key});

  @override
  ConsumerState<TrainingScreen> createState() => _TrainingScreenState();
}

class _TrainingScreenState extends ConsumerState<TrainingScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final state = ref.read(chessProvider);
      if (state.lifecycle == GameLifecycle.idle) {
        _showSetupSheet();
      }
    });
  }

  void _showSetupSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surfaceDark,
      builder: (_) => TrainingSetupSheet(
        onStart:
            ({
              required Side side,
              required int difficulty,
              required GamePhase gamePhase,
              String? theme,
            }) {
              ref
                  .read(trainingGameControllerProvider)
                  .startNewGame(
                    side: side,
                    difficulty: difficulty,
                    gamePhase: gamePhase,
                    theme: theme,
                  );
            },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final chessState = ref.watch(chessProvider);
    final engineState = ref.watch(engineProvider);
    final controller = ref.read(trainingGameControllerProvider);
    final screenWidth = MediaQuery.of(context).size.width;
    const evalBarWidth = 24.0;
    final boardSize = screenWidth - evalBarWidth;

    return Scaffold(
      body: SafeArea(
        child: chessState.lifecycle == GameLifecycle.idle
            ? _buildIdleState()
            : chessState.lifecycle == GameLifecycle.initializing
            ? _buildLoadingState()
            : chessState.lifecycle == GameLifecycle.error
            ? _buildErrorState(chessState)
            : Column(
                children: [
                  _TrainingTopBar(
                    chessState: chessState,
                    engineState: engineState,
                    onNewGame: _showSetupSheet,
                  ),

                  Row(
                    children: [
                      ChessEvalBar(eval: chessState.training.evalScore ?? 0.0),
                      ChessBoardWidget(
                        size: boardSize,
                        onMove: controller.onMove,
                        interactive:
                            chessState.lifecycle == GameLifecycle.playing &&
                            chessState.currentTurn == chessState.playerColor &&
                            !engineState.isThinking,
                      ),
                    ],
                  ),

                  Expanded(
                    child: MoveHistoryWidget(
                      moves: chessState.moveHistory,
                      viewIndex: chessState.viewMoveIndex,
                      onTapMove: (i) =>
                          ref.read(chessProvider.notifier).jumpToMoveIndex(i),
                    ),
                  ),

                  MoveNavigationBar(
                    onStart: controller.onNavigateToStart,
                    onBack: controller.onNavigateBackward,
                    onForward: controller.onNavigateForward,
                    onEnd: controller.onNavigateToEnd,
                    trailing: [
                      if (chessState.lifecycle == GameLifecycle.playing)
                        TextButton.icon(
                          onPressed: controller.onResign,
                          icon: const Icon(Icons.flag, size: 16),
                          label: const Text(
                            'Resign',
                            style: TextStyle(fontSize: 13),
                          ),
                          style: TextButton.styleFrom(
                            foregroundColor: AppColors.error,
                          ),
                        ),
                      if (chessState.lifecycle == GameLifecycle.ended)
                        ElevatedButton.icon(
                          onPressed: controller.onNewGame,
                          icon: const Icon(Icons.replay, size: 16),
                          label: const Text(
                            'New Game',
                            style: TextStyle(fontSize: 13),
                          ),
                        ),
                      if (chessState.lifecycle != GameLifecycle.playing &&
                          chessState.lifecycle != GameLifecycle.ended)
                        ElevatedButton(
                          onPressed: _showSetupSheet,
                          child: const Text(
                            'Start',
                            style: TextStyle(fontSize: 13),
                          ),
                        ),
                    ],
                  ),
                ],
              ),
      ),
    );
  }

  Widget _buildIdleState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.school, size: 64, color: AppColors.primary),
          const SizedBox(height: 16),
          const Text(
            'Training',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Practice with engine evaluation',
            style: TextStyle(fontSize: 16, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: _showSetupSheet,
            child: const Padding(
              padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              child: Text('Start Training'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingState() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(color: AppColors.primary),
          SizedBox(height: 16),
          Text(
            'Setting up position...',
            style: TextStyle(color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(ChessState state) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 48, color: AppColors.error),
          const SizedBox(height: 16),
          Text(
            state.initError ?? 'Failed to start training',
            style: const TextStyle(color: AppColors.error),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _showSetupSheet,
            child: const Text('Try Again'),
          ),
        ],
      ),
    );
  }
}

class _TrainingTopBar extends StatelessWidget {
  final ChessState chessState;
  final EngineState engineState;
  final VoidCallback onNewGame;

  const _TrainingTopBar({
    required this.chessState,
    required this.engineState,
    required this.onNewGame,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: Row(
        children: [
          if (chessState.training.gamePhase != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                chessState.training.gamePhase!.name[0].toUpperCase() +
                    chessState.training.gamePhase!.name.substring(1),
                style: const TextStyle(
                  color: AppColors.primary,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          const SizedBox(width: 8),
          Text(
            chessState.playerColor == Side.w ? 'White' : 'Black',
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 12,
            ),
          ),
          const Spacer(),
          if (engineState.isThinking)
            const SizedBox(
              width: 14,
              height: 14,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: AppColors.primary,
              ),
            ),
          const SizedBox(width: 8),
          if (chessState.lifecycle == GameLifecycle.ended)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.surfaceCard,
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                chessState.gameOverReason?.name ?? 'Ended',
                style: const TextStyle(
                  color: AppColors.textMuted,
                  fontSize: 12,
                ),
              ),
            ),
        ],
      ),
    );
  }
}
