import 'package:flutter/material.dart';

import '../../models/move_quality.dart';
import '../../theme/app_colors.dart';

class MoveHistoryWidget extends StatefulWidget {
  final List<String> moves;
  final int viewIndex;
  final void Function(int index)? onTapMove;
  final Map<int, MoveQuality>? moveQualities;
  final String emptyMessage;

  const MoveHistoryWidget({
    super.key,
    required this.moves,
    required this.viewIndex,
    this.onTapMove,
    this.moveQualities,
    this.emptyMessage = 'No moves yet',
  });

  @override
  State<MoveHistoryWidget> createState() => _MoveHistoryWidgetState();
}

class _MoveHistoryWidgetState extends State<MoveHistoryWidget> {
  final ScrollController _scrollController = ScrollController();
  int _previousMoveCount = 0;

  @override
  void didUpdateWidget(MoveHistoryWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.moves.length > _previousMoveCount &&
        widget.viewIndex == widget.moves.length - 1) {
      _previousMoveCount = widget.moves.length;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (_scrollController.hasClients) {
          _scrollController.animateTo(
            _scrollController.position.maxScrollExtent,
            duration: const Duration(milliseconds: 200),
            curve: Curves.easeOut,
          );
        }
      });
    } else {
      _previousMoveCount = widget.moves.length;
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.moves.isEmpty) {
      return Center(
        child: Text(
          widget.emptyMessage,
          style: const TextStyle(color: AppColors.textMuted, fontSize: 13),
        ),
      );
    }

    final qualities = widget.moveQualities;

    return SingleChildScrollView(
      controller: _scrollController,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: Wrap(
        spacing: 4,
        runSpacing: 2,
        children: [
          for (int i = 0; i < widget.moves.length; i++) ...[
            if (i % 2 == 0)
              Text(
                '${(i ~/ 2) + 1}.',
                style: const TextStyle(
                  color: AppColors.textMuted,
                  fontSize: 13,
                ),
              ),
            Semantics(
              button: true,
              label: _buildLabel(i, qualities),
              child: InkWell(
                onTap: () => widget.onTapMove?.call(i),
                borderRadius: BorderRadius.circular(3),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 4,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: i == widget.viewIndex
                        ? AppColors.primary.withValues(alpha: 0.2)
                        : null,
                    borderRadius: BorderRadius.circular(3),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (qualities != null && qualities.containsKey(i)) ...[
                        Container(
                          width: 6,
                          height: 6,
                          decoration: BoxDecoration(
                            color: qualityColors[qualities[i]!],
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 2),
                      ],
                      Text(
                        widget.moves[i],
                        style: TextStyle(
                          color: i == widget.viewIndex
                              ? AppColors.primary
                              : AppColors.textPrimary,
                          fontSize: 13,
                          fontWeight: i == widget.viewIndex
                              ? FontWeight.bold
                              : FontWeight.normal,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  String _buildLabel(int i, Map<int, MoveQuality>? qualities) {
    final side = i % 2 == 0 ? 'White' : 'Black';
    final moveNum = (i ~/ 2) + 1;
    final move = widget.moves[i];
    final quality = qualities != null && qualities.containsKey(i)
        ? ', ${qualities[i]!.name}'
        : '';
    final selected = i == widget.viewIndex ? ', selected' : '';
    return '$side move $moveNum: $move$quality$selected';
  }
}
