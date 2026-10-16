export interface Macros {
  carbs: number
  fat: number
  protein: number
}

export interface Totals extends Macros {
  kcal: number
}

export interface DayGoals extends Macros {
  kcal: number
}

export type MacroKey = keyof Macros

export interface DayProgress {
  kcal: number
  goal: number
}

export function autoMacroGoals(kcal: number): Macros {
  return {
    carbs: Math.round((kcal * 0.5) / 4),
    fat: Math.round((kcal * 0.3) / 9),
    protein: Math.round((kcal * 0.2) / 4),
  }
}

export function ratio(value: number, goal: number): number {
  return goal > 0 ? value / goal : 0
}

export function gaugeLevel(value: number, goal: number) {
  const level = ratio(value, goal)
  return { fill: Math.min(Math.max(level, 0), 1), over: level > 1 }
}

export type Confidence = 'haute' | 'moyenne' | 'basse'

export interface MealItem {
  name: string
  grams: number
  kcal100: number
  carbs100: number
  fat100: number
  protein100: number
  confidence: Confidence
}

export function itemTotals(item: MealItem): Totals {
  const factor = item.grams / 100
  return {
    kcal: item.kcal100 * factor,
    carbs: item.carbs100 * factor,
    fat: item.fat100 * factor,
    protein: item.protein100 * factor,
  }
}

export function sumTotals(list: Totals[]): Totals {
  return list.reduce(
    (sum, t) => ({ kcal: sum.kcal + t.kcal, carbs: sum.carbs + t.carbs, fat: sum.fat + t.fat, protein: sum.protein + t.protein }),
    { kcal: 0, carbs: 0, fat: 0, protein: 0 },
  )
}

export function mealTotals(items: MealItem[]): Totals {
  const total = sumTotals(items.map(itemTotals))
  return { kcal: Math.round(total.kcal), carbs: round1(total.carbs), fat: round1(total.fat), protein: round1(total.protein) }
}

const CONFIDENCES: Confidence[] = ['haute', 'moyenne', 'basse']

function bounded(value: unknown, max: number): number | null {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), max) : null
}

const round1 = (value: number) => Math.round(value * 10) / 10

export function parseItem(raw: unknown): MealItem | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const name = typeof r.name === 'string' ? r.name.trim() : ''
  const grams = bounded(r.grams, 5000)
  const kcal100 = bounded(r.kcal100, 900)
  const carbs100 = bounded(r.carbs100, 100)
  const fat100 = bounded(r.fat100, 100)
  const protein100 = bounded(r.protein100, 100)
  if (!name || grams === null || kcal100 === null || carbs100 === null || fat100 === null || protein100 === null) {
    return null
  }
  return {
    name: name.charAt(0).toUpperCase() + name.slice(1),
    grams: Math.round(grams),
    kcal100: round1(kcal100),
    carbs100: round1(carbs100),
    fat100: round1(fat100),
    protein100: round1(protein100),
    confidence: CONFIDENCES.find((c) => c === r.confidence) ?? 'moyenne',
  }
}
