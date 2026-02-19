import 'package:flutter/painting.dart';

import 'game_types.dart';

enum MoveQuality { best, excellent, good, inaccuracy, mistake, blunder }

class QualityThresholds {
  static const int excellent = 20;
  static const int good = 50;
  static const int inaccuracy = 100;
  static const int mistake = 200;
}

const Map<MoveQuality, Color> qualityColors = {
  MoveQuality.best: Color(0xFF22C55E),
  MoveQuality.excellent: Color(0xFF4ADE80),
  MoveQuality.good: Color(0xFFA3E635),
  MoveQuality.inaccuracy: Color(0xFFFACC15),
  MoveQuality.mistake: Color(0xFFF97316),
  MoveQuality.blunder: Color(0xFFEF4444),
};

MoveQuality? classifyMoveQuality(double? cpLoss) {
  if (cpLoss == null) return null;
  if (cpLoss <= 0) return MoveQuality.best;
  if (cpLoss <= QualityThresholds.excellent) return MoveQuality.excellent;
  if (cpLoss <= QualityThresholds.good) return MoveQuality.good;
  if (cpLoss <= QualityThresholds.inaccuracy) return MoveQuality.inaccuracy;
  if (cpLoss <= QualityThresholds.mistake) return MoveQuality.mistake;
  return MoveQuality.blunder;
}

class MoveEvaluation {
  final int moveIndex;
  final String san;
  final double? evalBefore;
  final double? evalAfter;
  final double? cpLoss;
  final MoveQuality? quality;
  final bool isPlayerMove;
  final Side side;

  const MoveEvaluation({
    required this.moveIndex,
    required this.san,
    this.evalBefore,
    this.evalAfter,
    this.cpLoss,
    this.quality,
    required this.isPlayerMove,
    required this.side,
  });
}
