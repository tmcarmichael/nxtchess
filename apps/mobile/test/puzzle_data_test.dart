import 'package:flutter_test/flutter_test.dart';
import 'package:nxtchess/models/game_types.dart';
import 'package:nxtchess/services/puzzle/puzzle_data.dart';

void main() {
  group('uciToFromTo', () {
    test('parses standard 4-char UCI move', () {
      final result = uciToFromTo('e2e4');
      expect(result.from, 'e2');
      expect(result.to, 'e4');
      expect(result.promotion, isNull);
    });

    test('parses 5-char UCI move with promotion', () {
      final result = uciToFromTo('a7a8q');
      expect(result.from, 'a7');
      expect(result.to, 'a8');
      expect(result.promotion, 'q');
    });

    test('parses knight promotion', () {
      final result = uciToFromTo('b7b8n');
      expect(result.from, 'b7');
      expect(result.to, 'b8');
      expect(result.promotion, 'n');
    });
  });

  group('PuzzleHistory', () {
    test('records and retrieves attempts', () {
      final history = PuzzleHistory();
      final attempt = PuzzleAttempt(
        puzzleId: 'test-1',
        category: PuzzleCategory.mateIn1,
        fen: '8/8/8/8/8/8/8/8 w - - 0 1',
        playerSide: Side.w,
        result: PuzzleResult.pass,
        rated: true,
        timestamp: DateTime.now(),
      );

      history.record(attempt);
      final results = history.get();
      expect(results.length, 1);
      expect(results.first.puzzleId, 'test-1');
    });

    test('most recent attempt is first', () {
      final history = PuzzleHistory();
      for (int i = 0; i < 5; i++) {
        history.record(
          PuzzleAttempt(
            puzzleId: 'test-$i',
            category: PuzzleCategory.mateIn1,
            fen: '8/8/8/8/8/8/8/8 w - - 0 1',
            playerSide: Side.w,
            result: i % 2 == 0 ? PuzzleResult.pass : PuzzleResult.fail,
            rated: true,
            timestamp: DateTime.now(),
          ),
        );
      }

      final results = history.get();
      expect(results.length, 5);
      expect(results.first.puzzleId, 'test-4');
    });

    test('caps at 20 entries', () {
      final history = PuzzleHistory();
      for (int i = 0; i < 25; i++) {
        history.record(
          PuzzleAttempt(
            puzzleId: 'test-$i',
            category: PuzzleCategory.mateIn1,
            fen: '8/8/8/8/8/8/8/8 w - - 0 1',
            playerSide: Side.w,
            result: PuzzleResult.pass,
            rated: true,
            timestamp: DateTime.now(),
          ),
        );
      }

      final results = history.get();
      expect(results.length, 20);
      expect(results.first.puzzleId, 'test-24');
    });

    test('filters by rated status', () {
      final history = PuzzleHistory();
      history.record(
        PuzzleAttempt(
          puzzleId: 'rated-1',
          category: PuzzleCategory.mateIn1,
          fen: '8/8/8/8/8/8/8/8 w - - 0 1',
          playerSide: Side.w,
          result: PuzzleResult.pass,
          rated: true,
          timestamp: DateTime.now(),
        ),
      );
      history.record(
        PuzzleAttempt(
          puzzleId: 'casual-1',
          category: PuzzleCategory.mateIn2,
          fen: '8/8/8/8/8/8/8/8 w - - 0 1',
          playerSide: Side.b,
          result: PuzzleResult.fail,
          rated: false,
          timestamp: DateTime.now(),
        ),
      );

      final rated = history.get(filterRated: true);
      expect(rated.length, 1);
      expect(rated.first.puzzleId, 'rated-1');

      final casual = history.get(filterRated: false);
      expect(casual.length, 1);
      expect(casual.first.puzzleId, 'casual-1');
    });
  });

  group('SolvedPuzzleTracker', () {
    test('tracks rated and casual separately', () {
      final tracker = SolvedPuzzleTracker();
      tracker.markSolved('p1', true);
      tracker.markSolved('p2', false);

      expect(tracker.getSolvedIds(true), contains('p1'));
      expect(tracker.getSolvedIds(true), isNot(contains('p2')));
      expect(tracker.getSolvedIds(false), contains('p2'));
      expect(tracker.getSolvedIds(false), isNot(contains('p1')));
    });

    test('deduplicates puzzle IDs', () {
      final tracker = SolvedPuzzleTracker();
      tracker.markSolved('p1', true);
      tracker.markSolved('p1', true);

      expect(tracker.getSolvedIds(true).length, 1);
    });
  });
}
