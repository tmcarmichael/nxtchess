import 'dart:async';

import 'package:dartchess/dartchess.dart' as dc;
import 'package:flutter/foundation.dart';
import 'package:multistockfish/multistockfish.dart';

class EngineLine {
  final double score;
  final int? mate;
  final List<String> pv;
  final List<String> pvSan;

  const EngineLine({
    required this.score,
    this.mate,
    required this.pv,
    required this.pvSan,
  });
}

class EngineAnalysis {
  final double score;
  final int? mate;
  final int depth;
  final List<EngineLine> lines;
  final bool isThinking;

  const EngineAnalysis({
    required this.score,
    this.mate,
    required this.depth,
    required this.lines,
    required this.isThinking,
  });
}

class AnalysisEngineService {
  static final _multipvRegex = RegExp(r'multipv (\d+)');
  static final _depthRegex = RegExp(r'depth (\d+)');
  static final _scoreCpRegex = RegExp(r'score cp (-?\d+)');
  static final _scoreMateRegex = RegExp(r'score mate (-?\d+)');
  static final _pvRegex = RegExp(r'pv (.+)$');

  Stockfish? _stockfish;
  StreamSubscription<String>? _subscription;
  bool _isInitialized = false;
  int _multiPV = 5;

  void Function(EngineAnalysis)? _onProgress;
  Completer<EngineAnalysis>? _analyzeCompleter;
  final Map<int, EngineLine> _lines = {};
  int _currentDepth = 0;
  int _lastReportedDepth = 0;
  String _currentFen = '';
  String _currentSideToMove = 'w';
  bool _discardNextBestmove = false;

  Future<void> init() async {
    if (_isInitialized) return;

    _stockfish = Stockfish();
    final readyCompleter = Completer<void>();

    _subscription = _stockfish!.stdout.listen((line) {
      if (line.contains('uciok') && !readyCompleter.isCompleted) {
        readyCompleter.complete();
      }
      _processLine(line);
    });

    _stockfish!.stdin = 'uci';
    try {
      await readyCompleter.future.timeout(
        const Duration(seconds: 15),
        onTimeout: () => throw TimeoutException('Analysis engine init timeout'),
      );
    } catch (e) {
      unawaited(_subscription?.cancel());
      _subscription = null;
      _stockfish?.dispose();
      _stockfish = null;
      rethrow;
    }

    _stockfish!.stdin = 'setoption name UCI_AnalyseMode value true';
    _stockfish!.stdin = 'setoption name MultiPV value $_multiPV';

    _isInitialized = true;
  }

  Future<EngineAnalysis> analyze(
    String fen, {
    int timeMs = 10000,
    void Function(EngineAnalysis)? onProgress,
  }) async {
    if (!_isInitialized) await init();

    stopAnalysis();

    _currentFen = fen;
    _currentSideToMove = fen.split(' ').length > 1 ? fen.split(' ')[1] : 'w';
    _onProgress = onProgress;
    _lines.clear();
    _currentDepth = 0;
    _lastReportedDepth = 0;
    _analyzeCompleter = Completer<EngineAnalysis>();

    _stockfish!.stdin = 'position fen $fen';
    _stockfish!.stdin = 'go movetime $timeMs';

    return _analyzeCompleter!.future.timeout(
      Duration(milliseconds: timeMs + 5000),
      onTimeout: () {
        _stockfish?.stdin = 'stop';
        return _buildCurrentAnalysis(isThinking: false);
      },
    );
  }

  void _processLine(String line) {
    if (_analyzeCompleter == null || _analyzeCompleter!.isCompleted) return;

    if (line.startsWith('bestmove') && _discardNextBestmove) {
      _discardNextBestmove = false;
      return;
    }

    if (line.startsWith('info depth')) {
      final parsed = _parseInfoLine(line);
      if (parsed != null) {
        _lines[parsed.multipv] = parsed.line;
        if (parsed.depth > _currentDepth) _currentDepth = parsed.depth;

        final hasAllLines = parsed.multipv == _multiPV;
        final isNewDepth = parsed.depth > _lastReportedDepth;

        if (_onProgress != null && hasAllLines && isNewDepth) {
          _lastReportedDepth = parsed.depth;
          _onProgress!(_buildCurrentAnalysis(isThinking: true));
        }
      }
    } else if (line.startsWith('bestmove')) {
      final analysis = _buildCurrentAnalysis(isThinking: false);
      if (!_analyzeCompleter!.isCompleted) {
        _analyzeCompleter!.complete(analysis);
      }
    }
  }

  EngineAnalysis _buildCurrentAnalysis({required bool isThinking}) {
    final sortedLines = _lines.entries.toList()
      ..sort((a, b) => a.key.compareTo(b.key));
    final linesList = sortedLines.map((e) => e.value).toList();
    final bestLine = linesList.isNotEmpty ? linesList.first : null;

    return EngineAnalysis(
      score: bestLine?.score ?? 0,
      mate: bestLine?.mate,
      depth: _currentDepth,
      lines: linesList,
      isThinking: isThinking,
    );
  }

  ({int multipv, int depth, EngineLine line})? _parseInfoLine(String line) {
    final multipvMatch = _multipvRegex.firstMatch(line);
    final multipv = multipvMatch != null
        ? int.parse(multipvMatch.group(1)!)
        : 1;

    final depthMatch = _depthRegex.firstMatch(line);
    if (depthMatch == null) return null;
    final depth = int.parse(depthMatch.group(1)!);

    double score = 0;
    int? mate;

    final scoreCpMatch = _scoreCpRegex.firstMatch(line);
    final scoreMateMatch = _scoreMateRegex.firstMatch(line);

    if (scoreCpMatch != null) {
      score = int.parse(scoreCpMatch.group(1)!) / 100.0;
      if (_currentSideToMove == 'b') score = -score;
    } else if (scoreMateMatch != null) {
      mate = int.parse(scoreMateMatch.group(1)!);
      if (_currentSideToMove == 'b') mate = -mate;
      score = mate > 0 ? 999.0 - mate.abs() : -999.0 + mate.abs();
    }

    final pvMatch = _pvRegex.firstMatch(line);
    if (pvMatch == null) return null;

    final pv = pvMatch.group(1)!.split(' ').where(_isValidUciMove).toList();
    if (pv.isEmpty) return null;

    final pvSan = _convertPvToSan(_currentFen, pv);

    return (
      multipv: multipv,
      depth: depth,
      line: EngineLine(score: score, mate: mate, pv: pv, pvSan: pvSan),
    );
  }

  bool _isValidUciMove(String move) {
    if (move.length < 4 || move.length > 5) return false;
    const files = 'abcdefgh';
    const ranks = '12345678';
    if (!files.contains(move[0]) || !ranks.contains(move[1])) return false;
    if (!files.contains(move[2]) || !ranks.contains(move[3])) return false;
    if (move.length == 5 && !['q', 'r', 'b', 'n'].contains(move[4])) {
      return false;
    }
    return true;
  }

  List<String> _convertPvToSan(String fen, List<String> pv) {
    try {
      dc.Position pos = dc.Chess.fromSetup(dc.Setup.parseFen(fen));
      final sanMoves = <String>[];

      for (final uciMove in pv) {
        final move = dc.Move.parse(uciMove);
        if (move == null || !pos.isLegal(move)) break;
        final (newPos, san) = pos.makeSan(move);
        pos = newPos;
        sanMoves.add(san);
      }

      return sanMoves;
    } catch (e) {
      if (kDebugMode) debugPrint('AnalysisEngineService._uciToSan error: $e');
      return pv;
    }
  }

  void stopAnalysis() {
    if (_analyzeCompleter != null && !_analyzeCompleter!.isCompleted) {
      _discardNextBestmove = true;
    }
    _stockfish?.stdin = 'stop';
  }

  void setMultiPV(int count) {
    _multiPV = count.clamp(1, 5);
    if (_isInitialized) {
      _stockfish?.stdin = 'setoption name MultiPV value $_multiPV';
    }
  }

  void dispose() {
    stopAnalysis();
    if (_analyzeCompleter != null && !_analyzeCompleter!.isCompleted) {
      _analyzeCompleter!.complete(_buildCurrentAnalysis(isThinking: false));
    }
    _subscription?.cancel();
    _stockfish?.dispose();
    _stockfish = null;
    _isInitialized = false;
  }
}
