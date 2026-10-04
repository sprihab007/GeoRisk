import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const GRID_COLOR = '#1b2430'
const AXIS_COLOR = '#64748b'

const tooltipStyle = {
  contentStyle: { background: '#0e131b', border: '1px solid #26313f', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#e2e8f0' },
  itemStyle: { color: '#cbd5e1' },
}

export function TimeSeriesChart({ data, dataKey, xKey = 'year', color = '#2dd4bf', unit = '', height = 220 }) {
  if (!data || data.length === 0) return <EmptyChart height={height} />
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 6, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid stroke={GRID_COLOR} vertical={false} />
        <XAxis dataKey={xKey} stroke={AXIS_COLOR} fontSize={11} tickLine={false} axisLine={{ stroke: GRID_COLOR }} />
        <YAxis stroke={AXIS_COLOR} fontSize={11} tickLine={false} axisLine={false} unit={unit} />
        <Tooltip {...tooltipStyle} formatter={(v) => [`${v}${unit}`, dataKey]} />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function HistogramChart({ data, dataKey, xKey, color = '#5eead4', height = 220 }) {
  if (!data || data.length === 0) return <EmptyChart height={height} />
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 6, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid stroke={GRID_COLOR} vertical={false} />
        <XAxis dataKey={xKey} stroke={AXIS_COLOR} fontSize={11} tickLine={false} axisLine={{ stroke: GRID_COLOR }} />
        <YAxis stroke={AXIS_COLOR} fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey={dataKey} fill={color} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function EmptyChart({ height }) {
  return (
    <div className="flex items-center justify-center text-xs text-slate-500 border border-dashed border-base-700 rounded-lg" style={{ height }}>
      Not enough data to chart yet.
    </div>
  )
}
