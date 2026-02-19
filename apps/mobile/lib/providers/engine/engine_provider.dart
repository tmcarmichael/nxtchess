import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/constants.dart';
import '../../models/game_types.dart';
import '../../services/engine/stockfish_service.dart';
import 'engine_state.dart';

export 'engine_state.dart';

class EngineNotifier extends Notifier<EngineState> {
  StockfishService? _aiEngine;
  StockfishService? _evalEngine;

  @override
  EngineState build() {
    ref.onDispose(() {
      _aiEngine?.dispose();
      _evalEngine?.dispose();
    });
    return const EngineState();
  }

  Future<void> init(int difficulty, Side aiSide) async {
    state = state.copyWith(
      status: EngineStatus.loading,
      error: null,
      difficulty: difficulty,
      aiSide: aiSide,
    );

    final elo =
        difficultyValuesElo[(difficulty - 1).clamp(
          0,
          difficultyValuesElo.length - 1,
        )];

    try {
      _aiEngine?.dispose();
      _aiEngine = StockfishService();
      await _aiEngine!.init();
      await _aiEngine!.setOption('UCI_LimitStrength', 'true');
      await _aiEngine!.setOption('UCI_Elo', elo.toString());
      state = state.copyWith(status: EngineStatus.ready);
    } catch (e) {
      state = state.copyWith(
        status: EngineStatus.error,
        error: 'Failed to initialize chess engine. Please try again.',
      );
      rethrow;
    }
  }

  Future<void> initEval() async {
    try {
      _evalEngine?.dispose();
      _evalEngine = StockfishService();
      await _evalEngine!.init();
    } catch (e) {
      if (kDebugMode) debugPrint('EngineNotifier.initEval: $e');
    }
  }

  Future<({String from, String to, String? promotion})?> getMove(
    String fen,
  ) async {
    if (state.status != EngineStatus.ready || _aiEngine == null) return null;
    state = state.copyWith(isThinking: true);
    try {
      final thinkTimeMs =
          difficultyThinkTimeMs[(state.difficulty - 1).clamp(
            0,
            difficultyThinkTimeMs.length - 1,
          )];
      final result = await _aiEngine!.getBestMove(fen, moveTimeMs: thinkTimeMs);
      return result;
    } finally {
      state = state.copyWith(isThinking: false);
    }
  }

  Future<double> getEval(String fen) async {
    if (_evalEngine == null) return 0.0;
    return _evalEngine!.getEvaluation(fen);
  }

  void terminate() {
    _aiEngine?.dispose();
    _evalEngine?.dispose();
    _aiEngine = null;
    _evalEngine = null;
    state = const EngineState();
  }

  Future<void> retry({void Function()? onSuccess}) async {
    state = state.copyWith(status: EngineStatus.loading, error: null);
    try {
      await init(state.difficulty, state.aiSide);
      onSuccess?.call();
    } catch (e) {
      if (kDebugMode) debugPrint('EngineNotifier.retry: $e');
    }
  }
}

final engineProvider = NotifierProvider<EngineNotifier, EngineState>(
  EngineNotifier.new,
);
