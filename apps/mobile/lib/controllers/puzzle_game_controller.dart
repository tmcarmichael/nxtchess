import 'dart:math';

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/achievement.dart';
import '../models/game_types.dart';
import '../providers/chess/chess_provider.dart';
import '../services/api/api_client.dart' show apiClientProvider;
import '../services/audio/audio_service.dart';
import '../services/haptics/haptics_service.dart';
import '../services/puzzle/puzzle_data.dart';
import '../utils/uci_utils.dart';
import 'game_controller.dart';

class PuzzleGameController extends GameController {
  @override
  final Ref ref;
  int _gameGeneration = 0;
  PuzzleDefinition? _currentPuzzle;
  bool _disposed = false;
  bool _hasRecordedResult = false;

  PuzzleGameController(this.ref);

  @override
  GameMode get mode => GameMode.puzzle;

  ChessNotifier get _chess => ref.read(chessProvider.notifier);
  AudioService get _audio => ref.read(audioServiceProvider);
  HapticsService get _haptics => ref.read(hapticsServiceProvider);

  PuzzleDefinition? get currentPuzzle => _currentPuzzle;

  Future<void> startNewGame({
    required PuzzleCategory category,
    bool rated = false,
    String? excludeId,
  }) async {
    _gameGeneration++;
    final thisGeneration = _gameGeneration;
    _currentPuzzle = null;
    _hasRecordedResult = false;

    _chess.setLifecycle(GameLifecycle.initializing);

    final puzzle = getRandomPuzzle(
      category,
      excludeId: excludeId,
      rated: rated,
      tracker: ref.read(solvedPuzzleTrackerProvider),
    );
    if (puzzle == null) {
      _chess.setInitError('No puzzles available for this category');
      _chess.setLifecycle(GameLifecycle.error);
      return;
    }

    if (thisGeneration != _gameGeneration || _disposed) return;
    _currentPuzzle = puzzle;

    // Determine if opponent moves first
    final fenParts = puzzle.fen.split(' ');
    final sideToMove = fenParts.length > 1 ? fenParts[1] : 'w';
    final opponentMovesFirst =
        (sideToMove == 'w' && puzzle.playerSide == Side.b) ||
        (sideToMove == 'b' && puzzle.playerSide == Side.w);

    int startingSolutionIndex = 0;

    if (opponentMovesFirst && puzzle.solutionUci.isNotEmpty) {
      // Opponent's first move is the first solution move — apply it as setup
      final setupUci = puzzle.solutionUci[0];
      final setupMove = parseUciMove(setupUci);

      _chess.startGame(
        mode: GameMode.puzzle,
        playerColor: puzzle.playerSide,
        opponentType: OpponentType.ai,
        puzzleCategory: category,
        puzzleId: puzzle.id,
        puzzleRated: rated,
        puzzleStartFen: puzzle.fen,
        fen: puzzle.fen,
      );

      _chess.setLifecycle(GameLifecycle.playing);

      // Delay then play opponent's setup move
      await Future.delayed(Duration(milliseconds: 400 + Random().nextInt(300)));
      if (thisGeneration != _gameGeneration || _disposed) return;

      _chess.applyMove(
        setupMove.from,
        setupMove.to,
        promotion: setupMove.promotion,
      );
      startingSolutionIndex = 1;
    } else {
      _chess.startGame(
        mode: GameMode.puzzle,
        playerColor: puzzle.playerSide,
        opponentType: OpponentType.ai,
        puzzleCategory: category,
        puzzleId: puzzle.id,
        puzzleRated: rated,
        puzzleStartFen: puzzle.fen,
        fen: puzzle.fen,
      );
      _chess.setLifecycle(GameLifecycle.playing);
    }

    _chess.setPuzzleSolutionIndex(startingSolutionIndex);
  }

  @override
  void onMove(String from, String to, {String? promotion}) {
    final state = ref.read(chessProvider);
    if (state.lifecycle != GameLifecycle.playing) return;
    if (state.currentTurn != state.playerColor) return;
    if (_currentPuzzle == null) return;

    final solIdx = state.puzzle.solutionIndex;
    if (solIdx >= _currentPuzzle!.solutionUci.length) return;

    final expectedUci = _currentPuzzle!.solutionUci[solIdx];
    final isCorrect = matchesSolution(expectedUci, from, to, promotion);

    if (!isCorrect) {
      // Wrong move
      _recordResult(false);

      _audio.playIllegalMove();
      _haptics.onPuzzleIncorrect();
      if (state.puzzle.rated) {
        // Rated: end immediately
        _chess.endGame(GameOverReason.checkmate, null);
        _submitPuzzleResult(false);
        _chess.setPuzzleFeedback(
          const PuzzleFeedback(correct: false, message: 'Incorrect'),
        );
      } else {
        // Casual: allow retry
        _chess.setPuzzleFeedback(
          const PuzzleFeedback(correct: false, message: 'Try again'),
        );
      }
      return;
    }

    // Correct move — apply it
    _chess.applyMove(from, to, promotion: promotion);
    _audio.playMoveSound();
    _haptics.onMove();

    final nextSolIdx = solIdx + 1;
    _chess.setPuzzleSolutionIndex(nextSolIdx);

    if (nextSolIdx >= _currentPuzzle!.solutionUci.length) {
      // Puzzle complete!
      _recordResult(true);
      _chess.endGame(GameOverReason.checkmate, null);
      _submitPuzzleResult(true);
      _audio.playGameEnd();
      _haptics.onPuzzleCorrect();
      _chess.setPuzzleFeedback(
        const PuzzleFeedback(correct: true, message: 'Correct!'),
      );
      return;
    }

    // More moves: play opponent's response
    _performOpponentMove(nextSolIdx);
  }

  Future<void> _performOpponentMove(int solIdx) async {
    final thisGeneration = _gameGeneration;
    if (_currentPuzzle == null ||
        solIdx >= _currentPuzzle!.solutionUci.length) {
      return;
    }

    await Future.delayed(Duration(milliseconds: 300 + Random().nextInt(300)));
    if (thisGeneration != _gameGeneration || _disposed) return;

    final opponentUci = _currentPuzzle!.solutionUci[solIdx];
    final move = parseUciMove(opponentUci);
    _chess.applyMove(move.from, move.to, promotion: move.promotion);
    _audio.playMoveSound();
    _haptics.onMove();
    _chess.setPuzzleSolutionIndex(solIdx + 1);
  }

  void _recordResult(bool solved) {
    if (_hasRecordedResult || _currentPuzzle == null) return;
    _hasRecordedResult = true;

    final state = ref.read(chessProvider);

    ref
        .read(puzzleHistoryProvider)
        .record(
          PuzzleAttempt(
            puzzleId: _currentPuzzle!.id,
            category: _currentPuzzle!.category,
            fen: _currentPuzzle!.fen,
            playerSide: _currentPuzzle!.playerSide,
            result: solved ? PuzzleResult.pass : PuzzleResult.fail,
            rated: state.puzzle.rated,
            timestamp: DateTime.now(),
          ),
        );

    if (solved) {
      ref
          .read(solvedPuzzleTrackerProvider)
          .markSolved(_currentPuzzle!.id, state.puzzle.rated);
    }
  }

  Future<void> _submitPuzzleResult(bool solved) async {
    if (_currentPuzzle == null) return;
    final state = ref.read(chessProvider);
    if (!state.puzzle.rated) return;

    try {
      final response = await ref
          .read(apiClientProvider)
          .post(
            '/api/puzzle/result',
            data: {
              'puzzle_id': _currentPuzzle!.id,
              'category': _categoryString(_currentPuzzle!.category),
              'solved': solved,
            },
          );

      if (response.data != null && response.data is Map) {
        final data = response.data as Map;
        if (data['new_rating'] != null) {
          _chess.setRatingChange(
            RatingChange(
              delta: (data['rating_delta'] as num?)?.toInt() ?? 0,
              newRating: (data['new_rating'] as num).toInt(),
            ),
          );
        }
        final rawAchievements = data['new_achievements'] as List<dynamic>?;
        if (rawAchievements != null && rawAchievements.isNotEmpty) {
          final achievements = rawAchievements
              .map((e) => AchievementUnlock.fromJson(e as Map<String, dynamic>))
              .toList();
          _chess.setPuzzleAchievements(achievements);
        }
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('PuzzleGameController rating submit error: $e');
      }
    }
  }

  String _categoryString(PuzzleCategory category) {
    switch (category) {
      case PuzzleCategory.mateIn1:
        return 'mate-in-1';
      case PuzzleCategory.mateIn2:
        return 'mate-in-2';
      case PuzzleCategory.mateIn3:
        return 'mate-in-3';
      case PuzzleCategory.random:
        return 'random';
    }
  }

  void loadNextPuzzle() {
    final state = ref.read(chessProvider);
    _chess.setPuzzleFeedback(null);
    startNewGame(
      category: state.puzzle.category ?? PuzzleCategory.random,
      rated: state.puzzle.rated,
      excludeId: _currentPuzzle?.id,
    );
  }

  void dismissFeedback() {
    _chess.setPuzzleFeedback(null);
  }

  @override
  void onResign() {}

  @override
  void onNewGame() {
    loadNextPuzzle();
  }

  @override
  void onExitGame() {
    _chess.exitGame();
  }

  @override
  void dispose() {
    _disposed = true;
  }
}

final puzzleGameControllerProvider = Provider<PuzzleGameController>((ref) {
  final controller = PuzzleGameController(ref);
  ref.onDispose(controller.dispose);
  return controller;
});
