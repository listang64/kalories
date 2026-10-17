import { useEffect, useState } from 'react'
import type { Place } from '../lib/places'
import { fetchWeather, isFresh, readCachedWeather, type Weather } from '../lib/weather'

export function useWeather(place: Place, dateKey: string): Weather | null {
  const [weather, setWeather] = useState(() => readCachedWeather(place))

  useEffect(() => {
    let current = readCachedWeather(place)
    let loading = false
    let active = true
    setWeather(current)
    const refresh = () => {
      if (loading || isFresh(current) || document.visibilityState !== 'visible' || !navigator.onLine) return
      loading = true
      fetchWeather(place)
        .then((next) => {
          current = next
          if (active) setWeather(next)
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
  }, [place, dateKey])

  return weather
}
