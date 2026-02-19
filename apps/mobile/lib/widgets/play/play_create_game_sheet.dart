import 'package:flutter/material.dart';
import '../../config/time_controls.dart';
import '../../theme/app_colors.dart';

class PlayCreateGameSheet extends StatefulWidget {
  final void Function({
    required int timeControlMinutes,
    required int incrementSeconds,
    required bool rated,
  })
  onCreate;

  const PlayCreateGameSheet({super.key, required this.onCreate});

  @override
  State<PlayCreateGameSheet> createState() => _PlayCreateGameSheetState();
}

class _PlayCreateGameSheetState extends State<PlayCreateGameSheet> {
  int _timeControlMinutes = 5;
  int _incrementSeconds = 3;
  bool _rated = false;

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
            'Create Game',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 24),

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
          const SizedBox(height: 20),

          const Text(
            'Game Type',
            style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: ChoiceChip(
                  label: const SizedBox(
                    width: double.infinity,
                    child: Text('Casual', textAlign: TextAlign.center),
                  ),
                  selected: !_rated,
                  onSelected: (_) => setState(() => _rated = false),
                  selectedColor: AppColors.primary,
                  labelStyle: TextStyle(
                    color: !_rated ? Colors.white : AppColors.textPrimary,
                  ),
                  backgroundColor: AppColors.surfaceCard,
                  side: BorderSide.none,
                  padding: EdgeInsets.zero,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: ChoiceChip(
                  label: const SizedBox(
                    width: double.infinity,
                    child: Text('Rated', textAlign: TextAlign.center),
                  ),
                  selected: _rated,
                  onSelected: (_) => setState(() => _rated = true),
                  selectedColor: AppColors.primary,
                  labelStyle: TextStyle(
                    color: _rated ? Colors.white : AppColors.textPrimary,
                  ),
                  backgroundColor: AppColors.surfaceCard,
                  side: BorderSide.none,
                  padding: EdgeInsets.zero,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop();
                widget.onCreate(
                  timeControlMinutes: _timeControlMinutes,
                  incrementSeconds: _incrementSeconds,
                  rated: _rated,
                );
              },
              child: const Text('Create Game'),
            ),
          ),
          SizedBox(height: MediaQuery.of(context).viewInsets.bottom + 16),
        ],
      ),
    );
  }
}
