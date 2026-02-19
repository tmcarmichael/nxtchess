import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/user.dart';
import '../../services/api/api_client.dart' show ApiClient, apiClientProvider;
import '../../services/auth/auth_service.dart'
    show AuthService, authServiceProvider;
import 'user_state.dart';

export 'user_state.dart';

class UserNotifier extends Notifier<UserState> {
  ApiClient get _api => ref.read(apiClientProvider);
  AuthService get _auth => ref.read(authServiceProvider);

  @override
  UserState build() {
    return const UserState();
  }

  Future<void> checkUserStatus() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _api.get('/check-username');
      if (response.statusCode == 200) {
        final data = response.data as Map<String, dynamic>;
        final authenticated = data['authenticated'] as bool? ?? false;
        if (!authenticated) {
          state = state.copyWith(isLoggedIn: false, isLoading: false);
          return;
        }
        final usernameSet = data['username_set'] as bool? ?? false;
        if (usernameSet) {
          final username = data['username'] as String?;
          state = state.copyWith(
            isLoggedIn: true,
            username: username,
            rating: (data['rating'] as num?)?.toInt(),
            puzzleRating: (data['puzzle_rating'] as num?)?.toInt(),
            profileIcon: data['profile_icon'] as String?,
            needsUsername: false,
            isLoading: false,
          );
        } else {
          state = state.copyWith(
            isLoggedIn: true,
            needsUsername: true,
            isLoading: false,
          );
        }
      } else {
        state = state.copyWith(isLoggedIn: false, isLoading: false);
      }
    } catch (e) {
      if (kDebugMode) debugPrint('UserNotifier.checkUserStatus: $e');
      state = state.copyWith(isLoggedIn: false, isLoading: false);
    }
  }

  Future<bool> signIn(String provider) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final result = await _auth.signInWithProvider(provider);
      if (result.success) {
        if (!result.hasUsername) {
          state = state.copyWith(
            isLoggedIn: true,
            needsUsername: true,
            isLoading: false,
          );
        } else {
          await checkUserStatus();
        }
        return true;
      }
      state = state.copyWith(isLoading: false, error: 'Sign in failed');
      return false;
    } catch (e) {
      if (kDebugMode) debugPrint('UserNotifier.signIn: $e');
      state = state.copyWith(isLoading: false, error: 'Sign in failed');
      return false;
    }
  }

  Future<bool> saveUsername(String username) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _api.post(
        '/set-username',
        data: {'username': username},
      );
      if (response.statusCode == 200) {
        state = state.copyWith(
          username: username,
          needsUsername: false,
          isLoading: false,
        );
        return true;
      }
      final message =
          (response.data as Map<String, dynamic>?)?['error'] as String? ??
          'Failed to set username';
      state = state.copyWith(isLoading: false, error: message);
      return false;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Failed to set username');
      return false;
    }
  }

  Future<void> fetchUserProfile(String username) async {
    try {
      final response = await _api.get('/api/profile/$username');
      if (response.statusCode == 200) {
        final data = response.data as Map<String, dynamic>;
        final profile = PublicProfile.fromJson(data);
        state = state.copyWith(profile: profile);
      }
    } catch (e) {
      if (kDebugMode) debugPrint('UserNotifier.fetchUserProfile: $e');
    }
  }

  Future<bool> setProfileIcon(String icon) async {
    try {
      final response = await _api.post(
        '/set-profile-icon',
        data: {'icon': icon},
      );
      if (response.statusCode == 200) {
        state = state.copyWith(profileIcon: icon);
        return true;
      }
    } catch (e) {
      if (kDebugMode) debugPrint('UserNotifier.setProfileIcon: $e');
    }
    return false;
  }

  Future<void> logout() async {
    await _auth.logout();
    state = const UserState();
  }
}

final userProvider = NotifierProvider<UserNotifier, UserState>(
  UserNotifier.new,
);
