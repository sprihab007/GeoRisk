// Open-Meteo Forecast & Historical Weather APIs — free, no API key required.
// Docs: https://open-meteo.com/en/docs and https://open-meteo.com/en/docs/historical-weather-api
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1/archive'

/**
 * Current conditions + a few days of context for a point, used by the
 * "Current conditions" section of the Location Analysis panel.
 */
export async function fetchCurrentWeather(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: 'temperature_2m,precipitation,wind_speed_10m,wind_direction_10m,weather_code,relative_humidity_2m',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max',
    timezone: 'auto',
    forecast_days: '7',
  })
  const res = await fetch(`${FORECAST_URL}?${params.toString()}`)
  if (!res.ok) throw new Error(`Open-Meteo request failed (${res.status})`)
  const data = await res.json()

  return {
    temperature: data.current?.temperature_2m ?? null,
    precipitation: data.current?.precipitation ?? null,
    windSpeed: data.current?.wind_speed_10m ?? null,
    windDirection: data.current?.wind_direction_10m ?? null,
    humidity: data.current?.relative_humidity_2m ?? null,
    weatherCode: data.current?.weather_code ?? null,
    units: data.current_units || {},
    daily: (data.daily?.time || []).map((date, i) => ({
      date,
      tempMax: data.daily.temperature_2m_max[i],
      tempMin: data.daily.temperature_2m_min[i],
      precipitation: data.daily.precipitation_sum[i],
      windMax: data.daily.wind_speed_10m_max[i],
    })),
  }
}

/**
 * Historical daily weather for the past `years` years (used to build the
 * "temperature/precipitation over time" heat & flood context chart).
 * The archive API only has data up to a few days before today, so we clip
 * the end date accordingly.
 */
export async function fetchHistoricalWeather(lat, lon, years = 5) {
  const end = new Date()
  end.setDate(end.getDate() - 5)
  const start = new Date(end)
  start.setFullYear(start.getFullYear() - years)

  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    start_date: start.toISOString().slice(0, 10),
    end_date: end.toISOString().slice(0, 10),
    daily: 'temperature_2m_max,precipitation_sum',
    timezone: 'auto',
  })
  const res = await fetch(`${ARCHIVE_URL}?${params.toString()}`)
  if (!res.ok) throw new Error(`Open-Meteo archive request failed (${res.status})`)
  const data = await res.json()

  const dates = data.daily?.time || []
  const maxT = data.daily?.temperature_2m_max || []
  const precip = data.daily?.precipitation_sum || []

  // Aggregate daily data into yearly averages so the chart stays readable.
  const byYear = {}
  dates.forEach((date, i) => {
    const year = date.slice(0, 4)
    if (!byYear[year]) byYear[year] = { year, tempSum: 0, tempCount: 0, precipSum: 0 }
    if (typeof maxT[i] === 'number') {
      byYear[year].tempSum += maxT[i]
      byYear[year].tempCount += 1
    }
    if (typeof precip[i] === 'number') byYear[year].precipSum += precip[i]
  })

  return Object.values(byYear).map((y) => ({
    year: y.year,
    avgMaxTemp: y.tempCount ? +(y.tempSum / y.tempCount).toFixed(1) : null,
    totalPrecipitation: +y.precipSum.toFixed(0),
  }))
}

// WMO weather code -> short human label. Used to avoid showing a raw integer.
// Reference: https://open-meteo.com/en/docs (WMO Weather interpretation codes)
const WEATHER_CODES = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Depositing rime fog',
  51: 'Light drizzle', 53: 'Drizzle', 55: 'Dense drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow',
  80: 'Rain showers', 81: 'Rain showers', 82: 'Violent rain showers',
  95: 'Thunderstorm', 96: 'Thunderstorm w/ hail', 99: 'Severe thunderstorm w/ hail',
}
export function describeWeatherCode(code) {
  return WEATHER_CODES[code] || 'Unknown'
}
