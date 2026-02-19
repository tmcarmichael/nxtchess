import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/game_types.dart';
import '../../providers/chess/chess_provider.dart';
import '../../theme/app_colors.dart';

class EndDialog extends ConsumerWidget {
  final VoidCallback onNewGame;
  final VoidCallback onExit;
  final VoidCallback? onReview;

  const EndDialog({
    super.key,
    required this.onNewGame,
    required this.onExit,
    this.onReview,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final chessState = ref.watch(chessProvider);

    final title = _getTitle(chessState.gameWinner, chessState.playerColor);
    final subtitle = _getSubtitle(chessState.gameOverReason);

    return AlertDialog(
      backgroundColor: AppColors.surface,
      title: Text(
        title,
        style: const TextStyle(
          color: AppColors.textPrimary,
          fontSize: 24,
          fontWeight: FontWeight.bold,
        ),
        textAlign: TextAlign.center,
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            subtitle,
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 16,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          if (onReview != null)
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: onReview,
                icon: const Icon(Icons.analytics),
                label: const Text('Review Game'),
              ),
            ),
          const SizedBox(height: 8),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: onNewGame,
              icon: const Icon(Icons.refresh),
              label: const Text('New Game'),
            ),
          ),
          const SizedBox(height: 8),
          SizedBox(
            width: double.infinity,
            child: TextButton(onPressed: onExit, child: const Text('Exit')),
          ),
        ],
      ),
    );
  }

  String _getTitle(GameWinner? winner, Side playerColor) {
    if (winner == null) return 'Game Over';
    if (winner == GameWinner.draw) return 'Draw';
    final playerWon =
        (winner == GameWinner.w && playerColor == Side.w) ||
        (winner == GameWinner.b && playerColor == Side.b);
    return playerWon ? 'You Win!' : 'You Lose';
  }

  String _getSubtitle(GameOverReason? reason) {
    return switch (reason) {
      GameOverReason.checkmate => 'by checkmate',
      GameOverReason.stalemate => 'by stalemate',
      GameOverReason.time => 'on time',
      GameOverReason.resignation => 'by resignation',
      GameOverReason.disconnection => 'by disconnection',
      GameOverReason.abandonment => 'by abandonment',
      GameOverReason.insufficientMaterial => 'insufficient material',
      GameOverReason.threefoldRepetition => 'threefold repetition',
      GameOverReason.fiftyMoveRule => 'fifty-move rule',
      null => '',
    };
  }
}
