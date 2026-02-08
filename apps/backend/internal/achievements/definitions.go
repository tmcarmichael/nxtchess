package achievements

type Rarity string

const (
	RarityCommon    Rarity = "common"
	RarityUncommon  Rarity = "uncommon"
	RarityRare      Rarity = "rare"
	RarityEpic      Rarity = "epic"
	RarityLegendary Rarity = "legendary"
)

type Achievement struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Category    string `json:"category"`
	Rarity      Rarity `json:"rarity"`
	Points      int    `json:"points"`
	Icon        string `json:"icon"`
}

type AchievementUnlock struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Rarity      Rarity `json:"rarity"`
	Points      int    `json:"points"`
	Icon        string `json:"icon"`
}

var All = map[string]Achievement{
	"loyalty_1yr": {ID: "loyalty_1yr", Name: "Veteran", Description: "Member for 1 year", Category: "loyalty", Rarity: RarityUncommon, Points: 2, Icon: "\U0001f451"},
	"loyalty_2yr": {ID: "loyalty_2yr", Name: "Dedicated", Description: "Member for 2 years", Category: "loyalty", Rarity: RarityRare, Points: 3, Icon: "\U0001f6e1\ufe0f"},
	"loyalty_3yr": {ID: "loyalty_3yr", Name: "Loyal Knight", Description: "Member for 3 years", Category: "loyalty", Rarity: RarityEpic, Points: 5, Icon: "\U0001f3f0"},
	"loyalty_5yr": {ID: "loyalty_5yr", Name: "Timeless", Description: "Member for 5 years", Category: "loyalty", Rarity: RarityLegendary, Points: 10, Icon: "\u2b50"},

	"win_streak_3":  {ID: "win_streak_3", Name: "Hat Trick", Description: "Win 3 games in a row", Category: "streaks", Rarity: RarityCommon, Points: 1, Icon: "\U0001f525"},
	"win_streak_5":  {ID: "win_streak_5", Name: "On Fire", Description: "Win 5 games in a row", Category: "streaks", Rarity: RarityRare, Points: 3, Icon: "\U0001f525"},
	"win_streak_10": {ID: "win_streak_10", Name: "Dominant", Description: "Win 10 games in a row", Category: "streaks", Rarity: RarityEpic, Points: 5, Icon: "\u26a1"},
	"win_streak_20": {ID: "win_streak_20", Name: "Unstoppable", Description: "Win 20 games in a row", Category: "streaks", Rarity: RarityLegendary, Points: 10, Icon: "\u26a1"},

	"puzzle_streak_3":  {ID: "puzzle_streak_3", Name: "Warm Up", Description: "Solve 3 puzzles in a row", Category: "streaks", Rarity: RarityCommon, Points: 1, Icon: "\U0001f9e9"},
	"puzzle_streak_5":  {ID: "puzzle_streak_5", Name: "Sharp Mind", Description: "Solve 5 puzzles in a row", Category: "streaks", Rarity: RarityUncommon, Points: 2, Icon: "\U0001f9e0"},
	"puzzle_streak_10": {ID: "puzzle_streak_10", Name: "Puzzle Master", Description: "Solve 10 puzzles in a row", Category: "streaks", Rarity: RarityRare, Points: 3, Icon: "\U0001f9e0"},
	"puzzle_streak_20": {ID: "puzzle_streak_20", Name: "Brilliant", Description: "Solve 20 puzzles in a row", Category: "streaks", Rarity: RarityEpic, Points: 5, Icon: "\U0001f4a5"},

	"rating_1600": {ID: "rating_1600", Name: "1600 Rating", Description: "Reach 1600 rating", Category: "rating", Rarity: RarityRare, Points: 3, Icon: "\U0001f3c6"},
	"rating_1800": {ID: "rating_1800", Name: "1800 Rating", Description: "Reach 1800 rating", Category: "rating", Rarity: RarityRare, Points: 3, Icon: "\U0001f3c6"},
	"rating_2000": {ID: "rating_2000", Name: "2000 Rating", Description: "Reach 2000 rating", Category: "rating", Rarity: RarityEpic, Points: 5, Icon: "\U0001f451"},
	"rating_2200": {ID: "rating_2200", Name: "2200 Rating", Description: "Reach 2200 rating", Category: "rating", Rarity: RarityEpic, Points: 5, Icon: "\U0001f451"},
	"rating_2400": {ID: "rating_2400", Name: "2400 Rating", Description: "Reach 2400 rating", Category: "rating", Rarity: RarityLegendary, Points: 10, Icon: "\U0001f31f"},
	"rating_2600": {ID: "rating_2600", Name: "2600 Rating", Description: "Reach 2600 rating", Category: "rating", Rarity: RarityLegendary, Points: 10, Icon: "\U0001f31f"},
	"rating_2800": {ID: "rating_2800", Name: "2800 Rating", Description: "Reach 2800 rating", Category: "rating", Rarity: RarityLegendary, Points: 10, Icon: "\U0001f31f"},
	"rating_3000": {ID: "rating_3000", Name: "3000 Rating", Description: "Reach 3000 rating", Category: "rating", Rarity: RarityLegendary, Points: 10, Icon: "\U0001f31f"},

	"puzzle_rating_1400": {ID: "puzzle_rating_1400", Name: "1400 Puzzle Rating", Description: "Reach 1400 puzzle rating", Category: "rating", Rarity: RarityUncommon, Points: 2, Icon: "\U0001f9e9"},
	"puzzle_rating_1600": {ID: "puzzle_rating_1600", Name: "1600 Puzzle Rating", Description: "Reach 1600 puzzle rating", Category: "rating", Rarity: RarityRare, Points: 3, Icon: "\U0001f9e9"},
	"puzzle_rating_1800": {ID: "puzzle_rating_1800", Name: "1800 Puzzle Rating", Description: "Reach 1800 puzzle rating", Category: "rating", Rarity: RarityEpic, Points: 5, Icon: "\U0001f9e9"},
	"puzzle_rating_2000": {ID: "puzzle_rating_2000", Name: "2000 Puzzle Rating", Description: "Reach 2000 puzzle rating", Category: "rating", Rarity: RarityLegendary, Points: 10, Icon: "\U0001f31f"},
	"puzzle_rating_2200": {ID: "puzzle_rating_2200", Name: "2200 Puzzle Rating", Description: "Reach 2200 puzzle rating", Category: "rating", Rarity: RarityLegendary, Points: 10, Icon: "\U0001f31f"},
	"puzzle_rating_2400": {ID: "puzzle_rating_2400", Name: "2400 Puzzle Rating", Description: "Reach 2400 puzzle rating", Category: "rating", Rarity: RarityLegendary, Points: 10, Icon: "\U0001f31f"},
	"puzzle_rating_2600": {ID: "puzzle_rating_2600", Name: "2600 Puzzle Rating", Description: "Reach 2600 puzzle rating", Category: "rating", Rarity: RarityLegendary, Points: 10, Icon: "\U0001f31f"},
	"puzzle_rating_2800": {ID: "puzzle_rating_2800", Name: "2800 Puzzle Rating", Description: "Reach 2800 puzzle rating", Category: "rating", Rarity: RarityLegendary, Points: 10, Icon: "\U0001f31f"},
	"puzzle_rating_3000": {ID: "puzzle_rating_3000", Name: "3000 Puzzle Rating", Description: "Reach 3000 puzzle rating", Category: "rating", Rarity: RarityLegendary, Points: 10, Icon: "\U0001f31f"},

	"first_win":       {ID: "first_win", Name: "First Blood", Description: "Win your first game", Category: "chess_moments", Rarity: RarityCommon, Points: 1, Icon: "\u2694\ufe0f"},
	"back_rank_mate":  {ID: "back_rank_mate", Name: "Back Rank!", Description: "Deliver a back rank checkmate", Category: "chess_moments", Rarity: RarityUncommon, Points: 2, Icon: "\u265a"},
	"promotion":       {ID: "promotion", Name: "Queening", Description: "Promote a pawn", Category: "chess_moments", Rarity: RarityCommon, Points: 1, Icon: "\u265b"},
	"underpromotion":  {ID: "underpromotion", Name: "Humble Choice", Description: "Promote to a non-queen piece", Category: "chess_moments", Rarity: RarityRare, Points: 3, Icon: "\u265e"},
	"en_passant":      {ID: "en_passant", Name: "En Passant", Description: "Capture a pawn en passant", Category: "chess_moments", Rarity: RarityCommon, Points: 1, Icon: "\u265f"},
	"scholars_mate":   {ID: "scholars_mate", Name: "Scholar's Mate", Description: "Win with Scholar's Mate", Category: "chess_moments", Rarity: RarityRare, Points: 3, Icon: "\U0001f393"},

	"games_10":    {ID: "games_10", Name: "Getting Started", Description: "Play 10 games", Category: "volume", Rarity: RarityCommon, Points: 1, Icon: "\u265e"},
	"games_50":    {ID: "games_50", Name: "Regular", Description: "Play 50 games", Category: "volume", Rarity: RarityUncommon, Points: 2, Icon: "\u265e"},
	"games_100":   {ID: "games_100", Name: "Century", Description: "Play 100 games", Category: "volume", Rarity: RarityRare, Points: 3, Icon: "\U0001f3c5"},
	"games_500":   {ID: "games_500", Name: "Devoted", Description: "Play 500 games", Category: "volume", Rarity: RarityEpic, Points: 5, Icon: "\U0001f3c5"},
	"games_1000":  {ID: "games_1000", Name: "Millennial", Description: "Play 1000 games", Category: "volume", Rarity: RarityLegendary, Points: 10, Icon: "\U0001f48e"},
	"puzzles_10":  {ID: "puzzles_10", Name: "Puzzle Beginner", Description: "Solve 10 puzzles", Category: "volume", Rarity: RarityCommon, Points: 1, Icon: "\U0001f9e9"},
	"puzzles_50":  {ID: "puzzles_50", Name: "Puzzle Regular", Description: "Solve 50 puzzles", Category: "volume", Rarity: RarityUncommon, Points: 2, Icon: "\U0001f9e9"},
	"puzzles_100": {ID: "puzzles_100", Name: "Puzzle Century", Description: "Solve 100 puzzles", Category: "volume", Rarity: RarityRare, Points: 3, Icon: "\U0001f9e9"},
	"puzzles_500": {ID: "puzzles_500", Name: "Puzzle Addict", Description: "Solve 500 puzzles", Category: "volume", Rarity: RarityEpic, Points: 5, Icon: "\U0001f9e9"},
	"first_puzzle": {ID: "first_puzzle", Name: "First Steps", Description: "Solve your first puzzle", Category: "volume", Rarity: RarityCommon, Points: 1, Icon: "\U0001f9e9"},

	"stalemate_deliver": {ID: "stalemate_deliver", Name: "Oops", Description: "Stalemate your opponent", Category: "fun", Rarity: RarityUncommon, Points: 2, Icon: "\U0001f926"},
	"stalemate_receive": {ID: "stalemate_receive", Name: "So Close", Description: "Get stalemated", Category: "fun", Rarity: RarityUncommon, Points: 2, Icon: "\U0001f62e"},
	"win_on_time":       {ID: "win_on_time", Name: "Clutch", Description: "Win on time", Category: "fun", Rarity: RarityUncommon, Points: 2, Icon: "\u23f1\ufe0f"},
	"marathon_game":     {ID: "marathon_game", Name: "Marathon", Description: "Play a 100+ move game", Category: "fun", Rarity: RarityRare, Points: 3, Icon: "\U0001f3c3"},
}

func GetAll() []Achievement {
	result := make([]Achievement, 0, len(All))
	for _, a := range All {
		result = append(result, a)
	}
	return result
}

func GetByID(id string) (Achievement, bool) {
	a, ok := All[id]
	return a, ok
}

func ToUnlock(a Achievement) AchievementUnlock {
	return AchievementUnlock{
		ID:          a.ID,
		Name:        a.Name,
		Description: a.Description,
		Rarity:      a.Rarity,
		Points:      a.Points,
		Icon:        a.Icon,
	}
}
