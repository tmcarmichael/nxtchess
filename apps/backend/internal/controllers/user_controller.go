package controllers

import (
	"fmt"
	"net/http"
)

func UserProfileHandler(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value("userID").(string)
	if userID == "" {
		http.Error(w, "No userID found in context", http.StatusInternalServerError)
		return
	}

	msg := fmt.Sprintf("User: %s. protected profile path.", userID)
	w.Write([]byte(msg))
}
