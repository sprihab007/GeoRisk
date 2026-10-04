import { useState } from 'react'
import RiskCard from './RiskCard'
import WeatherPanel from './WeatherPanel'
import EventCard from './EventCard'
import { TimeSeriesChart } from './Chart'
import { METHODOLOGY_TEXT, SEARCH_RADIUS_KM } from '../utils/riskCalculation'
import { useLocationAnalysis } from '../hooks/useLocationAnalysis'

export default function LocationAnalysisPanel({ point, onClose }) {
  const { loading, weather, weatherError, nearbyEvents, eventsError, historicalWeather, exposure } =
    useLocationAnalysis(point)
  const [showMethodology, setShowMethodology] = useState(false)

  if (!point) return null

  return (
    <div className="glass-panel rounded-2xl shadow-panel w-full sm:w-[380px] max-h-[calc(100vh-6rem)] overflow-y-auto">
      <div className="sticky top-0 glass-panel px-4 pt-4 pb-3 border-b border-base-700/60 z-10">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Location Analysis</div>
            <h2 className="text-base font-semibold text-slate-100 leading-tight mt-0.5">{point.label}</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">{point.lat.toFixed(3)}, {point.lon.toFixed(3)}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 text-lg leading-none px-1">×</button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Exposure profile */}
        <section>
          <h3 className="text-xs uppercase tracking-wide text-slate-500 mb-3">Environmental Exposure Profile</h3>
          {exposure ? (
            <div className="space-y-3.5">
              <RiskCard category="heat" data={exposure.heat} />
              <RiskCard category="flood" data={exposure.flood} />
              <RiskCard category="earthquake" data={exposure.earthquake} />
              <RiskCard category="wildfire" data={exposure.wildfire} />
            </div>
          ) : (
            <div className="space-y-3.5 animate-pulse">
              {[0, 1, 2, 3].map((i) => <div key={i} className="h-10 rounded bg-base-700/60" />)}
            </div>
          )}

          <button
            onClick={() => setShowMethodology((s) => !s)}
            className="mt-3 text-xs text-accent-400 hover:underline"
          >
            {showMethodology ? 'Hide' : 'How is this calculated?'}
          </button>
          {showMethodology && (
            <pre className="mt-2 text-[11px] leading-relaxed text-slate-400 whitespace-pre-wrap font-sans bg-base-800/60 border border-base-700 rounded-lg p-3">
              {METHODOLOGY_TEXT}
            </pre>
          )}
        </section>

        {/* Current conditions */}
        <section>
          <h3 className="text-xs uppercase tracking-wide text-slate-500 mb-3">Current Conditions</h3>
          <WeatherPanel weather={weather} error={weatherError} />
        </section>

        {/* Nearby events */}
        <section>
          <h3 className="text-xs uppercase tracking-wide text-slate-500 mb-3">
            Nearby Active Events <span className="text-slate-600">(within {SEARCH_RADIUS_KM} km)</span>
          </h3>
          {eventsError && <p className="text-xs text-red-400">{eventsError}</p>}
          {loading && !eventsError && (
            <div className="space-y-2 animate-pulse">
              {[0, 1].map((i) => <div key={i} className="h-16 rounded-xl bg-base-700/60" />)}
            </div>
          )}
          {!loading && !eventsError && nearbyEvents.length === 0 && (
            <p className="text-xs text-slate-500">No active events reported nearby right now.</p>
          )}
          {!loading && nearbyEvents.length > 0 && (
            <div className="space-y-2">
              {nearbyEvents.slice(0, 6).map((ev) => <EventCard key={ev.id} event={ev} />)}
            </div>
          )}
        </section>

        {/* Historical context */}
        <section>
          <h3 className="text-xs uppercase tracking-wide text-slate-500 mb-3">5-Year Temperature Trend</h3>
          <TimeSeriesChart data={historicalWeather} dataKey="avgMaxTemp" xKey="year" unit="°C" color="#e0784a" height={160} />
          <p className="text-[11px] text-slate-500 mt-2">Average of daily max temperature per year (Open-Meteo historical archive).</p>
        </section>
      </div>
    </div>
  )
}
