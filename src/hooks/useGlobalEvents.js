import { useEffect, useState } from 'react'
import { fetchEonetEvents } from '../services/eonetApi'
import { fetchEarthquakes } from '../services/usgsApi'
import { withCache } from '../utils/cache'

// Map our time-filter keys ('1' | '7' | '30') to the closest USGS rolling feed.
function usgsWindowFor(days) {
  if (days <= 1) return 'day'
  if (days <= 7) return 'week'
  return 'month'
}

/**
 * Loads the global event feed (EONET + USGS) once per time-window change and
 * filters client-side by type/time so switching filters feels instant instead
 * of re-fetching from the network on every click.
 */
export function useGlobalEvents(timeFilterDays) {
  const [allEvents, setAllEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [eonetError, setEonetError] = useState(null)
  const [usgsError, setUsgsError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    async function run() {
      const [eonetResult, usgsResult] = await Promise.allSettled([
        withCache('eonet:global', () => fetchEonetEvents({ days: Math.max(timeFilterDays, 20), limit: 200 }), 10 * 60 * 1000),
        withCache(`usgs:${usgsWindowFor(timeFilterDays)}`, () => fetchEarthquakes(usgsWindowFor(timeFilterDays)), 5 * 60 * 1000),
      ])
      if (cancelled) return

      const eonet = eonetResult.status === 'fulfilled' ? eonetResult.value : []
      const usgs = usgsResult.status === 'fulfilled' ? usgsResult.value : []
      setEonetError(eonetResult.status === 'rejected' ? 'NASA EONET data temporarily unavailable.' : null)
      setUsgsError(usgsResult.status === 'rejected' ? 'USGS earthquake data temporarily unavailable.' : null)
      setAllEvents([...eonet, ...usgs])
      setLoading(false)
    }
    run()
    return () => { cancelled = true }
  }, [timeFilterDays])

  return { allEvents, loading, eonetError, usgsError }
}
