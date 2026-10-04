import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import DisasterMap from '../components/DisasterMap'
import SearchBar from '../components/SearchBar'
import FilterBar from '../components/FilterBar'
import LocationAnalysisPanel from '../components/LocationAnalysisPanel'
import { useGlobalEvents } from '../hooks/useGlobalEvents'
import { reverseGeocode } from '../services/geocodingApi'

export default function ExplorePage() {
  const [searchParams] = useSearchParams()
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [typeFilter, setTypeFilter] = useState('all')
  const [timeFilter, setTimeFilter] = useState('7')

  const { allEvents, eonetError, usgsError } = useGlobalEvents(Number(timeFilter))

  // Support arriving here from the Events page with ?lat=&lon=&label=
  useEffect(() => {
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    const label = searchParams.get('label')
    if (lat && lon) {
      setSelectedPoint({ lat: parseFloat(lat), lon: parseFloat(lon), label: label || 'Selected location' })
    }
  }, [searchParams])

  const filteredEvents = useMemo(() => {
    const cutoff = Date.now() - Number(timeFilter) * 24 * 60 * 60 * 1000
    return allEvents.filter((ev) => {
      if (typeFilter !== 'all' && ev.type !== typeFilter) return false
      if (ev.date && new Date(ev.date).getTime() < cutoff) return false
      return true
    })
  }, [allEvents, typeFilter, timeFilter])

  async function handleMapClick(lat, lon) {
    const place = await reverseGeocode(lat, lon)
    setSelectedPoint({ lat, lon, label: place.label })
  }

  function handleSelectLocation(loc) {
    setSelectedPoint(loc)
  }

  return (
    <div className="relative flex-1 min-h-0">
      <DisasterMap events={filteredEvents} selectedPoint={selectedPoint} onMapClick={handleMapClick} />

      {/* Floating controls, overlaid on the map */}
      <div className="absolute top-4 left-4 right-4 sm:right-auto z-[500] flex flex-col gap-3 sm:max-w-md">
        <SearchBar onSelectLocation={handleSelectLocation} />
        <FilterBar typeFilter={typeFilter} onTypeChange={setTypeFilter} timeFilter={timeFilter} onTimeChange={setTimeFilter} />
        {(eonetError || usgsError) && (
          <div className="glass-panel rounded-xl px-3.5 py-2.5 text-xs text-amber-400 space-y-0.5">
            {eonetError && <p>{eonetError}</p>}
            {usgsError && <p>{usgsError}</p>}
          </div>
        )}
      </div>

      {/* Location analysis panel */}
      {selectedPoint && (
        <div className="absolute top-4 right-4 bottom-4 z-[500] sm:flex hidden">
          <LocationAnalysisPanel point={selectedPoint} onClose={() => setSelectedPoint(null)} />
        </div>
      )}
      {selectedPoint && (
        <div className="absolute inset-x-0 bottom-0 z-[500] sm:hidden max-h-[70vh]">
          <LocationAnalysisPanel point={selectedPoint} onClose={() => setSelectedPoint(null)} />
        </div>
      )}

      {/* Hint shown when nothing is selected yet */}
      {!selectedPoint && (
        <div className="absolute bottom-4 left-4 z-[500] glass-panel rounded-xl px-3.5 py-2.5 text-xs text-slate-400 max-w-xs">
          Search a location or click anywhere on the map to see its environmental exposure profile.
        </div>
      )}
    </div>
  )
}
