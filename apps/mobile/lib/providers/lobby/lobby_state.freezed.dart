// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'lobby_state.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$LobbyState {

 List<LobbyGame> get games; bool get isSubscribed; bool get isLoading;
/// Create a copy of LobbyState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$LobbyStateCopyWith<LobbyState> get copyWith => _$LobbyStateCopyWithImpl<LobbyState>(this as LobbyState, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is LobbyState&&const DeepCollectionEquality().equals(other.games, games)&&(identical(other.isSubscribed, isSubscribed) || other.isSubscribed == isSubscribed)&&(identical(other.isLoading, isLoading) || other.isLoading == isLoading));
}


@override
int get hashCode => Object.hash(runtimeType,const DeepCollectionEquality().hash(games),isSubscribed,isLoading);

@override
String toString() {
  return 'LobbyState(games: $games, isSubscribed: $isSubscribed, isLoading: $isLoading)';
}


}

/// @nodoc
abstract mixin class $LobbyStateCopyWith<$Res>  {
  factory $LobbyStateCopyWith(LobbyState value, $Res Function(LobbyState) _then) = _$LobbyStateCopyWithImpl;
@useResult
$Res call({
 List<LobbyGame> games, bool isSubscribed, bool isLoading
});




}
/// @nodoc
class _$LobbyStateCopyWithImpl<$Res>
    implements $LobbyStateCopyWith<$Res> {
  _$LobbyStateCopyWithImpl(this._self, this._then);

  final LobbyState _self;
  final $Res Function(LobbyState) _then;

/// Create a copy of LobbyState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? games = null,Object? isSubscribed = null,Object? isLoading = null,}) {
  return _then(_self.copyWith(
games: null == games ? _self.games : games // ignore: cast_nullable_to_non_nullable
as List<LobbyGame>,isSubscribed: null == isSubscribed ? _self.isSubscribed : isSubscribed // ignore: cast_nullable_to_non_nullable
as bool,isLoading: null == isLoading ? _self.isLoading : isLoading // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

}


/// Adds pattern-matching-related methods to [LobbyState].
extension LobbyStatePatterns on LobbyState {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _LobbyState value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _LobbyState() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _LobbyState value)  $default,){
final _that = this;
switch (_that) {
case _LobbyState():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _LobbyState value)?  $default,){
final _that = this;
switch (_that) {
case _LobbyState() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( List<LobbyGame> games,  bool isSubscribed,  bool isLoading)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _LobbyState() when $default != null:
return $default(_that.games,_that.isSubscribed,_that.isLoading);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( List<LobbyGame> games,  bool isSubscribed,  bool isLoading)  $default,) {final _that = this;
switch (_that) {
case _LobbyState():
return $default(_that.games,_that.isSubscribed,_that.isLoading);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( List<LobbyGame> games,  bool isSubscribed,  bool isLoading)?  $default,) {final _that = this;
switch (_that) {
case _LobbyState() when $default != null:
return $default(_that.games,_that.isSubscribed,_that.isLoading);case _:
  return null;

}
}

}

/// @nodoc


class _LobbyState implements LobbyState {
  const _LobbyState({final  List<LobbyGame> games = const [], this.isSubscribed = false, this.isLoading = false}): _games = games;
  

 final  List<LobbyGame> _games;
@override@JsonKey() List<LobbyGame> get games {
  if (_games is EqualUnmodifiableListView) return _games;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_games);
}

@override@JsonKey() final  bool isSubscribed;
@override@JsonKey() final  bool isLoading;

/// Create a copy of LobbyState
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$LobbyStateCopyWith<_LobbyState> get copyWith => __$LobbyStateCopyWithImpl<_LobbyState>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _LobbyState&&const DeepCollectionEquality().equals(other._games, _games)&&(identical(other.isSubscribed, isSubscribed) || other.isSubscribed == isSubscribed)&&(identical(other.isLoading, isLoading) || other.isLoading == isLoading));
}


@override
int get hashCode => Object.hash(runtimeType,const DeepCollectionEquality().hash(_games),isSubscribed,isLoading);

@override
String toString() {
  return 'LobbyState(games: $games, isSubscribed: $isSubscribed, isLoading: $isLoading)';
}


}

/// @nodoc
abstract mixin class _$LobbyStateCopyWith<$Res> implements $LobbyStateCopyWith<$Res> {
  factory _$LobbyStateCopyWith(_LobbyState value, $Res Function(_LobbyState) _then) = __$LobbyStateCopyWithImpl;
@override @useResult
$Res call({
 List<LobbyGame> games, bool isSubscribed, bool isLoading
});




}
/// @nodoc
class __$LobbyStateCopyWithImpl<$Res>
    implements _$LobbyStateCopyWith<$Res> {
  __$LobbyStateCopyWithImpl(this._self, this._then);

  final _LobbyState _self;
  final $Res Function(_LobbyState) _then;

/// Create a copy of LobbyState
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? games = null,Object? isSubscribed = null,Object? isLoading = null,}) {
  return _then(_LobbyState(
games: null == games ? _self._games : games // ignore: cast_nullable_to_non_nullable
as List<LobbyGame>,isSubscribed: null == isSubscribed ? _self.isSubscribed : isSubscribed // ignore: cast_nullable_to_non_nullable
as bool,isLoading: null == isLoading ? _self.isLoading : isLoading // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}


}

// dart format on
