# God's Eye

Real-time global tracker visualizing flights, vessels, trains, satellites, and active events on a 3D CesiumJS globe. Data streams via WebSocket at 1-second intervals, persisted in TimescaleDB.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Go |
| Database | TimescaleDB (PostgreSQL) + PostGIS |
| Cache / Pub-Sub | Redis |
| WebSockets | nhooyr.io/websocket |
| Frontend | React 18 + Vite + TypeScript |
| Package Manager | pnpm |
| Globe | CesiumJS (via resium) |
| State | Zustand |
| Styling | Tailwind CSS |
| Infrastructure | Docker Compose |

## Architecture

```
[External APIs]
      │
      ▼
[Go Ingestion Workers]  ──────►  [TimescaleDB + PostGIS]
  (one per source,                (persistence + geo queries)
   goroutine-based)
      │
      ▼
[Redis Pub/Sub]
      │
      ▼
[Go WebSocket Server]
      │
      ▼
[React Client + CesiumJS Globe]
  (1-second delta updates via WS)
```

## Data Layers

| Layer | Source | Update Interval |
|---|---|---|
| Flights | OpenSky Network, ADS-B Exchange | 1s |
| Satellites | CelesTrak TLE + SGP4 propagation | 1s (computed) |
| Vessels | AISHub, MarineTraffic | 1–5s |
| Trains | OpenRailwayMap, Transitland, GTFS | 5–10s |
| Earthquakes | USGS Earthquake API | Real-time |
| Weather Alerts | OpenWeatherMap | Real-time |
| Conflicts | ACLED | 15min |
| News / Geopolitical | GDELT Project | 15min |
| Humanitarian | ReliefWeb API | 15min |
| Sports / Concerts | Ticketmaster, PredictHQ | 15min |

## Project Structure

```
├── backend/
│   ├── cmd/server/main.go          # Entry point, graceful shutdown
│   ├── internal/
│   │   ├── config/                 # Environment config loader
│   │   ├── ingestion/              # Worker interface + manager
│   │   ├── broadcast/              # Redis pub/sub → WebSocket fanout
│   │   ├── ws/                     # WebSocket upgrade handler
│   │   ├── models/                 # Delta message types
│   │   └── db/                     # Connection pool + migrations
│   ├── docker-compose.yml
│   ├── Dockerfile
│   └── go.mod
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Globe/              # CesiumJS 3D globe wrapper
    │   │   ├── HUD/                # Connection status, entity counters
    │   │   └── Filters/            # Layer toggles per data type
    │   ├── stores/                 # Zustand (one store per layer)
    │   ├── hooks/                  # useWebSocket (auto-reconnect)
    │   └── types/                  # Shared TypeScript interfaces
    ├── vite.config.ts
    └── package.json
```

## Getting Started

### Prerequisites

- Go 1.22+
- Node.js 18+ and pnpm
- Docker & Docker Compose

### Setup

```bash
# Clone the repo
git clone https://github.com/joshuaferrara/godseye.git
cd godseye

# Start infrastructure (TimescaleDB + Redis)
cd backend
cp .env.example .env
docker compose up -d

# Run the backend
go run ./cmd/server

# In another terminal, run the frontend
cd frontend
pnpm install
pnpm dev
```

### Environment Variables

See `backend/.env.example` for the full list:

```env
# Backend
DATABASE_URL=postgres://godseye:godseye@localhost:5432/globaltracker
REDIS_URL=redis://localhost:6379
SERVER_ADDR=:8080

# Frontend
VITE_WS_URL=ws://localhost:8080/ws
VITE_CESIUM_ION_TOKEN=
```

## License

MIT
