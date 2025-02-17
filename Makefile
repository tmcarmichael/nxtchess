# Makefile for Development
#
# env used:
#   apps/backend/.env.development
#   apps/frontend/.env.development
#
# Quick Start:
#   make dev

COMPOSE_FILE           ?= docker-compose.dev.yaml
BACKEND_ENV_FILE       := apps/backend/.env.development
BACKEND_ENV_EXAMPLE    := apps/backend/.env.example
FRONTEND_ENV_FILE      := apps/frontend/.env.development
FRONTEND_ENV_EXAMPLE   := apps/frontend/.env.example
SHELL                  := /bin/bash
COLOR_RESET            := $(shell tput sgr0 2>/dev/null || echo "")
COLOR_GREEN            := $(shell tput setaf 2 2>/dev/null || echo "")
COLOR_RED              := $(shell tput setaf 1 2>/dev/null || echo "")
COLOR_YELLOW           := $(shell tput setaf 3 2>/dev/null || echo "")

.PHONY: help check-docker check-compose check-env init build up start stop down logs clean dev exec exec-db exec-redis

## help: Display a list of targets and descriptions
help:
	@echo ""
	@echo "$(COLOR_GREEN)Makefile for Local Dev$(COLOR_RESET)"
	@echo "Usage: make [target] [COMPOSE_FILE=...]"
	@echo ""
	@echo "$(COLOR_YELLOW)Available Targets:$(COLOR_RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?##' $(MAKEFILE_LIST) \
	  | sort \
	  | awk 'BEGIN {FS = ":.*?##"}; {printf "  %-12s %s\n", $$1, $$2}'

## check-docker: Verify Docker is installed
check-docker:
	@command -v docker >/dev/null 2>&1 || { \
	  echo "$(COLOR_RED)ERROR: docker is not installed or not in PATH.$(COLOR_RESET)"; \
	  exit 1; \
	}

## check-compose: Verify docker-compose or docker compose is installed
check-compose:
	@command -v docker-compose >/dev/null 2>&1 || command -v docker compose >/dev/null 2>&1 || { \
	  echo "$(COLOR_RED)ERROR: docker-compose (or 'docker compose') not found.$(COLOR_RESET)"; \
	  exit 1; \
	}

## check-env: Ensure each .env.development file exists, or copy from .env.example if present
check-env:
	@echo "$(COLOR_YELLOW)Checking environment files for backend & frontend...$(COLOR_RESET)"

	@if [ ! -f "$(BACKEND_ENV_FILE)" ]; then \
	  if [ -f "$(BACKEND_ENV_EXAMPLE)" ]; then \
	    cp "$(BACKEND_ENV_EXAMPLE)" "$(BACKEND_ENV_FILE)"; \
	    echo "$(COLOR_GREEN)Copied $(BACKEND_ENV_EXAMPLE) -> $(BACKEND_ENV_FILE).$(COLOR_RESET)"; \
	  else \
	    echo "$(COLOR_RED)No $(BACKEND_ENV_FILE) or $(BACKEND_ENV_EXAMPLE) found.$(COLOR_RESET)"; \
	    exit 1; \
	  fi; \
	else \
	  echo "$(COLOR_GREEN)Using existing $(BACKEND_ENV_FILE).$(COLOR_RESET)"; \
	fi

	@if [ ! -f "$(FRONTEND_ENV_FILE)" ]; then \
	  if [ -f "$(FRONTEND_ENV_EXAMPLE)" ]; then \
	    cp "$(FRONTEND_ENV_EXAMPLE)" "$(FRONTEND_ENV_FILE)"; \
	    echo "$(COLOR_GREEN)Copied $(FRONTEND_ENV_EXAMPLE) -> $(FRONTEND_ENV_FILE).$(COLOR_RESET)"; \
	  else \
	    echo "$(COLOR_RED)No $(FRONTEND_ENV_FILE) or $(FRONTEND_ENV_EXAMPLE) found.$(COLOR_RESET)"; \
	    exit 1; \
	  fi; \
	else \
	  echo "$(COLOR_GREEN)Using existing $(FRONTEND_ENV_FILE).$(COLOR_RESET)"; \
	fi

## init: Full environment prep (docker check + env check)
init: check-docker check-compose check-env
	@echo "$(COLOR_GREEN)All dependencies checked. Dev env files exist.$(COLOR_RESET)"

## build: Build or rebuild Docker images in parallel
build: init ## Build or rebuild Docker images
	@echo "$(COLOR_YELLOW)Building Docker images with $(COMPOSE_FILE) ...$(COLOR_RESET)"
	docker-compose -f $(COMPOSE_FILE) build --parallel

## up: Start containers in attached mode
up: init ## Start containers (attached)
	@echo "$(COLOR_YELLOW)Starting containers with $(COMPOSE_FILE) ...$(COLOR_RESET)"
	docker-compose -f $(COMPOSE_FILE) up

## start: Build then up (attached)
start: build up ## Build images, then start containers

## stop: Stop containers without removing them
stop: init ## Stop running containers
	@echo "$(COLOR_YELLOW)Stopping containers...$(COLOR_RESET)"
	docker-compose -f $(COMPOSE_FILE) stop

## down: Stop and remove containers, networks, etc.
down: init ## Stop & remove containers, networks
	@echo "$(COLOR_YELLOW)Stopping & removing containers, networks...$(COLOR_RESET)"
	docker-compose -f $(COMPOSE_FILE) down

## logs: Follow logs from all containers
logs: init ## Tail container logs (Ctrl+C to quit)
	@echo "$(COLOR_YELLOW)Following Docker container logs...$(COLOR_RESET)"
	docker-compose -f $(COMPOSE_FILE) logs -f

## clean: Stop & remove containers/networks/volumes
clean: init ## Full cleanup of containers+volumes
	@echo "$(COLOR_RED)Removing containers, networks, and volumes...$(COLOR_RESET)"
	docker-compose -f $(COMPOSE_FILE) down -v

## dev: One command to set up env, build, and start in attached mode (QUICK START)
dev: init build up

## exec: Exec into a running container. e.g. make exec SERVICE=backend CMD='bash'
exec: init ## Exec into container (SERVICE=..., CMD=...)
	@if [ -z "$$SERVICE" ]; then \
	  echo "$(COLOR_RED)Usage: make exec SERVICE=<service> [ CMD='bash' ]$(COLOR_RESET)"; \
	  exit 1; \
	fi
	@echo "$(COLOR_YELLOW)Executing $(CMD) in container $(SERVICE)...$(COLOR_RESET)"
	docker-compose -f $(COMPOSE_FILE) exec $(SERVICE) $(or $(CMD),bash)

## exec-db: Opens psql in Postgres container to inspect data, etc.
exec-db: init
	@echo "$(COLOR_YELLOW)Opening psql in 'db' container, connecting to chess_db.$(COLOR_RESET)"
	docker-compose -f $(COMPOSE_FILE) exec db psql -U postgres -d chess_db

## exec-redis: Opens redis-cli to check Redis session store
exec-redis: init
	@echo "$(COLOR_YELLOW)Launching redis-cli in 'redis' container.$(COLOR_RESET)"
	docker-compose -f $(COMPOSE_FILE) exec redis redis-cli
