import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../services/audio/audio_service.dart'
    show AudioService, audioServiceProvider;
import '../../services/haptics/haptics_service.dart'
    show HapticsService, hapticsServiceProvider;
import 'settings_state.dart';

export 'settings_state.dart';

const _prefsKey = 'nxtchess:settings';

class SettingsNotifier extends Notifier<SettingsState> {
  AudioService get _audio => ref.read(audioServiceProvider);
  HapticsService get _haptics => ref.read(hapticsServiceProvider);

  @override
  SettingsState build() {
    _load();
    return const SettingsState();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    state = SettingsState(
      soundEnabled: prefs.getBool('$_prefsKey:sound') ?? true,
      hapticsEnabled: prefs.getBool('$_prefsKey:haptics') ?? true,
      showCoordinates: prefs.getBool('$_prefsKey:coordinates') ?? true,
      showLegalMoves: prefs.getBool('$_prefsKey:legalMoves') ?? true,
      autoQueen: prefs.getBool('$_prefsKey:autoQueen') ?? false,
    );
  }

  Future<void> _save() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('$_prefsKey:sound', state.soundEnabled);
    await prefs.setBool('$_prefsKey:haptics', state.hapticsEnabled);
    await prefs.setBool('$_prefsKey:coordinates', state.showCoordinates);
    await prefs.setBool('$_prefsKey:legalMoves', state.showLegalMoves);
    await prefs.setBool('$_prefsKey:autoQueen', state.autoQueen);
  }

  void toggleSound() {
    state = state.copyWith(soundEnabled: !state.soundEnabled);
    _audio.setEnabled(state.soundEnabled);
    _save();
  }

  void toggleHaptics() {
    state = state.copyWith(hapticsEnabled: !state.hapticsEnabled);
    _haptics.setEnabled(state.hapticsEnabled);
    _save();
  }

  void toggleCoordinates() {
    state = state.copyWith(showCoordinates: !state.showCoordinates);
    _save();
  }

  void toggleLegalMoves() {
    state = state.copyWith(showLegalMoves: !state.showLegalMoves);
    _save();
  }

  void toggleAutoQueen() {
    state = state.copyWith(autoQueen: !state.autoQueen);
    _save();
  }
}

final settingsProvider = NotifierProvider<SettingsNotifier, SettingsState>(
  SettingsNotifier.new,
);
