import { useEffect } from 'react'

export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null
    let alive = true
    const request = async () => {
      if (document.hidden) return
      try {
        const next = await navigator.wakeLock.request('screen')
        if (alive) lock = next
        else void next.release()
      } catch {
        lock = null
      }
    }
    const onVisible = () => !document.hidden && void request()
    void request()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      alive = false
      document.removeEventListener('visibilitychange', onVisible)
      void lock?.release().catch(() => undefined)
    }
  }, [active])
}
