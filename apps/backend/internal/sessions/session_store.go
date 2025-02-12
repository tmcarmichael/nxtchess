package sessions

import (
	"crypto/rand"
	"encoding/base64"
	"io"
	"log"
	"sync"
)

var (
	sessionStore = make(map[string]string)
	storeMu      sync.Mutex
)

func StoreSession(token, userID string) {
	storeMu.Lock()
	defer storeMu.Unlock()
	sessionStore[token] = userID
}

func GetSessionUserID(token string) (string, bool) {
	storeMu.Lock()
	defer storeMu.Unlock()
	userID, found := sessionStore[token]
	return userID, found
}

func GenerateSessionToken() (string, error) {
	b := make([]byte, 32)
	_, err := io.ReadFull(rand.Reader, b)
	if err != nil {
		log.Println("Error generating random session token:", err)
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}
