package controllers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/models"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/services"
)

type ProfileController struct {
	service services.ProfileService
}

func NewProfileController(s services.ProfileService) *ProfileController {
	return &ProfileController{service: s}
}

// POST /profile
// Example JSON body:
//
//	{
//	   "user_id": "mockuser_id",
//	   "username": "mockusername",
//	   "rating": 1500
//	}
func (pc *ProfileController) CreateProfile(w http.ResponseWriter, r *http.Request) {
	var req models.Profile
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	log.Printf("CreateProfile called with user_id=%s, username=%s, rating=%d\n",
		req.UserID, req.Username, req.Rating)

	if err := pc.service.CreateProfile(r.Context(), &req); err != nil {
		http.Error(w, "Failed to create profile: "+err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(req)
}

// GET /profile?user_id=<mockuser_id>
func (pc *ProfileController) GetProfile(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		http.Error(w, "Missing user_id query param", http.StatusBadRequest)
		return
	}
	prof, err := pc.service.GetProfileByUserID(r.Context(), userID)
	if err != nil {
		http.Error(w, "Profile not found or db error: "+err.Error(), http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(prof)
}
