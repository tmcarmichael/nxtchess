import 'package:flutter/material.dart';

import '../../theme/app_colors.dart';

class ChessEvalBar extends StatelessWidget {
  final double eval;
  final bool isVertical;

  const ChessEvalBar({super.key, required this.eval, this.isVertical = true});

  @override
  Widget build(BuildContext context) {
    final clampedEval = eval.clamp(-10.0, 10.0);
    final whiteProportion = 0.5 + (clampedEval / 20.0);
    final clamped = whiteProportion.clamp(0.05, 0.95);

    final evalText = _formatEval(eval);
    final advantage = eval > 0.3
        ? 'White advantage'
        : eval < -0.3
        ? 'Black advantage'
        : 'Equal position';

    return Semantics(
      label: 'Evaluation: $evalText, $advantage',
      child: _buildBar(clamped, evalText),
    );
  }

  Widget _buildBar(double clamped, String evalText) {
    if (isVertical) {
      return SizedBox(
        width: 24,
        child: Column(
          children: [
            Expanded(
              flex: ((1.0 - clamped) * 1000).round(),
              child: Container(
                decoration: const BoxDecoration(
                  color: AppColors.surfaceDark,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(4)),
                ),
                alignment: Alignment.center,
                child: eval < -0.3
                    ? RotatedBox(
                        quarterTurns: 3,
                        child: Text(
                          evalText,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      )
                    : null,
              ),
            ),
            Expanded(
              flex: (clamped * 1000).round(),
              child: Container(
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.vertical(
                    bottom: Radius.circular(4),
                  ),
                ),
                alignment: Alignment.center,
                child: eval >= -0.3
                    ? RotatedBox(
                        quarterTurns: 3,
                        child: Text(
                          evalText,
                          style: const TextStyle(
                            color: Colors.black,
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      )
                    : null,
              ),
            ),
          ],
        ),
      );
    }

    return SizedBox(
      height: 20,
      child: Row(
        children: [
          Expanded(
            flex: (clamped * 1000).round(),
            child: Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.horizontal(left: Radius.circular(4)),
              ),
              alignment: Alignment.center,
              child: eval >= -0.3
                  ? Text(
                      evalText,
                      style: const TextStyle(
                        color: Colors.black,
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                      ),
                    )
                  : null,
            ),
          ),
          Expanded(
            flex: ((1.0 - clamped) * 1000).round(),
            child: Container(
              decoration: const BoxDecoration(
                color: AppColors.surfaceDark,
                borderRadius: BorderRadius.horizontal(
                  right: Radius.circular(4),
                ),
              ),
              alignment: Alignment.center,
              child: eval < -0.3
                  ? Text(
                      evalText,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                      ),
                    )
                  : null,
            ),
          ),
        ],
      ),
    );
  }

  String _formatEval(double eval) {
    if (eval.abs() >= 99) {
      final mateIn = (100 - eval.abs()).round().abs();
      return eval > 0 ? 'M$mateIn' : '-M$mateIn';
    }
    final sign = eval >= 0 ? '+' : '';
    return '$sign${eval.toStringAsFixed(1)}';
  }
}
