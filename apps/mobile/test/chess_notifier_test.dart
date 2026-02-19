import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:nxtchess/config/constants.dart';
import 'package:nxtchess/models/game_types.dart';
import 'package:nxtchess/models/move_quality.dart';
import 'package:nxtchess/providers/chess/chess_provider.dart';

ProviderContainer _createContainer() {
  return ProviderContainer();
}

ChessNotifier _startedNotifier({
  GameMode mode = GameMode.play,
  Side playerColor = Side.w,
  OpponentType opponentType = OpponentType.ai,
  String? fen,
}) {
  final container = _createContainer();
  final notifier = container.read(chessProvider.notifier);
  notifier.startGame(
    mode: mode,
    playerColor: playerColor,
    opponentType: opponentType,
    fen: fen,
  );
  return notifier;
}

void main() {
  group('default state', () {
    test('initial state is idle with starting FEN', () {
      final container = _createContainer();
      final state = container.read(chessProvider);
      expect(state.lifecycle, GameLifecycle.idle);
      expect(state.fen, initialFen);
      expect(state.moveHistory, isEmpty);
      expect(state.viewMoveIndex, -1);
      expect(state.isGameOver, false);
      expect(state.sessionId, isNull);
    });
  });

  group('startGame', () {
    test('sets lifecycle to playing and returns sessionId', () {
      final container = _createContainer();
      final notifier = container.read(chessProvider.notifier);
      final sessionId = notifier.startGame(
        mode: GameMode.play,
        playerColor: Side.w,
        opponentType: OpponentType.ai,
      );

      final state = container.read(chessProvider);
      expect(sessionId, isNotEmpty);
      expect(state.sessionId, sessionId);
      expect(state.lifecycle, GameLifecycle.playing);
      expect(state.playerColor, Side.w);
      expect(state.mode, GameMode.play);
      expect(state.opponentType, OpponentType.ai);
      expect(state.moveHistory, isEmpty);
      expect(state.viewMoveIndex, -1);
    });

    test('accepts custom FEN', () {
      final container = _createContainer();
      final notifier = container.read(chessProvider.notifier);
      const customFen =
          'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
      notifier.startGame(
        mode: GameMode.training,
        playerColor: Side.b,
        opponentType: OpponentType.ai,
        fen: customFen,
      );

      final state = container.read(chessProvider);
      expect(state.fen, customFen);
      expect(state.viewFen, customFen);
    });

    test('sets training-specific fields', () {
      final container = _createContainer();
      final notifier = container.read(chessProvider.notifier);
      notifier.startGame(
        mode: GameMode.training,
        playerColor: Side.w,
        opponentType: OpponentType.ai,
        trainingGamePhase: GamePhase.endgame,
        trainingStartEval: 1.5,
        trainingPositionId: 'pos-1',
        trainingTheme: 'rook-endgame',
      );

      final state = container.read(chessProvider);
      expect(state.training.gamePhase, GamePhase.endgame);
      expect(state.training.startEval, 1.5);
      expect(state.training.positionId, 'pos-1');
      expect(state.training.theme, 'rook-endgame');
    });

    test('sets puzzle-specific fields', () {
      final container = _createContainer();
      final notifier = container.read(chessProvider.notifier);
      notifier.startGame(
        mode: GameMode.puzzle,
        playerColor: Side.w,
        opponentType: OpponentType.ai,
        puzzleCategory: PuzzleCategory.mateIn2,
        puzzleId: 'pz-42',
        puzzleRated: true,
        puzzleStartFen: initialFen,
      );

      final state = container.read(chessProvider);
      expect(state.puzzle.category, PuzzleCategory.mateIn2);
      expect(state.puzzle.id, 'pz-42');
      expect(state.puzzle.rated, true);
      expect(state.puzzle.startFen, initialFen);
    });
  });

  group('applyMove', () {
    test('applies a legal move', () {
      final notifier = _startedNotifier();
      final result = notifier.applyMove('e2', 'e4');

      expect(result, true);
      final state = notifier.state;
      expect(state.moveHistory, ['e4']);
      expect(state.currentTurn, Side.b);
      expect(state.viewMoveIndex, 0);
      expect(state.lastMove, const LastMove(from: 'e2', to: 'e4'));
      expect(state.isGameOver, false);
    });

    test('rejects illegal move', () {
      final notifier = _startedNotifier();
      final result = notifier.applyMove('e2', 'e5');
      expect(result, false);
      expect(notifier.state.moveHistory, isEmpty);
    });

    test('rejects move when not playing', () {
      final container = _createContainer();
      final notifier = container.read(chessProvider.notifier);
      // lifecycle is idle, not playing
      final result = notifier.applyMove('e2', 'e4');
      expect(result, false);
    });

    test('rejects invalid square', () {
      final notifier = _startedNotifier();
      final result = notifier.applyMove('z9', 'e4');
      expect(result, false);
    });

    test('alternates turns', () {
      final notifier = _startedNotifier();
      notifier.applyMove('e2', 'e4');
      expect(notifier.state.currentTurn, Side.b);
      notifier.applyMove('e7', 'e5');
      expect(notifier.state.currentTurn, Side.w);
    });

    test('handles promotion', () {
      // Position where white pawn on a7 can promote
      const promoFen = '8/P7/8/8/8/8/6k1/4K3 w - - 0 1';
      final notifier = _startedNotifier(fen: promoFen);
      final result = notifier.applyMove('a7', 'a8', promotion: 'q');
      expect(result, true);
      expect(notifier.state.moveHistory.first, contains('=Q'));
    });

    test('detects check', () {
      // Scholar's mate setup: 1.e4 e5 2.Bc4 Nc6 3.Qh5 Nf6 4.Qxf7#
      final notifier = _startedNotifier();
      notifier.applyMove('e2', 'e4'); // e4
      notifier.applyMove('e7', 'e5'); // e5
      notifier.applyMove('f1', 'c4'); // Bc4
      notifier.applyMove('b8', 'c6'); // Nc6
      notifier.applyMove('d1', 'h5'); // Qh5
      // Nf6 blocks but Qxf7 is checkmate
      notifier.applyMove('g8', 'f6'); // Nf6
      notifier.applyMove('h5', 'f7'); // Qxf7#

      expect(notifier.state.isGameOver, true);
      expect(notifier.state.gameOverReason, GameOverReason.checkmate);
      expect(notifier.state.gameWinner, GameWinner.w);
      expect(notifier.state.lifecycle, GameLifecycle.ended);
    });

    test('detects stalemate', () {
      // White queen on c5, white king on b6, black king on a8
      // After Qc7, black has no legal moves — stalemate
      const stalemateFen = 'k7/8/1K6/2Q5/8/8/8/8 w - - 0 1';
      final notifier = _startedNotifier(fen: stalemateFen);
      notifier.applyMove('c5', 'c7'); // Qc7 — stalemate

      expect(notifier.state.isGameOver, true);
      expect(notifier.state.gameOverReason, GameOverReason.stalemate);
      expect(notifier.state.gameWinner, GameWinner.draw);
    });

    test('builds move history correctly over multiple moves', () {
      final notifier = _startedNotifier();
      notifier.applyMove('e2', 'e4');
      notifier.applyMove('e7', 'e5');
      notifier.applyMove('g1', 'f3');

      expect(notifier.state.moveHistory, ['e4', 'e5', 'Nf3']);
      expect(notifier.state.viewMoveIndex, 2);
    });

    test('clears moveError on successful move', () {
      final notifier = _startedNotifier();
      // Simulate a prior error
      notifier.rejectMove(initialFen, 'test error');
      expect(notifier.state.moveError, 'test error');

      notifier.applyMove('e2', 'e4');
      expect(notifier.state.moveError, isNull);
    });
  });

  group('applyOptimisticMove + confirmMove', () {
    test('confirmMove does not double-append to moveHistory', () {
      final notifier = _startedNotifier();
      notifier.applyOptimisticMove('e2', 'e4');

      expect(notifier.state.moveHistory, ['e4']);
      expect(notifier.state.moveHistory.length, 1);

      // Server confirms the move
      notifier.confirmMove(serverFen: notifier.state.fen, from: 'e2', to: 'e4');

      // Should still be 1, not 2
      expect(notifier.state.moveHistory.length, 1);
      expect(notifier.state.moveHistory, ['e4']);
      expect(notifier.state.viewMoveIndex, 0);
    });

    test('confirmMove syncs server FEN', () {
      final notifier = _startedNotifier();
      notifier.applyOptimisticMove('e2', 'e4');

      const serverFen =
          'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
      notifier.confirmMove(serverFen: serverFen, from: 'e2', to: 'e4');

      expect(notifier.state.fen, serverFen);
      expect(notifier.state.viewFen, serverFen);
      expect(notifier.state.moveError, isNull);
    });
  });

  group('rejectMove', () {
    test('reverts FEN and sets error', () {
      final notifier = _startedNotifier();
      notifier.rejectMove(initialFen, 'Invalid move');

      expect(notifier.state.fen, initialFen);
      expect(notifier.state.moveError, 'Invalid move');
    });
  });

  group('syncFromMultiplayer', () {
    test('appends opponent move and flips turn', () {
      final notifier = _startedNotifier();
      notifier.applyMove('e2', 'e4'); // white plays
      expect(notifier.state.currentTurn, Side.b);

      const fenAfterE5 =
          'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2';
      notifier.syncFromMultiplayer(
        fen: fenAfterE5,
        san: 'e5',
        from: 'e7',
        to: 'e5',
      );

      expect(notifier.state.moveHistory, ['e4', 'e5']);
      expect(notifier.state.currentTurn, Side.w);
      expect(notifier.state.lastMove, const LastMove(from: 'e7', to: 'e5'));
    });
  });

  group('endGame', () {
    test('sets game over state', () {
      final notifier = _startedNotifier();
      notifier.endGame(GameOverReason.time, GameWinner.b);

      expect(notifier.state.isGameOver, true);
      expect(notifier.state.gameOverReason, GameOverReason.time);
      expect(notifier.state.gameWinner, GameWinner.b);
      expect(notifier.state.lifecycle, GameLifecycle.ended);
    });

    test('preserves training eval score', () {
      final notifier = _startedNotifier(mode: GameMode.training);
      notifier.endGame(GameOverReason.checkmate, GameWinner.w, evalScore: 3.5);
      expect(notifier.state.training.evalScore, 3.5);
    });
  });

  group('resign', () {
    test('resigns as white — black wins', () {
      final notifier = _startedNotifier();
      notifier.resign();

      expect(notifier.state.isGameOver, true);
      expect(notifier.state.gameOverReason, GameOverReason.resignation);
      expect(notifier.state.gameWinner, GameWinner.b);
    });

    test('resigns as black — white wins', () {
      final notifier = _startedNotifier(playerColor: Side.b);
      notifier.resign();

      expect(notifier.state.gameWinner, GameWinner.w);
    });

    test('resign is no-op when not playing', () {
      final container = _createContainer();
      final notifier = container.read(chessProvider.notifier);
      notifier.resign();
      expect(notifier.state.isGameOver, false);
      expect(notifier.state.lifecycle, GameLifecycle.idle);
    });

    test('resign is no-op after game ended', () {
      final notifier = _startedNotifier();
      notifier.endGame(GameOverReason.time, GameWinner.b);
      // Try to resign after game already ended
      notifier.resign();
      // Should still show time as reason, not resignation
      expect(notifier.state.gameOverReason, GameOverReason.time);
    });
  });

  group('exitGame', () {
    test('resets to default state', () {
      final notifier = _startedNotifier();
      notifier.applyMove('e2', 'e4');
      notifier.exitGame();

      final state = notifier.state;
      expect(state.lifecycle, GameLifecycle.idle);
      expect(state.sessionId, isNull);
      expect(state.moveHistory, isEmpty);
      expect(state.fen, initialFen);
    });

    test('internal position resets on build so new game works cleanly', () {
      final container = _createContainer();
      final notifier = container.read(chessProvider.notifier);

      // Play some moves in a first game
      notifier.startGame(
        mode: GameMode.play,
        playerColor: Side.w,
        opponentType: OpponentType.ai,
      );
      notifier.applyMove('e2', 'e4');
      notifier.applyMove('e7', 'e5');

      // Invalidate the provider (simulates provider rebuild)
      container.invalidate(chessProvider);

      // Re-read — build() should reset _pos and _positionHashes
      final freshNotifier = container.read(chessProvider.notifier);
      final freshState = container.read(chessProvider);
      expect(freshState.fen, initialFen);
      expect(freshState.lifecycle, GameLifecycle.idle);

      // Starting a new game should work from initial position
      freshNotifier.startGame(
        mode: GameMode.play,
        playerColor: Side.w,
        opponentType: OpponentType.ai,
      );
      final result = freshNotifier.applyMove('e2', 'e4');
      expect(result, true);
      expect(freshNotifier.state.moveHistory, ['e4']);
    });
  });

  group('jumpToMoveIndex', () {
    test('navigates to a specific move', () {
      final notifier = _startedNotifier();
      notifier.applyMove('e2', 'e4');
      notifier.applyMove('e7', 'e5');
      notifier.applyMove('g1', 'f3');

      notifier.jumpToMoveIndex(0); // after e4
      expect(notifier.state.viewMoveIndex, 0);
      expect(notifier.state.viewFen, isNot(notifier.state.fen));

      notifier.jumpToMoveIndex(2); // back to current
      expect(notifier.state.viewMoveIndex, 2);
      expect(notifier.state.viewFen, notifier.state.fen);
    });

    test('navigates to start (index -1)', () {
      final notifier = _startedNotifier();
      notifier.applyMove('e2', 'e4');
      notifier.applyMove('e7', 'e5');

      notifier.jumpToMoveIndex(-1);
      expect(notifier.state.viewMoveIndex, -1);
      expect(notifier.state.viewFen, initialFen);
    });

    test('clamps out-of-range index', () {
      final notifier = _startedNotifier();
      notifier.applyMove('e2', 'e4'); // 1 move

      notifier.jumpToMoveIndex(100);
      expect(notifier.state.viewMoveIndex, 0); // clamped to max

      notifier.jumpToMoveIndex(-50);
      expect(notifier.state.viewMoveIndex, -1); // clamped to min
    });

    test('clears lastMove and checkedKingSquare', () {
      final notifier = _startedNotifier();
      notifier.applyMove('e2', 'e4');
      expect(notifier.state.lastMove, isNotNull);

      notifier.jumpToMoveIndex(0);
      expect(notifier.state.lastMove, isNull);
      expect(notifier.state.checkedKingSquare, isNull);
    });
  });

  group('resetForMultiplayer', () {
    test('sets initializing lifecycle with human opponent', () {
      final container = _createContainer();
      final notifier = container.read(chessProvider.notifier);
      notifier.resetForMultiplayer(GameMode.play);

      final state = container.read(chessProvider);
      expect(state.lifecycle, GameLifecycle.initializing);
      expect(state.opponentType, OpponentType.human);
      expect(state.mode, GameMode.play);
      expect(state.fen, initialFen);
    });
  });

  group('hydrateFromReconnect', () {
    test('rebuilds state from UCI move history', () {
      final notifier = _startedNotifier(opponentType: OpponentType.human);
      notifier.resetForMultiplayer(GameMode.play);

      const fenAfter =
          'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2';
      notifier.hydrateFromReconnect(fenAfter, ['e2e4', 'd7d5']);

      expect(notifier.state.moveHistory, ['e4', 'd5']);
      expect(notifier.state.viewMoveIndex, 1);
      expect(notifier.state.lifecycle, GameLifecycle.playing);
      expect(notifier.state.isGameOver, false);
      expect(notifier.state.lastMove, const LastMove(from: 'd7', to: 'd5'));
    });

    test('handles empty move history', () {
      final notifier = _startedNotifier();
      notifier.resetForMultiplayer(GameMode.play);
      notifier.hydrateFromReconnect(initialFen, []);

      expect(notifier.state.moveHistory, isEmpty);
      expect(notifier.state.viewMoveIndex, -1);
      expect(notifier.state.lastMove, isNull);
    });
  });

  group('computed properties', () {
    test('isPlayerTurn', () {
      final notifier = _startedNotifier();
      expect(notifier.isPlayerTurn, true);
      notifier.applyMove('e2', 'e4');
      expect(notifier.isPlayerTurn, false);
    });

    test('canMove', () {
      final notifier = _startedNotifier();
      expect(notifier.canMove, true);
      notifier.applyMove('e2', 'e4');
      expect(notifier.canMove, false); // opponent's turn
    });

    test('isViewingHistory', () {
      final notifier = _startedNotifier();
      notifier.applyMove('e2', 'e4');
      notifier.applyMove('e7', 'e5');

      expect(notifier.isViewingHistory, false);
      notifier.jumpToMoveIndex(0);
      expect(notifier.isViewingHistory, true);
      notifier.jumpToMoveIndex(1);
      expect(notifier.isViewingHistory, false);
    });

    test('opponentSide', () {
      final notifier = _startedNotifier();
      expect(notifier.opponentSide, Side.b);
    });
  });

  group('setters', () {
    test('setLifecycle', () {
      final notifier = _startedNotifier();
      notifier.setLifecycle(GameLifecycle.error);
      expect(notifier.state.lifecycle, GameLifecycle.error);
    });

    test('setPlayerColor', () {
      final notifier = _startedNotifier();
      notifier.setPlayerColor(Side.b);
      expect(notifier.state.playerColor, Side.b);
    });

    test('setInitError', () {
      final notifier = _startedNotifier();
      notifier.setInitError('Connection failed');
      expect(notifier.state.initError, 'Connection failed');
      notifier.setInitError(null);
      expect(notifier.state.initError, isNull);
    });

    test('updateMoveEvaluation adds new eval', () {
      final notifier = _startedNotifier();
      const eval1 = MoveEvaluation(
        moveIndex: 0,
        san: 'e4',
        isPlayerMove: true,
        side: Side.w,
      );
      notifier.updateMoveEvaluation(eval1);
      expect(notifier.state.training.moveEvaluations.length, 1);
    });

    test('updateMoveEvaluation replaces existing eval', () {
      final notifier = _startedNotifier();
      const eval1 = MoveEvaluation(
        moveIndex: 0,
        san: 'e4',
        isPlayerMove: true,
        side: Side.w,
        quality: MoveQuality.good,
      );
      const eval2 = MoveEvaluation(
        moveIndex: 0,
        san: 'e4',
        isPlayerMove: true,
        side: Side.w,
        quality: MoveQuality.best,
      );
      notifier.updateMoveEvaluation(eval1);
      notifier.updateMoveEvaluation(eval2);
      expect(notifier.state.training.moveEvaluations.length, 1);
      expect(
        notifier.state.training.moveEvaluations.first.quality,
        MoveQuality.best,
      );
    });

    test('clearMoveEvaluations', () {
      final notifier = _startedNotifier();
      const eval1 = MoveEvaluation(
        moveIndex: 0,
        san: 'e4',
        isPlayerMove: true,
        side: Side.w,
      );
      notifier.updateMoveEvaluation(eval1);
      notifier.clearMoveEvaluations();
      expect(notifier.state.training.moveEvaluations, isEmpty);
    });

    test('setPuzzleSolutionIndex', () {
      final notifier = _startedNotifier(mode: GameMode.puzzle);
      notifier.setPuzzleSolutionIndex(3);
      expect(notifier.state.puzzle.solutionIndex, 3);
    });

    test('setPuzzleFeedback', () {
      final notifier = _startedNotifier(mode: GameMode.puzzle);
      const feedback = PuzzleFeedback(correct: true, message: 'Well done!');
      notifier.setPuzzleFeedback(feedback);
      expect(notifier.state.puzzle.feedback?.correct, true);
      notifier.setPuzzleFeedback(null);
      expect(notifier.state.puzzle.feedback, isNull);
    });

    test('setRatingChange', () {
      final notifier = _startedNotifier();
      const rc = RatingChange(delta: 15, newRating: 1215);
      notifier.setRatingChange(rc);
      expect(notifier.state.puzzle.ratingChange?.delta, 15);
    });
  });
}
