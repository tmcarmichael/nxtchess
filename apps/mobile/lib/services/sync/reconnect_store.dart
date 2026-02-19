import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../models/game_types.dart';

const _reconnectKey = 'nxtchess:active_game';

class ActiveGameInfo {
  final String gameId;
  final Side playerColor;

  const ActiveGameInfo({required this.gameId, required this.playerColor});

  Map<String, dynamic> toJson() => {
    'gameId': gameId,
    'playerColor': playerColor == Side.w ? 'w' : 'b',
  };

  factory ActiveGameInfo.fromJson(Map<String, dynamic> json) {
    return ActiveGameInfo(
      gameId: json['gameId'] as String,
      playerColor: json['playerColor'] == 'w' ? Side.w : Side.b,
    );
  }
}

Future<void> saveActiveGame(ActiveGameInfo info) async {
  try {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_reconnectKey, jsonEncode(info.toJson()));
  } catch (e) {
    if (kDebugMode) debugPrint('reconnect_store error: $e');
  }
}

Future<ActiveGameInfo?> loadActiveGame() async {
  try {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_reconnectKey);
    if (raw != null) {
      return ActiveGameInfo.fromJson(jsonDecode(raw) as Map<String, dynamic>);
    }
  } catch (e) {
    if (kDebugMode) debugPrint('reconnect_store error: $e');
  }
  return null;
}

Future<void> clearActiveGame() async {
  try {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_reconnectKey);
  } catch (e) {
    if (kDebugMode) debugPrint('reconnect_store error: $e');
  }
}
