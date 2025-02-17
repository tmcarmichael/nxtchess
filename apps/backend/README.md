# NXT Chess

## Backend - Golang REST, PostgreSQL

\*_in progress_

### Design

- Core application + domain logic, orchestrating Stockfish, websockets, DB reads/writes.
- Separate domain logic (services), data access (repositories), and HTTP/websocket logic (controllers).
- Using [Chi Router](https://github.com/go-chi/chi).
- Websockets once server supports service for wrapping Stockfish binary for UCI STD I/O.

#### Auth status:

Google OAuth2 - Complete
GitHub OAuth2 - Complete&Verifying
Discord OAuth2 - Complete&Verifying

### 🛠️ Getting Started

**\[Prerequisite\]**

- Install [Golang](https://go.dev/doc/install)
- Install [Docker & Docker Desktop ](https://www.docker.com/)

Set environment variables in .env, contact for info if needed.

#### Backend Start

From ./apps/backend

```bash
go mod tidy
```

Docker-Compose will pull .env variables and stand up:

1. Go Backend on 8080
2. PostgreSQL DB instance on 5432 - persistant user table, game table
3. PostgREST on 3000
4. Redis on 6379 - ephemeral session store and live game last move FEN/PGN

Spinning up docker:

```bash
docker-compose up --build -d
```

Spinning up docker:

```bash
docker-compose down -v
```

Optionally check Redis session store, verifying OAuth session:

```bash
docker-compose exec redis redis-cli
```

Optionally check profiles in postgres:

```bash
docker-compose exec db psql -U postgres -d chess_db
```

```sql
SELECT user_id, username, rating FROM profiles;
```

Optionally watch docker logs (or use docker desktop):
[backend, db, postgrest, redis]

Example:

```bash
docker-compose logs -f backend
```

Optionally full clean containers locally:

```bash
docker-compose down --remove-orphans
```

```bash
docker-compose down --rmi all -v
```

For full project view see main README: [https://github.com/tmcarmichael/nxtchess/blob/main/README.md](https://github.com/tmcarmichael/nxtchess/blob/main/README.md)
