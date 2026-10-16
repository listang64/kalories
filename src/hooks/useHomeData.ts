import { PROFILES, type ProfileId } from '../config/users'
import { dayTotals, type Meal } from '../lib/meals'
import type { DayGoals, Totals } from '../lib/nutrition'
import { goalsOf, type ProfilesSettings } from './useProfiles'

export interface PersonDay {
  totals: Totals
  goals: DayGoals
}

export function useHomeData(settings: ProfilesSettings, meals: Meal[]): Record<ProfileId, PersonDay> {
  return {
    nico: { totals: dayTotals(meals, PROFILES.nico.uid), goals: goalsOf(settings.nico) },
    chachou: { totals: dayTotals(meals, PROFILES.chachou.uid), goals: goalsOf(settings.chachou) },
  }
}
