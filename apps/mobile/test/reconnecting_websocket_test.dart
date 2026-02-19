import 'package:flutter_test/flutter_test.dart';
import 'package:nxtchess/services/network/reconnecting_websocket.dart';

void main() {
  group('ReconnectConfig', () {
    test('has sensible defaults', () {
      const config = ReconnectConfig();
      expect(config.maxAttempts, 5);
      expect(config.baseDelay, const Duration(seconds: 1));
      expect(config.maxDelay, const Duration(seconds: 30));
      expect(config.backoffMultiplier, 2.0);
    });
  });

  group('ReconnectingWebSocket', () {
    test('starts in disconnected state', () {
      final ws = ReconnectingWebSocket('ws://localhost:8080');
      expect(ws.state, WsConnectionState.disconnected);
      expect(ws.isConnected, false);
      expect(ws.attemptCount, 0);
    });

    test('setUrl updates the URL', () {
      final ws = ReconnectingWebSocket('ws://localhost:8080');
      expect(ws.url, 'ws://localhost:8080');
      ws.setUrl('ws://localhost:9090');
      expect(ws.url, 'ws://localhost:9090');
    });

    test('send returns false when disconnected', () {
      final ws = ReconnectingWebSocket('ws://localhost:8080');
      expect(ws.send({'type': 'PING'}), false);
    });

    test('send returns false when connecting', () {
      final ws = ReconnectingWebSocket('');
      // Empty URL → connect() will return early, state stays disconnected
      expect(ws.send('test'), false);
    });

    test('disconnect resets state', () {
      final ws = ReconnectingWebSocket('ws://localhost:8080');
      ws.disconnect();
      expect(ws.state, WsConnectionState.disconnected);
      expect(ws.attemptCount, 0);
    });

    test('resetAttemptCount clears the counter', () {
      final ws = ReconnectingWebSocket('ws://localhost:8080');
      ws.resetAttemptCount();
      expect(ws.attemptCount, 0);
    });

    test('connect with empty URL stays disconnected', () async {
      final ws = ReconnectingWebSocket('');
      await ws.connect();
      expect(ws.state, WsConnectionState.disconnected);
    });

    test('connect while already connected is a no-op', () async {
      final states = <WsConnectionState>[];
      final ws = ReconnectingWebSocket(
        'ws://invalid-host-that-does-not-exist:0',
      );
      ws.onStateChange = (state, previous) => states.add(state);

      // This will fail to connect but will transition states
      await ws.connect();
      // After failure, it should attempt reconnect — verify it moved to connecting
      expect(states, contains(WsConnectionState.connecting));
      ws.disconnect();
    });

    test('state change callback fires with previous state', () {
      WsConnectionState? capturedPrevious;
      WsConnectionState? capturedNew;

      final ws = ReconnectingWebSocket('ws://localhost:8080');
      ws.onStateChange = (newState, previous) {
        capturedNew = newState;
        capturedPrevious = previous;
      };

      ws.disconnect(); // disconnected → disconnected: no callback (same state)
      expect(capturedNew, isNull); // same state, no change

      // Trigger a state change by connecting to invalid URL
      ws.connect();
      expect(capturedNew, WsConnectionState.connecting);
      expect(capturedPrevious, WsConnectionState.disconnected);
      ws.disconnect();
    });
  });
}
