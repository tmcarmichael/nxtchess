import 'package:flutter/material.dart';

import '../../providers/chess/chess_state.dart';
import '../../theme/app_colors.dart';

class PuzzleFeedbackDialog extends StatelessWidget {
  final PuzzleFeedback feedback;
  final RatingChange? ratingChange;
  final bool isGameOver;
  final VoidCallback onNextPuzzle;
  final VoidCallback? onTryAgain;
  final VoidCallback onDismiss;

  const PuzzleFeedbackDialog({
    super.key,
    required this.feedback,
    this.ratingChange,
    required this.isGameOver,
    required this.onNextPuzzle,
    this.onTryAgain,
    required this.onDismiss,
  });

  @override
  Widget build(BuildContext context) {
    final isCorrect = feedback.correct;

    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surfaceCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isCorrect
              ? AppColors.success.withValues(alpha: 0.3)
              : AppColors.error.withValues(alpha: 0.3),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            isCorrect ? Icons.check_circle : Icons.cancel,
            color: isCorrect ? AppColors.success : AppColors.error,
            size: 48,
          ),
          const SizedBox(height: 12),
          Text(
            feedback.message,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: isCorrect ? AppColors.success : AppColors.error,
            ),
          ),
          if (ratingChange != null) ...[
            const SizedBox(height: 8),
            Text(
              '${ratingChange!.delta >= 0 ? '+' : ''}${ratingChange!.delta} (${ratingChange!.newRating})',
              style: TextStyle(
                fontSize: 14,
                color: ratingChange!.delta >= 0
                    ? AppColors.success
                    : AppColors.error,
              ),
            ),
          ],
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (!isCorrect && !isGameOver && onTryAgain != null)
                TextButton(
                  onPressed: () {
                    onDismiss();
                    onTryAgain!();
                  },
                  child: const Text('Try Again'),
                ),
              const SizedBox(width: 8),
              FilledButton(
                onPressed: onNextPuzzle,
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.primary,
                ),
                child: const Text('Next Puzzle'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
