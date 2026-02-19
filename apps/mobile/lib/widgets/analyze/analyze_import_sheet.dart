import 'package:flutter/material.dart';

import '../../theme/app_colors.dart';

class AnalyzeImportSheet extends StatefulWidget {
  final bool Function(String fen) onImportFen;
  final bool Function(String pgn) onImportPgn;

  const AnalyzeImportSheet({
    super.key,
    required this.onImportFen,
    required this.onImportPgn,
  });

  @override
  State<AnalyzeImportSheet> createState() => _AnalyzeImportSheetState();
}

class _AnalyzeImportSheetState extends State<AnalyzeImportSheet>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _fenController = TextEditingController();
  final _pgnController = TextEditingController();
  String? _error;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _fenController.dispose();
    _pgnController.dispose();
    super.dispose();
  }

  void _importFen() {
    final fen = _fenController.text.trim();
    if (fen.isEmpty) {
      setState(() => _error = 'Please enter a FEN string');
      return;
    }
    if (widget.onImportFen(fen)) {
      Navigator.of(context).pop();
    } else {
      setState(() => _error = 'Invalid FEN string');
    }
  }

  void _importPgn() {
    final pgn = _pgnController.text.trim();
    if (pgn.isEmpty) {
      setState(() => _error = 'Please enter PGN text');
      return;
    }
    if (widget.onImportPgn(pgn)) {
      Navigator.of(context).pop();
    } else {
      setState(() => _error = 'Invalid PGN');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
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
            'Import Position',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 16),

          TabBar(
            controller: _tabController,
            indicatorColor: AppColors.primary,
            labelColor: AppColors.primary,
            unselectedLabelColor: AppColors.textMuted,
            tabs: const [
              Tab(text: 'FEN'),
              Tab(text: 'PGN'),
            ],
            onTap: (_) => setState(() => _error = null),
          ),
          const SizedBox(height: 16),

          SizedBox(
            height: 160,
            child: TabBarView(
              controller: _tabController,
              children: [
                // FEN tab
                TextField(
                  controller: _fenController,
                  style: const TextStyle(
                    color: AppColors.textPrimary,
                    fontFamily: 'monospace',
                    fontSize: 13,
                  ),
                  maxLines: 3,
                  decoration: InputDecoration(
                    hintText:
                        'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
                    hintStyle: const TextStyle(
                      color: AppColors.textMuted,
                      fontSize: 12,
                    ),
                    filled: true,
                    fillColor: AppColors.surfaceCard,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide.none,
                    ),
                  ),
                  onChanged: (_) => setState(() => _error = null),
                ),
                // PGN tab
                TextField(
                  controller: _pgnController,
                  style: const TextStyle(
                    color: AppColors.textPrimary,
                    fontFamily: 'monospace',
                    fontSize: 13,
                  ),
                  maxLines: 6,
                  decoration: InputDecoration(
                    hintText: '1. e4 e5 2. Nf3 Nc6 3. Bb5 ...',
                    hintStyle: const TextStyle(
                      color: AppColors.textMuted,
                      fontSize: 12,
                    ),
                    filled: true,
                    fillColor: AppColors.surfaceCard,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide.none,
                    ),
                  ),
                  onChanged: (_) => setState(() => _error = null),
                ),
              ],
            ),
          ),

          if (_error != null) ...[
            const SizedBox(height: 8),
            Text(
              _error!,
              style: const TextStyle(color: AppColors.error, fontSize: 13),
            ),
          ],

          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                if (_tabController.index == 0) {
                  _importFen();
                } else {
                  _importPgn();
                }
              },
              child: const Padding(
                padding: EdgeInsets.symmetric(vertical: 14),
                child: Text('Import', style: TextStyle(fontSize: 16)),
              ),
            ),
          ),
          SizedBox(height: MediaQuery.of(context).viewInsets.bottom + 16),
        ],
      ),
    );
  }
}
