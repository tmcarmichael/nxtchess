import 'achievement.dart';
import 'game_types.dart';
import 'sync_types.dart';

sealed class MultiplayerEvent {}

class GameCreatedEvent extends MultiplayerEvent {
  final String gameId;
  final Side playerColor;
  GameCreatedEvent({required this.gameId, required this.playerColor});
}

class GameJoinedEvent extends MultiplayerEvent {
  final String gameId;
  final Side playerColor;
  final String? opponent;
  GameJoinedEvent({
    required this.gameId,
    required this.playerColor,
    this.opponent,
  });
}

class GameStartedEvent extends MultiplayerEvent {
  final String gameId;
  final String? opponent;
  final int whiteTime;
  final int blackTime;
  GameStartedEvent({
    required this.gameId,
    this.opponent,
    required this.whiteTime,
    required this.blackTime,
  });
}

class MoveAcceptedEvent extends MultiplayerEvent {
  final MoveAcceptedData data;
  MoveAcceptedEvent(this.data);
}

class MoveRejectedEvent extends MultiplayerEvent {
  final MoveRejectedData data;
  MoveRejectedEvent(this.data);
}

class OpponentMoveEvent extends MultiplayerEvent {
  final OpponentMoveData data;
  OpponentMoveEvent(this.data);
}

class TimeUpdateEvent extends MultiplayerEvent {
  final TimeUpdateData data;
  TimeUpdateEvent(this.data);
}

class GameEndedEvent extends MultiplayerEvent {
  final GameWinner? winner;
  final GameOverReason? reason;
  final int? whiteRatingDelta;
  final int? blackRatingDelta;
  final int? whiteRating;
  final int? blackRating;
  final List<AchievementUnlock>? whiteNewAchievements;
  final List<AchievementUnlock>? blackNewAchievements;
  GameEndedEvent({
    this.winner,
    this.reason,
    this.whiteRatingDelta,
    this.blackRatingDelta,
    this.whiteRating,
    this.blackRating,
    this.whiteNewAchievements,
    this.blackNewAchievements,
  });
}

class GameReconnectedEvent extends MultiplayerEvent {
  final String gameId;
  final Side playerColor;
  final String fen;
  final List<String> uciMoveHistory;
  final int whiteTime;
  final int blackTime;
  final String? opponent;
  final bool rated;
  GameReconnectedEvent({
    required this.gameId,
    required this.playerColor,
    required this.fen,
    required this.uciMoveHistory,
    required this.whiteTime,
    required this.blackTime,
    this.opponent,
    required this.rated,
  });
}

class OpponentDisconnectedEvent extends MultiplayerEvent {}

class OpponentReconnectedEvent extends MultiplayerEvent {}

class GameErrorEvent extends MultiplayerEvent {
  final String message;
  GameErrorEvent(this.message);
}
