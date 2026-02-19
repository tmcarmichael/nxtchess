import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/game_types.dart';
import '../../providers/chess/chess_provider.dart';
import '../../providers/engine/engine_provider.dart';
import '../../theme/app_colors.dart';
import '../chess/chess_board_widget.dart';
import '../chess/chess_clock_widget.dart';
import 'move_history_widget.dart';

class GameScaffold extends ConsumerWidget {
  final void Function(String from, String to, {String? promotion}) onMove;
  final List<Widget>? controlButtons;
  final Widget? topPanel;
  final Widget? bottomPanel;
  final bool showClocks;
  final bool interactive;

  const GameScaffold({
    super.key,
    required this.onMove,
    this.controlButtons,
    this.topPanel,
    this.bottomPanel,
    this.showClocks = true,
    this.interactive = true,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final chessState = ref.watch(chessProvider);
    final engineState = ref.watch(engineProvider);
    final screenWidth = MediaQuery.of(context).size.width;
    final opponentSide = chessState.playerColor == Side.w ? Side.b : Side.w;

    return Column(
      children: [
        ?topPanel,

        if (showClocks)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: ChessClockWidget(
              side: opponentSide,
              isActive:
                  chessState.currentTurn == opponentSide &&
                  chessState.lifecycle == GameLifecycle.playing,
            ),
          ),

        ChessBoardWidget(
          size: screenWidth,
          onMove: onMove,
          interactive: interactive,
        ),

        if (showClocks)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: ChessClockWidget(
              side: chessState.playerColor,
              isActive:
                  chessState.currentTurn == chessState.playerColor &&
                  chessState.lifecycle == GameLifecycle.playing,
            ),
          ),

        if (engineState.status == EngineStatus.loading)
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: LinearProgressIndicator(
              color: AppColors.primary,
              backgroundColor: AppColors.surfaceCard,
              minHeight: 2,
            ),
          ),

        if (engineState.isThinking)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: LinearProgressIndicator(
              color: AppColors.primary.withValues(alpha: 0.6),
              backgroundColor: AppColors.surfaceCard,
              minHeight: 2,
            ),
          ),

        Expanded(
          child: Column(
            children: [
              Expanded(
                child: MoveHistoryWidget(
                  moves: chessState.moveHistory,
                  viewIndex: chessState.viewMoveIndex,
                  onTapMove: (index) {
                    ref.read(chessProvider.notifier).jumpToMoveIndex(index);
                  },
                ),
              ),
              if (controlButtons != null)
                Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: controlButtons!,
                  ),
                ),
            ],
          ),
        ),

        ?bottomPanel,
      ],
    );
  }
}
