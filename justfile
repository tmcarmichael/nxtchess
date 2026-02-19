# Justfile for Development
#
# Quick Start:
#   just dev
#
# Use profiles to target apps, e.g. for backend:
#   just up PROFILES=backend
#
# List all commands:
#   just --list

# Cross-platform shell configuration
set shell := ["sh", "-cu"]
set windows-shell := ["powershell.exe", "-NoLogo", "-Command"]

# Configuration
compose_file := "docker-compose.dev.yaml"
PROFILES := "full"
backend_env_file := "apps/backend/.env"
backend_env_example := "apps/backend/.env.example"
frontend_env_file := "apps/frontend/.env"
frontend_env_example := "apps/frontend/.env.example"

# Production configuration
prod_compose_file := "docker-compose.prod.yaml"
prod_env_file := ".env.prod"

# Default recipe - show available commands
default:
    @just --list

# Build + run frontend, backend, db, redis (QUICK START)
dev: init _clean-stale
    @echo "Starting containers (profile={{PROFILES}}) with {{compose_file}}..."
    docker compose -f {{compose_file}} --profile {{PROFILES}} up --build

# Remove stale containers that conflict with container_name
[unix]
_clean-stale:
    #!/usr/bin/env sh
    docker compose -f {{compose_file}} --profile {{PROFILES}} down --remove-orphans 2>/dev/null || true
    for name in $(docker compose -f {{compose_file}} --profile {{PROFILES}} config | grep 'container_name:' | awk '{print $2}'); do
        docker rm -f "$name" 2>/dev/null || true
    done

# Build or rebuild Docker images
build: init
    @echo "Building images (profile={{PROFILES}}) with {{compose_file}}..."
    docker compose -f {{compose_file}} --profile {{PROFILES}} build

# Start containers (attached)
up: init
    @echo "Starting containers (profile={{PROFILES}}) with {{compose_file}}..."
    docker compose -f {{compose_file}} --profile {{PROFILES}} up

# Build images, then start containers
start: build up

# Stop running containers
stop: init
    @echo "Stopping containers (profile={{PROFILES}})..."
    docker compose -f {{compose_file}} --profile {{PROFILES}} stop

# Stop & remove containers, networks
down: init
    @echo "Downing containers (profile={{PROFILES}})..."
    docker compose -f {{compose_file}} --profile {{PROFILES}} down

# Tail container logs (Ctrl+C to quit)
logs: init
    @echo "Following logs (profile={{PROFILES}}), Ctrl+C to quit."
    docker compose -f {{compose_file}} --profile {{PROFILES}} logs -f

# Full cleanup of containers+volumes
clean: init
    @echo "Removing containers/networks/volumes (profile={{PROFILES}})..."
    docker compose -f {{compose_file}} --profile {{PROFILES}} down -v

# Exec into container (SERVICE=..., CMD=...)
exec SERVICE CMD="bash": init
    @echo "Executing {{CMD}} in container {{SERVICE}}..."
    docker compose -f {{compose_file}} --profile {{PROFILES}} exec {{SERVICE}} {{CMD}}

# Opens psql in Postgres container
exec-db: init
    @echo "Opening psql in 'db' container, connecting to chess_db."
    docker compose -f {{compose_file}} --profile {{PROFILES}} exec db psql -U postgres -d chess_db

# Opens redis-cli in Redis container
exec-redis: init
    @echo "Launching redis-cli in 'redis' container."
    docker compose -f {{compose_file}} --profile {{PROFILES}} exec redis redis-cli

# Start monitoring stack (Prometheus, Loki, Grafana)
mon-up: init
    @echo "Starting monitoring stack..."
    docker compose -f {{compose_file}} --profile monitoring up -d

# Stop monitoring stack
mon-down: init
    @echo "Stopping monitoring stack..."
    docker compose -f {{compose_file}} --profile monitoring down

# Tail monitoring logs
mon-logs: init
    @echo "Following monitoring logs..."
    docker compose -f {{compose_file}} --profile monitoring logs -f

# Build production Docker images
prod-build: _prod-check-env
    @echo "Building production images..."
    docker compose -f {{prod_compose_file}} --env-file {{prod_env_file}} build

# Start production stack (detached)
prod-up: _prod-check-env
    @echo "Starting production stack..."
    docker compose -f {{prod_compose_file}} --env-file {{prod_env_file}} up -d

# Stop production stack
prod-down: _prod-check-env
    @echo "Stopping production stack..."
    docker compose -f {{prod_compose_file}} --env-file {{prod_env_file}} down

# Tail production logs
prod-logs: _prod-check-env
    @echo "Following production logs (Ctrl+C to quit)..."
    docker compose -f {{prod_compose_file}} --env-file {{prod_env_file}} logs -f

# Rebuild & restart production
prod-restart: prod-build prod-down prod-up
    @echo "Production stack restarted."

# Show container status
prod-status: _prod-check-env
    docker compose -f {{prod_compose_file}} --env-file {{prod_env_file}} ps

# Format backend + frontend
fmt:
    @echo "Formatting backend..."
    gofmt -w apps/backend/
    @echo "Formatting frontend..."
    (cd apps/frontend && npx prettier --write 'src/**/*.{ts,tsx}')

# Lint backend + frontend
lint:
    @echo "Linting backend..."
    (cd apps/backend && go vet ./...)
    @echo "Linting frontend..."
    (cd apps/frontend && yarn lint)

# Test backend + frontend
test:
    @echo "Testing backend..."
    (cd apps/backend && go test ./...)
    @echo "Testing frontend..."
    (cd apps/frontend && npx vitest run)

# Full environment prep (docker check + env check)
init: _check-docker _check-docker-daemon _check-env
    @echo "All dependencies checked. Dev env files exist."

# Verify Docker is installed
[unix]
_check-docker:
    #!/usr/bin/env sh
    if ! command -v docker >/dev/null 2>&1; then
        echo "ERROR: docker is not installed."
        exit 1
    fi

[windows]
_check-docker:
    @if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { Write-Error "ERROR: docker is not installed."; exit 1 }

# Verify Docker daemon is running
[unix]
_check-docker-daemon:
    #!/usr/bin/env sh
    if ! docker info > /dev/null 2>&1; then
        echo "ERROR: Docker daemon not running. Please start Docker Desktop or the Docker service."
        exit 1
    fi

[windows]
_check-docker-daemon:
    @$null = docker info 2>&1; if ($LASTEXITCODE -ne 0) { Write-Error "ERROR: Docker daemon not running. Please start Docker Desktop or the Docker service."; exit 1 }

# Ensure environment files exist or copy from examples
_check-env: (_ensure-env backend_env_file backend_env_example "backend") (_ensure-env frontend_env_file frontend_env_example "frontend")
    @echo "Environment files checked."

# Copy env file from example if it doesn't exist (Unix)
[unix]
_ensure-env env_file env_example name:
    #!/usr/bin/env sh
    if [ ! -f "{{env_file}}" ]; then
        if [ -f "{{env_example}}" ]; then
            cp "{{env_example}}" "{{env_file}}"
            echo "Copied {{env_example}} -> {{env_file}}."
        else
            echo "No {{env_file}} or {{env_example}} found ({{name}})."
        fi
    else
        echo "Using existing {{env_file}}."
    fi

# Copy env file from example if it doesn't exist (Windows)
[windows]
_ensure-env env_file env_example name:
    @if (-not (Test-Path "{{env_file}}")) { if (Test-Path "{{env_example}}") { Copy-Item "{{env_example}}" "{{env_file}}"; Write-Output "Copied {{env_example}} -> {{env_file}}." } else { Write-Output "No {{env_file}} or {{env_example}} found ({{name}})." } } else { Write-Output "Using existing {{env_file}}." }

# Verify production env file exists
[unix]
_prod-check-env: _check-docker _check-docker-daemon
    #!/usr/bin/env sh
    if [ ! -f "{{prod_env_file}}" ]; then
        echo "ERROR: {{prod_env_file}} not found."
        echo "Copy .env.prod.example to .env.prod and fill in the values."
        exit 1
    fi
    echo "Production environment file found."

[windows]
_prod-check-env: _check-docker _check-docker-daemon
    @if (-not (Test-Path "{{prod_env_file}}")) { Write-Error "ERROR: {{prod_env_file}} not found. Copy .env.prod.example to .env.prod and fill in the values."; exit 1 }; Write-Output "Production environment file found."
