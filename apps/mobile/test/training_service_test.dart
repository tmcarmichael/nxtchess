import 'package:flutter_test/flutter_test.dart';
import 'package:nxtchess/models/game_types.dart';
import 'package:nxtchess/services/training/training_service.dart';

void main() {
  group('getMoveThreshold', () {
    test('endgame returns 40', () {
      expect(getMoveThreshold(GamePhase.endgame), 40);
    });

    test('opening returns 20', () {
      expect(getMoveThreshold(GamePhase.opening), 20);
    });

    test('middlegame returns 20', () {
      expect(getMoveThreshold(GamePhase.middlegame), 20);
    });
  });

  group('shouldTerminate', () {
    test('returns true on checkmate', () {
      expect(
        shouldTerminate(
          phase: GamePhase.opening,
          halfMoveCount: 1,
          isCheckmate: true,
          isStalemate: false,
          isDraw: false,
        ),
        isTrue,
      );
    });

    test('returns true on stalemate', () {
      expect(
        shouldTerminate(
          phase: GamePhase.opening,
          halfMoveCount: 1,
          isCheckmate: false,
          isStalemate: true,
          isDraw: false,
        ),
        isTrue,
      );
    });

    test('returns true on draw', () {
      expect(
        shouldTerminate(
          phase: GamePhase.opening,
          halfMoveCount: 1,
          isCheckmate: false,
          isStalemate: false,
          isDraw: true,
        ),
        isTrue,
      );
    });

    test('returns true when move threshold reached', () {
      expect(
        shouldTerminate(
          phase: GamePhase.opening,
          halfMoveCount: 20,
          isCheckmate: false,
          isStalemate: false,
          isDraw: false,
        ),
        isTrue,
      );
    });

    test('returns false below threshold', () {
      expect(
        shouldTerminate(
          phase: GamePhase.opening,
          halfMoveCount: 19,
          isCheckmate: false,
          isStalemate: false,
          isDraw: false,
        ),
        isFalse,
      );
    });

    test('endgame uses 40 move threshold', () {
      expect(
        shouldTerminate(
          phase: GamePhase.endgame,
          halfMoveCount: 39,
          isCheckmate: false,
          isStalemate: false,
          isDraw: false,
        ),
        isFalse,
      );
      expect(
        shouldTerminate(
          phase: GamePhase.endgame,
          halfMoveCount: 40,
          isCheckmate: false,
          isStalemate: false,
          isDraw: false,
        ),
        isTrue,
      );
    });
  });

  group('getTerminationReason', () {
    test('returns checkmate', () {
      expect(
        getTerminationReason(
          phase: GamePhase.opening,
          halfMoveCount: 5,
          isCheckmate: true,
          isStalemate: false,
          isDraw: false,
        ),
        TrainingEndReason.checkmate,
      );
    });

    test('returns stalemate', () {
      expect(
        getTerminationReason(
          phase: GamePhase.opening,
          halfMoveCount: 5,
          isCheckmate: false,
          isStalemate: true,
          isDraw: false,
        ),
        TrainingEndReason.stalemate,
      );
    });

    test('returns draw', () {
      expect(
        getTerminationReason(
          phase: GamePhase.opening,
          halfMoveCount: 5,
          isCheckmate: false,
          isStalemate: false,
          isDraw: true,
        ),
        TrainingEndReason.draw,
      );
    });

    test('returns moveLimit at threshold', () {
      expect(
        getTerminationReason(
          phase: GamePhase.opening,
          halfMoveCount: 20,
          isCheckmate: false,
          isStalemate: false,
          isDraw: false,
        ),
        TrainingEndReason.moveLimit,
      );
    });

    test('returns null below threshold with no terminal condition', () {
      expect(
        getTerminationReason(
          phase: GamePhase.opening,
          halfMoveCount: 10,
          isCheckmate: false,
          isStalemate: false,
          isDraw: false,
        ),
        isNull,
      );
    });

    test('checkmate takes priority over move limit', () {
      expect(
        getTerminationReason(
          phase: GamePhase.opening,
          halfMoveCount: 25,
          isCheckmate: true,
          isStalemate: false,
          isDraw: false,
        ),
        TrainingEndReason.checkmate,
      );
    });
  });

  group('normalizeEval', () {
    test('white side returns eval unchanged', () {
      expect(normalizeEval(150.0, Side.w), 150.0);
    });

    test('black side returns negated eval', () {
      expect(normalizeEval(150.0, Side.b), -150.0);
    });

    test('negative eval for black becomes positive', () {
      expect(normalizeEval(-200.0, Side.b), 200.0);
    });

    test('zero stays zero for both sides', () {
      expect(normalizeEval(0.0, Side.w), 0.0);
      expect(normalizeEval(0.0, Side.b), 0.0);
    });
  });

  group('formatEval', () {
    test('positive eval shows plus sign', () {
      expect(formatEval(150.0), '+1.50');
    });

    test('negative eval shows minus sign', () {
      expect(formatEval(-200.0), '-2.00');
    });

    test('zero shows +0.00', () {
      expect(formatEval(0.0), '+0.00');
    });

    test('mate positive shows M+', () {
      expect(formatEval(9950.0), 'M+');
    });

    test('mate negative shows M-', () {
      expect(formatEval(-9950.0), 'M-');
    });
  });

  group('calculateEvalDifferentialScore', () {
    test('checkmate win returns positive score', () {
      final result = calculateEvalDifferentialScore(
        startEval: 100.0,
        finalEval: 500.0,
        playerSide: Side.w,
        endReason: TrainingEndReason.checkmate,
        playerWon: true,
      );
      expect(result.isPositive, isTrue);
      expect(result.displayScore, 'Checkmate!');
    });

    test('checkmate loss returns negative score', () {
      final result = calculateEvalDifferentialScore(
        startEval: 100.0,
        finalEval: -500.0,
        playerSide: Side.w,
        endReason: TrainingEndReason.checkmate,
        playerWon: false,
      );
      expect(result.isPositive, isFalse);
      expect(result.displayScore, 'Checkmated');
    });

    test('stalemate returns draw', () {
      final result = calculateEvalDifferentialScore(
        startEval: 500.0,
        finalEval: 0.0,
        playerSide: Side.w,
        endReason: TrainingEndReason.stalemate,
        playerWon: null,
      );
      expect(result.score, 0);
      expect(result.displayScore, 'Draw');
    });

    test('null finalEval returns dash', () {
      final result = calculateEvalDifferentialScore(
        startEval: 100.0,
        finalEval: null,
        playerSide: Side.w,
        endReason: TrainingEndReason.moveLimit,
        playerWon: null,
      );
      expect(result.displayScore, '-');
    });

    test('improved position shows positive centipawns', () {
      final result = calculateEvalDifferentialScore(
        startEval: 0.0,
        finalEval: 200.0,
        playerSide: Side.w,
        endReason: TrainingEndReason.moveLimit,
        playerWon: null,
      );
      expect(result.isPositive, isTrue);
      expect(result.score, 200.0);
    });

    test('worsened position shows negative centipawns', () {
      final result = calculateEvalDifferentialScore(
        startEval: 0.0,
        finalEval: -300.0,
        playerSide: Side.w,
        endReason: TrainingEndReason.moveLimit,
        playerWon: null,
      );
      expect(result.isPositive, isFalse);
      expect(result.score, -300.0);
    });

    test('black perspective normalizes eval correctly', () {
      final result = calculateEvalDifferentialScore(
        startEval: -100.0,
        finalEval: -300.0,
        playerSide: Side.b,
        endReason: TrainingEndReason.moveLimit,
        playerWon: null,
      );
      // For black: normalizeEval(-100, b) = 100, normalizeEval(-300, b) = 300
      // diff = 300 - 100 = 200 (positive — black improved)
      expect(result.isPositive, isTrue);
      expect(result.score, 200.0);
    });
  });
}
