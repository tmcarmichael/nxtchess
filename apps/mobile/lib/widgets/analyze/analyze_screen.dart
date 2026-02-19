import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../controllers/analyze_game_controller.dart';
import '../../models/game_types.dart';
import '../../providers/chess/chess_provider.dart';
import '../../theme/app_colors.dart';
import '../chess/chess_board_widget.dart';
import '../game/move_history_widget.dart';
import '../game/move_navigation_bar.dart';
import 'analyze_engine_panel.dart';
import 'analyze_import_sheet.dart';

class AnalyzeScreen extends ConsumerStatefulWidget {
  final String? importFen;

  const AnalyzeScreen({super.key, this.importFen});

  @override
  ConsumerState<AnalyzeScreen> createState() => _AnalyzeScreenState();
}

class _AnalyzeScreenState extends ConsumerState<AnalyzeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final controller = ref.read(analyzeGameControllerProvider);

      if (widget.importFen != null) {
        controller.loadFen(widget.importFen!);
      } else {
        final state = ref.read(chessProvider);
        if (state.lifecycle == GameLifecycle.idle) {
          controller.initAnalysis();
        }
      }
    });
  }

  void _showImportSheet() {
    final controller = ref.read(analyzeGameControllerProvider);
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surfaceDark,
      builder: (_) => AnalyzeImportSheet(
        onImportFen: controller.loadFen,
        onImportPgn: controller.loadPgn,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final chessState = ref.watch(chessProvider);
    final engineState = ref.watch(analyzeEngineStateProvider);
    final controller = ref.read(analyzeGameControllerProvider);
    final screenWidth = MediaQuery.of(context).size.width;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Analyze'),
        actions: [
          IconButton(
            icon: const Icon(Icons.file_open),
            tooltip: 'Import FEN/PGN',
            onPressed: _showImportSheet,
          ),
          IconButton(
            icon: const Icon(Icons.restart_alt),
            tooltip: 'Reset',
            onPressed: controller.onNewGame,
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            child: AnalyzeEnginePanelWidget(
              analysis: engineState.analysis,
              enabled: engineState.enabled,
              isAnalyzing: engineState.isAnalyzing,
              onToggle: controller.toggleEngine,
              onPlayMove: controller.playEngineMove,
            ),
          ),

          ChessBoardWidget(size: screenWidth, onMove: controller.onMove),

          Expanded(
            child: MoveHistoryWidget(
              moves: chessState.moveHistory,
              viewIndex: chessState.viewMoveIndex,
              onTapMove: (i) =>
                  ref.read(chessProvider.notifier).jumpToMoveIndex(i),
              emptyMessage: 'Make a move or import a position',
            ),
          ),

          MoveNavigationBar(
            onBack: controller.onNavigateBackward,
            onForward: controller.onNavigateForward,
            onStart: controller.onNavigateToStart,
            onEnd: controller.onNavigateToEnd,
          ),
        ],
      ),
    );
  }
}
