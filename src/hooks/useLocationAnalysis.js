import { useEffect, useState } from 'react'
import { fetchEonetEvents } from '../services/eonetApi'
import { fetchEarthquakesNear } from '../services/usgsApi'
import { fetchCurrentWeather, fetchHistoricalWeather } from '../services/weatherApi'
import { calculateExposureProfile, SEARCH_RADIUS_KM } from '../utils/riskCalculation'
import { haversineDistanceKm } from '../utils/distance'
import { withCache } from '../utils/cache'

/**
 * Central data hook for the Location Analysis panel. Given a { lat, lon },
 * it fetches nearby events (EONET + USGS), current weather, and a short
 * history, then derives distances and the exposure profile.
 *
 * We re-run whenever lat/lon change (rounded to avoid re-fetching on
 * insignificant float jitter from map panning), not on every render.
 */
export function useLocationAnalysis(point) {
  const [state, setState] = useState({
    loading: false,
    error: null,
    weather: null,
    weatherError: null,
    nearbyEvents: [],
    eventsError: null,
    historicalWeather: [],
    exposure: null,
  })

  // Round to ~1km precision so panning the map slightly doesn't retrigger fetches.
  const lat = point ? Math.round(point.lat * 100) / 100 : null
  const lon = point ? Math.round(point.lon * 100) / 100 : null

  useEffect(() => {
    if (lat == null || lon == null) return
    let cancelled = false

    async function run() {
      setState((s) => ({ ...s, loading: true, error: null, weatherError: null, eventsError: null }))

      const cacheKey = `loc:${lat},${lon}`

      // Fetch the three sources independently so one failing doesn't block the others.
      const [weatherResult, eonetResult, quakeResult, historyResult] = await Promise.allSettled([
        withCache(`weather:${lat},${lon}`, () => fetchCurrentWeather(lat, lon)),
        withCache(`eonet:global`, () => fetchEonetEvents({ days: 30, limit: 150 }), 10 * 60 * 1000),
        withCache(`quakes:${lat},${lon}`, () => fetchEarthquakesNear(lat, lon, { radiusKm: SEARCH_RADIUS_KM, days: 90 })),
        withCache(`history:${lat},${lon}`, () => fetchHistoricalWeather(lat, lon, 5), 30 * 60 * 1000),
      ])

      if (cancelled) return

      const weather = weatherResult.status === 'fulfilled' ? weatherResult.value : null
      const weatherError = weatherResult.status === 'rejected' ? 'Open-Meteo data temporarily unavailable.' : null

      const eonetAll = eonetResult.status === 'fulfilled' ? eonetResult.value : []
      const eonetError = eonetResult.status === 'rejected'
      const quakes = quakeResult.status === 'fulfilled' ? quakeResult.value : []
      const quakeError = quakeResult.status === 'rejected'

      // Combine EONET (global feed, filtered to nearby) + USGS (already queried near the point).
      const nearbyEonet = eonetAll
        .map((e) => ({ ...e, distanceKm: haversineDistanceKm(lat, lon, e.lat, e.lon) }))
        .filter((e) => e.distanceKm <= SEARCH_RADIUS_KM)
      const nearbyQuakes = quakes.map((q) => ({ ...q, distanceKm: haversineDistanceKm(lat, lon, q.lat, q.lon) }))

      const nearbyEvents = [...nearbyEonet, ...nearbyQuakes].sort((a, b) => a.distanceKm - b.distanceKm)

      const eventsError = eonetError && quakeError ? 'Event data temporarily unavailable (NASA EONET and USGS both failed).' : null

      const historicalWeather = historyResult.status === 'fulfilled' ? historyResult.value : []

      const exposure = calculateExposureProfile({ nearbyEvents, currentWeather: weather })

      setState({
        loading: false,
        error: null,
        weather,
        weatherError,
        nearbyEvents,
        eventsError,
        historicalWeather,
        exposure,
      })
    }

    run()
    return () => { cancelled = true }
  }, [lat, lon])

  return state
}
