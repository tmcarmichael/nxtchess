import 'package:freezed_annotation/freezed_annotation.dart';
import '../../models/user.dart';

part 'user_state.freezed.dart';

@freezed
sealed class UserState with _$UserState {
  const factory UserState({
    @Default(false) bool isLoggedIn,
    @Default(false) bool isLoading,
    @Default(null) String? username,
    @Default(null) int? rating,
    @Default(null) int? puzzleRating,
    @Default(null) String? profileIcon,
    @Default(null) PublicProfile? profile,
    @Default(null) String? error,
    @Default(false) bool needsUsername,
  }) = _UserState;
}
