// Open-Meteo Geocoding API — free, no API key required.
// Docs: https://open-meteo.com/en/docs/geocoding-api
const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search'
// BigDataCloud's free client-side reverse geocoding endpoint — free, no key,
// used only to turn a raw map click (lat/lon) into a readable place name.
// Docs: https://www.bigdatacloud.com/docs/api/free-reverse-geocode-to-city-api
const REVERSE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client'

/**
 * Search for a place by name and return normalized location candidates.
 * The API returns a `results` array (absent if there are zero matches),
 * each with name/country/admin1/latitude/longitude/population.
 */
export async function searchLocation(query) {
  if (!query || query.trim().length < 2) return []

  const url = `${GEOCODE_URL}?name=${encodeURIComponent(query.trim())}&count=6&language=en&format=json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Geocoding request failed (${res.status})`)
  const data = await res.json()

  if (!data.results) return []

  return data.results.map((r) => ({
    id: r.id,
    name: r.name,
    country: r.country || '',
    admin1: r.admin1 || '',
    lat: r.latitude,
    lon: r.longitude,
    population: r.population || null,
    // Human-friendly label used throughout the UI, e.g. "Delhi, Delhi, India"
    label: [r.name, r.admin1, r.country].filter(Boolean).join(', '),
  }))
}

/**
 * Reverse-geocode a clicked map coordinate into a place name so a raw
 * click on the ocean or countryside still gets a sensible label.
 * Falls back to a plain coordinate string if the lookup fails (e.g. open
 * ocean, or the free API being briefly unavailable).
 */
export async function reverseGeocode(lat, lon) {
  try {
    const url = `${REVERSE_URL}?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    const res = await fetch(url)
    if (!res.ok) throw new Error('reverse failed')
    const data = await res.json()
    const name = data.city || data.locality || data.principalSubdivision || null
    if (name) {
      return {
        name,
        country: data.countryName || '',
        admin1: data.principalSubdivision || '',
        label: [name, data.countryName].filter(Boolean).join(', '),
      }
    }
  } catch {
    // Silently fall through to the coordinate-based label below.
  }
  return {
    name: `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
    country: '',
    admin1: '',
    label: `Location at ${lat.toFixed(2)}, ${lon.toFixed(2)}`,
  }
}
