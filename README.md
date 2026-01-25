# NxtChess

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-beta-green)](#)

Real-time multiplayer chess with AI training. Play via shareable links or sign in to track progress.

[**Live Demo**](https://nxtchess.up.railway.app/) · [Report Bug](https://github.com/tmcarmichael/nxtchess/issues) · [Request Feature](https://github.com/tmcarmichael/nxtchess/issues)

---

## Features

- **Multiplayer** — WebSocket-based real-time games with shareable links
- **AI Training** — Stockfish at various difficulty
- **Training Modes** — Opening and endgame practice with move evaluation
- **PWA** — Installable, works offline with game persistence
- **Server Validation** — All moves validated server-side

## Quick Start

**Prerequisites:** [Docker](https://www.docker.com/products/docker-desktop/) and [Just](https://github.com/casey/just#installation)

```bash
git clone https://github.com/tmcarmichael/nxtchess.git
cd nxtchess
just dev
```

Open http://localhost:5173

## Tech Stack

| Layer    | Stack                                  |
| -------- | -------------------------------------- |
| Frontend | SolidJS, TypeScript, Vite, CSS Modules |
| Backend  | Go, Chi, gorilla/websocket             |
| Database | PostgreSQL, Redis                      |
| Engine   | Stockfish 16.1 WASM                    |
| Infra    | Docker, Caddy, Railway                 |

## Commands

```bash
just dev                    # Start all services
just up PROFILES=backend    # Backend only
just up PROFILES=frontend   # Frontend only
just logs                   # Follow logs
just clean PROFILES=full    # Reset everything
```

## Architecture

SolidJS frontend with Stockfish WASM for client-side analysis. Go backend handles WebSocket multiplayer, move validation, and game state. Caddy reverse proxy with PostgreSQL for persistence and Redis for sessions.

## Roadmap

**Training & Analysis**
- Syzygy tablebases integration (perfect endgame play)
- Opening explorer with master game statistics
- Post-game analysis with move classification
- Tactics puzzles with spaced repetition
- Analysis mode
- Middlegame training mode

**Multiplayer & Competitive**
- Multiplayer lobby
- Tournaments
- Rated play

**Platform**
- Profile features
- Mobile app
- CI/CD
- Observability (Grafana LGTM)

## Contributing

Contributions welcome. Please open an issue first to discuss changes.
