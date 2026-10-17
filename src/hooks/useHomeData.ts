import { dayTotals, type Meal } from '../lib/meals'
import type { DayGoals, Totals } from '../lib/nutrition'
import { goalsOf, type Profile } from '../lib/profiles'

export interface PersonDay {
  totals: Totals
  goals: DayGoals
}

export interface PersonEntry {
  profile: Profile
  day: PersonDay
}

export function personEntry(profile: Profile, meals: Meal[]): PersonEntry {
  return { profile, day: { totals: dayTotals(meals, profile.uid), goals: goalsOf(profile) } }
}
