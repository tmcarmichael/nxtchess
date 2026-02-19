import 'dart:async';
import 'dart:math';

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/game_types.dart';
import '../providers/chess/chess_provider.dart';
import '../providers/engine/engine_provider.dart';
import '../providers/timer/timer_provider.dart';
import '../services/api/api_client.dart' show apiClientProvider;
import '../services/audio/audio_service.dart';
import '../services/haptics/haptics_service.dart';
import '../services/training/training_service.dart';
import 'game_controller.dart';

class TrainingGameController extends GameController {
  @override
  final Ref ref;
  int _gameGeneration = 0;
  ResolvedPosition? _currentMetadata;
  GamePhase _currentPhase = GamePhase.opening;
  bool _disposed = false;

  TrainingGameController(this.ref);

  @override
  GameMode get mode => GameMode.training;

  ChessNotifier get _chess => ref.read(chessProvider.notifier);
  EngineNotifier get _engine => ref.read(engineProvider.notifier);
  AudioService get _audio => ref.read(audioServiceProvider);
  HapticsService get _haptics => ref.read(hapticsServiceProvider);

  Future<void> startNewGame({
    required Side side,
    required int difficulty,
    required GamePhase gamePhase,
    String? theme,
    String? excludePositionId,
  }) async {
    _gameGeneration++;
    final thisGeneration = _gameGeneration;
    _currentPhase = gamePhase;
    _currentMetadata = null;

    ref.read(timerProvider.notifier).stop();
    _chess.clearMoveEvaluations();

    _chess.setLifecycle(GameLifecycle.initializing);

    try {
      final validPosition = await resolvePosition(
        phase: gamePhase,
        side: side,
        api: ref.read(apiClientProvider),
        theme: theme,
        excludePositionId: excludePositionId,
      );

      if (thisGeneration != _gameGeneration || _disposed) return;

      _currentMetadata = validPosition;

      _chess.startGame(
        mode: GameMode.training,
        playerColor: side,
        opponentType: OpponentType.ai,
        difficulty: difficulty,
        trainingGamePhase: gamePhase,
        trainingStartEval: validPosition.startingEval,
        trainingPositionId: validPosition.positionId,
        trainingTheme: validPosition.theme,
        fen: validPosition.fen,
      );

      final opponentSide = side == Side.w ? Side.b : Side.w;

      await Future.wait([
        _engine.initEval(),
        _engine.init(difficulty, opponentSide),
      ]);

      if (thisGeneration != _gameGeneration || _disposed) return;

      _chess.setLifecycle(GameLifecycle.playing);
      _audio.playGameStart();

      if (validPosition.sideToMove != side) {
        unawaited(_performAIMove());
      }
    } catch (e) {
      if (thisGeneration != _gameGeneration || _disposed) return;
      _chess.setInitError(e.toString());
      _chess.setLifecycle(GameLifecycle.error);
    }
  }

  Future<void> _performAIMove() async {
    final state = ref.read(chessProvider);
    if (state.lifecycle != GameLifecycle.playing ||
        state.currentTurn == state.playerColor ||
        ref.read(engineProvider).isThinking) {
      return;
    }

    try {
      final fenAtStart = state.fen;
      final move = await _engine.getMove(state.fen);
      if (move == null || _disposed) return;

      final currentState = ref.read(chessProvider);
      if (currentState.fen != fenAtStart ||
          currentState.lifecycle != GameLifecycle.playing) {
        return;
      }

      // Natural delay for training mode
      await Future.delayed(
        Duration(milliseconds: 500 + Random().nextInt(1000)),
      );

      final freshState = ref.read(chessProvider);
      if (freshState.fen != fenAtStart ||
          freshState.lifecycle != GameLifecycle.playing ||
          _disposed) {
        return;
      }

      _chess.applyMove(move.from, move.to, promotion: move.promotion);
      playMoveAudio(ref.read(chessProvider));

      if (!ref.read(chessProvider).isGameOver) {
        _afterMoveChecks();
      }
    } catch (e) {
      if (kDebugMode) debugPrint('TrainingGameController._performAIMove: $e');
    }
  }

  void _afterMoveChecks() {
    final state = ref.read(chessProvider);
    if (state.isGameOver) return;

    final reason = getTerminationReason(
      phase: _currentPhase,
      halfMoveCount: state.moveHistory.length,
      isCheckmate: false,
      isStalemate: false,
      isDraw: false,
    );

    if (reason != null) {
      _endTrainingSession(reason);
    }
  }

  Future<void> _endTrainingSession(TrainingEndReason reason) async {
    final state = ref.read(chessProvider);

    double? finalEval;
    try {
      finalEval = await _engine.getEval(state.fen);
    } catch (e) {
      if (kDebugMode) {
        debugPrint('TrainingGameController._endTrainingSession eval: $e');
      }
    }

    bool? playerWon;
    if (reason == TrainingEndReason.checkmate) {
      playerWon =
          state.gameWinner ==
          (state.playerColor == Side.w ? GameWinner.w : GameWinner.b);
    }

    final scoreResult = calculateEvalDifferentialScore(
      startEval: _currentMetadata?.startingEval,
      finalEval: finalEval != null ? finalEval * 100 : null,
      playerSide: state.playerColor,
      endReason: reason,
      playerWon: playerWon,
    );

    final GameOverReason gameOverReason;
    switch (reason) {
      case TrainingEndReason.checkmate:
        gameOverReason = GameOverReason.checkmate;
      case TrainingEndReason.stalemate:
        gameOverReason = GameOverReason.stalemate;
      case TrainingEndReason.draw:
        gameOverReason = GameOverReason.stalemate;
      case TrainingEndReason.resignation:
        gameOverReason = GameOverReason.resignation;
      case TrainingEndReason.moveLimit:
        gameOverReason = GameOverReason.time;
    }

    GameWinner? winner;
    if (reason == TrainingEndReason.checkmate && playerWon != null) {
      winner = playerWon
          ? (state.playerColor == Side.w ? GameWinner.w : GameWinner.b)
          : (state.playerColor == Side.w ? GameWinner.b : GameWinner.w);
    }

    _chess.endGame(gameOverReason, winner, evalScore: scoreResult.score);
    _audio.playGameEnd();
    _haptics.onGameEnd();

    ref.read(timerProvider.notifier).stop();
  }

  @override
  void onMove(String from, String to, {String? promotion}) {
    final state = ref.read(chessProvider);
    if (state.lifecycle != GameLifecycle.playing) return;
    if (state.currentTurn != state.playerColor) return;

    final success = _chess.applyMove(from, to, promotion: promotion);
    if (!success) {
      _audio.playIllegalMove();
      return;
    }
    playMoveAudio(ref.read(chessProvider));

    if (!ref.read(chessProvider).isGameOver) {
      _afterMoveChecks();
    }

    final afterState = ref.read(chessProvider);
    if (!afterState.isGameOver &&
        afterState.currentTurn != afterState.playerColor) {
      unawaited(_performAIMove());
    }
  }

  @override
  void onResign() {
    final state = ref.read(chessProvider);
    if (state.lifecycle != GameLifecycle.playing) return;
    _endTrainingSession(TrainingEndReason.resignation);
  }

  @override
  void onNewGame() {
    final state = ref.read(chessProvider);
    startNewGame(
      side: state.playerColor,
      difficulty: ref.read(engineProvider).difficulty,
      gamePhase: state.training.gamePhase ?? GamePhase.opening,
      theme: state.training.theme,
      excludePositionId: state.training.positionId,
    );
  }

  @override
  void onExitGame() {
    _disposed = true;
    _engine.terminate();
    _chess.exitGame();
    ref.read(timerProvider.notifier).stop();
  }

  @override
  void dispose() {
    _disposed = true;
    _engine.terminate();
  }
}

final trainingGameControllerProvider = Provider<TrainingGameController>((ref) {
  final controller = TrainingGameController(ref);
  ref.onDispose(controller.dispose);
  return controller;
});
