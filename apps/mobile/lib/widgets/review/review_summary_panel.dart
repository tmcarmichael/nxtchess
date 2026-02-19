import 'dart:math';

import 'package:flutter/material.dart';

import '../../models/move_quality.dart';
import '../../services/review/game_review_service.dart';
import '../../theme/app_colors.dart';

class ReviewSummaryPanel extends StatelessWidget {
  final ReviewSummary? summary;

  const ReviewSummaryPanel({super.key, this.summary});

  static const _qualityOrder = [
    MoveQuality.best,
    MoveQuality.excellent,
    MoveQuality.good,
    MoveQuality.inaccuracy,
    MoveQuality.mistake,
    MoveQuality.blunder,
  ];

  static const _qualityLabels = {
    MoveQuality.best: 'Best',
    MoveQuality.excellent: 'Excellent',
    MoveQuality.good: 'Good',
    MoveQuality.inaccuracy: 'Inaccuracy',
    MoveQuality.mistake: 'Mistake',
    MoveQuality.blunder: 'Blunder',
  };

  @override
  Widget build(BuildContext context) {
    if (summary == null) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Accuracy',
            style: TextStyle(
              color: AppColors.textSecondary,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _AccuracyRing(
                accuracy: summary!.whiteAccuracy,
                label: 'White',
                color: Colors.white,
              ),
              _AccuracyRing(
                accuracy: summary!.blackAccuracy,
                label: 'Black',
                color: AppColors.textMuted,
              ),
            ],
          ),
          const SizedBox(height: 16),

          const Text(
            'Move Quality',
            style: TextStyle(
              color: AppColors.textSecondary,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),

          _QualityBar(label: 'White', distribution: summary!.whiteDistribution),
          const SizedBox(height: 4),
          _QualityBar(label: 'Black', distribution: summary!.blackDistribution),
          const SizedBox(height: 8),

          Wrap(
            spacing: 12,
            runSpacing: 4,
            children: _qualityOrder.map((q) {
              return Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: qualityColors[q],
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 3),
                  Text(
                    _qualityLabels[q]!,
                    style: const TextStyle(
                      color: AppColors.textMuted,
                      fontSize: 10,
                    ),
                  ),
                ],
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}

class _AccuracyRing extends StatelessWidget {
  final double accuracy;
  final String label;
  final Color color;

  const _AccuracyRing({
    required this.accuracy,
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: '$label accuracy: ${accuracy.toStringAsFixed(1)} percent',
      child: Column(
        children: [
          SizedBox(
            width: 64,
            height: 64,
            child: CustomPaint(
              painter: _RingPainter(progress: accuracy / 100, color: color),
              child: Center(
                child: Text(
                  '${accuracy.toStringAsFixed(1)}%',
                  style: const TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
          ),
        ],
      ),
    );
  }
}

class _RingPainter extends CustomPainter {
  final double progress;
  final Color color;

  _RingPainter({required this.progress, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 4;

    final trackPaint = Paint()
      ..color = AppColors.surfaceCard
      ..style = PaintingStyle.stroke
      ..strokeWidth = 4;
    canvas.drawCircle(center, radius, trackPaint);

    final fillPaint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 4
      ..strokeCap = StrokeCap.round;
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -pi / 2,
      2 * pi * progress,
      false,
      fillPaint,
    );
  }

  @override
  bool shouldRepaint(_RingPainter oldDelegate) =>
      oldDelegate.progress != progress || oldDelegate.color != color;
}

class _QualityBar extends StatelessWidget {
  final String label;
  final QualityDistribution distribution;

  const _QualityBar({required this.label, required this.distribution});

  @override
  Widget build(BuildContext context) {
    final counts = {
      MoveQuality.best: distribution.best,
      MoveQuality.excellent: distribution.excellent,
      MoveQuality.good: distribution.good,
      MoveQuality.inaccuracy: distribution.inaccuracy,
      MoveQuality.mistake: distribution.mistake,
      MoveQuality.blunder: distribution.blunder,
    };
    final total = counts.values.fold(0, (a, b) => a + b);
    if (total == 0) return const SizedBox.shrink();

    return Row(
      children: [
        SizedBox(
          width: 40,
          child: Text(
            label,
            style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
          ),
        ),
        Expanded(
          child: ClipRRect(
            borderRadius: BorderRadius.circular(3),
            child: SizedBox(
              height: 12,
              child: Row(
                children: ReviewSummaryPanel._qualityOrder
                    .where((q) => counts[q]! > 0)
                    .map((q) {
                      return Expanded(
                        flex: counts[q]!,
                        child: Container(color: qualityColors[q]),
                      );
                    })
                    .toList(),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
