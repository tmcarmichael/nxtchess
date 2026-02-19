import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/env.dart';
import '../../models/sync_types.dart';
import '../api/api_client.dart';
import '../network/reconnecting_websocket.dart';

typedef SyncEventHandler =
    void Function(String type, Map<String, dynamic>? data);

class GameSyncService {
  final ReconnectingWebSocket _socket;
  final ApiClient _api;
  Timer? _pingTimer;
  String? _currentGameId;
  final List<Map<String, dynamic>> _messageQueue = [];
  final Set<SyncEventHandler> _eventHandlers = {};

  GameSyncService(this._api) : _socket = ReconnectingWebSocket(Env.wsUrl) {
    _socket.onStateChange = _handleStateChange;
    _socket.onMessage = _processMessage;
    _socket.onError = (_) {
      _emitEvent('error', {'code': 'WS_ERROR', 'message': 'WebSocket error'});
    };
  }

  WsConnectionState get connectionState => _socket.state;
  bool get isConnected => _socket.isConnected;
  String? get currentGameId => _currentGameId;

  Future<void> connect([String? serverUrl]) async {
    if (serverUrl != null) {
      _socket.setUrl(serverUrl);
    }
    final token = await _api.getSessionToken();
    if (token != null) {
      _socket.setHeaders({'Cookie': 'session_token=$token'});
    }
    unawaited(_socket.connect());
  }

  void disconnect() {
    _stopPing();
    _socket.disconnect();
    _currentGameId = null;
    _messageQueue.clear();
  }

  void dispose() {
    disconnect();
    _eventHandlers.clear();
    _socket.dispose();
  }

  void createGame({
    int? initialTimeSeconds,
    int increment = 0,
    bool rated = false,
  }) {
    _send({
      'type': WsMessageTypes.gameCreate,
      'data': {
        if (initialTimeSeconds != null)
          'timeControl': {
            'initialTime': initialTimeSeconds,
            'increment': increment,
          },
        'rated': rated,
      },
    });
  }

  void joinGame(String gameId) {
    _send({
      'type': WsMessageTypes.gameJoin,
      'data': {'gameId': gameId},
    });
  }

  void leaveGame(String gameId) {
    _send({
      'type': WsMessageTypes.gameLeave,
      'data': {'gameId': gameId},
    });
    if (_currentGameId == gameId) {
      _currentGameId = null;
    }
  }

  void reconnectGame(String gameId) {
    _currentGameId = gameId;
    _send({
      'type': WsMessageTypes.gameReconnect,
      'data': {'gameId': gameId},
    });
  }

  void sendMove(String gameId, String from, String to, [String? promotion]) {
    _send({
      'type': WsMessageTypes.move,
      'data': {
        'gameId': gameId,
        'from': from,
        'to': to,
        'promotion': ?promotion,
      },
    });
  }

  void resign(String gameId) {
    _send({
      'type': WsMessageTypes.resign,
      'data': {'gameId': gameId},
    });
  }

  void subscribeLobby() {
    _send({'type': WsMessageTypes.lobbySubscribe});
  }

  void unsubscribeLobby() {
    _send({'type': WsMessageTypes.lobbyUnsubscribe});
  }

  void Function() onEvent(SyncEventHandler handler) {
    _eventHandlers.add(handler);
    return () => _eventHandlers.remove(handler);
  }

  void _handleStateChange(
    WsConnectionState newState,
    WsConnectionState previous,
  ) {
    _emitEvent('connection:state_changed', {
      'previousState': previous.name,
      'currentState': newState.name,
    });

    if (newState == WsConnectionState.connected) {
      _startPing();
      _flushMessageQueue();
      if (previous == WsConnectionState.reconnecting &&
          _currentGameId != null) {
        reconnectGame(_currentGameId!);
      }
    } else {
      _stopPing();
    }
  }

  void _processMessage(dynamic message) {
    if (message is! Map<String, dynamic>) return;
    final type = message['type'] as String?;
    final data = message['data'] as Map<String, dynamic>?;
    if (type == null) return;

    switch (type) {
      case WsMessageTypes.pong:
        break;
      case WsMessageTypes.gameCreated:
        _currentGameId = data?['gameId'] as String?;
        _emitEvent('game:created', data);
      case WsMessageTypes.gameJoined:
        _currentGameId = data?['gameId'] as String?;
        _emitEvent('game:joined', data);
      case WsMessageTypes.gameStarted:
        _currentGameId = data?['gameId'] as String?;
        _emitEvent('game:started', data);
      case WsMessageTypes.gameNotFound:
        _emitEvent('game:not_found', data);
      case WsMessageTypes.gameFull:
        _emitEvent('game:full', data);
      case WsMessageTypes.gameEnded:
        _emitEvent('game:ended', data);
        _currentGameId = null;
      case WsMessageTypes.moveAccepted:
        _emitEvent('game:move_accepted', data);
      case WsMessageTypes.moveRejected:
        _emitEvent('game:move_rejected', data);
      case WsMessageTypes.opponentMove:
        _emitEvent('game:opponent_move', data);
      case WsMessageTypes.timeUpdate:
        _emitEvent('game:time_update', data);
      case WsMessageTypes.gameReconnected:
        _currentGameId = data?['gameId'] as String?;
        _emitEvent('game:reconnected', data);
      case WsMessageTypes.opponentDisconnected:
        _emitEvent('game:opponent_disconnected', data);
      case WsMessageTypes.opponentReconnected:
        _emitEvent('game:opponent_reconnected', data);
      case WsMessageTypes.lobbyList:
        _emitEvent('lobby:list', data);
      case WsMessageTypes.lobbyUpdate:
        _emitEvent('lobby:update', data);
      case WsMessageTypes.error:
        _emitEvent('error', data);
    }
  }

  void _send(Map<String, dynamic> message) {
    final sent = _socket.send(message);
    if (!sent) {
      final state = _socket.state;
      if (state == WsConnectionState.connecting ||
          state == WsConnectionState.reconnecting) {
        _messageQueue.add(message);
      }
    }
  }

  void _flushMessageQueue() {
    if (_messageQueue.isEmpty) return;
    final pending = List<Map<String, dynamic>>.of(_messageQueue);
    _messageQueue.clear();
    for (final message in pending) {
      final sent = _socket.send(message);
      if (!sent) {
        _messageQueue.add(message);
      }
    }
  }

  void _startPing() {
    _stopPing();
    _pingTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      _socket.send({'type': WsMessageTypes.ping});
    });
  }

  void _stopPing() {
    _pingTimer?.cancel();
    _pingTimer = null;
  }

  void _emitEvent(String type, Map<String, dynamic>? data) {
    for (final handler in Set.of(_eventHandlers)) {
      try {
        handler(type, data);
      } catch (e) {
        if (kDebugMode) {
          debugPrint('GameSyncService._emitEvent handler error: $e');
        }
      }
    }
  }
}

final gameSyncServiceProvider = Provider<GameSyncService>((ref) {
  final api = ref.read(apiClientProvider);
  final service = GameSyncService(api);
  ref.onDispose(service.dispose);
  return service;
});
