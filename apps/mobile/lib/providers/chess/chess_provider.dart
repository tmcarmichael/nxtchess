import 'package:dartchess/dartchess.dart' as dc;
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/constants.dart';
import '../../models/achievement.dart';
import '../../models/game_types.dart';
import '../../models/move_quality.dart';
import 'chess_state.dart';

export 'chess_state.dart';

class ChessNotifier extends Notifier<ChessState> {
  dc.Position _pos = dc.Chess.initial;
  final List<String> _positionHashes = [];

  @override
  ChessState build() {
    _pos = dc.Chess.initial;
    _positionHashes.clear();
    return const ChessState();
  }

  dc.Position get pos => _pos;

  void _loadFen(String fen) {
    _pos = dc.Chess.fromSetup(dc.Setup.parseFen(fen));
  }

  String startGame({
    required GameMode mode,
    required Side playerColor,
    required OpponentType opponentType,
    int? difficulty,
    GamePhase? trainingGamePhase,
    double? trainingStartEval,
    String? trainingPositionId,
    String? trainingTheme,
    String? fen,
    PuzzleCategory? puzzleCategory,
    String? puzzleId,
    bool? puzzleRated,
    String? puzzleStartFen,
  }) {
    final sessionId = DateTime.now().millisecondsSinceEpoch.toString();
    final startFen = fen ?? initialFen;

    _loadFen(startFen);
    _positionHashes.clear();
    _positionHashes.add(_positionKey(startFen));

    state = ChessState(
      sessionId: sessionId,
      fen: startFen,
      viewFen: startFen,
      playerColor: playerColor,
      mode: mode,
      opponentType: opponentType,
      lifecycle: GameLifecycle.playing,
      training: TrainingState(
        gamePhase: trainingGamePhase,
        startEval: trainingStartEval,
        positionId: trainingPositionId,
        theme: trainingTheme,
      ),
      puzzle: PuzzleState(
        category: puzzleCategory,
        id: puzzleId,
        rated: puzzleRated ?? false,
        startFen: puzzleStartFen,
      ),
    );

    return sessionId;
  }

  bool applyMove(String from, String to, {String? promotion}) {
    if (state.lifecycle != GameLifecycle.playing) return false;

    final fromSq = dc.Square.parse(from);
    final toSq = dc.Square.parse(to);
    if (fromSq == null || toSq == null) return false;

    final role = promotion != null ? dc.Role.fromChar(promotion) : null;
    final move = dc.NormalMove(from: fromSq, to: toSq, promotion: role);

    if (!_pos.isLegal(move)) return false;

    final (newPos, san) = _pos.makeSan(move);
    _pos = newPos;

    final newFen = _pos.fen;
    _positionHashes.add(_positionKey(newFen));

    final isCheck = _pos.isCheck;
    final isGameOver =
        _pos.isGameOver || _isThreefoldRepetition() || _pos.halfmoves >= 100;
    final nextTurn = state.currentTurn == Side.w ? Side.b : Side.w;

    state = state.copyWith(
      fen: newFen,
      viewFen: newFen,
      currentTurn: nextTurn,
      moveHistory: [...state.moveHistory, san],
      viewMoveIndex: state.moveHistory.length,
      lastMove: LastMove(from: from, to: to),
      checkedKingSquare: isCheck ? _findKingSquare(newFen, nextTurn) : null,
      isGameOver: isGameOver,
      gameOverReason: isGameOver ? _detectGameOverReason() : null,
      gameWinner: isGameOver ? _detectWinner() : null,
      lifecycle: isGameOver ? GameLifecycle.ended : state.lifecycle,
      moveError: null,
    );

    return true;
  }

  bool applyOptimisticMove(String from, String to, {String? promotion}) {
    return applyMove(from, to, promotion: promotion);
  }

  void confirmMove({
    required String serverFen,
    required String from,
    required String to,
  }) {
    if (kDebugMode && state.fen != serverFen) {
      debugPrint(
        'confirmMove FEN mismatch: local=${state.fen} server=$serverFen',
      );
    }
    _loadFen(serverFen);
    state = state.copyWith(
      fen: serverFen,
      viewFen: serverFen,
      lastMove: LastMove(from: from, to: to),
      viewMoveIndex: state.moveHistory.length - 1,
      moveError: null,
    );
  }

  void rejectMove(String serverFen, String reason) {
    _loadFen(serverFen);

    final restoredTurn = serverFen.split(' ')[1] == 'w' ? Side.w : Side.b;
    final restoredHistory = state.moveHistory.isNotEmpty
        ? state.moveHistory.sublist(0, state.moveHistory.length - 1)
        : <String>[];

    state = state.copyWith(
      fen: serverFen,
      viewFen: serverFen,
      currentTurn: restoredTurn,
      moveHistory: restoredHistory,
      viewMoveIndex: restoredHistory.length - 1,
      isGameOver: false,
      gameOverReason: null,
      gameWinner: null,
      lifecycle: GameLifecycle.playing,
      moveError: reason,
    );
  }

  void syncFromMultiplayer({
    required String fen,
    required String san,
    required String from,
    required String to,
    bool? isCheck,
  }) {
    _loadFen(fen);
    _positionHashes.add(_positionKey(fen));

    final nextTurn = state.currentTurn == Side.w ? Side.b : Side.w;
    final isGameOver =
        _pos.isGameOver || _isThreefoldRepetition() || _pos.halfmoves >= 100;

    state = state.copyWith(
      fen: fen,
      viewFen: fen,
      lastMove: LastMove(from: from, to: to),
      moveHistory: [...state.moveHistory, san],
      viewMoveIndex: state.moveHistory.length,
      currentTurn: nextTurn,
      checkedKingSquare: isCheck == true
          ? _findKingSquare(fen, nextTurn)
          : null,
      isGameOver: isGameOver,
      gameOverReason: isGameOver ? _detectGameOverReason() : null,
      gameWinner: isGameOver ? _detectWinner() : null,
      lifecycle: isGameOver ? GameLifecycle.ended : state.lifecycle,
    );
  }

  void endGame(GameOverReason reason, GameWinner? winner, {double? evalScore}) {
    state = state.copyWith(
      isGameOver: true,
      gameOverReason: reason,
      gameWinner: winner,
      lifecycle: GameLifecycle.ended,
      training: state.training.copyWith(
        evalScore: evalScore ?? state.training.evalScore,
      ),
    );
  }

  void exitGame() {
    _pos = dc.Chess.initial;
    _positionHashes.clear();
    state = const ChessState();
  }

  void resign() {
    if (state.lifecycle != GameLifecycle.playing) return;
    final winner = state.playerColor == Side.w ? GameWinner.b : GameWinner.w;
    endGame(GameOverReason.resignation, winner);
  }

  void jumpToMoveIndex(int targetIndex) {
    final clamped = targetIndex.clamp(-1, state.moveHistory.length - 1);
    dc.Position pos = dc.Chess.initial;
    for (int i = 0; i <= clamped; i++) {
      final move = pos.parseSan(state.moveHistory[i]);
      if (move != null) {
        pos = pos.play(move);
      }
    }
    state = state.copyWith(
      viewMoveIndex: clamped,
      viewFen: pos.fen,
      lastMove: null,
      checkedKingSquare: null,
    );
  }

  void resetForMultiplayer(GameMode gameMode) {
    _pos = dc.Chess.initial;
    _positionHashes.clear();
    state = ChessState(
      mode: gameMode,
      opponentType: OpponentType.human,
      lifecycle: GameLifecycle.initializing,
    );
  }

  void hydrateFromReconnect(String fen, List<String> uciMoveHistory) {
    dc.Position pos = dc.Chess.initial;
    final sanHistory = <String>[];

    for (final uci in uciMoveHistory) {
      final move = dc.Move.parse(uci);
      if (move == null) continue;

      if (pos.isLegal(move)) {
        final (newPos, san) = pos.makeSan(move);
        pos = newPos;
        sanHistory.add(san);
      }
    }

    _loadFen(fen);
    final currentTurn = fen.split(' ')[1] == 'w' ? Side.w : Side.b;

    LastMove? lastMove;
    if (uciMoveHistory.isNotEmpty) {
      final last = uciMoveHistory.last;
      lastMove = LastMove(from: last.substring(0, 2), to: last.substring(2, 4));
    }

    state = state.copyWith(
      fen: fen,
      viewFen: fen,
      currentTurn: currentTurn,
      moveHistory: sanHistory,
      viewMoveIndex: sanHistory.length - 1,
      isGameOver: false,
      gameOverReason: null,
      gameWinner: null,
      lifecycle: GameLifecycle.playing,
      moveError: null,
      lastMove: lastMove,
      checkedKingSquare: _pos.isCheck
          ? _findKingSquare(fen, currentTurn)
          : null,
    );
  }

  void setLifecycle(GameLifecycle lifecycle) {
    state = state.copyWith(lifecycle: lifecycle);
  }

  void setPlayerColor(Side color) {
    state = state.copyWith(playerColor: color);
  }

  void setInitError(String? error) {
    state = state.copyWith(initError: error);
  }

  void updateMoveEvaluation(MoveEvaluation evaluation) {
    final evals = List<MoveEvaluation>.from(state.training.moveEvaluations);
    final idx = evals.indexWhere((e) => e.moveIndex == evaluation.moveIndex);
    if (idx >= 0) {
      evals[idx] = evaluation;
    } else {
      evals.add(evaluation);
    }
    state = state.copyWith(
      training: state.training.copyWith(moveEvaluations: evals),
    );
  }

  void clearMoveEvaluations() {
    state = state.copyWith(
      training: state.training.copyWith(moveEvaluations: const []),
    );
  }

  void setPuzzleSolutionIndex(int index) {
    state = state.copyWith(puzzle: state.puzzle.copyWith(solutionIndex: index));
  }

  void setPuzzleFeedback(PuzzleFeedback? feedback) {
    state = state.copyWith(puzzle: state.puzzle.copyWith(feedback: feedback));
  }

  void setRatingChange(RatingChange? ratingChange) {
    state = state.copyWith(
      puzzle: state.puzzle.copyWith(ratingChange: ratingChange),
    );
  }

  void setPuzzleAchievements(List<AchievementUnlock>? achievements) {
    state = state.copyWith(
      puzzle: state.puzzle.copyWith(newAchievements: achievements),
    );
  }

  bool get isPlayerTurn => state.currentTurn == state.playerColor;
  bool get canMove => state.lifecycle == GameLifecycle.playing && isPlayerTurn;
  bool get isViewingHistory => state.viewFen != state.fen;
  Side get opponentSide => state.playerColor == Side.w ? Side.b : Side.w;

  String _positionKey(String fen) {
    return fen.split(' ').take(4).join(' ');
  }

  bool _isThreefoldRepetition() {
    if (_positionHashes.isEmpty) return false;
    final current = _positionHashes.last;
    return _positionHashes.where((h) => h == current).length >= 3;
  }

  String? _findKingSquare(String fen, Side side) {
    final boardPart = fen.split(' ')[0];
    final kingChar = side == Side.w ? 'K' : 'k';
    int rank = 7;
    int file = 0;
    for (final c in boardPart.runes) {
      final char = String.fromCharCode(c);
      if (char == '/') {
        rank--;
        file = 0;
      } else if (int.tryParse(char) != null) {
        file += int.parse(char);
      } else {
        if (char == kingChar) {
          const files = 'abcdefgh';
          return '${files[file]}${rank + 1}';
        }
        file++;
      }
    }
    return null;
  }

  GameOverReason? _detectGameOverReason() {
    if (_pos.isCheckmate) return GameOverReason.checkmate;
    if (_pos.isStalemate) return GameOverReason.stalemate;
    if (_pos.isInsufficientMaterial) return GameOverReason.insufficientMaterial;
    if (_isThreefoldRepetition()) return GameOverReason.threefoldRepetition;
    if (_pos.halfmoves >= 100) return GameOverReason.fiftyMoveRule;
    return null;
  }

  GameWinner? _detectWinner() {
    if (_pos.isCheckmate) {
      return _pos.turn == dc.Side.white ? GameWinner.b : GameWinner.w;
    }
    if (_pos.isStalemate ||
        _pos.isInsufficientMaterial ||
        _isThreefoldRepetition()) {
      return GameWinner.draw;
    }
    return null;
  }
}

final chessProvider = NotifierProvider<ChessNotifier, ChessState>(
  ChessNotifier.new,
);
