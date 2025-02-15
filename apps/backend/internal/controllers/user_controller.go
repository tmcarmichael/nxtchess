package controllers

import (
	"fmt"
	"log"
	"net/http"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/auth"
)

func UserProfileHandler(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value(auth.UserIDKey).(string)
	if userID == "" {
		http.Error(w, "No userID found in context", http.StatusInternalServerError)
		return
	}

	msg := fmt.Sprintf("User: %s. protected profile path.", userID)
	if _, err := w.Write([]byte(msg)); err != nil {
		log.Printf("Error writing response: %v", err)
	}
}
