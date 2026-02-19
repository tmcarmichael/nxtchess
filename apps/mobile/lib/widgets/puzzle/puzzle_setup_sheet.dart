import 'package:flutter/material.dart';

import '../../models/game_types.dart';
import '../../theme/app_colors.dart';

class PuzzleSetupSheet extends StatefulWidget {
  final void Function({required PuzzleCategory category, required bool rated})
  onStart;

  const PuzzleSetupSheet({super.key, required this.onStart});

  @override
  State<PuzzleSetupSheet> createState() => _PuzzleSetupSheetState();
}

class _PuzzleSetupSheetState extends State<PuzzleSetupSheet> {
  PuzzleCategory _category = PuzzleCategory.mateIn1;
  bool _rated = false;

  static const _categoryLabels = {
    PuzzleCategory.mateIn1: 'Mate in 1',
    PuzzleCategory.mateIn2: 'Mate in 2',
    PuzzleCategory.mateIn3: 'Mate in 3',
    PuzzleCategory.random: 'Random',
  };

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Puzzles',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 16),

          const Text(
            'Category',
            style: TextStyle(
              fontSize: 13,
              color: AppColors.textSecondary,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: PuzzleCategory.values.map((cat) {
              final selected = _category == cat;
              return ChoiceChip(
                label: Text(_categoryLabels[cat]!),
                selected: selected,
                selectedColor: AppColors.primary,
                backgroundColor: AppColors.surfaceCard,
                labelStyle: TextStyle(
                  color: selected ? Colors.white : AppColors.textPrimary,
                  fontSize: 13,
                ),
                onSelected: (_) => setState(() => _category = cat),
              );
            }).toList(),
          ),
          const SizedBox(height: 16),

          SwitchListTile(
            title: const Text(
              'Rated',
              style: TextStyle(color: AppColors.textPrimary, fontSize: 14),
            ),
            subtitle: const Text(
              'Affects your puzzle rating',
              style: TextStyle(color: AppColors.textMuted, fontSize: 12),
            ),
            value: _rated,
            onChanged: (v) => setState(() => _rated = v),
            activeThumbColor: AppColors.primary,
            contentPadding: EdgeInsets.zero,
          ),
          const SizedBox(height: 16),

          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: () {
                Navigator.of(context).pop();
                widget.onStart(category: _category, rated: _rated);
              },
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.primary,
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              child: const Text('Start', style: TextStyle(fontSize: 16)),
            ),
          ),
        ],
      ),
    );
  }
}
