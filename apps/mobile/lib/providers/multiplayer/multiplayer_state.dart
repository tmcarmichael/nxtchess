import 'package:freezed_annotation/freezed_annotation.dart';

import '../../models/game_types.dart';

part 'multiplayer_state.freezed.dart';

@freezed
sealed class MultiplayerState with _$MultiplayerState {
  const factory MultiplayerState({
    @Default(null) String? gameId,
    @Default(null) String? opponentUsername,
    @Default(null) Side? playerColor,
    @Default(false) bool isWaiting,
    @Default(false) bool isConnected,
    @Default(false) bool opponentDisconnected,
  }) = _MultiplayerState;
}
