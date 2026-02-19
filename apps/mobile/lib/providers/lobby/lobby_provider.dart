import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/sync_types.dart';
import '../../services/sync/game_sync_service.dart'
    show GameSyncService, gameSyncServiceProvider;
import 'lobby_state.dart';

export 'lobby_state.dart';

class LobbyNotifier extends Notifier<LobbyState> {
  void Function()? _unsubscribeEvents;
  Timer? _loadingTimeout;

  GameSyncService get _sync => ref.read(gameSyncServiceProvider);

  @override
  LobbyState build() {
    ref.onDispose(() {
      _unsubscribeEvents?.call();
      _loadingTimeout?.cancel();
    });
    return const LobbyState();
  }

  void subscribe() {
    if (state.isSubscribed) return;

    unawaited(_sync.connect());
    state = state.copyWith(isSubscribed: true, isLoading: true);

    _unsubscribeEvents ??= _sync.onEvent(_handleEvent);

    _sync.subscribeLobby();

    _loadingTimeout?.cancel();
    _loadingTimeout = Timer(const Duration(seconds: 5), () {
      if (state.isLoading) {
        state = state.copyWith(isLoading: false);
      }
    });
  }

  void unsubscribe() {
    if (!state.isSubscribed) return;

    _loadingTimeout?.cancel();
    _sync.unsubscribeLobby();

    _unsubscribeEvents?.call();
    _unsubscribeEvents = null;

    state = const LobbyState();
  }

  void _handleEvent(String type, Map<String, dynamic>? data) {
    switch (type) {
      case 'lobby:list':
        _loadingTimeout?.cancel();
        final games =
            (data?['games'] as List<dynamic>?)
                ?.map((g) => LobbyGame.fromJson(g as Map<String, dynamic>))
                .toList() ??
            [];
        state = state.copyWith(games: games, isLoading: false);

      case 'lobby:update':
        final action = data?['action'] as String?;
        if (action == 'added' && data?['game'] != null) {
          final newGame = LobbyGame.fromJson(
            data!['game'] as Map<String, dynamic>,
          );
          state = state.copyWith(games: [...state.games, newGame]);
        } else if (action == 'removed' && data?['gameId'] != null) {
          final removedId = data!['gameId'] as String;
          state = state.copyWith(
            games: state.games.where((g) => g.gameId != removedId).toList(),
          );
        }
    }
  }
}

final lobbyProvider = NotifierProvider<LobbyNotifier, LobbyState>(
  LobbyNotifier.new,
);
