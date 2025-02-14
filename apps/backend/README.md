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

**[Prerequisite: Install Golang]**(https://go.dev/doc/install)

Depending on your IDE, it's recommended to open the backend up at /apps/backend instead of the repo root.

Set environment variables in .env, contact for info if needed.

After validation of OAuth flows and username setting, migrating to Azure. Recommended to use Docker Desktop for backend logs and debug.

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
docker-compose down
```

Check Redis session store, verifying OAuth session:

```bash
docker exec -it chess_redis redis-cli
```

For full project view see main README: [https://github.com/tmcarmichael/nxtchess/blob/main/README.md](https://github.com/tmcarmichael/nxtchess/blob/main/README.md)
