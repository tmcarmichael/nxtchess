package repositories

import (
	"context"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/models"
)

type UserRepository interface {
	GetUserByID(ctx context.Context, id string) (*models.User, error)
}

type userRepository struct {
	db DBInterface
}

func NewUserRepository(db DBInterface) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) GetUserByID(ctx context.Context, id string) (*models.User, error) {
	var user models.User

	// TEST/DEBUG
	err := r.db.QueryRow(ctx, "SELECT id, email, name FROM users WHERE id=$1", id).
		Scan(&user.ID, &user.Email, &user.Name)
	if err != nil {
		return nil, err
	}
	return &user, nil
}
