import 'package:flutter/material.dart';

import '../../theme/app_colors.dart';

class MoveNavigationBar extends StatelessWidget {
  final VoidCallback onStart;
  final VoidCallback onBack;
  final VoidCallback onForward;
  final VoidCallback onEnd;
  final List<Widget>? trailing;

  const MoveNavigationBar({
    super.key,
    required this.onStart,
    required this.onBack,
    required this.onForward,
    required this.onEnd,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: AppColors.surfaceCard)),
      ),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.first_page),
            tooltip: 'Go to start',
            color: AppColors.textSecondary,
            iconSize: 24,
            onPressed: onStart,
          ),
          IconButton(
            icon: const Icon(Icons.chevron_left),
            tooltip: 'Previous move',
            color: AppColors.textSecondary,
            iconSize: 24,
            onPressed: onBack,
          ),
          IconButton(
            icon: const Icon(Icons.chevron_right),
            tooltip: 'Next move',
            color: AppColors.textSecondary,
            iconSize: 24,
            onPressed: onForward,
          ),
          IconButton(
            icon: const Icon(Icons.last_page),
            tooltip: 'Go to end',
            color: AppColors.textSecondary,
            iconSize: 24,
            onPressed: onEnd,
          ),
          if (trailing != null) ...[const Spacer(), ...trailing!],
        ],
      ),
    );
  }
}
