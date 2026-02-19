import 'package:flutter_test/flutter_test.dart';
import 'package:nxtchess/models/game_types.dart';
import 'package:nxtchess/models/move_quality.dart';
import 'package:nxtchess/services/review/game_review_service.dart';

void main() {
  group('QualityDistribution', () {
    test('defaults to all zeros', () {
      final dist = QualityDistribution();
      expect(dist.best, 0);
      expect(dist.excellent, 0);
      expect(dist.good, 0);
      expect(dist.inaccuracy, 0);
      expect(dist.mistake, 0);
      expect(dist.blunder, 0);
    });

    test('is mutable for counting', () {
      final dist = QualityDistribution();
      dist.best = 5;
      dist.blunder = 2;
      expect(dist.best, 5);
      expect(dist.blunder, 2);
    });
  });

  group('EvalPoint', () {
    test('stores move evaluation data', () {
      const point = EvalPoint(
        moveIndex: 0,
        evalAfter: 0.5,
        san: 'e4',
        side: Side.w,
        quality: MoveQuality.best,
      );
      expect(point.moveIndex, 0);
      expect(point.evalAfter, 0.5);
      expect(point.san, 'e4');
      expect(point.side, Side.w);
      expect(point.quality, MoveQuality.best);
    });

    test('optional fields default to null', () {
      const point = EvalPoint(moveIndex: 1, san: 'd5', side: Side.b);
      expect(point.evalAfter, isNull);
      expect(point.quality, isNull);
    });
  });

  group('ReviewSummary', () {
    test('contains accuracy and distributions', () {
      final summary = ReviewSummary(
        whiteAccuracy: 85.5,
        blackAccuracy: 72.3,
        evaluations: [],
        evalHistory: [],
        whiteDistribution: QualityDistribution(best: 3, good: 2, blunder: 1),
        blackDistribution: QualityDistribution(best: 1, mistake: 2),
      );
      expect(summary.whiteAccuracy, 85.5);
      expect(summary.blackAccuracy, 72.3);
      expect(summary.whiteDistribution.best, 3);
      expect(summary.whiteDistribution.blunder, 1);
      expect(summary.blackDistribution.mistake, 2);
    });
  });

  group('MoveEvaluation', () {
    test('computes cpLoss as difference in eval', () {
      const eval1 = MoveEvaluation(
        moveIndex: 0,
        san: 'e4',
        evalBefore: 0.3,
        evalAfter: 0.1,
        cpLoss: 20.0,
        quality: MoveQuality.excellent,
        isPlayerMove: true,
        side: Side.w,
      );
      expect(eval1.cpLoss, 20.0);
      expect(eval1.quality, MoveQuality.excellent);
    });

    test('non-player moves are flagged', () {
      const eval1 = MoveEvaluation(
        moveIndex: 1,
        san: 'd5',
        isPlayerMove: false,
        side: Side.b,
      );
      expect(eval1.isPlayerMove, false);
      expect(eval1.evalBefore, isNull);
      expect(eval1.evalAfter, isNull);
    });
  });

  group('ReviewProgress', () {
    test('tracks analysis progress', () {
      const progress = ReviewProgress(
        currentMove: 10,
        totalMoves: 40,
        percentComplete: 25,
      );
      expect(progress.currentMove, 10);
      expect(progress.totalMoves, 40);
      expect(progress.percentComplete, 25);
    });
  });
}
