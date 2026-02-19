import 'dart:async';
import 'dart:math';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter/services.dart';

const _pieceNames = ['wB', 'wK', 'wN', 'wP', 'wQ', 'wR'];
const _maxPieces = 40;
const _initialCount = 35;
const _baseSize = 500.0;

class _FloatingPiece {
  final int assetIndex;
  final double duration;
  final double startTime;
  final double yOffset;
  final List<double> rotations;

  const _FloatingPiece({
    required this.assetIndex,
    required this.duration,
    required this.startTime,
    required this.yOffset,
    required this.rotations,
  });
}

class FloatingPiecesLayer extends StatefulWidget {
  const FloatingPiecesLayer({super.key});

  @override
  State<FloatingPiecesLayer> createState() => _FloatingPiecesLayerState();
}

class _FloatingPiecesLayerState extends State<FloatingPiecesLayer>
    with SingleTickerProviderStateMixin {
  static const _firstHalf = Cubic(0.3, 0.3, 0.7, 0.82);
  static const _secondHalf = Cubic(0.3, 0.18, 0.7, 0.7);

  final _rng = Random();
  final _pieces = <_FloatingPiece>[];
  final _images = <ui.Image>[];
  final _elapsed = ValueNotifier<double>(0.0);
  Ticker? _ticker;
  Timer? _spawnTimer;

  @override
  void initState() {
    super.initState();
    _loadImages();
  }

  Future<void> _loadImages() async {
    final loaded = await Future.wait(
      _pieceNames.map((name) async {
        final data = await rootBundle.load(
          'packages/chessground/assets/piece_sets/cburnett/$name.png',
        );
        final codec = await ui.instantiateImageCodec(data.buffer.asUint8List());
        final frame = await codec.getNextFrame();
        return frame.image;
      }),
    );
    if (!mounted) return;
    _images.addAll(loaded);

    for (var i = 0; i < _initialCount; i++) {
      _pieces.add(_createPiece(preScattered: true));
    }
    _ticker = createTicker(_onTick);
    unawaited(_ticker!.start());
    _scheduleSpawn();
    setState(() {});
  }

  _FloatingPiece _createPiece({bool preScattered = false, double? atTime}) {
    final t = atTime ?? _elapsed.value;
    final speed = 0.8 + _rng.nextDouble() * 0.4;
    final dur = 20.0 / speed;
    return _FloatingPiece(
      assetIndex: _rng.nextInt(_pieceNames.length),
      duration: dur,
      startTime: preScattered ? t - _rng.nextDouble() * 0.85 * dur : t,
      yOffset: _rng.nextDouble() * 460 - 240,
      rotations: List.generate(
        5,
        (_) => (_rng.nextDouble() * 30 - 15) * pi / 180,
      ),
    );
  }

  void _onTick(Duration elapsed) {
    final secs = elapsed.inMicroseconds / 1e6;
    final gap = secs - _elapsed.value;

    _pieces.removeWhere((p) => (secs - p.startTime) / p.duration >= 1.0);

    if (gap > 1.0 && _pieces.length < _initialCount) {
      for (var i = _pieces.length; i < _initialCount; i++) {
        _pieces.add(_createPiece(preScattered: true, atTime: secs));
      }
    }

    _elapsed.value = secs;
  }

  void _scheduleSpawn() {
    _spawnTimer = Timer(Duration(milliseconds: 400 + _rng.nextInt(601)), () {
      if (!mounted) return;
      if (_pieces.length < _maxPieces) {
        _pieces.add(_createPiece());
      }
      _scheduleSpawn();
    });
  }

  @override
  void dispose() {
    _ticker?.dispose();
    _spawnTimer?.cancel();
    _elapsed.dispose();
    for (final img in _images) {
      img.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_images.isEmpty) return const SizedBox();
    return IgnorePointer(
      child: RepaintBoundary(
        child: CustomPaint(
          painter: _FloatingPiecesPainter(
            pieces: _pieces,
            images: _images,
            elapsed: _elapsed,
            firstHalf: _firstHalf,
            secondHalf: _secondHalf,
          ),
          isComplex: true,
        ),
      ),
    );
  }
}

class _FloatingPiecesPainter extends CustomPainter {
  final List<_FloatingPiece> pieces;
  final List<ui.Image> images;
  final ValueNotifier<double> elapsed;
  final Cubic firstHalf;
  final Cubic secondHalf;

  final _paint = Paint()
    ..color = const Color(0x08FFFFFF)
    ..filterQuality = FilterQuality.low;

  _FloatingPiecesPainter({
    required this.pieces,
    required this.images,
    required this.elapsed,
    required this.firstHalf,
    required this.secondHalf,
  }) : super(repaint: elapsed);

  @override
  void paint(Canvas canvas, Size size) {
    final now = elapsed.value;
    final centerY = size.height / 2;

    for (final p in pieces) {
      final t = ((now - p.startTime) / p.duration).clamp(0.0, 1.0);
      if (t <= 0.0) continue;

      double easedX, scale, yFactor;
      if (t < 0.5) {
        final e = firstHalf.transform((t * 2).clamp(0.0, 1.0));
        easedX = -0.1 + 0.6 * e;
        scale = 0.05 + 0.13 * e;
        yFactor = 0.15 + 0.85 * e;
      } else {
        final e = secondHalf.transform(((t - 0.5) * 2).clamp(0.0, 1.0));
        easedX = 0.5 + 0.6 * e;
        scale = 0.18 - 0.13 * e;
        yFactor = 1.0 - 0.85 * e;
      }

      final x = easedX * size.width;
      final y = centerY + p.yOffset * yFactor;

      final ri = (t * 4).clamp(0.0, 3.999);
      final idx = ri.floor();
      final frac = ri - idx;
      final rot =
          p.rotations[idx] + (p.rotations[idx + 1] - p.rotations[idx]) * frac;

      final img = images[p.assetIndex];
      final drawSize = _baseSize * scale;
      final half = drawSize / 2;

      canvas.save();
      canvas.translate(x, y);
      canvas.rotate(rot);
      canvas.drawImageRect(
        img,
        Rect.fromLTWH(0, 0, img.width.toDouble(), img.height.toDouble()),
        Rect.fromLTWH(-half, -half, drawSize, drawSize),
        _paint,
      );
      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(covariant _FloatingPiecesPainter old) => true;
}
