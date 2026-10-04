import { describeWeatherCode } from '../services/weatherApi'

export default function WeatherPanel({ weather, error }) {
  if (error) {
    return <p className="text-xs text-red-400">{error}</p>
  }
  if (!weather) {
    return (
      <div className="grid grid-cols-2 gap-2.5 animate-pulse">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-14 rounded-lg bg-base-700/60" />)}
      </div>
    )
  }

  const items = [
    { label: 'Temperature', value: weather.temperature != null ? `${weather.temperature.toFixed(1)}°C` : '—' },
    { label: 'Precipitation', value: weather.precipitation != null ? `${weather.precipitation.toFixed(1)} mm` : '—' },
    { label: 'Wind', value: weather.windSpeed != null ? `${weather.windSpeed.toFixed(0)} km/h` : '—' },
    { label: 'Conditions', value: describeWeatherCode(weather.weatherCode) },
  ]

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg bg-base-800/70 border border-base-700 px-3 py-2.5">
          <div className="text-[10px] uppercase tracking-wide text-slate-500">{item.label}</div>
          <div className="text-sm text-slate-100 font-medium mt-0.5">{item.value}</div>
        </div>
      ))}
    </div>
  )
}
