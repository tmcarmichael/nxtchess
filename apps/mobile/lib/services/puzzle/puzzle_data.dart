import 'dart:math';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/game_types.dart';

class PuzzleDefinition {
  final String id;
  final PuzzleCategory category;
  final String fen;
  final List<String> solutionUci;
  final Side playerSide;
  final int? rating;

  const PuzzleDefinition({
    required this.id,
    required this.category,
    required this.fen,
    required this.solutionUci,
    required this.playerSide,
    this.rating,
  });
}

({String from, String to, String? promotion}) uciToFromTo(String uci) {
  return (
    from: uci.substring(0, 2),
    to: uci.substring(2, 4),
    promotion: uci.length == 5 ? uci[4] : null,
  );
}

class PuzzleHistory {
  final List<PuzzleAttempt> _sessionHistory = [];

  List<PuzzleAttempt> get({bool? filterRated}) {
    if (filterRated == null) return _sessionHistory.take(20).toList();
    return _sessionHistory
        .where((a) => a.rated == filterRated)
        .take(20)
        .toList();
  }

  void record(PuzzleAttempt attempt) {
    _sessionHistory.insert(0, attempt);
    if (_sessionHistory.length > 20) {
      _sessionHistory.removeRange(20, _sessionHistory.length);
    }
  }
}

class PuzzleAttempt {
  final String puzzleId;
  final PuzzleCategory category;
  final String fen;
  final Side playerSide;
  final PuzzleResult result;
  final bool rated;
  final DateTime timestamp;

  const PuzzleAttempt({
    required this.puzzleId,
    required this.category,
    required this.fen,
    required this.playerSide,
    required this.result,
    required this.rated,
    required this.timestamp,
  });
}

class SolvedPuzzleTracker {
  final Set<String> _ratedSolved = {};
  final Set<String> _casualSolved = {};

  Set<String> getSolvedIds(bool rated) => rated ? _ratedSolved : _casualSolved;
  void markSolved(String puzzleId, bool rated) {
    (rated ? _ratedSolved : _casualSolved).add(puzzleId);
  }
}

enum PuzzleResult { pass, fail }

final puzzleHistoryProvider = Provider<PuzzleHistory>((ref) => PuzzleHistory());
final solvedPuzzleTrackerProvider = Provider<SolvedPuzzleTracker>(
  (ref) => SolvedPuzzleTracker(),
);

final Map<PuzzleCategory, List<PuzzleDefinition>> _categoryQueues = {};
final _puzzleRandom = Random();

PuzzleDefinition? getRandomPuzzle(
  PuzzleCategory category, {
  String? excludeId,
  bool rated = false,
  required SolvedPuzzleTracker tracker,
}) {
  final actualCategory = category == PuzzleCategory.random
      ? [
          PuzzleCategory.mateIn1,
          PuzzleCategory.mateIn2,
          PuzzleCategory.mateIn3,
        ][_puzzleRandom.nextInt(3)]
      : category;

  if (_categoryQueues[actualCategory] == null ||
      _categoryQueues[actualCategory]!.isEmpty) {
    final source = allPuzzles
        .where((p) => p.category == actualCategory)
        .toList();
    if (rated) {
      final solved = tracker.getSolvedIds(true);
      source.removeWhere((p) => solved.contains(p.id));
    }
    source.shuffle(_puzzleRandom);
    _categoryQueues[actualCategory] = source;
  }

  final queue = _categoryQueues[actualCategory]!;
  if (queue.isEmpty) return null;

  if (excludeId != null) {
    final idx = queue.indexWhere((p) => p.id != excludeId);
    if (idx >= 0) return queue.removeAt(idx);
  }

  return queue.removeAt(0);
}

const allPuzzles = <PuzzleDefinition>[
  PuzzleDefinition(
    id: 'm1_01',
    category: PuzzleCategory.mateIn1,
    fen: '6k1/5ppp/8/8/8/8/1Q3PPP/6K1 w - - 0 1',
    solutionUci: ['b2b8'],
    playerSide: Side.w,
    rating: 400,
  ),
  PuzzleDefinition(
    id: 'm1_02',
    category: PuzzleCategory.mateIn1,
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 3',
    solutionUci: ['h5f7'],
    playerSide: Side.w,
    rating: 500,
  ),
  PuzzleDefinition(
    id: 'm1_03',
    category: PuzzleCategory.mateIn1,
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 2',
    solutionUci: ['d8h4'],
    playerSide: Side.b,
    rating: 400,
  ),
  PuzzleDefinition(
    id: 'm1_04',
    category: PuzzleCategory.mateIn1,
    fen: '3qk3/8/8/8/8/8/5PPP/6K1 b - - 0 1',
    solutionUci: ['d8d1'],
    playerSide: Side.b,
    rating: 350,
  ),
  PuzzleDefinition(
    id: 'm1_05',
    category: PuzzleCategory.mateIn1,
    fen: '5rk1/5ppp/8/8/8/2B5/5PPP/6K1 w - - 0 1',
    solutionUci: ['c3g7'],
    playerSide: Side.w,
    rating: 500,
  ),
  PuzzleDefinition(
    id: 'm1_06',
    category: PuzzleCategory.mateIn1,
    fen: '6k1/5pp1/7p/8/8/8/4RPPP/6K1 w - - 0 1',
    solutionUci: ['e2e8'],
    playerSide: Side.w,
    rating: 350,
  ),
  PuzzleDefinition(
    id: 'm1_07',
    category: PuzzleCategory.mateIn1,
    fen: 'r4rk1/ppp2ppp/8/3Nb3/8/8/PPP2PPP/R3K2R w KQ - 0 1',
    solutionUci: ['d5f6'],
    playerSide: Side.w,
    rating: 600,
  ),
  PuzzleDefinition(
    id: 'm1_08',
    category: PuzzleCategory.mateIn1,
    fen: 'r3k2r/ppp2ppp/8/3nb3/8/8/PPP2PPP/R4RK1 b kq - 0 1',
    solutionUci: ['d5f4'],
    playerSide: Side.b,
    rating: 600,
  ),
  PuzzleDefinition(
    id: 'm1_09',
    category: PuzzleCategory.mateIn1,
    fen: '6k1/pp3ppp/8/8/3r4/8/PP3qPP/RN1Q1RK1 b - - 0 1',
    solutionUci: ['f2g2'],
    playerSide: Side.b,
    rating: 400,
  ),
  PuzzleDefinition(
    id: 'm1_10',
    category: PuzzleCategory.mateIn1,
    fen: 'r1b1kb1r/pppp1ppp/5n2/8/3nq2N/3P4/PPPB1PPP/RN1QKB1R b KQkq - 3 6',
    solutionUci: ['e4e1'],
    playerSide: Side.b,
    rating: 650,
  ),
  PuzzleDefinition(
    id: 'm1_11',
    category: PuzzleCategory.mateIn1,
    fen: 'r2qk2r/ppp2ppp/2np1n2/2b5/2B1Pb2/2NP1Q2/PPP2PPP/R1B1K2R w KQkq - 0 7',
    solutionUci: ['f3f7'],
    playerSide: Side.w,
    rating: 700,
  ),
  PuzzleDefinition(
    id: 'm1_12',
    category: PuzzleCategory.mateIn1,
    fen: 'r1bqk2r/pppp1Bpp/2n2n2/2b1p3/4P3/3P4/PPP2PPP/RNBQK1NR b KQkq - 0 4',
    solutionUci: ['d8a5'],
    playerSide: Side.b,
    rating: 750,
  ),
  PuzzleDefinition(
    id: 'm1_13',
    category: PuzzleCategory.mateIn1,
    fen: '5rk1/1p3pp1/p6p/8/2q5/1P3N2/P4PPP/3R2K1 w - - 0 1',
    solutionUci: ['d1d8'],
    playerSide: Side.w,
    rating: 500,
  ),
  PuzzleDefinition(
    id: 'm1_14',
    category: PuzzleCategory.mateIn1,
    fen: 'r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP1QPPP/RNB2RK1 w - - 0 6',
    solutionUci: ['e2e5'],
    playerSide: Side.w,
    rating: 800,
  ),
  PuzzleDefinition(
    id: 'm1_15',
    category: PuzzleCategory.mateIn1,
    fen: '7k/R4pp1/8/8/8/8/5PPP/6K1 w - - 0 1',
    solutionUci: ['a7a8'],
    playerSide: Side.w,
    rating: 300,
  ),
  PuzzleDefinition(
    id: 'm1_16',
    category: PuzzleCategory.mateIn1,
    fen: '6k1/5ppp/8/8/8/4Q3/5PPP/6K1 w - - 0 1',
    solutionUci: ['e3e8'],
    playerSide: Side.w,
    rating: 350,
  ),
  PuzzleDefinition(
    id: 'm1_17',
    category: PuzzleCategory.mateIn1,
    fen: '6k1/5pp1/6Np/8/3B4/8/5PPP/6K1 w - - 0 1',
    solutionUci: ['d4h8'],
    playerSide: Side.w,
    rating: 550,
  ),
  PuzzleDefinition(
    id: 'm1_18',
    category: PuzzleCategory.mateIn1,
    fen: 'r4rk1/1bq2ppp/p2p1n2/1p2p1B1/4P3/2NQ4/PPP2PPP/2KR3R w - - 0 1',
    solutionUci: ['d3d6'],
    playerSide: Side.w,
    rating: 750,
  ),
  PuzzleDefinition(
    id: 'm1_19',
    category: PuzzleCategory.mateIn1,
    fen: 'r1bq1rk1/pp1n1ppp/2pbpn2/8/2PP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 8',
    solutionUci: ['d3h7'],
    playerSide: Side.w,
    rating: 850,
  ),
  PuzzleDefinition(
    id: 'm1_20',
    category: PuzzleCategory.mateIn1,
    fen: '3r2k1/pp3ppp/8/3N4/8/8/PPP2PPP/R5K1 w - - 0 1',
    solutionUci: ['d5f6'],
    playerSide: Side.w,
    rating: 550,
  ),
  PuzzleDefinition(
    id: 'm1_21',
    category: PuzzleCategory.mateIn1,
    fen: '1k1r4/pp3pp1/8/8/5q2/8/PP3PPP/R5K1 b - - 0 1',
    solutionUci: ['f4f1'],
    playerSide: Side.b,
    rating: 400,
  ),
  PuzzleDefinition(
    id: 'm1_22',
    category: PuzzleCategory.mateIn1,
    fen: 'r2qr1k1/ppp2ppp/2nb1n2/3p4/8/P1PP1N2/1P1NQPPP/R1B1K2R b KQ - 0 10',
    solutionUci: ['d6h2'],
    playerSide: Side.b,
    rating: 700,
  ),
  PuzzleDefinition(
    id: 'm1_23',
    category: PuzzleCategory.mateIn1,
    fen: 'rnbqkbnr/ppppp2p/5p2/6pQ/4P3/2N5/PPPP1PPP/R1B1KBNR w KQkq - 0 3',
    solutionUci: ['h5e8'],
    playerSide: Side.w,
    rating: 350,
  ),
  PuzzleDefinition(
    id: 'm1_24',
    category: PuzzleCategory.mateIn1,
    fen: '4r1k1/ppp2ppp/8/4N3/8/1b6/PPP2PPP/R3R1K1 w - - 0 1',
    solutionUci: ['e1e8'],
    playerSide: Side.w,
    rating: 500,
  ),

  PuzzleDefinition(
    id: 'm2_01',
    category: PuzzleCategory.mateIn2,
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
    solutionUci: ['h5f7', 'e8d8', 'c4e6'],
    playerSide: Side.w,
    rating: 800,
  ),
  PuzzleDefinition(
    id: 'm2_02',
    category: PuzzleCategory.mateIn2,
    fen: '2bqkbn1/2pppp2/np2N3/6p1/1PB5/4Q3/P1PP1PPP/RN2K2R w KQ - 0 1',
    solutionUci: ['e3a7', 'b6a4', 'a7a8'],
    playerSide: Side.w,
    rating: 900,
  ),
  PuzzleDefinition(
    id: 'm2_03',
    category: PuzzleCategory.mateIn2,
    fen: 'r2qk3/ppp1bprp/2n5/3pN1Q1/3P4/2P5/PP3PPP/R3KB1R w KQq - 0 1',
    solutionUci: ['g5g7', 'e7f6', 'g7f6'],
    playerSide: Side.w,
    rating: 900,
  ),
  PuzzleDefinition(
    id: 'm2_04',
    category: PuzzleCategory.mateIn2,
    fen: '6k1/pp3ppp/4p3/8/4r3/2N1Q3/PPP2qPP/R4RK1 b - - 0 1',
    solutionUci: ['f2g2', 'g1h1', 'g2g1'],
    playerSide: Side.b,
    rating: 850,
  ),
  PuzzleDefinition(
    id: 'm2_05',
    category: PuzzleCategory.mateIn2,
    fen:
        'r1b1k2r/ppppqppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPPQPPP/R1B1K2R w KQkq - 6 5',
    solutionUci: ['c4f7', 'e7f7', 'e2e5'],
    playerSide: Side.w,
    rating: 900,
  ),
  PuzzleDefinition(
    id: 'm2_06',
    category: PuzzleCategory.mateIn2,
    fen: '3rk2r/1pp2ppp/p4n2/3Nb3/4P1q1/3Q4/PPP2PPP/R3K2R w KQk - 0 1',
    solutionUci: ['d3g6', 'f7g6', 'd5f6'],
    playerSide: Side.w,
    rating: 1000,
  ),
  PuzzleDefinition(
    id: 'm2_07',
    category: PuzzleCategory.mateIn2,
    fen: 'r1bqk2r/ppp2ppp/2n5/2b1p3/2BnP3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 6',
    solutionUci: ['f3f7', 'e8d8', 'c4d5'],
    playerSide: Side.w,
    rating: 950,
  ),
  PuzzleDefinition(
    id: 'm2_08',
    category: PuzzleCategory.mateIn2,
    fen: 'r2q1rk1/ppp2ppp/3bbn2/3p4/8/1B2PQ2/PPP2PPP/RNB2RK1 w - - 0 1',
    solutionUci: ['f3f6', 'g7f6', 'b3d5'],
    playerSide: Side.w,
    rating: 1050,
  ),
  PuzzleDefinition(
    id: 'm2_09',
    category: PuzzleCategory.mateIn2,
    fen: 'r4rk1/ppp2pp1/3p3p/3Pn2q/2P1PR2/6PP/PP2Q1BK/R7 b - - 0 1',
    solutionUci: ['h5e2', 'g2e4', 'e2e4'],
    playerSide: Side.b,
    rating: 1000,
  ),
  PuzzleDefinition(
    id: 'm2_10',
    category: PuzzleCategory.mateIn2,
    fen: '5rk1/1p1q1ppp/p2p4/4pN2/1PP1n3/P3PQ2/5PPP/3R2K1 w - - 0 1',
    solutionUci: ['f3h5', 'h7h6', 'h5h6'],
    playerSide: Side.w,
    rating: 1000,
  ),
  PuzzleDefinition(
    id: 'm2_11',
    category: PuzzleCategory.mateIn2,
    fen: 'r1b1qrk1/pp3ppp/2p2n2/8/1b1PP3/2NB4/PP3PPP/R1BQK2R w KQ - 0 1',
    solutionUci: ['d3h7', 'g8h7', 'd1h5'],
    playerSide: Side.w,
    rating: 1100,
  ),
  PuzzleDefinition(
    id: 'm2_12',
    category: PuzzleCategory.mateIn2,
    fen: 'rnb1kbnr/ppppqp1p/6p1/4p2Q/4P3/8/PPPP1PPP/RNB1KBNR w KQkq - 2 3',
    solutionUci: ['h5e5', 'e7e5', 'e1e5'],
    playerSide: Side.w,
    rating: 700,
  ),
  PuzzleDefinition(
    id: 'm2_13',
    category: PuzzleCategory.mateIn2,
    fen: 'r3kbnr/ppp1pppp/2nq4/3p1b2/3P1B2/4PN2/PPP2PPP/RN1QKB1R w KQkq - 0 5',
    solutionUci: ['f1b5', 'c6d8', 'b5d7'],
    playerSide: Side.w,
    rating: 950,
  ),
  PuzzleDefinition(
    id: 'm2_14',
    category: PuzzleCategory.mateIn2,
    fen: '3r1rk1/p4ppp/bpB1p3/8/2p5/2N5/PPP1QPPP/4R1K1 w - - 0 1',
    solutionUci: ['e2e6', 'f7e6', 'e1e6'],
    playerSide: Side.w,
    rating: 1050,
  ),
  PuzzleDefinition(
    id: 'm2_15',
    category: PuzzleCategory.mateIn2,
    fen: 'r1b1kb1r/ppppqppp/2n5/1B2n3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 5',
    solutionUci: ['f3e5', 'c6e5', 'd1h5'],
    playerSide: Side.w,
    rating: 800,
  ),
  PuzzleDefinition(
    id: 'm2_16',
    category: PuzzleCategory.mateIn2,
    fen: 'r1b2b1r/ppp2kpp/8/3np3/2B2q2/2N5/PPPQ1PPP/R3K2R w KQ - 0 1',
    solutionUci: ['c4d5', 'f7f8', 'd2d8'],
    playerSide: Side.w,
    rating: 900,
  ),
  PuzzleDefinition(
    id: 'm2_17',
    category: PuzzleCategory.mateIn2,
    fen: 'r1bqr1k1/pppn1ppp/3p1n2/4p1N1/2B1P3/3P4/PPP2PPP/R1BQR1K1 w - - 0 1',
    solutionUci: ['g5f7', 'f6e4', 'f7d8'],
    playerSide: Side.w,
    rating: 1100,
  ),
  PuzzleDefinition(
    id: 'm2_18',
    category: PuzzleCategory.mateIn2,
    fen: 'r1bqkbnr/1ppp1ppp/p1B5/4p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 3',
    solutionUci: ['d7c6', 'f3e5', 'd8g5'],
    playerSide: Side.b,
    rating: 850,
  ),
  PuzzleDefinition(
    id: 'm2_19',
    category: PuzzleCategory.mateIn2,
    fen: 'r2qk2r/ppp1bppp/2n1b3/3np3/8/P2P4/1PP1NPPP/RNBQKB1R b KQkq - 0 6',
    solutionUci: ['d5f4', 'e2g3', 'e6a2'],
    playerSide: Side.b,
    rating: 1000,
  ),
  PuzzleDefinition(
    id: 'm2_20',
    category: PuzzleCategory.mateIn2,
    fen: '4Qbk1/5pp1/6np/8/3B4/8/5PPP/6K1 w - - 0 1',
    solutionUci: ['e8f8', 'g8h7', 'd4g7'],
    playerSide: Side.w,
    rating: 750,
  ),
  PuzzleDefinition(
    id: 'm2_21',
    category: PuzzleCategory.mateIn2,
    fen: 'r4b1r/pppk1p1p/4b1p1/n2Bp3/4P1Q1/2N5/PPP2PPP/R3K2R w KQ - 0 1',
    solutionUci: ['g4g7', 'e6f7', 'd5f7'],
    playerSide: Side.w,
    rating: 1050,
  ),
  PuzzleDefinition(
    id: 'm2_22',
    category: PuzzleCategory.mateIn2,
    fen: '6k1/p4ppp/1p6/8/3Nr3/8/r4PPP/1R1R2K1 b - - 0 1',
    solutionUci: ['a2a1', 'd1a1', 'e4e1'],
    playerSide: Side.b,
    rating: 900,
  ),
  PuzzleDefinition(
    id: 'm2_23',
    category: PuzzleCategory.mateIn2,
    fen: 'r3kb1r/pp1b1ppp/1qn1p3/3pN3/3P1B2/2PB4/PP3PPP/RN1QK2R w KQkq - 0 1',
    solutionUci: ['d3h7', 'b6b2', 'd1a4'],
    playerSide: Side.w,
    rating: 1150,
  ),
  PuzzleDefinition(
    id: 'm2_24',
    category: PuzzleCategory.mateIn2,
    fen: 'r4rk1/pppb1ppp/3p4/3Pn2q/4PN2/6PP/PP3PBK/R2Q1R2 b - - 0 1',
    solutionUci: ['h5h3', 'h2g1', 'h3h1'],
    playerSide: Side.b,
    rating: 1050,
  ),
  PuzzleDefinition(
    id: 'm2_25',
    category: PuzzleCategory.mateIn2,
    fen: 'r3r1k1/ppp2ppp/2n2n2/3q4/3P4/B3BN2/P4PPP/R2Q1RK1 b - - 0 1',
    solutionUci: ['d5f3', 'g2f3', 'c6d4'],
    playerSide: Side.b,
    rating: 1100,
  ),

  PuzzleDefinition(
    id: 'm3_01',
    category: PuzzleCategory.mateIn3,
    fen: '2bqkbn1/2pppp2/np2N3/6p1/1PB5/4Q3/P1PP1PPP/RN2K2R w KQ - 0 1',
    solutionUci: ['e3a7', 'b6c8', 'a7a8', 'c8b6', 'c4e6'],
    playerSide: Side.w,
    rating: 1200,
  ),
  PuzzleDefinition(
    id: 'm3_02',
    category: PuzzleCategory.mateIn3,
    fen:
        'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
    solutionUci: ['f3f7', 'e8d8', 'f7f6', 'g7f6', 'c4g8'],
    playerSide: Side.w,
    rating: 1300,
  ),
  PuzzleDefinition(
    id: 'm3_03',
    category: PuzzleCategory.mateIn3,
    fen: 'r2qkb1r/pp2nppp/3p4/2pNP1B1/2B5/3P4/PPP2PPP/R2bK2R w KQkq - 0 1',
    solutionUci: ['d5f6', 'g7f6', 'c4f7', 'e8d7', 'e5f6'],
    playerSide: Side.w,
    rating: 1250,
  ),
  PuzzleDefinition(
    id: 'm3_04',
    category: PuzzleCategory.mateIn3,
    fen: 'rn3rk1/pbppq1pp/1p2pb2/4N2Q/3PN3/3B4/PPP2PPP/R3K2R w KQ - 0 1',
    solutionUci: ['h5h7', 'g8f7', 'h7g6', 'f7e7', 'g6g7'],
    playerSide: Side.w,
    rating: 1400,
  ),
  PuzzleDefinition(
    id: 'm3_05',
    category: PuzzleCategory.mateIn3,
    fen:
        'r1bqr1k1/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP1NPPP/R1BQK2R w KQ - 0 7',
    solutionUci: ['c4f7', 'g8h8', 'f7e8', 'f6e8', 'd1h5'],
    playerSide: Side.w,
    rating: 1350,
  ),
  PuzzleDefinition(
    id: 'm3_06',
    category: PuzzleCategory.mateIn3,
    fen: '5rk1/5ppp/pq6/1p1b4/2nP4/1PP2N2/P4PPP/R2QR1K1 b - - 0 1',
    solutionUci: ['b6f2', 'g1h1', 'f2g2', 'f3g1', 'd5f3'],
    playerSide: Side.b,
    rating: 1300,
  ),
  PuzzleDefinition(
    id: 'm3_07',
    category: PuzzleCategory.mateIn3,
    fen: 'r1b2rk1/ppq2ppp/2p5/4Nb2/2BP4/7Q/PPP2PPP/R3R1K1 w - - 0 1',
    solutionUci: ['h3h7', 'g8f7', 'h7g6', 'f7e7', 'g6g7'],
    playerSide: Side.w,
    rating: 1350,
  ),
  PuzzleDefinition(
    id: 'm3_08',
    category: PuzzleCategory.mateIn3,
    fen: 'r1bq2kr/pppp1pBp/2n5/2b1p3/2B1P1n1/3P1N2/PPP2PPP/RN1QK2R w KQ - 0 1',
    solutionUci: ['d1b3', 'f7f6', 'b3g8', 'a8g8', 'g7f6'],
    playerSide: Side.w,
    rating: 1400,
  ),
  PuzzleDefinition(
    id: 'm3_09',
    category: PuzzleCategory.mateIn3,
    fen: 'r1bq1rk1/pp1nbppp/2p1p3/3pP3/3P1B2/3BPN2/PPP2PPP/R2Q1RK1 w - - 0 1',
    solutionUci: ['d3h7', 'g8h7', 'f3g5', 'h7g8', 'd1h5'],
    playerSide: Side.w,
    rating: 1450,
  ),
  PuzzleDefinition(
    id: 'm3_10',
    category: PuzzleCategory.mateIn3,
    fen: 'r1b1kbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 2 3',
    solutionUci: ['f3f7', 'e8d8', 'c4g8', 'f8e7', 'f7f8'],
    playerSide: Side.w,
    rating: 1200,
  ),
  PuzzleDefinition(
    id: 'm3_11',
    category: PuzzleCategory.mateIn3,
    fen: 'r3k2r/ppp2Npp/1b6/3np1Q1/8/8/PPP2qPP/RNB1K2R b KQkq - 0 1',
    solutionUci: ['f2e1', 'c1d2', 'e1d2', 'a1d1', 'd5f4'],
    playerSide: Side.b,
    rating: 1350,
  ),
  PuzzleDefinition(
    id: 'm3_12',
    category: PuzzleCategory.mateIn3,
    fen: 'r1bq1b1r/pppp1p1p/2n3pk/4N3/2B2P2/8/PPPP2PP/RNBQK2R w KQ - 0 7',
    solutionUci: ['d1d5', 'f7f6', 'd5g8', 'h6h5', 'e5g6'],
    playerSide: Side.w,
    rating: 1300,
  ),
  PuzzleDefinition(
    id: 'm3_13',
    category: PuzzleCategory.mateIn3,
    fen: 'r4rk1/ppp2ppp/8/3Pb3/4n1nq/3B3P/PPPB1PP1/RN1QR1K1 b - - 0 1',
    solutionUci: ['h4h3', 'g2h3', 'e5h2', 'g1h1', 'g4f2'],
    playerSide: Side.b,
    rating: 1400,
  ),
  PuzzleDefinition(
    id: 'm3_14',
    category: PuzzleCategory.mateIn3,
    fen: '2r3k1/5pp1/p6p/1pn1P3/2rp1P1P/1P4P1/P1R2RK1/4B3 b - - 0 1',
    solutionUci: ['c4c2', 'f2c2', 'c5e4', 'c2c8', 'd4d3'],
    playerSide: Side.b,
    rating: 1500,
  ),
  PuzzleDefinition(
    id: 'm3_15',
    category: PuzzleCategory.mateIn3,
    fen: '1rbq1rk1/p1b1nppp/1p2p3/8/1B1pN3/P2B4/1P3PPP/2RQ1RK1 w - - 0 1',
    solutionUci: ['e4f6', 'e7f6', 'd3h7', 'g8h7', 'd1h5'],
    playerSide: Side.w,
    rating: 1350,
  ),
  PuzzleDefinition(
    id: 'm3_16',
    category: PuzzleCategory.mateIn3,
    fen: 'r2qr1k1/p4ppp/bp2pn2/2ppN1B1/8/P2P4/1PP1QPPP/R4RK1 w - - 0 1',
    solutionUci: ['e5f7', 'e8e7', 'f7d8', 'a8d8', 'e2e6'],
    playerSide: Side.w,
    rating: 1400,
  ),
  PuzzleDefinition(
    id: 'm3_17',
    category: PuzzleCategory.mateIn3,
    fen: 'rnbq1rk1/pppp1ppp/4pn2/8/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 4 4',
    solutionUci: ['d1d3', 'f6e4', 'd3h7', 'g8f8', 'h7h8'],
    playerSide: Side.w,
    rating: 1250,
  ),
  PuzzleDefinition(
    id: 'm3_18',
    category: PuzzleCategory.mateIn3,
    fen: 'r1b1k1nr/pppp1ppp/2n5/2b1P3/5Bq1/3P1N2/PPP3PP/RN1QKB1R b KQkq - 0 5',
    solutionUci: ['g4f3', 'g2f3', 'c5d4', 'c2c3', 'c6b4'],
    playerSide: Side.b,
    rating: 1300,
  ),
  PuzzleDefinition(
    id: 'm3_19',
    category: PuzzleCategory.mateIn3,
    fen: 'r1b1r1k1/1pq1bppp/p1p2n2/4p1N1/4P3/1BN1Q3/PPP2PPP/R4RK1 w - - 0 1',
    solutionUci: ['g5f7', 'g8h8', 'e3h6', 'e7h4', 'f7g5'],
    playerSide: Side.w,
    rating: 1450,
  ),
  PuzzleDefinition(
    id: 'm3_20',
    category: PuzzleCategory.mateIn3,
    fen: '2r3k1/1b3ppp/1q2pn2/1pp5/8/1P1B4/PBQ2PPP/3R2K1 w - - 0 1',
    solutionUci: ['d3h7', 'f6h7', 'c2g6', 'f7g6', 'd1d8'],
    playerSide: Side.w,
    rating: 1500,
  ),
  PuzzleDefinition(
    id: 'm3_21',
    category: PuzzleCategory.mateIn3,
    fen: 'r1b2rk1/2q1bppp/p1p1p3/2npP1N1/3N4/3B4/PPP2PPP/R2Q1RK1 w - - 0 1',
    solutionUci: ['d3h7', 'g8h8', 'd1h5', 'e7g5', 'h5h7'],
    playerSide: Side.w,
    rating: 1350,
  ),
  PuzzleDefinition(
    id: 'm3_22',
    category: PuzzleCategory.mateIn3,
    fen: 'r4rk1/ppqb1ppp/2n1p1n1/2ppP3/3P1P2/2PBBN2/PP1Q2PP/R4RK1 w - - 0 1',
    solutionUci: ['d3h7', 'g8h7', 'f3g5', 'h7g8', 'd2h6'],
    playerSide: Side.w,
    rating: 1400,
  ),
  PuzzleDefinition(
    id: 'm3_23',
    category: PuzzleCategory.mateIn3,
    fen: 'r1b2rk1/pppp1ppp/2n2q2/2b5/2BNP3/8/PPP2PPP/RNBQ1RK1 b - - 0 7',
    solutionUci: ['f6f2', 'f1f2', 'c5f2', 'g1h1', 'c6d4'],
    playerSide: Side.b,
    rating: 1350,
  ),
  PuzzleDefinition(
    id: 'm3_24',
    category: PuzzleCategory.mateIn3,
    fen: 'r1bqkb1r/1ppp1ppp/p1n2n2/4p1N1/2B1P3/8/PPPP1PPP/RNBQK2R w KQkq - 0 4',
    solutionUci: ['g5f7', 'e8e7', 'd1h5', 'c6d4', 'h5f7'],
    playerSide: Side.w,
    rating: 1200,
  ),
  PuzzleDefinition(
    id: 'm3_25',
    category: PuzzleCategory.mateIn3,
    fen: 'r2q1rk1/ppp2ppp/2n1bn2/2bpp1B1/4P3/2NP1N2/PPP1QPPP/R3KB1R w KQ - 0 7',
    solutionUci: ['e2b5', 'd8d7', 'b5b3', 'f6e4', 'b3f7'],
    playerSide: Side.w,
    rating: 1500,
  ),
];
