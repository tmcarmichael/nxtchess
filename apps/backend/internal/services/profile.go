package services

import (
	"context"
	"log"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/models"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/repositories"
)

type ProfileService interface {
	CreateProfile(ctx context.Context, p *models.Profile) error
	GetProfileByUserID(ctx context.Context, userID string) (*models.Profile, error)
}

type profileService struct {
	repo repositories.ProfileRepository
}

func NewProfileService(r repositories.ProfileRepository) ProfileService {
	return &profileService{repo: r}
}

func (s *profileService) CreateProfile(ctx context.Context, p *models.Profile) error {
	log.Println("ProfileService.CreateProfile: user_id=", p.UserID)
	// Validate
	return s.repo.CreateProfile(ctx, p)
}

func (s *profileService) GetProfileByUserID(ctx context.Context, userID string) (*models.Profile, error) {
	log.Println("ProfileService.GetProfileByUserID:", userID)
	return s.repo.GetProfileByUserID(ctx, userID)
}
