// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'multiplayer_state.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$MultiplayerState {

 String? get gameId; String? get opponentUsername; Side? get playerColor; bool get isWaiting; bool get isConnected; bool get opponentDisconnected;
/// Create a copy of MultiplayerState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$MultiplayerStateCopyWith<MultiplayerState> get copyWith => _$MultiplayerStateCopyWithImpl<MultiplayerState>(this as MultiplayerState, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is MultiplayerState&&(identical(other.gameId, gameId) || other.gameId == gameId)&&(identical(other.opponentUsername, opponentUsername) || other.opponentUsername == opponentUsername)&&(identical(other.playerColor, playerColor) || other.playerColor == playerColor)&&(identical(other.isWaiting, isWaiting) || other.isWaiting == isWaiting)&&(identical(other.isConnected, isConnected) || other.isConnected == isConnected)&&(identical(other.opponentDisconnected, opponentDisconnected) || other.opponentDisconnected == opponentDisconnected));
}


@override
int get hashCode => Object.hash(runtimeType,gameId,opponentUsername,playerColor,isWaiting,isConnected,opponentDisconnected);

@override
String toString() {
  return 'MultiplayerState(gameId: $gameId, opponentUsername: $opponentUsername, playerColor: $playerColor, isWaiting: $isWaiting, isConnected: $isConnected, opponentDisconnected: $opponentDisconnected)';
}


}

/// @nodoc
abstract mixin class $MultiplayerStateCopyWith<$Res>  {
  factory $MultiplayerStateCopyWith(MultiplayerState value, $Res Function(MultiplayerState) _then) = _$MultiplayerStateCopyWithImpl;
@useResult
$Res call({
 String? gameId, String? opponentUsername, Side? playerColor, bool isWaiting, bool isConnected, bool opponentDisconnected
});




}
/// @nodoc
class _$MultiplayerStateCopyWithImpl<$Res>
    implements $MultiplayerStateCopyWith<$Res> {
  _$MultiplayerStateCopyWithImpl(this._self, this._then);

  final MultiplayerState _self;
  final $Res Function(MultiplayerState) _then;

/// Create a copy of MultiplayerState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? gameId = freezed,Object? opponentUsername = freezed,Object? playerColor = freezed,Object? isWaiting = null,Object? isConnected = null,Object? opponentDisconnected = null,}) {
  return _then(_self.copyWith(
gameId: freezed == gameId ? _self.gameId : gameId // ignore: cast_nullable_to_non_nullable
as String?,opponentUsername: freezed == opponentUsername ? _self.opponentUsername : opponentUsername // ignore: cast_nullable_to_non_nullable
as String?,playerColor: freezed == playerColor ? _self.playerColor : playerColor // ignore: cast_nullable_to_non_nullable
as Side?,isWaiting: null == isWaiting ? _self.isWaiting : isWaiting // ignore: cast_nullable_to_non_nullable
as bool,isConnected: null == isConnected ? _self.isConnected : isConnected // ignore: cast_nullable_to_non_nullable
as bool,opponentDisconnected: null == opponentDisconnected ? _self.opponentDisconnected : opponentDisconnected // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

}


/// Adds pattern-matching-related methods to [MultiplayerState].
extension MultiplayerStatePatterns on MultiplayerState {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _MultiplayerState value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _MultiplayerState() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _MultiplayerState value)  $default,){
final _that = this;
switch (_that) {
case _MultiplayerState():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _MultiplayerState value)?  $default,){
final _that = this;
switch (_that) {
case _MultiplayerState() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String? gameId,  String? opponentUsername,  Side? playerColor,  bool isWaiting,  bool isConnected,  bool opponentDisconnected)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _MultiplayerState() when $default != null:
return $default(_that.gameId,_that.opponentUsername,_that.playerColor,_that.isWaiting,_that.isConnected,_that.opponentDisconnected);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String? gameId,  String? opponentUsername,  Side? playerColor,  bool isWaiting,  bool isConnected,  bool opponentDisconnected)  $default,) {final _that = this;
switch (_that) {
case _MultiplayerState():
return $default(_that.gameId,_that.opponentUsername,_that.playerColor,_that.isWaiting,_that.isConnected,_that.opponentDisconnected);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String? gameId,  String? opponentUsername,  Side? playerColor,  bool isWaiting,  bool isConnected,  bool opponentDisconnected)?  $default,) {final _that = this;
switch (_that) {
case _MultiplayerState() when $default != null:
return $default(_that.gameId,_that.opponentUsername,_that.playerColor,_that.isWaiting,_that.isConnected,_that.opponentDisconnected);case _:
  return null;

}
}

}

/// @nodoc


class _MultiplayerState implements MultiplayerState {
  const _MultiplayerState({this.gameId = null, this.opponentUsername = null, this.playerColor = null, this.isWaiting = false, this.isConnected = false, this.opponentDisconnected = false});
  

@override@JsonKey() final  String? gameId;
@override@JsonKey() final  String? opponentUsername;
@override@JsonKey() final  Side? playerColor;
@override@JsonKey() final  bool isWaiting;
@override@JsonKey() final  bool isConnected;
@override@JsonKey() final  bool opponentDisconnected;

/// Create a copy of MultiplayerState
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$MultiplayerStateCopyWith<_MultiplayerState> get copyWith => __$MultiplayerStateCopyWithImpl<_MultiplayerState>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _MultiplayerState&&(identical(other.gameId, gameId) || other.gameId == gameId)&&(identical(other.opponentUsername, opponentUsername) || other.opponentUsername == opponentUsername)&&(identical(other.playerColor, playerColor) || other.playerColor == playerColor)&&(identical(other.isWaiting, isWaiting) || other.isWaiting == isWaiting)&&(identical(other.isConnected, isConnected) || other.isConnected == isConnected)&&(identical(other.opponentDisconnected, opponentDisconnected) || other.opponentDisconnected == opponentDisconnected));
}


@override
int get hashCode => Object.hash(runtimeType,gameId,opponentUsername,playerColor,isWaiting,isConnected,opponentDisconnected);

@override
String toString() {
  return 'MultiplayerState(gameId: $gameId, opponentUsername: $opponentUsername, playerColor: $playerColor, isWaiting: $isWaiting, isConnected: $isConnected, opponentDisconnected: $opponentDisconnected)';
}


}

/// @nodoc
abstract mixin class _$MultiplayerStateCopyWith<$Res> implements $MultiplayerStateCopyWith<$Res> {
  factory _$MultiplayerStateCopyWith(_MultiplayerState value, $Res Function(_MultiplayerState) _then) = __$MultiplayerStateCopyWithImpl;
@override @useResult
$Res call({
 String? gameId, String? opponentUsername, Side? playerColor, bool isWaiting, bool isConnected, bool opponentDisconnected
});




}
/// @nodoc
class __$MultiplayerStateCopyWithImpl<$Res>
    implements _$MultiplayerStateCopyWith<$Res> {
  __$MultiplayerStateCopyWithImpl(this._self, this._then);

  final _MultiplayerState _self;
  final $Res Function(_MultiplayerState) _then;

/// Create a copy of MultiplayerState
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? gameId = freezed,Object? opponentUsername = freezed,Object? playerColor = freezed,Object? isWaiting = null,Object? isConnected = null,Object? opponentDisconnected = null,}) {
  return _then(_MultiplayerState(
gameId: freezed == gameId ? _self.gameId : gameId // ignore: cast_nullable_to_non_nullable
as String?,opponentUsername: freezed == opponentUsername ? _self.opponentUsername : opponentUsername // ignore: cast_nullable_to_non_nullable
as String?,playerColor: freezed == playerColor ? _self.playerColor : playerColor // ignore: cast_nullable_to_non_nullable
as Side?,isWaiting: null == isWaiting ? _self.isWaiting : isWaiting // ignore: cast_nullable_to_non_nullable
as bool,isConnected: null == isConnected ? _self.isConnected : isConnected // ignore: cast_nullable_to_non_nullable
as bool,opponentDisconnected: null == opponentDisconnected ? _self.opponentDisconnected : opponentDisconnected // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}


}

// dart format on
