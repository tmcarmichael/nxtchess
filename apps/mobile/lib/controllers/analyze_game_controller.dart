import 'dart:async';

import 'package:dartchess/dartchess.dart' as dc;
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config/constants.dart';
import '../models/game_types.dart';
import '../providers/chess/chess_provider.dart';
import '../services/audio/audio_service.dart';
import '../services/engine/analysis_engine_service.dart';
import '../utils/pgn_parser.dart';
import '../utils/uci_utils.dart';
import 'game_controller.dart';

class AnalyzeEngineState {
  final bool enabled;
  final bool isAnalyzing;
  final EngineAnalysis? analysis;

  const AnalyzeEngineState({
    this.enabled = true,
    this.isAnalyzing = false,
    this.analysis,
  });

  AnalyzeEngineState copyWith({
    bool? enabled,
    bool? isAnalyzing,
    EngineAnalysis? analysis,
  }) {
    return AnalyzeEngineState(
      enabled: enabled ?? this.enabled,
      isAnalyzing: isAnalyzing ?? this.isAnalyzing,
      analysis: analysis ?? this.analysis,
    );
  }
}

class AnalyzeEngineNotifier extends Notifier<AnalyzeEngineState> {
  @override
  AnalyzeEngineState build() => const AnalyzeEngineState();

  void update(AnalyzeEngineState newState) => state = newState;
}

final analyzeEngineStateProvider =
    NotifierProvider<AnalyzeEngineNotifier, AnalyzeEngineState>(
      AnalyzeEngineNotifier.new,
    );

class AnalyzeGameController extends GameController {
  @override
  final Ref ref;
  AnalysisEngineService? _analysisEngine;
  Timer? _debounceTimer;
  bool _disposed = false;

  AnalyzeGameController(this.ref);

  @override
  GameMode get mode => GameMode.analysis;

  ChessNotifier get _chess => ref.read(chessProvider.notifier);
  AudioService get _audio => ref.read(audioServiceProvider);

  AnalyzeEngineState get _engineState => ref.read(analyzeEngineStateProvider);

  void _setEngineState(AnalyzeEngineState newState) {
    ref.read(analyzeEngineStateProvider.notifier).update(newState);
  }

  void initAnalysis() {
    _chess.startGame(
      mode: GameMode.analysis,
      playerColor: Side.w,
      opponentType: OpponentType.ai,
    );
    _chess.setLifecycle(GameLifecycle.playing);

    if (_engineState.enabled) {
      _startAnalysis();
    }
  }

  bool loadFen(String fen) {
    try {
      dc.Chess.fromSetup(dc.Setup.parseFen(fen));
    } catch (e) {
      if (kDebugMode) debugPrint('AnalyzeGameController parse error: $e');
      return false;
    }

    _chess.startGame(
      mode: GameMode.analysis,
      playerColor: Side.w,
      opponentType: OpponentType.ai,
      fen: fen,
    );
    _chess.setLifecycle(GameLifecycle.playing);

    if (_engineState.enabled) {
      _debouncedAnalysis();
    }
    return true;
  }

  bool loadPgn(String pgn) {
    try {
      final sanMoves = parsePgnToSanTokens(pgn);

      _chess.startGame(
        mode: GameMode.analysis,
        playerColor: Side.w,
        opponentType: OpponentType.ai,
      );
      _chess.setLifecycle(GameLifecycle.playing);

      for (final san in sanMoves) {
        final pos = _chess.pos;
        final move = pos.parseSan(san);
        if (move == null) break;
        final from = (move is dc.NormalMove ? move.from : dc.Square.a1).name;
        final to = (move is dc.NormalMove ? move.to : dc.Square.a1).name;
        final promotion = move is dc.NormalMove && move.promotion != null
            ? move.promotion!.letter
            : null;
        _chess.applyMove(from, to, promotion: promotion);
      }

      if (_engineState.enabled) {
        _debouncedAnalysis();
      }
      return true;
    } catch (e) {
      if (kDebugMode) debugPrint('AnalyzeGameController parse error: $e');
      return false;
    }
  }

  void toggleEngine() {
    final newEnabled = !_engineState.enabled;
    _setEngineState(_engineState.copyWith(enabled: newEnabled));

    if (newEnabled) {
      _startAnalysis();
    } else {
      _analysisEngine?.stopAnalysis();
      _setEngineState(_engineState.copyWith(isAnalyzing: false));
    }
  }

  void _debouncedAnalysis() {
    _debounceTimer?.cancel();
    _debounceTimer = Timer(analysisDebounce, () {
      if (!_disposed && _engineState.enabled) {
        _startAnalysis();
      }
    });
  }

  Future<void> _startAnalysis() async {
    if (_disposed) return;

    _analysisEngine ??= AnalysisEngineService();

    try {
      await _analysisEngine!.init();
    } catch (e) {
      if (kDebugMode) debugPrint('AnalyzeGameController engine init error: $e');
      return;
    }

    if (_disposed) return;

    final state = ref.read(chessProvider);
    final fen = state.viewFen;

    _setEngineState(_engineState.copyWith(isAnalyzing: true));

    try {
      final analysis = await _analysisEngine!.analyze(
        fen,
        onProgress: (progress) {
          if (!_disposed) {
            _setEngineState(_engineState.copyWith(analysis: progress));
          }
        },
      );

      if (!_disposed) {
        _setEngineState(
          _engineState.copyWith(analysis: analysis, isAnalyzing: false),
        );
      }
    } catch (e) {
      if (kDebugMode) debugPrint('AnalyzeGameController analysis error: $e');
      if (!_disposed) {
        _setEngineState(_engineState.copyWith(isAnalyzing: false));
      }
    }
  }

  void playEngineMove(String uciMove) {
    if (uciMove.length < 4) return;
    final move = parseUciMove(uciMove);
    onMove(move.from, move.to, promotion: move.promotion);
  }

  @override
  void onMove(String from, String to, {String? promotion}) {
    final state = ref.read(chessProvider);

    // In analysis, allow moves even after game over when viewing history
    if (state.lifecycle == GameLifecycle.ended && state.viewFen != state.fen) {
      // Truncate: jump to view position and restart from there
      _chess.jumpToMoveIndex(state.viewMoveIndex);
      _chess.setLifecycle(GameLifecycle.playing);
    }

    if (state.lifecycle != GameLifecycle.playing &&
        state.lifecycle != GameLifecycle.ended) {
      return;
    }

    _chess.applyMove(from, to, promotion: promotion);
    final chessState = ref.read(chessProvider);
    final lastSan = chessState.moveHistory.isNotEmpty
        ? chessState.moveHistory.last
        : '';
    _audio.playMoveSound(isCapture: lastSan.contains('x'));

    if (_engineState.enabled) {
      _debouncedAnalysis();
    }
  }

  @override
  void onResign() {} // Not applicable in analysis

  @override
  void onNewGame() {
    initAnalysis();
  }

  @override
  void onExitGame() {
    _analysisEngine?.dispose();
    _analysisEngine = null;
    _chess.exitGame();
  }

  @override
  void onNavigateForward() {
    super.onNavigateForward();
    if (_engineState.enabled) _debouncedAnalysis();
  }

  @override
  void onNavigateBackward() {
    super.onNavigateBackward();
    if (_engineState.enabled) _debouncedAnalysis();
  }

  @override
  void onNavigateToStart() {
    super.onNavigateToStart();
    if (_engineState.enabled) _debouncedAnalysis();
  }

  @override
  void onNavigateToEnd() {
    super.onNavigateToEnd();
    if (_engineState.enabled) _debouncedAnalysis();
  }

  @override
  void dispose() {
    _disposed = true;
    _debounceTimer?.cancel();
    _analysisEngine?.dispose();
    _analysisEngine = null;
  }
}

final analyzeGameControllerProvider = Provider<AnalyzeGameController>((ref) {
  final controller = AnalyzeGameController(ref);
  ref.onDispose(controller.dispose);
  return controller;
});
