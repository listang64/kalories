const KEY = 'kalories.imposteur'

export function readSession<T>(fallback: T): T {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? { ...fallback, ...(JSON.parse(raw) as Partial<T>) } : fallback
  } catch {
    return fallback
  }
}

export function writeSession(value: unknown) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(value))
  } catch {
    return
  }
}
