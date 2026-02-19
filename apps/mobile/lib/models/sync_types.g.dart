// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'sync_types.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_WsMessage _$WsMessageFromJson(Map<String, dynamic> json) => _WsMessage(
  type: json['type'] as String,
  data: json['data'] as Map<String, dynamic>?,
);

Map<String, dynamic> _$WsMessageToJson(_WsMessage instance) =>
    <String, dynamic>{'type': instance.type, 'data': instance.data};

_PlayerInfo _$PlayerInfoFromJson(Map<String, dynamic> json) => _PlayerInfo(
  id: json['id'] as String,
  username: json['username'] as String?,
  rating: (json['rating'] as num?)?.toInt(),
);

Map<String, dynamic> _$PlayerInfoToJson(_PlayerInfo instance) =>
    <String, dynamic>{
      'id': instance.id,
      'username': instance.username,
      'rating': instance.rating,
    };

_TimeControlData _$TimeControlDataFromJson(Map<String, dynamic> json) =>
    _TimeControlData(
      initialTime: (json['initialTime'] as num).toInt(),
      increment: (json['increment'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$TimeControlDataToJson(_TimeControlData instance) =>
    <String, dynamic>{
      'initialTime': instance.initialTime,
      'increment': instance.increment,
    };

_GameCreatedData _$GameCreatedDataFromJson(Map<String, dynamic> json) =>
    _GameCreatedData(
      gameId: json['gameId'] as String,
      color: json['color'] as String,
    );

Map<String, dynamic> _$GameCreatedDataToJson(_GameCreatedData instance) =>
    <String, dynamic>{'gameId': instance.gameId, 'color': instance.color};

_GameJoinedData _$GameJoinedDataFromJson(Map<String, dynamic> json) =>
    _GameJoinedData(
      gameId: json['gameId'] as String,
      color: json['color'] as String,
      opponent: json['opponent'] as String?,
    );

Map<String, dynamic> _$GameJoinedDataToJson(_GameJoinedData instance) =>
    <String, dynamic>{
      'gameId': instance.gameId,
      'color': instance.color,
      'opponent': instance.opponent,
    };

_GameStartedData _$GameStartedDataFromJson(
  Map<String, dynamic> json,
) => _GameStartedData(
  gameId: json['gameId'] as String,
  fen: json['fen'] as String?,
  whitePlayer: PlayerInfo.fromJson(json['whitePlayer'] as Map<String, dynamic>),
  blackPlayer: PlayerInfo.fromJson(json['blackPlayer'] as Map<String, dynamic>),
  timeControl: json['timeControl'] == null
      ? null
      : TimeControlData.fromJson(json['timeControl'] as Map<String, dynamic>),
  whiteTimeMs: (json['whiteTimeMs'] as num?)?.toInt() ?? 0,
  blackTimeMs: (json['blackTimeMs'] as num?)?.toInt() ?? 0,
);

Map<String, dynamic> _$GameStartedDataToJson(_GameStartedData instance) =>
    <String, dynamic>{
      'gameId': instance.gameId,
      'fen': instance.fen,
      'whitePlayer': instance.whitePlayer,
      'blackPlayer': instance.blackPlayer,
      'timeControl': instance.timeControl,
      'whiteTimeMs': instance.whiteTimeMs,
      'blackTimeMs': instance.blackTimeMs,
    };

_MoveAcceptedData _$MoveAcceptedDataFromJson(Map<String, dynamic> json) =>
    _MoveAcceptedData(
      fen: json['fen'] as String,
      san: json['san'] as String,
      from: json['from'] as String,
      to: json['to'] as String,
      isCheck: json['isCheck'] as bool?,
      whiteTimeMs: (json['whiteTimeMs'] as num?)?.toInt() ?? 0,
      blackTimeMs: (json['blackTimeMs'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$MoveAcceptedDataToJson(_MoveAcceptedData instance) =>
    <String, dynamic>{
      'fen': instance.fen,
      'san': instance.san,
      'from': instance.from,
      'to': instance.to,
      'isCheck': instance.isCheck,
      'whiteTimeMs': instance.whiteTimeMs,
      'blackTimeMs': instance.blackTimeMs,
    };

_MoveRejectedData _$MoveRejectedDataFromJson(Map<String, dynamic> json) =>
    _MoveRejectedData(
      fen: json['fen'] as String,
      reason: json['reason'] as String,
    );

Map<String, dynamic> _$MoveRejectedDataToJson(_MoveRejectedData instance) =>
    <String, dynamic>{'fen': instance.fen, 'reason': instance.reason};

_OpponentMoveData _$OpponentMoveDataFromJson(Map<String, dynamic> json) =>
    _OpponentMoveData(
      from: json['from'] as String,
      to: json['to'] as String,
      promotion: json['promotion'] as String?,
      fen: json['fen'] as String,
      san: json['san'] as String,
      whiteTimeMs: (json['whiteTimeMs'] as num?)?.toInt() ?? 0,
      blackTimeMs: (json['blackTimeMs'] as num?)?.toInt() ?? 0,
      isCheck: json['isCheck'] as bool?,
    );

Map<String, dynamic> _$OpponentMoveDataToJson(_OpponentMoveData instance) =>
    <String, dynamic>{
      'from': instance.from,
      'to': instance.to,
      'promotion': instance.promotion,
      'fen': instance.fen,
      'san': instance.san,
      'whiteTimeMs': instance.whiteTimeMs,
      'blackTimeMs': instance.blackTimeMs,
      'isCheck': instance.isCheck,
    };

_TimeUpdateData _$TimeUpdateDataFromJson(Map<String, dynamic> json) =>
    _TimeUpdateData(
      whiteTime: (json['whiteTime'] as num).toInt(),
      blackTime: (json['blackTime'] as num).toInt(),
    );

Map<String, dynamic> _$TimeUpdateDataToJson(_TimeUpdateData instance) =>
    <String, dynamic>{
      'whiteTime': instance.whiteTime,
      'blackTime': instance.blackTime,
    };

_GameEndedData _$GameEndedDataFromJson(Map<String, dynamic> json) =>
    _GameEndedData(
      result: json['result'] as String,
      reason: json['reason'] as String,
      whiteRatingDelta: (json['whiteRatingDelta'] as num?)?.toInt(),
      blackRatingDelta: (json['blackRatingDelta'] as num?)?.toInt(),
      whiteRating: (json['whiteRating'] as num?)?.toInt(),
      blackRating: (json['blackRating'] as num?)?.toInt(),
      whiteNewAchievements: (json['whiteNewAchievements'] as List<dynamic>?)
          ?.map((e) => AchievementUnlock.fromJson(e as Map<String, dynamic>))
          .toList(),
      blackNewAchievements: (json['blackNewAchievements'] as List<dynamic>?)
          ?.map((e) => AchievementUnlock.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$GameEndedDataToJson(_GameEndedData instance) =>
    <String, dynamic>{
      'result': instance.result,
      'reason': instance.reason,
      'whiteRatingDelta': instance.whiteRatingDelta,
      'blackRatingDelta': instance.blackRatingDelta,
      'whiteRating': instance.whiteRating,
      'blackRating': instance.blackRating,
      'whiteNewAchievements': instance.whiteNewAchievements,
      'blackNewAchievements': instance.blackNewAchievements,
    };

_GameReconnectedData _$GameReconnectedDataFromJson(Map<String, dynamic> json) =>
    _GameReconnectedData(
      gameId: json['gameId'] as String,
      color: json['color'] as String,
      fen: json['fen'] as String,
      moveHistory: (json['moveHistory'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
      whiteTimeMs: (json['whiteTimeMs'] as num).toInt(),
      blackTimeMs: (json['blackTimeMs'] as num).toInt(),
      opponent: PlayerInfo.fromJson(json['opponent'] as Map<String, dynamic>),
      rated: json['rated'] as bool,
    );

Map<String, dynamic> _$GameReconnectedDataToJson(
  _GameReconnectedData instance,
) => <String, dynamic>{
  'gameId': instance.gameId,
  'color': instance.color,
  'fen': instance.fen,
  'moveHistory': instance.moveHistory,
  'whiteTimeMs': instance.whiteTimeMs,
  'blackTimeMs': instance.blackTimeMs,
  'opponent': instance.opponent,
  'rated': instance.rated,
};

_LobbyGame _$LobbyGameFromJson(Map<String, dynamic> json) => _LobbyGame(
  gameId: json['gameId'] as String,
  creator: json['creator'] as String,
  creatorRating: (json['creatorRating'] as num?)?.toInt() ?? 1200,
  timeControl: json['timeControl'] == null
      ? null
      : TimeControlData.fromJson(json['timeControl'] as Map<String, dynamic>),
  rated: json['rated'] as bool? ?? false,
  createdAt: (json['createdAt'] as num).toInt(),
);

Map<String, dynamic> _$LobbyGameToJson(_LobbyGame instance) =>
    <String, dynamic>{
      'gameId': instance.gameId,
      'creator': instance.creator,
      'creatorRating': instance.creatorRating,
      'timeControl': instance.timeControl,
      'rated': instance.rated,
      'createdAt': instance.createdAt,
    };
