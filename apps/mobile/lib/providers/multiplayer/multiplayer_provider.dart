import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/game_types.dart';
import '../../models/multiplayer_events.dart';
import '../../models/sync_types.dart';
import '../../services/sync/game_sync_service.dart'
    show GameSyncService, gameSyncServiceProvider;
import '../../services/sync/reconnect_store.dart';
import 'multiplayer_state.dart';

export 'multiplayer_state.dart';

typedef MultiplayerEventHandler = void Function(MultiplayerEvent event);

class MultiplayerNotifier extends Notifier<MultiplayerState> {
  void Function()? _unsubscribe;
  final List<MultiplayerEventHandler> _eventHandlers = [];

  GameSyncService get _sync => ref.read(gameSyncServiceProvider);

  @override
  MultiplayerState build() {
    ref.onDispose(() {
      _unsubscribe?.call();
    });
    return const MultiplayerState();
  }

  void Function() onEvent(MultiplayerEventHandler handler) {
    _eventHandlers.add(handler);
    return () => _eventHandlers.remove(handler);
  }

  void _emit(MultiplayerEvent event) {
    for (final handler in List.of(_eventHandlers)) {
      handler(event);
    }
  }

  void connect() {
    unawaited(_sync.connect());
    state = state.copyWith(isConnected: true);

    _unsubscribe ??= _sync.onEvent(_handleSyncEvent);
  }

  void disconnect() {
    _sync.disconnect();
    state = state.copyWith(isConnected: false);
  }

  void createGame({
    required int timeControlMinutes,
    int increment = 0,
    bool rated = false,
  }) {
    connect();
    _sync.createGame(
      initialTimeSeconds: timeControlMinutes * 60,
      increment: increment,
      rated: rated,
    );
    state = state.copyWith(isWaiting: true);
  }

  void joinGame(String gameId) {
    connect();
    _sync.joinGame(gameId);
    state = state.copyWith(gameId: gameId, isWaiting: true);
  }

  void reconnectGame(String gameId) {
    connect();
    _sync.reconnectGame(gameId);
    state = state.copyWith(gameId: gameId, isWaiting: false);
  }

  Future<void> attemptReconnect() async {
    if (state.gameId != null) {
      // Already tracking a game — ensure transport is connected and re-send GAME_RECONNECT
      if (!_sync.isConnected) {
        connect();
        _sync.reconnectGame(state.gameId!);
      }
      return;
    }
    final activeGame = await loadActiveGame();
    if (activeGame != null) {
      reconnectGame(activeGame.gameId);
    }
  }

  void sendMove(String from, String to, [String? promotion]) {
    if (state.gameId != null) {
      _sync.sendMove(state.gameId!, from, to, promotion);
    }
  }

  void resign() {
    if (state.gameId != null) {
      _sync.resign(state.gameId!);
    }
  }

  void leave() {
    if (state.gameId != null) {
      _sync.leaveGame(state.gameId!);
    }
    _unsubscribe?.call();
    _unsubscribe = null;
    state = const MultiplayerState();
  }

  void setGameStarted(String gameId, String? opponent) {
    state = state.copyWith(
      gameId: gameId,
      opponentUsername: opponent,
      isWaiting: false,
    );
  }

  void _handleSyncEvent(String type, Map<String, dynamic>? data) {
    try {
      _dispatchSyncEvent(type, data);
    } catch (e) {
      if (kDebugMode) {
        debugPrint('MultiplayerNotifier._handleSyncEvent error: $e');
      }
      _emit(GameErrorEvent('Failed to process server message'));
    }
  }

  void _dispatchSyncEvent(String type, Map<String, dynamic>? data) {
    switch (type) {
      case 'game:created':
        if (data != null) {
          final parsed = GameCreatedData.fromJson(data);
          final color = parsed.color == 'white' ? Side.w : Side.b;
          state = state.copyWith(
            gameId: parsed.gameId,
            playerColor: color,
            isWaiting: true,
          );
          _emit(GameCreatedEvent(gameId: parsed.gameId, playerColor: color));
        }

      case 'game:joined':
        if (data != null) {
          final parsed = GameJoinedData.fromJson(data);
          final color = parsed.color == 'white' ? Side.w : Side.b;
          state = state.copyWith(
            gameId: parsed.gameId,
            playerColor: color,
            opponentUsername: parsed.opponent,
            isWaiting: false,
          );
          _emit(
            GameJoinedEvent(
              gameId: parsed.gameId,
              playerColor: color,
              opponent: parsed.opponent,
            ),
          );
        }

      case 'game:started':
        if (data != null) {
          final parsed = GameStartedData.fromJson(data);
          final isWhite = state.playerColor == Side.w;
          final opponent = isWhite
              ? parsed.blackPlayer.username
              : parsed.whitePlayer.username;
          state = state.copyWith(
            gameId: parsed.gameId,
            opponentUsername: opponent,
            isWaiting: false,
          );
          _emit(
            GameStartedEvent(
              gameId: parsed.gameId,
              opponent: opponent,
              whiteTime: parsed.whiteTimeMs,
              blackTime: parsed.blackTimeMs,
            ),
          );
        }

      case 'game:move_accepted':
        if (data != null) {
          _emit(MoveAcceptedEvent(MoveAcceptedData.fromJson(data)));
        }

      case 'game:move_rejected':
        if (data != null) {
          _emit(MoveRejectedEvent(MoveRejectedData.fromJson(data)));
        }

      case 'game:opponent_move':
        if (data != null) {
          _emit(OpponentMoveEvent(OpponentMoveData.fromJson(data)));
        }

      case 'game:time_update':
        if (data != null) {
          _emit(TimeUpdateEvent(TimeUpdateData.fromJson(data)));
        }

      case 'game:ended':
        if (data != null) {
          final parsed = GameEndedData.fromJson(data);
          GameWinner? winner;
          if (parsed.result == 'white') winner = GameWinner.w;
          if (parsed.result == 'black') winner = GameWinner.b;
          if (parsed.result == 'draw') winner = GameWinner.draw;

          state = state.copyWith(gameId: null);
          _emit(
            GameEndedEvent(
              winner: winner,
              reason: _parseReason(parsed.reason),
              whiteRatingDelta: parsed.whiteRatingDelta,
              blackRatingDelta: parsed.blackRatingDelta,
              whiteRating: parsed.whiteRating,
              blackRating: parsed.blackRating,
              whiteNewAchievements: parsed.whiteNewAchievements,
              blackNewAchievements: parsed.blackNewAchievements,
            ),
          );
        }

      case 'game:not_found':
      case 'game:full':
        state = state.copyWith(gameId: null, isWaiting: false);
        _emit(
          GameErrorEvent(
            type == 'game:not_found' ? 'Game not found' : 'Game is full',
          ),
        );

      case 'game:reconnected':
        if (data != null) {
          final parsed = GameReconnectedData.fromJson(data);
          final color = parsed.color == 'white' ? Side.w : Side.b;
          state = state.copyWith(
            gameId: parsed.gameId,
            playerColor: color,
            opponentUsername: parsed.opponent.username,
            isWaiting: false,
            opponentDisconnected: false,
          );
          _emit(
            GameReconnectedEvent(
              gameId: parsed.gameId,
              playerColor: color,
              fen: parsed.fen,
              uciMoveHistory: parsed.moveHistory,
              whiteTime: parsed.whiteTimeMs,
              blackTime: parsed.blackTimeMs,
              opponent: parsed.opponent.username,
              rated: parsed.rated,
            ),
          );
        }

      case 'game:opponent_disconnected':
        state = state.copyWith(opponentDisconnected: true);
        _emit(OpponentDisconnectedEvent());

      case 'game:opponent_reconnected':
        state = state.copyWith(opponentDisconnected: false);
        _emit(OpponentReconnectedEvent());

      case 'connection:state_changed':
        final current = data?['currentState'] as String?;
        state = state.copyWith(isConnected: current == 'connected');

      case 'error':
        final message = data?['message'] as String? ?? 'Connection error';
        _emit(GameErrorEvent(message));
    }
  }

  GameOverReason? _parseReason(String reason) {
    return switch (reason) {
      'checkmate' => GameOverReason.checkmate,
      'stalemate' => GameOverReason.stalemate,
      'timeout' => GameOverReason.time,
      'resignation' => GameOverReason.resignation,
      'disconnection' => GameOverReason.disconnection,
      'abandonment' => GameOverReason.abandonment,
      'insufficient_material' => GameOverReason.insufficientMaterial,
      'threefold_repetition' => GameOverReason.threefoldRepetition,
      'fifty_move_rule' => GameOverReason.fiftyMoveRule,
      _ => null,
    };
  }
}

final multiplayerProvider =
    NotifierProvider<MultiplayerNotifier, MultiplayerState>(
      MultiplayerNotifier.new,
    );
