// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'user.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$PublicProfile {

 String get username; int get rating;@JsonKey(name: 'puzzle_rating') int get puzzleRating;@JsonKey(name: 'profile_icon') String get profileIcon;@JsonKey(name: 'achievement_points') int get achievementPoints;@JsonKey(name: 'created_at') String get createdAt;@JsonKey(name: 'games_played') int get totalGames; int get wins; int get losses; int get draws;
/// Create a copy of PublicProfile
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$PublicProfileCopyWith<PublicProfile> get copyWith => _$PublicProfileCopyWithImpl<PublicProfile>(this as PublicProfile, _$identity);

  /// Serializes this PublicProfile to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is PublicProfile&&(identical(other.username, username) || other.username == username)&&(identical(other.rating, rating) || other.rating == rating)&&(identical(other.puzzleRating, puzzleRating) || other.puzzleRating == puzzleRating)&&(identical(other.profileIcon, profileIcon) || other.profileIcon == profileIcon)&&(identical(other.achievementPoints, achievementPoints) || other.achievementPoints == achievementPoints)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.totalGames, totalGames) || other.totalGames == totalGames)&&(identical(other.wins, wins) || other.wins == wins)&&(identical(other.losses, losses) || other.losses == losses)&&(identical(other.draws, draws) || other.draws == draws));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,username,rating,puzzleRating,profileIcon,achievementPoints,createdAt,totalGames,wins,losses,draws);

@override
String toString() {
  return 'PublicProfile(username: $username, rating: $rating, puzzleRating: $puzzleRating, profileIcon: $profileIcon, achievementPoints: $achievementPoints, createdAt: $createdAt, totalGames: $totalGames, wins: $wins, losses: $losses, draws: $draws)';
}


}

/// @nodoc
abstract mixin class $PublicProfileCopyWith<$Res>  {
  factory $PublicProfileCopyWith(PublicProfile value, $Res Function(PublicProfile) _then) = _$PublicProfileCopyWithImpl;
@useResult
$Res call({
 String username, int rating,@JsonKey(name: 'puzzle_rating') int puzzleRating,@JsonKey(name: 'profile_icon') String profileIcon,@JsonKey(name: 'achievement_points') int achievementPoints,@JsonKey(name: 'created_at') String createdAt,@JsonKey(name: 'games_played') int totalGames, int wins, int losses, int draws
});




}
/// @nodoc
class _$PublicProfileCopyWithImpl<$Res>
    implements $PublicProfileCopyWith<$Res> {
  _$PublicProfileCopyWithImpl(this._self, this._then);

  final PublicProfile _self;
  final $Res Function(PublicProfile) _then;

/// Create a copy of PublicProfile
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? username = null,Object? rating = null,Object? puzzleRating = null,Object? profileIcon = null,Object? achievementPoints = null,Object? createdAt = null,Object? totalGames = null,Object? wins = null,Object? losses = null,Object? draws = null,}) {
  return _then(_self.copyWith(
username: null == username ? _self.username : username // ignore: cast_nullable_to_non_nullable
as String,rating: null == rating ? _self.rating : rating // ignore: cast_nullable_to_non_nullable
as int,puzzleRating: null == puzzleRating ? _self.puzzleRating : puzzleRating // ignore: cast_nullable_to_non_nullable
as int,profileIcon: null == profileIcon ? _self.profileIcon : profileIcon // ignore: cast_nullable_to_non_nullable
as String,achievementPoints: null == achievementPoints ? _self.achievementPoints : achievementPoints // ignore: cast_nullable_to_non_nullable
as int,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as String,totalGames: null == totalGames ? _self.totalGames : totalGames // ignore: cast_nullable_to_non_nullable
as int,wins: null == wins ? _self.wins : wins // ignore: cast_nullable_to_non_nullable
as int,losses: null == losses ? _self.losses : losses // ignore: cast_nullable_to_non_nullable
as int,draws: null == draws ? _self.draws : draws // ignore: cast_nullable_to_non_nullable
as int,
  ));
}

}


/// Adds pattern-matching-related methods to [PublicProfile].
extension PublicProfilePatterns on PublicProfile {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _PublicProfile value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _PublicProfile() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _PublicProfile value)  $default,){
final _that = this;
switch (_that) {
case _PublicProfile():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _PublicProfile value)?  $default,){
final _that = this;
switch (_that) {
case _PublicProfile() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String username,  int rating, @JsonKey(name: 'puzzle_rating')  int puzzleRating, @JsonKey(name: 'profile_icon')  String profileIcon, @JsonKey(name: 'achievement_points')  int achievementPoints, @JsonKey(name: 'created_at')  String createdAt, @JsonKey(name: 'games_played')  int totalGames,  int wins,  int losses,  int draws)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _PublicProfile() when $default != null:
return $default(_that.username,_that.rating,_that.puzzleRating,_that.profileIcon,_that.achievementPoints,_that.createdAt,_that.totalGames,_that.wins,_that.losses,_that.draws);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String username,  int rating, @JsonKey(name: 'puzzle_rating')  int puzzleRating, @JsonKey(name: 'profile_icon')  String profileIcon, @JsonKey(name: 'achievement_points')  int achievementPoints, @JsonKey(name: 'created_at')  String createdAt, @JsonKey(name: 'games_played')  int totalGames,  int wins,  int losses,  int draws)  $default,) {final _that = this;
switch (_that) {
case _PublicProfile():
return $default(_that.username,_that.rating,_that.puzzleRating,_that.profileIcon,_that.achievementPoints,_that.createdAt,_that.totalGames,_that.wins,_that.losses,_that.draws);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String username,  int rating, @JsonKey(name: 'puzzle_rating')  int puzzleRating, @JsonKey(name: 'profile_icon')  String profileIcon, @JsonKey(name: 'achievement_points')  int achievementPoints, @JsonKey(name: 'created_at')  String createdAt, @JsonKey(name: 'games_played')  int totalGames,  int wins,  int losses,  int draws)?  $default,) {final _that = this;
switch (_that) {
case _PublicProfile() when $default != null:
return $default(_that.username,_that.rating,_that.puzzleRating,_that.profileIcon,_that.achievementPoints,_that.createdAt,_that.totalGames,_that.wins,_that.losses,_that.draws);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _PublicProfile implements PublicProfile {
  const _PublicProfile({required this.username, required this.rating, @JsonKey(name: 'puzzle_rating') required this.puzzleRating, @JsonKey(name: 'profile_icon') required this.profileIcon, @JsonKey(name: 'achievement_points') required this.achievementPoints, @JsonKey(name: 'created_at') required this.createdAt, @JsonKey(name: 'games_played') required this.totalGames, required this.wins, required this.losses, required this.draws});
  factory _PublicProfile.fromJson(Map<String, dynamic> json) => _$PublicProfileFromJson(json);

@override final  String username;
@override final  int rating;
@override@JsonKey(name: 'puzzle_rating') final  int puzzleRating;
@override@JsonKey(name: 'profile_icon') final  String profileIcon;
@override@JsonKey(name: 'achievement_points') final  int achievementPoints;
@override@JsonKey(name: 'created_at') final  String createdAt;
@override@JsonKey(name: 'games_played') final  int totalGames;
@override final  int wins;
@override final  int losses;
@override final  int draws;

/// Create a copy of PublicProfile
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$PublicProfileCopyWith<_PublicProfile> get copyWith => __$PublicProfileCopyWithImpl<_PublicProfile>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$PublicProfileToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _PublicProfile&&(identical(other.username, username) || other.username == username)&&(identical(other.rating, rating) || other.rating == rating)&&(identical(other.puzzleRating, puzzleRating) || other.puzzleRating == puzzleRating)&&(identical(other.profileIcon, profileIcon) || other.profileIcon == profileIcon)&&(identical(other.achievementPoints, achievementPoints) || other.achievementPoints == achievementPoints)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.totalGames, totalGames) || other.totalGames == totalGames)&&(identical(other.wins, wins) || other.wins == wins)&&(identical(other.losses, losses) || other.losses == losses)&&(identical(other.draws, draws) || other.draws == draws));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,username,rating,puzzleRating,profileIcon,achievementPoints,createdAt,totalGames,wins,losses,draws);

@override
String toString() {
  return 'PublicProfile(username: $username, rating: $rating, puzzleRating: $puzzleRating, profileIcon: $profileIcon, achievementPoints: $achievementPoints, createdAt: $createdAt, totalGames: $totalGames, wins: $wins, losses: $losses, draws: $draws)';
}


}

/// @nodoc
abstract mixin class _$PublicProfileCopyWith<$Res> implements $PublicProfileCopyWith<$Res> {
  factory _$PublicProfileCopyWith(_PublicProfile value, $Res Function(_PublicProfile) _then) = __$PublicProfileCopyWithImpl;
@override @useResult
$Res call({
 String username, int rating,@JsonKey(name: 'puzzle_rating') int puzzleRating,@JsonKey(name: 'profile_icon') String profileIcon,@JsonKey(name: 'achievement_points') int achievementPoints,@JsonKey(name: 'created_at') String createdAt,@JsonKey(name: 'games_played') int totalGames, int wins, int losses, int draws
});




}
/// @nodoc
class __$PublicProfileCopyWithImpl<$Res>
    implements _$PublicProfileCopyWith<$Res> {
  __$PublicProfileCopyWithImpl(this._self, this._then);

  final _PublicProfile _self;
  final $Res Function(_PublicProfile) _then;

/// Create a copy of PublicProfile
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? username = null,Object? rating = null,Object? puzzleRating = null,Object? profileIcon = null,Object? achievementPoints = null,Object? createdAt = null,Object? totalGames = null,Object? wins = null,Object? losses = null,Object? draws = null,}) {
  return _then(_PublicProfile(
username: null == username ? _self.username : username // ignore: cast_nullable_to_non_nullable
as String,rating: null == rating ? _self.rating : rating // ignore: cast_nullable_to_non_nullable
as int,puzzleRating: null == puzzleRating ? _self.puzzleRating : puzzleRating // ignore: cast_nullable_to_non_nullable
as int,profileIcon: null == profileIcon ? _self.profileIcon : profileIcon // ignore: cast_nullable_to_non_nullable
as String,achievementPoints: null == achievementPoints ? _self.achievementPoints : achievementPoints // ignore: cast_nullable_to_non_nullable
as int,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as String,totalGames: null == totalGames ? _self.totalGames : totalGames // ignore: cast_nullable_to_non_nullable
as int,wins: null == wins ? _self.wins : wins // ignore: cast_nullable_to_non_nullable
as int,losses: null == losses ? _self.losses : losses // ignore: cast_nullable_to_non_nullable
as int,draws: null == draws ? _self.draws : draws // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}


/// @nodoc
mixin _$RatingPoint {

 int get rating;@JsonKey(name: 'created_at') String get createdAt;
/// Create a copy of RatingPoint
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$RatingPointCopyWith<RatingPoint> get copyWith => _$RatingPointCopyWithImpl<RatingPoint>(this as RatingPoint, _$identity);

  /// Serializes this RatingPoint to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is RatingPoint&&(identical(other.rating, rating) || other.rating == rating)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,rating,createdAt);

@override
String toString() {
  return 'RatingPoint(rating: $rating, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class $RatingPointCopyWith<$Res>  {
  factory $RatingPointCopyWith(RatingPoint value, $Res Function(RatingPoint) _then) = _$RatingPointCopyWithImpl;
@useResult
$Res call({
 int rating,@JsonKey(name: 'created_at') String createdAt
});




}
/// @nodoc
class _$RatingPointCopyWithImpl<$Res>
    implements $RatingPointCopyWith<$Res> {
  _$RatingPointCopyWithImpl(this._self, this._then);

  final RatingPoint _self;
  final $Res Function(RatingPoint) _then;

/// Create a copy of RatingPoint
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? rating = null,Object? createdAt = null,}) {
  return _then(_self.copyWith(
rating: null == rating ? _self.rating : rating // ignore: cast_nullable_to_non_nullable
as int,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [RatingPoint].
extension RatingPointPatterns on RatingPoint {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _RatingPoint value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _RatingPoint() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _RatingPoint value)  $default,){
final _that = this;
switch (_that) {
case _RatingPoint():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _RatingPoint value)?  $default,){
final _that = this;
switch (_that) {
case _RatingPoint() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( int rating, @JsonKey(name: 'created_at')  String createdAt)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _RatingPoint() when $default != null:
return $default(_that.rating,_that.createdAt);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( int rating, @JsonKey(name: 'created_at')  String createdAt)  $default,) {final _that = this;
switch (_that) {
case _RatingPoint():
return $default(_that.rating,_that.createdAt);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( int rating, @JsonKey(name: 'created_at')  String createdAt)?  $default,) {final _that = this;
switch (_that) {
case _RatingPoint() when $default != null:
return $default(_that.rating,_that.createdAt);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _RatingPoint implements RatingPoint {
  const _RatingPoint({required this.rating, @JsonKey(name: 'created_at') required this.createdAt});
  factory _RatingPoint.fromJson(Map<String, dynamic> json) => _$RatingPointFromJson(json);

@override final  int rating;
@override@JsonKey(name: 'created_at') final  String createdAt;

/// Create a copy of RatingPoint
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$RatingPointCopyWith<_RatingPoint> get copyWith => __$RatingPointCopyWithImpl<_RatingPoint>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$RatingPointToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _RatingPoint&&(identical(other.rating, rating) || other.rating == rating)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,rating,createdAt);

@override
String toString() {
  return 'RatingPoint(rating: $rating, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class _$RatingPointCopyWith<$Res> implements $RatingPointCopyWith<$Res> {
  factory _$RatingPointCopyWith(_RatingPoint value, $Res Function(_RatingPoint) _then) = __$RatingPointCopyWithImpl;
@override @useResult
$Res call({
 int rating,@JsonKey(name: 'created_at') String createdAt
});




}
/// @nodoc
class __$RatingPointCopyWithImpl<$Res>
    implements _$RatingPointCopyWith<$Res> {
  __$RatingPointCopyWithImpl(this._self, this._then);

  final _RatingPoint _self;
  final $Res Function(_RatingPoint) _then;

/// Create a copy of RatingPoint
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? rating = null,Object? createdAt = null,}) {
  return _then(_RatingPoint(
rating: null == rating ? _self.rating : rating // ignore: cast_nullable_to_non_nullable
as int,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}


/// @nodoc
mixin _$RecentGame {

@JsonKey(name: 'game_id') String get gameId; String get opponent; String get result;@JsonKey(name: 'player_color') String get playerColor;@JsonKey(name: 'created_at') String get createdAt;
/// Create a copy of RecentGame
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$RecentGameCopyWith<RecentGame> get copyWith => _$RecentGameCopyWithImpl<RecentGame>(this as RecentGame, _$identity);

  /// Serializes this RecentGame to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is RecentGame&&(identical(other.gameId, gameId) || other.gameId == gameId)&&(identical(other.opponent, opponent) || other.opponent == opponent)&&(identical(other.result, result) || other.result == result)&&(identical(other.playerColor, playerColor) || other.playerColor == playerColor)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,gameId,opponent,result,playerColor,createdAt);

@override
String toString() {
  return 'RecentGame(gameId: $gameId, opponent: $opponent, result: $result, playerColor: $playerColor, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class $RecentGameCopyWith<$Res>  {
  factory $RecentGameCopyWith(RecentGame value, $Res Function(RecentGame) _then) = _$RecentGameCopyWithImpl;
@useResult
$Res call({
@JsonKey(name: 'game_id') String gameId, String opponent, String result,@JsonKey(name: 'player_color') String playerColor,@JsonKey(name: 'created_at') String createdAt
});




}
/// @nodoc
class _$RecentGameCopyWithImpl<$Res>
    implements $RecentGameCopyWith<$Res> {
  _$RecentGameCopyWithImpl(this._self, this._then);

  final RecentGame _self;
  final $Res Function(RecentGame) _then;

/// Create a copy of RecentGame
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? gameId = null,Object? opponent = null,Object? result = null,Object? playerColor = null,Object? createdAt = null,}) {
  return _then(_self.copyWith(
gameId: null == gameId ? _self.gameId : gameId // ignore: cast_nullable_to_non_nullable
as String,opponent: null == opponent ? _self.opponent : opponent // ignore: cast_nullable_to_non_nullable
as String,result: null == result ? _self.result : result // ignore: cast_nullable_to_non_nullable
as String,playerColor: null == playerColor ? _self.playerColor : playerColor // ignore: cast_nullable_to_non_nullable
as String,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [RecentGame].
extension RecentGamePatterns on RecentGame {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _RecentGame value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _RecentGame() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _RecentGame value)  $default,){
final _that = this;
switch (_that) {
case _RecentGame():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _RecentGame value)?  $default,){
final _that = this;
switch (_that) {
case _RecentGame() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(name: 'game_id')  String gameId,  String opponent,  String result, @JsonKey(name: 'player_color')  String playerColor, @JsonKey(name: 'created_at')  String createdAt)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _RecentGame() when $default != null:
return $default(_that.gameId,_that.opponent,_that.result,_that.playerColor,_that.createdAt);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(name: 'game_id')  String gameId,  String opponent,  String result, @JsonKey(name: 'player_color')  String playerColor, @JsonKey(name: 'created_at')  String createdAt)  $default,) {final _that = this;
switch (_that) {
case _RecentGame():
return $default(_that.gameId,_that.opponent,_that.result,_that.playerColor,_that.createdAt);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(name: 'game_id')  String gameId,  String opponent,  String result, @JsonKey(name: 'player_color')  String playerColor, @JsonKey(name: 'created_at')  String createdAt)?  $default,) {final _that = this;
switch (_that) {
case _RecentGame() when $default != null:
return $default(_that.gameId,_that.opponent,_that.result,_that.playerColor,_that.createdAt);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _RecentGame implements RecentGame {
  const _RecentGame({@JsonKey(name: 'game_id') required this.gameId, required this.opponent, required this.result, @JsonKey(name: 'player_color') required this.playerColor, @JsonKey(name: 'created_at') required this.createdAt});
  factory _RecentGame.fromJson(Map<String, dynamic> json) => _$RecentGameFromJson(json);

@override@JsonKey(name: 'game_id') final  String gameId;
@override final  String opponent;
@override final  String result;
@override@JsonKey(name: 'player_color') final  String playerColor;
@override@JsonKey(name: 'created_at') final  String createdAt;

/// Create a copy of RecentGame
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$RecentGameCopyWith<_RecentGame> get copyWith => __$RecentGameCopyWithImpl<_RecentGame>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$RecentGameToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _RecentGame&&(identical(other.gameId, gameId) || other.gameId == gameId)&&(identical(other.opponent, opponent) || other.opponent == opponent)&&(identical(other.result, result) || other.result == result)&&(identical(other.playerColor, playerColor) || other.playerColor == playerColor)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,gameId,opponent,result,playerColor,createdAt);

@override
String toString() {
  return 'RecentGame(gameId: $gameId, opponent: $opponent, result: $result, playerColor: $playerColor, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class _$RecentGameCopyWith<$Res> implements $RecentGameCopyWith<$Res> {
  factory _$RecentGameCopyWith(_RecentGame value, $Res Function(_RecentGame) _then) = __$RecentGameCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(name: 'game_id') String gameId, String opponent, String result,@JsonKey(name: 'player_color') String playerColor,@JsonKey(name: 'created_at') String createdAt
});




}
/// @nodoc
class __$RecentGameCopyWithImpl<$Res>
    implements _$RecentGameCopyWith<$Res> {
  __$RecentGameCopyWithImpl(this._self, this._then);

  final _RecentGame _self;
  final $Res Function(_RecentGame) _then;

/// Create a copy of RecentGame
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? gameId = null,Object? opponent = null,Object? result = null,Object? playerColor = null,Object? createdAt = null,}) {
  return _then(_RecentGame(
gameId: null == gameId ? _self.gameId : gameId // ignore: cast_nullable_to_non_nullable
as String,opponent: null == opponent ? _self.opponent : opponent // ignore: cast_nullable_to_non_nullable
as String,result: null == result ? _self.result : result // ignore: cast_nullable_to_non_nullable
as String,playerColor: null == playerColor ? _self.playerColor : playerColor // ignore: cast_nullable_to_non_nullable
as String,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}

// dart format on
