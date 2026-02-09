export const TIME_VALUES_MINUTES = [1, 2, 3, 5, 10, 15, 30];
export const DIFFICULTY_VALUES_LEVEL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Training mode: number of moves before opening phase ends
export const TRAINING_OPENING_MOVE_THRESHOLD = 20;
export const DIFFICULTY_VALUES_ELO = [300, 400, 500, 700, 900, 1100, 1400, 1700, 2000, 2400];

// How long Stockfish thinks per move at each difficulty level (ms).
// Higher ELOs need deeper search for UCI_LimitStrength to produce meaningfully
// different play — at 1s, 1800 and 2400 are nearly indistinguishable.
export const DIFFICULTY_THINK_TIME_MS = [500, 500, 500, 750, 750, 1000, 1250, 1500, 2000, 2250];
