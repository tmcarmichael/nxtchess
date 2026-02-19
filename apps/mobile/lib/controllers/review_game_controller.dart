import 'package:dartchess/dartchess.dart' as dc;
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/game_types.dart';
import '../models/move_quality.dart';
import '../providers/chess/chess_provider.dart';
import '../services/review/game_review_service.dart';
import '../utils/pgn_parser.dart';
import 'game_controller.dart';

enum ReviewPhase { idle, analyzing, complete }

class ReviewState {
  final ReviewPhase phase;
  final ReviewProgress? progress;
  final ReviewSummary? summary;
  final List<MoveEvaluation> evaluations;

  const ReviewState({
    this.phase = ReviewPhase.idle,
    this.progress,
    this.summary,
    this.evaluations = const [],
  });

  ReviewState copyWith({
    ReviewPhase? phase,
    ReviewProgress? progress,
    ReviewSummary? summary,
    List<MoveEvaluation>? evaluations,
  }) {
    return ReviewState(
      phase: phase ?? this.phase,
      progress: progress ?? this.progress,
      summary: summary ?? this.summary,
      evaluations: evaluations ?? this.evaluations,
    );
  }
}

class ReviewStateNotifier extends Notifier<ReviewState> {
  @override
  ReviewState build() => const ReviewState();

  void update(ReviewState newState) => state = newState;
}

final reviewStateProvider = NotifierProvider<ReviewStateNotifier, ReviewState>(
  ReviewStateNotifier.new,
);

class ReviewGameController extends GameController {
  @override
  final Ref ref;
  ReviewHandle? _reviewHandle;
  bool _disposed = false;

  ReviewGameController(this.ref);

  @override
  GameMode get mode => GameMode.play;

  ChessNotifier get _chess => ref.read(chessProvider.notifier);

  ReviewState get _reviewState => ref.read(reviewStateProvider);

  void _setReviewState(ReviewState newState) {
    ref.read(reviewStateProvider.notifier).update(newState);
  }

  bool loadPgnAndStartReview(String pgn, Side playerColor) {
    dc.Position pos = dc.Chess.initial;
    final sanMoves = <String>[];

    try {
      final tokens = parsePgnToSanTokens(pgn);

      for (final san in tokens) {
        final move = pos.parseSan(san);
        if (move == null) break;
        final (newPos, sanStr) = pos.makeSan(move);
        pos = newPos;
        sanMoves.add(sanStr);
      }
    } catch (e) {
      if (kDebugMode) debugPrint('ReviewGameController PGN parse error: $e');
      return false;
    }

    if (sanMoves.isEmpty) return false;

    _chess.startGame(
      mode: GameMode.play,
      playerColor: playerColor,
      opponentType: OpponentType.ai,
    );

    dc.Position replayPos = dc.Chess.initial;
    for (final san in sanMoves) {
      final move = replayPos.parseSan(san);
      if (move == null || move is! dc.NormalMove) break;
      final from = move.from.name;
      final to = move.to.name;
      final promotion = move.promotion?.letter;
      _chess.applyMove(from, to, promotion: promotion);
      replayPos = replayPos.play(move);
    }

    if (pos.isCheckmate) {
      final winner = pos.turn == dc.Side.white ? GameWinner.b : GameWinner.w;
      _chess.endGame(GameOverReason.checkmate, winner);
    } else if (pos.isStalemate || pos.isInsufficientMaterial) {
      _chess.endGame(GameOverReason.stalemate, GameWinner.draw);
    }

    _chess.jumpToMoveIndex(-1);
    _startReview(sanMoves, playerColor);
    return true;
  }

  void _startReview(List<String> moves, Side playerColor) {
    _reviewHandle?.abort();

    _setReviewState(const ReviewState(phase: ReviewPhase.analyzing));

    final evaluations = <MoveEvaluation>[];

    _reviewHandle = startGameReview(
      moves: moves,
      playerColor: playerColor,
      onProgress: (progress) {
        if (!_disposed) {
          _setReviewState(_reviewState.copyWith(progress: progress));
        }
      },
      onMoveEvaluated: (evaluation) {
        if (!_disposed) {
          evaluations.add(evaluation);
          _setReviewState(
            _reviewState.copyWith(evaluations: List.from(evaluations)),
          );
        }
      },
      onComplete: (summary) {
        if (!_disposed) {
          _setReviewState(
            ReviewState(
              phase: ReviewPhase.complete,
              summary: summary,
              evaluations: evaluations,
            ),
          );
        }
      },
    );
  }

  void exitReview() {
    _reviewHandle?.abort();
    _reviewHandle = null;
    _setReviewState(const ReviewState());
    _chess.exitGame();
  }

  @override
  void onMove(String from, String to, {String? promotion}) {}

  @override
  void onResign() {}

  @override
  void onNewGame() {}

  @override
  void onExitGame() => exitReview();

  @override
  void dispose() {
    _disposed = true;
    _reviewHandle?.abort();
    _reviewHandle = null;
  }
}

final reviewGameControllerProvider = Provider.autoDispose<ReviewGameController>(
  (ref) {
    final controller = ReviewGameController(ref);
    ref.onDispose(controller.dispose);
    return controller;
  },
);
