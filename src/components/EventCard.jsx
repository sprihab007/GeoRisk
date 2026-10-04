import { Link } from 'react-router-dom'
import { metaFor, formatDate, formatMagnitude, timeAgo } from '../utils/formatters'
import { formatDistance } from '../utils/distance'

export default function EventCard({ event }) {
  const meta = metaFor(event.type)
  const mag = formatMagnitude(event)

  return (
    <Link
      to={`/?lat=${event.lat}&lon=${event.lon}&label=${encodeURIComponent(event.title)}`}
      className="flex items-start gap-3 rounded-xl border border-base-700 bg-base-800/60 px-4 py-3.5 hover:border-accent-500/40 hover:bg-base-800 transition-colors"
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0"
        style={{ background: `${meta.color}22`, border: `1px solid ${meta.color}55` }}
      >
        {meta.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-slate-100 truncate">{meta.label}</span>
          <span className="text-xs text-slate-500 shrink-0">{timeAgo(event.date)}</span>
        </div>
        <p className="text-xs text-slate-400 truncate mt-0.5">{event.title}</p>
        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
          {mag && <span className="px-1.5 py-0.5 rounded bg-base-700 text-slate-300">{mag}</span>}
          <span>{formatDate(event.date)}</span>
          {event.distanceKm != null && <span>· {formatDistance(event.distanceKm)}</span>}
          <span>· {event.source}</span>
        </div>
      </div>
    </Link>
  )
}
