import { SOURCES } from '../data/sources'

export default function SourcesPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-100">Data Sources</h1>
          <p className="text-sm text-slate-500 mt-1">
            GeoRisk only uses real, publicly available data. No disaster or environmental data shown in this app is fabricated.
          </p>
        </div>

        <div className="space-y-4">
          {SOURCES.map((s) => (
            <div key={s.name} className="rounded-2xl border border-base-700 bg-base-850/60 p-5">
              <div className="flex items-baseline justify-between flex-wrap gap-1">
                <h2 className="text-base font-semibold text-slate-100">{s.name}</h2>
                <a href={s.docsUrl} target="_blank" rel="noreferrer" className="text-xs text-accent-400 hover:underline">
                  Official documentation ↗
                </a>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{s.fullName}</p>

              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">What it provides</dt>
                  <dd className="text-slate-300">{s.provides}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Used in GeoRisk for</dt>
                  <dd className="text-slate-300">{s.usedIn}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Limitations</dt>
                  <dd className="text-slate-400">{s.limitations}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
