import 'dart:math';

import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../models/achievement.dart';
import '../../models/user.dart';
import '../../services/api/api_client.dart';
import '../../theme/app_colors.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  final String username;

  const ProfileScreen({super.key, required this.username});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  PublicProfile? _profile;
  List<RecentGame> _recentGames = [];
  List<RatingPoint> _gameRatingHistory = [];
  List<RatingPoint> _puzzleRatingHistory = [];
  List<Achievement> _allAchievements = [];
  AchievementsResponse? _achievementsData;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    setState(() => _isLoading = true);
    try {
      final api = ref.read(apiClientProvider);
      final username = widget.username;

      final profileRes = await api.get('/api/profile/$username');
      if (!mounted) return;
      if (profileRes.statusCode == 200) {
        _profile = PublicProfile.fromJson(
          profileRes.data as Map<String, dynamic>,
        );
      } else {
        setState(() {
          _isLoading = false;
          _error = 'Failed to load profile';
        });
        return;
      }

      await Future.wait([
        _fetchRecentGames(api, username),
        _fetchRatingHistory(api, username),
        _fetchAchievements(api, username),
        _fetchCatalog(api),
      ]);
      if (!mounted) return;

      setState(() => _isLoading = false);
    } catch (e) {
      if (kDebugMode) debugPrint('ProfileScreen load error: $e');
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _error = 'Failed to load profile';
      });
    }
  }

  Future<void> _fetchRecentGames(ApiClient api, String username) async {
    try {
      final res = await api.get('/api/profile/$username/recent-games');
      if (res.statusCode == 200) {
        final data = res.data as Map<String, dynamic>;
        final list = data['games'] as List<dynamic>? ?? [];
        _recentGames = list
            .map((e) => RecentGame.fromJson(e as Map<String, dynamic>))
            .toList();
      }
    } catch (e) {
      if (kDebugMode) debugPrint('ProfileScreen recent games error: $e');
    }
  }

  Future<void> _fetchRatingHistory(ApiClient api, String username) async {
    try {
      final res = await api.get('/api/profile/$username/rating-history');
      if (res.statusCode == 200) {
        final data = res.data as Map<String, dynamic>;
        final gameList = data['game_history'] as List<dynamic>? ?? [];
        _gameRatingHistory = gameList
            .map((e) => RatingPoint.fromJson(e as Map<String, dynamic>))
            .toList();
        final puzzleList = data['puzzle_history'] as List<dynamic>? ?? [];
        _puzzleRatingHistory = puzzleList
            .map((e) => RatingPoint.fromJson(e as Map<String, dynamic>))
            .toList();
      }
    } catch (e) {
      if (kDebugMode) debugPrint('ProfileScreen rating history error: $e');
    }
  }

  Future<void> _fetchAchievements(ApiClient api, String username) async {
    try {
      final res = await api.get('/api/profile/$username/achievements');
      if (res.statusCode == 200) {
        _achievementsData = AchievementsResponse.fromJson(
          res.data as Map<String, dynamic>,
        );
      }
    } catch (e) {
      if (kDebugMode) debugPrint('ProfileScreen achievements error: $e');
    }
  }

  Future<void> _fetchCatalog(ApiClient api) async {
    try {
      final res = await api.get('/api/achievements');
      if (res.statusCode == 200) {
        final data = res.data as Map<String, dynamic>;
        final list = data['achievements'] as List<dynamic>? ?? [];
        _allAchievements = list
            .map((e) => Achievement.fromJson(e as Map<String, dynamic>))
            .toList();
      }
    } catch (e) {
      if (kDebugMode) debugPrint('ProfileScreen catalog error: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.username)),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            )
          : _error != null
          ? Center(
              child: Text(
                _error!,
                style: const TextStyle(color: AppColors.error),
              ),
            )
          : _buildContent(),
    );
  }

  Widget _buildContent() {
    final profile = _profile;
    if (profile == null) {
      return const Center(
        child: Text(
          'Profile not found',
          style: TextStyle(color: AppColors.textMuted),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadProfile,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _ProfileHeader(profile: profile),
          const SizedBox(height: 16),
          _StatsSection(profile: profile),
          const SizedBox(height: 16),
          if (_gameRatingHistory.isNotEmpty ||
              _puzzleRatingHistory.isNotEmpty) ...[
            _RatingHistorySection(
              gameHistory: _gameRatingHistory,
              puzzleHistory: _puzzleRatingHistory,
            ),
            const SizedBox(height: 16),
          ],
          if (_achievementsData != null) ...[
            _AchievementsSection(
              data: _achievementsData!,
              allAchievements: _allAchievements,
            ),
            const SizedBox(height: 16),
          ],
          if (_recentGames.isNotEmpty) ...[
            const Text(
              'Recent Games',
              style: TextStyle(
                color: AppColors.textPrimary,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            ..._recentGames.map((game) => _GameTile(game: game)),
          ],
        ],
      ),
    );
  }
}

class _ProfileHeader extends StatelessWidget {
  final PublicProfile profile;

  const _ProfileHeader({required this.profile});

  String _formatMemberSince(String createdAt) {
    try {
      final date = DateTime.parse(createdAt);
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      return 'Member since ${months[date.month - 1]} ${date.year}';
    } catch (_) {
      return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    final memberSince = _formatMemberSince(profile.createdAt);

    return Column(
      children: [
        CircleAvatar(
          radius: 40,
          backgroundColor: AppColors.primary,
          child: Text(
            profile.profileIcon.isNotEmpty
                ? profile.profileIcon
                : profile.username[0].toUpperCase(),
            style: const TextStyle(fontSize: 32),
          ),
        ),
        const SizedBox(height: 12),
        Text(
          profile.username,
          style: const TextStyle(
            color: AppColors.textPrimary,
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
        ),
        if (memberSince.isNotEmpty) ...[
          const SizedBox(height: 2),
          Text(
            memberSince,
            style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
          ),
        ],
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _RatingChip(label: 'Rating', value: profile.rating),
            const SizedBox(width: 12),
            _RatingChip(label: 'Puzzles', value: profile.puzzleRating),
          ],
        ),
      ],
    );
  }
}

class _RatingChip extends StatelessWidget {
  final String label;
  final int value;

  const _RatingChip({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.surfaceCard,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            label,
            style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
          ),
          const SizedBox(width: 4),
          Text(
            value.toString(),
            style: const TextStyle(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}

class _StatsSection extends StatelessWidget {
  final PublicProfile profile;

  const _StatsSection({required this.profile});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surfaceCard,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _StatItem(label: 'Games', value: profile.totalGames.toString()),
          _StatItem(label: 'Wins', value: profile.wins.toString()),
          _StatItem(label: 'Losses', value: profile.losses.toString()),
          _StatItem(label: 'Draws', value: profile.draws.toString()),
        ],
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String label;
  final String value;

  const _StatItem({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            color: AppColors.textPrimary,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
        ),
      ],
    );
  }
}

enum _RatingTab { play, puzzle }

enum _TimeRange { week, month, year, all }

class _RatingHistorySection extends StatefulWidget {
  final List<RatingPoint> gameHistory;
  final List<RatingPoint> puzzleHistory;

  const _RatingHistorySection({
    required this.gameHistory,
    required this.puzzleHistory,
  });

  @override
  State<_RatingHistorySection> createState() => _RatingHistorySectionState();
}

class _RatingHistorySectionState extends State<_RatingHistorySection> {
  bool _expanded = true;
  _RatingTab _tab = _RatingTab.play;
  _TimeRange _range = _TimeRange.all;

  List<RatingPoint> get _activeHistory =>
      _tab == _RatingTab.play ? widget.gameHistory : widget.puzzleHistory;

  List<RatingPoint> get _filteredHistory {
    final history = _activeHistory;
    if (_range == _TimeRange.all) return history;

    final now = DateTime.now();
    final cutoff = switch (_range) {
      _TimeRange.week => now.subtract(const Duration(days: 7)),
      _TimeRange.month => now.subtract(const Duration(days: 30)),
      _TimeRange.year => now.subtract(const Duration(days: 365)),
      _TimeRange.all => now,
    };

    return history.where((p) {
      try {
        return DateTime.parse(p.createdAt).isAfter(cutoff);
      } catch (_) {
        return true;
      }
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfaceCard,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          InkWell(
            onTap: () => setState(() => _expanded = !_expanded),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                children: [
                  const Icon(
                    Icons.show_chart,
                    color: AppColors.primary,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'Rating History',
                    style: TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const Spacer(),
                  Icon(
                    _expanded ? Icons.expand_less : Icons.expand_more,
                    color: AppColors.textMuted,
                  ),
                ],
              ),
            ),
          ),
          if (_expanded) ...[
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: Row(
                children: [
                  _TabButton(
                    label: 'Play',
                    selected: _tab == _RatingTab.play,
                    onTap: () => setState(() => _tab = _RatingTab.play),
                  ),
                  const SizedBox(width: 8),
                  _TabButton(
                    label: 'Puzzle',
                    selected: _tab == _RatingTab.puzzle,
                    onTap: () => setState(() => _tab = _RatingTab.puzzle),
                  ),
                  const Spacer(),
                  ..._TimeRange.values.map(
                    (r) => Padding(
                      padding: const EdgeInsets.only(left: 4),
                      child: _RangeButton(
                        label: switch (r) {
                          _TimeRange.week => 'W',
                          _TimeRange.month => 'M',
                          _TimeRange.year => 'Y',
                          _TimeRange.all => 'All',
                        },
                        selected: _range == r,
                        onTap: () => setState(() => _range = r),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            SizedBox(height: 180, child: _buildChart()),
            const SizedBox(height: 12),
          ],
        ],
      ),
    );
  }

  Widget _buildChart() {
    final data = _filteredHistory;
    if (data.isEmpty) {
      return const Center(
        child: Text(
          'No rating data yet',
          style: TextStyle(color: AppColors.textMuted, fontSize: 13),
        ),
      );
    }

    final spots = <FlSpot>[];
    for (var i = 0; i < data.length; i++) {
      spots.add(FlSpot(i.toDouble(), data[i].rating.toDouble()));
    }

    final ratings = data.map((p) => p.rating);
    final minRating = ratings.reduce(min);
    final maxRating = ratings.reduce(max);
    final padding = max(50, ((maxRating - minRating) * 0.15).round());
    final yMin = (minRating - padding).toDouble();
    final yMax = (maxRating + padding).toDouble();

    return Padding(
      padding: const EdgeInsets.only(left: 4, right: 16, bottom: 4),
      child: LineChart(
        LineChartData(
          minY: yMin,
          maxY: yMax,
          lineBarsData: [
            LineChartBarData(
              spots: spots,
              isCurved: true,
              curveSmoothness: 0.2,
              color: AppColors.primary,
              barWidth: 2.5,
              isStrokeCapRound: true,
              dotData: FlDotData(
                show: data.length <= 30,
                getDotPainter: (spot, percent, barData, index) =>
                    FlDotCirclePainter(radius: 2.5, color: AppColors.primary),
              ),
              belowBarData: BarAreaData(
                show: true,
                color: AppColors.primary.withValues(alpha: 0.1),
              ),
            ),
          ],
          titlesData: FlTitlesData(
            leftTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                reservedSize: 40,
                getTitlesWidget: (value, meta) {
                  if (value == meta.min || value == meta.max) {
                    return const SizedBox.shrink();
                  }
                  return Padding(
                    padding: const EdgeInsets.only(right: 4),
                    child: Text(
                      value.toInt().toString(),
                      style: const TextStyle(
                        color: AppColors.textMuted,
                        fontSize: 10,
                      ),
                    ),
                  );
                },
              ),
            ),
            bottomTitles: const AxisTitles(),
            topTitles: const AxisTitles(),
            rightTitles: const AxisTitles(),
          ),
          gridData: FlGridData(
            drawVerticalLine: false,
            getDrawingHorizontalLine: (value) =>
                const FlLine(color: AppColors.surfaceLight, strokeWidth: 0.5),
          ),
          borderData: FlBorderData(show: false),
          lineTouchData: LineTouchData(
            touchTooltipData: LineTouchTooltipData(
              getTooltipColor: (_) => AppColors.surface,
              getTooltipItems: (spots) => spots.map((spot) {
                final point = data[spot.x.toInt()];
                String dateLabel;
                try {
                  final d = DateTime.parse(point.createdAt);
                  dateLabel = '${d.day}/${d.month}/${d.year}';
                } catch (_) {
                  dateLabel = '';
                }
                return LineTooltipItem(
                  '${spot.y.toInt()}\n$dateLabel',
                  const TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                );
              }).toList(),
            ),
          ),
        ),
      ),
    );
  }
}

class _TabButton extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _TabButton({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        decoration: BoxDecoration(
          color: selected ? AppColors.primary.withValues(alpha: 0.2) : null,
          borderRadius: BorderRadius.circular(6),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: selected ? AppColors.primary : AppColors.textMuted,
            fontSize: 13,
            fontWeight: selected ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
      ),
    );
  }
}

class _RangeButton extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _RangeButton({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: selected ? AppColors.surfaceLight : null,
          borderRadius: BorderRadius.circular(4),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: selected ? AppColors.textPrimary : AppColors.textMuted,
            fontSize: 11,
            fontWeight: selected ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
      ),
    );
  }
}

class _AchievementsSection extends StatefulWidget {
  final AchievementsResponse data;
  final List<Achievement> allAchievements;

  const _AchievementsSection({
    required this.data,
    required this.allAchievements,
  });

  @override
  State<_AchievementsSection> createState() => _AchievementsSectionState();
}

class _AchievementsSectionState extends State<_AchievementsSection> {
  bool _expanded = true;
  final Set<AchievementCategory> _expandedCategories = {};

  static const _categoryMeta = <AchievementCategory, (IconData, String)>{
    AchievementCategory.chessMoments: (Icons.star, 'Chess Moments'),
    AchievementCategory.streaks: (Icons.local_fire_department, 'Streaks'),
    AchievementCategory.rating: (Icons.trending_up, 'Rating'),
    AchievementCategory.volume: (Icons.bar_chart, 'Volume'),
    AchievementCategory.fun: (Icons.emoji_events, 'Fun'),
    AchievementCategory.loyalty: (Icons.favorite, 'Loyalty'),
  };

  @override
  Widget build(BuildContext context) {
    final unlockedIds = {for (final a in widget.data.achievements) a.id};

    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfaceCard,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          InkWell(
            onTap: () => setState(() => _expanded = !_expanded),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                children: [
                  const Icon(
                    Icons.emoji_events,
                    color: AppColors.warning,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'Achievements',
                    style: TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '${widget.data.totalPoints} pts \u00b7 '
                    '${widget.data.totalUnlocked} / ${widget.data.totalAvailable}',
                    style: const TextStyle(
                      color: AppColors.textMuted,
                      fontSize: 12,
                    ),
                  ),
                  const Spacer(),
                  Icon(
                    _expanded ? Icons.expand_less : Icons.expand_more,
                    color: AppColors.textMuted,
                  ),
                ],
              ),
            ),
          ),
          if (_expanded)
            ..._categoryMeta.entries.map((entry) {
              final category = entry.key;
              final (icon, label) = entry.value;
              final categoryAchievements = widget.allAchievements
                  .where((a) => a.category == category)
                  .toList();
              if (categoryAchievements.isEmpty) return const SizedBox.shrink();

              final unlockedCount = categoryAchievements
                  .where((a) => unlockedIds.contains(a.id))
                  .length;
              final isExpanded = _expandedCategories.contains(category);

              return Column(
                children: [
                  InkWell(
                    onTap: () => setState(() {
                      if (isExpanded) {
                        _expandedCategories.remove(category);
                      } else {
                        _expandedCategories.add(category);
                      }
                    }),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 10,
                      ),
                      child: Row(
                        children: [
                          Icon(icon, size: 16, color: AppColors.textSecondary),
                          const SizedBox(width: 8),
                          Text(
                            label,
                            style: const TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            '$unlockedCount / ${categoryAchievements.length}',
                            style: const TextStyle(
                              color: AppColors.textMuted,
                              fontSize: 12,
                            ),
                          ),
                          const Spacer(),
                          Icon(
                            isExpanded ? Icons.expand_less : Icons.expand_more,
                            size: 18,
                            color: AppColors.textMuted,
                          ),
                        ],
                      ),
                    ),
                  ),
                  if (isExpanded)
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
                      child: Column(
                        children: categoryAchievements.map((achievement) {
                          final unlocked = unlockedIds.contains(achievement.id);
                          return _AchievementTile(
                            achievement: achievement,
                            unlocked: unlocked,
                          );
                        }).toList(),
                      ),
                    ),
                ],
              );
            }),
        ],
      ),
    );
  }
}

class _AchievementTile extends StatelessWidget {
  final Achievement achievement;
  final bool unlocked;

  const _AchievementTile({required this.achievement, required this.unlocked});

  static Color _rarityColor(AchievementRarity rarity) {
    return switch (rarity) {
      AchievementRarity.common => AppColors.rarityCommon,
      AchievementRarity.uncommon => AppColors.rarityUncommon,
      AchievementRarity.rare => AppColors.rarityRare,
      AchievementRarity.epic => AppColors.rarityEpic,
      AchievementRarity.legendary => AppColors.rarityLegendary,
    };
  }

  @override
  Widget build(BuildContext context) {
    final color = _rarityColor(achievement.rarity);
    final opacity = unlocked ? 1.0 : 0.35;

    return Opacity(
      opacity: opacity,
      child: Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
          decoration: BoxDecoration(
            color: AppColors.surfaceDark,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: unlocked
                  ? color.withValues(alpha: 0.3)
                  : Colors.transparent,
            ),
          ),
          child: Row(
            children: [
              Text(achievement.icon, style: const TextStyle(fontSize: 22)),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      achievement.name,
                      style: TextStyle(
                        color: unlocked ? color : AppColors.textSecondary,
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Text(
                      achievement.description,
                      style: const TextStyle(
                        color: AppColors.textMuted,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 6),
              Text(
                '${achievement.points}',
                style: TextStyle(
                  color: color,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _GameTile extends StatelessWidget {
  final RecentGame game;

  const _GameTile({required this.game});

  @override
  Widget build(BuildContext context) {
    final isWin = game.result == 'win';
    final isLoss = game.result == 'loss';
    final resultColor = isWin
        ? AppColors.success
        : (isLoss ? AppColors.error : AppColors.textMuted);
    final resultText = isWin ? 'W' : (isLoss ? 'L' : 'D');

    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: AppColors.surfaceCard,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            Container(
              width: 28,
              height: 28,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: resultColor.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                resultText,
                style: TextStyle(
                  color: resultColor,
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                'vs ${game.opponent}',
                style: const TextStyle(color: AppColors.textPrimary),
              ),
            ),
            Text(
              game.result,
              style: TextStyle(
                color: game.result == 'win'
                    ? AppColors.success
                    : game.result == 'loss'
                    ? AppColors.error
                    : AppColors.textSecondary,
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
