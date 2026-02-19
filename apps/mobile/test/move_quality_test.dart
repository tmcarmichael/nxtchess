import 'package:flutter_test/flutter_test.dart';
import 'package:nxtchess/models/move_quality.dart';

void main() {
  group('classifyMoveQuality', () {
    test('returns null for null input', () {
      expect(classifyMoveQuality(null), isNull);
    });

    test('returns best for 0 or negative cpLoss', () {
      expect(classifyMoveQuality(0), MoveQuality.best);
      expect(classifyMoveQuality(-5), MoveQuality.best);
    });

    test('returns excellent for cpLoss <= 20', () {
      expect(classifyMoveQuality(1), MoveQuality.excellent);
      expect(classifyMoveQuality(10), MoveQuality.excellent);
      expect(classifyMoveQuality(20), MoveQuality.excellent);
    });

    test('returns good for cpLoss <= 50', () {
      expect(classifyMoveQuality(21), MoveQuality.good);
      expect(classifyMoveQuality(50), MoveQuality.good);
    });

    test('returns inaccuracy for cpLoss <= 100', () {
      expect(classifyMoveQuality(51), MoveQuality.inaccuracy);
      expect(classifyMoveQuality(100), MoveQuality.inaccuracy);
    });

    test('returns mistake for cpLoss <= 200', () {
      expect(classifyMoveQuality(101), MoveQuality.mistake);
      expect(classifyMoveQuality(200), MoveQuality.mistake);
    });

    test('returns blunder for cpLoss > 200', () {
      expect(classifyMoveQuality(201), MoveQuality.blunder);
      expect(classifyMoveQuality(500), MoveQuality.blunder);
      expect(classifyMoveQuality(1000), MoveQuality.blunder);
    });

    test('boundary values are classified correctly', () {
      expect(classifyMoveQuality(0), MoveQuality.best);
      expect(classifyMoveQuality(20), MoveQuality.excellent);
      expect(classifyMoveQuality(20.01), MoveQuality.good);
      expect(classifyMoveQuality(50), MoveQuality.good);
      expect(classifyMoveQuality(50.01), MoveQuality.inaccuracy);
      expect(classifyMoveQuality(100), MoveQuality.inaccuracy);
      expect(classifyMoveQuality(100.01), MoveQuality.mistake);
      expect(classifyMoveQuality(200), MoveQuality.mistake);
      expect(classifyMoveQuality(200.01), MoveQuality.blunder);
    });
  });
}
