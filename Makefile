# Makefile for Development
#
# Quick Start:
#   make dev
#
# Use profiles to target apps, e.g. for backend:
#   make up PROFILES=backend
#
# Check the make help for instructions
#   make help

# Config
COMPOSE_FILE ?= docker-compose.dev.yaml # Dev
PROFILES ?= full
BACKEND_ENV_FILE       := apps/backend/.env
BACKEND_ENV_EXAMPLE    := apps/backend/.env.example
FRONTEND_ENV_FILE      := apps/frontend/.env
FRONTEND_ENV_EXAMPLE   := apps/frontend/.env.example

# Make vars
SHELL                  := /bin/bash
COLOR_RESET            := $(shell tput sgr0 2>/dev/null || echo "")
COLOR_GREEN            := $(shell tput setaf 2 2>/dev/null || echo "")
COLOR_RED              := $(shell tput setaf 1 2>/dev/null || echo "")
COLOR_YELLOW           := $(shell tput setaf 3 2>/dev/null || echo "")
COLOR_BLUE             := $(shell tput setaf 4 2>/dev/null || echo "")

.PHONY: help check-docker check-docker-daemon check-env init build up start stop down logs clean dev exec exec-db exec-redis

## help: Display a list of targets and descriptions
help:
	@echo ""
	@echo "$(COLOR_GREEN)Makefile for Docker Compose w/ Profiles$(COLOR_RESET)"
	@echo "Usage: make [target] [PROFILES=...] [COMPOSE_FILE=...]"
	@echo ""
	@echo "$(COLOR_YELLOW)Examples:$(COLOR_RESET)"
	@echo "  make dev                   $(COLOR_BLUE)# Run full stack (default)$(COLOR_RESET)"
	@echo "  make up PROFILES=backend   $(COLOR_BLUE)# Just the 'backend' profile$(COLOR_RESET)"
	@echo "  make up PROFILES=frontend  $(COLOR_BLUE)# Just the 'backend' profile$(COLOR_RESET)"
	@echo ""
	@echo "$(COLOR_YELLOW)Available Targets:$(COLOR_RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?##' $(MAKEFILE_LIST) \
	  | sort \
	  | awk -v blue="$(COLOR_BLUE)" -v reset="$(COLOR_RESET)" 'BEGIN {FS = ":.*?##"}; {printf "  %-12s %s%s%s\n", $$1, blue, $$2, reset}'

## check-docker: Verify Docker is installed
check-docker:
	@command -v docker >/dev/null 2>&1 || { \
	  echo "$(COLOR_RED)ERROR: docker is not installed.$(COLOR_RESET)"; \
	  exit 1; \
	}

## check-docker-daemon: Verify Docker daemon is running
check-docker-daemon:
	@docker info > /dev/null 2>&1 || { \
	  echo "$(COLOR_RED)ERROR: Docker daemon not running. Please start Docker Desktop or the Docker service.$(COLOR_RESET)"; \
	  exit 1; \
	}

## check-env: Ensure each .env file or copy from .env.example
check-env:
	@echo "$(COLOR_YELLOW)Checking environment files for backend & frontend...$(COLOR_RESET)"
	@if [ ! -f "$(BACKEND_ENV_FILE)" ]; then \
	  if [ -f "$(BACKEND_ENV_EXAMPLE)" ]; then \
	    cp "$(BACKEND_ENV_EXAMPLE)" "$(BACKEND_ENV_FILE)"; \
	    echo "$(COLOR_GREEN)Copied $(BACKEND_ENV_EXAMPLE) -> $(BACKEND_ENV_FILE).$(COLOR_RESET)"; \
	  else \
	    echo "$(COLOR_RED)No $(BACKEND_ENV_FILE) or $(BACKEND_ENV_EXAMPLE) found (backend).$(COLOR_RESET)"; \
	  fi; \
	else \
	  echo "$(COLOR_GREEN)Using existing $(BACKEND_ENV_FILE).$(COLOR_RESET)"; \
	fi
	@if [ ! -f "$(FRONTEND_ENV_FILE)" ]; then \
	  if [ -f "$(FRONTEND_ENV_EXAMPLE)" ]; then \
	    cp "$(FRONTEND_ENV_EXAMPLE)" "$(FRONTEND_ENV_FILE)"; \
	    echo "$(COLOR_GREEN)Copied $(FRONTEND_ENV_EXAMPLE) -> $(FRONTEND_ENV_FILE).$(COLOR_RESET)"; \
	  else \
	    echo "$(COLOR_RED)No $(FRONTEND_ENV_FILE) or $(FRONTEND_ENV_EXAMPLE) found (frontend).$(COLOR_RESET)"; \
	  fi; \
	else \
	  echo "$(COLOR_GREEN)Using existing $(FRONTEND_ENV_FILE).$(COLOR_RESET)"; \
	fi

## init: Full environment prep (docker check + env check)
init: check-docker check-docker-daemon check-env
	@echo "$(COLOR_GREEN)All dependencies checked. Dev env files exist.$(COLOR_RESET)"

## build: Build or rebuild Docker images in parallel for the selected profiles
build: init ## Build or rebuild Docker images
	@echo "$(COLOR_YELLOW)Building images (profile=$(PROFILES)) with $(COMPOSE_FILE) ...$(COLOR_RESET)"
	docker compose -f $(COMPOSE_FILE) --profile $(PROFILES) build

## up: Start containers in attached mode for the selected profiles
up: init ## Start containers (attached)
	@echo "$(COLOR_YELLOW)Starting containers (profile=$(PROFILES)) with $(COMPOSE_FILE) ...$(COLOR_RESET)"
	docker compose -f $(COMPOSE_FILE) --profile $(PROFILES) up

## start: Build then up (attached)
start: build up ## Build images, then start containers

## stop: Stop containers without removing them
stop: init ## Stop running containers
	@echo "$(COLOR_YELLOW)Stopping containers (profile=$(PROFILES))...$(COLOR_RESET)"
	docker compose -f $(COMPOSE_FILE) --profile $(PROFILES) stop

## down: Stop and remove containers, networks, etc. for the selected profiles
down: init ## Stop & remove containers, networks
	@echo "$(COLOR_YELLOW)Downing containers (profile=$(PROFILES))...$(COLOR_RESET)"
	docker compose -f $(COMPOSE_FILE) --profile $(PROFILES) down

## logs: Follow logs for selected profile
logs: init ## Tail container logs (Ctrl+C to quit)
	@echo "$(COLOR_YELLOW)Following logs (profile=$(PROFILES)), Ctrl+C to quit.$(COLOR_RESET)"
	docker compose -f $(COMPOSE_FILE) --profile $(PROFILES) logs -f

## clean: Stop & remove containers/networks/volumes
clean: init ## Full cleanup of containers+volumes
	@echo "$(COLOR_RED)Removing containers/networks/volumes (profile=$(PROFILES))...$(COLOR_RESET)"
	docker compose -f $(COMPOSE_FILE) --profile $(PROFILES) down -v

## dev: One command to set up env, build, and start in attached mode (QUICK START)
dev: init build up ## * QUICK START
	@$(MAKE) start PROFILES=full

## exec: Exec into a running container. e.g. make exec SERVICE=backend CMD='bash'
exec: init ## Exec into container (SERVICE=..., CMD=...)
	@if [ -z "$$SERVICE" ]; then \
	  echo "$(COLOR_RED)Usage: make exec SERVICE=<service> [CMD='bash']$(COLOR_RESET)"; \
	  exit 1; \
	fi
	@echo "$(COLOR_YELLOW)Executing $(CMD) in container $(SERVICE)...$(COLOR_RESET)"
	docker compose -f $(COMPOSE_FILE) --profile $(PROFILES) exec $$SERVICE $(or $(CMD),bash)

## exec-db: Opens psql in Postgres container to inspect data, etc.
exec-db: init
	@echo "$(COLOR_YELLOW)Opening psql in 'db' container, connecting to chess_db.$(COLOR_RESET)"
	docker compose -f $(COMPOSE_FILE) --profile $(PROFILES) exec db psql -U postgres -d chess_db

## exec-redis: Opens redis-cli to check Redis session store
exec-redis: init
	echo "$(COLOR_YELLOW)Launching redis-cli in 'redis' container.$(COLOR_RESET)"
	docker compose -f $(COMPOSE_FILE) --profile $(PROFILES) exec redis redis-cli
