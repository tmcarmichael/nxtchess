import 'package:flutter/foundation.dart';
import '../../config/constants.dart';
import '../../models/game_types.dart';
import '../api/api_client.dart' show ApiClient;

class ResolvedPosition {
  final String fen;
  final String? positionId;
  final String? theme;
  final int? difficulty;
  final double? startingEval;
  final Side sideToMove;

  const ResolvedPosition({
    required this.fen,
    this.positionId,
    this.theme,
    this.difficulty,
    this.startingEval,
    required this.sideToMove,
  });
}

const _endgameMoveThreshold = 40;
const _standardMoveThreshold = 20;

int getMoveThreshold(GamePhase phase) {
  switch (phase) {
    case GamePhase.endgame:
      return _endgameMoveThreshold;
    case GamePhase.opening:
      return _standardMoveThreshold;
    case GamePhase.middlegame:
      return _standardMoveThreshold;
  }
}

Future<ResolvedPosition> resolvePosition({
  required GamePhase phase,
  required Side side,
  required ApiClient api,
  String? theme,
  String? excludePositionId,
}) async {
  if (phase == GamePhase.opening || phase == GamePhase.middlegame) {
    final sideToMove = initialFen.split(' ')[1] == 'b' ? Side.b : Side.w;
    return ResolvedPosition(fen: initialFen, sideToMove: sideToMove);
  }

  try {
    final params = <String, dynamic>{};
    if (theme != null && theme.isNotEmpty) params['theme'] = theme;
    params['side'] = side == Side.w ? 'w' : 'b';
    if (excludePositionId != null) params['exclude'] = excludePositionId;

    final response = await api.get(
      '/api/training/endgame/random',
      queryParameters: params,
    );

    if (response.statusCode == 200) {
      final data = response.data as Map<String, dynamic>;
      final fen = data['fen'] as String;
      final parts = fen.split(' ');
      final sideToMove = parts.length > 1 && parts[1] == 'b' ? Side.b : Side.w;

      return ResolvedPosition(
        fen: fen,
        positionId: data['position_id'] as String?,
        theme: data['theme'] as String?,
        difficulty: data['difficulty'] as int?,
        startingEval: (data['initial_eval'] as num?)?.toDouble(),
        sideToMove: sideToMove,
      );
    }
  } catch (e) {
    if (kDebugMode) debugPrint('resolvePosition API error: $e');
  }

  return const ResolvedPosition(fen: initialFen, sideToMove: Side.w);
}

enum TrainingEndReason { moveLimit, checkmate, stalemate, draw, resignation }

bool shouldTerminate({
  required GamePhase phase,
  required int halfMoveCount,
  required bool isCheckmate,
  required bool isStalemate,
  required bool isDraw,
}) {
  if (isCheckmate || isStalemate || isDraw) return true;
  return halfMoveCount >= getMoveThreshold(phase);
}

TrainingEndReason? getTerminationReason({
  required GamePhase phase,
  required int halfMoveCount,
  required bool isCheckmate,
  required bool isStalemate,
  required bool isDraw,
}) {
  if (isCheckmate) return TrainingEndReason.checkmate;
  if (isStalemate) return TrainingEndReason.stalemate;
  if (isDraw) return TrainingEndReason.draw;
  if (halfMoveCount >= getMoveThreshold(phase)) {
    return TrainingEndReason.moveLimit;
  }
  return null;
}

const _mateScore = 10000.0;

double normalizeEval(double evalCp, Side playerSide) {
  return playerSide == Side.w ? evalCp : -evalCp;
}

String formatEval(double evalCp) {
  if (evalCp.abs() >= _mateScore - 100) {
    return evalCp > 0 ? 'M+' : 'M-';
  }
  final pawns = evalCp / 100.0;
  final sign = pawns >= 0 ? '+' : '';
  return '$sign${pawns.toStringAsFixed(2)}';
}

class ScoreResult {
  final double? score;
  final String displayScore;
  final bool isPositive;
  final String description;

  const ScoreResult({
    this.score,
    required this.displayScore,
    required this.isPositive,
    required this.description,
  });
}

ScoreResult calculateEvalDifferentialScore({
  required double? startEval,
  required double? finalEval,
  required Side playerSide,
  required TrainingEndReason endReason,
  required bool? playerWon,
}) {
  if (endReason == TrainingEndReason.checkmate) {
    final displayText = playerWon == true ? 'Checkmate!' : 'Checkmated';
    return ScoreResult(
      score: playerWon == true ? _mateScore : -_mateScore,
      displayScore: displayText,
      isPositive: playerWon ?? false,
      description: displayText,
    );
  }

  if (endReason == TrainingEndReason.stalemate ||
      endReason == TrainingEndReason.draw) {
    return const ScoreResult(
      score: 0,
      displayScore: 'Draw',
      isPositive: true,
      description: 'Game ended in a draw',
    );
  }

  if (finalEval == null) {
    return const ScoreResult(
      displayScore: '-',
      isPositive: true,
      description: 'Could not evaluate position',
    );
  }

  final playerStartEval = normalizeEval(startEval ?? 0, playerSide);
  final playerEndEval = normalizeEval(finalEval, playerSide);
  final diff = playerEndEval - playerStartEval;

  return ScoreResult(
    score: diff,
    displayScore: '${diff >= 0 ? '+' : ''}${diff.toInt()} cp',
    isPositive: diff >= 0,
    description: diff >= 0
        ? 'Improved position by ${diff.abs().toInt()} centipawns'
        : 'Lost ${diff.abs().toInt()} centipawns',
  );
}

const Map<String, String> endgameThemeLabels = {
  'basicMate': 'Basic Mates',
  'pawnEndgame': 'Pawn Endgame',
  'rookEndgame': 'Rook Endgame',
  'bishopEndgame': 'Bishop Endgame',
  'knightEndgame': 'Knight Endgame',
  'queenEndgame': 'Queen Endgame',
  'queenRookEndgame': 'Queen & Rook Endgame',
  'opposition': 'Opposition',
  'lucena': 'Lucena Position',
  'philidor': 'Philidor Position',
  'zugzwang': 'Zugzwang',
};

const Map<int, String> difficultyLabels = {
  1: 'Beginner',
  2: 'Easy',
  3: 'Easy+',
  4: 'Medium',
  5: 'Medium+',
  6: 'Hard',
  7: 'Hard+',
  8: 'Expert',
  9: 'Expert+',
  10: 'Grandmaster',
};
