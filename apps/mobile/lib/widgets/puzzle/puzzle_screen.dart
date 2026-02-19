import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../controllers/puzzle_game_controller.dart';
import '../../models/game_types.dart';
import '../../providers/chess/chess_provider.dart';
import '../../services/puzzle/puzzle_data.dart';
import '../../theme/app_colors.dart';
import '../chess/chess_board_widget.dart';
import 'puzzle_feedback_dialog.dart';
import 'puzzle_setup_sheet.dart';

class PuzzleScreen extends ConsumerStatefulWidget {
  final PuzzleCategory? quickStartCategory;
  final bool? quickStartRated;

  const PuzzleScreen({
    super.key,
    this.quickStartCategory,
    this.quickStartRated,
  });

  @override
  ConsumerState<PuzzleScreen> createState() => _PuzzleScreenState();
}

class _PuzzleScreenState extends ConsumerState<PuzzleScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (widget.quickStartCategory != null) {
        _startPuzzle(
          category: widget.quickStartCategory!,
          rated: widget.quickStartRated ?? false,
        );
      } else {
        final state = ref.read(chessProvider);
        if (state.lifecycle == GameLifecycle.idle) {
          _showSetupSheet();
        }
      }
    });
  }

  void _showSetupSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surfaceDark,
      builder: (_) => PuzzleSetupSheet(onStart: _startPuzzle),
    );
  }

  void _startPuzzle({required PuzzleCategory category, required bool rated}) {
    ref
        .read(puzzleGameControllerProvider)
        .startNewGame(category: category, rated: rated);
  }

  @override
  Widget build(BuildContext context) {
    final chessState = ref.watch(chessProvider);
    final controller = ref.read(puzzleGameControllerProvider);
    final screenWidth = MediaQuery.of(context).size.width;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Puzzles'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            tooltip: 'Settings',
            onPressed: _showSetupSheet,
          ),
        ],
      ),
      body: _buildBody(chessState, controller, screenWidth),
    );
  }

  Widget _buildBody(
    ChessState chessState,
    PuzzleGameController controller,
    double screenWidth,
  ) {
    if (chessState.lifecycle == GameLifecycle.idle) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.extension, size: 64, color: AppColors.primary),
            const SizedBox(height: 16),
            const Text(
              'Puzzles',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Solve mate-in-N tactics',
              style: TextStyle(color: AppColors.textSecondary),
            ),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: _showSetupSheet,
              icon: const Icon(Icons.play_arrow),
              label: const Text('Start Puzzles'),
              style: FilledButton.styleFrom(backgroundColor: AppColors.primary),
            ),
          ],
        ),
      );
    }

    if (chessState.lifecycle == GameLifecycle.initializing) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(color: AppColors.primary),
            SizedBox(height: 16),
            Text(
              'Loading puzzle...',
              style: TextStyle(color: AppColors.textSecondary),
            ),
          ],
        ),
      );
    }

    if (chessState.lifecycle == GameLifecycle.error) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 48, color: AppColors.error),
            const SizedBox(height: 16),
            Text(
              chessState.initError ?? 'Failed to load puzzle',
              style: const TextStyle(color: AppColors.textSecondary),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: _showSetupSheet,
              child: const Text('Try Again'),
            ),
          ],
        ),
      );
    }

    return Column(
      children: [
        _PuzzleInfoBar(
          category: chessState.puzzle.category,
          rated: chessState.puzzle.rated,
          puzzleId: controller.currentPuzzle?.id,
        ),

        ChessBoardWidget(
          size: screenWidth,
          onMove: controller.onMove,
          interactive:
              chessState.lifecycle == GameLifecycle.playing &&
              chessState.puzzle.feedback == null,
        ),

        Expanded(
          child: chessState.puzzle.feedback != null
              ? Center(
                  child: PuzzleFeedbackDialog(
                    feedback: chessState.puzzle.feedback!,
                    ratingChange: chessState.puzzle.ratingChange,
                    isGameOver: chessState.isGameOver,
                    onNextPuzzle: controller.loadNextPuzzle,
                    onTryAgain: !chessState.isGameOver
                        ? controller.dismissFeedback
                        : null,
                    onDismiss: controller.dismissFeedback,
                  ),
                )
              : _PuzzleHistoryStrip(
                  history: ref.watch(puzzleHistoryProvider).get(),
                ),
        ),

        _PuzzleControls(
          onNext: controller.loadNextPuzzle,
          showNext: chessState.isGameOver && chessState.puzzle.feedback == null,
        ),
      ],
    );
  }
}

class _PuzzleInfoBar extends StatelessWidget {
  final PuzzleCategory? category;
  final bool rated;
  final String? puzzleId;

  const _PuzzleInfoBar({this.category, required this.rated, this.puzzleId});

  static const _categoryLabels = {
    PuzzleCategory.mateIn1: 'Mate in 1',
    PuzzleCategory.mateIn2: 'Mate in 2',
    PuzzleCategory.mateIn3: 'Mate in 3',
    PuzzleCategory.random: 'Random',
  };

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              _categoryLabels[category] ?? 'Puzzle',
              style: const TextStyle(
                color: AppColors.primary,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(width: 8),
          if (rated)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: AppColors.warning.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(4),
              ),
              child: const Text(
                'Rated',
                style: TextStyle(
                  color: AppColors.warning,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          const Spacer(),
          if (puzzleId != null)
            Text(
              puzzleId!,
              style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
            ),
        ],
      ),
    );
  }
}

class _PuzzleHistoryStrip extends StatelessWidget {
  final List<PuzzleAttempt> history;

  const _PuzzleHistoryStrip({required this.history});

  @override
  Widget build(BuildContext context) {
    if (history.isEmpty) {
      return const Center(
        child: Text(
          'Find the best move!',
          style: TextStyle(color: AppColors.textMuted, fontSize: 14),
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Recent',
            style: TextStyle(
              color: AppColors.textSecondary,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 4),
          Expanded(
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: history.length,
              itemBuilder: (_, i) {
                final attempt = history[i];
                final passed = attempt.result == PuzzleResult.pass;
                return Container(
                  margin: const EdgeInsets.only(right: 6),
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: passed
                        ? AppColors.success.withValues(alpha: 0.2)
                        : AppColors.error.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Icon(
                    passed ? Icons.check : Icons.close,
                    size: 16,
                    color: passed ? AppColors.success : AppColors.error,
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _PuzzleControls extends StatelessWidget {
  final VoidCallback onNext;
  final bool showNext;

  const _PuzzleControls({required this.onNext, required this.showNext});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: AppColors.surfaceCard)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (showNext)
            FilledButton.icon(
              onPressed: onNext,
              icon: const Icon(Icons.skip_next, size: 20),
              label: const Text('Next Puzzle'),
              style: FilledButton.styleFrom(backgroundColor: AppColors.primary),
            ),
        ],
      ),
    );
  }
}
