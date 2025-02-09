package services

import (
	"context"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/models"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/repositories"
)

type UserService interface {
	GetProfileByID(ctx context.Context, id string) (*models.User, error)
}

type userService struct {
	userRepo repositories.UserRepository
}

func NewUserService(repo repositories.UserRepository) UserService {
	return &userService{userRepo: repo}
}

func (s *userService) GetProfileByID(ctx context.Context, id string) (*models.User, error) {
	return s.userRepo.GetUserByID(ctx, id)
}
