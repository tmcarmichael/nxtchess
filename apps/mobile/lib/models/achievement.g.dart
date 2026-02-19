// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'achievement.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_Achievement _$AchievementFromJson(Map<String, dynamic> json) => _Achievement(
  id: json['id'] as String,
  name: json['name'] as String,
  description: json['description'] as String,
  category: $enumDecode(_$AchievementCategoryEnumMap, json['category']),
  rarity: $enumDecode(_$AchievementRarityEnumMap, json['rarity']),
  points: (json['points'] as num).toInt(),
  icon: json['icon'] as String,
);

Map<String, dynamic> _$AchievementToJson(_Achievement instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'description': instance.description,
      'category': _$AchievementCategoryEnumMap[instance.category]!,
      'rarity': _$AchievementRarityEnumMap[instance.rarity]!,
      'points': instance.points,
      'icon': instance.icon,
    };

const _$AchievementCategoryEnumMap = {
  AchievementCategory.loyalty: 'loyalty',
  AchievementCategory.streaks: 'streaks',
  AchievementCategory.rating: 'rating',
  AchievementCategory.chessMoments: 'chess_moments',
  AchievementCategory.volume: 'volume',
  AchievementCategory.fun: 'fun',
};

const _$AchievementRarityEnumMap = {
  AchievementRarity.common: 'common',
  AchievementRarity.uncommon: 'uncommon',
  AchievementRarity.rare: 'rare',
  AchievementRarity.epic: 'epic',
  AchievementRarity.legendary: 'legendary',
};

_UserAchievement _$UserAchievementFromJson(Map<String, dynamic> json) =>
    _UserAchievement(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      category: $enumDecode(_$AchievementCategoryEnumMap, json['category']),
      rarity: $enumDecode(_$AchievementRarityEnumMap, json['rarity']),
      points: (json['points'] as num).toInt(),
      icon: json['icon'] as String,
      unlockedAt: json['unlocked_at'] as String,
    );

Map<String, dynamic> _$UserAchievementToJson(_UserAchievement instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'description': instance.description,
      'category': _$AchievementCategoryEnumMap[instance.category]!,
      'rarity': _$AchievementRarityEnumMap[instance.rarity]!,
      'points': instance.points,
      'icon': instance.icon,
      'unlocked_at': instance.unlockedAt,
    };

_AchievementsResponse _$AchievementsResponseFromJson(
  Map<String, dynamic> json,
) => _AchievementsResponse(
  achievements: (json['achievements'] as List<dynamic>)
      .map((e) => UserAchievement.fromJson(e as Map<String, dynamic>))
      .toList(),
  totalPoints: (json['total_points'] as num).toInt(),
  totalUnlocked: (json['total_unlocked'] as num).toInt(),
  totalAvailable: (json['total_available'] as num).toInt(),
);

Map<String, dynamic> _$AchievementsResponseToJson(
  _AchievementsResponse instance,
) => <String, dynamic>{
  'achievements': instance.achievements,
  'total_points': instance.totalPoints,
  'total_unlocked': instance.totalUnlocked,
  'total_available': instance.totalAvailable,
};

_AchievementUnlock _$AchievementUnlockFromJson(Map<String, dynamic> json) =>
    _AchievementUnlock(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      rarity: $enumDecode(_$AchievementRarityEnumMap, json['rarity']),
      points: (json['points'] as num).toInt(),
      icon: json['icon'] as String,
    );

Map<String, dynamic> _$AchievementUnlockToJson(_AchievementUnlock instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'description': instance.description,
      'rarity': _$AchievementRarityEnumMap[instance.rarity]!,
      'points': instance.points,
      'icon': instance.icon,
    };
