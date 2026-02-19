import 'package:flutter/material.dart';

import '../../models/game_types.dart';
import '../../theme/app_colors.dart';

class TrainingSetupSheet extends StatefulWidget {
  final void Function({
    required Side side,
    required int difficulty,
    required GamePhase gamePhase,
    String? theme,
  })
  onStart;

  const TrainingSetupSheet({super.key, required this.onStart});

  @override
  State<TrainingSetupSheet> createState() => _TrainingSetupSheetState();
}

class _TrainingSetupSheetState extends State<TrainingSetupSheet> {
  int _difficulty = 4;
  GamePhase _gamePhase = GamePhase.opening;
  SideSelection _sideSelection = SideSelection.random;
  String _endgameTheme = '';

  static const _difficultyOptions = [
    (level: 1, label: 'Beginner'),
    (level: 2, label: 'Easy'),
    (level: 4, label: 'Medium'),
    (level: 6, label: 'Hard'),
    (level: 8, label: 'Expert'),
    (level: 10, label: 'GM'),
  ];

  static const _endgameThemes = [
    (value: '', label: 'Any'),
    (value: 'basicMate', label: 'Basic Mates'),
    (value: 'pawnEndgame', label: 'Pawn'),
    (value: 'rookEndgame', label: 'Rook'),
    (value: 'bishopEndgame', label: 'Bishop'),
    (value: 'knightEndgame', label: 'Knight'),
    (value: 'queenEndgame', label: 'Queen'),
  ];

  Side _resolveSide() {
    if (_sideSelection == SideSelection.random) {
      return DateTime.now().millisecond % 2 == 0 ? Side.w : Side.b;
    }
    return _sideSelection == SideSelection.w ? Side.w : Side.b;
  }

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
            'Training',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 20),

          const Text(
            'Game Phase',
            style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              for (final phase in GamePhase.values) ...[
                Expanded(
                  child: GestureDetector(
                    onTap: phase == GamePhase.middlegame
                        ? null
                        : () => setState(() => _gamePhase = phase),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      decoration: BoxDecoration(
                        color: _gamePhase == phase
                            ? AppColors.primary
                            : AppColors.surfaceCard,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        phase.name[0].toUpperCase() + phase.name.substring(1),
                        style: TextStyle(
                          color: phase == GamePhase.middlegame
                              ? AppColors.textMuted
                              : _gamePhase == phase
                              ? Colors.white
                              : AppColors.textPrimary,
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ),
                ),
                if (phase != GamePhase.values.last) const SizedBox(width: 8),
              ],
            ],
          ),
          const SizedBox(height: 16),

          const Text(
            'Difficulty',
            style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final opt in _difficultyOptions)
                GestureDetector(
                  onTap: () => setState(() => _difficulty = opt.level),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: _difficulty == opt.level
                          ? AppColors.primary
                          : AppColors.surfaceCard,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      opt.label,
                      style: TextStyle(
                        color: _difficulty == opt.level
                            ? Colors.white
                            : AppColors.textPrimary,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),

          const Text(
            'Play As',
            style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              for (final side in SideSelection.values) ...[
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _sideSelection = side),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      decoration: BoxDecoration(
                        color: _sideSelection == side
                            ? AppColors.primary
                            : AppColors.surfaceCard,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        side == SideSelection.w
                            ? 'White'
                            : side == SideSelection.b
                            ? 'Black'
                            : 'Random',
                        style: TextStyle(
                          color: _sideSelection == side
                              ? Colors.white
                              : AppColors.textPrimary,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ),
                ),
                if (side != SideSelection.values.last) const SizedBox(width: 8),
              ],
            ],
          ),
          const SizedBox(height: 16),

          if (_gamePhase == GamePhase.endgame) ...[
            const Text(
              'Endgame Type',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final theme in _endgameThemes)
                  GestureDetector(
                    onTap: () => setState(() => _endgameTheme = theme.value),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: _endgameTheme == theme.value
                            ? AppColors.primary
                            : AppColors.surfaceCard,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        theme.label,
                        style: TextStyle(
                          color: _endgameTheme == theme.value
                              ? Colors.white
                              : AppColors.textPrimary,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 16),
          ],

          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                widget.onStart(
                  side: _resolveSide(),
                  difficulty: _difficulty,
                  gamePhase: _gamePhase,
                  theme: _endgameTheme.isNotEmpty ? _endgameTheme : null,
                );
                Navigator.of(context).pop();
              },
              child: const Padding(
                padding: EdgeInsets.symmetric(vertical: 14),
                child: Text('Start Training', style: TextStyle(fontSize: 16)),
              ),
            ),
          ),
          SizedBox(height: MediaQuery.of(context).viewInsets.bottom + 16),
        ],
      ),
    );
  }
}
