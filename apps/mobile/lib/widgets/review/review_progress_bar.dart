import 'package:flutter/material.dart';

import '../../controllers/review_game_controller.dart';
import '../../services/review/game_review_service.dart';
import '../../theme/app_colors.dart';

class ReviewProgressBarWidget extends StatelessWidget {
  final ReviewPhase phase;
  final ReviewProgress? progress;

  const ReviewProgressBarWidget({
    super.key,
    required this.phase,
    this.progress,
  });

  @override
  Widget build(BuildContext context) {
    if (phase != ReviewPhase.analyzing) return const SizedBox.shrink();

    final percent = progress?.percentComplete ?? 0;
    final isInitializing = progress == null;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (isInitializing)
            const Text(
              'Initializing analysis...',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
            )
          else
            Row(
              children: [
                Text(
                  'Analyzing move ${progress!.currentMove} of ${progress!.totalMoves}',
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 12,
                  ),
                ),
                const Spacer(),
                Text(
                  '$percent%',
                  style: const TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          const SizedBox(height: 4),
          ClipRRect(
            borderRadius: BorderRadius.circular(3),
            child: LinearProgressIndicator(
              value: isInitializing ? null : percent / 100,
              backgroundColor: AppColors.surfaceCard,
              color: AppColors.primary,
              minHeight: 4,
            ),
          ),
        ],
      ),
    );
  }
}
