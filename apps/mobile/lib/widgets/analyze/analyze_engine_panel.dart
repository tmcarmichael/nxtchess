import 'package:flutter/material.dart';

import '../../services/engine/analysis_engine_service.dart';
import '../../theme/app_colors.dart';

class AnalyzeEnginePanelWidget extends StatelessWidget {
  final EngineAnalysis? analysis;
  final bool enabled;
  final bool isAnalyzing;
  final VoidCallback onToggle;
  final void Function(String uciMove)? onPlayMove;

  const AnalyzeEnginePanelWidget({
    super.key,
    this.analysis,
    required this.enabled,
    required this.isAnalyzing,
    required this.onToggle,
    this.onPlayMove,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfaceCard,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: Row(
              children: [
                const Icon(Icons.memory, size: 16, color: AppColors.primary),
                const SizedBox(width: 6),
                const Text(
                  'Stockfish',
                  style: TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                if (enabled && analysis != null) ...[
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 6,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      'D${analysis!.depth}',
                      style: const TextStyle(
                        color: AppColors.primary,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
                const Spacer(),
                GestureDetector(
                  onTap: onToggle,
                  child: Container(
                    width: 40,
                    height: 22,
                    decoration: BoxDecoration(
                      color: enabled
                          ? AppColors.primary
                          : AppColors.surfaceDark,
                      borderRadius: BorderRadius.circular(11),
                    ),
                    child: AnimatedAlign(
                      duration: const Duration(milliseconds: 200),
                      alignment: enabled
                          ? Alignment.centerRight
                          : Alignment.centerLeft,
                      child: Container(
                        width: 18,
                        height: 18,
                        margin: const EdgeInsets.symmetric(horizontal: 2),
                        decoration: const BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          if (enabled) ...[
            const Divider(height: 1, color: AppColors.surfaceDark),
            if (analysis != null && analysis!.lines.isNotEmpty)
              ...analysis!.lines.asMap().entries.map((entry) {
                final index = entry.key;
                final line = entry.value;
                return _LineTile(
                  index: index + 1,
                  line: line,
                  onTap: onPlayMove != null && line.pv.isNotEmpty
                      ? () => onPlayMove!(line.pv.first)
                      : null,
                );
              })
            else
              Padding(
                padding: const EdgeInsets.all(12),
                child: Text(
                  isAnalyzing ? 'Analyzing...' : 'Waiting for position...',
                  style: const TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 12,
                  ),
                ),
              ),
          ] else
            const Padding(
              padding: EdgeInsets.all(12),
              child: Text(
                'Engine analysis disabled',
                style: TextStyle(color: AppColors.textMuted, fontSize: 12),
              ),
            ),
        ],
      ),
    );
  }
}

class _LineTile extends StatelessWidget {
  final int index;
  final EngineLine line;
  final VoidCallback? onTap;

  const _LineTile({required this.index, required this.line, this.onTap});

  @override
  Widget build(BuildContext context) {
    final scoreText = _formatScore(line.score, line.mate);
    final scoreColor = _getScoreColor(line.score, line.mate);
    final moves = line.pvSan.isNotEmpty ? line.pvSan : line.pv;
    final movesText = moves.take(6).join(' ') + (moves.length > 6 ? '...' : '');

    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        child: Row(
          children: [
            SizedBox(
              width: 18,
              child: Text(
                '$index.',
                style: const TextStyle(
                  color: AppColors.textMuted,
                  fontSize: 11,
                ),
              ),
            ),
            Container(
              width: 52,
              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
              decoration: BoxDecoration(
                color: scoreColor.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(4),
              ),
              alignment: Alignment.center,
              child: Text(
                scoreText,
                style: TextStyle(
                  color: scoreColor,
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                movesText,
                style: const TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 12,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatScore(double score, int? mate) {
    if (mate != null) {
      return mate > 0 ? 'M$mate' : 'M${mate.abs()}';
    }
    final sign = score >= 0 ? '+' : '';
    return '$sign${score.toStringAsFixed(1)}';
  }

  Color _getScoreColor(double score, int? mate) {
    if (mate != null) {
      return mate > 0 ? AppColors.success : AppColors.error;
    }
    if (score > 0.5) return AppColors.success;
    if (score < -0.5) return AppColors.error;
    return AppColors.textMuted;
  }
}
