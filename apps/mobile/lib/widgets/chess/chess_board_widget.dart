import 'package:chessground/chessground.dart' as cg;
import 'package:dartchess/dartchess.dart' as dc;
import 'package:fast_immutable_collections/fast_immutable_collections.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/game_types.dart';
import '../../providers/chess/chess_provider.dart';

class ChessBoardWidget extends ConsumerStatefulWidget {
  final double size;
  final void Function(String from, String to, {String? promotion})? onMove;
  final bool interactive;

  const ChessBoardWidget({
    super.key,
    required this.size,
    this.onMove,
    this.interactive = true,
  });

  @override
  ConsumerState<ChessBoardWidget> createState() => _ChessBoardWidgetState();
}

class _ChessBoardWidgetState extends ConsumerState<ChessBoardWidget> {
  dc.NormalMove? _promotionMove;

  String? _cachedFen;
  IMap<dc.Square, ISet<dc.Square>> _cachedValidMoves = const IMap.empty();
  dc.Position? _cachedPosition;

  @override
  Widget build(BuildContext context) {
    final viewFen = ref.watch(chessProvider.select((s) => s.viewFen));
    final playerColor = ref.watch(chessProvider.select((s) => s.playerColor));
    final currentTurn = ref.watch(chessProvider.select((s) => s.currentTurn));
    final lastMove = ref.watch(chessProvider.select((s) => s.lastMove));
    final checkedKingSquare = ref.watch(
      chessProvider.select((s) => s.checkedKingSquare),
    );
    final lifecycle = ref.watch(chessProvider.select((s) => s.lifecycle));
    final isGameOver = ref.watch(chessProvider.select((s) => s.isGameOver));

    final orientation = playerColor == Side.w ? dc.Side.white : dc.Side.black;

    final sideToMove = currentTurn == Side.w ? dc.Side.white : dc.Side.black;

    final validMoves = _getValidMoves(viewFen);

    final canInteract =
        widget.interactive && lifecycle == GameLifecycle.playing && !isGameOver;

    final playerSide = canInteract
        ? (playerColor == Side.w ? cg.PlayerSide.white : cg.PlayerSide.black)
        : cg.PlayerSide.none;

    final lastMoveData = lastMove != null
        ? dc.NormalMove(
            from: dc.Square.fromName(lastMove.from),
            to: dc.Square.fromName(lastMove.to),
          )
        : null;

    return cg.Chessboard(
      size: widget.size,
      orientation: orientation,
      fen: viewFen,
      lastMove: lastMoveData,
      game: cg.GameData(
        playerSide: playerSide,
        sideToMove: sideToMove,
        validMoves: validMoves,
        promotionMove: _promotionMove,
        onMove: _onMove,
        onPromotionSelection: _onPromotionSelection,
        isCheck: checkedKingSquare != null,
      ),
      settings: const cg.ChessboardSettings(
        animationDuration: Duration(milliseconds: 150),
      ),
    );
  }

  void _onMove(dc.NormalMove move, {bool? isDrop}) {
    if (move.promotion == null && _isPromotionMove(move)) {
      setState(() => _promotionMove = move);
    } else {
      widget.onMove?.call(
        move.from.name,
        move.to.name,
        promotion: move.promotion?.letter,
      );
    }
  }

  void _onPromotionSelection(dc.Role? role) {
    if (role != null && _promotionMove != null) {
      widget.onMove?.call(
        _promotionMove!.from.name,
        _promotionMove!.to.name,
        promotion: role.letter,
      );
    }
    setState(() => _promotionMove = null);
  }

  bool _isPromotionMove(dc.NormalMove move) {
    final pos = _cachedPosition;
    if (pos == null) return false;
    final piece = pos.board.pieceAt(move.from);
    if (piece == null || piece.role != dc.Role.pawn) return false;
    final targetRank = piece.color == dc.Side.white
        ? dc.Rank.eighth
        : dc.Rank.first;
    return move.to.rank == targetRank;
  }

  IMap<dc.Square, ISet<dc.Square>> _getValidMoves(String fen) {
    if (fen == _cachedFen) return _cachedValidMoves;
    try {
      final pos = dc.Chess.fromSetup(dc.Setup.parseFen(fen));
      _cachedPosition = pos;
      _cachedFen = fen;
      _cachedValidMoves = dc.makeLegalMoves(pos);
      return _cachedValidMoves;
    } catch (e) {
      if (kDebugMode) {
        debugPrint('ChessBoardWidget._getValidMoves parse error: $e');
      }
      _cachedFen = fen;
      _cachedValidMoves = const IMap.empty();
      _cachedPosition = null;
      return _cachedValidMoves;
    }
  }
}
