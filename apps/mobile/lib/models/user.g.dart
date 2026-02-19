// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_PublicProfile _$PublicProfileFromJson(Map<String, dynamic> json) =>
    _PublicProfile(
      username: json['username'] as String,
      rating: (json['rating'] as num).toInt(),
      puzzleRating: (json['puzzle_rating'] as num).toInt(),
      profileIcon: json['profile_icon'] as String,
      achievementPoints: (json['achievement_points'] as num).toInt(),
      createdAt: json['created_at'] as String,
      totalGames: (json['games_played'] as num).toInt(),
      wins: (json['wins'] as num).toInt(),
      losses: (json['losses'] as num).toInt(),
      draws: (json['draws'] as num).toInt(),
    );

Map<String, dynamic> _$PublicProfileToJson(_PublicProfile instance) =>
    <String, dynamic>{
      'username': instance.username,
      'rating': instance.rating,
      'puzzle_rating': instance.puzzleRating,
      'profile_icon': instance.profileIcon,
      'achievement_points': instance.achievementPoints,
      'created_at': instance.createdAt,
      'games_played': instance.totalGames,
      'wins': instance.wins,
      'losses': instance.losses,
      'draws': instance.draws,
    };

_RatingPoint _$RatingPointFromJson(Map<String, dynamic> json) => _RatingPoint(
  rating: (json['rating'] as num).toInt(),
  createdAt: json['created_at'] as String,
);

Map<String, dynamic> _$RatingPointToJson(_RatingPoint instance) =>
    <String, dynamic>{
      'rating': instance.rating,
      'created_at': instance.createdAt,
    };

_RecentGame _$RecentGameFromJson(Map<String, dynamic> json) => _RecentGame(
  gameId: json['game_id'] as String,
  opponent: json['opponent'] as String,
  result: json['result'] as String,
  playerColor: json['player_color'] as String,
  createdAt: json['created_at'] as String,
);

Map<String, dynamic> _$RecentGameToJson(_RecentGame instance) =>
    <String, dynamic>{
      'game_id': instance.gameId,
      'opponent': instance.opponent,
      'result': instance.result,
      'player_color': instance.playerColor,
      'created_at': instance.createdAt,
    };
