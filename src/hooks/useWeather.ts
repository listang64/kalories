import { useEffect, useState } from 'react'
import { fetchWeather, isFresh, readCachedWeather, type Weather } from '../lib/weather'

export function useWeather(date: string): Weather | null {
  const [weather, setWeather] = useState(() => readCachedWeather(date))

  useEffect(() => {
    let current = readCachedWeather(date)
    let loading = false
    let active = true
    setWeather(current)
    const refresh = () => {
      if (loading || isFresh(current, date) || document.visibilityState !== 'visible' || !navigator.onLine) return
      loading = true
      fetchWeather()
        .then((next) => {
          current = next
          if (active) setWeather(next.date === date ? next : null)
        })
        .catch(() => {})
        .finally(() => {
          loading = false
        })
    }
    refresh()
    document.addEventListener('visibilitychange', refresh)
    window.addEventListener('online', refresh)
    return () => {
      active = false
      document.removeEventListener('visibilitychange', refresh)
      window.removeEventListener('online', refresh)
    }
  }, [date])

  return weather
}
