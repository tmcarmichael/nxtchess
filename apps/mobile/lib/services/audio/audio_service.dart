import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

enum SoundType {
  move,
  capture,
  gameStart,
  check,
  illegalMove,
  gameEnd,
  lowTime,
}

class AudioService {
  bool _enabled = true;
  double _volume = 0.5;
  Future<void>? _initFuture;

  final Map<SoundType, AudioPlayer> _players = {};

  static const _soundFiles = <SoundType, String>{
    SoundType.move: 'sounds/move.wav',
    SoundType.capture: 'sounds/capture.wav',
    SoundType.gameStart: 'sounds/game_start.wav',
    SoundType.check: 'sounds/check.wav',
    SoundType.illegalMove: 'sounds/illegal.wav',
    SoundType.gameEnd: 'sounds/game_end.wav',
    SoundType.lowTime: 'sounds/low_time.wav',
  };

  Future<void> init() {
    return _initFuture ??= _doInit();
  }

  Future<void> _doInit() async {
    final prefs = await SharedPreferences.getInstance();
    _enabled = prefs.getBool('audio:enabled') ?? true;
    _volume = prefs.getDouble('audio:volume') ?? 0.5;

    for (final type in SoundType.values) {
      _players[type] = AudioPlayer();
    }
  }

  Future<void> play(SoundType type) async {
    if (!_enabled) return;

    final player = _players[type];
    if (player == null) return;

    final file = _soundFiles[type];
    if (file == null) return;

    try {
      await player.setVolume(_volume);
      await player.play(AssetSource(file));
    } catch (e) {
      if (kDebugMode) debugPrint('AudioService.play($type): $e');
    }
  }

  void playMoveSound({bool isCapture = false}) {
    play(isCapture ? SoundType.capture : SoundType.move);
  }

  void playGameStart() => play(SoundType.gameStart);
  void playCheck() => play(SoundType.check);
  void playIllegalMove() => play(SoundType.illegalMove);
  void playGameEnd() => play(SoundType.gameEnd);
  void playLowTime() => play(SoundType.lowTime);

  bool get isEnabled => _enabled;
  double get volume => _volume;

  Future<void> setEnabled(bool enabled) async {
    _enabled = enabled;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('audio:enabled', enabled);
  }

  Future<void> setVolume(double volume) async {
    _volume = volume.clamp(0.0, 1.0);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setDouble('audio:volume', _volume);
  }

  void dispose() {
    for (final player in _players.values) {
      player.dispose();
    }
    _players.clear();
    _initFuture = null;
  }
}

final audioServiceProvider = Provider<AudioService>((ref) {
  throw UnimplementedError(
    'audioServiceProvider must be overridden in ProviderScope',
  );
});
