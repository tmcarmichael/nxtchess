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

### Frontend

For launching the frontend locally, see the [frontend README](https://github.com/tmcarmichael/nxtchess/blob/main/apps/frontend/README.md).

### Backend

For launching the backend locally, see the [backend README](https://github.com/tmcarmichael/nxtchess/blob/main/apps/backend/README.md).

---

## 🤝 Contributing

Contributions welcome.
Get in touch, send a PR, or open a GitHub issue.

---

## 📧 Contact

- Email: ThomasCarmichael@pm.me
- Issues: [Submit an Issue](https://github.com/tmcarmichael/nxtchess/issues)
