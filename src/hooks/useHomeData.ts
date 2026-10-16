import type { ProfileId } from '../config/users'
import type { DayGoals, Totals } from '../lib/nutrition'
import { goalsOf, type ProfilesSettings } from './useProfiles'

export interface PersonDay {
  totals: Totals
  goals: DayGoals
}

const MOCK_TOTALS: Record<ProfileId, Totals> = {
  nico: { kcal: 1450, carbs: 142, fat: 48, protein: 71 },
  chachou: { kcal: 1920, carbs: 198, fat: 66, protein: 74 },
}

export function useHomeData(settings: ProfilesSettings): Record<ProfileId, PersonDay> {
  return {
    nico: { totals: MOCK_TOTALS.nico, goals: goalsOf(settings.nico) },
    chachou: { totals: MOCK_TOTALS.chachou, goals: goalsOf(settings.chachou) },
  }
}
