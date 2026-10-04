// ---------------------------------------------------------------------------
// RISK / EXPOSURE SCORING
// ---------------------------------------------------------------------------
// This module is intentionally simple and isolated from the UI so it is easy
// to read, audit, and modify. It is NOT a scientific hazard model — it is a
// transparent, application-defined index built from a handful of observable
// signals (recent nearby events + current weather). Every score is a bucket
// (LOW / MODERATE / HIGH / SEVERE), never a precise probability, because we
// have no statistical basis to claim precision.
//
// Inputs come from three already-normalized sources:
//   - nearbyEvents: EONET + USGS events within `SEARCH_RADIUS_KM` of the point
//   - currentWeather: Open-Meteo current conditions for the point
//   - historicalWeather: Open-Meteo multi-year yearly aggregates (optional)
// ---------------------------------------------------------------------------

export const SEARCH_RADIUS_KM = 500

const LEVELS = ['LOW', 'MODERATE', 'HIGH', 'SEVERE']

// Convert a raw 0-100 point total into one of the four labeled buckets.
function bucketize(points) {
  if (points >= 70) return 'SEVERE'
  if (points >= 45) return 'HIGH'
  if (points >= 20) return 'MODERATE'
  return 'LOW'
}

/**
 * Earthquake exposure: driven by how many nearby quakes occurred recently
 * and how strong the largest one was. This reflects recent seismic activity
 * in the region, not a formal fault-line hazard model.
 */
function earthquakeExposure(nearbyEvents) {
  const quakes = nearbyEvents.filter((e) => e.type === 'earthquake')
  if (quakes.length === 0) {
    return { level: 'LOW', points: 0, reason: 'No recorded earthquakes within 500 km in the lookback window.' }
  }
  const maxMag = Math.max(...quakes.map((q) => q.magnitude || 0))
  const count = quakes.length

  // Points: magnitude contributes most (a single M6+ event matters more
  // than dozens of micro-quakes), frequency adds a secondary signal.
  let points = 0
  if (maxMag >= 6) points += 60
  else if (maxMag >= 5) points += 40
  else if (maxMag >= 4) points += 22
  else points += 10

  points += Math.min(count, 30) // cap frequency's contribution

  return {
    level: bucketize(points),
    points,
    reason: `${count} earthquake${count === 1 ? '' : 's'} recorded within ${SEARCH_RADIUS_KM} km; largest magnitude M${maxMag.toFixed(1)}.`,
  }
}

/**
 * Wildfire exposure: driven by active EONET wildfire events nearby, and
 * boosted by hot + dry current conditions which raise fire risk generally.
 */
function wildfireExposure(nearbyEvents, currentWeather) {
  const fires = nearbyEvents.filter((e) => e.type === 'wildfire')
  let points = Math.min(fires.length * 25, 60)

  const temp = currentWeather?.temperature
  const precip = currentWeather?.precipitation
  if (typeof temp === 'number' && temp >= 32) points += 15
  if (typeof precip === 'number' && precip === 0 && typeof temp === 'number' && temp >= 25) points += 10

  const reasonParts = []
  reasonParts.push(`${fires.length} active wildfire event${fires.length === 1 ? '' : 's'} within ${SEARCH_RADIUS_KM} km.`)
  if (typeof temp === 'number') reasonParts.push(`Current temperature ${temp.toFixed(0)}°C.`)

  return { level: bucketize(points), points, reason: reasonParts.join(' ') }
}

/**
 * Flood exposure: driven by active EONET flood events nearby and current /
 * recent precipitation intensity.
 */
function floodExposure(nearbyEvents, currentWeather) {
  const floods = nearbyEvents.filter((e) => e.type === 'flood')
  let points = Math.min(floods.length * 30, 55)

  const precip = currentWeather?.precipitation
  const dailyRecentMax = currentWeather?.daily?.slice(0, 3)?.reduce((m, d) => Math.max(m, d.precipitation || 0), 0) || 0
  if (typeof precip === 'number' && precip > 5) points += 15
  if (dailyRecentMax > 40) points += 20
  else if (dailyRecentMax > 15) points += 10

  return {
    level: bucketize(points),
    points,
    reason: `${floods.length} active flood event${floods.length === 1 ? '' : 's'} nearby; forecast peak precipitation ${dailyRecentMax.toFixed(0)} mm/day in the next 3 days.`,
  }
}

/**
 * Heat exposure: purely from current + short-term forecast temperature,
 * since EONET's "temperature extreme" category is sparse and slow to update.
 */
function heatExposure(currentWeather) {
  const temp = currentWeather?.temperature
  const forecastMax = currentWeather?.daily?.reduce((m, d) => Math.max(m, d.tempMax ?? -Infinity), -Infinity)
  const peak = Math.max(temp ?? -Infinity, forecastMax ?? -Infinity)

  if (peak === -Infinity) return { level: 'LOW', points: 0, reason: 'No temperature data available.' }

  let points
  if (peak >= 42) points = 80
  else if (peak >= 36) points = 55
  else if (peak >= 30) points = 30
  else points = 8

  return {
    level: bucketize(points),
    points,
    reason: `Peak temperature (current + 7-day forecast) reaches ${peak.toFixed(0)}°C.`,
  }
}

/**
 * Compute the full exposure profile for a location. Returns an object keyed
 * by category, each with { level, points, reason }, plus the methodology
 * text shown in the "How is this calculated?" panel.
 */
export function calculateExposureProfile({ nearbyEvents = [], currentWeather = null }) {
  return {
    earthquake: earthquakeExposure(nearbyEvents),
    wildfire: wildfireExposure(nearbyEvents, currentWeather),
    flood: floodExposure(nearbyEvents, currentWeather),
    heat: heatExposure(currentWeather),
  }
}

export const RISK_LEVELS = LEVELS

export const METHODOLOGY_TEXT = `
GeoRisk's exposure indicators are an application-generated index, not a
scientific or predictive model. Each category (Earthquake, Wildfire, Flood,
Heat) is scored from 0-100 using simple, transparent rules:

• Earthquake — recent quake count and largest magnitude within ${SEARCH_RADIUS_KM} km
  (USGS data, last 30-365 days depending on view).
• Wildfire — number of currently active wildfire events nearby (NASA EONET)
  plus whether current conditions are hot and dry.
• Flood — number of currently active flood events nearby (NASA EONET) plus
  forecast precipitation intensity (Open-Meteo).
• Heat — current and 7-day forecast peak temperature (Open-Meteo).

The resulting score is bucketed into LOW / MODERATE / HIGH / SEVERE. These
labels describe relative exposure based on recent, observable data — they do
not predict whether or when a specific disaster will occur at this location.
`.trim()
