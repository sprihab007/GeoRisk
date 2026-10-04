// USGS Earthquake Hazards Program GeoJSON feeds — free, no API key.
// Docs: https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php
const USGS_BASE = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary'

// Pre-built rolling feeds. We pick one based on the requested time window
// instead of hitting the more expensive custom-query endpoint for common cases.
const FEEDS = {
  day: `${USGS_BASE}/all_day.geojson`,
  week: `${USGS_BASE}/all_week.geojson`,
  month: `${USGS_BASE}/all_month.geojson`,
}

/**
 * Fetch earthquakes for a rolling window ('day' | 'week' | 'month').
 * GeoJSON feature shape: { properties: {mag, place, time, url, ...},
 *   geometry: { coordinates: [lon, lat, depthKm] } }
 */
export async function fetchEarthquakes(window = 'week') {
  const url = FEEDS[window] || FEEDS.week
  const res = await fetch(url)
  if (!res.ok) throw new Error(`USGS request failed (${res.status})`)
  const data = await res.json()
  return (data.features || []).map(normalizeQuake)
}

/**
 * Fetch earthquakes within a radius (km) of a point for a given number of
 * days back — used for the location analysis panel and history charts.
 * Uses the custom fdsnws query API which supports geographic filtering.
 * Docs: https://earthquake.usgs.gov/fdsnws/event/1/
 */
export async function fetchEarthquakesNear(lat, lon, { radiusKm = 500, days = 365, minMagnitude = 2.5 } = {}) {
  const end = new Date()
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000)
  const params = new URLSearchParams({
    format: 'geojson',
    starttime: start.toISOString().slice(0, 10),
    endtime: end.toISOString().slice(0, 10),
    latitude: String(lat),
    longitude: String(lon),
    maxradiuskm: String(radiusKm),
    minmagnitude: String(minMagnitude),
    orderby: 'time',
    limit: '500',
  })
  const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?${params.toString()}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`USGS query failed (${res.status})`)
  const data = await res.json()
  return (data.features || []).map(normalizeQuake)
}

function normalizeQuake(f) {
  const [lon, lat, depth] = f.geometry.coordinates
  return {
    id: `usgs-${f.id}`,
    type: 'earthquake',
    typeLabel: 'Earthquake',
    title: f.properties.place || 'Unknown location',
    lat,
    lon,
    depthKm: depth,
    magnitude: f.properties.mag,
    date: f.properties.time ? new Date(f.properties.time).toISOString() : null,
    source: 'USGS',
    sourceUrl: f.properties.url,
    tsunami: f.properties.tsunami === 1,
  }
}
