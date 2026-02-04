# NxtChess

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-beta-green)](#)

Real-time multiplayer chess with training, analysis, and tactics puzzles. Play via shareable links or sign in to track progress.

[**Live Demo**](https://nxtchess.up.railway.app/) · [Report Bug](https://github.com/tmcarmichael/nxtchess/issues) · [Request Feature](https://github.com/tmcarmichael/nxtchess/issues)

---

## Features

- **Multiplayer** — WebSocket-based real-time games with shareable links and server-managed clocks
- **Training** — Endgame practice with Stockfish evaluation, hints, and scoring
- **Analysis** — Multi-line engine evaluation with FEN/PGN import
- **Puzzles** — Mate-in-1/2/3 tactics with feedback
- **Board Annotations** — Right-click drag arrows with valid move filtering
- **Themes** — Dark/light mode with sound controls
- **PWA** — Installable, works offline with IndexedDB game persistence
- **Server Validation** — All moves validated server-side to prevent cheating
- **Observability** — Prometheus metrics, Loki logs, Grafana dashboards

## Quick Start

**Prerequisites:** [Docker](https://www.docker.com/products/docker-desktop/) and [Just](https://github.com/casey/just#installation)

```bash
git clone https://github.com/tmcarmichael/nxtchess.git
cd nxtchess
just dev
```

Open http://localhost:5173

## Tech Stack

| Layer      | Stack                                                                      |
| ---------- | -------------------------------------------------------------------------- |
| Frontend   | SolidJS, TypeScript, Vite, CSS Modules                                     |
| Backend    | Go, Chi, gorilla/websocket                                                 |
| Database   | PostgreSQL, Redis                                                          |
| Engine     | Stockfish 16.1 WASM (adaptive: multi-threaded 69MB or single-threaded 7MB) |
| Monitoring | Prometheus, Loki, Grafana                                                  |
| Infra      | Docker, Caddy, Railway                                                     |

## Commands

```bash
just dev                    # Start all services
just up PROFILES=backend    # Backend only
just up PROFILES=frontend   # Frontend only
just logs                   # Follow logs
just clean PROFILES=full    # Reset everything
just mon-up                 # Start monitoring (Prometheus, Loki, Grafana)
just mon-down               # Stop monitoring
```

## Architecture

SolidJS frontend with Stockfish WASM for client-side analysis and AI play. Go backend handles WebSocket multiplayer, server-side move validation, and game state. Caddy reverse proxy with PostgreSQL for persistence and Redis for sessions. Prometheus collects backend metrics, Loki aggregates logs, Grafana provides dashboards.

## Roadmap

**Training & Analysis**

- Syzygy tablebases integration (perfect endgame play)
- Opening explorer with master game statistics
- Post-game analysis with move classification
- Tactics puzzles with spaced repetition (basic puzzle mode done — mate-in-1/2/3)
- Middlegame training mode

**Multiplayer & Competitive**

- Multiplayer lobby
- Tournaments
- Rated play

**Platform**

- Profile features (game history, statistics)
- Mobile app
- CI/CD

## Contributing

Contributions welcome. Please open an issue first to discuss changes.
