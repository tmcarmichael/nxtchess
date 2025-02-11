package main

import (
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/config"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/controllers"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/repositories"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/services"
)

func main() {
	cfg := config.LoadConfig()
	if cfg != nil {
		log.Println("No .env file found, or couldn't load it. Continuing anyway...")
	}

	useMock := strings.ToLower(os.Getenv("USE_MOCK")) == "true"

	var dbPool repositories.DBInterface
	if useMock {
		dbPool = repositories.NewMockDBPool()
	} else {
		dbPool = repositories.NewDBPool(cfg.DATABASE_URL)
	}
	defer dbPool.Close()

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Get("/", controllers.HealthCheck)

	profileRepo := repositories.NewProfileRepository(dbPool)
	profileService := services.NewProfileService(profileRepo)

	profileController := controllers.NewProfileController(profileService)
	oauthController := controllers.NewOAuthController()

	mux := http.NewServeMux()

	mux.HandleFunc("/auth/google", oauthController.GoogleLogin)
	mux.HandleFunc("/auth/google/callback", oauthController.GoogleCallback)
	mux.HandleFunc("/profile", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			profileController.CreateProfile(w, r)
		case http.MethodGet:
			profileController.GetProfile(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	log.Printf("Starting server on port %s\n", cfg.PORT)
	if err := http.ListenAndServe(":"+cfg.PORT, mux); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
