import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/game_types.dart';
import '../providers/chess/chess_provider.dart';
import '../services/audio/audio_service.dart';
import '../services/haptics/haptics_service.dart';

abstract class GameController {
  Ref get ref;
  GameMode get mode;
  void onMove(String from, String to, {String? promotion});
  void onResign();
  void onNewGame();
  void onExitGame();
  void dispose();

  ChessNotifier get _chess => ref.read(chessProvider.notifier);

  void playMoveAudio(ChessState chessState) {
    final audio = ref.read(audioServiceProvider);
    final haptics = ref.read(hapticsServiceProvider);
    if (chessState.checkedKingSquare != null) {
      audio.playCheck();
      haptics.onCheck();
    } else {
      final lastSan = chessState.moveHistory.isNotEmpty
          ? chessState.moveHistory.last
          : '';
      audio.playMoveSound(isCapture: lastSan.contains('x'));
      lastSan.contains('x') ? haptics.onCapture() : haptics.onMove();
    }
  }

  void onNavigateForward() {
    final state = ref.read(chessProvider);
    if (state.viewMoveIndex < state.moveHistory.length - 1) {
      _chess.jumpToMoveIndex(state.viewMoveIndex + 1);
    }
  }

  void onNavigateBackward() {
    final state = ref.read(chessProvider);
    if (state.viewMoveIndex >= 0) {
      _chess.jumpToMoveIndex(state.viewMoveIndex - 1);
    }
  }

  void onNavigateToStart() => _chess.jumpToMoveIndex(-1);

  void onNavigateToEnd() {
    final state = ref.read(chessProvider);
    _chess.jumpToMoveIndex(state.moveHistory.length - 1);
  }
}
