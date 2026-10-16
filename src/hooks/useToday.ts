import { useEffect, useState } from 'react'
import { msUntilMidnight, todayKey } from '../lib/dates'

export function useToday() {
  const [key, setKey] = useState(() => todayKey())

  useEffect(() => {
    let timer = 0
    const refresh = () => {
      setKey(todayKey())
      window.clearTimeout(timer)
      timer = window.setTimeout(refresh, msUntilMidnight() + 1000)
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    refresh()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return key
}
