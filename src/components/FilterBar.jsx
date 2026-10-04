import { DISASTER_META } from '../utils/formatters'

const TYPE_FILTERS = ['all', 'earthquake', 'wildfire', 'storm', 'volcano', 'flood', 'landslide']
const TIME_FILTERS = [
  { key: '1', label: 'Last 24h' },
  { key: '7', label: 'Last 7 days' },
  { key: '30', label: 'Last 30 days' },
]

export default function FilterBar({ typeFilter, onTypeChange, timeFilter, onTimeChange }) {
  return (
    <div className="flex flex-col gap-2.5 glass-panel rounded-xl px-3.5 py-3 shadow-panel">
      <div className="flex flex-wrap gap-1.5">
        {TYPE_FILTERS.map((t) => {
          const active = typeFilter === t
          const meta = t === 'all' ? null : DISASTER_META[t]
          return (
            <button
              key={t}
              onClick={() => onTypeChange(t)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors flex items-center gap-1
                ${active ? 'bg-accent-500/15 border-accent-500/50 text-accent-400' : 'border-base-600 text-slate-400 hover:border-base-500 hover:text-slate-200'}`}
            >
              {meta && <span>{meta.icon}</span>}
              {t === 'all' ? 'All' : meta.label}
            </button>
          )
        })}
      </div>
      <div className="flex gap-1.5 border-t border-base-700/60 pt-2.5">
        {TIME_FILTERS.map((tf) => (
          <button
            key={tf.key}
            onClick={() => onTimeChange(tf.key)}
            className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors
              ${timeFilter === tf.key ? 'bg-accent-500/15 border-accent-500/50 text-accent-400' : 'border-base-600 text-slate-400 hover:border-base-500 hover:text-slate-200'}`}
          >
            {tf.label}
          </button>
        ))}
      </div>
    </div>
  )
}
