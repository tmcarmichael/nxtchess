package controllers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/database"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/httpx"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/logger"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/middleware"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/models"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/validation"
)

func UserProfileHandler(w http.ResponseWriter, r *http.Request) {
	searchedUsername := chi.URLParam(r, "username")
	if searchedUsername == "" {
		httpx.WriteJSONError(w, http.StatusBadRequest, "username parameter is required")
		return
	}

	user, err := database.GetUserProfileByUsername(searchedUsername)
	if err != nil {
		logger.Error("Failed to get user profile", logger.F("username", searchedUsername, "error", err.Error()))
		httpx.WriteJSONError(w, http.StatusInternalServerError, "Internal server error")
		return
	}
	if user == nil {
		httpx.WriteJSONError(w, http.StatusNotFound, "User not found")
		return
	}

	resp := models.PublicProfile{
		Username:    user.Username,
		Rating:      user.Rating,
		ProfileIcon: user.ProfileIcon,
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
		logger.Error("Failed to get username", logger.F("userId", userID, "error", err.Error()))
		httpx.WriteJSONError(w, http.StatusInternalServerError, "Database error")
		return
	}

	if username == "" {
		httpx.WriteJSONError(w, http.StatusNotFound, "No username found")
		return
	}

	profileIcon, err := database.GetProfileIcon(userID)
	if err != nil {
		logger.Error("Failed to get profile icon", logger.F("userId", userID, "error", err.Error()))
		httpx.WriteJSONError(w, http.StatusInternalServerError, "Database error")
		return
	}

	type checkResp struct {
		Username    string `json:"username"`
		ProfileIcon string `json:"profile_icon"`
	}
	httpx.WriteJSON(w, http.StatusOK, checkResp{Username: username, ProfileIcon: profileIcon})
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

	// Validate username
	if err := validation.ValidateUsername(req.Username); err != nil {
		httpx.WriteJSONError(w, http.StatusBadRequest, err.Message)
		return
	}

	// Sanitize username
	username := validation.SanitizeUsername(req.Username)

	// Check if already taken
	taken, err := database.UsernameExists(username)
	if err != nil {
		logger.Error("Failed to check username availability", logger.F("username", username, "error", err.Error()))
		httpx.WriteJSONError(w, http.StatusInternalServerError, "Database error")
		return
	}
	if taken {
		httpx.WriteJSONError(w, http.StatusConflict, "Username already taken")
		return
	}

	// Set the username
	if err := database.UpsertUsername(userID, username); err != nil {
		logger.Error("Failed to set username", logger.F("userId", userID, "username", username, "error", err.Error()))
		httpx.WriteJSONError(w, http.StatusInternalServerError, "Failed to set username")
		return
	}

	logger.Info("Username set", logger.F("userId", userID, "username", username))
	httpx.WriteJSON(w, http.StatusOK, map[string]string{
		"message":  "Username set successfully",
		"username": username,
	})
}

func SetProfileIconHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok || userID == "" {
		httpx.WriteJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req struct {
		Icon string `json:"icon"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httpx.WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate icon
	if err := validation.ValidateProfileIcon(req.Icon); err != nil {
		httpx.WriteJSONError(w, http.StatusBadRequest, err.Message)
		return
	}

	// Set the profile icon
	if err := database.SetProfileIcon(userID, req.Icon); err != nil {
		logger.Error("Failed to set profile icon", logger.F("userId", userID, "icon", req.Icon, "error", err.Error()))
		httpx.WriteJSONError(w, http.StatusInternalServerError, "Failed to set profile icon")
		return
	}

	logger.Info("Profile icon set", logger.F("userId", userID, "icon", req.Icon))
	httpx.WriteJSON(w, http.StatusOK, map[string]string{
		"message": "Profile icon set successfully",
		"icon":    req.Icon,
	})
}
