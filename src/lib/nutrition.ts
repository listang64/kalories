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
  const round1 = (value: number) => Math.round(value * 10) / 10
  return { kcal: Math.round(total.kcal), carbs: round1(total.carbs), fat: round1(total.fat), protein: round1(total.protein) }
}
