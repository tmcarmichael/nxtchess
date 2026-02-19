import 'dart:async';

import 'package:multistockfish/multistockfish.dart';

class StockfishService {
  static final _scoreCpRegex = RegExp(r'score cp (-?\d+)');
  static final _scoreMateRegex = RegExp(r'score mate (-?\d+)');

  Stockfish? _stockfish;
  StreamSubscription<String>? _subscription;
  final _readyCompleter = Completer<void>();
  bool _disposed = false;

  Completer<void>? _commandLock;

  Future<void> init() async {
    _disposed = false;
    _stockfish = Stockfish();
    _subscription = _stockfish!.stdout.listen(_onOutput);
    _stockfish!.stdin = 'uci';

    return _readyCompleter.future.timeout(
      const Duration(seconds: 10),
      onTimeout: () => throw TimeoutException('Stockfish init timeout'),
    );
  }

  void _onOutput(String line) {
    if (line.contains('uciok') && !_readyCompleter.isCompleted) {
      _readyCompleter.complete();
    }
  }

  Future<void> setOption(String name, String value) async {
    _stockfish?.stdin = 'setoption name $name value $value';
  }

  Future<T> _withLock<T>(Future<T> Function() fn) async {
    while (_commandLock != null) {
      await _commandLock!.future;
    }
    if (_disposed) throw StateError('Engine disposed');
    _commandLock = Completer<void>();
    try {
      return await fn();
    } finally {
      final lock = _commandLock;
      _commandLock = null;
      lock?.complete();
    }
  }

  Future<({String from, String to, String? promotion})> getBestMove(
    String fen, {
    int moveTimeMs = 1000,
  }) async {
    if (_stockfish == null) {
      throw StateError('Engine not initialized');
    }

    return _withLock(() async {
      final completer =
          Completer<({String from, String to, String? promotion})>();

      late StreamSubscription<String> sub;
      sub = _stockfish!.stdout.listen((line) {
        if (line.startsWith('bestmove')) {
          unawaited(sub.cancel());
          final parts = line.split(' ');
          if (parts.length >= 2) {
            final uci = parts[1];
            final from = uci.substring(0, 2);
            final to = uci.substring(2, 4);
            final promotion = uci.length > 4 ? uci.substring(4) : null;
            if (!completer.isCompleted) {
              completer.complete((from: from, to: to, promotion: promotion));
            }
          }
        }
      });

      _stockfish!.stdin = 'position fen $fen';
      _stockfish!.stdin = 'go movetime $moveTimeMs';

      try {
        return await completer.future.timeout(
          Duration(milliseconds: moveTimeMs + 5000),
          onTimeout: () {
            _stockfish?.stdin = 'stop';
            throw TimeoutException('Engine move timeout');
          },
        );
      } finally {
        unawaited(sub.cancel());
      }
    });
  }

  Future<double> getEvaluation(String fen, {int depth = 12}) async {
    if (_stockfish == null) {
      throw StateError('Engine not initialized');
    }

    return _withLock(() async {
      final completer = Completer<double>();
      double lastScore = 0.0;

      late StreamSubscription<String> sub;
      sub = _stockfish!.stdout.listen((line) {
        if (line.contains('score cp')) {
          final match = _scoreCpRegex.firstMatch(line);
          if (match != null) {
            lastScore = int.parse(match.group(1)!) / 100.0;
          }
        } else if (line.contains('score mate')) {
          final match = _scoreMateRegex.firstMatch(line);
          if (match != null) {
            final mateIn = int.parse(match.group(1)!);
            lastScore = mateIn > 0 ? 999.0 : -999.0;
          }
        } else if (line.startsWith('bestmove')) {
          unawaited(sub.cancel());
          if (!completer.isCompleted) {
            completer.complete(lastScore);
          }
        }
      });

      _stockfish!.stdin = 'position fen $fen';
      _stockfish!.stdin = 'go depth $depth';

      try {
        return await completer.future.timeout(
          const Duration(seconds: 10),
          onTimeout: () {
            _stockfish?.stdin = 'stop';
            return lastScore;
          },
        );
      } finally {
        unawaited(sub.cancel());
      }
    });
  }

  void stop() {
    _stockfish?.stdin = 'stop';
  }

  void dispose() {
    _disposed = true;
    _subscription?.cancel();
    _stockfish?.dispose();
    _stockfish = null;
    final lock = _commandLock;
    _commandLock = null;
    lock?.complete();
  }
}
