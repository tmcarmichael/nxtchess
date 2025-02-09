package repositories

import (
	"context"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/models"
)

type ProfileRepository interface {
	CreateProfile(ctx context.Context, p *models.Profile) error
	GetProfileByUserID(ctx context.Context, userID string) (*models.Profile, error)
}

type profileRepository struct {
	db DBInterface
}

func NewProfileRepository(db DBInterface) ProfileRepository {
	return &profileRepository{db: db}
}

func (r *profileRepository) CreateProfile(ctx context.Context, p *models.Profile) error {
	return r.db.QueryRow(ctx, `
        INSERT INTO profiles (user_id, username, rating)
        VALUES ($1, $2, $3)
        RETURNING created_at
    `, p.UserID, p.Username, p.Rating).Scan(&p.CreatedAt)
}

func (r *profileRepository) GetProfileByUserID(ctx context.Context, userID string) (*models.Profile, error) {
	var prof models.Profile
	err := r.db.QueryRow(ctx, `
        SELECT user_id, username, rating, created_at
        FROM profiles
        WHERE user_id = $1
    `, userID).Scan(&prof.UserID, &prof.Username, &prof.Rating, &prof.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &prof, nil
}
