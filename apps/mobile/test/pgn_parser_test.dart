import 'package:flutter_test/flutter_test.dart';
import 'package:nxtchess/utils/pgn_parser.dart';

void main() {
  group('parsePgnToSanTokens', () {
    test('parses simple PGN with move numbers', () {
      final tokens = parsePgnToSanTokens('1. e4 e5 2. Nf3 Nc6');
      expect(tokens, ['e4', 'e5', 'Nf3', 'Nc6']);
    });

    test('handles three-dot move continuation', () {
      final tokens = parsePgnToSanTokens('1... e5 2. Nf3');
      expect(tokens, ['e5', 'Nf3']);
    });

    test('strips game result 1-0', () {
      final tokens = parsePgnToSanTokens('1. e4 e5 1-0');
      expect(tokens, ['e4', 'e5']);
    });

    test('strips game result 0-1', () {
      final tokens = parsePgnToSanTokens('1. e4 e5 0-1');
      expect(tokens, ['e4', 'e5']);
    });

    test('strips game result 1/2-1/2', () {
      final tokens = parsePgnToSanTokens('1. e4 e5 1/2-1/2');
      expect(tokens, ['e4', 'e5']);
    });

    test('strips game result *', () {
      final tokens = parsePgnToSanTokens('1. e4 e5 *');
      expect(tokens, ['e4', 'e5']);
    });

    test('skips PGN header lines', () {
      const pgn = '''
[Event "Test"]
[Site "Unit Test"]

1. d4 d5 2. c4 e6
''';
      final tokens = parsePgnToSanTokens(pgn);
      expect(tokens, ['d4', 'd5', 'c4', 'e6']);
    });

    test('handles multiline move text', () {
      const pgn = '''
1. e4 e5
2. Nf3 Nc6
3. Bb5 a6
''';
      final tokens = parsePgnToSanTokens(pgn);
      expect(tokens, ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6']);
    });

    test('handles promotion notation', () {
      final tokens = parsePgnToSanTokens('1. e8=Q');
      expect(tokens, ['e8=Q']);
    });

    test('handles check and checkmate symbols', () {
      final tokens = parsePgnToSanTokens('1. Qh5+ Ke7 2. Qf7#');
      expect(tokens, ['Qh5+', 'Ke7', 'Qf7#']);
    });

    test('returns empty list for empty input', () {
      expect(parsePgnToSanTokens(''), isEmpty);
    });

    test('returns empty list for headers only', () {
      const pgn = '''
[Event "Test"]
[Site "Unit Test"]
''';
      expect(parsePgnToSanTokens(pgn), isEmpty);
    });

    test('handles castling notation', () {
      final tokens = parsePgnToSanTokens('1. e4 e5 2. O-O O-O-O');
      expect(tokens, ['e4', 'e5', 'O-O', 'O-O-O']);
    });
  });
}
