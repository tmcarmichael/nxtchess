package controllers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/database"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/httpx"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/middleware"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/models"
)

func UserProfileHandler(w http.ResponseWriter, r *http.Request) {
	searchedUsername := chi.URLParam(r, "username")
	if searchedUsername == "" {
		httpx.WriteJSONError(w, http.StatusBadRequest, "username parameter is required")
		return
	}

	user, err := database.GetUserProfileByUsername(searchedUsername)
	if err != nil {
		log.Printf("[UserProfileHandler] DB error: %v", err)
		httpx.WriteJSONError(w, http.StatusInternalServerError, "Internal Server Error")
		return
	}
	if user == nil {
		httpx.WriteJSONError(w, http.StatusNotFound, "User not found")
		return
	}

	resp := models.PublicProfile{
		Username: user.Username,
		Rating:   user.Rating,
	}

	httpx.WriteJSON(w, http.StatusOK, resp)
}

func CheckUsernameHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok || userID == "" {
		httpx.WriteJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	username, err := database.GetUsernameByID(userID)
	if err != nil {
		log.Printf("[CheckUsernameHandler] DB error: %v", err)
		httpx.WriteJSONError(w, http.StatusInternalServerError, "Database error")
		return
	}

	if username == "" {
		httpx.WriteJSONError(w, http.StatusNotFound, "No username found")
		return
	}

	type checkResp struct {
		Username string `json:"username"`
	}
	httpx.WriteJSON(w, http.StatusOK, checkResp{Username: username})
}

func SetUsernameHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok || userID == "" {
		httpx.WriteJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req struct {
		Username string `json:"username"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httpx.WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	taken, err := database.UsernameExists(req.Username)
	if err != nil {
		log.Printf("[SetUsernameHandler] error checking username: %v", err)
		httpx.WriteJSONError(w, http.StatusInternalServerError, "Database error")
		return
	}
	if taken {
		httpx.WriteJSONError(w, http.StatusConflict, "Username already taken")
		return
	}

	if err := database.UpsertUsername(userID, req.Username); err != nil {
		log.Printf("[SetUsernameHandler] upsert error: %v", err)
		httpx.WriteJSONError(w, http.StatusInternalServerError, "Failed to set username")
		return
	}

	log.Printf("[SetUsernameHandler] Upsert succeeded for userID=%s, username=%s", userID, req.Username)
	httpx.WriteJSON(w, http.StatusOK, map[string]string{
		"message": "Username set successfully",
	})
}
