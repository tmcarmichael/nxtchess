import 'package:freezed_annotation/freezed_annotation.dart';

import 'achievement.dart';

part 'sync_types.freezed.dart';
part 'sync_types.g.dart';

@freezed
sealed class WsMessage with _$WsMessage {
  const factory WsMessage({required String type, Map<String, dynamic>? data}) =
      _WsMessage;

  factory WsMessage.fromJson(Map<String, dynamic> json) =>
      _$WsMessageFromJson(json);
}

@freezed
sealed class PlayerInfo with _$PlayerInfo {
  const factory PlayerInfo({
    required String id,
    String? username,
    int? rating,
  }) = _PlayerInfo;

  factory PlayerInfo.fromJson(Map<String, dynamic> json) =>
      _$PlayerInfoFromJson(json);
}

@freezed
sealed class TimeControlData with _$TimeControlData {
  const factory TimeControlData({
    required int initialTime,
    @Default(0) int increment,
  }) = _TimeControlData;

  factory TimeControlData.fromJson(Map<String, dynamic> json) =>
      _$TimeControlDataFromJson(json);
}

@freezed
sealed class GameCreatedData with _$GameCreatedData {
  const factory GameCreatedData({
    required String gameId,
    required String color,
  }) = _GameCreatedData;

  factory GameCreatedData.fromJson(Map<String, dynamic> json) =>
      _$GameCreatedDataFromJson(json);
}

@freezed
sealed class GameJoinedData with _$GameJoinedData {
  const factory GameJoinedData({
    required String gameId,
    required String color,
    String? opponent,
  }) = _GameJoinedData;

  factory GameJoinedData.fromJson(Map<String, dynamic> json) =>
      _$GameJoinedDataFromJson(json);
}

@freezed
sealed class GameStartedData with _$GameStartedData {
  const factory GameStartedData({
    required String gameId,
    String? fen,
    required PlayerInfo whitePlayer,
    required PlayerInfo blackPlayer,
    TimeControlData? timeControl,
    @JsonKey(name: 'whiteTimeMs') @Default(0) int whiteTimeMs,
    @JsonKey(name: 'blackTimeMs') @Default(0) int blackTimeMs,
  }) = _GameStartedData;

  factory GameStartedData.fromJson(Map<String, dynamic> json) =>
      _$GameStartedDataFromJson(json);
}

@freezed
sealed class MoveAcceptedData with _$MoveAcceptedData {
  const factory MoveAcceptedData({
    required String fen,
    required String san,
    required String from,
    required String to,
    bool? isCheck,
    @JsonKey(name: 'whiteTimeMs') @Default(0) int whiteTimeMs,
    @JsonKey(name: 'blackTimeMs') @Default(0) int blackTimeMs,
  }) = _MoveAcceptedData;

  factory MoveAcceptedData.fromJson(Map<String, dynamic> json) =>
      _$MoveAcceptedDataFromJson(json);
}

@freezed
sealed class MoveRejectedData with _$MoveRejectedData {
  const factory MoveRejectedData({
    required String fen,
    required String reason,
  }) = _MoveRejectedData;

  factory MoveRejectedData.fromJson(Map<String, dynamic> json) =>
      _$MoveRejectedDataFromJson(json);
}

@freezed
sealed class OpponentMoveData with _$OpponentMoveData {
  const factory OpponentMoveData({
    required String from,
    required String to,
    String? promotion,
    required String fen,
    required String san,
    @JsonKey(name: 'whiteTimeMs') @Default(0) int whiteTimeMs,
    @JsonKey(name: 'blackTimeMs') @Default(0) int blackTimeMs,
    bool? isCheck,
  }) = _OpponentMoveData;

  factory OpponentMoveData.fromJson(Map<String, dynamic> json) =>
      _$OpponentMoveDataFromJson(json);
}

@freezed
sealed class TimeUpdateData with _$TimeUpdateData {
  const factory TimeUpdateData({
    required int whiteTime,
    required int blackTime,
  }) = _TimeUpdateData;

  factory TimeUpdateData.fromJson(Map<String, dynamic> json) =>
      _$TimeUpdateDataFromJson(json);
}

@freezed
sealed class GameEndedData with _$GameEndedData {
  const factory GameEndedData({
    required String result,
    required String reason,
    int? whiteRatingDelta,
    int? blackRatingDelta,
    @JsonKey(name: 'whiteRating') int? whiteRating,
    @JsonKey(name: 'blackRating') int? blackRating,
    List<AchievementUnlock>? whiteNewAchievements,
    List<AchievementUnlock>? blackNewAchievements,
  }) = _GameEndedData;

  factory GameEndedData.fromJson(Map<String, dynamic> json) =>
      _$GameEndedDataFromJson(json);
}

@freezed
sealed class GameReconnectedData with _$GameReconnectedData {
  const factory GameReconnectedData({
    required String gameId,
    required String color,
    required String fen,
    required List<String> moveHistory,
    @JsonKey(name: 'whiteTimeMs') required int whiteTimeMs,
    @JsonKey(name: 'blackTimeMs') required int blackTimeMs,
    required PlayerInfo opponent,
    required bool rated,
  }) = _GameReconnectedData;

  factory GameReconnectedData.fromJson(Map<String, dynamic> json) =>
      _$GameReconnectedDataFromJson(json);
}

@freezed
sealed class LobbyGame with _$LobbyGame {
  const factory LobbyGame({
    required String gameId,
    required String creator,
    @Default(1200) int creatorRating,
    TimeControlData? timeControl,
    @Default(false) bool rated,
    required int createdAt,
  }) = _LobbyGame;

  factory LobbyGame.fromJson(Map<String, dynamic> json) =>
      _$LobbyGameFromJson(json);
}

class WsMessageTypes {
  static const gameCreate = 'GAME_CREATE';
  static const gameCreated = 'GAME_CREATED';
  static const gameJoin = 'GAME_JOIN';
  static const gameJoined = 'GAME_JOINED';
  static const gameStarted = 'GAME_STARTED';
  static const gameNotFound = 'GAME_NOT_FOUND';
  static const gameFull = 'GAME_FULL';
  static const move = 'MOVE';
  static const moveAccepted = 'MOVE_ACCEPTED';
  static const moveRejected = 'MOVE_REJECTED';
  static const opponentMove = 'OPPONENT_MOVE';
  static const timeUpdate = 'TIME_UPDATE';
  static const resign = 'RESIGN';
  static const gameEnded = 'GAME_ENDED';
  static const gameReconnect = 'GAME_RECONNECT';
  static const gameReconnected = 'GAME_RECONNECTED';
  static const opponentDisconnected = 'OPPONENT_DISCONNECTED';
  static const opponentReconnected = 'OPPONENT_RECONNECTED';
  static const lobbySubscribe = 'LOBBY_SUBSCRIBE';
  static const lobbyUnsubscribe = 'LOBBY_UNSUBSCRIBE';
  static const lobbyList = 'LOBBY_LIST';
  static const lobbyUpdate = 'LOBBY_UPDATE';
  static const gameLeave = 'GAME_LEAVE';
  static const ping = 'PING';
  static const pong = 'PONG';
  static const error = 'ERROR';
}
