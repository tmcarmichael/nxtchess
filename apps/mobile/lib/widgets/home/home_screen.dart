import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../models/game_types.dart';
import '../../theme/app_colors.dart';
import 'floating_pieces_layer.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        const FloatingPiecesLayer(),
        SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 16),
                const Text(
                  'NXT Chess',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Quick Play',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 20),

                const Text(
                  'Play vs AI',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: _QuickPlayCard(
                        label: '1 min',
                        subtitle: 'Bullet',
                        icon: Icons.bolt,
                        color: AppColors.ratingBullet,
                        onTap: () => context.go(
                          '/play',
                          extra: {'minutes': 1, 'increment': 0},
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _QuickPlayCard(
                        label: '3 min',
                        subtitle: 'Blitz',
                        icon: Icons.flash_on,
                        color: AppColors.ratingBlitz,
                        onTap: () => context.go(
                          '/play',
                          extra: {'minutes': 3, 'increment': 0},
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _QuickPlayCard(
                        label: '10 min',
                        subtitle: 'Rapid',
                        icon: Icons.timer,
                        color: AppColors.ratingRapid,
                        onTap: () => context.go(
                          '/play',
                          extra: {'minutes': 10, 'increment': 0},
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                const Text(
                  'Puzzles',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: _QuickPlayCard(
                        label: 'Mate in 1',
                        icon: Icons.extension,
                        color: AppColors.success,
                        onTap: () => context.go(
                          '/puzzles',
                          extra: {'category': PuzzleCategory.mateIn1},
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _QuickPlayCard(
                        label: 'Mate in 2',
                        icon: Icons.extension,
                        color: AppColors.info,
                        onTap: () => context.go(
                          '/puzzles',
                          extra: {'category': PuzzleCategory.mateIn2},
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _QuickPlayCard(
                        label: 'Mate in 3',
                        icon: Icons.extension,
                        color: AppColors.primary,
                        onTap: () => context.go(
                          '/puzzles',
                          extra: {'category': PuzzleCategory.mateIn3},
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                const Text(
                  'More',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: _QuickPlayCard(
                        label: 'Training',
                        icon: Icons.school,
                        color: AppColors.warning,
                        onTap: () => context.go('/training'),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _QuickPlayCard(
                        label: 'Analyze',
                        icon: Icons.analytics,
                        color: AppColors.primaryLight,
                        onTap: () => context.push('/analyze'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _QuickPlayCard extends StatelessWidget {
  final String label;
  final String? subtitle;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const _QuickPlayCard({
    required this.label,
    this.subtitle,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: subtitle != null ? '$label $subtitle' : label,
      child: Material(
        color: AppColors.surfaceCard,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: color.withValues(alpha: 0.2)),
            ),
            child: Column(
              children: [
                Icon(icon, color: color, size: 28),
                const SizedBox(height: 6),
                Text(
                  label,
                  style: const TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                  textAlign: TextAlign.center,
                ),
                if (subtitle != null) ...[
                  const SizedBox(height: 2),
                  Text(
                    subtitle!,
                    style: TextStyle(
                      color: color.withValues(alpha: 0.8),
                      fontSize: 10,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
