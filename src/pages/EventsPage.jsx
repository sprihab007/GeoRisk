import { useMemo, useState } from 'react'
import EventCard from '../components/EventCard'
import FilterBar from '../components/FilterBar'
import { useGlobalEvents } from '../hooks/useGlobalEvents'

export default function EventsPage() {
  const [typeFilter, setTypeFilter] = useState('all')
  const [timeFilter, setTimeFilter] = useState('7')
  const [query, setQuery] = useState('')
  const { allEvents, loading, eonetError, usgsError } = useGlobalEvents(Number(timeFilter))

  const events = useMemo(() => {
    const cutoff = Date.now() - Number(timeFilter) * 24 * 60 * 60 * 1000
    return allEvents
      .filter((ev) => {
        if (typeFilter !== 'all' && ev.type !== typeFilter) return false
        if (ev.date && new Date(ev.date).getTime() < cutoff) return false
        if (query && !ev.title.toLowerCase().includes(query.toLowerCase())) return false
        return true
      })
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
  }, [allEvents, typeFilter, timeFilter, query])

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-100">Live Events</h1>
          <p className="text-sm text-slate-500 mt-1">Current natural events from NASA EONET and USGS, newest first.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events by title or place..."
            className="flex-1 bg-base-800 border border-base-700 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-accent-500/50 placeholder:text-slate-500"
          />
        </div>
        <div className="mb-6">
          <FilterBar typeFilter={typeFilter} onTypeChange={setTypeFilter} timeFilter={timeFilter} onTimeChange={setTimeFilter} />
        </div>

        {(eonetError || usgsError) && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-400 mb-5 space-y-0.5">
            {eonetError && <p>{eonetError}</p>}
            {usgsError && <p>{usgsError}</p>}
          </div>
        )}

        {loading && (
          <div className="space-y-2.5 animate-pulse">
            {[0, 1, 2, 3, 4].map((i) => <div key={i} className="h-16 rounded-xl bg-base-700/60" />)}
          </div>
        )}

        {!loading && events.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-12">No events match these filters.</p>
        )}

        {!loading && events.length > 0 && (
          <div className="space-y-2.5">
            {events.slice(0, 100).map((ev) => <EventCard key={ev.id} event={ev} />)}
          </div>
        )}
      </div>
    </div>
  )
}
