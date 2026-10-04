# GeoRisk — Global Disaster & Environmental Risk Explorer

An interactive geospatial dashboard for exploring live natural disasters, earthquakes,
and environmental exposure anywhere on Earth. Built with React, Vite, Tailwind CSS,
React Router, Leaflet, and Recharts — no backend, no API keys, no mock data.

---

## 1. Project structure

```
src/
  components/        Reusable presentational + map UI pieces
    Header.jsx              Top nav bar
    SearchBar.jsx            Debounced location search w/ geocoding
    DisasterMap.jsx           Leaflet map: markers, click handling, recenter
    DisasterMarker.jsx        Per-event marker + popup
    FilterBar.jsx              Type + time filters
    RiskCard.jsx                 Single exposure meter (bar + label + reason)
    WeatherPanel.jsx              Current conditions grid
    EventCard.jsx                  Row used in Live Events feed
    Chart.jsx                       Recharts line/bar wrappers
    LocationAnalysisPanel.jsx        Full analysis panel (exposure+weather+events+chart)
    CompareColumn.jsx                 One side of the /compare page

  pages/             Route-level components
    ExplorePage.jsx    "/"        Map + search + filters + analysis panel
    EventsPage.jsx      "/events"  Live event feed, searchable/filterable
    ComparePage.jsx      "/compare" Two-location side-by-side comparison
    SourcesPage.jsx        "/sources" Documents every external API used
    AboutPage.jsx            "/about"   Explains scope + limitations

  services/          Thin wrappers around external APIs (no UI code here)
    eonetApi.js        NASA EONET v3 — natural events
    usgsApi.js           USGS earthquake GeoJSON + FDSN query API
    weatherApi.js          Open-Meteo forecast + historical archive
    geocodingApi.js          Open-Meteo geocoding + BigDataCloud reverse geocode

  hooks/             Data-fetching / behavior hooks
    useDebounce.js             Generic debounce
    useGlobalEvents.js           Loads + caches the global event feed for the map
    useLocationAnalysis.js         Loads all data for one point (weather+events+history)

  utils/             Pure logic, no React/DOM
    riskCalculation.js   The entire exposure-scoring methodology (read this first!)
    distance.js            Haversine distance + "X km away" formatting
    formatters.js             Dates, disaster type metadata (icons/colors), magnitude
    cache.js                    Tiny in-memory TTL cache used by the hooks

  data/
    sources.js         Structured list of every API used, rendered on /sources

  App.jsx            Router + layout shell
  main.jsx           Entry point
  index.css          Tailwind + Leaflet + dark theme + glass-panel utilities
```

---

## 2. Installation

```bash
npm install
npm run dev       # starts Vite dev server, usually http://localhost:5173
```

To build a production bundle:

```bash
npm run build
npm run preview   # serve the built dist/ locally
```

## 3. Environment variables / API keys

**None required.** Every API used is free and keyless for the volume this app generates:

| API | Key needed? |
|---|---|
| NASA EONET v3 | No |
| USGS Earthquake feeds / FDSN query | No |
| Open-Meteo forecast + historical | No |
| Open-Meteo geocoding | No |
| BigDataCloud reverse geocoding (free client tier) | No |
| CARTO dark-matter basemap tiles | No |

If you later want higher rate limits or a different basemap provider (e.g. Mapbox),
you'd add a `.env` file and read it via `import.meta.env.VITE_...` in `DisasterMap.jsx` —
the codebase doesn't currently need this.

---

## 4. How each API is used

### NASA EONET (`services/eonetApi.js`)
`GET https://eonet.gsfc.nasa.gov/api/v3/events?status=open&days=...&limit=...`
Returns currently-open natural events (wildfires, storms, volcanoes, landslides,
floods, drought, etc). Each event's last geometry entry is used as its current
position (storms/tracked events can have multiple positions over time; we take
the most recent). Categories are mapped to a small internal set of type keys
used everywhere else in the app (`utils/formatters.js#DISASTER_META`).

### USGS Earthquake Hazards Program (`services/usgsApi.js`)
Two access patterns:
- **Rolling feeds** (`all_day.geojson`, `all_week.geojson`, `all_month.geojson`) —
  cheap, pre-built, used for the global map/events feed.
- **FDSN query API** (`/fdsnws/event/1/query`) — used for "earthquakes near this
  point" in the Location Analysis panel and Compare page, filtered by radius,
  date range, and minimum magnitude to keep results meaningful.

### Open-Meteo (`services/weatherApi.js`)
- `GET https://api.open-meteo.com/v1/forecast` — current conditions + 7-day daily
  forecast, used in the Current Conditions panel and in heat/flood scoring.
- `GET https://archive-api.open-meteo.com/v1/archive` — up to 5 years of daily
  history, aggregated client-side into yearly averages for the trend chart.

### Geocoding (`services/geocodingApi.js`)
- Forward: `GET https://geocoding-api.open-meteo.com/v1/search?name=...` — powers
  the search bar (debounced 400ms so it doesn't fire on every keystroke).
- Reverse: `GET https://api.bigdatacloud.net/data/reverse-geocode-client` — turns
  a raw map click into a place name; falls back to a plain "lat, lon" label if
  the lookup fails (e.g. clicking open ocean).

---

## 5. Data flow

```
User search or map click
        │
        ▼
Geocoding (forward search or reverse geocode) → { lat, lon, label }
        │
        ▼
useLocationAnalysis(point) fires 4 parallel, cached requests:
   • Open-Meteo current weather
   • NASA EONET global events (cached 10 min, filtered to within 500km client-side)
   • USGS earthquakes near point (FDSN query, last 90 days)
   • Open-Meteo 5-year historical weather
        │
        ▼
Results are normalized into a common event shape:
   { id, type, typeLabel, title, lat, lon, date, source, sourceUrl, magnitude? }
        │
        ▼
utils/riskCalculation.js#calculateExposureProfile(nearbyEvents, currentWeather)
   → { heat, flood, earthquake, wildfire } each as { level, points, reason }
        │
        ▼
React state in the hook → consumed by:
   RiskCard (exposure bars) · WeatherPanel (conditions) ·
   EventCard list (nearby events) · Chart (5yr temperature trend)
```

The Explore page's map uses a separate hook, `useGlobalEvents`, which loads the
full global EONET + USGS feed once per time-window filter and then filters by
type/time **client-side**, so switching filter chips is instant and doesn't
re-hit the network.

---

## 6. Key files to read to understand the app

1. **`utils/riskCalculation.js`** — the entire scoring methodology in one place,
   heavily commented. Start here to understand or modify how exposure levels
   are derived.
2. **`hooks/useLocationAnalysis.js`** — shows how the four data sources are
   fetched in parallel with `Promise.allSettled` (so one API failing doesn't
   break the others), then combined and fed into the risk calculator.
3. **`components/DisasterMap.jsx`** — Leaflet integration: click handling,
   imperative recentering on search, marker capping (`MAX_MARKERS`) instead of
   a clustering library, to keep the dependency list small.
4. **`components/SearchBar.jsx`** — debouncing pattern (`useDebounce`) applied
   to an autocomplete search box.
5. **`utils/cache.js`** — the whole caching layer is ~25 lines; every service
   call in the hooks is wrapped in `withCache(key, fn, ttl)`.

---

## 7. Known limitations (also shown in-app on `/sources` and `/about`)

- EONET tracks a curated set of significant events, not every local incident,
  and coordinates for tracked events can lag real time.
- USGS global feeds are dominated by very small earthquakes in seismically
  active regions; location-based queries use a minimum-magnitude filter.
- The exposure index is an **application-generated heuristic**, not a
  validated scientific hazard model — it is explicitly labeled as such
  throughout the UI.
- Free-tier basemap and reverse-geocoding services are rate-limited; heavy
  production traffic would need a paid tier or self-hosted alternative.
