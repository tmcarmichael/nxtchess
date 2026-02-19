// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'engine_state.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$EngineState {

 EngineStatus get status; String? get error; bool get isThinking; int get difficulty; Side get aiSide;
/// Create a copy of EngineState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$EngineStateCopyWith<EngineState> get copyWith => _$EngineStateCopyWithImpl<EngineState>(this as EngineState, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is EngineState&&(identical(other.status, status) || other.status == status)&&(identical(other.error, error) || other.error == error)&&(identical(other.isThinking, isThinking) || other.isThinking == isThinking)&&(identical(other.difficulty, difficulty) || other.difficulty == difficulty)&&(identical(other.aiSide, aiSide) || other.aiSide == aiSide));
}


@override
int get hashCode => Object.hash(runtimeType,status,error,isThinking,difficulty,aiSide);

@override
String toString() {
  return 'EngineState(status: $status, error: $error, isThinking: $isThinking, difficulty: $difficulty, aiSide: $aiSide)';
}


}

/// @nodoc
abstract mixin class $EngineStateCopyWith<$Res>  {
  factory $EngineStateCopyWith(EngineState value, $Res Function(EngineState) _then) = _$EngineStateCopyWithImpl;
@useResult
$Res call({
 EngineStatus status, String? error, bool isThinking, int difficulty, Side aiSide
});




}
/// @nodoc
class _$EngineStateCopyWithImpl<$Res>
    implements $EngineStateCopyWith<$Res> {
  _$EngineStateCopyWithImpl(this._self, this._then);

  final EngineState _self;
  final $Res Function(EngineState) _then;

/// Create a copy of EngineState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? status = null,Object? error = freezed,Object? isThinking = null,Object? difficulty = null,Object? aiSide = null,}) {
  return _then(_self.copyWith(
status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as EngineStatus,error: freezed == error ? _self.error : error // ignore: cast_nullable_to_non_nullable
as String?,isThinking: null == isThinking ? _self.isThinking : isThinking // ignore: cast_nullable_to_non_nullable
as bool,difficulty: null == difficulty ? _self.difficulty : difficulty // ignore: cast_nullable_to_non_nullable
as int,aiSide: null == aiSide ? _self.aiSide : aiSide // ignore: cast_nullable_to_non_nullable
as Side,
  ));
}

}


/// Adds pattern-matching-related methods to [EngineState].
extension EngineStatePatterns on EngineState {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _EngineState value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _EngineState() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _EngineState value)  $default,){
final _that = this;
switch (_that) {
case _EngineState():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _EngineState value)?  $default,){
final _that = this;
switch (_that) {
case _EngineState() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( EngineStatus status,  String? error,  bool isThinking,  int difficulty,  Side aiSide)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _EngineState() when $default != null:
return $default(_that.status,_that.error,_that.isThinking,_that.difficulty,_that.aiSide);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( EngineStatus status,  String? error,  bool isThinking,  int difficulty,  Side aiSide)  $default,) {final _that = this;
switch (_that) {
case _EngineState():
return $default(_that.status,_that.error,_that.isThinking,_that.difficulty,_that.aiSide);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( EngineStatus status,  String? error,  bool isThinking,  int difficulty,  Side aiSide)?  $default,) {final _that = this;
switch (_that) {
case _EngineState() when $default != null:
return $default(_that.status,_that.error,_that.isThinking,_that.difficulty,_that.aiSide);case _:
  return null;

}
}

}

/// @nodoc


class _EngineState implements EngineState {
  const _EngineState({this.status = EngineStatus.idle, this.error = null, this.isThinking = false, this.difficulty = 3, this.aiSide = Side.b});
  

@override@JsonKey() final  EngineStatus status;
@override@JsonKey() final  String? error;
@override@JsonKey() final  bool isThinking;
@override@JsonKey() final  int difficulty;
@override@JsonKey() final  Side aiSide;

/// Create a copy of EngineState
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$EngineStateCopyWith<_EngineState> get copyWith => __$EngineStateCopyWithImpl<_EngineState>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _EngineState&&(identical(other.status, status) || other.status == status)&&(identical(other.error, error) || other.error == error)&&(identical(other.isThinking, isThinking) || other.isThinking == isThinking)&&(identical(other.difficulty, difficulty) || other.difficulty == difficulty)&&(identical(other.aiSide, aiSide) || other.aiSide == aiSide));
}


@override
int get hashCode => Object.hash(runtimeType,status,error,isThinking,difficulty,aiSide);

@override
String toString() {
  return 'EngineState(status: $status, error: $error, isThinking: $isThinking, difficulty: $difficulty, aiSide: $aiSide)';
}


}

/// @nodoc
abstract mixin class _$EngineStateCopyWith<$Res> implements $EngineStateCopyWith<$Res> {
  factory _$EngineStateCopyWith(_EngineState value, $Res Function(_EngineState) _then) = __$EngineStateCopyWithImpl;
@override @useResult
$Res call({
 EngineStatus status, String? error, bool isThinking, int difficulty, Side aiSide
});




}
/// @nodoc
class __$EngineStateCopyWithImpl<$Res>
    implements _$EngineStateCopyWith<$Res> {
  __$EngineStateCopyWithImpl(this._self, this._then);

  final _EngineState _self;
  final $Res Function(_EngineState) _then;

/// Create a copy of EngineState
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? status = null,Object? error = freezed,Object? isThinking = null,Object? difficulty = null,Object? aiSide = null,}) {
  return _then(_EngineState(
status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as EngineStatus,error: freezed == error ? _self.error : error // ignore: cast_nullable_to_non_nullable
as String?,isThinking: null == isThinking ? _self.isThinking : isThinking // ignore: cast_nullable_to_non_nullable
as bool,difficulty: null == difficulty ? _self.difficulty : difficulty // ignore: cast_nullable_to_non_nullable
as int,aiSide: null == aiSide ? _self.aiSide : aiSide // ignore: cast_nullable_to_non_nullable
as Side,
  ));
}


}

// dart format on
