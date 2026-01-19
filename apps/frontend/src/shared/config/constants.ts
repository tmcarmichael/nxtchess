import { type AIPlayStyle } from '../../types/game';

export const TIME_VALUES_MINUTES = [1, 2, 3, 5, 10, 15, 30];
export const DIFFICULTY_VALUES_LEVEL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Training mode: number of moves before opening phase ends
export const TRAINING_OPENING_MOVE_THRESHOLD = 20;
export const DIFFICULTY_VALUES_ELO = [300, 400, 500, 700, 900, 1100, 1400, 1700, 2000, 2400];

interface StyleConfig {
  contempt: number;
  aggressiveness: number;
}
export const PLAYSTYLE_PRESETS: Record<Exclude<AIPlayStyle, null>, StyleConfig> = {
  aggressive: { contempt: 100, aggressiveness: 100 },
  defensive: { contempt: -50, aggressiveness: 0 },
  balanced: { contempt: 0, aggressiveness: 50 },
  positional: { contempt: 20, aggressiveness: 30 },
  random: {
    contempt: Math.floor(Math.random() * 201) - 100,
    aggressiveness: Math.floor(Math.random() * 101),
  },
};
