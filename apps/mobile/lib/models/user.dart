import 'package:freezed_annotation/freezed_annotation.dart';

part 'user.freezed.dart';
part 'user.g.dart';

@freezed
sealed class PublicProfile with _$PublicProfile {
  const factory PublicProfile({
    required String username,
    required int rating,
    @JsonKey(name: 'puzzle_rating') required int puzzleRating,
    @JsonKey(name: 'profile_icon') required String profileIcon,
    @JsonKey(name: 'achievement_points') required int achievementPoints,
    @JsonKey(name: 'created_at') required String createdAt,
    @JsonKey(name: 'games_played') required int totalGames,
    required int wins,
    required int losses,
    required int draws,
  }) = _PublicProfile;

  factory PublicProfile.fromJson(Map<String, dynamic> json) =>
      _$PublicProfileFromJson(json);
}

@freezed
sealed class RatingPoint with _$RatingPoint {
  const factory RatingPoint({
    required int rating,
    @JsonKey(name: 'created_at') required String createdAt,
  }) = _RatingPoint;

  factory RatingPoint.fromJson(Map<String, dynamic> json) =>
      _$RatingPointFromJson(json);
}

@freezed
sealed class RecentGame with _$RecentGame {
  const factory RecentGame({
    @JsonKey(name: 'game_id') required String gameId,
    required String opponent,
    required String result,
    @JsonKey(name: 'player_color') required String playerColor,
    @JsonKey(name: 'created_at') required String createdAt,
  }) = _RecentGame;

  factory RecentGame.fromJson(Map<String, dynamic> json) =>
      _$RecentGameFromJson(json);
}
