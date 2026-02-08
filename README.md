# NxtChess

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-beta-green)](#)

Real-time multiplayer chess with tactics, analysis, and training. Built for fast, low-latency play in SolidJS + Go. Play instantly via shareable links or sign in to track progress.

[**Live Demo**](https://nxtchess.up.railway.app/) · [Report Bug](https://github.com/tmcarmichael/nxtchess/issues) · [Request Feature](https://github.com/tmcarmichael/nxtchess/issues)

---

## Features

- **Multiplayer** - Real-time WebSocket games, shareable links, lobby, server-managed clocks
- **Puzzles** — Mate-in-1/2/3 tactics with Elo-based difficulty and history
- **Analysis** — Multi-line Stockfish analysis, plus FEN/PGN import
- **Training** — Endgame drills with evaluation, hints, and scoring
- **Profiles** — Ratings, charts, stats, and recent games
- **Achievements** — Badge system with streaks and notifications

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
- Themed puzzles (forks, pins, back rank mates) with spaced repetition
- Middlegame training mode

**Multiplayer & Competitive**

- Tournaments (Swiss and arena formats)
- ELO range filtering for lobby

**Platform**

- Opening repertoire tracking
- Mobile app
- CI/CD

## Contributing

Contributions welcome. Please open an issue first to discuss changes.
