import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app.dart';
import 'config/env.dart';
import 'services/api/api_client.dart';
import 'services/audio/audio_service.dart';
import 'services/haptics/haptics_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  Env.assertProductionConfig();

  FlutterError.onError = (details) {
    FlutterError.presentError(details);
    if (kDebugMode) {
      debugPrint('FlutterError: ${details.exception}\n${details.stack}');
    }
  };

  PlatformDispatcher.instance.onError = (error, stack) {
    if (kDebugMode) debugPrint('Uncaught error: $error\n$stack');
    return true;
  };

  final api = ApiClient();
  final audio = AudioService();
  final haptics = HapticsService();

  await api.init();
  await Future.wait([
    audio.init().catchError((e) {
      if (kDebugMode) debugPrint('Audio init failed: $e');
    }),
    haptics.init().catchError((e) {
      if (kDebugMode) debugPrint('Haptics init failed: $e');
    }),
  ]);

  runApp(
    ProviderScope(
      overrides: [
        apiClientProvider.overrideWithValue(api),
        audioServiceProvider.overrideWithValue(audio),
        hapticsServiceProvider.overrideWithValue(haptics),
      ],
      child: const NxtChessApp(),
    ),
  );
}
