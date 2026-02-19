// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'sync_types.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$WsMessage {

 String get type; Map<String, dynamic>? get data;
/// Create a copy of WsMessage
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$WsMessageCopyWith<WsMessage> get copyWith => _$WsMessageCopyWithImpl<WsMessage>(this as WsMessage, _$identity);

  /// Serializes this WsMessage to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is WsMessage&&(identical(other.type, type) || other.type == type)&&const DeepCollectionEquality().equals(other.data, data));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,type,const DeepCollectionEquality().hash(data));

@override
String toString() {
  return 'WsMessage(type: $type, data: $data)';
}


}

/// @nodoc
abstract mixin class $WsMessageCopyWith<$Res>  {
  factory $WsMessageCopyWith(WsMessage value, $Res Function(WsMessage) _then) = _$WsMessageCopyWithImpl;
@useResult
$Res call({
 String type, Map<String, dynamic>? data
});




}
/// @nodoc
class _$WsMessageCopyWithImpl<$Res>
    implements $WsMessageCopyWith<$Res> {
  _$WsMessageCopyWithImpl(this._self, this._then);

  final WsMessage _self;
  final $Res Function(WsMessage) _then;

/// Create a copy of WsMessage
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? type = null,Object? data = freezed,}) {
  return _then(_self.copyWith(
type: null == type ? _self.type : type // ignore: cast_nullable_to_non_nullable
as String,data: freezed == data ? _self.data : data // ignore: cast_nullable_to_non_nullable
as Map<String, dynamic>?,
  ));
}

}


/// Adds pattern-matching-related methods to [WsMessage].
extension WsMessagePatterns on WsMessage {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _WsMessage value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _WsMessage() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _WsMessage value)  $default,){
final _that = this;
switch (_that) {
case _WsMessage():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _WsMessage value)?  $default,){
final _that = this;
switch (_that) {
case _WsMessage() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String type,  Map<String, dynamic>? data)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _WsMessage() when $default != null:
return $default(_that.type,_that.data);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String type,  Map<String, dynamic>? data)  $default,) {final _that = this;
switch (_that) {
case _WsMessage():
return $default(_that.type,_that.data);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String type,  Map<String, dynamic>? data)?  $default,) {final _that = this;
switch (_that) {
case _WsMessage() when $default != null:
return $default(_that.type,_that.data);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _WsMessage implements WsMessage {
  const _WsMessage({required this.type, final  Map<String, dynamic>? data}): _data = data;
  factory _WsMessage.fromJson(Map<String, dynamic> json) => _$WsMessageFromJson(json);

@override final  String type;
 final  Map<String, dynamic>? _data;
@override Map<String, dynamic>? get data {
  final value = _data;
  if (value == null) return null;
  if (_data is EqualUnmodifiableMapView) return _data;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableMapView(value);
}


/// Create a copy of WsMessage
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$WsMessageCopyWith<_WsMessage> get copyWith => __$WsMessageCopyWithImpl<_WsMessage>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$WsMessageToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _WsMessage&&(identical(other.type, type) || other.type == type)&&const DeepCollectionEquality().equals(other._data, _data));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,type,const DeepCollectionEquality().hash(_data));

@override
String toString() {
  return 'WsMessage(type: $type, data: $data)';
}


}

/// @nodoc
abstract mixin class _$WsMessageCopyWith<$Res> implements $WsMessageCopyWith<$Res> {
  factory _$WsMessageCopyWith(_WsMessage value, $Res Function(_WsMessage) _then) = __$WsMessageCopyWithImpl;
@override @useResult
$Res call({
 String type, Map<String, dynamic>? data
});




}
/// @nodoc
class __$WsMessageCopyWithImpl<$Res>
    implements _$WsMessageCopyWith<$Res> {
  __$WsMessageCopyWithImpl(this._self, this._then);

  final _WsMessage _self;
  final $Res Function(_WsMessage) _then;

/// Create a copy of WsMessage
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? type = null,Object? data = freezed,}) {
  return _then(_WsMessage(
type: null == type ? _self.type : type // ignore: cast_nullable_to_non_nullable
as String,data: freezed == data ? _self._data : data // ignore: cast_nullable_to_non_nullable
as Map<String, dynamic>?,
  ));
}


}


/// @nodoc
mixin _$PlayerInfo {

 String get id; String? get username; int? get rating;
/// Create a copy of PlayerInfo
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$PlayerInfoCopyWith<PlayerInfo> get copyWith => _$PlayerInfoCopyWithImpl<PlayerInfo>(this as PlayerInfo, _$identity);

  /// Serializes this PlayerInfo to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is PlayerInfo&&(identical(other.id, id) || other.id == id)&&(identical(other.username, username) || other.username == username)&&(identical(other.rating, rating) || other.rating == rating));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,username,rating);

@override
String toString() {
  return 'PlayerInfo(id: $id, username: $username, rating: $rating)';
}


}

/// @nodoc
abstract mixin class $PlayerInfoCopyWith<$Res>  {
  factory $PlayerInfoCopyWith(PlayerInfo value, $Res Function(PlayerInfo) _then) = _$PlayerInfoCopyWithImpl;
@useResult
$Res call({
 String id, String? username, int? rating
});




}
/// @nodoc
class _$PlayerInfoCopyWithImpl<$Res>
    implements $PlayerInfoCopyWith<$Res> {
  _$PlayerInfoCopyWithImpl(this._self, this._then);

  final PlayerInfo _self;
  final $Res Function(PlayerInfo) _then;

/// Create a copy of PlayerInfo
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? username = freezed,Object? rating = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,username: freezed == username ? _self.username : username // ignore: cast_nullable_to_non_nullable
as String?,rating: freezed == rating ? _self.rating : rating // ignore: cast_nullable_to_non_nullable
as int?,
  ));
}

}


/// Adds pattern-matching-related methods to [PlayerInfo].
extension PlayerInfoPatterns on PlayerInfo {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _PlayerInfo value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _PlayerInfo() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _PlayerInfo value)  $default,){
final _that = this;
switch (_that) {
case _PlayerInfo():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _PlayerInfo value)?  $default,){
final _that = this;
switch (_that) {
case _PlayerInfo() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String? username,  int? rating)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _PlayerInfo() when $default != null:
return $default(_that.id,_that.username,_that.rating);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String? username,  int? rating)  $default,) {final _that = this;
switch (_that) {
case _PlayerInfo():
return $default(_that.id,_that.username,_that.rating);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String? username,  int? rating)?  $default,) {final _that = this;
switch (_that) {
case _PlayerInfo() when $default != null:
return $default(_that.id,_that.username,_that.rating);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _PlayerInfo implements PlayerInfo {
  const _PlayerInfo({required this.id, this.username, this.rating});
  factory _PlayerInfo.fromJson(Map<String, dynamic> json) => _$PlayerInfoFromJson(json);

@override final  String id;
@override final  String? username;
@override final  int? rating;

/// Create a copy of PlayerInfo
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$PlayerInfoCopyWith<_PlayerInfo> get copyWith => __$PlayerInfoCopyWithImpl<_PlayerInfo>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$PlayerInfoToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _PlayerInfo&&(identical(other.id, id) || other.id == id)&&(identical(other.username, username) || other.username == username)&&(identical(other.rating, rating) || other.rating == rating));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,username,rating);

@override
String toString() {
  return 'PlayerInfo(id: $id, username: $username, rating: $rating)';
}


}

/// @nodoc
abstract mixin class _$PlayerInfoCopyWith<$Res> implements $PlayerInfoCopyWith<$Res> {
  factory _$PlayerInfoCopyWith(_PlayerInfo value, $Res Function(_PlayerInfo) _then) = __$PlayerInfoCopyWithImpl;
@override @useResult
$Res call({
 String id, String? username, int? rating
});




}
/// @nodoc
class __$PlayerInfoCopyWithImpl<$Res>
    implements _$PlayerInfoCopyWith<$Res> {
  __$PlayerInfoCopyWithImpl(this._self, this._then);

  final _PlayerInfo _self;
  final $Res Function(_PlayerInfo) _then;

/// Create a copy of PlayerInfo
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? username = freezed,Object? rating = freezed,}) {
  return _then(_PlayerInfo(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,username: freezed == username ? _self.username : username // ignore: cast_nullable_to_non_nullable
as String?,rating: freezed == rating ? _self.rating : rating // ignore: cast_nullable_to_non_nullable
as int?,
  ));
}


}


/// @nodoc
mixin _$TimeControlData {

 int get initialTime; int get increment;
/// Create a copy of TimeControlData
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$TimeControlDataCopyWith<TimeControlData> get copyWith => _$TimeControlDataCopyWithImpl<TimeControlData>(this as TimeControlData, _$identity);

  /// Serializes this TimeControlData to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is TimeControlData&&(identical(other.initialTime, initialTime) || other.initialTime == initialTime)&&(identical(other.increment, increment) || other.increment == increment));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,initialTime,increment);

@override
String toString() {
  return 'TimeControlData(initialTime: $initialTime, increment: $increment)';
}


}

/// @nodoc
abstract mixin class $TimeControlDataCopyWith<$Res>  {
  factory $TimeControlDataCopyWith(TimeControlData value, $Res Function(TimeControlData) _then) = _$TimeControlDataCopyWithImpl;
@useResult
$Res call({
 int initialTime, int increment
});




}
/// @nodoc
class _$TimeControlDataCopyWithImpl<$Res>
    implements $TimeControlDataCopyWith<$Res> {
  _$TimeControlDataCopyWithImpl(this._self, this._then);

  final TimeControlData _self;
  final $Res Function(TimeControlData) _then;

/// Create a copy of TimeControlData
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? initialTime = null,Object? increment = null,}) {
  return _then(_self.copyWith(
initialTime: null == initialTime ? _self.initialTime : initialTime // ignore: cast_nullable_to_non_nullable
as int,increment: null == increment ? _self.increment : increment // ignore: cast_nullable_to_non_nullable
as int,
  ));
}

}


/// Adds pattern-matching-related methods to [TimeControlData].
extension TimeControlDataPatterns on TimeControlData {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _TimeControlData value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _TimeControlData() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _TimeControlData value)  $default,){
final _that = this;
switch (_that) {
case _TimeControlData():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _TimeControlData value)?  $default,){
final _that = this;
switch (_that) {
case _TimeControlData() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( int initialTime,  int increment)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _TimeControlData() when $default != null:
return $default(_that.initialTime,_that.increment);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( int initialTime,  int increment)  $default,) {final _that = this;
switch (_that) {
case _TimeControlData():
return $default(_that.initialTime,_that.increment);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( int initialTime,  int increment)?  $default,) {final _that = this;
switch (_that) {
case _TimeControlData() when $default != null:
return $default(_that.initialTime,_that.increment);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _TimeControlData implements TimeControlData {
  const _TimeControlData({required this.initialTime, this.increment = 0});
  factory _TimeControlData.fromJson(Map<String, dynamic> json) => _$TimeControlDataFromJson(json);

@override final  int initialTime;
@override@JsonKey() final  int increment;

/// Create a copy of TimeControlData
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$TimeControlDataCopyWith<_TimeControlData> get copyWith => __$TimeControlDataCopyWithImpl<_TimeControlData>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$TimeControlDataToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _TimeControlData&&(identical(other.initialTime, initialTime) || other.initialTime == initialTime)&&(identical(other.increment, increment) || other.increment == increment));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,initialTime,increment);

@override
String toString() {
  return 'TimeControlData(initialTime: $initialTime, increment: $increment)';
}


}

/// @nodoc
abstract mixin class _$TimeControlDataCopyWith<$Res> implements $TimeControlDataCopyWith<$Res> {
  factory _$TimeControlDataCopyWith(_TimeControlData value, $Res Function(_TimeControlData) _then) = __$TimeControlDataCopyWithImpl;
@override @useResult
$Res call({
 int initialTime, int increment
});




}
/// @nodoc
class __$TimeControlDataCopyWithImpl<$Res>
    implements _$TimeControlDataCopyWith<$Res> {
  __$TimeControlDataCopyWithImpl(this._self, this._then);

  final _TimeControlData _self;
  final $Res Function(_TimeControlData) _then;

/// Create a copy of TimeControlData
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? initialTime = null,Object? increment = null,}) {
  return _then(_TimeControlData(
initialTime: null == initialTime ? _self.initialTime : initialTime // ignore: cast_nullable_to_non_nullable
as int,increment: null == increment ? _self.increment : increment // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}


/// @nodoc
mixin _$GameCreatedData {

 String get gameId; String get color;
/// Create a copy of GameCreatedData
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$GameCreatedDataCopyWith<GameCreatedData> get copyWith => _$GameCreatedDataCopyWithImpl<GameCreatedData>(this as GameCreatedData, _$identity);

  /// Serializes this GameCreatedData to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is GameCreatedData&&(identical(other.gameId, gameId) || other.gameId == gameId)&&(identical(other.color, color) || other.color == color));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,gameId,color);

@override
String toString() {
  return 'GameCreatedData(gameId: $gameId, color: $color)';
}


}

/// @nodoc
abstract mixin class $GameCreatedDataCopyWith<$Res>  {
  factory $GameCreatedDataCopyWith(GameCreatedData value, $Res Function(GameCreatedData) _then) = _$GameCreatedDataCopyWithImpl;
@useResult
$Res call({
 String gameId, String color
});




}
/// @nodoc
class _$GameCreatedDataCopyWithImpl<$Res>
    implements $GameCreatedDataCopyWith<$Res> {
  _$GameCreatedDataCopyWithImpl(this._self, this._then);

  final GameCreatedData _self;
  final $Res Function(GameCreatedData) _then;

/// Create a copy of GameCreatedData
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? gameId = null,Object? color = null,}) {
  return _then(_self.copyWith(
gameId: null == gameId ? _self.gameId : gameId // ignore: cast_nullable_to_non_nullable
as String,color: null == color ? _self.color : color // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [GameCreatedData].
extension GameCreatedDataPatterns on GameCreatedData {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _GameCreatedData value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _GameCreatedData() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _GameCreatedData value)  $default,){
final _that = this;
switch (_that) {
case _GameCreatedData():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _GameCreatedData value)?  $default,){
final _that = this;
switch (_that) {
case _GameCreatedData() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String gameId,  String color)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _GameCreatedData() when $default != null:
return $default(_that.gameId,_that.color);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String gameId,  String color)  $default,) {final _that = this;
switch (_that) {
case _GameCreatedData():
return $default(_that.gameId,_that.color);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String gameId,  String color)?  $default,) {final _that = this;
switch (_that) {
case _GameCreatedData() when $default != null:
return $default(_that.gameId,_that.color);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _GameCreatedData implements GameCreatedData {
  const _GameCreatedData({required this.gameId, required this.color});
  factory _GameCreatedData.fromJson(Map<String, dynamic> json) => _$GameCreatedDataFromJson(json);

@override final  String gameId;
@override final  String color;

/// Create a copy of GameCreatedData
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$GameCreatedDataCopyWith<_GameCreatedData> get copyWith => __$GameCreatedDataCopyWithImpl<_GameCreatedData>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$GameCreatedDataToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _GameCreatedData&&(identical(other.gameId, gameId) || other.gameId == gameId)&&(identical(other.color, color) || other.color == color));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,gameId,color);

@override
String toString() {
  return 'GameCreatedData(gameId: $gameId, color: $color)';
}


}

/// @nodoc
abstract mixin class _$GameCreatedDataCopyWith<$Res> implements $GameCreatedDataCopyWith<$Res> {
  factory _$GameCreatedDataCopyWith(_GameCreatedData value, $Res Function(_GameCreatedData) _then) = __$GameCreatedDataCopyWithImpl;
@override @useResult
$Res call({
 String gameId, String color
});




}
/// @nodoc
class __$GameCreatedDataCopyWithImpl<$Res>
    implements _$GameCreatedDataCopyWith<$Res> {
  __$GameCreatedDataCopyWithImpl(this._self, this._then);

  final _GameCreatedData _self;
  final $Res Function(_GameCreatedData) _then;

/// Create a copy of GameCreatedData
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? gameId = null,Object? color = null,}) {
  return _then(_GameCreatedData(
gameId: null == gameId ? _self.gameId : gameId // ignore: cast_nullable_to_non_nullable
as String,color: null == color ? _self.color : color // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}


/// @nodoc
mixin _$GameJoinedData {

 String get gameId; String get color; String? get opponent;
/// Create a copy of GameJoinedData
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$GameJoinedDataCopyWith<GameJoinedData> get copyWith => _$GameJoinedDataCopyWithImpl<GameJoinedData>(this as GameJoinedData, _$identity);

  /// Serializes this GameJoinedData to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is GameJoinedData&&(identical(other.gameId, gameId) || other.gameId == gameId)&&(identical(other.color, color) || other.color == color)&&(identical(other.opponent, opponent) || other.opponent == opponent));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,gameId,color,opponent);

@override
String toString() {
  return 'GameJoinedData(gameId: $gameId, color: $color, opponent: $opponent)';
}


}

/// @nodoc
abstract mixin class $GameJoinedDataCopyWith<$Res>  {
  factory $GameJoinedDataCopyWith(GameJoinedData value, $Res Function(GameJoinedData) _then) = _$GameJoinedDataCopyWithImpl;
@useResult
$Res call({
 String gameId, String color, String? opponent
});




}
/// @nodoc
class _$GameJoinedDataCopyWithImpl<$Res>
    implements $GameJoinedDataCopyWith<$Res> {
  _$GameJoinedDataCopyWithImpl(this._self, this._then);

  final GameJoinedData _self;
  final $Res Function(GameJoinedData) _then;

/// Create a copy of GameJoinedData
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? gameId = null,Object? color = null,Object? opponent = freezed,}) {
  return _then(_self.copyWith(
gameId: null == gameId ? _self.gameId : gameId // ignore: cast_nullable_to_non_nullable
as String,color: null == color ? _self.color : color // ignore: cast_nullable_to_non_nullable
as String,opponent: freezed == opponent ? _self.opponent : opponent // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [GameJoinedData].
extension GameJoinedDataPatterns on GameJoinedData {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _GameJoinedData value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _GameJoinedData() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _GameJoinedData value)  $default,){
final _that = this;
switch (_that) {
case _GameJoinedData():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _GameJoinedData value)?  $default,){
final _that = this;
switch (_that) {
case _GameJoinedData() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String gameId,  String color,  String? opponent)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _GameJoinedData() when $default != null:
return $default(_that.gameId,_that.color,_that.opponent);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String gameId,  String color,  String? opponent)  $default,) {final _that = this;
switch (_that) {
case _GameJoinedData():
return $default(_that.gameId,_that.color,_that.opponent);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String gameId,  String color,  String? opponent)?  $default,) {final _that = this;
switch (_that) {
case _GameJoinedData() when $default != null:
return $default(_that.gameId,_that.color,_that.opponent);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _GameJoinedData implements GameJoinedData {
  const _GameJoinedData({required this.gameId, required this.color, this.opponent});
  factory _GameJoinedData.fromJson(Map<String, dynamic> json) => _$GameJoinedDataFromJson(json);

@override final  String gameId;
@override final  String color;
@override final  String? opponent;

/// Create a copy of GameJoinedData
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$GameJoinedDataCopyWith<_GameJoinedData> get copyWith => __$GameJoinedDataCopyWithImpl<_GameJoinedData>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$GameJoinedDataToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _GameJoinedData&&(identical(other.gameId, gameId) || other.gameId == gameId)&&(identical(other.color, color) || other.color == color)&&(identical(other.opponent, opponent) || other.opponent == opponent));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,gameId,color,opponent);

@override
String toString() {
  return 'GameJoinedData(gameId: $gameId, color: $color, opponent: $opponent)';
}


}

/// @nodoc
abstract mixin class _$GameJoinedDataCopyWith<$Res> implements $GameJoinedDataCopyWith<$Res> {
  factory _$GameJoinedDataCopyWith(_GameJoinedData value, $Res Function(_GameJoinedData) _then) = __$GameJoinedDataCopyWithImpl;
@override @useResult
$Res call({
 String gameId, String color, String? opponent
});




}
/// @nodoc
class __$GameJoinedDataCopyWithImpl<$Res>
    implements _$GameJoinedDataCopyWith<$Res> {
  __$GameJoinedDataCopyWithImpl(this._self, this._then);

  final _GameJoinedData _self;
  final $Res Function(_GameJoinedData) _then;

/// Create a copy of GameJoinedData
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? gameId = null,Object? color = null,Object? opponent = freezed,}) {
  return _then(_GameJoinedData(
gameId: null == gameId ? _self.gameId : gameId // ignore: cast_nullable_to_non_nullable
as String,color: null == color ? _self.color : color // ignore: cast_nullable_to_non_nullable
as String,opponent: freezed == opponent ? _self.opponent : opponent // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}


/// @nodoc
mixin _$GameStartedData {

 String get gameId; String? get fen; PlayerInfo get whitePlayer; PlayerInfo get blackPlayer; TimeControlData? get timeControl;@JsonKey(name: 'whiteTimeMs') int get whiteTimeMs;@JsonKey(name: 'blackTimeMs') int get blackTimeMs;
/// Create a copy of GameStartedData
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$GameStartedDataCopyWith<GameStartedData> get copyWith => _$GameStartedDataCopyWithImpl<GameStartedData>(this as GameStartedData, _$identity);

  /// Serializes this GameStartedData to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is GameStartedData&&(identical(other.gameId, gameId) || other.gameId == gameId)&&(identical(other.fen, fen) || other.fen == fen)&&(identical(other.whitePlayer, whitePlayer) || other.whitePlayer == whitePlayer)&&(identical(other.blackPlayer, blackPlayer) || other.blackPlayer == blackPlayer)&&(identical(other.timeControl, timeControl) || other.timeControl == timeControl)&&(identical(other.whiteTimeMs, whiteTimeMs) || other.whiteTimeMs == whiteTimeMs)&&(identical(other.blackTimeMs, blackTimeMs) || other.blackTimeMs == blackTimeMs));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,gameId,fen,whitePlayer,blackPlayer,timeControl,whiteTimeMs,blackTimeMs);

@override
String toString() {
  return 'GameStartedData(gameId: $gameId, fen: $fen, whitePlayer: $whitePlayer, blackPlayer: $blackPlayer, timeControl: $timeControl, whiteTimeMs: $whiteTimeMs, blackTimeMs: $blackTimeMs)';
}


}

/// @nodoc
abstract mixin class $GameStartedDataCopyWith<$Res>  {
  factory $GameStartedDataCopyWith(GameStartedData value, $Res Function(GameStartedData) _then) = _$GameStartedDataCopyWithImpl;
@useResult
$Res call({
 String gameId, String? fen, PlayerInfo whitePlayer, PlayerInfo blackPlayer, TimeControlData? timeControl,@JsonKey(name: 'whiteTimeMs') int whiteTimeMs,@JsonKey(name: 'blackTimeMs') int blackTimeMs
});


$PlayerInfoCopyWith<$Res> get whitePlayer;$PlayerInfoCopyWith<$Res> get blackPlayer;$TimeControlDataCopyWith<$Res>? get timeControl;

}
/// @nodoc
class _$GameStartedDataCopyWithImpl<$Res>
    implements $GameStartedDataCopyWith<$Res> {
  _$GameStartedDataCopyWithImpl(this._self, this._then);

  final GameStartedData _self;
  final $Res Function(GameStartedData) _then;

/// Create a copy of GameStartedData
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? gameId = null,Object? fen = freezed,Object? whitePlayer = null,Object? blackPlayer = null,Object? timeControl = freezed,Object? whiteTimeMs = null,Object? blackTimeMs = null,}) {
  return _then(_self.copyWith(
gameId: null == gameId ? _self.gameId : gameId // ignore: cast_nullable_to_non_nullable
as String,fen: freezed == fen ? _self.fen : fen // ignore: cast_nullable_to_non_nullable
as String?,whitePlayer: null == whitePlayer ? _self.whitePlayer : whitePlayer // ignore: cast_nullable_to_non_nullable
as PlayerInfo,blackPlayer: null == blackPlayer ? _self.blackPlayer : blackPlayer // ignore: cast_nullable_to_non_nullable
as PlayerInfo,timeControl: freezed == timeControl ? _self.timeControl : timeControl // ignore: cast_nullable_to_non_nullable
as TimeControlData?,whiteTimeMs: null == whiteTimeMs ? _self.whiteTimeMs : whiteTimeMs // ignore: cast_nullable_to_non_nullable
as int,blackTimeMs: null == blackTimeMs ? _self.blackTimeMs : blackTimeMs // ignore: cast_nullable_to_non_nullable
as int,
  ));
}
/// Create a copy of GameStartedData
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$PlayerInfoCopyWith<$Res> get whitePlayer {
  
  return $PlayerInfoCopyWith<$Res>(_self.whitePlayer, (value) {
    return _then(_self.copyWith(whitePlayer: value));
  });
}/// Create a copy of GameStartedData
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$PlayerInfoCopyWith<$Res> get blackPlayer {
  
  return $PlayerInfoCopyWith<$Res>(_self.blackPlayer, (value) {
    return _then(_self.copyWith(blackPlayer: value));
  });
}/// Create a copy of GameStartedData
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$TimeControlDataCopyWith<$Res>? get timeControl {
    if (_self.timeControl == null) {
    return null;
  }

  return $TimeControlDataCopyWith<$Res>(_self.timeControl!, (value) {
    return _then(_self.copyWith(timeControl: value));
  });
}
}


/// Adds pattern-matching-related methods to [GameStartedData].
extension GameStartedDataPatterns on GameStartedData {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _GameStartedData value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _GameStartedData() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _GameStartedData value)  $default,){
final _that = this;
switch (_that) {
case _GameStartedData():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _GameStartedData value)?  $default,){
final _that = this;
switch (_that) {
case _GameStartedData() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String gameId,  String? fen,  PlayerInfo whitePlayer,  PlayerInfo blackPlayer,  TimeControlData? timeControl, @JsonKey(name: 'whiteTimeMs')  int whiteTimeMs, @JsonKey(name: 'blackTimeMs')  int blackTimeMs)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _GameStartedData() when $default != null:
return $default(_that.gameId,_that.fen,_that.whitePlayer,_that.blackPlayer,_that.timeControl,_that.whiteTimeMs,_that.blackTimeMs);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String gameId,  String? fen,  PlayerInfo whitePlayer,  PlayerInfo blackPlayer,  TimeControlData? timeControl, @JsonKey(name: 'whiteTimeMs')  int whiteTimeMs, @JsonKey(name: 'blackTimeMs')  int blackTimeMs)  $default,) {final _that = this;
switch (_that) {
case _GameStartedData():
return $default(_that.gameId,_that.fen,_that.whitePlayer,_that.blackPlayer,_that.timeControl,_that.whiteTimeMs,_that.blackTimeMs);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String gameId,  String? fen,  PlayerInfo whitePlayer,  PlayerInfo blackPlayer,  TimeControlData? timeControl, @JsonKey(name: 'whiteTimeMs')  int whiteTimeMs, @JsonKey(name: 'blackTimeMs')  int blackTimeMs)?  $default,) {final _that = this;
switch (_that) {
case _GameStartedData() when $default != null:
return $default(_that.gameId,_that.fen,_that.whitePlayer,_that.blackPlayer,_that.timeControl,_that.whiteTimeMs,_that.blackTimeMs);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _GameStartedData implements GameStartedData {
  const _GameStartedData({required this.gameId, this.fen, required this.whitePlayer, required this.blackPlayer, this.timeControl, @JsonKey(name: 'whiteTimeMs') this.whiteTimeMs = 0, @JsonKey(name: 'blackTimeMs') this.blackTimeMs = 0});
  factory _GameStartedData.fromJson(Map<String, dynamic> json) => _$GameStartedDataFromJson(json);

@override final  String gameId;
@override final  String? fen;
@override final  PlayerInfo whitePlayer;
@override final  PlayerInfo blackPlayer;
@override final  TimeControlData? timeControl;
@override@JsonKey(name: 'whiteTimeMs') final  int whiteTimeMs;
@override@JsonKey(name: 'blackTimeMs') final  int blackTimeMs;

/// Create a copy of GameStartedData
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$GameStartedDataCopyWith<_GameStartedData> get copyWith => __$GameStartedDataCopyWithImpl<_GameStartedData>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$GameStartedDataToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _GameStartedData&&(identical(other.gameId, gameId) || other.gameId == gameId)&&(identical(other.fen, fen) || other.fen == fen)&&(identical(other.whitePlayer, whitePlayer) || other.whitePlayer == whitePlayer)&&(identical(other.blackPlayer, blackPlayer) || other.blackPlayer == blackPlayer)&&(identical(other.timeControl, timeControl) || other.timeControl == timeControl)&&(identical(other.whiteTimeMs, whiteTimeMs) || other.whiteTimeMs == whiteTimeMs)&&(identical(other.blackTimeMs, blackTimeMs) || other.blackTimeMs == blackTimeMs));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,gameId,fen,whitePlayer,blackPlayer,timeControl,whiteTimeMs,blackTimeMs);

@override
String toString() {
  return 'GameStartedData(gameId: $gameId, fen: $fen, whitePlayer: $whitePlayer, blackPlayer: $blackPlayer, timeControl: $timeControl, whiteTimeMs: $whiteTimeMs, blackTimeMs: $blackTimeMs)';
}


}

/// @nodoc
abstract mixin class _$GameStartedDataCopyWith<$Res> implements $GameStartedDataCopyWith<$Res> {
  factory _$GameStartedDataCopyWith(_GameStartedData value, $Res Function(_GameStartedData) _then) = __$GameStartedDataCopyWithImpl;
@override @useResult
$Res call({
 String gameId, String? fen, PlayerInfo whitePlayer, PlayerInfo blackPlayer, TimeControlData? timeControl,@JsonKey(name: 'whiteTimeMs') int whiteTimeMs,@JsonKey(name: 'blackTimeMs') int blackTimeMs
});


@override $PlayerInfoCopyWith<$Res> get whitePlayer;@override $PlayerInfoCopyWith<$Res> get blackPlayer;@override $TimeControlDataCopyWith<$Res>? get timeControl;

}
/// @nodoc
class __$GameStartedDataCopyWithImpl<$Res>
    implements _$GameStartedDataCopyWith<$Res> {
  __$GameStartedDataCopyWithImpl(this._self, this._then);

  final _GameStartedData _self;
  final $Res Function(_GameStartedData) _then;

/// Create a copy of GameStartedData
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? gameId = null,Object? fen = freezed,Object? whitePlayer = null,Object? blackPlayer = null,Object? timeControl = freezed,Object? whiteTimeMs = null,Object? blackTimeMs = null,}) {
  return _then(_GameStartedData(
gameId: null == gameId ? _self.gameId : gameId // ignore: cast_nullable_to_non_nullable
as String,fen: freezed == fen ? _self.fen : fen // ignore: cast_nullable_to_non_nullable
as String?,whitePlayer: null == whitePlayer ? _self.whitePlayer : whitePlayer // ignore: cast_nullable_to_non_nullable
as PlayerInfo,blackPlayer: null == blackPlayer ? _self.blackPlayer : blackPlayer // ignore: cast_nullable_to_non_nullable
as PlayerInfo,timeControl: freezed == timeControl ? _self.timeControl : timeControl // ignore: cast_nullable_to_non_nullable
as TimeControlData?,whiteTimeMs: null == whiteTimeMs ? _self.whiteTimeMs : whiteTimeMs // ignore: cast_nullable_to_non_nullable
as int,blackTimeMs: null == blackTimeMs ? _self.blackTimeMs : blackTimeMs // ignore: cast_nullable_to_non_nullable
as int,
  ));
}

/// Create a copy of GameStartedData
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$PlayerInfoCopyWith<$Res> get whitePlayer {
  
  return $PlayerInfoCopyWith<$Res>(_self.whitePlayer, (value) {
    return _then(_self.copyWith(whitePlayer: value));
  });
}/// Create a copy of GameStartedData
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$PlayerInfoCopyWith<$Res> get blackPlayer {
  
  return $PlayerInfoCopyWith<$Res>(_self.blackPlayer, (value) {
    return _then(_self.copyWith(blackPlayer: value));
  });
}/// Create a copy of GameStartedData
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$TimeControlDataCopyWith<$Res>? get timeControl {
    if (_self.timeControl == null) {
    return null;
  }

  return $TimeControlDataCopyWith<$Res>(_self.timeControl!, (value) {
    return _then(_self.copyWith(timeControl: value));
  });
}
}


/// @nodoc
mixin _$MoveAcceptedData {

 String get fen; String get san; String get from; String get to; bool? get isCheck;@JsonKey(name: 'whiteTimeMs') int get whiteTimeMs;@JsonKey(name: 'blackTimeMs') int get blackTimeMs;
/// Create a copy of MoveAcceptedData
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$MoveAcceptedDataCopyWith<MoveAcceptedData> get copyWith => _$MoveAcceptedDataCopyWithImpl<MoveAcceptedData>(this as MoveAcceptedData, _$identity);

  /// Serializes this MoveAcceptedData to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is MoveAcceptedData&&(identical(other.fen, fen) || other.fen == fen)&&(identical(other.san, san) || other.san == san)&&(identical(other.from, from) || other.from == from)&&(identical(other.to, to) || other.to == to)&&(identical(other.isCheck, isCheck) || other.isCheck == isCheck)&&(identical(other.whiteTimeMs, whiteTimeMs) || other.whiteTimeMs == whiteTimeMs)&&(identical(other.blackTimeMs, blackTimeMs) || other.blackTimeMs == blackTimeMs));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,fen,san,from,to,isCheck,whiteTimeMs,blackTimeMs);

@override
String toString() {
  return 'MoveAcceptedData(fen: $fen, san: $san, from: $from, to: $to, isCheck: $isCheck, whiteTimeMs: $whiteTimeMs, blackTimeMs: $blackTimeMs)';
}


}

/// @nodoc
abstract mixin class $MoveAcceptedDataCopyWith<$Res>  {
  factory $MoveAcceptedDataCopyWith(MoveAcceptedData value, $Res Function(MoveAcceptedData) _then) = _$MoveAcceptedDataCopyWithImpl;
@useResult
$Res call({
 String fen, String san, String from, String to, bool? isCheck,@JsonKey(name: 'whiteTimeMs') int whiteTimeMs,@JsonKey(name: 'blackTimeMs') int blackTimeMs
});




}
/// @nodoc
class _$MoveAcceptedDataCopyWithImpl<$Res>
    implements $MoveAcceptedDataCopyWith<$Res> {
  _$MoveAcceptedDataCopyWithImpl(this._self, this._then);

  final MoveAcceptedData _self;
  final $Res Function(MoveAcceptedData) _then;

/// Create a copy of MoveAcceptedData
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? fen = null,Object? san = null,Object? from = null,Object? to = null,Object? isCheck = freezed,Object? whiteTimeMs = null,Object? blackTimeMs = null,}) {
  return _then(_self.copyWith(
fen: null == fen ? _self.fen : fen // ignore: cast_nullable_to_non_nullable
as String,san: null == san ? _self.san : san // ignore: cast_nullable_to_non_nullable
as String,from: null == from ? _self.from : from // ignore: cast_nullable_to_non_nullable
as String,to: null == to ? _self.to : to // ignore: cast_nullable_to_non_nullable
as String,isCheck: freezed == isCheck ? _self.isCheck : isCheck // ignore: cast_nullable_to_non_nullable
as bool?,whiteTimeMs: null == whiteTimeMs ? _self.whiteTimeMs : whiteTimeMs // ignore: cast_nullable_to_non_nullable
as int,blackTimeMs: null == blackTimeMs ? _self.blackTimeMs : blackTimeMs // ignore: cast_nullable_to_non_nullable
as int,
  ));
}

}


/// Adds pattern-matching-related methods to [MoveAcceptedData].
extension MoveAcceptedDataPatterns on MoveAcceptedData {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _MoveAcceptedData value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _MoveAcceptedData() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _MoveAcceptedData value)  $default,){
final _that = this;
switch (_that) {
case _MoveAcceptedData():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _MoveAcceptedData value)?  $default,){
final _that = this;
switch (_that) {
case _MoveAcceptedData() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String fen,  String san,  String from,  String to,  bool? isCheck, @JsonKey(name: 'whiteTimeMs')  int whiteTimeMs, @JsonKey(name: 'blackTimeMs')  int blackTimeMs)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _MoveAcceptedData() when $default != null:
return $default(_that.fen,_that.san,_that.from,_that.to,_that.isCheck,_that.whiteTimeMs,_that.blackTimeMs);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String fen,  String san,  String from,  String to,  bool? isCheck, @JsonKey(name: 'whiteTimeMs')  int whiteTimeMs, @JsonKey(name: 'blackTimeMs')  int blackTimeMs)  $default,) {final _that = this;
switch (_that) {
case _MoveAcceptedData():
return $default(_that.fen,_that.san,_that.from,_that.to,_that.isCheck,_that.whiteTimeMs,_that.blackTimeMs);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String fen,  String san,  String from,  String to,  bool? isCheck, @JsonKey(name: 'whiteTimeMs')  int whiteTimeMs, @JsonKey(name: 'blackTimeMs')  int blackTimeMs)?  $default,) {final _that = this;
switch (_that) {
case _MoveAcceptedData() when $default != null:
return $default(_that.fen,_that.san,_that.from,_that.to,_that.isCheck,_that.whiteTimeMs,_that.blackTimeMs);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _MoveAcceptedData implements MoveAcceptedData {
  const _MoveAcceptedData({required this.fen, required this.san, required this.from, required this.to, this.isCheck, @JsonKey(name: 'whiteTimeMs') this.whiteTimeMs = 0, @JsonKey(name: 'blackTimeMs') this.blackTimeMs = 0});
  factory _MoveAcceptedData.fromJson(Map<String, dynamic> json) => _$MoveAcceptedDataFromJson(json);

@override final  String fen;
@override final  String san;
@override final  String from;
@override final  String to;
@override final  bool? isCheck;
@override@JsonKey(name: 'whiteTimeMs') final  int whiteTimeMs;
@override@JsonKey(name: 'blackTimeMs') final  int blackTimeMs;

/// Create a copy of MoveAcceptedData
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$MoveAcceptedDataCopyWith<_MoveAcceptedData> get copyWith => __$MoveAcceptedDataCopyWithImpl<_MoveAcceptedData>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$MoveAcceptedDataToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _MoveAcceptedData&&(identical(other.fen, fen) || other.fen == fen)&&(identical(other.san, san) || other.san == san)&&(identical(other.from, from) || other.from == from)&&(identical(other.to, to) || other.to == to)&&(identical(other.isCheck, isCheck) || other.isCheck == isCheck)&&(identical(other.whiteTimeMs, whiteTimeMs) || other.whiteTimeMs == whiteTimeMs)&&(identical(other.blackTimeMs, blackTimeMs) || other.blackTimeMs == blackTimeMs));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,fen,san,from,to,isCheck,whiteTimeMs,blackTimeMs);

@override
String toString() {
  return 'MoveAcceptedData(fen: $fen, san: $san, from: $from, to: $to, isCheck: $isCheck, whiteTimeMs: $whiteTimeMs, blackTimeMs: $blackTimeMs)';
}


}

/// @nodoc
abstract mixin class _$MoveAcceptedDataCopyWith<$Res> implements $MoveAcceptedDataCopyWith<$Res> {
  factory _$MoveAcceptedDataCopyWith(_MoveAcceptedData value, $Res Function(_MoveAcceptedData) _then) = __$MoveAcceptedDataCopyWithImpl;
@override @useResult
$Res call({
 String fen, String san, String from, String to, bool? isCheck,@JsonKey(name: 'whiteTimeMs') int whiteTimeMs,@JsonKey(name: 'blackTimeMs') int blackTimeMs
});




}
/// @nodoc
class __$MoveAcceptedDataCopyWithImpl<$Res>
    implements _$MoveAcceptedDataCopyWith<$Res> {
  __$MoveAcceptedDataCopyWithImpl(this._self, this._then);

  final _MoveAcceptedData _self;
  final $Res Function(_MoveAcceptedData) _then;

/// Create a copy of MoveAcceptedData
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? fen = null,Object? san = null,Object? from = null,Object? to = null,Object? isCheck = freezed,Object? whiteTimeMs = null,Object? blackTimeMs = null,}) {
  return _then(_MoveAcceptedData(
fen: null == fen ? _self.fen : fen // ignore: cast_nullable_to_non_nullable
as String,san: null == san ? _self.san : san // ignore: cast_nullable_to_non_nullable
as String,from: null == from ? _self.from : from // ignore: cast_nullable_to_non_nullable
as String,to: null == to ? _self.to : to // ignore: cast_nullable_to_non_nullable
as String,isCheck: freezed == isCheck ? _self.isCheck : isCheck // ignore: cast_nullable_to_non_nullable
as bool?,whiteTimeMs: null == whiteTimeMs ? _self.whiteTimeMs : whiteTimeMs // ignore: cast_nullable_to_non_nullable
as int,blackTimeMs: null == blackTimeMs ? _self.blackTimeMs : blackTimeMs // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}


/// @nodoc
mixin _$MoveRejectedData {

 String get fen; String get reason;
/// Create a copy of MoveRejectedData
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$MoveRejectedDataCopyWith<MoveRejectedData> get copyWith => _$MoveRejectedDataCopyWithImpl<MoveRejectedData>(this as MoveRejectedData, _$identity);

  /// Serializes this MoveRejectedData to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is MoveRejectedData&&(identical(other.fen, fen) || other.fen == fen)&&(identical(other.reason, reason) || other.reason == reason));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,fen,reason);

@override
String toString() {
  return 'MoveRejectedData(fen: $fen, reason: $reason)';
}


}

/// @nodoc
abstract mixin class $MoveRejectedDataCopyWith<$Res>  {
  factory $MoveRejectedDataCopyWith(MoveRejectedData value, $Res Function(MoveRejectedData) _then) = _$MoveRejectedDataCopyWithImpl;
@useResult
$Res call({
 String fen, String reason
});




}
/// @nodoc
class _$MoveRejectedDataCopyWithImpl<$Res>
    implements $MoveRejectedDataCopyWith<$Res> {
  _$MoveRejectedDataCopyWithImpl(this._self, this._then);

  final MoveRejectedData _self;
  final $Res Function(MoveRejectedData) _then;

/// Create a copy of MoveRejectedData
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? fen = null,Object? reason = null,}) {
  return _then(_self.copyWith(
fen: null == fen ? _self.fen : fen // ignore: cast_nullable_to_non_nullable
as String,reason: null == reason ? _self.reason : reason // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [MoveRejectedData].
extension MoveRejectedDataPatterns on MoveRejectedData {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _MoveRejectedData value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _MoveRejectedData() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _MoveRejectedData value)  $default,){
final _that = this;
switch (_that) {
case _MoveRejectedData():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _MoveRejectedData value)?  $default,){
final _that = this;
switch (_that) {
case _MoveRejectedData() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String fen,  String reason)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _MoveRejectedData() when $default != null:
return $default(_that.fen,_that.reason);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String fen,  String reason)  $default,) {final _that = this;
switch (_that) {
case _MoveRejectedData():
return $default(_that.fen,_that.reason);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String fen,  String reason)?  $default,) {final _that = this;
switch (_that) {
case _MoveRejectedData() when $default != null:
return $default(_that.fen,_that.reason);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _MoveRejectedData implements MoveRejectedData {
  const _MoveRejectedData({required this.fen, required this.reason});
  factory _MoveRejectedData.fromJson(Map<String, dynamic> json) => _$MoveRejectedDataFromJson(json);

@override final  String fen;
@override final  String reason;

/// Create a copy of MoveRejectedData
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$MoveRejectedDataCopyWith<_MoveRejectedData> get copyWith => __$MoveRejectedDataCopyWithImpl<_MoveRejectedData>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$MoveRejectedDataToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _MoveRejectedData&&(identical(other.fen, fen) || other.fen == fen)&&(identical(other.reason, reason) || other.reason == reason));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,fen,reason);

@override
String toString() {
  return 'MoveRejectedData(fen: $fen, reason: $reason)';
}


}

/// @nodoc
abstract mixin class _$MoveRejectedDataCopyWith<$Res> implements $MoveRejectedDataCopyWith<$Res> {
  factory _$MoveRejectedDataCopyWith(_MoveRejectedData value, $Res Function(_MoveRejectedData) _then) = __$MoveRejectedDataCopyWithImpl;
@override @useResult
$Res call({
 String fen, String reason
});




}
/// @nodoc
class __$MoveRejectedDataCopyWithImpl<$Res>
    implements _$MoveRejectedDataCopyWith<$Res> {
  __$MoveRejectedDataCopyWithImpl(this._self, this._then);

  final _MoveRejectedData _self;
  final $Res Function(_MoveRejectedData) _then;

/// Create a copy of MoveRejectedData
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? fen = null,Object? reason = null,}) {
  return _then(_MoveRejectedData(
fen: null == fen ? _self.fen : fen // ignore: cast_nullable_to_non_nullable
as String,reason: null == reason ? _self.reason : reason // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}


/// @nodoc
mixin _$OpponentMoveData {

 String get from; String get to; String? get promotion; String get fen; String get san;@JsonKey(name: 'whiteTimeMs') int get whiteTimeMs;@JsonKey(name: 'blackTimeMs') int get blackTimeMs; bool? get isCheck;
/// Create a copy of OpponentMoveData
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$OpponentMoveDataCopyWith<OpponentMoveData> get copyWith => _$OpponentMoveDataCopyWithImpl<OpponentMoveData>(this as OpponentMoveData, _$identity);

  /// Serializes this OpponentMoveData to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is OpponentMoveData&&(identical(other.from, from) || other.from == from)&&(identical(other.to, to) || other.to == to)&&(identical(other.promotion, promotion) || other.promotion == promotion)&&(identical(other.fen, fen) || other.fen == fen)&&(identical(other.san, san) || other.san == san)&&(identical(other.whiteTimeMs, whiteTimeMs) || other.whiteTimeMs == whiteTimeMs)&&(identical(other.blackTimeMs, blackTimeMs) || other.blackTimeMs == blackTimeMs)&&(identical(other.isCheck, isCheck) || other.isCheck == isCheck));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,from,to,promotion,fen,san,whiteTimeMs,blackTimeMs,isCheck);

@override
String toString() {
  return 'OpponentMoveData(from: $from, to: $to, promotion: $promotion, fen: $fen, san: $san, whiteTimeMs: $whiteTimeMs, blackTimeMs: $blackTimeMs, isCheck: $isCheck)';
}


}

/// @nodoc
abstract mixin class $OpponentMoveDataCopyWith<$Res>  {
  factory $OpponentMoveDataCopyWith(OpponentMoveData value, $Res Function(OpponentMoveData) _then) = _$OpponentMoveDataCopyWithImpl;
@useResult
$Res call({
 String from, String to, String? promotion, String fen, String san,@JsonKey(name: 'whiteTimeMs') int whiteTimeMs,@JsonKey(name: 'blackTimeMs') int blackTimeMs, bool? isCheck
});




}
/// @nodoc
class _$OpponentMoveDataCopyWithImpl<$Res>
    implements $OpponentMoveDataCopyWith<$Res> {
  _$OpponentMoveDataCopyWithImpl(this._self, this._then);

  final OpponentMoveData _self;
  final $Res Function(OpponentMoveData) _then;

/// Create a copy of OpponentMoveData
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? from = null,Object? to = null,Object? promotion = freezed,Object? fen = null,Object? san = null,Object? whiteTimeMs = null,Object? blackTimeMs = null,Object? isCheck = freezed,}) {
  return _then(_self.copyWith(
from: null == from ? _self.from : from // ignore: cast_nullable_to_non_nullable
as String,to: null == to ? _self.to : to // ignore: cast_nullable_to_non_nullable
as String,promotion: freezed == promotion ? _self.promotion : promotion // ignore: cast_nullable_to_non_nullable
as String?,fen: null == fen ? _self.fen : fen // ignore: cast_nullable_to_non_nullable
as String,san: null == san ? _self.san : san // ignore: cast_nullable_to_non_nullable
as String,whiteTimeMs: null == whiteTimeMs ? _self.whiteTimeMs : whiteTimeMs // ignore: cast_nullable_to_non_nullable
as int,blackTimeMs: null == blackTimeMs ? _self.blackTimeMs : blackTimeMs // ignore: cast_nullable_to_non_nullable
as int,isCheck: freezed == isCheck ? _self.isCheck : isCheck // ignore: cast_nullable_to_non_nullable
as bool?,
  ));
}

}


/// Adds pattern-matching-related methods to [OpponentMoveData].
extension OpponentMoveDataPatterns on OpponentMoveData {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _OpponentMoveData value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _OpponentMoveData() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _OpponentMoveData value)  $default,){
final _that = this;
switch (_that) {
case _OpponentMoveData():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _OpponentMoveData value)?  $default,){
final _that = this;
switch (_that) {
case _OpponentMoveData() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String from,  String to,  String? promotion,  String fen,  String san, @JsonKey(name: 'whiteTimeMs')  int whiteTimeMs, @JsonKey(name: 'blackTimeMs')  int blackTimeMs,  bool? isCheck)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _OpponentMoveData() when $default != null:
return $default(_that.from,_that.to,_that.promotion,_that.fen,_that.san,_that.whiteTimeMs,_that.blackTimeMs,_that.isCheck);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String from,  String to,  String? promotion,  String fen,  String san, @JsonKey(name: 'whiteTimeMs')  int whiteTimeMs, @JsonKey(name: 'blackTimeMs')  int blackTimeMs,  bool? isCheck)  $default,) {final _that = this;
switch (_that) {
case _OpponentMoveData():
return $default(_that.from,_that.to,_that.promotion,_that.fen,_that.san,_that.whiteTimeMs,_that.blackTimeMs,_that.isCheck);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String from,  String to,  String? promotion,  String fen,  String san, @JsonKey(name: 'whiteTimeMs')  int whiteTimeMs, @JsonKey(name: 'blackTimeMs')  int blackTimeMs,  bool? isCheck)?  $default,) {final _that = this;
switch (_that) {
case _OpponentMoveData() when $default != null:
return $default(_that.from,_that.to,_that.promotion,_that.fen,_that.san,_that.whiteTimeMs,_that.blackTimeMs,_that.isCheck);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _OpponentMoveData implements OpponentMoveData {
  const _OpponentMoveData({required this.from, required this.to, this.promotion, required this.fen, required this.san, @JsonKey(name: 'whiteTimeMs') this.whiteTimeMs = 0, @JsonKey(name: 'blackTimeMs') this.blackTimeMs = 0, this.isCheck});
  factory _OpponentMoveData.fromJson(Map<String, dynamic> json) => _$OpponentMoveDataFromJson(json);

@override final  String from;
@override final  String to;
@override final  String? promotion;
@override final  String fen;
@override final  String san;
@override@JsonKey(name: 'whiteTimeMs') final  int whiteTimeMs;
@override@JsonKey(name: 'blackTimeMs') final  int blackTimeMs;
@override final  bool? isCheck;

/// Create a copy of OpponentMoveData
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$OpponentMoveDataCopyWith<_OpponentMoveData> get copyWith => __$OpponentMoveDataCopyWithImpl<_OpponentMoveData>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$OpponentMoveDataToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _OpponentMoveData&&(identical(other.from, from) || other.from == from)&&(identical(other.to, to) || other.to == to)&&(identical(other.promotion, promotion) || other.promotion == promotion)&&(identical(other.fen, fen) || other.fen == fen)&&(identical(other.san, san) || other.san == san)&&(identical(other.whiteTimeMs, whiteTimeMs) || other.whiteTimeMs == whiteTimeMs)&&(identical(other.blackTimeMs, blackTimeMs) || other.blackTimeMs == blackTimeMs)&&(identical(other.isCheck, isCheck) || other.isCheck == isCheck));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,from,to,promotion,fen,san,whiteTimeMs,blackTimeMs,isCheck);

@override
String toString() {
  return 'OpponentMoveData(from: $from, to: $to, promotion: $promotion, fen: $fen, san: $san, whiteTimeMs: $whiteTimeMs, blackTimeMs: $blackTimeMs, isCheck: $isCheck)';
}


}

/// @nodoc
abstract mixin class _$OpponentMoveDataCopyWith<$Res> implements $OpponentMoveDataCopyWith<$Res> {
  factory _$OpponentMoveDataCopyWith(_OpponentMoveData value, $Res Function(_OpponentMoveData) _then) = __$OpponentMoveDataCopyWithImpl;
@override @useResult
$Res call({
 String from, String to, String? promotion, String fen, String san,@JsonKey(name: 'whiteTimeMs') int whiteTimeMs,@JsonKey(name: 'blackTimeMs') int blackTimeMs, bool? isCheck
});




}
/// @nodoc
class __$OpponentMoveDataCopyWithImpl<$Res>
    implements _$OpponentMoveDataCopyWith<$Res> {
  __$OpponentMoveDataCopyWithImpl(this._self, this._then);

  final _OpponentMoveData _self;
  final $Res Function(_OpponentMoveData) _then;

/// Create a copy of OpponentMoveData
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? from = null,Object? to = null,Object? promotion = freezed,Object? fen = null,Object? san = null,Object? whiteTimeMs = null,Object? blackTimeMs = null,Object? isCheck = freezed,}) {
  return _then(_OpponentMoveData(
from: null == from ? _self.from : from // ignore: cast_nullable_to_non_nullable
as String,to: null == to ? _self.to : to // ignore: cast_nullable_to_non_nullable
as String,promotion: freezed == promotion ? _self.promotion : promotion // ignore: cast_nullable_to_non_nullable
as String?,fen: null == fen ? _self.fen : fen // ignore: cast_nullable_to_non_nullable
as String,san: null == san ? _self.san : san // ignore: cast_nullable_to_non_nullable
as String,whiteTimeMs: null == whiteTimeMs ? _self.whiteTimeMs : whiteTimeMs // ignore: cast_nullable_to_non_nullable
as int,blackTimeMs: null == blackTimeMs ? _self.blackTimeMs : blackTimeMs // ignore: cast_nullable_to_non_nullable
as int,isCheck: freezed == isCheck ? _self.isCheck : isCheck // ignore: cast_nullable_to_non_nullable
as bool?,
  ));
}


}


/// @nodoc
mixin _$TimeUpdateData {

 int get whiteTime; int get blackTime;
/// Create a copy of TimeUpdateData
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$TimeUpdateDataCopyWith<TimeUpdateData> get copyWith => _$TimeUpdateDataCopyWithImpl<TimeUpdateData>(this as TimeUpdateData, _$identity);

  /// Serializes this TimeUpdateData to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is TimeUpdateData&&(identical(other.whiteTime, whiteTime) || other.whiteTime == whiteTime)&&(identical(other.blackTime, blackTime) || other.blackTime == blackTime));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,whiteTime,blackTime);

@override
String toString() {
  return 'TimeUpdateData(whiteTime: $whiteTime, blackTime: $blackTime)';
}


}

/// @nodoc
abstract mixin class $TimeUpdateDataCopyWith<$Res>  {
  factory $TimeUpdateDataCopyWith(TimeUpdateData value, $Res Function(TimeUpdateData) _then) = _$TimeUpdateDataCopyWithImpl;
@useResult
$Res call({
 int whiteTime, int blackTime
});




}
/// @nodoc
class _$TimeUpdateDataCopyWithImpl<$Res>
    implements $TimeUpdateDataCopyWith<$Res> {
  _$TimeUpdateDataCopyWithImpl(this._self, this._then);

  final TimeUpdateData _self;
  final $Res Function(TimeUpdateData) _then;

/// Create a copy of TimeUpdateData
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? whiteTime = null,Object? blackTime = null,}) {
  return _then(_self.copyWith(
whiteTime: null == whiteTime ? _self.whiteTime : whiteTime // ignore: cast_nullable_to_non_nullable
as int,blackTime: null == blackTime ? _self.blackTime : blackTime // ignore: cast_nullable_to_non_nullable
as int,
  ));
}

}


/// Adds pattern-matching-related methods to [TimeUpdateData].
extension TimeUpdateDataPatterns on TimeUpdateData {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _TimeUpdateData value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _TimeUpdateData() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _TimeUpdateData value)  $default,){
final _that = this;
switch (_that) {
case _TimeUpdateData():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _TimeUpdateData value)?  $default,){
final _that = this;
switch (_that) {
case _TimeUpdateData() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( int whiteTime,  int blackTime)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _TimeUpdateData() when $default != null:
return $default(_that.whiteTime,_that.blackTime);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( int whiteTime,  int blackTime)  $default,) {final _that = this;
switch (_that) {
case _TimeUpdateData():
return $default(_that.whiteTime,_that.blackTime);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( int whiteTime,  int blackTime)?  $default,) {final _that = this;
switch (_that) {
case _TimeUpdateData() when $default != null:
return $default(_that.whiteTime,_that.blackTime);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _TimeUpdateData implements TimeUpdateData {
  const _TimeUpdateData({required this.whiteTime, required this.blackTime});
  factory _TimeUpdateData.fromJson(Map<String, dynamic> json) => _$TimeUpdateDataFromJson(json);

@override final  int whiteTime;
@override final  int blackTime;

/// Create a copy of TimeUpdateData
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$TimeUpdateDataCopyWith<_TimeUpdateData> get copyWith => __$TimeUpdateDataCopyWithImpl<_TimeUpdateData>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$TimeUpdateDataToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _TimeUpdateData&&(identical(other.whiteTime, whiteTime) || other.whiteTime == whiteTime)&&(identical(other.blackTime, blackTime) || other.blackTime == blackTime));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,whiteTime,blackTime);

@override
String toString() {
  return 'TimeUpdateData(whiteTime: $whiteTime, blackTime: $blackTime)';
}


}

/// @nodoc
abstract mixin class _$TimeUpdateDataCopyWith<$Res> implements $TimeUpdateDataCopyWith<$Res> {
  factory _$TimeUpdateDataCopyWith(_TimeUpdateData value, $Res Function(_TimeUpdateData) _then) = __$TimeUpdateDataCopyWithImpl;
@override @useResult
$Res call({
 int whiteTime, int blackTime
});




}
/// @nodoc
class __$TimeUpdateDataCopyWithImpl<$Res>
    implements _$TimeUpdateDataCopyWith<$Res> {
  __$TimeUpdateDataCopyWithImpl(this._self, this._then);

  final _TimeUpdateData _self;
  final $Res Function(_TimeUpdateData) _then;

/// Create a copy of TimeUpdateData
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? whiteTime = null,Object? blackTime = null,}) {
  return _then(_TimeUpdateData(
whiteTime: null == whiteTime ? _self.whiteTime : whiteTime // ignore: cast_nullable_to_non_nullable
as int,blackTime: null == blackTime ? _self.blackTime : blackTime // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}


/// @nodoc
mixin _$GameEndedData {

 String get result; String get reason; int? get whiteRatingDelta; int? get blackRatingDelta;@JsonKey(name: 'whiteRating') int? get whiteRating;@JsonKey(name: 'blackRating') int? get blackRating; List<AchievementUnlock>? get whiteNewAchievements; List<AchievementUnlock>? get blackNewAchievements;
/// Create a copy of GameEndedData
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$GameEndedDataCopyWith<GameEndedData> get copyWith => _$GameEndedDataCopyWithImpl<GameEndedData>(this as GameEndedData, _$identity);

  /// Serializes this GameEndedData to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is GameEndedData&&(identical(other.result, result) || other.result == result)&&(identical(other.reason, reason) || other.reason == reason)&&(identical(other.whiteRatingDelta, whiteRatingDelta) || other.whiteRatingDelta == whiteRatingDelta)&&(identical(other.blackRatingDelta, blackRatingDelta) || other.blackRatingDelta == blackRatingDelta)&&(identical(other.whiteRating, whiteRating) || other.whiteRating == whiteRating)&&(identical(other.blackRating, blackRating) || other.blackRating == blackRating)&&const DeepCollectionEquality().equals(other.whiteNewAchievements, whiteNewAchievements)&&const DeepCollectionEquality().equals(other.blackNewAchievements, blackNewAchievements));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,result,reason,whiteRatingDelta,blackRatingDelta,whiteRating,blackRating,const DeepCollectionEquality().hash(whiteNewAchievements),const DeepCollectionEquality().hash(blackNewAchievements));

@override
String toString() {
  return 'GameEndedData(result: $result, reason: $reason, whiteRatingDelta: $whiteRatingDelta, blackRatingDelta: $blackRatingDelta, whiteRating: $whiteRating, blackRating: $blackRating, whiteNewAchievements: $whiteNewAchievements, blackNewAchievements: $blackNewAchievements)';
}


}

/// @nodoc
abstract mixin class $GameEndedDataCopyWith<$Res>  {
  factory $GameEndedDataCopyWith(GameEndedData value, $Res Function(GameEndedData) _then) = _$GameEndedDataCopyWithImpl;
@useResult
$Res call({
 String result, String reason, int? whiteRatingDelta, int? blackRatingDelta,@JsonKey(name: 'whiteRating') int? whiteRating,@JsonKey(name: 'blackRating') int? blackRating, List<AchievementUnlock>? whiteNewAchievements, List<AchievementUnlock>? blackNewAchievements
});




}
/// @nodoc
class _$GameEndedDataCopyWithImpl<$Res>
    implements $GameEndedDataCopyWith<$Res> {
  _$GameEndedDataCopyWithImpl(this._self, this._then);

  final GameEndedData _self;
  final $Res Function(GameEndedData) _then;

/// Create a copy of GameEndedData
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? result = null,Object? reason = null,Object? whiteRatingDelta = freezed,Object? blackRatingDelta = freezed,Object? whiteRating = freezed,Object? blackRating = freezed,Object? whiteNewAchievements = freezed,Object? blackNewAchievements = freezed,}) {
  return _then(_self.copyWith(
result: null == result ? _self.result : result // ignore: cast_nullable_to_non_nullable
as String,reason: null == reason ? _self.reason : reason // ignore: cast_nullable_to_non_nullable
as String,whiteRatingDelta: freezed == whiteRatingDelta ? _self.whiteRatingDelta : whiteRatingDelta // ignore: cast_nullable_to_non_nullable
as int?,blackRatingDelta: freezed == blackRatingDelta ? _self.blackRatingDelta : blackRatingDelta // ignore: cast_nullable_to_non_nullable
as int?,whiteRating: freezed == whiteRating ? _self.whiteRating : whiteRating // ignore: cast_nullable_to_non_nullable
as int?,blackRating: freezed == blackRating ? _self.blackRating : blackRating // ignore: cast_nullable_to_non_nullable
as int?,whiteNewAchievements: freezed == whiteNewAchievements ? _self.whiteNewAchievements : whiteNewAchievements // ignore: cast_nullable_to_non_nullable
as List<AchievementUnlock>?,blackNewAchievements: freezed == blackNewAchievements ? _self.blackNewAchievements : blackNewAchievements // ignore: cast_nullable_to_non_nullable
as List<AchievementUnlock>?,
  ));
}

}


/// Adds pattern-matching-related methods to [GameEndedData].
extension GameEndedDataPatterns on GameEndedData {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _GameEndedData value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _GameEndedData() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _GameEndedData value)  $default,){
final _that = this;
switch (_that) {
case _GameEndedData():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _GameEndedData value)?  $default,){
final _that = this;
switch (_that) {
case _GameEndedData() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String result,  String reason,  int? whiteRatingDelta,  int? blackRatingDelta, @JsonKey(name: 'whiteRating')  int? whiteRating, @JsonKey(name: 'blackRating')  int? blackRating,  List<AchievementUnlock>? whiteNewAchievements,  List<AchievementUnlock>? blackNewAchievements)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _GameEndedData() when $default != null:
return $default(_that.result,_that.reason,_that.whiteRatingDelta,_that.blackRatingDelta,_that.whiteRating,_that.blackRating,_that.whiteNewAchievements,_that.blackNewAchievements);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String result,  String reason,  int? whiteRatingDelta,  int? blackRatingDelta, @JsonKey(name: 'whiteRating')  int? whiteRating, @JsonKey(name: 'blackRating')  int? blackRating,  List<AchievementUnlock>? whiteNewAchievements,  List<AchievementUnlock>? blackNewAchievements)  $default,) {final _that = this;
switch (_that) {
case _GameEndedData():
return $default(_that.result,_that.reason,_that.whiteRatingDelta,_that.blackRatingDelta,_that.whiteRating,_that.blackRating,_that.whiteNewAchievements,_that.blackNewAchievements);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String result,  String reason,  int? whiteRatingDelta,  int? blackRatingDelta, @JsonKey(name: 'whiteRating')  int? whiteRating, @JsonKey(name: 'blackRating')  int? blackRating,  List<AchievementUnlock>? whiteNewAchievements,  List<AchievementUnlock>? blackNewAchievements)?  $default,) {final _that = this;
switch (_that) {
case _GameEndedData() when $default != null:
return $default(_that.result,_that.reason,_that.whiteRatingDelta,_that.blackRatingDelta,_that.whiteRating,_that.blackRating,_that.whiteNewAchievements,_that.blackNewAchievements);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _GameEndedData implements GameEndedData {
  const _GameEndedData({required this.result, required this.reason, this.whiteRatingDelta, this.blackRatingDelta, @JsonKey(name: 'whiteRating') this.whiteRating, @JsonKey(name: 'blackRating') this.blackRating, final  List<AchievementUnlock>? whiteNewAchievements, final  List<AchievementUnlock>? blackNewAchievements}): _whiteNewAchievements = whiteNewAchievements,_blackNewAchievements = blackNewAchievements;
  factory _GameEndedData.fromJson(Map<String, dynamic> json) => _$GameEndedDataFromJson(json);

@override final  String result;
@override final  String reason;
@override final  int? whiteRatingDelta;
@override final  int? blackRatingDelta;
@override@JsonKey(name: 'whiteRating') final  int? whiteRating;
@override@JsonKey(name: 'blackRating') final  int? blackRating;
 final  List<AchievementUnlock>? _whiteNewAchievements;
@override List<AchievementUnlock>? get whiteNewAchievements {
  final value = _whiteNewAchievements;
  if (value == null) return null;
  if (_whiteNewAchievements is EqualUnmodifiableListView) return _whiteNewAchievements;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(value);
}

 final  List<AchievementUnlock>? _blackNewAchievements;
@override List<AchievementUnlock>? get blackNewAchievements {
  final value = _blackNewAchievements;
  if (value == null) return null;
  if (_blackNewAchievements is EqualUnmodifiableListView) return _blackNewAchievements;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(value);
}


/// Create a copy of GameEndedData
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$GameEndedDataCopyWith<_GameEndedData> get copyWith => __$GameEndedDataCopyWithImpl<_GameEndedData>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$GameEndedDataToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _GameEndedData&&(identical(other.result, result) || other.result == result)&&(identical(other.reason, reason) || other.reason == reason)&&(identical(other.whiteRatingDelta, whiteRatingDelta) || other.whiteRatingDelta == whiteRatingDelta)&&(identical(other.blackRatingDelta, blackRatingDelta) || other.blackRatingDelta == blackRatingDelta)&&(identical(other.whiteRating, whiteRating) || other.whiteRating == whiteRating)&&(identical(other.blackRating, blackRating) || other.blackRating == blackRating)&&const DeepCollectionEquality().equals(other._whiteNewAchievements, _whiteNewAchievements)&&const DeepCollectionEquality().equals(other._blackNewAchievements, _blackNewAchievements));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,result,reason,whiteRatingDelta,blackRatingDelta,whiteRating,blackRating,const DeepCollectionEquality().hash(_whiteNewAchievements),const DeepCollectionEquality().hash(_blackNewAchievements));

@override
String toString() {
  return 'GameEndedData(result: $result, reason: $reason, whiteRatingDelta: $whiteRatingDelta, blackRatingDelta: $blackRatingDelta, whiteRating: $whiteRating, blackRating: $blackRating, whiteNewAchievements: $whiteNewAchievements, blackNewAchievements: $blackNewAchievements)';
}


}

/// @nodoc
abstract mixin class _$GameEndedDataCopyWith<$Res> implements $GameEndedDataCopyWith<$Res> {
  factory _$GameEndedDataCopyWith(_GameEndedData value, $Res Function(_GameEndedData) _then) = __$GameEndedDataCopyWithImpl;
@override @useResult
$Res call({
 String result, String reason, int? whiteRatingDelta, int? blackRatingDelta,@JsonKey(name: 'whiteRating') int? whiteRating,@JsonKey(name: 'blackRating') int? blackRating, List<AchievementUnlock>? whiteNewAchievements, List<AchievementUnlock>? blackNewAchievements
});




}
/// @nodoc
class __$GameEndedDataCopyWithImpl<$Res>
    implements _$GameEndedDataCopyWith<$Res> {
  __$GameEndedDataCopyWithImpl(this._self, this._then);

  final _GameEndedData _self;
  final $Res Function(_GameEndedData) _then;

/// Create a copy of GameEndedData
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? result = null,Object? reason = null,Object? whiteRatingDelta = freezed,Object? blackRatingDelta = freezed,Object? whiteRating = freezed,Object? blackRating = freezed,Object? whiteNewAchievements = freezed,Object? blackNewAchievements = freezed,}) {
  return _then(_GameEndedData(
result: null == result ? _self.result : result // ignore: cast_nullable_to_non_nullable
as String,reason: null == reason ? _self.reason : reason // ignore: cast_nullable_to_non_nullable
as String,whiteRatingDelta: freezed == whiteRatingDelta ? _self.whiteRatingDelta : whiteRatingDelta // ignore: cast_nullable_to_non_nullable
as int?,blackRatingDelta: freezed == blackRatingDelta ? _self.blackRatingDelta : blackRatingDelta // ignore: cast_nullable_to_non_nullable
as int?,whiteRating: freezed == whiteRating ? _self.whiteRating : whiteRating // ignore: cast_nullable_to_non_nullable
as int?,blackRating: freezed == blackRating ? _self.blackRating : blackRating // ignore: cast_nullable_to_non_nullable
as int?,whiteNewAchievements: freezed == whiteNewAchievements ? _self._whiteNewAchievements : whiteNewAchievements // ignore: cast_nullable_to_non_nullable
as List<AchievementUnlock>?,blackNewAchievements: freezed == blackNewAchievements ? _self._blackNewAchievements : blackNewAchievements // ignore: cast_nullable_to_non_nullable
as List<AchievementUnlock>?,
  ));
}


}


/// @nodoc
mixin _$GameReconnectedData {

 String get gameId; String get color; String get fen; List<String> get moveHistory;@JsonKey(name: 'whiteTimeMs') int get whiteTimeMs;@JsonKey(name: 'blackTimeMs') int get blackTimeMs; PlayerInfo get opponent; bool get rated;
/// Create a copy of GameReconnectedData
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$GameReconnectedDataCopyWith<GameReconnectedData> get copyWith => _$GameReconnectedDataCopyWithImpl<GameReconnectedData>(this as GameReconnectedData, _$identity);

  /// Serializes this GameReconnectedData to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is GameReconnectedData&&(identical(other.gameId, gameId) || other.gameId == gameId)&&(identical(other.color, color) || other.color == color)&&(identical(other.fen, fen) || other.fen == fen)&&const DeepCollectionEquality().equals(other.moveHistory, moveHistory)&&(identical(other.whiteTimeMs, whiteTimeMs) || other.whiteTimeMs == whiteTimeMs)&&(identical(other.blackTimeMs, blackTimeMs) || other.blackTimeMs == blackTimeMs)&&(identical(other.opponent, opponent) || other.opponent == opponent)&&(identical(other.rated, rated) || other.rated == rated));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,gameId,color,fen,const DeepCollectionEquality().hash(moveHistory),whiteTimeMs,blackTimeMs,opponent,rated);

@override
String toString() {
  return 'GameReconnectedData(gameId: $gameId, color: $color, fen: $fen, moveHistory: $moveHistory, whiteTimeMs: $whiteTimeMs, blackTimeMs: $blackTimeMs, opponent: $opponent, rated: $rated)';
}


}

/// @nodoc
abstract mixin class $GameReconnectedDataCopyWith<$Res>  {
  factory $GameReconnectedDataCopyWith(GameReconnectedData value, $Res Function(GameReconnectedData) _then) = _$GameReconnectedDataCopyWithImpl;
@useResult
$Res call({
 String gameId, String color, String fen, List<String> moveHistory,@JsonKey(name: 'whiteTimeMs') int whiteTimeMs,@JsonKey(name: 'blackTimeMs') int blackTimeMs, PlayerInfo opponent, bool rated
});


$PlayerInfoCopyWith<$Res> get opponent;

}
/// @nodoc
class _$GameReconnectedDataCopyWithImpl<$Res>
    implements $GameReconnectedDataCopyWith<$Res> {
  _$GameReconnectedDataCopyWithImpl(this._self, this._then);

  final GameReconnectedData _self;
  final $Res Function(GameReconnectedData) _then;

/// Create a copy of GameReconnectedData
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? gameId = null,Object? color = null,Object? fen = null,Object? moveHistory = null,Object? whiteTimeMs = null,Object? blackTimeMs = null,Object? opponent = null,Object? rated = null,}) {
  return _then(_self.copyWith(
gameId: null == gameId ? _self.gameId : gameId // ignore: cast_nullable_to_non_nullable
as String,color: null == color ? _self.color : color // ignore: cast_nullable_to_non_nullable
as String,fen: null == fen ? _self.fen : fen // ignore: cast_nullable_to_non_nullable
as String,moveHistory: null == moveHistory ? _self.moveHistory : moveHistory // ignore: cast_nullable_to_non_nullable
as List<String>,whiteTimeMs: null == whiteTimeMs ? _self.whiteTimeMs : whiteTimeMs // ignore: cast_nullable_to_non_nullable
as int,blackTimeMs: null == blackTimeMs ? _self.blackTimeMs : blackTimeMs // ignore: cast_nullable_to_non_nullable
as int,opponent: null == opponent ? _self.opponent : opponent // ignore: cast_nullable_to_non_nullable
as PlayerInfo,rated: null == rated ? _self.rated : rated // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}
/// Create a copy of GameReconnectedData
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$PlayerInfoCopyWith<$Res> get opponent {
  
  return $PlayerInfoCopyWith<$Res>(_self.opponent, (value) {
    return _then(_self.copyWith(opponent: value));
  });
}
}


/// Adds pattern-matching-related methods to [GameReconnectedData].
extension GameReconnectedDataPatterns on GameReconnectedData {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _GameReconnectedData value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _GameReconnectedData() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _GameReconnectedData value)  $default,){
final _that = this;
switch (_that) {
case _GameReconnectedData():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _GameReconnectedData value)?  $default,){
final _that = this;
switch (_that) {
case _GameReconnectedData() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String gameId,  String color,  String fen,  List<String> moveHistory, @JsonKey(name: 'whiteTimeMs')  int whiteTimeMs, @JsonKey(name: 'blackTimeMs')  int blackTimeMs,  PlayerInfo opponent,  bool rated)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _GameReconnectedData() when $default != null:
return $default(_that.gameId,_that.color,_that.fen,_that.moveHistory,_that.whiteTimeMs,_that.blackTimeMs,_that.opponent,_that.rated);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String gameId,  String color,  String fen,  List<String> moveHistory, @JsonKey(name: 'whiteTimeMs')  int whiteTimeMs, @JsonKey(name: 'blackTimeMs')  int blackTimeMs,  PlayerInfo opponent,  bool rated)  $default,) {final _that = this;
switch (_that) {
case _GameReconnectedData():
return $default(_that.gameId,_that.color,_that.fen,_that.moveHistory,_that.whiteTimeMs,_that.blackTimeMs,_that.opponent,_that.rated);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String gameId,  String color,  String fen,  List<String> moveHistory, @JsonKey(name: 'whiteTimeMs')  int whiteTimeMs, @JsonKey(name: 'blackTimeMs')  int blackTimeMs,  PlayerInfo opponent,  bool rated)?  $default,) {final _that = this;
switch (_that) {
case _GameReconnectedData() when $default != null:
return $default(_that.gameId,_that.color,_that.fen,_that.moveHistory,_that.whiteTimeMs,_that.blackTimeMs,_that.opponent,_that.rated);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _GameReconnectedData implements GameReconnectedData {
  const _GameReconnectedData({required this.gameId, required this.color, required this.fen, required final  List<String> moveHistory, @JsonKey(name: 'whiteTimeMs') required this.whiteTimeMs, @JsonKey(name: 'blackTimeMs') required this.blackTimeMs, required this.opponent, required this.rated}): _moveHistory = moveHistory;
  factory _GameReconnectedData.fromJson(Map<String, dynamic> json) => _$GameReconnectedDataFromJson(json);

@override final  String gameId;
@override final  String color;
@override final  String fen;
 final  List<String> _moveHistory;
@override List<String> get moveHistory {
  if (_moveHistory is EqualUnmodifiableListView) return _moveHistory;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_moveHistory);
}

@override@JsonKey(name: 'whiteTimeMs') final  int whiteTimeMs;
@override@JsonKey(name: 'blackTimeMs') final  int blackTimeMs;
@override final  PlayerInfo opponent;
@override final  bool rated;

/// Create a copy of GameReconnectedData
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$GameReconnectedDataCopyWith<_GameReconnectedData> get copyWith => __$GameReconnectedDataCopyWithImpl<_GameReconnectedData>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$GameReconnectedDataToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _GameReconnectedData&&(identical(other.gameId, gameId) || other.gameId == gameId)&&(identical(other.color, color) || other.color == color)&&(identical(other.fen, fen) || other.fen == fen)&&const DeepCollectionEquality().equals(other._moveHistory, _moveHistory)&&(identical(other.whiteTimeMs, whiteTimeMs) || other.whiteTimeMs == whiteTimeMs)&&(identical(other.blackTimeMs, blackTimeMs) || other.blackTimeMs == blackTimeMs)&&(identical(other.opponent, opponent) || other.opponent == opponent)&&(identical(other.rated, rated) || other.rated == rated));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,gameId,color,fen,const DeepCollectionEquality().hash(_moveHistory),whiteTimeMs,blackTimeMs,opponent,rated);

@override
String toString() {
  return 'GameReconnectedData(gameId: $gameId, color: $color, fen: $fen, moveHistory: $moveHistory, whiteTimeMs: $whiteTimeMs, blackTimeMs: $blackTimeMs, opponent: $opponent, rated: $rated)';
}


}

/// @nodoc
abstract mixin class _$GameReconnectedDataCopyWith<$Res> implements $GameReconnectedDataCopyWith<$Res> {
  factory _$GameReconnectedDataCopyWith(_GameReconnectedData value, $Res Function(_GameReconnectedData) _then) = __$GameReconnectedDataCopyWithImpl;
@override @useResult
$Res call({
 String gameId, String color, String fen, List<String> moveHistory,@JsonKey(name: 'whiteTimeMs') int whiteTimeMs,@JsonKey(name: 'blackTimeMs') int blackTimeMs, PlayerInfo opponent, bool rated
});


@override $PlayerInfoCopyWith<$Res> get opponent;

}
/// @nodoc
class __$GameReconnectedDataCopyWithImpl<$Res>
    implements _$GameReconnectedDataCopyWith<$Res> {
  __$GameReconnectedDataCopyWithImpl(this._self, this._then);

  final _GameReconnectedData _self;
  final $Res Function(_GameReconnectedData) _then;

/// Create a copy of GameReconnectedData
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? gameId = null,Object? color = null,Object? fen = null,Object? moveHistory = null,Object? whiteTimeMs = null,Object? blackTimeMs = null,Object? opponent = null,Object? rated = null,}) {
  return _then(_GameReconnectedData(
gameId: null == gameId ? _self.gameId : gameId // ignore: cast_nullable_to_non_nullable
as String,color: null == color ? _self.color : color // ignore: cast_nullable_to_non_nullable
as String,fen: null == fen ? _self.fen : fen // ignore: cast_nullable_to_non_nullable
as String,moveHistory: null == moveHistory ? _self._moveHistory : moveHistory // ignore: cast_nullable_to_non_nullable
as List<String>,whiteTimeMs: null == whiteTimeMs ? _self.whiteTimeMs : whiteTimeMs // ignore: cast_nullable_to_non_nullable
as int,blackTimeMs: null == blackTimeMs ? _self.blackTimeMs : blackTimeMs // ignore: cast_nullable_to_non_nullable
as int,opponent: null == opponent ? _self.opponent : opponent // ignore: cast_nullable_to_non_nullable
as PlayerInfo,rated: null == rated ? _self.rated : rated // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

/// Create a copy of GameReconnectedData
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$PlayerInfoCopyWith<$Res> get opponent {
  
  return $PlayerInfoCopyWith<$Res>(_self.opponent, (value) {
    return _then(_self.copyWith(opponent: value));
  });
}
}


/// @nodoc
mixin _$LobbyGame {

 String get gameId; String get creator; int get creatorRating; TimeControlData? get timeControl; bool get rated; int get createdAt;
/// Create a copy of LobbyGame
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$LobbyGameCopyWith<LobbyGame> get copyWith => _$LobbyGameCopyWithImpl<LobbyGame>(this as LobbyGame, _$identity);

  /// Serializes this LobbyGame to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is LobbyGame&&(identical(other.gameId, gameId) || other.gameId == gameId)&&(identical(other.creator, creator) || other.creator == creator)&&(identical(other.creatorRating, creatorRating) || other.creatorRating == creatorRating)&&(identical(other.timeControl, timeControl) || other.timeControl == timeControl)&&(identical(other.rated, rated) || other.rated == rated)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,gameId,creator,creatorRating,timeControl,rated,createdAt);

@override
String toString() {
  return 'LobbyGame(gameId: $gameId, creator: $creator, creatorRating: $creatorRating, timeControl: $timeControl, rated: $rated, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class $LobbyGameCopyWith<$Res>  {
  factory $LobbyGameCopyWith(LobbyGame value, $Res Function(LobbyGame) _then) = _$LobbyGameCopyWithImpl;
@useResult
$Res call({
 String gameId, String creator, int creatorRating, TimeControlData? timeControl, bool rated, int createdAt
});


$TimeControlDataCopyWith<$Res>? get timeControl;

}
/// @nodoc
class _$LobbyGameCopyWithImpl<$Res>
    implements $LobbyGameCopyWith<$Res> {
  _$LobbyGameCopyWithImpl(this._self, this._then);

  final LobbyGame _self;
  final $Res Function(LobbyGame) _then;

/// Create a copy of LobbyGame
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? gameId = null,Object? creator = null,Object? creatorRating = null,Object? timeControl = freezed,Object? rated = null,Object? createdAt = null,}) {
  return _then(_self.copyWith(
gameId: null == gameId ? _self.gameId : gameId // ignore: cast_nullable_to_non_nullable
as String,creator: null == creator ? _self.creator : creator // ignore: cast_nullable_to_non_nullable
as String,creatorRating: null == creatorRating ? _self.creatorRating : creatorRating // ignore: cast_nullable_to_non_nullable
as int,timeControl: freezed == timeControl ? _self.timeControl : timeControl // ignore: cast_nullable_to_non_nullable
as TimeControlData?,rated: null == rated ? _self.rated : rated // ignore: cast_nullable_to_non_nullable
as bool,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as int,
  ));
}
/// Create a copy of LobbyGame
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$TimeControlDataCopyWith<$Res>? get timeControl {
    if (_self.timeControl == null) {
    return null;
  }

  return $TimeControlDataCopyWith<$Res>(_self.timeControl!, (value) {
    return _then(_self.copyWith(timeControl: value));
  });
}
}


/// Adds pattern-matching-related methods to [LobbyGame].
extension LobbyGamePatterns on LobbyGame {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _LobbyGame value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _LobbyGame() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _LobbyGame value)  $default,){
final _that = this;
switch (_that) {
case _LobbyGame():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _LobbyGame value)?  $default,){
final _that = this;
switch (_that) {
case _LobbyGame() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String gameId,  String creator,  int creatorRating,  TimeControlData? timeControl,  bool rated,  int createdAt)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _LobbyGame() when $default != null:
return $default(_that.gameId,_that.creator,_that.creatorRating,_that.timeControl,_that.rated,_that.createdAt);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String gameId,  String creator,  int creatorRating,  TimeControlData? timeControl,  bool rated,  int createdAt)  $default,) {final _that = this;
switch (_that) {
case _LobbyGame():
return $default(_that.gameId,_that.creator,_that.creatorRating,_that.timeControl,_that.rated,_that.createdAt);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String gameId,  String creator,  int creatorRating,  TimeControlData? timeControl,  bool rated,  int createdAt)?  $default,) {final _that = this;
switch (_that) {
case _LobbyGame() when $default != null:
return $default(_that.gameId,_that.creator,_that.creatorRating,_that.timeControl,_that.rated,_that.createdAt);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _LobbyGame implements LobbyGame {
  const _LobbyGame({required this.gameId, required this.creator, this.creatorRating = 1200, this.timeControl, this.rated = false, required this.createdAt});
  factory _LobbyGame.fromJson(Map<String, dynamic> json) => _$LobbyGameFromJson(json);

@override final  String gameId;
@override final  String creator;
@override@JsonKey() final  int creatorRating;
@override final  TimeControlData? timeControl;
@override@JsonKey() final  bool rated;
@override final  int createdAt;

/// Create a copy of LobbyGame
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$LobbyGameCopyWith<_LobbyGame> get copyWith => __$LobbyGameCopyWithImpl<_LobbyGame>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$LobbyGameToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _LobbyGame&&(identical(other.gameId, gameId) || other.gameId == gameId)&&(identical(other.creator, creator) || other.creator == creator)&&(identical(other.creatorRating, creatorRating) || other.creatorRating == creatorRating)&&(identical(other.timeControl, timeControl) || other.timeControl == timeControl)&&(identical(other.rated, rated) || other.rated == rated)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,gameId,creator,creatorRating,timeControl,rated,createdAt);

@override
String toString() {
  return 'LobbyGame(gameId: $gameId, creator: $creator, creatorRating: $creatorRating, timeControl: $timeControl, rated: $rated, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class _$LobbyGameCopyWith<$Res> implements $LobbyGameCopyWith<$Res> {
  factory _$LobbyGameCopyWith(_LobbyGame value, $Res Function(_LobbyGame) _then) = __$LobbyGameCopyWithImpl;
@override @useResult
$Res call({
 String gameId, String creator, int creatorRating, TimeControlData? timeControl, bool rated, int createdAt
});


@override $TimeControlDataCopyWith<$Res>? get timeControl;

}
/// @nodoc
class __$LobbyGameCopyWithImpl<$Res>
    implements _$LobbyGameCopyWith<$Res> {
  __$LobbyGameCopyWithImpl(this._self, this._then);

  final _LobbyGame _self;
  final $Res Function(_LobbyGame) _then;

/// Create a copy of LobbyGame
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? gameId = null,Object? creator = null,Object? creatorRating = null,Object? timeControl = freezed,Object? rated = null,Object? createdAt = null,}) {
  return _then(_LobbyGame(
gameId: null == gameId ? _self.gameId : gameId // ignore: cast_nullable_to_non_nullable
as String,creator: null == creator ? _self.creator : creator // ignore: cast_nullable_to_non_nullable
as String,creatorRating: null == creatorRating ? _self.creatorRating : creatorRating // ignore: cast_nullable_to_non_nullable
as int,timeControl: freezed == timeControl ? _self.timeControl : timeControl // ignore: cast_nullable_to_non_nullable
as TimeControlData?,rated: null == rated ? _self.rated : rated // ignore: cast_nullable_to_non_nullable
as bool,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as int,
  ));
}

/// Create a copy of LobbyGame
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$TimeControlDataCopyWith<$Res>? get timeControl {
    if (_self.timeControl == null) {
    return null;
  }

  return $TimeControlDataCopyWith<$Res>(_self.timeControl!, (value) {
    return _then(_self.copyWith(timeControl: value));
  });
}
}

// dart format on
