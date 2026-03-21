<p align="center">
  <img src="docs/banner.svg" alt="Gods Eye — Real-Time Global Tracking" width="100%" />
</p>

<p align="center">
  <strong>Track flights, satellites, vessels, and global events on a 3D globe in real time.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/go-1.22+-00ADD8?logo=go&logoColor=white" alt="Go" />
  <img src="https://img.shields.io/badge/react-18-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/cesium-3D_globe-4285F4?logo=cesium&logoColor=white" alt="CesiumJS" />
  <img src="https://img.shields.io/badge/timescaledb-time_series-FDB515?logo=timescale&logoColor=white" alt="TimescaleDB" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
</p>

---

## Quick Start

```bash
git clone https://github.com/joshuaferrara/godseye.git && cd godseye

# Start TimescaleDB + Redis
docker compose up -d

# API service (terminal 1)
cd services/api && cp .env.example .env && go run ./cmd/server

# Auth service (terminal 2)
cd services/auth && cp .env.example .env && go run ./cmd/server

# Frontend (terminal 3)
cd packages/frontend && pnpm install && pnpm dev
```

Open **http://localhost:5173** — you should see a 3D globe with live flights and satellites. Sign-in is available via the button in the top-right corner.

> **Note:** You'll need a free [Cesium Ion](https://ion.cesium.com/) token for terrain/imagery tiles. Set `VITE_CESIUM_ION_TOKEN` in your frontend `.env`. Flights require free [OpenSky Network](https://opensky-network.org/) OAuth2 credentials set in the backend `.env`. The auth service requires a `JWT_SECRET` (shared with the API service) — see Environment Variables below.

---

## Data Layers

| Layer               | Source                            | Interval       | Status   |
| ------------------- | --------------------------------- | -------------- | -------- |
| Flights             | OpenSky Network (ADS-B)           | 1 s            | **Live** |
| Satellites          | CelesTrak TLE + SGP4              | 1 s (computed) | **Live** |
| Vessels             | AISStream (AIS)                   | 1-5 s          | **Live** |
| Trains              | OpenRailwayMap, Transitland, GTFS | 5-10 s         | Planned  |
| Earthquakes         | USGS Earthquake API               | Real-time      | **Live** |
| Weather Alerts      | OpenWeatherMap                    | Real-time      | Planned  |
| Armed Conflicts     | ACLED                             | 15 min         | Planned  |
| News / Geopolitical | GDELT Project                     | 15 min         | Planned  |
| Humanitarian        | ReliefWeb API                     | 15 min         | Planned  |
| Sports / Concerts   | Ticketmaster, PredictHQ           | 15 min         | Planned  |

---

## Environment Variables

### API Service (`services/api/.env`)

```env
DATABASE_URL=postgres://godseye:godseye@localhost:5433/globaltracker?sslmode=disable
REDIS_URL=redis://localhost:6379
SERVER_ADDR=:8080
JWT_SECRET=<random-64-char-hex>

# OpenSky Network — free, register at https://opensky-network.org/
OPENSKY_CLIENT_ID=
OPENSKY_CLIENT_SECRET=

# AISStream — free, register at https://aisstream.io/
AISSTREAM_API_KEY=
```

### Auth Service (`services/auth/.env`)

```env
DATABASE_URL=postgres://godseye:godseye@localhost:5433/globaltracker?sslmode=disable
AUTH_SERVER_ADDR=:8081
JWT_SECRET=<same-value-as-api>
FRONTEND_URL=http://localhost:5173

# Token lifetimes (optional, shown are defaults)
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=168h

# GitHub OAuth (optional) — register at https://github.com/settings/developers
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Google OAuth (optional) — register at https://console.cloud.google.com/
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### Frontend (`packages/frontend/.env`)

```env
VITE_WS_URL=ws://localhost:8080/ws
VITE_AUTH_URL=http://localhost:8081

# Cesium Ion — free, register at https://ion.cesium.com/
VITE_CESIUM_ION_TOKEN=
```

---

## Prerequisites

- [Go](https://go.dev/) 1.22+
- [Node.js](https://nodejs.org/) 18+ and [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/) and Docker Compose

---

## Contributing

Contributions are welcome! Please open an issue to discuss your idea before submitting a PR.

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes (`git commit -m "feat: Add my feature."`)
4. Push to the branch (`git push origin feat/my-feature`)
5. Open a Pull Request

---

## License

[MIT](LICENSE)
