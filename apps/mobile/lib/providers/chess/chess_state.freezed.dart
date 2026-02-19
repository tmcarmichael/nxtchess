// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'chess_state.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$LastMove {

 String get from; String get to;
/// Create a copy of LastMove
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$LastMoveCopyWith<LastMove> get copyWith => _$LastMoveCopyWithImpl<LastMove>(this as LastMove, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is LastMove&&(identical(other.from, from) || other.from == from)&&(identical(other.to, to) || other.to == to));
}


@override
int get hashCode => Object.hash(runtimeType,from,to);

@override
String toString() {
  return 'LastMove(from: $from, to: $to)';
}


}

/// @nodoc
abstract mixin class $LastMoveCopyWith<$Res>  {
  factory $LastMoveCopyWith(LastMove value, $Res Function(LastMove) _then) = _$LastMoveCopyWithImpl;
@useResult
$Res call({
 String from, String to
});




}
/// @nodoc
class _$LastMoveCopyWithImpl<$Res>
    implements $LastMoveCopyWith<$Res> {
  _$LastMoveCopyWithImpl(this._self, this._then);

  final LastMove _self;
  final $Res Function(LastMove) _then;

/// Create a copy of LastMove
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? from = null,Object? to = null,}) {
  return _then(_self.copyWith(
from: null == from ? _self.from : from // ignore: cast_nullable_to_non_nullable
as String,to: null == to ? _self.to : to // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [LastMove].
extension LastMovePatterns on LastMove {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _LastMove value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _LastMove() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _LastMove value)  $default,){
final _that = this;
switch (_that) {
case _LastMove():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _LastMove value)?  $default,){
final _that = this;
switch (_that) {
case _LastMove() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String from,  String to)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _LastMove() when $default != null:
return $default(_that.from,_that.to);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String from,  String to)  $default,) {final _that = this;
switch (_that) {
case _LastMove():
return $default(_that.from,_that.to);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String from,  String to)?  $default,) {final _that = this;
switch (_that) {
case _LastMove() when $default != null:
return $default(_that.from,_that.to);case _:
  return null;

}
}

}

/// @nodoc


class _LastMove implements LastMove {
  const _LastMove({required this.from, required this.to});
  

@override final  String from;
@override final  String to;

/// Create a copy of LastMove
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$LastMoveCopyWith<_LastMove> get copyWith => __$LastMoveCopyWithImpl<_LastMove>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _LastMove&&(identical(other.from, from) || other.from == from)&&(identical(other.to, to) || other.to == to));
}


@override
int get hashCode => Object.hash(runtimeType,from,to);

@override
String toString() {
  return 'LastMove(from: $from, to: $to)';
}


}

/// @nodoc
abstract mixin class _$LastMoveCopyWith<$Res> implements $LastMoveCopyWith<$Res> {
  factory _$LastMoveCopyWith(_LastMove value, $Res Function(_LastMove) _then) = __$LastMoveCopyWithImpl;
@override @useResult
$Res call({
 String from, String to
});




}
/// @nodoc
class __$LastMoveCopyWithImpl<$Res>
    implements _$LastMoveCopyWith<$Res> {
  __$LastMoveCopyWithImpl(this._self, this._then);

  final _LastMove _self;
  final $Res Function(_LastMove) _then;

/// Create a copy of LastMove
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? from = null,Object? to = null,}) {
  return _then(_LastMove(
from: null == from ? _self.from : from // ignore: cast_nullable_to_non_nullable
as String,to: null == to ? _self.to : to // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}

/// @nodoc
mixin _$PuzzleFeedback {

 bool get correct; String get message;
/// Create a copy of PuzzleFeedback
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$PuzzleFeedbackCopyWith<PuzzleFeedback> get copyWith => _$PuzzleFeedbackCopyWithImpl<PuzzleFeedback>(this as PuzzleFeedback, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is PuzzleFeedback&&(identical(other.correct, correct) || other.correct == correct)&&(identical(other.message, message) || other.message == message));
}


@override
int get hashCode => Object.hash(runtimeType,correct,message);

@override
String toString() {
  return 'PuzzleFeedback(correct: $correct, message: $message)';
}


}

/// @nodoc
abstract mixin class $PuzzleFeedbackCopyWith<$Res>  {
  factory $PuzzleFeedbackCopyWith(PuzzleFeedback value, $Res Function(PuzzleFeedback) _then) = _$PuzzleFeedbackCopyWithImpl;
@useResult
$Res call({
 bool correct, String message
});




}
/// @nodoc
class _$PuzzleFeedbackCopyWithImpl<$Res>
    implements $PuzzleFeedbackCopyWith<$Res> {
  _$PuzzleFeedbackCopyWithImpl(this._self, this._then);

  final PuzzleFeedback _self;
  final $Res Function(PuzzleFeedback) _then;

/// Create a copy of PuzzleFeedback
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? correct = null,Object? message = null,}) {
  return _then(_self.copyWith(
correct: null == correct ? _self.correct : correct // ignore: cast_nullable_to_non_nullable
as bool,message: null == message ? _self.message : message // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [PuzzleFeedback].
extension PuzzleFeedbackPatterns on PuzzleFeedback {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _PuzzleFeedback value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _PuzzleFeedback() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _PuzzleFeedback value)  $default,){
final _that = this;
switch (_that) {
case _PuzzleFeedback():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _PuzzleFeedback value)?  $default,){
final _that = this;
switch (_that) {
case _PuzzleFeedback() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( bool correct,  String message)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _PuzzleFeedback() when $default != null:
return $default(_that.correct,_that.message);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( bool correct,  String message)  $default,) {final _that = this;
switch (_that) {
case _PuzzleFeedback():
return $default(_that.correct,_that.message);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( bool correct,  String message)?  $default,) {final _that = this;
switch (_that) {
case _PuzzleFeedback() when $default != null:
return $default(_that.correct,_that.message);case _:
  return null;

}
}

}

/// @nodoc


class _PuzzleFeedback implements PuzzleFeedback {
  const _PuzzleFeedback({required this.correct, required this.message});
  

@override final  bool correct;
@override final  String message;

/// Create a copy of PuzzleFeedback
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$PuzzleFeedbackCopyWith<_PuzzleFeedback> get copyWith => __$PuzzleFeedbackCopyWithImpl<_PuzzleFeedback>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _PuzzleFeedback&&(identical(other.correct, correct) || other.correct == correct)&&(identical(other.message, message) || other.message == message));
}


@override
int get hashCode => Object.hash(runtimeType,correct,message);

@override
String toString() {
  return 'PuzzleFeedback(correct: $correct, message: $message)';
}


}

/// @nodoc
abstract mixin class _$PuzzleFeedbackCopyWith<$Res> implements $PuzzleFeedbackCopyWith<$Res> {
  factory _$PuzzleFeedbackCopyWith(_PuzzleFeedback value, $Res Function(_PuzzleFeedback) _then) = __$PuzzleFeedbackCopyWithImpl;
@override @useResult
$Res call({
 bool correct, String message
});




}
/// @nodoc
class __$PuzzleFeedbackCopyWithImpl<$Res>
    implements _$PuzzleFeedbackCopyWith<$Res> {
  __$PuzzleFeedbackCopyWithImpl(this._self, this._then);

  final _PuzzleFeedback _self;
  final $Res Function(_PuzzleFeedback) _then;

/// Create a copy of PuzzleFeedback
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? correct = null,Object? message = null,}) {
  return _then(_PuzzleFeedback(
correct: null == correct ? _self.correct : correct // ignore: cast_nullable_to_non_nullable
as bool,message: null == message ? _self.message : message // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}

/// @nodoc
mixin _$RatingChange {

 int get delta; int get newRating;
/// Create a copy of RatingChange
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$RatingChangeCopyWith<RatingChange> get copyWith => _$RatingChangeCopyWithImpl<RatingChange>(this as RatingChange, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is RatingChange&&(identical(other.delta, delta) || other.delta == delta)&&(identical(other.newRating, newRating) || other.newRating == newRating));
}


@override
int get hashCode => Object.hash(runtimeType,delta,newRating);

@override
String toString() {
  return 'RatingChange(delta: $delta, newRating: $newRating)';
}


}

/// @nodoc
abstract mixin class $RatingChangeCopyWith<$Res>  {
  factory $RatingChangeCopyWith(RatingChange value, $Res Function(RatingChange) _then) = _$RatingChangeCopyWithImpl;
@useResult
$Res call({
 int delta, int newRating
});




}
/// @nodoc
class _$RatingChangeCopyWithImpl<$Res>
    implements $RatingChangeCopyWith<$Res> {
  _$RatingChangeCopyWithImpl(this._self, this._then);

  final RatingChange _self;
  final $Res Function(RatingChange) _then;

/// Create a copy of RatingChange
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? delta = null,Object? newRating = null,}) {
  return _then(_self.copyWith(
delta: null == delta ? _self.delta : delta // ignore: cast_nullable_to_non_nullable
as int,newRating: null == newRating ? _self.newRating : newRating // ignore: cast_nullable_to_non_nullable
as int,
  ));
}

}


/// Adds pattern-matching-related methods to [RatingChange].
extension RatingChangePatterns on RatingChange {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _RatingChange value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _RatingChange() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _RatingChange value)  $default,){
final _that = this;
switch (_that) {
case _RatingChange():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _RatingChange value)?  $default,){
final _that = this;
switch (_that) {
case _RatingChange() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( int delta,  int newRating)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _RatingChange() when $default != null:
return $default(_that.delta,_that.newRating);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( int delta,  int newRating)  $default,) {final _that = this;
switch (_that) {
case _RatingChange():
return $default(_that.delta,_that.newRating);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( int delta,  int newRating)?  $default,) {final _that = this;
switch (_that) {
case _RatingChange() when $default != null:
return $default(_that.delta,_that.newRating);case _:
  return null;

}
}

}

/// @nodoc


class _RatingChange implements RatingChange {
  const _RatingChange({required this.delta, required this.newRating});
  

@override final  int delta;
@override final  int newRating;

/// Create a copy of RatingChange
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$RatingChangeCopyWith<_RatingChange> get copyWith => __$RatingChangeCopyWithImpl<_RatingChange>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _RatingChange&&(identical(other.delta, delta) || other.delta == delta)&&(identical(other.newRating, newRating) || other.newRating == newRating));
}


@override
int get hashCode => Object.hash(runtimeType,delta,newRating);

@override
String toString() {
  return 'RatingChange(delta: $delta, newRating: $newRating)';
}


}

/// @nodoc
abstract mixin class _$RatingChangeCopyWith<$Res> implements $RatingChangeCopyWith<$Res> {
  factory _$RatingChangeCopyWith(_RatingChange value, $Res Function(_RatingChange) _then) = __$RatingChangeCopyWithImpl;
@override @useResult
$Res call({
 int delta, int newRating
});




}
/// @nodoc
class __$RatingChangeCopyWithImpl<$Res>
    implements _$RatingChangeCopyWith<$Res> {
  __$RatingChangeCopyWithImpl(this._self, this._then);

  final _RatingChange _self;
  final $Res Function(_RatingChange) _then;

/// Create a copy of RatingChange
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? delta = null,Object? newRating = null,}) {
  return _then(_RatingChange(
delta: null == delta ? _self.delta : delta // ignore: cast_nullable_to_non_nullable
as int,newRating: null == newRating ? _self.newRating : newRating // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}

/// @nodoc
mixin _$TrainingState {

 GamePhase? get gamePhase; double? get evalScore; double? get startEval; String? get positionId; String? get theme; List<MoveEvaluation> get moveEvaluations;
/// Create a copy of TrainingState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$TrainingStateCopyWith<TrainingState> get copyWith => _$TrainingStateCopyWithImpl<TrainingState>(this as TrainingState, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is TrainingState&&(identical(other.gamePhase, gamePhase) || other.gamePhase == gamePhase)&&(identical(other.evalScore, evalScore) || other.evalScore == evalScore)&&(identical(other.startEval, startEval) || other.startEval == startEval)&&(identical(other.positionId, positionId) || other.positionId == positionId)&&(identical(other.theme, theme) || other.theme == theme)&&const DeepCollectionEquality().equals(other.moveEvaluations, moveEvaluations));
}


@override
int get hashCode => Object.hash(runtimeType,gamePhase,evalScore,startEval,positionId,theme,const DeepCollectionEquality().hash(moveEvaluations));

@override
String toString() {
  return 'TrainingState(gamePhase: $gamePhase, evalScore: $evalScore, startEval: $startEval, positionId: $positionId, theme: $theme, moveEvaluations: $moveEvaluations)';
}


}

/// @nodoc
abstract mixin class $TrainingStateCopyWith<$Res>  {
  factory $TrainingStateCopyWith(TrainingState value, $Res Function(TrainingState) _then) = _$TrainingStateCopyWithImpl;
@useResult
$Res call({
 GamePhase? gamePhase, double? evalScore, double? startEval, String? positionId, String? theme, List<MoveEvaluation> moveEvaluations
});




}
/// @nodoc
class _$TrainingStateCopyWithImpl<$Res>
    implements $TrainingStateCopyWith<$Res> {
  _$TrainingStateCopyWithImpl(this._self, this._then);

  final TrainingState _self;
  final $Res Function(TrainingState) _then;

/// Create a copy of TrainingState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? gamePhase = freezed,Object? evalScore = freezed,Object? startEval = freezed,Object? positionId = freezed,Object? theme = freezed,Object? moveEvaluations = null,}) {
  return _then(_self.copyWith(
gamePhase: freezed == gamePhase ? _self.gamePhase : gamePhase // ignore: cast_nullable_to_non_nullable
as GamePhase?,evalScore: freezed == evalScore ? _self.evalScore : evalScore // ignore: cast_nullable_to_non_nullable
as double?,startEval: freezed == startEval ? _self.startEval : startEval // ignore: cast_nullable_to_non_nullable
as double?,positionId: freezed == positionId ? _self.positionId : positionId // ignore: cast_nullable_to_non_nullable
as String?,theme: freezed == theme ? _self.theme : theme // ignore: cast_nullable_to_non_nullable
as String?,moveEvaluations: null == moveEvaluations ? _self.moveEvaluations : moveEvaluations // ignore: cast_nullable_to_non_nullable
as List<MoveEvaluation>,
  ));
}

}


/// Adds pattern-matching-related methods to [TrainingState].
extension TrainingStatePatterns on TrainingState {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _TrainingState value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _TrainingState() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _TrainingState value)  $default,){
final _that = this;
switch (_that) {
case _TrainingState():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _TrainingState value)?  $default,){
final _that = this;
switch (_that) {
case _TrainingState() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( GamePhase? gamePhase,  double? evalScore,  double? startEval,  String? positionId,  String? theme,  List<MoveEvaluation> moveEvaluations)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _TrainingState() when $default != null:
return $default(_that.gamePhase,_that.evalScore,_that.startEval,_that.positionId,_that.theme,_that.moveEvaluations);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( GamePhase? gamePhase,  double? evalScore,  double? startEval,  String? positionId,  String? theme,  List<MoveEvaluation> moveEvaluations)  $default,) {final _that = this;
switch (_that) {
case _TrainingState():
return $default(_that.gamePhase,_that.evalScore,_that.startEval,_that.positionId,_that.theme,_that.moveEvaluations);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( GamePhase? gamePhase,  double? evalScore,  double? startEval,  String? positionId,  String? theme,  List<MoveEvaluation> moveEvaluations)?  $default,) {final _that = this;
switch (_that) {
case _TrainingState() when $default != null:
return $default(_that.gamePhase,_that.evalScore,_that.startEval,_that.positionId,_that.theme,_that.moveEvaluations);case _:
  return null;

}
}

}

/// @nodoc


class _TrainingState implements TrainingState {
  const _TrainingState({this.gamePhase = null, this.evalScore = null, this.startEval = null, this.positionId = null, this.theme = null, final  List<MoveEvaluation> moveEvaluations = const []}): _moveEvaluations = moveEvaluations;
  

@override@JsonKey() final  GamePhase? gamePhase;
@override@JsonKey() final  double? evalScore;
@override@JsonKey() final  double? startEval;
@override@JsonKey() final  String? positionId;
@override@JsonKey() final  String? theme;
 final  List<MoveEvaluation> _moveEvaluations;
@override@JsonKey() List<MoveEvaluation> get moveEvaluations {
  if (_moveEvaluations is EqualUnmodifiableListView) return _moveEvaluations;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_moveEvaluations);
}


/// Create a copy of TrainingState
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$TrainingStateCopyWith<_TrainingState> get copyWith => __$TrainingStateCopyWithImpl<_TrainingState>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _TrainingState&&(identical(other.gamePhase, gamePhase) || other.gamePhase == gamePhase)&&(identical(other.evalScore, evalScore) || other.evalScore == evalScore)&&(identical(other.startEval, startEval) || other.startEval == startEval)&&(identical(other.positionId, positionId) || other.positionId == positionId)&&(identical(other.theme, theme) || other.theme == theme)&&const DeepCollectionEquality().equals(other._moveEvaluations, _moveEvaluations));
}


@override
int get hashCode => Object.hash(runtimeType,gamePhase,evalScore,startEval,positionId,theme,const DeepCollectionEquality().hash(_moveEvaluations));

@override
String toString() {
  return 'TrainingState(gamePhase: $gamePhase, evalScore: $evalScore, startEval: $startEval, positionId: $positionId, theme: $theme, moveEvaluations: $moveEvaluations)';
}


}

/// @nodoc
abstract mixin class _$TrainingStateCopyWith<$Res> implements $TrainingStateCopyWith<$Res> {
  factory _$TrainingStateCopyWith(_TrainingState value, $Res Function(_TrainingState) _then) = __$TrainingStateCopyWithImpl;
@override @useResult
$Res call({
 GamePhase? gamePhase, double? evalScore, double? startEval, String? positionId, String? theme, List<MoveEvaluation> moveEvaluations
});




}
/// @nodoc
class __$TrainingStateCopyWithImpl<$Res>
    implements _$TrainingStateCopyWith<$Res> {
  __$TrainingStateCopyWithImpl(this._self, this._then);

  final _TrainingState _self;
  final $Res Function(_TrainingState) _then;

/// Create a copy of TrainingState
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? gamePhase = freezed,Object? evalScore = freezed,Object? startEval = freezed,Object? positionId = freezed,Object? theme = freezed,Object? moveEvaluations = null,}) {
  return _then(_TrainingState(
gamePhase: freezed == gamePhase ? _self.gamePhase : gamePhase // ignore: cast_nullable_to_non_nullable
as GamePhase?,evalScore: freezed == evalScore ? _self.evalScore : evalScore // ignore: cast_nullable_to_non_nullable
as double?,startEval: freezed == startEval ? _self.startEval : startEval // ignore: cast_nullable_to_non_nullable
as double?,positionId: freezed == positionId ? _self.positionId : positionId // ignore: cast_nullable_to_non_nullable
as String?,theme: freezed == theme ? _self.theme : theme // ignore: cast_nullable_to_non_nullable
as String?,moveEvaluations: null == moveEvaluations ? _self._moveEvaluations : moveEvaluations // ignore: cast_nullable_to_non_nullable
as List<MoveEvaluation>,
  ));
}


}

/// @nodoc
mixin _$PuzzleState {

 PuzzleCategory? get category; String? get id; bool get rated; int get solutionIndex; PuzzleFeedback? get feedback; String? get startFen; RatingChange? get ratingChange; List<AchievementUnlock>? get newAchievements;
/// Create a copy of PuzzleState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$PuzzleStateCopyWith<PuzzleState> get copyWith => _$PuzzleStateCopyWithImpl<PuzzleState>(this as PuzzleState, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is PuzzleState&&(identical(other.category, category) || other.category == category)&&(identical(other.id, id) || other.id == id)&&(identical(other.rated, rated) || other.rated == rated)&&(identical(other.solutionIndex, solutionIndex) || other.solutionIndex == solutionIndex)&&(identical(other.feedback, feedback) || other.feedback == feedback)&&(identical(other.startFen, startFen) || other.startFen == startFen)&&(identical(other.ratingChange, ratingChange) || other.ratingChange == ratingChange)&&const DeepCollectionEquality().equals(other.newAchievements, newAchievements));
}


@override
int get hashCode => Object.hash(runtimeType,category,id,rated,solutionIndex,feedback,startFen,ratingChange,const DeepCollectionEquality().hash(newAchievements));

@override
String toString() {
  return 'PuzzleState(category: $category, id: $id, rated: $rated, solutionIndex: $solutionIndex, feedback: $feedback, startFen: $startFen, ratingChange: $ratingChange, newAchievements: $newAchievements)';
}


}

/// @nodoc
abstract mixin class $PuzzleStateCopyWith<$Res>  {
  factory $PuzzleStateCopyWith(PuzzleState value, $Res Function(PuzzleState) _then) = _$PuzzleStateCopyWithImpl;
@useResult
$Res call({
 PuzzleCategory? category, String? id, bool rated, int solutionIndex, PuzzleFeedback? feedback, String? startFen, RatingChange? ratingChange, List<AchievementUnlock>? newAchievements
});


$PuzzleFeedbackCopyWith<$Res>? get feedback;$RatingChangeCopyWith<$Res>? get ratingChange;

}
/// @nodoc
class _$PuzzleStateCopyWithImpl<$Res>
    implements $PuzzleStateCopyWith<$Res> {
  _$PuzzleStateCopyWithImpl(this._self, this._then);

  final PuzzleState _self;
  final $Res Function(PuzzleState) _then;

/// Create a copy of PuzzleState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? category = freezed,Object? id = freezed,Object? rated = null,Object? solutionIndex = null,Object? feedback = freezed,Object? startFen = freezed,Object? ratingChange = freezed,Object? newAchievements = freezed,}) {
  return _then(_self.copyWith(
category: freezed == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as PuzzleCategory?,id: freezed == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String?,rated: null == rated ? _self.rated : rated // ignore: cast_nullable_to_non_nullable
as bool,solutionIndex: null == solutionIndex ? _self.solutionIndex : solutionIndex // ignore: cast_nullable_to_non_nullable
as int,feedback: freezed == feedback ? _self.feedback : feedback // ignore: cast_nullable_to_non_nullable
as PuzzleFeedback?,startFen: freezed == startFen ? _self.startFen : startFen // ignore: cast_nullable_to_non_nullable
as String?,ratingChange: freezed == ratingChange ? _self.ratingChange : ratingChange // ignore: cast_nullable_to_non_nullable
as RatingChange?,newAchievements: freezed == newAchievements ? _self.newAchievements : newAchievements // ignore: cast_nullable_to_non_nullable
as List<AchievementUnlock>?,
  ));
}
/// Create a copy of PuzzleState
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$PuzzleFeedbackCopyWith<$Res>? get feedback {
    if (_self.feedback == null) {
    return null;
  }

  return $PuzzleFeedbackCopyWith<$Res>(_self.feedback!, (value) {
    return _then(_self.copyWith(feedback: value));
  });
}/// Create a copy of PuzzleState
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$RatingChangeCopyWith<$Res>? get ratingChange {
    if (_self.ratingChange == null) {
    return null;
  }

  return $RatingChangeCopyWith<$Res>(_self.ratingChange!, (value) {
    return _then(_self.copyWith(ratingChange: value));
  });
}
}


/// Adds pattern-matching-related methods to [PuzzleState].
extension PuzzleStatePatterns on PuzzleState {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _PuzzleState value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _PuzzleState() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _PuzzleState value)  $default,){
final _that = this;
switch (_that) {
case _PuzzleState():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _PuzzleState value)?  $default,){
final _that = this;
switch (_that) {
case _PuzzleState() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( PuzzleCategory? category,  String? id,  bool rated,  int solutionIndex,  PuzzleFeedback? feedback,  String? startFen,  RatingChange? ratingChange,  List<AchievementUnlock>? newAchievements)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _PuzzleState() when $default != null:
return $default(_that.category,_that.id,_that.rated,_that.solutionIndex,_that.feedback,_that.startFen,_that.ratingChange,_that.newAchievements);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( PuzzleCategory? category,  String? id,  bool rated,  int solutionIndex,  PuzzleFeedback? feedback,  String? startFen,  RatingChange? ratingChange,  List<AchievementUnlock>? newAchievements)  $default,) {final _that = this;
switch (_that) {
case _PuzzleState():
return $default(_that.category,_that.id,_that.rated,_that.solutionIndex,_that.feedback,_that.startFen,_that.ratingChange,_that.newAchievements);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( PuzzleCategory? category,  String? id,  bool rated,  int solutionIndex,  PuzzleFeedback? feedback,  String? startFen,  RatingChange? ratingChange,  List<AchievementUnlock>? newAchievements)?  $default,) {final _that = this;
switch (_that) {
case _PuzzleState() when $default != null:
return $default(_that.category,_that.id,_that.rated,_that.solutionIndex,_that.feedback,_that.startFen,_that.ratingChange,_that.newAchievements);case _:
  return null;

}
}

}

/// @nodoc


class _PuzzleState implements PuzzleState {
  const _PuzzleState({this.category = null, this.id = null, this.rated = false, this.solutionIndex = 0, this.feedback = null, this.startFen = null, this.ratingChange = null, final  List<AchievementUnlock>? newAchievements = null}): _newAchievements = newAchievements;
  

@override@JsonKey() final  PuzzleCategory? category;
@override@JsonKey() final  String? id;
@override@JsonKey() final  bool rated;
@override@JsonKey() final  int solutionIndex;
@override@JsonKey() final  PuzzleFeedback? feedback;
@override@JsonKey() final  String? startFen;
@override@JsonKey() final  RatingChange? ratingChange;
 final  List<AchievementUnlock>? _newAchievements;
@override@JsonKey() List<AchievementUnlock>? get newAchievements {
  final value = _newAchievements;
  if (value == null) return null;
  if (_newAchievements is EqualUnmodifiableListView) return _newAchievements;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(value);
}


/// Create a copy of PuzzleState
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$PuzzleStateCopyWith<_PuzzleState> get copyWith => __$PuzzleStateCopyWithImpl<_PuzzleState>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _PuzzleState&&(identical(other.category, category) || other.category == category)&&(identical(other.id, id) || other.id == id)&&(identical(other.rated, rated) || other.rated == rated)&&(identical(other.solutionIndex, solutionIndex) || other.solutionIndex == solutionIndex)&&(identical(other.feedback, feedback) || other.feedback == feedback)&&(identical(other.startFen, startFen) || other.startFen == startFen)&&(identical(other.ratingChange, ratingChange) || other.ratingChange == ratingChange)&&const DeepCollectionEquality().equals(other._newAchievements, _newAchievements));
}


@override
int get hashCode => Object.hash(runtimeType,category,id,rated,solutionIndex,feedback,startFen,ratingChange,const DeepCollectionEquality().hash(_newAchievements));

@override
String toString() {
  return 'PuzzleState(category: $category, id: $id, rated: $rated, solutionIndex: $solutionIndex, feedback: $feedback, startFen: $startFen, ratingChange: $ratingChange, newAchievements: $newAchievements)';
}


}

/// @nodoc
abstract mixin class _$PuzzleStateCopyWith<$Res> implements $PuzzleStateCopyWith<$Res> {
  factory _$PuzzleStateCopyWith(_PuzzleState value, $Res Function(_PuzzleState) _then) = __$PuzzleStateCopyWithImpl;
@override @useResult
$Res call({
 PuzzleCategory? category, String? id, bool rated, int solutionIndex, PuzzleFeedback? feedback, String? startFen, RatingChange? ratingChange, List<AchievementUnlock>? newAchievements
});


@override $PuzzleFeedbackCopyWith<$Res>? get feedback;@override $RatingChangeCopyWith<$Res>? get ratingChange;

}
/// @nodoc
class __$PuzzleStateCopyWithImpl<$Res>
    implements _$PuzzleStateCopyWith<$Res> {
  __$PuzzleStateCopyWithImpl(this._self, this._then);

  final _PuzzleState _self;
  final $Res Function(_PuzzleState) _then;

/// Create a copy of PuzzleState
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? category = freezed,Object? id = freezed,Object? rated = null,Object? solutionIndex = null,Object? feedback = freezed,Object? startFen = freezed,Object? ratingChange = freezed,Object? newAchievements = freezed,}) {
  return _then(_PuzzleState(
category: freezed == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as PuzzleCategory?,id: freezed == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String?,rated: null == rated ? _self.rated : rated // ignore: cast_nullable_to_non_nullable
as bool,solutionIndex: null == solutionIndex ? _self.solutionIndex : solutionIndex // ignore: cast_nullable_to_non_nullable
as int,feedback: freezed == feedback ? _self.feedback : feedback // ignore: cast_nullable_to_non_nullable
as PuzzleFeedback?,startFen: freezed == startFen ? _self.startFen : startFen // ignore: cast_nullable_to_non_nullable
as String?,ratingChange: freezed == ratingChange ? _self.ratingChange : ratingChange // ignore: cast_nullable_to_non_nullable
as RatingChange?,newAchievements: freezed == newAchievements ? _self._newAchievements : newAchievements // ignore: cast_nullable_to_non_nullable
as List<AchievementUnlock>?,
  ));
}

/// Create a copy of PuzzleState
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$PuzzleFeedbackCopyWith<$Res>? get feedback {
    if (_self.feedback == null) {
    return null;
  }

  return $PuzzleFeedbackCopyWith<$Res>(_self.feedback!, (value) {
    return _then(_self.copyWith(feedback: value));
  });
}/// Create a copy of PuzzleState
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$RatingChangeCopyWith<$Res>? get ratingChange {
    if (_self.ratingChange == null) {
    return null;
  }

  return $RatingChangeCopyWith<$Res>(_self.ratingChange!, (value) {
    return _then(_self.copyWith(ratingChange: value));
  });
}
}

/// @nodoc
mixin _$ChessState {

 String? get sessionId; String get fen; String get viewFen; Side get currentTurn; List<String> get moveHistory; int get viewMoveIndex; LastMove? get lastMove; String? get checkedKingSquare; bool get isGameOver; GameOverReason? get gameOverReason; GameWinner? get gameWinner; Side get playerColor; GameMode get mode; OpponentType get opponentType; GameLifecycle get lifecycle; String? get moveError; String? get initError; TrainingState get training; PuzzleState get puzzle;
/// Create a copy of ChessState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ChessStateCopyWith<ChessState> get copyWith => _$ChessStateCopyWithImpl<ChessState>(this as ChessState, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is ChessState&&(identical(other.sessionId, sessionId) || other.sessionId == sessionId)&&(identical(other.fen, fen) || other.fen == fen)&&(identical(other.viewFen, viewFen) || other.viewFen == viewFen)&&(identical(other.currentTurn, currentTurn) || other.currentTurn == currentTurn)&&const DeepCollectionEquality().equals(other.moveHistory, moveHistory)&&(identical(other.viewMoveIndex, viewMoveIndex) || other.viewMoveIndex == viewMoveIndex)&&(identical(other.lastMove, lastMove) || other.lastMove == lastMove)&&(identical(other.checkedKingSquare, checkedKingSquare) || other.checkedKingSquare == checkedKingSquare)&&(identical(other.isGameOver, isGameOver) || other.isGameOver == isGameOver)&&(identical(other.gameOverReason, gameOverReason) || other.gameOverReason == gameOverReason)&&(identical(other.gameWinner, gameWinner) || other.gameWinner == gameWinner)&&(identical(other.playerColor, playerColor) || other.playerColor == playerColor)&&(identical(other.mode, mode) || other.mode == mode)&&(identical(other.opponentType, opponentType) || other.opponentType == opponentType)&&(identical(other.lifecycle, lifecycle) || other.lifecycle == lifecycle)&&(identical(other.moveError, moveError) || other.moveError == moveError)&&(identical(other.initError, initError) || other.initError == initError)&&(identical(other.training, training) || other.training == training)&&(identical(other.puzzle, puzzle) || other.puzzle == puzzle));
}


@override
int get hashCode => Object.hashAll([runtimeType,sessionId,fen,viewFen,currentTurn,const DeepCollectionEquality().hash(moveHistory),viewMoveIndex,lastMove,checkedKingSquare,isGameOver,gameOverReason,gameWinner,playerColor,mode,opponentType,lifecycle,moveError,initError,training,puzzle]);

@override
String toString() {
  return 'ChessState(sessionId: $sessionId, fen: $fen, viewFen: $viewFen, currentTurn: $currentTurn, moveHistory: $moveHistory, viewMoveIndex: $viewMoveIndex, lastMove: $lastMove, checkedKingSquare: $checkedKingSquare, isGameOver: $isGameOver, gameOverReason: $gameOverReason, gameWinner: $gameWinner, playerColor: $playerColor, mode: $mode, opponentType: $opponentType, lifecycle: $lifecycle, moveError: $moveError, initError: $initError, training: $training, puzzle: $puzzle)';
}


}

/// @nodoc
abstract mixin class $ChessStateCopyWith<$Res>  {
  factory $ChessStateCopyWith(ChessState value, $Res Function(ChessState) _then) = _$ChessStateCopyWithImpl;
@useResult
$Res call({
 String? sessionId, String fen, String viewFen, Side currentTurn, List<String> moveHistory, int viewMoveIndex, LastMove? lastMove, String? checkedKingSquare, bool isGameOver, GameOverReason? gameOverReason, GameWinner? gameWinner, Side playerColor, GameMode mode, OpponentType opponentType, GameLifecycle lifecycle, String? moveError, String? initError, TrainingState training, PuzzleState puzzle
});


$LastMoveCopyWith<$Res>? get lastMove;$TrainingStateCopyWith<$Res> get training;$PuzzleStateCopyWith<$Res> get puzzle;

}
/// @nodoc
class _$ChessStateCopyWithImpl<$Res>
    implements $ChessStateCopyWith<$Res> {
  _$ChessStateCopyWithImpl(this._self, this._then);

  final ChessState _self;
  final $Res Function(ChessState) _then;

/// Create a copy of ChessState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? sessionId = freezed,Object? fen = null,Object? viewFen = null,Object? currentTurn = null,Object? moveHistory = null,Object? viewMoveIndex = null,Object? lastMove = freezed,Object? checkedKingSquare = freezed,Object? isGameOver = null,Object? gameOverReason = freezed,Object? gameWinner = freezed,Object? playerColor = null,Object? mode = null,Object? opponentType = null,Object? lifecycle = null,Object? moveError = freezed,Object? initError = freezed,Object? training = null,Object? puzzle = null,}) {
  return _then(_self.copyWith(
sessionId: freezed == sessionId ? _self.sessionId : sessionId // ignore: cast_nullable_to_non_nullable
as String?,fen: null == fen ? _self.fen : fen // ignore: cast_nullable_to_non_nullable
as String,viewFen: null == viewFen ? _self.viewFen : viewFen // ignore: cast_nullable_to_non_nullable
as String,currentTurn: null == currentTurn ? _self.currentTurn : currentTurn // ignore: cast_nullable_to_non_nullable
as Side,moveHistory: null == moveHistory ? _self.moveHistory : moveHistory // ignore: cast_nullable_to_non_nullable
as List<String>,viewMoveIndex: null == viewMoveIndex ? _self.viewMoveIndex : viewMoveIndex // ignore: cast_nullable_to_non_nullable
as int,lastMove: freezed == lastMove ? _self.lastMove : lastMove // ignore: cast_nullable_to_non_nullable
as LastMove?,checkedKingSquare: freezed == checkedKingSquare ? _self.checkedKingSquare : checkedKingSquare // ignore: cast_nullable_to_non_nullable
as String?,isGameOver: null == isGameOver ? _self.isGameOver : isGameOver // ignore: cast_nullable_to_non_nullable
as bool,gameOverReason: freezed == gameOverReason ? _self.gameOverReason : gameOverReason // ignore: cast_nullable_to_non_nullable
as GameOverReason?,gameWinner: freezed == gameWinner ? _self.gameWinner : gameWinner // ignore: cast_nullable_to_non_nullable
as GameWinner?,playerColor: null == playerColor ? _self.playerColor : playerColor // ignore: cast_nullable_to_non_nullable
as Side,mode: null == mode ? _self.mode : mode // ignore: cast_nullable_to_non_nullable
as GameMode,opponentType: null == opponentType ? _self.opponentType : opponentType // ignore: cast_nullable_to_non_nullable
as OpponentType,lifecycle: null == lifecycle ? _self.lifecycle : lifecycle // ignore: cast_nullable_to_non_nullable
as GameLifecycle,moveError: freezed == moveError ? _self.moveError : moveError // ignore: cast_nullable_to_non_nullable
as String?,initError: freezed == initError ? _self.initError : initError // ignore: cast_nullable_to_non_nullable
as String?,training: null == training ? _self.training : training // ignore: cast_nullable_to_non_nullable
as TrainingState,puzzle: null == puzzle ? _self.puzzle : puzzle // ignore: cast_nullable_to_non_nullable
as PuzzleState,
  ));
}
/// Create a copy of ChessState
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$LastMoveCopyWith<$Res>? get lastMove {
    if (_self.lastMove == null) {
    return null;
  }

  return $LastMoveCopyWith<$Res>(_self.lastMove!, (value) {
    return _then(_self.copyWith(lastMove: value));
  });
}/// Create a copy of ChessState
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$TrainingStateCopyWith<$Res> get training {
  
  return $TrainingStateCopyWith<$Res>(_self.training, (value) {
    return _then(_self.copyWith(training: value));
  });
}/// Create a copy of ChessState
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$PuzzleStateCopyWith<$Res> get puzzle {
  
  return $PuzzleStateCopyWith<$Res>(_self.puzzle, (value) {
    return _then(_self.copyWith(puzzle: value));
  });
}
}


/// Adds pattern-matching-related methods to [ChessState].
extension ChessStatePatterns on ChessState {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _ChessState value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _ChessState() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _ChessState value)  $default,){
final _that = this;
switch (_that) {
case _ChessState():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _ChessState value)?  $default,){
final _that = this;
switch (_that) {
case _ChessState() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String? sessionId,  String fen,  String viewFen,  Side currentTurn,  List<String> moveHistory,  int viewMoveIndex,  LastMove? lastMove,  String? checkedKingSquare,  bool isGameOver,  GameOverReason? gameOverReason,  GameWinner? gameWinner,  Side playerColor,  GameMode mode,  OpponentType opponentType,  GameLifecycle lifecycle,  String? moveError,  String? initError,  TrainingState training,  PuzzleState puzzle)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _ChessState() when $default != null:
return $default(_that.sessionId,_that.fen,_that.viewFen,_that.currentTurn,_that.moveHistory,_that.viewMoveIndex,_that.lastMove,_that.checkedKingSquare,_that.isGameOver,_that.gameOverReason,_that.gameWinner,_that.playerColor,_that.mode,_that.opponentType,_that.lifecycle,_that.moveError,_that.initError,_that.training,_that.puzzle);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String? sessionId,  String fen,  String viewFen,  Side currentTurn,  List<String> moveHistory,  int viewMoveIndex,  LastMove? lastMove,  String? checkedKingSquare,  bool isGameOver,  GameOverReason? gameOverReason,  GameWinner? gameWinner,  Side playerColor,  GameMode mode,  OpponentType opponentType,  GameLifecycle lifecycle,  String? moveError,  String? initError,  TrainingState training,  PuzzleState puzzle)  $default,) {final _that = this;
switch (_that) {
case _ChessState():
return $default(_that.sessionId,_that.fen,_that.viewFen,_that.currentTurn,_that.moveHistory,_that.viewMoveIndex,_that.lastMove,_that.checkedKingSquare,_that.isGameOver,_that.gameOverReason,_that.gameWinner,_that.playerColor,_that.mode,_that.opponentType,_that.lifecycle,_that.moveError,_that.initError,_that.training,_that.puzzle);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String? sessionId,  String fen,  String viewFen,  Side currentTurn,  List<String> moveHistory,  int viewMoveIndex,  LastMove? lastMove,  String? checkedKingSquare,  bool isGameOver,  GameOverReason? gameOverReason,  GameWinner? gameWinner,  Side playerColor,  GameMode mode,  OpponentType opponentType,  GameLifecycle lifecycle,  String? moveError,  String? initError,  TrainingState training,  PuzzleState puzzle)?  $default,) {final _that = this;
switch (_that) {
case _ChessState() when $default != null:
return $default(_that.sessionId,_that.fen,_that.viewFen,_that.currentTurn,_that.moveHistory,_that.viewMoveIndex,_that.lastMove,_that.checkedKingSquare,_that.isGameOver,_that.gameOverReason,_that.gameWinner,_that.playerColor,_that.mode,_that.opponentType,_that.lifecycle,_that.moveError,_that.initError,_that.training,_that.puzzle);case _:
  return null;

}
}

}

/// @nodoc


class _ChessState implements ChessState {
  const _ChessState({this.sessionId = null, this.fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', this.viewFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', this.currentTurn = Side.w, final  List<String> moveHistory = const [], this.viewMoveIndex = -1, this.lastMove = null, this.checkedKingSquare = null, this.isGameOver = false, this.gameOverReason = null, this.gameWinner = null, this.playerColor = Side.w, this.mode = GameMode.play, this.opponentType = OpponentType.ai, this.lifecycle = GameLifecycle.idle, this.moveError = null, this.initError = null, this.training = const TrainingState(), this.puzzle = const PuzzleState()}): _moveHistory = moveHistory;
  

@override@JsonKey() final  String? sessionId;
@override@JsonKey() final  String fen;
@override@JsonKey() final  String viewFen;
@override@JsonKey() final  Side currentTurn;
 final  List<String> _moveHistory;
@override@JsonKey() List<String> get moveHistory {
  if (_moveHistory is EqualUnmodifiableListView) return _moveHistory;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_moveHistory);
}

@override@JsonKey() final  int viewMoveIndex;
@override@JsonKey() final  LastMove? lastMove;
@override@JsonKey() final  String? checkedKingSquare;
@override@JsonKey() final  bool isGameOver;
@override@JsonKey() final  GameOverReason? gameOverReason;
@override@JsonKey() final  GameWinner? gameWinner;
@override@JsonKey() final  Side playerColor;
@override@JsonKey() final  GameMode mode;
@override@JsonKey() final  OpponentType opponentType;
@override@JsonKey() final  GameLifecycle lifecycle;
@override@JsonKey() final  String? moveError;
@override@JsonKey() final  String? initError;
@override@JsonKey() final  TrainingState training;
@override@JsonKey() final  PuzzleState puzzle;

/// Create a copy of ChessState
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ChessStateCopyWith<_ChessState> get copyWith => __$ChessStateCopyWithImpl<_ChessState>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _ChessState&&(identical(other.sessionId, sessionId) || other.sessionId == sessionId)&&(identical(other.fen, fen) || other.fen == fen)&&(identical(other.viewFen, viewFen) || other.viewFen == viewFen)&&(identical(other.currentTurn, currentTurn) || other.currentTurn == currentTurn)&&const DeepCollectionEquality().equals(other._moveHistory, _moveHistory)&&(identical(other.viewMoveIndex, viewMoveIndex) || other.viewMoveIndex == viewMoveIndex)&&(identical(other.lastMove, lastMove) || other.lastMove == lastMove)&&(identical(other.checkedKingSquare, checkedKingSquare) || other.checkedKingSquare == checkedKingSquare)&&(identical(other.isGameOver, isGameOver) || other.isGameOver == isGameOver)&&(identical(other.gameOverReason, gameOverReason) || other.gameOverReason == gameOverReason)&&(identical(other.gameWinner, gameWinner) || other.gameWinner == gameWinner)&&(identical(other.playerColor, playerColor) || other.playerColor == playerColor)&&(identical(other.mode, mode) || other.mode == mode)&&(identical(other.opponentType, opponentType) || other.opponentType == opponentType)&&(identical(other.lifecycle, lifecycle) || other.lifecycle == lifecycle)&&(identical(other.moveError, moveError) || other.moveError == moveError)&&(identical(other.initError, initError) || other.initError == initError)&&(identical(other.training, training) || other.training == training)&&(identical(other.puzzle, puzzle) || other.puzzle == puzzle));
}


@override
int get hashCode => Object.hashAll([runtimeType,sessionId,fen,viewFen,currentTurn,const DeepCollectionEquality().hash(_moveHistory),viewMoveIndex,lastMove,checkedKingSquare,isGameOver,gameOverReason,gameWinner,playerColor,mode,opponentType,lifecycle,moveError,initError,training,puzzle]);

@override
String toString() {
  return 'ChessState(sessionId: $sessionId, fen: $fen, viewFen: $viewFen, currentTurn: $currentTurn, moveHistory: $moveHistory, viewMoveIndex: $viewMoveIndex, lastMove: $lastMove, checkedKingSquare: $checkedKingSquare, isGameOver: $isGameOver, gameOverReason: $gameOverReason, gameWinner: $gameWinner, playerColor: $playerColor, mode: $mode, opponentType: $opponentType, lifecycle: $lifecycle, moveError: $moveError, initError: $initError, training: $training, puzzle: $puzzle)';
}


}

/// @nodoc
abstract mixin class _$ChessStateCopyWith<$Res> implements $ChessStateCopyWith<$Res> {
  factory _$ChessStateCopyWith(_ChessState value, $Res Function(_ChessState) _then) = __$ChessStateCopyWithImpl;
@override @useResult
$Res call({
 String? sessionId, String fen, String viewFen, Side currentTurn, List<String> moveHistory, int viewMoveIndex, LastMove? lastMove, String? checkedKingSquare, bool isGameOver, GameOverReason? gameOverReason, GameWinner? gameWinner, Side playerColor, GameMode mode, OpponentType opponentType, GameLifecycle lifecycle, String? moveError, String? initError, TrainingState training, PuzzleState puzzle
});


@override $LastMoveCopyWith<$Res>? get lastMove;@override $TrainingStateCopyWith<$Res> get training;@override $PuzzleStateCopyWith<$Res> get puzzle;

}
/// @nodoc
class __$ChessStateCopyWithImpl<$Res>
    implements _$ChessStateCopyWith<$Res> {
  __$ChessStateCopyWithImpl(this._self, this._then);

  final _ChessState _self;
  final $Res Function(_ChessState) _then;

/// Create a copy of ChessState
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? sessionId = freezed,Object? fen = null,Object? viewFen = null,Object? currentTurn = null,Object? moveHistory = null,Object? viewMoveIndex = null,Object? lastMove = freezed,Object? checkedKingSquare = freezed,Object? isGameOver = null,Object? gameOverReason = freezed,Object? gameWinner = freezed,Object? playerColor = null,Object? mode = null,Object? opponentType = null,Object? lifecycle = null,Object? moveError = freezed,Object? initError = freezed,Object? training = null,Object? puzzle = null,}) {
  return _then(_ChessState(
sessionId: freezed == sessionId ? _self.sessionId : sessionId // ignore: cast_nullable_to_non_nullable
as String?,fen: null == fen ? _self.fen : fen // ignore: cast_nullable_to_non_nullable
as String,viewFen: null == viewFen ? _self.viewFen : viewFen // ignore: cast_nullable_to_non_nullable
as String,currentTurn: null == currentTurn ? _self.currentTurn : currentTurn // ignore: cast_nullable_to_non_nullable
as Side,moveHistory: null == moveHistory ? _self._moveHistory : moveHistory // ignore: cast_nullable_to_non_nullable
as List<String>,viewMoveIndex: null == viewMoveIndex ? _self.viewMoveIndex : viewMoveIndex // ignore: cast_nullable_to_non_nullable
as int,lastMove: freezed == lastMove ? _self.lastMove : lastMove // ignore: cast_nullable_to_non_nullable
as LastMove?,checkedKingSquare: freezed == checkedKingSquare ? _self.checkedKingSquare : checkedKingSquare // ignore: cast_nullable_to_non_nullable
as String?,isGameOver: null == isGameOver ? _self.isGameOver : isGameOver // ignore: cast_nullable_to_non_nullable
as bool,gameOverReason: freezed == gameOverReason ? _self.gameOverReason : gameOverReason // ignore: cast_nullable_to_non_nullable
as GameOverReason?,gameWinner: freezed == gameWinner ? _self.gameWinner : gameWinner // ignore: cast_nullable_to_non_nullable
as GameWinner?,playerColor: null == playerColor ? _self.playerColor : playerColor // ignore: cast_nullable_to_non_nullable
as Side,mode: null == mode ? _self.mode : mode // ignore: cast_nullable_to_non_nullable
as GameMode,opponentType: null == opponentType ? _self.opponentType : opponentType // ignore: cast_nullable_to_non_nullable
as OpponentType,lifecycle: null == lifecycle ? _self.lifecycle : lifecycle // ignore: cast_nullable_to_non_nullable
as GameLifecycle,moveError: freezed == moveError ? _self.moveError : moveError // ignore: cast_nullable_to_non_nullable
as String?,initError: freezed == initError ? _self.initError : initError // ignore: cast_nullable_to_non_nullable
as String?,training: null == training ? _self.training : training // ignore: cast_nullable_to_non_nullable
as TrainingState,puzzle: null == puzzle ? _self.puzzle : puzzle // ignore: cast_nullable_to_non_nullable
as PuzzleState,
  ));
}

/// Create a copy of ChessState
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$LastMoveCopyWith<$Res>? get lastMove {
    if (_self.lastMove == null) {
    return null;
  }

  return $LastMoveCopyWith<$Res>(_self.lastMove!, (value) {
    return _then(_self.copyWith(lastMove: value));
  });
}/// Create a copy of ChessState
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$TrainingStateCopyWith<$Res> get training {
  
  return $TrainingStateCopyWith<$Res>(_self.training, (value) {
    return _then(_self.copyWith(training: value));
  });
}/// Create a copy of ChessState
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$PuzzleStateCopyWith<$Res> get puzzle {
  
  return $PuzzleStateCopyWith<$Res>(_self.puzzle, (value) {
    return _then(_self.copyWith(puzzle: value));
  });
}
}

// dart format on
