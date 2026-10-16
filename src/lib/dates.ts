export function todayKey(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function dateFromKey(key: string): Date {
  const [y = 1970, m = 1, d = 1] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatLongDate(key: string): string {
  const label = dateFromKey(key).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function msUntilMidnight(now = new Date()): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  return next.getTime() - now.getTime()
}

export function addDays(key: string, delta: number): string {
  const date = dateFromKey(key)
  date.setDate(date.getDate() + delta)
  return todayKey(date)
}

export function dayLabel(key: string, today: string): string {
  if (key === today) return 'Aujourd’hui'
  if (key === addDays(today, -1)) return 'Hier'
  return formatLongDate(key)
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}
