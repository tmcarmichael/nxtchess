import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';

class PromotionDialog extends StatelessWidget {
  final void Function(String piece) onSelect;

  const PromotionDialog({super.key, required this.onSelect});

  @override
  Widget build(BuildContext context) {
    final pieces = [
      ('q', 'Queen', Icons.star),
      ('r', 'Rook', Icons.domain),
      ('b', 'Bishop', Icons.change_history),
      ('n', 'Knight', Icons.pets),
    ];

    return AlertDialog(
      backgroundColor: AppColors.surface,
      title: const Text(
        'Promote to',
        style: TextStyle(color: AppColors.textPrimary),
      ),
      content: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: pieces.map((p) {
          return InkWell(
            onTap: () => onSelect(p.$1),
            borderRadius: BorderRadius.circular(8),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(p.$3, size: 40, color: AppColors.primary),
                  const SizedBox(height: 4),
                  Text(
                    p.$2,
                    style: const TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}
