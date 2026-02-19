import 'package:flutter_test/flutter_test.dart';
import 'package:nxtchess/utils/uci_utils.dart';

void main() {
  group('parseUciMove', () {
    test('parses standard 4-char move', () {
      final move = parseUciMove('e2e4');
      expect(move.from, 'e2');
      expect(move.to, 'e4');
      expect(move.promotion, isNull);
    });

    test('parses 5-char promotion move', () {
      final move = parseUciMove('e7e8q');
      expect(move.from, 'e7');
      expect(move.to, 'e8');
      expect(move.promotion, 'q');
    });

    test('parses knight promotion', () {
      final move = parseUciMove('a7a8n');
      expect(move.from, 'a7');
      expect(move.to, 'a8');
      expect(move.promotion, 'n');
    });
  });

  group('matchesSolution', () {
    test('matches exact UCI move', () {
      expect(matchesSolution('e2e4', 'e2', 'e4', null), isTrue);
    });

    test('does not match wrong from square', () {
      expect(matchesSolution('e2e4', 'd2', 'e4', null), isFalse);
    });

    test('does not match wrong to square', () {
      expect(matchesSolution('e2e4', 'e2', 'e5', null), isFalse);
    });

    test('matches promotion move', () {
      expect(matchesSolution('e7e8q', 'e7', 'e8', 'q'), isTrue);
    });

    test('does not match wrong promotion piece', () {
      expect(matchesSolution('e7e8q', 'e7', 'e8', 'r'), isFalse);
    });

    test('does not match when promotion expected but not given', () {
      expect(matchesSolution('e7e8q', 'e7', 'e8', null), isFalse);
    });

    test('matches non-promotion when no promotion in solution', () {
      expect(matchesSolution('a1h8', 'a1', 'h8', null), isTrue);
    });
  });
}
