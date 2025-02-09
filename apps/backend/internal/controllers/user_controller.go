package controllers

import (
	"encoding/json"
	"net/http"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/services"
)

type UserController struct {
	userService services.UserService
}

func NewUserController(s services.UserService) *UserController {
	return &UserController{userService: s}
}

// TEST/DEBUG
func (uc *UserController) GetProfile(w http.ResponseWriter, r *http.Request) {
	userID := "testUserID"

	user, err := uc.userService.GetProfileByID(r.Context(), userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(user)
}
