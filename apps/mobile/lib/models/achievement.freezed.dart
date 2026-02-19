// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'achievement.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$Achievement {

 String get id; String get name; String get description; AchievementCategory get category; AchievementRarity get rarity; int get points; String get icon;
/// Create a copy of Achievement
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$AchievementCopyWith<Achievement> get copyWith => _$AchievementCopyWithImpl<Achievement>(this as Achievement, _$identity);

  /// Serializes this Achievement to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is Achievement&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.description, description) || other.description == description)&&(identical(other.category, category) || other.category == category)&&(identical(other.rarity, rarity) || other.rarity == rarity)&&(identical(other.points, points) || other.points == points)&&(identical(other.icon, icon) || other.icon == icon));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,description,category,rarity,points,icon);

@override
String toString() {
  return 'Achievement(id: $id, name: $name, description: $description, category: $category, rarity: $rarity, points: $points, icon: $icon)';
}


}

/// @nodoc
abstract mixin class $AchievementCopyWith<$Res>  {
  factory $AchievementCopyWith(Achievement value, $Res Function(Achievement) _then) = _$AchievementCopyWithImpl;
@useResult
$Res call({
 String id, String name, String description, AchievementCategory category, AchievementRarity rarity, int points, String icon
});




}
/// @nodoc
class _$AchievementCopyWithImpl<$Res>
    implements $AchievementCopyWith<$Res> {
  _$AchievementCopyWithImpl(this._self, this._then);

  final Achievement _self;
  final $Res Function(Achievement) _then;

/// Create a copy of Achievement
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? name = null,Object? description = null,Object? category = null,Object? rarity = null,Object? points = null,Object? icon = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,description: null == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String,category: null == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as AchievementCategory,rarity: null == rarity ? _self.rarity : rarity // ignore: cast_nullable_to_non_nullable
as AchievementRarity,points: null == points ? _self.points : points // ignore: cast_nullable_to_non_nullable
as int,icon: null == icon ? _self.icon : icon // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [Achievement].
extension AchievementPatterns on Achievement {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _Achievement value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _Achievement() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _Achievement value)  $default,){
final _that = this;
switch (_that) {
case _Achievement():
return $default(_that);}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _Achievement value)?  $default,){
final _that = this;
switch (_that) {
case _Achievement() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String name,  String description,  AchievementCategory category,  AchievementRarity rarity,  int points,  String icon)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _Achievement() when $default != null:
return $default(_that.id,_that.name,_that.description,_that.category,_that.rarity,_that.points,_that.icon);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String name,  String description,  AchievementCategory category,  AchievementRarity rarity,  int points,  String icon)  $default,) {final _that = this;
switch (_that) {
case _Achievement():
return $default(_that.id,_that.name,_that.description,_that.category,_that.rarity,_that.points,_that.icon);}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String name,  String description,  AchievementCategory category,  AchievementRarity rarity,  int points,  String icon)?  $default,) {final _that = this;
switch (_that) {
case _Achievement() when $default != null:
return $default(_that.id,_that.name,_that.description,_that.category,_that.rarity,_that.points,_that.icon);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _Achievement implements Achievement {
  const _Achievement({required this.id, required this.name, required this.description, required this.category, required this.rarity, required this.points, required this.icon});
  factory _Achievement.fromJson(Map<String, dynamic> json) => _$AchievementFromJson(json);

@override final  String id;
@override final  String name;
@override final  String description;
@override final  AchievementCategory category;
@override final  AchievementRarity rarity;
@override final  int points;
@override final  String icon;

/// Create a copy of Achievement
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$AchievementCopyWith<_Achievement> get copyWith => __$AchievementCopyWithImpl<_Achievement>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$AchievementToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _Achievement&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.description, description) || other.description == description)&&(identical(other.category, category) || other.category == category)&&(identical(other.rarity, rarity) || other.rarity == rarity)&&(identical(other.points, points) || other.points == points)&&(identical(other.icon, icon) || other.icon == icon));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,description,category,rarity,points,icon);

@override
String toString() {
  return 'Achievement(id: $id, name: $name, description: $description, category: $category, rarity: $rarity, points: $points, icon: $icon)';
}


}

/// @nodoc
abstract mixin class _$AchievementCopyWith<$Res> implements $AchievementCopyWith<$Res> {
  factory _$AchievementCopyWith(_Achievement value, $Res Function(_Achievement) _then) = __$AchievementCopyWithImpl;
@override @useResult
$Res call({
 String id, String name, String description, AchievementCategory category, AchievementRarity rarity, int points, String icon
});




}
/// @nodoc
class __$AchievementCopyWithImpl<$Res>
    implements _$AchievementCopyWith<$Res> {
  __$AchievementCopyWithImpl(this._self, this._then);

  final _Achievement _self;
  final $Res Function(_Achievement) _then;

/// Create a copy of Achievement
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? name = null,Object? description = null,Object? category = null,Object? rarity = null,Object? points = null,Object? icon = null,}) {
  return _then(_Achievement(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,description: null == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String,category: null == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as AchievementCategory,rarity: null == rarity ? _self.rarity : rarity // ignore: cast_nullable_to_non_nullable
as AchievementRarity,points: null == points ? _self.points : points // ignore: cast_nullable_to_non_nullable
as int,icon: null == icon ? _self.icon : icon // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}


/// @nodoc
mixin _$UserAchievement {

 String get id; String get name; String get description; AchievementCategory get category; AchievementRarity get rarity; int get points; String get icon;@JsonKey(name: 'unlocked_at') String get unlockedAt;
/// Create a copy of UserAchievement
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$UserAchievementCopyWith<UserAchievement> get copyWith => _$UserAchievementCopyWithImpl<UserAchievement>(this as UserAchievement, _$identity);

  /// Serializes this UserAchievement to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is UserAchievement&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.description, description) || other.description == description)&&(identical(other.category, category) || other.category == category)&&(identical(other.rarity, rarity) || other.rarity == rarity)&&(identical(other.points, points) || other.points == points)&&(identical(other.icon, icon) || other.icon == icon)&&(identical(other.unlockedAt, unlockedAt) || other.unlockedAt == unlockedAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,description,category,rarity,points,icon,unlockedAt);

@override
String toString() {
  return 'UserAchievement(id: $id, name: $name, description: $description, category: $category, rarity: $rarity, points: $points, icon: $icon, unlockedAt: $unlockedAt)';
}


}

/// @nodoc
abstract mixin class $UserAchievementCopyWith<$Res>  {
  factory $UserAchievementCopyWith(UserAchievement value, $Res Function(UserAchievement) _then) = _$UserAchievementCopyWithImpl;
@useResult
$Res call({
 String id, String name, String description, AchievementCategory category, AchievementRarity rarity, int points, String icon,@JsonKey(name: 'unlocked_at') String unlockedAt
});




}
/// @nodoc
class _$UserAchievementCopyWithImpl<$Res>
    implements $UserAchievementCopyWith<$Res> {
  _$UserAchievementCopyWithImpl(this._self, this._then);

  final UserAchievement _self;
  final $Res Function(UserAchievement) _then;

/// Create a copy of UserAchievement
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? name = null,Object? description = null,Object? category = null,Object? rarity = null,Object? points = null,Object? icon = null,Object? unlockedAt = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,description: null == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String,category: null == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as AchievementCategory,rarity: null == rarity ? _self.rarity : rarity // ignore: cast_nullable_to_non_nullable
as AchievementRarity,points: null == points ? _self.points : points // ignore: cast_nullable_to_non_nullable
as int,icon: null == icon ? _self.icon : icon // ignore: cast_nullable_to_non_nullable
as String,unlockedAt: null == unlockedAt ? _self.unlockedAt : unlockedAt // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [UserAchievement].
extension UserAchievementPatterns on UserAchievement {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _UserAchievement value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _UserAchievement() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _UserAchievement value)  $default,){
final _that = this;
switch (_that) {
case _UserAchievement():
return $default(_that);}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _UserAchievement value)?  $default,){
final _that = this;
switch (_that) {
case _UserAchievement() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String name,  String description,  AchievementCategory category,  AchievementRarity rarity,  int points,  String icon, @JsonKey(name: 'unlocked_at')  String unlockedAt)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _UserAchievement() when $default != null:
return $default(_that.id,_that.name,_that.description,_that.category,_that.rarity,_that.points,_that.icon,_that.unlockedAt);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String name,  String description,  AchievementCategory category,  AchievementRarity rarity,  int points,  String icon, @JsonKey(name: 'unlocked_at')  String unlockedAt)  $default,) {final _that = this;
switch (_that) {
case _UserAchievement():
return $default(_that.id,_that.name,_that.description,_that.category,_that.rarity,_that.points,_that.icon,_that.unlockedAt);}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String name,  String description,  AchievementCategory category,  AchievementRarity rarity,  int points,  String icon, @JsonKey(name: 'unlocked_at')  String unlockedAt)?  $default,) {final _that = this;
switch (_that) {
case _UserAchievement() when $default != null:
return $default(_that.id,_that.name,_that.description,_that.category,_that.rarity,_that.points,_that.icon,_that.unlockedAt);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _UserAchievement implements UserAchievement {
  const _UserAchievement({required this.id, required this.name, required this.description, required this.category, required this.rarity, required this.points, required this.icon, @JsonKey(name: 'unlocked_at') required this.unlockedAt});
  factory _UserAchievement.fromJson(Map<String, dynamic> json) => _$UserAchievementFromJson(json);

@override final  String id;
@override final  String name;
@override final  String description;
@override final  AchievementCategory category;
@override final  AchievementRarity rarity;
@override final  int points;
@override final  String icon;
@override@JsonKey(name: 'unlocked_at') final  String unlockedAt;

/// Create a copy of UserAchievement
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$UserAchievementCopyWith<_UserAchievement> get copyWith => __$UserAchievementCopyWithImpl<_UserAchievement>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$UserAchievementToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _UserAchievement&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.description, description) || other.description == description)&&(identical(other.category, category) || other.category == category)&&(identical(other.rarity, rarity) || other.rarity == rarity)&&(identical(other.points, points) || other.points == points)&&(identical(other.icon, icon) || other.icon == icon)&&(identical(other.unlockedAt, unlockedAt) || other.unlockedAt == unlockedAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,description,category,rarity,points,icon,unlockedAt);

@override
String toString() {
  return 'UserAchievement(id: $id, name: $name, description: $description, category: $category, rarity: $rarity, points: $points, icon: $icon, unlockedAt: $unlockedAt)';
}


}

/// @nodoc
abstract mixin class _$UserAchievementCopyWith<$Res> implements $UserAchievementCopyWith<$Res> {
  factory _$UserAchievementCopyWith(_UserAchievement value, $Res Function(_UserAchievement) _then) = __$UserAchievementCopyWithImpl;
@override @useResult
$Res call({
 String id, String name, String description, AchievementCategory category, AchievementRarity rarity, int points, String icon,@JsonKey(name: 'unlocked_at') String unlockedAt
});




}
/// @nodoc
class __$UserAchievementCopyWithImpl<$Res>
    implements _$UserAchievementCopyWith<$Res> {
  __$UserAchievementCopyWithImpl(this._self, this._then);

  final _UserAchievement _self;
  final $Res Function(_UserAchievement) _then;

/// Create a copy of UserAchievement
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? name = null,Object? description = null,Object? category = null,Object? rarity = null,Object? points = null,Object? icon = null,Object? unlockedAt = null,}) {
  return _then(_UserAchievement(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,description: null == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String,category: null == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as AchievementCategory,rarity: null == rarity ? _self.rarity : rarity // ignore: cast_nullable_to_non_nullable
as AchievementRarity,points: null == points ? _self.points : points // ignore: cast_nullable_to_non_nullable
as int,icon: null == icon ? _self.icon : icon // ignore: cast_nullable_to_non_nullable
as String,unlockedAt: null == unlockedAt ? _self.unlockedAt : unlockedAt // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}


/// @nodoc
mixin _$AchievementsResponse {

 List<UserAchievement> get achievements;@JsonKey(name: 'total_points') int get totalPoints;@JsonKey(name: 'total_unlocked') int get totalUnlocked;@JsonKey(name: 'total_available') int get totalAvailable;
/// Create a copy of AchievementsResponse
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$AchievementsResponseCopyWith<AchievementsResponse> get copyWith => _$AchievementsResponseCopyWithImpl<AchievementsResponse>(this as AchievementsResponse, _$identity);

  /// Serializes this AchievementsResponse to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is AchievementsResponse&&const DeepCollectionEquality().equals(other.achievements, achievements)&&(identical(other.totalPoints, totalPoints) || other.totalPoints == totalPoints)&&(identical(other.totalUnlocked, totalUnlocked) || other.totalUnlocked == totalUnlocked)&&(identical(other.totalAvailable, totalAvailable) || other.totalAvailable == totalAvailable));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,const DeepCollectionEquality().hash(achievements),totalPoints,totalUnlocked,totalAvailable);

@override
String toString() {
  return 'AchievementsResponse(achievements: $achievements, totalPoints: $totalPoints, totalUnlocked: $totalUnlocked, totalAvailable: $totalAvailable)';
}


}

/// @nodoc
abstract mixin class $AchievementsResponseCopyWith<$Res>  {
  factory $AchievementsResponseCopyWith(AchievementsResponse value, $Res Function(AchievementsResponse) _then) = _$AchievementsResponseCopyWithImpl;
@useResult
$Res call({
 List<UserAchievement> achievements,@JsonKey(name: 'total_points') int totalPoints,@JsonKey(name: 'total_unlocked') int totalUnlocked,@JsonKey(name: 'total_available') int totalAvailable
});




}
/// @nodoc
class _$AchievementsResponseCopyWithImpl<$Res>
    implements $AchievementsResponseCopyWith<$Res> {
  _$AchievementsResponseCopyWithImpl(this._self, this._then);

  final AchievementsResponse _self;
  final $Res Function(AchievementsResponse) _then;

/// Create a copy of AchievementsResponse
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? achievements = null,Object? totalPoints = null,Object? totalUnlocked = null,Object? totalAvailable = null,}) {
  return _then(_self.copyWith(
achievements: null == achievements ? _self.achievements : achievements // ignore: cast_nullable_to_non_nullable
as List<UserAchievement>,totalPoints: null == totalPoints ? _self.totalPoints : totalPoints // ignore: cast_nullable_to_non_nullable
as int,totalUnlocked: null == totalUnlocked ? _self.totalUnlocked : totalUnlocked // ignore: cast_nullable_to_non_nullable
as int,totalAvailable: null == totalAvailable ? _self.totalAvailable : totalAvailable // ignore: cast_nullable_to_non_nullable
as int,
  ));
}

}


/// Adds pattern-matching-related methods to [AchievementsResponse].
extension AchievementsResponsePatterns on AchievementsResponse {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _AchievementsResponse value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _AchievementsResponse() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _AchievementsResponse value)  $default,){
final _that = this;
switch (_that) {
case _AchievementsResponse():
return $default(_that);}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _AchievementsResponse value)?  $default,){
final _that = this;
switch (_that) {
case _AchievementsResponse() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( List<UserAchievement> achievements, @JsonKey(name: 'total_points')  int totalPoints, @JsonKey(name: 'total_unlocked')  int totalUnlocked, @JsonKey(name: 'total_available')  int totalAvailable)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _AchievementsResponse() when $default != null:
return $default(_that.achievements,_that.totalPoints,_that.totalUnlocked,_that.totalAvailable);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( List<UserAchievement> achievements, @JsonKey(name: 'total_points')  int totalPoints, @JsonKey(name: 'total_unlocked')  int totalUnlocked, @JsonKey(name: 'total_available')  int totalAvailable)  $default,) {final _that = this;
switch (_that) {
case _AchievementsResponse():
return $default(_that.achievements,_that.totalPoints,_that.totalUnlocked,_that.totalAvailable);}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( List<UserAchievement> achievements, @JsonKey(name: 'total_points')  int totalPoints, @JsonKey(name: 'total_unlocked')  int totalUnlocked, @JsonKey(name: 'total_available')  int totalAvailable)?  $default,) {final _that = this;
switch (_that) {
case _AchievementsResponse() when $default != null:
return $default(_that.achievements,_that.totalPoints,_that.totalUnlocked,_that.totalAvailable);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _AchievementsResponse implements AchievementsResponse {
  const _AchievementsResponse({required final  List<UserAchievement> achievements, @JsonKey(name: 'total_points') required this.totalPoints, @JsonKey(name: 'total_unlocked') required this.totalUnlocked, @JsonKey(name: 'total_available') required this.totalAvailable}): _achievements = achievements;
  factory _AchievementsResponse.fromJson(Map<String, dynamic> json) => _$AchievementsResponseFromJson(json);

 final  List<UserAchievement> _achievements;
@override List<UserAchievement> get achievements {
  if (_achievements is EqualUnmodifiableListView) return _achievements;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_achievements);
}

@override@JsonKey(name: 'total_points') final  int totalPoints;
@override@JsonKey(name: 'total_unlocked') final  int totalUnlocked;
@override@JsonKey(name: 'total_available') final  int totalAvailable;

/// Create a copy of AchievementsResponse
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$AchievementsResponseCopyWith<_AchievementsResponse> get copyWith => __$AchievementsResponseCopyWithImpl<_AchievementsResponse>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$AchievementsResponseToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _AchievementsResponse&&const DeepCollectionEquality().equals(other._achievements, _achievements)&&(identical(other.totalPoints, totalPoints) || other.totalPoints == totalPoints)&&(identical(other.totalUnlocked, totalUnlocked) || other.totalUnlocked == totalUnlocked)&&(identical(other.totalAvailable, totalAvailable) || other.totalAvailable == totalAvailable));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,const DeepCollectionEquality().hash(_achievements),totalPoints,totalUnlocked,totalAvailable);

@override
String toString() {
  return 'AchievementsResponse(achievements: $achievements, totalPoints: $totalPoints, totalUnlocked: $totalUnlocked, totalAvailable: $totalAvailable)';
}


}

/// @nodoc
abstract mixin class _$AchievementsResponseCopyWith<$Res> implements $AchievementsResponseCopyWith<$Res> {
  factory _$AchievementsResponseCopyWith(_AchievementsResponse value, $Res Function(_AchievementsResponse) _then) = __$AchievementsResponseCopyWithImpl;
@override @useResult
$Res call({
 List<UserAchievement> achievements,@JsonKey(name: 'total_points') int totalPoints,@JsonKey(name: 'total_unlocked') int totalUnlocked,@JsonKey(name: 'total_available') int totalAvailable
});




}
/// @nodoc
class __$AchievementsResponseCopyWithImpl<$Res>
    implements _$AchievementsResponseCopyWith<$Res> {
  __$AchievementsResponseCopyWithImpl(this._self, this._then);

  final _AchievementsResponse _self;
  final $Res Function(_AchievementsResponse) _then;

/// Create a copy of AchievementsResponse
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? achievements = null,Object? totalPoints = null,Object? totalUnlocked = null,Object? totalAvailable = null,}) {
  return _then(_AchievementsResponse(
achievements: null == achievements ? _self._achievements : achievements // ignore: cast_nullable_to_non_nullable
as List<UserAchievement>,totalPoints: null == totalPoints ? _self.totalPoints : totalPoints // ignore: cast_nullable_to_non_nullable
as int,totalUnlocked: null == totalUnlocked ? _self.totalUnlocked : totalUnlocked // ignore: cast_nullable_to_non_nullable
as int,totalAvailable: null == totalAvailable ? _self.totalAvailable : totalAvailable // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}


/// @nodoc
mixin _$AchievementUnlock {

 String get id; String get name; String get description; AchievementRarity get rarity; int get points; String get icon;
/// Create a copy of AchievementUnlock
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$AchievementUnlockCopyWith<AchievementUnlock> get copyWith => _$AchievementUnlockCopyWithImpl<AchievementUnlock>(this as AchievementUnlock, _$identity);

  /// Serializes this AchievementUnlock to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is AchievementUnlock&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.description, description) || other.description == description)&&(identical(other.rarity, rarity) || other.rarity == rarity)&&(identical(other.points, points) || other.points == points)&&(identical(other.icon, icon) || other.icon == icon));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,description,rarity,points,icon);

@override
String toString() {
  return 'AchievementUnlock(id: $id, name: $name, description: $description, rarity: $rarity, points: $points, icon: $icon)';
}


}

/// @nodoc
abstract mixin class $AchievementUnlockCopyWith<$Res>  {
  factory $AchievementUnlockCopyWith(AchievementUnlock value, $Res Function(AchievementUnlock) _then) = _$AchievementUnlockCopyWithImpl;
@useResult
$Res call({
 String id, String name, String description, AchievementRarity rarity, int points, String icon
});




}
/// @nodoc
class _$AchievementUnlockCopyWithImpl<$Res>
    implements $AchievementUnlockCopyWith<$Res> {
  _$AchievementUnlockCopyWithImpl(this._self, this._then);

  final AchievementUnlock _self;
  final $Res Function(AchievementUnlock) _then;

/// Create a copy of AchievementUnlock
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? name = null,Object? description = null,Object? rarity = null,Object? points = null,Object? icon = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,description: null == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String,rarity: null == rarity ? _self.rarity : rarity // ignore: cast_nullable_to_non_nullable
as AchievementRarity,points: null == points ? _self.points : points // ignore: cast_nullable_to_non_nullable
as int,icon: null == icon ? _self.icon : icon // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [AchievementUnlock].
extension AchievementUnlockPatterns on AchievementUnlock {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _AchievementUnlock value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _AchievementUnlock() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _AchievementUnlock value)  $default,){
final _that = this;
switch (_that) {
case _AchievementUnlock():
return $default(_that);}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _AchievementUnlock value)?  $default,){
final _that = this;
switch (_that) {
case _AchievementUnlock() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String name,  String description,  AchievementRarity rarity,  int points,  String icon)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _AchievementUnlock() when $default != null:
return $default(_that.id,_that.name,_that.description,_that.rarity,_that.points,_that.icon);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String name,  String description,  AchievementRarity rarity,  int points,  String icon)  $default,) {final _that = this;
switch (_that) {
case _AchievementUnlock():
return $default(_that.id,_that.name,_that.description,_that.rarity,_that.points,_that.icon);}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String name,  String description,  AchievementRarity rarity,  int points,  String icon)?  $default,) {final _that = this;
switch (_that) {
case _AchievementUnlock() when $default != null:
return $default(_that.id,_that.name,_that.description,_that.rarity,_that.points,_that.icon);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _AchievementUnlock implements AchievementUnlock {
  const _AchievementUnlock({required this.id, required this.name, required this.description, required this.rarity, required this.points, required this.icon});
  factory _AchievementUnlock.fromJson(Map<String, dynamic> json) => _$AchievementUnlockFromJson(json);

@override final  String id;
@override final  String name;
@override final  String description;
@override final  AchievementRarity rarity;
@override final  int points;
@override final  String icon;

/// Create a copy of AchievementUnlock
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$AchievementUnlockCopyWith<_AchievementUnlock> get copyWith => __$AchievementUnlockCopyWithImpl<_AchievementUnlock>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$AchievementUnlockToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _AchievementUnlock&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.description, description) || other.description == description)&&(identical(other.rarity, rarity) || other.rarity == rarity)&&(identical(other.points, points) || other.points == points)&&(identical(other.icon, icon) || other.icon == icon));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,description,rarity,points,icon);

@override
String toString() {
  return 'AchievementUnlock(id: $id, name: $name, description: $description, rarity: $rarity, points: $points, icon: $icon)';
}


}

/// @nodoc
abstract mixin class _$AchievementUnlockCopyWith<$Res> implements $AchievementUnlockCopyWith<$Res> {
  factory _$AchievementUnlockCopyWith(_AchievementUnlock value, $Res Function(_AchievementUnlock) _then) = __$AchievementUnlockCopyWithImpl;
@override @useResult
$Res call({
 String id, String name, String description, AchievementRarity rarity, int points, String icon
});




}
/// @nodoc
class __$AchievementUnlockCopyWithImpl<$Res>
    implements _$AchievementUnlockCopyWith<$Res> {
  __$AchievementUnlockCopyWithImpl(this._self, this._then);

  final _AchievementUnlock _self;
  final $Res Function(_AchievementUnlock) _then;

/// Create a copy of AchievementUnlock
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? name = null,Object? description = null,Object? rarity = null,Object? points = null,Object? icon = null,}) {
  return _then(_AchievementUnlock(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,description: null == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String,rarity: null == rarity ? _self.rarity : rarity // ignore: cast_nullable_to_non_nullable
as AchievementRarity,points: null == points ? _self.points : points // ignore: cast_nullable_to_non_nullable
as int,icon: null == icon ? _self.icon : icon // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}

// dart format on
