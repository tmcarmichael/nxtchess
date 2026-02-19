import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/game_types.dart';
import '../../providers/timer/timer_provider.dart';
import '../../theme/app_colors.dart';

class ChessClockWidget extends ConsumerWidget {
  final Side side;
  final bool isActive;

  const ChessClockWidget({
    super.key,
    required this.side,
    this.isActive = false,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final timeMs = ref.watch(
      timerProvider.select((s) => side == Side.w ? s.whiteTime : s.blackTime),
    );
    final isLow = timeMs < 30000;
    final isCritical = timeMs < 10000;

    final formattedTime = _formatTime(timeMs);
    final sideLabel = side == Side.w ? 'White' : 'Black';

    return Semantics(
      label:
          '$sideLabel clock: $formattedTime${isActive ? ', active' : ''}${isCritical ? ', low time' : ''}',
      liveRegion: isActive,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isActive
              ? (isCritical
                    ? AppColors.error.withValues(alpha: 0.2)
                    : AppColors.surfaceCard)
              : AppColors.surface,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isActive
                ? (isCritical ? AppColors.error : AppColors.primary)
                : AppColors.surfaceLight,
            width: isActive ? 2 : 1,
          ),
        ),
        child: Text(
          formattedTime,
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            fontFeatures: const [FontFeature.tabularFigures()],
            color: isCritical && isActive
                ? AppColors.error
                : (isLow && isActive
                      ? AppColors.warning
                      : AppColors.textPrimary),
          ),
        ),
      ),
    );
  }

  String _formatTime(int ms) {
    if (ms <= 0) return '0:00';
    final totalSeconds = (ms / 1000).ceil();
    final minutes = totalSeconds ~/ 60;
    final seconds = totalSeconds % 60;

    if (minutes >= 60) {
      final hours = minutes ~/ 60;
      final mins = minutes % 60;
      return '$hours:${mins.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
    }

    if (totalSeconds < 20) {
      final tenths = ((ms % 1000) ~/ 100);
      return '$minutes:${seconds.toString().padLeft(2, '0')}.$tenths';
    }

    return '$minutes:${seconds.toString().padLeft(2, '0')}';
  }
}
