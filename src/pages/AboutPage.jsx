export default function AboutPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">About GeoRisk</h1>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            GeoRisk is a global disaster and environmental risk explorer. It combines live natural-event
            data, earthquake records, and weather data into one interactive map so you can quickly see
            what's happening near any location on Earth, and get a transparent, application-generated
            sense of that location's environmental exposure.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <h2 className="text-sm font-semibold text-amber-400 mb-1.5">What this is not</h2>
          <p className="text-xs text-amber-200/80 leading-relaxed">
            GeoRisk is <strong>not</strong> a scientifically validated disaster prediction system. It cannot
            tell you whether or when a specific earthquake, flood, wildfire, or storm will occur at a
            location. The exposure indicators (LOW / MODERATE / HIGH / SEVERE) are a simple, transparent
            index built from recent public data — not a probability, forecast, or official hazard
            assessment. Always consult official government and meteorological agencies for safety
            decisions and emergency guidance.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-200 mb-1.5">How it works</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Searching or clicking a location geocodes it to coordinates, then queries NASA EONET for
            active natural events, USGS for nearby earthquakes, and Open-Meteo for current and historical
            weather. These are combined into a single exposure profile using logic kept in a single,
            readable module (<code className="text-accent-400">utils/riskCalculation.js</code>) so the
            methodology is always inspectable from the "How is this calculated?" panel.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-200 mb-1.5">Built with</h2>
          <p className="text-sm text-slate-400">
            React, Vite, Tailwind CSS, React Router, Leaflet / React Leaflet, and Recharts — see the{' '}
            <a href="/sources" className="text-accent-400 hover:underline">Sources</a> page for the full list of external APIs.
          </p>
        </div>
      </div>
    </div>
  )
}
