# nxtchess

[![Development Status](https://img.shields.io/badge/status-under_development-orange)](#)
[![License](https://img.shields.io/github/license/tmcarmichael/nxtchess)](https://github.com/tmcarmichael/nxtchess/blob/main/LICENSE)
[![Issues](https://img.shields.io/github/issues/tmcarmichael/nxtchess)](https://github.com/tmcarmichael/nxtchess/issues)
[![Code Style](https://img.shields.io/badge/code%20style-prettier-ff69b4)](https://prettier.io/docs/en/why-prettier)

<div style="text-align: center;">
  <img src="apps/frontend/public/assets/nxtchess-2-16-25.gif" alt="Early demo" />
</div>

## 🚀 Project Vision

Create a lean, high-performance, multiplayer chess platform that incorporates unique training modes and AI-driven features.

**_The project is currently in early development. Check out the Roadmap below for planned features._**

---

## ⚡️ Quick Start

_Install Docker & Docker Compose Recommended: [Docker Desktop](https://www.docker.com/products/docker-desktop/)_

1. Run the one-shot Make command:

```bash
make dev
```

2. Open the frontend at [http://localhost:5173](http://localhost:5173)

For 'sign in' funcationality, OAuth clientID/secret is required in backend env.

_CTRL+C to bring the containers down._

---

## 💻 Tech Stack

- **Frontend:**
  [SolidJS](https://www.solidjs.com/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vite.dev/). _Styling solution is TBD: likely [Tailwind CSS](https://tailwindcss.com/), [PostCSS](https://postcss.org/), [Macaron](https://macaron.js.org/docs/styling/)._

- **Backend:**
  [Golang](https://go.dev/), [Chi](https://github.com/go-chi/chi), [Redis](https://redis.io/), [PostgreSQL](https://www.postgresql.org/).

- **Cloud [Prod]:**
  [Azure App Service](https://azure.microsoft.com/en-us/products/app-service/), [Azure Database for PostgreSQL](https://azure.microsoft.com/en-us/products/postgresql/), [Azure Key Vault](https://azure.microsoft.com/en-us/products/key-vault/), [Azure Container Registry](https://azure.microsoft.com/en-us/products/container-registry/).

- **Infrastructure:**
  [Docker](https://www.docker.com/), [Docker Compose](https://docs.docker.com/compose/), [GitHub Actions](https://github.com/features/actions).

- **Observability:**
  - **Logging**: [ELK](https://www.elastic.co/elastic-stack)
  - **Metrics**: [Prometheus](https://prometheus.io/)
  - **Visualization**: [Grafana](https://grafana.com/)

---

## 📜 Roadmap

What's planned next?

### 🚀 (In Progress) Phase 4: Server Engine Integration, Rating, and Training

- [ ] Wrap the Stockfish binary in Golang to interface via UCI for server-side engine evaluations.
- [ ] Implement server-side move validation, rating calculations, and storage of game results.
- [ ] Reflect multiple rating types (blitz, rapid, AI training) in user profiles.
- [ ] Add websocket support for real-time rated modes against engine or human players.
- [ ] Refactor the frontend chessboard for seamless reuse across various game modes.
- [ ] Refine user flows for account creation, username collisions, and sign-in edge cases.

### Phase 5: Deployment, Logging, and Monitoring

- [ ] Deploy FE & BE on Azure Apps, sidecar Redis instance for ephemeral session data.
- [ ] Deploy a basic/free tier PostgresDB for persisting profiles and game history.
- [ ] Establish a GitHub Actions CI/CD pipeline for automated builds, tests, and deployments.
- [ ] Create staging and prod realms and integrate with CI/CD.
- [ ] Implement a minimal ELK stack to centralize, index, and visualize logs.
- [ ] Prometheus for metrics from Golang server, Postgres, and Redis sidecar.
- [ ] Grafana to visualize key Prometheus logs, health checks, and alerting.
- [ ] Configure domain, SSL certificates, and AKS env-based secret management for prod.

### Phase 6: Quality Assurance and Performance Optimization

- [ ] Add unit, integration, and end-to-end tests for critical frontend and backend flows.
- [ ] Enable coverage reports and automated testing in CI/CD pipelines.
- [ ] Load testing and optimization of server concurrency/caching strategies.
- [ ] Database indexing, migrations, and query performance.
- [ ] Integrate security scanning and code linting checks into CI/CD pipeline.
- [ ] _(Nice to have)_ Expand i18n/l10n support or plan for multi-language interfaces.
- [ ] _(Nice to have)_ Improve board resizing, accessibility, and cross-browser compatibility.

### Phase 7: Enhanced Mechanics and Community

- [ ] Develop unique AI training modes with server-based analysis.
- [ ] Build a tournament system with scheduling, brackets, and user match histories.
- [ ] Introduce friend lists or user-specific invites for community matches.
- [ ] Add advanced player profile statistics and anti-cheat mechanisms.
- [ ] Create a basic community layer (forums, Discord integration).
- [ ] _(Nice to have)_ API contract (OpenAPI, gRPC, or GraphQL) to formalize FE/BE interactions.

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js v16 or later**
- **Yarn (Recommended)**
- **Go v1.21 or later (if you run the backend outside of Docker)**
- **Docker and Docker Compose ([Docker Desktop](https://www.docker.com/products/docker-desktop/) Recommended)**

---

You can build and run the frontend, server, or the whole app. Set .env in apps/frontend and apps/backend as needed.

Use the [Makefile](https://github.com/tmcarmichael/nxtchess/blob/main/Makefile), for key commands:

```bash
make help
```

1. **Complete app startup**

For a full startup (frontend, backend, DB, Redis):

```bash
make dev
```

This builds images, starts containers, and runs everything in attached mode on local ports. For server and sign in flows, OAuth clientID and secrets are required.

2. **Backend Server Only**

For backend server only (and its DB/Redis dependencies):

```bash
make up PROFILES=backend
```

You can verify backend is up with:

```bash
curl http://localhost:8080
```

3. **Frontend Only**

If you only want the frontend dev server:

```bash
make up PROFILES=frontend
```

4. **[Optional] Cleanup Commands**

Key commands are:

To stop containers without removing them:

```bash
make stop PROFILES=full
```

To stop and remove containers:

```bash
make down PROFILES=full
```

To stop and remove containers and their volumes:

```bash
make clean PROFILES=full
```

5. **[Optional] Logs and Containers Exec**

To follow logs for backend containers:

```bash
make logs PROFILES=backend
```

To access db container psql:

```bash
make exec-db
```

To open redis-cli in the redis container:

```bash
make exec-redis
```

To shell into the backend container:

```bash
make exec SERVICE=backend CMD="bash"
```

---

## ✨ Design North Star _2-17-25_

<div style="text-align: center;">
  <img src="docs/diagrams/architecture.png" alt="Early design" />
</div>

## 🤝 Contributing

Contributions welcome.
Get in touch, send a PR, or open a GitHub issue.

---

## 📧 Contact

- Email: ThomasCarmichael@pm.me
- Issues: [Submit an Issue](https://github.com/tmcarmichael/nxtchess/issues)
