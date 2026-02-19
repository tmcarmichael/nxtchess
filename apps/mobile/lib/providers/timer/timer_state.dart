import 'package:freezed_annotation/freezed_annotation.dart';

part 'timer_state.freezed.dart';

@freezed
sealed class TimerState with _$TimerState {
  const factory TimerState({
    @Default(300000) int whiteTime,
    @Default(300000) int blackTime,
    @Default(5) int timeControl,
    @Default(0) int increment,
    @Default(false) bool isRunning,
  }) = _TimerState;
}
