package utils

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/config"
)

func GenerateRandomString(n int) (string, error) {
	b := make([]byte, n)
	if _, err := io.ReadFull(rand.Reader, b); err != nil {
		return "", fmt.Errorf("GenerateRandomString: %w", err)
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

func AuthRedirectWithError(
	w http.ResponseWriter,
	r *http.Request,
	errMsg string,
	statusCode int,
	cfg *config.Config,
) {
	encodedMsg := url.QueryEscape(errMsg)
	redirectURL := fmt.Sprintf("%s/?error=%s", cfg.FrontendURL, encodedMsg)
	log.Printf("[AuthRedirectWithError] %s (status code %d)\n", errMsg, statusCode)
	http.Redirect(w, r, redirectURL, statusCode)
}