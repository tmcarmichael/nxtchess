import 'package:freezed_annotation/freezed_annotation.dart';

part 'settings_state.freezed.dart';

@freezed
sealed class SettingsState with _$SettingsState {
  const factory SettingsState({
    @Default(true) bool soundEnabled,
    @Default(true) bool hapticsEnabled,
    @Default(true) bool showCoordinates,
    @Default(true) bool showLegalMoves,
    @Default(false) bool autoQueen,
  }) = _SettingsState;
}
