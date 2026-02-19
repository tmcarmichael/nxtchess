import 'package:freezed_annotation/freezed_annotation.dart';

part 'achievement.freezed.dart';
part 'achievement.g.dart';

enum AchievementRarity { common, uncommon, rare, epic, legendary }

enum AchievementCategory {
  loyalty,
  streaks,
  rating,
  @JsonValue('chess_moments')
  chessMoments,
  volume,
  fun,
}

@freezed
sealed class Achievement with _$Achievement {
  const factory Achievement({
    required String id,
    required String name,
    required String description,
    required AchievementCategory category,
    required AchievementRarity rarity,
    required int points,
    required String icon,
  }) = _Achievement;

  factory Achievement.fromJson(Map<String, dynamic> json) =>
      _$AchievementFromJson(json);
}

@freezed
sealed class UserAchievement with _$UserAchievement {
  const factory UserAchievement({
    required String id,
    required String name,
    required String description,
    required AchievementCategory category,
    required AchievementRarity rarity,
    required int points,
    required String icon,
    @JsonKey(name: 'unlocked_at') required String unlockedAt,
  }) = _UserAchievement;

  factory UserAchievement.fromJson(Map<String, dynamic> json) =>
      _$UserAchievementFromJson(json);
}

@freezed
sealed class AchievementsResponse with _$AchievementsResponse {
  const factory AchievementsResponse({
    required List<UserAchievement> achievements,
    @JsonKey(name: 'total_points') required int totalPoints,
    @JsonKey(name: 'total_unlocked') required int totalUnlocked,
    @JsonKey(name: 'total_available') required int totalAvailable,
  }) = _AchievementsResponse;

  factory AchievementsResponse.fromJson(Map<String, dynamic> json) =>
      _$AchievementsResponseFromJson(json);
}

@freezed
sealed class AchievementUnlock with _$AchievementUnlock {
  const factory AchievementUnlock({
    required String id,
    required String name,
    required String description,
    required AchievementRarity rarity,
    required int points,
    required String icon,
  }) = _AchievementUnlock;

  factory AchievementUnlock.fromJson(Map<String, dynamic> json) =>
      _$AchievementUnlockFromJson(json);
}
