import 'package:freezed_annotation/freezed_annotation.dart';

part 'ui_state.freezed.dart';

@freezed
sealed class UIState with _$UIState {
  const factory UIState({
    @Default(false) bool showEndDialog,
    @Default(false) bool showResignDialog,
    @Default(false) bool showSetupSheet,
    @Default(false) bool showPromotionDialog,
    @Default(null) String? promotionFrom,
    @Default(null) String? promotionTo,
    @Default(false) bool boardFlipped,
  }) = _UIState;
}
