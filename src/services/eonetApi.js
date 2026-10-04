// NASA EONET (Earth Observatory Natural Event Tracker) v3 API — free, no API key.
// Docs: https://eonet.gsfc.nasa.gov/docs/v3
const EONET_BASE = 'https://eonet.gsfc.nasa.gov/api/v3'

// EONET category ids -> our internal disaster-type keys used across the app.
// (Category list: https://eonet.gsfc.nasa.gov/api/v3/categories)
const CATEGORY_MAP = {
  wildfires: 'wildfire',
  severeStorms: 'storm',
  volcanoes: 'volcano',
  landslides: 'landslide',
  floods: 'flood',
  drought: 'drought',
  dustHaze: 'dust',
  earthquakes: 'earthquake', // rarely present in EONET, USGS is primary source
  seaLakeIce: 'ice',
  snow: 'snow',
  tempExtremes: 'heat',
  waterColor: 'water',
}

function mapCategoryId(id) {
  return CATEGORY_MAP[id] || 'other'
}

/**
 * Fetch currently open natural events from EONET, optionally scoped to a
 * bounding box and a lookback window (in days).
 * The raw response shape is: { events: [{ id, title, categories:[{id,title}],
 *   geometry: [{ date, type, coordinates }], sources:[{id,url}] }] }
 * Each event can carry multiple geometry snapshots (e.g. a storm track); we
 * use the most recent one as the event's current position.
 */
export async function fetchEonetEvents({ days = 20, limit = 100, bbox = null } = {}) {
  const params = new URLSearchParams({ status: 'open', limit: String(limit), days: String(days) })
  if (bbox) params.set('bbox', bbox) // "west,north,east,south"

  const url = `${EONET_BASE}/events?${params.toString()}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`EONET request failed (${res.status})`)
  const data = await res.json()

  return (data.events || [])
    .map((ev) => normalizeEonetEvent(ev))
    .filter((ev) => ev.lat != null && ev.lon != null)
}

function normalizeEonetEvent(ev) {
  // Use the last geometry entry: for tracked events (storms) this is the
  // most recent known position; for point events there is only one entry.
  const geom = ev.geometry && ev.geometry.length ? ev.geometry[ev.geometry.length - 1] : null
  let lon = null
  let lat = null
  if (geom) {
    if (geom.type === 'Point') {
      ;[lon, lat] = geom.coordinates
    } else if (geom.type === 'Polygon') {
      // Approximate a polygon event (e.g. a large fire scar) by its first ring's first vertex.
      const ring = geom.coordinates[0]
      if (ring && ring[0]) [lon, lat] = ring[0]
    }
  }

  const category = ev.categories && ev.categories[0] ? ev.categories[0] : { id: 'other', title: 'Other' }

  return {
    id: `eonet-${ev.id}`,
    type: mapCategoryId(category.id),
    typeLabel: category.title,
    title: ev.title,
    lat,
    lon,
    date: geom ? geom.date : null,
    source: 'NASA EONET',
    sourceUrl: ev.sources && ev.sources[0] ? ev.sources[0].url : 'https://eonet.gsfc.nasa.gov',
    magnitude: null, // EONET does not provide a severity/magnitude scale
  }
}
