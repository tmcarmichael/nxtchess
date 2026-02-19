import 'package:freezed_annotation/freezed_annotation.dart';
import '../../models/game_types.dart';

part 'engine_state.freezed.dart';

enum EngineStatus { idle, loading, ready, error }

@freezed
sealed class EngineState with _$EngineState {
  const factory EngineState({
    @Default(EngineStatus.idle) EngineStatus status,
    @Default(null) String? error,
    @Default(false) bool isThinking,
    @Default(3) int difficulty,
    @Default(Side.b) Side aiSide,
  }) = _EngineState;
}
