import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../controllers/review_game_controller.dart';
import '../../models/game_types.dart';
import '../../providers/chess/chess_provider.dart';
import '../../services/review/game_review_service.dart';
import '../chess/chess_board_widget.dart';
import '../game/move_history_widget.dart';
import '../game/move_navigation_bar.dart';
import 'review_eval_graph.dart';
import 'review_progress_bar.dart';
import 'review_summary_panel.dart';

class ReviewScreen extends ConsumerStatefulWidget {
  final String? pgn;
  final Side? playerColor;

  const ReviewScreen({super.key, this.pgn, this.playerColor});

  @override
  ConsumerState<ReviewScreen> createState() => _ReviewScreenState();
}

class _ReviewScreenState extends ConsumerState<ReviewScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final controller = ref.read(reviewGameControllerProvider);

      if (widget.pgn != null) {
        final success = controller.loadPgnAndStartReview(
          widget.pgn!,
          widget.playerColor ?? Side.w,
        );
        if (!success && mounted) {
          Navigator.of(context).pop();
        }
      }
    });
  }

  void _exitReview() {
    ref.read(reviewGameControllerProvider).exitReview();
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final chessState = ref.watch(chessProvider);
    final reviewState = ref.watch(reviewStateProvider);
    final controller = ref.read(reviewGameControllerProvider);
    final screenWidth = MediaQuery.of(context).size.width;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Game Review'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: _exitReview,
        ),
      ),
      body: Column(
        children: [
          ReviewProgressBarWidget(
            phase: reviewState.phase,
            progress: reviewState.progress,
          ),

          ChessBoardWidget(size: screenWidth, interactive: false),

          Expanded(
            child: reviewState.phase == ReviewPhase.complete
                ? _ReviewCompleteContent(
                    summary: reviewState.summary,
                    currentMoveIndex: chessState.viewMoveIndex,
                    onJumpToMove: (i) =>
                        ref.read(chessProvider.notifier).jumpToMoveIndex(i),
                  )
                : MoveHistoryWidget(
                    moves: chessState.moveHistory,
                    viewIndex: chessState.viewMoveIndex,
                    moveQualities: {
                      for (final e in reviewState.evaluations)
                        if (e.quality != null) e.moveIndex: e.quality!,
                    },
                    onTapMove: (i) =>
                        ref.read(chessProvider.notifier).jumpToMoveIndex(i),
                    emptyMessage: 'Analyzing game...',
                  ),
          ),

          MoveNavigationBar(
            onBack: controller.onNavigateBackward,
            onForward: controller.onNavigateForward,
            onStart: controller.onNavigateToStart,
            onEnd: controller.onNavigateToEnd,
          ),
        ],
      ),
    );
  }
}

class _ReviewCompleteContent extends StatelessWidget {
  final ReviewSummary? summary;
  final int currentMoveIndex;
  final void Function(int) onJumpToMove;

  const _ReviewCompleteContent({
    this.summary,
    required this.currentMoveIndex,
    required this.onJumpToMove,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        children: [
          ReviewSummaryPanel(summary: summary),
          if (summary != null)
            ReviewEvalGraph(
              evalHistory: summary!.evalHistory,
              currentMoveIndex: currentMoveIndex,
              onJumpToMove: onJumpToMove,
            ),
        ],
      ),
    );
  }
}
