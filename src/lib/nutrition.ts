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
