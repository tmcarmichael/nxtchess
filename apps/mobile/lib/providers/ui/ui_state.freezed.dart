// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'ui_state.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$UIState {

 bool get showEndDialog; bool get showResignDialog; bool get showSetupSheet; bool get showPromotionDialog; String? get promotionFrom; String? get promotionTo; bool get boardFlipped;
/// Create a copy of UIState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$UIStateCopyWith<UIState> get copyWith => _$UIStateCopyWithImpl<UIState>(this as UIState, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is UIState&&(identical(other.showEndDialog, showEndDialog) || other.showEndDialog == showEndDialog)&&(identical(other.showResignDialog, showResignDialog) || other.showResignDialog == showResignDialog)&&(identical(other.showSetupSheet, showSetupSheet) || other.showSetupSheet == showSetupSheet)&&(identical(other.showPromotionDialog, showPromotionDialog) || other.showPromotionDialog == showPromotionDialog)&&(identical(other.promotionFrom, promotionFrom) || other.promotionFrom == promotionFrom)&&(identical(other.promotionTo, promotionTo) || other.promotionTo == promotionTo)&&(identical(other.boardFlipped, boardFlipped) || other.boardFlipped == boardFlipped));
}


@override
int get hashCode => Object.hash(runtimeType,showEndDialog,showResignDialog,showSetupSheet,showPromotionDialog,promotionFrom,promotionTo,boardFlipped);

@override
String toString() {
  return 'UIState(showEndDialog: $showEndDialog, showResignDialog: $showResignDialog, showSetupSheet: $showSetupSheet, showPromotionDialog: $showPromotionDialog, promotionFrom: $promotionFrom, promotionTo: $promotionTo, boardFlipped: $boardFlipped)';
}


}

/// @nodoc
abstract mixin class $UIStateCopyWith<$Res>  {
  factory $UIStateCopyWith(UIState value, $Res Function(UIState) _then) = _$UIStateCopyWithImpl;
@useResult
$Res call({
 bool showEndDialog, bool showResignDialog, bool showSetupSheet, bool showPromotionDialog, String? promotionFrom, String? promotionTo, bool boardFlipped
});




}
/// @nodoc
class _$UIStateCopyWithImpl<$Res>
    implements $UIStateCopyWith<$Res> {
  _$UIStateCopyWithImpl(this._self, this._then);

  final UIState _self;
  final $Res Function(UIState) _then;

/// Create a copy of UIState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? showEndDialog = null,Object? showResignDialog = null,Object? showSetupSheet = null,Object? showPromotionDialog = null,Object? promotionFrom = freezed,Object? promotionTo = freezed,Object? boardFlipped = null,}) {
  return _then(_self.copyWith(
showEndDialog: null == showEndDialog ? _self.showEndDialog : showEndDialog // ignore: cast_nullable_to_non_nullable
as bool,showResignDialog: null == showResignDialog ? _self.showResignDialog : showResignDialog // ignore: cast_nullable_to_non_nullable
as bool,showSetupSheet: null == showSetupSheet ? _self.showSetupSheet : showSetupSheet // ignore: cast_nullable_to_non_nullable
as bool,showPromotionDialog: null == showPromotionDialog ? _self.showPromotionDialog : showPromotionDialog // ignore: cast_nullable_to_non_nullable
as bool,promotionFrom: freezed == promotionFrom ? _self.promotionFrom : promotionFrom // ignore: cast_nullable_to_non_nullable
as String?,promotionTo: freezed == promotionTo ? _self.promotionTo : promotionTo // ignore: cast_nullable_to_non_nullable
as String?,boardFlipped: null == boardFlipped ? _self.boardFlipped : boardFlipped // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

}


/// Adds pattern-matching-related methods to [UIState].
extension UIStatePatterns on UIState {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _UIState value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _UIState() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _UIState value)  $default,){
final _that = this;
switch (_that) {
case _UIState():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _UIState value)?  $default,){
final _that = this;
switch (_that) {
case _UIState() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( bool showEndDialog,  bool showResignDialog,  bool showSetupSheet,  bool showPromotionDialog,  String? promotionFrom,  String? promotionTo,  bool boardFlipped)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _UIState() when $default != null:
return $default(_that.showEndDialog,_that.showResignDialog,_that.showSetupSheet,_that.showPromotionDialog,_that.promotionFrom,_that.promotionTo,_that.boardFlipped);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( bool showEndDialog,  bool showResignDialog,  bool showSetupSheet,  bool showPromotionDialog,  String? promotionFrom,  String? promotionTo,  bool boardFlipped)  $default,) {final _that = this;
switch (_that) {
case _UIState():
return $default(_that.showEndDialog,_that.showResignDialog,_that.showSetupSheet,_that.showPromotionDialog,_that.promotionFrom,_that.promotionTo,_that.boardFlipped);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( bool showEndDialog,  bool showResignDialog,  bool showSetupSheet,  bool showPromotionDialog,  String? promotionFrom,  String? promotionTo,  bool boardFlipped)?  $default,) {final _that = this;
switch (_that) {
case _UIState() when $default != null:
return $default(_that.showEndDialog,_that.showResignDialog,_that.showSetupSheet,_that.showPromotionDialog,_that.promotionFrom,_that.promotionTo,_that.boardFlipped);case _:
  return null;

}
}

}

/// @nodoc


class _UIState implements UIState {
  const _UIState({this.showEndDialog = false, this.showResignDialog = false, this.showSetupSheet = false, this.showPromotionDialog = false, this.promotionFrom = null, this.promotionTo = null, this.boardFlipped = false});
  

@override@JsonKey() final  bool showEndDialog;
@override@JsonKey() final  bool showResignDialog;
@override@JsonKey() final  bool showSetupSheet;
@override@JsonKey() final  bool showPromotionDialog;
@override@JsonKey() final  String? promotionFrom;
@override@JsonKey() final  String? promotionTo;
@override@JsonKey() final  bool boardFlipped;

/// Create a copy of UIState
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$UIStateCopyWith<_UIState> get copyWith => __$UIStateCopyWithImpl<_UIState>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _UIState&&(identical(other.showEndDialog, showEndDialog) || other.showEndDialog == showEndDialog)&&(identical(other.showResignDialog, showResignDialog) || other.showResignDialog == showResignDialog)&&(identical(other.showSetupSheet, showSetupSheet) || other.showSetupSheet == showSetupSheet)&&(identical(other.showPromotionDialog, showPromotionDialog) || other.showPromotionDialog == showPromotionDialog)&&(identical(other.promotionFrom, promotionFrom) || other.promotionFrom == promotionFrom)&&(identical(other.promotionTo, promotionTo) || other.promotionTo == promotionTo)&&(identical(other.boardFlipped, boardFlipped) || other.boardFlipped == boardFlipped));
}


@override
int get hashCode => Object.hash(runtimeType,showEndDialog,showResignDialog,showSetupSheet,showPromotionDialog,promotionFrom,promotionTo,boardFlipped);

@override
String toString() {
  return 'UIState(showEndDialog: $showEndDialog, showResignDialog: $showResignDialog, showSetupSheet: $showSetupSheet, showPromotionDialog: $showPromotionDialog, promotionFrom: $promotionFrom, promotionTo: $promotionTo, boardFlipped: $boardFlipped)';
}


}

/// @nodoc
abstract mixin class _$UIStateCopyWith<$Res> implements $UIStateCopyWith<$Res> {
  factory _$UIStateCopyWith(_UIState value, $Res Function(_UIState) _then) = __$UIStateCopyWithImpl;
@override @useResult
$Res call({
 bool showEndDialog, bool showResignDialog, bool showSetupSheet, bool showPromotionDialog, String? promotionFrom, String? promotionTo, bool boardFlipped
});




}
/// @nodoc
class __$UIStateCopyWithImpl<$Res>
    implements _$UIStateCopyWith<$Res> {
  __$UIStateCopyWithImpl(this._self, this._then);

  final _UIState _self;
  final $Res Function(_UIState) _then;

/// Create a copy of UIState
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? showEndDialog = null,Object? showResignDialog = null,Object? showSetupSheet = null,Object? showPromotionDialog = null,Object? promotionFrom = freezed,Object? promotionTo = freezed,Object? boardFlipped = null,}) {
  return _then(_UIState(
showEndDialog: null == showEndDialog ? _self.showEndDialog : showEndDialog // ignore: cast_nullable_to_non_nullable
as bool,showResignDialog: null == showResignDialog ? _self.showResignDialog : showResignDialog // ignore: cast_nullable_to_non_nullable
as bool,showSetupSheet: null == showSetupSheet ? _self.showSetupSheet : showSetupSheet // ignore: cast_nullable_to_non_nullable
as bool,showPromotionDialog: null == showPromotionDialog ? _self.showPromotionDialog : showPromotionDialog // ignore: cast_nullable_to_non_nullable
as bool,promotionFrom: freezed == promotionFrom ? _self.promotionFrom : promotionFrom // ignore: cast_nullable_to_non_nullable
as String?,promotionTo: freezed == promotionTo ? _self.promotionTo : promotionTo // ignore: cast_nullable_to_non_nullable
as String?,boardFlipped: null == boardFlipped ? _self.boardFlipped : boardFlipped // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}


}

// dart format on
