# NXT Chess

## Backend - Golang, PostgreSQL, Redis

### 🛠️ Getting Started

See [primary README](https://github.com/tmcarmichael/nxtchess/blob/main/README.md)

---

### Backend Dev Steps

**Set environment variables in .env. Backend is in developement, contact for additional info on env setting.**

From ./apps/backend

```bash
go mod tidy
```

Docker-Compose will pull .env variables and stand up:

- Go Backend on 8080
- PostgreSQL DB instance on 5432 - persistant user table, game table
- Redis on 6379 - ephemeral session store and live game last move FEN/PGN

Use the [project justfile](https://github.com/tmcarmichael/nxtchess/blob/main/justfile) with PROFILES=backend to target the backend only for dev. The clientID and secrets are required for sign-in to be sucessful.

```bash
just --list
```

```bash
just up PROFILES=backend
```

---

For full project info see main README: [https://github.com/tmcarmichael/nxtchess/blob/main/README.md](https://github.com/tmcarmichael/nxtchess/blob/main/README.md)
