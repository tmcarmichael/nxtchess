import 'package:freezed_annotation/freezed_annotation.dart';
import '../../models/achievement.dart';
import '../../models/game_types.dart';
import '../../models/move_quality.dart';

part 'chess_state.freezed.dart';

@freezed
sealed class LastMove with _$LastMove {
  const factory LastMove({required String from, required String to}) =
      _LastMove;
}

@freezed
sealed class PuzzleFeedback with _$PuzzleFeedback {
  const factory PuzzleFeedback({
    required bool correct,
    required String message,
  }) = _PuzzleFeedback;
}

@freezed
sealed class RatingChange with _$RatingChange {
  const factory RatingChange({required int delta, required int newRating}) =
      _RatingChange;
}

@freezed
sealed class TrainingState with _$TrainingState {
  const factory TrainingState({
    @Default(null) GamePhase? gamePhase,
    @Default(null) double? evalScore,
    @Default(null) double? startEval,
    @Default(null) String? positionId,
    @Default(null) String? theme,
    @Default([]) List<MoveEvaluation> moveEvaluations,
  }) = _TrainingState;
}

@freezed
sealed class PuzzleState with _$PuzzleState {
  const factory PuzzleState({
    @Default(null) PuzzleCategory? category,
    @Default(null) String? id,
    @Default(false) bool rated,
    @Default(0) int solutionIndex,
    @Default(null) PuzzleFeedback? feedback,
    @Default(null) String? startFen,
    @Default(null) RatingChange? ratingChange,
    @Default(null) List<AchievementUnlock>? newAchievements,
  }) = _PuzzleState;
}

@freezed
sealed class ChessState with _$ChessState {
  const factory ChessState({
    @Default(null) String? sessionId,
    @Default('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    String fen,
    @Default('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    String viewFen,
    @Default(Side.w) Side currentTurn,
    @Default([]) List<String> moveHistory,
    @Default(-1) int viewMoveIndex,
    @Default(null) LastMove? lastMove,
    @Default(null) String? checkedKingSquare,
    @Default(false) bool isGameOver,
    @Default(null) GameOverReason? gameOverReason,
    @Default(null) GameWinner? gameWinner,
    @Default(Side.w) Side playerColor,
    @Default(GameMode.play) GameMode mode,
    @Default(OpponentType.ai) OpponentType opponentType,
    @Default(GameLifecycle.idle) GameLifecycle lifecycle,
    @Default(null) String? moveError,
    @Default(null) String? initError,
    @Default(TrainingState()) TrainingState training,
    @Default(PuzzleState()) PuzzleState puzzle,
  }) = _ChessState;
}
