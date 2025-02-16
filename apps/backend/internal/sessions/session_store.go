package sessions

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"io"
	"log"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
)

var (
	rdb *redis.Client
	ctx = context.Background()
)

func InitRedis() {
	redisAddr := os.Getenv("REDIS_PORT")
	if redisAddr == "" {
		redisAddr = "redis:6379"
	}

	rdb = redis.NewClient(&redis.Options{
		Addr:     redisAddr,
		Password: "",
		DB:       0,
	})

	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Fatalf("Failed to connect to Redis at %s: %v", redisAddr, err)
	}

	log.Printf("[InitRedis] Connected to Redis at %s", redisAddr)
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

func StoreSession(token, userID string) error {
	err := rdb.Set(ctx, token, userID, 24*time.Hour).Err()
	if err != nil {
		log.Printf("Error storing session in Redis: %v", err)
	}
	return err
}

func GetSessionUserID(token string) (string, bool) {
	userID, err := rdb.Get(ctx, token).Result()
	if err == redis.Nil {
		return "", false
	} else if err != nil {
		log.Printf("Error getting session from Redis: %v", err)
		return "", false
	}
	return userID, true
}
