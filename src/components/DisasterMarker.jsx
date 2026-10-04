import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { metaFor, formatDate, formatMagnitude } from '../utils/formatters'
import { formatDistance } from '../utils/distance'

// Leaflet needs real DOM icons; we build a small colored circle divIcon per
// disaster type instead of shipping image assets, so markers stay crisp at
// any zoom and are easy to restyle by editing formatters.js's DISASTER_META.
function buildIcon(type) {
  const meta = metaFor(type)
  const html = `
    <div style="
      width: 26px; height: 26px; border-radius: 50%;
      background: ${meta.color}; border: 2px solid rgba(255,255,255,0.85);
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; box-shadow: 0 0 0 3px rgba(0,0,0,0.35);
    ">${meta.icon}</div>`
  return L.divIcon({ html, className: '', iconSize: [26, 26], iconAnchor: [13, 13], popupAnchor: [0, -13] })
}

export default function DisasterMarker({ event }) {
  const meta = metaFor(event.type)
  const mag = formatMagnitude(event)

  return (
    <Marker position={[event.lat, event.lon]} icon={buildIcon(event.type)}>
      <Popup>
        <div className="min-w-[200px] space-y-1.5">
          <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: meta.color }}>
            <span>{meta.icon}</span>
            <span>{meta.label}</span>
          </div>
          <div className="text-sm font-medium text-slate-100">{event.title}</div>
          {mag && <div className="text-xs text-slate-400">Magnitude {mag}{event.depthKm != null ? ` · Depth ${event.depthKm.toFixed(0)} km` : ''}</div>}
          <div className="text-xs text-slate-400">{formatDate(event.date)}</div>
          {event.distanceKm != null && (
            <div className="text-xs text-slate-400">{formatDistance(event.distanceKm)}</div>
          )}
          <div className="text-xs text-slate-500 pt-1 border-t border-base-700 mt-1.5">
            Source: {event.source}
            {event.sourceUrl && (
              <>
                {' · '}
                <a href={event.sourceUrl} target="_blank" rel="noreferrer" className="text-accent-400 hover:underline">
                  View original
                </a>
              </>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  )
}
