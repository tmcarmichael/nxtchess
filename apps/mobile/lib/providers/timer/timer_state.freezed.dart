// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'timer_state.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$TimerState {

 int get whiteTime; int get blackTime; int get timeControl; int get increment; bool get isRunning;
/// Create a copy of TimerState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$TimerStateCopyWith<TimerState> get copyWith => _$TimerStateCopyWithImpl<TimerState>(this as TimerState, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is TimerState&&(identical(other.whiteTime, whiteTime) || other.whiteTime == whiteTime)&&(identical(other.blackTime, blackTime) || other.blackTime == blackTime)&&(identical(other.timeControl, timeControl) || other.timeControl == timeControl)&&(identical(other.increment, increment) || other.increment == increment)&&(identical(other.isRunning, isRunning) || other.isRunning == isRunning));
}


@override
int get hashCode => Object.hash(runtimeType,whiteTime,blackTime,timeControl,increment,isRunning);

@override
String toString() {
  return 'TimerState(whiteTime: $whiteTime, blackTime: $blackTime, timeControl: $timeControl, increment: $increment, isRunning: $isRunning)';
}


}

/// @nodoc
abstract mixin class $TimerStateCopyWith<$Res>  {
  factory $TimerStateCopyWith(TimerState value, $Res Function(TimerState) _then) = _$TimerStateCopyWithImpl;
@useResult
$Res call({
 int whiteTime, int blackTime, int timeControl, int increment, bool isRunning
});




}
/// @nodoc
class _$TimerStateCopyWithImpl<$Res>
    implements $TimerStateCopyWith<$Res> {
  _$TimerStateCopyWithImpl(this._self, this._then);

  final TimerState _self;
  final $Res Function(TimerState) _then;

/// Create a copy of TimerState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? whiteTime = null,Object? blackTime = null,Object? timeControl = null,Object? increment = null,Object? isRunning = null,}) {
  return _then(_self.copyWith(
whiteTime: null == whiteTime ? _self.whiteTime : whiteTime // ignore: cast_nullable_to_non_nullable
as int,blackTime: null == blackTime ? _self.blackTime : blackTime // ignore: cast_nullable_to_non_nullable
as int,timeControl: null == timeControl ? _self.timeControl : timeControl // ignore: cast_nullable_to_non_nullable
as int,increment: null == increment ? _self.increment : increment // ignore: cast_nullable_to_non_nullable
as int,isRunning: null == isRunning ? _self.isRunning : isRunning // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

}


/// Adds pattern-matching-related methods to [TimerState].
extension TimerStatePatterns on TimerState {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _TimerState value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _TimerState() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _TimerState value)  $default,){
final _that = this;
switch (_that) {
case _TimerState():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _TimerState value)?  $default,){
final _that = this;
switch (_that) {
case _TimerState() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( int whiteTime,  int blackTime,  int timeControl,  int increment,  bool isRunning)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _TimerState() when $default != null:
return $default(_that.whiteTime,_that.blackTime,_that.timeControl,_that.increment,_that.isRunning);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( int whiteTime,  int blackTime,  int timeControl,  int increment,  bool isRunning)  $default,) {final _that = this;
switch (_that) {
case _TimerState():
return $default(_that.whiteTime,_that.blackTime,_that.timeControl,_that.increment,_that.isRunning);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( int whiteTime,  int blackTime,  int timeControl,  int increment,  bool isRunning)?  $default,) {final _that = this;
switch (_that) {
case _TimerState() when $default != null:
return $default(_that.whiteTime,_that.blackTime,_that.timeControl,_that.increment,_that.isRunning);case _:
  return null;

}
}

}

/// @nodoc


class _TimerState implements TimerState {
  const _TimerState({this.whiteTime = 300000, this.blackTime = 300000, this.timeControl = 5, this.increment = 0, this.isRunning = false});
  

@override@JsonKey() final  int whiteTime;
@override@JsonKey() final  int blackTime;
@override@JsonKey() final  int timeControl;
@override@JsonKey() final  int increment;
@override@JsonKey() final  bool isRunning;

/// Create a copy of TimerState
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$TimerStateCopyWith<_TimerState> get copyWith => __$TimerStateCopyWithImpl<_TimerState>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _TimerState&&(identical(other.whiteTime, whiteTime) || other.whiteTime == whiteTime)&&(identical(other.blackTime, blackTime) || other.blackTime == blackTime)&&(identical(other.timeControl, timeControl) || other.timeControl == timeControl)&&(identical(other.increment, increment) || other.increment == increment)&&(identical(other.isRunning, isRunning) || other.isRunning == isRunning));
}


@override
int get hashCode => Object.hash(runtimeType,whiteTime,blackTime,timeControl,increment,isRunning);

@override
String toString() {
  return 'TimerState(whiteTime: $whiteTime, blackTime: $blackTime, timeControl: $timeControl, increment: $increment, isRunning: $isRunning)';
}


}

/// @nodoc
abstract mixin class _$TimerStateCopyWith<$Res> implements $TimerStateCopyWith<$Res> {
  factory _$TimerStateCopyWith(_TimerState value, $Res Function(_TimerState) _then) = __$TimerStateCopyWithImpl;
@override @useResult
$Res call({
 int whiteTime, int blackTime, int timeControl, int increment, bool isRunning
});




}
/// @nodoc
class __$TimerStateCopyWithImpl<$Res>
    implements _$TimerStateCopyWith<$Res> {
  __$TimerStateCopyWithImpl(this._self, this._then);

  final _TimerState _self;
  final $Res Function(_TimerState) _then;

/// Create a copy of TimerState
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? whiteTime = null,Object? blackTime = null,Object? timeControl = null,Object? increment = null,Object? isRunning = null,}) {
  return _then(_TimerState(
whiteTime: null == whiteTime ? _self.whiteTime : whiteTime // ignore: cast_nullable_to_non_nullable
as int,blackTime: null == blackTime ? _self.blackTime : blackTime // ignore: cast_nullable_to_non_nullable
as int,timeControl: null == timeControl ? _self.timeControl : timeControl // ignore: cast_nullable_to_non_nullable
as int,increment: null == increment ? _self.increment : increment // ignore: cast_nullable_to_non_nullable
as int,isRunning: null == isRunning ? _self.isRunning : isRunning // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}


}

// dart format on
