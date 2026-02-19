import 'dart:math';

import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

import '../../models/game_types.dart';
import '../../services/review/game_review_service.dart';
import '../../theme/app_colors.dart';

class ReviewEvalGraph extends StatelessWidget {
  final List<EvalPoint> evalHistory;
  final int currentMoveIndex;
  final void Function(int) onJumpToMove;

  const ReviewEvalGraph({
    super.key,
    required this.evalHistory,
    required this.currentMoveIndex,
    required this.onJumpToMove,
  });

  static const _evalClamp = 5.0;

  @override
  Widget build(BuildContext context) {
    if (evalHistory.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          child: Row(
            children: [
              const Text(
                'Evaluation',
                style: TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const Spacer(),
              Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: AppColors.textSecondary,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 3),
              const Text(
                'W',
                style: TextStyle(color: AppColors.textMuted, fontSize: 10),
              ),
              const SizedBox(width: 6),
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  color: AppColors.textMuted.withValues(alpha: 0.5),
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 3),
              const Text(
                'B',
                style: TextStyle(color: AppColors.textMuted, fontSize: 10),
              ),
            ],
          ),
        ),
        SizedBox(
          height: 120,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: BarChart(
              BarChartData(
                alignment: BarChartAlignment.spaceEvenly,
                maxY: _evalClamp,
                minY: -_evalClamp,
                barTouchData: BarTouchData(
                  enabled: true,
                  touchCallback: (event, response) {
                    if (event is FlTapUpEvent && response?.spot != null) {
                      final idx = response!.spot!.touchedBarGroupIndex;
                      if (idx >= 0 && idx < evalHistory.length) {
                        onJumpToMove(evalHistory[idx].moveIndex);
                      }
                    }
                  },
                ),
                titlesData: const FlTitlesData(show: false),
                borderData: FlBorderData(show: false),
                gridData: FlGridData(
                  drawVerticalLine: false,
                  horizontalInterval: _evalClamp,
                  getDrawingHorizontalLine: (value) => FlLine(
                    color: AppColors.surfaceCard,
                    strokeWidth: value == 0 ? 1 : 0.5,
                  ),
                ),
                barGroups: List.generate(evalHistory.length, (i) {
                  final point = evalHistory[i];
                  final eval = point.evalAfter ?? 0;
                  final clamped = eval.clamp(-_evalClamp, _evalClamp);
                  final isCurrent = point.moveIndex == currentMoveIndex;
                  final isWhiteMove = point.side == Side.w;

                  return BarChartGroupData(
                    x: i,
                    barRods: [
                      BarChartRodData(
                        toY: clamped,
                        fromY: 0,
                        color: isWhiteMove
                            ? (isCurrent
                                  ? AppColors.textPrimary
                                  : AppColors.textSecondary)
                            : (isCurrent
                                  ? AppColors.textMuted
                                  : AppColors.textMuted.withValues(alpha: 0.5)),
                        width: max(
                          2,
                          (MediaQuery.of(context).size.width - 40) /
                                  evalHistory.length -
                              1,
                        ),
                        borderRadius: BorderRadius.circular(1),
                      ),
                    ],
                  );
                }),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
