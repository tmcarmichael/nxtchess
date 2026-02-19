import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../config/constants.dart';
import '../../models/game_types.dart';

class PersistedGameState {
  final String sessionId;
  final String fen;
  final List<String> moveHistory;
  final Side playerColor;
  final GameMode mode;
  final OpponentType opponentType;
  final int? difficulty;
  final String? gameId;
  final DateTime savedAt;

  const PersistedGameState({
    required this.sessionId,
    required this.fen,
    required this.moveHistory,
    required this.playerColor,
    required this.mode,
    required this.opponentType,
    this.difficulty,
    this.gameId,
    required this.savedAt,
  });

  Map<String, dynamic> toJson() => {
    'sessionId': sessionId,
    'fen': fen,
    'moveHistory': moveHistory,
    'playerColor': playerColor.name,
    'mode': mode.name,
    'opponentType': opponentType.name,
    'difficulty': difficulty,
    'gameId': gameId,
    'savedAt': savedAt.toIso8601String(),
  };

  factory PersistedGameState.fromJson(Map<String, dynamic> json) {
    return PersistedGameState(
      sessionId: json['sessionId'] as String,
      fen: json['fen'] as String,
      moveHistory: (json['moveHistory'] as List).cast<String>(),
      playerColor: Side.values.firstWhere((s) => s.name == json['playerColor']),
      mode: GameMode.values.firstWhere((m) => m.name == json['mode']),
      opponentType: OpponentType.values.firstWhere(
        (o) => o.name == json['opponentType'],
      ),
      difficulty: json['difficulty'] as int?,
      gameId: json['gameId'] as String?,
      savedAt: DateTime.parse(json['savedAt'] as String),
    );
  }
}

class GamePersistence {
  static const _key = 'persisted_game_state';
  Timer? _autoSaveTimer;
  Timer? _debounceTimer;
  PersistedGameState? _lastSaved;

  void startAutoSave(PersistedGameState Function() getState) {
    stopAutoSave();

    _autoSaveTimer = Timer.periodic(autoSaveInterval, (_) {
      _saveIfChanged(getState());
    });
  }

  void debounceSave(PersistedGameState state) {
    _debounceTimer?.cancel();
    _debounceTimer = Timer(autoSaveDebounce, () {
      _saveIfChanged(state);
    });
  }

  void _saveIfChanged(PersistedGameState state) {
    if (_lastSaved != null &&
        _lastSaved!.sessionId == state.sessionId &&
        _lastSaved!.fen == state.fen &&
        _lastSaved!.moveHistory.length == state.moveHistory.length) {
      return;
    }
    save(state);
  }

  Future<void> save(PersistedGameState state) async {
    _lastSaved = state;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_key, jsonEncode(state.toJson()));
    } catch (e) {
      if (kDebugMode) debugPrint('GamePersistence.save: $e');
    }
  }

  Future<PersistedGameState?> load() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final json = prefs.getString(_key);
      if (json == null) return null;
      return PersistedGameState.fromJson(
        jsonDecode(json) as Map<String, dynamic>,
      );
    } catch (e) {
      if (kDebugMode) debugPrint('GamePersistence.load: $e');
      return null;
    }
  }

  Future<void> clear() async {
    _lastSaved = null;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_key);
    } catch (e) {
      if (kDebugMode) debugPrint('GamePersistence.clear: $e');
    }
  }

  void stopAutoSave() {
    _autoSaveTimer?.cancel();
    _autoSaveTimer = null;
    _debounceTimer?.cancel();
    _debounceTimer = null;
  }

  void dispose() {
    stopAutoSave();
  }
}
