package main

import (
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/controllers"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/repositories"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/services"
)

func main() {

	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, or couldn't load it. Continuing anyway...")
	}

	dsn := os.Getenv("DATABASE_URL")

	var dbPool repositories.DBInterface
	if dsn == "" {
		dbPool = repositories.NewMockDBPool()
	} else {
		dbPool = repositories.NewDBPool(dsn)
	}

	defer dbPool.Close()

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Get("/", controllers.HealthCheck)

	userRepo := repositories.NewUserRepository(dbPool)
	userService := services.NewUserService(userRepo)
	userController := controllers.NewUserController(userService)

	r.Get("/profile", userController.GetProfile)

	log.Println("Starting server on :8080...")
	if err := http.ListenAndServe(":8080", r); err != nil {
		log.Fatal(err)
	}
}
