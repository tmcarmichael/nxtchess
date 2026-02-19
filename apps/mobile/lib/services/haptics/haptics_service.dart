import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

enum HapticType { light, medium, heavy, selection }

class HapticsService {
  bool _enabled = true;
  bool _initialized = false;

  Future<void> init() async {
    if (_initialized) return;
    _initialized = true;
    final prefs = await SharedPreferences.getInstance();
    _enabled = prefs.getBool('haptics:enabled') ?? true;
  }

  bool get isEnabled => _enabled;

  Future<void> setEnabled(bool enabled) async {
    _enabled = enabled;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('haptics:enabled', enabled);
  }

  void trigger(HapticType type) {
    if (!_enabled) return;
    switch (type) {
      case HapticType.light:
        HapticFeedback.lightImpact();
      case HapticType.medium:
        HapticFeedback.mediumImpact();
      case HapticType.heavy:
        HapticFeedback.heavyImpact();
      case HapticType.selection:
        HapticFeedback.selectionClick();
    }
  }

  void onMove() => trigger(HapticType.light);
  void onCapture() => trigger(HapticType.medium);
  void onCheck() => trigger(HapticType.heavy);
  void onGameEnd() => trigger(HapticType.heavy);
  void onPuzzleCorrect() => trigger(HapticType.medium);
  void onPuzzleIncorrect() => trigger(HapticType.selection);
}

final hapticsServiceProvider = Provider<HapticsService>((ref) {
  throw UnimplementedError(
    'hapticsServiceProvider must be overridden in ProviderScope',
  );
});
