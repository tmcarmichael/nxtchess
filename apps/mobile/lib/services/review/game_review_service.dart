import 'dart:async';
import 'dart:math';

import 'package:dartchess/dartchess.dart' as dc;
import 'package:flutter/foundation.dart';

import '../../config/constants.dart';
import '../../models/game_types.dart';
import '../../models/move_quality.dart';
import '../engine/analysis_engine_service.dart';

const _maxConsecutiveFailures = 3;

class EvalPoint {
  final int moveIndex;
  final double? evalAfter;
  final String san;
  final Side side;
  final MoveQuality? quality;

  const EvalPoint({
    required this.moveIndex,
    this.evalAfter,
    required this.san,
    required this.side,
    this.quality,
  });
}

class QualityDistribution {
  int best;
  int excellent;
  int good;
  int inaccuracy;
  int mistake;
  int blunder;

  QualityDistribution({
    this.best = 0,
    this.excellent = 0,
    this.good = 0,
    this.inaccuracy = 0,
    this.mistake = 0,
    this.blunder = 0,
  });
}

class ReviewSummary {
  final double whiteAccuracy;
  final double blackAccuracy;
  final List<MoveEvaluation> evaluations;
  final List<EvalPoint> evalHistory;
  final QualityDistribution whiteDistribution;
  final QualityDistribution blackDistribution;

  const ReviewSummary({
    required this.whiteAccuracy,
    required this.blackAccuracy,
    required this.evaluations,
    required this.evalHistory,
    required this.whiteDistribution,
    required this.blackDistribution,
  });
}

class ReviewProgress {
  final int currentMove;
  final int totalMoves;
  final int percentComplete;

  const ReviewProgress({
    required this.currentMove,
    required this.totalMoves,
    required this.percentComplete,
  });
}

class ReviewHandle {
  final void Function() abort;
  const ReviewHandle({required this.abort});
}

double _cpToWinPercent(double cp) {
  return 50 + 50 * (2 / (1 + exp(-winPercentageCoefficient * cp)) - 1);
}

double _computeAccuracy(List<MoveEvaluation> evaluations, Side side) {
  final sideMoves = evaluations
      .where(
        (e) => e.side == side && e.evalBefore != null && e.evalAfter != null,
      )
      .toList();

  if (sideMoves.isEmpty) return 100;

  double totalAccuracy = 0;
  for (final move in sideMoves) {
    final wpBefore = _cpToWinPercent(move.evalBefore! * 100);
    final wpAfter = _cpToWinPercent(move.evalAfter! * 100);
    final wpLoss = max(
      0.0,
      side == Side.w ? wpBefore - wpAfter : wpAfter - wpBefore,
    );
    const maxScore = 103.1668;
    const decayRate = 0.04354;
    const offset = 3.1668;
    final moveAccuracy = maxScore * exp(-decayRate * wpLoss) - offset;
    totalAccuracy += max(0, min(100, moveAccuracy));
  }

  return (totalAccuracy / sideMoves.length * 10).roundToDouble() / 10;
}

ReviewSummary _computeSummary(
  List<MoveEvaluation> evaluations,
  List<EvalPoint> evalHistory,
) {
  final whiteDist = QualityDistribution();
  final blackDist = QualityDistribution();

  for (final eval in evaluations) {
    if (eval.quality == null) continue;
    final dist = eval.side == Side.w ? whiteDist : blackDist;
    switch (eval.quality!) {
      case MoveQuality.best:
        dist.best++;
      case MoveQuality.excellent:
        dist.excellent++;
      case MoveQuality.good:
        dist.good++;
      case MoveQuality.inaccuracy:
        dist.inaccuracy++;
      case MoveQuality.mistake:
        dist.mistake++;
      case MoveQuality.blunder:
        dist.blunder++;
    }
  }

  return ReviewSummary(
    whiteAccuracy: _computeAccuracy(evaluations, Side.w),
    blackAccuracy: _computeAccuracy(evaluations, Side.b),
    evaluations: evaluations,
    evalHistory: evalHistory,
    whiteDistribution: whiteDist,
    blackDistribution: blackDist,
  );
}

Side _sideForMoveIndex(int i) => i % 2 == 0 ? Side.w : Side.b;

ReviewHandle startGameReview({
  required List<String> moves,
  String? startingFen,
  required Side playerColor,
  required void Function(ReviewProgress) onProgress,
  required void Function(MoveEvaluation) onMoveEvaluated,
  required void Function(ReviewSummary) onComplete,
}) {
  bool aborted = false;
  AnalysisEngineService? engine;
  final fen = startingFen ?? initialFen;

  dc.Position pos;
  try {
    pos = dc.Chess.fromSetup(dc.Setup.parseFen(fen));
  } catch (e) {
    if (kDebugMode) debugPrint('gameReviewService FEN parse error: $e');
    onComplete(_computeSummary([], []));
    return ReviewHandle(abort: () {});
  }

  final fenPositions = <String>[pos.fen];
  for (final san in moves) {
    final move = pos.parseSan(san);
    if (move == null) break;
    pos = pos.play(move);
    fenPositions.add(pos.fen);
  }

  final totalMoves = fenPositions.length - 1;
  if (totalMoves == 0) {
    onComplete(_computeSummary([], []));
    return ReviewHandle(abort: () {});
  }

  Future<void> run() async {
    engine = AnalysisEngineService();
    try {
      await engine!.init();
    } catch (e) {
      if (kDebugMode) debugPrint('gameReviewService engine init error: $e');
      onComplete(_computeSummary([], []));
      return;
    }

    final evalCache = <String, double>{};
    final allEvaluations = <MoveEvaluation>[];
    final allEvalHistory = <EvalPoint>[];
    int consecutiveFailures = 0;

    Future<double?> getEval(String positionFen) async {
      if (evalCache.containsKey(positionFen)) return evalCache[positionFen];
      if (aborted || engine == null) return null;

      try {
        engine!.setMultiPV(1);
        final analysis = await engine!.analyze(
          positionFen,
          timeMs: reviewMoveAnalysisDuration.inMilliseconds,
        );
        final score = analysis.score;
        evalCache[positionFen] = score;
        consecutiveFailures = 0;
        return score;
      } catch (e) {
        if (kDebugMode) debugPrint('gameReviewService eval error: $e');
        consecutiveFailures++;
        if (consecutiveFailures >= _maxConsecutiveFailures) {
          engine?.dispose();
          try {
            engine = AnalysisEngineService();
            await engine!.init();
            consecutiveFailures = 0;
            final analysis = await engine!.analyze(
              positionFen,
              timeMs: reviewMoveAnalysisDuration.inMilliseconds,
            );
            evalCache[positionFen] = analysis.score;
            return analysis.score;
          } catch (e) {
            if (kDebugMode) {
              debugPrint('gameReviewService engine restart error: $e');
            }
            engine = null;
            return null;
          }
        }
        return null;
      }
    }

    for (int i = 0; i < totalMoves; i++) {
      if (aborted || engine == null) break;

      try {
        final side = _sideForMoveIndex(i);
        final isPlayerMove = side == playerColor;
        final san = moves[i];

        final evalBefore = await getEval(fenPositions[i]);
        if (aborted) break;
        final evalAfter = await getEval(fenPositions[i + 1]);
        if (aborted) break;

        double? cpLoss;
        MoveQuality? quality;

        if (evalBefore != null && evalAfter != null) {
          if (side == Side.w) {
            cpLoss = ((evalBefore - evalAfter) * 100).roundToDouble();
          } else {
            cpLoss = ((evalAfter - evalBefore) * 100).roundToDouble();
          }
          cpLoss = max(0, cpLoss);
          quality = classifyMoveQuality(cpLoss);
        }

        final evaluation = MoveEvaluation(
          moveIndex: i,
          san: san,
          evalBefore: evalBefore,
          evalAfter: evalAfter,
          cpLoss: cpLoss,
          quality: quality,
          isPlayerMove: isPlayerMove,
          side: side,
        );

        allEvaluations.add(evaluation);
        allEvalHistory.add(
          EvalPoint(
            moveIndex: i,
            evalAfter: evalAfter,
            san: san,
            side: side,
            quality: quality,
          ),
        );

        try {
          onMoveEvaluated(evaluation);
        } catch (e) {
          if (kDebugMode) debugPrint('gameReviewService callback error: $e');
        }
        try {
          onProgress(
            ReviewProgress(
              currentMove: i + 1,
              totalMoves: totalMoves,
              percentComplete: ((i + 1) / totalMoves * 100).round(),
            ),
          );
        } catch (e) {
          if (kDebugMode) debugPrint('gameReviewService callback error: $e');
        }
      } catch (e) {
        if (kDebugMode) {
          debugPrint('gameReviewService move evaluation error: $e');
        }
        try {
          onProgress(
            ReviewProgress(
              currentMove: i + 1,
              totalMoves: totalMoves,
              percentComplete: ((i + 1) / totalMoves * 100).round(),
            ),
          );
        } catch (e) {
          if (kDebugMode) debugPrint('gameReviewService callback error: $e');
        }
      }

      await Future.delayed(const Duration(milliseconds: 50));
    }

    if (!aborted) {
      final summary = _computeSummary(allEvaluations, allEvalHistory);
      try {
        onComplete(summary);
      } catch (e) {
        if (kDebugMode) debugPrint('gameReviewService callback error: $e');
      }
    }

    engine?.dispose();
    engine = null;
  }

  run();

  return ReviewHandle(
    abort: () {
      aborted = true;
      engine?.dispose();
      engine = null;
    },
  );
}
