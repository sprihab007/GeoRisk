// Very small in-memory cache keyed by string. This lives for the lifetime
// of the browser tab (it resets on refresh) and exists purely to stop the
// app from re-fetching the same EONET/USGS/weather data every time a
// component re-renders or the user revisits a location within a session.
const store = new Map()
const DEFAULT_TTL_MS = 5 * 60 * 1000 // 5 minutes — events/weather change slowly enough for this

export function getCached(key) {
  const entry = store.get(key)
  if (!entry) return undefined
  if (Date.now() - entry.time > entry.ttl) {
    store.delete(key)
    return undefined
  }
  return entry.value
}

export function setCached(key, value, ttl = DEFAULT_TTL_MS) {
  store.set(key, { value, time: Date.now(), ttl })
}

/**
 * Fetch-and-cache wrapper: runs `fn` only if `key` isn't already cached.
 */
export async function withCache(key, fn, ttl = DEFAULT_TTL_MS) {
  const cached = getCached(key)
  if (cached !== undefined) return cached
  const value = await fn()
  setCached(key, value, ttl)
  return value
}
