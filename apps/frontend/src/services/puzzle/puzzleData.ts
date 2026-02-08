import type { Side, PuzzleCategory } from '../../types/game';

export interface PuzzleDefinition {
  id: string;
  category: Exclude<PuzzleCategory, 'random'>;
  fen: string;
  solutionUci: string[];
  playerSide: Side;
  rating?: number;
}

export function uciToFromTo(uci: string): { from: string; to: string; promotion?: string } {
  return {
    from: uci.slice(0, 2),
    to: uci.slice(2, 4),
    promotion: uci.length === 5 ? uci[4] : undefined,
  };
}

const MATE_IN_1_PUZZLES: PuzzleDefinition[] = [
  {
    id: 'PdtlJ',
    category: 'mate-in-1',
    fen: '5k2/p1R4P/3N2p1/8/3b1p2/8/7r/4K3 w - - 0 40',
    solutionUci: ['c7f7'],
    playerSide: 'w',
  },
  {
    id: 'L96CO',
    category: 'mate-in-1',
    fen: '4k3/p1R5/7R/4P3/2P5/4n1P1/4r2P/7K b - - 4 35',
    solutionUci: ['e2e1'],
    playerSide: 'b',
  },
  {
    id: '2n1v4',
    category: 'mate-in-1',
    fen: '8/7B/8/K1k1p1R1/7p/4r3/8/8 b - - 3 60',
    solutionUci: ['e3a3'],
    playerSide: 'b',
  },
  {
    id: 'ZJjp8',
    category: 'mate-in-1',
    fen: '8/7p/6k1/2N3p1/P2R2K1/r7/5P1P/8 b - - 6 43',
    solutionUci: ['h7h5'],
    playerSide: 'b',
  },
  {
    id: 'E38k9',
    category: 'mate-in-1',
    fen: '8/1R5p/p3p1p1/2p1N2k/5P2/3P2bP/r5P1/7K w - - 3 30',
    solutionUci: ['b7h7'],
    playerSide: 'w',
  },
  {
    id: '42o6O',
    category: 'mate-in-1',
    fen: '1R4bk/7p/1p1r1p2/2p5/6R1/7P/r5P1/6K1 w - - 6 35',
    solutionUci: ['g4g8'],
    playerSide: 'w',
  },
  {
    id: 'c3T7E',
    category: 'mate-in-1',
    fen: '6k1/6p1/8/3r4/2N5/R5p1/6P1/6K1 b - - 1 42',
    solutionUci: ['d5d1'],
    playerSide: 'b',
  },
  {
    id: 'tH487',
    category: 'mate-in-1',
    fen: '5r1k/1p1R2p1/p7/2b1Qr1p/1q6/5P1P/P5P1/3R3K w - - 6 42',
    solutionUci: ['e5g7'],
    playerSide: 'w',
  },
  {
    id: 'b62Q3',
    category: 'mate-in-1',
    fen: '8/p4p2/3r1n2/2N1K1k1/1P4P1/4P3/8/5R2 b - - 6 40',
    solutionUci: ['d6d5'],
    playerSide: 'b',
  },
  {
    id: 'd9867',
    category: 'mate-in-1',
    fen: '4n1R1/4P3/8/5K1k/7P/8/1p6/4r3 w - - 0 58',
    solutionUci: ['g8h8'],
    playerSide: 'w',
  },
  {
    id: 'lmyp2',
    category: 'mate-in-1',
    fen: '6Q1/1R6/3b3k/2q3p1/8/8/6P1/7K b - - 5 75',
    solutionUci: ['c5c1'],
    playerSide: 'b',
  },
  {
    id: 'V9A4j',
    category: 'mate-in-1',
    fen: '8/3B3p/r7/3P2P1/1q6/kP3p2/2Q4P/2K5 w - - 1 50',
    solutionUci: ['c2b2'],
    playerSide: 'w',
  },
  {
    id: 'c2s9C',
    category: 'mate-in-1',
    fen: '8/5k1p/p1p3p1/1p4K1/3P1BN1/1P6/P1P2P2/7r b - - 7 40',
    solutionUci: ['h1h5'],
    playerSide: 'b',
  },
  {
    id: '2i52Z',
    category: 'mate-in-1',
    fen: '6r1/7k/3P3p/1p2p2Q/p3b3/P2P1R1P/1q6/5R1K b - - 0 41',
    solutionUci: ['b2g2'],
    playerSide: 'b',
  },
  {
    id: 'V9425',
    category: 'mate-in-1',
    fen: '6rk/p1R5/2p1p2K/3b1p2/5P1P/8/6r1/1R6 w - - 3 38',
    solutionUci: ['c7h7'],
    playerSide: 'w',
  },
  {
    id: 'k3x99',
    category: 'mate-in-1',
    fen: '6k1/5p2/8/p2r3p/2N5/1P3p2/P1R2P2/5K2 b - - 3 37',
    solutionUci: ['d5d1'],
    playerSide: 'b',
  },
  {
    id: '3F00e',
    category: 'mate-in-1',
    fen: '8/7R/p5p1/3k4/2n3N1/2PK1P1P/P3r1P1/8 b - - 6 30',
    solutionUci: ['e2d2'],
    playerSide: 'b',
  },
  {
    id: 'iT5e2',
    category: 'mate-in-1',
    fen: '5k2/6p1/4B2p/Q4p2/1p6/5q2/1r3P1P/5K2 w - - 1 41',
    solutionUci: ['a5d8'],
    playerSide: 'w',
  },
  {
    id: '3T5Eg',
    category: 'mate-in-1',
    fen: '5r2/p1p5/7p/3R2p1/3Q2P1/5p1q/PP3P1B/2k3K1 b - - 6 35',
    solutionUci: ['h3g2'],
    playerSide: 'b',
  },
  {
    id: 'TFEk6',
    category: 'mate-in-1',
    fen: '8/6R1/2p4p/3b3k/5R1r/8/4K3/8 w - - 0 47',
    solutionUci: ['f4f5'],
    playerSide: 'w',
  },
  {
    id: '3Z29u',
    category: 'mate-in-1',
    fen: '8/1R4p1/5k2/5p2/5K2/r7/8/3B4 b - - 5 65',
    solutionUci: ['g7g5'],
    playerSide: 'b',
  },
  {
    id: 'b8n1V',
    category: 'mate-in-1',
    fen: '8/8/8/p3R1R1/3k4/P1n5/1KP5/7r b - - 3 45',
    solutionUci: ['h1b1'],
    playerSide: 'b',
  },
  {
    id: 'I0O3Q',
    category: 'mate-in-1',
    fen: '7r/3P2k1/p4p2/1pRQ4/1P5q/P7/6P1/6K1 b - - 4 44',
    solutionUci: ['h4e1'],
    playerSide: 'b',
  },
  {
    id: 'l132b',
    category: 'mate-in-1',
    fen: '1b6/8/5R2/4P1Bp/1P1P1P2/P4k1K/8/6r1 b - - 12 70',
    solutionUci: ['g1h1'],
    playerSide: 'b',
  },
];

const MATE_IN_2_PUZZLES: PuzzleDefinition[] = [
  {
    id: 'Re1P3',
    category: 'mate-in-2',
    fen: '8/p5p1/1p5p/3n3K/8/P4k2/2R2P2/8 b - - 1 36',
    solutionUci: ['d5f4', 'h5h4', 'g7g5'],
    playerSide: 'b',
    rating: 1200,
  },
  {
    id: 'C40Q1',
    category: 'mate-in-2',
    fen: '3K1Q2/8/2k5/4q3/2P5/4B3/8/8 b - - 2 63',
    solutionUci: ['e5c7', 'd8e8', 'c7d7'],
    playerSide: 'b',
    rating: 1200,
  },
  {
    id: 'E2T7e',
    category: 'mate-in-2',
    fen: '1k1n2Q1/8/1p1p1q2/1N2p2p/B5p1/P1R3b1/6P1/6K1 b - - 1 31',
    solutionUci: ['f6f2', 'g1h1', 'f2e1'],
    playerSide: 'b',
    rating: 1200,
  },
  {
    id: '0A4J8',
    category: 'mate-in-2',
    fen: '6k1/1p3n1p/2b1N1p1/8/p2R4/1P5q/P1P5/1K3R2 w - - 2 37',
    solutionUci: ['d4d8', 'c6e8', 'd8e8'],
    playerSide: 'w',
    rating: 1200,
  },
  {
    id: '6U242',
    category: 'mate-in-2',
    fen: '2k5/2p1r3/8/2N1b3/8/7r/7P/3R1R1K b - - 1 37',
    solutionUci: ['h3h2', 'h1g1', 'e7g7'],
    playerSide: 'b',
    rating: 1200,
  },
  {
    id: 'Z6DlA',
    category: 'mate-in-2',
    fen: '4R3/7p/2p3k1/1p1p4/1R2b2P/4P1P1/2r2P2/6K1 b - - 1 42',
    solutionUci: ['c2c1', 'g1h2', 'c1h1'],
    playerSide: 'b',
    rating: 1200,
  },
  {
    id: 'NohsG',
    category: 'mate-in-2',
    fen: '6Q1/8/5P2/5k1K/6N1/8/8/1r6 b - - 0 56',
    solutionUci: ['b1h1', 'g4h2', 'h1h2'],
    playerSide: 'b',
    rating: 1200,
  },
  {
    id: 'L6H7n',
    category: 'mate-in-2',
    fen: '8/p1k2r2/2q5/8/4b1Q1/6P1/P1PR3P/1R4K1 b - - 1 33',
    solutionUci: ['c6c5', 'd2d4', 'c5d4'],
    playerSide: 'b',
    rating: 1200,
  },
  {
    id: 'g2q2l',
    category: 'mate-in-2',
    fen: '8/8/7r/3RP3/6B1/k4P2/P1P3P1/K7 b - - 0 45',
    solutionUci: ['h6h1', 'd5d1', 'h1d1'],
    playerSide: 'b',
    rating: 1200,
  },
  {
    id: 'POzqf',
    category: 'mate-in-2',
    fen: '8/1R1R1p2/6k1/4b1p1/6KP/6P1/5r2/8 b - - 0 35',
    solutionUci: ['f7f5', 'g4h3', 'g5g4'],
    playerSide: 'b',
    rating: 1200,
  },
  {
    id: 'a10hi',
    category: 'mate-in-2',
    fen: 'R7/3P1k1K/8/4PB2/8/8/p5r1/8 b - - 0 51',
    solutionUci: ['g2h2', 'f5h3', 'h2h3'],
    playerSide: 'b',
    rating: 1200,
  },
  {
    id: 'S4D6P',
    category: 'mate-in-2',
    fen: '2k4r/p7/2p2R2/2N3p1/3R4/1P1P4/P1P3r1/3K4 b - - 0 32',
    solutionUci: ['h8h1', 'f6f1', 'h1f1'],
    playerSide: 'b',
    rating: 1200,
  },
  {
    id: 'p6K5i',
    category: 'mate-in-2',
    fen: '6r1/8/p2N1p2/2P2P2/1PR3n1/P3k3/8/5K2 b - - 4 50',
    solutionUci: ['g4h2', 'f1e1', 'g8g1'],
    playerSide: 'b',
    rating: 1200,
  },
  {
    id: 'wAJN9',
    category: 'mate-in-2',
    fen: '8/7p/3R4/5p2/2B5/1P2k2P/1r4P1/5K2 b - - 0 36',
    solutionUci: ['b2b1', 'd6d1', 'b1d1'],
    playerSide: 'b',
    rating: 1200,
  },
  {
    id: 'N65Y0',
    category: 'mate-in-2',
    fen: '5B2/1P6/p1P5/8/r5k1/4n1p1/1R6/6K1 b - - 2 58',
    solutionUci: ['a4a1', 'b2b1', 'a1b1'],
    playerSide: 'b',
    rating: 1200,
  },
  {
    id: '5M22f',
    category: 'mate-in-2',
    fen: '5B2/p7/1b2k1p1/7p/5p1K/P1R4P/6P1/8 b - - 0 31',
    solutionUci: ['b6d8', 'f8e7', 'd8e7'],
    playerSide: 'b',
    rating: 1200,
  },
  {
    id: 'O3u8W',
    category: 'mate-in-2',
    fen: '6k1/R2N2p1/4p2p/7K/2r1n2P/4P1P1/8/8 b - - 0 33',
    solutionUci: ['e4g3', 'h5g6', 'c4g4'],
    playerSide: 'b',
    rating: 1200,
  },
  {
    id: '0PG7Z',
    category: 'mate-in-2',
    fen: '4r1k1/5p2/6p1/3p1q2/3P3Q/p1r5/P6P/4R1K1 w - - 0 42',
    solutionUci: ['e1e8', 'g8g7', 'h4h8'],
    playerSide: 'w',
    rating: 1200,
  },
  {
    id: '09aSK',
    category: 'mate-in-2',
    fen: '4q3/1k6/8/K7/2Q1N3/b7/8/8 b - - 21 69',
    solutionUci: ['e8a8', 'c4a6', 'a8a6'],
    playerSide: 'b',
    rating: 1200,
  },
  {
    id: 'a1T99',
    category: 'mate-in-2',
    fen: '4B2k/3R4/1P3R2/8/7r/5p2/1r6/6K1 b - - 4 53',
    solutionUci: ['b2g2', 'g1f1', 'h4h1'],
    playerSide: 'b',
    rating: 1200,
  },
  {
    id: 'DsTH1',
    category: 'mate-in-2',
    fen: '8/6p1/R3P2p/1p1p2k1/8/1p3K2/1P3Q1P/4q3 b - - 0 44',
    solutionUci: ['e1e4', 'f3g3', 'e4g4'],
    playerSide: 'b',
    rating: 1200,
  },
  {
    id: '0i6q3',
    category: 'mate-in-2',
    fen: '8/1b3rk1/1p2Q3/1P1p1q2/3P3R/4P3/3K4/8 w - - 1 45',
    solutionUci: ['e6h6', 'g7g8', 'h6h8'],
    playerSide: 'w',
    rating: 1200,
  },
  {
    id: '0658k',
    category: 'mate-in-2',
    fen: '1k5b/3R4/8/5p2/8/8/P1K1b1r1/7R w - - 0 47',
    solutionUci: ['h1h8', 'g2g8', 'h8g8'],
    playerSide: 'w',
    rating: 1200,
  },
  {
    id: 'j4t2M',
    category: 'mate-in-2',
    fen: '7r/1k5r/5R2/8/6N1/5p1P/5P1K/3R4 b - - 3 41',
    solutionUci: ['h7h3', 'h2g1', 'h3h1'],
    playerSide: 'b',
    rating: 1200,
  },
  {
    id: '5OH2v',
    category: 'mate-in-2',
    fen: '6k1/R5p1/8/3p2N1/3P2K1/8/pr4P1/r7 w - - 3 44',
    solutionUci: ['a7a8', 'b2b8', 'a8b8'],
    playerSide: 'w',
    rating: 1200,
  },
];

const MATE_IN_3_PUZZLES: PuzzleDefinition[] = [
  {
    id: '9NcNe',
    category: 'mate-in-3',
    fen: 'r6r/2R3p1/p3p3/4N3/3k1P2/4b3/4K2p/R7 w - - 2 38',
    solutionUci: ['c7c4', 'd4d5', 'a1d1', 'e3d2', 'd1d2'],
    playerSide: 'w',
    rating: 1600,
  },
  {
    id: 't2Z6x',
    category: 'mate-in-3',
    fen: '2r1k3/2q1b2p/4P3/p2p1Q2/3P4/2p1K1P1/P7/2R5 w - - 1 33',
    solutionUci: ['f5f7', 'e8d8', 'f7g8', 'e7f8', 'g8f8'],
    playerSide: 'w',
    rating: 1600,
  },
  {
    id: '60Z9a',
    category: 'mate-in-3',
    fen: '7k/6p1/1Q3p2/2B4p/P2P4/4b3/1P4PP/3qRK2 b - - 8 35',
    solutionUci: ['d1d3', 'e1e2', 'd3f5', 'f1e1', 'f5b1'],
    playerSide: 'b',
    rating: 1600,
  },
  {
    id: 'Z02C6',
    category: 'mate-in-3',
    fen: '6k1/2p1n1p1/6P1/8/5PK1/8/4r3/1R6 w - - 1 36',
    solutionUci: ['b1b8', 'e7c8', 'b8c8', 'e2e8', 'c8e8'],
    playerSide: 'w',
    rating: 1600,
  },
  {
    id: 'eIblE',
    category: 'mate-in-3',
    fen: '7k/1p4p1/p1p3r1/2P1p3/2Q1P2K/P2R1P1P/6q1/8 w - - 5 33',
    solutionUci: ['d3d8', 'h8h7', 'c4g8', 'h7h6', 'g8h8'],
    playerSide: 'w',
    rating: 1600,
  },
  {
    id: 't1U6V',
    category: 'mate-in-3',
    fen: '6k1/5pp1/8/4b2P/4N2P/p2R1P2/1r6/3K4 w - - 0 48',
    solutionUci: ['d3d8', 'g8h7', 'e4g5', 'h7h6', 'd8h8'],
    playerSide: 'w',
    rating: 1600,
  },
  {
    id: 'Oh4m0',
    category: 'mate-in-3',
    fen: '8/5q2/1P6/2B1p1k1/4Qp2/6p1/6P1/7K b - - 5 53',
    solutionUci: ['f7h5', 'h1g1', 'h5d1', 'e4e1', 'd1e1'],
    playerSide: 'b',
    rating: 1600,
  },
  {
    id: 'Z0CTb',
    category: 'mate-in-3',
    fen: '6k1/5p1p/8/6P1/3p3p/3P1Qb1/q3r1P1/2R3K1 w - - 7 40',
    solutionUci: ['c1c8', 'e2e8', 'c8e8', 'g8g7', 'f3f6'],
    playerSide: 'w',
    rating: 1600,
  },
  {
    id: '0DvP3',
    category: 'mate-in-3',
    fen: '6k1/1p4p1/4b3/4N1P1/p4K1P/7r/P2R4/8 w - - 1 37',
    solutionUci: ['d2d8', 'g8h7', 'g5g6', 'h7h6', 'd8h8'],
    playerSide: 'w',
    rating: 1600,
  },
  {
    id: 'fe9x7',
    category: 'mate-in-3',
    fen: 'r5k1/1p1r1p2/p1p3p1/2Pq4/P3R1P1/2Q4P/1P6/4R1K1 w - - 1 31',
    solutionUci: ['e4e8', 'a8e8', 'e1e8', 'g8h7', 'e8h8'],
    playerSide: 'w',
    rating: 1600,
  },
  {
    id: '3479K',
    category: 'mate-in-3',
    fen: '1Q6/1p2rkp1/p3N1b1/P2p1p2/7K/2P4P/1P6/r5b1 w - - 6 35',
    solutionUci: ['e6g5', 'f7f6', 'b8d6', 'e7e6', 'd6e6'],
    playerSide: 'w',
    rating: 1600,
  },
  {
    id: 'q635f',
    category: 'mate-in-3',
    fen: '3RQ3/6p1/2p2k1p/2p2p2/5P1K/1q5P/8/8 b - - 3 42',
    solutionUci: ['g7g5', 'f4g5', 'h6g5', 'h4h5', 'b3h3'],
    playerSide: 'b',
    rating: 1600,
  },
  {
    id: 'x1h9I',
    category: 'mate-in-3',
    fen: '6k1/5p2/p2Q2n1/5P2/8/P3R2p/1r3P1P/7K b - - 0 30',
    solutionUci: ['b2b1', 'd6d1', 'b1d1', 'e3e1', 'd1e1'],
    playerSide: 'b',
    rating: 1600,
  },
  {
    id: 'zkv7B',
    category: 'mate-in-3',
    fen: '1R6/8/8/7p/1P5k/5p2/r4P2/6K1 b - - 3 44',
    solutionUci: ['h4h3', 'b8d8', 'a2a1', 'd8d1', 'a1d1'],
    playerSide: 'b',
    rating: 1600,
  },
  {
    id: '5Pv1m',
    category: 'mate-in-3',
    fen: '5r1k/p7/5r2/2R4p/2N3p1/1P2P2P/P3n1P1/R6K b - - 2 30',
    solutionUci: ['f6f1', 'a1f1', 'f8f1', 'h1h2', 'g4g3'],
    playerSide: 'b',
    rating: 1600,
  },
  {
    id: 'qX49p',
    category: 'mate-in-3',
    fen: '6K1/r7/4B1k1/4R3/6P1/8/8/8 b - - 24 57',
    solutionUci: ['a7a8', 'e6c8', 'a8c8', 'e5e8', 'c8e8'],
    playerSide: 'b',
    rating: 1600,
  },
  {
    id: 'A99iN',
    category: 'mate-in-3',
    fen: '8/1P6/7R/p6P/1k6/2p5/2P4r/1K6 b - - 0 44',
    solutionUci: ['b4a3', 'h6e6', 'h2h1', 'e6e1', 'h1e1'],
    playerSide: 'b',
    rating: 1600,
  },
  {
    id: 'H3X8c',
    category: 'mate-in-3',
    fen: '4r3/1Q6/p3r1k1/3N1b2/P4P1P/1P4p1/6P1/2R2K2 b - - 5 33',
    solutionUci: ['f5d3', 'f1g1', 'e6e1', 'c1e1', 'e8e1'],
    playerSide: 'b',
    rating: 1600,
  },
  {
    id: '4heaV',
    category: 'mate-in-3',
    fen: 'r5k1/5p2/3R2p1/7p/7n/1B3R2/2P4P/7K b - - 0 31',
    solutionUci: ['a8a1', 'd6d1', 'a1d1', 'f3f1', 'd1f1'],
    playerSide: 'b',
    rating: 1600,
  },
  {
    id: '9y63y',
    category: 'mate-in-3',
    fen: '8/R6p/3N4/2Bk4/3P2p1/P2r4/6P1/7K b - - 0 42',
    solutionUci: ['g4g3', 'a7f7', 'd3d1', 'f7f1', 'd1f1'],
    playerSide: 'b',
    rating: 1600,
  },
  {
    id: 't32I6',
    category: 'mate-in-3',
    fen: '7k/ppp3p1/3b3p/3P1Rq1/8/P1B4Q/1P4P1/7K b - - 1 30',
    solutionUci: ['g5c1', 'c3e1', 'c1e1', 'f5f1', 'e1f1'],
    playerSide: 'b',
    rating: 1600,
  },
  {
    id: 'ok20Z',
    category: 'mate-in-3',
    fen: '2k5/p2p3B/b7/B1p5/8/8/5r1q/1K2R3 w - - 4 36',
    solutionUci: ['e1e8', 'c8b7', 'h7e4', 'd7d5', 'e4d5'],
    playerSide: 'w',
    rating: 1600,
  },
  {
    id: '5ppSb',
    category: 'mate-in-3',
    fen: '3r2k1/Q4p1p/1p4p1/4p3/8/P4q2/1P4BP/2R4K b - - 1 30',
    solutionUci: ['d8d1', 'c1d1', 'f3d1', 'g2f1', 'd1f1'],
    playerSide: 'b',
    rating: 1600,
  },
  {
    id: 'C8O1E',
    category: 'mate-in-3',
    fen: 'k7/1p3K2/1P3B1P/5rP1/8/8/p7/8 w - - 3 48',
    solutionUci: ['h6h7', 'f5f6', 'g5f6', 'a2a1q', 'h7h8q'],
    playerSide: 'w',
    rating: 1600,
  },
  {
    id: 'h0o3s',
    category: 'mate-in-3',
    fen: '4r1k1/3Q1pp1/2p2b1p/p4P1B/2q5/7P/6P1/7K w - - 0 32',
    solutionUci: ['d7e8', 'g8h7', 'h5g6', 'f7g6', 'f5g6'],
    playerSide: 'w',
    rating: 1600,
  },
];

const ALL_PUZZLES: Record<Exclude<PuzzleCategory, 'random'>, PuzzleDefinition[]> = {
  'mate-in-1': MATE_IN_1_PUZZLES,
  'mate-in-2': MATE_IN_2_PUZZLES,
  'mate-in-3': MATE_IN_3_PUZZLES,
};

function shuffle<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const categoryQueues = new Map<string, PuzzleDefinition[]>();

export function getRandomPuzzle(category: PuzzleCategory, excludeId?: string): PuzzleDefinition {
  const key = category;
  let queue = categoryQueues.get(key);

  if (!queue || queue.length === 0) {
    const source =
      category === 'random'
        ? [...MATE_IN_1_PUZZLES, ...MATE_IN_2_PUZZLES, ...MATE_IN_3_PUZZLES]
        : ALL_PUZZLES[category];
    queue = shuffle(source);
    categoryQueues.set(key, queue);
  }

  if (excludeId && queue.length > 1 && queue[0].id === excludeId) {
    const [first, second, ...rest] = queue;
    queue = [second, first, ...rest];
    categoryQueues.set(key, queue);
  }

  return queue.shift()!;
}
