import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_web_auth_2/flutter_web_auth_2.dart';
import '../../config/env.dart' show Env;
import '../api/api_client.dart';

class AuthService {
  final ApiClient _api;

  AuthService(this._api);

  Future<({bool success, bool hasUsername})> signInWithProvider(
    String provider,
  ) async {
    try {
      final authUrl = '${Env.authUrl}/$provider/login?mobile=true';

      final result = await FlutterWebAuth2.authenticate(
        url: authUrl,
        callbackUrlScheme: Env.callbackUrlScheme,
      );

      final uri = Uri.parse(result);
      final token = uri.queryParameters['token'];
      if (token != null) {
        final cookieUri = Uri.parse(Env.backendUrl);
        final cookie = Cookie('session_token', token)
          ..domain = cookieUri.host
          ..path = '/'
          ..secure = cookieUri.scheme == 'https';
        await _api.cookieJar.saveFromResponse(cookieUri, [cookie]);
        final hasUsername = uri.queryParameters['has_username'] == 'true';
        return (success: true, hasUsername: hasUsername);
      }
      return (success: false, hasUsername: false);
    } catch (e) {
      if (kDebugMode) debugPrint('AuthService error: $e');
      return (success: false, hasUsername: false);
    }
  }

  Future<bool> checkSession() async {
    try {
      final response = await _api.get('/check-username');
      return response.statusCode == 200;
    } catch (e) {
      if (kDebugMode) debugPrint('AuthService error: $e');
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await _api.post('/auth/logout');
    } catch (e) {
      if (kDebugMode) debugPrint('AuthService.logout: $e');
    }
    await _api.cookieJar.deleteAll();
  }
}

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService(ref.read(apiClientProvider));
});
