# NXT Chess

## Backend - Golang REST, PostgreSQL

\*_in progress_

### Design

- Core application + domain logic, orchestrating Stockfish, websockets, DB reads/writes.
- Separate domain logic (services), data access (repositories), and HTTP/websocket logic (controllers).
- Using [Chi Router](https://github.com/go-chi/chi).

### 🛠️ Getting Started

**[Prerequisite: Install Golang]**(https://go.dev/doc/install)

Depending on your IDE, it's recommended to open the backend up at /apps/backend instead of the repo root.

When MOCK_DB is set true in /env, mock DB connection is used.

Contact for full Postman collection and PostgreSQL db steps.
Spinning up docker:

```bash
docker-compose up -d
```

Spinning up docker:

```bash
docker-compose down
```

Local server:

1. Install dependencies:

```bash
go mod tidy
```

2. Run the server:

```bash
go run ./cmd/server
```

3. Check server:

```bash
curl http://localhost:8080/
```

For full project view see main README: [https://github.com/tmcarmichael/nxtchess/blob/main/README.md](https://github.com/tmcarmichael/nxtchess/blob/main/README.md)
