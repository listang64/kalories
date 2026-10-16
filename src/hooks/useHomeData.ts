import type { ProfileId } from '../config/users'
import { autoMacroGoals, type DayGoals, type Totals } from '../lib/nutrition'

export interface PersonDay {
  totals: Totals
  goals: DayGoals
}

const MOCK: Record<ProfileId, PersonDay> = {
  nico: {
    totals: { kcal: 1450, carbs: 142, fat: 48, protein: 71 },
    goals: { kcal: 2200, ...autoMacroGoals(2200) },
  },
  chachou: {
    totals: { kcal: 1920, carbs: 198, fat: 66, protein: 74 },
    goals: { kcal: 1800, ...autoMacroGoals(1800) },
  },
}

export function useHomeData(): Record<ProfileId, PersonDay> {
  return MOCK
}
