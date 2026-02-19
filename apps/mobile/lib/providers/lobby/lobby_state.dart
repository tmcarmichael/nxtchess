import 'package:freezed_annotation/freezed_annotation.dart';
import '../../models/sync_types.dart';

part 'lobby_state.freezed.dart';

@freezed
sealed class LobbyState with _$LobbyState {
  const factory LobbyState({
    @Default([]) List<LobbyGame> games,
    @Default(false) bool isSubscribed,
    @Default(false) bool isLoading,
  }) = _LobbyState;
}
