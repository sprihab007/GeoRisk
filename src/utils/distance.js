// Great-circle distance between two lat/lon points using the Haversine
// formula. Used to compute "X km away" labels and to filter events to
// those actually near a selected location.
const EARTH_RADIUS_KM = 6371

function toRad(deg) {
  return (deg * Math.PI) / 180
}

export function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_KM * c
}

export function formatDistance(km) {
  if (km == null || Number.isNaN(km)) return 'Unknown distance'
  if (km < 1) return '<1 km away'
  return `${Math.round(km)} km away`
}
