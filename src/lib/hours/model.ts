import { addDays, dateFromKey, daysBetween, todayKey } from '../dates'
import { completeSlots, slotsMinutes, validTime, type Slot } from './time'

export interface DayEntry {
  slots: Slot[]
  meal: boolean
  off: boolean
  justified: boolean
  note: string
}

export interface WeekDay {
  slots: Slot[]
  meal: boolean
  alternate: boolean
  anchor: string
}

export interface Balance {
  date: string
  hours: number
}

export interface HoursSettings {
  firstName: string
  lastName: string
  week: Record<string, WeekDay>
  targets: Record<string, number>
  balance: Balance | null
}

export type MonthDays = Record<string, DayEntry>

export const WEEKDAYS = ['1', '2', '3', '4', '5', '6', '7'] as const
export const WEEKDAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
export const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

const DATE = /^\d{4}-\d{2}-\d{2}$/
const MONTH = /^\d{4}-\d{2}$/

export const isMonthKey = (key: string) => MONTH.test(key)
export const monthOf = (date: string) => date.slice(0, 7)
export const dayOf = (date: string) => date.slice(8, 10)

export function emptySettings(): HoursSettings {
  return { firstName: '', lastName: '', week: {}, targets: {}, balance: null }
}

export const emptyWeekDay = (): WeekDay => ({ slots: [], meal: false, alternate: false, anchor: '' })

const text = (value: unknown, max: number) => (typeof value === 'string' ? value.slice(0, max) : '')

function parseSlots(value: unknown): Slot[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item: unknown) => {
    if (!item || typeof item !== 'object') return []
    const { start, end } = item as Record<string, unknown>
    return typeof start === 'string' && typeof end === 'string' && validTime(start) && validTime(end) ? [{ start, end }] : []
  })
}

export function parseEntry(value: unknown): DayEntry | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  return {
    slots: parseSlots(raw.slots),
    meal: raw.meal === true,
    off: raw.off === true,
    justified: raw.justified !== false,
    note: text(raw.note, 400),
  }
}

export function parseMonth(data: Record<string, unknown> | undefined): MonthDays {
  const days = data?.days
  if (!days || typeof days !== 'object') return {}
  return Object.fromEntries(
    Object.entries(days as Record<string, unknown>).flatMap(([day, value]) => {
      const entry = parseEntry(value)
      return entry && /^\d{2}$/.test(day) ? [[day, entry]] : []
    }),
  )
}

export function parseSettings(data: Record<string, unknown> | undefined): HoursSettings {
  if (!data) return emptySettings()
  const week: Record<string, WeekDay> = {}
  const rawWeek = data.week && typeof data.week === 'object' ? (data.week as Record<string, unknown>) : {}
  for (const key of WEEKDAYS) {
    const raw = rawWeek[key]
    if (!raw || typeof raw !== 'object') continue
    const day = raw as Record<string, unknown>
    week[key] = {
      slots: parseSlots(day.slots),
      meal: day.meal === true,
      alternate: day.alternate === true,
      anchor: typeof day.anchor === 'string' && DATE.test(day.anchor) ? day.anchor : '',
    }
  }
  const targets: Record<string, number> = {}
  const rawTargets = data.targets && typeof data.targets === 'object' ? (data.targets as Record<string, unknown>) : {}
  for (const [key, value] of Object.entries(rawTargets)) {
    if (isMonthKey(key) && typeof value === 'number' && Number.isFinite(value)) targets[key] = value
  }
  const rawBalance = data.balance as Record<string, unknown> | null | undefined
  const balance =
    rawBalance && typeof rawBalance.date === 'string' && DATE.test(rawBalance.date) && typeof rawBalance.hours === 'number'
      ? { date: rawBalance.date, hours: rawBalance.hours }
      : null
  return { firstName: text(data.firstName, 40), lastName: text(data.lastName, 40), week, targets, balance }
}

export const weekdayOf = (date: string) => String(((dateFromKey(date).getDay() + 6) % 7) + 1)

export function mondayOf(date: string): string {
  return addDays(date, 1 - Number(weekdayOf(date)))
}

export function workedWeek(day: WeekDay, date: string): boolean {
  if (!day.alternate || !day.anchor) return true
  const weeks = Math.round(daysBetween(day.anchor, mondayOf(date)) / 7)
  return weeks % 2 === 0
}

export function templateFor(settings: HoursSettings, date: string): WeekDay | null {
  const day = settings.week[weekdayOf(date)]
  if (!day || completeSlots(day.slots).length === 0 || !workedWeek(day, date)) return null
  return day
}

export function daysOfMonth(month: string): string[] {
  const [y = 1970, m = 1] = month.split('-').map(Number)
  const count = new Date(y, m, 0).getDate()
  return Array.from({ length: count }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`)
}

export const lastDayOf = (month: string) => daysOfMonth(month).at(-1) ?? `${month}-28`

export function shiftMonth(month: string, delta: number): string {
  const [y = 1970, m = 1] = month.split('-').map(Number)
  return todayKey(new Date(y, m - 1 + delta, 1)).slice(0, 7)
}

export function monthLabel(month: string): string {
  const [y = 1970, m = 1] = month.split('-').map(Number)
  return `${MONTH_NAMES[m - 1] ?? ''} ${y}`
}

export const entryMinutes = (entry: DayEntry | undefined) => (entry && !entry.off ? slotsMinutes(entry.slots) : 0)

export const monthMinutes = (days: MonthDays | undefined) =>
  Object.values(days ?? {}).reduce((sum, entry) => sum + entryMinutes(entry), 0)

export function expectedMinutes(settings: HoursSettings, date: string): number {
  const template = templateFor(settings, date)
  return template ? slotsMinutes(completeSlots(template.slots)) : 0
}

export function dayGap(settings: HoursSettings, date: string, entry: DayEntry | undefined): number {
  if (!entry) return 0
  if (entry.off) return entry.justified ? 0 : -expectedMinutes(settings, date)
  return entryMinutes(entry) - expectedMinutes(settings, date)
}

export function balanceAt(settings: HoursSettings, months: Record<string, MonthDays>, date: string): number {
  const from = settings.balance
  let total = from ? from.hours * 60 : 0
  for (const [month, days] of Object.entries(months)) {
    for (const [day, entry] of Object.entries(days)) {
      const key = `${month}-${day}`
      if (key > date || (from && key <= from.date)) continue
      total += dayGap(settings, key, entry)
    }
  }
  return Math.round(total)
}

export const balanceWord = (minutes: number) => (minutes > 0 ? 'en plus' : minutes < 0 ? 'à devoir' : 'à jour')

export function fullName(settings: HoursSettings, fallback: string): string {
  return [settings.firstName, settings.lastName].map((part) => part.trim()).filter(Boolean).join(' ') || fallback
}
