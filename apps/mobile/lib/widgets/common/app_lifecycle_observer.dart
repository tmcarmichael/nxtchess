import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../models/game_types.dart';
import '../../providers/chess/chess_provider.dart';
import '../../providers/engine/engine_provider.dart';
import '../../providers/multiplayer/multiplayer_provider.dart';
import '../../providers/timer/timer_provider.dart';

class AppLifecycleObserver extends ConsumerStatefulWidget {
  final Widget child;

  const AppLifecycleObserver({super.key, required this.child});

  @override
  ConsumerState<AppLifecycleObserver> createState() =>
      _AppLifecycleObserverState();
}

class _AppLifecycleObserverState extends ConsumerState<AppLifecycleObserver>
    with WidgetsBindingObserver {
  int? _pausedDifficulty;
  Side? _pausedAiSide;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    switch (state) {
      case AppLifecycleState.paused:
      case AppLifecycleState.detached:
        _onPaused();
      case AppLifecycleState.resumed:
        _onResumed();
      case AppLifecycleState.inactive:
      case AppLifecycleState.hidden:
        break;
    }
  }

  void _onPaused() {
    // Stop timer to prevent massive delta accumulation on resume
    final chessState = ref.read(chessProvider);
    if (chessState.lifecycle == GameLifecycle.playing) {
      ref.read(timerProvider.notifier).stop();
    }

    final engineState = ref.read(engineProvider);
    if (engineState.status == EngineStatus.ready ||
        engineState.status == EngineStatus.loading) {
      _pausedDifficulty = engineState.difficulty;
      _pausedAiSide = engineState.aiSide;
      ref.read(engineProvider.notifier).terminate();
    }
  }

  void _onResumed() {
    ref.read(multiplayerProvider.notifier).attemptReconnect();

    final chessState = ref.read(chessProvider);
    if (chessState.lifecycle == GameLifecycle.playing &&
        chessState.opponentType == OpponentType.ai &&
        _pausedDifficulty != null &&
        _pausedAiSide != null) {
      ref
          .read(engineProvider.notifier)
          .init(_pausedDifficulty!, _pausedAiSide!);
      _pausedDifficulty = null;
      _pausedAiSide = null;
    }
  }

  @override
  Widget build(BuildContext context) => widget.child;
}
