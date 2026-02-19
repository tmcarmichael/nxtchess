// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'user_state.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$UserState {

 bool get isLoggedIn; bool get isLoading; String? get username; int? get rating; int? get puzzleRating; String? get profileIcon; PublicProfile? get profile; String? get error; bool get needsUsername;
/// Create a copy of UserState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$UserStateCopyWith<UserState> get copyWith => _$UserStateCopyWithImpl<UserState>(this as UserState, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is UserState&&(identical(other.isLoggedIn, isLoggedIn) || other.isLoggedIn == isLoggedIn)&&(identical(other.isLoading, isLoading) || other.isLoading == isLoading)&&(identical(other.username, username) || other.username == username)&&(identical(other.rating, rating) || other.rating == rating)&&(identical(other.puzzleRating, puzzleRating) || other.puzzleRating == puzzleRating)&&(identical(other.profileIcon, profileIcon) || other.profileIcon == profileIcon)&&(identical(other.profile, profile) || other.profile == profile)&&(identical(other.error, error) || other.error == error)&&(identical(other.needsUsername, needsUsername) || other.needsUsername == needsUsername));
}


@override
int get hashCode => Object.hash(runtimeType,isLoggedIn,isLoading,username,rating,puzzleRating,profileIcon,profile,error,needsUsername);

@override
String toString() {
  return 'UserState(isLoggedIn: $isLoggedIn, isLoading: $isLoading, username: $username, rating: $rating, puzzleRating: $puzzleRating, profileIcon: $profileIcon, profile: $profile, error: $error, needsUsername: $needsUsername)';
}


}

/// @nodoc
abstract mixin class $UserStateCopyWith<$Res>  {
  factory $UserStateCopyWith(UserState value, $Res Function(UserState) _then) = _$UserStateCopyWithImpl;
@useResult
$Res call({
 bool isLoggedIn, bool isLoading, String? username, int? rating, int? puzzleRating, String? profileIcon, PublicProfile? profile, String? error, bool needsUsername
});


$PublicProfileCopyWith<$Res>? get profile;

}
/// @nodoc
class _$UserStateCopyWithImpl<$Res>
    implements $UserStateCopyWith<$Res> {
  _$UserStateCopyWithImpl(this._self, this._then);

  final UserState _self;
  final $Res Function(UserState) _then;

/// Create a copy of UserState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? isLoggedIn = null,Object? isLoading = null,Object? username = freezed,Object? rating = freezed,Object? puzzleRating = freezed,Object? profileIcon = freezed,Object? profile = freezed,Object? error = freezed,Object? needsUsername = null,}) {
  return _then(_self.copyWith(
isLoggedIn: null == isLoggedIn ? _self.isLoggedIn : isLoggedIn // ignore: cast_nullable_to_non_nullable
as bool,isLoading: null == isLoading ? _self.isLoading : isLoading // ignore: cast_nullable_to_non_nullable
as bool,username: freezed == username ? _self.username : username // ignore: cast_nullable_to_non_nullable
as String?,rating: freezed == rating ? _self.rating : rating // ignore: cast_nullable_to_non_nullable
as int?,puzzleRating: freezed == puzzleRating ? _self.puzzleRating : puzzleRating // ignore: cast_nullable_to_non_nullable
as int?,profileIcon: freezed == profileIcon ? _self.profileIcon : profileIcon // ignore: cast_nullable_to_non_nullable
as String?,profile: freezed == profile ? _self.profile : profile // ignore: cast_nullable_to_non_nullable
as PublicProfile?,error: freezed == error ? _self.error : error // ignore: cast_nullable_to_non_nullable
as String?,needsUsername: null == needsUsername ? _self.needsUsername : needsUsername // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}
/// Create a copy of UserState
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$PublicProfileCopyWith<$Res>? get profile {
    if (_self.profile == null) {
    return null;
  }

  return $PublicProfileCopyWith<$Res>(_self.profile!, (value) {
    return _then(_self.copyWith(profile: value));
  });
}
}


/// Adds pattern-matching-related methods to [UserState].
extension UserStatePatterns on UserState {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _UserState value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _UserState() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _UserState value)  $default,){
final _that = this;
switch (_that) {
case _UserState():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _UserState value)?  $default,){
final _that = this;
switch (_that) {
case _UserState() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( bool isLoggedIn,  bool isLoading,  String? username,  int? rating,  int? puzzleRating,  String? profileIcon,  PublicProfile? profile,  String? error,  bool needsUsername)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _UserState() when $default != null:
return $default(_that.isLoggedIn,_that.isLoading,_that.username,_that.rating,_that.puzzleRating,_that.profileIcon,_that.profile,_that.error,_that.needsUsername);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( bool isLoggedIn,  bool isLoading,  String? username,  int? rating,  int? puzzleRating,  String? profileIcon,  PublicProfile? profile,  String? error,  bool needsUsername)  $default,) {final _that = this;
switch (_that) {
case _UserState():
return $default(_that.isLoggedIn,_that.isLoading,_that.username,_that.rating,_that.puzzleRating,_that.profileIcon,_that.profile,_that.error,_that.needsUsername);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( bool isLoggedIn,  bool isLoading,  String? username,  int? rating,  int? puzzleRating,  String? profileIcon,  PublicProfile? profile,  String? error,  bool needsUsername)?  $default,) {final _that = this;
switch (_that) {
case _UserState() when $default != null:
return $default(_that.isLoggedIn,_that.isLoading,_that.username,_that.rating,_that.puzzleRating,_that.profileIcon,_that.profile,_that.error,_that.needsUsername);case _:
  return null;

}
}

}

/// @nodoc


class _UserState implements UserState {
  const _UserState({this.isLoggedIn = false, this.isLoading = false, this.username = null, this.rating = null, this.puzzleRating = null, this.profileIcon = null, this.profile = null, this.error = null, this.needsUsername = false});
  

@override@JsonKey() final  bool isLoggedIn;
@override@JsonKey() final  bool isLoading;
@override@JsonKey() final  String? username;
@override@JsonKey() final  int? rating;
@override@JsonKey() final  int? puzzleRating;
@override@JsonKey() final  String? profileIcon;
@override@JsonKey() final  PublicProfile? profile;
@override@JsonKey() final  String? error;
@override@JsonKey() final  bool needsUsername;

/// Create a copy of UserState
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$UserStateCopyWith<_UserState> get copyWith => __$UserStateCopyWithImpl<_UserState>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _UserState&&(identical(other.isLoggedIn, isLoggedIn) || other.isLoggedIn == isLoggedIn)&&(identical(other.isLoading, isLoading) || other.isLoading == isLoading)&&(identical(other.username, username) || other.username == username)&&(identical(other.rating, rating) || other.rating == rating)&&(identical(other.puzzleRating, puzzleRating) || other.puzzleRating == puzzleRating)&&(identical(other.profileIcon, profileIcon) || other.profileIcon == profileIcon)&&(identical(other.profile, profile) || other.profile == profile)&&(identical(other.error, error) || other.error == error)&&(identical(other.needsUsername, needsUsername) || other.needsUsername == needsUsername));
}


@override
int get hashCode => Object.hash(runtimeType,isLoggedIn,isLoading,username,rating,puzzleRating,profileIcon,profile,error,needsUsername);

@override
String toString() {
  return 'UserState(isLoggedIn: $isLoggedIn, isLoading: $isLoading, username: $username, rating: $rating, puzzleRating: $puzzleRating, profileIcon: $profileIcon, profile: $profile, error: $error, needsUsername: $needsUsername)';
}


}

/// @nodoc
abstract mixin class _$UserStateCopyWith<$Res> implements $UserStateCopyWith<$Res> {
  factory _$UserStateCopyWith(_UserState value, $Res Function(_UserState) _then) = __$UserStateCopyWithImpl;
@override @useResult
$Res call({
 bool isLoggedIn, bool isLoading, String? username, int? rating, int? puzzleRating, String? profileIcon, PublicProfile? profile, String? error, bool needsUsername
});


@override $PublicProfileCopyWith<$Res>? get profile;

}
/// @nodoc
class __$UserStateCopyWithImpl<$Res>
    implements _$UserStateCopyWith<$Res> {
  __$UserStateCopyWithImpl(this._self, this._then);

  final _UserState _self;
  final $Res Function(_UserState) _then;

/// Create a copy of UserState
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? isLoggedIn = null,Object? isLoading = null,Object? username = freezed,Object? rating = freezed,Object? puzzleRating = freezed,Object? profileIcon = freezed,Object? profile = freezed,Object? error = freezed,Object? needsUsername = null,}) {
  return _then(_UserState(
isLoggedIn: null == isLoggedIn ? _self.isLoggedIn : isLoggedIn // ignore: cast_nullable_to_non_nullable
as bool,isLoading: null == isLoading ? _self.isLoading : isLoading // ignore: cast_nullable_to_non_nullable
as bool,username: freezed == username ? _self.username : username // ignore: cast_nullable_to_non_nullable
as String?,rating: freezed == rating ? _self.rating : rating // ignore: cast_nullable_to_non_nullable
as int?,puzzleRating: freezed == puzzleRating ? _self.puzzleRating : puzzleRating // ignore: cast_nullable_to_non_nullable
as int?,profileIcon: freezed == profileIcon ? _self.profileIcon : profileIcon // ignore: cast_nullable_to_non_nullable
as String?,profile: freezed == profile ? _self.profile : profile // ignore: cast_nullable_to_non_nullable
as PublicProfile?,error: freezed == error ? _self.error : error // ignore: cast_nullable_to_non_nullable
as String?,needsUsername: null == needsUsername ? _self.needsUsername : needsUsername // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

/// Create a copy of UserState
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$PublicProfileCopyWith<$Res>? get profile {
    if (_self.profile == null) {
    return null;
  }

  return $PublicProfileCopyWith<$Res>(_self.profile!, (value) {
    return _then(_self.copyWith(profile: value));
  });
}
}

// dart format on
