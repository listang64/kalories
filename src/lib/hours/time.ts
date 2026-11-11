export interface Slot {
  start: string
  end: string
}

const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/

export const validTime = (value: string) => TIME.test(value)

export function minutesOf(value: string): number {
  const [h = 0, m = 0] = value.split(':').map(Number)
  return h * 60 + m
}

export function slotMinutes({ start, end }: Slot): number {
  if (!validTime(start) || !validTime(end) || start === end) return 0
  const diff = minutesOf(end) - minutesOf(start)
  return diff > 0 ? diff : diff + 1440
}

export const slotsMinutes = (slots: Slot[]) => slots.reduce((sum, slot) => sum + slotMinutes(slot), 0)

export const completeSlots = (slots: Slot[]) => slots.filter((slot) => slotMinutes(slot) > 0)

export function formatClock(value: string): string {
  const [h = '0', m = '00'] = value.split(':')
  return `${Number(h)}h${m}`
}

export const formatSlot = (slot: Slot, sep = ' – ') => `${formatClock(slot.start)}${sep}${formatClock(slot.end)}`

export function formatDuration(minutes: number, signed = false): string {
  const total = Math.round(minutes)
  const sign = total < 0 ? '−' : signed && total > 0 ? '+' : ''
  const abs = Math.abs(total)
  return `${sign}${Math.floor(abs / 60)}h${String(abs % 60).padStart(2, '0')}`
}

export function parseHours(text: string): number | null {
  const clean = text.trim().replace(/\s/g, '').replace(',', '.').toLowerCase()
  if (!clean) return null
  const clock = /^(\d{1,4})h(\d{0,2})$/.exec(clean)
  if (clock) return Number(clock[1]) + Number(clock[2] || 0) / 60
  return /^\d{0,4}(\.\d{0,3})?$/.test(clean) && clean !== '.' ? Number(clean) : null
}

export function formatHoursInput(value: number | null): string {
  if (value === null) return ''
  return String(Math.round(value * 100) / 100).replace('.', ',')
}

export function nextSlot(slots: Slot[]): Slot {
  const last = slots.at(-1)
  if (!last || !validTime(last.end)) return { start: '08:00', end: '12:00' }
  const start = (minutesOf(last.end) + 60) % 1440
  const end = (start + 180) % 1440
  const clock = (value: number) => `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`
  return { start: clock(start), end: clock(end) }
}
