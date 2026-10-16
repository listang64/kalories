import { profileByUid, type ProfileId } from '../config/users'
import { addDays } from './dates'
import type { Meal } from './meals'
import { mealTotals } from './nutrition'

export interface DayPoint {
  date: string
  values: Record<ProfileId, number | null>
}

export interface PersonStats {
  average: number | null
  logged: number
  under: number
  streak: number
}

export function lastDays(today: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => addDays(today, i - count + 1))
}

export function buildHistory(meals: Meal[], days: string[]): DayPoint[] {
  const byDate = new Map<string, Record<ProfileId, number | null>>(
    days.map((date) => [date, { nico: null, chachou: null }]),
  )
  for (const meal of meals) {
    const entry = byDate.get(meal.date)
    const profile = profileByUid(meal.uid)
    if (!entry || !profile) continue
    entry[profile.id] = (entry[profile.id] ?? 0) + mealTotals(meal.items).kcal
  }
  return days.map((date) => ({ date, values: byDate.get(date) ?? { nico: null, chachou: null } }))
}

export function statsFor(points: DayPoint[], id: ProfileId, goal: number, today: string): PersonStats {
  const finished = points.filter((point) => point.date !== today)
  const values = finished.map((point) => point.values[id]).filter((value): value is number => value !== null)
  let streak = 0
  for (const point of [...finished].reverse()) {
    const value = point.values[id]
    if (value === null || value > goal) break
    streak += 1
  }
  return {
    average: values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null,
    logged: values.length,
    under: values.filter((value) => value <= goal).length,
    streak,
  }
}

export function formatDayName(key: string): string {
  const [y = 1970, m = 1, d = 1] = key.split('-').map(Number)
  const label = new Date(y, m - 1, d).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}
