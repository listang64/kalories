export type WeatherKind = 'clear' | 'partly' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'storm'

export interface Weather {
  date: string
  max: number
  kind: WeatherKind
  fetchedAt: number
}

export const WEATHER_PLACE = 'Hasparren'

const URL =
  'https://api.open-meteo.com/v1/forecast?latitude=43.3842&longitude=-1.3053&daily=temperature_2m_max,weather_code&timezone=Europe%2FParis&forecast_days=1'
const CACHE_KEY = 'kalories.weather'
const MAX_AGE = 30 * 60_000

export const WEATHER_LABELS: Record<WeatherKind, string> = {
  clear: 'Ensoleillé',
  partly: 'Éclaircies',
  cloudy: 'Nuageux',
  fog: 'Brouillard',
  drizzle: 'Bruine',
  rain: 'Pluie',
  snow: 'Neige',
  storm: 'Orage',
}

function kindOf(code: number): WeatherKind {
  if (code === 0) return 'clear'
  if (code <= 2) return 'partly'
  if (code === 45 || code === 48) return 'fog'
  if (code >= 51 && code <= 57) return 'drizzle'
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'rain'
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow'
  if (code >= 95) return 'storm'
  return 'cloudy'
}

export function readCachedWeather(date: string): Weather | null {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null') as Weather | null
    return cached?.date === date ? cached : null
  } catch {
    return null
  }
}

export function isFresh(weather: Weather | null, date: string): boolean {
  return weather?.date === date && Date.now() - weather.fetchedAt < MAX_AGE
}

interface ForecastResponse {
  daily?: { time?: string[]; temperature_2m_max?: (number | null)[]; weather_code?: (number | null)[] }
}

export async function fetchWeather(): Promise<Weather> {
  const response = await fetch(URL)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const { daily } = (await response.json()) as ForecastResponse
  const date = daily?.time?.[0]
  const max = daily?.temperature_2m_max?.[0]
  const code = daily?.weather_code?.[0]
  if (!date || typeof max !== 'number' || typeof code !== 'number') throw new Error('Météo illisible')
  const weather: Weather = { date, max: Math.round(max), kind: kindOf(code), fetchedAt: Date.now() }
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(weather))
  } catch {
    return weather
  }
  return weather
}
