# NXT Chess

## Backend - Golang, PostgreSQL, Redis

### 🛠️ Getting Started

See [primary README](https://github.com/tmcarmichael/nxtchess/blob/main/README.md)

---

### Backend Dev Steps

**Set environment variables in .env. Backend is in developement, contact for additional info on env setting.**

1. From ./apps/backend

```bash
go mod tidy
```

Docker-Compose will pull .env variables and stand up:

- Go Backend on 8080
- PostgreSQL DB instance on 5432 - persistant user table, game table
- PostgREST on 3000
- Redis on 6379 - ephemeral session store and live game last move FEN/PGN

2. Docker containers built and started:

```bash
docker-compose up --build -d
```

**The frontend is now able to hit backend API and OAuth flows.**

---

#### Clean up and optional commands

Optionally shut down docker containers and remove volumes:

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

Optionally deep reset containers locally:

```bash
docker-compose down --remove-orphans
```

```bash
docker-compose down --rmi all -v
```

---

For full project info see main README: [https://github.com/tmcarmichael/nxtchess/blob/main/README.md](https://github.com/tmcarmichael/nxtchess/blob/main/README.md)
