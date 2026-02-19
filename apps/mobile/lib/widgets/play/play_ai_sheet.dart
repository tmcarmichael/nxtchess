import 'package:flutter/material.dart';
import '../../config/constants.dart';
import '../../config/time_controls.dart';
import '../../models/game_types.dart';
import '../../theme/app_colors.dart';

class PlayAISheet extends StatefulWidget {
  final void Function({
    required Side playerColor,
    required int difficulty,
    required int timeControlMinutes,
    required int incrementSeconds,
  })
  onStart;

  const PlayAISheet({super.key, required this.onStart});

  @override
  State<PlayAISheet> createState() => _PlayAISheetState();
}

class _PlayAISheetState extends State<PlayAISheet> {
  SideSelection _side = SideSelection.random;
  int _difficulty = 3;
  int _timeControlMinutes = 5;
  int _incrementSeconds = 3;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.textMuted,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Play vs AI',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 24),

          const Text(
            'Color',
            style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              _sideChip('White', SideSelection.w),
              const SizedBox(width: 8),
              _sideChip('Random', SideSelection.random),
              const SizedBox(width: 8),
              _sideChip('Black', SideSelection.b),
            ],
          ),
          const SizedBox(height: 20),

          Text(
            'Difficulty: $_difficulty (${difficultyValuesElo[_difficulty - 1]} ELO)',
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 14,
            ),
          ),
          Slider(
            value: _difficulty.toDouble(),
            min: 1,
            max: 10,
            divisions: 9,
            activeColor: AppColors.primary,
            onChanged: (v) => setState(() => _difficulty = v.round()),
          ),
          const SizedBox(height: 12),

          const Text(
            'Time Control',
            style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: allTimeControls.map((tc) {
              final isSelected =
                  tc.minutes == _timeControlMinutes &&
                  tc.increment == _incrementSeconds;
              return ChoiceChip(
                label: Text(tc.label),
                selected: isSelected,
                onSelected: (_) => setState(() {
                  _timeControlMinutes = tc.minutes;
                  _incrementSeconds = tc.increment;
                }),
                selectedColor: AppColors.primary,
                labelStyle: TextStyle(
                  color: isSelected ? Colors.white : AppColors.textPrimary,
                ),
                backgroundColor: AppColors.surfaceCard,
                side: BorderSide.none,
              );
            }).toList(),
          ),
          const SizedBox(height: 24),

          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                final playerColor = switch (_side) {
                  SideSelection.w => Side.w,
                  SideSelection.b => Side.b,
                  SideSelection.random =>
                    DateTime.now().millisecond % 2 == 0 ? Side.w : Side.b,
                };
                Navigator.of(context).pop();
                widget.onStart(
                  playerColor: playerColor,
                  difficulty: _difficulty,
                  timeControlMinutes: _timeControlMinutes,
                  incrementSeconds: _incrementSeconds,
                );
              },
              child: const Text('Start Game'),
            ),
          ),
          SizedBox(height: MediaQuery.of(context).viewInsets.bottom + 16),
        ],
      ),
    );
  }

  Widget _sideChip(String label, SideSelection value) {
    final isSelected = _side == value;
    return Expanded(
      child: ChoiceChip(
        label: SizedBox(
          width: double.infinity,
          child: Text(label, textAlign: TextAlign.center),
        ),
        selected: isSelected,
        onSelected: (_) => setState(() => _side = value),
        selectedColor: AppColors.primary,
        labelStyle: TextStyle(
          color: isSelected ? Colors.white : AppColors.textPrimary,
        ),
        backgroundColor: AppColors.surfaceCard,
        side: BorderSide.none,
        padding: EdgeInsets.zero,
      ),
    );
  }
}
