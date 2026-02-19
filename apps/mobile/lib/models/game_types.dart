enum Side { w, b }

enum SideSelection { w, b, random }

enum GameWinner { w, b, draw }

enum GameOverReason {
  checkmate,
  stalemate,
  time,
  resignation,
  disconnection,
  abandonment,
  insufficientMaterial,
  threefoldRepetition,
  fiftyMoveRule,
}

enum GamePhase { opening, middlegame, endgame }

enum GameMode { play, training, analysis, puzzle }

enum PuzzleCategory { mateIn1, mateIn2, mateIn3, random }

enum OpponentType { ai, human }

enum RatedMode { rated, casual }

enum GameLifecycle { idle, initializing, playing, error, ended }
