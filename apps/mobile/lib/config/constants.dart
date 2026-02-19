const String initialFen =
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const List<int> difficultyValuesElo = [
  300,
  400,
  500,
  700,
  900,
  1100,
  1400,
  1700,
  2000,
  2400,
];

const List<int> difficultyThinkTimeMs = [
  500,
  500,
  500,
  750,
  750,
  1000,
  1250,
  1500,
  2000,
  2250,
];

const Duration autoSaveInterval = Duration(seconds: 5);
const Duration autoSaveDebounce = Duration(seconds: 1);

const Duration analysisDebounce = Duration(milliseconds: 300);
const Duration reviewMoveAnalysisDuration = Duration(milliseconds: 800);

const double winPercentageCoefficient = 0.00368208;
