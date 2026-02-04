package sessions

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"io"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/logger"
)

var (
	rdb *redis.Client
	ctx = context.Background()
)

func InitRedis() {
	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		// Fallback to legacy env var name
		redisAddr = os.Getenv("REDIS_PORT")
	}
	if redisAddr == "" {
		redisAddr = "redis:6379"
	}

	redisPassword := os.Getenv("REDIS_PASSWORD")

	rdb = redis.NewClient(&redis.Options{
		Addr:     redisAddr,
		Password: redisPassword,
		DB:       0,
	})

	if err := rdb.Ping(ctx).Err(); err != nil {
		logger.Error("Failed to connect to Redis", logger.F("addr", redisAddr, "error", err.Error()))
		os.Exit(1)
	}

	logger.Info("Connected to Redis", logger.F("addr", redisAddr))
}

func GenerateSessionToken() (string, error) {
	b := make([]byte, 32)
	_, err := io.ReadFull(rand.Reader, b)
	if err != nil {
		logger.Error("Failed to generate session token", logger.F("error", err.Error()))
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

func StoreSession(token, userID string) error {
	err := rdb.Set(ctx, token, userID, 24*time.Hour).Err()
	if err != nil {
		logger.Error("Failed to store session", logger.F("error", err.Error()))
	}
	return err
}

func GetSessionUserID(token string) (string, bool) {
	userID, err := rdb.Get(ctx, token).Result()
	if err == redis.Nil {
		return "", false
	} else if err != nil {
		logger.Error("Failed to get session from Redis", logger.F("error", err.Error()))
		return "", false
	}
	return userID, true
}

// Close closes the Redis client connection
func Close() error {
	if rdb != nil {
		logger.Info("Closing Redis connection")
		return rdb.Close()
	}
	return nil
}

// Ping checks Redis connectivity
func Ping() error {
	if rdb == nil {
		return fmt.Errorf("redis not initialized")
	}
	return rdb.Ping(ctx).Err()
}

// DeleteSession removes a session token from Redis
func DeleteSession(token string) error {
	if rdb == nil {
		return fmt.Errorf("redis not initialized")
	}
	return rdb.Del(ctx, token).Err()
}
