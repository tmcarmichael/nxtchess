import 'package:flutter/scheduler.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/game_types.dart';
import 'timer_state.dart';

export 'timer_state.dart';

const _lowTimeThresholdMs = 10000;

class TimerNotifier extends Notifier<TimerState> {
  Ticker? _ticker;
  Duration _lastElapsed = Duration.zero;
  Side Function()? _currentTurn;
  void Function(Side)? _onTimeout;
  void Function(Side)? _onLowTime;
  bool _lowTimeFiredWhite = false;
  bool _lowTimeFiredBlack = false;

  @override
  TimerState build() {
    ref.onDispose(() {
      _ticker?.dispose();
      _ticker = null;
    });
    return const TimerState();
  }

  void start(
    Side Function() currentTurn,
    void Function(Side) onTimeout, {
    void Function(Side)? onLowTime,
  }) {
    stop();
    _currentTurn = currentTurn;
    _onTimeout = onTimeout;
    _onLowTime = onLowTime;
    _lowTimeFiredWhite = false;
    _lowTimeFiredBlack = false;
    _lastElapsed = Duration.zero;

    _ticker = Ticker(_onTick);
    _ticker!.start();
    state = state.copyWith(isRunning: true);
  }

  void _onTick(Duration elapsed) {
    final delta = elapsed - _lastElapsed;
    _lastElapsed = elapsed;

    if (!state.isRunning || _currentTurn == null) return;

    final side = _currentTurn!();
    final isWhite = side == Side.w;
    final currentTime = isWhite ? state.whiteTime : state.blackTime;
    final newTime = (currentTime - delta.inMilliseconds)
        .clamp(0, double.maxFinite)
        .toInt();

    if (isWhite) {
      state = state.copyWith(whiteTime: newTime);
    } else {
      state = state.copyWith(blackTime: newTime);
    }

    if (newTime <= _lowTimeThresholdMs && currentTime > _lowTimeThresholdMs) {
      final alreadyFired = isWhite ? _lowTimeFiredWhite : _lowTimeFiredBlack;
      if (!alreadyFired) {
        if (isWhite) {
          _lowTimeFiredWhite = true;
        } else {
          _lowTimeFiredBlack = true;
        }
        _onLowTime?.call(side);
      }
    }

    if (newTime <= 0) {
      stop();
      _onTimeout?.call(side);
    }
  }

  void stop() {
    _ticker?.stop();
    _ticker?.dispose();
    _ticker = null;
    _lastElapsed = Duration.zero;
    state = state.copyWith(isRunning: false);
  }

  void sync(int whiteMs, int blackMs) {
    state = state.copyWith(whiteTime: whiteMs, blackTime: blackMs);
  }

  void reset(int minutes, {int incrementSeconds = 0}) {
    stop();
    final ms = minutes * 60 * 1000;
    final incrementMs = incrementSeconds * 1000;
    state = TimerState(
      whiteTime: ms,
      blackTime: ms,
      timeControl: minutes,
      increment: incrementMs,
    );
  }

  void setTimeControl(int minutes) {
    state = state.copyWith(timeControl: minutes);
  }

  void addIncrement(Side side) {
    if (state.increment <= 0) return;
    if (side == Side.w) {
      state = state.copyWith(whiteTime: state.whiteTime + state.increment);
    } else {
      state = state.copyWith(blackTime: state.blackTime + state.increment);
    }
  }
}

final timerProvider = NotifierProvider<TimerNotifier, TimerState>(
  TimerNotifier.new,
);
