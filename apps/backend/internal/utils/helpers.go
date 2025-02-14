package utils

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"io"
)

func GenerateRandomString(n int) (string, error) {
	b := make([]byte, n)
	if _, err := io.ReadFull(rand.Reader, b); err != nil {
		return "", fmt.Errorf("GenerateRandomString: %w", err)
	}
	return base64.URLEncoding.EncodeToString(b), nil
}
