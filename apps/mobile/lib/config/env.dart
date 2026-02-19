class Env {
  static const String callbackUrlScheme = 'nxtchess';

  static const String backendUrl = String.fromEnvironment(
    'BACKEND_URL',
    defaultValue: 'http://localhost:8080',
  );

  static const String environment = String.fromEnvironment(
    'ENV',
    defaultValue: 'development',
  );

  static const bool debug = bool.fromEnvironment('DEBUG');

  static bool get isProd => environment == 'production';
  static bool get isStaging => environment == 'staging';
  static bool get isDev => environment == 'development';

  static String get wsUrl {
    final uri = Uri.parse(backendUrl);
    final scheme = uri.scheme == 'https' ? 'wss' : 'ws';
    final authority = uri.hasPort ? '${uri.host}:${uri.port}' : uri.host;
    return '$scheme://$authority/ws';
  }

  static String get authUrl => '$backendUrl/auth';

  static void assertProductionConfig() {
    if (isProd && backendUrl.contains('localhost')) {
      throw StateError(
        'Production build pointing at localhost. '
        'Pass --dart-define=BACKEND_URL=https://api.nxtchess.com',
      );
    }
    if (isProd && !backendUrl.startsWith('https')) {
      throw StateError(
        'Production build requires HTTPS backend URL. '
        'Got: $backendUrl',
      );
    }
  }
}
