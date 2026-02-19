import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/time_controls.dart';
import '../../models/game_types.dart';
import '../../models/sync_types.dart';
import '../../providers/lobby/lobby_provider.dart';
import '../../theme/app_colors.dart';
import 'play_ai_sheet.dart';
import 'play_create_game_sheet.dart';

class PlayHub extends ConsumerStatefulWidget {
  final void Function(String gameId) onJoinGame;
  final void Function({
    required int timeControlMinutes,
    required int incrementSeconds,
    required bool rated,
  })
  onCreateGame;
  final void Function({
    required int difficulty,
    required int timeControlMinutes,
    required int incrementSeconds,
    required Side playerColor,
  })
  onStartAI;

  const PlayHub({
    super.key,
    required this.onJoinGame,
    required this.onCreateGame,
    required this.onStartAI,
  });

  @override
  ConsumerState<PlayHub> createState() => _PlayHubState();
}

class _PlayHubState extends ConsumerState<PlayHub> {
  final _joinController = TextEditingController();
  String? _joinError;
  LobbyNotifier? _lobbyNotifier;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _lobbyNotifier = ref.read(lobbyProvider.notifier);
      _lobbyNotifier?.subscribe();
    });
  }

  @override
  void dispose() {
    _lobbyNotifier?.unsubscribe();
    _joinController.dispose();
    super.dispose();
  }

  void _handleJoinByLink() {
    final input = _joinController.text.trim();
    if (input.isEmpty) {
      setState(() => _joinError = 'Please enter a game link or ID');
      return;
    }
    final gameId = input.contains('/play/')
        ? input.split('/play/').last
        : input;
    if (gameId.isEmpty) {
      setState(() => _joinError = 'Invalid game link');
      return;
    }
    widget.onJoinGame(gameId);
  }

  @override
  Widget build(BuildContext context) {
    final lobbyState = ref.watch(lobbyProvider);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: _ActionCard(
                  icon: Icons.smart_toy,
                  label: 'vs Computer',
                  onTap: () => _showAISheet(context),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _ActionCard(
                  icon: Icons.add,
                  label: 'Create Game',
                  onTap: () => _showCreateSheet(context),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _joinController,
                  style: const TextStyle(color: AppColors.textPrimary),
                  decoration: InputDecoration(
                    hintText: 'Paste game link or ID',
                    hintStyle: const TextStyle(color: AppColors.textMuted),
                    filled: true,
                    fillColor: AppColors.surfaceCard,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide.none,
                    ),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 12,
                    ),
                  ),
                  onChanged: (_) => setState(() => _joinError = null),
                  onSubmitted: (_) => _handleJoinByLink(),
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton(
                onPressed: _handleJoinByLink,
                child: const Text('Join'),
              ),
            ],
          ),
          if (_joinError != null)
            Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Text(
                _joinError!,
                style: const TextStyle(color: AppColors.error, fontSize: 12),
              ),
            ),
          const SizedBox(height: 24),

          const Text(
            'Open Games',
            style: TextStyle(
              color: AppColors.textPrimary,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),

          if (lobbyState.isLoading)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: CircularProgressIndicator(color: AppColors.primary),
              ),
            )
          else if (lobbyState.games.isEmpty)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: Text(
                  'No open games. Create one!',
                  style: TextStyle(color: AppColors.textMuted),
                ),
              ),
            )
          else
            ...lobbyState.games.map(
              (game) => _LobbyGameTile(
                game: game,
                onJoin: () => widget.onJoinGame(game.gameId),
              ),
            ),
        ],
      ),
    );
  }

  void _showAISheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => PlayAISheet(
        onStart:
            ({
              required playerColor,
              required difficulty,
              required timeControlMinutes,
              required incrementSeconds,
            }) {
              widget.onStartAI(
                difficulty: difficulty,
                timeControlMinutes: timeControlMinutes,
                incrementSeconds: incrementSeconds,
                playerColor: playerColor,
              );
            },
      ),
    );
  }

  void _showCreateSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => PlayCreateGameSheet(
        onCreate:
            ({
              required timeControlMinutes,
              required incrementSeconds,
              required rated,
            }) {
              widget.onCreateGame(
                timeControlMinutes: timeControlMinutes,
                incrementSeconds: incrementSeconds,
                rated: rated,
              );
            },
      ),
    );
  }
}

class _ActionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _ActionCard({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: label,
      child: Material(
        color: AppColors.surfaceCard,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 24),
            child: Column(
              children: [
                Icon(icon, size: 36, color: AppColors.primary),
                const SizedBox(height: 8),
                Text(
                  label,
                  style: const TextStyle(
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _LobbyGameTile extends StatelessWidget {
  final LobbyGame game;
  final VoidCallback onJoin;

  const _LobbyGameTile({required this.game, required this.onJoin});

  @override
  Widget build(BuildContext context) {
    final minutes = (game.timeControl?.initialTime ?? 600) ~/ 60;
    final increment = game.timeControl?.increment ?? 0;
    final tc = '$minutes+$increment';
    final category = getTimeControlCategory(minutes, increment);

    return Semantics(
      button: true,
      label:
          'Join ${game.creator} rated ${game.creatorRating}, $tc $category, ${game.rated ? 'rated' : 'casual'}',
      child: Padding(
        padding: const EdgeInsets.only(bottom: 4),
        child: Material(
          color: AppColors.surfaceCard,
          borderRadius: BorderRadius.circular(8),
          child: InkWell(
            onTap: onJoin,
            borderRadius: BorderRadius.circular(8),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      game.creator,
                      style: const TextStyle(
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  Text(
                    '(${game.creatorRating})',
                    style: const TextStyle(
                      color: AppColors.textMuted,
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    tc,
                    style: const TextStyle(
                      color: AppColors.textSecondary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    category,
                    style: const TextStyle(
                      color: AppColors.textMuted,
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 6,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: game.rated
                          ? AppColors.primary.withValues(alpha: 0.2)
                          : AppColors.surfaceCard,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      game.rated ? 'Rated' : 'Casual',
                      style: TextStyle(
                        color: game.rated
                            ? AppColors.primary
                            : AppColors.textMuted,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
