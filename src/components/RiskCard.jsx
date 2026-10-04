const LEVEL_STYLES = {
  LOW: { color: '#3ba55d', width: '20%' },
  MODERATE: { color: '#e0a72e', width: '48%' },
  HIGH: { color: '#e05a3e', width: '75%' },
  SEVERE: { color: '#c62b4f', width: '95%' },
}

const ICONS = { heat: '🌡️', flood: '🌊', earthquake: '🌍', wildfire: '🔥' }
const LABELS = { heat: 'Heat', flood: 'Flood', earthquake: 'Earthquake', wildfire: 'Wildfire' }

export default function RiskCard({ category, data }) {
  const style = LEVEL_STYLES[data.level] || LEVEL_STYLES.LOW
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-slate-300">
          <span>{ICONS[category]}</span>
          {LABELS[category]}
        </span>
        <span className="text-xs font-semibold tracking-wide" style={{ color: style.color }}>
          {data.level}
        </span>
      </div>
      <div className="exposure-track">
        <div className="exposure-fill" style={{ width: style.width, background: style.color }} />
      </div>
      <p className="text-xs text-slate-500 leading-snug">{data.reason}</p>
    </div>
  )
}
