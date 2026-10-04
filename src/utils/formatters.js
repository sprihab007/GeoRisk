// Small, dependency-free formatting helpers shared across components.

export function timeAgo(isoDate) {
  if (!isoDate) return 'Unknown time'
  const diffMs = Date.now() - new Date(isoDate).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`
  const years = Math.floor(months / 12)
  return `${years} year${years === 1 ? '' : 's'} ago`
}

export function formatDate(isoDate) {
  if (!isoDate) return 'Unknown date'
  return new Date(isoDate).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export const DISASTER_META = {
  earthquake: { label: 'Earthquake', icon: '🌍', color: '#e0a72e' },
  wildfire: { label: 'Wildfire', icon: '🔥', color: '#e05a3e' },
  storm: { label: 'Storm', icon: '🌪️', color: '#5eb3e0' },
  volcano: { label: 'Volcano', icon: '🌋', color: '#c62b4f' },
  flood: { label: 'Flood', icon: '🌊', color: '#3aa0c6' },
  landslide: { label: 'Landslide', icon: '⛰️', color: '#a67c52' },
  drought: { label: 'Drought', icon: '🏜️', color: '#d1a355' },
  dust: { label: 'Dust / Haze', icon: '🌫️', color: '#b0a99f' },
  ice: { label: 'Sea/Lake Ice', icon: '🧊', color: '#8fd6e8' },
  snow: { label: 'Snow', icon: '❄️', color: '#cfe8f2' },
  heat: { label: 'Temp. Extreme', icon: '🌡️', color: '#e0784a' },
  water: { label: 'Water Color', icon: '💧', color: '#4a90c2' },
  other: { label: 'Other Event', icon: '⚠️', color: '#94a3b8' },
}

export function metaFor(type) {
  return DISASTER_META[type] || DISASTER_META.other
}

export function formatMagnitude(ev) {
  if (ev.type === 'earthquake' && typeof ev.magnitude === 'number') {
    return `M${ev.magnitude.toFixed(1)}`
  }
  return null
}
