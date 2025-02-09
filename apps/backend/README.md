# NXT Chess

## Backend - Golang REST, PostgreSQL

\*_in progress_

### Design

- Separate domain logic (services), data access (repositories), and HTTP/websocket logic (controllers).
- Using [Chi Router](https://github.com/go-chi/chi)

### 🛠️ Getting Started

**[Prerequisite: Install Golang]**(https://go.dev/doc/install)

**Currently mocking the DB Connection**
From ./nxtchess/apps/backend

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
