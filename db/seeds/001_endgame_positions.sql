-- Seed: Endgame training positions
-- Auto-generated from seed-endgames patterns

INSERT INTO endgame_positions (position_id, fen, rating, themes, initial_eval, description, source)
VALUES
-- Basic Mates: K+Q vs K (Rating: 300-500)
('basic-kq-1', '6k1/8/5K2/8/8/8/8/7Q w - - 0 1', 350, ARRAY['basicMate', 'queenEndgame'], 9900, 'Queen checkmate - corner technique', 'Generated'),
('basic-kq-2', '8/8/8/3k4/8/3K4/8/7Q w - - 0 1', 400, ARRAY['basicMate', 'queenEndgame'], 9900, 'Queen checkmate - centralized kings', 'Generated'),
('basic-kq-3', '8/8/8/8/3k4/8/2K5/Q7 w - - 0 1', 380, ARRAY['basicMate', 'queenEndgame'], 9900, 'Queen checkmate - edge approach', 'Generated'),
('basic-kq-4', 'k7/8/1K6/8/8/8/8/Q7 w - - 0 1', 320, ARRAY['basicMate', 'queenEndgame'], 9900, 'Queen checkmate - near corner', 'Generated'),
('basic-kq-5', '8/8/8/3k4/8/2K5/8/4Q3 w - - 0 1', 360, ARRAY['basicMate', 'queenEndgame'], 9900, 'Queen checkmate - center control', 'Generated'),

-- Basic Mates: K+R vs K (Rating: 400-600)
('basic-kr-1', '6k1/8/5K2/8/8/8/8/7R w - - 0 1', 450, ARRAY['basicMate', 'rookEndgame'], 9900, 'Rook checkmate - box technique', 'Generated'),
('basic-kr-2', '8/8/8/3k4/8/3K4/8/7R w - - 0 1', 500, ARRAY['basicMate', 'rookEndgame'], 9900, 'Rook checkmate - cut off king', 'Generated'),
('basic-kr-3', '8/8/8/8/3k4/8/2K5/R7 w - - 0 1', 480, ARRAY['basicMate', 'rookEndgame'], 9900, 'Rook checkmate - edge pursuit', 'Generated'),
('basic-kr-4', 'k7/8/1K6/8/8/R7/8/8 w - - 0 1', 420, ARRAY['basicMate', 'rookEndgame'], 9900, 'Rook checkmate - near corner', 'Generated'),
('basic-kr-5', '8/8/2k5/8/8/2K5/8/R7 w - - 0 1', 520, ARRAY['basicMate', 'rookEndgame'], 9900, 'Rook checkmate - opposition with rook', 'Generated'),

-- Basic Mates: K+BB vs K (Rating: 500-600)
('basic-kbb-1', '6k1/8/5K2/8/8/8/3B4/4B3 w - - 0 1', 550, ARRAY['basicMate', 'bishopEndgame'], 9900, 'Two bishops mate - corner technique', 'Generated'),
('basic-kbb-2', '8/8/8/3k4/8/3K4/2B5/3B4 w - - 0 1', 580, ARRAY['basicMate', 'bishopEndgame'], 9900, 'Two bishops mate - central approach', 'Generated'),

-- King and Pawn: Opposition (Rating: 700-1000)
('kp-opposition-1', '8/8/8/3k4/8/3K4/3P4/8 w - - 0 1', 750, ARRAY['pawnEndgame', 'opposition'], 500, 'Direct opposition - key squares', 'Generated'),
('kp-opposition-2', '8/8/3k4/8/3K4/3P4/8/8 w - - 0 1', 850, ARRAY['pawnEndgame', 'opposition'], 600, 'Opposition - pawn on 3rd rank', 'Generated'),
('kp-opposition-3', '8/3k4/8/3K4/3P4/8/8/8 w - - 0 1', 800, ARRAY['pawnEndgame', 'opposition'], 700, 'Opposition - advanced pawn', 'Generated'),
('kp-opposition-4', '8/8/8/8/3pk3/8/3K4/8 b - - 0 1', 720, ARRAY['pawnEndgame', 'opposition'], -500, 'Black to move - lose opposition', 'Generated'),
('kp-opposition-5', '8/8/8/3k4/3P4/3K4/8/8 w - - 0 1', 950, ARRAY['pawnEndgame', 'opposition'], 600, 'Outflanking technique', 'Generated'),

-- King and Pawn: Passed Pawns (Rating: 500-800)
('kp-passed-1', '8/8/8/8/P7/8/8/K5k1 w - - 0 1', 650, ARRAY['pawnEndgame'], 400, 'Passed pawn race - a-file', 'Generated'),
('kp-passed-2', '8/8/8/P7/8/8/8/K5k1 w - - 0 1', 700, ARRAY['pawnEndgame'], 600, 'Advanced passed pawn', 'Generated'),
('kp-passed-3', '8/P7/8/8/8/8/8/K5k1 w - - 0 1', 550, ARRAY['pawnEndgame'], 900, 'Pawn on 7th - promotion', 'Generated'),
('kp-passed-4', '8/8/8/4P3/8/8/3K4/6k1 w - - 0 1', 750, ARRAY['pawnEndgame'], 500, 'Central passed pawn', 'Generated'),
('kp-passed-5', '8/8/8/8/3P4/2K5/8/6k1 w - - 0 1', 780, ARRAY['pawnEndgame'], 550, 'Protected passed pawn', 'Generated'),

-- King and Pawn: Multiple Pawns (Rating: 800-1150)
('kp-multi-1', '8/8/8/8/P1P5/8/8/K5k1 w - - 0 1', 850, ARRAY['pawnEndgame'], 700, 'Two connected pawns', 'Generated'),
('kp-multi-2', '8/8/8/P7/2P5/8/8/K5k1 w - - 0 1', 950, ARRAY['pawnEndgame'], 500, 'Disconnected pawns', 'Generated'),
('kp-multi-3', '8/8/p7/P7/8/8/8/K5k1 w - - 0 1', 900, ARRAY['pawnEndgame'], 200, 'Pawn vs pawn - race', 'Generated'),
('kp-multi-4', '8/p7/8/P7/8/8/1K6/6k1 w - - 0 1', 1050, ARRAY['pawnEndgame'], 300, 'Pawn breakthrough', 'Generated'),
('kp-multi-5', '8/8/8/1p1P4/8/8/1K6/6k1 w - - 0 1', 1000, ARRAY['pawnEndgame'], 100, 'Passed pawns - both sides', 'Generated'),

-- Rook Endgames: Lucena Position (Rating: 1200-1350)
('rook-lucena-1', '1K6/1P6/8/8/8/8/1k6/1r6 w - - 0 1', 1250, ARRAY['rookEndgame', 'lucena'], 900, 'Lucena position - building the bridge', 'Generated'),
('rook-lucena-2', '2K5/2P5/8/8/8/8/2k5/2r5 w - - 0 1', 1300, ARRAY['rookEndgame', 'lucena'], 900, 'Lucena - c-file variation', 'Generated'),
('rook-lucena-3', '3K4/3P4/8/8/8/8/3k4/3r4 w - - 0 1', 1250, ARRAY['rookEndgame', 'lucena'], 900, 'Lucena - d-file variation', 'Generated'),
('rook-lucena-4', '4K3/4P3/8/8/8/8/4k3/4r3 w - - 0 1', 1250, ARRAY['rookEndgame', 'lucena'], 900, 'Lucena - e-file variation', 'Generated'),

-- Rook Endgames: Philidor Position (Rating: 1050-1250)
('rook-philidor-1', '8/8/8/4k3/4P3/4K3/8/r7 b - - 0 1', 1150, ARRAY['rookEndgame', 'philidor'], 0, 'Philidor defense - 3rd rank', 'Generated'),
('rook-philidor-2', '8/8/8/3pk3/8/3K4/R7/8 w - - 0 1', 1200, ARRAY['rookEndgame', 'philidor'], 300, 'Philidor - attacking side', 'Generated'),
('rook-philidor-3', '8/8/8/8/3Pk3/8/3K4/r7 b - - 0 1', 1100, ARRAY['rookEndgame', 'philidor'], 0, 'Philidor - defensive setup', 'Generated'),

-- Rook Endgames: Activity (Rating: 1000-1300)
('rook-activity-1', '8/8/8/3k4/8/8/P2K4/R7 w - - 0 1', 1050, ARRAY['rookEndgame'], 400, 'Active rook - pawn support', 'Generated'),
('rook-activity-2', 'r7/8/8/3k4/8/8/P2K4/8 w - - 0 1', 1150, ARRAY['rookEndgame'], 350, 'Rook behind passed pawn', 'Generated'),
('rook-activity-3', '8/8/3k4/8/P7/8/3K4/7R w - - 0 1', 1100, ARRAY['rookEndgame'], 450, 'Rook cutting off king', 'Generated'),
('rook-activity-4', '8/R7/8/3pk3/8/8/3K4/8 w - - 0 1', 1200, ARRAY['rookEndgame'], 500, 'Rook on 7th rank', 'Generated'),

-- Bishop Endgames (Rating: 1200-1600)
('bishop-1', '8/8/8/3k4/8/3K4/3P4/3B4 w - - 0 1', 1250, ARRAY['bishopEndgame'], 700, 'Bishop + pawn vs king', 'Generated'),
('bishop-2', '8/8/3b4/3k4/8/3K4/3P4/3B4 w - - 0 1', 1450, ARRAY['bishopEndgame'], 200, 'Same-colored bishops + pawn', 'Generated'),
('bishop-3', '8/8/5b2/3k4/8/3K4/3P4/3B4 w - - 0 1', 1550, ARRAY['bishopEndgame'], 100, 'Opposite-colored bishops', 'Generated'),
('bishop-4', '8/8/8/8/3Pk3/8/3K4/3B4 w - - 0 1', 1400, ARRAY['bishopEndgame'], 400, 'Good vs bad bishop', 'Generated'),

-- Knight Endgames (Rating: 1150-1500)
('knight-1', '8/8/8/3k4/8/3K4/3P4/3N4 w - - 0 1', 1250, ARRAY['knightEndgame'], 600, 'Knight + pawn vs king', 'Generated'),
('knight-2', '8/8/8/3k4/8/2NK4/3P4/8 w - - 0 1', 1300, ARRAY['knightEndgame'], 650, 'Knight supporting pawn', 'Generated'),
('knight-3', '8/8/3n4/3k4/8/3K4/3P4/3N4 w - - 0 1', 1450, ARRAY['knightEndgame'], 200, 'Knight vs knight + pawn', 'Generated'),
('knight-4', '8/8/3k4/3N4/3P4/3K4/8/8 w - - 0 1', 1200, ARRAY['knightEndgame'], 500, 'Knight + pawn - outpost control', 'Generated'),

-- Bishop vs Knight (Rating: 1500-1750)
('bvn-1', '8/8/8/3k4/8/3K4/3P4/B3n3 w - - 0 1', 1550, ARRAY['bishopEndgame', 'knightEndgame'], 150, 'Bishop vs knight - open position', 'Generated'),
('bvn-2', '8/p7/8/3k4/8/3K4/3P4/B3n3 w - - 0 1', 1650, ARRAY['bishopEndgame', 'knightEndgame'], 100, 'Bishop vs knight - with pawns', 'Generated'),

-- Queen Endgames (Rating: 1400-1700)
('queen-1', '8/8/8/3k4/8/3K4/3P4/3Q4 w - - 0 1', 1450, ARRAY['queenEndgame'], 900, 'Queen + pawn vs king', 'Generated'),
('queen-2', '8/3q4/8/3k4/8/3K4/3P4/3Q4 w - - 0 1', 1850, ARRAY['queenEndgame'], 300, 'Queen vs queen + pawn', 'Generated'),
('queen-3', '6k1/8/8/8/8/8/1PK5/4Q3 w - - 0 1', 1550, ARRAY['queenEndgame'], 850, 'Queen escorting pawn', 'Generated'),
('queen-4', '8/8/8/8/3q4/8/3PK3/4Q3 w - - 0 1', 1750, ARRAY['queenEndgame'], 0, 'Queen perpetual check defense', 'Generated'),
('queen-5', '8/1q6/8/3k4/8/3K4/3P4/3Q4 w - - 0 1', 1650, ARRAY['queenEndgame'], 400, 'Queen activity - centralization', 'Generated'),

-- Queen vs Rook (Rating: 2000-2300)
('qvr-1', '8/8/8/3k4/8/3K4/8/Q5r1 w - - 0 1', 2050, ARRAY['queenEndgame', 'rookEndgame'], 500, 'Queen vs rook - winning technique', 'Generated'),
('qvr-2', '8/8/8/3k4/8/3K4/r7/Q7 w - - 0 1', 2150, ARRAY['queenEndgame', 'rookEndgame'], 450, 'Queen vs rook - edge defense', 'Generated')

ON CONFLICT (position_id) DO UPDATE SET
    fen = EXCLUDED.fen,
    rating = EXCLUDED.rating,
    themes = EXCLUDED.themes,
    initial_eval = EXCLUDED.initial_eval,
    description = EXCLUDED.description,
    source = EXCLUDED.source;
