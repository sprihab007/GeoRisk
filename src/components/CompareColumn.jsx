import { useState } from 'react'
import SearchBar from './SearchBar'
import RiskCard from './RiskCard'
import WeatherPanel from './WeatherPanel'
import { useLocationAnalysis } from '../hooks/useLocationAnalysis'
import { metaFor } from '../utils/formatters'

export default function CompareColumn({ label, onSelect, point }) {
  const { weather, weatherError, nearbyEvents, eventsError, exposure } = useLocationAnalysis(point)
  const [showAllEvents, setShowAllEvents] = useState(false)

  // Tally nearby events by type for the small count summary.
  const counts = {}
  nearbyEvents.forEach((e) => { counts[e.type] = (counts[e.type] || 0) + 1 })

  return (
    <div className="flex-1 min-w-[280px] rounded-2xl border border-base-700 bg-base-850/60 p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">{label}</div>
      <SearchBar onSelectLocation={onSelect} />

      {!point && <p className="text-sm text-slate-500 mt-6 text-center">Search a location to compare.</p>}

      {point && (
        <div className="mt-5 space-y-6">
          <h3 className="text-base font-semibold text-slate-100">{point.label}</h3>

          <section>
            <h4 className="text-xs uppercase tracking-wide text-slate-500 mb-2.5">Exposure</h4>
            {exposure ? (
              <div className="space-y-3">
                <RiskCard category="heat" data={exposure.heat} />
                <RiskCard category="flood" data={exposure.flood} />
                <RiskCard category="earthquake" data={exposure.earthquake} />
                <RiskCard category="wildfire" data={exposure.wildfire} />
              </div>
            ) : (
              <div className="h-24 rounded bg-base-700/50 animate-pulse" />
            )}
          </section>

          <section>
            <h4 className="text-xs uppercase tracking-wide text-slate-500 mb-2.5">Current Conditions</h4>
            <WeatherPanel weather={weather} error={weatherError} />
          </section>

          <section>
            <h4 className="text-xs uppercase tracking-wide text-slate-500 mb-2.5">Nearby Event Counts (500 km)</h4>
            {eventsError && <p className="text-xs text-red-400">{eventsError}</p>}
            {!eventsError && Object.keys(counts).length === 0 && (
              <p className="text-xs text-slate-500">No active events nearby.</p>
            )}
            {!eventsError && Object.keys(counts).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(counts).map(([type, count]) => {
                  const meta = metaFor(type)
                  return (
                    <span key={type} className="text-xs px-2.5 py-1 rounded-lg bg-base-800 border border-base-700 flex items-center gap-1.5">
                      <span>{meta.icon}</span>{meta.label} <span className="text-slate-500">×{count}</span>
                    </span>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
