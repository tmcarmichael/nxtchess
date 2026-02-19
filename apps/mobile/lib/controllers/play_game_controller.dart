import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/game_types.dart';
import '../models/multiplayer_events.dart';
import '../providers/chess/chess_provider.dart';
import '../providers/engine/engine_provider.dart';
import '../providers/multiplayer/multiplayer_provider.dart';
import '../providers/timer/timer_provider.dart';
import '../providers/ui/ui_provider.dart';
import '../services/audio/audio_service.dart';
import '../services/haptics/haptics_service.dart';
import '../services/sync/reconnect_store.dart';
import 'game_controller.dart';

class PlayGameController extends GameController {
  @override
  final Ref ref;
  final List<void Function()> _disposers = [];
  bool _moveInFlight = false;

  PlayGameController(this.ref);

  @override
  GameMode get mode => GameMode.play;

  ChessNotifier get _chess => ref.read(chessProvider.notifier);
  TimerNotifier get _timer => ref.read(timerProvider.notifier);
  EngineNotifier get _engine => ref.read(engineProvider.notifier);
  UINotifier get _ui => ref.read(uiProvider.notifier);
  MultiplayerNotifier get _multiplayer =>
      ref.read(multiplayerProvider.notifier);
  AudioService get _audio => ref.read(audioServiceProvider);
  HapticsService get _haptics => ref.read(hapticsServiceProvider);

  Future<void> startAIGame({
    required Side playerColor,
    required int difficulty,
    required int timeControlMinutes,
    int incrementSeconds = 0,
  }) async {
    final aiSide = playerColor == Side.w ? Side.b : Side.w;

    _chess.startGame(
      mode: GameMode.play,
      playerColor: playerColor,
      opponentType: OpponentType.ai,
      difficulty: difficulty,
    );

    _timer.reset(timeControlMinutes, incrementSeconds: incrementSeconds);

    await _engine.init(difficulty, aiSide);

    _timer.start(
      () => ref.read(chessProvider).currentTurn,
      (side) => _chess.endGame(
        GameOverReason.time,
        side == Side.w ? GameWinner.b : GameWinner.w,
      ),
      onLowTime: _handleLowTime,
    );
    _audio.playGameStart();

    if (playerColor == Side.b) {
      unawaited(_triggerAIMove());
    }
  }

  void startMultiplayerGame({
    required int timeControlMinutes,
    int incrementSeconds = 0,
    bool rated = false,
  }) {
    _chess.resetForMultiplayer(GameMode.play);
    _multiplayer.createGame(
      timeControlMinutes: timeControlMinutes,
      increment: incrementSeconds,
      rated: rated,
    );
    _subscribeMultiplayerEvents();
  }

  void joinMultiplayerGame(String gameId) {
    _chess.resetForMultiplayer(GameMode.play);
    _multiplayer.joinGame(gameId);
    _subscribeMultiplayerEvents();
  }

  void reconnectToGame(String gameId, Side playerColor) {
    _chess.resetForMultiplayer(GameMode.play);
    _chess.setPlayerColor(playerColor);
    _multiplayer.reconnectGame(gameId);
    _subscribeMultiplayerEvents();
  }

  void _subscribeMultiplayerEvents() {
    // Unsubscribe existing to prevent duplicate handlers on reconnect
    for (final d in _disposers) {
      d();
    }
    _disposers.clear();
    _disposers.add(
      _multiplayer.onEvent((event) {
        switch (event) {
          case GameCreatedEvent(:final gameId, :final playerColor):
            _chess.setPlayerColor(playerColor);
            saveActiveGame(
              ActiveGameInfo(gameId: gameId, playerColor: playerColor),
            );

          case GameJoinedEvent(:final playerColor):
            _chess.setPlayerColor(playerColor);

          case GameStartedEvent(
            :final gameId,
            :final whiteTime,
            :final blackTime,
          ):
            _chess.setLifecycle(GameLifecycle.playing);
            _audio.playGameStart();
            _timer.sync(whiteTime, blackTime);
            _timer.start(
              () => ref.read(chessProvider).currentTurn,
              (side) => _chess.endGame(
                GameOverReason.time,
                side == Side.w ? GameWinner.b : GameWinner.w,
              ),
              onLowTime: _handleLowTime,
            );
            saveActiveGame(
              ActiveGameInfo(
                gameId: gameId,
                playerColor: ref.read(chessProvider).playerColor,
              ),
            );

          case MoveAcceptedEvent(:final data):
            _moveInFlight = false;
            _chess.confirmMove(
              serverFen: data.fen,
              from: data.from,
              to: data.to,
            );
            _timer.sync(data.whiteTimeMs, data.blackTimeMs);

          case MoveRejectedEvent(:final data):
            _moveInFlight = false;
            _chess.rejectMove(data.fen, data.reason);
            _audio.playIllegalMove();

          case OpponentMoveEvent(:final data):
            _chess.syncFromMultiplayer(
              fen: data.fen,
              san: data.san,
              from: data.from,
              to: data.to,
              isCheck: data.isCheck,
            );
            _timer.sync(data.whiteTimeMs, data.blackTimeMs);
            if (data.isCheck == true) {
              _audio.playCheck();
              _haptics.onCheck();
            } else {
              _audio.playMoveSound(isCapture: data.san.contains('x'));
              _haptics.onMove();
            }

          case TimeUpdateEvent(:final data):
            _timer.sync(data.whiteTime, data.blackTime);

          case GameEndedEvent(:final winner, :final reason):
            _timer.stop();
            _chess.endGame(reason ?? GameOverReason.resignation, winner);
            _audio.playGameEnd();
            _haptics.onGameEnd();
            _ui.showEndDialog();
            clearActiveGame();

          case GameReconnectedEvent(
            :final playerColor,
            :final fen,
            :final uciMoveHistory,
            :final whiteTime,
            :final blackTime,
          ):
            _chess.setPlayerColor(playerColor);
            _chess.hydrateFromReconnect(fen, uciMoveHistory);
            _timer.sync(whiteTime, blackTime);
            _timer.start(
              () => ref.read(chessProvider).currentTurn,
              (side) => _chess.endGame(
                GameOverReason.time,
                side == Side.w ? GameWinner.b : GameWinner.w,
              ),
              onLowTime: _handleLowTime,
            );

          case GameErrorEvent(:final message):
            _chess.setInitError(message);

          case OpponentDisconnectedEvent():
          case OpponentReconnectedEvent():
            break;
        }
      }),
    );
  }

  @override
  void onMove(String from, String to, {String? promotion}) {
    final chessState = ref.read(chessProvider);
    if (chessState.opponentType == OpponentType.ai) {
      _handleAIGameMove(from, to, promotion: promotion);
    } else {
      _handleMultiplayerMove(from, to, promotion: promotion);
    }
  }

  void _handleAIGameMove(String from, String to, {String? promotion}) {
    final success = _chess.applyMove(from, to, promotion: promotion);
    if (!success) {
      _audio.playIllegalMove();
      return;
    }

    final chessState = ref.read(chessProvider);
    playMoveAudio(chessState);
    _timer.addIncrement(chessState.playerColor);

    if (chessState.isGameOver) {
      _timer.stop();
      _audio.playGameEnd();
      _haptics.onGameEnd();
      _ui.showEndDialog();
      return;
    }

    _triggerAIMove();
  }

  void _handleMultiplayerMove(String from, String to, {String? promotion}) {
    if (_moveInFlight) return;

    final success = _chess.applyOptimisticMove(from, to, promotion: promotion);
    if (!success) {
      _audio.playIllegalMove();
      return;
    }
    _moveInFlight = true;
    final chessState = ref.read(chessProvider);
    playMoveAudio(chessState);
    _multiplayer.sendMove(from, to, promotion);
  }

  Future<void> _triggerAIMove() async {
    try {
      final chessState = ref.read(chessProvider);
      final fenAtStart = chessState.fen;
      final move = await _engine.getMove(fenAtStart);
      if (move == null) return;

      // Guard against stale state after async gap
      final currentState = ref.read(chessProvider);
      if (currentState.lifecycle != GameLifecycle.playing) return;
      if (currentState.fen != fenAtStart) return;

      final success = _chess.applyMove(
        move.from,
        move.to,
        promotion: move.promotion,
      );
      if (!success) return;

      final newState = ref.read(chessProvider);
      playMoveAudio(newState);

      final aiSide = ref.read(engineProvider).aiSide;
      _timer.addIncrement(aiSide);

      if (newState.isGameOver) {
        _timer.stop();
        _audio.playGameEnd();
        _haptics.onGameEnd();
        _ui.showEndDialog();
      }
    } on StateError catch (e) {
      if (kDebugMode) debugPrint('_triggerAIMove engine error: $e');
    } on TimeoutException catch (e) {
      if (kDebugMode) debugPrint('_triggerAIMove timeout: $e');
    }
  }

  @override
  void onResign() {
    final chessState = ref.read(chessProvider);
    if (chessState.opponentType == OpponentType.human) {
      _multiplayer.resign();
    } else {
      _chess.resign();
      _timer.stop();
      _ui.showEndDialog();
    }
  }

  @override
  void onNewGame() {
    _cleanup();
    _ui.reset();
    _ui.showSetupSheet();
  }

  @override
  void onExitGame() {
    _cleanup();
    _ui.reset();
  }

  void _handleLowTime(Side side) {
    if (side == ref.read(chessProvider).playerColor) {
      _audio.playLowTime();
    }
  }

  void _cleanup() {
    _chess.exitGame();
    _timer.stop();
    _engine.terminate();
    _multiplayer.leave();
    for (final d in _disposers) {
      d();
    }
    _disposers.clear();
    clearActiveGame();
  }

  @override
  void dispose() {
    _cleanup();
  }
}

final playGameControllerProvider = Provider<PlayGameController>((ref) {
  final controller = PlayGameController(ref);
  ref.onDispose(controller.dispose);
  return controller;
});
