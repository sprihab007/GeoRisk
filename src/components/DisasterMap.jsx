import { useEffect } from 'react'
import { MapContainer, TileLayer, useMapEvents, useMap, Marker, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import DisasterMarker from './DisasterMarker'

// Cap how many markers we render at once. The APIs can return hundreds of
// events; rendering all of them makes the map sluggish and unreadable. We
// simply show the N most recent, which is enough to convey global activity
// without needing a clustering library.
const MAX_MARKERS = 180

function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

// Recenter the map imperatively when the selected point changes (e.g. from
// a search result), without re-mounting the whole MapContainer.
function RecenterOnSelect({ point }) {
  const map = useMap()
  useEffect(() => {
    if (point) map.flyTo([point.lat, point.lon], Math.max(map.getZoom(), 5), { duration: 0.8 })
  }, [point?.lat, point?.lon]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

const selectedIcon = L.divIcon({
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#5eead4;border:3px solid white;box-shadow:0 0 0 4px rgba(94,234,212,0.35);"></div>`,
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

export default function DisasterMap({ events, selectedPoint, onMapClick }) {
  const visibleEvents = [...events]
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, MAX_MARKERS)

  return (
    <MapContainer
      center={[20, 10]}
      zoom={3}
      minZoom={2}
      worldCopyJump
      className="w-full h-full"
      preferCanvas
    >
      {/* OpenStreetMap standard tiles — free, no API key ever required.
          We approximate the dark "geospatial dashboard" look with a CSS
          filter (invert + hue-rotate) applied via the "dark-tiles" class
          below, instead of relying on a paid/keyed dark basemap service. */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        subdomains="abc"
        maxZoom={19}
        className="dark-tiles"
      />
      <ClickHandler onMapClick={onMapClick} />
      <RecenterOnSelect point={selectedPoint} />

      {visibleEvents.map((ev) => (
        <DisasterMarker key={ev.id} event={ev} />
      ))}

      {selectedPoint && <Marker position={[selectedPoint.lat, selectedPoint.lon]} icon={selectedIcon} />}
      {selectedPoint && (
        <CircleMarker
          center={[selectedPoint.lat, selectedPoint.lon]}
          radius={8}
          pathOptions={{ color: '#5eead4', fillOpacity: 0, weight: 1, dashArray: '2,4' }}
        />
      )}
    </MapContainer>
  )
}
