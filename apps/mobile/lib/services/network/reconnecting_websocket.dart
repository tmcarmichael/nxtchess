import 'dart:async';
import 'dart:convert';
import 'dart:math';

import 'package:flutter/foundation.dart';
import 'package:web_socket_channel/io.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

enum WsConnectionState { disconnected, connecting, connected, reconnecting }

class ReconnectConfig {
  final int maxAttempts;
  final Duration baseDelay;
  final Duration maxDelay;
  final double backoffMultiplier;

  const ReconnectConfig({
    this.maxAttempts = 5,
    this.baseDelay = const Duration(seconds: 1),
    this.maxDelay = const Duration(seconds: 30),
    this.backoffMultiplier = 2.0,
  });
}

class ReconnectingWebSocket {
  WebSocketChannel? _channel;
  StreamSubscription<dynamic>? _subscription;
  String _url;
  final ReconnectConfig _config;
  Map<String, String>? _headers;
  WsConnectionState _state = WsConnectionState.disconnected;
  int _attemptCount = 0;
  Timer? _reconnectTimer;

  void Function(WsConnectionState state, WsConnectionState previous)?
  onStateChange;
  void Function(dynamic data)? onMessage;
  void Function(dynamic error)? onError;

  ReconnectingWebSocket(
    this._url, {
    ReconnectConfig config = const ReconnectConfig(),
    Map<String, String>? headers,
  }) : _config = config,
       _headers = headers;

  void setUrl(String url) => _url = url;
  void setHeaders(Map<String, String>? headers) => _headers = headers;
  String get url => _url;
  WsConnectionState get state => _state;
  bool get isConnected => _state == WsConnectionState.connected;
  int get attemptCount => _attemptCount;

  Future<void> connect() async {
    if (_state == WsConnectionState.connected ||
        _state == WsConnectionState.connecting) {
      return;
    }
    if (_url.isEmpty) return;

    _attemptCount = 0;
    _setState(WsConnectionState.connecting);

    try {
      _channel = IOWebSocketChannel.connect(Uri.parse(_url), headers: _headers);
      await _channel!.ready.timeout(const Duration(seconds: 10));
      _subscription = _channel!.stream.listen(
        _handleMessage,
        onError: _handleError,
        onDone: _handleDone,
      );
      _setState(WsConnectionState.connected);
    } catch (e) {
      _scheduleReconnect();
    }
  }

  void disconnect() {
    _cancelReconnect();
    _attemptCount = 0;
    _subscription?.cancel();
    _subscription = null;
    _channel?.sink.close();
    _channel = null;
    _setState(WsConnectionState.disconnected);
  }

  bool send(dynamic data) {
    if (_state != WsConnectionState.connected || _channel == null) {
      return false;
    }
    try {
      final message = data is String ? data : jsonEncode(data);
      _channel!.sink.add(message);
      return true;
    } catch (e) {
      if (kDebugMode) debugPrint('ReconnectingWebSocket.send: $e');
      return false;
    }
  }

  void resetAttemptCount() => _attemptCount = 0;

  void _handleMessage(dynamic data) {
    try {
      final parsed = jsonDecode(data as String);
      onMessage?.call(parsed);
    } catch (e) {
      if (kDebugMode) {
        debugPrint('ReconnectingWebSocket._handleMessage parse error: $e');
      }
      onMessage?.call(data);
    }
  }

  void _handleError(dynamic error) {
    onError?.call(error);
  }

  void _handleDone() {
    _channel = null;
    _subscription = null;
    _scheduleReconnect();
  }

  void _scheduleReconnect() {
    if (_attemptCount >= _config.maxAttempts) {
      _setState(WsConnectionState.disconnected);
      return;
    }

    _cancelReconnect();
    _setState(WsConnectionState.reconnecting);
    _attemptCount++;

    final delay = _calculateBackoff();
    _reconnectTimer = Timer(delay, () {
      if (_state == WsConnectionState.reconnecting) {
        connect();
      }
    });
  }

  static final _random = Random();

  Duration _calculateBackoff() {
    final ms =
        _config.baseDelay.inMilliseconds *
        pow(_config.backoffMultiplier, _attemptCount - 1);
    final clamped = ms.clamp(0, _config.maxDelay.inMilliseconds).toInt();
    final jittered = (clamped * (0.5 + _random.nextDouble() * 0.5)).toInt();
    return Duration(milliseconds: jittered);
  }

  void _cancelReconnect() {
    _reconnectTimer?.cancel();
    _reconnectTimer = null;
  }

  void dispose() {
    disconnect();
    onStateChange = null;
    onMessage = null;
    onError = null;
  }

  void _setState(WsConnectionState newState) {
    final previous = _state;
    if (previous == newState) return;
    _state = newState;
    onStateChange?.call(newState, previous);
  }
}
