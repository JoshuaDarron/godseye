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
cd packages/frontend && cp .env.example .env && pnpm install && pnpm dev
```

Open **http://localhost:5173** — you should see a 3D globe with live flights and satellites. Sign-in is available via the button in the top-right corner.

> **Note:** Each service includes a `.env.example` — copy it to `.env` and fill in the values. You'll need a free [Cesium Ion](https://ion.cesium.com/) token for terrain/imagery, [OpenSky Network](https://opensky-network.org/) credentials for flights, and a shared `JWT_SECRET` between the API and auth services.

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
